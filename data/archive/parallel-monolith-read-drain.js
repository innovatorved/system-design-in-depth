window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["parallel-monolith-read-drain"] = `# Parallel monolith read drain

A legacy monolith can overload its primary database with reads simply because its default connection points there. Many of those queries may tolerate a replica's delay, but changing every old call site could take months. Moving a few suitable routes can buy time for that cleanup.

The useful boundary is the running application: give a second copy a different database configuration, then control which requests reach it. First choose eligible routes, then measure whether moving them actually relieves the primary.

## Same code, different default database

Keep the existing fleet pointed at the primary. Run another fleet from the same application code with its default connection pointed at a replica. An API gateway sends selected read routes to the second fleet; writes and all other routes stay on the existing path.

| Application fleet | Default database |
|---|---|
| Existing monolith | Primary |
| Read-drain monolith | Replica, with read-only credentials |

This avoids editing individual queries only when they use that configurable default. Audit explicit connection overrides, startup migrations, background consumers and scheduled jobs. Disable work that should not run in the second fleet. A second HTTP deployment should not accidentally become a second job scheduler.

\`\`\`mermaid
flowchart TB
  accTitle: Route selected reads to a second monolith
  accDescr: The gateway sends eligible reads to the replica-default monolith and all other routes to the primary-default monolith. The primary replicates changes to the replica.
  G[API gateway] -->|Other routes| W[Primary-default<br/>monolith]
  G -->|Eligible reads| R[Replica-default<br/>monolith]
  W --> P[(Primary)]
  R --> S[(Replica)]
  P -. Replication .-> S
\`\`\`

Route by both path and method. Gateway support for \`GET /catalog\` does not imply that \`POST /catalog\` should reach the same backend. KrakenD, for example, lets endpoint definitions select a method and backend. That supplies a routing mechanism; it cannot tell you whether the application behind a route is safe to move.

## Choose by behavior and freshness

“GET” is not enough. A handler might update a last-seen timestamp, create a missing row, refresh a token or publish an external event. Read-only database credentials help reject accidental database writes, including after a replica is promoted. They do not prevent external side effects.

A route also needs a freshness contract. An asynchronous replica can return a state from before an accepted write. Decide whether that is acceptable for the particular answer:

| Possible candidates, after inspection | Keep on the primary unless stronger guarantees exist |
|---|---|
| Catalog descriptions with an accepted delay | Checkout confirmation immediately after payment |
| Profile display where a delayed edit is acceptable | Balance or entitlement decisions requiring current state |
| Dashboards that show their data freshness | Read-modify-write and idempotency endpoints |

These are starting points, not permanent labels. A catalog page that promises current inventory has a different requirement from one displaying descriptions. A profile response that includes current access permissions needs a separate authorization decision.

For read-after-write flows, retaining the primary route is often the simplest first choice. The [[wiki/replication|replication lesson]] examines other freshness strategies. Do not silently weaken the product's behavior merely to move more queries.

## Move one route and watch both databases

Start with primary read work attributable to the route: request volume, query volume and expensive queries. Establish enough replica capacity, then route a small population through the second fleet. Watch the primary's work, replica replay lag, endpoint errors and p95/p99 latency together.

A replica can be healthy and still give users a poor answer. In PostgreSQL hot standby, long queries may conflict with WAL replay; letting them run can delay replay, while applying replay can require canceling them. A read drain therefore needs evidence about cancellations and freshness as well as CPU.

Shadow reads are an optional earlier step: keep serving the old answer while privately comparing the new one. They add work, so bound the sample. With separate databases, two requests do not automatically share a snapshot. Differences can mean expected lag, a query bug or an incompatible representation; classify them before deciding what blocks rollout.

Expand the route list only when the expected primary work falls without violating those route contracts. Keep enough primary capacity to take the traffic back. Reverting a gateway rule can restore routing while the old path remains compatible; it cannot undo stale answers already delivered.

## Try the serving decisions locally

The following experiment isolates comparison, cutover and fallback. It uses the [[wiki/database-migration-safety|migration lesson's]] three orders and two representations in **one SQLite database**. It runs real read/write HTTP listeners, but it does not deploy two monoliths, a gateway or a database replica.

Ada is selected for the new read path; Bo stays on the old one. The local router checks current source ownership, account activity, deletion state, version and a canonical-record fingerprint before serving a copied body. It therefore still queries the source on every request. This demonstrates a strict acceptance rule, not reduced primary load.

The example separates three target failures: missing means no copied record, stale means a different version, and mismatch means changed contents at the current version. Old-served shadow comparisons use one shared SQLite snapshot here, so they do not have the cross-database timing ambiguity described above.

Save the [read-drain replay](/course-assets/system-design/m27-lab.py) and [shared implementation](/course-assets/system-design/m27-core.py) together. The original capture used Python 3.14.6 and SQLite 3.53.4 on 12 September 2026. Each run creates temporary state.

\`\`\`bash title="terminal"
python3 m27-lab.py drain
\`\`\`
\`\`\`output
old served; shadow check: 200 equal
missing shadow: missing
wrong-value shadow: mismatch
Ada cohort new read: 200
stale target fallback: 200 paid stale
caught-up new read: 200
missing new fallback: 200
fallback disabled: 503
Bo remains old cohort: 200
Bo reads Ada object: 404
current Ada revocation: 403
write on read-only listener: 405
rollback cohort: []
route work: {"fallback":2,"new":2,"old":4,"refused":1,"shadow":4}
shadow log fields: classification only; no response bodies
HTTP outcomes: {"200":8,"201":1,"403":1,"404":1,"405":1,"503":1}
\`\`\`

After the new writer changes Ada's order, the target is stale. Fallback returns paid from the authoritative source. Disabling fallback makes an unusable target return 503. Bo cannot read Ada's order, a revoked Ada cannot read her own, and the read listener rejects writes.

The four shadow checks are additional comparisons attached to old reads, not four more user responses. The thirteen HTTP outcomes include the accepted write and permission/method refusals. Diagnostic logs retain comparison classes, not copied response bodies.

## Decide what happens when the replica falls behind

Fallback trades freshness and availability for extra primary work. During a replica problem, unbounded fallback can send the entire drained workload back at once. Budget that capacity and cap retries; where capacity is insufficient, the route needs an explicit choice between refusal and an older answer that its product contract permits.

A successful fallback should still count as a degraded new path. Otherwise a green response-success chart can hide a replica that serves almost nothing. Keep served-old, served-new, fallback and refusal counts separate.

Before adding another route, ask: if this replica pauses immediately after a write, what will the caller see, and can the primary absorb the return traffic? Answer those questions with the route owner. The [[wiki/zero-downtime-database-migration-case-study|complete migration design]] combines the local acceptance checks with copying, retirement and the point where the old fallback disappears.
`;
