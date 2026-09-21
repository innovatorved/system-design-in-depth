window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["newly-unread-indicator"] = `# Design: a newly-unread inbox indicator

A newly-unread badge tells someone how much new activity has arrived since they last opened an overview. It can clear when they open that screen even though they have not read every conversation. That makes it a separate feature from message read receipts.

We'll design a badge that counts distinct senders, preserve arrivals that race with opening the inbox, and keep reads correct while a background worker is behind. The example is our own small inbox service, not a claim about Slack's or another messenger's internals.

## Decide what the number means

Bo sends Ada two messages and Cy sends one. Our badge shows **2**, because two sender accounts contributed new activity. It does not show three messages, two humans, or a count of unread conversations.

| State | What it means |
|---|---|
| Newly-unread badge | Distinct eligible senders after Ada's last inbox acknowledgement |
| Thread unread | A conversation contains messages beyond its own read position |
| Message read receipt | The client reported a particular message or position as read |

Opening the overview advances only the first state. The [[wiki/chat-and-messaging-system-design|chat design]] deals with delivery and thread-read reports separately. None of these reports proves that a person understood the text.

Repeated delivery of one send must not create another message. But two intentional sends with identical text are still two messages. Give each send an operation ID; use sender identity only when collapsing messages into the badge count.

For this design, only the recipient may view or acknowledge the inbox. Senders and recipients must be active accounts, and inactive senders disappear from badge reads. Blocking, group conversations and message deletion need additional rules; they are outside the executable example.

## Clear what the screen observed

Deleting the whole badge set when Ada opens the inbox looks simple. It fails if a new message arrives after the server prepared her response but before the acknowledgement reaches the server. The deletion clears activity she never had a chance to see.

Give each accepted message a position within its recipient's inbox. Ada's first three messages occupy positions 1, 2 and 3. The response records that it observed through 3. Dee's later message receives position 4.

\`\`\`mermaid
sequenceDiagram
  accTitle: Acknowledge the observed inbox
  accDescr: Ada receives an inbox snapshot through position 3. Dee's message commits at position 4 before Ada acknowledges the older snapshot. Position 4 remains newly unread.
  participant A as Ada
  participant S as Inbox service
  A->>S: Open inbox
  S-->>A: Snapshot through 3
  Note over S: Dee's message commits at 4
  A->>S: Acknowledge snapshot 3
  S-->>A: One new sender remains
\`\`\`

Store an acknowledged-through position **A**. A sender counts when their latest eligible message position is strictly greater than A. After acknowledging 3, Bo and Cy stop contributing, while Dee at 4 remains.

Positions describe acceptance order for one recipient. They are not wall-clock timestamps or a global order across all users. Equal timestamps cannot tell us which of two arrivals belonged to an earlier inbox response.

The server stores an issued snapshot containing its recipient and observed boundary. Ada acknowledges the snapshot ID, not an arbitrary position supplied by her client. The server checks ownership and updates A to the greater of its current value and the snapshot boundary.

That maximum handles multiple devices. If device B has already acknowledged through 4, device A's delayed acknowledgement through 3 leaves A at 4. A retry with the same operation ID returns its original receipt; that historical reply must not make the client lower a newer local boundary.

The product decides when to send the acknowledgement: for example, after the overview loads successfully. Issuing a snapshot only proves which response the server prepared, not that Ada saw it. An acknowledgement should not be sent just because navigation began and the request might still fail.

## Store the source and the prepared count separately

Accepted messages are the source. A projection keeps each sender's greatest processed position so a badge read need not rescan the entire message history. Let **H** be the accepted head and **P** the position through which the projection is complete.

Our local service puts these records in one SQLite database:

| Record and key | Relevant fields |
|---|---|
| Message: recipient, position | Sender and text |
| Inbox head: recipient | H, A and P |
| Sender summary: recipient, sender | Greatest processed position |
| Issued snapshot: snapshot ID | Recipient and observed-through position |
| Operation receipt: actor, operation ID | Original input and accepted result |

Separate thread-read rows exist to demonstrate that inbox acknowledgements leave them unchanged. A real thread-reading API is outside this service.

\`\`\`mermaid
flowchart TD
  accTitle: The badge combines a prefix and a tail
  accDescr: A badge read merges sender maxima processed through P with source messages after P, then counts active senders whose latest position is above acknowledgement A. All records are read from one SQLite snapshot.
  P[Sender maxima through P] --> M[Merge latest positions]
  T[Messages after P] --> M
  M --> C[Count active senders<br/>above A]
\`\`\`

A read uses one database snapshot for the heads, projection, tail and account eligibility. Otherwise, it could combine a new P with an old projection and miss messages. The count is exact for that snapshot; an arrival after it begins can appear on the next read.

This is a deliberate cost choice. With P=0 and H=4, the read examines four tail messages. Once the worker reaches P=4, the tail is empty, though this implementation still reads the sender summaries and checks account eligibility.

## Follow a send, a read and an acknowledgement

The HTTP handler binds its demonstration credential to an account. Source methods then enforce ownership. The routes keep the three operations distinct:

| Route | Input or result |
|---|---|
| POST \`/messages\` | Send an operation ID, recipient and text; receive an accepted position |
| GET \`/inbox/Ada\` | Receive eligible messages, snapshot ID and observed-through position |
| GET \`/badge/Ada\` | Receive the count and diagnostic H, A, P and tail-row fields |
| POST \`/inbox/Ada/ack\` | Send an operation ID and issued snapshot ID; receive acknowledged-through |

Bo's send transaction checks his operation receipt, validates the recipient, advances Ada's head, inserts the message and saves the result. Commit precedes the 201 response. The same operation and input return 200 with the original position; changed input under that ID returns 409.

Opening Ada's inbox reads its head and eligible message history, then stores the snapshot in the same transaction. The example returns the entire retained history. Pagination would require a product decision: does opening page one acknowledge the overview, or only messages actually fetched? Do not extend the current token to pages without answering that.

Acknowledgement verifies the path's account and the snapshot's owner independently. A predictable snapshot ID is not permission to use it. A guessed snapshot belonging to Ada is refused when Bo submits it through his own route.

SQLite serializes the example's write transactions. Dee's arrival may commit before or after Ada acknowledges the older snapshot; either way, the final state is H=4 and A=3. The acknowledgement never replaces its issued boundary with the current head.

## Keep projection lag from changing the answer

The background worker reads messages after P in order. It updates each sender's maximum and advances P in the same transaction. An interrupted transaction leaves both unchanged, so retrying starts from the last committed position.

A badge read merges those processed maxima with every message in the unprocessed tail, taking the greater position per sender. It then counts active senders above A. Delayed work from Bo cannot undo Ada's acknowledgement or turn an older message into new activity.

This retains the original goal of preparing cheap reads, while making the fallback cost visible. Measure tail length, worker progress and badge-read latency. If a tail becomes too large, catch the worker up, bound recovery with an explicit failure, or choose a documented stale-count experience. Returning an old projection as an exact current count is not the same contract.

A live notification can tell an online client to refetch. A disconnected client reconciles on its next badge read, as in the [[wiki/realtime-database-and-websocket-scaling|realtime recovery lesson]]. This particular example sends no WebSocket notifications; it tests the source and reconciliation path.

## Run the arrival race

Save the standard-library [inbox service](/course-assets/system-design/m22-inbox.py) and [shared helpers](/course-assets/system-design/m22-common.py) together. They use a private temporary SQLite file and an actual loopback HTTP server with fake account-bound credentials.

Bo sends twice and Cy once. Device A fetches through 3, then two threads race Dee's fourth message against acknowledgement of that snapshot. A later device acknowledges through 4 before the first device submits its older snapshot again.

\`\`\`bash title="terminal"
python3 m22-inbox.py
\`\`\`
\`\`\`output
offline arrivals: events=3 distinct senders=2
duplicate message: 200
changed message: 409
device A observes through: 3
arrival races ACK3: {"accepted_through":4,"acknowledged_through":3,"count":1,"projected_through":0,"senders":["Dee"],"tail_rows":4}
clear-all control: would drop new sender Dee; boundary ACK retains her
projection interruption/reopen: projected=0
delayed projection after ACK: {"accepted_through":4,"acknowledged_through":3,"count":1,"projected_through":4,"senders":["Dee"],"tail_rows":0}
device B ACK4 then old device ACK3: 4
wrong-user acknowledgement: 403
wrong snapshot owner: 403
malformed framing: [["empty transfer encoding",400],["ambiguous length",400],["huge numeric length",400],["unpaired surrogate",400],["short body",400]]
thread read positions: [0, 0, 0]
retained events=4 serialized message bytes=245
unavailable authority: 503
HTTP requests: application=15 malformed=5
\`\`\`

The badge finds Dee both before projection and after it. Only \`tail_rows\` changes from four to zero. The thread-read positions stay at zero, confirming that the overview acknowledgement did not mark conversations read.

The interruption is an exception before commit followed by reopening the database, not an operating-system crash. The replay also checks retry identity, ownership and malformed HTTP requests. Its 245-byte count covers only compact message JSON, not database size or network overhead.

Those protocol probes exercise this small server's rules: one bounded Content-Length, no Transfer-Encoding, complete bodies and valid JSON Unicode. They are not a production authentication or load test. An unavailable source returns 503, so the client should retain a clearly stale display or show unavailability rather than invent zero.

## Where a Redis sorted set fits

A sorted set is useful for the prepared sender summary: the recipient identifies the key, the sender ID is the unique member, and the latest accepted position is its score. Updating Bo changes his score without creating another member. Resolve display names separately so a rename does not change identity.

For small exact integer positions, the core operations look like this:

\`\`\`text
ZADD newly_unread:Ada GT 2 Bo
ZADD newly_unread:Ada GT 3 Cy
ZADD newly_unread:Ada GT 4 Dee
ZCOUNT newly_unread:Ada (3 +inf
\`\`\`

\`GT\` prevents an older delivery from lowering an existing score. The exclusive bound \`(3\` counts only positions above acknowledgement 3. The result is one sender. This sketch assumes A=3 is already known; it does not implement cross-store acknowledgement or projection recovery.

\`ZCARD\` is sufficient only if every retained member is newly unread. Once old entries remain, use the acknowledgement boundary. Deleting scores through A can reclaim space, but a late event can reinsert an old sender; counting above A still excludes that activity.

The [Redis control](/course-assets/system-design/m22-redis-badge.py) starts a private process with TCP disabled and demonstrates the unsafe alternatives:

\`\`\`bash title="terminal"
python3 m22-redis-badge.py
\`\`\`
\`\`\`output
Redis server v=8.4.0
snapshot through3: distinct senders=2
arrival4 then clear-all: count=0
remove through3: senders=Dee
delayed older update: ZCARD=2; ZCOUNT above ACK3=1
equal timestamp100: remove-through100 removes both senders
\`\`\`

Redis scores are floating-point numbers. Integers through 2^53 are exact, but arbitrary 64-bit source positions are not. Choose a representation that preserves the actual position range before using scores as acknowledgement boundaries.

A separate Redis deployment also adds a consistency boundary. Preserve message acceptance in the source, use replayable work to maintain the projection, and keep acknowledgement authoritative during cache loss. A cache miss means “state unavailable or not yet built,” not necessarily “no new messages.”

## Retain enough to recover

The local database retains all messages, snapshots and operation receipts for its temporary lifetime. Production retention cannot discard them under one guessed expiry: messages support reconstruction, snapshots authorize acknowledgements, and receipts suppress repeated operations.

A clean projection rebuild resets sender maxima and P together, then replays retained messages. The badge path checks that its unprocessed tail reaches H without gaps; missing source positions produce a conflict instead of an incomplete count.

If history must be trimmed, retain a sufficient checkpoint and define a floor below which replay is unavailable. Account erasure and message deletion must also update the eligibility and summary rules. A surviving sender maximum alone does not prove that its supporting message still exists.

The essential boundary is simple: clearing the overview covers the inbox the server returned. New work beyond that boundary remains visible, regardless of device timing or background-worker progress.
`;
