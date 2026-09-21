window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["notification-system-design"] = `# Design: a notification system

A notification service turns a product event into messages for particular people. When a report finishes, Ada might need an inbox item and an email. Those are two separate pieces of work: the inbox can appear while the email is still waiting at a provider.

We'll follow that report from the product database to its recipients, then handle preference changes, lost send replies and a large announcement. The design starts with email and an in-app inbox. Push and SMS share the routing machinery, but need their own delivery rules.

![An email provider's tray holds one envelope labeled Accepted. A person looking at an empty inbox says Still waiting. Provider acceptance does not establish arrival in the recipient's inbox.](/course-assets/system-design/illustrations/notification-accepted.webp)

## Decide what the service promises

Accepting work means retaining enough information to finish or explain it after a restart. It does not mean every selected channel has delivered a message. We call the retained decision for one recipient and channel an **intent**.

For our report product, the useful contract is:

- A committed report event can be retried without creating another intent for the same recipient and channel.
- Pending email work observes opt-outs before its dispatch decision. Once a send may be in flight, withdrawal requires a different recovery decision.
- A provider outage leaves recoverable work and visible uncertainty. It does not prevent the report itself from finishing.
- Support can distinguish suppression, local inbox visibility, provider acceptance and subsequent delivery evidence.

Product requirements should also specify how late a message may be. A report-ready message can remain useful after a short outage; an expired invitation cannot. Store an expiry time where needed and check it before starting a send. A queue retry budget should not outlive the message's usefulness.

The inbox is durable history, while a badge is a projection of what the user has acknowledged. Keep that distinction from [[wiki/newly-unread-indicator|the unread-indicator design]]. Opening the inbox need not assert that every email was read.

## Separate routing from delivery

The product commits the report change and an outbox entry together. A relay publishes the event. This is the [[wiki/event-bus-for-product-events|transactional outbox]] boundary: losing a process after the report commits must leave the notification work discoverable.

A router consumes the event, selects recipients and channels, and records their intents. Channel workers perform those intents later. The [[wiki/task-queue-vs-event-stream|event stream carries a fact; the work queue assigns an action]]. Rebuilding an analytics projection from old events should not silently resend old notifications.

\`\`\`mermaid
flowchart TD
    accTitle: From product fact to channel work
    accDescr: Product state and an outbox commit together. A relay publishes to the router, which retains intents in the notification database. Dispatch workers read pending work. Inbox writes stay local; email goes through a provider. Verified provider events return through a receipt handler.
    P["Product + outbox"] -->|Relay event|R["Router"]
    R -->|Retain intents|D["Notification DB"]
    D -->|Pending work|W["Dispatch workers"]
    W -->|Commit inbox item|D
    W -->|Send|E["Email provider"]
    E -->|Webhook|H["Receipt handler"]
    H -->|Verified evidence|D
\`\`\`

The database owns intents, preferences, inbox rows and delivery history. A queue can carry intent IDs to wake workers quickly, but a scan of pending work must recover a lost wake-up. Otherwise the gap between saving an intent and publishing its queue message can strand it forever.

These are responsibilities, not a demand for six independently deployed services. One application and database can provide the first version. Split workers and queues when a slow provider or bulk workload needs isolation.

Uber's historical RAMEN account makes a related separation between deciding when to generate an update, constructing its payload and delivering it. Its foreground app transport is a different system from our email adapter; the useful architectural idea is keeping product decisions separate from transport behavior.

## Retain the decision, then record attempts

Use \`(tenant, event, recipient, channel)\` as the intent's unique identity. The small single-tenant download omits tenant. A template version is an attribute, not part of that identity: deploying a new template must not turn a retry into a second notification.

An intent stores the chosen template version, locale and rendering inputs. Before its first external call, freeze the exact provider payload and destination. Re-reading a mutable display name or template during a retry can change the request even when its key stays the same.

| Stored record | What it lets us answer |
| --- | --- |
| Event and routing progress | Did we retain this fact, and finish enumerating its audience? |
| Recipient-channel intent | What message do we owe, when is it due, and may it expire? |
| Attempt | Which provider call ran, under which preference decision, and what did it return? |
| Provider message and evidence | Which external message do later callbacks describe? |
| Inbox item | What can this account read locally? |

Store the event receipt and a small event's intents in one transaction. Saving the receipt first and crashing halfway through routing would make the replay skip missing recipients. For a large audience, retain a fanout job and advance its progress only with the corresponding inserted intents.

An internal API might accept \`POST /notification-events\` with an event ID, event type, subject and audience reference. Authenticate the producing service and authorize that audience; callers should not acquire permission to email arbitrary users merely by knowing an ID. Return accepted only after the routing job is durable. Reuse with incompatible input is an error.

For readers, \`GET /notifications?before=...\` selects the authenticated account's inbox using a stable \`(created_at, id)\` cursor. Support lookup joins the event's intents and attempts. Index these two access paths rather than expecting one global delivery-status scan to serve both.

At larger volume, partition recipient state by tenant and user so an inbox read and its uniqueness check stay together. Routing spans those partitions: retain the fanout job separately and replay idempotent recipient inserts instead of assuming a cross-shard transaction. Keep an event-to-intent index for support lookups.

## Apply preferences at a precise boundary

Routing is too early to make the final email preference decision. Ada can disable email while a backlog is draining. For a pending intent, read her current settings and record the dispatch decision atomically with claiming that work. In our design, an opt-out committed before this decision suppresses it.

Do not hold the transaction open during the provider call. It would occupy database resources without making the remote provider participate in the transaction. An opt-out committed after the local decision can still race with the send.

Record the preference version that authorized dispatch. That gives support a concrete explanation instead of a current settings screen that disagrees with yesterday's decision. Category and tenant policy need similarly explicit precedence; a report update should not inherit an unrelated marketing preference.

Quiet hours introduce a due time, computed in the user's timezone, rather than a sleeping worker. A digest also needs membership: retain which events belong to which digest occurrence so rebuilding it cannot notify the same events again. The [[wiki/distributed-task-scheduler|scheduler]] supplies due-work recovery; it cannot decide those product rules for us.

## Recover an uncertain send

A successful provider reply gives us a message ID. A timeout may give us nothing, even if the provider already accepted the email. Generating a fresh ID on the next attempt risks a second message.

Instead, generate a stable operation key from the intent and send the frozen payload under that key. The adapter must rely on a documented provider contract. Resend, for example, retains idempotency keys for 24 hours, returns the previous result for a repeated request and rejects a changed payload under the same key. Our retry window must fit that contract.

\`\`\`mermaid
sequenceDiagram
    accTitle: A lost reply does not require a second email
    accDescr: The worker records its dispatch decision, sends a stable key and payload, then loses the provider reply after acceptance. It records uncertainty. Repeating the original request within the provider's idempotency window returns the same message ID.
    participant D as Intent store
    participant W as Worker
    participant P as Provider
    W->>D: Claim and record preference decision
    W->>P: Send key K, frozen payload
    P->>P: Retain acceptance for K
    P--xW: Message ID · reply lost
    W->>D: Record unknown outcome
    W->>P: Retry K, same payload
    P-->>W: Original message ID
    W->>D: Record accepted message
\`\`\`

This is the external version of [[wiki/retries-timeouts-idempotency|retry identity]]. Our database can prevent duplicate intents; it cannot unilaterally prevent duplicate effects at another company's API.

A worker can also disappear before it records \`unknown\`, leaving \`sending\` behind. Production workers need expiring claims and guarded completion. On reclaim, treat the prior call as uncertain, even if it might never have left the machine. A stale worker must not overwrite newer local evidence, and concurrent provider attempts must still use the same identity.

If the provider window expires, look up the original operation where supported or retain the unknown state for an explicit decision. A circuit breaker stops more calls during an outage; it does not explain earlier calls. Moving uncertain work from provider A to provider B also loses A's deduplication protection.

There is a preference consequence too. Retrying an unknown operation under its original decision may create its first acceptance after a later opt-out if the earlier call never arrived. Our fixture permits that. A stricter withdrawal policy needs lookup or cancellation support, or must leave the outcome unresolved rather than risk starting a send.

Distinguish this uncertainty from a definite refusal. Invalid input should not retry unchanged. A documented throttle can schedule a later attempt with backoff and jitter. Bound retries by provider limits, message expiry and the acceptable duplicate-versus-miss policy.

## Let evidence describe delivery

The inbox writer can insert the item and mark its intent visible in one database transaction. A unique event-recipient key makes repetition harmless. Reads still require current authorization; a link inside an old message must not grant continuing access to a report.

Email crosses another owner's boundary. Amazon SES distinguishes a successful send request from delivery to the recipient's mail server. Neither proves that the person read it. Name the status accordingly rather than showing one ambiguous green “sent” flag.

Provider webhooks form another retried input stream. Resend documents duplicate and out-of-order delivery. Verify the signature over the raw request body, bind the provider account and message to our intent, then durably store the receipt before acknowledging it. Applying the evidence can happen in that transaction or through recoverable pending work.

A delivery event might arrive before the send response has been saved. Keep that unmatched evidence for reconciliation; do not discard it because the intent currently lacks the message ID. Once delivery evidence exists, a delayed send response must not replace it with a weaker accepted-only status. Complaints and bounces are additional facts worth retaining, not merely numbers in one increasing status sequence.

Receipt retention must cover the intended replay window. Removing all deduplication records while old events can still return may recreate messages. Retain minimal identities where possible and expire sensitive bodies according to the product's [[wiki/data-retention-and-deletion|retention policy]].

### Add push without hiding its differences

FCM returning a message ID means acceptance for delivery, not arrival at the device. Its message lifespan bounds how long unavailable-device work remains useful. An expired meeting invitation should not appear when a phone reconnects days later.

A push collapse key can replace an older pending update with a newer one. That is useful for “refresh this report,” but it is not the same as deduplicating a particular send, nor does it preserve every distinct report event. Keep durable history in the inbox when each event matters.

Track device tokens separately from users, remove tokens on definitive invalid-token feedback, and preserve per-device outcomes. SMS would add its own provider error mapping, expiry, cost budget and delivery evidence. A shared adapter interface should expose these differences rather than promise universal exactly-once delivery.

## Keep a large audience from blocking small work

Suppose a chosen load has 40 report events per second, five recipients per event, and email plus inbox for each recipient. That creates 400 intents per second. If 25% of email intents are suppressed, the email lane receives 150 first attempts per second; the inbox still receives 200 writes per second. Retries add provider calls, not new intents.

Now add an announcement with 120,000 eligible email recipients. At a hypothetical bulk allowance of 200 first attempts per second, the best-case drain time is ten minutes, before retries or throttling. These are planning assumptions, not measured throughput or a provider quota.

A single FIFO queue can put report messages behind that announcement. Allocate a separate bulk budget and retain capacity for transactional work. Separate queues alone are insufficient if both workers exhaust the same provider account quota or database pool. [[wiki/rate-limiter-placement-and-keys|Rate-limit placement]] determines which shared resource is actually protected.

Enumerate the announcement's audience in recoverable chunks, using a frozen audience version or an explicit membership cutoff. Advance the cursor with the chunk's durable intents; replay can then reuse their unique keys. Re-querying a changing audience without a membership rule can skip or unexpectedly add recipients. This is the [[wiki/fanout-patterns|fanout progress problem]] at notification scale.

Per-user limits solve a different problem: protecting attention. A mention storm might create several durable inbox items but only one push or digest. Record that coalescing decision so a retry cannot consume another attention allowance or send another summary. Provider quotas alone cannot express it.

A [[wiki/batching|batch adapter]] can reduce calls where the provider supports it, but must record each recipient's result. Retry the failed subset with the appropriate stable identities. Share template work only for identical locale and content; personalization must remain bound to the right recipient.

Measure oldest eligible intent age per lane, provider throttles, unknown-attempt age and suppression reasons. Count provider acceptance and delivery evidence separately. A provider's temporary outage can delay callbacks, so “no delivery event yet” is not a measured permanent failure.

## Run the smaller recovery experiment

The [notification example](/course-assets/system-design/m14-notifications.py) isolates four intents in private SQLite files. Ada gets email and an inbox item. Bo starts with email disabled; Cy opts out after routing. A separate fake provider accepts Ada's email and deliberately loses the reply.

It makes local Python calls and sends no email. Its provider keys never expire. It implements neither a worker pool nor automatic recovery from abandoned \`sending\` claims; those remain production requirements described above.

Run with Python 3. This capture was checked on 18 September 2026 with Python 3.14.6 and SQLite 3.53.4, including optimized Python:

\`\`\`bash title="terminal"
python3 m14-notifications.py
\`\`\`

\`\`\`output
route new event: True
route duplicate: False
retained intents: 4
Bo email: suppressed
Cy email: suppressed
Ada in-app: visible
Ada email: unknown
fake state after timeout: accepted=1, delivered=0
Ada email after reopen: accepted
provider calls=2, accepted records=1
delivery callback: True
duplicate callback: False
changed retry: changed provider payload
user | channel | final state | preference version
Ada | email | delivered | 1
Ada | in-app | visible | 1
Bo | email | suppressed | 1
Cy | email | suppressed | 2
\`\`\`

Ada's two provider calls leave one acceptance record. Reopening the files preserves that identity. Only the later trusted callback marks delivery; it is a direct function call, not a verified public webhook. Bo and Cy never reach the provider, and Cy's version-two preference explains why.

To test the subtle boundary, repeat the experiment with a provider that times out **before** accepting. Disable Ada's email, then retry the unknown intent. Under this fixture's stated rule, the retry still uses the original decision and can create the message. Compare that with Cy, whose still-pending intent is suppressed. Both outcomes follow from where the service recorded permission to begin sending.
`;
