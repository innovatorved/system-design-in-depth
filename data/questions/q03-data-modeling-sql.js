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
  }
];
