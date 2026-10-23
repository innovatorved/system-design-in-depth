window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["relational-database-design"] = [
  {
    "id": "relational-database-design-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Forgotten join condition",
    "section": "Relational Algebra: The Formal Foundation",
    "prompt": "A report joins orders (20,000 rows) and customers (5,000 rows), but the ON clause was dropped during a refactor and nothing filters the result. How many rows does the query produce?",
    "options": [
      "100,000,000 rows, one for every pairing of an order with a customer",
      "20,000 rows, because each order still matches only its own customer",
      "25,000 rows, the two tables' rows appended one after the other",
      "5,000 rows, because the result shrinks to the size of the smaller table"
    ],
    "answer": 0,
    "explanation": "Without a join predicate, the join becomes a Cartesian product with 20,000 times 5,000 rows, which the lesson calls almost always a bug that can exhaust memory. Expecting 20,000 rows is the tempting assumption, but nothing tells the database which customer belongs to which order.",
    "tags": [
      "relational-database-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "relational-database-design-c2",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Spotting a 3NF violation",
    "section": "Normalization vs. Selective Denormalization",
    "prompt": "A table orders(order_id PRIMARY KEY, customer_id, customer_email, total_amount) stores the customer's current email on every order. Which normal form does it break, and why?",
    "options": [
      "1NF, because customer_email is not an atomic value",
      "2NF, because customer_email depends on only part of the key",
      "3NF, because customer_email depends on customer_id, a non-key column",
      "None, because every column holds one value for each order_id"
    ],
    "answer": 2,
    "explanation": "customer_email is determined by customer_id rather than by the order key, which is a transitive dependency and breaks 3NF: changing an email means updating every order. 2NF is the tempting choice, but partial dependencies only arise with composite keys, and order_id is a single column.",
    "tags": [
      "relational-database-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "relational-database-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Unindexed foreign key",
    "section": "Failure Modes and Edge Cases",
    "prompt": "order_items.order_id has a foreign key to orders.id, but no index. A nightly job deletes 50,000 old orders. What is likely to hurt first?",
    "options": [
      "Inserts into order_items, since the constraint now checks the parent row on every insert",
      "The orders primary key index, which bloats because the foreign key column is not indexed",
      "Nothing much, since foreign key checks always go through the parent's primary key index",
      "Each parent delete scans order_items for children, making the job slow and holding locks longer"
    ],
    "answer": 3,
    "explanation": "To enforce the constraint on a parent delete, the database must find child rows, and without an index on order_id that means a sequential scan of order_items for every deleted order. The \"primary key index\" option is tempting, but that index only speeds up checks from child to parent, such as on inserts, not the reverse lookup a delete needs.",
    "tags": [
      "relational-database-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "relational-database-design-n1",
    "topic": "relational-database-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Normalization Storage Savings",
    "scenario": "An unnormalized orders table stores a 120-byte merchant company profile inline on every row across 500,000,000 order rows for 50,000 distinct merchants. Normalizing moves the profile to a merchants table referenced by an 8-byte merchant_id foreign key (already present).",
    "prompt": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of raw table storage are saved by removing the inline 120-byte merchant profile from the 500M order rows?",
    "question": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of raw table storage are saved by removing the inline 120-byte merchant profile from the 500M order rows?",
    "unit": "GB",
    "answer": 60,
    "tolerance": 0.2,
    "hint": "Multiply 500,000,000 rows by 120 bytes saved per row (the 50k merchant rows take only 6 MB, which is negligible).",
    "explanation": "500,000,000 × 120 bytes = 60,000,000,000 bytes = 60 GB saved on the orders table, while the normalized merchants table adds only 50,000 × 120 B = 6 MB.",
    "tags": [
      "relational-database-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "relational-database-design-t1",
    "topic": "relational-database-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Normalized Reference vs Snapshot Denormalization",
    "scenario": "An e-commerce invoicing table needs to display the customer billing address on historical tax receipts even if the customer updates their profile address later.",
    "prompt": "Which relational modeling pattern should you choose for the billing address on invoices, and why?",
    "question": "Which relational modeling pattern should you choose for the billing address on invoices, and why?",
    "options": [
      "Store only a foreign key to the mutable customer_addresses row",
      "Forbid customers from ever updating their address row in-place",
      "Copy immutable point-in-time address attributes (or reference an immutable address version row) onto the invoice record at checkout"
    ],
    "correctOption": 2,
    "reasons": [
      "Third Normal Form requires that historical invoices dynamically change when a user moves",
      "Blocking profile updates simplifies SQL joins without schema changes",
      "Historical financial records must preserve the exact legal state at transaction time rather than reflecting future profile edits"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Ask whether an invoice is a live view of current customer state or an immutable historical fact.",
    "explanation": "Normalizing live mutable state across historical ledger/invoice records corrupts audit history when profiles change. Capturing an immutable snapshot (or versioned immutable FK) preserves point-in-time truth.",
    "tags": [
      "relational-database-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["sql-backed-key-value-store"] = [
  {
    "id": "sql-backed-key-value-store-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "CAS affected zero rows",
    "section": "Atomic Mutations: Compare-and-Swap (CAS)",
    "prompt": "A client read feature_flags at version 4, then ran UPDATE kv_store SET value = ..., version = version + 1 WHERE key = 'feature_flags' AND version = 4. It reports 0 rows updated. What does that mean?",
    "options": [
      "The key has expired, so the sweeper must run before any update can succeed",
      "Another writer changed the row after the read; re-read the new version and retry",
      "The row lock timed out, so resending the same statement should now succeed",
      "The update succeeded, but PostgreSQL only counts rows once the transaction commits"
    ],
    "answer": 1,
    "explanation": "The version predicate makes the update conditional. Zero rows means the version is no longer 4 because someone else won the race, so the client should re-read and try again. Resending the same statement is the tempting mistake: it will keep failing, and replacing it with a blind update would bring back the lost update.",
    "tags": [
      "sql-backed-key-value-store",
      "recall",
      "inline"
    ]
  },
  {
    "id": "sql-backed-key-value-store-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Sweeper is not correctness",
    "section": "Background Expiration Sweeper",
    "prompt": "Session reads use only WHERE key = ?, and a reaper deletes expired rows every five minutes in batches of 1,000. During a traffic spike, the reaper falls an hour behind. What do users see?",
    "options": [
      "Nothing, because the partial index on expires_at already hides expired rows",
      "Expired sessions keep working until reaped; reads must filter on expires_at themselves",
      "Only a larger table, since expiry is enforced when a value is written, not when it is read",
      "Reads fail with an error, since PostgreSQL rejects lookups of rows past their expires_at"
    ],
    "answer": 1,
    "explanation": "The sweeper exists to reclaim space, not to enforce expiry, so an expired row stays readable until it is deleted unless every read also requires expires_at to be null or later than now(). The partial index is tempting, but indexes change how rows are found, not which rows a query returns.",
    "tags": [
      "sql-backed-key-value-store",
      "staff",
      "inline"
    ]
  },
  {
    "id": "sql-backed-key-value-store-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Sizing the heap",
    "section": "Worked example: sizing a Postgres-backed config and session store",
    "prompt": "Using the lesson's numbers (about 500 bytes per row and about 14 rows per 8 KB page at fillfactor 90), roughly how large is the heap for 30 million session keys?",
    "options": [
      "About 1.7 GB",
      "About 15 GB",
      "About 17 GB",
      "About 170 GB"
    ],
    "answer": 2,
    "explanation": "30 million rows divided by 14 per page is about 2.1 million pages, and at 8 KB each that is roughly 17 GB. 15 GB is the tempting answer from multiplying 30 million by 500 bytes, but that ignores the free space fillfactor leaves on each page and the space lost at page boundaries.",
    "tags": [
      "sql-backed-key-value-store",
      "apply",
      "inline"
    ]
  },
  {
    "id": "sql-backed-key-value-store-n1",
    "topic": "sql-backed-key-value-store",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Buffer Pool Hit Ratio & IOPS",
    "scenario": "A SQL-backed KV table serves 40,000 point lookups/sec. Each lookup touches 1 leaf page after cached internal B-Tree pages, and the InnoDB buffer pool achieves a 95% leaf-page hit ratio.",
    "prompt": "How many physical disk read IOPS are required to serve the remaining 5% buffer pool misses?",
    "question": "How many physical disk read IOPS are required to serve the remaining 5% buffer pool misses?",
    "unit": "IOPS",
    "answer": 2000,
    "tolerance": 0.2,
    "hint": "Multiply 40,000 lookups/sec by the 5% (0.05) miss rate.",
    "explanation": "At a 95% buffer pool hit rate, 5% of 40,000 req/s miss in memory and issue a random page read: 40,000 × 0.05 = 2,000 disk read IOPS.",
    "tags": [
      "sql-backed-key-value-store",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "sql-backed-key-value-store-t1",
    "topic": "sql-backed-key-value-store",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Secondary Indexes on a SQL KV Table",
    "scenario": "You run a high-write SQL-backed key-value store (primary key `k`, binary payload `v`, `updated_at`) handling 25,000 upserts/sec. A team asks to add 4 secondary indexes on JSON fields inside `v`.",
    "prompt": "How should you handle this request to protect write throughput, and why?",
    "question": "How should you handle this request to protect write throughput, and why?",
    "options": [
      "Add all 4 synchronous B-Tree expression indexes directly on the primary KV table",
      "Switch the primary key from B-Tree to an unindexed heap table",
      "Keep the primary KV table index-minimal and project secondary query views asynchronously via CDC or a dedicated search/index table"
    ],
    "correctOption": 2,
    "reasons": [
      "Secondary B-Tree indexes are free on update when only payload bytes change",
      "Heap scans are faster than primary key lookups at 25,000 QPS",
      "Each synchronous secondary B-Tree index adds random leaf-page read-modify-write amplification and lock contention on every upsert"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Consider write amplification in B-Trees when secondary keys are randomly distributed.",
    "explanation": "A SQL KV store stays fast only while writes hit the clustered primary key + WAL. Adding 4 random secondary B-Tree indexes multiplies dirty-page flushes and random I/O per upsert.",
    "tags": [
      "sql-backed-key-value-store",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["database-indexing"] = [
  {
    "id": "database-indexing-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Leftmost prefix rule",
    "section": "Index Mechanics & Cardinality Rules",
    "prompt": "Given an index on (tenant_id, status, created_at), which WHERE clause can use it for an efficient seek?",
    "options": [
      "WHERE tenant_id = ? AND status = ?",
      "WHERE status = ? AND created_at after ?",
      "WHERE created_at between ? and ?",
      "WHERE status = ?"
    ],
    "answer": 0,
    "explanation": "The B-tree is sorted by tenant_id first, so only predicates that include the leading column can seek to a contiguous slice. Filtering on status plus created_at is the tempting choice because it covers two of the indexed columns, but without tenant_id the planner can at best scan the whole index or, on some engines, use a skip scan.",
    "tags": [
      "database-indexing",
      "recall",
      "inline"
    ]
  },
  {
    "id": "database-indexing-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Ordering a composite index",
    "section": "Worked example: what an index actually saves",
    "prompt": "A hot query is WHERE tenant_id = ? AND status = ? AND created_at after ? ORDER BY created_at. Which single index lets it seek to one slice and read rows in order with no sort step?",
    "options": [
      "(created_at, tenant_id, status)",
      "(tenant_id, created_at, status)",
      "(status, created_at, tenant_id)",
      "(tenant_id, status, created_at)"
    ],
    "answer": 3,
    "explanation": "Equality columns go first and the range and sort column goes last, so all matching rows sit together already ordered by created_at. Putting created_at second, as in the tempting (tenant_id, created_at, status), means the status filter must be checked row by row across the tenant's whole time range.",
    "tags": [
      "database-indexing",
      "apply",
      "inline"
    ]
  },
  {
    "id": "database-indexing-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Index-only scan that is not",
    "section": "Worked example: what an index actually saves",
    "prompt": "EXPLAIN ANALYZE shows an Index Only Scan on a covering index, but Heap Fetches is nearly equal to the number of rows returned. The table is updated heavily. What is the most likely cause?",
    "options": [
      "The INCLUDE columns were stored out of order, so the planner must read the heap for them",
      "Many pages are not marked all-visible in the visibility map, so vacuum is falling behind",
      "Index-only scans always read the heap for rows changed within the last hour",
      "The index is too large for shared buffers, so PostgreSQL falls back to heap reads"
    ],
    "answer": 1,
    "explanation": "PostgreSQL can skip the heap only for pages the visibility map marks all-visible, and vacuum is what sets those bits, so heavy updates without enough vacuuming force heap fetches. The buffer-size option is tempting, but cache misses make reads slower; they do not turn index-only scans into heap fetches.",
    "tags": [
      "database-indexing",
      "staff",
      "inline"
    ]
  },
  {
    "id": "database-indexing-n1",
    "topic": "database-indexing",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: B+Tree Index Memory Footprint",
    "scenario": "A PostgreSQL table has 500 million rows. You add a secondary B+Tree index on an 8-byte `BIGINT` column. Including tuple pointer (`ctid`), page header, and fill-factor overhead, each index entry consumes 32 bytes.",
    "prompt": "How much RAM (in GB, using 1 GB = 10^9 bytes) is required to keep this entire secondary index resident in the buffer pool?",
    "question": "How much RAM (in GB, using 1 GB = 10^9 bytes) is required to keep this entire secondary index resident in the buffer pool?",
    "unit": "GB",
    "answer": 16,
    "tolerance": 0.25,
    "hint": "Multiply 500,000,000 rows × 32 bytes/entry and divide by 10^9 bytes/GB.",
    "explanation": "500,000,000 entries × 32 bytes = 16,000,000,000 bytes = 16 GB. Every additional secondary index both consumes gigabytes of buffer pool RAM and adds a random page read/write on every non-HOT row update.",
    "tags": [
      "database-indexing",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "database-indexing-t1",
    "topic": "database-indexing",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Composite Index Column Ordering & Write Amplification",
    "scenario": "An orders table receives 8,000 inserts/sec and serves a hot query: `SELECT id, total FROM orders WHERE tenant_id = $1 AND status = 'PENDING' ORDER BY created_at DESC LIMIT 50`. Currently, 98% of rows have `status = 'COMPLETED'`.",
    "prompt": "Which indexing strategy best balances read latency, sort elimination, and buffer pool footprint, and why?",
    "question": "Which indexing strategy best balances read latency, sort elimination, and buffer pool footprint, and why?",
    "options": [
      "Create three separate single-column indexes on `(tenant_id)`, `(status)`, and `(created_at)`",
      "Create a partial covering index on `(tenant_id, created_at DESC) INCLUDE (total) WHERE status = 'PENDING'`",
      "Create a full composite index on `(created_at DESC, status, tenant_id)` across all rows"
    ],
    "correctOption": 1,
    "reasons": [
      "PostgreSQL merges three single-column indexes with zero CPU or heap fetches",
      "Filtering on `status = 'PENDING'` shrinks the index by 98%, `(tenant_id, created_at DESC)` satisfies equality + sort order, and `INCLUDE (total)` enables an index-only scan",
      "Leading with `created_at` lets the engine jump directly to a specific `tenant_id` without scanning"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Consider both the 98% completed rows and the equality-then-range/sort rule for B+Trees.",
    "explanation": "A partial index (`WHERE status = 'PENDING'`) excludes 98% of historical rows, keeping the index tiny in RAM. Ordering keys as `(tenant_id, created_at DESC)` matches the equality predicate followed by the `ORDER BY`, and `INCLUDE (total)` avoids heap page fetches.",
    "tags": [
      "database-indexing",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["b-tree"] = [
  {
    "id": "b-tree-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Range scan mechanics",
    "section": "B+ Tree Structural Invariants",
    "prompt": "How does a B+ tree answer WHERE age BETWEEN 25 AND 35?",
    "options": [
      "It descends from the root separately for each matching key in the range",
      "It scans every leaf page from the left edge until the range is passed",
      "It descends once to the first matching leaf, then follows the linked leaves",
      "It reads the matching values out of the internal nodes, skipping the leaves"
    ],
    "answer": 2,
    "explanation": "A B+ tree finds the first leaf in O(log N) and then walks the doubly linked leaf pages with no further tree traversals. Reading values from internal nodes is the tempting choice, but in a B+ tree the internal nodes hold only separator keys and child pointers, and all entries live in the leaves.",
    "tags": [
      "b-tree",
      "recall",
      "inline"
    ]
  },
  {
    "id": "b-tree-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "How many levels for a billion",
    "section": "Worked example: how tall is the tree?",
    "prompt": "A BIGINT index has a fanout of about 400 entries per 8 KB page. How many levels does it need for 1 billion rows?",
    "options": [
      "3 levels",
      "5 levels",
      "7 levels",
      "4 levels"
    ],
    "answer": 3,
    "explanation": "Three levels cover 400 cubed, or 64 million entries, which is too few, while four levels cover 400 to the fourth power, about 25.6 billion. Seven levels is what you might guess by thinking of a binary tree; high fanout is exactly why B+ trees stay only 3 or 4 levels deep.",
    "tags": [
      "b-tree",
      "apply",
      "inline"
    ]
  },
  {
    "id": "b-tree-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Random keys and the cache",
    "section": "Worked example: how tall is the tree?",
    "prompt": "A write-heavy table switches its primary key from BIGSERIAL to UUIDv4. The index grows to 20 GB, but only 4 GB of cache is available. What degrades?",
    "options": [
      "Inserts hit random leaves, so most miss the cache, and 50/50 splits leave pages about 70% full",
      "The tree grows several levels taller, because random keys unbalance the B+ tree",
      "Nothing measurable, because a B+ tree's insert cost is O(log N) whatever the key order",
      "Only range scans slow down, while point inserts stay fast since they touch one leaf"
    ],
    "answer": 0,
    "explanation": "Sequential keys keep the working set at the right edge of the tree, while random keys spread inserts across the whole index, causing cache misses, random reads and half-full pages after splits. A taller tree is the tempting guess, but a B+ tree stays balanced, and depth is almost never the problem; cache misses on leaves are.",
    "tags": [
      "b-tree",
      "staff",
      "inline"
    ]
  },
  {
    "id": "b-tree-n1",
    "topic": "b-tree",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: B+Tree Fanout and Page Capacity",
    "scenario": "A B+Tree uses 16 KB (16,384-byte) internal pages. Each child entry consists of an 8-byte key and an 8-byte page pointer (16 bytes total), and page headers reserve 384 bytes.",
    "prompt": "What is the maximum branching factor (fanout) of a single internal B+Tree page?",
    "question": "What is the maximum branching factor (fanout) of a single internal B+Tree page?",
    "unit": "children",
    "answer": 1000,
    "tolerance": 0.2,
    "hint": "Subtract the 384-byte header from 16,384 bytes, then divide by 16 bytes per entry.",
    "explanation": "Usable space per internal page is 16,384 - 384 = 16,000 bytes. At 16 bytes per (key, pointer) entry, each internal node holds 16,000 / 16 = 1,000 child pointers (so a 3-level tree indexes 1 billion leaf pages).",
    "tags": [
      "b-tree",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "b-tree-t1",
    "topic": "b-tree",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Sequential vs Random Primary Keys in Clustered B+Trees",
    "scenario": "A high-ingestion ledger table in InnoDB (clustered B+Tree on primary key) is experiencing 50% page fill factors, frequent page splits, and severe buffer pool churn.",
    "prompt": "Which primary key strategy resolves the B+Tree page-split thrashing, and why?",
    "question": "Which primary key strategy resolves the B+Tree page-split thrashing, and why?",
    "options": [
      "Use random UUIDv4 strings as the clustered primary key",
      "Increase the primary key size from 16 bytes to 64 bytes of SHA-256 hash",
      "Use a monotonically increasing or time-ordered key (e.g., UUIDv7 / Snowflake / AUTO_INCREMENT) for the clustered index"
    ],
    "correctOption": 2,
    "reasons": [
      "Random UUIDv4 spreads inserts evenly across cold disk pages, maximizing buffer pool misses",
      "Larger hash keys reduce the B+Tree fanout and trigger more splits",
      "Time-ordered inserts append to the rightmost leaf page in memory, avoiding mid-tree page splits and random disk page reads"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Think about which leaf pages must be loaded into RAM when inserting random keys vs monotonic keys.",
    "explanation": "Clustered B+Trees physically sort rows by primary key. Random UUIDv4 inserts dirty every leaf page across the entire table, causing 50% split fragmentation and disk thrashing; time-ordered keys append cleanly to the right edge.",
    "tags": [
      "b-tree",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["query-planning"] = [
  {
    "id": "query-planning-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Choosing a join algorithm",
    "section": "Under the Hood: Join Algorithms Compared",
    "prompt": "Two large tables are joined on equality, neither has a useful index on the join key, and the smaller side fits in work_mem. Which join algorithm fits best?",
    "options": [
      "A nested loop join, probing the inner table once per outer row",
      "A merge join, sorting both inputs on the join key first",
      "A hash join, building a table on the smaller input and streaming the larger",
      "A Cartesian product, filtered afterward by the join predicate"
    ],
    "answer": 2,
    "explanation": "A hash join builds an in-memory hash table on the smaller input and streams the larger one, at roughly O(N + M), which suits large unindexed equi-joins. A merge join can also work, but without sorted input it pays the full sorting cost on both sides, and a nested loop without an index on the inner side scans that table again for every outer row.",
    "tags": [
      "query-planning",
      "recall",
      "inline"
    ]
  },
  {
    "id": "query-planning-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Reading loops= correctly",
    "section": "Worked example: reading a plan that went wrong",
    "prompt": "In EXPLAIN ANALYZE, the inner index scan of a nested loop shows actual time of 0.05 ms and loops=40,000. Roughly how much time does that inner side account for?",
    "options": [
      "About 0.05 ms",
      "About 40 ms",
      "About 200 ms",
      "About 2 seconds"
    ],
    "answer": 3,
    "explanation": "Times on the inner side of a nested loop are per loop, so 0.05 ms times 40,000 loops is about 2,000 ms. Reading 0.05 ms at face value is the classic mistake that makes an expensive inner side look free.",
    "tags": [
      "query-planning",
      "apply",
      "inline"
    ]
  },
  {
    "id": "query-planning-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Fix the estimate, not the plan",
    "section": "Worked example: reading a plan that went wrong",
    "prompt": "The customers scan shows rows=50 estimated against rows=50000 actual, and the planner chose a nested loop that probes orders 50,000 times. What is the right fix?",
    "options": [
      "Set enable_nestloop = off for this query so the planner has to use a hash join",
      "Run ANALYZE customers so the row estimate matches reality again",
      "Raise work_mem so a hash join becomes cheaper than the nested loop",
      "Add another index on customers.country so the scan gets cheaper"
    ],
    "answer": 1,
    "explanation": "The first node with a large estimate mismatch is the root cause, and here it comes from stale statistics, so refreshing them lets the planner pick the right join by itself. Disabling nested loops is the tempting quick fix, but it fixes today's query and can break others as the data changes.",
    "tags": [
      "query-planning",
      "staff",
      "inline"
    ]
  },
  {
    "id": "query-planning-n1",
    "topic": "query-planning",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Nested Loop vs Hash Join Cost",
    "scenario": "A query joins an outer batch of 500 rows against an indexed inner table where each index probe costs 0.2 ms of I/O, versus a full-table Hash Join that scans the entire inner table in 800 ms.",
    "prompt": "What is the total execution time (in ms) of the Indexed Nested Loop Join across all 500 outer rows?",
    "question": "What is the total execution time (in ms) of the Indexed Nested Loop Join across all 500 outer rows?",
    "unit": "ms",
    "answer": 100,
    "tolerance": 0.2,
    "hint": "Multiply 500 outer rows by 0.2 ms per inner index lookup.",
    "explanation": "500 outer rows × 0.2 ms/probe = 100 ms total, making Indexed Nested Loop 8× faster than the 800 ms Hash Join for small outer cardinality.",
    "tags": [
      "query-planning",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "query-planning-t1",
    "topic": "query-planning",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Stale Cardinality Histograms & Plan Regression",
    "scenario": "After a bulk tenant import increases a tenant_id's row count from 50 to 5,000,000 within 10 minutes, p99 latency spikes because the optimizer still chooses an Indexed Nested Loop Join instead of a Hash Join.",
    "prompt": "What is the disciplined database engineering remediation, and why?",
    "question": "What is the disciplined database engineering remediation, and why?",
    "options": [
      "Drop all indexes on tenant_id permanently so every tenant uses full table scans",
      "Restart the database server after every bulk import to clear RAM",
      "Trigger explicit `ANALYZE` statistics refresh after bulk loads and enable adaptive/plan-stability guardrails for skewed tenants"
    ],
    "correctOption": 2,
    "reasons": [
      "Full table scans are optimal for the 99% of tenants who still only have 50 rows",
      "Rebooting the DB server does not recompute persistent table histograms",
      "Refreshing column histograms and most-common-value (MCV) stats informs the cost-based optimizer of the new skew so it switches to a Hash/Merge plan for the heavy tenant"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Why did the cost-based optimizer think tenant_id still had 50 rows?",
    "explanation": "Cost-based optimizers rely on sampled table statistics (histograms and MCV lists). When bulk writes skew data faster than autovacuum/auto-analyze runs, triggering `ANALYZE` updates the selectivity estimate.",
    "tags": [
      "query-planning",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["database-locking-and-isolation"] = [
  {
    "id": "database-locking-and-isolation-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What Repeatable Read allows",
    "section": "The Concurrency Anomaly Hierarchy",
    "prompt": "Which anomaly can still occur under PostgreSQL's Repeatable Read isolation level?",
    "options": [
      "Write skew",
      "Dirty reads",
      "Non-repeatable reads",
      "Phantom reads"
    ],
    "answer": 0,
    "explanation": "PostgreSQL's snapshot-based Repeatable Read prevents dirty reads, non-repeatable reads and, unlike the SQL standard's minimum, phantoms too, but it still allows write skew. Phantoms are the tempting answer because the standard permits them at this level, but PostgreSQL's single transaction-wide snapshot rules them out.",
    "tags": [
      "database-locking-and-isolation",
      "recall",
      "inline"
    ]
  },
  {
    "id": "database-locking-and-isolation-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Two doctors, zero on call",
    "section": "Under the Hood: The Four Real-World Anomalies",
    "prompt": "Two on-call doctors request leave at the same moment. Each transaction checks that 2 are on call, then updates only its own row. Both commit and nobody is left on call. Which change prevents this?",
    "options": [
      "Move from Read Committed to Repeatable Read, so each check sees a stable snapshot",
      "Rewrite each leave request as a single atomic UPDATE on that doctor's own row",
      "Add a unique constraint on doctor_id so the two updates collide with each other",
      "Use Serializable and retry on SQLSTATE 40001, or lock the checked rows FOR UPDATE"
    ],
    "answer": 3,
    "explanation": "This is write skew: each transaction updates a different row, so no write-write conflict happens, and snapshot-based Repeatable Read allows it. Serializable (SSI aborts one transaction) or explicitly locking the rows the check depends on closes the gap. Repeatable Read is the tempting choice, but a stable snapshot is exactly why both checks see 2.",
    "tags": [
      "database-locking-and-isolation",
      "staff",
      "inline"
    ]
  },
  {
    "id": "database-locking-and-isolation-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "The lost update",
    "section": "Worked example: the lost update and three fixes",
    "prompt": "At Read Committed, two requests each run SELECT balance (both see 100), then UPDATE accounts SET balance = 110 and COMMIT. What is the final balance, and what is the simplest fix?",
    "options": [
      "120, because the first UPDATE's row lock makes the second one re-read the row",
      "110, fixed by switching the database to Read Uncommitted isolation",
      "110, fixed by writing UPDATE accounts SET balance = balance + 10 instead",
      "120, because Read Committed applies the two writes one after the other"
    ],
    "answer": 2,
    "explanation": "Both transactions write the literal value 110 that they computed, so one increment is lost silently. An atomic balance = balance + 10 lets the row lock serialize the two writers. The first option is tempting: the second UPDATE does wait for the lock, but it still writes the stale 110 it calculated from its earlier read.",
    "tags": [
      "database-locking-and-isolation",
      "apply",
      "inline"
    ]
  },
  {
    "id": "database-locking-and-isolation-n1",
    "topic": "database-locking-and-isolation",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Hot-Row Lock Contention Throughput Cap",
    "scenario": "Every checkout updates a single flash-sale inventory row inside a transaction that holds the row-level X-lock for 4 ms (including network round-trip to the app before `COMMIT`).",
    "prompt": "What is the theoretical maximum sequential throughput (in transactions/sec) that this single hot row can sustain?",
    "question": "What is the theoretical maximum sequential throughput (in transactions/sec) that this single hot row can sustain?",
    "unit": "tx/s",
    "answer": 250,
    "tolerance": 0.2,
    "hint": "Divide 1,000 ms/sec by the 4 ms lock hold duration.",
    "explanation": "Because exclusive row locks serialize updates to the same row, holding the lock for 4 ms caps throughput at 1,000 ms / 4 ms = 250 tx/s regardless of how many CPU cores the database has.",
    "tags": [
      "database-locking-and-isolation",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "database-locking-and-isolation-t1",
    "topic": "database-locking-and-isolation",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Preventing Lost Updates on Concurrent Balance Debits",
    "scenario": "Two concurrent requests read a wallet balance of $100 under default `READ COMMITTED` isolation and both subtract $80 in application memory before writing `SET balance = $20`.",
    "prompt": "Which concurrency control mechanism prevents the lost update with minimal lock hold time, and why?",
    "question": "Which concurrency control mechanism prevents the lost update with minimal lock hold time, and why?",
    "options": [
      "Keep application-side math under READ COMMITTED with no WHERE guard",
      "Acquire a table-level ACCESS EXCLUSIVE lock at the start of every HTTP request",
      "Use an atomic single-statement conditional update (`UPDATE wallets SET balance = balance - 80 WHERE id = $1 AND balance >= 80`) or optimistic version check"
    ],
    "correctOption": 2,
    "reasons": [
      "READ COMMITTED automatically detects read-modify-write races in application memory",
      "Table locks maximize multi-tenant concurrency",
      "Pushing the predicate and decrement into a single atomic SQL statement acquires the row X-lock only for microseconds and re-evaluates the current row state"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Compare holding a lock across an app-to-DB round-trip (`SELECT FOR UPDATE`) vs a single atomic `UPDATE ... WHERE balance >= 80`.",
    "explanation": "An atomic conditional `UPDATE ... SET balance = balance - 80 WHERE id = ? AND balance >= 80` avoids application read-modify-write lost updates and holds the row lock only during the statement execution.",
    "tags": [
      "database-locking-and-isolation",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["mvcc"] = [
  {
    "id": "mvcc-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What UPDATE really writes",
    "section": "How Mutations Work in MVCC",
    "prompt": "In PostgreSQL, what physically happens when a transaction runs UPDATE users SET email = 'new@corp.com' WHERE id = 1?",
    "options": [
      "It sets xmax on the old tuple and writes a new tuple whose xmin is the current transaction",
      "It overwrites the tuple in place and copies the old image into an undo log",
      "It overwrites the tuple in place and relies on the WAL to rebuild old versions",
      "It locks the page against readers until commit, then rewrites the tuple"
    ],
    "answer": 0,
    "explanation": "PostgreSQL never overwrites in place. The old version is marked with the updater's ID in xmax and a new version is appended, so older snapshots can still read the old tuple. The undo-log option is tempting because it is how InnoDB and Oracle work, not PostgreSQL.",
    "tags": [
      "mvcc",
      "recall",
      "inline"
    ]
  },
  {
    "id": "mvcc-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Updating from an old snapshot",
    "section": "Worked example: two snapshots, one row",
    "prompt": "At Repeatable Read, T200 took its snapshot before T201 updated and committed row id=1. T200 still reads the old email. What happens if T200 now tries to UPDATE that same row?",
    "options": [
      "It succeeds and quietly overwrites T201's change with its own value",
      "It waits for T201's row lock to clear, then applies its update to the new version",
      "It fails with \"could not serialize access due to concurrent update\" and must retry",
      "It creates a separate branch of the row that VACUUM later reconciles"
    ],
    "answer": 2,
    "explanation": "At Repeatable Read, PostgreSQL will not let a transaction update a row that changed after its snapshot, so it raises a serialization error, and the application retries. Waiting and then updating the new version is the tempting answer, because that is how Read Committed behaves, where each statement gets a fresh snapshot.",
    "tags": [
      "mvcc",
      "apply",
      "inline"
    ]
  },
  {
    "id": "mvcc-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "One idle session, global bloat",
    "section": "Worked example: two snapshots, one row",
    "prompt": "A session opened a transaction six hours ago and has sat idle in transaction ever since. Autovacuum runs normally. What happens to a hot table doing 1,000 updates per second?",
    "options": [
      "Nothing unusual, because autovacuum removes dead tuples on its normal schedule",
      "Only the tables that the idle session touched bloat, while the others stay clean",
      "The idle session is blocked from reading, since writers have moved past its snapshot",
      "Dead tuples newer than its snapshot cannot be removed, so the table bloats by millions"
    ],
    "answer": 3,
    "explanation": "Vacuum can only reclaim versions that no active snapshot might still see, so one old transaction holds back cleanup, and about 21 million dead tuples pile up over six hours on this table alone. \"Only the tables it touched\" is tempting, but the limit is its snapshot's age, which applies to every table. The fix is idle_in_transaction_session_timeout.",
    "tags": [
      "mvcc",
      "staff",
      "inline"
    ]
  },
  {
    "id": "mvcc-n1",
    "topic": "mvcc",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: MVCC Dead Tuple Bloat During Long Transactions",
    "scenario": "A PostgreSQL database processes 5,000 row updates/sec where each updated tuple version occupies 200 bytes. An analytics script opens a transaction (`BEGIN; SELECT ...`) and holds its snapshot open for 1,000 seconds, preventing `VACUUM` from reclaiming dead tuples.",
    "prompt": "How many gigabytes (GB, using 1 GB = 10^9 bytes) of unreclaimable dead-tuple bloat accumulate during that 1,000-second window?",
    "question": "How many gigabytes (GB, using 1 GB = 10^9 bytes) of unreclaimable dead-tuple bloat accumulate during that 1,000-second window?",
    "unit": "GB",
    "answer": 1,
    "tolerance": 0.25,
    "hint": "Dead tuples = 5,000 updates/s × 1,000 s = 5,000,000 tuples. Multiply by 200 bytes and convert to GB.",
    "explanation": "5,000 updates/s × 1,000 s = 5,000,000 dead tuple versions. At 200 bytes each, that creates 1,000,000,000 bytes = 1 GB of dead heap tuples in just 16.7 minutes (10 GB if held for ~2.7 hours), degrading sequential and index scan performance.",
    "tags": [
      "mvcc",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "mvcc-t1",
    "topic": "mvcc",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Append-Only Heap MVCC (Postgres) vs Undo-Log In-Place MVCC (InnoDB)",
    "scenario": "A ride-sharing location table updates each active driver's `(lat, lng, updated_at)` row every 3 seconds (20,000 updates/sec) and has 4 secondary indexes on non-coordinate columns (`city_id`, `vehicle_type`, `status`, `rating`).",
    "prompt": "How does PostgreSQL's append-only heap MVCC behave on this workload compared to InnoDB's undo-log MVCC, and what mitigates it in PostgreSQL?",
    "question": "How does PostgreSQL's append-only heap MVCC behave on this workload compared to InnoDB's undo-log MVCC, and what mitigates it in PostgreSQL?",
    "options": [
      "PostgreSQL updates rows in place by default, so secondary indexes never need updating",
      "Unindexed column updates can use PostgreSQL Heap-Only Tuples (HOT) if page fillfactor leaves free space; otherwise every update writes a new heap tuple AND entries in all 4 secondary indexes",
      "Adding more secondary indexes in PostgreSQL increases the probability of HOT updates"
    ],
    "correctOption": 1,
    "reasons": [
      "PostgreSQL stores old versions in a separate rollback segment outside the heap",
      "Lowering table `fillfactor` (e.g., to 70-80) reserves intra-page space so updates to unindexed columns stay on the same 8 KB page and skip all 4 secondary index writes",
      "Secondary indexes automatically compress dead heap tuples during writes"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "What two conditions are required for a PostgreSQL HOT (Heap-Only Tuple) update?",
    "explanation": "In PostgreSQL, updating a row writes a new tuple version. If no indexed column changed AND the new version fits on the same 8 KB heap page, PostgreSQL performs a HOT update—chaining the tuple inside the page and avoiding writes to the 4 secondary indexes.",
    "tags": [
      "mvcc",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["database-wal-and-recovery"] = [
  {
    "id": "database-wal-and-recovery-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "When a commit is durable",
    "section": "Under the Hood: Write-Ahead Logging & The ARIES Protocol",
    "prompt": "Under the WAL invariant, at what point can the database safely reply COMMIT OK to the client?",
    "options": [
      "Once the modified table pages have been written to the data files",
      "Once the transaction's WAL records have been flushed to stable storage",
      "Once the change is applied to the shared buffers in memory",
      "Once the next checkpoint has written every dirty page to disk"
    ],
    "answer": 1,
    "explanation": "Durability comes from the fsynced log: after a crash, replaying the WAL rebuilds any pages that had not reached disk. Waiting for the table pages is the tempting answer, but data pages are flushed lazily, often minutes later at a checkpoint, and that is exactly what makes WAL fast.",
    "tags": [
      "database-wal-and-recovery",
      "recall",
      "inline"
    ]
  },
  {
    "id": "database-wal-and-recovery-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Group commit throughput",
    "section": "Worked example: why group commit matters",
    "prompt": "A cloud volume takes 4 ms per fsync. What is the commit ceiling for a single connection with one fsync per commit, and what is it if group commit makes 40 sessions durable per fsync?",
    "options": [
      "About 250 commits per second, and about 10,000 with group commit",
      "About 4,000 commits per second, and about 160,000 with group commit",
      "About 250 commits per second, and about 250 with group commit, since the disk is the limit",
      "About 25 commits per second, and about 1,000 with group commit"
    ],
    "answer": 0,
    "explanation": "One fsync every 4 ms allows 250 per second, and grouping 40 commits into each fsync gives about 10,000. \"The disk is the limit\" is tempting, but group commit changes how many commits each fsync makes durable, not how fast the fsync itself is.",
    "tags": [
      "database-wal-and-recovery",
      "apply",
      "inline"
    ]
  },
  {
    "id": "database-wal-and-recovery-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "synchronous_commit vs fsync",
    "section": "Worked example: why group commit matters",
    "prompt": "To speed up writes, one engineer proposes synchronous_commit = off, and another proposes fsync = off. How do the risks differ after a power loss?",
    "options": [
      "They are equivalent: both may lose the last few hundred milliseconds of commits",
      "synchronous_commit = off can corrupt the data, while fsync = off only delays the flushes",
      "Both are safe on NVMe drives, since these drives flush their caches on power loss",
      "synchronous_commit = off may lose recent commits but stays consistent; fsync = off can corrupt it"
    ],
    "answer": 3,
    "explanation": "synchronous_commit = off only acknowledges before the WAL flush, which is a durability trade-off with a bounded loss window. fsync = off removes the ordering guarantee that recovery depends on, so a power cut can leave the files corrupted. Treating the two as equivalent is the tempting mistake.",
    "tags": [
      "database-wal-and-recovery",
      "staff",
      "inline"
    ]
  },
  {
    "id": "database-wal-and-recovery-n1",
    "topic": "database-wal-and-recovery",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Group Commit IOPS Reduction",
    "scenario": "A database handles 12,000 commits/sec. With group commit enabled, the WAL writer flushes batched commit records every 2 ms.",
    "prompt": "How many physical `fsync` operations per second does the WAL disk perform?",
    "question": "How many physical `fsync` operations per second does the WAL disk perform?",
    "unit": "fsync/s",
    "answer": 500,
    "tolerance": 0.2,
    "hint": "Divide 1,000 ms/sec by the 2 ms group commit window (averaging 24 transactions per fsync).",
    "explanation": "Flushing once every 2 ms requires 1,000 / 2 = 500 fsyncs/sec, coalescing 12,000 / 500 = 24 concurrent transactions into each disk flush.",
    "tags": [
      "database-wal-and-recovery",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "database-wal-and-recovery-t1",
    "topic": "database-wal-and-recovery",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Synchronous vs Asynchronous WAL Flush (`synchronous_commit`)",
    "scenario": "A Postgres cluster writes both high-value billing ledger entries and high-volume non-critical user presence heartbeats on the same primary instance.",
    "prompt": "How should you configure WAL durability to maximize throughput without risking financial data loss, and why?",
    "question": "How should you configure WAL durability to maximize throughput without risking financial data loss, and why?",
    "options": [
      "Turn `fsync = off` globally across the entire Postgres instance",
      "Force synchronous cross-region 3-node quorum commit on every heartbeat update",
      "Keep `fsync = on` globally, use `SET LOCAL synchronous_commit = on` for ledger transactions, and `SET LOCAL synchronous_commit = off` for presence heartbeats"
    ],
    "correctOption": 2,
    "reasons": [
      "`fsync = off` corrupts the entire database cluster on OS crash",
      "Cross-region quorum commits make ephemeral heartbeats faster",
      "Per-transaction `synchronous_commit = off` lets ephemeral writes return before WAL fsync without risking database page corruption on crash, while ledger transactions wait for durable WAL flush"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Distinguish `fsync = off` (corrupts DB on crash) from session-level `synchronous_commit = off` (safe crash recovery, only loses last few ms of async commits).",
    "explanation": "In PostgreSQL, `synchronous_commit` can be toggled per transaction: financial transactions wait for WAL flush, while high-rate telemetry/heartbeats skip the fsync wait while maintaining full crash consistency.",
    "tags": [
      "database-wal-and-recovery",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["database-ticket-servers"] = [
  {
    "id": "database-ticket-servers-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What odd/even does not give",
    "section": "Under the Hood: The MySQL REPLACE INTO Trick",
    "prompt": "Flickr's two ticket servers hand out odd and even IDs respectively. Which property do those IDs not have?",
    "options": [
      "Uniqueness across every shard in the system",
      "Fitting within a 64-bit integer column",
      "A single global order that matches when IDs were issued",
      "Survival of one ticket server failing"
    ],
    "answer": 2,
    "explanation": "The two servers advance independently, so ID 1001 can be issued after 1004. The IDs are unique but not globally time-ordered. Surviving a server failure is the tempting wrong answer, but running two independent servers is exactly what removes the single point of failure.",
    "tags": [
      "database-ticket-servers",
      "recall",
      "inline"
    ]
  },
  {
    "id": "database-ticket-servers-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Allocator load with leasing",
    "section": "Worked example: range leasing (the \"segment\" or hi/lo pattern)",
    "prompt": "250 app servers each need 800 IDs per second and lease blocks of 500 IDs at a time. How many allocation UPDATEs per second does the central allocator handle?",
    "options": [
      "About 400 per second",
      "About 200 per second",
      "About 4,000 per second",
      "About 200,000 per second"
    ],
    "answer": 0,
    "explanation": "Total demand is 250 times 800, or 200,000 IDs per second, and each 500-ID block costs one UPDATE, so that is 400 UPDATEs per second, easy for a single database. 200,000 is the tempting answer because it is the load without leasing, one round trip per ID.",
    "tags": [
      "database-ticket-servers",
      "apply",
      "inline"
    ]
  },
  {
    "id": "database-ticket-servers-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Restoring the allocator",
    "section": "Worked example: range leasing (the \"segment\" or hi/lo pattern)",
    "prompt": "The ID allocator's database is lost and restored from last night's backup. The app servers start leasing blocks again. What is the danger, and what should the runbook do?",
    "options": [
      "Only gaps appear in the sequence, which are harmless, so no action is needed",
      "App servers still hold their cached blocks, so the restore does no harm",
      "The counter has rewound and will reissue used IDs; bump it well past the last issued value",
      "The allocator rejects every lease until a DBA re-enters the offsets by hand"
    ],
    "answer": 2,
    "explanation": "The restored counter sits below IDs that were already handed out, so new leases will produce duplicate keys. The lesson says to bump the counter well past the last known value after any restore. Treating it as mere gaps is tempting, but gaps come from lost blocks going forward, while a rewind reissues IDs already used.",
    "tags": [
      "database-ticket-servers",
      "staff",
      "inline"
    ]
  },
  {
    "id": "database-ticket-servers-n1",
    "topic": "database-ticket-servers",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Dual Ticket Server Failure Window & Step Sizing",
    "scenario": "You run Flickr-style dual MySQL ticket servers (`auto_increment_increment = 2`, offsets 1 and 2). During a failover, a batched allocator leases blocks of 1,000 IDs at a time for a service generating 20,000 IDs/sec.",
    "prompt": "How many database round-trips per second are required to allocate IDs when using a block lease size of 1,000?",
    "question": "How many database round-trips per second are required to allocate IDs when using a block lease size of 1,000?",
    "unit": "req/s",
    "answer": 20,
    "tolerance": 0.2,
    "hint": "Divide 20,000 IDs/sec by 1,000 IDs per block lease.",
    "explanation": "By leasing ranges of 1,000 IDs per atomic counter increment instead of 1 ID per `REPLACE INTO`, database allocation traffic drops from 20,000 QPS to 20,000 / 1,000 = 20 QPS.",
    "tags": [
      "database-ticket-servers",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "database-ticket-servers-t1",
    "topic": "database-ticket-servers",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Single-Row `REPLACE INTO` Ticket Server vs Hi/Lo Block Allocation",
    "scenario": "A central SQL ticket server using `REPLACE INTO Tickets64` on every insert becomes a CPU and network bottleneck at 80,000 IDs/sec.",
    "prompt": "Which architectural evolution keeps 64-bit integer IDs compact while removing the per-ID database round-trip, and why?",
    "question": "Which architectural evolution keeps 64-bit integer IDs compact while removing the per-ID database round-trip, and why?",
    "options": [
      "Add 50 read replicas to the MySQL ticket server to serve `REPLACE INTO` writes",
      "Switch to 512-bit strings concatenated from client hostnames",
      "Use Hi/Lo range leasing (or Snowflake time+worker+sequence) where app nodes atomically claim a block of N IDs in one DB update and hand them out in memory"
    ],
    "correctOption": 2,
    "reasons": [
      "Read replicas can execute primary `AUTO_INCREMENT` writes without conflict",
      "512-bit string primary keys shrink B+Tree indexes",
      "Batching ID allocation into in-memory blocks (or local bit-partitioned generators) reduces coordination I/O by 1,000x while preserving 64-bit integer compactness"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Can you amortize the database persistence cost across 1,000 IDs at a time?",
    "explanation": "Hi/Lo block leasing (or Snowflake bit-allocation) eliminates per-row central DB contention while keeping primary keys as compact, roughly time-ordered 64-bit integers.",
    "tags": [
      "database-ticket-servers",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["relational-database-scaling"] = [
  {
    "id": "relational-database-scaling-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Read-your-own-writes routing",
    "section": "Replication Lag & Read-Your-Own-Writes",
    "prompt": "A user saves their profile and immediately reloads the page. Replicas lag the primary by up to a few hundred milliseconds. What does the read-your-own-writes pattern do?",
    "options": [
      "It routes every user's reads to the primary until all replicas report zero lag",
      "It sends that user's reads to the primary for a short time after they write",
      "It makes each write wait until all replicas have applied it before replying",
      "It caches the saved profile in the browser and skips the database read"
    ],
    "answer": 1,
    "explanation": "The app tracks each user's last write and sends that user's reads to the primary while replicas might still be behind. The precise version compares WAL positions (LSNs) instead of using a time threshold. Waiting for every replica is the tempting answer, but that is synchronous replication, which is a different and much more expensive trade-off.",
    "tags": [
      "relational-database-scaling",
      "recall",
      "inline"
    ]
  },
  {
    "id": "relational-database-scaling-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Shard key vs access path",
    "section": "Horizontal Sharding Challenges",
    "prompt": "A multi-tenant SaaS shards its orders table by hash(order_id) to spread data evenly. Almost every query is \"this tenant's orders and customers\". What goes wrong?",
    "options": [
      "Nothing, because hashing gives even shards, which is the main goal of a shard key",
      "Writes concentrate on one shard, because order IDs are issued in increasing order",
      "Only resharding gets harder, while normal queries still hit a single shard",
      "Tenant queries scatter across every shard and must be gathered in application memory"
    ],
    "answer": 3,
    "explanation": "A shard key should follow the most common access path, usually tenant or user, so that most queries hit one shard. Hashing by order_id spreads each tenant everywhere, which turns routine queries into scatter-gather work. Even data distribution is the tempting goal, but balance does not help if every query has to touch every shard.",
    "tags": [
      "relational-database-scaling",
      "staff",
      "inline"
    ]
  },
  {
    "id": "relational-database-scaling-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Replicas and a functional split",
    "section": "Worked example: when does each rung stop working?",
    "prompt": "An app does 20,000 reads per second and 4,000 writes per second, and each replica serves about 8,000 reads per second. Event tables account for 50% of writes. How many replicas cover the reads, and what write load is left on the primary after moving the event tables to their own cluster?",
    "options": [
      "3 replicas, with the primary still taking 4,000 writes per second",
      "2 replicas, with the primary dropping to 2,000 writes per second",
      "3 replicas, with the primary dropping to 2,000 writes per second",
      "3 replicas, with the primary dropping to about 1,000 writes per second"
    ],
    "answer": 2,
    "explanation": "20,000 divided by 8,000 is 2.5, which rounds up to 3 replicas. Moving half the writes elsewhere leaves 2,000 per second. Replicas never reduce write load, because each one must replay every write, so only the functional split lowers the 4,000. Two replicas is the tempting answer if you round down.",
    "tags": [
      "relational-database-scaling",
      "apply",
      "inline"
    ]
  },
  {
    "id": "relational-database-scaling-n1",
    "topic": "relational-database-scaling",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Read Replica Fleet Sizing With Write Replay Overhead",
    "scenario": "A primary SQL node handles 4,000 writes/sec (consuming 40% of a node's CPU capacity). Every read replica must also replay all 4,000 writes/sec (consuming 40% CPU on each replica), leaving 60% CPU capacity per replica to serve read queries (which equates to 6,000 reads/sec per replica).",
    "prompt": "How many read replicas are required to serve 30,000 reads/sec while keeping every replica within its 6,000 reads/sec net read capacity?",
    "question": "How many read replicas are required to serve 30,000 reads/sec while keeping every replica within its 6,000 reads/sec net read capacity?",
    "unit": "replicas",
    "answer": 5,
    "tolerance": 0.25,
    "hint": "Divide total read QPS (30,000) by net read capacity per replica after write replay (6,000).",
    "explanation": "Because every read replica must replay 100% of the primary's write WAL stream (using 40% of its CPU/IO), each replica only has 6,000 reads/sec of remaining headroom. Serving 30,000 reads/sec requires 30,000 / 6,000 = 5 read replicas (or 6 for N+1 failover).",
    "tags": [
      "relational-database-scaling",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "relational-database-scaling-t1",
    "topic": "relational-database-scaling",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Read-Your-Own-Writes Consistency Across Async Replicas",
    "scenario": "After offloading 90% of SELECT queries to asynchronous read replicas (replication lag 50–300 ms), users complain that when they update their profile bio and the page immediately reloads, their old bio is displayed.",
    "prompt": "Which routing pattern resolves the stale read-after-write anomaly without routing all traffic back to the primary, and why?",
    "question": "Which routing pattern resolves the stale read-after-write anomaly without routing all traffic back to the primary, and why?",
    "options": [
      "Switch all 5 read replicas to synchronous commit (`synchronous_commit = remote_apply`) across availability zones",
      "Attach the primary's commit LSN (Log Sequence Number) or a short-lived write timestamp token to the user's session, routing that user's reads to replicas that have caught up to that LSN (or falling back to the primary briefly)",
      "Add a 1-second `sleep(1000)` before returning from every HTTP POST request"
    ],
    "correctOption": 1,
    "reasons": [
      "Synchronous replication across 5 replicas has zero impact on write latency or availability",
      "Causal LSN/session pinning scopes strong freshness solely to the mutating user for a few hundred milliseconds while keeping global reads on async replicas",
      "Sleeping in application threads scales throughput under heavy write load"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Only the user who just performed a write needs to see at least commit position `LSN_w`.",
    "explanation": "Tracking the commit LSN (or a 1-second sticky-primary cookie) per mutating user enforces causal Read-Your-Own-Writes consistency without penalizing write latency with synchronous multi-replica commits.",
    "tags": [
      "relational-database-scaling",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["online-indexing"] = [
  {
    "id": "online-indexing-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What plain CREATE INDEX blocks",
    "section": "Under the Hood: Non-Blocking Index Creation in Production",
    "prompt": "In PostgreSQL, what does a plain CREATE INDEX on a busy 500-million-row table block while it runs?",
    "options": [
      "Only other DDL on the table, while reads and writes both continue",
      "Reads and writes alike, because it holds ACCESS EXCLUSIVE until done",
      "Only reads of the column being indexed, while writes continue",
      "INSERT, UPDATE and DELETE for the whole build, while reads continue"
    ],
    "answer": 3,
    "explanation": "Plain CREATE INDEX holds a SHARE lock for the whole build, which allows reads but blocks all writes, so connection pools fill up and the site goes down. ACCESS EXCLUSIVE is the tempting answer, but that is the lock taken by ALTER TABLE and DROP, not by index creation.",
    "tags": [
      "online-indexing",
      "recall",
      "inline"
    ]
  },
  {
    "id": "online-indexing-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "The INVALID leftover",
    "section": "Under the Hood: The Cost and Failure Modes of CONCURRENTLY",
    "prompt": "A CREATE INDEX CONCURRENTLY build hits its lock_timeout partway through. The migration tool logs a failure and moves on. What is the lasting effect if nobody follows up?",
    "options": [
      "The partial index is rolled back automatically, leaving the table as it was before",
      "An INVALID index remains that the planner ignores, but every write still has to maintain it",
      "A usable but incomplete index remains, which returns wrong results for newer rows",
      "The table stays locked in SHARE UPDATE EXCLUSIVE mode until a DBA releases it"
    ],
    "answer": 1,
    "explanation": "A failed concurrent build leaves the index in the catalog as INVALID. It gives no read benefit but adds cost to every insert and update until someone runs DROP INDEX CONCURRENTLY and retries. Automatic rollback is the tempting assumption, because a plain CREATE INDEX runs in a transaction, but CONCURRENTLY does not.",
    "tags": [
      "online-indexing",
      "staff",
      "inline"
    ]
  },
  {
    "id": "online-indexing-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Writes stalled by a blocking build",
    "section": "Worked example: adding an index to a 500M-row table",
    "prompt": "A table receives 2,500 writes per second, and a blocking CREATE INDEX would take 40 minutes. About how many writes would stall during the build?",
    "options": [
      "About 100,000",
      "About 600,000",
      "About 6 million",
      "About 60 million"
    ],
    "answer": 2,
    "explanation": "40 minutes is 2,400 seconds, and 2,400 times 2,500 is 6 million writes. In practice, connection pools fill within seconds and the application fails long before that total is reached, which is why production uses CREATE INDEX CONCURRENTLY.",
    "tags": [
      "online-indexing",
      "apply",
      "inline"
    ]
  },
  {
    "id": "online-indexing-n1",
    "topic": "online-indexing",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Online Index Backfill Duration",
    "scenario": "You run `CREATE INDEX CONCURRENTLY` on a 600 GB table. To avoid saturating disk I/O for live production queries, you throttle the background index build scan to 100 MB/s across its 2 passes (total 1,200 GB of scan work).",
    "prompt": "How many minutes will the throttled 2-pass index build take to complete (using 1 GB = 1,000 MB)?",
    "question": "How many minutes will the throttled 2-pass index build take to complete (using 1 GB = 1,000 MB)?",
    "unit": "minutes",
    "answer": 200,
    "tolerance": 0.2,
    "hint": "Total data scanned across 2 passes = 1,200,000 MB. Divide by 100 MB/s to get seconds, then divide by 60.",
    "explanation": "1,200 GB = 1,200,000 MB. At 100 MB/s, the scan takes 12,000 seconds = 200 minutes (3 hours 20 minutes).",
    "tags": [
      "online-indexing",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "online-indexing-t1",
    "topic": "online-indexing",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Standard `CREATE INDEX` vs `CREATE INDEX CONCURRENTLY`",
    "scenario": "A developer puts `CREATE INDEX idx_orders_user ON orders(user_id);` inside a deployment migration script that runs against a 200M-row table handling 5,000 writes/sec.",
    "prompt": "What happens if this runs without `CONCURRENTLY`, and what is the safe production procedure?",
    "question": "What happens if this runs without `CONCURRENTLY`, and what is the safe production procedure?",
    "options": [
      "Standard `CREATE INDEX` finishes instantly with zero locks on 200M rows",
      "Run `DROP TABLE` and recreate the table with the index during peak traffic",
      "Standard `CREATE INDEX` acquires a table-level `SHARE` lock that blocks all `INSERT/UPDATE/DELETE` writes for the entire build; use `CREATE INDEX CONCURRENTLY` with a `lock_timeout` instead"
    ],
    "correctOption": 2,
    "reasons": [
      "B-Tree construction never blocks concurrent writers by default",
      "Dropping the table prevents write lock queues",
      "`CONCURRENTLY` builds the index across two table scans plus a change buffer without holding a write-blocking lock, requiring only brief metadata locks at start and end"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Check what lock mode standard `CREATE INDEX` holds in PostgreSQL vs `CREATE INDEX CONCURRENTLY`.",
    "explanation": "Standard `CREATE INDEX` blocks all writes (`INSERT`, `UPDATE`, `DELETE`) for minutes or hours while scanning the table. `CREATE INDEX CONCURRENTLY` performs two background passes so live writes continue uninterrupted.",
    "tags": [
      "online-indexing",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["schema-evolution"] = [
  {
    "id": "schema-evolution-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "gh-ost vs pt-osc",
    "section": "Ghost Tables & Tools (GitHub gh-ost / pt-online-schema-change)",
    "prompt": "Both gh-ost and pt-online-schema-change copy rows into a shadow table and then swap it in. How do they keep the shadow table in sync with ongoing writes?",
    "options": [
      "gh-ost tails the binary log; pt-online-schema-change uses triggers on the original table",
      "gh-ost uses triggers on the original table; pt-online-schema-change tails the binary log",
      "Both use triggers, but gh-ost fires them asynchronously to reduce write latency",
      "Both pause writes briefly at intervals, copying the changes made since the last pause"
    ],
    "answer": 0,
    "explanation": "gh-ost is triggerless and streams changes from the binlog, while pt-online-schema-change adds triggers that mirror each write into the shadow table. Swapping the two is the common mix-up. Neither tool pauses writes except during the brief cut-over rename.",
    "tags": [
      "schema-evolution",
      "recall",
      "inline"
    ]
  },
  {
    "id": "schema-evolution-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Backfill schedule",
    "section": "Worked example: renaming name to full_name on a 200M-row table",
    "prompt": "You backfill full_name on a 300-million-row table in 10,000-row batches. Each batch takes about 50 ms, followed by a 50 ms sleep to keep replicas close. About how long does the backfill run?",
    "options": [
      "About 25 minutes",
      "About 50 minutes",
      "About 5 minutes",
      "About 8 hours"
    ],
    "answer": 1,
    "explanation": "300 million divided by 10,000 is 30,000 batches, and at 100 ms each including the sleep that is 3,000 seconds, or about 50 minutes. 25 minutes is the tempting answer if you forget the sleep, and the sleep is what keeps replica lag low.",
    "tags": [
      "schema-evolution",
      "apply",
      "inline"
    ]
  },
  {
    "id": "schema-evolution-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Instant DDL, long queue",
    "section": "Worked example: renaming name to full_name on a 200M-row table",
    "prompt": "You run ALTER TABLE users ADD COLUMN full_name text, which is a metadata-only change, while a 10-minute report query is reading users. Suddenly every request touching users hangs. Why, and what prevents it?",
    "options": [
      "The ALTER is rewriting the table in the background; run it at off-peak hours instead",
      "The report is holding a write lock; kill long reports before any migration runs",
      "The ALTER waits for an ACCESS EXCLUSIVE lock and new queries queue behind it; set lock_timeout and retry",
      "Adding a nullable column rebuilds every index; create the indexes CONCURRENTLY first"
    ],
    "answer": 2,
    "explanation": "Even an instant ALTER needs a brief ACCESS EXCLUSIVE lock. While it waits behind the report, every new query on the table lines up behind the ALTER. A short lock_timeout, such as 2 s, makes it give up and retry instead of stalling traffic. Table rewriting is the tempting answer, but adding a nullable column is metadata-only.",
    "tags": [
      "schema-evolution",
      "staff",
      "inline"
    ]
  },
  {
    "id": "schema-evolution-n1",
    "topic": "schema-evolution",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Lock Queue Cascade During Rolling Deploy",
    "scenario": "An `ALTER TABLE` waits 3 seconds behind a long-running analytics query to acquire an `ACCESS EXCLUSIVE` lock. While it waits in the lock queue, incoming app reads and writes arrive at 4,000 queries/sec and queue behind the pending `ALTER TABLE`.",
    "prompt": "How many application queries pile up blocked in the lock queue during those 3 seconds?",
    "question": "How many application queries pile up blocked in the lock queue during those 3 seconds?",
    "unit": "queries",
    "answer": 12000,
    "tolerance": 0.2,
    "hint": "Multiply 4,000 queries/sec by the 3-second wait window.",
    "explanation": "Because a queued `ACCESS EXCLUSIVE` lock blocks all subsequent `ACCESS SHARE` (SELECT) and `ROW EXCLUSIVE` (DML) requests behind it, 4,000 × 3 = 12,000 queries pile up in 3 seconds, exhausting connection pools.",
    "tags": [
      "schema-evolution",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "schema-evolution-t1",
    "topic": "schema-evolution",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Renaming a Column Under Rolling Zero-Downtime Deployment",
    "scenario": "You need to rename column `full_name` to `display_name` on the `users` table while 40 application pods roll out gradually over 15 minutes.",
    "prompt": "Which migration strategy guarantees zero errors across old and new application pods during the rollout, and why?",
    "question": "Which migration strategy guarantees zero errors across old and new application pods during the rollout, and why?",
    "options": [
      "Run `ALTER TABLE users RENAME COLUMN full_name TO display_name` right before deploying the new pods",
      "Stop all 40 pods for 15 minutes while running the rename migration",
      "Use Expand-and-Contract: add `display_name`, dual-write & backfill, switch reads to `display_name`, and drop `full_name` in a subsequent release"
    ],
    "correctOption": 2,
    "reasons": [
      "Old pods running in parallel during the rolling deploy will magically recognize the renamed column",
      "Taking a 15-minute outage is required for every column change",
      "During a rolling deploy, old pods and new pods coexist against the same DB schema; Expand-and-Contract keeps both column names valid until all old pods are retired"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens to the 39 old pods still running v1 code the instant `RENAME COLUMN` commits?",
    "explanation": "An in-place `RENAME COLUMN` immediately breaks either v1 pods (expecting `full_name`) or v2 pods (expecting `display_name`). Expand-and-Contract keeps the schema backward-compatible throughout the rollout.",
    "tags": [
      "schema-evolution",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["soft-delete"] = [
  {
    "id": "soft-delete-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Re-registering after delete",
    "section": "The Pitfalls of Soft Deletes",
    "prompt": "users.email has a plain UNIQUE constraint, and accounts are soft-deleted by setting deleted_at. A user deletes their account and later signs up again with the same email. What happens?",
    "options": [
      "The signup succeeds, because the database treats soft-deleted rows as absent",
      "The signup succeeds, and the old row is restored automatically on insert",
      "The signup fails only if the old row's deleted_at is NULL for some reason",
      "The signup fails, because the soft-deleted row still holds that email value"
    ],
    "answer": 3,
    "explanation": "To the database, a soft-deleted row is still a live row, so the unique constraint still counts its email. The fix is a partial unique index WHERE deleted_at IS NULL. The first option is tempting, but only your queries treat deleted rows as gone, and only if they remember the filter.",
    "tags": [
      "soft-delete",
      "recall",
      "inline"
    ]
  },
  {
    "id": "soft-delete-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Archive in two steps",
    "section": "Engineering Solutions for Soft Deletes",
    "prompt": "To stop table bloat, a team hard-deletes rows from users and then inserts them into users_archive in a separate transaction. What is the risk, and what is the fix?",
    "options": [
      "Archived rows keep their foreign keys, so orders block the delete; drop those constraints first",
      "A crash between the steps loses the record entirely; do both in one atomic statement or transaction",
      "The archive table fills with duplicates on every retry; add a unique key to users_archive",
      "The hard delete stops VACUUM from reclaiming space; soft-delete first and archive later"
    ],
    "answer": 1,
    "explanation": "If the process dies after the delete commits, the row exists in neither table. The lesson's pattern moves it inside one transaction, for example DELETE ... RETURNING feeding an INSERT, so it ends up in exactly one of the two. Duplicates are the tempting answer, but they only appear if the steps run in the other order, archive first and delete second.",
    "tags": [
      "soft-delete",
      "staff",
      "inline"
    ]
  },
  {
    "id": "soft-delete-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Reading past the dead",
    "section": "Worked example: the cost of keeping deleted rows",
    "prompt": "A conversation's messages are 75% soft-deleted, and the index on (conversation_id, created_at DESC) includes deleted rows. Roughly how many index entries must be read to return the newest 50 visible messages?",
    "options": [
      "About 200",
      "About 50",
      "About 67",
      "About 250"
    ],
    "answer": 0,
    "explanation": "Only 1 in 4 entries is live, so returning 50 requires reading about 200. 67 is the tempting answer if you mistake 75% for the live share. A partial index WHERE deleted_at IS NULL stores only live rows, so it reads exactly the 50 it needs.",
    "tags": [
      "soft-delete",
      "apply",
      "inline"
    ]
  },
  {
    "id": "soft-delete-n1",
    "topic": "soft-delete",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Partial Index Size Reduction with Soft Deletes",
    "scenario": "A multi-tenant `tasks` table contains 200,000,000 total rows, of which 85% are historical soft-deleted rows (`deleted_at IS NOT NULL`) and only 15% are active (`deleted_at IS NULL`). Each B-Tree index entry is 40 bytes.",
    "prompt": "What is the size (in GB, using 1 GB = 10^9 bytes) of a partial index `WHERE deleted_at IS NULL` compared to an 8 GB full-table index?",
    "question": "What is the size (in GB, using 1 GB = 10^9 bytes) of a partial index `WHERE deleted_at IS NULL` compared to an 8 GB full-table index?",
    "unit": "GB",
    "answer": 1.2,
    "tolerance": 0.2,
    "hint": "15% of 200,000,000 rows = 30,000,000 active rows. Multiply by 40 bytes (or take 15% of 8 GB).",
    "explanation": "Only the 30,000,000 active rows (15%) enter the partial index: 30,000,000 × 40 bytes = 1.2 × 10^9 bytes = 1.2 GB (saving 6.8 GB of RAM in the buffer pool).",
    "tags": [
      "soft-delete",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "soft-delete-t1",
    "topic": "soft-delete",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Unique Constraints with Soft Deletes",
    "scenario": "Users can delete their account (`deleted_at = NOW()`) and later sign up again with the same `email`. A standard `UNIQUE (email)` constraint fails because the soft-deleted row still occupies the email value.",
    "prompt": "Which schema design preserves uniqueness for active accounts while permitting re-registration and historical retention, and why?",
    "question": "Which schema design preserves uniqueness for active accounts while permitting re-registration and historical retention, and why?",
    "options": [
      "Remove all uniqueness constraints on `email` and check uniqueness only in frontend JavaScript",
      "Hard-delete all user rows and their foreign-key billing history immediately",
      "Enforce a partial unique index `CREATE UNIQUE INDEX ON users (email) WHERE deleted_at IS NULL` (or move tombstone records to an archive table)"
    ],
    "correctOption": 2,
    "reasons": [
      "Frontend checks prevent concurrent race conditions at the database layer",
      "Hard-deleting billing records satisfies tax audit regulations",
      "A partial unique index enforces database-level uniqueness strictly across active rows (`deleted_at IS NULL`) while ignoring historical tombstones"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How can the database enforce uniqueness only among rows where `deleted_at IS NULL`?",
    "explanation": "A partial unique index (`WHERE deleted_at IS NULL`) guarantees that at most one active account can own an email address at any time while allowing unlimited historical soft-deleted tombstones.",
    "tags": [
      "soft-delete",
      "tradeoff",
      "staff"
    ]
  }
];
