window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["url-shortener-system-design"] = [
  {
    "id": "url-shortener-system-design-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Single-node storage math",
    "section": "Worked example: does it fit on one machine?",
    "prompt": "Your shortener creates 2 million links per day, and each row (code, URL, owner, timestamps) is about 500 bytes. Roughly how much new storage does one year of links need?",
    "options": [
      "About 36 GB per year",
      "About 3.6 TB per year",
      "About 1 TB per year",
      "About 365 GB per year"
    ],
    "answer": 3,
    "explanation": "2 million x 365 is about 730 million rows, and at 500 B each that is about 365 GB, which one PostgreSQL instance on NVMe still handles comfortably. The 3.6 TB answer comes from slipping a factor of ten in the row count.",
    "tags": [
      "url-shortener-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "url-shortener-system-design-c2",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Stopping enumeration",
    "section": "Code generation options",
    "prompt": "Codes are Base62 of an auto-increment ID, and a competitor is walking through b7, b8, b9 to scrape every link and estimate your volume. Which change stops this while keeping 7-character codes and zero collisions?",
    "options": [
      "Hash each URL with MD5 and keep the first 7 characters",
      "Encode a one-to-one permutation of the ID, such as a small Feistel network",
      "Switch to Snowflake IDs so codes include a timestamp and worker ID",
      "Append a random character to each sequential Base62 code"
    ],
    "answer": 1,
    "explanation": "A reversible permutation maps each ID to a unique, non-sequential value in the same space, so there are no collisions and nothing to enumerate. Truncated MD5 hides the sequence but reintroduces birthday collisions; Snowflake IDs need about 11 characters.",
    "tags": [
      "url-shortener-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "url-shortener-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Counting every click",
    "section": "Redirect status codes",
    "prompt": "Marketing complains that repeat clicks by the same user never show up in click analytics. The service returns 301 with no cache headers. What is the most robust fix?",
    "options": [
      "Keep 301 but add a query string with a timestamp to each short link",
      "Switch to 308 so the browser preserves the request method on redirect",
      "Return 302 or 307 with Cache-Control: private, max-age=0 on the redirect",
      "Return 301 and count clicks from the destination site's referrer logs"
    ],
    "answer": 2,
    "explanation": "Browsers cache a 301 aggressively, so repeat clicks never reach the origin; a temporary redirect with explicit no-cache headers makes each click hit you. 308 is also a permanent redirect and is cached like a 301, so it has the same problem.",
    "tags": [
      "url-shortener-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "url-shortener-system-design-n1",
    "topic": "url-shortener-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Base62 Short Code Namespace Capacity",
    "scenario": "You design a short code generator using a Base62 alphabet (`a-z`, `A-Z`, `0-9` = 62 characters). A 6-character code provides `62^6 ≈ 56.8 billion` codes, and a 7-character code provides `62^7 ≈ 3.52 trillion` (`3,521 billion`) codes.",
    "prompt": "At a write rate of 1 billion new links per year, how many years would it take to exhaust 56 billion 6-character Base62 codes (rounded to the nearest integer)?",
    "question": "At a write rate of 1 billion new links per year, how many years would it take to exhaust 56 billion 6-character Base62 codes (rounded to the nearest integer)?",
    "unit": "years",
    "answer": 56,
    "tolerance": 0.25,
    "hint": "Divide 56 billion total codes by 1 billion codes per year.",
    "explanation": "`62^6 = 56,800,235,584` (~56.8 billion) unique codes. At 1 billion links/year (~31.7 writes/sec), a 6-character Base62 namespace lasts ~56–57 years (and a 7-character namespace lasts ~3,521 years).",
    "tags": [
      "url-shortener-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "url-shortener-system-design-t1",
    "topic": "url-shortener-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: HTTP 301 (Permanent) vs HTTP 302 (Temporary) Redirect Status Codes",
    "scenario": "Product management wants your URL shortener to provide accurate real-time click analytics (total clicks, referrer, geo, device breakdown) AND allow enterprise customers to update a link's destination URL during a campaign.",
    "prompt": "Which HTTP redirect status code and caching policy must you choose, and what is the trade-off?",
    "question": "Which HTTP redirect status code and caching policy must you choose, and what is the trade-off?",
    "options": [
      "Return `HTTP 301 Moved Permanently` with `Cache-Control: max-age=31536000` so browsers never contact your servers again",
      "Return `HTTP 302 Found` (or `307` with controlled `Cache-Control: no-cache` / edge beacon logging) so every click reaches your edge/service to record analytics and respect destination updates, trading off higher edge request QPS",
      "Return `HTTP 200 OK` with an HTML `<iframe src='...'>` wrapping the destination site"
    ],
    "correctOption": 1,
    "reasons": [
      "Browsers cache HTTP 301 permanently in local disk cache and still send click analytics to the shortener on subsequent clicks",
      "HTTP 301 causes browsers to bypass the shortener on repeat clicks (losing analytics and serving stale destinations if edited); HTTP 302 (handled at CDN edge with log streaming) preserves click telemetry and mutability",
      "All websites allow being embedded in third-party iframes (`X-Frame-Options: DENY` does not exist)"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "What does a browser do on the second click of an `HTTP 301` redirect?",
    "explanation": "With `HTTP 301`, browsers cache the redirect locally and jump straight to the target URL on repeat clicks, blinding your analytics pipeline and ignoring destination edits. `HTTP 302` ensures repeat clicks hit your edge (or API) where click events are captured.",
    "tags": [
      "url-shortener-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["rate-limiting-and-abuse-prevention-case-study"] = [
  {
    "id": "rate-limiting-and-abuse-prevention-case-study-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Token bucket burst",
    "section": "Comparison of Core Algorithms",
    "prompt": "A client's token bucket refills at 10 tokens per second with capacity 50. After a minute of idling, the client fires 80 requests at once. What happens?",
    "options": [
      "All 80 pass, because the idle minute accrued 600 tokens",
      "10 pass, because the refill rate caps each second to 10",
      "50 pass immediately and the rest are limited to about 10 per second",
      "None pass, because 80 exceeds the bucket capacity of 50"
    ],
    "answer": 2,
    "explanation": "Tokens accumulate only up to capacity b = 50, so a full bucket allows a 50-request burst and further requests are admitted at the refill rate r. The 600-token answer ignores the cap, which is exactly what bounds the burst.",
    "tags": [
      "rate-limiting-and-abuse-prevention-case-study",
      "apply",
      "inline"
    ]
  },
  {
    "id": "rate-limiting-and-abuse-prevention-case-study-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Lease overshoot",
    "section": "Worked example: sizing a central limiter",
    "prompt": "To avoid a Redis call per request, each of 60 gateways leases 50 tokens at a time from the central bucket. A customer's limit is 1,000 requests per second. What is the trade-off?",
    "options": [
      "Redis calls fall about 50x, but the customer can overshoot by up to about 3,000 requests",
      "Redis calls fall about 60x, and accuracy stays exact because leases are atomic",
      "Redis calls fall about 50x, but every lease expiry forces a fail-closed window",
      "Redis calls stay the same, but latency drops because leases are cached in the CDN"
    ],
    "answer": 0,
    "explanation": "Each gateway can spend up to 50 tokens it already holds, so worst-case overshoot is 60 x 50 = 3,000 tokens, in exchange for about 50x fewer round trips. The lease is atomic when taken, but spending it locally is exactly what makes the overall limit approximate.",
    "tags": [
      "rate-limiting-and-abuse-prevention-case-study",
      "staff",
      "inline"
    ]
  },
  {
    "id": "rate-limiting-and-abuse-prevention-case-study-c3",
    "type": "mcq",
    "difficulty": "recall",
    "title": "429 versus 503",
    "section": "Client-facing contract",
    "prompt": "The backend is overloaded and you start shedding requests from clients who are all well within their quotas. What response should they receive?",
    "options": [
      "429 Too Many Requests with Retry-After",
      "503 Service Unavailable with Retry-After",
      "429 Too Many Requests with RateLimit-Remaining set to 0",
      "500 Internal Server Error with a JSON error body"
    ],
    "answer": 1,
    "explanation": "429 tells a client it exceeded its own quota; overload shedding is a server-side condition and should be 503 with Retry-After, because the client should behave differently. Using 429 is tempting but misleads clients into thinking they need to lower their own rate or upgrade their plan.",
    "tags": [
      "rate-limiting-and-abuse-prevention-case-study",
      "recall",
      "inline"
    ]
  },
  {
    "id": "rate-limiting-and-abuse-prevention-case-study-n1",
    "topic": "rate-limiting-and-abuse-prevention-case-study",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Sliding Window Counter Memory per 10M Active Keys",
    "scenario": "In a distributed Sliding Window Counter rate limiter (`weighted_count = prev_window_count × overlap_ratio + curr_window_count`), each active key requires only two 4-byte counters (`prev` and `curr`), an 8-byte window timestamp, and a 32-byte key + hash-entry header (`48 bytes` total per active key).",
    "prompt": "How many megabytes (MB, where 1 MB = 10^6 bytes) of Redis RAM are required to track `10,000,000` concurrently active rate-limit keys?",
    "question": "How many megabytes (MB, where 1 MB = 10^6 bytes) of Redis RAM are required to track `10,000,000` concurrently active rate-limit keys?",
    "unit": "MB",
    "answer": 480,
    "tolerance": 0.2,
    "hint": "Multiply 10,000,000 keys by 48 bytes and divide by 10^6.",
    "explanation": "10,000,000 × 48 bytes = 480,000,000 bytes = 480 MB of RAM (whereas a Sliding Window Log storing 500 timestamps per key would require `10M × 500 × 8B = 40 GB`).",
    "tags": [
      "rate-limiting-and-abuse-prevention-case-study",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "rate-limiting-and-abuse-prevention-case-study-t1",
    "topic": "rate-limiting-and-abuse-prevention-case-study",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Redis Read-Then-Write Race vs Atomic Lua Script + Sliding Window Counter",
    "scenario": "Under a burst of 50 concurrent requests from the same API key arriving in the same millisecond, a rate limiter that executes `GET count` in the app, checks `count < limit`, and then calls `INCR count` lets all 50 requests pass a limit of 10.",
    "prompt": "How do you eliminate both the check-then-act race condition and the boundary-burst flaw of fixed windows?",
    "question": "How do you eliminate both the check-then-act race condition and the boundary-burst flaw of fixed windows?",
    "options": [
      "Run `GET` and `INCR` as separate client calls with a 500 ms sleep in between",
      "Use a Fixed Window counter so a user can send `2 × limit` requests across the `:59` and `:00` second boundary",
      "Execute an atomic Redis Lua script (`EVALSHA`) implementing a Token Bucket or Sliding Window Counter (`prev_count × (1 - elapsed/window) + curr_count`) on a consistent-hash shard"
    ],
    "correctOption": 2,
    "reasons": [
      "Separate `GET` and `INCR` calls across 20 app servers are naturally atomic",
      "Boundary doubling at the edge of every minute satisfies strict downstream capacity limits",
      "A Redis Lua script executes single-threaded and atomically inside the shard (zero check-then-act race in 1 RTT), and Sliding Window Counter smooths boundary bursts in O(1) memory"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Why does Redis execute a Lua script without interleaving any other client command?",
    "explanation": "Because Redis is single-threaded per shard, executing the read, sliding-window interpolation, check, and increment inside a single `EVALSHA` Lua script guarantees strict atomicity in one network round-trip.",
    "tags": [
      "rate-limiting-and-abuse-prevention-case-study",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["url-shortener-at-scale"] = [
  {
    "id": "url-shortener-at-scale-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Snowflake code length",
    "section": "Distributed ID Generation: Range-Based & Snowflake",
    "prompt": "A team proposes using Snowflake IDs directly as short codes because they need no coordination. Why does this conflict with a 7-character code goal?",
    "options": [
      "Snowflake IDs repeat after 41 bits of time, so codes collide yearly",
      "Snowflake IDs need ZooKeeper to allocate ranges, adding coordination",
      "Snowflake IDs are 64 bits, which is about 11 Base62 characters",
      "Snowflake IDs include letters, which Base62 cannot encode directly"
    ],
    "answer": 2,
    "explanation": "62^7 is about 3.5 trillion, roughly 42 bits, while a 64-bit ID needs about 11 Base62 characters. Needing ZooKeeper describes range allocation, which is actually the scheme that does keep codes at 7 characters.",
    "tags": [
      "url-shortener-at-scale",
      "recall",
      "inline"
    ]
  },
  {
    "id": "url-shortener-at-scale-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Database reads after cache",
    "section": "Worked example: 100M writes and 1B reads per day",
    "prompt": "Redirects peak at 60,000 per second. The CDN and Redis together absorb 90% of them, and the link table is spread across 64 shards. Roughly what read load reaches each shard at peak?",
    "options": [
      "About 94 reads per second",
      "About 940 reads per second",
      "About 6,000 reads per second",
      "About 840 reads per second"
    ],
    "answer": 0,
    "explanation": "10% of 60,000 is 6,000 database reads per second, and 6,000 / 64 is about 94 per shard, which is trivial. The 6,000 figure is the total across all shards, not per shard.",
    "tags": [
      "url-shortener-at-scale",
      "apply",
      "inline"
    ]
  },
  {
    "id": "url-shortener-at-scale-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Takedown still redirects",
    "section": "Read path with analytics off the critical path",
    "prompt": "Trust and safety disables a malware link by flagging it in the database, yet it keeps redirecting users for another hour. What is the root cause and fix?",
    "options": [
      "Replica lag on the shard; route takedown checks to the primary",
      "Cached entries at the CDN and in Redis; purge both when a link is disabled",
      "Kafka click events replaying the old target; drop the analytics topic",
      "Consistent hashing sent reads to the wrong shard; rebalance the ring"
    ],
    "answer": 1,
    "explanation": "Redirects are served from the CDN and Redis without touching the database, so a DB flag is invisible until those entries expire; disabling must actively purge both. Replica lag lasts seconds, not an hour, and the database is not even on the cached path.",
    "tags": [
      "url-shortener-at-scale",
      "staff",
      "inline"
    ]
  },
  {
    "id": "url-shortener-at-scale-n1",
    "topic": "url-shortener-at-scale",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Base62 7-Character Keyspace Capacity",
    "scenario": "A URL shortener uses a 7-character Base62 (`a-z, A-Z, 0-9`) short code (`62^7 ≈ 3.52 × 10^12` total codes) and generates `100,000,000` (`10^8`) new short links per day (`3.65 × 10^10` links/year).",
    "prompt": "Using `3.5 × 10^12` total codes and `3.5 × 10^10` links per year for clean napkin math, for how many years will the 7-character Base62 namespace last before exhaustion?",
    "question": "Using `3.5 × 10^12` total codes and `3.5 × 10^10` links per year for clean napkin math, for how many years will the 7-character Base62 namespace last before exhaustion?",
    "unit": "years",
    "answer": 100,
    "tolerance": 0.2,
    "hint": "Divide `3.5 × 10^12` total codes by `3.5 × 10^10` codes per year.",
    "explanation": "`3.52 × 10^12 / 3.65 × 10^10 ≈ 96.5` (~100 years) at 100 million new links every single day!",
    "tags": [
      "url-shortener-at-scale",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "url-shortener-at-scale-t1",
    "topic": "url-shortener-at-scale",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: HTTP 301 (Permanent) vs HTTP 302 (Temporary) Redirects & Key Generation Collision Avoidance",
    "scenario": "Your URL shortener must (a) provide real-time click analytics and allow link owners to disable or update destination URLs, and (b) generate 7-character short codes at 5,000 writes/sec with zero database collision retries.",
    "prompt": "Which HTTP status code and key generation strategy should you combine?",
    "question": "Which HTTP status code and key generation strategy should you combine?",
    "options": [
      "Return `301 Moved Permanently` with `Cache-Control: max-age=31536000` and generate keys by picking random 7-char strings and retrying `INSERT` on collision",
      "Return `200 OK` with an HTML `<meta refresh>` page hosted on the primary SQL database",
      "Return `302 Found` (or `307`, with short/controlled edge caching and async click telemetry) and generate short codes by Base62-encoding pre-allocated deterministic range blocks (or Feistel-permuted Snowflake/counter ranges) leased to app servers"
    ],
    "correctOption": 2,
    "reasons": [
      "Browsers permanently cache `301` redirects locally, bypassing your servers on repeat clicks and blinding click analytics and link revocation",
      "Random string collisions decrease as the table fills up",
      "`302` ensures repeat clicks hit your edge PoPs for analytics and takedown enforcement, while bijective Base62 encoding of leased monotonic counter ranges guarantees 0% collisions without a read-before-write DB check"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What does a browser do on the second click if your shortener returned `301 Moved Permanently`?",
    "explanation": "`301` causes browsers to cache the redirect indefinitely, breaking click tracking and link disabling. Range-leased counter -> Feistel permutation -> Base62 encoding yields non-guessable, 100% collision-free 7-char codes.",
    "tags": [
      "url-shortener-at-scale",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["ecommerce-product-listing-system-design"] = [
  {
    "id": "ecommerce-product-listing-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why CDC over dual write",
    "section": "Change Data Capture (CDC) Sync",
    "prompt": "The catalog service currently writes each product change to PostgreSQL and then to Elasticsearch. Why does the lesson prefer streaming changes from the database log instead?",
    "options": [
      "CDC makes the index strongly consistent with the database at all times",
      "CDC removes the need for Kafka between the database and the index",
      "CDC lets the search index accept writes that the database rejected",
      "CDC derives every index update from committed changes, so a failed write cannot leave permanent drift"
    ],
    "answer": 3,
    "explanation": "With app-level dual writes, one side can succeed while the other fails and the two drift forever; CDC reads the committed log, so the index eventually reflects every change. It does not make the index strongly consistent, which is why price and stock are re-checked at checkout.",
    "tags": [
      "ecommerce-product-listing-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "ecommerce-product-listing-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Choosing shard count",
    "section": "Worked example: sizing the index",
    "prompt": "A catalog grows to 80 million SKUs at about 5 KB of indexed JSON each, and you target primary shards of 10 to 50 GB. Which primary shard count is most sensible?",
    "options": [
      "4 primaries of about 100 GB each",
      "16 primaries of about 25 GB each",
      "400 primaries of about 1 GB each",
      "2 primaries of about 200 GB each"
    ],
    "answer": 1,
    "explanation": "80 million x 5 KB is about 400 GB of primary data, and 16 shards puts each at about 25 GB, inside the target band. 400 tiny shards is tempting for parallelism, but many small shards waste heap and slow queries that fan out to every shard.",
    "tags": [
      "ecommerce-product-listing-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "ecommerce-product-listing-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Stock churn in the index",
    "section": "Handling fast-changing inventory",
    "prompt": "Stock updates at 3,000 per second trigger constant reindexing, and category pages reshuffle as items flip in and out of stock. Which approach does the lesson recommend?",
    "options": [
      "Raise refresh_interval to 30 s so stock changes are applied in larger batches",
      "Remove out-of-stock items from the index immediately so results stay accurate",
      "Index a coarse stock bucket, apply exact availability at display time, and rank out-of-stock items lower",
      "Move faceting into PostgreSQL so stock and product details share one transaction"
    ],
    "answer": 2,
    "explanation": "A coarse bucket means most stock changes do not touch the index, the page's 24 SKUs get exact availability from an inventory cache, and demoting rather than removing keeps pages stable. A longer refresh interval cuts indexing cost but makes stock staler while still reshuffling pages.",
    "tags": [
      "ecommerce-product-listing-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "ecommerce-product-listing-system-design-n1",
    "topic": "ecommerce-product-listing-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Flash-Sale Inventory Oversell Prevention Throughput",
    "scenario": "During a flash drop of `1,000` limited-edition sneakers, `250,000` users click \"Buy Now\" within 2 seconds (`125,000 req/s`). An atomic Redis Lua inventory gate (`DECR` if `stock > 0`) filters out the `249,000` excess requests in memory and forwards only the `1,000` winning reservation tokens to the PostgreSQL checkout database (`500 writes/sec` over 2 seconds).",
    "prompt": "What percentage of the `250,000` flash-sale requests (`249,000 / 250,000 × 100%`) are absorbed and rejected at the Redis atomic gate without ever touching PostgreSQL?",
    "question": "What percentage of the `250,000` flash-sale requests (`249,000 / 250,000 × 100%`) are absorbed and rejected at the Redis atomic gate without ever touching PostgreSQL?",
    "unit": "%",
    "answer": 99.6,
    "tolerance": 0.2,
    "hint": "Divide 249,000 rejected requests by 250,000 total requests (`0.996 = 99.6%`).",
    "explanation": "`249,000 / 250,000 = 99.6%` of the traffic spike is shed in <0.2 ms at the Redis Lua gate, reducing PostgreSQL load from a crushing 125,000 tx/s down to just 500 tx/s.",
    "tags": [
      "ecommerce-product-listing-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "ecommerce-product-listing-system-design-t1",
    "topic": "ecommerce-product-listing-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Deducting Stock at \"Add to Cart\" vs \"Checkout Initiation TTL Reservation\" vs \"After Payment\"",
    "scenario": "In an e-commerce store, 70% of shoppers who click \"Add to Cart\" never complete checkout, and external credit-card payment authorization takes 2–5 seconds.",
    "prompt": "When and how should inventory be reserved so you neither oversell nor lock up stock in abandoned carts?",
    "question": "When and how should inventory be reserved so you neither oversell nor lock up stock in abandoned carts?",
    "options": [
      "Deduct inventory permanently on \"Add to Cart\" so bots can lock up 100% of store inventory without paying",
      "Only check and deduct inventory after charging the customer's credit card, then issue refunds when stock is gone",
      "Keep \"Add to Cart\" non-blocking, atomically reserve stock with a strict 10-minute TTL hold (`available -> reserved`) when the user enters Checkout/Payment, commit `reserved -> sold` on payment webhook/confirmation, and auto-release expired holds via a reaper"
    ],
    "correctOption": 2,
    "reasons": [
      "Letting unauthenticated carts lock inventory prevents denial-of-inventory attacks",
      "Charging credit cards for out-of-stock items saves payment gateway fees",
      "A two-phase TTL reservation at checkout initiation guarantees no customer is charged for an out-of-stock item, avoids holding DB locks during 3-second Stripe calls, and reclaims abandoned checkout holds after 10 minutes"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens if you reserve too early (Add to Cart) vs too late (after charging the card)?",
    "explanation": "Reserving at checkout initiation with a bounded TTL (`reserved_until = NOW() + 10m`) prevents both cart-hoarding DoS and post-payment oversells.",
    "tags": [
      "ecommerce-product-listing-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["collaborative-editing-system-design"] = [
  {
    "id": "collaborative-editing-system-design-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Transforming an insert",
    "section": "Worked example: one OT transform",
    "prompt": "The document is abcd. Concurrently, Alice inserts x at index 3 (giving abcxd) and Bob deletes index 1 (giving acd). The server applies Bob's delete first. What must Alice's operation become?",
    "options": [
      "insert(x, 3), giving acdx",
      "insert(x, 0), giving xacd",
      "insert(x, 1), giving axcd",
      "insert(x, 2), giving acxd"
    ],
    "answer": 3,
    "explanation": "Bob removed a character before Alice's position, so her index shifts down by one to 2, producing acxd on the server; Alice applies Bob's delete to abcxd and also reaches acxd. Leaving it at 3 is the untransformed mistake and puts x after d.",
    "tags": [
      "collaborative-editing-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "collaborative-editing-system-design-c2",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What CRDTs do not remove",
    "section": "CRDTs (Conflict-free Replicated Data Types)",
    "prompt": "A team switching from OT to Yjs plans to delete their collaboration servers entirely. Which job still needs server-side coordination?",
    "options": [
      "Choosing a single global order for every character insertion",
      "Authentication, persistence, fan-out and history garbage collection",
      "Transforming concurrent operations against each other's indices",
      "Resolving conflicts by picking the last writer's whole document"
    ],
    "answer": 1,
    "explanation": "A CRDT removes the need for a central component that orders edits, but access control, durable storage, broadcasting and compaction still need infrastructure. Global ordering and index transforms are precisely what the CRDT makes unnecessary.",
    "tags": [
      "collaborative-editing-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "collaborative-editing-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Hot document fan-out",
    "section": "Service architecture and numbers",
    "prompt": "A document has 200 concurrent editors each sending about 5 operations per second, so the session server faces about 200,000 outbound messages per second. What is the best first lever?",
    "options": [
      "Batch outgoing operations every 30 to 50 ms and throttle ephemeral cursor updates",
      "Split the document across several session servers by paragraph range",
      "Persist cursor positions in the op log so clients can fetch them lazily",
      "Remove the session server and let clients broadcast peer to peer"
    ],
    "answer": 0,
    "explanation": "Batching collapses many ops into one message per client per window, and cursors are ephemeral traffic that should be throttled and never stored. Splitting the document across servers breaks the single-process ordering that sticky routing by doc_id exists to provide.",
    "tags": [
      "collaborative-editing-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "collaborative-editing-system-design-n1",
    "topic": "collaborative-editing-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Collaborative Document Keystroke Fan-Out Rate",
    "scenario": "50 editors are simultaneously typing in the same shared document room. Each editor emits 4 keystroke/cursor operations per second (after 250 ms micro-batching), and the room coordinator broadcasts every operation to the other 49 connected editors (`50 × 4 × 49 ≈ 50 × 4 × 50`).",
    "prompt": "Approximating `50 senders × 4 ops/s × 50 recipients`, how many outbound operation messages per second does the document room coordinator fan out?",
    "question": "Approximating `50 senders × 4 ops/s × 50 recipients`, how many outbound operation messages per second does the document room coordinator fan out?",
    "unit": "msg/s",
    "answer": 10000,
    "tolerance": 0.25,
    "hint": "50 editors × 4 ops/sec = 200 inbound ops/sec. Multiply by ~50 recipients (or 49 exact = 9,800).",
    "explanation": "With `N = 50` active editors each sending 4 ops/sec, inbound traffic is 200 ops/sec, and outbound broadcast scales quadratically (`O(N^2)`): `200 × 49 = 9,800 msg/s` (~10,000 msg/s)—which is why active editors per document are capped (e.g., ~100 writers + read-only viewers).",
    "tags": [
      "collaborative-editing-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "collaborative-editing-system-design-t1",
    "topic": "collaborative-editing-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Operational Transformation (OT) vs Conflict-Free Replicated Data Types (CRDTs)",
    "scenario": "You are designing a local-first collaborative note-taking app where users frequently edit documents offline on airplanes for hours, sync with peers over P2P or edge relays, and merge without a single central ordering server.",
    "prompt": "Should you choose central-server Operational Transformation (OT) or a sequence CRDT (like Yjs / Automerge RGA), and why?",
    "question": "Should you choose central-server Operational Transformation (OT) or a sequence CRDT (like Yjs / Automerge RGA), and why?",
    "options": [
      "Use classic Google Docs single-server OT because it requires no central sequencing server to merge multi-hour offline branches",
      "Use a sequence CRDT (with run-length encoded Lamport/actor IDs and periodic snapshot compaction), because CRDT operations commute idempotently across arbitrary offline/decentralized merge orders, trading off tombstone metadata overhead",
      "Use `Last-Write-Wins` on the entire document blob so the second user to come online overwrites the first user's 3-hour flight edits"
    ],
    "correctOption": 1,
    "reasons": [
      "Classic OT transformation functions (`TP1/TP2`) easily scale to decentralized multi-peer offline merges without a central sequencer",
      "Sequence CRDTs assign immutable unique IDs to character/block insertions so concurrent offline edits converge deterministically without a central ordering authority, at the cost of tombstone metadata that must be compacted",
      "Overwriting 3 hours of offline edits on reconnect delights collaborative users"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Why did Figma and Notion/Linear/Yjs adopt CRDT-style structures when offline and decentralized sync mattered?",
    "explanation": "Classic OT (like Jupiter/Google Wave) relies on a single authoritative server to assign a total order of state revisions (`TP1`). When clients work offline for hours or sync across edge nodes, sequence CRDTs (like Yjs) guarantee strong eventual convergence without central coordination.",
    "tags": [
      "collaborative-editing-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["object-store-system-design"] = [
  {
    "id": "object-store-system-design-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Failure-domain placement",
    "section": "Durability via Erasure Coding vs. 3x Replication",
    "prompt": "An RS 8+4 object has its 12 chunks placed on only 6 racks, two chunks per rack. How many simultaneous whole-rack failures is it guaranteed to survive?",
    "options": [
      "Four, since the code tolerates any 4 lost chunks",
      "Three, since six racks minus three still hold enough data",
      "Two, since two racks hold four chunks",
      "One, since each rack holds more than one chunk"
    ],
    "answer": 2,
    "explanation": "Losing a rack loses two chunks, so two racks cost four chunks, the most the code can lose; a third rack takes the loss to six. Any 4 failures is only true for racks when each of the 12 chunks sits in its own failure domain.",
    "tags": [
      "object-store-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "object-store-system-design-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Hidden cost of erasure coding",
    "section": "Worked example: 3x replication vs RS(8,4)",
    "prompt": "You move 10 PB of warm data from 3x replication to RS 8+4, saving 15 PB of raw disk. Which cost rises sharply and needs capacity planning?",
    "options": [
      "Metadata size, because each object now maps to 12 chunk locations",
      "Write amplification, because parity doubles the bytes written per object",
      "Durability risk, because erasure coding tolerates fewer failures than replicas",
      "Repair traffic, because rebuilding a lost 20 TB drive reads about 160 TB"
    ],
    "answer": 3,
    "explanation": "Each lost chunk is rebuilt from 8 surviving chunks, so repairing one drive reads about eight times its size, and slow repair lengthens the window for further failures. Parity adds 50% to writes, not double, and RS 8+4 tolerates more lost chunks (4) than 3x replication (2).",
    "tags": [
      "object-store-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "object-store-system-design-c3",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Crash before commit",
    "section": "Write path",
    "prompt": "A front end streams all 12 chunks of a new object version and gets checksums back, then crashes before the metadata commit. What does a reader of that key see?",
    "options": [
      "The previous version, and the new chunks become orphans for GC",
      "The new version, because the chunks are already durable",
      "A partial object assembled from whichever chunks it can find",
      "An error until an operator reconciles the chunks with metadata"
    ],
    "answer": 0,
    "explanation": "An object becomes visible only when the metadata commit maps the key to its chunks, which is how read-after-write consistency is achieved; unreferenced chunks are cleaned up later. Durable chunks alone are not enough, because no metadata points to them.",
    "tags": [
      "object-store-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "object-store-system-design-n1",
    "topic": "object-store-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Multipart Upload Parallel Throughput & Retry Granularity",
    "scenario": "A client uploads a `5 GB` (`5,000 MB`) video over a high-bandwidth link where a single TCP stream is capped at `25 MB/s` (`200 seconds` for a monolithic upload, where a network drop at 99% requires re-uploading all 5 GB). Splitting into `100` parts of `50 MB` and uploading `10` parts in parallel achieves `250 MB/s` aggregate throughput.",
    "prompt": "How many seconds (`5,000 MB / 250 MB/s`) does the 10-way parallel multipart upload take?",
    "question": "How many seconds (`5,000 MB / 250 MB/s`) does the 10-way parallel multipart upload take?",
    "unit": "seconds",
    "answer": 20,
    "tolerance": 0.2,
    "hint": "Divide 5,000 MB by 250 MB/s (`10 streams × 25 MB/s`).",
    "explanation": "5,000 MB / 250 MB/s = 20 seconds (10× faster than a single stream), and if a transient socket reset occurs, only a single 50 MB part is retried instead of 5 GB!",
    "tags": [
      "object-store-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "object-store-system-design-t1",
    "topic": "object-store-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Routing Data Streams Through API Metadata Gateways vs Pre-Signed Direct-to-Storage Node /Multipart Assembly",
    "scenario": "You are designing an S3-like object store handling `2 Tbps` (`250 GB/s`) of aggregate read/write payload bandwidth and `500,000 req/s` of metadata operations.",
    "prompt": "How should the Control/Metadata Plane and the Data Stream Plane be separated during `CompleteMultipartUpload`?",
    "question": "How should the Control/Metadata Plane and the Data Stream Plane be separated during `CompleteMultipartUpload`?",
    "options": [
      "Physically concatenate all 100 part files (`5 GB`) byte-by-byte into a new file during the synchronous `CompleteMultipartUpload` HTTP call",
      "Buffer all 100 uploaded parts in the stateless API gateway's heap memory before writing to disk",
      "Stream each `UploadPart` directly to erasure-coded extent storage nodes (returning each part's `ETag`/extent pointer), and make `CompleteMultipartUpload` a pure metadata operation that commits an ordered manifest list of those existing extent pointers"
    ],
    "correctOption": 2,
    "reasons": [
      "Copying 5 GB of disk bytes synchronously makes `CompleteMultipartUpload` finish in 2 ms",
      "Stateless API gateways have infinite RAM for multi-gigabyte uploads",
      "Storing objects as a metadata manifest of ordered immutable extent pointers allows `CompleteMultipartUpload` to finish in milliseconds without copying a single payload byte"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "When you call `CompleteMultipartUpload` on a 50 GB object in S3, does S3 copy 50 GB on disk, or does it commit a pointer list?",
    "explanation": "In an object store, large objects are represented in the metadata DB as an ordered list of immutable extent descriptors `(part_num, extent_id, offset, length, crc32c)`. Completing a multipart upload simply commits that manifest row atomically.",
    "tags": [
      "object-store-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["partitioned-log-system-design"] = [
  {
    "id": "partitioned-log-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Replaying for a new team",
    "section": "Offset-Based Consumer State",
    "prompt": "Billing has already consumed the last three days of order events from a Kafka topic with 7-day retention. A new analytics team wants those same three days. What do they do?",
    "options": [
      "Ask billing to re-publish the events to a new topic for analytics",
      "Start a new consumer group and reset its offsets to three days ago",
      "Join billing's consumer group so that the partitions are shared",
      "Restore the events from a backup, because acknowledged messages are gone"
    ],
    "answer": 1,
    "explanation": "Messages stay in the log for the retention period, and each consumer group keeps its own offsets, so a new group can start anywhere inside retention. Joining billing's group would split partitions between the two teams instead of giving each a full copy.",
    "tags": [
      "partitioned-log-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "partitioned-log-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Partition count sizing",
    "section": "Worked example: sizing a cluster",
    "prompt": "A topic ingests 200,000 messages per second at 2 KB each. One consumer instance can process about 8 MB/s. What partition count should you create?",
    "options": [
      "25 partitions, matching 200 MB/s divided by 8 MB/s",
      "400 partitions, one per 500 messages per second",
      "50 partitions, exactly the minimum needed to keep up",
      "64 or more partitions, leaving headroom above the minimum of 50"
    ],
    "answer": 3,
    "explanation": "Ingest is 400 MB/s, so at least 50 consumers and therefore 50 partitions are needed; choose more because adding partitions later changes the key-to-partition mapping. Exactly 50 has no headroom for growth or slow consumers.",
    "tags": [
      "partitioned-log-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "partitioned-log-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Duplicate charges",
    "section": "Delivery semantics",
    "prompt": "A consumer charges a card, then commits its offset. After a crash between the two steps, the customer is charged twice. The team proposes enabling Kafka exactly_once_v2. Does that fix it?",
    "options": [
      "No; the charge is outside Kafka, so it needs an idempotency key",
      "Yes, because idempotent producers prevent the message being read twice",
      "Yes, because transactions make the charge and the offset commit atomic",
      "No; the fix is committing the offset before charging the card"
    ],
    "answer": 0,
    "explanation": "Kafka's exactly-once covers writes to Kafka and offset commits, not external side effects, so the payment call must carry an idempotency key. Committing first switches to at-most-once, which avoids the duplicate by risking a lost charge.",
    "tags": [
      "partitioned-log-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "partitioned-log-system-design-n1",
    "topic": "partitioned-log-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Kafka Broker Disk Capacity With 7-Day Retention & RF=3",
    "scenario": "A partitioned log cluster ingests 200 MB/s of compressed events (`200 MB/s × 86,400 s/day ≈ 17.28 TB/day`, or using 100,000 s/day napkin math = 20 TB/day). Events are retained for 5 days with a Replication Factor of `RF = 3`.",
    "prompt": "Using the napkin figure of 20 TB/day of logical ingress, how many terabytes (TB) of raw broker disk storage are required for 5 days of retention at `RF = 3`?",
    "question": "Using the napkin figure of 20 TB/day of logical ingress, how many terabytes (TB) of raw broker disk storage are required for 5 days of retention at `RF = 3`?",
    "unit": "TB",
    "answer": 300,
    "tolerance": 0.25,
    "hint": "20 TB/day × 5 days × 3 replicas = 300 TB (or ~259 TB using exact 86,400 s/day).",
    "explanation": "At ~20 TB/day (17.28 TB/day exact), 5 days of logical data is 86.4–100 TB. Multiplying by `RF = 3` requires 259–300 TB of physical broker disk capacity before headroom.",
    "tags": [
      "partitioned-log-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "partitioned-log-system-design-t1",
    "topic": "partitioned-log-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Zero-Copy `sendfile` + OS Page Cache vs Application-Heap Buffering",
    "scenario": "Your partitioned log broker must serve 1 primary real-time consumer group (reading the tail within 10 ms of write) and 1 backfill consumer group (reading 3-day-old segments) at 2 GB/s per broker without JVM GC stalls.",
    "prompt": "How should the broker manage segment caching and network socket writes, and what happens when a backfill consumer scans cold disk?",
    "question": "How should the broker manage segment caching and network socket writes, and what happens when a backfill consumer scans cold disk?",
    "options": [
      "Cache all log messages as deserialized Java objects inside a 128 GB JVM heap",
      "Write binary batches directly to append-only segment files backed by the OS page cache and stream to consumers via `sendfile()` zero-copy DMA (and use tiered object storage / `fadvise(DONTNEED)` for cold backfills so historical scans don't evict the hot tail from page cache)",
      "Call `fsync()` synchronously on every single 100-byte message before writing to the OS page cache"
    ],
    "correctOption": 1,
    "reasons": [
      "Storing 100 GB of small objects in JVM heap eliminates garbage collection pauses",
      "OS page cache + `sendfile()` DMA transfers bytes from page cache to NIC buffer without copying into user space or touching JVM heap, while isolating cold backfill reads prevents page-cache thrashing",
      "Single-message unbatched `fsync()` maximizes NVMe sequential write throughput"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Why does Kafka rely on the Linux page cache + `sendfile()` syscall, and how can a cold backfill ruin tail latency?",
    "explanation": "`sendfile()` streams bytes directly from the kernel page cache to the NIC via DMA without user-space copies or JVM heap allocation. However, a cold historical backfill can thrash the OS page cache and evict the hot tail unless cold segments are served from tiered storage or isolated via `POSIX_FADV_DONTNEED` / direct I/O.",
    "tags": [
      "partitioned-log-system-design",
      "tradeoff",
      "staff"
    ]
  }
];
