window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["non-functional-requirements"] = `# Non-functional requirements

Non-functional requirements describe the conditions a system must meet while doing its job: latency, throughput, availability, durability, consistency, security, cost, and operability. “The API works” is incomplete if it becomes unusably slow under the expected load.

The useful habit is to turn each vague expectation into something a test or production measurement can check. We will write a latency target, separate availability from recovery, and see how those targets affect the design.

## Say what you measure

“The API should be fast” leaves several questions open. Which operation? How much traffic? How many slow requests are acceptable? Are we timing the database, the server, or the user's browser?

These are example targets to negotiate, not universal defaults:

| Expectation | A more useful target |
|---|---|
| Fast reads | At least 95% of eligible reads return the correct result within 50 ms at the server boundary under the stated peak load |
| High throughput | Sustain 10,000 writes per second; handle a 50,000-per-second burst lasting five minutes |
| Available API | 99.9% of eligible requests succeed over a stated monthly window |
| Recoverable data | After the specified disaster, lose no more than five minutes of writes and restore service within 30 minutes |
| Fresh search | 99% of committed documents become searchable within 30 seconds |

The numbers do not finish the requirement. Define eligible requests, the observation window, and the failure conditions. A traffic test also needs realistic request sizes and a read/write mix; tiny requests at an idle database cannot establish performance for a busy product.

Our shortener exercise uses a different provisional latency limit: one second for at least 95% of eligible redirects at the app boundary, including its required event write. Keep that exercise assumption separate from the 50 ms example above.

## Count slow and failed requests honestly

The 95th percentile, or p95, describes the point below which 95% of the measured response times fall. It says nothing about how bad the slowest 5% can be. A fast average can hide that tail.

For a user-facing target, count requests that produce the correct answer within the deadline. Failed or timed-out eligible attempts are misses, even if the server returned an error quickly. Otherwise, a failing service can appear to improve its latency.

Choose the measurement boundary deliberately. Server logs help explain application work, but omit a request that cannot reach the server. Browser measurements include more of the user's experience and also depend on network conditions. Keep the two measurements labeled; a database timing is not a page-load promise.

## Separate availability, data loss, and recovery time

Availability asks whether an operation is usable. Durability asks whether acknowledged data survives. A service can answer requests while having lost yesterday's records, or retain every record while temporarily unable to serve them.

Recovery targets make a failure scenario concrete. The **recovery point objective**, RPO, limits the acceptable gap in recovered data, expressed in time. The **recovery time objective**, RTO, limits how long restoring service may take. Name the scenario and when the clock starts: a process restart, a lost disk, and a lost region require different recovery plans.

Availability percentages also need a denominator. In a simplified time-based model where a service is either fully up or fully down, 99.9% availability over 30 days permits:

\`\`\`text
30 × 24 × 60 minutes × 0.001 = 43.2 minutes down
\`\`\`

A request-based target instead counts successful attempts. An outage during the busiest minute can affect far more requests than one during a quiet minute, so the two percentages are not interchangeable.

## Let the target change the design

Stricter freshness can rule out serving an old replica on a critical path. A shorter recovery target may require a ready replacement instead of rebuilding after failure. Both choices add work and cost that should follow an agreed product need.

Include the other operating constraints too: tenant access rules, which data may be logged, a spending limit, and the signals an on-call engineer needs to diagnose failure. A design that meets latency while leaking another tenant's records has not met its requirements.

Before accepting a target, ask how you will verify it. A recovery drill can test restoration; a realistic load test can test a throughput condition; neither proves a month of production availability. [[wiki/availability-durability-consistency-cost|Availability, durability, consistency, and cost]] examines how these promises interact.
`;
