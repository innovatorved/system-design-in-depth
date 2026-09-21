window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["partition-manager-and-map-table"] = `# Partition manager and map table

A partition map tells the frontend where to send an object request. When ownership changes, that answer must stay connected to two facts: the new owner has the accepted data, and the former owner can no longer change it.

We'll separate the manager's responsibilities from normal request routing, then follow one planned transfer through its final write and a stale-client retry.

## Who maintains the assignment?

| Component | Responsibility |
|---|---|
| Partition map | Durably record each key range, its serving owner and ownership generation. |
| Partition manager | Assign and move ranges, split busy ranges, merge cold neighbors, and arrange recovery after failures. |
| Partition server | Serve its assigned ranges; one server can own several. |
| Coordination authority | Serialize manager decisions and establish valid ownership. |

The frontend caches map entries and sends requests directly to the partition server. The manager stays off this ordinary request path. It examines load and health to decide when assignments should change.

An assignment carries an **epoch**, a generation that changes on handoff. The receiver must enforce that authority where a write takes effect. A cached address is only a routing hint; publishing a new map cannot stop an old process by itself.

For this design, a range has **at most one active write owner**. A transfer may briefly leave it with none. Allowing an unavailable interval is safer than accepting independent changes at two owners without a reconciliation protocol.

## A planned move

A owns epoch 1. Its append-only file contains r1: \`first\` and a newline, six bytes. We copy those bytes to B while A remains active. Then A accepts r2: \`second\` and a newline, another seven bytes.

B is now behind. Before switching owners, pause new writes at A, wait for any admitted effects to finish, copy the missing tail, and verify the destination. Only then activate B at epoch 2.

\`\`\`mermaid
sequenceDiagram
    accTitle: Copying the accepted writes before cutover
    accDescr: A first copies r1 to B, then accepts r2. The manager pauses A, copies the r2 tail and verifies equality before activating B at epoch 2.
    participant A as Owner A
    participant M as Manager
    participant B as Owner B
    A->>B: Copy r1: 6 bytes
    Note over A: Accept r2: 7 bytes
    M->>A: Pause and drain writes
    A->>B: Copy r2 tail
    M->>M: Verify complete files match
    M->>B: Activate epoch 2
    Note over A: Epoch 1 can no longer write
\`\`\`

In the [object-storage example](/course-assets/system-design/m13-object-store.py), the append and cutover use the same Python lock. A request cannot pass its authority check, wait through cutover, and then append with stale permission. The check and effect occur inside one guarded section.

\`\`\`bash title="terminal"
python3 m13-object-store.py transfer
\`\`\`

\`\`\`output
copy snapshot: 6 bytes; A epoch=1 remains owner
r2 during transfer: accepted
pause, copy tail: 7 bytes; equal=True; publish B epoch=2
delayed r3 at A epoch=1: stale or paused
refreshed r3 at B epoch=2: accepted
accepted: ["r1","r2","r3"] ; B bytes: b'first\\nsecond\\nthird\\n'
authority and cutover lock are in memory; files are real
\`\`\`

The delayed r3 attempt adds nothing at A. Retrying against B with epoch 2 appends the third record, bringing B to 19 bytes. If the copied files differ before cutover, the example raises an error and leaves the assignment paused.

This runs a chosen sequence of calls, not concurrent threads. The files are real, but authority and accepted-operation history live in memory. It has no durable transfer journal or power-loss recovery protocol.

## How much must we pause?

Pausing for the whole transfer is simpler: finish earlier writes, copy a fixed source, verify it, then switch. The cost is an unavailable write interval covering the entire copy.

Copying while writes continue needs a snapshot boundary and a retained change history. Our append-only file uses a byte offset; a mutable database needs an equivalent agreement between snapshot and log. The final pause accounts for everything accepted after the snapshot. Measure that pause rather than assuming a small example proves acceptable downtime.

Not every assignment change requires copying object bytes. With a separate durable storage layer, a new partition server can load the existing checkpoint and replay its log. The requirement is still to recover the accepted state and establish exclusive authority before serving writes.

## Failure is different from a planned move

A failed health check means the owner is suspected, not that its writes are impossible. The manager must prevent the old authority from taking effect even if that process resumes. [[wiki/distributed-locks-and-leases|Fencing]] supplies this boundary only when the resource receiving the writes enforces it.

The replacement also needs recoverable state outside the failed server. If A held the only copy, changing the map to B cannot recover its data. When replicas or shared storage exist, recover from them and the retained log before making B active.

Persist transfer progress and assignments through the coordination authority. After a manager restart, it must determine whether B already accepted writes before deciding to resume or abandon a move. Reopening A's older file after B became active would discard accepted history. Electing one manager helps serialize decisions; it does not replace durable state or write enforcement.

## Handling an old map

Return an explicit stale-assignment response so the frontend can refresh and retry within its original deadline. Keep the operation identity. If the first attempt succeeded but its reply was lost, the new owner needs the corresponding receipt or another deduplication rule; the rejected-r3 example does not cover that case.

Those receipts belong with the transferred metadata. The next lesson makes the [[wiki/metadata-db-for-object-storage|object metadata and operation results]] persistent together.
`;
