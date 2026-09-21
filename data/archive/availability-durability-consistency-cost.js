window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["availability-durability-consistency-cost"] = `# Availability, durability, consistency, cost

A service can keep answering requests while losing saved data. It can also preserve every record while being temporarily unreachable. Availability, durability, consistency, and cost describe different properties; saying a system is “reliable” does not tell us which of them it provides.

We will follow a newly created short link through three failures, then account for the work needed to prevent or recover from each one.

## Can the reader use the link now?

Suppose the shortener's database is stopped. Its files are intact, but the application cannot look up a destination. The redirect path is unavailable even though the mapping has not been lost.

Availability belongs to a particular operation. The reporting page can be down while redirects work, or creation can fail while existing links still resolve. Measure the paths that matter to users instead of treating an answering process as proof that the whole product works.

Dependencies affect this promise. Our shortener requires an accepted redirect event to be stored before returning success. If the mapping can be read but that event cannot be stored, this design returns an error. Letting the redirect continue would improve availability during that failure, but would change the agreed event-retention requirement.

## Will an acknowledged mapping survive?

The creator receives a successful response, then the application process crashes. The saved mapping must remain after restart. **Durability** concerns whether acknowledged data survives the failures the system claims to tolerate.

The application must wait for the database's commit acknowledgement before promising that creation succeeded. That acknowledgement still depends on the database configuration and storage honoring durable writes. Data left only in volatile memory cannot survive losing that memory.

A process restart with intact storage is different from destruction of the only disk. Surviving disk loss requires a recoverable copy elsewhere. A replica can help, but may also copy an accidental deletion; a backup and a tested restore procedure address a different recovery need.

Name the failure you tested. “The record survived a restart” is useful evidence. It does not establish recovery from a lost region or from an operator deleting the record.

## What may the next read observe?

Now creation succeeds, but the creator immediately follows the short link through a replica that has not received the new mapping. It returns “unknown code.” The data may be durable on the writer, yet the read violates the user's expectation.

**Consistency** describes the rules relating reads and writes, including their visibility and ordering. For this path, the concrete requirement is that a read started after successful creation can find the valid mapping. An immutable destination does not remove this first-read problem.

A straightforward initial choice is to read from the database that accepted the creation. In PostgreSQL's default Read Committed isolation, a new ordinary query sees rows committed before that query began. A lagging replica or an older transaction snapshot needs separate consideration.

A report can have a looser freshness requirement. It may omit recent events while the calculation catches up, even though those events are safely stored. [[wiki/consistency-models|Consistency models]] develops these guarantees without treating every operation as having the same needs.

## What does keeping those promises cost?

Waiting for commits adds work to the request path. Extra copies consume storage and network capacity. Failover and restoration need tests, monitoring, and people who can operate them.

Use four questions when reviewing a proposed saving:

| Property | Question |
|---|---|
| Availability | Which operations can continue during the specified failure? |
| Durability | Which acknowledged records can be lost? |
| Consistency | Which old, missing, or conflicting results may a reader observe? |
| Cost | What resources and operating work does the design require? |

Removing the shortener's event write makes a redirect cheaper by dropping a promise. Moving report calculation out of that request removes work that never had to finish synchronously. These are different kinds of saving.

A higher uptime percentage cannot compensate for losing records the product must retain. Choose the required behavior first, then use [[wiki/cost-aware-architecture|cost-aware architecture]] to compare ways of providing it.
`;
