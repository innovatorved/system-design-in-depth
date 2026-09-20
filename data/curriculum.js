window.CURRICULUM_DATA = {
  "stats": {
    "parts": 3,
    "modules": 18,
    "units": 200,
    "lessons": 165,
    "systems": 35,
    "builds": 12
  },
  "parts": [
    {
      "id": "part-1",
      "number": 1,
      "title": "Fundamentals",
      "summary": "The original fourteen modules, from requirements and capacity planning through reliability and operations.",
      "hours": 35,
      "modules": [
        {
          "id": "learning-foundations",
          "number": "01",
          "title": "Foundations",
          "summary": "Clarify requirements, estimate capacity, and decide which complexity the system needs.",
          "units": [
            {
              "slug": "requirements-clarification",
              "title": "Requirements clarification",
              "kind": "lesson",
              "archive": {
                "slug": "requirements-clarification",
                "file": "requirements-clarification.md",
                "title": "Requirements clarification",
                "displayTitle": "Requirements clarification",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "requirements",
                  "foundations"
                ],
                "sources": [
                  "https://c4model.com/diagrams/system-context",
                  "https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/build-for-business",
                  "https://sre.google/workbook/implementing-slos/",
                  "[[wiki/non-functional-requirements]]",
                  "[[wiki/back-of-the-envelope-capacity-planning]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "Requirements clarification turns a broad request into a design problem you can reason about. Before choosing a database or drawing services, establish who uses the system, what they need to accomplish, and which promises must survive load and failures.",
                "mermaidCount": 0,
                "content": "# Requirements clarification\n\nRequirements clarification turns a broad request into a design problem you can reason about. Before choosing a database or drawing services, establish who uses the system, what they need to accomplish, and which promises must survive load and failures.\n\nWe will turn “design a URL shortener” into a small brief. The same questions apply to a feed, file store, or payment service; the answers will change.\n\n## Start with the people and the operation\n\nA link creator submits a destination and receives a short address. A reader opens that address and expects to reach the destination. An administrator may need to disable an abusive link. These are three roles with different permissions, even if one person sometimes fills all three.\n\nNow follow the main operation. Can the creator choose the short name? Can its destination change? Must readers sign in? Each answer changes something the implementation must enforce.\n\nFor this course's shortener, assume approved callers can create links, names are generated, destinations stay fixed, and anyone can follow a link. Custom aliases and destination editing are outside the first version. Abuse handling still needs an owner; leaving out editing does not make unsafe destinations harmless.\n\nWrite these choices down as assumptions to confirm with the product owner. A plausible answer becomes a requirement only when the people responsible for the product agree to it.\n\n## Ask what must remain true\n\nA generated name must not silently replace somebody else's mapping. A saved link must keep its destination through the promised retention period. These are **invariants**: conditions the implementation must preserve, including when requests overlap or are retried.\n\nAlso identify the authoritative data. The stored mapping decides where a link goes. A cached copy can speed up reading it, but does not become a separate authority that may choose a different destination.\n\nFreshness needs its own question. If an administrator disables a link, how long may a cached copy still redirect readers? An acceptable delay of a minute permits different choices from a requirement to stop every new redirect immediately. Do not leave that promise hidden inside “we will cache it.”\n\n## Separate work that must finish now from work that can wait\n\n“Record clicks” is ambiguous. Our server can record a redirect request; it cannot infer a distinct person or prove that the destination page loaded.\n\nThe shortener exercise requires each accepted redirect request to have a stored event before the response. Reports may be calculated later. If storing the event fails, this version returns an error. That is a deliberate product tradeoff: event retention takes priority over redirect availability during that failure.\n\nAnother product could choose to redirect anyway and tolerate missing events. The important question is which promise the design is supposed to keep. Moving report calculation into the background does not answer whether losing its input is acceptable.\n\n## Put numbers and boundaries in the brief\n\nKeep these questions nearby when the conversation moves beyond the ordinary request:\n\n| Area | Question to settle |\n|---|---|\n| Scale | How many reads and writes arrive, how bursty are they, and in which regions? |\n| Retention | How long must records remain, and what growth should we plan for? |\n| Reliability | Which operations may degrade, and how quickly must service and data recover? |\n| Privacy | Who can read each record, and which sensitive fields are actually needed? |\n| Scope | Which workflows are required now, and which are explicitly deferred? |\n\nFor the course exercise, use 100 million redirects and 1 million new links per day, with mappings retained for at least five years. These are planning assumptions, not measured traffic. [[wiki/back-of-the-envelope-capacity-planning|Capacity planning]] turns them into rates and storage estimates.\n\nBefore handing off the brief, check one failure: the analytics report is unavailable, but event storage works. Should redirects continue? Yes, under our chosen contract. Now make event storage unavailable. The answer changes. Being able to explain that difference means the requirements are specific enough to guide a design.\n\nTargets such as “fast” and “highly available” still need a measurement and a time window. [[wiki/non-functional-requirements|Non-functional requirements]] makes those promises testable.\n"
              }
            },
            {
              "slug": "logical-system-design",
              "title": "Logical system design",
              "kind": "lesson",
              "archive": {
                "slug": "logical-system-design",
                "file": "logical-system-design.md",
                "title": "Logical system design",
                "displayTitle": "Logical system design",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "architecture",
                  "maintainability"
                ],
                "sources": [
                  "https://alistair.cockburn.us/hexagonal-architecture",
                  "https://martinfowler.com/eaaCatalog/repository.html",
                  "https://martinfowler.com/articles/injection.html",
                  "[[wiki/repository-pattern]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "Logical system design decides where application rules live and how modules work together. It helps answer a practical question: when a product rule or external provider changes, which code should need to change with it?",
                "mermaidCount": 1,
                "content": "# Logical system design\n\nLogical system design decides where application rules live and how modules work together. It helps answer a practical question: when a product rule or external provider changes, which code should need to change with it?\n\nWe will separate the shortener's HTTP handling, link rules, and storage work, then check whether those boundaries make a change easier to test.\n\n## Give each responsibility an owner\n\nA route handler can parse a request, run SQL, check whether a link is disabled, record a click, and format the redirect. For a small operation, that can be readable. Trouble starts when an import job needs the same rules, or every handler begins interpreting database rows differently.\n\nSeparate the work when those responsibilities need to vary independently:\n\n| Responsibility | What it owns |\n|---|---|\n| HTTP adapter | Parse the request and translate the result into an HTTP response |\n| Link operation | Apply the product's rules for creating or opening a link |\n| Storage adapter | Execute queries and map stored records into the application's result types |\n\nA **boundary** is the agreement between these parts. It can be an ordinary function call inside one process. Drawing separate boxes does not require separate servers or deployments.\n\n```mermaid\nflowchart TB\n  accTitle: Two callers share the same link rules\n  accDescr: HTTP handling and an import job call link operations, which use a storage adapter. These are application responsibilities, not separate machines.\n  HTTP[HTTP handling] --> Rules[Link operations]\n  Import[Import job] --> Rules\n  Rules --> Storage[Storage adapter]\n  Storage --> DB[(Database)]\n```\n\nThe HTTP path creates one link; the import job may create many. Both must enforce the same rule that a generated code cannot replace an existing mapping. The database's uniqueness constraint enforces the collision rule atomically; the application decides whether to retry with another candidate or return an error.\n\n## Make the agreement useful to its caller\n\nConsider `resolve(code)`. “Returns a URL” leaves several cases unstated. The link might be absent, disabled, or temporarily impossible to look up.\n\n| Result | Meaning | HTTP caller's action |\n|---|---|---|\n| Found | The operation permits this link and supplies its destination | Continue the redirect path |\n| Missing | The lookup succeeded, but no mapping exists | Return not found |\n| Disabled | The mapping exists but cannot be used | Refuse the redirect |\n| Unavailable | The operation could not establish an answer | Return a service error |\n\nKeep unavailable distinct from missing. Translating a connection failure into “no such link” gives the caller a false answer. Likewise, the storage adapter should not leak a vendor-specific exception into every route and job that uses it.\n\nFor the shortener's agreed contract, a successful redirect also waits for its request event to be stored. That sequencing belongs to the link operation. HTTP formatting does not decide whether losing a click is acceptable.\n\n## Test the rule through the boundary\n\nTo test “disabled links never redirect,” supply a small in-memory storage implementation that returns a disabled record. Exercise the link operation directly. The test should not need a browser, a live database, or knowledge of SQL syntax to check that product rule.\n\nThat test does not establish that the real database query works. Test the storage adapter against the database separately, including missing rows, uniqueness conflicts, and failures. Keeping these tests distinct helps identify whether a failure comes from a rule or its persistence implementation.\n\nThe same approach applies to a payment or notification provider: expose the operation the application needs, then translate it to the provider's API in one place. A replacement provider may have different guarantees, so an interface reduces the places to inspect; it does not make providers automatically interchangeable.\n\n## Stop before the boundary becomes ceremony\n\nA function that forwards unchanged arguments through three layers is not necessarily protecting anything. Introduce a boundary around a repeated rule, a dependency that changes, or a decision worth testing independently.\n\nReview a likely change: add an import job, replace a notification provider, or introduce link expiry. If each requires edits across unrelated route handlers, the rule probably has no clear owner. If one focused operation owns the change and its tests, the logical design is doing useful work.\n\nThe [[wiki/repository-pattern|repository pattern]] develops the storage boundary further. [[wiki/monolith-vs-microservices|Monoliths and microservices]] asks a separate question: which of these responsibilities need independent deployment?\n"
              }
            },
            {
              "slug": "non-functional-requirements",
              "title": "Non-functional requirements",
              "kind": "lesson",
              "archive": {
                "slug": "non-functional-requirements",
                "file": "non-functional-requirements.md",
                "title": "Non-functional requirements",
                "displayTitle": "Non-functional requirements",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "requirements",
                  "reliability"
                ],
                "sources": [
                  "https://sre.google/sre-book/service-level-objectives/",
                  "https://sre.google/workbook/implementing-slos/",
                  "https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/build-for-business",
                  "https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-design-specification",
                  "[[wiki/requirements-clarification]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "Non-functional requirements describe the conditions a system must meet while doing its job: latency, throughput, availability, durability, consistency, security, cost, and operability. “The API works” is incomplete if it becomes unusably slow under the expected load.",
                "mermaidCount": 0,
                "content": "# Non-functional requirements\n\nNon-functional requirements describe the conditions a system must meet while doing its job: latency, throughput, availability, durability, consistency, security, cost, and operability. “The API works” is incomplete if it becomes unusably slow under the expected load.\n\nThe useful habit is to turn each vague expectation into something a test or production measurement can check. We will write a latency target, separate availability from recovery, and see how those targets affect the design.\n\n## Say what you measure\n\n“The API should be fast” leaves several questions open. Which operation? How much traffic? How many slow requests are acceptable? Are we timing the database, the server, or the user's browser?\n\nThese are example targets to negotiate, not universal defaults:\n\n| Expectation | A more useful target |\n|---|---|\n| Fast reads | At least 95% of eligible reads return the correct result within 50 ms at the server boundary under the stated peak load |\n| High throughput | Sustain 10,000 writes per second; handle a 50,000-per-second burst lasting five minutes |\n| Available API | 99.9% of eligible requests succeed over a stated monthly window |\n| Recoverable data | After the specified disaster, lose no more than five minutes of writes and restore service within 30 minutes |\n| Fresh search | 99% of committed documents become searchable within 30 seconds |\n\nThe numbers do not finish the requirement. Define eligible requests, the observation window, and the failure conditions. A traffic test also needs realistic request sizes and a read/write mix; tiny requests at an idle database cannot establish performance for a busy product.\n\nOur shortener exercise uses a different provisional latency limit: one second for at least 95% of eligible redirects at the app boundary, including its required event write. Keep that exercise assumption separate from the 50 ms example above.\n\n## Count slow and failed requests honestly\n\nThe 95th percentile, or p95, describes the point below which 95% of the measured response times fall. It says nothing about how bad the slowest 5% can be. A fast average can hide that tail.\n\nFor a user-facing target, count requests that produce the correct answer within the deadline. Failed or timed-out eligible attempts are misses, even if the server returned an error quickly. Otherwise, a failing service can appear to improve its latency.\n\nChoose the measurement boundary deliberately. Server logs help explain application work, but omit a request that cannot reach the server. Browser measurements include more of the user's experience and also depend on network conditions. Keep the two measurements labeled; a database timing is not a page-load promise.\n\n## Separate availability, data loss, and recovery time\n\nAvailability asks whether an operation is usable. Durability asks whether acknowledged data survives. A service can answer requests while having lost yesterday's records, or retain every record while temporarily unable to serve them.\n\nRecovery targets make a failure scenario concrete. The **recovery point objective**, RPO, limits the acceptable gap in recovered data, expressed in time. The **recovery time objective**, RTO, limits how long restoring service may take. Name the scenario and when the clock starts: a process restart, a lost disk, and a lost region require different recovery plans.\n\nAvailability percentages also need a denominator. In a simplified time-based model where a service is either fully up or fully down, 99.9% availability over 30 days permits:\n\n```text\n30 × 24 × 60 minutes × 0.001 = 43.2 minutes down\n```\n\nA request-based target instead counts successful attempts. An outage during the busiest minute can affect far more requests than one during a quiet minute, so the two percentages are not interchangeable.\n\n## Let the target change the design\n\nStricter freshness can rule out serving an old replica on a critical path. A shorter recovery target may require a ready replacement instead of rebuilding after failure. Both choices add work and cost that should follow an agreed product need.\n\nInclude the other operating constraints too: tenant access rules, which data may be logged, a spending limit, and the signals an on-call engineer needs to diagnose failure. A design that meets latency while leaking another tenant's records has not met its requirements.\n\nBefore accepting a target, ask how you will verify it. A recovery drill can test restoration; a realistic load test can test a throughput condition; neither proves a month of production availability. [[wiki/availability-durability-consistency-cost|Availability, durability, consistency, and cost]] examines how these promises interact.\n"
              }
            },
            {
              "slug": "system-design-tradeoffs",
              "title": "System design tradeoffs",
              "kind": "lesson",
              "archive": {
                "slug": "system-design-tradeoffs",
                "file": "system-design-tradeoffs.md",
                "title": "System design tradeoffs",
                "displayTitle": "System design tradeoffs",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "tradeoffs",
                  "architecture"
                ],
                "sources": [
                  "https://sre.google/sre-book/embracing-risk/",
                  "https://martinfowler.com/articles/microservice-trade-offs.html",
                  "https://prometheus.io/docs/practices/instrumentation/",
                  "[[wiki/non-functional-requirements]]",
                  "[[wiki/when-not-to-add-infrastructure]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "A design tradeoff is a choice between useful properties that the available options cannot all provide equally well. A cache may reduce read work while serving older data. A separate service may allow independent releases while adding network failures to handle.",
                "mermaidCount": 0,
                "content": "# System design tradeoffs\n\nA design tradeoff is a choice between useful properties that the available options cannot all provide equally well. A cache may reduce read work while serving older data. A separate service may allow independent releases while adding network failures to handle.\n\nThe useful explanation names the benefit, the cost, and the requirement that makes the choice reasonable. We will work through one cache decision, then use the same method on other common choices.\n\n## Compare two answers to the same requirement\n\nSuppose a product page repeatedly loads a seller's display name. Reading the database each time keeps the path simple. Caching the name can avoid repeated database work, but an edit may take time to appear wherever the cached value is used.\n\nFirst ask whether that delay is acceptable. If the product allows a briefly outdated display name, an expiry or invalidation policy can be part of the design. If the requirement says every read must reflect a completed edit, a cache that can serve an old value does not meet it.\n\nNow change the field from display name to “this seller may accept payments.” A stale answer can permit an operation that should have been stopped. Similar data shapes do not imply similar correctness requirements.\n\nWrite the decision in a form another engineer can challenge:\n\n> Cache seller display names to reduce repeated reads. Accept the agreed update delay, and check current payment eligibility separately before accepting an order.\n\nThe explanation makes two boundaries visible: which field may be stale and which operation needs a stronger check. “Use a cache for speed” leaves both unresolved.\n\n## Follow the cost to the place it appears\n\nMany costs appear outside the component being optimized:\n\n| Choice | What it can improve | What the design must also handle |\n|---|---|---|\n| Cache a read result | Repeated lookup work and latency | Freshness, invalidation, memory and cache misses |\n| Move work to a queue | Absorb bursts and schedule workers separately | User-visible delay, backlog, retries and duplicate work |\n| Coordinate reads or writes across replicas | Stronger visibility or ordering guarantees | Network waits; some operations may stop when required participants cannot communicate |\n| Store a derived copy of data | Simpler or faster reads | Extra writes and keeping the copies in agreement |\n| Split a service | Independent ownership, scaling or deployment | Remote-call failure, observability and additional operations work |\n| Add detailed metric labels | More ways to isolate a problem | More time series to store and query |\n\nA queue does not create processing capacity. If workers cannot keep up, the waiting time grows. Similarly, adding a metric label containing every user ID can make a small set of measurements expand with the user population. The cost follows the behavior, not the number of boxes in the drawing.\n\nThese are possibilities to investigate, not universal verdicts. A cache with few hits may add work. Services with shared release dependencies may still have to deploy together. Test whether the proposed change actually buys the property being claimed.\n\n## Record when to reconsider\n\nA useful decision also names the evidence that would change it. Revisit the display-name cache if stale names create support problems, if its hit rate is too low to justify it, or if an indexed database read already meets the target cheaply.\n\nKeep the rejected alternative in the design note. The next engineer should be able to tell why a direct read was insufficient, what freshness delay was accepted, and how that assumption was checked.\n\nNot every improvement requires a sacrifice. Removing an unnecessary query can reduce latency, cost, and failure exposure together. Look for such fixes before negotiating away a product promise.\n\nFor your next design choice, name the alternative and trace one failure. If the cost is still only “more complexity,” say which retry, migration, stale result, or on-call task creates that complexity. [[wiki/when-not-to-add-infrastructure|When not to add infrastructure]] applies this test before introducing another service to operate.\n"
              }
            },
            {
              "slug": "availability-durability-consistency-cost",
              "title": "Availability, durability, consistency, cost",
              "kind": "lesson",
              "archive": {
                "slug": "availability-durability-consistency-cost",
                "file": "availability-durability-consistency-cost.md",
                "title": "Availability, durability, consistency, cost",
                "displayTitle": "Availability, durability, consistency, cost",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "reliability",
                  "tradeoffs",
                  "foundations"
                ],
                "sources": [
                  "https://www.postgresql.org/docs/16/wal-reliability.html",
                  "https://www.postgresql.org/docs/16/transaction-iso.html",
                  "https://www.postgresql.org/docs/16/backup.html",
                  "https://sre.google/sre-book/embracing-risk/",
                  "[[wiki/non-functional-requirements]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "A service can keep answering requests while losing saved data. It can also preserve every record while being temporarily unreachable. Availability, durability, consistency, and cost describe different properties; saying a system is “reliable” does not tell us which of them it provides.",
                "mermaidCount": 0,
                "content": "# Availability, durability, consistency, cost\n\nA service can keep answering requests while losing saved data. It can also preserve every record while being temporarily unreachable. Availability, durability, consistency, and cost describe different properties; saying a system is “reliable” does not tell us which of them it provides.\n\nWe will follow a newly created short link through three failures, then account for the work needed to prevent or recover from each one.\n\n## Can the reader use the link now?\n\nSuppose the shortener's database is stopped. Its files are intact, but the application cannot look up a destination. The redirect path is unavailable even though the mapping has not been lost.\n\nAvailability belongs to a particular operation. The reporting page can be down while redirects work, or creation can fail while existing links still resolve. Measure the paths that matter to users instead of treating an answering process as proof that the whole product works.\n\nDependencies affect this promise. Our shortener requires an accepted redirect event to be stored before returning success. If the mapping can be read but that event cannot be stored, this design returns an error. Letting the redirect continue would improve availability during that failure, but would change the agreed event-retention requirement.\n\n## Will an acknowledged mapping survive?\n\nThe creator receives a successful response, then the application process crashes. The saved mapping must remain after restart. **Durability** concerns whether acknowledged data survives the failures the system claims to tolerate.\n\nThe application must wait for the database's commit acknowledgement before promising that creation succeeded. That acknowledgement still depends on the database configuration and storage honoring durable writes. Data left only in volatile memory cannot survive losing that memory.\n\nA process restart with intact storage is different from destruction of the only disk. Surviving disk loss requires a recoverable copy elsewhere. A replica can help, but may also copy an accidental deletion; a backup and a tested restore procedure address a different recovery need.\n\nName the failure you tested. “The record survived a restart” is useful evidence. It does not establish recovery from a lost region or from an operator deleting the record.\n\n## What may the next read observe?\n\nNow creation succeeds, but the creator immediately follows the short link through a replica that has not received the new mapping. It returns “unknown code.” The data may be durable on the writer, yet the read violates the user's expectation.\n\n**Consistency** describes the rules relating reads and writes, including their visibility and ordering. For this path, the concrete requirement is that a read started after successful creation can find the valid mapping. An immutable destination does not remove this first-read problem.\n\nA straightforward initial choice is to read from the database that accepted the creation. In PostgreSQL's default Read Committed isolation, a new ordinary query sees rows committed before that query began. A lagging replica or an older transaction snapshot needs separate consideration.\n\nA report can have a looser freshness requirement. It may omit recent events while the calculation catches up, even though those events are safely stored. [[wiki/consistency-models|Consistency models]] develops these guarantees without treating every operation as having the same needs.\n\n## What does keeping those promises cost?\n\nWaiting for commits adds work to the request path. Extra copies consume storage and network capacity. Failover and restoration need tests, monitoring, and people who can operate them.\n\nUse four questions when reviewing a proposed saving:\n\n| Property | Question |\n|---|---|\n| Availability | Which operations can continue during the specified failure? |\n| Durability | Which acknowledged records can be lost? |\n| Consistency | Which old, missing, or conflicting results may a reader observe? |\n| Cost | What resources and operating work does the design require? |\n\nRemoving the shortener's event write makes a redirect cheaper by dropping a promise. Moving report calculation out of that request removes work that never had to finish synchronously. These are different kinds of saving.\n\nA higher uptime percentage cannot compensate for losing records the product must retain. Choose the required behavior first, then use [[wiki/cost-aware-architecture|cost-aware architecture]] to compare ways of providing it.\n"
              }
            },
            {
              "slug": "back-of-the-envelope-capacity-planning",
              "title": "Back-of-the-envelope capacity planning",
              "kind": "lesson",
              "archive": {
                "slug": "back-of-the-envelope-capacity-planning",
                "file": "back-of-the-envelope-capacity-planning.md",
                "title": "Back-of-the-envelope capacity planning",
                "displayTitle": "Back-of-the-envelope capacity planning",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "capacity-planning",
                  "foundations"
                ],
                "sources": [
                  "https://sre.google/workbook/non-abstract-design/",
                  "https://www.postgresql.org/docs/16/pgbench.html",
                  "https://www.postgresql.org/docs/16/functions-admin.html#FUNCTIONS-ADMIN-DBSIZE",
                  "[[wiki/non-functional-requirements]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "Capacity planning turns product assumptions into approximate request rates, storage, bandwidth, and operating cost. The estimate should expose likely bottlenecks and help choose what to measure next. Extra decimal places do not make uncertain inputs more reliable.",
                "mermaidCount": 0,
                "content": "# Back-of-the-envelope capacity planning\n\nCapacity planning turns product assumptions into approximate request rates, storage, bandwidth, and operating cost. The estimate should expose likely bottlenecks and help choose what to measure next. Extra decimal places do not make uncertain inputs more reliable.\n\nWe will estimate a feed's read traffic, account for work hidden behind each request, and compare the shortener's storage allowance with a historical measurement.\n\n## Turn user activity into a rate\n\nStart with active users and actions per user, not the total number of registered accounts. Suppose a feed has 10 million daily active users, each making 20 feed requests per day.\n\n| Step | Calculation | Result |\n|---|---|---|\n| Daily reads | 10 million × 20 | 200 million requests |\n| Average rate | 200 million ÷ 86,400 seconds | About 2,300 requests per second |\n| Assumed busy period | Average × 10 | About 23,000 requests per second |\n\nThe tenfold peak is an assumption to replace with traffic evidence. If plausible peaks range from 20,000 to 50,000 requests per second, compare designs across that range. A design that works only at the rounded midpoint has little margin for uncertainty.\n\nRecord where the traffic arrives, how long bursts last, and whether one tenant or popular item concentrates the load. A global daily total does not describe the busiest region or partition. Revisit the estimate for growth, launches, and seasonal demand.\n\n## Count the work behind one request\n\nA feed request might return 20 items. Fetching each item with a separate database query would produce roughly 460,000 lookups per second at the assumed peak, before retries or cache misses. That estimate is a reason to inspect batching and query shape; it does not by itself prove that any particular database cannot cope.\n\nSeparate reads, writes, background jobs, and fanout. One new post can cause many feed updates. One redirect in our shortener also writes an event, so a product with many more reads than creations is not necessarily read-heavy at the database.\n\nBandwidth needs bytes as well as requests. At an illustrative 20 kB response payload, 23,000 feed responses per second carry about 460 MB/s, or 3.7 Gbit/s, before protocol overhead. These decimal units describe payload leaving that serving boundary; compression, caches, and network placement change what each link carries.\n\nKeep the latency target beside the rate. “Handles 23,000 requests per second” is not sufficient if the queue grows throughout the test and users wait longer each minute.\n\n## Build storage from retention and representation\n\nFor a steady write rate, start with:\n\n**Retained records = records per day × retention days.**\n\nMultiply by the stored bytes per record, then account for indexes, replicas, derived data, backups, write logs, and temporary space. Do not add an index allowance twice if your measured record size already includes it.\n\nThe shortener exercise assumes 1 million new links per day, retained for five 365-day years. That gives 1.825 billion links. An initial allowance of 500 bytes per link, including indexes, projects 0.9125 decimal TB for that one copy of the link data.\n\nClick history is separate and may dominate. At 100 million redirects per day, the shortener records 100 times as many redirect events as new links. The event size and retention period need their own estimate.\n\n## Replace the assumptions that matter most\n\nA local PostgreSQL 16.10 capture on 11 September 2026 measured a million-row shortener fixture. Its link table's main data fork occupied 93,085,696 bytes and its indexes 44,974,080 bytes: about 138.1 bytes per link together. That measure excludes auxiliary storage and the rest of the database.\n\nUsing the rounded 138.1 bytes in the same projection gives about 0.252 TB, roughly 3.6 times smaller than the initial link allowance. It remains a projection: longer URLs, extra indexes, growth, and deleted-row space can change the future representation. It is not the total disk requirement or a predicted invoice.\n\nThe same historical test completed 231,377 warm indexed lookups in 20 seconds at a target arrival rate of about 11,574 per second. None failed, were skipped, or exceeded its chosen one-second limit. It used a local socket and excluded the application and required event insert. It supports testing the simple design further; it does not establish capacity for the complete five-year service.\n\nFinish the estimate by naming the next limiting resource: CPU, database writes, cache memory, queue processing, bandwidth, or a provider quota. Measure that path with representative data and failures. [[wiki/cost-aware-architecture|Cost-aware architecture]] then connects those quantities to the bill and the work of operating the system.\n"
              }
            },
            {
              "slug": "concurrency-vs-parallelism",
              "title": "How a server handles many requests",
              "kind": "lesson",
              "archive": {
                "slug": "concurrency-vs-parallelism",
                "file": "concurrency-vs-parallelism.md",
                "title": "How a server handles many requests",
                "displayTitle": "How a server handles many requests",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "concurrency",
                  "parallelism"
                ],
                "sources": [
                  "https://go.dev/blog/waza-talk",
                  "https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop",
                  "https://docs.python.org/3/library/threading.html",
                  "[[wiki/backpressure]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "Concurrency lets several tasks make progress during overlapping periods. Parallelism means computations run at the same time on different execution resources. A server can handle many waiting requests concurrently while only one CPU core executes its application code.",
                "mermaidCount": 0,
                "content": "# How a server handles many requests\n\nConcurrency lets several tasks make progress during overlapping periods. Parallelism means computations run at the same time on different execution resources. A server can handle many waiting requests concurrently while only one CPU core executes its application code.\n\nThe distinction helps you choose between overlapping waits, adding compute capacity, and limiting the amount of work in flight. We will separate those choices using a small request timeline.\n\n## Separate computing from waiting\n\nAssume each request needs 5 ms of CPU work, waits 40 ms for a database result, then needs another 1 ms of CPU work to respond. These are teaching values, not measurements of a real endpoint.\n\nA server that finishes each request before starting the next spends 46 ms per request. Sixteen requests arriving together take 16 × 46 = 736 ms to finish. Its CPU does only 96 ms of application work during that period; the rest is waiting.\n\nAnother request could use the CPU while the first waits. Overlapping those waits reduces the time needed to finish the batch without making any individual database operation faster.\n\n:::interactive name=\"ServerConcurrency\"\nStart with 16 requests and compare the three handling models. Watch both the request timelines and the CPU row. Then increase the burst to 64 requests.\n:::\n\n## Two ways to overlap the waits\n\nA **thread pool** gives several requests their own execution context. When one thread blocks on I/O, another can run. A cap bounds the number of requests holding worker slots; requests beyond that cap must wait or be refused.\n\nAn **event loop** starts a non-blocking operation and resumes the request when its result is ready. A request waiting on network I/O does not need to occupy a separate application thread for the entire wait. The loop can work on another ready request meanwhile.\n\nIn this model, the eight-worker pool finishes 16 requests in 134 ms; the event-loop model finishes them in 121 ms. The difference comes from the model's admission cap and scheduling, not a universal speed advantage of event loops. Both still perform 96 ms of CPU work on one core.\n\nA long CPU computation on the event-loop thread prevents its other callbacks from running. Declaring a function `async` does not move that computation to another processor. In Node.js, some platform operations use a worker pool; application CPU work still needs an explicit strategy such as worker threads, separate processes, or small chunks that yield.\n\n## Add parallelism when computing is the limit\n\nFor 64 requests, the model needs 64 × 6 = 384 ms of CPU work. Its event-loop result reaches that floor: the single core is continuously busy. Adding more waiting requests cannot make that core execute the same instructions sooner.\n\nTo reduce the computing time, reduce the work or spread independent work across additional cores. Shared state, coordination, and uneven task sizes can limit the gain, so twice as many workers does not promise twice the throughput.\n\nRuntime details matter. In a conventional CPython build with the global interpreter lock enabled, Python bytecode does not execute in parallel across its threads. Threads can still overlap I/O; processes, native code that releases the lock, and optional free-threaded builds have different behavior. “Threads never run in parallel” is not a general rule.\n\n## Bound the work your dependencies receive\n\nOverlapping waits is useful only while the dependency can support the resulting load. More requests in flight can increase database contention, hold more connections, consume memory, and make every request wait longer.\n\nBudget concurrency across application instances. If each of ten instances may hold eight database connections, that is up to 80 connections before counting background workers and administrative access. A per-process cap is not a system-wide cap.\n\nThe model above holds database wait time fixed. Real dependencies often slow down as load rises, so its numbers illustrate scheduling rather than predict production throughput. Use measurements to choose limits, and use [[wiki/backpressure|backpressure]] or [[wiki/load-shedding|load shedding]] when incoming work exceeds them.\n"
              }
            },
            {
              "slug": "horizontal-vs-vertical-scaling",
              "title": "Horizontal vs vertical scaling",
              "kind": "lesson",
              "archive": {
                "slug": "horizontal-vs-vertical-scaling",
                "file": "horizontal-vs-vertical-scaling.md",
                "title": "Horizontal vs vertical scaling",
                "displayTitle": "Horizontal vs vertical scaling",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "scaling",
                  "stateless"
                ],
                "sources": [
                  "https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out",
                  "https://sre.google/workbook/non-abstract-design/",
                  "[[wiki/concurrency-vs-parallelism]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Vertical scaling gives one machine more CPU, memory, or storage capacity.",
                  "continuation": "Horizontal scaling spreads work across more machines."
                }
              }
            },
            {
              "slug": "monolith-vs-microservices",
              "title": "Monolith vs microservices",
              "kind": "lesson",
              "archive": {
                "slug": "monolith-vs-microservices",
                "file": "monolith-vs-microservices.md",
                "title": "Monolith vs microservices",
                "displayTitle": "Monolith vs microservices",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "scaling",
                  "architecture"
                ],
                "sources": [
                  "https://martinfowler.com/articles/microservice-trade-offs.html",
                  "https://learn.microsoft.com/en-us/azure/architecture/microservices/design/data-considerations",
                  "[[wiki/logical-system-design]]",
                  "[[wiki/service-to-service-communication]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A monolith is built and deployed as one application unit.",
                  "continuation": "Microservices divide capabilities into services that can be deployed independently."
                }
              }
            },
            {
              "slug": "repository-pattern",
              "title": "Repository pattern",
              "kind": "lesson",
              "archive": {
                "slug": "repository-pattern",
                "file": "repository-pattern.md",
                "title": "Repository pattern",
                "displayTitle": "Repository pattern",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "architecture",
                  "data-access"
                ],
                "sources": [
                  "https://martinfowler.com/eaaCatalog/repository.html",
                  "https://www.postgresql.org/docs/16/tutorial-transactions.html",
                  "https://www.postgresql.org/docs/16/ddl-constraints.html",
                  "[[wiki/logical-system-design]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A repository puts a data-access boundary between application rules and persistence details.",
                  "continuation": "Callers ask for domain objects or operations; the repository handles the query and the mapping from stored data."
                }
              }
            },
            {
              "slug": "extensible-data-modeling",
              "title": "Extensible data modeling",
              "kind": "lesson",
              "archive": {
                "slug": "extensible-data-modeling",
                "file": "extensible-data-modeling.md",
                "title": "Extensible data modeling",
                "displayTitle": "Extensible data modeling",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "data-modeling",
                  "product-engineering"
                ],
                "sources": [
                  "https://www.postgresql.org/docs/16/ddl-constraints.html",
                  "https://www.postgresql.org/docs/16/datatype-json.html",
                  "https://martinfowler.com/bliki/ParallelChange.html",
                  "[[wiki/schema-evolution]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An extensible model accommodates a plausible next product change without making today's data hard to understand.",
                  "continuation": "The useful move is often one level of generality: enough to represent the next known use case, while keeping names, queries, and constraints specific."
                }
              }
            },
            {
              "slug": "cost-aware-architecture",
              "title": "Cost-aware architecture",
              "kind": "lesson",
              "archive": {
                "slug": "cost-aware-architecture",
                "file": "cost-aware-architecture.md",
                "title": "Cost-aware architecture",
                "displayTitle": "Cost-aware architecture",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "requirements",
                  "cost"
                ],
                "sources": [
                  "https://www.finops.org/framework/capabilities/unit-economics/",
                  "https://sre.google/sre-book/embracing-risk/",
                  "https://sre.google/sre-book/simplicity/",
                  "[[wiki/back-of-the-envelope-capacity-planning]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Cost is a design constraint alongside latency, correctness, and reliability.",
                  "continuation": "To reason about it, connect the work the product performs to the resources it consumes and the time needed to operate them."
                }
              }
            },
            {
              "slug": "when-not-to-add-infrastructure",
              "title": "When not to add infrastructure",
              "kind": "lesson",
              "archive": {
                "slug": "when-not-to-add-infrastructure",
                "file": "when-not-to-add-infrastructure.md",
                "title": "When not to add infrastructure",
                "displayTitle": "When not to add infrastructure",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "architecture",
                  "tradeoffs"
                ],
                "sources": [
                  "https://sre.google/sre-book/simplicity/",
                  "https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out",
                  "https://martinfowler.com/articles/microservice-trade-offs.html",
                  "[[wiki/cost-aware-architecture]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "Every new running component needs configuration, capacity, monitoring, upgrades, and a plan for failure. Add it when those obligations buy a property the product needs: capacity, latency, availability, isolation, or easier operation.",
                "mermaidCount": 0,
                "content": "# When not to add infrastructure\n\nEvery new running component needs configuration, capacity, monitoring, upgrades, and a plan for failure. Add it when those obligations buy a property the product needs: capacity, latency, availability, isolation, or easier operation.\n\nThe useful question is what the current design cannot do, and whether this component fixes that limitation.\n\n## Name the missing property\n\n“The database will get large” does not establish a need for a cache. “Repeated destination lookups dominate a measured latency problem” is a more useful starting point. It identifies both the work to remove and a result to compare afterward.\n\nPerformance is only one reason to change the design. A service may meet its traffic target but fail the requirement to survive losing a host. You do not need to wait for a production outage to act on an explicit recovery requirement.\n\nFor our shortener, the historical warm lookup measurement supports investigating a simple indexed database path. It excludes the application and required event write. It cannot establish complete-service capacity or recovery behavior.\n\n## Try the smaller change first\n\n| Proposed addition | Simpler candidate to examine | What could justify the addition |\n|---|---|---|\n| Redis for every read | Fix query shape, indexes and connection reuse | Repeated hot reads still miss the agreed target |\n| A streaming platform for every background task | A task queue or database outbox | Replay, multiple independent consumers, or measured throughput needs |\n| Microservices to divide ownership | Clear modules and internal interfaces | Independent releases, resources, permissions or failure boundaries |\n| Kubernetes for a small application | A managed platform or simpler deployment | Concrete scheduling or operating needs that justify the platform |\n| Writes accepted in several regions | A single writer, with replicas where useful | A product requirement for regional write availability or latency |\n\nThese are starting comparisons, not bans. A managed platform or task queue still has costs and limits. Likewise, read replicas do not remove the single writer's failure or latency constraints.\n\nIf the product requirement is still changing, avoid committing to a difficult-to-reverse arrangement before the boundary is understood. Preserve a straightforward path to introduce it later.\n\n## Trace the new failure path\n\nA cache can reduce database reads while creating a second place that serves an old answer. For short links, ask how quickly a disabled unsafe destination stops being returned. Also ask whether the database can handle the traffic when the cache is cold or unavailable.\n\nA queue can move report calculation out of a redirect's wait. It still needs durable acceptance if the event must survive a crash. Returning success after an unawaited in-memory enqueue weakens that promise.\n\nThe first shortener design can record an event in the existing database and calculate reports later. A separate queue becomes worth considering when the shared database path or processing arrangement no longer meets the requirement. Measure the combined path; the lookup-only benchmark did not test it.\n\n![One engineer proposes adding a cache box. A colleague holding a pager asks who will get paged when it fails.](/course-assets/system-design/illustrations/infrastructure-owner.webp)\n\n## Decide who can operate it\n\nAn additional service needs someone who can recognize failure, find the relevant evidence, and recover or disable it safely. Include that work in the comparison even when the vendor offers a free tier.\n\nBefore adopting the component, establish its owner, its failure signal, and the first recovery action. If nobody can investigate it during an incident, simplify the design or build that operating capability before relying on it.\n\nDeferring a component should leave a useful decision record. Save the current workload, the required behavior, the rejected alternative, and the condition for reopening the choice. “Revisit caching if repeated lookups still dominate the missed latency target after query fixes” gives the next engineer something to test.\n\nThe aim is a system whose parts have a clear job and an understood cost. A small design that misses the recovery promise is insufficient; a larger design full of unused mechanisms is harder to maintain. Keep the components that earn their place.\n"
              }
            }
          ]
        },
        {
          "id": "learning-apis-services",
          "number": "02",
          "title": "APIs, services and protocols",
          "summary": "Choose service boundaries and communication patterns, then handle retries and overload.",
          "units": [
            {
              "slug": "api-design-contracts",
              "title": "API design contracts",
              "kind": "lesson",
              "archive": {
                "slug": "api-design-contracts",
                "file": "api-design-contracts.md",
                "title": "API design contracts",
                "displayTitle": "API design contracts",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "api",
                  "contracts"
                ],
                "sources": [
                  "[[wiki/http-rest-grpc]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "https://www.rfc-editor.org/rfc/rfc9110.html",
                  "https://google.aip.dev/158",
                  "https://google.aip.dev/180",
                  "https://docs.stripe.com/api/idempotent_requests"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An API contract defines what a caller can send, what an answer means, and which behavior will survive a server update.",
                  "continuation": "The JSON shape is only part of it."
                }
              }
            },
            {
              "slug": "service-to-service-communication",
              "title": "Service-to-service communication",
              "kind": "lesson",
              "archive": {
                "slug": "service-to-service-communication",
                "file": "service-to-service-communication.md",
                "title": "Service-to-service communication",
                "displayTitle": "Service-to-service communication",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "scaling",
                  "communication"
                ],
                "sources": [
                  "[[wiki/monolith-vs-microservices]]",
                  "[[wiki/task-queue-vs-event-stream]]",
                  "https://grpc.io/docs/what-is-grpc/core-concepts/",
                  "https://grpc.io/docs/guides/deadlines/",
                  "https://d1.awsstatic.com/builderslibrary/pdfs/timeouts-retries-and-backoff-with-jitter.pdf",
                  "https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead",
                  "https://docs.stripe.com/webhooks",
                  "https://www.w3.org/TR/trace-context/",
                  "https://www.rfc-editor.org/rfc/rfc9110.html#name-202-accepted"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "When work crosses a service boundary, the caller has to send a message and interpret what comes back.",
                  "continuation": "The other service can finish its work while the caller sees only a timeout."
                }
              }
            },
            {
              "slug": "http-rest-grpc",
              "title": "HTTP, REST, and gRPC",
              "kind": "lesson",
              "archive": {
                "slug": "http-rest-grpc",
                "file": "http-rest-grpc.md",
                "title": "HTTP, REST, and gRPC",
                "displayTitle": "HTTP, REST, and gRPC",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "scaling",
                  "api",
                  "http"
                ],
                "sources": [
                  "[[wiki/api-design-contracts]]",
                  "https://www.rfc-editor.org/rfc/rfc9110.html",
                  "https://www.rfc-editor.org/rfc/rfc9112.html",
                  "https://www.rfc-editor.org/rfc/rfc9113.html",
                  "https://www.rfc-editor.org/rfc/rfc9114.html",
                  "https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm",
                  "https://grpc.io/docs/what-is-grpc/core-concepts/",
                  "https://grpc.io/docs/platforms/web/basics/",
                  "https://github.com/grpc/grpc-web",
                  "https://protobuf.dev/programming-guides/proto3/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Choosing between a resource-oriented HTTP API and gRPC means choosing how clients express remote operations.",
                  "continuation": "Both can serve internal services or external clients."
                }
              }
            },
            {
              "slug": "tcp-vs-udp",
              "title": "TCP vs UDP",
              "kind": "lesson",
              "archive": {
                "slug": "tcp-vs-udp",
                "file": "tcp-vs-udp.md",
                "title": "TCP vs UDP",
                "displayTitle": "TCP vs UDP",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "ground-floor",
                  "networking"
                ],
                "sources": [
                  "https://www.rfc-editor.org/rfc/rfc9293.html",
                  "https://hpbn.co/building-blocks-of-tcp/",
                  "https://hpbn.co/building-blocks-of-udp/",
                  "https://www.rfc-editor.org/rfc/rfc8085.html",
                  "https://www.rfc-editor.org/rfc/rfc9000.html",
                  "https://www.rfc-editor.org/rfc/rfc793",
                  "https://www.rfc-editor.org/rfc/rfc9114.html",
                  "https://www.rfc-editor.org/rfc/rfc7766.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "TCP and UDP are transport protocols: rules for moving data between applications over an IP network. They differ in how the receiving program gets that data and what happens when some of it goes missing.",
                "mermaidCount": 0,
                "content": "# TCP vs UDP\n\nTCP and UDP are transport protocols: rules for moving data between applications over an IP network. They differ in how the receiving program gets that data and what happens when some of it goes missing.\n\nTCP provides an ordered stream of bytes and retransmits missing data. UDP sends separate messages, called datagrams, without adding delivery or ordering guarantees.\n\n![TCP can deliver writes cat and nap as reads ca and tnap. UDP retains separate cat and nap datagrams when both arrive.](/course-assets/system-design/research-pilot/style-comparison/tcp-editorial.webp)\n\n| Behavior | TCP | UDP |\n|---|---|---|\n| Connection setup | Establishes a connection before the usual data transfer. | No transport handshake. |\n| What the app reads | A byte stream; reads can split or combine messages. | Separate datagrams that arrive. |\n| Missing data | Retransmits; later bytes wait behind a gap. | No automatic retransmission. |\n\nIP, the Internet Protocol, routes packets: chunks of data with addressing information. Packets can be lost, duplicated or delivered out of order. The transport protocol determines how much of that the app has to handle.\n\n## TCP message boundaries\n\nTCP keeps bytes in order, but it doesn't preserve the boundaries between the sender's writes. This matters when your program needs to recognize a complete message.\n\nFor example, a server writes `cat` and then `nap`. TCP carries the six bytes `catnap`. The client could read them as `cat` and `nap`, as `ca` and `tnap`, or all at once.\n\nThe application protocol needs a rule for finding the end of each message. This is called **framing**. A simple text protocol could put a newline after each word.\n\nThe receiver collects bytes until it reaches that newline, then processes the completed word. Another protocol might put a message length before the message contents.\n\nHTTP libraries handle their protocol's framing for you. If you work directly with TCP, a single read is not proof that the whole message has arrived.\n\nUDP preserves the boundary of each datagram. Sending `cat` in one and `nap` in another gives the receiver two distinguishable messages if both arrive. Their arrival order can differ from their send order.\n\n## TCP loss recovery\n\nTCP numbers bytes and uses acknowledgements, or ACKs, to track what has arrived. An ACK identifies the next byte the receiver expects after the continuous sequence it has already received.\n\nThe sender keeps unacknowledged data. It can resend that data when acknowledgements or a timeout indicate possible loss.\n\nConsider `catnap` again. Number the bytes from 1 to 6 for this example, and split them into packets carrying `ca`, `tn` and `ap`. The packet containing `tn` is lost.\n\n| Event | Bytes available to the app so far | Next expected byte |\n|---|---|---|\n| `ca` arrives | `ca` | 3 |\n| `ap` arrives, but `tn` is missing | `ca` | 3 |\n| Retransmitted `tn` arrives | `catnap` | 7 |\n\nThe receiver holds `ap` until the gap is filled. This is **head-of-line blocking**: missing earlier bytes prevent later bytes from being delivered to the application.\n\nThe byte positions are illustrative; the connection is already open. ACK 7 means all six bytes have arrived. The receiving program can still read them in smaller chunks.\n\nRetransmission doesn't promise a deadline. If the connection fails before recovery, the transfer remains incomplete.\n\nAn ACK also doesn't prove that the server program processed the data. The server's TCP implementation can acknowledge a request before the application reads it.\n\nFor a save operation, the client needs an application response confirming the save. If that response is lost, the client can still be unsure whether the save succeeded.\n\n![A TCP acknowledgment confirms receipt of bytes. In this example the bytes are in the server buffer and the application has not saved them yet.](/course-assets/system-design/research-pilot/style-comparison/tcp-sketch.webp)\n\n## Connection setup and traffic control\n\nA usual new TCP connection starts with three messages: SYN, SYN-ACK and ACK. The two ends establish their starting sequence numbers and connection settings during this handshake.\n\nThe client normally waits one round trip before sending application data. Reusing an open connection avoids repeating this setup. Packet travel time and waiting in network queues still apply to either protocol.\n\nTCP also limits how much data is in flight. **Flow control** respects the receiver's available buffer space. **Congestion control** adjusts sending to conditions on the network path.\n\nThey address different bottlenecks. A receiving machine can have plenty of memory while the network link leading to it is overloaded.\n\n## When skipping a message is acceptable\n\nA game might send a player's complete position in updates numbered 501, 502 and 503. If 502 is lost, the game can use 503 without waiting. If 502 arrives later, the game can discard it.\n\nThe update numbers and the rule for ignoring older positions belong to the game protocol. UDP doesn't supply them.\n\nThis only works if each update contains enough information on its own. If 503 describes movement since 502, losing 502 leaves the receiver without the position needed to apply that change.\n\nA voice call has a similar timing constraint: a sound fragment arriving after its playback time may no longer be useful. A protocol over UDP can skip it and continue.\n\nOther traffic in the same product may need reliable delivery. A chat message or purchase can't be treated like an outdated position update.\n\nUDP applications also need traffic control. Retrying every lost message immediately can overload a link that is already dropping packets.\n\n## HTTP/3 and QUIC\n\nUsing UDP doesn't necessarily mean giving up reliability. QUIC implements encrypted connections, congestion control and reliable byte streams over UDP. HTTP/3 uses QUIC.\n\nQUIC orders bytes separately in each stream. With HTTP/2 over one TCP connection, a gap in the shared TCP stream can delay both an image and a stylesheet.\n\nWith HTTP/3, received stylesheet bytes can continue along their stream while missing image bytes are recovered. If a lost packet contains data for both streams, both can be affected. They also share congestion control.\n\nFor an ordinary web API, use HTTPS and let its transport implementation handle these details. The [[wiki/http-rest-grpc|HTTP lesson]] explains the protocol versions further.\n\nDatabase clients also commonly use TCP. DNS uses both UDP and TCP, including retrying a truncated UDP answer over TCP. A familiar application name does not always imply one transport.\n\nBuilding directly on UDP makes sense when you need control over which messages can be skipped or recovered. You also take responsibility for the delivery behavior and traffic control your application requires.\n"
              }
            },
            {
              "slug": "api-gateway-vs-load-balancer",
              "title": "API gateway vs load balancer",
              "kind": "lesson",
              "archive": {
                "slug": "api-gateway-vs-load-balancer",
                "file": "api-gateway-vs-load-balancer.md",
                "title": "API gateway vs load balancer",
                "displayTitle": "API gateway vs load balancer",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "api",
                  "gateway"
                ],
                "sources": [
                  "[[wiki/load-balancers]]",
                  "[[wiki/monolith-vs-microservices]]",
                  "https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway",
                  "https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig",
                  "https://www.rfc-editor.org/rfc/rfc7239.html#section-8.1"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A request arrives at the public address for your application.",
                  "continuation": "Two decisions follow: which service handles this operation, and which running copy of that service should receive it?"
                }
              }
            },
            {
              "slug": "load-balancers",
              "title": "Load balancers",
              "kind": "lesson",
              "archive": {
                "slug": "load-balancers",
                "file": "load-balancers.md",
                "title": "Load balancers",
                "displayTitle": "Load balancers",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "scaling",
                  "load-balancing"
                ],
                "sources": [
                  "[[wiki/horizontal-vs-vertical-scaling]]",
                  "https://nginx.org/en/docs/http/ngx_http_upstream_module.html",
                  "https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_next_upstream",
                  "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/health_checking",
                  "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/draining",
                  "https://www.rfc-editor.org/rfc/rfc9113.html#section-5"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A visitor should be able to open a short link without knowing which application copy is running today.",
                  "continuation": "If app A stops taking new work, the next request needs somewhere else to go."
                }
              }
            },
            {
              "slug": "consistent-hashing-load-balancing",
              "title": "Consistent-hashing load balancing",
              "kind": "lesson",
              "archive": {
                "slug": "consistent-hashing-load-balancing",
                "file": "consistent-hashing-load-balancing.md",
                "title": "Consistent-hashing load balancing",
                "displayTitle": "Consistent-hashing load balancing",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "load-balancing",
                  "hashing"
                ],
                "sources": [
                  "[[wiki/consistent-hashing]]",
                  "[[wiki/load-balancers]]",
                  "[[wiki/hot-partitions]]",
                  "https://nginx.org/en/docs/http/ngx_http_upstream_module.html#hash",
                  "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers",
                  "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A request reaches a healthy application, but the useful cached answer is in another application's memory.",
                  "continuation": "Sending the next identical request somewhere else repeats work that a stable destination might share."
                }
              }
            },
            {
              "slug": "event-contracts",
              "title": "Event contracts",
              "kind": "lesson",
              "archive": {
                "slug": "event-contracts",
                "file": "event-contracts.md",
                "title": "Event contracts",
                "displayTitle": "Event contracts",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "events",
                  "contracts"
                ],
                "sources": [
                  "[[wiki/api-design-contracts]]",
                  "[[wiki/schema-evolution]]",
                  "[[wiki/raw-events-vs-derived-analytics]]",
                  "https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md",
                  "https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html",
                  "https://docs.stripe.com/webhooks"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A report rebuilt tomorrow may read a redirect record written before today's application update.",
                  "continuation": "The old program is gone, but its record still has to make sense."
                }
              }
            },
            {
              "slug": "retries-timeouts-idempotency",
              "title": "Retries, timeouts, and idempotency",
              "kind": "lesson",
              "archive": {
                "slug": "retries-timeouts-idempotency",
                "file": "retries-timeouts-idempotency.md",
                "title": "Retries, timeouts, and idempotency",
                "displayTitle": "Retries, timeouts, and idempotency",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "reliability",
                  "retries"
                ],
                "sources": [
                  "[[wiki/service-to-service-communication]]",
                  "[[wiki/api-design-contracts]]",
                  "https://grpc.io/docs/guides/deadlines/",
                  "https://docs.stripe.com/api/idempotent_requests",
                  "https://d1.awsstatic.com/builderslibrary/pdfs/timeouts-retries-and-backoff-with-jitter.pdf",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "The server can finish creating your short link while your screen still says the request failed.",
                  "continuation": "Clicking again may recover the answer, or create another link."
                }
              }
            },
            {
              "slug": "batching",
              "title": "Batching",
              "kind": "lesson",
              "archive": {
                "slug": "batching",
                "file": "batching.md",
                "title": "Batching",
                "displayTitle": "Batching",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "batching",
                  "transactions"
                ],
                "sources": [
                  "[[wiki/backpressure]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://kafka.apache.org/41/configuration/producer-configs/",
                  "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessageBatch.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Committing a hundred records separately repeats transaction work a hundred times.",
                  "continuation": "Grouping them can share that cost, but the first record may wait for the group to form."
                }
              }
            },
            {
              "slug": "backpressure",
              "title": "Backpressure",
              "kind": "lesson",
              "archive": {
                "slug": "backpressure",
                "file": "backpressure.md",
                "title": "Backpressure",
                "displayTitle": "Backpressure",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "queues",
                  "reliability"
                ],
                "sources": [
                  "[[wiki/concurrency-vs-parallelism]]",
                  "[[wiki/load-shedding]]",
                  "https://docs.python.org/3/library/asyncio-queue.html",
                  "https://nodejs.org/en/learn/modules/backpressuring-in-streams",
                  "https://www.rfc-editor.org/rfc/rfc9293.html#section-3.8.6"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A worker can be healthy and still fall behind.",
                  "continuation": "Requests arrive while it is busy, so the program puts them somewhere to wait."
                }
              }
            },
            {
              "slug": "tail-latency",
              "title": "Tail latency",
              "kind": "lesson",
              "archive": {
                "slug": "tail-latency",
                "file": "tail-latency.md",
                "title": "Tail latency",
                "displayTitle": "Tail latency",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "latency",
                  "measurement"
                ],
                "sources": [
                  "[[wiki/non-functional-requirements]]",
                  "[[wiki/load-shedding]]",
                  "https://sre.google/sre-book/monitoring-distributed-systems/",
                  "https://www.barroso.org/publications/TheTailAtScale.pdf",
                  "https://docs.python.org/3/library/sqlite3.html",
                  "https://prometheus.io/docs/practices/histograms/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Most requests can finish quickly while a small group of callers waits far too long.",
                  "continuation": "The average blends those experiences together."
                }
              }
            },
            {
              "slug": "load-shedding",
              "title": "Load shedding",
              "kind": "lesson",
              "archive": {
                "slug": "load-shedding",
                "file": "load-shedding.md",
                "title": "Load shedding",
                "displayTitle": "Load shedding",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "reliability",
                  "admission"
                ],
                "sources": [
                  "[[wiki/backpressure]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "[[wiki/slos-and-error-budgets]]",
                  "https://docs.python.org/3/library/asyncio-queue.html",
                  "https://www.rfc-editor.org/rfc/rfc9110.html#name-503-service-unavailable",
                  "https://www.rfc-editor.org/rfc/rfc6585.html#section-4",
                  "https://sre.google/sre-book/handling-overload/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "The queue is full, and the next caller cannot wait long enough for room.",
                  "continuation": "Holding that request anyway spends memory and delays a failure the caller is already approaching."
                }
              }
            }
          ]
        },
        {
          "id": "learning-data-sql",
          "number": "03",
          "title": "Data modeling and SQL",
          "summary": "Study data modeling and SQL.",
          "units": [
            {
              "slug": "relational-database-design",
              "title": "Relational database design",
              "kind": "lesson",
              "archive": {
                "slug": "relational-database-design",
                "file": "relational-database-design.md",
                "title": "Relational database design",
                "displayTitle": "Relational database design",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "relational-databases",
                  "data-modeling"
                ],
                "sources": [
                  "[[wiki/extensible-data-modeling]]",
                  "[[wiki/database-indexing]]",
                  "https://www.postgresql.org/docs/16/ddl-constraints.html",
                  "https://learn.microsoft.com/en-us/previous-versions/troubleshoot/microsoft-365/microsoft-365-apps/access/database-normalization-description",
                  "https://www.postgresql.org/docs/16/rules-materializedviews.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Relational design decides which rows own the facts, how those rows relate, and which states the database should refuse.",
                  "continuation": "A useful schema makes a change in the product correspond to a clear change in the data, without leaving several conflicting copies to reconcile."
                }
              }
            },
            {
              "slug": "sql-backed-key-value-store",
              "title": "Design: a key-value store on SQL",
              "kind": "design",
              "archive": {
                "slug": "sql-backed-key-value-store",
                "file": "sql-backed-key-value-store.md",
                "title": "SQL-backed key-value store",
                "displayTitle": "SQL-backed key-value store",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "databases",
                  "key-value"
                ],
                "sources": [
                  "[[wiki/repository-pattern]]",
                  "[[wiki/database-indexing]]",
                  "https://www.postgresql.org/docs/16/sql-insert.html",
                  "https://www.postgresql.org/docs/16/functions-sequence.html",
                  "https://www.postgresql.org/docs/16/functions-datetime.html",
                  "https://www.postgresql.org/docs/16/transaction-iso.html",
                  "https://www.postgresql.org/docs/16/datatype-json.html",
                  "https://www.postgresql.org/docs/16/sql-select.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A relational table can store values that callers retrieve by an exact key.",
                  "continuation": "Configuration, feature flags and small saved drafts often need that shape."
                }
              }
            },
            {
              "slug": "database-indexing",
              "title": "Database indexing",
              "kind": "lesson",
              "archive": {
                "slug": "database-indexing",
                "file": "database-indexing.md",
                "title": "Database indexing",
                "displayTitle": "Database indexing",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "relational-databases",
                  "indexing"
                ],
                "sources": [
                  "[[wiki/relational-database-design]]",
                  "[[wiki/query-planning]]",
                  "https://www.postgresql.org/docs/16/indexes-multicolumn.html",
                  "https://www.postgresql.org/docs/16/indexes-index-only-scans.html",
                  "https://www.postgresql.org/docs/16/indexes-partial.html",
                  "https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html",
                  "https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An index maintains another path to stored rows so a query can avoid inspecting everything.",
                  "continuation": "That path costs space and write work."
                }
              }
            },
            {
              "slug": "b-tree",
              "title": "B-tree",
              "kind": "lesson",
              "archive": {
                "slug": "b-tree",
                "file": "b-tree.md",
                "title": "B-tree",
                "displayTitle": "B-tree",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "relational-databases",
                  "indexing"
                ],
                "sources": [
                  "[[wiki/database-indexing]]",
                  "https://www.postgresql.org/docs/16/btree-implementation.html",
                  "https://www.postgresql.org/docs/16/indexes-types.html",
                  "https://www.postgresql.org/docs/16/sql-createindex.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A B-tree keeps keys ordered while giving a lookup a short route to the relevant range.",
                  "continuation": "Its nodes hold several keys and child pointers, so one node can rule out many parts of the index."
                }
              }
            },
            {
              "slug": "query-planning",
              "title": "Query planning",
              "kind": "lesson",
              "archive": {
                "slug": "query-planning",
                "file": "query-planning.md",
                "title": "Query planning",
                "displayTitle": "Query planning",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "relational-databases",
                  "query-planning"
                ],
                "sources": [
                  "[[wiki/database-indexing]]",
                  "[[wiki/b-tree]]",
                  "https://www.postgresql.org/docs/16/using-explain.html",
                  "https://www.postgresql.org/docs/16/planner-stats.html",
                  "https://www.postgresql.org/docs/16/runtime-config-resource.html",
                  "https://www.postgresql.org/docs/16/parallel-plans.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Query planning chooses how a database will produce a SQL result: where to read, when to filter, how to join, and whether to sort or reuse an existing order.",
                  "continuation": "An index adds an option."
                }
              }
            },
            {
              "slug": "database-locking-and-isolation",
              "title": "Database locking and isolation",
              "kind": "lesson",
              "archive": {
                "slug": "database-locking-and-isolation",
                "file": "database-locking-and-isolation.md",
                "title": "Database locking and isolation",
                "displayTitle": "Database locking and isolation",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "relational-databases",
                  "transactions"
                ],
                "sources": [
                  "[[wiki/query-planning]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "https://www.postgresql.org/docs/16/transaction-iso.html",
                  "https://www.postgresql.org/docs/16/explicit-locking.html",
                  "https://www.postgresql.org/docs/16/sql-select.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Isolation controls how concurrent transactions may affect one another.",
                  "continuation": "Locks are one way to coordinate conflicting work."
                }
              }
            },
            {
              "slug": "mvcc",
              "title": "MVCC",
              "kind": "lesson",
              "archive": {
                "slug": "mvcc",
                "file": "mvcc.md",
                "title": "MVCC",
                "displayTitle": "MVCC",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "relational-databases",
                  "transactions"
                ],
                "sources": [
                  "[[wiki/database-locking-and-isolation]]",
                  "https://www.postgresql.org/docs/16/mvcc-intro.html",
                  "https://www.postgresql.org/docs/16/transaction-iso.html",
                  "https://www.postgresql.org/docs/16/routine-vacuuming.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Multi-version concurrency control, or MVCC, keeps row versions so a reader can use the version visible to its snapshot while another transaction writes a newer one.",
                  "continuation": "The database uses transaction state to decide visibility; it does not simply return the most recently written bytes."
                }
              }
            },
            {
              "slug": "database-wal-and-recovery",
              "title": "Database WAL and recovery",
              "kind": "lesson",
              "archive": {
                "slug": "database-wal-and-recovery",
                "file": "database-wal-and-recovery.md",
                "title": "Database WAL and recovery",
                "displayTitle": "Database WAL and recovery",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "relational-databases",
                  "recovery"
                ],
                "sources": [
                  "[[wiki/mvcc]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "https://www.postgresql.org/docs/16/wal-intro.html",
                  "https://www.postgresql.org/docs/16/wal-configuration.html",
                  "https://www.postgresql.org/docs/16/runtime-config-wal.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A database acknowledges a change, then stops before every modified table page reaches storage.",
                  "continuation": "How can the change survive?"
                }
              }
            },
            {
              "slug": "database-ticket-servers",
              "title": "Database ticket servers",
              "kind": "lesson",
              "archive": {
                "slug": "database-ticket-servers",
                "file": "database-ticket-servers.md",
                "title": "Database ticket servers",
                "displayTitle": "Database ticket servers",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "identifiers",
                  "databases"
                ],
                "sources": [
                  "https://code.flickr.net/2010/02/08/ticket-servers-distributed-unique-primary-keys-on-the-cheap/",
                  "https://tech.meituan.com/2017/04/21/mt-leaf.html",
                  "https://dev.mysql.com/doc/refman/8.4/en/example-auto-increment.html",
                  "https://www.sqlite.org/lang_transaction.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "A database ticket server allocates unique IDs for other parts of an application. It returns a number; the application uses that number when it stores a record in its own database.",
                "mermaidCount": 0,
                "content": "# Database ticket servers\n\nA database ticket server allocates unique IDs for other parts of an application. It returns a number; the application uses that number when it stores a record in its own database.\n\nThis is useful when data is spread across several databases and their records need unique numeric IDs across all of them. Each database's local auto-increment counter cannot provide that guarantee on its own.\n\nWe'll work through three parts:\n\n- Why Flickr needed an ID allocator and how its MySQL table issued IDs.\n- How reserving several IDs per database call works, with a small SQLite exercise.\n- What happens to unused IDs after a crash, and how that affects range size.\n\n![A shared allocator supplies ID 42 to one application and ID 43 to another. The applications store the photos separately.](/course-assets/system-design/research-pilot/style-comparison/ticket-editorial.webp)\n\n## Why a separate ID allocator?\n\nIn Flickr's 2010 system, photos were spread across many databases. The company needed to move them between databases without primary-key collisions.\n\nTwo independent databases can both assign photo ID 42. Each ID is unique within its own table, but combining or moving those records creates a collision.\n\nA ticket server moves ID generation into a shared service. The application asks for an ID before storing the photo. The allocator keeps track of IDs it has issued; it doesn't store the photo itself.\n\n[[wiki/uuid-objectid-and-snowflake|UUIDs]] and [[wiki/snowflake-id-design|Snowflake IDs]] are alternatives. A ticket server is useful when you want numeric IDs allocated through a database you already know how to operate.\n\nThe IDs only need to be unique within the chosen scope. Photos can share one sequence and accounts another. Photo 42 and account 42 are different records, identified by both their type and their number.\n\n## How Flickr's ticket table worked\n\nIn Flickr's implementation, asking for an ID meant updating a small MySQL table. It had an auto-incrementing ID and a unique marker column called `stub`. Each allocation supplied the same marker.\n\nMySQL's `REPLACE` operation removed the row with that marker and inserted a replacement with a new ID. The table held one row while the counter advanced.\n\nThe application then called `LAST_INSERT_ID()` on the same database connection to retrieve that ID. Connection pools matter here: both statements must use the same connection because the value is connection-local.\n\nTo avoid relying on one ticket server, Flickr used two. One allocated odd IDs and the other even IDs. They couldn't issue the same ID, even if one server allocated more than the other.\n\nA replacement server must preserve its counter position as well as its odd/even role. Restarting the odd sequence at 1 would reuse old IDs. Restoring an old backup can cause the same problem.\n\n## Allocating several IDs at once\n\nSo far, every new record needs a network call to the allocator. Reserving several IDs in one call reduces that traffic: a worker can issue IDs locally until its range runs out.\n\nMeituan's 2017 Leaf-segment design does this with a shared counter. The database records the highest reserved ID; each worker tracks the next unused ID in its own range.\n\nWith a range size of three, starting from zero:\n\n| Reservation | IDs the worker receives | Highest reserved ID |\n|---|---|---|\n| Worker A | 1, 2, 3 | 3 |\n| Worker B | 4, 5, 6 | 6 |\n| Next reservation | 7, 8, 9 | 9 |\n\nReading the old boundary and advancing it must be one protected transaction. Otherwise, two workers could both read zero and claim 1 through 3.\n\nThe reservation must commit before the worker issues any of its IDs. This is where [[wiki/database-locking-and-isolation|locking and isolation]] apply to the allocator.\n\nTo try the reservation yourself, run this small SQLite example. It reserves two ranges of three IDs, just like the first two rows in the table.\n\nIt uses a counter row rather than MySQL's auto-increment mechanism. The database exists only in memory and is discarded when the command exits.\n\n```bash title=\"terminal\"\nsqlite3 -header :memory: <<'SQL'\nCREATE TABLE tickets (name TEXT PRIMARY KEY, high INTEGER NOT NULL);\nINSERT INTO tickets VALUES ('photos', 0);\nBEGIN IMMEDIATE;\nUPDATE tickets SET high = high + 3 WHERE name = 'photos'\n  RETURNING high - 2 AS first_id, high AS last_id;\nCOMMIT;\nBEGIN IMMEDIATE;\nUPDATE tickets SET high = high + 3 WHERE name = 'photos'\n  RETURNING high - 2 AS first_id, high AS last_id;\nCOMMIT;\nSQL\n```\n```output\nfirst_id|last_id\n1|3\nfirst_id|last_id\n4|6\n```\n\nThis output was captured with SQLite 3.51.0 on 2026-09-15. The `RETURNING` clause requires SQLite 3.35 or newer.\n\n`BEGIN IMMEDIATE` starts a write transaction. Another writer to the same database must wait or receive a busy error. This example uses one connection to show the reservation arithmetic.\n\nThe SQL client prints `RETURNING` values before `COMMIT`. A real allocator must wait until the commit succeeds before returning the range to its caller.\n\n## Unused IDs after a crash\n\nReserving a range and using it happen separately. A worker can stop after the reservation commits, leaving some IDs unused.\n\n**A reserves 1 through 3, uses 1 and crashes. B owns 4 through 6 and hasn't used any yet. Which ID should B use next? Can A's replacement reuse 2?**\n\nB uses 4, the first ID in its range. A's replacement reserves a fresh range starting at 7. It discards 2 and 3 because it cannot safely assume that A never issued them before crashing.\n\nGaps are expected. The counter records reservations, so it can advance even when no corresponding photo is stored.\n\nID order also doesn't give creation order. A worker holding ID 1 can pause while another worker stores a photo with ID 4, even when both obtained their ranges from the same allocator.\n\n![Photo 4 is saved first while the worker with ID 1 pauses. Photo 1 is saved later, so numeric ID order does not establish creation order.](/course-assets/system-design/research-pilot/style-comparison/ticket-sketch.webp)\n\nA lost allocator reply has a similar result: the caller can request another range and abandon the uncertain one. It uses more numbers but avoids reissuing them.\n\nThis doesn't prevent duplicate uploads. Retrying the same photo upload may obtain a new ID and store a second photo. That requires separate [[wiki/retries-timeouts-idempotency|idempotency handling]].\n\n## Choosing a range size\n\nLarger ranges can leave more unused IDs when a worker stops. In return, workers call the database less often and can continue through an allocator outage until their ranges run out.\n\nLeaf also fetches the next range before the current one is exhausted. This reduces the chance that a request has to wait for a refill.\n\nIf one database already generates all your IDs, a ticket service adds another dependency without solving a current collision problem. Consider it when independent writers need a shared numeric ID space.\n\nMonitor allocation failures and remaining integer space. Sequential IDs also require normal authorization checks: guessing another record's number must not grant access to it.\n\nFor a larger exercise, the [Python allocation replay](/course-assets/system-design/m09-ticket-allocator.py) extends the SQLite example with two worker processes and a deliberately lost reply.\n"
              }
            },
            {
              "slug": "relational-database-scaling",
              "title": "Relational database scaling",
              "kind": "lesson",
              "archive": {
                "slug": "relational-database-scaling",
                "file": "relational-database-scaling.md",
                "title": "Relational database scaling",
                "displayTitle": "Relational database scaling",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "relational-databases",
                  "scaling"
                ],
                "sources": [
                  "https://www.postgresql.org/docs/16/monitoring-stats.html",
                  "https://www.pgbouncer.org/features.html",
                  "https://www.postgresql.org/docs/16/warm-standby.html",
                  "https://www.postgresql.org/docs/16/ddl-partitioning.html",
                  "https://www.postgresql.org/docs/16/different-replication-solutions.html",
                  "https://www.postgresql.org/docs/16/rules-materializedviews.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Adding application workers can make a busy database slower: more requests compete for the same CPU, storage or locks.",
                  "continuation": "Start by finding which operation is falling behind and which resource it waits for."
                }
              }
            },
            {
              "slug": "online-indexing",
              "title": "Online indexing",
              "kind": "lesson",
              "archive": {
                "slug": "online-indexing",
                "file": "online-indexing.md",
                "title": "Online indexing",
                "displayTitle": "Online indexing",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "relational-databases",
                  "migrations"
                ],
                "sources": [
                  "[[wiki/database-indexing]]",
                  "[[wiki/relational-database-scaling]]",
                  "https://www.postgresql.org/docs/16/sql-createindex.html",
                  "https://www.postgresql.org/docs/16/progress-reporting.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An index can make the catalog query cheaper once it exists.",
                  "continuation": "Building it is another workload: PostgreSQL has to read the table while merchants keep changing products."
                }
              }
            },
            {
              "slug": "schema-evolution",
              "title": "Schema evolution",
              "kind": "lesson",
              "archive": {
                "slug": "schema-evolution",
                "file": "schema-evolution.md",
                "title": "Schema evolution",
                "displayTitle": "Schema evolution",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "relational-databases",
                  "migrations"
                ],
                "sources": [
                  "[[wiki/extensible-data-modeling]]",
                  "[[wiki/online-indexing]]",
                  "[[wiki/api-design-contracts]]",
                  "https://www.postgresql.org/docs/16/sql-altertable.html",
                  "https://www.postgresql.org/docs/16/sql-createtrigger.html",
                  "https://martinfowler.com/bliki/ParallelChange.html",
                  "[[wiki/event-contracts]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A column rename can work in a test and break the running application.",
                  "continuation": "Old processes still send the old name while new processes expect its replacement."
                }
              }
            },
            {
              "slug": "soft-delete",
              "title": "Soft delete",
              "kind": "lesson",
              "archive": {
                "slug": "soft-delete",
                "file": "soft-delete.md",
                "title": "Soft delete",
                "displayTitle": "Soft delete",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "databases",
                  "data-retention"
                ],
                "sources": [
                  "https://www.postgresql.org/docs/16/indexes-partial.html",
                  "https://www.postgresql.org/docs/16/ddl-constraints.html",
                  "https://www.postgresql.org/docs/16/ddl-rowsecurity.html",
                  "[[wiki/data-retention-and-deletion]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A user deletes a project, then asks to restore it.",
                  "continuation": "If the product promises undo, it needs to retain enough state to bring that project back."
                }
              }
            }
          ]
        },
        {
          "id": "learning-nosql-partitioning",
          "number": "04",
          "title": "NoSQL, partitioning and IDs",
          "summary": "Study noSQL, partitioning and IDs.",
          "units": [
            {
              "slug": "nosql-decision-boundaries",
              "title": "NoSQL decision boundaries",
              "kind": "lesson",
              "archive": {
                "slug": "nosql-decision-boundaries",
                "file": "nosql-decision-boundaries.md",
                "title": "NoSQL decision boundaries",
                "displayTitle": "NoSQL decision boundaries",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "databases",
                  "data-modeling"
                ],
                "sources": [
                  "[[wiki/relational-database-design]]",
                  "[[wiki/ecommerce-product-listing-system-design]]",
                  "https://www.mongodb.com/docs/manual/core/write-operations-atomicity/",
                  "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html",
                  "https://cassandra.apache.org/doc/stable/cassandra/developing/data-modeling/intro.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A catalog page reads a product and its specifications together.",
                  "continuation": "Checkout changes inventory and creates an order."
                }
              }
            },
            {
              "slug": "document-vs-key-value-stores",
              "title": "Document vs key-value stores",
              "kind": "lesson",
              "archive": {
                "slug": "document-vs-key-value-stores",
                "file": "document-vs-key-value-stores.md",
                "title": "Document vs key-value stores",
                "displayTitle": "Document vs key-value stores",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "databases",
                  "documents"
                ],
                "sources": [
                  "[[wiki/nosql-decision-boundaries]]",
                  "https://redis.io/docs/latest/develop/data-types/strings/",
                  "https://www.mongodb.com/docs/manual/data-modeling/embedding/",
                  "https://www.mongodb.com/docs/manual/data-modeling/referencing/",
                  "https://www.mongodb.com/docs/manual/core/write-operations-atomicity/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A product page asks for product p7.",
                  "continuation": "A filter page asks for all blue mugs."
                }
              }
            },
            {
              "slug": "columnar-vs-wide-column-stores",
              "title": "Columnar vs wide-column stores",
              "kind": "lesson",
              "archive": {
                "slug": "columnar-vs-wide-column-stores",
                "file": "columnar-vs-wide-column-stores.md",
                "title": "Columnar vs wide-column stores",
                "displayTitle": "Columnar vs wide-column stores",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "databases",
                  "analytics"
                ],
                "sources": [
                  "[[wiki/document-vs-key-value-stores]]",
                  "https://duckdb.org/docs/current/data/parquet/overview",
                  "https://cassandra.apache.org/doc/stable/cassandra/developing/data-modeling/intro.html",
                  "https://cassandra.apache.org/doc/stable/cassandra/developing/cql/ddl.html",
                  "https://docs.cloud.google.com/bigtable/docs/overview"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A report asks for total bytes across every channel.",
                  "continuation": "A history panel asks for recent events in channel 7."
                }
              }
            },
            {
              "slug": "graph-database-decision-boundary",
              "title": "Graph database decision boundary",
              "kind": "lesson",
              "archive": {
                "slug": "graph-database-decision-boundary",
                "file": "graph-database-decision-boundary.md",
                "title": "Graph database decision boundary",
                "displayTitle": "Graph database decision boundary",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "databases",
                  "graphs"
                ],
                "sources": [
                  "[[wiki/relational-database-design]]",
                  "https://www.postgresql.org/docs/16/queries-with.html",
                  "https://www.sqlite.org/lang_with.html",
                  "https://neo4j.com/docs/cypher-manual/current/patterns/variable-length-paths/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Checking whether Ada follows Bo needs one relationship lookup.",
                  "continuation": "Finding a path from Ada to Di may require following several relationships."
                }
              }
            },
            {
              "slug": "sharding-and-partitioning",
              "title": "Sharding and partitioning",
              "kind": "lesson",
              "archive": {
                "slug": "sharding-and-partitioning",
                "file": "sharding-and-partitioning.md",
                "title": "Sharding and partitioning",
                "displayTitle": "Sharding and partitioning",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "databases",
                  "partitioning"
                ],
                "sources": [
                  "[[wiki/relational-database-scaling]]",
                  "https://www.postgresql.org/docs/16/ddl-partitioning.html",
                  "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html",
                  "https://www.mongodb.com/docs/manual/core/sharding-balancer-administration/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Sharding divides stored data across independently serving nodes.",
                  "continuation": "A request that knows where its data lives can contact the right shard directly."
                }
              }
            },
            {
              "slug": "hot-partitions",
              "title": "Hot partitions",
              "kind": "lesson",
              "archive": {
                "slug": "hot-partitions",
                "file": "hot-partitions.md",
                "title": "Hot partitions",
                "displayTitle": "Hot partitions",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "partitioning",
                  "overload"
                ],
                "sources": [
                  "[[wiki/sharding-and-partitioning]]",
                  "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html",
                  "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-sharding.html",
                  "https://docs.cloud.google.com/bigtable/docs/schema-design",
                  "https://pkg.go.dev/golang.org/x/sync/singleflight"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A hot partition receives more work than its serving resources can comfortably handle.",
                  "continuation": "Equal numbers of stored keys do not prevent it: one viral post, large tenant or busy time range can dominate the traffic."
                }
              }
            },
            {
              "slug": "consistent-hashing",
              "title": "Consistent hashing",
              "kind": "lesson",
              "archive": {
                "slug": "consistent-hashing",
                "file": "consistent-hashing.md",
                "title": "Consistent hashing",
                "displayTitle": "Consistent hashing",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "partitioning",
                  "hashing"
                ],
                "sources": [
                  "[[wiki/sharding-and-partitioning]]",
                  "https://people.csail.mit.edu/karger/Papers/web.pdf",
                  "https://www.allthingsdistributed.com/2007/10/amazons_dynamo.html",
                  "https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Consistent hashing assigns keys to owners while limiting which assignments change when owners join or leave.",
                  "continuation": "For a cache, unnecessary reassignment creates misses."
                }
              }
            },
            {
              "slug": "distributed-id-generation",
              "title": "Distributed ID generation",
              "kind": "lesson",
              "archive": {
                "slug": "distributed-id-generation",
                "file": "distributed-id-generation.md",
                "title": "Distributed ID generation",
                "displayTitle": "Distributed ID generation",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "identifiers",
                  "correctness"
                ],
                "sources": [
                  "[[wiki/sharding-and-partitioning]]",
                  "[[wiki/database-ticket-servers]]",
                  "https://www.rfc-editor.org/rfc/rfc9562.html",
                  "https://www.postgresql.org/docs/16/functions-sequence.html",
                  "https://code.flickr.net/2010/02/08/ticket-servers-distributed-unique-primary-keys-on-the-cheap/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Distributed ID generation lets several writers create records that can later be distinguished in one shared system.",
                  "continuation": "The writers need an allocation rule even if they store their records on separate shards."
                }
              }
            },
            {
              "slug": "uuid-objectid-and-snowflake",
              "title": "UUID, ObjectId, and Snowflake",
              "kind": "lesson",
              "archive": {
                "slug": "uuid-objectid-and-snowflake",
                "file": "uuid-objectid-and-snowflake.md",
                "title": "UUID, ObjectId, and Snowflake",
                "displayTitle": "UUID, ObjectId, and Snowflake",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "identifiers",
                  "data-modeling"
                ],
                "sources": [
                  "[[wiki/distributed-id-generation]]",
                  "https://www.rfc-editor.org/rfc/rfc9562.html",
                  "https://www.mongodb.com/docs/manual/reference/bson-types/#objectid",
                  "https://raw.githubusercontent.com/twitter-archive/snowflake/snowflake-2010/src/main/scala/com/twitter/service/snowflake/IdWorker.scala"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "UUID, ObjectId and Snowflake-style IDs encode identity in different ways.",
                  "continuation": "Their size, time fields and generation rules affect how writers create them and how databases store them."
                }
              }
            },
            {
              "slug": "snowflake-id-design",
              "title": "Snowflake ID design",
              "kind": "lesson",
              "archive": {
                "slug": "snowflake-id-design",
                "file": "snowflake-id-design.md",
                "title": "Snowflake ID design",
                "displayTitle": "Snowflake ID design",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "identifiers",
                  "clocks"
                ],
                "sources": [
                  "[[wiki/uuid-objectid-and-snowflake]]",
                  "[[wiki/distributed-id-generation]]",
                  "https://raw.githubusercontent.com/twitter-archive/snowflake/snowflake-2010/src/main/scala/com/twitter/service/snowflake/IdWorker.scala",
                  "https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-number.max_safe_integer",
                  "https://www.rfc-editor.org/rfc/rfc9562.html#section-6.3"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A Snowflake-style generator packs time, a worker identity and a sequence into one integer.",
                  "continuation": "Assigned workers can generate locally, while the time prefix makes their values roughly sortable by generation time."
                }
              }
            },
            {
              "slug": "clock-skew-and-id-ordering",
              "title": "Clock skew and ID ordering",
              "kind": "lesson",
              "archive": {
                "slug": "clock-skew-and-id-ordering",
                "file": "clock-skew-and-id-ordering.md",
                "title": "Clock skew and ID ordering",
                "displayTitle": "Clock skew and ID ordering",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "clocks",
                  "identifiers"
                ],
                "sources": [
                  "[[wiki/snowflake-id-design]]",
                  "[[wiki/database-ticket-servers]]",
                  "https://docs.python.org/3/library/time.html#time.monotonic",
                  "https://lamport.azurewebsites.net/pubs/time-clocks.pdf",
                  "https://www.rfc-editor.org/rfc/rfc9562.html#section-6.2",
                  "https://www.postgresql.org/docs/16/functions-sequence.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "A time-bearing ID records a clock reading used during generation. Sorting those IDs can help browsing, but it does not establish the order of events across machines.",
                "mermaidCount": 1,
                "content": "# Clock skew and ID ordering\n\nA time-bearing ID records a clock reading used during generation. Sorting those IDs can help browsing, but it does not establish the order of events across machines.\n\nTwo machines may disagree about the current time. Even when their readings match, worker fields and local counters break ties according to the format rather than the events' relationship.\n\n## Skew and rollback are different problems\n\nA wall clock reports calendar time, such as Unix milliseconds. The offset between machines' readings at the same instant is commonly called clock skew. Drift and clock corrections can change that offset.\n\nRollback is a clock moving behind its own earlier reading. The course Snowflake generator detects this locally. It cannot detect that another machine is twenty milliseconds ahead, and ordinary clock synchronization does not by itself establish a strict event-order guarantee.\n\nA process pause adds another complication: a process can generate an ID, wait, then store or send its record. Generation time, receipt time and commit time describe different events even without a backward clock adjustment.\n\n## Follow a request and its reply\n\nChoose the following exchange. A generates the request's ID at elapsed time 1030; B generates the reply's ID at 1005; A records receipt at 1031. These are chosen readings relative to the course epoch, not measured network times.\n\n```mermaid\nsequenceDiagram\n    accTitle: A reply whose clock value is earlier\n    accDescr: A sends at local time plus 1030, B replies at plus 1005, and A receives at plus 1031. The message dependency orders the request before the reply even though sorting their timestamp-bearing IDs reverses them.\n    participant A as Instance A\n    participant B as Instance B\n    A->>B: Request, A clock +1030\n    B-->>A: Reply, B clock +1005\n    Note over A: Receipt recorded at +1031\n```\n\nB's reply depends on A's request, so the request came first in this exchange. Its smaller clock reading cannot reverse that dependency. Lamport's happened-before relation formalizes this using process order and actual message exchanges, without requiring matching wall clocks.\n\nThe [Snowflake replay](/course-assets/system-design/m09-snowflake-replay.mjs) calls two generators in this order and retains explicit `causedBy` references. Its ordering mode also compares equal timestamps and two elapsed-time calculations. Node 24.11.0 reproduced the output on September 17.\n\n```bash title=\"terminal\"\nnode m09-snowflake-replay.mjs ordering\n```\n```output\nobserved sequence: A sends -> B replies -> A receives\nA sends: local_ms=+1030, id=4320202752\nB replies: local_ms=+1005, id=4215287808\nA receives: local_ms=+1031, id=4324397056\nnumeric ID order: B replies -> A sends -> A receives\nsame timestamp: worker 17 emitted first, smaller ID belongs to worker 3\nchosen wall-clock difference: -100\nchosen monotonic-clock difference: 10\n```\n\nBoth generators follow their local rules and use distinct worker identities. There is no duplicate: the failure is the interpretation of their numeric order. At an equal timestamp, worker 3 sorts before worker 17 even when worker 17 emitted first, because the worker field precedes the sequence field.\n\n## Ask which order the product needs\n\n| Requirement | Information or mechanism to use |\n|---|---|\n| Stable page traversal | A complete ordering tuple and defined visibility rules |\n| Show which request produced a reply | The retained request/reply relationship |\n| Reject an update based on stale state | A checked record version or suitable transaction |\n| Agree on a replicated operation sequence | The system's agreed log order |\n| Reject a superseded owner's write | A fencing token compared with the latest accepted token |\n\nThese mechanisms answer different questions. A log position orders entries in that log; it does not automatically order every real-world event. A unique ID can break a query tie without proving causality. Logical clocks preserve specified dependencies, but comparing two scalar clock values does not prove one event caused the other.\n\nLikewise, a database sequence allocates values before the caller's work finishes. A transaction holding a smaller ID can commit later. If commit order matters, use the database's explicit supported ordering contract instead of treating its primary key as that contract.\n\n## Measure a local timeout with elapsed time\n\nThe replay chooses wall-clock readings of 1000 then 900 milliseconds, yielding a negative difference. Separate increasing readings of 5000 then 5010 yield ten milliseconds. This demonstrates arithmetic under supplied inputs; it does not change the operating system clock.\n\nUse a monotonic clock for a local timeout budget. Python's `time.monotonic()` cannot go backward and is unaffected by system-clock updates. Its origin is unspecified: differences are useful, while treating the value as a calendar timestamp is unsupported.\n\nThat clock does not give independently booted machines a shared epoch or restore lost allocator history. Keep local elapsed measurement separate from a timestamp intended for storage or interchange.\n\nFor a mutable record, choosing the update with the largest time-bearing ID makes clock offset part of the conflict policy. A fast clock can make an earlier update defeat a later correction. Use the version or transaction rule the product actually needs, and keep the ID's job limited to identifying the record.\n"
              }
            },
            {
              "slug": "keyset-pagination",
              "title": "Keyset pagination",
              "kind": "lesson",
              "archive": {
                "slug": "keyset-pagination",
                "file": "keyset-pagination.md",
                "title": "Keyset pagination",
                "displayTitle": "Keyset pagination",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "relational-databases",
                  "pagination"
                ],
                "sources": [
                  "[[wiki/database-indexing]]",
                  "[[wiki/mvcc]]",
                  "https://www.postgresql.org/docs/16/queries-limit.html",
                  "https://www.postgresql.org/docs/16/functions-comparisons.html",
                  "https://www.postgresql.org/docs/16/indexes-ordering.html",
                  "https://www.postgresql.org/docs/16/transaction-iso.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Keyset pagination resumes a listing after the last item's ordering values.",
                  "continuation": "It suits a feed or a “next page” interface where the caller already has a position to continue from."
                }
              }
            },
            {
              "slug": "bloom-filters",
              "title": "Bloom filters",
              "kind": "lesson",
              "archive": {
                "slug": "bloom-filters",
                "file": "bloom-filters.md",
                "title": "Bloom filters",
                "displayTitle": "Bloom filters",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "data-structures",
                  "probabilistic"
                ],
                "sources": [
                  "https://www.eecs.harvard.edu/~michaelm/postscripts/rsa2008.pdf",
                  "https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter",
                  "https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/",
                  "[[wiki/seen-filtering-bloom-vs-exact-sets]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A Bloom filter is a compact membership summary that can rule out absent keys before an expensive lookup.",
                  "continuation": "It answers either “definitely absent” or “possibly present”; a positive answer still needs confirmation when correctness requires exact membership."
                }
              }
            },
            {
              "slug": "hot-cold-storage-archival",
              "title": "Hot and cold storage, archival",
              "kind": "lesson",
              "archive": {
                "slug": "hot-cold-storage-archival",
                "file": "hot-cold-storage-archival.md",
                "title": "Hot and cold storage, archival",
                "displayTitle": "Hot and cold storage, archival",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "storage",
                  "archival"
                ],
                "sources": [
                  "[[wiki/schema-evolution]]",
                  "[[wiki/soft-delete]]",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/restoring-objects.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-transition-general-considerations.html",
                  "https://www.postgresql.org/docs/16/functions-aggregate.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Archival moves retained data to a storage path suited to infrequent access.",
                  "continuation": "The application still needs to find and read it, even after the original copy is removed."
                }
              }
            }
          ]
        },
        {
          "id": "learning-caching-fast-reads",
          "number": "05",
          "title": "Caching and fast reads",
          "summary": "Place caches, keep their contents useful, and plan for misses and failures.",
          "units": [
            {
              "slug": "caching-layers",
              "title": "Caching layers",
              "kind": "lesson",
              "archive": {
                "slug": "caching-layers",
                "file": "caching-layers.md",
                "title": "Caching layers",
                "displayTitle": "Caching layers",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "caching",
                  "architecture"
                ],
                "sources": [
                  "[[wiki/url-shortener-system-design]]",
                  "https://dev.mysql.com/doc/refman/8.4/en/innodb-buffer-pool.html",
                  "https://dev.mysql.com/doc/refman/8.4/en/memory-storage-engine.html",
                  "https://www.rfc-editor.org/rfc/rfc9111.html",
                  "https://www.postgresql.org/docs/16/rules-materializedviews.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "A cache keeps an answer so the next request can avoid some work: reading a database row, calling another service, resizing an image or recomputing a report. The useful question is which work a hit removes. That determines where the copy belongs.",
                "mermaidCount": 1,
                "content": "# Caching layers\n\nA cache keeps an answer so the next request can avoid some work: reading a database row, calling another service, resizing an image or recomputing a report. The useful question is which work a hit removes. That determines where the copy belongs.\n\nWe’ll compare the places a cache can live, follow a read that fills one, and distinguish a database’s page cache from a disposable SQL table.\n\n## Keep the source separate\n\nSuppose a catalog service copies product `p7` into a cache. Finding a usable copy is a **hit**; finding none is a **miss**. The product database remains the source of truth. Losing the cached copy should leave somewhere to recover the answer.\n\n![A source ledger retains product p7 while an arrow labeled copy points to a separate cache card held by a reader.](/course-assets/system-design/illustrations/cache-copy.webp)\n\nThat makes the copy replaceable, but does not make its contents permanently correct. If the product changes, the old copy needs a rule for when readers must stop using it. Name the allowed staleness before choosing a cache lifetime.\n\nThe key must distinguish answers that are different. A public product description might use its product ID and locale. An account’s private report also needs its account boundary; a report-name-only key could expose one customer’s data to another.\n\n## Choose the work to avoid\n\nThese layers are alternatives you can combine when each earns its place. They are not a checklist of infrastructure every request should traverse.\n\n| Placement | A hit can avoid | What needs care |\n| --- | --- | --- |\n| Client | Fetching or recomputing local data | Stale state and switching accounts |\n| CDN | Sending a reusable public response from the origin | Invalidation and personalized responses |\n| Gateway or reverse proxy | Running the application for a reusable response | Authorization and correct request matching |\n| API process memory | A repeated lookup or computation | Separate copies and fills in every instance |\n| API disk | Regenerating a larger artifact | Space limits and cleanup across deployments |\n| Redis or Memcached | Repeated source lookups across instances | Network delay, outages and invalidation |\n| Database buffer pool | Reading database pages from storage | Engine-specific memory management |\n| Materialized view | Repeating a join or aggregation | Refresh cost and out-of-date results |\n\nA buffer-pool hit still leaves the database executing the query. A cached query result can avoid that execution. A reusable HTTP response can skip the application entirely. Each moves the boundary of work saved, and therefore the behavior being skipped.\n\nFor example, our [[wiki/url-shortener-system-design|shortener design]] records every accepted redirect reaching the application. Caching its destination lookup preserves that write. Reusing a whole redirect before it reaches the application would bypass it.\n\nAn HTTP cache also needs the response’s reuse rules, not just a URL lookup. A response that varies by a request header needs matching variants; private and public answers must not become interchangeable.\n\n## Follow a cache-aside read\n\nWith **cache-aside**, the application checks the cache, reads the source on a miss and saves the result for another request. This diagram follows a successful lookup of an existing product. It omits authorization and error handling to isolate the fill.\n\n```mermaid\nsequenceDiagram\n    accTitle: Filling a product cache on a miss\n    accDescr: The application misses in the cache, reads product p7 from the database, and stores a copy. The database remains the source of truth.\n    participant A as Application\n    participant C as Cache\n    participant D as Product database\n    A->>C: Get p7\n    C-->>A: Miss\n    A->>D: Read p7\n    D-->>A: Product\n    A->>C: Store product copy\n    C-->>A: Stored\n```\n\nA process-local map avoids a network exchange. A shared cache lets different application instances reuse the same fill and can outlive an application restart. Shared ownership adds a dependency, so choose it when that reuse is worth the cost.\n\nFor changing data, you might delete a copy after a source update, give it a time limit, or update it through the write path. Writing both stores does not by itself make them atomic: a failure or concurrent fill can leave them disagreeing. The concurrency lesson follows that race.\n\n## A SQL-shaped cache\n\nMySQL’s `MEMORY` engine offers a transient table with SQL access. It can suit a disposable derived dataset when retaining an existing schema and query shape simplifies the application. The [MEMORY engine recording](/system/archive/caching-layers?recording=sd-60) explores this option.\n\nIn MySQL 8.4, the rows disappear on server restart while the table definition survives. This differs from InnoDB’s buffer pool, which holds pages belonging to durable tables. A materialized view is different again: it stores a query’s results until refreshed.\n\n`MEMORY` lacks transactions, uses table-level locks and cannot store `TEXT` or `BLOB` columns. Even `VARCHAR` occupies a fixed-length row representation. Table size is bounded by configured memory limits; extra rows do not automatically spill to disk.\n\nSQL reuse can be convenient, but these restrictions may cost more than they save. Compare the actual queries and schema with InnoDB or direct key access before assuming an in-memory table will be faster.\n\nFor any placement, measure the avoided operation, miss cost and total response time. A high hit ratio helps only if it removes meaningful work and the answers remain usable.\n"
              }
            },
            {
              "slug": "distributed-cache-design",
              "title": "Distributed cache design",
              "kind": "lesson",
              "archive": {
                "slug": "distributed-cache-design",
                "file": "distributed-cache-design.md",
                "title": "Distributed cache design",
                "displayTitle": "Distributed cache design",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "caching",
                  "key-value"
                ],
                "sources": [
                  "[[wiki/caching-layers]]",
                  "[[wiki/consistent-hashing]]",
                  "https://redis.io/docs/latest/commands/get/",
                  "https://redis.io/docs/latest/commands/set/",
                  "https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/",
                  "https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A shared cache lets several application instances reuse the same copied answers.",
                  "continuation": "A distributed cache spreads those answers across machines."
                }
              }
            },
            {
              "slug": "cache-eviction-policies",
              "title": "Cache eviction policies",
              "kind": "lesson",
              "archive": {
                "slug": "cache-eviction-policies",
                "file": "cache-eviction-policies.md",
                "title": "Cache eviction policies",
                "displayTitle": "Cache eviction policies",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "caching",
                  "eviction"
                ],
                "sources": [
                  "[[wiki/caching-layers]]",
                  "https://redis.io/docs/latest/develop/reference/eviction/",
                  "https://github.com/ben-manes/caffeine/wiki/Efficiency",
                  "https://arxiv.org/abs/1512.00727"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Eviction removes a cached item to make room for another.",
                  "continuation": "The next request for the removed item must fetch it again, so the policy is making a prediction: which saved answer will be least useful next?"
                }
              }
            },
            {
              "slug": "ttl-expiration-and-cache-reapers",
              "title": "TTL expiration and cache reapers",
              "kind": "lesson",
              "archive": {
                "slug": "ttl-expiration-and-cache-reapers",
                "file": "ttl-expiration-and-cache-reapers.md",
                "title": "TTL expiration and cache reapers",
                "displayTitle": "TTL expiration and cache reapers",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "caching",
                  "expiration"
                ],
                "sources": [
                  "[[wiki/cache-eviction-policies]]",
                  "https://redis.io/docs/latest/commands/expire/",
                  "https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/cache-validity.html",
                  "https://netty.io/4.1/api/io/netty/util/HashedWheelTimer.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A time to live, or TTL, limits how long a cached entry may answer requests.",
                  "continuation": "Expiration enforces that deadline."
                }
              }
            },
            {
              "slug": "cache-concurrency-control",
              "title": "Cache concurrency control",
              "kind": "lesson",
              "archive": {
                "slug": "cache-concurrency-control",
                "file": "cache-concurrency-control.md",
                "title": "Cache concurrency control",
                "displayTitle": "Cache concurrency control",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "caching",
                  "concurrency"
                ],
                "sources": [
                  "[[wiki/ttl-expiration-and-cache-reapers]]",
                  "[[wiki/sql-backed-key-value-store]]",
                  "https://docs.python.org/3.14/library/asyncio-task.html",
                  "https://pkg.go.dev/golang.org/x/sync/singleflight",
                  "https://redis.io/docs/latest/develop/using-commands/transactions/",
                  "https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Concurrent cache access raises two different problems: callers can duplicate the work of rebuilding a missing answer, and a delayed caller can overwrite a newer answer.",
                  "continuation": "Making each cache command atomic does not automatically solve either problem."
                }
              }
            },
            {
              "slug": "cache-availability-and-database-fallback",
              "title": "Cache availability and database fallback",
              "kind": "lesson",
              "archive": {
                "slug": "cache-availability-and-database-fallback",
                "file": "cache-availability-and-database-fallback.md",
                "title": "Cache availability and database fallback",
                "displayTitle": "Cache availability and database fallback",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "caching",
                  "availability"
                ],
                "sources": [
                  "[[wiki/cache-concurrency-control]]",
                  "[[wiki/load-shedding]]",
                  "[[wiki/url-shortener-system-design]]",
                  "https://aws.amazon.com/builders-library/caching-challenges-and-strategies/",
                  "https://sre.google/sre-book/handling-overload/",
                  "https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/",
                  "https://redis.io/docs/latest/operate/oss_and_stack/management/replication/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A cache can be disposable without being safe to lose under load.",
                  "continuation": "Its source may retain every record yet lack capacity to serve the reads that were previously cache hits."
                }
              }
            }
          ]
        },
        {
          "id": "learning-distributed-coordination",
          "number": "06",
          "title": "Distributed coordination",
          "summary": "Reason about replication, agreement, locks, clocks, and consistency.",
          "units": [
            {
              "slug": "distributed-systems-foundations",
              "title": "Distributed systems foundations",
              "kind": "lesson",
              "archive": {
                "slug": "distributed-systems-foundations",
                "file": "distributed-systems-foundations.md",
                "title": "Distributed systems foundations",
                "displayTitle": "Distributed systems foundations",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "distributed-systems",
                  "failure"
                ],
                "sources": [
                  "[[wiki/retries-timeouts-idempotency]]",
                  "https://d1.awsstatic.com/builderslibrary/pdfs/challenges-with-distributed-systems.pdf",
                  "https://d1.awsstatic.com/builderslibrary/pdfs/timeouts-retries-and-backoff-with-jitter.pdf",
                  "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A distributed system coordinates work across machines through messages.",
                  "continuation": "Splitting the work can add capacity or keep a service running when one machine fails."
                }
              }
            },
            {
              "slug": "consistency-models",
              "title": "Consistency models",
              "kind": "lesson",
              "archive": {
                "slug": "consistency-models",
                "file": "consistency-models.md",
                "title": "Consistency models",
                "displayTitle": "Consistency models",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "consistency",
                  "replication"
                ],
                "sources": [
                  "[[wiki/mvcc]]",
                  "[[wiki/cache-concurrency-control]]",
                  "https://www.cs.cmu.edu/~wing/publications/HerlihyWing90.pdf",
                  "https://www.cs.cornell.edu/courses/cs734/2000FA/cached%20papers/SessionGuaranteesPDIS_1.html",
                  "https://www.cs.princeton.edu/courses/archive/fall19/cos418/papers/cops.pdf",
                  "https://www.postgresql.org/docs/16/transaction-iso.html",
                  "https://jepsen.io/consistency/models/strong-serializable"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A consistency model defines which histories of reads and writes a system allows.",
                  "continuation": "A saved change can be durable while another copy still answers with an older value."
                }
              }
            },
            {
              "slug": "replication",
              "title": "Replication",
              "kind": "lesson",
              "archive": {
                "slug": "replication",
                "file": "replication.md",
                "title": "Replication",
                "displayTitle": "Replication",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "replication",
                  "durability"
                ],
                "sources": [
                  "[[wiki/database-wal-and-recovery]]",
                  "https://www.postgresql.org/docs/16/warm-standby.html",
                  "https://www.postgresql.org/docs/16/runtime-config-wal.html",
                  "https://www.postgresql.org/docs/16/different-replication-solutions.html",
                  "https://docs.ceph.com/en/latest/rados/operations/erasure-code/",
                  "https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Replication maintains copies of data on multiple machines.",
                  "continuation": "Those copies can support recovery, read capacity and nearby access."
                }
              }
            },
            {
              "slug": "cap-and-pacelc",
              "title": "CAP and PACELC",
              "kind": "lesson",
              "archive": {
                "slug": "cap-and-pacelc",
                "file": "cap-and-pacelc.md",
                "title": "CAP and PACELC",
                "displayTitle": "CAP and PACELC",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "consistency",
                  "partitions"
                ],
                "sources": [
                  "[[wiki/consistency-models]]",
                  "https://users.ece.cmu.edu/~adrian/731-sp04/readings/GL-cap.pdf",
                  "https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf",
                  "https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "CAP describes a limit on replicated data: during a communication partition, a service cannot guarantee both linearizable reads and writes and a successful response to every request at every non-failing node.",
                  "continuation": "PACELC adds a second question: what coordination cost do stronger guarantees impose while communication works?"
                }
              }
            },
            {
              "slug": "clocks-and-ordering",
              "title": "Clocks and ordering",
              "kind": "lesson",
              "archive": {
                "slug": "clocks-and-ordering",
                "file": "clocks-and-ordering.md",
                "title": "Clocks and ordering",
                "displayTitle": "Clocks and ordering",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "logical-clocks",
                  "causality"
                ],
                "sources": [
                  "[[wiki/clock-skew-and-id-ordering]]",
                  "https://lamport.azurewebsites.net/pubs/time-clocks.pdf",
                  "https://pages.cs.wisc.edu/~ra/Classes/739-sp20/papers/mattern89.pdf",
                  "https://docs.python.org/3/library/time.html",
                  "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Distributed systems need several kinds of order.",
                  "continuation": "Measuring how long a request took, identifying which edit incorporated another, and agreeing on the next accepted command are different jobs."
                }
              }
            },
            {
              "slug": "consensus",
              "title": "Consensus",
              "kind": "lesson",
              "archive": {
                "slug": "consensus",
                "file": "consensus.md",
                "title": "Consensus",
                "displayTitle": "Consensus",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "coordination"
                ],
                "sources": [
                  "https://raft.github.io/raft.pdf",
                  "https://static.usenix.org/events/osdi06/tech/full_papers/burrows/burrows_html/",
                  "https://etcd.io/docs/v3.6/learning/design-learner/",
                  "https://github.com/etcd-io/raft",
                  "[[wiki/replication]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Consensus lets a group agree on decisions despite some members failing.",
                  "continuation": "For a replicated log, the useful promise is an accepted command history that a replacement leader must preserve."
                }
              }
            },
            {
              "slug": "leader-election",
              "title": "Leader election",
              "kind": "lesson",
              "archive": {
                "slug": "leader-election",
                "file": "leader-election.md",
                "title": "Leader election",
                "displayTitle": "Leader election",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "coordination"
                ],
                "sources": [
                  "[[wiki/consensus]]",
                  "[[wiki/cache-concurrency-control]]",
                  "https://raft.github.io/raft.pdf",
                  "https://d1.awsstatic.com/builderslibrary/pdfs/leader-election-in-distributed-systems.pdf",
                  "https://static.usenix.org/events/osdi06/tech/full_papers/burrows/burrows_html/",
                  "https://etcd.io/docs/v3.6/dev-guide/api_concurrency_reference_v3/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Leader election chooses a node to coordinate work for a particular scope.",
                  "continuation": "That might mean assigning jobs, owning a partition, leading replication, or updating metadata."
                }
              }
            },
            {
              "slug": "distributed-locks-and-leases",
              "title": "Distributed locks and leases",
              "kind": "lesson",
              "archive": {
                "slug": "distributed-locks-and-leases",
                "file": "distributed-locks-and-leases.md",
                "title": "Distributed locks and leases",
                "displayTitle": "Distributed locks and leases",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "coordination"
                ],
                "sources": [
                  "[[wiki/leader-election]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html",
                  "https://redis.io/docs/latest/commands/set/",
                  "https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/",
                  "https://www.sqlite.org/isolation.html",
                  "https://static.usenix.org/events/osdi06/tech/full_papers/burrows/burrows_html/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A distributed lock coordinates clients on different machines when a local mutex cannot protect their shared work.",
                  "continuation": "Clients ask a lock manager for ownership of a named resource, then release that ownership when finished."
                }
              }
            },
            {
              "slug": "redis-redlock-and-fencing-tokens",
              "title": "Redis Redlock and fencing tokens",
              "kind": "lesson",
              "archive": {
                "slug": "redis-redlock-and-fencing-tokens",
                "file": "redis-redlock-and-fencing-tokens.md",
                "title": "Redis Redlock and fencing tokens",
                "displayTitle": "Redis Redlock and fencing tokens",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "coordination"
                ],
                "sources": [
                  "https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/",
                  "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html",
                  "https://antirez.com/news/101",
                  "[[wiki/distributed-locks-and-leases]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Redlock is a client-side algorithm that acquires an expiring lock across several independent Redis instances.",
                  "continuation": "It combines a majority of successful acquisitions with a limit on how much time acquisition consumed."
                }
              }
            },
            {
              "slug": "circuit-breakers-and-timeouts",
              "title": "Circuit breakers and timeouts",
              "kind": "lesson",
              "archive": {
                "slug": "circuit-breakers-and-timeouts",
                "file": "circuit-breakers-and-timeouts.md",
                "title": "Circuit breakers and timeouts",
                "displayTitle": "Circuit breakers and timeouts",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "reliability",
                  "admission"
                ],
                "sources": [
                  "[[wiki/retries-timeouts-idempotency]]",
                  "[[wiki/load-balancers]]",
                  "https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker",
                  "https://resilience4j.readme.io/docs/circuitbreaker",
                  "https://d1.awsstatic.com/builderslibrary/pdfs/timeouts-retries-and-backoff-with-jitter.pdf",
                  "https://martinfowler.com/bliki/CircuitBreaker.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A circuit breaker temporarily refuses calls to a dependency after observing enough failures.",
                  "continuation": "It lets the caller stop spending resources on attempts that are likely to fail, then cautiously check for recovery."
                }
              }
            },
            {
              "slug": "gossip-protocol",
              "title": "Gossip protocol",
              "kind": "lesson",
              "archive": {
                "slug": "gossip-protocol",
                "file": "gossip-protocol.md",
                "title": "Gossip protocol",
                "displayTitle": "Gossip protocol",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "coordination"
                ],
                "sources": [
                  "[[wiki/clocks-and-ordering]]",
                  "[[wiki/distributed-systems-foundations]]",
                  "[[wiki/distributed-locks-and-leases]]",
                  "https://www.cs.cornell.edu/projects/Quicksilver/public_pdfs/SWIM.pdf",
                  "https://github.com/hashicorp/serf/blob/master/docs/internals/gossip.html.markdown",
                  "https://developer.hashicorp.com/consul/docs/concept/gossip",
                  "https://www.cis.upenn.edu/~bcpierce/courses/dd/papers/demers-epidemic.pdf"
                ],
                "created": "2026-05-17",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Gossip spreads information through repeated exchanges between peers.",
                  "continuation": "A node tells a few others what it knows; they carry that information into later exchanges."
                }
              }
            },
            {
              "slug": "metadata-service-and-node-discovery",
              "title": "Metadata service and node discovery",
              "kind": "lesson",
              "archive": {
                "slug": "metadata-service-and-node-discovery",
                "file": "metadata-service-and-node-discovery.md",
                "title": "Metadata service and node discovery",
                "displayTitle": "Metadata service and node discovery",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "coordination"
                ],
                "sources": [
                  "https://etcd.io/docs/v3.6/learning/api_guarantees/",
                  "https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/",
                  "https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/",
                  "https://kubernetes.io/docs/reference/using-api/api-concepts/",
                  "[[wiki/gossip-protocol]]",
                  "[[wiki/consensus]]",
                  "[[wiki/load-balancers]]",
                  "[[wiki/distributed-locks-and-leases]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A metadata service publishes information about a system's nodes and their assignments.",
                  "continuation": "Clients use it to find where a request belongs without hardcoding every server address."
                }
              }
            },
            {
              "slug": "distributed-hash-tables",
              "title": "Distributed hash tables",
              "kind": "lesson",
              "archive": {
                "slug": "distributed-hash-tables",
                "file": "distributed-hash-tables.md",
                "title": "Distributed hash tables",
                "displayTitle": "Distributed hash tables",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "coordination"
                ],
                "sources": [
                  "https://pdos.csail.mit.edu/papers/chord:sigcomm01/chord_sigcomm.pdf",
                  "https://cs.nyu.edu/~anirudh/CSCI-GA.2620-001/papers/kademlia.pdf",
                  "https://bittorrent.org/beps/bep_0005.html",
                  "https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/pastry.pdf",
                  "[[wiki/consistent-hashing]]",
                  "[[wiki/metadata-service-and-node-discovery]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A distributed hash table, or DHT, spreads key lookup across participating nodes.",
                  "continuation": "A client can start with one known participant and discover the nodes responsible for a key without downloading the whole membership list."
                }
              }
            }
          ]
        },
        {
          "id": "learning-storage-engines",
          "number": "07",
          "title": "Storage engines",
          "summary": "Follow how databases and object stores organize, persist, and retrieve bytes.",
          "units": [
            {
              "slug": "storage-engine-design-constraints",
              "title": "Storage engine design constraints",
              "kind": "lesson",
              "archive": {
                "slug": "storage-engine-design-constraints",
                "file": "storage-engine-design-constraints.md",
                "title": "Storage engine design constraints",
                "displayTitle": "Storage engine design constraints",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "storage-engines"
                ],
                "sources": [
                  "[[wiki/database-wal-and-recovery]]",
                  "[[wiki/sql-backed-key-value-store]]",
                  "https://www.sqlite.org/fileformat.html",
                  "https://www.sqlite.org/atomiccommit.html",
                  "https://github.com/facebook/rocksdb/wiki/Memory-usage-in-RocksDB",
                  "https://docs.python.org/3/library/os.html#os.fsync",
                  "https://riak.com/assets/bitcask-intro.pdf"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A storage engine turns reads, writes and deletes into operations on stored bytes.",
                  "continuation": "Its layout determines how much data each operation touches, what must fit in memory, and what can be recovered after a failure."
                }
              }
            },
            {
              "slug": "storage-engine-tradeoffs",
              "title": "Storage engine tradeoffs",
              "kind": "lesson",
              "archive": {
                "slug": "storage-engine-tradeoffs",
                "file": "storage-engine-tradeoffs.md",
                "title": "Storage engine tradeoffs",
                "displayTitle": "Storage engine tradeoffs",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "storage-engines"
                ],
                "sources": [
                  "[[wiki/storage-engine-design-constraints]]",
                  "[[wiki/b-tree]]",
                  "https://www.sqlite.org/fileformat.html",
                  "https://www.sqlite.org/atomiccommit.html",
                  "https://riak.com/assets/bitcask-intro.pdf",
                  "https://github.com/facebook/rocksdb/wiki/Compaction"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Storage engines move work between reads, writes and maintenance.",
                  "continuation": "Appending a replacement is simple, but leaves an old value to reclaim."
                }
              }
            },
            {
              "slug": "file-backed-dictionary-storage-engine",
              "title": "A file-backed dictionary",
              "kind": "lesson",
              "archive": {
                "slug": "file-backed-dictionary-storage-engine",
                "file": "file-backed-dictionary-storage-engine.md",
                "title": "A file-backed dictionary",
                "displayTitle": "A file-backed dictionary",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "storage-engines"
                ],
                "sources": [
                  "[[wiki/storage-engine-design-constraints]]",
                  "https://docs.python.org/3/library/os.html",
                  "https://man7.org/linux/man-pages/man2/fsync.2.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html",
                  "https://docs.python.org/3/library/heapq.html#heapq.merge",
                  "https://www.rfc-editor.org/rfc/rfc8259.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "Suppose we need an API that returns a word's meaning. Definitions change in a weekly batch, reads dominate, and the exercise excludes a database. The data file may be large, but the words and their locations can fit in memory.",
                "mermaidCount": 1,
                "content": "# A file-backed dictionary\n\nSuppose we need an API that returns a word's meaning. Definitions change in a weekly batch, reads dominate, and the exercise excludes a database. The data file may be large, but the words and their locations can fit in memory.\n\nWe'll build the read path around that difference, then work through publishing an update. Several API servers should be able to read the same completed dictionary without each holding every definition in RAM.\n\n## What belongs on each server?\n\nThe workload leaves us several choices:\n\n| Arrangement | Cost or limitation for this dictionary |\n| --- | --- |\n| Load the complete dictionary | Simple lookups, but every server needs RAM for all values |\n| One file or object per word | Independent updates, but many artifacts to publish and manage |\n| Scan one large file per lookup | Simple format, but search work grows with the file |\n| Mutable B-tree | Supports ordered updates; more machinery than a weekly rebuild needs |\n| Memory index and immutable data file | Small lookup structure, with an extra read for the value |\n\nChoose the last option while the full index fits memory and batch rebuilds are affordable. Keep the data file locally if replicated disk space and distribution are acceptable; object storage can instead hold a shared copy and serve selected byte ranges.\n\n## A word points to bytes\n\nBuild the file and index together. As the builder writes each UTF-8 meaning, it records the starting byte offset and encoded length. This tiny uncompressed example packs two meanings without separators:\n\n```text\nindex for dictionary-v1:\n  apple  -> offset 0, length 5\n  banana -> offset 5, length 12\n\ndata bytes: fruityellow fruit\n```\n\nThe lengths separate `fruit` from `yellow fruit`. A server loads this version's index at startup. For banana it finds `(5, 12)`, then reads those bytes from dictionary-v1. If the key is absent from the complete index, it returns absence without reading the data file.\n\n```mermaid\nsequenceDiagram\n  accTitle: A lookup in dictionary v1\n  accDescr: The API uses its loaded v1 index to locate banana, then reads the matching byte range from the immutable v1 object and returns the meaning.\n  participant User\n  participant API\n  participant Index as Loaded v1 index\n  participant Data as Dictionary v1 object\n  User->>API: Meaning of banana\n  API->>Index: Find banana\n  Index-->>API: Offset 5, length 12\n  API->>Data: Range bytes 5-16\n  Data-->>API: yellow fruit, 12 bytes\n  API-->>User: yellow fruit\n```\n\nThat successful uncached lookup uses one memory lookup and one value request, after loading the index. It is not a promise of one physical disk read or fixed latency. Validate the returned version, range and length; [[wiki/byte-range-indexed-object-storage|the byte-range lesson]] handles the HTTP details.\n\nBudget the index from key bytes, offsets, lengths and the map's own overhead. At an assumed 40 bytes per complete in-memory entry, 500,000 words would need 20 MB. Measure the actual representation: object headers and spare hash-table capacity can make a compact serialized index much larger after loading. Replicating that index across API servers is the cost of keeping lookup local.\n\n## Rebuild from the weekly changes\n\nSort the old dictionary and the week's changes by the same key ordering. Resolve multiple changes to one word before the merge, using an explicit update order. Then walk both sorted inputs:\n\n- An old-only word keeps its definition.\n- A changed word uses the new definition, or is omitted if the change deletes it.\n- A new-only word is inserted.\n\nWrite dictionary-v2 and its index during this pass. New offsets come from the bytes actually emitted; changing apple's length moves later definitions. A streaming merge avoids loading all values together, though producing sorted inputs may itself require external sorting.\n\nValidate the completed pair, then publish a version selector naming both. Readers load the new index and switch the file identity with it. Retain v1 while any reader still uses its index. Replacing v1's bytes beneath those offsets could return another word's text without causing a parse error.\n\n## Practice publishing a complete candidate\n\nBefore implementing the remote design, the [storage-engine download](/course-assets/system-design/m12-storage-engine.py) exercises a smaller local snapshot. It stores the whole two-word map as JSON, so this version loads values into memory and has no offset index.\n\nIts helper writes a candidate in the same directory, flushes Python's buffer, calls `os.fsync`, replaces the published filename with `os.replace`, then synchronizes the directory. A successful same-filesystem rename provides an atomic name change; durable publication also depends on the synchronization succeeding and the filesystem's guarantees. Errors propagate.\n\nSnapshot mode writes an intentionally truncated candidate before publishing a complete replacement:\n\n```bash title=\"terminal\"\npython3 m12-storage-engine.py snapshot\n```\n\n```output\nsnapshot bytes: 41\nreopened: {\"apple\":\"fruit\",\"banana\":\"yellow fruit\"}\ntruncated candidate rejected; published apple: fruit\nreplacement bytes: 45 ; reopened apple: red fruit\n```\n\nThe old published dictionary survives rejection of the incomplete candidate. The complete replacement adds four encoded bytes. These sizes count compact JSON punctuation too; they are unrelated to the 17-byte raw value pack above.\n\nThe helper writes generated JSON. An importer also needs to validate the expected string-map shape and input limits before publication. A valid JSON array is not a dictionary. A malformed published file is a storage error, not an empty dictionary or a missing word.\n\nA reader already holding the old map can keep answering from it while a new reader loads the replacement. Our weekly publication allows that overlap; instant visibility on every server would need a stronger refresh contract. This local truncation-and-reopen experiment does not test object storage or power loss.\n\nThe [[wiki/custom-binary-file-format|next lesson]] puts explicit boundaries into the stored bytes. [[wiki/immutable-versioned-data-files|Versioned files]] then keep those bytes and their readers together during replacement and cleanup.\n"
              }
            },
            {
              "slug": "custom-binary-file-format",
              "title": "Custom binary file format",
              "kind": "lesson",
              "archive": {
                "slug": "custom-binary-file-format",
                "file": "custom-binary-file-format.md",
                "title": "Custom binary file format",
                "displayTitle": "Custom binary file format",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "storage-engines"
                ],
                "sources": [
                  "[[wiki/file-backed-dictionary-storage-engine]]",
                  "https://docs.python.org/3/library/struct.html",
                  "https://github.com/google/leveldb/blob/main/doc/table_format.md",
                  "https://www.rfc-editor.org/rfc/rfc8259.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A file format is an agreement between a writer and a reader about what each byte means.",
                  "continuation": "For the dictionary, that agreement must let a reader find the index, locate a definition and reject bytes it cannot interpret safely."
                }
              }
            },
            {
              "slug": "byte-range-indexed-object-storage",
              "title": "Byte-range indexed object storage",
              "kind": "lesson",
              "archive": {
                "slug": "byte-range-indexed-object-storage",
                "file": "byte-range-indexed-object-storage.md",
                "title": "Byte-range indexed object storage",
                "displayTitle": "Byte-range indexed object storage",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "object-storage"
                ],
                "sources": [
                  "[[wiki/file-backed-dictionary-storage-engine]]",
                  "[[wiki/custom-binary-file-format]]",
                  "https://www.rfc-editor.org/rfc/rfc9110.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html",
                  "https://github.com/google/leveldb/blob/main/doc/table_format.md"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "A byte-range read retrieves part of an object. Add an index from logical keys to byte locations, and a large dictionary or catalog can answer a point lookup without transferring its entire data file.",
                "mermaidCount": 0,
                "content": "# Byte-range indexed object storage\n\nA byte-range read retrieves part of an object. Add an index from logical keys to byte locations, and a large dictionary or catalog can answer a point lookup without transferring its entire data file.\n\nThe application supplies the lookup logic; object storage supplies bytes. We'll translate an index entry into a range, verify a local read, then handle response validation, compression and access control.\n\n## Name the object as well as the position\n\nThe [[wiki/file-backed-dictionary-storage-engine|dictionary design]] needs an entry shaped like this:\n\n```text\nkey -> object identity, start byte, length\n```\n\nObject identity must select the version used to build the index. An unchanged offset in a replaced object can return a different value with a perfectly valid length. Use immutable object names or an explicit retained version; [[wiki/immutable-versioned-data-files|the next lesson]] covers publication and cleanup.\n\nOur exercise uses a separate color pack: `red\\n`, `green\\n`, then `purple\\n`. The newline is one byte, making the values four, six and seven bytes long. This is not the previous lesson's word-meaning file.\n\n| Key | Half-open byte slice and length |\n| --- | --- |\n| apple | `[0:4]`: 4 bytes |\n| pear | `[4:10]`: 6 bytes |\n| plum | `[10:17]`: 7 bytes |\n\nA program slice excludes its right endpoint. HTTP byte ranges include it, so pear's six bytes become `Range: bytes=4-9`. For a nonempty indexed value, the last byte is `start + length - 1`. An empty value needs no body read; do not turn zero length into an invalid reversed range.\n\n## Exercise the boundary\n\nThe [object-storage download](/course-assets/system-design/m13-object-store.py) writes this 17-byte pack in a private temporary directory. It compares a full read with a seek to pear's offset, then tries invalid metadata and an actually shortened source file.\n\n```bash title=\"terminal\"\npython3 m13-object-store.py ranges\n```\n\n```output\npack bytes: 17 ; index: {\"apple\":[0,4],\"pear\":[4,6],\"plum\":[10,7]}\nfull: b'red\\ngreen\\npurple\\n'\npear slice [4:10] -> b'green\\n'\nHTTP range spelling: bytes=4-9; returned length=6\nindex (-1,1): invalid indexed boundary\nindex (10,8): invalid indexed boundary\nshortened source: truncated source\n```\n\nThe helper rejects a negative offset or an interval beyond the recorded complete length. It also checks the returned byte count. A valid-looking index cannot make a shortened source return all its promised bytes.\n\nThis mode performs local file reads. Its HTTP line is calculated syntax, not a network response or an S3 measurement. Returned bytes also do not tell us the number of physical disk reads.\n\n## Check what the server actually returned\n\nA served single HTTP range uses `206 Partial Content` and a `Content-Range` describing the interval. An unsatisfiable range can produce `416`. A server may also ignore Range and send the full representation, so sending the header does not guarantee a partial response.\n\nFor our six-byte lookup, require the expected interval and body length before decoding. Handle a full response explicitly within a bounded fallback policy, rather than passing its first bytes off as the requested value. A short body, wrong version or unexpected encoding is a failed read.\n\nS3's GetObject supports one selected range per request, and `versionId` can select a retained version where versioning is supported. The server still does not know which logical dictionary key the interval represents. Our index makes that connection.\n\n## Keep compression and caching aligned\n\nAs in [[wiki/custom-binary-file-format|the format lesson]], HTTP offsets refer to the encoded representation. Offsets measured before whole-file compression cannot generally locate independently decodable values afterward. Keep data uncompressed, compress each record independently, or index compressed blocks and decode the containing block locally.\n\nA block can contain several values, so requesting one key may still fetch its neighbors. Verify the appropriate block or record checksum against trusted metadata before using it. Matching length alone misses same-length substitutions; fetching the whole object for every checksum would defeat a small-range read.\n\nCache frequently requested values near the API. Include the object generation and logical key in the cache identity so an update cannot reuse the old answer accidentally. Fetching nearby entries together may reduce request overhead; measure the extra bytes against the saved requests.\n\nThis pattern also suits indexed file sections and selected media chunks. It is less attractive when every request needs most of the object, or values require frequent independent updates. Separate objects give each value its own lifecycle; a pack trades that independence for one published collection.\n\n## Authorize the key before deriving the range\n\nAccept a logical key at the API, check the caller's permission, then look up its trusted location. Allowing arbitrary object paths and byte offsets would let a caller reach neighboring data outside that key's policy.\n\nBound the range length, total returned bytes, retries and request rate. Check the expected content type and encoding. Storage failures remain errors; they must not become “key missing” or a cached partial value. With those boundaries in place, the index provides precise access without turning the byte store into a database.\n"
              }
            },
            {
              "slug": "immutable-versioned-data-files",
              "title": "Immutable versioned data files",
              "kind": "lesson",
              "archive": {
                "slug": "immutable-versioned-data-files",
                "file": "immutable-versioned-data-files.md",
                "title": "Immutable versioned data files",
                "displayTitle": "Immutable versioned data files",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "storage-engines"
                ],
                "sources": [
                  "[[wiki/file-backed-dictionary-storage-engine]]",
                  "[[wiki/custom-binary-file-format]]",
                  "https://github.com/facebook/rocksdb/wiki/MANIFEST",
                  "https://github.com/facebook/rocksdb/wiki/Delete-Stale-Files",
                  "https://docs.python.org/3/library/os.html",
                  "https://cdn.kernel.org/doc/html/latest/RCU/rcu.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An index can point to the wrong value even when the file and offset are readable.",
                  "continuation": "If a dictionary update lengthens an earlier definition, later values move."
                }
              }
            },
            {
              "slug": "log-structured-storage",
              "title": "Log-structured storage",
              "kind": "lesson",
              "archive": {
                "slug": "log-structured-storage",
                "file": "log-structured-storage.md",
                "title": "Log-structured storage",
                "displayTitle": "Log-structured storage",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "storage-engines"
                ],
                "sources": [
                  "[[wiki/immutable-versioned-data-files]]",
                  "[[wiki/database-wal-and-recovery]]",
                  "https://riak.com/assets/bitcask-intro.pdf",
                  "https://github.com/google/leveldb/blob/main/doc/log_format.md",
                  "https://github.com/google/leveldb/blob/main/doc/impl.md",
                  "https://kafka.apache.org/41/design/design/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Replacing one value in a complete snapshot writes the other values again.",
                  "continuation": "A log-structured store records the change at the end of a file instead, leaving earlier records untouched."
                }
              }
            },
            {
              "slug": "bitcask-storage-engine",
              "title": "Bitcask storage engine",
              "kind": "lesson",
              "archive": {
                "slug": "bitcask-storage-engine",
                "file": "bitcask-storage-engine.md",
                "title": "Bitcask storage engine",
                "displayTitle": "Bitcask storage engine",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "storage-engines"
                ],
                "sources": [
                  "[[wiki/log-structured-storage]]",
                  "[[wiki/immutable-versioned-data-files]]",
                  "https://riak.com/assets/bitcask-intro.pdf",
                  "https://docs.riak.com/riak/kv/2.2.3/setup/planning/backend/bitcask/index.html",
                  "https://github.com/google/leveldb/blob/main/doc/impl.md"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An appended log contains b's old value and its replacement.",
                  "continuation": "A current lookup needs only the replacement, so keep its location in memory and read those bytes directly."
                }
              }
            },
            {
              "slug": "lsm-tree-storage-engine",
              "title": "LSM-tree storage engine",
              "kind": "lesson",
              "archive": {
                "slug": "lsm-tree-storage-engine",
                "file": "lsm-tree-storage-engine.md",
                "title": "LSM-tree storage engine",
                "displayTitle": "LSM-tree storage engine",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "storage-engines"
                ],
                "sources": [
                  "[[wiki/bitcask-storage-engine]]",
                  "[[wiki/storage-engine-tradeoffs]]",
                  "https://github.com/facebook/rocksdb/wiki/RocksDB-Overview",
                  "https://github.com/facebook/rocksdb/wiki/MemTable",
                  "https://github.com/google/leveldb/blob/main/doc/impl.md",
                  "https://storage.googleapis.com/gweb-research2023-media/pubtools/4443.pdf"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Bitcask keeps a current location for every key in memory.",
                  "continuation": "A log-structured merge tree, or LSM tree, instead buffers recent writes and organizes older keys in sorted files."
                }
              }
            },
            {
              "slug": "memtable-wal-and-sstable",
              "title": "Memtable, WAL, and SSTable",
              "kind": "lesson",
              "archive": {
                "slug": "memtable-wal-and-sstable",
                "file": "memtable-wal-and-sstable.md",
                "title": "Memtable, WAL, and SSTable",
                "displayTitle": "Memtable, WAL, and SSTable",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "storage-engines"
                ],
                "sources": [
                  "[[wiki/lsm-tree-storage-engine]]",
                  "[[wiki/database-wal-and-recovery]]",
                  "[[wiki/batching]]",
                  "https://github.com/facebook/rocksdb/wiki/Write-Ahead-Log-(WAL)",
                  "https://github.com/facebook/rocksdb/wiki/MANIFEST",
                  "https://github.com/facebook/rocksdb/wiki/MemTable",
                  "https://github.com/google/leveldb/blob/main/doc/table_format.md",
                  "https://storage.googleapis.com/gweb-research2023-media/pubtools/4443.pdf"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A memtable disappears when its process exits.",
                  "continuation": "A write-ahead log preserves recent mutations for recovery, while an SSTable stores a sorted, immutable batch."
                }
              }
            },
            {
              "slug": "lsm-read-path-bloom-and-sparse-index",
              "title": "LSM read path: Bloom filters and sparse index",
              "kind": "lesson",
              "archive": {
                "slug": "lsm-read-path-bloom-and-sparse-index",
                "file": "lsm-read-path-bloom-and-sparse-index.md",
                "title": "LSM read path: Bloom filters and sparse index",
                "displayTitle": "LSM read path: Bloom filters and sparse index",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "storage-engines"
                ],
                "sources": [
                  "[[wiki/memtable-wal-and-sstable]]",
                  "https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter",
                  "https://github.com/google/leveldb/blob/main/doc/table_format.md",
                  "https://github.com/facebook/rocksdb/wiki/Block-Cache"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A missing key can make an LSM reader search several files before answering.",
                  "continuation": "Three pieces of metadata reduce that work: key bounds reject impossible files, a Bloom filter rejects many remaining misses, and a sparse index narrows the search inside a file."
                }
              }
            },
            {
              "slug": "compaction-and-amplification",
              "title": "Compaction and amplification",
              "kind": "lesson",
              "archive": {
                "slug": "compaction-and-amplification",
                "file": "compaction-and-amplification.md",
                "title": "Compaction and amplification",
                "displayTitle": "Compaction and amplification",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "storage-engines"
                ],
                "sources": [
                  "[[wiki/lsm-tree-storage-engine]]",
                  "https://github.com/google/leveldb/blob/main/doc/impl.md",
                  "https://github.com/facebook/rocksdb/wiki/Leveled-Compaction",
                  "https://github.com/facebook/rocksdb/wiki/Universal-Compaction",
                  "https://github.com/facebook/rocksdb/wiki/Write-Stalls"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Compaction merges immutable files while removing versions that readers no longer need.",
                  "continuation": "It spends read and write work now to reduce the files, duplicates and deletion records retained afterward."
                }
              }
            },
            {
              "slug": "object-storage-vs-database",
              "title": "Object storage vs database",
              "kind": "lesson",
              "archive": {
                "slug": "object-storage-vs-database",
                "file": "object-storage-vs-database.md",
                "title": "Object storage vs database",
                "displayTitle": "Object storage vs database",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "object-storage"
                ],
                "sources": [
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
                  "https://www.postgresql.org/docs/18/datatype-binary.html",
                  "https://www.postgresql.org/docs/18/tutorial-transactions.html",
                  "[[wiki/metadata-db-for-object-storage]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Object storage gives callers named byte sequences to upload and retrieve from a bucket.",
                  "continuation": "A database can give them indexed queries and transactions over related records."
                }
              }
            },
            {
              "slug": "s3-object-storage-architecture",
              "title": "S3 object storage architecture",
              "kind": "lesson",
              "archive": {
                "slug": "s3-object-storage-architecture",
                "file": "s3-object-storage-architecture.md",
                "title": "S3 object storage architecture",
                "displayTitle": "S3 object storage architecture",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "object-storage"
                ],
                "sources": [
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html",
                  "https://sigops.org/s/conferences/sosp/2011/current/2011-Cascais/printable/11-calder.pdf",
                  "[[wiki/metadata-service-and-node-discovery]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An object service accepts named bytes, makes accepted versions readable and keeps them available through its promised failures.",
                  "continuation": "The difficult parts are deciding who owns each name, when a write becomes visible, and how stored bytes survive replacement of their servers."
                }
              }
            },
            {
              "slug": "range-partitioning-vs-consistent-hashing-storage",
              "title": "Range partitioning vs consistent hashing for storage",
              "kind": "lesson",
              "archive": {
                "slug": "range-partitioning-vs-consistent-hashing-storage",
                "file": "range-partitioning-vs-consistent-hashing-storage.md",
                "title": "Range partitioning vs consistent hashing for storage",
                "displayTitle": "Range partitioning vs consistent hashing for storage",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "object-storage"
                ],
                "sources": [
                  "[[wiki/sharding-and-partitioning]]",
                  "[[wiki/consistent-hashing]]",
                  "[[wiki/hot-partitions]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An object read supplies one exact key.",
                  "continuation": "A listing asks which keys exist under a prefix."
                }
              }
            },
            {
              "slug": "partition-manager-and-map-table",
              "title": "Partition manager and map table",
              "kind": "lesson",
              "archive": {
                "slug": "partition-manager-and-map-table",
                "file": "partition-manager-and-map-table.md",
                "title": "Partition manager and map table",
                "displayTitle": "Partition manager and map table",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "object-storage"
                ],
                "sources": [
                  "[[wiki/metadata-service-and-node-discovery]]",
                  "[[wiki/distributed-locks-and-leases]]",
                  "[[wiki/range-partitioning-vs-consistent-hashing-storage]]",
                  "[[wiki/consensus]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "A partition map tells the frontend where to send an object request. When ownership changes, that answer must stay connected to two facts: the new owner has the accepted data, and the former owner can no longer change it.",
                "mermaidCount": 1,
                "content": "# Partition manager and map table\n\nA partition map tells the frontend where to send an object request. When ownership changes, that answer must stay connected to two facts: the new owner has the accepted data, and the former owner can no longer change it.\n\nWe'll separate the manager's responsibilities from normal request routing, then follow one planned transfer through its final write and a stale-client retry.\n\n## Who maintains the assignment?\n\n| Component | Responsibility |\n|---|---|\n| Partition map | Durably record each key range, its serving owner and ownership generation. |\n| Partition manager | Assign and move ranges, split busy ranges, merge cold neighbors, and arrange recovery after failures. |\n| Partition server | Serve its assigned ranges; one server can own several. |\n| Coordination authority | Serialize manager decisions and establish valid ownership. |\n\nThe frontend caches map entries and sends requests directly to the partition server. The manager stays off this ordinary request path. It examines load and health to decide when assignments should change.\n\nAn assignment carries an **epoch**, a generation that changes on handoff. The receiver must enforce that authority where a write takes effect. A cached address is only a routing hint; publishing a new map cannot stop an old process by itself.\n\nFor this design, a range has **at most one active write owner**. A transfer may briefly leave it with none. Allowing an unavailable interval is safer than accepting independent changes at two owners without a reconciliation protocol.\n\n## A planned move\n\nA owns epoch 1. Its append-only file contains r1: `first` and a newline, six bytes. We copy those bytes to B while A remains active. Then A accepts r2: `second` and a newline, another seven bytes.\n\nB is now behind. Before switching owners, pause new writes at A, wait for any admitted effects to finish, copy the missing tail, and verify the destination. Only then activate B at epoch 2.\n\n```mermaid\nsequenceDiagram\n    accTitle: Copying the accepted writes before cutover\n    accDescr: A first copies r1 to B, then accepts r2. The manager pauses A, copies the r2 tail and verifies equality before activating B at epoch 2.\n    participant A as Owner A\n    participant M as Manager\n    participant B as Owner B\n    A->>B: Copy r1: 6 bytes\n    Note over A: Accept r2: 7 bytes\n    M->>A: Pause and drain writes\n    A->>B: Copy r2 tail\n    M->>M: Verify complete files match\n    M->>B: Activate epoch 2\n    Note over A: Epoch 1 can no longer write\n```\n\nIn the [object-storage example](/course-assets/system-design/m13-object-store.py), the append and cutover use the same Python lock. A request cannot pass its authority check, wait through cutover, and then append with stale permission. The check and effect occur inside one guarded section.\n\n```bash title=\"terminal\"\npython3 m13-object-store.py transfer\n```\n\n```output\ncopy snapshot: 6 bytes; A epoch=1 remains owner\nr2 during transfer: accepted\npause, copy tail: 7 bytes; equal=True; publish B epoch=2\ndelayed r3 at A epoch=1: stale or paused\nrefreshed r3 at B epoch=2: accepted\naccepted: [\"r1\",\"r2\",\"r3\"] ; B bytes: b'first\\nsecond\\nthird\\n'\nauthority and cutover lock are in memory; files are real\n```\n\nThe delayed r3 attempt adds nothing at A. Retrying against B with epoch 2 appends the third record, bringing B to 19 bytes. If the copied files differ before cutover, the example raises an error and leaves the assignment paused.\n\nThis runs a chosen sequence of calls, not concurrent threads. The files are real, but authority and accepted-operation history live in memory. It has no durable transfer journal or power-loss recovery protocol.\n\n## How much must we pause?\n\nPausing for the whole transfer is simpler: finish earlier writes, copy a fixed source, verify it, then switch. The cost is an unavailable write interval covering the entire copy.\n\nCopying while writes continue needs a snapshot boundary and a retained change history. Our append-only file uses a byte offset; a mutable database needs an equivalent agreement between snapshot and log. The final pause accounts for everything accepted after the snapshot. Measure that pause rather than assuming a small example proves acceptable downtime.\n\nNot every assignment change requires copying object bytes. With a separate durable storage layer, a new partition server can load the existing checkpoint and replay its log. The requirement is still to recover the accepted state and establish exclusive authority before serving writes.\n\n## Failure is different from a planned move\n\nA failed health check means the owner is suspected, not that its writes are impossible. The manager must prevent the old authority from taking effect even if that process resumes. [[wiki/distributed-locks-and-leases|Fencing]] supplies this boundary only when the resource receiving the writes enforces it.\n\nThe replacement also needs recoverable state outside the failed server. If A held the only copy, changing the map to B cannot recover its data. When replicas or shared storage exist, recover from them and the retained log before making B active.\n\nPersist transfer progress and assignments through the coordination authority. After a manager restart, it must determine whether B already accepted writes before deciding to resume or abandon a move. Reopening A's older file after B became active would discard accepted history. Electing one manager helps serialize decisions; it does not replace durable state or write enforcement.\n\n## Handling an old map\n\nReturn an explicit stale-assignment response so the frontend can refresh and retry within its original deadline. Keep the operation identity. If the first attempt succeeded but its reply was lost, the new owner needs the corresponding receipt or another deduplication rule; the rejected-r3 example does not cover that case.\n\nThose receipts belong with the transferred metadata. The next lesson makes the [[wiki/metadata-db-for-object-storage|object metadata and operation results]] persistent together.\n"
              }
            },
            {
              "slug": "metadata-db-for-object-storage",
              "title": "Metadata database for object storage",
              "kind": "lesson",
              "archive": {
                "slug": "metadata-db-for-object-storage",
                "file": "metadata-db-for-object-storage.md",
                "title": "Metadata database for object storage",
                "displayTitle": "Metadata database for object storage",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "object-storage"
                ],
                "sources": [
                  "[[wiki/database-locking-and-isolation]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "[[wiki/partition-manager-and-map-table]]",
                  "https://www.sqlite.org/lang_transaction.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An object store needs an authoritative record of which names exist and which bytes they identify.",
                  "continuation": "Keeping that metadata in a database lets us list names, check access and publish changes without scanning the storage fleet."
                }
              }
            },
            {
              "slug": "append-only-object-storage-stream-layer",
              "title": "Append-only stream layer",
              "kind": "lesson",
              "archive": {
                "slug": "append-only-object-storage-stream-layer",
                "file": "append-only-object-storage-stream-layer.md",
                "title": "Append-only stream layer",
                "displayTitle": "Append-only stream layer",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "object-storage"
                ],
                "sources": [
                  "[[wiki/log-structured-storage]]",
                  "[[wiki/immutable-versioned-data-files]]",
                  "[[wiki/compaction-and-amplification]]",
                  "[[wiki/end-to-end-checksums]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A storage layer can group object records in larger files and append new bytes at the end.",
                  "continuation": "This reduces scattered writes and per-file management, but moves work into indexing, sealing and reclaiming old data."
                }
              }
            },
            {
              "slug": "object-storage-durability-and-replication",
              "title": "Durability and replication",
              "kind": "lesson",
              "archive": {
                "slug": "object-storage-durability-and-replication",
                "file": "object-storage-durability-and-replication.md",
                "title": "Durability and replication",
                "displayTitle": "Durability and replication",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "object-storage"
                ],
                "sources": [
                  "[[wiki/replication]]",
                  "[[wiki/end-to-end-checksums]]",
                  "[[wiki/append-only-object-storage-stream-layer]]",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/DataDurability.html",
                  "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/global-infrastructure.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A successful write is a promise about what survives afterward.",
                  "continuation": "State which failures that promise covers, then place and verify enough recoverable data to meet it."
                }
              }
            },
            {
              "slug": "end-to-end-checksums",
              "title": "End-to-end checksums",
              "kind": "lesson",
              "archive": {
                "slug": "end-to-end-checksums",
                "file": "end-to-end-checksums.md",
                "title": "End-to-end checksums",
                "displayTitle": "End-to-end checksums",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "storage-engines"
                ],
                "sources": [
                  "[[wiki/custom-binary-file-format]]",
                  "[[wiki/compaction-and-amplification]]",
                  "https://docs.python.org/3/library/zlib.html",
                  "https://github.com/facebook/rocksdb/wiki/Full-File-Checksum-and-Checksum-Handoff"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Bytes can change while keeping their length and valid encoding.",
                  "continuation": "A parser may accept them, and replication may faithfully copy them."
                }
              }
            }
          ]
        },
        {
          "id": "learning-async-streams",
          "number": "08",
          "title": "Async work and streams",
          "summary": "Separate background work from requests and handle retries, ordering, and contention.",
          "units": [
            {
              "slug": "delegation-and-async-work",
              "title": "Delegation and async work",
              "kind": "lesson",
              "archive": {
                "slug": "delegation-and-async-work",
                "file": "delegation-and-async-work.md",
                "title": "Delegation and async work",
                "displayTitle": "Delegation and async work",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "queues",
                  "async"
                ],
                "sources": [
                  "[[wiki/retries-timeouts-idempotency]]",
                  "https://www.rabbitmq.com/docs/confirms",
                  "https://d1.awsstatic.com/builderslibrary/pdfs/avoiding-insurmountable-queue-backlogs.pdf",
                  "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An upload can finish before its thumbnail is ready.",
                  "continuation": "A report request can be accepted before the report is calculated."
                }
              }
            },
            {
              "slug": "task-queue-vs-event-stream",
              "title": "Task queue vs event stream",
              "kind": "lesson",
              "archive": {
                "slug": "task-queue-vs-event-stream",
                "file": "task-queue-vs-event-stream.md",
                "title": "Task queue vs event stream",
                "displayTitle": "Task queue vs event stream",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "queues",
                  "streams"
                ],
                "sources": [
                  "[[wiki/delegation-and-async-work]]",
                  "https://www.rabbitmq.com/docs/confirms",
                  "https://kafka.apache.org/42/getting-started/introduction/",
                  "https://kafka.apache.org/42/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html",
                  "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A report job needs a worker to finish it.",
                  "continuation": "A published post may need search, analytics and notifications to react independently."
                }
              }
            },
            {
              "slug": "event-bus-for-product-events",
              "title": "Event bus for product events",
              "kind": "lesson",
              "archive": {
                "slug": "event-bus-for-product-events",
                "file": "event-bus-for-product-events.md",
                "title": "Event bus for product events",
                "displayTitle": "Event bus for product events",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "events",
                  "outbox"
                ],
                "sources": [
                  "[[wiki/event-contracts]]",
                  "[[wiki/task-queue-vs-event-stream]]",
                  "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html",
                  "https://kafka.apache.org/42/getting-started/introduction/",
                  "https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Publishing a post may trigger search indexing, image processing, notifications and analytics.",
                  "continuation": "An event bus lets the product publish one fact while those consumers decide what to do with it."
                }
              }
            },
            {
              "slug": "queue-lag",
              "title": "Queue lag",
              "kind": "lesson",
              "archive": {
                "slug": "queue-lag",
                "file": "queue-lag.md",
                "title": "Queue lag",
                "displayTitle": "Queue lag",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "queues",
                  "backpressure"
                ],
                "sources": [
                  "[[wiki/backpressure]]",
                  "[[wiki/task-queue-vs-event-stream]]",
                  "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-available-cloudwatch-metrics.html",
                  "https://d1.awsstatic.com/builderslibrary/pdfs/avoiding-insurmountable-queue-backlogs.pdf",
                  "https://sre.google/workbook/implementing-slos/",
                  "https://web.mit.edu/1.041/www/lectures/L3-cumulative-diagram-2026sp.pdf"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Queue lag describes how far background work is behind.",
                  "continuation": "A fast accepting API can hide a stalled notification or indexing pipeline."
                }
              }
            },
            {
              "slug": "distributed-task-scheduler",
              "title": "Distributed task scheduler",
              "kind": "lesson",
              "archive": {
                "slug": "distributed-task-scheduler",
                "file": "distributed-task-scheduler.md",
                "title": "Distributed task scheduler",
                "displayTitle": "Distributed task scheduler",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "scheduling",
                  "workflows"
                ],
                "sources": [
                  "[[wiki/postgres-skip-locked-work-queue]]",
                  "[[wiki/distributed-locks-and-leases]]",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/",
                  "https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html",
                  "https://www.postgresql.org/docs/16/sql-select.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A worker can finish every job it receives and still miss tonight's cleanup.",
                  "continuation": "Someone must turn “run this later” into durable work, release it when due, and recover when a worker disappears."
                }
              }
            },
            {
              "slug": "postgres-skip-locked-work-queue",
              "title": "Postgres SKIP LOCKED work queue",
              "kind": "lesson",
              "archive": {
                "slug": "postgres-skip-locked-work-queue",
                "file": "postgres-skip-locked-work-queue.md",
                "title": "Postgres SKIP LOCKED work queue",
                "displayTitle": "Postgres SKIP LOCKED work queue",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "postgres",
                  "queues"
                ],
                "sources": [
                  "[[wiki/database-locking-and-isolation]]",
                  "[[wiki/distributed-locks-and-leases]]",
                  "https://www.postgresql.org/docs/16/sql-select.html",
                  "https://www.postgresql.org/docs/16/explicit-locking.html",
                  "https://www.postgresql.org/docs/16/routine-vacuuming.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A table can hold jobs beside the product data that creates them.",
                  "continuation": "Several workers can then claim different rows, commit, and work independently."
                }
              }
            },
            {
              "slug": "dag-workflow-orchestration",
              "title": "DAG workflow orchestration",
              "kind": "lesson",
              "archive": {
                "slug": "dag-workflow-orchestration",
                "file": "dag-workflow-orchestration.md",
                "title": "DAG workflow orchestration",
                "displayTitle": "DAG workflow orchestration",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "workflows",
                  "scheduling"
                ],
                "sources": [
                  "[[wiki/distributed-task-scheduler]]",
                  "[[wiki/event-bus-for-product-events]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html",
                  "https://argo-workflows.readthedocs.io/en/latest/walk-through/dag/",
                  "https://docs.aws.amazon.com/step-functions/latest/dg/state-parallel.html",
                  "https://docs.temporal.io/workflow-execution"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A document can be ready for processing while its publication step must wait.",
                  "continuation": "You need both its rendered preview and its search record before showing it to readers, and either branch can fail independently."
                }
              }
            },
            {
              "slug": "rule-engine-trigger-framework",
              "title": "Rule engine and trigger framework",
              "kind": "lesson",
              "archive": {
                "slug": "rule-engine-trigger-framework",
                "file": "rule-engine-trigger-framework.md",
                "title": "Rule engine and trigger framework",
                "displayTitle": "Rule engine and trigger framework",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "workflows",
                  "events"
                ],
                "sources": [
                  "[[wiki/event-contracts]]",
                  "[[wiki/event-bus-for-product-events]]",
                  "[[wiki/dag-workflow-orchestration]]",
                  "https://www.openpolicyagent.org/docs/management-decision-logs",
                  "https://jsonlogic.com/operations.html",
                  "https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-patterns.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "An order arrives, and the product wants some orders reviewed before fulfillment. The condition can change while old events remain available for replay. A rule engine must preserve why an action was selected, or the same recorded order can quietly acquire a different history each time a worker sees it.",
                "mermaidCount": 1,
                "content": "# Rule engine and trigger framework\n\nAn order arrives, and the product wants some orders reviewed before fulfillment. The condition can change while old events remain available for replay. A rule engine must preserve why an action was selected, or the same recorded order can quietly acquire a different history each time a worker sees it.\n\nThe same pattern can issue a rider incentive after delivery, a coupon after cart abandonment or a workflow after document approval. We'll define the event-to-action path, resolve overlapping rules, then replay an order under a changed policy.\n\n## A decision before an effect\n\n[[wiki/dag-workflow-orchestration|The workflow lesson]] started with an agreed set of steps. Here the first decision is whether that workflow should exist at all. An incoming event supplies facts; a versioned rule tests those facts and chooses an action obligation, such as creating a review task.\n\nKeep evaluating the rule separate from carrying out the action. Evaluation should produce the same decision from the same recorded input and rule version. That is a pure evaluation: it does not charge a card, send a message or ask a changing external database what the order looks like now. Effect workers use the identity and recovery agreements already established in Module 08.\n\nIf the rule needs additional facts, record those facts as inputs with their source versions or timestamps before evaluating. Otherwise a historical order can match differently because its customer's profile changed, even though the rule stayed fixed. Sometimes “use the current profile” is the intended product policy, but that evaluation must record which profile it actually used.\n\nNormalize the incoming event into a validated, typed input before matching. The rule store supplies an immutable policy version; matching produces a decision and an action obligation. In this proposed architecture, a dispatcher carries out the obligation later and records the outcome.\n\n```mermaid\nflowchart TD\n    accTitle: Match first, dispatch from a retained decision\n    accDescr: An event is validated and normalized before matching against a versioned rule store. The matcher commits a decision and action obligation together. A dispatcher executes the allowed action and records its outcome.\n    E[\"Event\"] --> N[\"Validate + normalize\"]\n    N --> M[\"Rule matcher\"]\n    R[\"Versioned rule store\"] --> M\n    M -->|One transaction| D[\"Decision + action obligation\"]\n    D --> W[\"Dispatcher\"]\n    W --> A[\"Allowed action\"]\n    A --> L[\"Execution outcome\"]\n```\n\nThe decision explains why work was requested; the execution outcome explains what happened. Preserve both. An audit log written after an external effect cannot repair a lost decision by itself.\n\n## The matching policy\n\nOur chosen event is `order-A`, with type `order.submitted`, schema version one and a quantity of 150 units. The units describe a synthetic order size, not a measured production threshold. Rule `review-large` matches at or above 100 units in rule set version one; `review-all` matches at or above zero.\n\nBoth rules can therefore match the same event. We choose a policy where the lower priority number wins, with rule identifier as a deterministic tie-breaker. They select the same action category, review, so matching both must still create only one review obligation. Another product could permit several independent actions, but it would need an identity for each action and a defined conflict policy.\n\nRead the table as the chosen rule data. The two version columns make the change visible without changing the recorded order.\n\n| Rule | Priority | Version one minimum | Version two minimum |\n|---|---|---|---|\n| `review-large` | 10 | 100 units | 200 units |\n| `review-all` | 20 | 0 units | 0 units |\n\n*Changing the threshold changes the selected rule; the retained order stays the same.*\n\nRule-set version and event-schema version answer different questions. The schema version says how to interpret the event fields, as [[wiki/event-contracts|the event contract lesson]] established. The rule-set version says which policy evaluates those fields. Store both with the evaluation, together with the matched rules and selected action, so an explanation does not depend on today's configuration.\n\n## A versioned replay\n\nThe [workflow replay](/course-assets/system-design/m15-workflows.py) stores evaluations and action obligations in a private temporary database; it creates no real review tasks or customer messages.\n\nThe evaluation key is event identity plus rule-set version, and the saved canonical input must agree on repeat delivery. `dispatch` records the first action obligation. `audit` records a new evaluation for comparison without issuing another action. A change of rule set on an ordinary repeat delivery is refused until someone explicitly requests that audit replay.\n\n```bash title=\"terminal\"\npython3 m15-workflows.py rules\n```\n```output\nv1: matches=review-large,review-all winner=review-large mode=dispatch\nsame input: duplicate\nchanged input: payload-conflict\nv2 ordinary delivery: requires-explicit-replay\nv2 explicit replay: matches=review-all winner=review-all mode=audit\naction feedback: ignored-type-or-schema\nevaluations=2 action obligations=1\n```\n\nThe two evaluations explain different policy decisions about the same order. They leave one business action because the original action identity, `order-A/review`, survives the rule edit. The changed-input probe submits 151 units under the original event identity and receives a conflict. That prevents an event producer from rewriting the explanation of an already accepted decision.\n\n## The rule representation\n\nOrdinary code is the simplest representation when developers own a small policy and deploy it with the application. Reviewers can use the existing code tools, and conditions can use the language's type checks. Its cost appears when a product operator needs to adjust a threshold independently or compare many historical policy versions.\n\nA restricted data representation makes those versions explicit. For example, this proposed JSON format describes the first review rule:\n\n```json\n{\n  \"rule_id\": \"review-large\",\n  \"event_type\": \"order.submitted\",\n  \"version\": 1,\n  \"priority\": 10,\n  \"condition\": {\n    \"field\": \"units\",\n    \"operator\": \"gte\",\n    \"value\": 100\n  },\n  \"action\": { \"type\": \"create_review\" }\n}\n```\n\nThis is our schema, not JsonLogic or a format parsed by the replay. A larger schema could compose allowed predicates with `and` and `or`. Define missing-field and type behavior explicitly: a numeric quantity and a string containing digits should not acquire accidental equivalence through an interpreter's coercion rules.\n\nStart with allowed fields, typed operators and named actions, and reject unknown combinations before publication. The fixture is narrower still: trusted tuples supply integer thresholds and fixed action names. It never evaluates arbitrary expression text, and it exposes no user scripting interface.\n\nUser-authored scripts can express more complex conditions but add execution limits, isolation and authorization requirements. Choose that capability only when a restricted language demonstrably cannot express the needed decisions. Moving an `if` statement into a string creates those obligations without making the policy more understandable.\n\nIndex candidate rules by event type, tenant, region, product or active time window when those fields exclude unrelated policies. Keep priority as a conflict-resolution rule, not permission to discard a lower-priority match needed for audit. The selector must preserve the result of evaluating the applicable rule set. Measure candidate counts and compare outcomes before introducing a cache of active rules. A worker that uses a stale rule version must reveal that version in its receipt.\n\n## Publication and feedback\n\nTreat a new rule set as immutable data that can be reviewed and exercised on saved examples before activation. Pin the selected version when accepting evaluation work so a later deployment does not change a queued event's policy silently. Compare its matches in audit mode first, then publish a version that future events can select. Returning to an older version changes future decisions; it does not revoke actions already accepted under the intervening version.\n\nThe [[wiki/event-bus-for-product-events|transactional outbox]] supplies the next boundary. Commit the evaluation and its action obligation together, then let a worker deliver it. The local replay retains that obligation but does not run a dispatcher. Calling the action while evaluating and recording the decision afterward leaves a crash window where the effect exists without its explanation.\n\nAn action may emit another event, creating a possible feedback loop. The fixture accepts only the originating `order.submitted` type and ignores a `review.created` event. Broader systems should define which event types can trigger which action types, retain causal identifiers, and bound repeated transitions. Deduplicating the same event does not stop a loop that generates a fresh event identity every time.\n\nFor this review policy, use immutable versions, one winning review action and audit-only historical re-evaluation. Change to action-producing replay only when the product explicitly owes new work and supplies new identities for it. The next lesson, [[wiki/fanout-patterns|fanout patterns]], follows actions owed to several recipients. Later, [[wiki/flash-sale-inventory-locking|inventory reservations]] put a harder limit on an action: matching a rule can request a unit, but only the stock owner can grant it. The booking and payment designs will carry that distinction across separate services.\n"
              }
            },
            {
              "slug": "fanout-patterns",
              "title": "Fanout patterns",
              "kind": "lesson",
              "archive": {
                "slug": "fanout-patterns",
                "file": "fanout-patterns.md",
                "title": "Fanout patterns",
                "displayTitle": "Fanout patterns",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "fanout",
                  "delivery"
                ],
                "sources": [
                  "[[wiki/event-bus-for-product-events]]",
                  "[[wiki/postgres-skip-locked-work-queue]]",
                  "[[wiki/batching]]",
                  "https://redis.io/docs/latest/develop/pubsub/",
                  "https://kafka.apache.org/42/getting-started/introduction/",
                  "https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An accepted publication can create work for several recipients, and those recipients can finish at different times.",
                  "continuation": "Retrying the whole publication after one failure risks repeating work that already succeeded."
                }
              }
            },
            {
              "slug": "flash-sale-inventory-locking",
              "title": "Flash sale inventory locking",
              "kind": "lesson",
              "archive": {
                "slug": "flash-sale-inventory-locking",
                "file": "flash-sale-inventory-locking.md",
                "title": "Flash sale inventory locking",
                "displayTitle": "Flash sale inventory locking",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "inventory",
                  "transactions"
                ],
                "sources": [
                  "[[wiki/ecommerce-product-listing-system-design]]",
                  "[[wiki/database-locking-and-isolation]]",
                  "[[wiki/distributed-locks-and-leases]]",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html",
                  "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html",
                  "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html",
                  "https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Two shoppers can see the same last unit on a product page.",
                  "continuation": "Their views can both be accurate when rendered, yet only one request may reserve that unit."
                }
              }
            }
          ]
        },
        {
          "id": "learning-search-retrieval",
          "number": "09",
          "title": "Search and retrieval",
          "summary": "Build indexes, process queries, and retrieve useful results.",
          "units": [
            {
              "slug": "information-retrieval-system-design",
              "title": "Information retrieval system design",
              "kind": "lesson",
              "archive": {
                "slug": "information-retrieval-system-design",
                "file": "information-retrieval-system-design.md",
                "title": "Information retrieval system design",
                "displayTitle": "Information retrieval system design",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "search"
                ],
                "sources": [
                  "https://nlp.stanford.edu/IR-book/html/htmledition/boolean-retrieval-1.html",
                  "https://www.postgresql.org/docs/18/textsearch-intro.html",
                  "https://www.elastic.co/docs/manage-data/data-store/text-analysis/index-search-analysis",
                  "https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-multi-match-query"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A reader remembers a lesson about keeping copies near the people who use them, but cannot remember its title.",
                  "continuation": "An exact identifier lookup gives you no way to answer that request."
                }
              }
            },
            {
              "slug": "inverted-index-and-posting-lists",
              "title": "Inverted index and posting lists",
              "kind": "lesson",
              "archive": {
                "slug": "inverted-index-and-posting-lists",
                "file": "inverted-index-and-posting-lists.md",
                "title": "Inverted index and posting lists",
                "displayTitle": "Inverted index and posting lists",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "search"
                ],
                "sources": [
                  "https://nlp.stanford.edu/IR-book/html/htmledition/a-first-take-at-building-an-inverted-index-1.html",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/positional-indexes-1.html",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/search-structures-for-dictionaries-1.html",
                  "https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/codecs/lucene103/Lucene103PostingsFormat.html",
                  "https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/index/IndexWriter.html",
                  "https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/util/fst/package-summary.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "The previous query found possible documents without re-reading every sentence.",
                  "continuation": "That shortcut needs something prepared in advance: for each searchable word, retain the identifiers of documents that contain it."
                }
              }
            },
            {
              "slug": "boolean-tiered-search",
              "title": "Boolean and tiered search",
              "kind": "lesson",
              "archive": {
                "slug": "boolean-tiered-search",
                "file": "boolean-tiered-search.md",
                "title": "Boolean and tiered search",
                "displayTitle": "Boolean and tiered search",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "search"
                ],
                "sources": [
                  "https://nlp.stanford.edu/IR-book/html/htmledition/processing-boolean-queries-1.html",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/positional-indexes-1.html",
                  "https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-match-query",
                  "https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-multi-match-query",
                  "https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-bool-query"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "A reader searches for cache index, and none of our documents contains both words. Returning nothing is defensible if both words are requirements. Returning separate cache and index lessons is defensible if the reader is exploring a topic. The service needs to choose that behavior explicitly before a score decides which document looks best.",
                "mermaidCount": 0,
                "content": "# Boolean and tiered search\n\nA reader searches for `cache index`, and none of our documents contains both words. Returning nothing is defensible if both words are requirements. Returning separate cache and index lessons is defensible if the reader is exploring a topic. The service needs to choose that behavior explicitly before a score decides which document looks best.\n\nWe'll keep required filters fixed, group strict and partial matches, and use term coverage or proximity when two groups are too coarse.\n\n## Requirements and preferences\n\n[[wiki/inverted-index-and-posting-lists|The posting-list lesson]] gave you posting lists and two ways to combine them. Requiring every query term uses their intersection, commonly expressed as AND. Accepting any query term uses their union, expressed as OR. These operators describe a matching condition; they do not measure how useful the resulting documents are.\n\nAn unknown token makes an AND intersection empty because its posting list is empty. An OR union can still contain documents matching the remaining tokens. That difference is often hidden behind a search box, but it changes what a successful response means. The user who typed a precise part number may be poorly served by a result that matches only its accompanying description.\n\nA condition supplied as a structured filter deserves separate treatment. An allowed-document set represents which documents may be exposed in this exercise. It is chosen test input, not an authentication implementation. Every retrieval tier intersects its candidates with that same set, so relevance fallback cannot turn an excluded document into a permitted one.\n\n### Which conditions may relax?\n\nTreat permissions and explicitly required filters as hard constraints. Treat an exploratory free-text query as a possible source of soft preferences when the interface says broader matches may appear. For a caller using an explicit “all words” search, keep AND semantics unless they request a broader search. A quiet fallback would make the response disagree with the request.\n\nThe alternatives are to return only strict matches, present broad matches separately, or mix all matches under one score. The last option is convenient, but a high score could put a partial match above a complete match unless the ranker also enforces the requirement. Choose separate ordered groups here because the behavior stays inspectable before we introduce numerical ranking.\n\n## Ordered fallback groups\n\nA group that runs under a particular matching rule is a tier. Our chosen policy first collects all permitted AND matches as tier zero. It then collects permitted OR matches that have not already appeared as tier one. The displayed response always appends the second tier, even when the first is nonempty; this differs from a policy that broadens only after an empty strict result.\n\nWithin each tier, identifiers sort ascending. A document appears once, under the earliest rule it satisfies. Later scoring may change order within a tier, but it may not move a tier-one document ahead of a tier-zero document under this contract. If the product wants that movement, it has chosen a different contract and should evaluate it as such.\n\nChoose the default from what the caller asked for:\n\n| Caller situation | Default | Reason |\n|---|---|---|\n| Every submitted word is required | AND only | Preserve the requested condition |\n| Exploring with useful partial matches | AND tier, then labeled OR tier | Keep complete matches first |\n| Any term is independently sufficient | OR with ranking | No complete-match priority promised |\n\n\n## One policy against several queries\n\nThe allowed set contains `d1`, `d2`, `d4`, `d5` and `d8`. Documents `d3`, `d6` and `d7` remain in the corpus but are excluded from this response. The exclusion is deliberately visible so you can follow a broadening attempt without confusing candidate generation with access permission.\n\nThe [shared Python replay](/course-assets/system-design/m16-search.py) executes the rules directly against the [eight chosen documents](/course-assets/system-design/m16-corpus.json). In the capture, each tuple pairs a document identifier with its tier number. Empty input has an explicit empty-result rule, so it does not turn into a request for every permitted document.\n\n```bash title=\"terminal\"\npython3 public/course-assets/system-design/m16-search.py boolean\n```\n\n```output\n'cache stores': AND=['d1'] OR=['d1', 'd2', 'd4'] tiers=[('d1', 0), ('d2', 1), ('d4', 1)]\n'cache index': AND=[] OR=['d1', 'd4', 'd5', 'd8'] tiers=[('d1', 1), ('d4', 1), ('d5', 1), ('d8', 1)]\n'queue cache': AND=[] OR=['d1', 'd4'] tiers=[('d1', 1), ('d4', 1)]\n'': AND=[] OR=[] tiers=[]\nall tiers retain allowed ids: ['d1', 'd2', 'd4', 'd5', 'd8']\n```\n\nFor `cache stores`, `d1` belongs to both raw sets but appears only in tier zero. The second group contains `d2` and `d4`; retaining `d1` again would make a later limit or evaluation count the same document twice. Deduplication belongs before the response is bounded or measured.\n\nFor `cache index`, the strict group is empty, so every result is a broader match. The response still carries tier one on each identifier. A UI can label that group “Matches some words” instead of presenting it as if every word had matched. The backend has already retained enough information for that explanation.\n\nFor `queue cache`, broader search still cannot expose the queue documents. Both are outside the allowed set. An empty strict result does not distinguish an absent document from an excluded one, and the public response should not reveal hidden document text to explain the difference. A diagnostic view needs its own access boundary.\n\n## Work limits and missing answers\n\nTaking the first few candidates before deduplication can fill the response with repeats. Taking a global score sort after grouping can erase tier priority. The two-tier replay retains the complete small result and therefore avoids both interactions. If you add a limit, apply it to the final deduplicated ordered sequence and document whether a nonempty strict tier may leave space for broader results.\n\nChoose strict retrieval for explicit requirements, and ordered broader groups for this exploratory course search. Revisit that choice when [[wiki/search-evaluation-metrics|search evaluation]] supplies judgments showing which returned documents actually answer the intended question. A larger candidate set can recover a useful document and can also add irrelevant ones; result count alone cannot choose between those effects.\n\n## More than two tiers\n\nFor a longer query, OR groups very different matches together. A four-term query can use four coverage levels: all four, any three, any two, then any one. Each document belongs to its highest satisfied level and appears once. Repeated query words do not create extra requirements in this chosen policy.\n\nFor `database index maps rows`, `d5` contains all four terms. No document contains exactly three. `d2` contains `database` and `rows`, while `d8` contains only `index`. The replay's additional coverage example returns the best two documents from those ordered groups:\n\n```bash title=\"terminal\"\npython3 public/course-assets/system-design/m16-search.py coverage\n```\n```output\nquery='database index maps rows' distinct terms=4\nall coverage tiers: [('d5', 4), ('d2', 2), ('d8', 1)]\nlimit 2: [('d5', 4), ('d2', 2)]\n```\n\nHere the number is matched-term count, not the earlier zero/one tier label. A real ranker can use BM25 within each coverage level while keeping the level as the primary ordering key. A boost alone does not guarantee that ordering.\n\nA production query can require a minimum number of optional clauses. For example, Elasticsearch's `minimum_should_match` controls eligibility; it does not automatically implement this sequence of ranked groups. When combining text clauses with a required filter, set that minimum explicitly if text must match. A bool query with a filter otherwise defaults to zero required `should` clauses.\n\nChoose whether to fetch every group or only broaden until the page is full. The replay counts all eligible candidates, sorts and then limits; it does not save retrieval work through early stopping. A staged implementation can reuse postings, exclude seen IDs and stop once enough results are retained. Keep query, filters and ordering stable across pagination so broadening does not introduce repeats or skip earlier groups.\n\n## Presence, proximity and fields\n\nMatching all the words does not mean matching their relationship. `cache stores` is adjacent in `d1`; `cache copies` occurs there with `stores` between them. Both pass AND. Only the first passes a zero-gap phrase condition. A positional check can require adjacency or allow a defined window, with ordered and unordered windows answering different questions.\n\nUse phrase or proximity evidence within a tier when nearby words better express the intent. Requiring a phrase is stricter than giving it a ranking preference. Preserve that distinction when broadening: quoted words should not silently become unrelated words anywhere in a document.\n\nFields matter too. Requiring all terms in a title differs from allowing one in the title and another in the body. In Elasticsearch, `multi_match` with `best_fields` applies AND inside each field. A term-centric query such as `combined_fields` can match terms spread across compatible fields. Choose the intended rule before tuning title boosts.\n\nAn empty strict result can signal a typo, missing synonym, absent source item, unavailable inventory or indexing lag. Record enough internal diagnostics to distinguish them. Increasing breadth is useful only when the extra documents answer the need. The [[wiki/query-understanding-pipeline|query-understanding lesson]] changes which terms are searched; [[wiki/tf-idf-relevance-scoring|the next lesson]] orders equally eligible documents with a specified numerical baseline.\n"
              }
            },
            {
              "slug": "tf-idf-relevance-scoring",
              "title": "TF-IDF relevance scoring",
              "kind": "lesson",
              "archive": {
                "slug": "tf-idf-relevance-scoring",
                "file": "tf-idf-relevance-scoring.md",
                "title": "TF-IDF relevance scoring",
                "displayTitle": "TF-IDF relevance scoring",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "search"
                ],
                "sources": [
                  "https://nlp.stanford.edu/IR-book/html/htmledition/inverse-document-frequency-1.html",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/dot-products-1.html",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/sublinear-tf-scaling-1.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Our candidate policy can admit several documents without deciding which one should appear first.",
                  "continuation": "For cache index, every matching document in the fixture contains just one of those words."
                }
              }
            },
            {
              "slug": "bm25-production-ranking",
              "title": "BM25 production ranking",
              "kind": "lesson",
              "archive": {
                "slug": "bm25-production-ranking",
                "file": "bm25-production-ranking.md",
                "title": "BM25 production ranking",
                "displayTitle": "BM25 production ranking",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "search"
                ],
                "sources": [
                  "https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables",
                  "https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-explain",
                  "https://lucene.apache.org/core/10_3_1/core/org/apache/lucene/search/similarities/BM25Similarity.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A document can repeat the same query word many times without becoming proportionally more useful.",
                  "continuation": "Another document may mention the word once inside a much longer discussion."
                }
              }
            },
            {
              "slug": "stop-words-and-champion-lists",
              "title": "Stop words and champion lists",
              "kind": "lesson",
              "archive": {
                "slug": "stop-words-and-champion-lists",
                "file": "stop-words-and-champion-lists.md",
                "title": "Stop words and champion lists",
                "displayTitle": "Stop words and champion lists",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "search"
                ],
                "sources": [
                  "https://nlp.stanford.edu/IR-book/html/htmledition/champion-lists-1.html",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/dropping-common-terms-stop-words-1.html",
                  "https://www.elastic.co/docs/reference/text-analysis/analysis-stop-tokenfilter"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "A scoring function cannot rescue a document that was removed before scoring began. We can reduce search work by omitting common words or retaining only selected candidates for each term, but each shortcut discards information. The useful question is which queries lose an answer when that information disappears.",
                "mermaidCount": 1,
                "content": "# Stop words and champion lists\n\nA scoring function cannot rescue a document that was removed before scoring began. We can reduce search work by omitting common words or retaining only selected candidates for each term, but each shortcut discards information. The useful question is which queries lose an answer when that information disappears.\n\nWe'll compare removing words with capping candidates, then follow how each changes the results.\n\n## Removing words from the representation\n\n[[wiki/bm25-production-ranking|The BM25 lesson]] kept every analyzed token and let document frequency influence its weight. Another approach removes selected words entirely. A configured list of words to omit is a stop-word list. Commonness may motivate the choice, but the actual removal is a product and language policy rather than a consequence of the score formula.\n\nOur experiment chooses exactly `a`, `and` and `to`. They are test inputs, not a recommended English stop list. The unchanged corpus retains them; the replay creates a separate pruned copy so later lessons continue to use the same source texts and statistics.\n\nDeleting tokens can change more than whether a term is searchable. If the remaining tokens are packed together, their positions change. The original `d5` text includes `keys to rows`. A packed pruned representation contains `keys rows`, so a request for that exact adjacent phrase can match even though the original document did not contain it.\n\nThe posting-list lesson's phrase helper checks adjacent analyzed tokens. In this experiment the stop policy is applied to both document and query text. That lets `keys to rows` continue to match after both sides lose `to`, while the distinct literal request `keys rows` also becomes a match. Preserving the original position gaps would avoid that particular adjacency error, though queries requiring a removed word would still need a representation that retained it.\n\n## Which common words are expendable?\n\nInspect both how widely a term occurs (`df / N`) and how often it repeats. Define the averaging population: total occurrences divided by all documents differs from the average among matching documents. These are diagnostics, not a universal rule for deleting terms.\n\nIn a database-only catalog, `database` may occur almost everywhere yet still matter in an exact title. A required word, negation or direction can be essential even when it has little ranking weight. Review representative title and phrase queries before choosing a stop list. Lower weighting retains evidence that deletion removes.\n\nA configured language list is only a starting policy. Elasticsearch's stop filter allows explicit words, language lists and case handling. Its trailing-token option also matters for completion: removing the word currently being typed can change the offered suggestions. Our experiment does not emulate that analyzer; it deliberately repacks tokens to expose the phrase error.\n\n## Keeping selected candidates\n\nThere is another way to reduce work without deleting a word: retain a small preselected list of documents for it. Such a retained subset is called a champion list. The subset is chosen before the full query is known. It can be built for any term, not only common words; list sizes can differ by term.\n\nOur chosen cap is one document per term. Build each list by scoring that single term with our BM25 variant and retaining the highest result, using identifier order for ties. At query time, take the union of the retained lists, then apply the full requested matching condition to those candidates. This is a candidate restriction, not a complete implementation of arbitrary top-result search.\n\nFor `database`, the equal-length single-term tie retains `d2` ahead of `d5`. For `index`, the shorter document `d8` wins over `d5`. The combined query `database index` therefore begins with only `d2` and `d8` available, even though `d5` contains both terms. A document that is second for each individual term can be the best combined answer.\n\nThe two retained single-term winners contain different words. Requiring both after the cap cannot recover `d5`:\n\n```mermaid\nflowchart TD\n    accTitle: A per-term cap loses the combined match\n    accDescr: Database retains d2 and index retains d8. Their union contains d2 and d8; requiring both terms returns no document. A separate full posting-list path retains d5, which contains both query terms.\n    Q[\"database index\"] --> C[\"One champion per term\"]\n    C --> U[\"Candidates: d2, d8\"]\n    U --> A[\"Require both terms\"]\n    A --> E[\"No result\"]\n    Q --> F[\"Complete posting lists\"]\n    F --> D[\"Require both: d5\"]\n```\n\n## The losses in one capture\n\nThe [Python replay](/course-assets/system-design/m16-search.py) performs both transformations from the [original corpus](/course-assets/system-design/m16-corpus.json). `original` and `pruned` label separately analyzed document sets. The champion portion prints complete either-term candidates, retained candidates and the result after requiring both query terms.\n\n```bash title=\"terminal\"\npython3 public/course-assets/system-design/m16-search.py pruning\n```\n\n```output\nstop words: ['a', 'and', 'to']\ntoken occurrences: 50 -> 43\nphrase keys to rows: original= ['d5'] pruned= ['d5']\nphrase keys rows: original= [] pruned= ['d5']\nchampions database/index: {'database': ['d2'], 'index': ['d8']}\nfull OR candidates: ['d2', 'd5', 'd8'] capped candidates: ['d2', 'd8']\nfull AND: ['d5'] capped then AND: [] missed: ['d5']\n```\n\nFifty token occurrences become forty-three under the selected stop policy. That is a count of retained occurrences, not measured index bytes or a latency improvement. The byte layout of a real posting list could include dictionaries, offsets, positions and compression, each with its own cost.\n\nThe champion restriction removes `d5`, so the required-term check returns nothing. Running the scorer over the retained documents cannot repair that result because the missing identifier never reaches it. Keeping a complete index behind the shortcut would allow a fallback, but that means the complete representation and its maintenance cost still exist.\n\n## The policy boundary\n\nFor this corpus, retain every token and the complete posting lists. Their counts are small, and the counterexamples give a concrete cost for removing information. If a measured workload later makes common-term traversal expensive, first consider a query-specific policy that preserves required phrases and filters. That lets a broad browsing request accept a shortcut without silently changing exact phrase semantics.\n\nChoose the shortcut from the kind of answer the caller expects:\n\n| Query contract | Default | Reason |\n|---|---|---|\n| Required words or exact phrase | Complete retained representation | Omitted evidence can change eligibility |\n| Broad exploration with complete fallback | Try bounded candidates, then complete search | Recover misses at additional work |\n| Explicitly approximate suggestions | Evaluated candidate cap | The product accepts evaluated coverage loss |\n\n\n\nChampion selection can also incorporate a quality or freshness score, but that still chooses candidates before the complete query. Keeping a full fallback costs storage and maintenance; omitting it accepts a loss that must be evaluated.\n\nChoosing query-specific pruning adds branches that need tests. A rule that ignores `to` in a broad topic query must not also erase it from an exact title request. Keeping a separate phrase-capable representation is another option, with the cost of another field or index. Choose that complexity only when the query contract and measurements justify it.\n\n## Evidence before an approximation\n\nThe missed `d5` is an exact matching failure, which requires no user judgment to detect. Whether dropping a broader result harms the reader is a different question. [[wiki/search-evaluation-metrics|Search evaluation]] will label documents against particular information needs and compare what the result list preserves.\n\nChampion lists also need a publication boundary. Recomputing them after documents change can alter who survives the cap; an outdated champion entry may refer to a removed or now-inaccessible document. [[wiki/search-index-synchronization|Index synchronization]] owns that version and deletion work. A preselected list never replaces the access check before exposure.\n\nThe next lesson changes another part of the path: it interprets the caller's words before retrieval. [[wiki/query-understanding-pipeline|Query understanding]] makes those transformations visible so that a broader answer can be traced to a chosen rule rather than mistaken for a match to the original request.\n"
              }
            },
            {
              "slug": "query-understanding-pipeline",
              "title": "Query understanding pipeline",
              "kind": "lesson",
              "archive": {
                "slug": "query-understanding-pipeline",
                "file": "query-understanding-pipeline.md",
                "title": "Query understanding pipeline",
                "displayTitle": "Query understanding pipeline",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "search"
                ],
                "sources": [
                  "https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-fuzzy-query",
                  "https://www.elastic.co/docs/solutions/search/full-text/search-with-synonyms",
                  "https://www.elastic.co/docs/reference/elasticsearch/plugins/analysis-phonetic"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A reader types DB INDEX, while a document says database index.",
                  "continuation": "Lowercasing fixes the capitals."
                }
              }
            },
            {
              "slug": "search-feedback-and-relevance-signals",
              "title": "Search feedback and relevance signals",
              "kind": "lesson",
              "archive": {
                "slug": "search-feedback-and-relevance-signals",
                "file": "search-feedback-and-relevance-signals.md",
                "title": "Search feedback and relevance signals",
                "displayTitle": "Search feedback and relevance signals",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "search"
                ],
                "sources": [
                  "https://www.cs.cornell.edu/people/tj/publications/joachims_etal_05a.pdf",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/pagerank-1.html",
                  "https://docs.vespa.ai/en/learn/tutorials/hybrid-search.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A click tells you that a result was chosen from what the reader encountered.",
                  "continuation": "It does not tell you what they would have chosen under another ordering, or whether the destination answered their question."
                }
              }
            },
            {
              "slug": "search-evaluation-metrics",
              "title": "Search evaluation metrics",
              "kind": "lesson",
              "archive": {
                "slug": "search-evaluation-metrics",
                "file": "search-evaluation-metrics.md",
                "title": "Search evaluation metrics",
                "displayTitle": "Search evaluation metrics",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "search"
                ],
                "sources": [
                  "https://nlp.stanford.edu/IR-book/html/htmledition/information-retrieval-system-evaluation-1.html",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/assessing-relevance-1.html",
                  "https://www.cs.cornell.edu/people/tj/publications/joachims_etal_05a.pdf"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "The BM25 ordering moved d8 ahead of d5 for index.",
                  "continuation": "That change becomes an improvement only after we say what the reader wanted and how useful each document is for that need."
                }
              }
            },
            {
              "slug": "search-index-synchronization",
              "title": "Search index synchronization",
              "kind": "lesson",
              "archive": {
                "slug": "search-index-synchronization",
                "file": "search-index-synchronization.md",
                "title": "Search index synchronization",
                "displayTitle": "Search index synchronization",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "search",
                  "consistency"
                ],
                "sources": [
                  "[[wiki/search-evaluation-metrics]]",
                  "[[wiki/event-bus-for-product-events]]",
                  "[[wiki/immutable-versioned-data-files]]",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html",
                  "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/refresh-parameter"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "You correct a document, save it, and search for the corrected word.",
                  "continuation": "The document page shows your edit while the results still reflect its earlier text."
                }
              }
            },
            {
              "slug": "search-index-sharding",
              "title": "Search index sharding",
              "kind": "lesson",
              "archive": {
                "slug": "search-index-sharding",
                "file": "search-index-sharding.md",
                "title": "Search index sharding",
                "displayTitle": "Search index sharding",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "search",
                  "partitioning"
                ],
                "sources": [
                  "[[wiki/search-index-synchronization]]",
                  "[[wiki/bm25-production-ranking]]",
                  "[[wiki/sharding-and-partitioning]]",
                  "https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-search",
                  "https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards",
                  "https://research.google/pubs/the-tail-at-scale/",
                  "https://ying-zhang.cn/cluster/2013-tail-at-scale.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A result near the top of one machine's list may sit below another machine's best matches.",
                  "continuation": "Dividing documents among owners therefore creates a second job: assembling one ranked answer from their contributions."
                }
              }
            },
            {
              "slug": "crawler-and-indexing-pipeline",
              "title": "Crawler and indexing pipeline",
              "kind": "lesson",
              "archive": {
                "slug": "crawler-and-indexing-pipeline",
                "file": "crawler-and-indexing-pipeline.md",
                "title": "Crawler and indexing pipeline",
                "displayTitle": "Crawler and indexing pipeline",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "search",
                  "ingestion"
                ],
                "sources": [
                  "[[wiki/search-index-synchronization]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "https://www.rfc-editor.org/rfc/rfc9309.html",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/crawler-architecture-1.html",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/the-url-frontier-1.html",
                  "https://www.rfc-editor.org/rfc/rfc9110.html#name-retry-after"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A document can exist without anyone telling your search service that it exists.",
                  "continuation": "A link from a known page may be your first clue."
                }
              }
            },
            {
              "slug": "vector-search-and-hybrid-retrieval",
              "title": "Vector search and hybrid retrieval",
              "kind": "lesson",
              "archive": {
                "slug": "vector-search-and-hybrid-retrieval",
                "file": "vector-search-and-hybrid-retrieval.md",
                "title": "Vector search and hybrid retrieval",
                "displayTitle": "Vector search and hybrid retrieval",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "search",
                  "ranking"
                ],
                "sources": [
                  "[[wiki/tf-idf-relevance-scoring]]",
                  "[[wiki/bm25-production-ranking]]",
                  "[[wiki/search-evaluation-metrics]]",
                  "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion",
                  "https://github.com/facebookresearch/faiss/wiki/Faiss-indexes",
                  "https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html",
                  "https://www.sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Two documents can describe related work while using different words.",
                  "continuation": "You can build another candidate path that compares a numerical representation of those documents, then combine its results with exact term matches."
                }
              }
            },
            {
              "slug": "autocomplete-system-design",
              "title": "Design: autocomplete",
              "kind": "design",
              "archive": {
                "slug": "autocomplete-system-design",
                "file": "autocomplete-system-design.md",
                "title": "Design: autocomplete",
                "displayTitle": "Design: autocomplete",
                "type": "design",
                "tags": [
                  "system-design",
                  "search",
                  "autocomplete"
                ],
                "sources": [
                  "https://www.greatfrontend.com/interviews/study/openai/questions/system-design/autocomplete",
                  "https://engineering.fb.com/2010/05/17/web/the-life-of-a-typeahead-query/",
                  "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-suggesters",
                  "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/",
                  "https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort",
                  "[[wiki/query-understanding-pipeline]]",
                  "[[wiki/recent-searches-system-design]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 3,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Autocomplete returns a short list of useful completions while someone types.",
                  "continuation": "We will design it for a shop: typing cam should offer products such as a camera or camera bag, and choosing a suggestion should open that product."
                }
              }
            },
            {
              "slug": "did-you-mean-and-spell-correction",
              "title": "Design: did-you-mean and spell correction",
              "kind": "design",
              "archive": {
                "slug": "did-you-mean-and-spell-correction",
                "file": "did-you-mean-and-spell-correction.md",
                "title": "Design: did-you-mean and spell correction",
                "displayTitle": "Design: did-you-mean and spell correction",
                "type": "design",
                "tags": [
                  "system-design",
                  "search",
                  "spelling"
                ],
                "sources": [
                  "[[wiki/query-understanding-pipeline]]",
                  "[[wiki/search-feedback-and-relevance-signals]]",
                  "[[wiki/search-evaluation-metrics]]",
                  "[[wiki/inverted-index-and-posting-lists]]",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/edit-distance-1.html",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/implementing-spelling-correction-1.html",
                  "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-suggesters",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/context-sensitive-spelling-correction-1.html",
                  "https://nlp.stanford.edu/IR-book/html/htmledition/k-gram-indexes-for-spelling-correction-1.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "You search for cach, and the results do not include the document you expected.",
                  "continuation": "Offering cache may help, but automatically replacing every unfamiliar word would also damage valid names and identifiers."
                }
              }
            },
            {
              "slug": "related-searches",
              "title": "Design: related searches",
              "kind": "design",
              "archive": {
                "slug": "related-searches",
                "file": "related-searches.md",
                "title": "Design: related searches",
                "displayTitle": "Design: related searches",
                "type": "design",
                "tags": [
                  "system-design",
                  "search",
                  "suggestions"
                ],
                "sources": [
                  "[[wiki/query-understanding-pipeline]]",
                  "[[wiki/search-feedback-and-relevance-signals]]",
                  "[[wiki/search-index-synchronization]]",
                  "[[wiki/search-evaluation-metrics]]",
                  "https://blog.google/products-and-platforms/products/search/how-we-keep-google-search-relevant-and-useful/",
                  "https://chato.cl/papers/boldi_2009_query_recommendations.pdf",
                  "https://www.microsoft.com/en-us/research/publication/query-suggestion-using-hitting-time/",
                  "https://arxiv.org/abs/2108.04452"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Someone has searched for cache and may want to investigate eviction next.",
                  "continuation": "That suggestion changes the topic of the next query rather than repairing the spelling of the first."
                }
              }
            },
            {
              "slug": "recent-searches-system-design",
              "title": "Design: recent searches",
              "kind": "design",
              "archive": {
                "slug": "recent-searches-system-design",
                "file": "recent-searches-system-design.md",
                "title": "Design: recent searches",
                "displayTitle": "Design: recent searches",
                "type": "design",
                "tags": [
                  "system-design",
                  "search",
                  "history"
                ],
                "sources": [
                  "[[wiki/document-vs-key-value-stores]]",
                  "[[wiki/keyset-pagination]]",
                  "[[wiki/caching-layers]]",
                  "[[wiki/data-retention-and-deletion]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "https://support.google.com/websearch/answer/6096136?co=GENIE.Platform%3DAndroid&hl=en",
                  "https://redis.io/docs/latest/develop/data-types/sorted-sets/",
                  "https://redis.io/docs/latest/commands/zrange/",
                  "https://redis.io/docs/latest/develop/programmability/eval-intro/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "You open a search box on another device and expect to find the query you used earlier.",
                  "continuation": "You also expect a query you deleted to stay out of that list."
                }
              }
            }
          ]
        },
        {
          "id": "learning-analytics-sketches",
          "number": "10",
          "title": "Analytics and sketches",
          "summary": "Aggregate events and use compact data structures when exact answers cost too much.",
          "units": [
            {
              "slug": "counting-at-scale",
              "title": "Counting at scale",
              "kind": "lesson",
              "archive": {
                "slug": "counting-at-scale",
                "file": "counting-at-scale.md",
                "title": "Counting at scale",
                "displayTitle": "Counting at scale",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "analytics",
                  "counters"
                ],
                "sources": [
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://sqlite.org/lang_upsert.html",
                  "https://firebase.google.com/docs/firestore/solutions/counters",
                  "https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/",
                  "[[wiki/hot-partitions]]",
                  "[[wiki/mergeable-sketches-for-analytics]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A like count is a projection of facts: which accounts currently like a post.",
                  "continuation": "A view count may instead count qualifying visits, including repeated visits by one account."
                }
              }
            },
            {
              "slug": "view-counting-at-scale",
              "title": "View counting at scale",
              "kind": "lesson",
              "archive": {
                "slug": "view-counting-at-scale",
                "file": "view-counting-at-scale.md",
                "title": "View counting at scale",
                "displayTitle": "View counting at scale",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "analytics",
                  "events"
                ],
                "sources": [
                  "[[wiki/counting-at-scale]]",
                  "[[wiki/hyperloglog-cardinality-estimation]]",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/stateful-stream-processing/",
                  "https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/",
                  "https://support.google.com/youtube/answer/2991785?hl=en",
                  "https://redis.io/docs/latest/develop/data-types/probabilistic/count-min-sketch/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A view counter turns client observations into a product metric.",
                  "continuation": "Starting a video, watching for a chosen duration and finishing it are different events."
                }
              }
            },
            {
              "slug": "impression-counting-system-design",
              "title": "Impression counting",
              "kind": "lesson",
              "archive": {
                "slug": "impression-counting-system-design",
                "file": "impression-counting-system-design.md",
                "title": "Impression counting",
                "displayTitle": "Impression counting",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "analytics",
                  "impressions"
                ],
                "sources": [
                  "https://www.w3.org/TR/intersection-observer/",
                  "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API/Timing_element_visibility",
                  "https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/",
                  "https://redis.io/docs/latest/commands/pfmerge/",
                  "https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/",
                  "[[wiki/search-feedback-and-relevance-signals]]",
                  "[[wiki/view-counting-at-scale]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An impression records an exposure under a stated rule.",
                  "continuation": "It does not necessarily mean a unique person: one account can see an item in several displays."
                }
              }
            },
            {
              "slug": "hyperloglog-cardinality-estimation",
              "title": "HyperLogLog cardinality estimation",
              "kind": "lesson",
              "archive": {
                "slug": "hyperloglog-cardinality-estimation",
                "file": "hyperloglog-cardinality-estimation.md",
                "title": "HyperLogLog cardinality estimation",
                "displayTitle": "HyperLogLog cardinality estimation",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "probabilistic-structures"
                ],
                "sources": [
                  "https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf",
                  "https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/",
                  "https://datasketches.apache.org/docs/HLL/HllSketches.html",
                  "[[wiki/mergeable-sketches-for-analytics]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Repeated arrivals can increase an event counter without increasing the number of distinct identities.",
                  "continuation": "An exact set handles that distinction by keeping the identities and counting its entries."
                }
              }
            },
            {
              "slug": "mergeable-sketches-for-analytics",
              "title": "Mergeable sketches for analytics",
              "kind": "lesson",
              "archive": {
                "slug": "mergeable-sketches-for-analytics",
                "file": "mergeable-sketches-for-analytics.md",
                "title": "Mergeable sketches for analytics",
                "displayTitle": "Mergeable sketches for analytics",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "probabilistic-structures"
                ],
                "sources": [
                  "https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf",
                  "https://github.com/CamDavidsonPilon/tdigest",
                  "https://datasketches.apache.org/docs/Architecture/KeyFeatures.html",
                  "https://datasketches.apache.org/docs/HLL/HllSketches.html",
                  "https://roaringbitmap.org/",
                  "[[wiki/tdigest-quantile-sketch]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "A mergeable summary lets workers combine retained state without sending every original event to one reader. Regions, shards and time buckets can each produce a summary, then supply it to a larger report.",
                "mermaidCount": 1,
                "content": "# Mergeable sketches for analytics\n\nA mergeable summary lets workers combine retained state without sending every original event to one reader. Regions, shards and time buckets can each produce a summary, then supply it to a larger report.\n\nWe'll choose a summary by its query, compare a merged build with one pass over the input, and see what happens when a partition arrives twice.\n\n## Start with the query\n\n| Required answer | Candidate | Detail it must preserve |\n|---|---|---|\n| Approximate distinct IDs | HLL | Compatible identity and hash observations |\n| Estimated frequency of a supplied key | Count-Min Sketch | Counter mass and matching row hashes |\n| Frequent items | A frequent-items sketch | Candidate identities and its frequency guarantees |\n| Latency percentiles | A suitable quantile sketch | Distribution evidence and observation weights |\n| Exact integer-set operations | Roaring bitmap | Exact integer membership |\n\nRoaring is a compressed exact set representation, not an approximate count. HLL supports union, while other distinct-count families, such as Theta, support additional set operations. These choices are not interchangeable simply because all can combine stored state.\n\nLocal summaries reduce transport and allow precomputed rollups or “last N buckets” queries. They can also rebuild a larger rollup from retained smaller summaries. A new metric or dimension may still require raw events: a summary cannot restore information it never kept.\n\n## Compatible evidence\n\nWe split the twelve document-ID occurrences used in the HLL lesson into a left partition containing the first six and a right partition containing the remaining six. Their arrival occurrences are disjoint, although some document IDs appear in both. Processing their union gives twelve occurrences and nine distinct IDs under the same string-identity rule.\n\nFor Bloom filters, merge corresponding bits with logical OR. If either input has set a position, the combined filter sets it. For HLL, merge corresponding registers by maximum. Each combined register then holds the strongest observation seen by either partition.\n\nFor a count-min sketch, add corresponding counters. Each counter receives the sum of the contributions assigned to it by both partitions. That operation represents combined event mass only when each contribution belongs in the intended population with the multiplicity being added.\n\nThese rules require compatible layouts. The Bloom filter needs the same array length, probe count, hash scheme, and input encoding. HLL needs the same precision, hash width, and register interpretation. Count-min needs matching matrix dimensions and row hashes. Matching payload size alone does not establish compatibility.\n\n## The local merge path\n\nOur [replay](/course-assets/system-design/m18-sketches.py) builds each summary separately for the two partitions, merges them, and compares their retained states against a single pass over the whole stream. It also attempts incompatible merges, which its wrappers explicitly reject. No network transport or distributed coordination is implemented here.\n\nThe diagram separates the observed partition summaries from the external contribution receipts used later in the replay. A receipt identifies a partition already included in a total; it is application state, with a different role from hash registers or shared counters.\n\n```mermaid\nflowchart TD\n    accTitle: Merge summaries over a declared population\n    accDescr: Left and right partitions produce compatible summaries. The merger combines their state and compares it with a single pass over the whole input. Contribution receipts are separate application state for additive summaries.\n    left[First six arrivals] --> ls[Left summary]\n    right[Last six arrivals] --> rs[Right summary]\n    ls --> merge[Compatible merge]\n    rs --> merge\n    receipts[Contribution receipts] -.->|For additive summaries| merge\n    merge --> result[Combined state]\n    whole[Single pass over all arrivals] --> check[Compare retained states]\n    result --> check\n```\n\n\n## Unequal reservoirs\n\nA reservoir holds a fixed-size uniform sample of arrivals. Combining samples needs the original population sizes as well as the retained items.\n\nConsider a capacity-one reservoir from a left partition with one original item and another from a right partition with three original items. The left sample always contains its sole item. The right sample chooses each of its originals with probability one third.\n\nIf we concatenate those two samples and choose either stored item uniformly, the left original wins with probability one half. Each right original wins with probability one third times one half, or one sixth. A uniform sample from all four originals would give each probability one quarter.\n\nThe replay enumerates the possible sample-and-selection paths using exact fractions and prints those probabilities. It demonstrates why equal treatment of retained samples loses the populations they represent. A correct distributed sampling algorithm needs appropriate population accounting and a defined merge procedure; concatenation alone supplies neither.\n\nThe capture compares the partition summaries and prints the unequal-reservoir probabilities. Save the replay as `m18-sketches.py` and run its standard-library mode. It uses the same implementations as the individual sketch lessons; the count-min details follow later in this module.\n\n```bash title=\"terminal\"\npython3 m18-sketches.py merge\n```\n\n```output\nleft_events=6 right_events=6 total=12 exact_distinct=9\nBloom merged matches single: True\nHLL merged matches single: True\nCMS merged matches single: True\nduplicate HLL partition changes registers: False\nduplicate CMS partition row sums: [18, 18, 18]\nBloom incompatible merge: rejected\nCMS incompatible merge: rejected\nHLL incompatible merge: rejected\nwith external partition receipts row sums: [12, 12, 12]\nunequal reservoir enumerated probabilities: {'L': '1/2', 'R1': '1/6', 'R2': '1/6', 'R3': '1/6'}\nuniform target per original item: 1/4\n```\n\nAll three merged states match their corresponding single-pass states for the correctly split population. That equality says the merge operation preserves this representation on these contributions. It does not establish that a real ingestion service delivered each original event exactly once.\n\n## A repeated partition\n\nMerging the right HLL partition again leaves its registers unchanged because taking a maximum with the same observation is idempotent. Bloom OR has the same duplicate-state property. Repeating the same bits or register observations leaves their state unchanged.\n\nAdding the right count-min partition again raises each row sum from twelve to eighteen. The repeated six-occurrence contribution has been counted twice. This is the correct result for counter addition on the delivered inputs, and the wrong population if the application intended each partition to contribute once.\n\nThe replay then uses an external set of partition receipts while processing left, right, and right again. It skips the repeated receipt and recovers row sums of twelve. This is a sequential in-memory illustration; it does not implement a durable atomic transaction between checking a receipt and recording the merged result.\n\nIf a worker crashes between those actions, a real service needs to decide whether to retry or skip without losing or doubling contributions. A merge function cannot settle that question because the failure occurs around its invocation. The event-processing module owns those identity and recovery boundaries.\n\n## Distribution summaries\n\nA t-digest retains weighted groups of numerical observations, called centroids, for percentile queries. The [[wiki/tdigest-quantile-sketch|later t-digest lesson]] examines the algorithm and this package's limitations. Here the narrower question is whether partition merging preserves the intended weight.\n\nOur chosen population contains 360 values: 0 through 89 three times each, followed by 100 through 990 in steps of ten. Split it into two disjoint 180-observation partitions. Compare a single build, both merge orders and a repeated right partition.\n\nFor this optional package replay, save [the t-digest script](/course-assets/system-design/m18-tdigest.py) and [its pinned requirements](/course-assets/system-design/m18-tdigest-requirements.txt) beside each other. Use Python 3.12 and a new virtual environment:\n\n```bash title=\"terminal\"\npython3.12 -m venv .venv-sketch-merge\n.venv-sketch-merge/bin/python -m pip install -r m18-tdigest-requirements.txt\n```\n\nThe wrapper checks `tdigest==0.5.2.2` and its dependency versions, fixes the random seed, and rejects a chosen incompatible parameter pair before calling the package merge.\n\n```bash title=\"terminal\"\n.venv-sketch-merge/bin/python m18-tdigest.py merge\n```\n\n```output\ndisjoint value partitions: left=180 right=180 total=360\nsingle: weight=360 centroids=102 p50=59.500000 p99=959.000000\nL+R: weight=360 centroids=84 p50=59.500000 p99=959.000000\nR+L: weight=360 centroids=83 p50=59.500000 p99=959.000000\nL+R+R: weight=540 centroids=81 p50=74.557143 p99=968.000000\nwrapper incompatible delta: rejected before package merge\nexact nearest-rank p50=59 p99=960 for original360\n```\n\nThe correctly merged digests retain total weight three hundred sixty and match the printed single-build percentile estimates on this fixture. Their centroid counts differ, including between the two merge orders. Equal queried values here therefore do not imply identical retained state or universal order independence.\n\nThe repeated right partition raises total weight to five hundred forty and changes the median and ninety-ninth-percentile estimates. The summary has faithfully accepted extra weight, even though the original population remains unchanged. Keeping contribution identities outside the digest is necessary when that duplicate is unintended.\n\n| Summary | Compatible merge | Repeating identical contribution |\n|---|---|---|\n| Bloom filter | Bitwise OR | Bits unchanged |\n| HLL | Register maxima | Registers unchanged |\n| Count-min | Counter sums | Counts increase |\n| This t-digest | Weighted centroid merge | Weight increases; estimates may change |\n\n## Store enough to interpret the bytes\n\nA stored summary needs its algorithm/version, parameters, encoding and identity rule. Its envelope also needs the metric, bucket boundaries, source partition/range and contribution identity. Test serialized compatibility across the actual producer and consumer library versions; a common algorithm name or payload size is insufficient.\n\nThe replay checks a few wrapper fields and compares in-memory arrays. It does not implement cross-language serialization or durable receipts. DataSketches and Roaring publish compatibility mechanisms for their own representations; those do not make our Python arrays directly interchangeable with them.\n\nFor additive summaries, a contribution ID must name immutable content. If a worker sends a revised cumulative partition under a new ID, adding it to the earlier version counts the overlap again. Replace that partition's retained version and recompute the union, or publish disjoint deltas with their own receipt protocol.\n\nPersist the receipt with the aggregate change, or use a recoverable publication scheme that makes a retry unambiguous. Also verify that all expected partitions are present. Duplicate-safe merging alone cannot distinguish an empty partition from a lost one.\n\nChoose exact aggregation while the population fits and exact answers are needed. When summaries are justified, retain controls for their error and a fallback for unsupported queries or broken versions. The [[wiki/bucketed-time-window-aggregation|next lesson]] assigns events to buckets and defines when their published answers may stop changing.\n"
              }
            },
            {
              "slug": "bucketed-time-window-aggregation",
              "title": "Bucketed time-window aggregation",
              "kind": "lesson",
              "archive": {
                "slug": "bucketed-time-window-aggregation",
                "file": "bucketed-time-window-aggregation.md",
                "title": "Bucketed time-window aggregation",
                "displayTitle": "Bucketed time-window aggregation",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "analytics",
                  "windows"
                ],
                "sources": [
                  "https://beam.apache.org/documentation/programming-guide/",
                  "https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/event-time/generating_watermarks/",
                  "https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/operators/windows/",
                  "[[wiki/event-contracts]]",
                  "[[wiki/impression-counting-system-design]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Time buckets make a continuing stream queryable: a report asks for a bounded interval and combines the groups that cover it.",
                  "continuation": "Bucket width controls both the detail available to the query and the amount of state to retain."
                }
              }
            },
            {
              "slug": "raw-events-vs-derived-analytics",
              "title": "Raw events vs derived analytics",
              "kind": "lesson",
              "archive": {
                "slug": "raw-events-vs-derived-analytics",
                "file": "raw-events-vs-derived-analytics.md",
                "title": "Raw events vs derived analytics",
                "displayTitle": "Raw events vs derived analytics",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "analytics",
                  "recovery"
                ],
                "sources": [
                  "https://kafka.apache.org/41/design/design/",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing",
                  "[[wiki/event-bus-for-product-events]]",
                  "[[wiki/immutable-versioned-data-files]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A dashboard says an ad received four impressions.",
                  "continuation": "Tomorrow, a fraud rule excludes two of them."
                }
              }
            },
            {
              "slug": "count-min-sketch",
              "title": "Count-min sketch",
              "kind": "lesson",
              "archive": {
                "slug": "count-min-sketch",
                "file": "count-min-sketch.md",
                "title": "Count-min sketch",
                "displayTitle": "Count-min sketch",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "probabilistic-structures"
                ],
                "sources": [
                  "https://www.cs.ox.ac.uk/people/graham.cormode/pubs/papers/cm-latin.pdf",
                  "https://redis.io/docs/latest/develop/data-types/probabilistic/count-min-sketch/",
                  "https://apache.github.io/datasketches-python/main/frequency/count_min_sketch.html",
                  "[[wiki/top-k-heavy-hitters]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A service tracking search queries or cache keys can see too many distinct keys to keep an exact count for each.",
                  "continuation": "A count-min sketch shares a fixed number of counters across keys and answers approximate frequency queries."
                }
              }
            },
            {
              "slug": "top-k-heavy-hitters",
              "title": "Top-k heavy hitters",
              "kind": "lesson",
              "archive": {
                "slug": "top-k-heavy-hitters",
                "file": "top-k-heavy-hitters.md",
                "title": "Top-k and heavy hitters",
                "displayTitle": "Top-k and heavy hitters",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "probabilistic-structures"
                ],
                "sources": [
                  "https://www.cs.utexas.edu/~misra/scannedPdf.dir/FindRepeatedElements.pdf",
                  "https://www.cs.ucsb.edu/sites/default/files/documents/2005-23.pdf",
                  "https://redis.io/docs/latest/develop/data-types/probabilistic/top-k/",
                  "[[wiki/count-min-sketch]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "“How often did this query occur?",
                  "continuation": "” starts with an identity."
                }
              }
            },
            {
              "slug": "reservoir-sampling",
              "title": "Reservoir sampling",
              "kind": "lesson",
              "archive": {
                "slug": "reservoir-sampling",
                "file": "reservoir-sampling.md",
                "title": "Reservoir sampling",
                "displayTitle": "Reservoir sampling",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "probabilistic-structures"
                ],
                "sources": [
                  "https://www.cs.umd.edu/~samir/498/vitter.pdf",
                  "https://datasketches.apache.org/docs/Sampling/ReservoirSamplingSketches.html",
                  "[[wiki/mergeable-sketches-for-analytics]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "You want a few hundred requests to inspect from a stream that may contain millions.",
                  "continuation": "Keeping the first few hundred mostly tells you what happened when collection began."
                }
              }
            },
            {
              "slug": "tdigest-quantile-sketch",
              "title": "t-digest quantile sketch",
              "kind": "lesson",
              "archive": {
                "slug": "tdigest-quantile-sketch",
                "file": "tdigest-quantile-sketch.md",
                "title": "T-digest quantile sketches",
                "displayTitle": "T-digest quantile sketches",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "probabilistic-structures"
                ],
                "sources": [
                  "https://arxiv.org/pdf/1902.04023",
                  "https://github.com/tdunning/t-digest",
                  "https://pypi.org/project/tdigest/0.5.2.2/",
                  "https://github.com/CamDavidsonPilon/tdigest",
                  "https://www.datadoghq.com/blog/engineering/computing-accurate-percentiles-with-ddsketch/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "A service can have a comfortable p50 latency and an unpleasant p99. The median describes the middle request; the high percentile exposes slower requests that an average can hide. To query those percentiles across many hosts, we need more information than one average or p99 per host.",
                "mermaidCount": 0,
                "content": "# T-digest quantile sketches\n\nA service can have a comfortable p50 latency and an unpleasant p99. The median describes the middle request; the high percentile exposes slower requests that an average can hide. To query those percentiles across many hosts, we need more information than one average or p99 per host.\n\nA t-digest keeps a compact, approximate description of a numerical distribution. We will look at what it stores, how local digests combine, and why a plausible percentile still needs an accuracy check.\n\n## Store weighted groups\n\nFor an exact reference, choose the nearest-rank convention: sort N observations and take the one-based position `ceil(q × N)`, where q is the requested fraction. At q = 0.99, that gives p99. Retaining and sorting every observation becomes costly for large streams and many dashboard queries. Exact frequency counts are another option when the value domain is small enough.\n\nA t-digest compresses observations into **centroids**. Each stores a mean and a weight: the number of observations it represents. For example, grouping 10, 11 and 12 yields mean 11 and weight 3. That record preserves the group's mass and mean, but not its individual values.\n\nThe distinctive choice is where to spend detail. T-digest limits centroid weights more tightly near the distribution's ends and allows larger groups near the middle. This helps preserve tail resolution without retaining every observation. The scale function, insertion order and interpolation rules still affect the result.\n\nEach host can build a local digest. A backend combines compatible weighted centroids, recompresses them and queries the combined distribution. The weights prevent a quiet host from receiving the same influence as a busy one. This merge does not recognize duplicated observations or overlapping uploads; [[wiki/mergeable-sketches-for-analytics|the merge lesson]] covers that accounting separately.\n\n## What a query returns\n\nA percentile query uses the ordered centroids and their cumulative weights, often interpolating between them. Its answer can lie between values that actually occurred. That is different from our nearest-rank reference, which always returns an observed value.\n\nCheck two kinds of error:\n\n- **Value difference:** how far the estimate is from the exact reference, in the measurement's units.\n- **Rank distance:** how far the estimate lies from the requested fraction of the population.\n\nFor ties, use a rank interval: the fraction strictly below the estimate through the fraction at or below it. The rank distance is zero if q lies inside that interval; otherwise it is the distance to the closer endpoint. This lets an observed value represent a whole block of equal observations.\n\nA small rank error can mean a large latency error in a sparse tail. A small latency difference can also cross a large repeated mass. Neither measure substitutes for the other.\n\n## Run one pinned implementation\n\nThe example uses Cam Davidson-Pilon's Python `tdigest` package, version 0.5.2.2. It is a reproducible implementation study, not a claim that every package called t-digest has the same behavior.\n\nThis package uses an admission threshold `4 × N × delta × q_c × (1 − q_c)`, where q_c is a centroid's midpoint rank and N is total weight. It permits smaller centroid weights toward the ends. Here delta is a compression parameter, not a failure probability. We use delta 0.05 and K 25; the package triggers compression when its centroid count exceeds `K / delta`.\n\nDownload the [quantile example](/course-assets/system-design/m18-tdigest.py) and [pinned requirements](/course-assets/system-design/m18-tdigest-requirements.txt) into one directory, keeping their filenames. The [package license](/course-assets/system-design/m18-tdigest-license.txt) accompanies the dependency. The setup below requires Python 3.12.\n\nThe chosen input has 360 dimensionless observations: 0 through 89 repeated three times each, then 100 through 990 in steps of 10. These are constructed values, not measured service latencies. The example processes forward, reverse and shuffled orders, resetting the package's random seed to 23 for each build.\n\nIn the output, `m` is centroid mean and `c` is its weight. Centroid count measures stored entries, not complete memory allocation.\n\n```bash title=\"terminal\"\npython3.12 -m venv .venv-quantiles\n.venv-quantiles/bin/python -m pip install -r m18-tdigest-requirements.txt\n.venv-quantiles/bin/python m18-tdigest.py quantiles\n```\n\n```output\ntdigest=0.5.2.2 accumulation-tree=0.6.4 pyudorandom=1.0.0\nvalues=360; 0..89 each repeated3, then 100..990 step10; delta=0.05 K=25 seed=23\nforward: centroids=102 total_weight=360 first={'m': 0.0, 'c': 3.0} last={'m': 990.0, 'c': 1.0}\n  q=0.50 nearest_rank=59 estimate=59.500000 value_difference=0.500000 rank_distance=0.000000\n  q=0.90 nearest_rank=630 estimate=635.000000 value_difference=5.000000 rank_distance=0.000000\n  q=0.95 nearest_rank=810 estimate=815.000000 value_difference=5.000000 rank_distance=0.000000\n  q=0.99 nearest_rank=960 estimate=959.000000 value_difference=-1.000000 rank_distance=0.001111\nreverse: centroids=102 total_weight=360 first={'m': 0.0, 'c': 3.0} last={'m': 990.0, 'c': 1.0}\n  q=0.50 nearest_rank=59 estimate=59.500000 value_difference=0.500000 rank_distance=0.000000\n  q=0.90 nearest_rank=630 estimate=635.000000 value_difference=5.000000 rank_distance=0.000000\n  q=0.95 nearest_rank=810 estimate=815.000000 value_difference=5.000000 rank_distance=0.000000\n  q=0.99 nearest_rank=960 estimate=959.000000 value_difference=-1.000000 rank_distance=0.001111\nshuffle: centroids=69 total_weight=360 first={'m': 0.0, 'c': 3.0} last={'m': 990.0, 'c': 1.0}\n  q=0.50 nearest_rank=59 estimate=59.527273 value_difference=0.527273 rank_distance=0.000000\n  q=0.90 nearest_rank=630 estimate=635.000000 value_difference=5.000000 rank_distance=0.000000\n  q=0.95 nearest_rank=810 estimate=815.000000 value_difference=5.000000 rank_distance=0.000000\n  q=0.99 nearest_rank=960 estimate=959.000000 value_difference=-1.000000 rank_distance=0.001111\nrepeated-zero control: n=1000 exact_median=0 estimate=0.110988 empirical_rank_interval=[0.90,0.90] rank_distance=0.40\n```\n\nThe forward and reverse runs retain 102 centroids; shuffled order retains 69. All preserve total weight 360. At p99, each estimates 959 against nearest-rank 960. At the median, interpolation returns roughly 59.5 instead of 59, with zero rank distance under our stated measure.\n\nThose results look useful, but the final line tests a different shape.\n\n## A small value error can hide a bad median\n\nThe control contains 900 zeros, the integers 1 through 90, and ten values of 1,000. There are 1,000 observations. The nearest-rank median is zero, and zero occupies the empirical rank interval [0, 0.90].\n\nThe pinned package returns about 0.110988. All 900 zeros lie below that answer and every positive observation lies above it. Its rank interval is therefore [0.90, 0.90], which is 0.40 away from the requested median rank 0.50.\n\nThe estimate is numerically close to zero but badly misplaced in rank. This package's interpolation does not handle this repeated mass acceptably for a median-rank requirement. Other t-digest implementations have different interpolation and repeated-value handling; test the one you will actually deploy.\n\n:::note\nWould reducing the compression parameter alone prove that this median is fixed?\n:::\n\nNo. More retained detail may help some inputs, but the query's treatment of repeated values still matters. Rerun the control and check the actual result.\n\n## Choose around the required error\n\nT-digest is useful when you want compact, mergeable quantile estimates and can validate its behavior on representative distributions. Check repeated values, sorted and shuffled input, sparse tails and the same merge tree your backend will use. A local digest passing a test does not establish the error after repeated merges.\n\nIf the requirement is a relative error in the returned value, investigate a sketch designed for that measure, such as DDSketch. For a positive exact value of 200 ms, a 2% value-error target means 196–204 ms; it says nothing by itself about the rank interval. DDSketch uses logarithmic value buckets, while t-digest uses weighted centroids. Datadog's published distribution-metrics design describes DDSketch.\n\nKeep exact reference populations small enough to inspect. For the repeated-zero population above, this pinned package fails our median-rank check, even though its other examples look good. The [[wiki/streaming-percentile-analytics|streaming percentile pipeline]] adds the next requirements: windows, compatible summaries and exactly which contributions reached a report.\n"
              }
            },
            {
              "slug": "streaming-percentile-analytics",
              "title": "Streaming percentile analytics",
              "kind": "lesson",
              "archive": {
                "slug": "streaming-percentile-analytics",
                "file": "streaming-percentile-analytics.md",
                "title": "Streaming percentile analytics",
                "displayTitle": "Streaming percentile analytics",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "analytics",
                  "quantiles"
                ],
                "sources": [
                  "https://github.com/CamDavidsonPilon/tdigest",
                  "https://prometheus.io/docs/practices/histograms/",
                  "https://www.datadoghq.com/blog/engineering/computing-accurate-percentiles-with-ddsketch/",
                  "[[wiki/tdigest-quantile-sketch]]",
                  "[[wiki/mergeable-sketches-for-analytics]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A checkout dashboard needs p50, p95 and p99 across all service instances for the last five minutes.",
                  "continuation": "Each instance can summarize its durations locally, but sending its p99 alone loses information the combined query needs."
                }
              }
            },
            {
              "slug": "live-reactions-high-throughput-design",
              "title": "Design: live reactions at high throughput",
              "kind": "design",
              "archive": {
                "slug": "live-reactions-high-throughput-design",
                "file": "live-reactions-high-throughput-design.md",
                "title": "Design: live reactions at high throughput",
                "displayTitle": "Design: live reactions at high throughput",
                "type": "design",
                "tags": [
                  "system-design",
                  "analytics",
                  "reactions",
                  "design"
                ],
                "sources": [
                  "https://ably.com/blog/making-fan-experiences-economically-viable",
                  "https://slack.engineering/real-time-messaging/",
                  "https://redis.io/docs/latest/develop/pubsub/",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://docs.python.org/3/library/http.server.html",
                  "[[wiki/counting-at-scale]]",
                  "[[wiki/fanout-patterns]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A goal is scored during a livestream.",
                  "continuation": "Thousands of viewers tap the heart button at once."
                }
              }
            }
          ]
        },
        {
          "id": "learning-realtime-social",
          "number": "11",
          "title": "Realtime, social and feeds",
          "summary": "Deliver live updates, messages, and feeds under changing load.",
          "units": [
            {
              "slug": "realtime-database-and-websocket-scaling",
              "title": "Realtime database and WebSocket scaling",
              "kind": "lesson",
              "archive": {
                "slug": "realtime-database-and-websocket-scaling",
                "file": "realtime-database-and-websocket-scaling.md",
                "title": "Realtime database and WebSocket scaling",
                "displayTitle": "Realtime database and WebSocket scaling",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "realtime",
                  "recovery"
                ],
                "sources": [
                  "[[wiki/websockets-vs-sse-vs-long-polling]]",
                  "[[wiki/raw-events-vs-derived-analytics]]",
                  "https://redis.io/docs/latest/develop/pubsub/",
                  "https://socket.io/docs/v4/redis-adapter/",
                  "https://socket.io/docs/v4/using-multiple-nodes/",
                  "https://www.postgresql.org/docs/current/logicaldecoding-explanation.html",
                  "https://www.sqlite.org/lang_transaction.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Ada posts a message through server A.",
                  "continuation": "Bo is connected to server B."
                }
              }
            },
            {
              "slug": "websockets-vs-sse-vs-long-polling",
              "title": "WebSockets vs SSE vs long polling",
              "kind": "lesson",
              "archive": {
                "slug": "websockets-vs-sse-vs-long-polling",
                "file": "websockets-vs-sse-vs-long-polling.md",
                "title": "WebSockets vs SSE vs long polling",
                "displayTitle": "WebSockets vs SSE vs long polling",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "realtime",
                  "transport"
                ],
                "sources": [
                  "[[wiki/realtime-database-and-websocket-scaling]]",
                  "https://html.spec.whatwg.org/multipage/server-sent-events.html",
                  "https://www.rfc-editor.org/rfc/rfc6202",
                  "https://www.rfc-editor.org/rfc/rfc6455",
                  "https://websockets.spec.whatwg.org/",
                  "https://websockets.readthedocs.io/en/15.0.1/reference/sync/server.html",
                  "https://websockets.readthedocs.io/en/15.0.1/reference/sync/client.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A build log receives new lines.",
                  "continuation": "A shared drawing sends cursor movements in both directions."
                }
              }
            },
            {
              "slug": "social-network-database-modeling",
              "title": "Social network database modeling",
              "kind": "lesson",
              "archive": {
                "slug": "social-network-database-modeling",
                "file": "social-network-database-modeling.md",
                "title": "Social network database modeling",
                "displayTitle": "Social network database modeling",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "social",
                  "data-modeling"
                ],
                "sources": [
                  "https://www.sqlite.org/foreignkeys.html",
                  "https://www.sqlite.org/queryplanner.html",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/",
                  "https://www.greatfrontend.com/questions/system-design/news-feed-facebook",
                  "[[wiki/social-graph-follows-and-flockdb]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Bo changes his display name after publishing a post.",
                  "continuation": "Ada should still follow the same account, the post should still have the same author, and its existing reactions should remain attached."
                }
              }
            },
            {
              "slug": "social-graph-follows-and-flockdb",
              "title": "Social graph: follows and FlockDB",
              "kind": "lesson",
              "archive": {
                "slug": "social-graph-follows-and-flockdb",
                "file": "social-graph-follows-and-flockdb.md",
                "title": "Social graph follows and FlockDB",
                "displayTitle": "Social graph follows and FlockDB",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "social",
                  "graphs"
                ],
                "sources": [
                  "[[wiki/social-network-database-modeling]]",
                  "https://blog.x.com/engineering/en_us/a/2010/introducing-flockdb",
                  "https://github.com/twitter-archive/flockdb",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://www.sqlite.org/rowvalue.html",
                  "https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "Ada follows Bo. Opening Ada's following list asks for edges leaving Ada; publishing Bo's post asks for edges entering Bo. The relationship is the same, but the two reads need different access paths.",
                "mermaidCount": 1,
                "content": "# Social graph follows and FlockDB\n\nAda follows Bo. Opening Ada's following list asks for edges leaving Ada; publishing Bo's post asks for edges entering Bo. The relationship is the same, but the two reads need different access paths.\n\nMost follow-graph work is shallow: test one relationship, list neighbors, page through followers, or count them. Start with those operations. A graph-shaped data model does not automatically require arbitrary graph traversal.\n\n## Store the direction, then the relationship rule\n\nThe [[wiki/social-network-database-modeling|previous model]] uses `(follower, followee)` as a unique pair. A mutual friendship would need a different acceptance rule or two confirmed directions. A reverse lookup for Ada following Bo is not a second friendship and does not mean Bo follows Ada.\n\nA broader `relations(source, type, target, state, position)` model can support follows, blocks or mutes when their storage needs are shared. Include the type in relationship identity. Keep each type's permissions and state transitions explicit: a pending follow request and an active block are not interchangeable just because both connect accounts.\n\nA sort position supports ordered listing. State can distinguish active, removed or archived edges. Extra metadata belongs to the relationship it describes; it should not turn every pair into an unvalidated bag of unrelated values.\n\n## Why the reverse lookup changes after sharding\n\nOn one database, a forward index on `(follower, followee)` and a reverse index on `(followee, follower)` can serve both reads. The database maintains the indexes when a row changes.\n\nNow partition the rows by follower. Ada's outgoing list stays on Ada's partition. Bo's followers can be spread across all the other users' partitions. A local index on `followee` helps inside each partition, but does not tell the router which partitions contain Bo's incoming edges.\n\nA separately placed reverse list solves that routing problem. The forward entry is grouped by Ada, and its reverse entry is grouped by Bo.\n\n```mermaid\nflowchart TB\n    accTitle: One follow has two access paths\n    accDescr: Ada following Bo creates a forward entry grouped by Ada and a reverse entry grouped by Bo. Both entries describe the same directed relationship.\n    E[Ada follows Bo] --> F[Grouped by Ada]\n    E --> R[Grouped by Bo]\n    F --> A[Following list<br/>contains Bo]\n    R --> B[Follower list<br/>contains Ada]\n```\n\nIf Bo also follows Ada, that is a second logical relationship with its own forward and reverse entries: four entries for two follows. The cost is two logical entries per relationship before indexes and replication, plus the work of keeping them consistent. It is not a universal two-times storage estimate.\n\n## What FlockDB chose\n\nTwitter's 2010 FlockDB design used MySQL-backed adjacency lists, indexed and partitioned in both directions. It targeted large neighbor lists, ordered pagination and set operations rather than multi-hop graph walks. Its position field supported ordered reads; removed and archived states let it retain edges without exposing them as active follows.\n\nThat design also accepted retried and out-of-order writes using operation ordering. It did not make an arbitrary pair of remote database writes into a single SQLite transaction. The archived repository is no longer maintained; this is a historical design to understand, not a current package recommendation.\n\nThe useful distinction survives the implementation: listing direct followers is different work from finding paths, communities or recommendations across many hops. Choose an online adjacency service and an offline graph-analysis pipeline according to the queries each must answer.\n\n## Keep the two representations consistent\n\nOur [social example](/course-assets/system-design/m22-social.py), with its [shared helpers](/course-assets/system-design/m22-common.py), deliberately stores two tables in one SQLite database. One transaction writes the forward row, reverse row and operation receipt. An exception between the row writes rolls everything back. This exposes the maintenance obligation without pretending to implement distributed FlockDB.\n\nThe six-account graph starts with Ada and Dee following Bo and Cy, plus Eli and Fay following Cy. The replay interrupts Eli's new follow of Bo, retries it, and then unfollows. A delayed retry of the old follow returns its historical receipt without restoring the edge.\n\n```bash title=\"terminal\"\npython3 m22-social.py graph\n```\n```output\nAda follows: Bo,Cy\nCy followers: Ada,Dee,Eli,Fay\ninterrupted Eli->Bo: forward=False reverse=False\nretry committed: {\"accepted_state\":true,\"duplicate\":true}\ndelayed old follow: current=False\nabsent unfollow: {\"accepted_state\":false,\"duplicate\":false}\nchanged operation: 409\ncommitted forward/reverse pairs: 6 6\n```\n\nThe successful retry is repeated before printing, hence `duplicate:true`. Reusing its operation identity with different input returns conflict. The receipt describes an accepted operation; the current adjacency list describes the relationship now. The final check compares complete forward and reverse pair sets, not just equal counts.\n\nAcross independent stores, choose a consistency and recovery contract. A reverse projection updated asynchronously needs retained changes, duplicate handling, an applied position and repair. If it drives delivery, lag can omit recipients. A cached follower count cannot reconstruct who is missing.\n\n## Page by a stable boundary\n\nOffset pagination repeatedly skips earlier rows. An indexed cursor can seek to the last returned ordering key instead. Include a tie-breaker: several follows can share one timestamp.\n\nFor a relational extension with non-null `created_at` and a unique `(followee, follower)` pair, use an index beginning with `(followee, created_at DESC, follower DESC)`. After returning the row at `(100, 'Eli')`, the next-page query is:\n\n```sql title=\"Follower page after a cursor\"\nSELECT follower, created_at\nFROM follows_by_time\nWHERE followee = :author\n  AND (created_at, follower) < (:last_time, :last_id)\nORDER BY created_at DESC, follower DESC\nLIMIT :page_size;\n```\n\nThis is a proposed time-ordered table, separate from the example's alphabetically sorted lists. If Cy's followers sort as `Fay@100, Eli@100, Dee@99, Ada@99`, a two-row first page ends at `(100, 'Eli')`; the next page returns Dee and Ada. A one-row page ending at `(100, 'Fay')` still reaches Eli because the ID breaks the timestamp tie.\n\nKeyset pagination avoids deep offset scans when an appropriate index is used. It does not freeze a changing graph. If an edge is removed or its sort position changes between requests, define whether the caller accepts a live list or needs a versioned snapshot. The cursor must also belong to the requested account and relationship type.\n\n## Handle a very large follower list deliberately\n\nA single popular account can dominate one reverse partition. Isolating it protects other accounts, but does not divide its own workload. Bucketing that list spreads storage and writes; reads now need to merge ordered bucket pages and carry enough cursor state to resume them.\n\nCache frequently read first pages when their freshness policy permits it. Separate an approximate public count from exact edge membership, and batch recipient enumeration for downstream delivery. Preserve current access rules when a cached list is used for a protected action.\n\nOnce outgoing and incoming relationships have clear meanings, the [[wiki/feed-generation-push-pull-hybrid|feed-generation comparison]] can decide whether to write feed references when a post appears or collect posts when a reader opens the page.\n"
              }
            },
            {
              "slug": "feed-generation-push-pull-hybrid",
              "title": "Feed generation: push, pull, hybrid",
              "kind": "lesson",
              "archive": {
                "slug": "feed-generation-push-pull-hybrid",
                "file": "feed-generation-push-pull-hybrid.md",
                "title": "Feed generation with push, pull, and hybrid assembly",
                "displayTitle": "Feed generation with push, pull, and hybrid assembly",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "social",
                  "feeds"
                ],
                "sources": [
                  "[[wiki/social-graph-follows-and-flockdb]]",
                  "[[wiki/fanout-patterns]]",
                  "[[wiki/social-feed-system-design-case-study]]",
                  "https://www.linkedin.com/blog/engineering/feed/followfeed-linkedin-s-feed-made-faster-and-smarter",
                  "https://blog.x.com/engineering/en_us/topics/infrastructure/2017/the-infrastructure-behind-twitter-scale",
                  "https://www.greatfrontend.com/questions/system-design/news-feed-facebook"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A home feed collects posts for one viewer.",
                  "continuation": "The follow graph tells us which authors matter; feed generation decides when to collect their posts."
                }
              }
            },
            {
              "slug": "newly-unread-indicator",
              "title": "Design: a newly-unread indicator",
              "kind": "design",
              "archive": {
                "slug": "newly-unread-indicator",
                "file": "newly-unread-indicator.md",
                "title": "Design: a newly-unread inbox indicator",
                "displayTitle": "Design: a newly-unread inbox indicator",
                "type": "design",
                "tags": [
                  "system-design",
                  "social",
                  "messaging"
                ],
                "sources": [
                  "https://slack.com/help/articles/226410907-View-all-your-unread-messages",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://redis.io/docs/latest/commands/zadd/",
                  "https://redis.io/docs/latest/commands/zcount/",
                  "[[wiki/chat-and-messaging-system-design]]",
                  "[[wiki/realtime-database-and-websocket-scaling]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "A newly-unread badge tells someone how much new activity has arrived since they last opened an overview. It can clear when they open that screen even though they have not read every conversation. That makes it a separate feature from message read receipts.",
                "mermaidCount": 2,
                "content": "# Design: a newly-unread inbox indicator\n\nA newly-unread badge tells someone how much new activity has arrived since they last opened an overview. It can clear when they open that screen even though they have not read every conversation. That makes it a separate feature from message read receipts.\n\nWe'll design a badge that counts distinct senders, preserve arrivals that race with opening the inbox, and keep reads correct while a background worker is behind. The example is our own small inbox service, not a claim about Slack's or another messenger's internals.\n\n## Decide what the number means\n\nBo sends Ada two messages and Cy sends one. Our badge shows **2**, because two sender accounts contributed new activity. It does not show three messages, two humans, or a count of unread conversations.\n\n| State | What it means |\n|---|---|\n| Newly-unread badge | Distinct eligible senders after Ada's last inbox acknowledgement |\n| Thread unread | A conversation contains messages beyond its own read position |\n| Message read receipt | The client reported a particular message or position as read |\n\nOpening the overview advances only the first state. The [[wiki/chat-and-messaging-system-design|chat design]] deals with delivery and thread-read reports separately. None of these reports proves that a person understood the text.\n\nRepeated delivery of one send must not create another message. But two intentional sends with identical text are still two messages. Give each send an operation ID; use sender identity only when collapsing messages into the badge count.\n\nFor this design, only the recipient may view or acknowledge the inbox. Senders and recipients must be active accounts, and inactive senders disappear from badge reads. Blocking, group conversations and message deletion need additional rules; they are outside the executable example.\n\n## Clear what the screen observed\n\nDeleting the whole badge set when Ada opens the inbox looks simple. It fails if a new message arrives after the server prepared her response but before the acknowledgement reaches the server. The deletion clears activity she never had a chance to see.\n\nGive each accepted message a position within its recipient's inbox. Ada's first three messages occupy positions 1, 2 and 3. The response records that it observed through 3. Dee's later message receives position 4.\n\n```mermaid\nsequenceDiagram\n  accTitle: Acknowledge the observed inbox\n  accDescr: Ada receives an inbox snapshot through position 3. Dee's message commits at position 4 before Ada acknowledges the older snapshot. Position 4 remains newly unread.\n  participant A as Ada\n  participant S as Inbox service\n  A->>S: Open inbox\n  S-->>A: Snapshot through 3\n  Note over S: Dee's message commits at 4\n  A->>S: Acknowledge snapshot 3\n  S-->>A: One new sender remains\n```\n\nStore an acknowledged-through position **A**. A sender counts when their latest eligible message position is strictly greater than A. After acknowledging 3, Bo and Cy stop contributing, while Dee at 4 remains.\n\nPositions describe acceptance order for one recipient. They are not wall-clock timestamps or a global order across all users. Equal timestamps cannot tell us which of two arrivals belonged to an earlier inbox response.\n\nThe server stores an issued snapshot containing its recipient and observed boundary. Ada acknowledges the snapshot ID, not an arbitrary position supplied by her client. The server checks ownership and updates A to the greater of its current value and the snapshot boundary.\n\nThat maximum handles multiple devices. If device B has already acknowledged through 4, device A's delayed acknowledgement through 3 leaves A at 4. A retry with the same operation ID returns its original receipt; that historical reply must not make the client lower a newer local boundary.\n\nThe product decides when to send the acknowledgement: for example, after the overview loads successfully. Issuing a snapshot only proves which response the server prepared, not that Ada saw it. An acknowledgement should not be sent just because navigation began and the request might still fail.\n\n## Store the source and the prepared count separately\n\nAccepted messages are the source. A projection keeps each sender's greatest processed position so a badge read need not rescan the entire message history. Let **H** be the accepted head and **P** the position through which the projection is complete.\n\nOur local service puts these records in one SQLite database:\n\n| Record and key | Relevant fields |\n|---|---|\n| Message: recipient, position | Sender and text |\n| Inbox head: recipient | H, A and P |\n| Sender summary: recipient, sender | Greatest processed position |\n| Issued snapshot: snapshot ID | Recipient and observed-through position |\n| Operation receipt: actor, operation ID | Original input and accepted result |\n\nSeparate thread-read rows exist to demonstrate that inbox acknowledgements leave them unchanged. A real thread-reading API is outside this service.\n\n```mermaid\nflowchart TD\n  accTitle: The badge combines a prefix and a tail\n  accDescr: A badge read merges sender maxima processed through P with source messages after P, then counts active senders whose latest position is above acknowledgement A. All records are read from one SQLite snapshot.\n  P[Sender maxima through P] --> M[Merge latest positions]\n  T[Messages after P] --> M\n  M --> C[Count active senders<br/>above A]\n```\n\nA read uses one database snapshot for the heads, projection, tail and account eligibility. Otherwise, it could combine a new P with an old projection and miss messages. The count is exact for that snapshot; an arrival after it begins can appear on the next read.\n\nThis is a deliberate cost choice. With P=0 and H=4, the read examines four tail messages. Once the worker reaches P=4, the tail is empty, though this implementation still reads the sender summaries and checks account eligibility.\n\n## Follow a send, a read and an acknowledgement\n\nThe HTTP handler binds its demonstration credential to an account. Source methods then enforce ownership. The routes keep the three operations distinct:\n\n| Route | Input or result |\n|---|---|\n| POST `/messages` | Send an operation ID, recipient and text; receive an accepted position |\n| GET `/inbox/Ada` | Receive eligible messages, snapshot ID and observed-through position |\n| GET `/badge/Ada` | Receive the count and diagnostic H, A, P and tail-row fields |\n| POST `/inbox/Ada/ack` | Send an operation ID and issued snapshot ID; receive acknowledged-through |\n\nBo's send transaction checks his operation receipt, validates the recipient, advances Ada's head, inserts the message and saves the result. Commit precedes the 201 response. The same operation and input return 200 with the original position; changed input under that ID returns 409.\n\nOpening Ada's inbox reads its head and eligible message history, then stores the snapshot in the same transaction. The example returns the entire retained history. Pagination would require a product decision: does opening page one acknowledge the overview, or only messages actually fetched? Do not extend the current token to pages without answering that.\n\nAcknowledgement verifies the path's account and the snapshot's owner independently. A predictable snapshot ID is not permission to use it. A guessed snapshot belonging to Ada is refused when Bo submits it through his own route.\n\nSQLite serializes the example's write transactions. Dee's arrival may commit before or after Ada acknowledges the older snapshot; either way, the final state is H=4 and A=3. The acknowledgement never replaces its issued boundary with the current head.\n\n## Keep projection lag from changing the answer\n\nThe background worker reads messages after P in order. It updates each sender's maximum and advances P in the same transaction. An interrupted transaction leaves both unchanged, so retrying starts from the last committed position.\n\nA badge read merges those processed maxima with every message in the unprocessed tail, taking the greater position per sender. It then counts active senders above A. Delayed work from Bo cannot undo Ada's acknowledgement or turn an older message into new activity.\n\nThis retains the original goal of preparing cheap reads, while making the fallback cost visible. Measure tail length, worker progress and badge-read latency. If a tail becomes too large, catch the worker up, bound recovery with an explicit failure, or choose a documented stale-count experience. Returning an old projection as an exact current count is not the same contract.\n\nA live notification can tell an online client to refetch. A disconnected client reconciles on its next badge read, as in the [[wiki/realtime-database-and-websocket-scaling|realtime recovery lesson]]. This particular example sends no WebSocket notifications; it tests the source and reconciliation path.\n\n## Run the arrival race\n\nSave the standard-library [inbox service](/course-assets/system-design/m22-inbox.py) and [shared helpers](/course-assets/system-design/m22-common.py) together. They use a private temporary SQLite file and an actual loopback HTTP server with fake account-bound credentials.\n\nBo sends twice and Cy once. Device A fetches through 3, then two threads race Dee's fourth message against acknowledgement of that snapshot. A later device acknowledges through 4 before the first device submits its older snapshot again.\n\n```bash title=\"terminal\"\npython3 m22-inbox.py\n```\n```output\noffline arrivals: events=3 distinct senders=2\nduplicate message: 200\nchanged message: 409\ndevice A observes through: 3\narrival races ACK3: {\"accepted_through\":4,\"acknowledged_through\":3,\"count\":1,\"projected_through\":0,\"senders\":[\"Dee\"],\"tail_rows\":4}\nclear-all control: would drop new sender Dee; boundary ACK retains her\nprojection interruption/reopen: projected=0\ndelayed projection after ACK: {\"accepted_through\":4,\"acknowledged_through\":3,\"count\":1,\"projected_through\":4,\"senders\":[\"Dee\"],\"tail_rows\":0}\ndevice B ACK4 then old device ACK3: 4\nwrong-user acknowledgement: 403\nwrong snapshot owner: 403\nmalformed framing: [[\"empty transfer encoding\",400],[\"ambiguous length\",400],[\"huge numeric length\",400],[\"unpaired surrogate\",400],[\"short body\",400]]\nthread read positions: [0, 0, 0]\nretained events=4 serialized message bytes=245\nunavailable authority: 503\nHTTP requests: application=15 malformed=5\n```\n\nThe badge finds Dee both before projection and after it. Only `tail_rows` changes from four to zero. The thread-read positions stay at zero, confirming that the overview acknowledgement did not mark conversations read.\n\nThe interruption is an exception before commit followed by reopening the database, not an operating-system crash. The replay also checks retry identity, ownership and malformed HTTP requests. Its 245-byte count covers only compact message JSON, not database size or network overhead.\n\nThose protocol probes exercise this small server's rules: one bounded Content-Length, no Transfer-Encoding, complete bodies and valid JSON Unicode. They are not a production authentication or load test. An unavailable source returns 503, so the client should retain a clearly stale display or show unavailability rather than invent zero.\n\n## Where a Redis sorted set fits\n\nA sorted set is useful for the prepared sender summary: the recipient identifies the key, the sender ID is the unique member, and the latest accepted position is its score. Updating Bo changes his score without creating another member. Resolve display names separately so a rename does not change identity.\n\nFor small exact integer positions, the core operations look like this:\n\n```text\nZADD newly_unread:Ada GT 2 Bo\nZADD newly_unread:Ada GT 3 Cy\nZADD newly_unread:Ada GT 4 Dee\nZCOUNT newly_unread:Ada (3 +inf\n```\n\n`GT` prevents an older delivery from lowering an existing score. The exclusive bound `(3` counts only positions above acknowledgement 3. The result is one sender. This sketch assumes A=3 is already known; it does not implement cross-store acknowledgement or projection recovery.\n\n`ZCARD` is sufficient only if every retained member is newly unread. Once old entries remain, use the acknowledgement boundary. Deleting scores through A can reclaim space, but a late event can reinsert an old sender; counting above A still excludes that activity.\n\nThe [Redis control](/course-assets/system-design/m22-redis-badge.py) starts a private process with TCP disabled and demonstrates the unsafe alternatives:\n\n```bash title=\"terminal\"\npython3 m22-redis-badge.py\n```\n```output\nRedis server v=8.4.0\nsnapshot through3: distinct senders=2\narrival4 then clear-all: count=0\nremove through3: senders=Dee\ndelayed older update: ZCARD=2; ZCOUNT above ACK3=1\nequal timestamp100: remove-through100 removes both senders\n```\n\nRedis scores are floating-point numbers. Integers through 2^53 are exact, but arbitrary 64-bit source positions are not. Choose a representation that preserves the actual position range before using scores as acknowledgement boundaries.\n\nA separate Redis deployment also adds a consistency boundary. Preserve message acceptance in the source, use replayable work to maintain the projection, and keep acknowledgement authoritative during cache loss. A cache miss means “state unavailable or not yet built,” not necessarily “no new messages.”\n\n## Retain enough to recover\n\nThe local database retains all messages, snapshots and operation receipts for its temporary lifetime. Production retention cannot discard them under one guessed expiry: messages support reconstruction, snapshots authorize acknowledgements, and receipts suppress repeated operations.\n\nA clean projection rebuild resets sender maxima and P together, then replays retained messages. The badge path checks that its unprocessed tail reaches H without gaps; missing source positions produce a conflict instead of an incomplete count.\n\nIf history must be trimmed, retain a sufficient checkpoint and define a floor below which replay is unavailable. Account erasure and message deletion must also update the eligibility and summary rules. A surviving sender maximum alone does not prove that its supporting message still exists.\n\nThe essential boundary is simple: clearing the overview covers the inbox the server returned. New work beyond that boundary remains visible, regardless of device timing or background-worker progress.\n"
              }
            },
            {
              "slug": "hashtag-extraction-and-tag-store",
              "title": "Hashtag extraction and tag store",
              "kind": "lesson",
              "archive": {
                "slug": "hashtag-extraction-and-tag-store",
                "file": "hashtag-extraction-and-tag-store.md",
                "title": "Hashtag extraction and the tag store",
                "displayTitle": "Hashtag extraction and the tag store",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "social",
                  "indexing"
                ],
                "sources": [
                  "[[wiki/feed-generation-push-pull-hybrid]]",
                  "[[wiki/search-index-synchronization]]",
                  "[[wiki/social-network-database-modeling]]",
                  "https://www.unicode.org/reports/tr31/",
                  "https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html",
                  "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-sharding.html",
                  "https://www.greatfrontend.com/questions/system-design/news-feed-facebook"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A hashtag connects a piece of caption text to a page of matching posts.",
                  "continuation": "Recognizing Cache is the first step."
                }
              }
            },
            {
              "slug": "reaction-modeling",
              "title": "Reaction modeling",
              "kind": "lesson",
              "archive": {
                "slug": "reaction-modeling",
                "file": "reaction-modeling.md",
                "title": "Reaction modeling",
                "displayTitle": "Reaction modeling",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "social",
                  "reactions"
                ],
                "sources": [
                  "[[wiki/live-reactions-high-throughput-design]]",
                  "[[wiki/social-network-database-modeling]]",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://docs.slack.dev/reference/methods/reactions.add/",
                  "https://www.mongodb.com/docs/manual/reference/operator/update/addtoset/",
                  "https://www.mongodb.com/docs/v8.0/data-modeling/design-antipatterns/unbounded-arrays/",
                  "https://www.greatfrontend.com/questions/system-design/news-feed-facebook"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A reaction can represent an account's current choice on a post, several selected emoji, or a stream of taps.",
                  "continuation": "Those are different products."
                }
              }
            },
            {
              "slug": "photo-tagging-coordinate-model",
              "title": "Design: photo tagging coordinates",
              "kind": "design",
              "archive": {
                "slug": "photo-tagging-coordinate-model",
                "file": "photo-tagging-coordinate-model.md",
                "title": "Design: photo tags that survive resizing",
                "displayTitle": "Design: photo tags that survive resizing",
                "type": "design",
                "tags": [
                  "system-design",
                  "social",
                  "images"
                ],
                "sources": [
                  "https://www.flickr.com/services/api/flickr.photos.people.add.html",
                  "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit",
                  "https://www.w3.org/TR/media-frags/#naming-space",
                  "[[wiki/reaction-modeling]]",
                  "[[wiki/image-cdn-and-resizing]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "A photo tag associates an account with a place in an image. That place should stay attached to its subject when a laptop-sized photo becomes a phone thumbnail. Storing the click's screen coordinates cannot provide that guarantee: the next display may have a different size, margins or crop.",
                "mermaidCount": 2,
                "content": "# Design: photo tags that survive resizing\n\nA photo tag associates an account with a place in an image. That place should stay attached to its subject when a laptop-sized photo becomes a phone thumbnail. Storing the click's screen coordinates cannot provide that guarantee: the next display may have a different size, margins or crop.\n\nWe'll work through source coordinates, map a point into a square card, and extend the model to boxes and crop edits. Then we'll follow a tag through placement, approval and image replacement in a small executable service.\n\n## Store a place in the source image\n\nChoose a coordinate convention before choosing a database. Here the origin is the upper-left corner, horizontal coordinates increase rightward, and vertical coordinates increase downward. Each tag belongs to one immutable image version with known dimensions and orientation.\n\nFor our 800 by 600 source, a point at (200,150) is one quarter of the way across and down. Store those fractions as `u=0.25` and `v=0.25`. In a simple 400 by 300 resize, the same point becomes (100,75).\n\n```text\nu = source_x / source_width\nv = source_y / source_height\n\nrendered_x = u * rendered_image_width\nrendered_y = v * rendered_image_height\n```\n\nSource pixels would also work if every consumer knew which source dimensions they referred to. The mistake is storing pixels from an unspecified display. Ratios make the convention convenient; the image version keeps their meaning stable.\n\nKeep full precision in storage. For example, rounding a 600/1024 ratio to 0.586 before multiplying it by 512 yields 300.032 instead of 300. Round only when presenting a value or placing a raster pixel.\n\nOur point domain includes 0 and 1. The point (1,1) denotes the lower-right boundary of the image extent, not an indexed raster pixel. Whether the marker's label extends beyond that boundary is a separate layout choice.\n\n## Account for the display box\n\nThe rendered image and its surrounding box are not always the same size. With `contain`, the entire image fits and unused space becomes margins. With `cover`, the image fills the box and some source content may be cropped. Both preserve aspect ratio.\n\nFor a centered image in a box of width W and height H, choose a scale and then an offset:\n\n```text\ncontain: s = min(W / 800, H / 600)\ncover:   s = max(W / 800, H / 600)\n\nox = (W - 800*s) / 2\noy = (H - 600*s) / 2\nX = ox + 800*s*u\nY = oy + 600*s*v\n```\n\nThese are CSS-pixel positions within the box, independent of the display's physical pixel density. The formulas assume centered positioning and no border, padding or CSS rotation. A different `object-position` needs different offsets.\n\n| In a 500 by 500 box | Result for the quarter-width, quarter-height point |\n| --- | --- |\n| Contain: image is 500 by 375, with 62.5-pixel top and bottom margins | (125,156.25) |\n| Cover: image is about 666.67 by 500, with 83.33 pixels cropped from each side | About (83.33,125) |\n\nMultiplying both fractions by 500 misses the contain margin. It gives (125,125), which is a valid place in the square but the wrong place on the photo.\n\nThe generated preview below puts the marker over the source's upper-left circle. Its raster rounds the 62.5-pixel top offset to an integer row; the calculation above retains the fractional position.\n\n![Contained square preview with the chosen marker over the upper-left circle and blank margins above and below the image](/course-assets/system-design/m22-photo-overlay.png)\n\nFor editing, invert the transform: subtract the offsets, then divide by the scaled source dimensions. Reject a click in a contain margin. For viewing, hide a point outside a cover crop instead of moving it to the edge, where it would label a different place.\n\nThe example checks exact display-space membership first and clips only floating-point quotient roundoff at 0 and 1. It does not use clamping to turn an invalid click into a valid tag.\n\n## Boxes and crop edits\n\nA point is enough for a small name marker. To identify an area, store a rectangle using either normalized corners `(u1,v1,u2,v2)` or normalized origin and size `(u,v,width,height)`.\n\nFor corners, require finite values with `0 <= u1 < u2 <= 1` and `0 <= v1 < v2 <= 1`. For origin and size, require positive dimensions and an extent that stays inside the source. Keep the representation explicit; a point with a decorative label is not automatically a bounding box.\n\nRender both corners through the same transform. A partially cropped box can be clipped for display while retaining its original source bounds. This box extension is a design choice; the executable below accepts only points.\n\nA crop creates another coordinate space. Suppose an 800 by 600 source is cropped to the rectangle starting at (100,50), with width 400 and height 300. The original point (200,150) becomes (100,100) inside that crop, or fractions (0.25,1/3).\n\n```text\ncropped_u = (source_u * 800 - crop_left) / crop_width\ncropped_v = (source_v * 600 - crop_top) / crop_height\n```\n\nA point outside the crop is hidden, not reassigned to its nearest edge. Store the crop transform with the derived variant so the client can recover this relationship. A rotation needs its own transform and orientation convention too.\n\nAn unrelated replacement has no such relationship. Even another 800 by 600 image may contain something different at the same fractions. Give it a new version and require explicit retagging. The [[wiki/image-cdn-and-resizing|image pipeline]] should normalize orientation before establishing the canonical coordinate space.\n\n## Separate the tag from the image bytes\n\nOur service starts with a generated upright geometric image. Ada owns it and selects Bo as the target of a point tag. This records a person's account selection; it performs no face recognition.\n\nThe image bytes stay immutable. A database stores version metadata and tag relationships. The client reads the image through the media path, while the tagging API handles coordinates and permission.\n\n```mermaid\nflowchart TB\n  accTitle: Coordinates refer to an image version\n  accDescr: The client reads immutable image bytes through the media path and sends coordinates or consent to the tag API. The API checks image version and permission in the tag database.\n  C[Image client] -->|point or consent| A[Tag API]\n  A --> D[(Versions and tags)]\n  C -->|media path| I[Immutable image bytes]\n```\n\nThe fixture has three main records:\n\n| Record | Meaning |\n| --- | --- |\n| Image | Owner, current version, visibility and placement revision |\n| Immutable version | Image/version key, digest, dimensions and orientation |\n| Tag | Tag ID, image/version, target account, u, v and approval state |\n\nAn extended box schema would replace the point fields with one declared rectangle representation. Record the creator and creation time explicitly if other accounts may propose tags; this fixture restricts all placement to the image owner.\n\nDecide the product rules early. Unregistered names need a separate label identity rather than a fabricated account ID. Machine-suggested boxes need an explicit confirmation state. A per-image tag limit, bounded reads and marker clustering keep hundreds of tags from turning into an unreadable overlay. Those extensions are not implemented here.\n\n## Place, approve and read\n\nAda sends `POST /images/photo-1/tags` with an operation ID, image version, base placement revision, target and point. The server binds Ada from her credential, validates the numbers and verifies ownership. It never accepts a caller-supplied owner as authority.\n\nThe new tag begins pending. In one transaction the service inserts it, advances the placement revision and saves the operation receipt. Repeating the identical request returns the receipt; reusing its identity with changed coordinates conflicts.\n\nBo can approve or withdraw through `POST /tags/1/consent`. Reads expose only approved tags for the current version, with active owner and target accounts and current permission to view the image. Placement and approval answer different questions: Ada can suggest an association, while Bo controls whether this design displays it.\n\n```mermaid\nsequenceDiagram\n  accTitle: A proposed tag becomes visible after approval\n  accDescr: Ada places a pending tag. A reader sees no tag until Bo approves it. A later withdrawal hides it from subsequent reads.\n  participant A as Ada\n  participant S as Tag service\n  participant B as Bo\n  A->>S: Place tag, v1\n  S-->>A: Pending tag 1\n  B->>S: Approve tag 1\n  Note over S: Approved: visible\n  B->>S: Withdraw approval\n  Note over S: Withdrawn: hidden\n```\n\nTwo placements based on revision 1 cannot both advance this editor to revision 2. One succeeds; the other refetches. This whole-image precondition is a deliberate editing policy. Independent annotations could instead use per-tag revisions or a declared merge rule.\n\nConsent does not advance the placement revision. The fixture serializes new consent writes in arrival order, so a production interface with multiple active editing devices would need a separate consent revision if it must reject stale new intentions.\n\nAn identical old approval retry only returns its historical receipt; it does not undo a later withdrawal. As in [[wiki/reaction-modeling|reaction modeling]], the client must distinguish an operation result from current state.\n\n## Run the geometry and HTTP example\n\nSave the [tagging service](/course-assets/system-design/m22-tagging.py), [shared helpers](/course-assets/system-design/m22-common.py) and [pinned image dependency](/course-assets/system-design/m22-image-requirements.txt) together. Use an isolated Python environment with the pinned Pillow version. The program generates geometric images, owns a temporary SQLite database and serves requests only on loopback.\n\n```bash title=\"setup\"\npython3 -m venv /tmp/fanout-m22\nuv pip install --python /tmp/fanout-m22/bin/python -r m22-image-requirements.txt\n```\n\nBefore running it, predict two outcomes: whether a top-margin click is accepted, and whether an editor holding image version 1 can place a tag after the source is replaced by version 2.\n\n```bash title=\"terminal\"\n/tmp/fanout-m22/bin/python m22-tagging.py --images ./m22-images\n```\n```output\nPillow=12.1.0 source=800x600 orientation=1\nnormalized point: u=0.25 v=0.25; source=(200,150)\ncontain 500x500: (125.000000,156.250000) roundtrip_error=0.000000000000\ncover 500x500: (83.333333,125.000000) roundtrip_error=0.000000000000\nright/bottom equality: (1.0, 1.0)\nletterbox click: refused\ncover left-edge source point: None\nowner placement: 201 pending\nidentical retry: 200\nchanged retry: 409\nnon-owner placement: 403\nbefore consent visible tags: 0\nafter Bo consent visible tags: 1\nconcurrent revision1: [201, 409]\nconsent withdrawn visible tags: 0\nmalformed framing: [[\"empty transfer encoding\",400],[\"ambiguous length\",400],[\"huge numeric length\",400],[\"unpaired surrogate\",400],[\"short body\",400]]\nretained tags=2 coordinate pairs=2\nreplacement visible tags: 0\nold image placement: 409\nprivate image read: 404\n```\n\nThe inverse calculation is checked before its error is rounded for printing. The HTTP run exercises retries, permission, approval and concurrent placement. The five malformed framing probes are refused without adding tags. Either concurrent target may win; sorting the status codes makes the capture independent of that choice.\n\nTwo rows remain because the initial placement and one concurrent placement succeeded. Replacement retains those rows under version 1 but makes the current version's visible list empty. An old editor must reload the image and ask for confirmation; silently resending its fractions under version 2 defeats the version check.\n\nFinally, Bo's earlier approval does not grant access after Ada makes the image private. The fixture returns 404 for that read. A real private-media product must also authorize the image bytes and every variant: filtering tag metadata alone cannot protect a publicly served photo.\n"
              }
            },
            {
              "slug": "live-commentary-system-design",
              "title": "Design: live commentary",
              "kind": "design",
              "archive": {
                "slug": "live-commentary-system-design",
                "file": "live-commentary-system-design.md",
                "title": "Design: live commentary",
                "displayTitle": "Design: live commentary",
                "type": "design",
                "tags": [
                  "system-design",
                  "realtime",
                  "commentary"
                ],
                "sources": [
                  "[[wiki/realtime-database-and-websocket-scaling]]",
                  "[[wiki/websockets-vs-sse-vs-long-polling]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "[[wiki/caching-layers]]",
                  "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html",
                  "https://www.rfc-editor.org/rfc/rfc9110.html",
                  "https://html.spec.whatwg.org/multipage/server-sent-events.html",
                  "https://www.greatfrontend.com/questions/system-design/news-feed-facebook"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 3,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Live commentary lets a few writers publish updates to a much larger audience.",
                  "continuation": "Most readers want the newest page; some scroll back through the match."
                }
              }
            }
          ]
        },
        {
          "id": "learning-geo-matching",
          "number": "12",
          "title": "Geo, matching and recs",
          "summary": "Find nearby candidates, match supply to demand, and rank recommendations.",
          "units": [
            {
              "slug": "nearby-geospatial-search-system-design",
              "title": "Nearby geospatial search",
              "kind": "lesson",
              "archive": {
                "slug": "nearby-geospatial-search-system-design",
                "file": "nearby-geospatial-search-system-design.md",
                "title": "Nearby search and distance",
                "displayTitle": "Nearby search and distance",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "geospatial",
                  "distance"
                ],
                "sources": [
                  "[[wiki/social-feed-system-design-case-study]]",
                  "https://geographiclib.sourceforge.io/html/python/code.html",
                  "https://postgis.net/workshops/postgis-intro/indexing.html",
                  "https://redis.io/docs/latest/commands/geosearch/",
                  "https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-geo-distance-query",
                  "https://postgis.net/docs/ST_DWithin.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Nearby search finds objects within a distance of a location: shops around a hotel, available couriers near a pickup, or people a viewer is allowed to discover.",
                  "continuation": "Its usual shape is a cheap candidate search followed by exact checks."
                }
              }
            },
            {
              "slug": "geohash-prefix-spatial-index",
              "title": "Geohash prefix spatial index",
              "kind": "lesson",
              "archive": {
                "slug": "geohash-prefix-spatial-index",
                "file": "geohash-prefix-spatial-index.md",
                "title": "Geohash prefix cells",
                "displayTitle": "Geohash prefix cells",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "geospatial",
                  "geohash"
                ],
                "sources": [
                  "[[wiki/nearby-geospatial-search-system-design]]",
                  "https://github.com/wdm0006/pygeohash",
                  "https://firebase.google.com/docs/firestore/solutions/geoqueries",
                  "https://pypi.org/project/pygeohash/3.3.1/",
                  "https://pygeohash.mcginniscommawill.com/api.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Geohash turns a location into a string that identifies a rectangular cell.",
                  "continuation": "Objects in the same cell can be grouped under one lookup key, so a nearby search can fetch candidate IDs without scanning every stored point."
                }
              }
            },
            {
              "slug": "geospatial-grid-systems-h3-s2-geohash",
              "title": "Grid systems: H3, S2, geohash",
              "kind": "lesson",
              "archive": {
                "slug": "geospatial-grid-systems-h3-s2-geohash",
                "file": "geospatial-grid-systems-h3-s2-geohash.md",
                "title": "H3, S2 and geohash grids",
                "displayTitle": "H3, S2 and geohash grids",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "geospatial",
                  "spatial-index"
                ],
                "sources": [
                  "https://h3geo.org/docs/highlights/indexing/",
                  "https://h3geo.org/docs/core-library/overview/",
                  "https://h3geo.org/docs/api/hierarchy/",
                  "https://h3geo.org/docs/core-library/restable/",
                  "https://s2geometry.io/devguide/s2cell_hierarchy.html",
                  "https://s2geometry.io/devguide/examples/coverings.html",
                  "https://postgis.net/workshops/postgis-intro/indexing.html",
                  "https://s2geometry.io/resources/s2cell_statistics.html",
                  "https://s2sphere.readthedocs.io/en/latest/",
                  "https://pypi.org/project/h3/4.5.0/",
                  "https://pypi.org/project/s2sphere/0.2.5/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Geospatial grids give regions stable identifiers, letting a system group locations under ordinary keys.",
                  "continuation": "That is useful for counting orders by area, joining two location datasets, or narrowing a nearby search."
                }
              }
            },
            {
              "slug": "redis-geo-spatial-hot-path",
              "title": "Redis GEO hot path",
              "kind": "lesson",
              "archive": {
                "slug": "redis-geo-spatial-hot-path",
                "file": "redis-geo-spatial-hot-path.md",
                "title": "Redis GEO for changing candidates",
                "displayTitle": "Redis GEO for changing candidates",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "geospatial",
                  "redis"
                ],
                "sources": [
                  "https://redis.io/docs/latest/commands/geoadd/",
                  "https://redis.io/docs/latest/commands/geosearch/",
                  "https://redis.io/docs/latest/commands/geopos/",
                  "https://redis.io/docs/latest/commands/zrem/",
                  "https://redis.io/docs/latest/commands/expire/",
                  "https://redis.io/docs/latest/develop/programmability/eval-intro/",
                  "https://geographiclib.sourceforge.io/html/python/code.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Redis GEO maintains an in-memory index of named locations and finds members within a radius or box.",
                  "continuation": "It can serve a nearby lookup for active couriers, rental bikes or stores when the working set fits in memory and the spatial queries are simple."
                }
              }
            },
            {
              "slug": "geofencing-point-in-polygon",
              "title": "Geofencing: point in polygon",
              "kind": "lesson",
              "archive": {
                "slug": "geofencing-point-in-polygon",
                "file": "geofencing-point-in-polygon.md",
                "title": "Geofencing and boundary policy",
                "displayTitle": "Geofencing and boundary policy",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "geospatial",
                  "geometry"
                ],
                "sources": [
                  "https://shapely.readthedocs.io/en/2.1.2/reference/shapely.covers.html",
                  "https://shapely.readthedocs.io/en/2.1.2/reference/shapely.contains.html",
                  "https://shapely.readthedocs.io/en/2.1.2/manual.html",
                  "https://postgis.net/docs/ST_Covers.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Geofencing checks whether a reported location belongs to a named region.",
                  "continuation": "A delivery service can use it to decide which addresses it serves; an airport pickup flow can use it to select the appropriate pickup zone."
                }
              }
            },
            {
              "slug": "ray-casting-point-in-polygon",
              "title": "Ray casting point in polygon",
              "kind": "lesson",
              "archive": {
                "slug": "ray-casting-point-in-polygon",
                "file": "ray-casting-point-in-polygon.md",
                "title": "Ray casting and polygon edges",
                "displayTitle": "Ray casting and polygon edges",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "geospatial",
                  "algorithms"
                ],
                "sources": [
                  "https://shapely.readthedocs.io/en/2.1.2/reference/shapely.covers.html",
                  "https://shapely.readthedocs.io/en/2.1.2/manual.html",
                  "https://wrfranklin.org/Research/Short_Notes/pnpoly.html",
                  "https://erich.realtimerendering.com/ptinpoly/",
                  "https://www.cs.cmu.edu/~quake/robust.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Ray casting is a way to test whether a point lies inside a polygon.",
                  "continuation": "Draw an imaginary ray from the point to the right and count its boundary crossings: an odd count means inside, an even count means outside."
                }
              }
            },
            {
              "slug": "seen-filtering-bloom-vs-exact-sets",
              "title": "Seen filtering: Bloom vs exact sets",
              "kind": "lesson",
              "archive": {
                "slug": "seen-filtering-bloom-vs-exact-sets",
                "file": "seen-filtering-bloom-vs-exact-sets.md",
                "title": "Seen filtering: Bloom filters and exact sets",
                "displayTitle": "Seen filtering: Bloom filters and exact sets",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "probabilistic-structures"
                ],
                "sources": [
                  "[[wiki/bloom-filters]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "https://www.eecs.harvard.edu/~michaelm/postscripts/rsa2008.pdf",
                  "https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/",
                  "https://redis.io/docs/latest/commands/cf.del/",
                  "https://roaringbitmap.org/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Seen filtering removes candidates a viewer has already encountered: swiped profiles, dismissed products, watched videos or previously shown ads.",
                  "continuation": "The first decision is what counts as “seen."
                }
              }
            },
            {
              "slug": "matching-and-recommendation-algorithms",
              "title": "Matching and recommendation algorithms",
              "kind": "lesson",
              "archive": {
                "slug": "matching-and-recommendation-algorithms",
                "file": "matching-and-recommendation-algorithms.md",
                "title": "Matching and recommendation algorithms",
                "displayTitle": "Matching and recommendation algorithms",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "recommendations",
                  "ranking"
                ],
                "sources": [
                  "https://developers.google.com/machine-learning/recommendation/content-based/basics",
                  "https://developers.google.com/machine-learning/recommendation/collaborative/basics",
                  "https://scikit-learn.org/stable/common_pitfalls.html#data-leakage",
                  "https://developers.google.com/machine-learning/recommendation/overview/types",
                  "https://developers.google.com/machine-learning/recommendation/dnn/re-ranking",
                  "[[wiki/search-feedback-and-relevance-signals]]",
                  "[[wiki/search-evaluation-metrics]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Matching chooses useful pairings: a rider and driver, a job and candidate, or a reader and article.",
                  "continuation": "A recommender usually proposes items the user may choose from."
                }
              }
            }
          ]
        },
        {
          "id": "learning-media-files",
          "number": "13",
          "title": "Media, files and CDN",
          "summary": "Study media, files and CDN.",
          "units": [
            {
              "slug": "direct-to-object-storage-upload",
              "title": "Direct-to-object-storage upload",
              "kind": "lesson",
              "archive": {
                "slug": "direct-to-object-storage-upload",
                "file": "direct-to-object-storage-upload.md",
                "title": "Direct-to-object-storage upload",
                "displayTitle": "Direct-to-object-storage upload",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "media",
                  "uploads"
                ],
                "sources": [
                  "[[wiki/s3-object-storage-architecture]]",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/developerguide/sigv4-HTTPPOSTConstructPolicy.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html",
                  "https://www.rfc-editor.org/rfc/rfc9112.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Direct upload sends file bytes from the client to object storage.",
                  "continuation": "The application authorizes the transfer and decides when the file becomes usable, without relaying the whole body through its API servers."
                }
              }
            },
            {
              "slug": "image-cdn-and-resizing",
              "title": "Image CDN and resizing",
              "kind": "lesson",
              "archive": {
                "slug": "image-cdn-and-resizing",
                "file": "image-cdn-and-resizing.md",
                "title": "Image CDN and resizing",
                "displayTitle": "Image CDN and resizing",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "images",
                  "caching"
                ],
                "sources": [
                  "[[wiki/direct-to-object-storage-upload]]",
                  "[[wiki/photo-tagging-coordinate-model]]",
                  "https://aws.amazon.com/blogs/networking-and-content-delivery/image-optimization-using-amazon-cloudfront-and-aws-lambda/",
                  "https://www.greatfrontend.com/questions/system-design/news-feed-facebook",
                  "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html",
                  "https://pillow.readthedocs.io/en/stable/reference/Image.html",
                  "https://pillow.readthedocs.io/en/stable/reference/ImageOps.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Image delivery has two separate jobs: choose a useful representation of the source, then avoid fetching and processing it again for every reader.",
                  "continuation": "A resize worker produces variants; a CDN caches their bytes near readers."
                }
              }
            },
            {
              "slug": "gravatar-style-avatar-service",
              "title": "An avatar service",
              "kind": "lesson",
              "archive": {
                "slug": "gravatar-style-avatar-service",
                "file": "gravatar-style-avatar-service.md",
                "title": "An avatar service",
                "displayTitle": "An avatar service",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "images",
                  "identity"
                ],
                "sources": [
                  "[[wiki/image-cdn-and-resizing]]",
                  "https://docs.gravatar.com/sdk/images/",
                  "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html",
                  "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An avatar service turns an account reference into its current profile image.",
                  "continuation": "Comments can keep the author's account ID even when that author changes their photo."
                }
              }
            },
            {
              "slug": "video-upload-signed-url-multipart",
              "title": "Video upload: signed URLs and multipart",
              "kind": "lesson",
              "archive": {
                "slug": "video-upload-signed-url-multipart",
                "file": "video-upload-signed-url-multipart.md",
                "title": "Video upload: signed URLs and multipart",
                "displayTitle": "Video upload: signed URLs and multipart",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "video",
                  "uploads"
                ],
                "sources": [
                  "[[wiki/direct-to-object-storage-upload]]",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Multipart upload transfers one file in separately numbered portions, then assembles them into an object.",
                  "continuation": "A failed portion can be retried without resending the whole video."
                }
              }
            },
            {
              "slug": "video-transcoding-pipeline",
              "title": "Video transcoding pipeline",
              "kind": "lesson",
              "archive": {
                "slug": "video-transcoding-pipeline",
                "file": "video-transcoding-pipeline.md",
                "title": "Video transcoding pipeline",
                "displayTitle": "Video transcoding pipeline",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "media",
                  "workflows"
                ],
                "sources": [
                  "[[wiki/video-upload-signed-url-multipart]]",
                  "https://ffmpeg.org/ffmpeg.html",
                  "https://ffmpeg.org/ffmpeg-formats.html#hls-2",
                  "https://www.rfc-editor.org/rfc/rfc8216.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html",
                  "https://netflixtechblog.com/rebuilding-netflix-video-processing-pipeline-with-microservices-4e5e6310e359"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Transcoding turns an uploaded video into representations suited to playback: different dimensions, compression settings or codecs.",
                  "continuation": "Packaging then arranges the encoded media into files and playlists."
                }
              }
            },
            {
              "slug": "adaptive-bitrate-and-cdn-decider",
              "title": "Adaptive bitrate and the CDN decider",
              "kind": "lesson",
              "archive": {
                "slug": "adaptive-bitrate-and-cdn-decider",
                "file": "adaptive-bitrate-and-cdn-decider.md",
                "title": "Adaptive bitrate and CDN selection",
                "displayTitle": "Adaptive bitrate and CDN selection",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "media",
                  "playback"
                ],
                "sources": [
                  "[[wiki/video-transcoding-pipeline]]",
                  "https://www.rfc-editor.org/rfc/rfc8216.html",
                  "https://ffmpeg.org/ffmpeg-formats.html#hls-2",
                  "https://dashif.org/dash.js/pages/usage/abr/",
                  "https://openconnect.zendesk.com/hc/en-us/articles/360035618071-Fill-patterns"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "Adaptive bitrate streaming lets a player choose among encoded representations as network and playback conditions change. A smaller next segment can help avoid a stall. It cannot undo time already spent waiting for an earlier segment.",
                "mermaidCount": 1,
                "content": "# Adaptive bitrate and CDN selection\n\nAdaptive bitrate streaming lets a player choose among encoded representations as network and playback conditions change. A smaller next segment can help avoid a stall. It cannot undo time already spent waiting for an earlier segment.\n\nThere are three related decisions: which rendition the viewer requests now, which renditions the service prepares, and where their bytes should be cached. We'll separate them, then use real segment sizes in a small simulation to see why reacting to the last transfer can be too late.\n\n## The player chooses from a prepared offer\n\nThe [[wiki/video-transcoding-pipeline|transcoding pipeline]] creates the representations. In HLS, a master playlist identifies available variants, and their media playlists identify ordered segments. The player chooses files that already exist; it does not ask the encoder to change an in-flight file's quality.\n\nThe ladder is the set of offered resolutions and bitrates. It must fit supported devices and codecs, with corresponding content aligned in time. A higher resolution is not automatically useful on a small display, and bitrate alone does not compare visual quality across different codecs or scenes.\n\nThree quantities guide playback:\n\n| Quantity | Meaning |\n|---|---|\n| Media bitrate | Encoded bits per second of media |\n| Download throughput | Received bits per second of transfer time |\n| Buffer | Seconds of media available ahead of playback |\n\nA rendition can have a modest average bitrate and still contain a large segment. The player needs enough buffer to survive that segment's actual transfer. A path's last observed throughput is evidence about the next request, not knowledge of its future capacity.\n\nProduction selectors may combine throughput estimates, buffer levels, device limits and switching history. For example, dash.js documents distinct throughput, buffer, dropped-frame and request-abandonment rules. Our rule below intentionally uses only the previous completed transfer so its delay is easy to see.\n\n## A three-request experiment\n\nThe [lab](/course-assets/system-design/m24-lab.py) and [media helper](/course-assets/system-design/m24-media.py) generate the same HLS files as the preceding lesson. Use its pinned Python environment and FFmpeg 8.1.2. File sizes are measured; download times and stalls are calculated under a chosen capacity schedule, with no real congested network.\n\nBoth policies start with one second buffered. Fixed-high always requests the larger rendition. Adaptive requests high if its previous observed capacity is at least 200,000 bits/s, otherwise low. Its initial observation is 400,000 bits/s; neither policy can see the next capacity before choosing.\n\n```bash title=\"terminal\"\n/tmp/fanout-m24/bin/python m24-lab.py abr\n```\n```output\n#EXTM3U\n#EXT-X-VERSION:6\n#EXT-X-STREAM-INF:BANDWIDTH=55648,RESOLUTION=160x90\nlow/index.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=188000,RESOLUTION=320x180\nhigh/index.m3u8\nchosen capacity bits/s=[400000, 40000, 400000] initial buffer=1.000s\nfixed-high download/buffer/stall: high:0.447s/1.553s/0.000s, high:4.474s/1.000s/2.922s, high:0.470s/1.530s/0.000s total_stall=2.922s\nadaptive download/buffer/stall: high:0.447s/1.553s/0.000s, high:4.474s/1.000s/2.922s, low:0.139s/1.861s/0.000s total_stall=2.922s\nsimulated origin observations: A age=4 refused; B age=1 selected=B\n```\n\nEach generated segment lasts one second. The largest high segment contains 23,500 bytes, giving the advertised peak of 188,000 bits/s. This calculation is valid for the fixture's equal one-second segments and one-second target duration; it is not a promise of network capacity.\n\nFor a segment of `S` bytes and a path capacity of `C` bits/s, ideal transfer time is `8*S/C`. If the player starts that request with `B` seconds buffered, the stall is `max(0, transfer time − B)`. Afterward, the buffer is `max(0, B − transfer time) + segment duration`.\n\nThe first high segment is 22,372 bytes. At 400,000 bits/s it takes 0.44744 seconds, leaving 1.55256 seconds buffered after adding the new second of media. The next high segment has the same size, but capacity drops to 40,000 bits/s.\n\nThat transfer takes 4.4744 seconds: 2.92184 seconds longer than the available buffer. Both policies stall by the displayed 2.922 seconds. Adaptive learns about the drop only after that transfer completes, then switches low just as capacity recovers.\n\n```mermaid\nflowchart TD\n    accTitle: A playback decision arrives late\n    accDescr: The first fast transfer makes the selector choose high again. The second transfer is slow and stalls. Only afterward does the selector choose low, when the path has already recovered.\n    A[\"Request 1: high<br/>Fast transfer\"] --> B[\"Request 2: high<br/>Capacity drops; stall\"]\n    B --> C[\"Observe slow transfer\"]\n    C --> D[\"Request 3: low<br/>Capacity has recovered\"]\n```\n\nThe last low segment's 6,956 bytes arrive quickly, but cannot recover time already stalled. On this schedule the adaptive rule does not improve the total-stall metric. The experiment omits round trips, protocol overhead, contention and decoder startup; it tests the consequence of delayed information, not a production ABR algorithm.\n\nA buffer-aware rule could become more cautious as playable time runs low. More startup buffer can absorb longer transfers, but makes the viewer wait before playback. Evaluate startup delay, rebuffering and quality changes together rather than choosing a universal threshold from this three-second clip.\n\n## Which renditions should exist?\n\nThe player cannot select a version the service has not prepared. Encoding every upload into every possible format spends compute and storage even on videos that nobody watches. Deferring everything makes the first viewer wait for processing.\n\n| Preparation policy | Useful when | Cost or delay |\n|---|---|---|\n| Eager ladder | The expected audience needs several representations immediately | Work is paid even if some renditions are never watched |\n| Baseline, then more on demand | A complete initial offer is enough for less-watched uploads | New representations take time to become available |\n| Prepare for predicted demand | A release or rising audience provides advance notice | A wrong prediction wastes work or misses demand |\n\nIn our proposed service, an on-demand miss queues a deduplicated job keyed by source and encoding recipe. The existing baseline remains playable while the new rendition is prepared. Add it to the advertised offer only after validation; a viewer request should not receive a playlist pointing at unfinished work.\n\nThis is independent of the request-by-request ABR rule. It changes what the rule will be able to choose later.\n\n## The CDN decider controls preparation and placement\n\n“CDN decider” is a name for our proposed policy service, not a standard CDN API. It combines recent view velocity, viewer geography, channel audience, content type, shares, trending signals and known release spikes to decide where extra work is justified.\n\nIts actions may include generating another rendition, warming selected ready objects in a region, retaining an origin copy or retiring an unused cache placement. The available controls depend on the delivery provider; ordinary CDN eviction is often automatic, not a per-object command the application owns.\n\nWarming transfers bytes before a viewer requests them. It can reduce a first miss while consuming fill bandwidth and cache space. Moving a source to colder storage is a separate retention choice and may increase retrieval delay. Keep encoding, cache placement and storage tiering as separate actions with explicit costs.\n\nNetflix's Open Connect fill documentation gives a concrete placement example: appliances hold portions of the catalog and primarily receive updates in off-peak windows. Popularity changes and new or re-encoded titles affect those updates. This is Netflix's documented delivery model, not a guarantee offered by every CDN.\n\nOur controller can consume [[wiki/event-bus-for-product-events|product events]] such as `video.published`, `video.viewed` and `video.trending`, and emit a request to prepare or cache a version. Treat `variant.generated` as evidence of a ready output, not merely a queued task. Repeated events should converge on one intended action.\n\nUse bounded budgets and a quiet period before reversing a placement decision. Otherwise noisy demand can repeatedly trigger expensive encodes or cache fills. Measure useful cache hits and avoided viewer delay against the work spent; traffic volume alone does not show that warming paid off.\n\n## Choosing a delivery location\n\nAfter selecting a ready object, a player or delivery service may still choose which CDN or origin serves it. This is a separate decision from choosing the rendition. Old latency samples can mislead either choice.\n\nThe final line of the replay compares two simulated origins transferring the same 1,000 bytes. A took 0.1 seconds at tick 1; B took 0.2 seconds at tick 4. At tick 5, a maximum age of two ticks excludes the faster but stale A sample, so B wins.\n\nThat toy rule only compares fresh equal-size observations. A real selector also needs failure rates, comparable workloads and a fallback when no candidate is eligible. Neither the example nor the label “CDN” establishes a global performance result.\n\nThe next [[wiki/signed-urls-drm-and-video-security|access lesson]] checks permission on every playlist and segment the player chooses.\n"
              }
            },
            {
              "slug": "signed-urls-drm-and-video-security",
              "title": "Signed URLs, DRM, and video security",
              "kind": "lesson",
              "archive": {
                "slug": "signed-urls-drm-and-video-security",
                "file": "signed-urls-drm-and-video-security.md",
                "title": "Signed URLs, DRM, and video security",
                "displayTitle": "Signed URLs, DRM, and video security",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "media",
                  "access"
                ],
                "sources": [
                  "[[wiki/adaptive-bitrate-and-cdn-decider]]",
                  "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html",
                  "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-choosing-signed-urls-cookies.html",
                  "https://www.w3.org/TR/2017/REC-encrypted-media-20170918/",
                  "https://aws.amazon.com/blogs/media/securing-media-content-using-watermarking-at-the-edge/",
                  "https://www.rfc-editor.org/rfc/rfc9110.html",
                  "https://learn.microsoft.com/en-us/playready/overview/security-level"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A private video needs protection wherever its media is served.",
                  "continuation": "Requiring login on the watch page is insufficient if its playlist points to public segments."
                }
              }
            },
            {
              "slug": "live-streaming-webrtc-and-latency",
              "title": "Live streaming, WebRTC, and latency",
              "kind": "lesson",
              "archive": {
                "slug": "live-streaming-webrtc-and-latency",
                "file": "live-streaming-webrtc-and-latency.md",
                "title": "Live streaming, WebRTC, and latency",
                "displayTitle": "Live streaming, WebRTC, and latency",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "media",
                  "realtime"
                ],
                "sources": [
                  "[[wiki/adaptive-bitrate-and-cdn-decider]]",
                  "https://webrtc.org/getting-started/peer-connections",
                  "https://aiortc.readthedocs.io/en/latest/api.html",
                  "https://www.rfc-editor.org/rfc/rfc8834.html",
                  "https://www.rfc-editor.org/rfc/rfc8445.html",
                  "https://www.rfc-editor.org/rfc/rfc8656.html",
                  "https://janus.conf.meetecho.com/docs/videoroom.html",
                  "https://developer.apple.com/videos/play/wwdc2020/10228/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Live delivery sends media while it is being produced.",
                  "continuation": "A broadcast viewer may tolerate being a few seconds behind the camera; people talking to each other need a much shorter feedback loop."
                }
              }
            },
            {
              "slug": "remote-file-sync-design",
              "title": "Remote file sync design",
              "kind": "lesson",
              "archive": {
                "slug": "remote-file-sync-design",
                "file": "remote-file-sync-design.md",
                "title": "Remote file sync",
                "displayTitle": "Remote file sync",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "file-sync",
                  "revisions"
                ],
                "sources": [
                  "[[wiki/metadata-db-for-object-storage]]",
                  "https://dropbox.tech/infrastructure/streaming-file-synchronization",
                  "https://dropbox.tech/infrastructure/-testing-our-new-sync-engine",
                  "https://docs.syncthing.net/users/syncing.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "File synchronization carries changes between local folders and remote storage, including changes made while a device was offline.",
                  "continuation": "It must discover what changed, move the required bytes, and handle competing edits without silently losing someone's work."
                }
              }
            },
            {
              "slug": "fixed-block-chunking-and-content-addressing",
              "title": "Fixed-block chunking and content addressing",
              "kind": "lesson",
              "archive": {
                "slug": "fixed-block-chunking-and-content-addressing",
                "file": "fixed-block-chunking-and-content-addressing.md",
                "title": "Fixed blocks and content addresses",
                "displayTitle": "Fixed blocks and content addresses",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "file-sync",
                  "chunking"
                ],
                "sources": [
                  "[[wiki/remote-file-sync-design]]",
                  "https://dropbox.tech/infrastructure/streaming-file-synchronization",
                  "https://docs.syncthing.net/users/syncing.html",
                  "https://docs.python.org/3.12/library/hashlib.html",
                  "https://borgbackup.readthedocs.io/en/stable/internals/data-structures.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Chunking divides a file into smaller transfer units.",
                  "continuation": "Content addressing names each unit by a hash of its bytes, so a sender can ask which pieces the receiver lacks instead of always resending the file."
                }
              }
            },
            {
              "slug": "blocklist-versioned-file-metadata",
              "title": "Blocklist versioned file metadata",
              "kind": "lesson",
              "archive": {
                "slug": "blocklist-versioned-file-metadata",
                "file": "blocklist-versioned-file-metadata.md",
                "title": "Blocklists and file revisions",
                "displayTitle": "Blocklists and file revisions",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "file-sync",
                  "metadata"
                ],
                "sources": [
                  "[[wiki/fixed-block-chunking-and-content-addressing]]",
                  "[[wiki/metadata-db-for-object-storage]]",
                  "https://dropbox.tech/infrastructure/streaming-file-synchronization",
                  "https://dropbox.tech/infrastructure/inside-the-magic-pocket",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://www.sqlite.org/autoinc.html",
                  "https://www.sqlite.org/pragma.html#pragma_synchronous",
                  "https://docs.python.org/3.12/library/os.html#os.fsync"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "A blocklist records which pieces make up a file and in what order. An immutable revision preserves that recipe, while a mutable path pointer selects the version users currently see. Publishing the recipe must wait until its referenced bytes are ready to read.",
                "mermaidCount": 1,
                "content": "# Blocklists and file revisions\n\nA blocklist records which pieces make up a file and in what order. An immutable revision preserves that recipe, while a mutable path pointer selects the version users currently see. Publishing the recipe must wait until its referenced bytes are ready to read.\n\nWe'll connect the blocklist to a namespace journal, follow the publication transaction, and test missing bytes, corruption and retries in the local sync service.\n\n## One file, several kinds of identity\n\nA path names a location within a namespace. A revision identifies an accepted publication. A digest identifies bytes. Two revisions can contain identical bytes, and two positions in one file can reference the same blob.\n\nOur sixteen-byte file still contains `AAAA`, `BBBB`, `CCCC`, `AAAA`. Its four ordered references need three stored blobs. Turning the blocklist into a set loses the final `AAAA`; sorting the references can produce a different file.\n\n| Record | Key | Relevant content |\n| --- | --- | --- |\n| Journal entry | Namespace and revision | Path, ordered blocks, size, digest, deletion state |\n| Current path | Namespace and path | Selected revision |\n| Operation receipt | Device and operation | Exact proposal and accepted result |\n| Blob | Content digest within allowed storage | Verified immutable bytes |\n\nA fuller file model may also retain timestamps, permissions and application metadata. Keep server acceptance order separate from client modification time. Dropbox's 2016 Magic Pocket account describes the same broad separation of mutable file history from immutable stored blocks; our SQLite schema is a teaching implementation, not its production database.\n\n## The cursor spans the namespace\n\nA journal cursor answers “which accepted changes have I learned about?” across the file tree. A file's base revision answers “which version of this path did I edit?” Those numbers can differ.\n\nFor example, suppose `notes.txt` is revision 14 and another file changes at revision 15. A device can read through cursor 15 while still proposing a new `notes.txt` version against base 14. Rejecting it merely because 14 is not the namespace head would create a conflict with an unrelated edit.\n\nThe proposed query has this shape:\n\n```sql title=\"changes.sql\"\nSELECT revision, path, blocks, digest, size, deleted\nFROM file_journal\nWHERE namespace_id = :namespace\n  AND revision > :after\nORDER BY revision\nLIMIT :page_size;\n```\n\nThe server derives the permitted namespace from authenticated access. A page returns a continuation position for the rows it actually supplies; a client must not skip straight to a later head while earlier pages remain unread. Receiving metadata also does not mean its files have been applied locally.\n\nOur fixture holds only Ada's namespace, so its tables omit a namespace column. It caps history and returns all later rows without pagination. Publication allocates revisions inside the transaction. Its restricted append/rollback path maintains contiguous history; SQLite `AUTOINCREMENT` alone does not promise gap-free IDs.\n\n## Prepare bytes before selecting the revision\n\nThe [[wiki/metadata-db-for-object-storage|object-metadata lesson]] separated stored bytes from published state. Apply the same ordering here:\n\n```mermaid\nflowchart TD\n  accTitle: Publishing a reconstructable revision\n  accDescr: For a new proposal, the local authority checks permission and base, verifies and synchronizes referenced blobs, then commits the journal entry, path pointer and receipt together before replying. Missing or corrupt bytes stop publication.\n  A[Check permission and base] --> B[Verify referenced blobs]\n  B --> C[Synchronize blob files]\n  C --> D[Commit metadata and receipt]\n  D --> E[Reply with revision]\n```\n\nA new blob is written to a temporary file, flushed and synchronized, then renamed to its final address and followed by directory synchronization. The lab repeats synchronization for an identical existing blob: a previous attempt may have left complete bytes but failed before reporting preparation success.\n\nPublication verifies each referenced length and digest and the assembled whole-file identity. One SQLite transaction then appends the revision, moves the path pointer and records the operation's result. A failure rolls back these metadata changes together.\n\nThe file writes occur outside SQLite's storage format; this is not one atomic transaction spanning arbitrary files and a database. The ordering allows unreferenced prepared blobs after a failed publication, which cleanup can handle. It avoids intentionally committing a reference before preparation succeeds.\n\nThe fixture serializes upload, publication and cleanup through SQLite write transactions, including verification and synchronization. That makes the boundary straightforward but holds the writer while doing file I/O. Preparing outside that lock in a larger service needs a pin or equivalent ownership rule so cleanup cannot remove bytes before commitment.\n\n## Run the publication boundary\n\nDownload [the publication example](/course-assets/system-design/m25-sync.py). The command uses temporary private files and SQLite. The corruption step alters only its own fixture and restores the original bytes before retrying.\n\n```bash title=\"terminal\"\nuv venv --quiet --allow-existing --python 3.12.12 /tmp/fanout-m25\n/tmp/fanout-m25/bin/python m25-sync.py publication\n```\n```output\nbefore blocks=409\nuploaded unique bytes=12; visible paths before commit=0\npublished=201; revision=1; ordered references=4\nreconstructed bytes=16; identical=True\nduplicate commit=200\ncorrupt referenced block=503\nrestored-byte retry=201\nstale base=409\nreopened revisions=2; first ordered digests=['63c1dd95', '4a8d8134', '90b4853e', '63c1dd95']\n```\n\nTwelve uploaded bytes initially expose zero paths. Publication selects four references, and the other device reconstructs all sixteen bytes. The last digest display repeats the first because the file repeats that block; storage uses full digests, not these eight-character labels.\n\nChanging stored `BBBB` to same-length `xxxx` defeats a size-only check but fails digest verification. No revision is published until the bytes are restored and synchronized again. The stale base still refuses afterward.\n\nThe database uses `synchronous=EXTRA`; files and directories have explicit synchronization calls. Reopening verifies retained records, but this experiment does not test power loss, disk-controller behavior or replicated durability.\n\n## Recover an operation without authorizing a new one\n\nA matching receipt must be checked before rejecting its now-old base: the original proposal may already have advanced the path. Current device permission still comes first. Reusing an operation ID with a different path, base or payload is a conflict.\n\nThat distinction lets a lost reply recover the original revision while a new stale proposal receives a conflict. Receipt device/operation fields are non-null and unique together; missing identity must not bypass the rule. The original payload is retained so equality can be checked.\n\nRevision history also creates lifecycle work. A deletion record, or tombstone, tells an offline client that absence is intentional. Renames need a defined identity model: this fixture atomically tombstones the old path and appends the destination; a stable file ID can instead preserve identity while its path changes.\n\nKeep blocks while any retained revision still needs them, including history retained after deletion. Then separately decide when history expires, how an old cursor recovers, and how privacy deletion reaches shared blobs and backups. Immutability makes old versions readable; it does not decide how long they should remain.\n\nThe [[wiki/file-sync-system-design|complete file-sync service]] exercises those rename, replay and cleanup paths. [[wiki/data-retention-and-deletion|Data retention and deletion]] develops the broader lifecycle policy.\n"
              }
            }
          ]
        },
        {
          "id": "learning-reliability-ops",
          "number": "14",
          "title": "Reliability and operations",
          "summary": "Observe a running service, change it safely, and recover its data.",
          "units": [
            {
              "slug": "observability-for-distributed-systems",
              "title": "Observability for distributed systems",
              "kind": "lesson",
              "archive": {
                "slug": "observability-for-distributed-systems",
                "file": "observability-for-distributed-systems.md",
                "title": "Observing a request across services",
                "displayTitle": "Observing a request across services",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "observability",
                  "telemetry"
                ],
                "sources": [
                  "[[wiki/file-sync-system-design]]",
                  "https://sre.google/sre-book/monitoring-distributed-systems/",
                  "https://opentelemetry.io/docs/concepts/signals/traces/",
                  "https://prometheus.io/docs/practices/naming/",
                  "https://prometheus.io/docs/introduction/overview/",
                  "https://docs.python.org/3.12/library/time.html#time.monotonic_ns"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A customer says a file never appeared.",
                  "continuation": "The API dashboard shows successful requests."
                }
              }
            },
            {
              "slug": "slos-and-error-budgets",
              "title": "SLOs and error budgets",
              "kind": "lesson",
              "archive": {
                "slug": "slos-and-error-budgets",
                "file": "slos-and-error-budgets.md",
                "title": "SLOs and error budgets",
                "displayTitle": "SLOs and error budgets",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "reliability",
                  "slo"
                ],
                "sources": [
                  "[[wiki/observability-for-distributed-systems]]",
                  "https://sre.google/workbook/implementing-slos/",
                  "https://sre.google/workbook/alerting-on-slos/",
                  "https://sre.google/sre-book/service-level-objectives/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A sync service can be available while taking an hour to deliver a file.",
                  "continuation": "A search service can respond quickly with stale results."
                }
              }
            },
            {
              "slug": "incident-response",
              "title": "Incident response",
              "kind": "lesson",
              "archive": {
                "slug": "incident-response",
                "file": "incident-response.md",
                "title": "Incident response through a verified recovery",
                "displayTitle": "Incident response through a verified recovery",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "incidents",
                  "reliability"
                ],
                "sources": [
                  "[[wiki/observability-for-distributed-systems]]",
                  "[[wiki/slos-and-error-budgets]]",
                  "https://sre.google/sre-book/managing-incidents/",
                  "https://sre.google/sre-book/monitoring-distributed-systems/",
                  "https://sre.google/sre-book/postmortem-culture/",
                  "https://sre.google/workbook/incident-response/"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An incident rarely arrives as a complete explanation.",
                  "continuation": "A probe fails, a customer reports bad data, or a queue stops moving."
                }
              }
            },
            {
              "slug": "deployment-and-migration-safety",
              "title": "Deployment and migration safety",
              "kind": "lesson",
              "archive": {
                "slug": "deployment-and-migration-safety",
                "file": "deployment-and-migration-safety.md",
                "title": "Deployment and migration safety",
                "displayTitle": "Deployment and migration safety",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "deployment",
                  "migration"
                ],
                "sources": [
                  "https://aws.amazon.com/builders-library/ensuring-rollback-safety-during-deployments/",
                  "https://martinfowler.com/bliki/BlueGreenDeployment.html",
                  "https://sre.google/workbook/canarying-releases/",
                  "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/",
                  "[[wiki/database-migration-safety]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A deployment replaces running software while requests and background jobs are still arriving.",
                  "continuation": "The strategy determines how much traffic sees the new version, what you watch during the change, and how you return to the previous version if it fails."
                }
              }
            },
            {
              "slug": "database-migration-safety",
              "title": "Database migration safety",
              "kind": "lesson",
              "archive": {
                "slug": "database-migration-safety",
                "file": "database-migration-safety.md",
                "title": "Database migration safety",
                "displayTitle": "Database migration safety",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "database",
                  "migration"
                ],
                "sources": [
                  "[[wiki/deployment-and-migration-safety]]",
                  "[[wiki/schema-evolution]]",
                  "[[wiki/online-indexing]]",
                  "https://www.postgresql.org/docs/current/ddl-alter.html",
                  "https://www.postgresql.org/docs/current/sql-altertable.html",
                  "https://www.postgresql.org/docs/current/sql-createindex.html",
                  "https://stripe.com/blog/online-migrations",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://www.sqlite.org/lang_createview.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A database migration changes data or schema while applications still depend on it.",
                  "continuation": "During a rolling deployment, old code, new code, workers and backfills may all be active."
                }
              }
            },
            {
              "slug": "parallel-monolith-read-drain",
              "title": "Parallel monolith read drain",
              "kind": "lesson",
              "archive": {
                "slug": "parallel-monolith-read-drain",
                "file": "parallel-monolith-read-drain.md",
                "title": "Parallel monolith read drain",
                "displayTitle": "Parallel monolith read drain",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "migration",
                  "routing"
                ],
                "sources": [
                  "[[wiki/database-migration-safety]]",
                  "[[wiki/replication]]",
                  "https://www.krakend.io/docs/v2.8/endpoints/",
                  "https://www.postgresql.org/docs/current/hot-standby.html",
                  "https://stripe.com/blog/online-migrations",
                  "https://www.sqlite.org/lang_transaction.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "A legacy monolith can overload its primary database with reads simply because its default connection points there. Many of those queries may tolerate a replica's delay, but changing every old call site could take months. Moving a few suitable routes can buy time for that cleanup.",
                "mermaidCount": 1,
                "content": "# Parallel monolith read drain\n\nA legacy monolith can overload its primary database with reads simply because its default connection points there. Many of those queries may tolerate a replica's delay, but changing every old call site could take months. Moving a few suitable routes can buy time for that cleanup.\n\nThe useful boundary is the running application: give a second copy a different database configuration, then control which requests reach it. First choose eligible routes, then measure whether moving them actually relieves the primary.\n\n## Same code, different default database\n\nKeep the existing fleet pointed at the primary. Run another fleet from the same application code with its default connection pointed at a replica. An API gateway sends selected read routes to the second fleet; writes and all other routes stay on the existing path.\n\n| Application fleet | Default database |\n|---|---|\n| Existing monolith | Primary |\n| Read-drain monolith | Replica, with read-only credentials |\n\nThis avoids editing individual queries only when they use that configurable default. Audit explicit connection overrides, startup migrations, background consumers and scheduled jobs. Disable work that should not run in the second fleet. A second HTTP deployment should not accidentally become a second job scheduler.\n\n```mermaid\nflowchart TB\n  accTitle: Route selected reads to a second monolith\n  accDescr: The gateway sends eligible reads to the replica-default monolith and all other routes to the primary-default monolith. The primary replicates changes to the replica.\n  G[API gateway] -->|Other routes| W[Primary-default<br/>monolith]\n  G -->|Eligible reads| R[Replica-default<br/>monolith]\n  W --> P[(Primary)]\n  R --> S[(Replica)]\n  P -. Replication .-> S\n```\n\nRoute by both path and method. Gateway support for `GET /catalog` does not imply that `POST /catalog` should reach the same backend. KrakenD, for example, lets endpoint definitions select a method and backend. That supplies a routing mechanism; it cannot tell you whether the application behind a route is safe to move.\n\n## Choose by behavior and freshness\n\n“GET” is not enough. A handler might update a last-seen timestamp, create a missing row, refresh a token or publish an external event. Read-only database credentials help reject accidental database writes, including after a replica is promoted. They do not prevent external side effects.\n\nA route also needs a freshness contract. An asynchronous replica can return a state from before an accepted write. Decide whether that is acceptable for the particular answer:\n\n| Possible candidates, after inspection | Keep on the primary unless stronger guarantees exist |\n|---|---|\n| Catalog descriptions with an accepted delay | Checkout confirmation immediately after payment |\n| Profile display where a delayed edit is acceptable | Balance or entitlement decisions requiring current state |\n| Dashboards that show their data freshness | Read-modify-write and idempotency endpoints |\n\nThese are starting points, not permanent labels. A catalog page that promises current inventory has a different requirement from one displaying descriptions. A profile response that includes current access permissions needs a separate authorization decision.\n\nFor read-after-write flows, retaining the primary route is often the simplest first choice. The [[wiki/replication|replication lesson]] examines other freshness strategies. Do not silently weaken the product's behavior merely to move more queries.\n\n## Move one route and watch both databases\n\nStart with primary read work attributable to the route: request volume, query volume and expensive queries. Establish enough replica capacity, then route a small population through the second fleet. Watch the primary's work, replica replay lag, endpoint errors and p95/p99 latency together.\n\nA replica can be healthy and still give users a poor answer. In PostgreSQL hot standby, long queries may conflict with WAL replay; letting them run can delay replay, while applying replay can require canceling them. A read drain therefore needs evidence about cancellations and freshness as well as CPU.\n\nShadow reads are an optional earlier step: keep serving the old answer while privately comparing the new one. They add work, so bound the sample. With separate databases, two requests do not automatically share a snapshot. Differences can mean expected lag, a query bug or an incompatible representation; classify them before deciding what blocks rollout.\n\nExpand the route list only when the expected primary work falls without violating those route contracts. Keep enough primary capacity to take the traffic back. Reverting a gateway rule can restore routing while the old path remains compatible; it cannot undo stale answers already delivered.\n\n## Try the serving decisions locally\n\nThe following experiment isolates comparison, cutover and fallback. It uses the [[wiki/database-migration-safety|migration lesson's]] three orders and two representations in **one SQLite database**. It runs real read/write HTTP listeners, but it does not deploy two monoliths, a gateway or a database replica.\n\nAda is selected for the new read path; Bo stays on the old one. The local router checks current source ownership, account activity, deletion state, version and a canonical-record fingerprint before serving a copied body. It therefore still queries the source on every request. This demonstrates a strict acceptance rule, not reduced primary load.\n\nThe example separates three target failures: missing means no copied record, stale means a different version, and mismatch means changed contents at the current version. Old-served shadow comparisons use one shared SQLite snapshot here, so they do not have the cross-database timing ambiguity described above.\n\nSave the [read-drain replay](/course-assets/system-design/m27-lab.py) and [shared implementation](/course-assets/system-design/m27-core.py) together. The original capture used Python 3.14.6 and SQLite 3.53.4 on 12 September 2026. Each run creates temporary state.\n\n```bash title=\"terminal\"\npython3 m27-lab.py drain\n```\n```output\nold served; shadow check: 200 equal\nmissing shadow: missing\nwrong-value shadow: mismatch\nAda cohort new read: 200\nstale target fallback: 200 paid stale\ncaught-up new read: 200\nmissing new fallback: 200\nfallback disabled: 503\nBo remains old cohort: 200\nBo reads Ada object: 404\ncurrent Ada revocation: 403\nwrite on read-only listener: 405\nrollback cohort: []\nroute work: {\"fallback\":2,\"new\":2,\"old\":4,\"refused\":1,\"shadow\":4}\nshadow log fields: classification only; no response bodies\nHTTP outcomes: {\"200\":8,\"201\":1,\"403\":1,\"404\":1,\"405\":1,\"503\":1}\n```\n\nAfter the new writer changes Ada's order, the target is stale. Fallback returns paid from the authoritative source. Disabling fallback makes an unusable target return 503. Bo cannot read Ada's order, a revoked Ada cannot read her own, and the read listener rejects writes.\n\nThe four shadow checks are additional comparisons attached to old reads, not four more user responses. The thirteen HTTP outcomes include the accepted write and permission/method refusals. Diagnostic logs retain comparison classes, not copied response bodies.\n\n## Decide what happens when the replica falls behind\n\nFallback trades freshness and availability for extra primary work. During a replica problem, unbounded fallback can send the entire drained workload back at once. Budget that capacity and cap retries; where capacity is insufficient, the route needs an explicit choice between refusal and an older answer that its product contract permits.\n\nA successful fallback should still count as a degraded new path. Otherwise a green response-success chart can hide a replica that serves almost nothing. Keep served-old, served-new, fallback and refusal counts separate.\n\nBefore adding another route, ask: if this replica pauses immediately after a write, what will the caller see, and can the primary absorb the return traffic? Answer those questions with the route owner. The [[wiki/zero-downtime-database-migration-case-study|complete migration design]] combines the local acceptance checks with copying, retirement and the point where the old fallback disappears.\n"
              }
            },
            {
              "slug": "database-backups-and-restore",
              "title": "Backups and restore",
              "kind": "lesson",
              "archive": {
                "slug": "database-backups-and-restore",
                "file": "database-backups-and-restore.md",
                "title": "Database backups and restore",
                "displayTitle": "Database backups and restore",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "backups",
                  "recovery"
                ],
                "sources": [
                  "[[wiki/database-wal-and-recovery]]",
                  "[[wiki/disaster-recovery]]",
                  "https://www.sqlite.org/backup.html",
                  "https://docs.python.org/3/library/sqlite3.html#sqlite3.Connection.backup",
                  "https://www.postgresql.org/docs/18/continuous-archiving.html",
                  "https://www.postgresql.org/docs/18/backup-dump.html",
                  "https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_for_recovery_dr_tested.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A database backup preserves a recoverable earlier state.",
                  "continuation": "The useful question is whether you can restore that state with the tools and access available during a failure, and whether it is recent enough for the application."
                }
              }
            },
            {
              "slug": "disaster-recovery",
              "title": "Disaster recovery",
              "kind": "lesson",
              "archive": {
                "slug": "disaster-recovery",
                "file": "disaster-recovery.md",
                "title": "Disaster recovery",
                "displayTitle": "Disaster recovery",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "recovery",
                  "operations"
                ],
                "sources": [
                  "[[wiki/database-backups-and-restore]]",
                  "[[wiki/data-retention-and-deletion]]",
                  "[[wiki/case-gitlab-database-incident]]",
                  "https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_for_recovery_objective_defined_recovery.html",
                  "https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html",
                  "https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_for_recovery_dr_tested.html",
                  "https://www.postgresql.org/docs/18/continuous-archiving.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Disaster recovery restores useful service after a failure that the normal serving setup cannot absorb.",
                  "continuation": "The plan may cover a lost region, corrupted data, a catastrophic deployment, compromised credentials or an operator mistake."
                }
              }
            },
            {
              "slug": "data-retention-and-deletion",
              "title": "Data retention, deletion, and privacy",
              "kind": "lesson",
              "archive": {
                "slug": "data-retention-and-deletion",
                "file": "data-retention-and-deletion.md",
                "title": "Data retention and deletion",
                "displayTitle": "Data retention and deletion",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "deletion",
                  "privacy"
                ],
                "sources": [
                  "[[wiki/database-backups-and-restore]]",
                  "[[wiki/disaster-recovery]]",
                  "[[wiki/security-and-abuse-prevention]]",
                  "[[wiki/multi-tenant-design]]",
                  "https://docs.cloud.google.com/docs/security/deletion",
                  "https://cassandra.apache.org/doc/latest/cassandra/managing/operating/compaction/tombstones.html",
                  "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html",
                  "https://www.sqlite.org/pragma.html#pragma_secure_delete"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Retention defines how long a system keeps data.",
                  "continuation": "Deletion removes it from the places the system has copied it."
                }
              }
            },
            {
              "slug": "security-and-abuse-prevention",
              "title": "Security and abuse prevention",
              "kind": "lesson",
              "archive": {
                "slug": "security-and-abuse-prevention",
                "file": "security-and-abuse-prevention.md",
                "title": "Security and abuse prevention",
                "displayTitle": "Security and abuse prevention",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "security",
                  "abuse"
                ],
                "sources": [
                  "[[wiki/data-retention-and-deletion]]",
                  "[[wiki/multi-tenant-design]]",
                  "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
                  "https://api-security.owasp.org/editions/2023/en/0xa4-unrestricted-resource-consumption/",
                  "https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html",
                  "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html",
                  "https://www.rfc-editor.org/rfc/rfc9449.html#section-11.1",
                  "https://docs.python.org/3/library/hmac.html",
                  "https://docs.python.org/3/library/http.server.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Security design decides who may use a system and what they may do with its data.",
                  "continuation": "Abuse prevention also considers how legitimate operations can harm users or exhaust shared resources."
                }
              }
            },
            {
              "slug": "rate-limiter-placement-and-keys",
              "title": "Rate limiter placement and keys",
              "kind": "lesson",
              "archive": {
                "slug": "rate-limiter-placement-and-keys",
                "file": "rate-limiter-placement-and-keys.md",
                "title": "Rate limiter placement and keys",
                "displayTitle": "Rate limiter placement and keys",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "rate-limiting",
                  "admission"
                ],
                "sources": [
                  "[[wiki/api-gateway-vs-load-balancer]]",
                  "[[wiki/load-shedding]]",
                  "https://nginx.org/en/docs/http/ngx_http_limit_req_module.html",
                  "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api",
                  "https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/rate_limit_filter",
                  "https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/local_rate_limit_filter",
                  "https://www.rfc-editor.org/rfc/rfc6585.html",
                  "https://www.rfc-editor.org/rfc/rfc7239.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A rate limiter decides how much work a caller may start within a period.",
                  "continuation": "Its usefulness depends on where it runs and which requests share an allowance."
                }
              }
            },
            {
              "slug": "sliding-window-rate-limiter",
              "title": "Sliding window rate limiter",
              "kind": "lesson",
              "archive": {
                "slug": "sliding-window-rate-limiter",
                "file": "sliding-window-rate-limiter.md",
                "title": "Sliding window rate limiter",
                "displayTitle": "Sliding window rate limiter",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "rate-limiting",
                  "algorithms"
                ],
                "sources": [
                  "[[wiki/rate-limiter-placement-and-keys]]",
                  "https://redis.io/tutorials/howtos/ratelimiting/",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://www.rfc-editor.org/rfc/rfc6585.html",
                  "https://www.rfc-editor.org/rfc/rfc9110.html#name-retry-after",
                  "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api",
                  "https://developer.mozilla.org/en-US/docs/Web/API/Performance/now"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A sliding-window limiter checks how much a caller has been admitted during the most recent period.",
                  "continuation": "The window moves with each decision."
                }
              }
            },
            {
              "slug": "multi-tenant-design",
              "title": "Multi-tenant design",
              "kind": "lesson",
              "archive": {
                "slug": "multi-tenant-design",
                "file": "multi-tenant-design.md",
                "title": "Multi-tenant design",
                "displayTitle": "Multi-tenant design",
                "type": "lesson",
                "tags": [
                  "system-design",
                  "tenancy",
                  "isolation"
                ],
                "sources": [
                  "[[wiki/security-and-abuse-prevention]]",
                  "[[wiki/data-retention-and-deletion]]",
                  "[[wiki/disaster-recovery]]",
                  "https://docs.aws.amazon.com/whitepapers/latest/saas-tenant-isolation-strategies/silo-isolation.html",
                  "https://docs.aws.amazon.com/whitepapers/latest/saas-tenant-isolation-strategies/pool-isolation.html",
                  "https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/storage-data",
                  "https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/service/storage",
                  "https://www.postgresql.org/docs/current/ddl-rowsecurity.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A multi-tenant service serves several customers on shared infrastructure.",
                  "continuation": "A tenant is the customer boundary, often a company or workspace."
                }
              }
            }
          ]
        }
      ]
    },
    {
      "id": "part-2",
      "number": 2,
      "title": "Real-world systems",
      "summary": "Additional system designs, with a concrete request path, data model and failure behavior.",
      "hours": 4,
      "modules": [
        {
          "id": "design-services",
          "number": "15",
          "title": "Service and data designs",
          "summary": "Follow a complete system design, from requirements through failure behavior.",
          "units": [
            {
              "slug": "url-shortener-system-design",
              "title": "Design: a URL shortener, one machine",
              "kind": "design",
              "archive": {
                "slug": "url-shortener-system-design",
                "file": "url-shortener-system-design.md",
                "title": "Design: a URL shortener, one machine",
                "displayTitle": "Design: a URL shortener, one machine",
                "type": "design",
                "tags": [
                  "system-design",
                  "design",
                  "ground-floor",
                  "url-shortener"
                ],
                "sources": [
                  "[[wiki/requirements-clarification]]",
                  "[[wiki/non-functional-requirements]]",
                  "[[wiki/back-of-the-envelope-capacity-planning]]",
                  "https://www.postgresql.org/docs/16/sql-insert.html",
                  "https://www.rfc-editor.org/rfc/rfc9110.html#name-302-found",
                  "https://www.rfc-editor.org/rfc/rfc9111.html#name-no-store-2",
                  "https://docs.python.org/3/library/secrets.html",
                  "https://www.postgresql.org/docs/16/pgbench.html"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 3,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A URL shortener stores a destination behind a compact link.",
                  "continuation": "Creating a link writes that mapping; opening it returns a redirect so the browser can fetch the destination itself."
                }
              }
            },
            {
              "slug": "rate-limiting-and-abuse-prevention-case-study",
              "title": "Design: rate limiting and abuse prevention",
              "kind": "design",
              "archive": {
                "slug": "rate-limiting-and-abuse-prevention-case-study",
                "file": "rate-limiting-and-abuse-prevention-case-study.md",
                "title": "Design: rate limiting and abuse prevention",
                "displayTitle": "Design: rate limiting and abuse prevention",
                "type": "design",
                "tags": [
                  "system-design",
                  "design",
                  "rate-limiting",
                  "abuse-prevention"
                ],
                "sources": [
                  "[[wiki/url-shortener-system-design]]",
                  "[[wiki/rate-limiter-placement-and-keys]]",
                  "[[wiki/sliding-window-rate-limiter]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "[[wiki/load-shedding]]",
                  "[[wiki/case-stripe-idempotency-keys]]",
                  "https://www.rfc-editor.org/rfc/rfc6585",
                  "https://www.rfc-editor.org/rfc/rfc9110.html#name-retry-after",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://www.postgresql.org/docs/16/explicit-locking.html#LOCKING-ROWS",
                  "https://www.postgresql.org/docs/16/transaction-iso.html#XACT-READ-COMMITTED",
                  "https://stripe.com/blog/rate-limiters",
                  "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/other_features/global_rate_limiting"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A rate limiter decides whether a caller may start more work, based on the work already admitted for that caller.",
                  "continuation": "In our URL shortener, it stops one creator's repeated requests from consuming the resources needed to create and follow everyone else's links."
                }
              }
            },
            {
              "slug": "url-shortener-at-scale",
              "title": "Design: a URL shortener at scale",
              "kind": "design",
              "archive": {
                "slug": "url-shortener-at-scale",
                "file": "url-shortener-at-scale.md",
                "title": "Design: a URL shortener at scale",
                "displayTitle": "Design: a URL shortener at scale",
                "type": "design",
                "tags": [
                  "system-design",
                  "design",
                  "caching",
                  "url-shortener"
                ],
                "sources": [
                  "[[wiki/url-shortener-system-design]]",
                  "[[wiki/rate-limiting-and-abuse-prevention-case-study]]",
                  "[[wiki/caching-layers]]",
                  "[[wiki/cache-concurrency-control]]",
                  "[[wiki/cache-availability-and-database-fallback]]",
                  "[[wiki/distributed-cache-design]]",
                  "https://www.postgresql.org/docs/16/sql-insert.html",
                  "https://www.postgresql.org/docs/16/warm-standby.html",
                  "https://redis.io/docs/latest/develop/reference/eviction/",
                  "https://www.sqlite.org/pragma.html#pragma_synchronous",
                  "https://www.rfc-editor.org/rfc/rfc9111.html#name-no-store-2",
                  "https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A URL shortener can reuse the destination of a popular link instead of looking it up in the database for every request.",
                  "continuation": "A shared cache makes that copy available to several application instances."
                }
              }
            },
            {
              "slug": "ecommerce-product-listing-system-design",
              "title": "Design: a product listing",
              "kind": "design",
              "archive": {
                "slug": "ecommerce-product-listing-system-design",
                "file": "ecommerce-product-listing-system-design.md",
                "title": "Design: a product listing",
                "displayTitle": "Design: a product listing",
                "type": "design",
                "tags": [
                  "system-design",
                  "ecommerce",
                  "relational-databases",
                  "design"
                ],
                "sources": [
                  "[[wiki/relational-database-design]]",
                  "[[wiki/database-indexing]]",
                  "[[wiki/keyset-pagination]]",
                  "[[wiki/caching-layers]]",
                  "[[wiki/nosql-decision-boundaries]]",
                  "[[wiki/sharding-and-partitioning]]",
                  "[[wiki/hot-partitions]]",
                  "https://www.postgresql.org/docs/16/ddl-constraints.html",
                  "https://www.postgresql.org/docs/16/queries-limit.html",
                  "https://www.postgresql.org/docs/16/transaction-iso.html",
                  "https://www.postgresql.org/docs/16/indexes-multicolumn.html",
                  "https://www.postgresql.org/docs/16/indexes-partial.html",
                  "https://www.postgresql.org/docs/16/functions-comparisons.html",
                  "https://www.greatfrontend.com/projects/challenges/product-listing-section"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 3,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A product listing turns catalog records into a page a shopper can browse.",
                  "continuation": "The query decides which products qualify, their order, and where the next page begins."
                }
              }
            },
            {
              "slug": "collaborative-editing-system-design",
              "title": "Design: a collaborative editor",
              "kind": "design",
              "archive": {
                "slug": "collaborative-editing-system-design",
                "file": "collaborative-editing-system-design.md",
                "title": "Design: a collaborative editor",
                "displayTitle": "Design: a collaborative editor",
                "type": "design",
                "tags": [
                  "system-design",
                  "collaboration",
                  "coordination"
                ],
                "sources": [
                  "[[wiki/consistency-models]]",
                  "[[wiki/replication]]",
                  "[[wiki/clocks-and-ordering]]",
                  "[[wiki/websockets-vs-sse-vs-long-polling]]",
                  "[[wiki/consensus]]",
                  "[[wiki/realtime-database-and-websocket-scaling]]",
                  "[[wiki/event-contracts]]",
                  "[[wiki/schema-evolution]]",
                  "[[wiki/leader-election]]",
                  "[[wiki/distributed-locks-and-leases]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "https://docs.yjs.dev/api/document-updates",
                  "https://docs.yjs.dev/api/shared-types/y.text",
                  "https://docs.yjs.dev/api/relative-positions",
                  "https://docs.yjs.dev/api/undo-manager",
                  "https://docs.yjs.dev/getting-started/a-collaborative-editor",
                  "https://docs.yjs.dev/getting-started/adding-awareness",
                  "https://docs.yjs.dev/getting-started/allowing-offline-editing",
                  "https://docs.yjs.dev/ecosystem/connection-provider/y-websocket",
                  "https://github.com/yjs/yjs/blob/v13.6.32/INTERNALS.md",
                  "https://codemirror.net/examples/collab/",
                  "https://www.greatfrontend.com/questions/system-design/collaborative-editor-google-docs",
                  "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/",
                  "https://sqlite.org/lang_transaction.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 3,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A collaborative editor lets several people change the same document while seeing one another's work.",
                  "continuation": "Each person's typing appears locally before a server can confirm it."
                }
              }
            },
            {
              "slug": "object-store-system-design",
              "title": "Design: an object store (S3)",
              "kind": "design",
              "archive": {
                "slug": "object-store-system-design",
                "file": "object-store-system-design.md",
                "title": "Design: an object store (S3)",
                "displayTitle": "Design: an object store (S3)",
                "type": "design",
                "tags": [
                  "system-design",
                  "object-storage",
                  "design"
                ],
                "sources": [
                  "[[wiki/object-storage-vs-database]]",
                  "[[wiki/s3-object-storage-architecture]]",
                  "[[wiki/byte-range-indexed-object-storage]]",
                  "[[wiki/partition-manager-and-map-table]]",
                  "[[wiki/metadata-db-for-object-storage]]",
                  "[[wiki/append-only-object-storage-stream-layer]]",
                  "[[wiki/object-storage-durability-and-replication]]",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html",
                  "https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html",
                  "https://www.allthingsdistributed.com/2023/07/building-and-operating-a-pretty-big-storage-system.html",
                  "https://www.allthingsdistributed.com/2021/04/s3-strong-consistency.html",
                  "https://www.rfc-editor.org/rfc/rfc9110.html"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An object store gives an application a name for a completed file and a way to retrieve its bytes.",
                  "continuation": "We'll design one for exported reports: an upload may take minutes, but readers must never see a half-written report."
                }
              }
            },
            {
              "slug": "partitioned-log-system-design",
              "title": "Design: a Kafka-style log",
              "kind": "design",
              "archive": {
                "slug": "partitioned-log-system-design",
                "file": "partitioned-log-system-design.md",
                "title": "Design: a Kafka-style log",
                "displayTitle": "Design: a Kafka-style log",
                "type": "design",
                "tags": [
                  "system-design",
                  "streams",
                  "storage"
                ],
                "sources": [
                  "[[wiki/task-queue-vs-event-stream]]",
                  "[[wiki/event-bus-for-product-events]]",
                  "[[wiki/sharding-and-partitioning]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "[[wiki/end-to-end-checksums]]",
                  "https://kafka.apache.org/42/design/design/",
                  "https://kafka.apache.org/42/configuration/producer-configs/",
                  "https://kafka.apache.org/42/configuration/topic-configs/",
                  "https://kafka.apache.org/42/operations/kraft/",
                  "https://kafka.apache.org/42/operations/eligible-leader-replicas/",
                  "https://kafka.apache.org/42/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html",
                  "https://kafka.apache.org/42/implementation/log/",
                  "https://kafka.apache.org/42/implementation/message-format/"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A publishing service needs search and analytics to receive the same post changes.",
                  "continuation": "Search may be current while analytics is an hour behind."
                }
              }
            }
          ]
        },
        {
          "id": "design-products",
          "number": "16",
          "title": "Product designs",
          "summary": "Follow a complete system design, from requirements through failure behavior.",
          "units": [
            {
              "slug": "notification-system-design",
              "title": "Design: a notification system",
              "kind": "design",
              "archive": {
                "slug": "notification-system-design",
                "file": "notification-system-design.md",
                "title": "Design: a notification system",
                "displayTitle": "Design: a notification system",
                "type": "design",
                "tags": [
                  "system-design",
                  "notifications",
                  "delivery"
                ],
                "sources": [
                  "[[wiki/task-queue-vs-event-stream]]",
                  "[[wiki/fanout-patterns]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "[[wiki/rate-limiter-placement-and-keys]]",
                  "[[wiki/batching]]",
                  "[[wiki/event-bus-for-product-events]]",
                  "https://www.uber.com/us/en/blog/real-time-push-platform/",
                  "https://resend.com/docs/dashboard/emails/idempotency-keys",
                  "https://resend.com/docs/webhooks/introduction",
                  "https://resend.com/docs/webhooks/verify-webhooks-requests",
                  "https://docs.aws.amazon.com/ses/latest/dg/monitor-using-event-publishing.html",
                  "https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-lifespan"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "A notification service turns a product event into messages for particular people. When a report finishes, Ada might need an inbox item and an email. Those are two separate pieces of work: the inbox can appear while the email is still waiting at a provider.",
                "mermaidCount": 2,
                "content": "# Design: a notification system\n\nA notification service turns a product event into messages for particular people. When a report finishes, Ada might need an inbox item and an email. Those are two separate pieces of work: the inbox can appear while the email is still waiting at a provider.\n\nWe'll follow that report from the product database to its recipients, then handle preference changes, lost send replies and a large announcement. The design starts with email and an in-app inbox. Push and SMS share the routing machinery, but need their own delivery rules.\n\n![An email provider's tray holds one envelope labeled Accepted. A person looking at an empty inbox says Still waiting. Provider acceptance does not establish arrival in the recipient's inbox.](/course-assets/system-design/illustrations/notification-accepted.webp)\n\n## Decide what the service promises\n\nAccepting work means retaining enough information to finish or explain it after a restart. It does not mean every selected channel has delivered a message. We call the retained decision for one recipient and channel an **intent**.\n\nFor our report product, the useful contract is:\n\n- A committed report event can be retried without creating another intent for the same recipient and channel.\n- Pending email work observes opt-outs before its dispatch decision. Once a send may be in flight, withdrawal requires a different recovery decision.\n- A provider outage leaves recoverable work and visible uncertainty. It does not prevent the report itself from finishing.\n- Support can distinguish suppression, local inbox visibility, provider acceptance and subsequent delivery evidence.\n\nProduct requirements should also specify how late a message may be. A report-ready message can remain useful after a short outage; an expired invitation cannot. Store an expiry time where needed and check it before starting a send. A queue retry budget should not outlive the message's usefulness.\n\nThe inbox is durable history, while a badge is a projection of what the user has acknowledged. Keep that distinction from [[wiki/newly-unread-indicator|the unread-indicator design]]. Opening the inbox need not assert that every email was read.\n\n## Separate routing from delivery\n\nThe product commits the report change and an outbox entry together. A relay publishes the event. This is the [[wiki/event-bus-for-product-events|transactional outbox]] boundary: losing a process after the report commits must leave the notification work discoverable.\n\nA router consumes the event, selects recipients and channels, and records their intents. Channel workers perform those intents later. The [[wiki/task-queue-vs-event-stream|event stream carries a fact; the work queue assigns an action]]. Rebuilding an analytics projection from old events should not silently resend old notifications.\n\n```mermaid\nflowchart TD\n    accTitle: From product fact to channel work\n    accDescr: Product state and an outbox commit together. A relay publishes to the router, which retains intents in the notification database. Dispatch workers read pending work. Inbox writes stay local; email goes through a provider. Verified provider events return through a receipt handler.\n    P[\"Product + outbox\"] -->|Relay event|R[\"Router\"]\n    R -->|Retain intents|D[\"Notification DB\"]\n    D -->|Pending work|W[\"Dispatch workers\"]\n    W -->|Commit inbox item|D\n    W -->|Send|E[\"Email provider\"]\n    E -->|Webhook|H[\"Receipt handler\"]\n    H -->|Verified evidence|D\n```\n\nThe database owns intents, preferences, inbox rows and delivery history. A queue can carry intent IDs to wake workers quickly, but a scan of pending work must recover a lost wake-up. Otherwise the gap between saving an intent and publishing its queue message can strand it forever.\n\nThese are responsibilities, not a demand for six independently deployed services. One application and database can provide the first version. Split workers and queues when a slow provider or bulk workload needs isolation.\n\nUber's historical RAMEN account makes a related separation between deciding when to generate an update, constructing its payload and delivering it. Its foreground app transport is a different system from our email adapter; the useful architectural idea is keeping product decisions separate from transport behavior.\n\n## Retain the decision, then record attempts\n\nUse `(tenant, event, recipient, channel)` as the intent's unique identity. The small single-tenant download omits tenant. A template version is an attribute, not part of that identity: deploying a new template must not turn a retry into a second notification.\n\nAn intent stores the chosen template version, locale and rendering inputs. Before its first external call, freeze the exact provider payload and destination. Re-reading a mutable display name or template during a retry can change the request even when its key stays the same.\n\n| Stored record | What it lets us answer |\n| --- | --- |\n| Event and routing progress | Did we retain this fact, and finish enumerating its audience? |\n| Recipient-channel intent | What message do we owe, when is it due, and may it expire? |\n| Attempt | Which provider call ran, under which preference decision, and what did it return? |\n| Provider message and evidence | Which external message do later callbacks describe? |\n| Inbox item | What can this account read locally? |\n\nStore the event receipt and a small event's intents in one transaction. Saving the receipt first and crashing halfway through routing would make the replay skip missing recipients. For a large audience, retain a fanout job and advance its progress only with the corresponding inserted intents.\n\nAn internal API might accept `POST /notification-events` with an event ID, event type, subject and audience reference. Authenticate the producing service and authorize that audience; callers should not acquire permission to email arbitrary users merely by knowing an ID. Return accepted only after the routing job is durable. Reuse with incompatible input is an error.\n\nFor readers, `GET /notifications?before=...` selects the authenticated account's inbox using a stable `(created_at, id)` cursor. Support lookup joins the event's intents and attempts. Index these two access paths rather than expecting one global delivery-status scan to serve both.\n\nAt larger volume, partition recipient state by tenant and user so an inbox read and its uniqueness check stay together. Routing spans those partitions: retain the fanout job separately and replay idempotent recipient inserts instead of assuming a cross-shard transaction. Keep an event-to-intent index for support lookups.\n\n## Apply preferences at a precise boundary\n\nRouting is too early to make the final email preference decision. Ada can disable email while a backlog is draining. For a pending intent, read her current settings and record the dispatch decision atomically with claiming that work. In our design, an opt-out committed before this decision suppresses it.\n\nDo not hold the transaction open during the provider call. It would occupy database resources without making the remote provider participate in the transaction. An opt-out committed after the local decision can still race with the send.\n\nRecord the preference version that authorized dispatch. That gives support a concrete explanation instead of a current settings screen that disagrees with yesterday's decision. Category and tenant policy need similarly explicit precedence; a report update should not inherit an unrelated marketing preference.\n\nQuiet hours introduce a due time, computed in the user's timezone, rather than a sleeping worker. A digest also needs membership: retain which events belong to which digest occurrence so rebuilding it cannot notify the same events again. The [[wiki/distributed-task-scheduler|scheduler]] supplies due-work recovery; it cannot decide those product rules for us.\n\n## Recover an uncertain send\n\nA successful provider reply gives us a message ID. A timeout may give us nothing, even if the provider already accepted the email. Generating a fresh ID on the next attempt risks a second message.\n\nInstead, generate a stable operation key from the intent and send the frozen payload under that key. The adapter must rely on a documented provider contract. Resend, for example, retains idempotency keys for 24 hours, returns the previous result for a repeated request and rejects a changed payload under the same key. Our retry window must fit that contract.\n\n```mermaid\nsequenceDiagram\n    accTitle: A lost reply does not require a second email\n    accDescr: The worker records its dispatch decision, sends a stable key and payload, then loses the provider reply after acceptance. It records uncertainty. Repeating the original request within the provider's idempotency window returns the same message ID.\n    participant D as Intent store\n    participant W as Worker\n    participant P as Provider\n    W->>D: Claim and record preference decision\n    W->>P: Send key K, frozen payload\n    P->>P: Retain acceptance for K\n    P--xW: Message ID · reply lost\n    W->>D: Record unknown outcome\n    W->>P: Retry K, same payload\n    P-->>W: Original message ID\n    W->>D: Record accepted message\n```\n\nThis is the external version of [[wiki/retries-timeouts-idempotency|retry identity]]. Our database can prevent duplicate intents; it cannot unilaterally prevent duplicate effects at another company's API.\n\nA worker can also disappear before it records `unknown`, leaving `sending` behind. Production workers need expiring claims and guarded completion. On reclaim, treat the prior call as uncertain, even if it might never have left the machine. A stale worker must not overwrite newer local evidence, and concurrent provider attempts must still use the same identity.\n\nIf the provider window expires, look up the original operation where supported or retain the unknown state for an explicit decision. A circuit breaker stops more calls during an outage; it does not explain earlier calls. Moving uncertain work from provider A to provider B also loses A's deduplication protection.\n\nThere is a preference consequence too. Retrying an unknown operation under its original decision may create its first acceptance after a later opt-out if the earlier call never arrived. Our fixture permits that. A stricter withdrawal policy needs lookup or cancellation support, or must leave the outcome unresolved rather than risk starting a send.\n\nDistinguish this uncertainty from a definite refusal. Invalid input should not retry unchanged. A documented throttle can schedule a later attempt with backoff and jitter. Bound retries by provider limits, message expiry and the acceptable duplicate-versus-miss policy.\n\n## Let evidence describe delivery\n\nThe inbox writer can insert the item and mark its intent visible in one database transaction. A unique event-recipient key makes repetition harmless. Reads still require current authorization; a link inside an old message must not grant continuing access to a report.\n\nEmail crosses another owner's boundary. Amazon SES distinguishes a successful send request from delivery to the recipient's mail server. Neither proves that the person read it. Name the status accordingly rather than showing one ambiguous green “sent” flag.\n\nProvider webhooks form another retried input stream. Resend documents duplicate and out-of-order delivery. Verify the signature over the raw request body, bind the provider account and message to our intent, then durably store the receipt before acknowledging it. Applying the evidence can happen in that transaction or through recoverable pending work.\n\nA delivery event might arrive before the send response has been saved. Keep that unmatched evidence for reconciliation; do not discard it because the intent currently lacks the message ID. Once delivery evidence exists, a delayed send response must not replace it with a weaker accepted-only status. Complaints and bounces are additional facts worth retaining, not merely numbers in one increasing status sequence.\n\nReceipt retention must cover the intended replay window. Removing all deduplication records while old events can still return may recreate messages. Retain minimal identities where possible and expire sensitive bodies according to the product's [[wiki/data-retention-and-deletion|retention policy]].\n\n### Add push without hiding its differences\n\nFCM returning a message ID means acceptance for delivery, not arrival at the device. Its message lifespan bounds how long unavailable-device work remains useful. An expired meeting invitation should not appear when a phone reconnects days later.\n\nA push collapse key can replace an older pending update with a newer one. That is useful for “refresh this report,” but it is not the same as deduplicating a particular send, nor does it preserve every distinct report event. Keep durable history in the inbox when each event matters.\n\nTrack device tokens separately from users, remove tokens on definitive invalid-token feedback, and preserve per-device outcomes. SMS would add its own provider error mapping, expiry, cost budget and delivery evidence. A shared adapter interface should expose these differences rather than promise universal exactly-once delivery.\n\n## Keep a large audience from blocking small work\n\nSuppose a chosen load has 40 report events per second, five recipients per event, and email plus inbox for each recipient. That creates 400 intents per second. If 25% of email intents are suppressed, the email lane receives 150 first attempts per second; the inbox still receives 200 writes per second. Retries add provider calls, not new intents.\n\nNow add an announcement with 120,000 eligible email recipients. At a hypothetical bulk allowance of 200 first attempts per second, the best-case drain time is ten minutes, before retries or throttling. These are planning assumptions, not measured throughput or a provider quota.\n\nA single FIFO queue can put report messages behind that announcement. Allocate a separate bulk budget and retain capacity for transactional work. Separate queues alone are insufficient if both workers exhaust the same provider account quota or database pool. [[wiki/rate-limiter-placement-and-keys|Rate-limit placement]] determines which shared resource is actually protected.\n\nEnumerate the announcement's audience in recoverable chunks, using a frozen audience version or an explicit membership cutoff. Advance the cursor with the chunk's durable intents; replay can then reuse their unique keys. Re-querying a changing audience without a membership rule can skip or unexpectedly add recipients. This is the [[wiki/fanout-patterns|fanout progress problem]] at notification scale.\n\nPer-user limits solve a different problem: protecting attention. A mention storm might create several durable inbox items but only one push or digest. Record that coalescing decision so a retry cannot consume another attention allowance or send another summary. Provider quotas alone cannot express it.\n\nA [[wiki/batching|batch adapter]] can reduce calls where the provider supports it, but must record each recipient's result. Retry the failed subset with the appropriate stable identities. Share template work only for identical locale and content; personalization must remain bound to the right recipient.\n\nMeasure oldest eligible intent age per lane, provider throttles, unknown-attempt age and suppression reasons. Count provider acceptance and delivery evidence separately. A provider's temporary outage can delay callbacks, so “no delivery event yet” is not a measured permanent failure.\n\n## Run the smaller recovery experiment\n\nThe [notification example](/course-assets/system-design/m14-notifications.py) isolates four intents in private SQLite files. Ada gets email and an inbox item. Bo starts with email disabled; Cy opts out after routing. A separate fake provider accepts Ada's email and deliberately loses the reply.\n\nIt makes local Python calls and sends no email. Its provider keys never expire. It implements neither a worker pool nor automatic recovery from abandoned `sending` claims; those remain production requirements described above.\n\nRun with Python 3. This capture was checked on 18 September 2026 with Python 3.14.6 and SQLite 3.53.4, including optimized Python:\n\n```bash title=\"terminal\"\npython3 m14-notifications.py\n```\n\n```output\nroute new event: True\nroute duplicate: False\nretained intents: 4\nBo email: suppressed\nCy email: suppressed\nAda in-app: visible\nAda email: unknown\nfake state after timeout: accepted=1, delivered=0\nAda email after reopen: accepted\nprovider calls=2, accepted records=1\ndelivery callback: True\nduplicate callback: False\nchanged retry: changed provider payload\nuser | channel | final state | preference version\nAda | email | delivered | 1\nAda | in-app | visible | 1\nBo | email | suppressed | 1\nCy | email | suppressed | 2\n```\n\nAda's two provider calls leave one acceptance record. Reopening the files preserves that identity. Only the later trusted callback marks delivery; it is a direct function call, not a verified public webhook. Bo and Cy never reach the provider, and Cy's version-two preference explains why.\n\nTo test the subtle boundary, repeat the experiment with a provider that times out **before** accepting. Disable Ada's email, then retry the unknown intent. Under this fixture's stated rule, the retry still uses the original decision and can create the message. Compare that with Cy, whose still-pending intent is suppressed. Both outcomes follow from where the service recorded permission to begin sending.\n"
              }
            },
            {
              "slug": "ticket-booking-system-design",
              "title": "Design: a ticket booking system",
              "kind": "design",
              "archive": {
                "slug": "ticket-booking-system-design",
                "file": "ticket-booking-system-design.md",
                "title": "Design: a ticket booking system",
                "displayTitle": "Design: a ticket booking system",
                "type": "design",
                "tags": [
                  "system-design",
                  "booking",
                  "workflows"
                ],
                "sources": [
                  "[[wiki/flash-sale-inventory-locking]]",
                  "[[wiki/database-locking-and-isolation]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "[[wiki/distributed-locks-and-leases]]",
                  "[[wiki/load-shedding]]",
                  "https://docs.seats.io/docs/api/temporarily-hold-objects/",
                  "https://docs.seats.io/docs/api/get-objects-for-a-hold-token/",
                  "https://www.postgresql.org/docs/current/explicit-locking.html",
                  "https://www.postgresql.org/docs/current/functions-datetime.html",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://docs.stripe.com/payments/payment-intents/verifying-status",
                  "https://docs.stripe.com/payments/place-a-hold-on-a-payment-method",
                  "https://developers.cloudflare.com/waiting-room/reference/queueing-methods/"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A seat map tells you what appears available.",
                  "continuation": "A hold temporarily keeps a seat for you."
                }
              }
            },
            {
              "slug": "payment-system-design",
              "title": "Design: a payment system",
              "kind": "design",
              "archive": {
                "slug": "payment-system-design",
                "file": "payment-system-design.md",
                "title": "Design: a payment system",
                "displayTitle": "Design: a payment system",
                "type": "design",
                "tags": [
                  "system-design",
                  "payments",
                  "workflows"
                ],
                "sources": [
                  "[[wiki/api-design-contracts]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "[[wiki/event-contracts]]",
                  "[[wiki/database-locking-and-isolation]]",
                  "[[wiki/service-to-service-communication]]",
                  "https://docs.stripe.com/api/idempotent_requests",
                  "https://docs.stripe.com/webhooks",
                  "https://docs.stripe.com/payments/payment-intents",
                  "https://docs.stripe.com/payments/paymentintents/lifecycle",
                  "https://docs.stripe.com/refunds",
                  "https://developer.squareup.com/blog/books-an-immutable-double-entry-accounting-database-service/",
                  "https://docs.adyen.com/reporting/settlement-reconciliation/transaction-level/settlement-details-report"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A payment service keeps an agreement between a merchant and a payment provider: collect this amount for this order, then retain enough evidence to explain what happened.",
                  "continuation": "The provider can complete its work while our request times out."
                }
              }
            },
            {
              "slug": "search-engine-system-design",
              "title": "Design: a search service",
              "kind": "design",
              "archive": {
                "slug": "search-engine-system-design",
                "file": "search-engine-system-design.md",
                "title": "Design: a search service",
                "displayTitle": "Design: a search service",
                "type": "design",
                "tags": [
                  "system-design",
                  "search",
                  "indexing"
                ],
                "sources": [
                  "[[wiki/inverted-index-and-posting-lists]]",
                  "[[wiki/bm25-production-ranking]]",
                  "[[wiki/search-index-synchronization]]",
                  "[[wiki/search-index-sharding]]",
                  "[[wiki/search-evaluation-metrics]]",
                  "https://www.linkedin.com/blog/engineering/search/did-you-mean-galene",
                  "https://slack.engineering/how-we-built-enterprise-search-to-be-secure-and-private/",
                  "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/refresh-parameter",
                  "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results",
                  "https://www.elastic.co/docs/manage-data/data-store/aliases"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A search service turns a few words into an ordered list of documents.",
                  "continuation": "For a team's documentation, that means finding useful matches while respecting edits, deletions and access changes."
                }
              }
            },
            {
              "slug": "recommendation-system-design",
              "title": "Design: a recommendation system",
              "kind": "design",
              "archive": {
                "slug": "recommendation-system-design",
                "file": "recommendation-system-design.md",
                "title": "Design: a recommendation system",
                "displayTitle": "Design: a recommendation system",
                "type": "design",
                "tags": [
                  "system-design",
                  "recommendations",
                  "ranking",
                  "design"
                ],
                "sources": [
                  "https://research.google.com/pubs/archive/45530.pdf",
                  "https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/",
                  "https://docs.nvidia.com/deeplearning/performance/recsys-best-practices/index.html",
                  "https://scikit-learn.org/stable/common_pitfalls.html#data-leakage",
                  "https://www.sqlite.org/isolation.html",
                  "[[wiki/matching-and-recommendation-algorithms]]",
                  "[[wiki/seen-filtering-bloom-vs-exact-sets]]",
                  "[[wiki/vector-search-and-hybrid-retrieval]]",
                  "[[wiki/raw-events-vs-derived-analytics]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A recommendation service selects useful items before the reader asks for a particular one.",
                  "continuation": "For an article app, that means choosing what belongs on the home page from the reader's interests, the available catalog and recent feedback."
                }
              }
            },
            {
              "slug": "chat-and-messaging-system-design",
              "title": "Design: chat and messaging",
              "kind": "design",
              "archive": {
                "slug": "chat-and-messaging-system-design",
                "file": "chat-and-messaging-system-design.md",
                "title": "Design: chat and messaging",
                "displayTitle": "Design: chat and messaging",
                "type": "design",
                "tags": [
                  "system-design",
                  "chat",
                  "messaging"
                ],
                "sources": [
                  "[[wiki/websockets-vs-sse-vs-long-polling]]",
                  "[[wiki/realtime-database-and-websocket-scaling]]",
                  "[[wiki/distributed-id-generation]]",
                  "[[wiki/newly-unread-indicator]]",
                  "[[wiki/direct-to-object-storage-upload]]",
                  "[[wiki/fanout-patterns]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "[[wiki/notification-system-design]]",
                  "https://slack.engineering/real-time-messaging/",
                  "https://discord.com/blog/how-discord-stores-trillions-of-messages",
                  "https://spec.matrix.org/v1.16/client-server-api/",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://www.greatfrontend.com/questions/system-design/chat-application-messenger"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A chat service keeps a conversation available when its participants come and go.",
                  "continuation": "It accepts messages, establishes their order, and lets devices catch up after losing a connection."
                }
              }
            },
            {
              "slug": "social-feed-system-design-case-study",
              "title": "Design: a social feed",
              "kind": "design",
              "archive": {
                "slug": "social-feed-system-design-case-study",
                "file": "social-feed-system-design-case-study.md",
                "title": "Design: a recoverable social feed",
                "displayTitle": "Design: a recoverable social feed",
                "type": "design",
                "tags": [
                  "system-design",
                  "feeds",
                  "social-network"
                ],
                "sources": [
                  "https://www.linkedin.com/blog/engineering/feed/followfeed-linkedin-s-feed-made-faster-and-smarter",
                  "https://engineering.fb.com/2021/01/26/ml-applications/news-feed-ranking/",
                  "https://www.pinterestcareers.com/media/ofzpjb5v/scaling-deep.pdf",
                  "https://www.greatfrontend.com/questions/system-design/news-feed-facebook",
                  "[[wiki/feed-generation-push-pull-hybrid]]",
                  "[[wiki/social-graph-follows-and-flockdb]]",
                  "[[wiki/fanout-patterns]]",
                  "[[wiki/caching-layers]]",
                  "[[wiki/hashtag-extraction-and-tag-store]]",
                  "[[wiki/event-bus-for-product-events]]",
                  "[[wiki/seen-filtering-bloom-vs-exact-sets]]",
                  "[[wiki/rate-limiter-placement-and-keys]]",
                  "[[wiki/hot-partitions]]",
                  "[[wiki/queue-lag]]",
                  "[[wiki/keyset-pagination]]",
                  "[[wiki/snowflake-id-design]]",
                  "[[wiki/soft-delete]]"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A home feed brings posts from followed accounts into one ordered list.",
                  "continuation": "Publishing a post and placing it in every follower's list are different operations: the post can be safely stored while feed preparation is still catching up."
                }
              }
            },
            {
              "slug": "geospatial-nearby-search-case-study",
              "title": "Design: nearby search",
              "kind": "design",
              "archive": {
                "slug": "geospatial-nearby-search-case-study",
                "file": "geospatial-nearby-search-case-study.md",
                "title": "Design: nearby place search",
                "displayTitle": "Design: nearby place search",
                "type": "design",
                "tags": [
                  "system-design",
                  "geospatial",
                  "nearby-search"
                ],
                "sources": [
                  "[[wiki/nearby-geospatial-search-system-design]]",
                  "[[wiki/geohash-prefix-spatial-index]]",
                  "[[wiki/geospatial-grid-systems-h3-s2-geohash]]",
                  "[[wiki/redis-geo-spatial-hot-path]]",
                  "[[wiki/geofencing-point-in-polygon]]",
                  "https://postgis.net/docs/ST_DWithin.html",
                  "https://postgis.net/workshops/postgis-intro/knn.html",
                  "https://redis.io/docs/latest/commands/geosearch/",
                  "https://www.uber.com/us/en/blog/h3/",
                  "https://www.greatfrontend.com/questions/system-design/travel-booking-airbnb"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Nearby search finds places around a chosen point, applies the reader's filters, and orders the matches.",
                  "continuation": "A map makes this look like drawing a circle."
                }
              }
            }
          ]
        },
        {
          "id": "design-operations",
          "number": "17",
          "title": "Media and operations designs",
          "summary": "Follow a complete system design, from requirements through failure behavior.",
          "units": [
            {
              "slug": "ride-matching-system-design",
              "title": "Design: ride matching",
              "kind": "design",
              "archive": {
                "slug": "ride-matching-system-design",
                "file": "ride-matching-system-design.md",
                "title": "Design: ride matching",
                "displayTitle": "Design: ride matching",
                "type": "design",
                "tags": [
                  "system-design",
                  "geospatial",
                  "matching"
                ],
                "sources": [
                  "[[wiki/geospatial-nearby-search-case-study]]",
                  "[[wiki/nearby-geospatial-search-system-design]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "https://www.uber.com/us/en/blog/fulfillment-platform-rearchitecture/",
                  "https://www.uber.com/ca/en/marketplace/matching/",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://www.sqlite.org/partialindex.html",
                  "https://www.greatfrontend.com/interviews/company/uber/questions-guides"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A ride-matching service takes a pickup request, finds eligible drivers, and turns a driver's acceptance into an assignment.",
                  "continuation": "The map helps choose whom to ask."
                }
              }
            },
            {
              "slug": "video-platform-system-design",
              "title": "Design: a video platform",
              "kind": "design",
              "archive": {
                "slug": "video-platform-system-design",
                "file": "video-platform-system-design.md",
                "title": "Design: a video platform",
                "displayTitle": "Design: a video platform",
                "type": "design",
                "tags": [
                  "system-design",
                  "media",
                  "design"
                ],
                "sources": [
                  "[[wiki/direct-to-object-storage-upload]]",
                  "[[wiki/video-upload-signed-url-multipart]]",
                  "[[wiki/video-transcoding-pipeline]]",
                  "[[wiki/adaptive-bitrate-and-cdn-decider]]",
                  "[[wiki/signed-urls-drm-and-video-security]]",
                  "https://docs.aws.amazon.com/solutions/latest/video-on-demand-on-aws/architecture-overview.html",
                  "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-cookies.html",
                  "https://www.rfc-editor.org/rfc/rfc8216.html",
                  "https://ffmpeg.org/ffmpeg.html",
                  "https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play",
                  "https://www.greatfrontend.com/questions/system-design/video-streaming-netflix"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A video platform turns an uploaded file into media that viewers can play on different devices and connections.",
                  "continuation": "Uploading is only the first step: the service must prepare suitable versions, make them discoverable, and keep delivering the next segment while playback continues."
                }
              }
            },
            {
              "slug": "file-sync-system-design",
              "title": "Design: a file sync service",
              "kind": "design",
              "archive": {
                "slug": "file-sync-system-design",
                "file": "file-sync-system-design.md",
                "title": "Design: a file sync service",
                "displayTitle": "Design: a file sync service",
                "type": "design",
                "tags": [
                  "system-design",
                  "file-sync",
                  "design"
                ],
                "sources": [
                  "[[wiki/remote-file-sync-design]]",
                  "[[wiki/fixed-block-chunking-and-content-addressing]]",
                  "[[wiki/blocklist-versioned-file-metadata]]",
                  "https://dropbox.tech/infrastructure/-testing-our-new-sync-engine",
                  "https://docs.syncthing.net/users/syncing.html",
                  "https://docs.dropboxapi.com/dropbox-api/docs/file-access",
                  "https://docs.dropboxapi.com/dropbox-api/docs/detecting-changes",
                  "https://www.sqlite.org/autoinc.html"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A file-sync service carries changes between a remote folder and devices that may be offline.",
                  "continuation": "It has to move the right bytes, distinguish an edit from a retry, and preserve work when two devices change the same file."
                }
              }
            },
            {
              "slug": "observability-slo-case-study",
              "title": "Design: observability and SLOs",
              "kind": "design",
              "archive": {
                "slug": "observability-slo-case-study",
                "file": "observability-slo-case-study.md",
                "title": "Design: observability and service objectives",
                "displayTitle": "Design: observability and service objectives",
                "type": "design",
                "tags": [
                  "system-design",
                  "observability",
                  "reliability",
                  "design"
                ],
                "sources": [
                  "[[wiki/observability-for-distributed-systems]]",
                  "[[wiki/slos-and-error-budgets]]",
                  "[[wiki/incident-response]]",
                  "[[wiki/tdigest-quantile-sketch]]",
                  "[[wiki/streaming-percentile-analytics]]",
                  "https://sre.google/sre-book/monitoring-distributed-systems/",
                  "https://sre.google/workbook/implementing-slos/",
                  "https://sre.google/workbook/alerting-on-slos/",
                  "https://sre.google/sre-book/managing-incidents/",
                  "https://opentelemetry.io/docs/concepts/signals/traces/",
                  "https://opentelemetry.io/docs/collector/resiliency/",
                  "https://prometheus.io/docs/practices/naming/",
                  "https://prometheus.io/docs/introduction/overview/",
                  "https://grafana.com/docs/grafana/latest/",
                  "https://docs.python.org/3.12/library/time.html#time.monotonic_ns"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An observability system connects a user's result to the work that produced it.",
                  "continuation": "It should help an operator answer three questions: is the service meeting its promise, which part failed, and did the repair work?"
                }
              }
            },
            {
              "slug": "zero-downtime-database-migration-case-study",
              "title": "Design: a database migration",
              "kind": "design",
              "archive": {
                "slug": "zero-downtime-database-migration-case-study",
                "file": "zero-downtime-database-migration-case-study.md",
                "title": "Design: a database migration",
                "displayTitle": "Design: a database migration",
                "type": "design",
                "tags": [
                  "system-design",
                  "database",
                  "migration"
                ],
                "sources": [
                  "[[wiki/schema-evolution]]",
                  "[[wiki/online-indexing]]",
                  "[[wiki/database-migration-safety]]",
                  "[[wiki/deployment-and-migration-safety]]",
                  "[[wiki/parallel-monolith-read-drain]]",
                  "https://stripe.com/blog/online-migrations",
                  "https://www.postgresql.org/docs/18/logicaldecoding-explanation.html",
                  "https://github.com/github/gh-ost/blob/master/doc/throttle.md",
                  "https://github.com/github/gh-ost/blob/master/doc/cut-over.md",
                  "https://www.sqlite.org/lang_transaction.html",
                  "https://www.sqlite.org/lang_createview.html",
                  "https://docs.python.org/3/library/http.server.html"
                ],
                "created": "2026-05-14",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A database migration changes the representation that an application depends on.",
                  "continuation": "While the copy runs, users may still read and update the same records."
                }
              }
            },
            {
              "slug": "interview-design-instagram",
              "title": "Design: a photo-sharing interview",
              "kind": "design",
              "archive": {
                "slug": "interview-design-instagram",
                "file": "interview-design-instagram.md",
                "title": "Design: a photo-sharing interview",
                "displayTitle": "Design: a photo-sharing interview",
                "type": "design",
                "tags": [
                  "system-design",
                  "interview",
                  "feed",
                  "media"
                ],
                "sources": [
                  "[[wiki/social-feed-system-design-case-study]]",
                  "[[wiki/image-cdn-and-resizing]]",
                  "[[wiki/view-counting-at-scale]]",
                  "https://www.greatfrontend.com/questions/system-design/photo-sharing-instagram",
                  "https://www.greatfrontend.com/interviews/study/gfe75/questions/system-design/news-feed-facebook",
                  "https://engineering.fb.com/2009/04/30/core-infra/needle-in-a-haystack-efficient-storage-of-billions-of-photos/",
                  "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
                  "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 2,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A photo-sharing service has two connected jobs: publish an author's image and help other people discover it.",
                  "continuation": "The image bytes, post metadata and follower feed have different storage and delivery needs."
                }
              }
            }
          ]
        }
      ]
    },
    {
      "id": "part-3",
      "number": 3,
      "title": "Case studies",
      "summary": "Documented engineering decisions and incidents.",
      "hours": 1,
      "modules": [
        {
          "id": "company-cases",
          "number": "18",
          "title": "Engineering case studies",
          "summary": "Study the systems and incidents described by their engineering teams.",
          "units": [
            {
              "slug": "case-instagram-early-architecture",
              "title": "Case: Instagram's first architecture",
              "kind": "case",
              "archive": {
                "slug": "case-instagram-early-architecture",
                "file": "case-instagram-early-architecture.md",
                "title": "Case: Instagram's first architecture",
                "displayTitle": "Case: Instagram's first architecture",
                "type": "case",
                "tags": [
                  "system-design",
                  "case",
                  "scaling",
                  "instagram"
                ],
                "sources": [
                  "https://instagram-engineering.tumblr.com/post/13649370142/what-powers-instagram-hundreds-of-instances (2011-12-02)",
                  "https://speakerdeck.com/mikeyk/scaling-instagram (2012-04-12)",
                  "https://instagram-engineering.tumblr.com/post/10853187575/sharding-ids-at-instagram (2011-09-30)",
                  "[[wiki/horizontal-vs-vertical-scaling]]",
                  "[[wiki/load-balancers]]",
                  "[[wiki/api-gateway-vs-load-balancer]]",
                  "[[wiki/monolith-vs-microservices]]"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Instagram's early scaling work separated three jobs that appear together on a phone: running application code, retrieving records, and delivering image bytes.",
                  "continuation": "Its engineers' 2011 posts and Mike Krieger's April 2012 talk let us follow those choices and a later decision to remove duplicated state."
                }
              }
            },
            {
              "slug": "case-stripe-idempotency-keys",
              "title": "Case: Stripe's idempotency keys",
              "kind": "case",
              "archive": {
                "slug": "case-stripe-idempotency-keys",
                "file": "case-stripe-idempotency-keys.md",
                "title": "Case: Stripe's idempotency keys",
                "displayTitle": "Case: Stripe's idempotency keys",
                "type": "case",
                "tags": [
                  "system-design",
                  "case",
                  "stripe",
                  "idempotency"
                ],
                "sources": [
                  "https://stripe.com/blog/idempotency (2017-02-22)",
                  "https://docs.stripe.com/api/idempotent_requests (2026-09-18)",
                  "https://docs.stripe.com/error-low-level (2026-09-18)",
                  "https://docs.stripe.com/api/request_ids (2026-09-18)",
                  "https://github.com/stripe/stripe-python#configuring-automatic-retries (2026-09-18)",
                  "[[wiki/service-to-service-communication]]",
                  "[[wiki/retries-timeouts-idempotency]]",
                  "[[wiki/rate-limiter-placement-and-keys]]"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "An idempotency key tells a server which intended operation a request belongs to.",
                  "continuation": "That matters when the server completes work but its reply never reaches the caller: another attempt should recover the result without creating another operation."
                }
              }
            },
            {
              "slug": "case-discord-message-storage",
              "title": "Case: how Discord stores trillions of messages",
              "kind": "case",
              "archive": {
                "slug": "case-discord-message-storage",
                "file": "case-discord-message-storage.md",
                "title": "Case: how Discord stores trillions of messages",
                "displayTitle": "Case: how Discord stores trillions of messages",
                "type": "case",
                "tags": [
                  "system-design",
                  "case-study",
                  "discord",
                  "partitioning"
                ],
                "sources": [
                  "https://discord.com/blog/how-discord-stores-billions-of-messages (2017-01-13)",
                  "https://discord.com/blog/how-discord-stores-trillions-of-messages (2023-03-06)",
                  "https://cassandra.apache.org/doc/latest/cassandra/managing/operating/compaction/tombstones.html (2026-09-18)",
                  "[[wiki/nosql-decision-boundaries]]",
                  "[[wiki/columnar-vs-wide-column-stores]]",
                  "[[wiki/sharding-and-partitioning]]",
                  "[[wiki/consistent-hashing-load-balancing]]",
                  "[[wiki/hot-partitions]]",
                  "[[wiki/hot-cold-storage-archival]]"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "A message store has to serve both a crowded channel and a quiet conversation whose latest messages are months old.",
                  "continuation": "Discord's database history shows why those two reads can stress different parts of the same system."
                }
              }
            },
            {
              "slug": "case-amazon-dynamo",
              "title": "Case: Amazon Dynamo, the paper",
              "kind": "case",
              "archive": {
                "slug": "case-amazon-dynamo",
                "file": "case-amazon-dynamo.md",
                "title": "Case: Amazon Dynamo, the paper",
                "displayTitle": "Case: Amazon Dynamo, the paper",
                "type": "case",
                "tags": [
                  "system-design",
                  "case-study",
                  "replication",
                  "dynamo"
                ],
                "sources": [
                  "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf (2007-10-14)",
                  "https://docs.riak.com/riak/kv/2.2.3/learn/concepts/causal-context/index.html (2026-09-18)",
                  "https://docs.riak.com/riak/kv/2.1.3/using/reference/handoff/index.html (2026-09-18)",
                  "https://docs.riak.com/riak/kv/2.2.3/learn/concepts/active-anti-entropy/index.html (2026-09-18)",
                  "https://www.amazon.science/publications/amazon-dynamodb-a-scalable-predictably-performant-and-fully-managed-nosql-database-service (2026-09-18)",
                  "[[wiki/nosql-decision-boundaries]]",
                  "[[wiki/consistent-hashing]]",
                  "[[wiki/replication]]",
                  "[[wiki/consistency-models]]",
                  "[[wiki/cap-and-pacelc]]",
                  "[[wiki/clocks-and-ordering]]"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-18",
                "excerpt": "",
                "mermaidCount": 1,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "Dynamo was Amazon's internal key-value store for services that needed to keep accepting useful work during failures.",
                  "continuation": "Its 2007 paper is especially useful for understanding what happens after two parts of a system accept different versions of an object."
                }
              }
            },
            {
              "slug": "case-gitlab-database-incident",
              "title": "Case: GitLab’s database incident",
              "kind": "case",
              "archive": {
                "slug": "case-gitlab-database-incident",
                "file": "case-gitlab-database-incident.md",
                "title": "Case: GitLab's database incident",
                "displayTitle": "Case: GitLab's database incident",
                "type": "case",
                "tags": [
                  "system-design",
                  "backups",
                  "recovery",
                  "incident"
                ],
                "sources": [
                  "https://about.gitlab.com/blog/gitlab-dot-com-database-incident/ (2017-02-01)",
                  "https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/ (2017-02-10)",
                  "https://www.postgresql.org/docs/18/continuous-archiving.html (2026-09-17)",
                  "[[wiki/database-backups-and-restore]]",
                  "[[wiki/disaster-recovery]]"
                ],
                "created": "2026-09-11",
                "updated": "2026-09-17",
                "excerpt": "",
                "mermaidCount": 0,
                "content": "",
                "preview": {
                  "heading": "The core idea",
                  "paragraph": "On January 31, 2017, GitLab lost production database data while repairing replication.",
                  "continuation": "Service returned the next day using an older copy, leaving about six hours of database changes unrecovered."
                }
              }
            }
          ]
        }
      ]
    }
  ],
  "implementations": [
    {
      "id": "load-balancer-from-scratch",
      "title": "Load Balancer From Scratch",
      "primarySlug": "load-balancers",
      "archiveSlugs": [
        "load-balancers",
        "api-gateway-vs-load-balancer"
      ],
      "summary": "A tiny L7 request router with health checks, round-robin routing, least-connections routing, and forwarded request metadata.",
      "primaryLanguage": "JavaScript",
      "difficulty": "starter",
      "entryFile": "src/balancer.js",
      "runHint": "node implementations/load-balancer-from-scratch/src/demo.js",
      "takeaways": [
        "A balancer is a small policy engine around a backend pool.",
        "Health state is checked before routing, not after the request already failed.",
        "Production versions add sockets, retries, draining, and observability around the same core choice."
      ],
      "files": [
        {
          "path": "README.md",
          "language": "markdown",
          "role": "overview"
        },
        {
          "path": "src/balancer.js",
          "language": "javascript",
          "role": "core router"
        },
        {
          "path": "src/demo.js",
          "language": "javascript",
          "role": "walkthrough"
        }
      ]
    },
    {
      "id": "consistent-hashing-ring",
      "title": "Consistent Hashing Ring",
      "primarySlug": "consistent-hashing",
      "archiveSlugs": [
        "consistent-hashing",
        "consistent-hashing-load-balancing",
        "distributed-cache-design",
        "sharding-and-partitioning"
      ],
      "summary": "A readable hash ring with virtual nodes and binary-search lookup, the core primitive behind cache and storage routing.",
      "primaryLanguage": "TypeScript",
      "difficulty": "starter",
      "entryFile": "src/ring.ts",
      "runHint": "Read src/demo.ts and run it with any TypeScript runner.",
      "takeaways": [
        "Virtual points offer more placement positions per owner; they do not guarantee balanced request work.",
        "The lookup is a binary search for the first ring point clockwise from the key.",
        "Adding a node remaps only a slice of keys instead of reshuffling everything."
      ],
      "files": [
        {
          "path": "README.md",
          "language": "markdown",
          "role": "overview"
        },
        {
          "path": "src/ring.ts",
          "language": "typescript",
          "role": "hash ring"
        },
        {
          "path": "src/demo.ts",
          "language": "typescript",
          "role": "walkthrough"
        }
      ]
    },
    {
      "id": "bloom-filter-membership",
      "title": "Bloom Filter Membership",
      "primarySlug": "bloom-filters",
      "archiveSlugs": [
        "bloom-filters",
        "seen-filtering-bloom-vs-exact-sets",
        "lsm-read-path-bloom-and-sparse-index"
      ],
      "summary": "A compact membership filter that can reject misses cheaply while accepting a controlled false-positive rate.",
      "primaryLanguage": "TypeScript",
      "difficulty": "starter",
      "entryFile": "src/bloom.ts",
      "runHint": "Read src/demo.ts and run it with any TypeScript runner.",
      "takeaways": [
        "Bloom filters answer maybe-present or definitely-not-present.",
        "Multiple hash indexes map one value into a compact bit array.",
        "They are useful before expensive disk, network, or database lookups."
      ],
      "files": [
        {
          "path": "README.md",
          "language": "markdown",
          "role": "overview"
        },
        {
          "path": "src/bloom.ts",
          "language": "typescript",
          "role": "filter"
        },
        {
          "path": "src/demo.ts",
          "language": "typescript",
          "role": "walkthrough"
        }
      ]
    },
    {
      "id": "tiny-search-engine",
      "title": "Tiny Search Engine",
      "primarySlug": "inverted-index-and-posting-lists",
      "archiveSlugs": [
        "information-retrieval-system-design",
        "inverted-index-and-posting-lists",
        "bm25-production-ranking",
        "search-index-sharding"
      ],
      "summary": "A small inverted index with tokenization, posting lists, and a BM25-style ranking pass.",
      "primaryLanguage": "TypeScript",
      "difficulty": "intermediate",
      "entryFile": "src/index.ts",
      "runHint": "Read src/demo.ts and run it with any TypeScript runner.",
      "takeaways": [
        "Indexing turns documents into term -> posting-list mappings.",
        "Query time starts from postings, not from scanning every document.",
        "Ranking combines term frequency, rarity, and document-length normalization."
      ],
      "files": [
        {
          "path": "README.md",
          "language": "markdown",
          "role": "overview"
        },
        {
          "path": "src/tokenize.ts",
          "language": "typescript",
          "role": "normalizer"
        },
        {
          "path": "src/index.ts",
          "language": "typescript",
          "role": "inverted index"
        },
        {
          "path": "src/search.ts",
          "language": "typescript",
          "role": "ranking"
        },
        {
          "path": "src/demo.ts",
          "language": "typescript",
          "role": "walkthrough"
        }
      ]
    },
    {
      "id": "sliding-window-rate-limiter",
      "title": "Sliding Window Rate Limiter",
      "primarySlug": "sliding-window-rate-limiter",
      "archiveSlugs": [
        "sliding-window-rate-limiter",
        "rate-limiter-placement-and-keys",
        "rate-limiting-and-abuse-prevention-case-study"
      ],
      "summary": "An in-memory limiter that stores recent request timestamps per key and computes allow, remaining, and retry-after decisions.",
      "primaryLanguage": "TypeScript",
      "difficulty": "starter",
      "entryFile": "src/limiter.ts",
      "runHint": "Read src/demo.ts and run it with any TypeScript runner.",
      "takeaways": [
        "The key choice decides what the limiter actually protects.",
        "Old hits must be evicted before checking the current request.",
        "Shared production limiters usually move this state into Redis or another atomic store."
      ],
      "files": [
        {
          "path": "README.md",
          "language": "markdown",
          "role": "overview"
        },
        {
          "path": "src/limiter.ts",
          "language": "typescript",
          "role": "limiter"
        },
        {
          "path": "src/demo.ts",
          "language": "typescript",
          "role": "walkthrough"
        }
      ]
    },
    {
      "id": "lease-leader-election",
      "title": "Lease Leader Election",
      "primarySlug": "leader-election",
      "archiveSlugs": [
        "leader-election",
        "consensus",
        "distributed-locks-and-leases",
        "source-raft-paper"
      ],
      "summary": "An in-memory lease sketch with expiry and increasing tokens; its permission precheck does not fence a later storage effect.",
      "primaryLanguage": "JavaScript",
      "difficulty": "starter",
      "entryFile": "src/leaseStore.js",
      "runHint": "node implementations/lease-leader-election/src/demo.js",
      "takeaways": [
        "A lease deadline determines eligibility in the authority's chosen clock.",
        "A stale owner can resume after checking permission; the resource must check tokens atomically with effects.",
        "Real deployments need a linearizable store for the lease record."
      ],
      "files": [
        {
          "path": "README.md",
          "language": "markdown",
          "role": "overview"
        },
        {
          "path": "src/leaseStore.js",
          "language": "javascript",
          "role": "lease state"
        },
        {
          "path": "src/node.js",
          "language": "javascript",
          "role": "candidate node"
        },
        {
          "path": "src/demo.js",
          "language": "javascript",
          "role": "walkthrough"
        }
      ]
    },
    {
      "id": "write-ahead-log",
      "title": "Write-Ahead Log",
      "primarySlug": "database-wal-and-recovery",
      "archiveSlugs": [
        "database-wal-and-recovery",
        "memtable-wal-and-sstable",
        "log-structured-storage",
        "lsm-tree-storage-engine"
      ],
      "summary": "A teaching store that writes JSONL log records before updating memory and replays a valid prefix after process interruption.",
      "primaryLanguage": "JavaScript",
      "difficulty": "starter",
      "entryFile": "src/wal.js",
      "runHint": "node implementations/write-ahead-log/src/demo.js",
      "takeaways": [
        "The model acknowledges after its log sync; its I/O and filesystem handling is not a production durability proof.",
        "Recovery rebuilds memory by replaying complete, checksummed records.",
        "This simple recovery stops at the first malformed record; production recovery must distinguish a torn tail from other corruption."
      ],
      "files": [
        {
          "path": "README.md",
          "language": "markdown",
          "role": "overview"
        },
        {
          "path": "src/wal.js",
          "language": "javascript",
          "role": "durable log"
        },
        {
          "path": "src/store.js",
          "language": "javascript",
          "role": "key-value store"
        },
        {
          "path": "src/demo.js",
          "language": "javascript",
          "role": "walkthrough"
        }
      ]
    },
    {
      "id": "gossip-protocol",
      "title": "Gossip Protocol",
      "primarySlug": "gossip-protocol",
      "archiveSlugs": [
        "gossip-protocol",
        "distributed-hash-tables",
        "metadata-service-and-node-discovery",
        "distributed-systems-foundations"
      ],
      "summary": "A push-pull gossip simulation where nodes sample peers, exchange versioned records, and converge without broadcasting to everyone.",
      "primaryLanguage": "JavaScript",
      "difficulty": "starter",
      "entryFile": "src/node.js",
      "runHint": "node implementations/gossip-protocol/src/demo.js",
      "takeaways": [
        "Gossip spreads metadata through repeated small peer samples.",
        "Merge rules must be deterministic so replicas converge.",
        "Convergence is eventual; each round only gives a node a partial view."
      ],
      "files": [
        {
          "path": "README.md",
          "language": "markdown",
          "role": "overview"
        },
        {
          "path": "src/node.js",
          "language": "javascript",
          "role": "gossip node"
        },
        {
          "path": "src/network.js",
          "language": "javascript",
          "role": "peer sampler"
        },
        {
          "path": "src/demo.js",
          "language": "javascript",
          "role": "walkthrough"
        }
      ]
    },
    {
      "id": "ttl-cache-reaper",
      "title": "TTL Cache Reaper",
      "primarySlug": "ttl-expiration-and-cache-reapers",
      "archiveSlugs": [
        "ttl-expiration-and-cache-reapers",
        "caching-layers",
        "sql-backed-key-value-store",
        "flash-sale-inventory-locking"
      ],
      "summary": "An in-memory TTL cache that stores absolute expiry timestamps, enforces lazy expiration on reads, and reclaims memory with active sweeps.",
      "primaryLanguage": "JavaScript",
      "difficulty": "starter",
      "entryFile": "src/cache.js",
      "runHint": "node implementations/ttl-cache-reaper/src/demo.js",
      "takeaways": [
        "TTL should be stored as an absolute expiry timestamp.",
        "Reads must reject expired data even if a background reaper has not run.",
        "Jitter spreads expirations so large batches do not stampede at one deadline."
      ],
      "files": [
        {
          "path": "README.md",
          "language": "markdown",
          "role": "overview"
        },
        {
          "path": "src/cache.js",
          "language": "javascript",
          "role": "ttl cache"
        },
        {
          "path": "src/demo.js",
          "language": "javascript",
          "role": "walkthrough"
        }
      ]
    },
    {
      "id": "lru-cache",
      "title": "LRU Cache",
      "primarySlug": "cache-eviction-policies",
      "archiveSlugs": [
        "cache-eviction-policies",
        "cache-concurrency-control",
        "cache-availability-and-database-fallback",
        "caching-layers"
      ],
      "summary": "A small least-recently-used cache where reads refresh recency and full-capacity writes evict the oldest entry.",
      "primaryLanguage": "JavaScript",
      "difficulty": "starter",
      "entryFile": "src/lru.js",
      "runHint": "node implementations/lru-cache/src/demo.js",
      "takeaways": [
        "LRU eviction is a policy over access order, not creation order.",
        "Reads and updates both move a key to the newest position.",
        "The oldest key is the next eviction candidate when capacity is full."
      ],
      "files": [
        {
          "path": "README.md",
          "language": "markdown",
          "role": "overview"
        },
        {
          "path": "src/lru.js",
          "language": "javascript",
          "role": "cache policy"
        },
        {
          "path": "src/demo.js",
          "language": "javascript",
          "role": "walkthrough"
        }
      ]
    },
    {
      "id": "snowflake-id-generator",
      "title": "Snowflake ID Generator",
      "primarySlug": "snowflake-id-design",
      "archiveSlugs": [
        "snowflake-id-design",
        "uuid-objectid-and-snowflake",
        "distributed-id-generation",
        "clock-skew-and-id-ordering"
      ],
      "summary": "A compact Snowflake-style generator that packs timestamp, worker id, and per-millisecond sequence fields into one sortable integer.",
      "primaryLanguage": "JavaScript",
      "difficulty": "starter",
      "entryFile": "src/generator.js",
      "runHint": "node implementations/snowflake-id-generator/src/demo.js",
      "takeaways": [
        "Putting timestamp bits first makes IDs mostly sortable.",
        "Distinct worker assignments separate generators; ownership and restart state require their own coordination.",
        "Clock rollback must be rejected or waited through to preserve local monotonicity."
      ],
      "files": [
        {
          "path": "README.md",
          "language": "markdown",
          "role": "overview"
        },
        {
          "path": "src/generator.js",
          "language": "javascript",
          "role": "id generator"
        },
        {
          "path": "src/demo.js",
          "language": "javascript",
          "role": "walkthrough"
        }
      ]
    },
    {
      "id": "keyset-pagination-cursors",
      "title": "Keyset Pagination Cursors",
      "primarySlug": "keyset-pagination",
      "archiveSlugs": [
        "keyset-pagination",
        "database-indexing",
        "online-indexing",
        "relational-database-scaling"
      ],
      "summary": "An ordered in-memory dataset showing how cursor predicates resume after the last seen row while offset pagination can drift after inserts.",
      "primaryLanguage": "JavaScript",
      "difficulty": "starter",
      "entryFile": "src/pagination.js",
      "runHint": "node implementations/keyset-pagination-cursors/src/demo.js",
      "takeaways": [
        "A keyset cursor stores the last row's ordering keys.",
        "The next page uses a predicate, not a moving row count.",
        "Offset pagination can duplicate or skip rows when the list changes between requests."
      ],
      "files": [
        {
          "path": "README.md",
          "language": "markdown",
          "role": "overview"
        },
        {
          "path": "src/pagination.js",
          "language": "javascript",
          "role": "pagination logic"
        },
        {
          "path": "src/demo.js",
          "language": "javascript",
          "role": "walkthrough"
        }
      ]
    }
  ]
};
