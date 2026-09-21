window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["clock-skew-and-id-ordering"] = `# Clock skew and ID ordering

A time-bearing ID records a clock reading used during generation. Sorting those IDs can help browsing, but it does not establish the order of events across machines.

Two machines may disagree about the current time. Even when their readings match, worker fields and local counters break ties according to the format rather than the events' relationship.

## Skew and rollback are different problems

A wall clock reports calendar time, such as Unix milliseconds. The offset between machines' readings at the same instant is commonly called clock skew. Drift and clock corrections can change that offset.

Rollback is a clock moving behind its own earlier reading. The course Snowflake generator detects this locally. It cannot detect that another machine is twenty milliseconds ahead, and ordinary clock synchronization does not by itself establish a strict event-order guarantee.

A process pause adds another complication: a process can generate an ID, wait, then store or send its record. Generation time, receipt time and commit time describe different events even without a backward clock adjustment.

## Follow a request and its reply

Choose the following exchange. A generates the request's ID at elapsed time 1030; B generates the reply's ID at 1005; A records receipt at 1031. These are chosen readings relative to the course epoch, not measured network times.

\`\`\`mermaid
sequenceDiagram
    accTitle: A reply whose clock value is earlier
    accDescr: A sends at local time plus 1030, B replies at plus 1005, and A receives at plus 1031. The message dependency orders the request before the reply even though sorting their timestamp-bearing IDs reverses them.
    participant A as Instance A
    participant B as Instance B
    A->>B: Request, A clock +1030
    B-->>A: Reply, B clock +1005
    Note over A: Receipt recorded at +1031
\`\`\`

B's reply depends on A's request, so the request came first in this exchange. Its smaller clock reading cannot reverse that dependency. Lamport's happened-before relation formalizes this using process order and actual message exchanges, without requiring matching wall clocks.

The [Snowflake replay](/course-assets/system-design/m09-snowflake-replay.mjs) calls two generators in this order and retains explicit \`causedBy\` references. Its ordering mode also compares equal timestamps and two elapsed-time calculations. Node 24.11.0 reproduced the output on September 17.

\`\`\`bash title="terminal"
node m09-snowflake-replay.mjs ordering
\`\`\`
\`\`\`output
observed sequence: A sends -> B replies -> A receives
A sends: local_ms=+1030, id=4320202752
B replies: local_ms=+1005, id=4215287808
A receives: local_ms=+1031, id=4324397056
numeric ID order: B replies -> A sends -> A receives
same timestamp: worker 17 emitted first, smaller ID belongs to worker 3
chosen wall-clock difference: -100
chosen monotonic-clock difference: 10
\`\`\`

Both generators follow their local rules and use distinct worker identities. There is no duplicate: the failure is the interpretation of their numeric order. At an equal timestamp, worker 3 sorts before worker 17 even when worker 17 emitted first, because the worker field precedes the sequence field.

## Ask which order the product needs

| Requirement | Information or mechanism to use |
|---|---|
| Stable page traversal | A complete ordering tuple and defined visibility rules |
| Show which request produced a reply | The retained request/reply relationship |
| Reject an update based on stale state | A checked record version or suitable transaction |
| Agree on a replicated operation sequence | The system's agreed log order |
| Reject a superseded owner's write | A fencing token compared with the latest accepted token |

These mechanisms answer different questions. A log position orders entries in that log; it does not automatically order every real-world event. A unique ID can break a query tie without proving causality. Logical clocks preserve specified dependencies, but comparing two scalar clock values does not prove one event caused the other.

Likewise, a database sequence allocates values before the caller's work finishes. A transaction holding a smaller ID can commit later. If commit order matters, use the database's explicit supported ordering contract instead of treating its primary key as that contract.

## Measure a local timeout with elapsed time

The replay chooses wall-clock readings of 1000 then 900 milliseconds, yielding a negative difference. Separate increasing readings of 5000 then 5010 yield ten milliseconds. This demonstrates arithmetic under supplied inputs; it does not change the operating system clock.

Use a monotonic clock for a local timeout budget. Python's \`time.monotonic()\` cannot go backward and is unaffected by system-clock updates. Its origin is unspecified: differences are useful, while treating the value as a calendar timestamp is unsupported.

That clock does not give independently booted machines a shared epoch or restore lost allocator history. Keep local elapsed measurement separate from a timestamp intended for storage or interchange.

For a mutable record, choosing the update with the largest time-bearing ID makes clock offset part of the conflict policy. A fast clock can make an earlier update defeat a later correction. Use the version or transaction rule the product actually needs, and keep the ID's job limited to identifying the record.
`;
