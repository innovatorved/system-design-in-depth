window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["concurrency-vs-parallelism"] = `# How a server handles many requests

Concurrency lets several tasks make progress during overlapping periods. Parallelism means computations run at the same time on different execution resources. A server can handle many waiting requests concurrently while only one CPU core executes its application code.

The distinction helps you choose between overlapping waits, adding compute capacity, and limiting the amount of work in flight. We will separate those choices using a small request timeline.

## Separate computing from waiting

Assume each request needs 5 ms of CPU work, waits 40 ms for a database result, then needs another 1 ms of CPU work to respond. These are teaching values, not measurements of a real endpoint.

A server that finishes each request before starting the next spends 46 ms per request. Sixteen requests arriving together take 16 × 46 = 736 ms to finish. Its CPU does only 96 ms of application work during that period; the rest is waiting.

Another request could use the CPU while the first waits. Overlapping those waits reduces the time needed to finish the batch without making any individual database operation faster.

:::interactive name="ServerConcurrency"
Start with 16 requests and compare the three handling models. Watch both the request timelines and the CPU row. Then increase the burst to 64 requests.
:::

## Two ways to overlap the waits

A **thread pool** gives several requests their own execution context. When one thread blocks on I/O, another can run. A cap bounds the number of requests holding worker slots; requests beyond that cap must wait or be refused.

An **event loop** starts a non-blocking operation and resumes the request when its result is ready. A request waiting on network I/O does not need to occupy a separate application thread for the entire wait. The loop can work on another ready request meanwhile.

In this model, the eight-worker pool finishes 16 requests in 134 ms; the event-loop model finishes them in 121 ms. The difference comes from the model's admission cap and scheduling, not a universal speed advantage of event loops. Both still perform 96 ms of CPU work on one core.

A long CPU computation on the event-loop thread prevents its other callbacks from running. Declaring a function \`async\` does not move that computation to another processor. In Node.js, some platform operations use a worker pool; application CPU work still needs an explicit strategy such as worker threads, separate processes, or small chunks that yield.

## Add parallelism when computing is the limit

For 64 requests, the model needs 64 × 6 = 384 ms of CPU work. Its event-loop result reaches that floor: the single core is continuously busy. Adding more waiting requests cannot make that core execute the same instructions sooner.

To reduce the computing time, reduce the work or spread independent work across additional cores. Shared state, coordination, and uneven task sizes can limit the gain, so twice as many workers does not promise twice the throughput.

Runtime details matter. In a conventional CPython build with the global interpreter lock enabled, Python bytecode does not execute in parallel across its threads. Threads can still overlap I/O; processes, native code that releases the lock, and optional free-threaded builds have different behavior. “Threads never run in parallel” is not a general rule.

## Bound the work your dependencies receive

Overlapping waits is useful only while the dependency can support the resulting load. More requests in flight can increase database contention, hold more connections, consume memory, and make every request wait longer.

Budget concurrency across application instances. If each of ten instances may hold eight database connections, that is up to 80 connections before counting background workers and administrative access. A per-process cap is not a system-wide cap.

The model above holds database wait time fixed. Real dependencies often slow down as load rises, so its numbers illustrate scheduling rather than predict production throughput. Use measurements to choose limits, and use [[wiki/backpressure|backpressure]] or [[wiki/load-shedding|load shedding]] when incoming work exceeds them.
`;
