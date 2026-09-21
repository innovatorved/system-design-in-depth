window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["when-not-to-add-infrastructure"] = `# When not to add infrastructure

Every new running component needs configuration, capacity, monitoring, upgrades, and a plan for failure. Add it when those obligations buy a property the product needs: capacity, latency, availability, isolation, or easier operation.

The useful question is what the current design cannot do, and whether this component fixes that limitation.

## Name the missing property

“The database will get large” does not establish a need for a cache. “Repeated destination lookups dominate a measured latency problem” is a more useful starting point. It identifies both the work to remove and a result to compare afterward.

Performance is only one reason to change the design. A service may meet its traffic target but fail the requirement to survive losing a host. You do not need to wait for a production outage to act on an explicit recovery requirement.

For our shortener, the historical warm lookup measurement supports investigating a simple indexed database path. It excludes the application and required event write. It cannot establish complete-service capacity or recovery behavior.

## Try the smaller change first

| Proposed addition | Simpler candidate to examine | What could justify the addition |
|---|---|---|
| Redis for every read | Fix query shape, indexes and connection reuse | Repeated hot reads still miss the agreed target |
| A streaming platform for every background task | A task queue or database outbox | Replay, multiple independent consumers, or measured throughput needs |
| Microservices to divide ownership | Clear modules and internal interfaces | Independent releases, resources, permissions or failure boundaries |
| Kubernetes for a small application | A managed platform or simpler deployment | Concrete scheduling or operating needs that justify the platform |
| Writes accepted in several regions | A single writer, with replicas where useful | A product requirement for regional write availability or latency |

These are starting comparisons, not bans. A managed platform or task queue still has costs and limits. Likewise, read replicas do not remove the single writer's failure or latency constraints.

If the product requirement is still changing, avoid committing to a difficult-to-reverse arrangement before the boundary is understood. Preserve a straightforward path to introduce it later.

## Trace the new failure path

A cache can reduce database reads while creating a second place that serves an old answer. For short links, ask how quickly a disabled unsafe destination stops being returned. Also ask whether the database can handle the traffic when the cache is cold or unavailable.

A queue can move report calculation out of a redirect's wait. It still needs durable acceptance if the event must survive a crash. Returning success after an unawaited in-memory enqueue weakens that promise.

The first shortener design can record an event in the existing database and calculate reports later. A separate queue becomes worth considering when the shared database path or processing arrangement no longer meets the requirement. Measure the combined path; the lookup-only benchmark did not test it.

![One engineer proposes adding a cache box. A colleague holding a pager asks who will get paged when it fails.](/course-assets/system-design/illustrations/infrastructure-owner.webp)

## Decide who can operate it

An additional service needs someone who can recognize failure, find the relevant evidence, and recover or disable it safely. Include that work in the comparison even when the vendor offers a free tier.

Before adopting the component, establish its owner, its failure signal, and the first recovery action. If nobody can investigate it during an incident, simplify the design or build that operating capability before relying on it.

Deferring a component should leave a useful decision record. Save the current workload, the required behavior, the rejected alternative, and the condition for reopening the choice. “Revisit caching if repeated lookups still dominate the missed latency target after query fixes” gives the next engineer something to test.

The aim is a system whose parts have a clear job and an understood cost. A small design that misses the recovery promise is insufficient; a larger design full of unused mechanisms is harder to maintain. Keep the components that earn their place.
`;
