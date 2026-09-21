window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["system-design-tradeoffs"] = `# System design tradeoffs

A design tradeoff is a choice between useful properties that the available options cannot all provide equally well. A cache may reduce read work while serving older data. A separate service may allow independent releases while adding network failures to handle.

The useful explanation names the benefit, the cost, and the requirement that makes the choice reasonable. We will work through one cache decision, then use the same method on other common choices.

## Compare two answers to the same requirement

Suppose a product page repeatedly loads a seller's display name. Reading the database each time keeps the path simple. Caching the name can avoid repeated database work, but an edit may take time to appear wherever the cached value is used.

First ask whether that delay is acceptable. If the product allows a briefly outdated display name, an expiry or invalidation policy can be part of the design. If the requirement says every read must reflect a completed edit, a cache that can serve an old value does not meet it.

Now change the field from display name to “this seller may accept payments.” A stale answer can permit an operation that should have been stopped. Similar data shapes do not imply similar correctness requirements.

Write the decision in a form another engineer can challenge:

> Cache seller display names to reduce repeated reads. Accept the agreed update delay, and check current payment eligibility separately before accepting an order.

The explanation makes two boundaries visible: which field may be stale and which operation needs a stronger check. “Use a cache for speed” leaves both unresolved.

## Follow the cost to the place it appears

Many costs appear outside the component being optimized:

| Choice | What it can improve | What the design must also handle |
|---|---|---|
| Cache a read result | Repeated lookup work and latency | Freshness, invalidation, memory and cache misses |
| Move work to a queue | Absorb bursts and schedule workers separately | User-visible delay, backlog, retries and duplicate work |
| Coordinate reads or writes across replicas | Stronger visibility or ordering guarantees | Network waits; some operations may stop when required participants cannot communicate |
| Store a derived copy of data | Simpler or faster reads | Extra writes and keeping the copies in agreement |
| Split a service | Independent ownership, scaling or deployment | Remote-call failure, observability and additional operations work |
| Add detailed metric labels | More ways to isolate a problem | More time series to store and query |

A queue does not create processing capacity. If workers cannot keep up, the waiting time grows. Similarly, adding a metric label containing every user ID can make a small set of measurements expand with the user population. The cost follows the behavior, not the number of boxes in the drawing.

These are possibilities to investigate, not universal verdicts. A cache with few hits may add work. Services with shared release dependencies may still have to deploy together. Test whether the proposed change actually buys the property being claimed.

## Record when to reconsider

A useful decision also names the evidence that would change it. Revisit the display-name cache if stale names create support problems, if its hit rate is too low to justify it, or if an indexed database read already meets the target cheaply.

Keep the rejected alternative in the design note. The next engineer should be able to tell why a direct read was insufficient, what freshness delay was accepted, and how that assumption was checked.

Not every improvement requires a sacrifice. Removing an unnecessary query can reduce latency, cost, and failure exposure together. Look for such fixes before negotiating away a product promise.

For your next design choice, name the alternative and trace one failure. If the cost is still only “more complexity,” say which retry, migration, stale result, or on-call task creates that complexity. [[wiki/when-not-to-add-infrastructure|When not to add infrastructure]] applies this test before introducing another service to operate.
`;
