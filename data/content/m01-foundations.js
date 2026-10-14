window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-foundations"] = {
  "requirements-clarification": {
    "title": "Requirements clarification",
    "video": {
      "youtubeId": "iUU4O1sWtJA",
      "title": "Beginner System Design Interview: Design Bitly w/ a Ex-Meta Staff Engineer",
      "channel": "Hello Interview",
      "why": "Uses the exact URL-shortener running example of this unit and spends its opening section showing how a staff engineer turns a vague prompt into functional requirements, non-functional targets and explicit out-of-scope items before designing anything.",
      "length": "59:30"
    },
    "videos": [
      {
        "youtubeId": "xRdjEd-VQTU",
        "title": "Foundation of System Design Interview starting with Functional vs Non Functional Requirements",
        "channel": "sudoCODE",
        "role": "intro",
        "why": "Short, focused explanation of separating what the system does from the qualities it must keep, which is the core habit of requirements clarification.",
        "length": "10:23"
      },
      {
        "youtubeId": "i7twT3x5yv8",
        "title": "System Design Interview: A Step-By-Step Guide",
        "channel": "ByteByteGo",
        "role": "interview",
        "why": "Places requirement clarification as step one of a repeatable interview framework and shows what questions to ask before estimating or drawing boxes.",
        "length": "9:54"
      }
    ],
    "intuition": "<p>Think of an architect asked to \"build a house\". Before drawing walls they ask: how many people live there, does anyone use a wheelchair, what is the budget, must it survive earthquakes? Two families can both say \"house\" and need completely different buildings.</p>\n<p><strong>Mental model:</strong> requirements clarification converts a noun (\"a URL shortener\") into a short list of <em>actors, operations, invariants, numbers and explicit non-goals</em> that you can check a design against.</p>\n<p>A good brief lets you answer \"what should happen when X fails?\" without guessing. If you cannot say whether a redirect should still succeed when click logging is down, the requirement is not finished yet.</p>\n<ul>\n<li><strong>Jumping to technology:</strong> saying \"we will use Redis and Kafka\" before knowing read/write ratio, freshness needs or retention is the most common interview red flag.</li>\n<li><strong>Vague qualities:</strong> \"fast\" and \"highly available\" are not requirements until they have a number, a measurement point and a time window.</li>\n<li><strong>Forgetting non-goals:</strong> not stating what is out of scope (custom aliases, editing, analytics dashboards) lets scope silently grow and makes the design look unfocused.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n<h2>Requirements clarification</h2>\n<p>Requirements clarification turns a broad request into a design problem you can reason about. Before choosing a database or drawing services, establish who uses the system, what they need to accomplish, and which promises must survive load and failures.</p>\n<p>We will turn “design a URL shortener” into a small brief. The same questions apply to a feed, file store, or payment service; the answers will change.</p>\n<h3>Start with the people and the operation</h3>\n<p>A link creator submits a destination and receives a short address. A reader opens that address and expects to reach the destination. An administrator may need to disable an abusive link. These are three roles with different permissions, even if one person sometimes fills all three.</p>\n<p>Now follow the main operation. Can the creator choose the short name? Can its destination change? Must readers sign in? Each answer changes something the implementation must enforce.</p>\n<p>For this course's shortener, assume approved callers can create links, names are generated, destinations stay fixed, and anyone can follow a link. Custom aliases and destination editing are outside the first version. Abuse handling still needs an owner; leaving out editing does not make unsafe destinations harmless.</p>\n<p>Write these choices down as assumptions to confirm with the product owner. A plausible answer becomes a requirement only when the people responsible for the product agree to it.</p>\n<h3>Ask what must remain true</h3>\n<p>A generated name must not silently replace somebody else's mapping. A saved link must keep its destination through the promised retention period. These are <strong>invariants</strong>: conditions the implementation must preserve, including when requests overlap or are retried.</p>\n<p>Also identify the authoritative data. The stored mapping decides where a link goes. A cached copy can speed up reading it, but does not become a separate authority that may choose a different destination.</p>\n<p>Freshness needs its own question. If an administrator disables a link, how long may a cached copy still redirect readers? An acceptable delay of a minute permits different choices from a requirement to stop every new redirect immediately. Do not leave that promise hidden inside “we will cache it.”</p>\n<h3>Separate work that must finish now from work that can wait</h3>\n<p>“Record clicks” is ambiguous. Our server can record a redirect request; it cannot infer a distinct person or prove that the destination page loaded.</p>\n<p>The shortener exercise requires each accepted redirect request to have a stored event before the response. Reports may be calculated later. If storing the event fails, this version returns an error. That is a deliberate product tradeoff: event retention takes priority over redirect availability during that failure.</p>\n<p>Another product could choose to redirect anyway and tolerate missing events. The important question is which promise the design is supposed to keep. Moving report calculation into the background does not answer whether losing its input is acceptable.</p>\n<h3>Put numbers and boundaries in the brief</h3>\n<p>Keep these questions nearby when the conversation moves beyond the ordinary request:</p>\n<table><thead><tr><th>Area</th><th>Question to settle</th></tr></thead><tbody><tr><td>Scale</td><td>How many reads and writes arrive, how bursty are they, and in which regions?</td></tr><tr><td>Retention</td><td>How long must records remain, and what growth should we plan for?</td></tr><tr><td>Reliability</td><td>Which operations may degrade, and how quickly must service and data recover?</td></tr><tr><td>Privacy</td><td>Who can read each record, and which sensitive fields are actually needed?</td></tr><tr><td>Scope</td><td>Which workflows are required now, and which are explicitly deferred?</td></tr></tbody></table>\n<p>For the course exercise, use 100 million redirects and 1 million new links per day, with mappings retained for at least five years. These are planning assumptions, not measured traffic. <a href=\"/topic/back-of-the-envelope-capacity-planning/\">Capacity planning</a> turns them into rates and storage estimates.</p>\n<p>Before handing off the brief, check one failure: the analytics report is unavailable, but event storage works. Should redirects continue? Yes, under our chosen contract. Now make event storage unavailable. The answer changes. Being able to explain that difference means the requirements are specific enough to guide a design.</p>\n<p>Targets such as “fast” and “highly available” still need a measurement and a time window. <a href=\"/topic/non-functional-requirements/\">Non-functional requirements</a> makes those promises testable.</p>\n</div>",
    "keyTakeaways": [
      "Distinguish functional requirements (what the system does) from non-functional requirements (how it performs under load).",
      "Write assumptions down as a brief to confirm with the product owner before designing.",
      "Identify invariants: conditions the implementation must preserve even when requests overlap or are retried."
    ],
    "furtherReading": [
      {
        "title": "System Design Primer - Requirements clarification",
        "url": "https://github.com/donnemartin/system-design-primer"
      },
      {
        "title": "Bass, Clements, Kazman: Software Architecture in Practice (4th Edition)",
        "url": "https://www.oreilly.com/library/view/software-architecture-in/9780136885979/"
      }
    ]
  },
  "logical-system-design": {
    "title": "Logical system design",
    "video": {
      "youtubeId": "P1vES9AgfC4",
      "title": "Moving IO to the edges of your app: Functional Core, Imperative Shell - Scott Wlaschin",
      "channel": "NDC Conferences",
      "why": "Scott Wlaschin clearly shows how to keep decision logic separate from HTTP and database I/O so rules can be tested without infrastructure, which is exactly the boundary this unit draws between adapters and link operations.",
      "length": "1:00:35"
    },
    "videos": [
      {
        "youtubeId": "bDWApqAUjEI",
        "title": "Hexagonal Architecture: What You Need To Know - Simple Explanation",
        "channel": "Alex Hyett",
        "role": "intro",
        "why": "A clear eight-minute picture of ports and adapters: the application core in the middle, HTTP and storage adapters at the edges.",
        "length": "8:16"
      },
      {
        "youtubeId": "bmSAYlu0NcY",
        "title": "A Philosophy of Software Design | John Ousterhout | Talks at Google",
        "channel": "Talks at Google",
        "role": "deep-dive",
        "why": "Ousterhout explains deep versus shallow modules, which is the principled version of this unit's warning that pass-through layers are ceremony rather than useful boundaries.",
        "length": "1:01:40"
      }
    ],
    "intuition": "<p>Picture a restaurant. The waiter takes orders and speaks to customers, the chef decides how each dish is cooked, and the pantry stores ingredients. If the waiter started cooking at the table and the chef had to know which shelf every jar is on, changing the menu would mean retraining everyone.</p>\n<p><strong>Mental model:</strong> logical design decides <em>which piece of code owns each rule</em>. Adapters translate (HTTP in, SQL out); the core operation decides (is this link disabled, must the click be stored first). Boxes in this sense are responsibilities, not servers.</p>\n<p>A good boundary makes a likely change land in one place: a new import job reuses the link operation, a new database changes only the storage adapter.</p>\n<ul>\n<li><strong>Confusing logical and physical:</strong> drawing three modules does not mean deploying three services. Most start as function calls in one process.</li>\n<li><strong>Collapsing failure into \"not found\":</strong> turning a database timeout into a 404 gives callers a false answer. Keep \"missing\" and \"unavailable\" distinct in the contract.</li>\n<li><strong>Layers that only forward:</strong> a service that just passes arguments to a repository that just passes them to an ORM adds reading cost without protecting any rule.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n<h2>Logical system design</h2>\n<p>Logical system design decides where application rules live and how modules work together. It helps answer a practical question: when a product rule or external provider changes, which code should need to change with it?</p>\n<p>We will separate the shortener's HTTP handling, link rules, and storage work, then check whether those boundaries make a change easier to test.</p>\n<h3>Give each responsibility an owner</h3>\n<p>A route handler can parse a request, run SQL, check whether a link is disabled, record a click, and format the redirect. For a small operation, that can be readable. Trouble starts when an import job needs the same rules, or every handler begins interpreting database rows differently.</p>\n<p>Separate the work when those responsibilities need to vary independently:</p>\n<table><thead><tr><th>Responsibility</th><th>What it owns</th></tr></thead><tbody><tr><td>HTTP adapter</td><td>Parse the request and translate the result into an HTTP response</td></tr><tr><td>Link operation</td><td>Apply the product's rules for creating or opening a link</td></tr><tr><td>Storage adapter</td><td>Execute queries and map stored records into the application's result types</td></tr></tbody></table>\n<p>A <strong>boundary</strong> is the agreement between these parts. It can be an ordinary function call inside one process. Drawing separate boxes does not require separate servers or deployments.</p>\n<pre><code class=\"language-mermaid\">mermaid\nflowchart TB\n  accTitle: Two callers share the same link rules\n  accDescr: HTTP handling and an import job call link operations, which use a storage adapter. These are application responsibilities, not separate machines.\n  HTTP[HTTP handling] --> Rules[Link operations]\n  Import[Import job] --> Rules\n  Rules --> Storage[Storage adapter]\n  Storage --> DB[(Database)]</code></pre>\n<p>The HTTP path creates one link; the import job may create many. Both must enforce the same rule that a generated code cannot replace an existing mapping. The database's uniqueness constraint enforces the collision rule atomically; the application decides whether to retry with another candidate or return an error.</p>\n<h3>Make the agreement useful to its caller</h3>\n<p>Consider <code>resolve(code)</code>. “Returns a URL” leaves several cases unstated. The link might be absent, disabled, or temporarily impossible to look up.</p>\n<table><thead><tr><th>Result</th><th>Meaning</th><th>HTTP caller's action</th></tr></thead><tbody><tr><td>Found</td><td>The operation permits this link and supplies its destination</td><td>Continue the redirect path</td></tr><tr><td>Missing</td><td>The lookup succeeded, but no mapping exists</td><td>Return not found</td></tr><tr><td>Disabled</td><td>The mapping exists but cannot be used</td><td>Refuse the redirect</td></tr><tr><td>Unavailable</td><td>The operation could not establish an answer</td><td>Return a service error</td></tr></tbody></table>\n<p>Keep unavailable distinct from missing. Translating a connection failure into “no such link” gives the caller a false answer. Likewise, the storage adapter should not leak a vendor-specific exception into every route and job that uses it.</p>\n<p>For the shortener's agreed contract, a successful redirect also waits for its request event to be stored. That sequencing belongs to the link operation. HTTP formatting does not decide whether losing a click is acceptable.</p>\n<h3>Test the rule through the boundary</h3>\n<p>To test “disabled links never redirect,” supply a small in-memory storage implementation that returns a disabled record. Exercise the link operation directly. The test should not need a browser, a live database, or knowledge of SQL syntax to check that product rule.</p>\n<p>That test does not establish that the real database query works. Test the storage adapter against the database separately, including missing rows, uniqueness conflicts, and failures. Keeping these tests distinct helps identify whether a failure comes from a rule or its persistence implementation.</p>\n<p>The same approach applies to a payment or notification provider: expose the operation the application needs, then translate it to the provider's API in one place. A replacement provider may have different guarantees, so an interface reduces the places to inspect; it does not make providers automatically interchangeable.</p>\n<h3>Stop before the boundary becomes ceremony</h3>\n<p>A function that forwards unchanged arguments through three layers is not necessarily protecting anything. Introduce a boundary around a repeated rule, a dependency that changes, or a decision worth testing independently.</p>\n<p>Review a likely change: add an import job, replace a notification provider, or introduce link expiry. If each requires edits across unrelated route handlers, the rule probably has no clear owner. If one focused operation owns the change and its tests, the logical design is doing useful work.</p>\n<p>The <a href=\"/topic/repository-pattern/\">repository pattern</a> develops the storage boundary further. <a href=\"/topic/monolith-vs-microservices/\">Monoliths and microservices</a> asks a separate question: which of these responsibilities need independent deployment?</p>\n</div>",
    "keyTakeaways": [
      "Separate HTTP handling, business rules, and storage into distinct responsibilities with explicit boundaries.",
      "Drawing separate boxes does not require separate servers; boundaries can be in-process function calls.",
      "A boundary is tested by checking whether a change in one module forces changes in others."
    ],
    "furtherReading": [
      {
        "title": "Cockburn: Hexagonal Architecture (Ports and Adapters)",
        "url": "https://alistair.cockburn.us/hexagonal-architecture"
      },
      {
        "title": "Fowler: Catalog of Patterns of Enterprise Application Architecture",
        "url": "https://martinfowler.com/eaaCatalog/"
      }
    ]
  },
  "non-functional-requirements": {
    "title": "Non-functional requirements",
    "video": {
      "youtubeId": "tEylFyxbDLE",
      "title": "SLIs, SLOs, SLAs, oh my! (class SRE implements DevOps)",
      "channel": "Google Cloud Tech",
      "why": "Google SREs Seth Vargo and Liz Fong-Jones explain precisely how an indicator, an objective and a contractual agreement differ, which is the vocabulary this unit uses to make qualities measurable.",
      "length": "8:05"
    },
    "videos": [
      {
        "youtubeId": "LKpIirL8f-I",
        "title": "L7: SLIs SLOs and SLAs",
        "channel": "Distributed Systems Course",
        "role": "deep-dive",
        "why": "A longer lecture-style treatment that goes into choosing indicators, measurement points and error budgets, matching the unit's emphasis on defining eligible requests and windows.",
        "length": "21:57"
      },
      {
        "youtubeId": "3JdQOExKtUY",
        "title": "Percentile Tail Latency Explained (95%, 99%) Monitor Backend performance with this metric",
        "channel": "Hussein Nasser",
        "role": "intro",
        "why": "Short, intuitive explanation of why p95 and p99 are used instead of averages for latency targets.",
        "length": "6:15"
      }
    ],
    "intuition": "<p>A pizza shop that promises \"fast delivery\" has promised nothing. \"95% of orders within 30 minutes of payment, measured at your door, on Friday nights too\" is a promise you can check and a manager can plan staff around.</p>\n<p><strong>Mental model:</strong> a non-functional requirement is <em>a quality with a number, a measurement point, a population and a window</em>. Latency, availability, durability, recovery time and cost only guide design once they are written that way.</p>\n<p>Each quality answers a different question: can I use it now (availability), is my saved data still there (durability), how much can I lose and how long until it is back (RPO and RTO).</p>\n<ul>\n<li><strong>Averages hide pain:</strong> a 20 ms mean can coexist with a 2 second p99. Targets should use percentiles.</li>\n<li><strong>Fast failures counted as success:</strong> a timeout or error returned in 5 ms is still a miss for a latency SLO; otherwise a broken service looks faster.</li>\n<li><strong>Mixing up SLA and SLO:</strong> the SLA is the external contract with penalties; the internal SLO should be stricter so you notice trouble before breaching the contract.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n<h2>Non-functional requirements</h2>\n<p>Non-functional requirements describe the conditions a system must meet while doing its job: latency, throughput, availability, durability, consistency, security, cost, and operability. “The API works” is incomplete if it becomes unusably slow under the expected load.</p>\n<p>The useful habit is to turn each vague expectation into something a test or production measurement can check. We will write a latency target, separate availability from recovery, and see how those targets affect the design.</p>\n<h3>Say what you measure</h3>\n<p>“The API should be fast” leaves several questions open. Which operation? How much traffic? How many slow requests are acceptable? Are we timing the database, the server, or the user's browser?</p>\n<p>These are example targets to negotiate, not universal defaults:</p>\n<table><thead><tr><th>Expectation</th><th>A more useful target</th></tr></thead><tbody><tr><td>Fast reads</td><td>At least 95% of eligible reads return the correct result within 50 ms at the server boundary under the stated peak load</td></tr><tr><td>High throughput</td><td>Sustain 10,000 writes per second; handle a 50,000-per-second burst lasting five minutes</td></tr><tr><td>Available API</td><td>99.9% of eligible requests succeed over a stated monthly window</td></tr><tr><td>Recoverable data</td><td>After the specified disaster, lose no more than five minutes of writes and restore service within 30 minutes</td></tr><tr><td>Fresh search</td><td>99% of committed documents become searchable within 30 seconds</td></tr></tbody></table>\n<p>The numbers do not finish the requirement. Define eligible requests, the observation window, and the failure conditions. A traffic test also needs realistic request sizes and a read/write mix; tiny requests at an idle database cannot establish performance for a busy product.</p>\n<p>Our shortener exercise uses a different provisional latency limit: one second for at least 95% of eligible redirects at the app boundary, including its required event write. Keep that exercise assumption separate from the 50 ms example above.</p>\n<h3>Count slow and failed requests honestly</h3>\n<p>The 95th percentile, or p95, describes the point below which 95% of the measured response times fall. It says nothing about how bad the slowest 5% can be. A fast average can hide that tail.</p>\n<p>For a user-facing target, count requests that produce the correct answer within the deadline. Failed or timed-out eligible attempts are misses, even if the server returned an error quickly. Otherwise, a failing service can appear to improve its latency.</p>\n<p>Choose the measurement boundary deliberately. Server logs help explain application work, but omit a request that cannot reach the server. Browser measurements include more of the user's experience and also depend on network conditions. Keep the two measurements labeled; a database timing is not a page-load promise.</p>\n<h3>Separate availability, data loss, and recovery time</h3>\n<p>Availability asks whether an operation is usable. Durability asks whether acknowledged data survives. A service can answer requests while having lost yesterday's records, or retain every record while temporarily unable to serve them.</p>\n<p>Recovery targets make a failure scenario concrete. The <strong>recovery point objective</strong>, RPO, limits the acceptable gap in recovered data, expressed in time. The <strong>recovery time objective</strong>, RTO, limits how long restoring service may take. Name the scenario and when the clock starts: a process restart, a lost disk, and a lost region require different recovery plans.</p>\n<p>Availability percentages also need a denominator. In a simplified time-based model where a service is either fully up or fully down, 99.9% availability over 30 days permits:</p>\n<pre><code class=\"\">text\n30 × 24 × 60 minutes × 0.001 = 43.2 minutes down</code></pre>\n<p>A request-based target instead counts successful attempts. An outage during the busiest minute can affect far more requests than one during a quiet minute, so the two percentages are not interchangeable.</p>\n<h3>Let the target change the design</h3>\n<p>Stricter freshness can rule out serving an old replica on a critical path. A shorter recovery target may require a ready replacement instead of rebuilding after failure. Both choices add work and cost that should follow an agreed product need.</p>\n<p>Include the other operating constraints too: tenant access rules, which data may be logged, a spending limit, and the signals an on-call engineer needs to diagnose failure. A design that meets latency while leaking another tenant's records has not met its requirements.</p>\n<p>Before accepting a target, ask how you will verify it. A recovery drill can test restoration; a realistic load test can test a throughput condition; neither proves a month of production availability. <a href=\"/topic/availability-durability-consistency-cost/\">Availability, durability, consistency, and cost</a> examines how these promises interact.</p>\n</div>",
    "keyTakeaways": [
      "SLIs measure actual service behavior; SLOs set internal targets; SLAs define contractual penalties.",
      "A 100% availability target is usually impractical and can suppress useful change.",
      "Error budgets balance feature velocity against reliability — excessive burn triggers release freezes."
    ],
    "furtherReading": [
      {
        "title": "Google SRE Book: Service Level Objectives",
        "url": "https://sre.google/sre-book/service-level-objectives/"
      },
      {
        "title": "Google SRE Workbook: Implementing SLOs",
        "url": "https://sre.google/workbook/implementing-slos/"
      }
    ]
  },
  "system-design-tradeoffs": {
    "title": "System design tradeoffs",
    "video": {
      "youtubeId": "1nENigGr-a0",
      "title": "System Design Was HARD - Until You Knew the Trade-Offs",
      "channel": "ByteByteGo",
      "why": "Concise, well-animated walk through the classic trade-off pairs (consistency vs availability, latency vs throughput, normalization vs denormalization, sync vs async) with the reason each cost appears.",
      "length": "5:09"
    },
    "videos": [
      {
        "youtubeId": "2g1G8Jr88xU",
        "title": "System Design Was HARD - Until You Knew the Trade-Offs, Part 2",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "Continues with further pairs such as stateful vs stateless and batch vs stream, useful for building the habit of naming both sides of each choice.",
        "length": "6:12"
      },
      {
        "youtubeId": "m4q7VkgDWrM",
        "title": "Data Consistency and Tradeoffs in Distributed Systems",
        "channel": "Gaurav Sen",
        "role": "deep-dive",
        "why": "Works one important trade-off, consistency versus performance and availability, in depth with concrete replication scenarios.",
        "length": "25:42"
      }
    ],
    "intuition": "<p>Buying a car: a sports car is fast but seats two; a minivan seats seven but is slow and thirsty. Neither is \"better\" until you say you have three kids. Every design choice is like that: it buys a property by spending another one.</p>\n<p><strong>Mental model:</strong> a trade-off statement has three parts: <em>what it improves, what it costs, and which requirement makes that cost acceptable</em>. \"Cache seller names because a 60 second delay is acceptable, but check payment eligibility fresh\" is a trade-off; \"add a cache for speed\" is not.</p>\n<p>The cost often appears somewhere else: a queue moves delay onto users, a split service moves function calls onto the network, an extra metric label multiplies storage.</p>\n<ul>\n<li><strong>\"More complex\" as the only downside:</strong> name the concrete cost, such as stale reads, retries, a migration, or an on-call task.</li>\n<li><strong>One answer for all data:</strong> two fields with the same shape (display name vs payment permission) can need very different freshness.</li>\n<li><strong>Not recording when to revisit:</strong> a decision without its triggering evidence cannot be re-evaluated when traffic or requirements change.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n<h2>System design tradeoffs</h2>\n<p>A design tradeoff is a choice between useful properties that the available options cannot all provide equally well. A cache may reduce read work while serving older data. A separate service may allow independent releases while adding network failures to handle.</p>\n<p>The useful explanation names the benefit, the cost, and the requirement that makes the choice reasonable. We will work through one cache decision, then use the same method on other common choices.</p>\n<h3>Compare two answers to the same requirement</h3>\n<p>Suppose a product page repeatedly loads a seller's display name. Reading the database each time keeps the path simple. Caching the name can avoid repeated database work, but an edit may take time to appear wherever the cached value is used.</p>\n<p>First ask whether that delay is acceptable. If the product allows a briefly outdated display name, an expiry or invalidation policy can be part of the design. If the requirement says every read must reflect a completed edit, a cache that can serve an old value does not meet it.</p>\n<p>Now change the field from display name to “this seller may accept payments.” A stale answer can permit an operation that should have been stopped. Similar data shapes do not imply similar correctness requirements.</p>\n<p>Write the decision in a form another engineer can challenge:</p>\n<blockquote>Cache seller display names to reduce repeated reads. Accept the agreed update delay, and check current payment eligibility separately before accepting an order.</blockquote>\n<p>The explanation makes two boundaries visible: which field may be stale and which operation needs a stronger check. “Use a cache for speed” leaves both unresolved.</p>\n<h3>Follow the cost to the place it appears</h3>\n<p>Many costs appear outside the component being optimized:</p>\n<table><thead><tr><th>Choice</th><th>What it can improve</th><th>What the design must also handle</th></tr></thead><tbody><tr><td>Cache a read result</td><td>Repeated lookup work and latency</td><td>Freshness, invalidation, memory and cache misses</td></tr><tr><td>Move work to a queue</td><td>Absorb bursts and schedule workers separately</td><td>User-visible delay, backlog, retries and duplicate work</td></tr><tr><td>Coordinate reads or writes across replicas</td><td>Stronger visibility or ordering guarantees</td><td>Network waits; some operations may stop when required participants cannot communicate</td></tr><tr><td>Store a derived copy of data</td><td>Simpler or faster reads</td><td>Extra writes and keeping the copies in agreement</td></tr><tr><td>Split a service</td><td>Independent ownership, scaling or deployment</td><td>Remote-call failure, observability and additional operations work</td></tr><tr><td>Add detailed metric labels</td><td>More ways to isolate a problem</td><td>More time series to store and query</td></tr></tbody></table>\n<p>A queue does not create processing capacity. If workers cannot keep up, the waiting time grows. Similarly, adding a metric label containing every user ID can make a small set of measurements expand with the user population. The cost follows the behavior, not the number of boxes in the drawing.</p>\n<p>These are possibilities to investigate, not universal verdicts. A cache with few hits may add work. Services with shared release dependencies may still have to deploy together. Test whether the proposed change actually buys the property being claimed.</p>\n<h3>Record when to reconsider</h3>\n<p>A useful decision also names the evidence that would change it. Revisit the display-name cache if stale names create support problems, if its hit rate is too low to justify it, or if an indexed database read already meets the target cheaply.</p>\n<p>Keep the rejected alternative in the design note. The next engineer should be able to tell why a direct read was insufficient, what freshness delay was accepted, and how that assumption was checked.</p>\n<p>Not every improvement requires a sacrifice. Removing an unnecessary query can reduce latency, cost, and failure exposure together. Look for such fixes before negotiating away a product promise.</p>\n<p>For your next design choice, name the alternative and trace one failure. If the cost is still only “more complexity,” say which retry, migration, stale result, or on-call task creates that complexity. <a href=\"/topic/when-not-to-add-infrastructure/\">When not to add infrastructure</a> applies this test before introducing another service to operate.</p>\n</div>",
    "keyTakeaways": [
      "Every architectural decision trades one property for another (consistency vs. availability, latency vs. throughput).",
      "Identify which constraints are hard (legal, physical) vs. soft (optimization targets) early in design.",
      "Document tradeoff decisions with rationale so future engineers understand why alternatives were rejected."
    ],
    "furtherReading": [
      {
        "title": "Bass, Clements, Kazman: Software Architecture in Practice",
        "url": "https://www.oreilly.com/library/view/software-architecture-in/9780136885979/"
      },
      {
        "title": "Nygard: Release It! (2nd Edition) — Stability Patterns",
        "url": "https://pragprog.com/titles/mnee2/release-it-second-edition/"
      }
    ]
  },
  "availability-durability-consistency-cost": {
    "title": "Availability, durability, consistency, cost",
    "video": {
      "youtubeId": "VdrEq0cODu4",
      "title": "CAP Theorem in System Design Interviews",
      "channel": "Hello Interview",
      "why": "Explains consistency versus availability per feature (for example ticket booking versus profile views) rather than as one global setting, which matches this unit's operation-by-operation framing.",
      "length": "13:56"
    },
    "videos": [
      {
        "youtubeId": "mBUCF1WGI_I",
        "title": "Distributed Systems 5.1: Replication",
        "channel": "Martin Kleppmann",
        "role": "deep-dive",
        "why": "Cambridge lecture showing why replicas improve durability and availability and how they create stale or conflicting reads, grounding all four properties in one mechanism.",
        "length": "25:21"
      },
      {
        "youtubeId": "BHqjEjzAicA",
        "title": "CAP Theorem Simplified",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "Quick animated primer on the consistency and availability tension during a network partition.",
        "length": "5:33"
      }
    ],
    "intuition": "<p>Think of a bank. <em>Availability</em>: is the ATM working right now? <em>Durability</em>: after the ATM says \"deposit accepted\", is the money still recorded tomorrow even if the ATM catches fire? <em>Consistency</em>: when you check the app a second later, does it show the deposit? <em>Cost</em>: how many vaults, guards and auditors did it take to promise all that?</p>\n<p><strong>Mental model:</strong> these are four independent questions asked <em>per operation and per failure</em>. A system can be up but have lost data, or have every byte safe but be unreachable.</p>\n<ul>\n<li><strong>Treating \"reliable\" as one property:</strong> always say which operation, which failure, and which of the four you mean.</li>\n<li><strong>Acknowledging before durable:</strong> returning success before the commit is acknowledged makes the promise false after a crash.</li>\n<li><strong>Replicas as backups:</strong> a replica faithfully copies an accidental DELETE. Backups plus a tested restore protect against different failures than replicas do.</li>\n<li><strong>Read-after-write through a lagging replica:</strong> the classic \"I just created it and got a 404\" bug; route the creator's next read to the primary or wait for the replica to catch up.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n<h2>Availability, durability, consistency, cost</h2>\n<p>A service can keep answering requests while losing saved data. It can also preserve every record while being temporarily unreachable. Availability, durability, consistency, and cost describe different properties; saying a system is “reliable” does not tell us which of them it provides.</p>\n<p>We will follow a newly created short link through three failures, then account for the work needed to prevent or recover from each one.</p>\n<h3>Can the reader use the link now?</h3>\n<p>Suppose the shortener's database is stopped. Its files are intact, but the application cannot look up a destination. The redirect path is unavailable even though the mapping has not been lost.</p>\n<p>Availability belongs to a particular operation. The reporting page can be down while redirects work, or creation can fail while existing links still resolve. Measure the paths that matter to users instead of treating an answering process as proof that the whole product works.</p>\n<p>Dependencies affect this promise. Our shortener requires an accepted redirect event to be stored before returning success. If the mapping can be read but that event cannot be stored, this design returns an error. Letting the redirect continue would improve availability during that failure, but would change the agreed event-retention requirement.</p>\n<h3>Will an acknowledged mapping survive?</h3>\n<p>The creator receives a successful response, then the application process crashes. The saved mapping must remain after restart. <strong>Durability</strong> concerns whether acknowledged data survives the failures the system claims to tolerate.</p>\n<p>The application must wait for the database's commit acknowledgement before promising that creation succeeded. That acknowledgement still depends on the database configuration and storage honoring durable writes. Data left only in volatile memory cannot survive losing that memory.</p>\n<p>A process restart with intact storage is different from destruction of the only disk. Surviving disk loss requires a recoverable copy elsewhere. A replica can help, but may also copy an accidental deletion; a backup and a tested restore procedure address a different recovery need.</p>\n<p>Name the failure you tested. “The record survived a restart” is useful evidence. It does not establish recovery from a lost region or from an operator deleting the record.</p>\n<h3>What may the next read observe?</h3>\n<p>Now creation succeeds, but the creator immediately follows the short link through a replica that has not received the new mapping. It returns “unknown code.” The data may be durable on the writer, yet the read violates the user's expectation.</p>\n<p><strong>Consistency</strong> describes the rules relating reads and writes, including their visibility and ordering. For this path, the concrete requirement is that a read started after successful creation can find the valid mapping. An immutable destination does not remove this first-read problem.</p>\n<p>A straightforward initial choice is to read from the database that accepted the creation. In PostgreSQL's default Read Committed isolation, a new ordinary query sees rows committed before that query began. A lagging replica or an older transaction snapshot needs separate consideration.</p>\n<p>A report can have a looser freshness requirement. It may omit recent events while the calculation catches up, even though those events are safely stored. <a href=\"/topic/consistency-models/\">Consistency models</a> develops these guarantees without treating every operation as having the same needs.</p>\n<h3>What does keeping those promises cost?</h3>\n<p>Waiting for commits adds work to the request path. Extra copies consume storage and network capacity. Failover and restoration need tests, monitoring, and people who can operate them.</p>\n<p>Use four questions when reviewing a proposed saving:</p>\n<table><thead><tr><th>Property</th><th>Question</th></tr></thead><tbody><tr><td>Availability</td><td>Which operations can continue during the specified failure?</td></tr><tr><td>Durability</td><td>Which acknowledged records can be lost?</td></tr><tr><td>Consistency</td><td>Which old, missing, or conflicting results may a reader observe?</td></tr><tr><td>Cost</td><td>What resources and operating work does the design require?</td></tr></tbody></table>\n<p>Removing the shortener's event write makes a redirect cheaper by dropping a promise. Moving report calculation out of that request removes work that never had to finish synchronously. These are different kinds of saving.</p>\n<p>A higher uptime percentage cannot compensate for losing records the product must retain. Choose the required behavior first, then use <a href=\"/topic/cost-aware-architecture/\">cost-aware architecture</a> to compare ways of providing it.</p>\n</div>",
    "keyTakeaways": [
      "CAP theorem forces a choice between consistency and availability during network partitions; most systems choose AP and tune consistency per operation.",
      "Durability (D in ACID) requires synchronous WAL fsync; skipping it trades safety for speed.",
      "Cost is a constraint: 5 9s availability costs orders of magnitude more than 3 9s."
    ],
    "furtherReading": [
      {
        "title": "Brewer: Towards Robust Distributed Systems (CAP, 2000)",
        "url": "https://people.eecs.berkeley.edu/~brewer/cs262b-2004/PODC-keynote.pdf"
      },
      {
        "title": "Daniel Abadi: Consistency Tradeoffs in Modern Distributed Database System Design (IEEE Computer, 2012)",
        "url": "https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf"
      }
    ]
  },
  "back-of-the-envelope-capacity-planning": {
    "title": "Back-of-the-envelope capacity planning",
    "video": {
      "youtubeId": "UC5xf8FbdJc",
      "title": "Back-Of-The-Envelope Estimation / Capacity Planning",
      "channel": "ByteByteGo",
      "why": "Directly on topic: powers of two, availability numbers, QPS and storage estimation walked through with a worked example in the same style as this unit.",
      "length": "8:32"
    },
    "videos": [
      {
        "youtubeId": "FqR5vESuKe0",
        "title": "Latency Numbers Programmer Should Know: Crash Course System Design #1",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "Gives the reference latencies (memory, SSD, network round trip) you need to sanity-check any estimate.",
        "length": "6:22"
      },
      {
        "youtubeId": "0myM0k1mjZw",
        "title": "Capacity Planning and Estimation: How much data does YouTube store daily?",
        "channel": "Gaurav Sen",
        "role": "interview",
        "why": "Shows the estimation process live on a realistic prompt, including stating assumptions and rounding aggressively.",
        "length": "13:12"
      }
    ],
    "intuition": "<p>Planning a wedding: you do not know exactly who will come, but \"150 guests, about 1.5 drinks per hour, 5 hours\" tells you roughly 1,100 drinks, so one bartender is not enough and ten is too many. Precision does not matter; the order of magnitude decides the design.</p>\n<p><strong>Mental model:</strong> <em>daily actions divided by roughly 100,000 seconds gives average per-second rate; multiply by a peak factor; multiply by bytes and retention for storage.</em> Then ask which resource runs out first.</p>\n<p>Useful anchors: a day is about 86,400 seconds (round to 100,000), 1 million per day is about 12 per second, 1 billion per day is about 12,000 per second.</p>\n<ul>\n<li><strong>Using registered instead of active users:</strong> 500 million accounts might be 50 million daily actives; start from actions per active user.</li>\n<li><strong>Forgetting hidden work:</strong> one feed request may cause 20 lookups, and one redirect may also cause a write; count backend operations, not only front-door requests.</li>\n<li><strong>False precision:</strong> quoting 2,314.8 QPS signals you have not understood that the inputs are guesses. Give a range and the next thing to measure.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n<h2>Back-of-the-envelope capacity planning</h2>\n<p>Capacity planning turns product assumptions into approximate request rates, storage, bandwidth, and operating cost. The estimate should expose likely bottlenecks and help choose what to measure next. Extra decimal places do not make uncertain inputs more reliable.</p>\n<p>We will estimate a feed's read traffic, account for work hidden behind each request, and compare the shortener's storage allowance with a historical measurement.</p>\n<h3>Turn user activity into a rate</h3>\n<p>Start with active users and actions per user, not the total number of registered accounts. Suppose a feed has 10 million daily active users, each making 20 feed requests per day.</p>\n<table><thead><tr><th>Step</th><th>Calculation</th><th>Result</th></tr></thead><tbody><tr><td>Daily reads</td><td>10 million × 20</td><td>200 million requests</td></tr><tr><td>Average rate</td><td>200 million ÷ 86,400 seconds</td><td>About 2,300 requests per second</td></tr><tr><td>Assumed busy period</td><td>Average × 10</td><td>About 23,000 requests per second</td></tr></tbody></table>\n<p>The tenfold peak is an assumption to replace with traffic evidence. If plausible peaks range from 20,000 to 50,000 requests per second, compare designs across that range. A design that works only at the rounded midpoint has little margin for uncertainty.</p>\n<p>Record where the traffic arrives, how long bursts last, and whether one tenant or popular item concentrates the load. A global daily total does not describe the busiest region or partition. Revisit the estimate for growth, launches, and seasonal demand.</p>\n<h3>Count the work behind one request</h3>\n<p>A feed request might return 20 items. Fetching each item with a separate database query would produce roughly 460,000 lookups per second at the assumed peak, before retries or cache misses. That estimate is a reason to inspect batching and query shape; it does not by itself prove that any particular database cannot cope.</p>\n<p>Separate reads, writes, background jobs, and fanout. One new post can cause many feed updates. One redirect in our shortener also writes an event, so a product with many more reads than creations is not necessarily read-heavy at the database.</p>\n<p>Bandwidth needs bytes as well as requests. At an illustrative 20 kB response payload, 23,000 feed responses per second carry about 460 MB/s, or 3.7 Gbit/s, before protocol overhead. These decimal units describe payload leaving that serving boundary; compression, caches, and network placement change what each link carries.</p>\n<p>Keep the latency target beside the rate. “Handles 23,000 requests per second” is not sufficient if the queue grows throughout the test and users wait longer each minute.</p>\n<h3>Build storage from retention and representation</h3>\n<p>For a steady write rate, start with:</p>\n<p><strong>Retained records = records per day × retention days.</strong></p>\n<p>Multiply by the stored bytes per record, then account for indexes, replicas, derived data, backups, write logs, and temporary space. Do not add an index allowance twice if your measured record size already includes it.</p>\n<p>The shortener exercise assumes 1 million new links per day, retained for five 365-day years. That gives 1.825 billion links. An initial allowance of 500 bytes per link, including indexes, projects 0.9125 decimal TB for that one copy of the link data.</p>\n<p>Click history is separate and may dominate. At 100 million redirects per day, the shortener records 100 times as many redirect events as new links. The event size and retention period need their own estimate.</p>\n<h3>Replace the assumptions that matter most</h3>\n<p>A local PostgreSQL 16.10 capture on 11 September 2026 measured a million-row shortener fixture. Its link table's main data fork occupied 93,085,696 bytes and its indexes 44,974,080 bytes: about 138.1 bytes per link together. That measure excludes auxiliary storage and the rest of the database.</p>\n<p>Using the rounded 138.1 bytes in the same projection gives about 0.252 TB, roughly 3.6 times smaller than the initial link allowance. It remains a projection: longer URLs, extra indexes, growth, and deleted-row space can change the future representation. It is not the total disk requirement or a predicted invoice.</p>\n<p>The same historical test completed 231,377 warm indexed lookups in 20 seconds at a target arrival rate of about 11,574 per second. None failed, were skipped, or exceeded its chosen one-second limit. It used a local socket and excluded the application and required event insert. It supports testing the simple design further; it does not establish capacity for the complete five-year service.</p>\n<p>Finish the estimate by naming the next limiting resource: CPU, database writes, cache memory, queue processing, bandwidth, or a provider quota. Measure that path with representative data and failures. <a href=\"/topic/cost-aware-architecture/\">Cost-aware architecture</a> then connects those quantities to the bill and the work of operating the system.</p>\n</div>",
    "keyTakeaways": [
      "Use powers of 10 for quick estimates: 1 ms = 1,000 QPS single-core; 1 GB = 10^9 bytes.",
      "Always estimate with replication factor (3x) and growth buffer (2-3 year horizon).",
      "Bottleneck analysis: identify whether CPU, memory, disk I/O, or network bandwidth saturates first."
    ],
    "furtherReading": [
      {
        "title": "Dynamo: Amazon's Highly Available Key-value Store (DeCandia et al., 2007)",
        "url": "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf"
      },
      {
        "title": "High Scalability: Numbers Everyone Should Know",
        "url": "https://highscalability.com/numbers-everyone-should-know/"
      }
    ]
  },
  "concurrency-vs-parallelism": {
    "title": "How a server handles many requests",
    "video": {
      "youtubeId": "0vFgKr5bjWI",
      "title": "Asynchronous vs Multithreading and Multiprocessing Programming (The Main Difference)",
      "channel": "Hussein Nasser",
      "why": "Backend-focused explanation of how a server overlaps waiting with async I/O, threads or processes, and when each uses more than one core, which is exactly this unit's compute-versus-wait distinction.",
      "length": "15:33"
    },
    "videos": [
      {
        "youtubeId": "RlM9AfWf1WU",
        "title": "Concurrency Vs Parallelism!",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "Crisp animated definition of the two terms with a single-core versus multi-core picture.",
        "length": "4:13"
      },
      {
        "youtubeId": "oV9rvDllKEg",
        "title": "Concurrency is not Parallelism by Rob Pike",
        "channel": "gnbitcom",
        "role": "deep-dive",
        "why": "The classic talk that established the distinction: concurrency is structuring independent tasks, parallelism is executing them simultaneously.",
        "length": "31:23"
      }
    ],
    "intuition": "<p>A single barista can take your order, start the espresso machine, and while it runs take the next order. That is <em>concurrency</em>: one worker, many orders in progress, because most of each order is waiting on the machine. Hiring a second barista with a second machine is <em>parallelism</em>: two things literally happening at the same instant.</p>\n<p><strong>Mental model:</strong> concurrency helps when requests mostly <em>wait</em> (database, network); parallelism helps when requests mostly <em>compute</em>. Ask which one your time is spent on before choosing threads, an event loop or more cores.</p>\n<ul>\n<li><strong>\"async makes it faster\":</strong> an async function doing 200 ms of CPU work still blocks the event loop for 200 ms; it only helps with waiting.</li>\n<li><strong>Unbounded concurrency:</strong> letting 10,000 requests wait on a database that handles 100 connections just moves the queue into the database and makes everyone slower. Cap in-flight work.</li>\n<li><strong>Per-process limits are not global:</strong> 20 instances each with a pool of 10 connections is 200 connections at the database.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n<h2>How a server handles many requests</h2>\n<p>Concurrency lets several tasks make progress during overlapping periods. Parallelism means computations run at the same time on different execution resources. A server can handle many waiting requests concurrently while only one CPU core executes its application code.</p>\n<p>The distinction helps you choose between overlapping waits, adding compute capacity, and limiting the amount of work in flight. We will separate those choices using a small request timeline.</p>\n<h3>Separate computing from waiting</h3>\n<p>Assume each request needs 5 ms of CPU work, waits 40 ms for a database result, then needs another 1 ms of CPU work to respond. These are teaching values, not measurements of a real endpoint.</p>\n<p>A server that finishes each request before starting the next spends 46 ms per request. Sixteen requests arriving together take 16 × 46 = 736 ms to finish. Its CPU does only 96 ms of application work during that period; the rest is waiting.</p>\n<p>Another request could use the CPU while the first waits. Overlapping those waits reduces the time needed to finish the batch without making any individual database operation faster.</p>\n<div class=\"interactive-placeholder\">Start with 16 requests and compare the three handling models. Watch both the request timelines and the CPU row. Then increase the burst to 64 requests.\n<p></div></p>\n<h3>Two ways to overlap the waits</h3>\n<p>A <strong>thread pool</strong> gives several requests their own execution context. When one thread blocks on I/O, another can run. A cap bounds the number of requests holding worker slots; requests beyond that cap must wait or be refused.</p>\n<p>An <strong>event loop</strong> starts a non-blocking operation and resumes the request when its result is ready. A request waiting on network I/O does not need to occupy a separate application thread for the entire wait. The loop can work on another ready request meanwhile.</p>\n<p>In this model, the eight-worker pool finishes 16 requests in 134 ms; the event-loop model finishes them in 121 ms. The difference comes from the model's admission cap and scheduling, not a universal speed advantage of event loops. Both still perform 96 ms of CPU work on one core.</p>\n<p>A long CPU computation on the event-loop thread prevents its other callbacks from running. Declaring a function <code>async</code> does not move that computation to another processor. In Node.js, some platform operations use a worker pool; application CPU work still needs an explicit strategy such as worker threads, separate processes, or small chunks that yield.</p>\n<h3>Add parallelism when computing is the limit</h3>\n<p>For 64 requests, the model needs 64 × 6 = 384 ms of CPU work. Its event-loop result reaches that floor: the single core is continuously busy. Adding more waiting requests cannot make that core execute the same instructions sooner.</p>\n<p>To reduce the computing time, reduce the work or spread independent work across additional cores. Shared state, coordination, and uneven task sizes can limit the gain, so twice as many workers does not promise twice the throughput.</p>\n<p>Runtime details matter. In a conventional CPython build with the global interpreter lock enabled, Python bytecode does not execute in parallel across its threads. Threads can still overlap I/O; processes, native code that releases the lock, and optional free-threaded builds have different behavior. “Threads never run in parallel” is not a general rule.</p>\n<h3>Bound the work your dependencies receive</h3>\n<p>Overlapping waits is useful only while the dependency can support the resulting load. More requests in flight can increase database contention, hold more connections, consume memory, and make every request wait longer.</p>\n<p>Budget concurrency across application instances. If each of ten instances may hold eight database connections, that is up to 80 connections before counting background workers and administrative access. A per-process cap is not a system-wide cap.</p>\n<p>The model above holds database wait time fixed. Real dependencies often slow down as load rises, so its numbers illustrate scheduling rather than predict production throughput. Use measurements to choose limits, and use <a href=\"/topic/backpressure/\">backpressure</a> or <a href=\"/topic/load-shedding/\">load shedding</a> when incoming work exceeds them.</p>\n</div>",
    "keyTakeaways": [
      "Concurrency is handling multiple interleaved tasks; parallelism is executing tasks simultaneously on multiple cores.",
      "Thread-per-request models hit OS thread limits (~10K); event-loop and actor models scale to millions of concurrent connections.",
      "Shared mutable state requires synchronization (locks, atomics); lock-free data structures trade memory for contention avoidance."
    ],
    "furtherReading": [
      {
        "title": "Ousterhout: Why Threads Are a Bad Idea (1996)",
        "url": "https://web.stanford.edu/~ouster/cgi-bin/papers/threads.pdf"
      },
      {
        "title": "Akka Documentation: The Actor Model",
        "url": "https://doc.akka.io/docs/akka/current/typed/guide/actors-intro.html"
      }
    ]
  },
  "horizontal-vs-vertical-scaling": {
    "title": "Horizontal vs vertical scaling",
    "video": {
      "youtubeId": "xpDnVSmNFX0",
      "title": "System Design BASICS: Horizontal vs. Vertical Scaling",
      "channel": "Gaurav Sen",
      "why": "Still the clearest whiteboard explanation of scale-up versus scale-out, including the consistency and network costs horizontal scaling introduces; kept as primary.",
      "length": "7:56"
    },
    "videos": [
      {
        "youtubeId": "dvRFHG2-uYs",
        "title": "Vertical Vs Horizontal Scaling: Key Differences You Should Know",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "Short animated recap with practical examples of when a bigger machine is the right first step.",
        "length": "4:34"
      },
      {
        "youtubeId": "-W9F__D3oY4",
        "title": "CS75 (Summer 2012) Lecture 9 Scalability Harvard Web Development David Malan",
        "channel": "George Schott",
        "role": "deep-dive",
        "why": "David Malan's famous lecture walks from one server to load balancers, sticky sessions, replication and partitioning, showing why state must move out of web servers before scaling out.",
        "length": "1:45:40"
      }
    ],
    "intuition": "<p>A busy restaurant can buy a bigger oven and hire a faster chef (vertical), or open more kitchens with ordinary ovens and a host who sends each table to a kitchen (horizontal). The bigger oven is simple but eventually there is no bigger one, and if it breaks dinner is cancelled. Many kitchens survive one breaking, but now the recipes, the order book and the reservations must be shared.</p>\n<p><strong>Mental model:</strong> <em>vertical scaling buys capacity with money and a ceiling; horizontal scaling buys capacity with coordination.</em> Stateless tiers scale out easily; stateful tiers (databases) are where scale-out gets hard.</p>\n<ul>\n<li><strong>Scaling out a stateful server:</strong> adding web servers that keep sessions in local memory breaks logins unless sessions move to a shared store or requests are pinned.</li>\n<li><strong>Dismissing vertical scaling:</strong> a single large database machine handles far more than many teams expect and is often the cheapest first step.</li>\n<li><strong>Assuming linear gains:</strong> shared databases, locks and hot keys mean ten servers rarely give ten times the throughput.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Scale-Up vs. Scale-Out Physics</h2>\n      <p>Scaling is the mechanism of expanding system throughput when inbound request volume exceeds existing processing capacity. The two foundational vectors—<strong>Vertical Scaling (Scale-Up)</strong> and <strong>Horizontal Scaling (Scale-Out)</strong>—impose radically different hardware, operational, and architectural trade-offs.</p>\n\n      <h2>Architectural Comparison</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph Vertical [\"1. Vertical Scaling (Scale-Up)\"]\n      C1[\"Clients\"] --> S1[\"Single Giant Node (128 vCPU, 1TB RAM)\"]\n      S1 --> DB1[(\"Local NVMe\")]\n      NoteV[\"Hardware ceiling, non-linear cost curve, downtime for upgrades, single point of failure.\"]\n    end\n\n    subgraph Horizontal [\"2. Horizontal Scaling (Scale-Out)\"]\n      C2[\"Clients\"] --> LB[\"Layer 4 / 7 Load Balancer\"]\n      LB --> N1[\"Worker Node 1\"]\n      LB --> N2[\"Worker Node 2\"]\n      LB --> N3[\"Worker Node N...\"]\n      NoteH[\"Stateless instances, elastic auto-scaling, fault isolation, requires distributed state management.\"]\n    end\n      </div>\n\n      <h2>Engineering Realities & Trade-Offs</h2>\n      <h3>1. Hardware Limits vs. Distributed Complexity</h3>\n      <p>Vertical scaling upgrades existing nodes (e.g., transitioning an instance from 8 cores to 128 cores). It requires zero application code refactoring and introduces no distributed network latency. However, it hits a ceiling: the largest machine or instance size available, with diminishing returns from NUMA memory-node crossing penalties and memory bandwidth, and price premiums at the largest or specialised sizes (within an instance family, cloud pricing is roughly linear per vCPU). Furthermore, taking the single machine down for hardware maintenance produces instantaneous total outage unless paired with a hot standby.</p>\n\n      <h3>2. Stateless Tiering as the Prerequisite for Scale-Out</h3>\n      <p>Horizontal scaling adds commodity nodes behind a load balancer. It offers far more headroom and fault tolerance, although shared state, coordination and hot keys keep real gains below linear—if a worker node dies, health checks drop it from the pool without user impact. However, horizontal scaling requires the application tier to be strictly <strong>stateless</strong>: user sessions, in-flight jobs, and persistent data must move to external shared state layers (Redis clusters, distributed relational databases, or object stores).</p>\n\n      <h3>3. The Hybrid Modern Standard</h3>\n      <p>Production systems rarely pick one dogmatically. Modern engineering pairs vertical optimization with horizontal elasticity: right-size individual nodes for the workload (for latency-sensitive services, fitting within one NUMA node avoids cross-socket memory penalties, but the right size is workload dependent), then scale those standardized units horizontally behind load balancers.</p>\n    \n<!-- enriched -->\n<h2>Worked example: when to scale up and when to scale out</h2>\n<p>Suppose an API tier handles 2,000 requests per second at peak, and load tests show one 8 vCPU instance sustains about 600 requests per second at 60% CPU while meeting the latency target. Traffic is expected to triple within a year.</p>\n<ul>\n<li><strong>Today:</strong> 2,000 / 600 is about 3.4, so 4 instances meet peak. To survive losing one instance (N+1) you run 5.</li>\n<li><strong>Next year:</strong> 6,000 / 600 = 10 instances, 11 with one spare. The load balancer, health checks and deployment pipeline do not change; only the instance count does.</li>\n<li><strong>Vertical alternative:</strong> one 64 vCPU instance might handle about 4,000 to 4,500 requests per second (rarely a perfect 8x, due to lock contention and memory bandwidth). It is simpler, but it is still a single point of failure, and a restart for patching is a full outage unless a second machine stands by.</li>\n</ul>\n<p>The database behind it is a different story. If each request makes one indexed read, 6,000 reads per second is well within a single well-provisioned PostgreSQL or MySQL primary with read replicas. Scaling the database vertically first, then adding read replicas, then partitioning only when writes or data size demand it, is the standard progression.</p>\n<h2>Trade-off table</h2>\n<table>\n<thead><tr><th>Dimension</th><th>Vertical (scale up)</th><th>Horizontal (scale out)</th></tr></thead>\n<tbody>\n<tr><td>Code changes</td><td>Usually none</td><td>Tier must be stateless or state must be partitioned</td></tr>\n<tr><td>Failure impact</td><td>One machine failure is a full outage unless a standby exists</td><td>Losing one of N nodes removes about 1/N of capacity</td></tr>\n<tr><td>Ceiling</td><td>Largest available instance size</td><td>Coordination and shared dependencies, not machine size</td></tr>\n<tr><td>Cost curve</td><td>Roughly linear per vCPU within an instance family, jumps at the largest or specialised sizes</td><td>Linear in node count plus load balancer and operational overhead</td></tr>\n<tr><td>Upgrades</td><td>Resize often requires a restart</td><td>Rolling replacement with no downtime</td></tr>\n<tr><td>Best fit</td><td>Databases, early-stage systems, workloads needing large shared memory</td><td>Stateless web and API tiers, workers, caches with partitioning</td></tr>\n</tbody>\n</table>\n<h2>Failure modes to watch</h2>\n<ul>\n<li><strong>Hidden state:</strong> local file uploads, in-memory rate limit counters or caches that assume one node silently become wrong with several nodes.</li>\n<li><strong>Thundering scale-out:</strong> an autoscaler that adds 20 instances at once can open 20 new connection pools against the database and overload it.</li>\n<li><strong>Uneven load:</strong> long-lived connections (WebSockets) stay on old nodes after scale-out, so new nodes sit idle until connections are rebalanced.</li>\n</ul>\n<h2>How real systems do it</h2>\n<p>Stack Overflow famously served very high traffic for years from a small number of powerful SQL Server machines, a deliberate vertical choice for the database. Most large web companies run stateless application tiers behind load balancers and autoscaling groups, and keep sessions in a shared store such as Redis or in signed tokens so any node can serve any user.</p>\n</div>",
    "keyTakeaways": [
      "Vertical scaling avoids distributed complexity but hits the largest-instance ceiling, price premiums at the top sizes, and single-point-of-failure risks.",
      "Horizontal scaling provides fault isolation and elastic headroom, but demands strict stateless application architecture.",
      "Modern production systems scale the compute tier horizontally while scaling the database tier via read replicas and sharding."
    ],
    "furtherReading": [
      {
        "title": "James Lewis & Martin Fowler: Microservices",
        "url": "https://martinfowler.com/articles/microservices.html"
      },
      {
        "title": "Waldo, Wyant, Wollrath, Kendall: A Note on Distributed Computing (Sun Microsystems Labs, 1994)",
        "url": "https://scholar.harvard.edu/files/waldo/files/waldo-94.pdf"
      }
    ]
  },
  "monolith-vs-microservices": {
    "title": "Monolith vs microservices",
    "video": {
      "youtubeId": "GBTdnfD6s5Q",
      "title": "When To Use Microservices (And When Not To!) • Sam Newman & Martin Fowler • GOTO 2020",
      "channel": "GOTO Conferences",
      "why": "Two of the people who defined the term discuss the real reasons to adopt microservices (independent deployability, team autonomy) and why most teams should not start there.",
      "length": "38:44"
    },
    "videos": [
      {
        "youtubeId": "lTAcCNbJ7KE",
        "title": "What Are Microservices Really All About? (And When Not To Use It)",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "Fast visual summary of what microservices are, what infrastructure they require, and when they are a poor fit.",
        "length": "4:45"
      },
      {
        "youtubeId": "5OjqD-ow8GE",
        "title": "Modular Monoliths • Simon Brown • GOTO 2018",
        "channel": "GOTO Conferences",
        "role": "deep-dive",
        "why": "Simon Brown shows how to get strong module boundaries inside one deployable, the recommended starting point in this unit.",
        "length": "46:32"
      }
    ],
    "intuition": "<p>A monolith is one big shared kitchen: everyone can grab any ingredient, and one fire alarm shuts it all down. Microservices are a food court: each stall has its own kitchen, menu and hours, so one closing does not close the rest, but ordering a combo now means walking between stalls and paying at each.</p>\n<p><strong>Mental model:</strong> microservices are primarily an <em>organisational and deployment</em> decision. You trade in-process calls and single-database transactions for independent releases, independent scaling and fault isolation.</p>\n<ul>\n<li><strong>Distributed monolith:</strong> services that share a database or must be deployed together give you all the network costs and none of the independence.</li>\n<li><strong>Splitting too early:</strong> boundaries drawn before the domain is understood are expensive to move once they are network APIs.</li>\n<li><strong>Assuming sagas give atomicity:</strong> a saga replaces one transaction with a sequence plus compensating steps; intermediate states are visible and compensations can fail.</li>\n<li><strong>Ignoring the operational bill:</strong> each service needs deploys, dashboards, alerts, on-call ownership and versioned APIs.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Deployment Boundaries vs. Domain Boundaries</h2>\n      <p>The debate between monolithic and microservice architectures is fundamentally an organizational and operational trade-off, not merely a code structure decision. A <strong>Monolith</strong> packages all business logic into a single deployable artifact accessing a unified database. A <strong>Microservices Architecture</strong> decomposes the domain into independently deployable services communicating over the network, each encapsulating its own private datastore.</p>\n\n      <h2>Architectural Topologies Compared</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph Monolith [\"Modular Monolith (In-Memory Function Calls)\"]\n      UI[\"Web / Mobile Clients\"] --> API[\"Monolithic Gateway\"]\n      API --> M_Auth[\"Auth Module\"]\n      API --> M_Order[\"Order Module\"]\n      API --> M_Pay[\"Payment Module\"]\n      M_Auth & M_Order & M_Pay --> SharedDB[(\"Unified Database - ACID Transactions\")]\n    end\n\n    subgraph Microservices [\"Microservices (Network RPC & Distributed Data)\"]\n      UI2[\"Clients\"] --> GW[\"API Gateway\"]\n      GW --> S_Auth[\"Auth Service\"]\n      GW --> S_Order[\"Order Service\"]\n      GW --> S_Pay[\"Payment Service\"]\n      S_Auth --> DB_A[(\"Auth DB\")]\n      S_Order --> DB_O[(\"Order DB\")]\n      S_Pay --> DB_P[(\"Payment DB\")]\n      S_Order -.->|\"Kafka Event\"| S_Pay\n    end\n      </div>\n\n      <h2>Core Production Invariants</h2>\n      <h3>1. The Distributed Network Tax</h3>\n      <p>In a monolith, calling from the order module to the payment module is an in-process function call costing nanoseconds to microseconds. In microservices, that call crosses TCP network boundaries, introducing serialization overhead (JSON/Protobuf), connection management, service discovery (DNS lookups are normally cached, not per call), TLS encryption, and non-deterministic packet latency. Every inter-service hop increases the p99 tail latency budget.</p>\n\n      <h3>2. Data Consistency: ACID vs. Eventual Consistency (Sagas)</h3>\n      <p>Monoliths enforce consistency through ACID database transactions with atomic rollbacks. When services split databases, cross-service atomic transactions require a distributed commit protocol such as Two-Phase Commit, which is rarely used between services because it blocks when the coordinator fails. The common alternative is a Saga (orchestrated or choreographed) with compensating transactions, which provides eventual consistency rather than atomicity: intermediate states are visible and compensations can fail.</p>\n\n      <h3>3. A Common Default: Modular Monolith First</h3>\n      <p>Unless multiple independent engineering teams are stepping on each other's release cadence, start with a <strong>Modular Monolith</strong>. Enforce strict package boundaries with clean interfaces in a single codebase. Only carve out a microservice when a specific sub-domain requires distinct hardware scaling (e.g., GPU video processing) or independent compliance isolation.</p>\n    \n<!-- enriched -->\n<h2>Worked example: the cost of one extra hop</h2>\n<p>Consider a checkout request that, in a monolith, calls the order module, inventory module and payment module in process. Each call costs microseconds. Split into services, each call becomes a network round trip. Inside one data centre a small RPC typically costs around 0.5 to 2 ms including serialization, so three sequential calls add roughly 2 to 6 ms at the median. That sounds small, but the tail compounds.</p>\n<p>If each service independently meets its latency target 99% of the time, a request that must call all three sequentially meets it only about 0.99 x 0.99 x 0.99 = 97% of the time. Availability multiplies the same way: three dependencies at 99.9% each give at most about 99.7% for the combined path, before counting the caller's own failures. This is why microservice systems need timeouts, retries with budgets, circuit breakers and good tracing from day one.</p>\n<p>Data consistency changes too. In the monolith, \"create order and reserve stock\" is one database transaction. Across services it becomes a saga: order service writes a pending order and publishes an event, inventory reserves stock and publishes a result, and a failure triggers a compensating \"cancel order\". The user can briefly see a pending order that later disappears; the design must decide whether that is acceptable.</p>\n<h2>Trade-off table</h2>\n<table>\n<thead><tr><th>Concern</th><th>Modular monolith</th><th>Microservices</th></tr></thead>\n<tbody>\n<tr><td>Deploying one change</td><td>Redeploy the whole application</td><td>Deploy one service independently</td></tr>\n<tr><td>Cross-module call</td><td>In-process function call</td><td>Network call with latency, partial failure and versioning</td></tr>\n<tr><td>Transactions</td><td>Single database ACID transaction</td><td>Sagas, outbox pattern, eventual consistency</td></tr>\n<tr><td>Scaling</td><td>Scale the whole app together</td><td>Scale hot services separately, for example GPU transcoding</td></tr>\n<tr><td>Fault isolation</td><td>A memory leak or bad deploy affects everything</td><td>Failures can be contained if timeouts and bulkheads exist</td></tr>\n<tr><td>Operational load</td><td>One pipeline, one set of dashboards</td><td>Per-service pipelines, tracing, service discovery, on-call</td></tr>\n<tr><td>Refactoring boundaries</td><td>Move code between packages</td><td>Migrate data and APIs between services</td></tr>\n</tbody>\n</table>\n<h2>Signals that a split is justified</h2>\n<ul>\n<li>Several teams block each other on a shared release train, and the conflicting code has a clear domain boundary.</li>\n<li>One component has very different resource needs or scaling patterns, such as video transcoding or ML inference.</li>\n<li>A component needs a separate security or compliance boundary, such as card data handling under PCI DSS.</li>\n<li>A component's failure should not take down the rest, and you are prepared to make callers tolerate its absence.</li>\n</ul>\n<h2>How real systems do it</h2>\n<p>Shopify runs one of the largest Ruby on Rails applications as a modular monolith, enforcing component boundaries with tooling rather than splitting into services. Amazon and Netflix moved to services to let hundreds of teams deploy independently. Amazon Prime Video published a case in 2023 where consolidating a distributed monitoring pipeline into a single process cut its infrastructure cost by about 90%, a reminder that the right answer depends on the workload.</p>\n</div>",
    "keyTakeaways": [
      "Monoliths maximize transactional integrity and developer velocity for small to medium teams with in-memory execution.",
      "Microservices solve organizational scaling and independent deployment, but introduce distributed network latency and partial failure modes.",
      "Never share databases between microservices; data encapsulation is the fundamental prerequisite for service independence."
    ],
    "furtherReading": [
      {
        "title": "Sam Newman: Building Microservices (2nd Edition)",
        "url": "https://samnewman.io/books/building_microservices_2nd_edition/"
      },
      {
        "title": "Shopify Engineering: Deconstructing the Monolith: Designing Software that Maximizes Developer Productivity",
        "url": "https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity"
      }
    ]
  },
  "repository-pattern": {
    "title": "Repository pattern",
    "video": {
      "youtubeId": "9ymRLDfnDKg",
      "title": "Deep Dive Into the Repository Design Pattern in Python",
      "channel": "ArjanCodes",
      "why": "Language-light, well-paced explanation of why the pattern exists, how the abstract interface decouples domain code from storage, and how it enables in-memory test doubles.",
      "length": "11:56"
    },
    "videos": [
      {
        "youtubeId": "HX6vkP-QD7U",
        "title": "The Unit of Work Design Pattern Explained",
        "channel": "ArjanCodes",
        "role": "deep-dive",
        "why": "The natural companion to repositories: how to group several repository writes into one transaction boundary.",
        "length": "12:37"
      },
      {
        "youtubeId": "bDWApqAUjEI",
        "title": "Hexagonal Architecture: What You Need To Know - Simple Explanation",
        "channel": "Alex Hyett",
        "role": "intro",
        "why": "Places the repository as one \"port\" in ports-and-adapters architecture, giving the bigger picture.",
        "length": "8:16"
      }
    ],
    "intuition": "<p>A library patron asks the librarian \"give me the book with ISBN X\". They do not care whether it is on shelf 4, in the basement or on loan from another branch. The librarian is the repository: a collection-like interface that hides where and how things are stored.</p>\n<p><strong>Mental model:</strong> <em>domain code talks in domain terms (<code>orders.get(id)</code>, <code>orders.save(order)</code>); the repository translates to SQL, a document store or an HTTP API.</em> Swap the implementation for an in-memory one and your business rules can be tested in milliseconds.</p>\n<ul>\n<li><strong>Leaky generic repositories:</strong> exposing raw query builders or <code>IQueryable</code> lets SQL concerns spread into every service and defeats the purpose.</li>\n<li><strong>N+1 queries hidden behind a clean API:</strong> <code>getOrder</code> then lazily loading each item makes 1 + N round trips; define aggregate-level methods that fetch what the use case needs.</li>\n<li><strong>Believing the fake proves the real thing:</strong> an in-memory repository will not enforce unique constraints or transaction isolation. Test the real adapter against a real database too.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Decoupling Domain Logic from Storage Mechanics</h2>\n      <p>The <strong>Repository Pattern</strong> acts as an in-memory collection-like abstraction between domain business logic and the underlying persistence layer (SQL, NoSQL, or external HTTP APIs). Its primary architectural purpose is to prevent database query semantics and ORM leakages from infecting domain entities.</p>\n\n      <h2>Data Flow Across Architectural Layers</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    Controller[\"HTTP / gRPC Handler\"] --> Service[\"Domain Business Service\"]\n    Service --> RepoInterface[\"OrderRepository (interface)\"]\n    RepoInterface -.->|\"Dependency Injection\"| PostgresRepo[\"PostgresOrderRepository\"]\n    RepoInterface -.->|\"Unit Testing\"| MockRepo[\"InMemoryMockOrderRepository\"]\n    PostgresRepo --> DB[(\"PostgreSQL / SQL Engine\")]\n      </div>\n\n      <h2>Engineering Realities & Anti-Patterns</h2>\n      <h3>1. The Leaky Abstraction Problem</h3>\n      <p>A frequent anti-pattern is creating a generic <code>Repository&lt;T&gt;</code> that exposes direct query builders, raw IQueryable, or arbitrary predicate filters to the service tier. When service code passes database-specific filter clauses into the repository, the abstraction leaks completely: database schema knowledge bleeds across domain boundaries, defeating the purpose of the pattern.</p>\n\n      <h3>2. The N+1 Query Trap & Impedance Mismatch</h3>\n      <p>Domain entities often possess nested relationships (e.g., an <code>Order</code> contains multiple <code>OrderItems</code>). Naive repository methods like <code>getOrderById(id)</code> that lazily fetch associated entities trigger classic N+1 network roundtrips to the database. Production repositories explicitly define aggregate root queries (e.g., <code>getOrderWithItems(id)</code>) that execute explicit SQL joins.</p>\n\n      <h3>3. CQRS Boundary: Reads vs. Writes</h3>\n      <p>Repositories shine for write-heavy domain aggregates enforcing business invariants. For complex read-heavy dashboard queries or multi-table analytical joins, bypassing the repository in favor of a specialized Read Model (CQRS) avoids inflating domain entities with unnecessary read projections.</p>\n    \n<!-- enriched -->\n<h2>Worked example: a link repository</h2>\n<p>For the course's URL shortener, the link operation needs only three storage capabilities. Defining them explicitly keeps the contract small:</p>\n<ul>\n<li><code>findByCode(code)</code> returns Found(link), Missing, or throws StorageUnavailable.</li>\n<li><code>insertIfAbsent(link)</code> returns Inserted or CodeTaken. The Postgres adapter implements this with <code>INSERT ... ON CONFLICT (code) DO NOTHING</code> and checks the affected row count, so the uniqueness rule stays atomic in the database.</li>\n<li><code>disable(code)</code> returns Updated or Missing.</li>\n</ul>\n<p>The in-memory implementation is a dictionary plus the same result types. A unit test can run thousands of \"generate code, collide, retry\" cycles in well under a second. A separate integration test runs the Postgres adapter against a real database (for example in a container) and verifies that two concurrent <code>insertIfAbsent</code> calls with the same code produce exactly one Inserted and one CodeTaken.</p>\n<p>Notice what the interface does not offer: no <code>query(sql)</code>, no generic filter object. If a reporting page needs \"top 100 links by clicks last week\", that is a read model query written directly against the database or a warehouse, not a repository method.</p>\n<h2>Trade-off table</h2>\n<table>\n<thead><tr><th>Approach</th><th>Strengths</th><th>Weaknesses</th><th>Use when</th></tr></thead>\n<tbody>\n<tr><td>Direct ORM or SQL in handlers</td><td>Least code, easy to follow for small apps</td><td>Rules and queries mixed; hard to test without a database</td><td>Small CRUD apps, prototypes</td></tr>\n<tr><td>Specific repository per aggregate</td><td>Domain rules testable in memory; storage swappable in one place</td><td>More interfaces; risk of pass-through methods</td><td>Rich domain rules, several callers sharing rules</td></tr>\n<tr><td>Generic repository of T</td><td>Less boilerplate</td><td>Tends to leak query semantics; weak domain language</td><td>Rarely the best choice; most ORMs already are this</td></tr>\n<tr><td>Repository for writes plus read models (CQRS-lite)</td><td>Writes protect invariants; reads use efficient tailored queries</td><td>Two code paths to maintain</td><td>Complex dashboards or reports over the same data</td></tr>\n</tbody>\n</table>\n<h2>Failure modes</h2>\n<ul>\n<li><strong>Transactions across repositories:</strong> saving an order and decrementing stock through two repositories needs a shared transaction (the Unit of Work pattern) or you can commit one without the other.</li>\n<li><strong>Error translation:</strong> letting a driver-specific exception escape forces every caller to know the database. Translate into a small set of domain errors at the adapter.</li>\n<li><strong>Over-abstraction:</strong> wrapping an ORM that already implements identity map and unit of work in another layer that just forwards calls adds code without protection.</li>\n</ul>\n<h2>How real systems use it</h2>\n<p>The pattern comes from Martin Fowler's Patterns of Enterprise Application Architecture and Eric Evans's Domain-Driven Design. Frameworks such as Spring Data and Entity Framework provide repository-like abstractions built in, which is why many teams define thin, use-case-specific repository interfaces on top rather than generic wrappers.</p>\n</div>",
    "keyTakeaways": [
      "The repository pattern mediates between the domain layer and data mapping using a collection-like interface.",
      "Avoid generic CRUD repositories that leak SQL query builders into domain business logic.",
      "Use explicit aggregate root methods to avoid lazy-loading N+1 query performance degradation."
    ],
    "furtherReading": [
      {
        "title": "Martin Fowler: Catalog of Patterns of Enterprise Application Architecture - Repository",
        "url": "https://martinfowler.com/eaaCatalog/repository.html"
      },
      {
        "title": "Microsoft Architecture Guide: The Repository Pattern",
        "url": "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"
      }
    ]
  },
  "extensible-data-modeling": {
    "title": "Extensible data modeling",
    "video": {
      "youtubeId": "Wbg2HoYjLHU",
      "title": "Andrew Farries - Postgres schema migrations using the expand/contract pattern (PGConf.EU 2024)",
      "channel": "PostgreSQL Europe",
      "why": "A practitioner talk that explains, step by step, how to evolve a production schema without downtime using expand/contract, the most important technique in this unit.",
      "length": "43:20"
    },
    "videos": [
      {
        "youtubeId": "VeYs1t3qSvA",
        "title": "Avoid This Type of Database Design",
        "channel": "Database Star",
        "role": "intro",
        "why": "Clear, concrete explanation of why Entity-Attribute-Value designs hurt querying and integrity, and what to use instead.",
        "length": "8:59"
      },
      {
        "youtubeId": "F6X60ln2VNc",
        "title": "Even JSONB In Postgres Needs Schemas | POSETTE 2024",
        "channel": "Microsoft Developer",
        "role": "deep-dive",
        "why": "Shows how to use JSONB for flexible attributes while still validating and indexing it, the hybrid approach this unit recommends.",
        "length": "23:19"
      }
    ],
    "intuition": "<p>Think of a filing cabinet with labelled folders for the things every customer has (name, address, account number) plus one \"misc\" envelope for odd extras. You index the folders because you search them constantly; the envelope is flexible but slower to search and nobody checks what goes in it.</p>\n<p><strong>Mental model:</strong> <em>put stable, queried, constrained data in real columns; put genuinely variable attributes in a validated JSON document; change the schema in small reversible steps (expand, migrate, contract).</em></p>\n<ul>\n<li><strong>Everything in JSON:</strong> you lose types, foreign keys and easy indexing; bugs show up as silently missing keys.</li>\n<li><strong>EAV by default:</strong> key/value rows make every multi-attribute query a pile of self-joins and make constraints almost impossible.</li>\n<li><strong>Renaming in one deploy:</strong> old application instances still read the old column during a rolling deploy; add the new column first, dual-write, backfill, switch reads, then drop.</li>\n<li><strong>Locking migrations:</strong> some <code>ALTER TABLE</code> operations rewrite or lock large tables; check what your database version does before running it at peak.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Designing Schemas for Inevitable Change</h2>\n      <p>Software requirements continuously evolve, but altering production database schemas with millions of records introduces lock contention, table rewrites, and migration downtime. <strong>Extensible Data Modeling</strong> balances strict relational integrity against the agility required to accommodate dynamic, polymorphic, or rapidly mutating business attributes.</p>\n\n      <h2>Extensibility Patterns Compared</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Choice{\"Data Variability Pattern\"}\n    Choice -->|\"Dense, Known Schema with Rapid Feature Flags\"| Hybrid[\"Relational Core + JSONB Document\"]\n    Choice -->|\"Highly Dynamic Sparse Attributes (e-commerce catalog)\"| EAV[\"Entity-Attribute-Value (EAV)\"]\n    Choice -->|\"Polymorphic Inheritance Hierarchies\"| STI[\"Single Table Inheritance with Type Discriminator\"]\n    Choice -->|\"Zero-Downtime Schema Evolutions\"| ExpCont[\"Expand / Contract Dual-Writing\"]\n      </div>\n\n      <h2>Core Production Strategies</h2>\n      <h3>1. Hybrid Relational + Semi-Structured (JSONB)</h3>\n      <p>Modern production architectures retain relational columns for core, indexed, and audited identifiers (<code>id</code>, <code>account_id</code>, <code>status</code>, <code>created_at</code>) while storing dynamic or third-party metadata in binary JSON (<code>JSONB</code> in PostgreSQL; MySQL 8 has a binary <code>JSON</code> type indexed through generated columns or multi-valued indexes). In PostgreSQL, Generalized Inverted Indexes (<strong>GIN</strong>) let containment and key-existence queries on JSONB use an index instead of a full table scan.</p>\n\n      <h3>2. The EAV Anti-Pattern & Pitfalls</h3>\n      <p>Entity-Attribute-Value (EAV) models store attributes across three generic columns: <code>EntityID, AttributeKey, Value</code>. While allowing infinite runtime attribute creation, querying multiple attributes requires repeated self-joins, forfeits native foreign-key constraints, and degrades database query planners. JSONB columns or dedicated document stores are usually a better choice; keep EAV for rare cases such as extremely sparse, user-defined attributes where JSON is unavailable.</p>\n\n      <h3>3. The Expand-Migrate-Contract Pattern</h3>\n      <p>Never rename or remove columns in a single deployment. Step 1 (Expand): Add the new nullable column alongside the old. Step 2: Update application code to dual-write to both columns while still reading from the old one. Step 3 (Migrate): Backfill historical rows asynchronously in batches, verify the backfill, then switch reads to the new column. Step 4 (Contract): Remove the old column once all dependent code is retired.</p>\n    \n<!-- enriched -->\n<h2>Worked example: renaming a column with expand/contract</h2>\n<p>Suppose the <code>links</code> table has a column <code>url</code> that should become <code>destination_url</code>, with 1.8 billion rows and continuous traffic. A single <code>RENAME</code> would break every running instance that still uses the old name. Instead:</p>\n<ol>\n<li><strong>Expand:</strong> add <code>destination_url</code> as a nullable column. In PostgreSQL 11 and later, adding a nullable column (or one with a constant default) is a fast metadata-only change.</li>\n<li><strong>Dual-write:</strong> deploy code that writes both columns but still reads <code>url</code>. New rows are now complete in both.</li>\n<li><strong>Backfill:</strong> copy old rows in batches, for example 10,000 rows per transaction by primary key range. At about 2,000 batches per minute that is roughly 20 million rows per minute, so 1.8 billion rows takes around 90 minutes, throttled to keep replication lag low.</li>\n<li><strong>Switch reads:</strong> once the backfill is verified (count of rows where the columns differ is zero), deploy code that reads <code>destination_url</code>.</li>\n<li><strong>Contract:</strong> stop writing <code>url</code>, wait until no running version uses it, then drop it.</li>\n</ol>\n<p>Every step is independently deployable and reversible until the final drop. Tools such as pgroll, gh-ost (MySQL) and pt-online-schema-change automate parts of this.</p>\n<h2>Choosing a flexibility pattern</h2>\n<table>\n<thead><tr><th>Pattern</th><th>Good for</th><th>Costs</th></tr></thead>\n<tbody>\n<tr><td>Typed columns</td><td>Data that is always present, filtered, joined or constrained</td><td>Schema migration for every change</td></tr>\n<tr><td>JSON or JSONB column</td><td>Per-tenant custom fields, third-party payloads, sparse product attributes</td><td>Weaker typing; indexes needed per access path; validation in application or check constraints</td></tr>\n<tr><td>Entity-Attribute-Value table</td><td>Extremely sparse attributes defined at runtime by users, when JSON is unavailable</td><td>Self-joins per attribute, all values stored as text, no per-attribute constraints</td></tr>\n<tr><td>Single table with type discriminator</td><td>A few subtypes sharing most fields</td><td>Many nullable columns as subtypes diverge</td></tr>\n<tr><td>Table per subtype</td><td>Subtypes with distinct required fields and constraints</td><td>Joins or unions to query across all types</td></tr>\n</tbody>\n</table>\n<h2>Indexing flexible data in PostgreSQL</h2>\n<ul>\n<li>A GIN index on a JSONB column supports containment queries such as <code>attributes @&gt; '{\"color\": \"red\"}'</code>.</li>\n<li>For one frequently filtered key, an expression index on <code>(attributes -&gt;&gt; 'color')</code> or a generated column with a B-tree index is usually smaller and faster.</li>\n<li>MySQL stores JSON in a binary format but has no GIN; index JSON values through generated columns or multi-valued indexes.</li>\n</ul>\n<h2>Failure modes</h2>\n<ul>\n<li>Backfills that run too fast cause replica lag and lock contention; throttle and monitor.</li>\n<li>Dropping the old column while an old deploy or a batch job still reads it causes errors; check query logs first.</li>\n<li>JSON attributes that become business-critical should be promoted to real columns with the same expand/contract steps.</li>\n</ul>\n</div>",
    "keyTakeaways": [
      "Hybrid relational models combine strict SQL columns for core foreign keys with JSONB for extensible payload attributes.",
      "Index semi-structured JSONB columns with PostgreSQL GIN indexes to maintain efficient query paths.",
      "Apply the Expand-Migrate-Contract pattern for zero-downtime database schema migrations on active tables."
    ],
    "furtherReading": [
      {
        "title": "PostgreSQL Documentation: JSON Types and GIN Indexing",
        "url": "https://www.postgresql.org/docs/current/datatype-json.html"
      },
      {
        "title": "Martin Fowler: Evolutionary Database Design",
        "url": "https://martinfowler.com/articles/evodb.html"
      }
    ]
  },
  "cost-aware-architecture": {
    "title": "Cost-aware architecture",
    "video": {
      "youtubeId": "UTRBVPvzt9w",
      "title": "AWS re:Invent 2023 - Keynote with Dr. Werner Vogels",
      "channel": "Amazon Web Services",
      "why": "The keynote where Werner Vogels introduced \"The Frugal Architect\": cost as a non-functional requirement, aligning cost with business revenue, and measuring cost per unit of work. The first hour is directly on topic.",
      "length": "1:53:41"
    },
    "videos": [
      {
        "youtubeId": "dX2xCeQYCB4",
        "title": "The Frugal Architect: Innovation Meets Efficiency",
        "channel": "AWS Developers",
        "role": "intro",
        "why": "Short summary of the Frugal Architect principles for viewers who will not watch the full keynote.",
        "length": "4:43"
      },
      {
        "youtubeId": "V_p1V5BP0jE",
        "title": "Reducing cloud egress charges: 10 common pitfalls and how to avoid them [Cloud Masters #121]",
        "channel": "DoiT",
        "role": "deep-dive",
        "why": "Practical walk-through of the network transfer costs (internet egress, cross-zone and cross-region traffic) that this unit identifies as the most common hidden bill.",
        "length": "46:06"
      }
    ],
    "intuition": "<p>Running a delivery business, you track cost per delivery, not just the total fuel bill. If cost per delivery rises while deliveries stay flat, something is wasteful: an empty truck driving across town, or a warehouse full of stock nobody orders.</p>\n<p><strong>Mental model:</strong> <em>cost is a non-functional requirement measured per unit of business work</em> (per request, per active user, per GB served). Architecture decisions such as where data lives, how it moves, and how long it stays hot drive most of the bill.</p>\n<ul>\n<li><strong>Assuming internal traffic is free:</strong> on AWS, cross-availability-zone traffic is billed in each direction; a chatty service talking to a replica in another zone can cost more than its compute.</li>\n<li><strong>Keeping everything hot:</strong> logs and uploads that are rarely read belong in cheaper storage classes with lifecycle rules, but check retrieval fees and minimum storage durations first.</li>\n<li><strong>Optimising before measuring:</strong> tag resources and break the bill down by service and feature before redesigning anything.</li>\n<li><strong>Spot for the wrong work:</strong> spot or preemptible capacity suits interruptible, retryable work, not a single stateful primary database.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Cloud Economics as a Primary Constraint</h2>\n      <p>In cloud-native distributed systems, architectural decisions map directly to recurring monthly operational expense. An architecture that achieves single-digit millisecond latency by over-provisioning memory clusters or continuously replicating terabytes across availability zones without considering network egress is functionally flawed. <strong>Cost-Aware Architecture</strong> establishes unit economics (e.g., compute and bandwidth cost per active user or per transaction) as a first-class engineering metric.</p>\n\n      <h2>Cloud Cost Levers Breakdown</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    subgraph IngressEgress [\"Network Transfer\"]\n      E1[\"Internet Outbound Egress: Expensive ($0.08 - $0.12 / GB)\"]\n      E2[\"Cross-AZ Traffic: Hidden Cost ($0.01 / GB each way)\"]\n      E3[\"Intra-AZ Private IP: Free ($0.00 / GB)\"]\n    end\n    subgraph StorageCompute [\"Compute & Storage Tiering\"]\n      C1[\"Spot / Preemptible: 60-90% Discount\"]\n      C2[\"Reserved / Savings Plans: 30-50% Discount\"]\n      S1[\"S3 Standard -> Infrequent Access -> Glacier Archival\"]\n    end\n      </div>\n\n      <h2>Production Cost Optimization Mechanics</h2>\n      <h3>1. The Cross-Availability-Zone Network Trap</h3>\n      <p>Engineers often assume intra-cloud network traffic is free. Cloud providers charge for cross-AZ data transfer in both directions. If microservice A in AZ-1 calls database replica B in AZ-2 with uncompressed gigabytes of JSON data, the monthly network transfer bill can eclipse compute costs. Mitigate this with AZ-affinity routing, gzip/Zstandard compression, and binary serialization (Protobuf).</p>\n\n      <h3>2. Multi-Tiered Storage Lifecycle Automation</h3>\n      <p>For many workloads, access frequency drops sharply with age and most reads target recent data (measure your own access pattern, for example with S3 Storage Class Analysis). Retaining multi-year logs, raw user uploads, or audit events in hot object storage (S3 Standard) wastes capital. Automated lifecycle rules transition data from Standard ($0.023/GB/mo) to Infrequent Access ($0.0125/GB/mo) to Glacier Deep Archive ($0.00099/GB/mo) (us-east-1 list prices, which vary by region and change over time). That cuts the per-GB storage price by over 95% for rarely read data, but retrieval fees and minimum storage durations (30 days for Standard-IA, 180 days for Deep Archive) apply.</p>\n\n      <h3>3. Compute Blending: On-Demand vs. Spot Capacity</h3>\n      <p>Stateless batch processors, asynchronous queue workers, and data analytics pipelines are good candidates for Spot capacity instead of full-price On-Demand instances. Blending an On-Demand baseline (for example around 20%) with Spot capacity for the rest, diversified across instance types behind auto-scaling groups, cuts compute spend while tolerating preemptions; the right split depends on the workload.</p>\n    \n<!-- enriched -->\n<h2>Worked example: pricing the shortener's traffic</h2>\n<p>Use illustrative AWS us-east-1 list prices (they change; always check the current pricing page): internet data transfer out about 0.09 USD per GB for the first 10 TB per month, cross-AZ transfer 0.01 USD per GB in each direction, S3 Standard about 0.023 USD per GB-month, S3 Glacier Deep Archive about 0.00099 USD per GB-month.</p>\n<ul>\n<li><strong>Redirect responses:</strong> 100 million redirects per day with a response of about 500 bytes including headers is about 50 GB per day, roughly 1.5 TB per month, or about 135 USD per month of egress. Small.</li>\n<li><strong>Click events across zones:</strong> if each redirect writes a 300 byte event to a database primary in another availability zone, that is 30 GB per day crossing zones. With replication to a standby in a third zone, the bytes cross twice. At 0.01 USD per GB each way, the cost is a few tens of dollars per month, still small, but it grows linearly with any payload you add.</li>\n<li><strong>Event history storage:</strong> 100 million events per day at 300 bytes is about 30 GB per day, about 11 TB per year. Five years in S3 Standard would be about 55 TB, roughly 1,265 USD per month at the end. Moving events older than 90 days to Deep Archive brings the bulk of it to roughly 55 USD per month, at the cost of retrieval times measured in hours.</li>\n</ul>\n<p>The lesson: for this product, storage retention policy dominates, not the request path. For a video or image product, egress would dominate instead, which is why such products use CDNs with negotiated rates.</p>\n<h2>Cost levers and their trade-offs</h2>\n<table>\n<thead><tr><th>Lever</th><th>Typical saving</th><th>What you give up</th></tr></thead>\n<tbody>\n<tr><td>Reserved instances or savings plans</td><td>Often around 30 to 60% versus on-demand</td><td>One to three year commitment</td></tr>\n<tr><td>Spot or preemptible instances</td><td>Up to about 90% versus on-demand</td><td>Instances can be reclaimed with short notice (2 minutes on AWS)</td></tr>\n<tr><td>Storage lifecycle tiers</td><td>Large for cold data</td><td>Retrieval fees, minimum storage duration, slower access</td></tr>\n<tr><td>Zone-affine routing</td><td>Removes cross-AZ transfer</td><td>Uneven load if one zone is busier; failover must still work</td></tr>\n<tr><td>Compression and binary encoding</td><td>Often several times fewer bytes on the wire</td><td>CPU time and harder debugging</td></tr>\n<tr><td>CDN caching</td><td>Lower origin egress and compute</td><td>Staleness and invalidation complexity</td></tr>\n<tr><td>Right-sizing and autoscaling</td><td>Removes idle capacity</td><td>Less headroom for sudden spikes</td></tr>\n</tbody>\n</table>\n<h2>Failure modes</h2>\n<ul>\n<li><strong>Runaway costs from bugs:</strong> a retry loop or log flood can multiply the bill overnight; set budgets and billing alerts.</li>\n<li><strong>Unexpected NAT gateway charges:</strong> traffic from private subnets to AWS services through a NAT gateway is charged per GB processed; VPC endpoints avoid much of it.</li>\n<li><strong>Cheap storage, expensive reads:</strong> infrequent-access tiers charge per GB retrieved, so frequently read data can cost more there than in Standard.</li>\n</ul>\n</div>",
    "keyTakeaways": [
      "Cross-Availability-Zone data transfer is a major hidden cloud cost; use AZ-aware routing and payload compression.",
      "Tier storage automatically using lifecycle rules: S3 Standard for hot data, Glacier Deep Archive for compliance logs.",
      "Blend On-Demand baseline compute with Spot/Preemptible instances for fault-tolerant background workloads."
    ],
    "furtherReading": [
      {
        "title": "AWS Well-Architected Framework: Cost Optimization Pillar",
        "url": "https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html"
      },
      {
        "title": "AWS Architecture Blog: Overview of Data Transfer Costs for Common Architectures",
        "url": "https://aws.amazon.com/blogs/architecture/overview-of-data-transfer-costs-for-common-architectures/"
      }
    ]
  },
  "when-not-to-add-infrastructure": {
    "title": "When not to add infrastructure",
    "video": {
      "youtubeId": "75dQlJKIfV0",
      "title": "A Plea for Boring Tech | Jason Lengstorf | SeattleJS Conf 2023",
      "channel": "CascadiaJS",
      "why": "A conference talk built around the \"choose boring technology\" idea: every new component spends a limited budget of operational attention, so add one only when it solves a problem you actually have.",
      "length": "21:51"
    },
    "videos": [
      {
        "youtubeId": "GBTdnfD6s5Q",
        "title": "When To Use Microservices (And When Not To!) • Sam Newman & Martin Fowler • GOTO 2020",
        "channel": "GOTO Conferences",
        "role": "deep-dive",
        "why": "Applies the same test to the biggest infrastructure decision of all: what property does splitting buy, and what does it cost to operate.",
        "length": "38:44"
      },
      {
        "youtubeId": "iUU4O1sWtJA",
        "title": "Beginner System Design Interview: Design Bitly w/ a Ex-Meta Staff Engineer",
        "channel": "Hello Interview",
        "role": "interview",
        "why": "Shows the discipline of starting from a simple working design for the course's shortener and only adding caches or other components when a stated requirement needs them.",
        "length": "59:30"
      }
    ],
    "intuition": "<p>Adopting a pet is free on day one; the cost is the years of feeding, vet visits and someone being home. Every cache, queue, cluster or new database is the same: installing it is easy, owning it at 3 a.m. is the real price.</p>\n<p><strong>Mental model:</strong> <em>add a component only when you can name the requirement the current design fails, show that a simpler fix does not solve it, and name who will operate the new part.</em></p>\n<ul>\n<li><strong>Resume-driven design:</strong> adding Kafka, Kubernetes and Redis to a system with 50 requests per second signals pattern matching, not reasoning. Interviewers usually prefer \"a single Postgres handles this; here is when I would add X\".</li>\n<li><strong>Ignoring the new failure mode:</strong> a cache adds stale data and cold-start load; a queue adds backlog and duplicate delivery. Explain how each fails.</li>\n<li><strong>Skipping cheap fixes:</strong> a missing index, an N+1 query or connection reuse often buys a larger improvement than a new tier.</li>\n<li><strong>No reopen condition:</strong> write down the metric that would justify the component later, so the decision is revisited deliberately.</li>\n</ul>",
    "content": "<div class=\"lesson-content\">\n<h2>When not to add infrastructure</h2>\n<p>Every new running component needs configuration, capacity, monitoring, upgrades, and a plan for failure. Add it when those obligations buy a property the product needs: capacity, latency, availability, isolation, or easier operation.</p>\n<p>The useful question is what the current design cannot do, and whether this component fixes that limitation.</p>\n<h3>Name the missing property</h3>\n<p>“The database will get large” does not establish a need for a cache. “Repeated destination lookups dominate a measured latency problem” is a more useful starting point. It identifies both the work to remove and a result to compare afterward.</p>\n<p>Performance is only one reason to change the design. A service may meet its traffic target but fail the requirement to survive losing a host. You do not need to wait for a production outage to act on an explicit recovery requirement.</p>\n<p>For our shortener, the historical warm lookup measurement supports investigating a simple indexed database path. It excludes the application and required event write. It cannot establish complete-service capacity or recovery behavior.</p>\n<h3>Try the smaller change first</h3>\n<table><thead><tr><th>Proposed addition</th><th>Simpler candidate to examine</th><th>What could justify the addition</th></tr></thead><tbody><tr><td>Redis for every read</td><td>Fix query shape, indexes and connection reuse</td><td>Repeated hot reads still miss the agreed target</td></tr><tr><td>A streaming platform for every background task</td><td>A task queue or database outbox</td><td>Replay, multiple independent consumers, or measured throughput needs</td></tr><tr><td>Microservices to divide ownership</td><td>Clear modules and internal interfaces</td><td>Independent releases, resources, permissions or failure boundaries</td></tr><tr><td>Kubernetes for a small application</td><td>A managed platform or simpler deployment</td><td>Concrete scheduling or operating needs that justify the platform</td></tr><tr><td>Writes accepted in several regions</td><td>A single writer, with replicas where useful</td><td>A product requirement for regional write availability or latency</td></tr></tbody></table>\n<p>These are starting comparisons, not bans. A managed platform or task queue still has costs and limits. Likewise, read replicas do not remove the single writer's failure or latency constraints.</p>\n<p>If the product requirement is still changing, avoid committing to a difficult-to-reverse arrangement before the boundary is understood. Preserve a straightforward path to introduce it later.</p>\n<h3>Trace the new failure path</h3>\n<p>A cache can reduce database reads while creating a second place that serves an old answer. For short links, ask how quickly a disabled unsafe destination stops being returned. Also ask whether the database can handle the traffic when the cache is cold or unavailable.</p>\n<p>A queue can move report calculation out of a redirect's wait. It still needs durable acceptance if the event must survive a crash. Returning success after an unawaited in-memory enqueue weakens that promise.</p>\n<p>The first shortener design can record an event in the existing database and calculate reports later. A separate queue becomes worth considering when the shared database path or processing arrangement no longer meets the requirement. Measure the combined path; the lookup-only benchmark did not test it.</p>\n<p><img src=\"/course-assets/system-design/illustrations/infrastructure-owner.webp\" alt=\"One engineer proposes adding a cache box. A colleague holding a pager asks who will get paged when it fails.\" /></p>\n<h3>Decide who can operate it</h3>\n<p>An additional service needs someone who can recognize failure, find the relevant evidence, and recover or disable it safely. Include that work in the comparison even when the vendor offers a free tier.</p>\n<p>Before adopting the component, establish its owner, its failure signal, and the first recovery action. If nobody can investigate it during an incident, simplify the design or build that operating capability before relying on it.</p>\n<p>Deferring a component should leave a useful decision record. Save the current workload, the required behavior, the rejected alternative, and the condition for reopening the choice. “Revisit caching if repeated lookups still dominate the missed latency target after query fixes” gives the next engineer something to test.</p>\n<p>The aim is a system whose parts have a clear job and an understood cost. A small design that misses the recovery promise is insufficient; a larger design full of unused mechanisms is harder to maintain. Keep the components that earn their place.</p>\n</div>",
    "keyTakeaways": [
      "Understand the requirements clearly before designing.",
      "Identify non-functional requirements and scale.",
      "Always look out for failure and operational constraints."
    ],
    "furtherReading": [
      {
        "title": "Dan McKinley: Choose Boring Technology",
        "url": "https://mcfunley.com/choose-boring-technology"
      },
      {
        "title": "Google SRE Book: Simplicity (Operational Simplicity: Stability and Agility)",
        "url": "https://sre.google/sre-book/simplicity/"
      }
    ]
  }
};
