window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-data-sql"] = {
  "relational-database-design": {
    "title": "Relational database design",
    "video": {
      "youtubeId": "GAe5oB742dw",
      "title": "ACID Properties in Databases With Examples",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Relational Invariants and Normal Forms</h2>\n      <p>Relational database design is the discipline of structuring data into strongly typed tables governed by relational algebra. The core objective is eliminating data redundancy while enforcing integrity constraints directly at the storage engine level.</p>\n\n      <h2>Relational Algebra: The Formal Foundation</h2>\n      <p>Relational algebra is the mathematical framework behind every SQL query. When you write <code>SELECT</code>, <code>WHERE</code>, <code>JOIN</code>, or <code>UNION</code>, you are invoking operators defined by E.F. Codd (1970). Understanding these operators explains <em>why</em> certain query patterns are expensive and others are not.</p>\n      <table>\n        <thead>\n          <tr><th>Operator</th><th>Symbol</th><th>What It Does</th><th>SQL Equivalent</th><th>Cost Implication</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>Selection</strong></td><td>σ<sub>p</sub>(R)</td><td>Filters rows from relation R where predicate p is true.</td><td><code>WHERE</code> clause</td><td>O(N) full scan without index; O(log N) with B-Tree index.</td></tr>\n          <tr><td><strong>Projection</strong></td><td>π<sub>A,B</sub>(R)</td><td>Extracts only specified columns, discarding others.</td><td><code>SELECT A, B</code></td><td>Reduces I/O if columns are in a covering index; otherwise requires heap fetch.</td></tr>\n          <tr><td><strong>Cartesian Product</strong></td><td>R × S</td><td>Every row of R paired with every row of S. Produces |R| × |S| rows.</td><td><code>CROSS JOIN</code></td><td>Explosive row count: 1000 × 1000 = 1M rows. Almost always a bug in WHERE clause.</td></tr>\n          <tr><td><strong>Natural Join</strong></td><td>R ⋈ S</td><td>Combines rows where columns with matching names are equal; eliminates duplicate columns.</td><td><code>JOIN ... ON</code></td><td>Nested loop: O(N×M). Hash join: O(N+M). Merge join: O(N log N + M log M).</td></tr>\n          <tr><td><strong>Union</strong></td><td>R ∪ S</td><td>Combines all rows from R and S, removing duplicates.</td><td><code>UNION</code> (not <code>UNION ALL</code>)</td><td>Deduplication requires sorting or hashing, adding O(N log N) overhead.</td></tr>\n          <tr><td><strong>Set Difference</strong></td><td>R − S</td><td>Returns rows in R that are not in S.</td><td><code>EXCEPT</code> / <code>MINUS</code></td><td>Requires scanning both relations; anti-join optimization in some engines.</td></tr>\n          <tr><td><strong>Assignment</strong></td><td>R ← S</td><td>Stores result of an expression into a named relation (view or temp table).</td><td><code>CREATE VIEW</code> / CTE</td><td>Views are not pre-computed; CTE may be inlined or materialized by optimizer.</td></tr>\n        </tbody>\n      </table>\n      <p><strong>Key insight:</strong> SQL's declarative syntax hides these operators. When you write <code>SELECT name FROM orders JOIN customers ON orders.cust_id = customers.id WHERE status = 'active'</code>, the optimizer translates it to: π<sub>name</sub>(σ<sub>status='active'</sub>(orders ⋈<sub>cust_id=id</sub> customers)). The join algorithm (nested loop vs hash vs merge) determines physical performance; the algebra determines logical correctness.</p>\n\n      <h2>Relational Normalization and Foreign Key Enforcement</h2>\n      <div class=\"mermaid\">\nerDiagram\n    CUSTOMER ||--o{ ORDER : places\n    ORDER ||--|{ ORDER_ITEM : contains\n    PRODUCT ||--o{ ORDER_ITEM : references\n    \n    CUSTOMER {\n        uuid id PK\n        varchar email UK\n        timestamp created_at\n    }\n    ORDER {\n        uuid id PK\n        uuid customer_id FK\n        numeric total_amount\n        varchar status\n    }\n    ORDER_ITEM {\n        uuid id PK\n        uuid order_id FK\n        uuid product_id FK\n        int quantity\n        numeric unit_price\n    }\n      </div>\n\n      <h2>Normalization vs. Selective Denormalization</h2>\n      <h3>1. The Three Normal Forms</h3>\n      <ul>\n        <li><strong>First Normal Form (1NF):</strong> Atomic values; zero repeating column groups or comma-separated lists.</li>\n        <li><strong>Second Normal Form (2NF):</strong> Must be in 1NF, and all non-key columns must depend on the <em>entire</em> primary key (eliminating partial functional dependencies in composite keys).</li>\n        <li><strong>Third Normal Form (3NF):</strong> Must be in 2NF, and zero non-key columns may depend on other non-key columns (eliminating transitive functional dependencies).</li>\n      </ul>\n\n      <h3>2. The Cost of Normalization: The Multi-Join Penalty</h3>\n      <p>While 3NF guarantees zero update anomalies, high-scale read queries (such as rendering an e-commerce order history page) require joining 6 or more tables. Each join traverses secondary B-Trees and random heap pages, consuming database memory buffers. High-throughput architectures use <strong>Selective Denormalization</strong> (e.g., storing a snapshot of product name and unit price directly on the <code>order_items</code> row) to turn multi-table joins into single-table lookups while preserving point-in-time order integrity.</p>\n\n      <h2>Failure Modes and Edge Cases</h2>\n      <ul>\n        <li><strong>Accidental Cartesian Product:</strong> Forgetting a JOIN condition produces |R| × |S| rows. A 10K × 10K join silently returns 100M rows, exhausting memory and causing OOM kills. Always verify row counts in query plans.</li>\n        <li><strong>N+1 Query Problem:</strong> ORMs that lazy-load related entities inside a loop execute 1 query for the parent + N queries for children. For 10,000 orders with 3 items each, this becomes 10,001 queries. Fix with eager loading or batch joins.</li>\n        <li><strong>Foreign Key Without Index:</strong> A foreign key column without an index causes sequential scans on every DELETE of the parent row, creating table-wide locks. Always index foreign key columns.</li>\n        <li><strong>Over-Normalization in OLTP:</strong> A fully normalized schema with 15+ joins per query may be theoretically elegant but causes multi-second read latency. Measure actual query plans before denormalizing.</li>\n        <li><strong>NULL in UNIQUE Constraints:</strong> Most SQL engines allow multiple NULLs in a UNIQUE column (NULL ≠ NULL in SQL), which can cause unexpected duplicates in partial unique indexes.</li>\n      </ul>\n\n      <h2>Theoretical Framework: When to Normalize vs. Denormalize</h2>\n      <p>The <strong>Codd's relational model</strong> (1970) and <strong>C.J. Date's database design principles</strong> advocate 3NF as the default to prevent update, insertion, and deletion anomalies. In practice, the decision depends on workload:</p>\n      <ul>\n        <li><strong>Write-heavy OLTP (banking, inventory):</strong> Normalize to 3NF. Update anomalies are costly; joins are affordable at small row counts with proper indexes.</li>\n        <li><strong>Read-heavy OLAP (analytics, dashboards):</strong> Denormalize aggressively. Star schemas (Kimball methodology) trade write efficiency for query simplicity and scan performance.</li>\n        <li><strong>Mixed workloads (e-commerce):</strong> Normalize the transactional core; denormalize into materialized views or separate read-optimized stores (e.g., Elasticsearch for product search, Redis for session data).</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Relational design uses normalization (1NF, 2NF, 3NF) to eliminate update anomalies and enforce constraints.",
      "Selective denormalization optimizes read-heavy queries by embedding immutable point-in-time attributes.",
      "Foreign key constraints enforce referential integrity at the database layer, preventing dangling records."
    ],
    "furtherReading": [
      {
        "title": "Codd: A Relational Model of Data for Large Shared Data Banks (1970)",
        "url": "https://dl.acm.org/doi/10.1145/362384.362685"
      },
      {
        "title": "Date: An Introduction to Database Systems (8th Edition) — Relational Theory",
        "url": "https://www.microsoft.com/en-us/research/publication/an-introduction-to-database-systems-8th-edition/"
      },
      {
        "title": "PostgreSQL Documentation: Constraints and Table Partitioning",
        "url": "https://www.postgresql.org/docs/current/ddl-constraints.html"
      },
      {
        "title": "Kimball: The Data Warehouse Toolkit — Star Schema Design",
        "url": "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/"
      },
      {
        "title": "Abadi: The Architecture of a Database System (CMU, 2017)",
        "url": "https://stratos.seas.harvard.edu/files/stratos/files/databasearch.pdf"
      }
    ]
  },
  "sql-backed-key-value-store": {
    "title": "Design: a key-value store on SQL",
    "video": {
      "youtubeId": "V7FPk4J10KI",
      "title": "Redis In-Memory Database Crash Course",
      "channel": "Hussein Nasser"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Key-Value Semantics on Relational Engines</h2>\n      <p>Before introducing dedicated caching or NoSQL infrastructure (like Redis or DynamoDB), modern relational engines like PostgreSQL can reliably serve as high-throughput key-value stores using optimized schema designs, atomic compare-and-swap mutations, and partial indexing.</p>\n\n      <h2>Schema Design for an ACID Key-Value Table</h2>\n      <pre><code>-- Production-Grade Key-Value Table in PostgreSQL\nCREATE TABLE kv_store (\n    key VARCHAR(255) PRIMARY KEY,\n    value JSONB NOT NULL,\n    version BIGINT NOT NULL DEFAULT 1,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    expires_at TIMESTAMPTZ\n);\n\n-- Partial index for active key lookups and expiration sweeps\nCREATE INDEX idx_kv_expires ON kv_store(expires_at) \nWHERE expires_at IS NOT NULL;\n      </code></pre>\n\n      <h2>Atomic Mutations: Compare-and-Swap (CAS)</h2>\n      <p>To avoid race conditions without explicit transaction locks, execute conditional updates directly in SQL:</p>\n      <pre><code>-- Optimistic Concurrency Control: Put-If-Version\nUPDATE kv_store\nSET value = '{\"config\": \"v2\"}'::jsonb,\n    version = version + 1,\n    updated_at = NOW()\nWHERE key = 'feature_flags' AND version = 4;\n-- If 0 rows updated, client knows another thread won the race!\n      </code></pre>\n\n      <h2>Background Expiration Sweeper</h2>\n      <p>Because expired rows consume disk space and memory buffers, a background reaper periodically purges expired keys in bounded batches using the partial index:</p>\n      <pre><code>-- Bounded batch deletion to avoid table-level locks\nDELETE FROM kv_store\nWHERE key IN (\n    SELECT key FROM kv_store\n    WHERE expires_at &lt; NOW()\n    LIMIT 1000\n);\n      </code></pre>\n    </div>",
    "keyTakeaways": [
      "SQL engines can provide reliable ACID key-value storage using JSONB and optimistic concurrency control (version checks).",
      "Partial indexes on nullable expiration timestamps enable fast background cleanup without scanning the full table.",
      "Bounded batch deletions prevent long-running transactions and table lock contention during key reaping."
    ],
    "furtherReading": [
      {
        "title": "GitLab Engineering: Key-Value Stores in PostgreSQL",
        "url": "https://about.gitlab.com/blog/2021/04/27/how-we-use-postgresql-as-a-queue/"
      },
      {
        "title": "Kleppmann: Designing Data-Intensive Applications (Ch. 7: Transactions)",
        "url": "https://dataintensive.net/"
      }
    ]
  },
  "database-indexing": {
    "title": "Database indexing",
    "video": {
      "youtubeId": "K1a2Bk8NrYQ",
      "title": "Understanding B-Trees: The Data Structure Behind Modern Databases",
      "channel": "Spanning Tree"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: How Indexes Direct Disk I/O</h2>\n      <p>Without an index, finding a single row in a 50,000,000-record table requires a <strong>Sequential Scan (Seq Scan)</strong>: reading every single disk block into memory ($O(N)$ I/O). An index is an auxiliary data structure stored on disk that maps column values to physical tuple pointers (<code>ItemPointer</code> / <code>TID: (page_id, offset)</code>), reducing lookup complexity to $O(\\log N)$.</p>\n\n      <h2>Index Lookup vs. Sequential Scan</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Query[\"SELECT * FROM users WHERE email = 'alice@corp.com'\"] --> Planner{\"Query Planner\"}\n    Planner -->|\"No Index\"| SeqScan[\"Sequential Scan: Read 10,000 disk pages into buffer pool (5,000ms)\"]\n    Planner -->|\"B-Tree Index Available\"| BTreeSearch[\"B-Tree Index Scan: Read 3 index pages -> Seek 1 heap page (0.8ms)\"]\n      </div>\n\n      <h2>Index Mechanics & Cardinality Rules</h2>\n      <h3>1. Multi-Column (Composite) Index Ordering (Left-to-Right Prefix Rule)</h3>\n      <p>If you create an index on <code>(tenant_id, status, created_at)</code>, the B-Tree sorts first by <code>tenant_id</code>, then by <code>status</code>, then by <code>created_at</code>. A query filtering by <code>tenant_id AND status</code> uses the index efficiently. A query filtering solely by <code>status</code> CANNOT use the index because the leading column is missing.</p>\n\n      <h3>2. Covering Indexes (Index-Only Scan)</h3>\n      <p>An index lookup typically requires two steps: finding the tuple pointer in the index, then fetching the full row from the heap table. By using an index with included columns:</p>\n      <pre><code>CREATE INDEX idx_orders_covering ON orders(customer_id) INCLUDE (total_amount, status);</code></pre>\n      <p>The database can satisfy <code>SELECT customer_id, total_amount, status FROM orders WHERE customer_id = 42;</code> entirely from the index page in RAM without touching the table heap at all (an <strong>Index-Only Scan</strong>).</p>\n    </div>",
    "keyTakeaways": [
      "Indexes map column values directly to physical tuple IDs (page number, slot offset), bypassing table scans.",
      "Composite indexes strictly require query predicates to match the leftmost prefix of the indexed columns.",
      "Covering indexes (INCLUDE clause) eliminate heap reads entirely by satisfying queries directly from index pages."
    ],
    "furtherReading": [
      {
        "title": "Use The Index, Luke! A Guide to Database Performance",
        "url": "https://use-the-index-luke.com/"
      },
      {
        "title": "Ramakrishnan & Gehrke: Database Management Systems (3rd Ed) — Query Processing",
        "url": "https://pages.cs.wisc.edu/~dbbook/"
      }
    ]
  },
  "b-tree": {
    "title": "B-tree",
    "video": {
      "youtubeId": "K1a2Bk8NrYQ",
      "title": "Understanding B-Trees: The Data Structure Behind Modern Databases",
      "channel": "Spanning Tree"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: The B+ Tree Storage Architecture</h2>\n      <p>Relational databases almost exclusively use <strong>B+ Trees</strong> rather than traditional binary search trees (BST or Red-Black trees). A binary tree has a fanout of 2, requiring 20 to 30 pointer hops across disk to locate a record in a million rows. A B+ Tree has a massive fanout (typically 100 to 1,000 keys per page), ensuring the tree depth remains <strong>3 or 4 levels</strong> even for hundreds of millions of rows.</p>\n\n      <h2>Physical Page Layout of a B+ Tree</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Root[\"Root Page (Level 3: in RAM)\"] --> Internal1[\"Internal Page 1\"]\n    Root --> Internal2[\"Internal Page 2\"]\n    \n    Internal1 --> Leaf1[\"Leaf Page A: [1..100]\"]\n    Internal1 --> Leaf2[\"Leaf Page B: [101..200]\"]\n    \n    Leaf1 <-->|\"Doubly Linked List (O(1) Range Scan)\"| Leaf2\n    Leaf2 <--> Leaf3[\"Leaf Page C: [201..300]\"]\n    \n    Leaf1 -.-> Heap1[\"Table Heap Disk Tuple\"]\n    Leaf1 -.-> Heap2[\"Table Heap Disk Tuple\"]\n      </div>\n\n      <h2>B+ Tree Structural Invariants</h2>\n      <ul>\n        <li><strong>High Fanout:</strong> A single 8KB page can store roughly 200 key-pointer pairs. A 3-level tree indexes $200^3 = 8,000,000$ rows with only 3 disk page reads.</li>\n        <li><strong>Data Resides Solely in Leaves:</strong> Unlike standard B-trees, internal B+ Tree nodes contain <em>only separator keys and child pointers</em>; actual tuple data (or tuple pointers) resides exclusively in leaf pages. This maximizes internal page fanout.</li>\n        <li><strong>Doubly-Linked Leaves:</strong> All leaf pages are connected via forward and backward pointers. Executing a range query (<code>WHERE age BETWEEN 25 AND 35</code>) locates the first leaf in $O(\\log N)$ time and walks the linked list linearly with zero tree traversals.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "B+ Trees maximize fanout (100-1000 keys per 8KB page), keeping tree depth at 3-4 levels for multi-million row datasets.",
      "Internal nodes contain only separator keys, while leaf nodes store all data pointers.",
      "Leaf nodes form a doubly linked list, enabling fast linear range scans without re-traversing parent nodes."
    ],
    "furtherReading": [
      {
        "title": "Bayer & McCreight: Organization and Maintenance of Large Ordered Indexes (Original Paper)",
        "url": "https://link.springer.com/chapter/10.1007/978-3-642-61942-8_3"
      },
      {
        "title": "Knuth: The Art of Computer Programming, Vol. 3: Searching and Sorting",
        "url": "https://en.wikipedia.org/wiki/The_Art_of_Computer_Programming"
      }
    ]
  },
  "query-planning": {
    "title": "Query planning",
    "video": {
      "youtubeId": "K1a2Bk8NrYQ",
      "title": "Understanding B-Trees: The Data Structure Behind Modern Databases",
      "channel": "Spanning Tree"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: The Cost-Based Optimizer (CBO)</h2>\n      <p>SQL is a declarative language: you specify <em>what</em> data you want, not <em>how</em> to retrieve it. The database engine's <strong>Cost-Based Optimizer (CBO)</strong> evaluates hundreds of possible physical execution trees and selects the plan with the lowest estimated I/O and CPU cost.</p>\n\n      <h2>The Query Optimization Lifecycle</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    SQL[\"Raw SQL String\"] --> Parser[\"1. SQL Parser: Generates Abstract Syntax Tree (AST)\"]\n    Parser --> Rewriter[\"2. Query Rewriter: Unfolds subqueries & simplifies expressions\"]\n    Rewriter --> Planner[\"3. Cost-Based Optimizer: Estimates physical execution paths\"]\n    \n    subgraph StatsCatalog [\"Internal Database Catalog\"]\n      Stats[\"pg_statistic: MCV (Most Common Values), Histograms, Null Fractions\"]\n    end\n    Stats --> Planner\n    \n    Planner --> Executor[\"4. Execution Engine (Volcano Iterator Model: Next())\"]\n      </div>\n\n      <h2>Under the Hood: Join Algorithms Compared</h2>\n      <table>\n        <thead>\n          <tr><th>Join Algorithm</th><th>Mechanism & Complexity</th><th>Ideal Workload</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>Nested Loop Join</strong></td><td>For each row in outer table, scan inner table ($O(N \times \\log M)$ with index).</td><td>Small outer table joining against an indexed inner table.</td></tr>\n          <tr><td><strong>Hash Join</strong></td><td>Builds an in-memory hash table on the smaller table, then streams the larger table ($O(N + M)$).</td><td>Large unindexed equi-joins that fit into memory (<code>work_mem</code>).</td></tr>\n          <tr><td><strong>Merge Join</strong></td><td>Sorts both tables on join keys (or uses B-Tree order) and walks pointers together ($O(N \\log N + M \\log M)$).</td><td>Large sorted inputs, range joins, or when indexes already supply sorted order.</td></tr>\n        </tbody>\n      </table>\n      <p><strong>The Stale Statistics Trap:</strong> If table rows jump from 1,000 to 10,000,000 without running <code>ANALYZE</code>, the planner assumes the table is tiny and chooses a Nested Loop Join over sequential scans, causing massive latency regressions.</p>\n    </div>",
    "keyTakeaways": [
      "The Cost-Based Optimizer chooses execution paths using statistical histograms and cost formulas.",
      "The three core join physical operators are Nested Loop, Hash Join, and Merge Join.",
      "Stale statistics cause catastrophic plan regressions; ensure autovacuum and ANALYZE run regularly."
    ],
    "furtherReading": [
      {
        "title": "PostgreSQL Documentation: Using EXPLAIN to Understand Query Plans",
        "url": "https://www.postgresql.org/docs/current/using-explain.html"
      },
      {
        "title": "Graefe: Volcano — An Extensible and Parallel Query Evaluation System (1990)",
        "url": "https://www.cs.cornell.edu/home/carbonell/papers/volcano.pdf"
      }
    ]
  },
  "database-locking-and-isolation": {
    "title": "Database locking and isolation",
    "video": {
      "youtubeId": "GAe5oB742dw",
      "title": "ACID Properties in Databases With Examples",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Concurrency Anomalies & Isolation Levels</h2>\n      <p>When multiple client transactions execute concurrently, the database must prevent data corruption without serializing all execution. The SQL standard defines <strong>four isolation levels</strong> based on which concurrency anomalies they prevent.</p>\n\n      <h2>The Concurrency Anomaly Hierarchy</h2>\n      <table>\n        <thead>\n          <tr><th>Isolation Level</th><th>Dirty Read</th><th>Non-Repeatable Read</th><th>Phantom Read</th><th>Write Skew</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>Read Uncommitted</strong></td><td>\u26a0\ufe0f Occurs</td><td>\u26a0\ufe0f Occurs</td><td>\u26a0\ufe0f Occurs</td><td>\u26a0\ufe0f Occurs</td></tr>\n          <tr><td><strong>Read Committed (Postgres Default)</strong></td><td>\u2705 Prevented</td><td>\u26a0\ufe0f Occurs</td><td>\u26a0\ufe0f Occurs</td><td>\u26a0\ufe0f Occurs</td></tr>\n          <tr><td><strong>Repeatable Read</strong></td><td>\u2705 Prevented</td><td>\u2705 Prevented</td><td>\u2705 Prevented (in Postgres MVCC)</td><td>\u26a0\ufe0f Occurs</td></tr>\n          <tr><td><strong>Serializable</strong></td><td>\u2705 Prevented</td><td>\u2705 Prevented</td><td>\u2705 Prevented</td><td>\u2705 Prevented</td></tr>\n        </tbody>\n      </table>\n\n      <h2>Under the Hood: The Four Real-World Anomalies</h2>\n      <ul>\n        <li><strong>Dirty Read:</strong> Transaction A modifies row $R$. Transaction B reads the modified row <em>before</em> Transaction A commits. Transaction A rolls back; Transaction B has acted on phantom data.</li>\n        <li><strong>Non-Repeatable Read:</strong> Transaction A reads row $R$. Transaction B updates row $R$ and commits. Transaction A reads row $R$ again and observes different column values.</li>\n        <li><strong>Phantom Read:</strong> Transaction A queries <code>WHERE status = 'pending'</code> (retrieving 3 rows). Transaction B inserts a new row with <code>status = 'pending'</code> and commits. Transaction A executes the query again and observes 4 rows.</li>\n        <li><strong>Write Skew:</strong> Two doctors on on-call shift concurrently request leave. Rule: At least one doctor must remain on call. Both check: count is 2. Both submit leave transactions. Both commit. Zero doctors remain on call! Repeatable Read permits this; only <strong>Serializable Snapshot Isolation (SSI)</strong> detects and aborts one transaction.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "SQL isolation levels trade off concurrency throughput against anomaly prevention.",
      "PostgreSQL Read Committed generates a new snapshot for each query statement; Repeatable Read holds a single snapshot for the entire transaction.",
      "Write Skew occurs under Repeatable Read when disjoint updates violate cross-row constraints; Serializable isolation is required."
    ],
    "furtherReading": [
      {
        "title": "Berenson et al.: A Critique of ANSI SQL Isolation Levels",
        "url": "https://www.microsoft.com/en-us/research/publication/a-critique-of-ansi-sql-isolation-levels/"
      },
      {
        "title": "Abadi: Consistency Tradeoffs in Modern Distributed Database Systems (CMU)",
        "url": "https://db.cs.cmu.edu/papers//icde2018-consistency-tradeoffs.pdf"
      }
    ]
  },
  "mvcc": {
    "title": "MVCC",
    "video": {
      "youtubeId": "GAe5oB742dw",
      "title": "ACID Properties in Databases With Examples",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Multi-Version Concurrency Control (MVCC)</h2>\n      <p>In older database engines, readers blocked writers and writers blocked readers using shared and exclusive page locks. <strong>Multi-Version Concurrency Control (MVCC)</strong> eliminates read-write lock contention by ensuring that <em>readers never block writers, and writers never block readers</em>.</p>\n\n      <h2>PostgreSQL MVCC Tuple Header Anatomy</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    subgraph TupleHeader [\"Physical Heap Tuple Header (23 Bytes)\"]\n      XMIN[\"xmin (32-bit: Creating Transaction ID)\"]\n      XMAX[\"xmax (32-bit: Deleting/Updating Transaction ID)\"]\n      CID[\"t_cid (Command ID in Transaction)\"]\n      TUP[\"Tuple Data Payload\"]\n    end\n      </div>\n\n      <h2>How Mutations Work in MVCC</h2>\n      <h3>1. Updating a Row (Zero In-Place Overwrites)</h3>\n      <p>When you execute <code>UPDATE users SET email = 'new@corp.com' WHERE id = 1;</code>, PostgreSQL does <strong>not</strong> overwrite the existing bytes on disk:</p>\n      <ol>\n        <li>It records the current transaction ID into the old tuple's <code>xmax</code> field, marking it dead to future transactions.</li>\n        <li>It writes an entirely new tuple onto a disk page with <code>xmin = current_tx_id</code> and <code>xmax = 0</code>.</li>\n        <li>The old tuple remains on disk so active concurrent read transactions can continue reading the old version consistent with their snapshot.</li>\n      </ol>\n\n      <h3>2. The Vacuum Requirement (Dead Tuple Bloat)</h3>\n      <p>Because updates and deletes create dead tuples on disk, disk space bloats over time. The <strong>VACUUM daemon</strong> scans table pages, checks if any active transaction can still observe old versions, and unlinks dead tuples, making page space available for future writes.</p>\n    </div>",
    "keyTakeaways": [
      "MVCC ensures readers never block writers and writers never block readers by maintaining multiple tuple versions.",
      "Updates never modify data in place; they set xmax on the old tuple and insert a new tuple with xmin.",
      "Dead tuples accumulate on disk until reclaimed by background VACUUM processes."
    ],
    "furtherReading": [
      {
        "title": "The Internals of PostgreSQL: Chapter 5 - Concurrency Control",
        "url": "https://www.interdb.jp/pg/pgsql05.html"
      },
      {
        "title": "Berenson et al.: A Critique of ANSI SQL Isolation Levels (Microsoft Research)",
        "url": "https://www.microsoft.com/en-us/research/publication/a-critique-of-ansi-sql-isolation-levels/"
      }
    ]
  },
  "database-wal-and-recovery": {
    "title": "Database WAL and recovery",
    "video": {
      "youtubeId": "wI4hKwl1Cn4",
      "title": "How does the database guarantee reliability using write-ahead logging?",
      "channel": "Arpit Bhayani"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Write-Ahead Logging & The ARIES Protocol</h2>\n      <p>When a transaction commits, writing modified data pages to random locations on disk would require dozens of slow random I/O seeks. To achieve both ACID durability and high throughput, relational databases enforce the <strong>Write-Ahead Logging (WAL) invariant</strong>: <em>No data page may be written to physical disk until the corresponding log entry recording the change is safely flushed to non-volatile storage</em>.</p>\n\n      <h2>The WAL Commit and Checkpoint Lifecycle</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Tx[\"Client Commit Transaction\"] --> WALBuffer[\"Append Record to In-Memory WAL Buffer\"]\n    WALBuffer -->|\"1. Synchronous fsync() to Disk\"| WALDisk[(\"WAL Log on Disk: O_APPEND (Sequential)\")]\n    WALDisk --> Ack[\"2. Return COMMIT OK to Client\"]\n    \n    subgraph AsyncBackground [\"Asynchronous Dirty Page Flusher\"]\n      Dirty[\"Dirty Pages in Shared Buffers (DRAM)\"] -->|\"3. Lazy write / Checkpoint (Every 5 mins)\"| DataFile[(\"Database Table Pages (NVMe Disk)\")]\n    end\n      </div>\n\n      <h2>Under the Hood: Crash Recovery (ARIES Algorithm)</h2>\n      <p>If power fails, dirty pages in memory are lost. Upon reboot, the database executes the three phases of the <strong>ARIES protocol (Algorithms for Recovery and Isolation Exploiting Semantics)</strong>:</p>\n      <ul>\n        <li><strong>1. Analysis Phase:</strong> Scans the WAL forward from the last successful checkpoint to identify active transactions and dirty pages at the instant of failure.</li>\n        <li><strong>2. Redo Phase:</strong> Rolls the database forward, reapplying all changes (even for transactions that were subsequently aborted) to restore the exact physical state before the crash.</li>\n        <li><strong>3. Undo Phase:</strong> Scans backward, rolling back all transactions that were still uncommitted at the moment of the crash and writing Compensating Log Records (CLRs).</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "The WAL invariant guarantees durability by flushing sequential append-only logs before dirty data pages touch disk.",
      "Transactions commit as soon as their WAL records are fsynced; data pages are flushed asynchronously in the background.",
      "The ARIES recovery protocol restores consistency after sudden power failure via Analysis, Redo, and Undo phases."
    ],
    "furtherReading": [
      {
        "title": "Mohan et al.: ARIES: A Transaction Recovery Method (IBM Research)",
        "url": "https://cs.stanford.edu/people/chrismre/cs345/rl/aries.pdf"
      },
      {
        "title": "Kleppmann: Designing Data-Intensive Applications (Ch. 7: Transactions)",
        "url": "https://dataintensive.net/"
      }
    ]
  },
  "database-ticket-servers": {
    "title": "Database ticket servers",
    "video": {
      "youtubeId": "2O1wur4m8DE",
      "title": "Snowflake ID Generation by Twitter",
      "channel": "Gaurav Sen"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Flickr Ticket Servers and ID Generation</h2>\n      <p>Before Twitter created Snowflake, large-scale sharded MySQL databases (pioneered by Flickr in 2006) solved unique 64-bit ID generation across independent database shards using dedicated <strong>Ticket Servers</strong>.</p>\n\n      <h2>Dual Ticket Server Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"App Server Fleet\"] --> LB{\"Odd / Even Load Balancer\"}\n    \n    subgraph TicketServers [\"Dedicated Ticket Server Pair\"]\n      TS1[\"Ticket Server 1 (Generates Odd IDs)\"]\n      TS2[\"Ticket Server 2 (Generates Even IDs)\"]\n    end\n    \n    LB --> TS1\n    LB --> TS2\n    \n    TS1 --> S1[\"id = id + 2 (1, 3, 5, 7...)\"]\n    TS2 --> S2[\"id = id + 2 (2, 4, 6, 8...)\"]\n      </div>\n\n      <h2>Under the Hood: The MySQL REPLACE INTO Trick</h2>\n      <p>To generate sequential IDs without table bloat, Flickr used a 1-row table with <code>auto_increment_increment</code> and <code>auto_increment_offset</code>:</p>\n      <pre><code>-- Ticket Server Configuration\n-- Server 1: offset = 1, increment = 2 (Generates: 1, 3, 5, 7...)\n-- Server 2: offset = 2, increment = 2 (Generates: 2, 4, 6, 8...)\n\nCREATE TABLE Tickets64 (\n    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,\n    stub CHAR(1) NOT NULL DEFAULT '',\n    PRIMARY KEY (id),\n    UNIQUE KEY stub (stub)\n) ENGINE=InnoDB;\n\n-- Atomically update the single row and return the generated 64-bit ID\nREPLACE INTO Tickets64 (stub) VALUES ('a');\nSELECT LAST_INSERT_ID();\n      </code></pre>\n      <p><strong>Limitations:</strong> Requires a network round-trip for every ID generation and creates a high-availability single point of failure if both ticket servers drop off the network.</p>\n    </div>",
    "keyTakeaways": [
      "Ticket servers generate sequential IDs across sharded databases using odd/even increments.",
      "MySQL REPLACE INTO generates auto-increment IDs on a single row without unbounded table bloat.",
      "Modern high-throughput systems prefer coordinate-free ID generators (Snowflake / UUIDv7) to avoid network hops."
    ],
    "furtherReading": [
      {
        "title": "Flickr Engineering: Ticket Servers: Distributed Unique Primary Keys on the Cheap",
        "url": "https://code.flickr.net/2010/02/08/ticket-servers-distributed-unique-primary-keys-on-the-cheap/"
      },
      {
        "title": "Twitter: Snowflake — A Unique ID Generator for Distributed Systems",
        "url": "https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake"
      }
    ]
  },
  "relational-database-scaling": {
    "title": "Relational database scaling",
    "video": {
      "youtubeId": "5faMjKuB9bc",
      "title": "What is DATABASE SHARDING?",
      "channel": "Gaurav Sen"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Read Replicas vs. Horizontal Sharding</h2>\n      <p>Scaling a relational database follows a predictable operational progression as traffic and data volume expand beyond single-host physical limits:</p>\n\n      <h2>The Progression of Relational Scaling</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Step1[\"1. Vertical Scaling: Upgrade CPU / RAM / NVMe\"] --> Step2[\"2. Read Replicas: Asynchronous WAL streaming (Offload SELECTs)\"]\n    Step2 --> Step3[\"3. Functional Decomposition: Separate Users, Orders, Billing into distinct DBs\"]\n    Step3 --> Step4[\"4. Horizontal Sharding: Partition single table across N database nodes\"]\n      </div>\n\n      <h2>Replication Lag & Read-Your-Own-Writes</h2>\n      <p>Adding read replicas offloads read volume. However, because replication is asynchronous, replicas lag behind the primary by tens or hundreds of milliseconds. If a user updates their profile and immediately refreshes the page, routing the read to a replica returns old data.</p>\n      <p><strong>Read-Your-Own-Writes Pattern:</strong> The application tracks the user's latest mutation timestamp. If <code>now() - last_write &lt; replication_lag_threshold</code> (e.g., 2 seconds), route the read to the <strong>primary database</strong>; otherwise, route to read replicas.</p>\n\n      <h2>Horizontal Sharding Challenges</h2>\n      <ul>\n        <li><strong>Cross-Shard Joins:</strong> Joining data across shards requires distributed scatter-gather queries in application memory, destroying performance.</li>\n        <li><strong>Two-Phase Commit (2PC):</strong> Atomic multi-shard transactions require distributed locking, increasing latency by $10\times$.</li>\n        <li><strong>Re-Sharding:</strong> Doubling shards requires moving terabytes of data over live production traffic without write downtime.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Read replicas scale reads but introduce asynchronous replication lag.",
      "Enforce Read-Your-Own-Writes by routing recent writers to the primary database.",
      "Horizontal sharding provides horizontal scale but sacrifices cross-shard joins and ACID atomicity."
    ],
    "furtherReading": [
      {
        "title": "Vitess: Scaling MySQL for YouTube and Slack",
        "url": "https://vitess.io/docs/overview/what-is-vitess/"
      },
      {
        "title": "Kleppmann: Designing Data-Intensive Applications (Ch. 6: Partitioning)",
        "url": "https://dataintensive.net/"
      }
    ]
  },
  "online-indexing": {
    "title": "Online indexing",
    "video": {
      "youtubeId": "wI4hKwl1Cn4",
      "title": "How does the database guarantee reliability using write-ahead logging?",
      "channel": "Arpit Bhayani"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Non-Blocking Index Creation in Production</h2>\n      <p>Executing a standard <code>CREATE INDEX idx_orders ON orders(created_at);</code> on a 500,000,000-row table requests an <code>ACCESS EXCLUSIVE</code> lock. This blocks all incoming <code>INSERT</code>, <code>UPDATE</code>, and <code>DELETE</code> statements. In production, this causes application connection pools to exhaust within seconds, triggering an immediate site outage.</p>\n\n      <h2>PostgreSQL CREATE INDEX CONCURRENTLY Pipeline</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Start[\"CREATE INDEX CONCURRENTLY\"] --> Scan1[\"Phase 1: Register index in catalog; open write lock to start tracking new inserts in memory\"]\n    Scan1 --> Scan2[\"Phase 2: Full table scan to build B-Tree from existing tuples\"]\n    Scan2 --> Scan3[\"Phase 3: Second table scan to catch up on tuples inserted/updated during Phase 2\"]\n    Scan3 --> Validate[\"Phase 4: Mark index VALID and ready for query optimizer\"]\n      </div>\n\n      <h2>Under the Hood: The Cost and Failure Modes of CONCURRENTLY</h2>\n      <ul>\n        <li><strong>Two Full Table Scans:</strong> Because it avoids taking an exclusive table lock, <code>CONCURRENTLY</code> must scan the entire multi-gigabyte table twice, taking significantly longer than a standard index build.</li>\n        <li><strong>Invalid Indexes (Deadlock Failure):</strong> If a deadlock or transaction timeout interrupts the build, the index is left in an <code>INVALID</code> state. It does not speed up reads, but <strong>continues to slow down every future write</strong>. You must detect and drop invalid indexes:\n          <pre><code>SELECT relname FROM pg_class WHERE relisvalid = false;\nDROP INDEX CONCURRENTLY IF EXISTS idx_orders_broken;\n          </code></pre>\n        </li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Standard CREATE INDEX locks tables exclusively, causing immediate production write outages.",
      "CREATE INDEX CONCURRENTLY uses a multi-phase build that allows uninterrupted concurrent writes.",
      "Failed concurrent index builds leave INVALID indexes on disk that slow writes until explicitly dropped."
    ],
    "furtherReading": [
      {
        "title": "PostgreSQL Documentation: Building Indexes Concurrently",
        "url": "https://www.postgresql.org/docs/current/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY"
      },
      {
        "title": "Kleppmann: Designing Data-Intensive Applications (Ch. 5: Replication)",
        "url": "https://dataintensive.net/"
      }
    ]
  },
  "schema-evolution": {
    "title": "Schema evolution",
    "video": {
      "youtubeId": "u4EgIU8_f5U",
      "title": "Multi-active disaster recovery in CockroachDB",
      "channel": "CockroachDB"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Zero-Downtime Database Migrations</h2>\n      <p>Renaming or modifying a database column in a distributed system cannot happen instantaneously. At any moment during a zero-downtime deployment, older application code (v1) and newer application code (v2) run concurrently. The industry standard pattern for zero-downtime schema evolution is the <strong>Expand and Contract Pattern (Parallel Run)</strong>.</p>\n\n      <h2>The Expand and Contract Migration Lifecycle</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    S1[\"1. Expand: Add new column 'full_name' as NULLABLE (v1 app still writes 'name')\"] --> S2[\"2. Dual-Write: v2 app deployed; writes to both 'name' and 'full_name'\"]\n    S2 --> S3[\"3. Backfill: Background batch job copies historical data from 'name' to 'full_name'\"]\n    S3 --> S4[\"4. Switch Reads: v2 app switches all read queries to 'full_name'\"]\n    S4 --> S5[\"5. Contract: Deprecate and drop old 'name' column safely\"]\n      </div>\n\n      <h2>Ghost Tables & Tools (GitHub gh-ost / pt-online-schema-change)</h2>\n      <p>For complex schema mutations (like changing column types or primary keys on MySQL), enterprise teams use shadow table tools like <strong>gh-ost</strong>:</p>\n      <ol>\n        <li>Create a phantom shadow table with the new schema: <code>_orders_new</code>.</li>\n        <li>Stream modifications from the primary database binary log (binlog) to continuously sync inserts/updates into the shadow table.</li>\n        <li>Run a throttled background copier to migrate historical rows without saturating CPU or replication lag.</li>\n        <li>Execute an atomic table swap: <code>RENAME TABLE orders TO _orders_old, _orders_new TO orders;</code> (sub-millisecond lock).</li>\n      </ol>\n    </div>",
    "keyTakeaways": [
      "Never execute breaking schema changes in a single deployment; use the Expand and Contract pattern.",
      "Dual-writing during transitions ensures older and newer application pods can run concurrently without errors.",
      "Tools like GitHub gh-ost use binlog streaming and shadow tables to alter massive tables with zero downtime."
    ],
    "furtherReading": [
      {
        "title": "GitHub Engineering: gh-ost: GitHub's Online Schema Migration Tool for MySQL",
        "url": "https://github.blog/2016-08-01-gh-ost-github-s-online-schema-migrations-tool-for-mysql/"
      },
      {
        "title": "Fowler: Evolutionary Database Design",
        "url": "https://martinfowler.com/articles/evodb.html"
      }
    ]
  },
  "soft-delete": {
    "title": "Soft delete",
    "video": {
      "youtubeId": "K1a2Bk8NrYQ",
      "title": "Understanding B-Trees: The Data Structure Behind Modern Databases",
      "channel": "Spanning Tree"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Soft Deletes vs. Hard Deletes</h2>\n      <p>A <strong>Hard Delete</strong> executes <code>DELETE FROM users WHERE id = 42;</code>, permanently unlinking tuples and allowing VACUUM to reclaim space. A <strong>Soft Delete</strong> updates a flag: <code>UPDATE users SET deleted_at = NOW() WHERE id = 42;</code>, preserving historical data for audit compliance and recovery.</p>\n\n      <h2>The Pitfalls of Soft Deletes</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Soft[\"Soft Delete: UPDATE users SET deleted_at = NOW()\"] --> Prob1[\"1. Unique Constraint Failure: Cannot re-register same email!\"]\n    Soft --> Prob2[\"2. Table Bloat: 80% of rows are dead, clogging cache buffer pools\"]\n    Soft --> Prob3[\"3. Query Pollution: Every WHERE clause must append 'AND deleted_at IS NULL'\"]\n      </div>\n\n      <h2>Engineering Solutions for Soft Deletes</h2>\n      <h3>1. Partial Unique Indexes</h3>\n      <p>If you have a unique constraint on <code>email</code>, soft-deleted rows prevent a user from re-registering with the same email. Solve this with a <strong>Partial Unique Index</strong> that enforces uniqueness only on active records:</p>\n      <pre><code>CREATE UNIQUE INDEX uq_users_active_email ON users(email) \nWHERE deleted_at IS NULL;\n      </code></pre>\n\n      <h3>2. Archival Tables (The True Production Pattern)</h3>\n      <p>Keeping millions of soft-deleted records in your primary transactional table pollutes B-Trees and memory buffers. Instead, execute a true delete on the primary table while archiving the deleted record to an auxiliary <code>users_archive</code> or cold S3 Parquet dataset inside an atomic transaction.</p>\n    </div>",
    "keyTakeaways": [
      "Soft deletes preserve data for recovery but cause table bloat, query pollution, and unique constraint conflicts.",
      "Use Partial Unique Indexes (WHERE deleted_at IS NULL) to allow reuse of unique values after soft deletion.",
      "The scalable pattern is archiving deleted records into separate cold storage tables, keeping hot tables lean."
    ],
    "furtherReading": [
      {
        "title": "Brandur Leach: Soft Deletion Probably Isn't What You Want",
        "url": "https://brandur.org/soft-deletion"
      },
      {
        "title": "Kleppmann: Designing Data-Intensive Applications (Ch. 7: Transactions)",
        "url": "https://dataintensive.net/"
      }
    ]
  }
};
