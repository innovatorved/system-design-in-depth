window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-storage-engines"] = {
  "storage-engine-design-constraints": {
    "title": "Storage engine design constraints",
    "video": {
      "youtubeId": "I6jB0nM9SKU",
      "title": "The Secret Sauce Behind NoSQL: LSM Tree",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Hardware Hierarchy & Kernel I/O Constraints</h2>\n      <p>A storage engine is the low-level software component responsible for persisting, indexing, and retrieving records from physical non-volatile storage. Storage engine design is fundamentally constrained by the physical physics and kernel interfaces of modern computer architectures:</p>\n      <ul>\n        <li><strong>Memory Latency Gap:</strong> L1 CPU Cache (~1ns) vs DRAM (~100ns) vs NVMe SSD (~10-100\u00b5s) vs HDD seek (~5-10ms). Accessing disk is 1,000x to 100,000x slower than accessing main memory.</li>\n        <li><strong>Sequential vs Random I/O:</strong> On mechanical HDDs, random I/O incurs a physical actuator arm seek and platter rotation penalty (~100 IOPS, ~1MB/s). On NVMe SSDs, flash memory cannot be overwritten in place; cells must be written in 4KB/16KB pages and erased in 2MB/8MB blocks. Random writes trigger severe SSD controller garbage collection and high Write Amplification Factors (WAF). Sequential writes achieve over 5GB/s on PCIe Gen4 NVMe.</li>\n        <li><strong>Linux Page Cache & VFS:</strong> Standard POSIX <code>write()</code> writes to the OS kernel page cache (DRAM dirty pages). Durability requires calling <code>fsync()</code> or <code>fdatasync()</code> to flush physical drive write buffers to non-volatile NAND cells. High-performance engines bypass page cache overhead using <code>O_DIRECT</code> and manage their own buffer pools.</li>\n      </ul>\n\n      <h2>The Storage Engine I/O Pipeline</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    App[\"Application Thread\"] -->|\"1. write(fd, buf, len)\"| VFS[\"Virtual File System (VFS)\"]\n    VFS -->|\"2. Dirty Page\"| PageCache[\"Kernel Page Cache (DRAM)\"]\n    PageCache -->|\"3. Periodic flusher / fsync()\"| BlockLayer[\"I/O Scheduler & Block Device\"]\n    BlockLayer -->|\"4. NVMe PCIe Queue\"| Controller[\"SSD Controller Flash Translation Layer (FTL)\"]\n    Controller -->|\"5. Erase Block & Program Page\"| FlashNAND[(\"Physical NAND Flash Chips\")]\n      </div>\n\n      <h2>Under the Hood: fsync vs fdatasync vs O_DIRECT</h2>\n      <p>Ensuring ACID durability without catastrophic latency spikes requires precise systems programming:</p>\n      <ul>\n        <li><code>fsync(int fd)</code>: Requests persistence of a file's modified data and metadata required by the filesystem's durability contract. Publishing a newly created or renamed filename may also require synchronizing the containing directory; a file <code>fsync</code> alone does not make that directory entry durable.</li>\n        <li><code>fdatasync(int fd)</code>: Requests persistence of data and metadata required to retrieve it, such as a changed file size, while it may omit unrelated metadata. Whether it saves I/O depends on the filesystem, workload, and device.</li>\n        <li><code>O_DIRECT</code> and <code>O_DSYNC</code> solve different problems. <code>O_DIRECT</code> requests direct I/O with filesystem- and device-specific alignment constraints; <code>O_DSYNC</code> changes write-completion semantics and does not itself bypass the page cache. Engines that use direct I/O must manage buffering, prefetching, and eviction explicitly.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Storage engines exist to bridge the 100,000x latency gap between DRAM and persistent physical disk.",
      "Flash storage cannot overwrite in place; random writes cause internal erase block garbage collection and wear.",
      "Production databases use fdatasync() to avoid redundant inode metadata updates and O_DIRECT to prevent double-caching."
    ],
    "furtherReading": [
      {
        "title": "Andy Pavlo: Database Storage Engine Architecture (CMU 15-445)",
        "url": "https://15445.courses.cs.cmu.edu/"
      },
      {
        "title": "Brendan Gregg: Linux Storage Stack & I/O Performance",
        "url": "https://www.brendangregg.com/linuxperf.html"
      }
    ]
  },
  "storage-engine-tradeoffs": {
    "title": "Storage engine tradeoffs",
    "video": {
      "youtubeId": "K1a2Bk8NrYQ",
      "title": "Understanding B-Trees: The Data Structure Behind Modern Databases",
      "channel": "Spanning Tree"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: The RUM Conjecture</h2>\n      <p>Formulated by researchers Manos Athanassoulis and Stratos Idreos at Harvard, the <strong>RUM Conjecture</strong> describes a lower-bound tradeoff among read overhead, update overhead, and memory overhead: reducing one usually consumes more of at least one other resource. It is a design lens, not a rule that every engine cleanly optimizes exactly two:</p>\n      <ul>\n        <li><strong>R (Read Amplification):</strong> The ratio of bytes read from physical storage to the bytes returned to the application. High read amplification means multiple disk blocks must be read to satisfy a single point or range query.</li>\n        <li><strong>U (Update / Write Amplification):</strong> The ratio of bytes written to physical storage to the bytes updated by the application. High write amplification exhausts disk bandwidth and accelerates SSD wear.</li>\n        <li><strong>M (Memory Overhead):</strong> The auxiliary in-memory state required by the access method, such as indexes, filters, and routing metadata. Disk-space amplification is a related operational metric, but it is not the M in the RUM formulation.</li>\n      </ul>\n\n      <h2>The RUM Tradeoff Frontier</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Tradeoff{\"Storage Engine Architecture\"}\n    Tradeoff -->|\"B+ Tree (InnoDB / Postgres)\"| BTree[\"Optimize Read & Space Amplification (1-2 disk reads, 1.2x space) at the cost of high Write Amplification (10x-50x 16KB page rewrites)\"]\n    Tradeoff -->|\"LSM Tree (RocksDB / Cassandra)\"| LSM[\"Optimize Write Amplification (sequential appends) at the cost of high Read Amplification (multi-SSTable scans) and Space Amplification (compaction debt)\"]\n    Tradeoff -->|\"Fractal Tree / B-epsilon Tree\"| Fractal[\"Balanced compromise: Buffer messages in internal tree nodes to trade write I/O for tree depth\"]\n      </div>\n\n      <h2>Detailed Comparison: B+ Trees vs LSM Trees</h2>\n      <table>\n        <thead>\n          <tr><th>Dimension</th><th>B+ Tree Storage Engine</th><th>LSM-Tree Storage Engine</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>Write Pattern</strong></td><td>In-place update of 8KB/16KB pages on disk</td><td>Sequential append to WAL + memory buffer</td></tr>\n          <tr><td><strong>Point Read Latency</strong></td><td>Fast: O(log_B N), typically 2-3 page reads from cache</td><td>Slower: Requires checking memtable, bloom filters, and multiple SSTables</td></tr>\n          <tr><td><strong>Write Throughput</strong></td><td>Moderate: Limited by random I/O and locking page latches</td><td>Extreme: Limited only by sequential disk bus throughput</td></tr>\n          <tr><td><strong>Write Amplification Factor</strong></td><td>Very High (20x - 60x): Updating 50 bytes rewrites full 16KB page</td><td>Low-Moderate (4x - 15x depending on leveled vs tiered compaction)</td></tr>\n          <tr><td><strong>Space Utilization</strong></td><td>Moderate: 30-40% internal page fragmentation due to page splits</td><td>High: Sorted keys allow dense prefix compression (ZSTD / Snappy)</td></tr>\n        </tbody>\n      </table>\n    </div>",
    "keyTakeaways": [
      "The RUM tradeoff connects read overhead, update overhead, and auxiliary memory; disk-space amplification should be measured separately.",
      "B+ Trees optimize for point reads and predictable space at the expense of random write amplification.",
      "LSM-Trees optimize for sequential write throughput and compression at the expense of point read complexity and background compaction."
    ],
    "furtherReading": [
      {
        "title": "Athanassoulis et al.: Designing Access Methods: The RUM Conjecture",
        "url": "https://stratos.seas.harvard.edu/files/stratos/files/rum.pdf"
      }
    ]
  },
  "file-backed-dictionary-storage-engine": {
    "title": "A file-backed dictionary",
    "video": {
      "youtubeId": "wI4hKwl1Cn4",
      "title": "How does the database guarantee reliability using write-ahead logging?",
      "channel": "Arpit Bhayani"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Related design: an append-only mutable dictionary</h2>\n      <p>The archive's weekly dictionary publishes immutable snapshots. When updates must arrive continuously, a different design is an append-only log paired with an in-memory hash table, as in Bitcask. This variant trades cheap incremental writes for recovery and compaction work; it does not replace the snapshot publication contract described above.</p>\n\n      <h2>The Architecture of an Append-Only Dictionary</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    subgraph MemoryRAM [\"DRAM: In-Memory Index (Hash Map)\"]\n      K1[\"'user:101' -> Offset: 0, Size: 84\"]\n      K2[\"'user:102' -> Offset: 84, Size: 92\"]\n      K1U[\"'user:101' -> Offset: 176, Size: 88 (Updated)\"]\n    end\n\n    subgraph DiskData [\"Persistent Storage: Append-Only Data File\"]\n      R1[\"[0..83] Record 1: key='user:101', val='Alice'\"]\n      R2[\"[84..175] Record 2: key='user:102', val='Bob'\"]\n      R3[\"[176..263] Record 3: key='user:101', val='Alice V2' (Append)\"]\n    end\n\n    K1U -.->|\"Seek(176), Read(88)\"| R3\n      </div>\n\n      <h2>Internal Mechanics & Step-by-Step Operations</h2>\n      <h3>1. The Write Operation (Set Key-Value)</h3>\n      <p>To insert or update a key:</p>\n      <ol>\n        <li>Encode the key and value into a binary record structure containing timestamp, key length, value length, key bytes, and value payload.</li>\n        <li>Append the record to the end of the active data file using <code>write(fd, buffer, len)</code>. Record the byte offset where the write began.</li>\n        <li>Update the in-memory hash map: <code>index[key] = { file_id, offset, size, timestamp }</code>.</li>\n        <li>Because writes are strictly append-only, disk head movement is minimized and write throughput reaches hundreds of megabytes per second.</li>\n      </ol>\n\n      <h3>2. The Read Operation (Get Key)</h3>\n      <p>To read a key: Query the in-memory hash map. If the key exists, retrieve the file descriptor, byte offset, and record length. Execute <code>pread(fd, buf, size, offset)</code>. Verify checksum and extract payload. Requires exactly <strong>one disk seek</strong>.</p>\n\n      <h3>3. The Delete Operation (Tombstone)</h3>\n      <p>Deletions cannot modify existing bytes in an append-only log. Instead, append a special record called a <strong>Tombstone</strong> (a record with value size set to -1 or a tombstone flag bit). Remove the key from the in-memory hash index.</p>\n    </div>",
    "keyTakeaways": [
      "An append-only log with an in-memory hash index can locate a value with one logical range read; caches, filesystems, and devices determine the physical I/O.",
      "Updates never overwrite previous data; they append new versions and update the in-memory byte offset pointer.",
      "Deletions are recorded as append-only tombstone records that invalidate previous entries during compaction."
    ],
    "furtherReading": [
      {
        "title": "Bitcask: A High Performance Key-Value Store",
        "url": "https://riak.com/assets/bitcask-intro.pdf"
      }
    ]
  },
  "custom-binary-file-format": {
    "title": "Custom binary file format",
    "video": {
      "youtubeId": "wI4hKwl1Cn4",
      "title": "How does the database guarantee reliability using write-ahead logging?",
      "channel": "Arpit Bhayani"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Binary Serialization & Disk Layout</h2>\n      <p>Text formats such as JSON and CSV favor inspectability and interoperability, but parsing and locating individual records can cost more CPU and I/O than a purpose-built representation. When measurements justify that tradeoff, a storage engine can use a versioned binary format with explicit record boundaries and validation.</p>\n\n      <h2>Physical Record Binary Memory Layout</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    CRC[\"CRC32 Checksum (4 Bytes)\"] --> TS[\"Timestamp (8 Bytes)\"]\n    TS --> KLen[\"Key Length (2 Bytes)\"]\n    KLen --> VLen[\"Value Length (4 Bytes)\"]\n    VLen --> Flags[\"Flags / Tombstone (1 Byte)\"]\n    Flags --> KeyPayload[\"Key Bytes (Variable: KLen)\"]\n    KeyPayload --> ValPayload[\"Value Bytes (Variable: VLen)\"]\n      </div>\n\n      <h2>Header Specification & Hardware Alignment</h2>\n      <h3>1. File Header (Magic Bytes & Metadata)</h3>\n      <p>One possible format starts with a fixed-size header block:</p>\n      <ul>\n        <li><strong>Magic Bytes (4 Bytes):</strong> A unique signature (e.g. <code>0x53444231</code> for \"SDB1\") verifying that the file is indeed a valid database file.</li>\n        <li><strong>Format Version (2 Bytes):</strong> Allows future database upgrades to read older file formats or migrate them on the fly.</li>\n        <li><strong>Block Size (2 Bytes):</strong> Defines page size alignment (e.g. 4096 bytes or 16384 bytes).</li>\n        <li><strong>Endianness Marker (2 Bytes):</strong> Resolves Little-Endian vs Big-Endian integer encoding differences across CPU architectures.</li>\n      </ul>\n\n      <h3>2. The 4KB Memory Alignment Rule</h3>\n      <p>Filesystems and devices expose different logical blocks, physical sectors, pages, and direct-I/O alignment constraints. Packing records into blocks can bound the number of reads and simplify checksums, but padding every record may waste space. Choose and record the block size from the actual I/O contract rather than assuming a universal 4KB rule.</p>\n    </div>",
    "keyTakeaways": [
      "Custom binary formats eliminate JSON parsing CPU overhead and enable constant-time random offset reads.",
      "A binary format should include only the boundaries, versioning, integrity checks, and mutation metadata required by its recovery and compatibility contract.",
      "Block sizing and alignment should follow measured filesystem and device constraints; padding trades simpler I/O for extra space."
    ],
    "furtherReading": [
      {
        "title": "SQLite Database File Format Specification",
        "url": "https://www.sqlite.org/fileformat.html"
      }
    ]
  },
  "byte-range-indexed-object-storage": {
    "title": "Byte-range indexed object storage",
    "video": {
      "youtubeId": "RvaMHMxHjp4",
      "title": "Object Storage in System Design Interviews w/ Ex-Meta Staff Engineer",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Random Access Over Large Objects</h2>\n      <p>When storing massive binary assets (e.g. 100GB video files, multi-gigabyte ZIP archives, or Parquet datasets), requiring an application to download the entire file to access a small subset of bytes is unacceptable. <strong>Byte-range indexed storage</strong> enables random access within contiguous blobs using offset and length metadata.</p>\n\n      <h2>HTTP Byte-Range Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Video Player Client\"] -->|\"1. GET /video.mp4 (Range: bytes=1048576-2097151)\"| CDN[\"Cloudflare Edge CDN\"]\n    CDN -->|\"2. Forward Range Request\"| ObjectStore[\"Object Storage Engine (S3 / Custom)\"]\n    ObjectStore -->|\"3. Read Index: Seek(1MB), Read(1MB)\"| DiskStorage[(\"NVMe Storage Volume\")]\n    DiskStorage -->|\"4. Return 1MB Buffer\"| ObjectStore\n    ObjectStore -->|\"5. HTTP 206 Partial Content (Content-Range: bytes 1048576-2097151/524288000)\"| Client\n      </div>\n\n      <h2>Implementation Mechanics: Sparse Indexes & Offset Maps</h2>\n      <p>To support sub-millisecond range reads without scanning:</p>\n      <ul>\n        <li><strong>The Index Chunk Table:</strong> Store an auxiliary index file mapping logical offsets to physical block locations. For example, a 10GB video is indexed in 4MB chunk intervals: <code>chunk_0 -> block_id_492</code>, <code>chunk_1 -> block_id_812</code>.</li>\n        <li><strong>The POSIX <code>pread()</code> System Call:</strong> Traditional <code>lseek()</code> + <code>read()</code> modifies the kernel file pointer, making it unsafe for concurrent threads. <code>pread(fd, buf, count, offset)</code> performs thread-safe atomic reads at an explicit offset without locking.</li>\n        <li><strong>Virtual File Aggregation:</strong> Engines like Facebook Haystack aggregate millions of small images into single 100GB container files. An in-memory index maps <code>photo_id -> { haystack_file_id, byte_offset, size }</code>, avoiding OS file handle exhaustion.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Byte-range storage uses HTTP 206 Partial Content and pread() to access sub-regions of massive files without downloading the full blob.",
      "Auxiliary index tables map logical byte intervals to physical storage block IDs for constant-time seek operations.",
      "Large container files aggregate millions of small assets to prevent filesystem inode exhaustion."
    ],
    "furtherReading": [
      {
        "title": "Facebook Engineering: Finding a Needle in Haystack (Photo Storage)",
        "url": "https://www.usenix.org/legacy/event/osdi10/tech/full_papers/Beaver.pdf"
      }
    ]
  },
  "immutable-versioned-data-files": {
    "title": "Immutable versioned data files",
    "video": {
      "youtubeId": "RvaMHMxHjp4",
      "title": "Object Storage in System Design Interviews w/ Ex-Meta Staff Engineer",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Copy-on-Write (CoW) & Persistent Data Structures</h2>\n      <p>Traditional database engines (like MySQL InnoDB) overwrite pages in-place. If the server crashes mid-write, the page is corrupt (torn write), requiring complex Doublewrite Buffers and WAL replay. <strong>Immutable storage engines</strong> (LMDB, CouchDB, ZFS, Apache Iceberg) never overwrite existing data on disk. Instead, every mutation writes a new version of the page and swings an atomic root pointer.</p>\n\n      <h2>Copy-on-Write B-Tree Pointer Swapping</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph Version1 [\"Version 1 (Old Root: Pointer A)\"]\n      R1[\"Root Page V1\"] --> N1[\"Internal Node 1\"]\n      R1 --> N2[\"Internal Node 2\"]\n      N1 --> L1[\"Leaf Page A (Unchanged)\"]\n      N1 --> L2[\"Leaf Page B (Target of Update)\"]\n    end\n\n    subgraph Version2 [\"Version 2 (New Root: Pointer B)\"]\n      R2[\"Root Page V2 (New)\"] --> N1New[\"Internal Node 1 (New)\"]\n      R2 --> N2\n      N1New --> L1\n      N1New --> L2New[\"Leaf Page B' (Updated Copy)\"]\n    end\n      </div>\n\n      <h2>Why Immutability Eliminates Concurrency Locks</h2>\n      <ul>\n        <li><strong>Lock-Free Readers:</strong> Readers take a reference to the active root pointer at transaction start. Because pages are immutable, readers traverse the tree with zero locks, zero latches, and zero risk of reading inconsistent or partial writes.</li>\n        <li><strong>Single Atomic Root Swap:</strong> When a writer finishes constructing the new branch, it must persist the new pages before publishing durable commit metadata that identifies the new root. Implementations commonly use checksummed or redundant metadata pages, a WAL, and explicit flush ordering so recovery can select a complete generation after a crash; a CPU-atomic pointer store alone is not a durable commit.</li>\n        <li><strong>Instant Time Travel & Snapshots:</strong> Creating a snapshot is free: simply preserve the root pointer of that version. Older versions are reclaimed by background garbage collection only when all referencing reader transactions terminate.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Copy-on-write preserves older pages while building a new generation, but commit metadata, flush ordering, checksums, and writer coordination still determine crash safety.",
      "Immutable published pages can let readers avoid page-update latches when lifetime and reclamation are coordinated correctly.",
      "A CoW commit publishes a new root only after its referenced pages are durable, and recovery must distinguish a complete generation from a torn publication."
    ],
    "furtherReading": [
      {
        "title": "Howard Chu: LMDB Architecture and Implementation",
        "url": "http://www.lmdb.tech/doc/"
      }
    ]
  },
  "log-structured-storage": {
    "title": "Log-structured storage",
    "video": {
      "youtubeId": "wI4hKwl1Cn4",
      "title": "How does the database guarantee reliability using write-ahead logging?",
      "channel": "Arpit Bhayani"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Core Thesis of Log-Structured Systems</h2>\n      <p>In 1991, Mendel Rosenblum and John Ousterhout published the seminal paper on Log-Structured File Systems (LFS). Their core thesis remains the foundation of high-performance database engineering today: <strong>Disks are sequential write beasts, but random write cripples</strong>. By transforming all updates, deletes, and insertions into a single append-only sequential log, write performance approaches theoretical hardware limits.</p>\n\n      <h2>Log-Structured Write Flow</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    Writes[\"Random Application Writes: (K1, V1), (K8, V2), (K3, V3)\"] --> AppendBuffer[\"In-Memory Buffer / Memtable\"]\n    AppendBuffer -->|\"Sequential Flushes\"| LogSegment1[\"Log Segment 001.log (Immutable)\"]\n    AppendBuffer -->|\"Sequential Flushes\"| LogSegment2[\"Log Segment 002.log (Immutable)\"]\n    AppendBuffer -->|\"Active Tail\"| ActiveLog[\"Active Segment 003.log (Append Only)\"]\n      </div>\n\n      <h2>The Fundamental Challenge: The Cleaner & Space Reclaim</h2>\n      <p>Because every update appends a new record and every delete appends a tombstone, the log consumes infinite disk space over time. A log-structured engine requires a background <strong>Cleaner / Compaction Engine</strong>:</p>\n      <ol>\n        <li>The cleaner selects cold or fragmented log segments.</li>\n        <li>It reads the segment into RAM and identifies the latest valid version of each key by consulting an index.</li>\n        <li>It discards overwritten values and tombstones.</li>\n        <li>It writes the active surviving records into a new, contiguous log segment and unlinks the old files.</li>\n      </ol>\n    </div>",
    "keyTakeaways": [
      "Log-structured storage converts all random updates into high-throughput sequential disk appends.",
      "Deletions and updates leave obsolete versions in place, requiring background compaction to reclaim space.",
      "LFS principles power modern storage engines including RocksDB, Bigtable, Kafka, and Cassandra."
    ],
    "furtherReading": [
      {
        "title": "Rosenblum & Ousterhout: The Design and Implementation of a Log-Structured File System",
        "url": "https://people.eecs.berkeley.edu/~brewer/cs262/LFS.pdf"
      }
    ]
  },
  "bitcask-storage-engine": {
    "title": "Bitcask storage engine",
    "video": {
      "youtubeId": "wI4hKwl1Cn4",
      "title": "How does the database guarantee reliability using write-ahead logging?",
      "channel": "Arpit Bhayani"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: The Bitcask Architecture</h2>\n      <p>Originated as the default storage engine for Basho's Riak distributed database, <strong>Bitcask</strong> is an ultra-fast key-value storage engine designed for workloads where the entire keyspace fits in RAM, but values exceed available memory. It provides predictable $O(1)$ read and write latencies with zero disk seeks on write and exactly one disk seek on read.</p>\n\n      <h2>Bitcask Internal Components</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph RAM [\"In-Memory Hash Table: 'Keydir'\"]\n      KD1[\"'user:101' -> {file_id: 2, offset: 512, size: 128, ts: 16900010}\"]\n      KD2[\"'user:102' -> {file_id: 2, offset: 640, size: 96, ts: 16900015}\"]\n    end\n\n    subgraph DiskFiles [\"Disk Storage: Segment Files\"]\n      Active[\"Active File (Append-Only: Write Allowed)\"]\n      Older1[\"Immutable File 001.data (Read-Only)\"]\n      Older2[\"Immutable File 002.data (Read-Only)\"]\n    end\n\n    WriteOp[\"Write: Set(K, V)\"] -->|\"1. Append Record\"| Active\n    Active -->|\"2. Return Offset\"| KD1\n    ReadOp[\"Read: Get(K)\"] -->|\"1. Lookup Offset\"| KD1\n    KD1 -->|\"2. pread(offset, size)\"| Older2\n      </div>\n\n      <h2>Compaction & The Hint File Optimization</h2>\n      <p>When log segments accumulate stale records, a background merge process reads immutable data files and writes only the latest valid keys to new files. To prevent having to read multi-gigabyte data files on restart to rebuild the in-memory Keydir, Bitcask writes a companion <strong>Hint File</strong> alongside each merged data file.</p>\n      <p>The hint file contains the exact same structure as the data file, but <em>omits the values</em>. On startup, Bitcask scans the tiny hint files linearly into RAM, rebuilding the million-key Keydir in seconds.</p>\n    </div>",
    "keyTakeaways": [
      "Bitcask stores all keys in an in-memory hash table (Keydir) and all values in append-only disk segments.",
      "Reads require exactly 1 disk seek; writes are sequential appends requiring 0 seeks.",
      "Hint files store keys and byte offsets without values, enabling instant startup and crash recovery."
    ],
    "furtherReading": [
      {
        "title": "Basho: Bitcask Architecture Whitepaper",
        "url": "https://riak.com/assets/bitcask-intro.pdf"
      }
    ]
  },
  "lsm-tree-storage-engine": {
    "title": "LSM-tree storage engine",
    "video": {
      "youtubeId": "I6jB0nM9SKU",
      "title": "The Secret Sauce Behind NoSQL: LSM Tree",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Log-Structured Merge-Tree (LSM-Tree)</h2>\n      <p>While Bitcask requires all keys to fit in memory, real-world big-data systems (Google Bigtable, Apache Cassandra, RocksDB, ScyllaDB) handle datasets where both keys and values vastly exceed RAM. The <strong>LSM-Tree</strong> organizes sorted data into a memory buffer and a hierarchy of disk-resident levels, enabling high write throughput, efficient range scans, and dense data compression.</p>\n\n      <h2>The Multi-Tier LSM-Tree Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Application Write\"] --> WAL[\"Write-Ahead Log (Disk: Append-Only)\"]\n    Client --> Memtable[\"Active Memtable: SkipList (RAM)\"]\n    \n    Memtable -->|\"Flushed when full (64MB)\"| ImmMemtable[\"Immutable Memtable (RAM)\"]\n    ImmMemtable -->|\"Background Flush\"| L0[\"Level 0 SSTables (Disk: Keys Overlap)\"]\n    \n    L0 -->|\"Leveled Compaction\"| L1[\"Level 1 SSTables (Disk: Non-Overlapping)\"]\n    L1 -->|\"Leveled Compaction (10x Size)\"| L2[\"Level 2 SSTables (Disk: Non-Overlapping)\"]\n      </div>\n\n      <h2>Core Invariants of the LSM-Tree</h2>\n      <ul>\n        <li><strong>Sorted Invariant:</strong> Data inside every Memtable and SSTable is strictly sorted by key. This enables binary search within blocks, efficient merge-sort during compaction, and fast range scans.</li>\n        <li><strong>Immutability Invariant:</strong> Once an SSTable is written to disk, it is NEVER modified. Deletes and updates are handled by appending newer entries or tombstones.</li>\n        <li><strong>Compaction-dependent layout:</strong> Level 0 files commonly overlap. Leveled compaction usually keeps files within each lower level non-overlapping, while size-tiered or universal strategies may retain overlapping sorted runs. The read path must follow the selected strategy's invariant.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "LSM-trees buffer writes in memory (Memtable) and persist them as immutable sorted files (SSTables).",
      "Data is always kept sorted by key, enabling range queries and merge-sort compaction.",
      "RocksDB and Cassandra use LSM-trees to absorb massive write workloads with minimal write latency."
    ],
    "furtherReading": [
      {
        "title": "O'Neil et al.: The Log-Structured Merge-Tree (Original 1996 Paper)",
        "url": "https://www.cs.umb.edu/~poneil/lsmtree.pdf"
      }
    ]
  },
  "memtable-wal-and-sstable": {
    "title": "Memtable, WAL, and SSTable",
    "video": {
      "youtubeId": "I6jB0nM9SKU",
      "title": "The Secret Sauce Behind NoSQL: LSM Tree",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Triad of LSM Engines: Write Path Deep Dive</h2>\n      <p>Every write operation in an LSM-tree database coordinates between three distinct components to guarantee immediate durability, high concurrency, and rapid searchability.</p>\n\n      <h2>The Write Path Coordination</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    Req[\"Mutation: Put(Key, Val)\"] --> WAL[\"1. Append to WAL (Disk: O_APPEND)\"]\n    Req --> Memtable[\"2. Insert into SkipList (DRAM)\"]\n    Memtable --> LimitCheck{\"Memtable Full? (> 64MB)\"}\n    LimitCheck -->|\"No\"| Ack[\"Return Success to Client\"]\n    LimitCheck -->|\"Yes\"| Freeze[\"Freeze as Immutable Memtable\"]\n    Freeze --> FlushWorker[\"Background Flush Thread\"]\n    FlushWorker --> SSTable[\"Write New SSTable to L0 (Disk)\"]\n    SSTable --> Truncate[\"Truncate Obsolete WAL Log\"]\n      </div>\n\n      <h2>Under the Hood: Component Mechanics</h2>\n      <h3>1. The Write-Ahead Log (WAL)</h3>\n      <p>Because the in-memory Memtable is volatile, a server power failure would lose uncommitted writes. Before inserting into the Memtable, the engine appends the operation to the WAL on disk. Because the WAL is append-only, disk throughput reaches hundreds of megabytes per second. Upon recovery, the engine replays the WAL to reconstruct the Memtable.</p>\n\n      <h3>2. The Memtable (Concurrent SkipList)</h3>\n      <p>The Memtable is an in-memory sorted collection. While red-black trees require complex rebalancing that locks large portions of the tree, <strong>ConcurrentSkipLists</strong> use lock-free atomic compare-and-swap (CAS) pointers. Multiple application threads can write concurrently without mutex contention while maintaining sorted key order.</p>\n\n      <h3>3. The Sorted String Table (SSTable)</h3>\n      <p>When the Memtable exceeds its threshold (typically 64MB or 128MB), it transitions to an immutable state and a fresh Memtable is allocated. A background thread iterates over the sorted Memtable sequentially, writing it to disk as an <strong>SSTable</strong>. An SSTable consists of data blocks (typically 4KB compressed), an index block mapping keys to block offsets, and a Bloom filter.</p>\n    </div>",
    "keyTakeaways": [
      "WAL guarantees durability via fast sequential appends, while Memtable provides fast concurrent in-memory sorting.",
      "SkipLists are preferred over balanced trees for Memtables because CAS pointers allow lock-free concurrent writes.",
      "Flushing Memtables sequentially writes immutable SSTables containing data blocks, sparse indexes, and Bloom filters."
    ],
    "furtherReading": [
      {
        "title": "RocksDB Architecture Guide: Memtable and WAL",
        "url": "https://github.com/facebook/rocksdb/wiki/RocksDB-Basics"
      }
    ]
  },
  "lsm-read-path-bloom-and-sparse-index": {
    "title": "LSM read path: Bloom filters and sparse index",
    "video": {
      "youtubeId": "a6TCF1BUovU",
      "title": "What is a Bloom Filter? | System Design",
      "channel": "Anand Pandey"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The LSM Read Penalty (Read Amplification)</h2>\n      <p>While LSM-trees achieve stellar write throughput, read operations face a significant challenge: a key may reside in the active Memtable, an immutable Memtable, or across multiple SSTables spanning several disk levels. Without optimizations, a single <code>Get(key)</code> could require dozens of random disk reads. To achieve sub-millisecond reads, modern LSM engines combine <strong>Sparse Indexes</strong> and <strong>Bloom Filters</strong>.</p>\n\n      <h2>The Multi-Layer Read Pipeline</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Req[\"Client: Get('user:8821')\"] --> CheckMem[\"1. Active Memtable (RAM)\"]\n    CheckMem -->|\"Hit\"| Return[\"Return Value\"]\n    CheckMem -->|\"Miss\"| CheckImm[\"2. Immutable Memtables (RAM)\"]\n    CheckImm -->|\"Hit\"| Return\n    CheckImm -->|\"Miss\"| CheckBloom{\"3. Check Bloom Filter (RAM)\"}\n    \n    CheckBloom -->|\"Negative (Definite No)\"| SkipSST[\"Skip SSTable Entirely (0 Disk Reads)\"]\n    CheckBloom -->|\"Positive (Maybe)\"| SparseIndex[\"4. Binary Search Sparse Index (RAM)\"]\n    \n    SparseIndex --> FetchBlock[\"5. Read 4KB Block from SSTable (Disk)\"]\n    FetchBlock --> SearchBlock[\"6. Binary Search Inside Block\"]\n    SearchBlock --> Return\n      </div>\n\n      <h2>Under the Hood: Bloom Filter Mathematics</h2>\n      <p>A Bloom filter is a space-efficient probabilistic data structure that tests set membership with <strong>zero false negatives</strong> (if it says the key is not in the SSTable, it is 100% guaranteed not to be there) and a tunable false positive rate $p$.</p>\n      <p>Given $n$ keys and target false positive probability $p$, the optimal number of bits $m$ and hash functions $k$ are:</p>\n      <pre><code>m = - (n * ln(p)) / (ln(2)^2)\nk = (m / n) * ln(2)</code></pre>\n      <p>Allocating just <strong>10 bits per key</strong> achieves a false positive rate of $\\sim 1\\%$, allowing the engine to bypass physical disk reads for 99% of non-existent key lookups.</p>\n\n      <h2>The Sparse Index</h2>\n      <p>Rather than indexing every single key in the SSTable (which would consume excessive RAM), the engine creates a <strong>Sparse Index</strong> storing only one key for every 4KB data block (the first key of each block). To find key $K$, the engine performs a binary search in RAM over the sparse index to identify the single 4KB block that could contain $K$, and reads only that 4KB chunk from disk.</p>\n    </div>",
    "keyTakeaways": [
      "Bloom filters eliminate 99% of negative disk reads by guaranteeing zero false negatives using ~10 bits per key in RAM.",
      "Sparse indexes store only one boundary key per 4KB disk block, minimizing memory footprint while directing reads to exact disk blocks.",
      "The read path queries in order: Active Memtable -> Immutable Memtables -> Level 0 SSTables -> Level 1..N SSTables."
    ],
    "furtherReading": [
      {
        "title": "Google Guava BloomFilter Implementation & Math",
        "url": "https://github.com/google/guava/wiki/HashingExplained"
      }
    ]
  },
  "compaction-and-amplification": {
    "title": "Compaction and amplification",
    "video": {
      "youtubeId": "I6jB0nM9SKU",
      "title": "The Secret Sauce Behind NoSQL: LSM Tree",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Garbage Collection for Storage Engines</h2>\n      <p>Because LSM-trees never overwrite data in place, updates and deletes create duplicate entries and tombstones that accumulate across SSTable files. Without maintenance, disk space would grow indefinitely and read performance would degrade catastrophically. <strong>Compaction</strong> is the background merge-sort process that reconciles versions, purges tombstones, and reorganizes data.</p>\n\n      <h2>Size-Tiered Compaction (STCS) vs Leveled Compaction (LCS)</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph STCS [\"Size-Tiered Compaction (Cassandra Style)\"]\n      T1[\"SSTable A (~100MB)\"]\n      T2[\"SSTable B (~100MB)\"]\n      T3[\"SSTable C (~100MB)\"]\n      T4[\"SSTable D (~100MB)\"]\n      T1 & T2 & T3 & T4 -->|\"Merge Sort\"| LargeT[\"New Single SSTable (~400MB)\"]\n    end\n\n    subgraph LCS [\"Leveled Compaction (RocksDB Style)\"]\n      L0S[\"L0: Overlapping Files\"] -->|\"Compaction\"| L1S[\"L1: 10MB Non-Overlapping Files (Total: 10MB)\"]\n      L1S -->|\"10x Growth\"| L2S[\"L2: 10MB Non-Overlapping Files (Total: 100MB)\"]\n      L2S -->|\"10x Growth\"| L3S[\"L3: 10MB Non-Overlapping Files (Total: 1GB)\"]\n    end\n      </div>\n\n      <h2>Compaction Strategies Compared</h2>\n      <table>\n        <thead>\n          <tr><th>Metric</th><th>Size-Tiered Compaction (STCS)</th><th>Leveled Compaction (LCS)</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>Algorithm</strong></td><td>Triggers when $N$ SSTables of similar size accumulate in a tier. Merges them into one larger SSTable.</td><td>Each level $L$ has a fixed capacity ($10\times L_{prev}$). Merges an SSTable from $L$ into overlapping SSTables in $L+1$.</td></tr>\n          <tr><td><strong>Write Amplification</strong></td><td><strong>Low</strong> (~4x - 8x): Data is rewritten fewer times during its lifecycle.</td><td><strong>High</strong> (~15x - 30x): Data is rewritten repeatedly at each level down to the base tier.</td></tr>\n          <tr><td><strong>Space Amplification</strong></td><td><strong>High</strong> (Up to 100%): Requires 50% free disk headroom to perform merges of giant files.</td><td><strong>Low</strong> (~10% - 20%): Non-overlapping levels guarantee minimal redundant versions.</td></tr>\n          <tr><td><strong>Read Performance</strong></td><td>Moderate: Point reads must probe multiple overlapping SSTables in each tier.</td><td><strong>Exceptional</strong>: Non-overlapping files guarantee a key exists in at most ONE SSTable per level.</td></tr>\n        </tbody>\n      </table>\n    </div>",
    "keyTakeaways": [
      "Compaction is the multi-way merge sort that reclaims space from obsolete versions and tombstones.",
      "Size-Tiered Compaction minimizes write amplification, making it ideal for write-heavy append workloads (Cassandra).",
      "Leveled Compaction minimizes space amplification and maximizes read performance, making it the standard for RocksDB."
    ],
    "furtherReading": [
      {
        "title": "RocksDB Leveled Compaction Architecture",
        "url": "https://github.com/facebook/rocksdb/wiki/Leveled-Compaction"
      }
    ]
  },
  "object-storage-vs-database": {
    "title": "Object storage vs database",
    "video": {
      "youtubeId": "RvaMHMxHjp4",
      "title": "Object Storage in System Design Interviews w/ Ex-Meta Staff Engineer",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: The Three Storage Abstractions</h2>\n      <p>Enterprise infrastructure categorizes persistent storage into three distinct fundamental primitives: <strong>Block Storage</strong>, <strong>File Storage</strong>, and <strong>Object Storage</strong>. Choosing the wrong primitive leads to catastrophic scaling bottlenecks and astronomical cloud bills.</p>\n\n      <h2>Storage Primitive Comparison</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph Block [\"1. Block Storage (EBS / SAN)\"]\n      B1[\"Raw 512B / 4KB Sectors\"] --> OS[\"Filesystem mounted by single OS kernel (ext4, XFS)\"]\n    end\n\n    subgraph File [\"2. File Storage (EFS / NFS)\"]\n      F1[\"POSIX Tree Hierarchy (/usr/bin/...)\"] --> Locks[\"Distributed locking and shared network mounts\"]\n    end\n\n    subgraph Object [\"3. Object Storage (S3 / GCS)\"]\n      O1[\"Flat Namespace (Bucket + Key)\"] --> REST[\"HTTP REST API (GET, PUT, DELETE) - Immutable Blobs\"]\n    end\n      </div>\n\n      <h2>Detailed Architectural Differences</h2>\n      <table>\n        <thead>\n          <tr><th>Feature</th><th>Relational / NoSQL Database</th><th>Object Storage (S3 / GCS)</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>Data Granularity</strong></td><td>Fine-grained: Mutate single columns, rows, or key-value fields.</td><td>Coarse-grained: Entire immutable blobs (bytes 0 to $N$). In-place mutation is impossible.</td></tr>\n          <tr><td><strong>Access Protocol</strong></td><td>Binary database protocols (TCP sockets, prepared statements, gRPC).</td><td>HTTP/1.1 and HTTP/2 REST APIs (<code>PUT /bucket/key</code>, <code>GET /bucket/key</code>).</td></tr>\n          <tr><td><strong>Latency Profile</strong></td><td>Sub-millisecond to low single-digit milliseconds ($100\\mu\text{s} - 5\text{ms}$).</td><td>Tens of milliseconds ($20\text{ms} - 80\text{ms}$) time-to-first-byte (TTFB).</td></tr>\n          <tr><td><strong>Throughput & Scaling</strong></td><td>Bound by cluster instance size and replication topologies.</td><td>Virtually infinite: Scale to millions of concurrent requests across petabytes.</td></tr>\n          <tr><td><strong>Cost per Gigabyte</strong></td><td>High (~$0.10 - $0.50 / GB / month on managed SSD volumes).</td><td>Ultra-Low (~$0.015 - $0.023 / GB / month on standard tiers).</td></tr>\n        </tbody>\n      </table>\n    </div>",
    "keyTakeaways": [
      "Databases provide low-latency sub-millisecond access to mutable, fine-grained structured records.",
      "Object storage provides named blob versions over an HTTP API; keys can usually be overwritten or deleted, while retained versions may be immutable. Cost and latency depend on provider, tier, request mix, and data transfer.",
      "For large independently accessed payloads, compare object storage with database blobs using transactionality, backup, access size, request cost, and operational simplicity rather than applying a universal prohibition."
    ],
    "furtherReading": [
      {
        "title": "AWS S3 Documentation: Overview of Object Storage",
        "url": "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html"
      }
    ]
  },
  "s3-object-storage-architecture": {
    "title": "S3 object storage architecture",
    "video": {
      "youtubeId": "RvaMHMxHjp4",
      "title": "Object Storage in System Design Interviews w/ Ex-Meta Staff Engineer",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>A representative disaggregated object-storage architecture</h2>\n      <p>Large object stores commonly separate metadata lookup from payload placement. The topology below is a representative design, not a claim that AWS publicly uses these exact chunk sizes, coding parameters, databases, or placement rules for every S3 object.</p>\n\n      <h2>S3 Disaggregated System Topology</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Client HTTP Request: PUT /photos/vacation.jpg\"] --> Edge[\"S3 Frontend API Gateway\"]\n    \n    subgraph MetadataPlane [\"Metadata Plane (AWS ShardStore)\"]\n      Edge -->|\"1. Resolve bucket & permissions\"| MetaEngine[\"LSM-Tree Metadata Index (Sharded Key-Value)\"]\n      MetaEngine -->|\"2. Record object metadata, version, ETag\"| MetaStore[(\"Distributed Inode & Parts DB\")]\n    end\n    \n    subgraph PayloadPlane [\"Payload Storage Plane (Chunk Nodes)\"]\n      Edge -->|\"3. Stream 64MB Chunks\"| ChunkManager[\"Storage Node Orchestrator\"]\n      ChunkManager -->|\"4. Reed-Solomon Erasure Coding (8+4)\"| StorageNodes[\"Fragments placed across independent failure domains\"]\n    end\n      </div>\n\n      <h2>Internal Subsystems of S3</h2>\n      <ul>\n        <li><strong>Frontend API Routers:</strong> Thousands of stateless reverse proxies terminating TLS, validating AWS SigV4 cryptographic signatures, and enforcing per-prefix rate limits.</li>\n        <li><strong>Metadata Subsystem (ShardStore):</strong> A specialized key-value store optimized for lexicographical prefix scanning. Because S3 supports list operations (<code>GET /bucket?prefix=users/</code>), the metadata tier organizes keys in partitioned B-trees or LSM-trees rather than simple hash rings.</li>\n        <li><strong>Storage Node Fleet:</strong> Commodity servers packed with 3.5-inch high-density HDDs. Chunks are appended sequentially to giant container files, bypassing OS filesystem bottlenecks.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "A scalable object-store design can separate a strongly controlled metadata plane from a payload storage plane.",
      "Payloads may be chunked, replicated or erasure-coded across independent failure domains according to the service's durability contract.",
      "The metadata engine indexes keys lexicographically to support fast delimiter and prefix searches."
    ],
    "furtherReading": [
      {
        "title": "Amazon Science: Using Lightweight Formal Methods to Validate S3 (ShardStore)",
        "url": "https://www.amazon.science/publications/using-lightweight-formal-methods-to-validate-a-key-value-storage-node-in-amazon-s3"
      }
    ]
  },
  "range-partitioning-vs-consistent-hashing-storage": {
    "title": "Range partitioning vs consistent hashing for storage",
    "video": {
      "youtubeId": "zaRkONvyGr8",
      "title": "What is CONSISTENT HASHING and Where is it used?",
      "channel": "Gaurav Sen"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Fundamental Partitioning Dilemma</h2>\n      <p>When a storage system grows beyond a single physical server, the keyspace must be split across hundreds or thousands of nodes. Distributed systems rely on two foundational partitioning paradigms: <strong>Range Partitioning</strong> and <strong>Consistent Hashing</strong>.</p>\n\n      <h2>Architectural Comparison</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph RangePart [\"Range Partitioning (Bigtable / Spanner / HBase)\"]\n      RNode1[\"Node 1: Keys a to g\"]\n      RNode2[\"Node 2: Keys g to p\"]\n      RNode3[\"Node 3: Keys p to z\"]\n    end\n\n    subgraph HashPart [\"Consistent Hashing (Dynamo / Cassandra / Riak)\"]\n      Ring[\"Token Ring [0 .. 2^64-1]\"]\n      HNode1[\"Node A (Token 1000)\"]\n      HNode2[\"Node B (Token 5000)\"]\n      HNode3[\"Node C (Token 9000)\"]\n    end\n      </div>\n\n      <h2>Tradeoff Matrix</h2>\n      <table>\n        <thead>\n          <tr><th>Dimension</th><th>Range Partitioning</th><th>Consistent Hashing</th></tr>\n        </thead>\n        <tbody>\n          <tr><td><strong>Range Queries</strong></td><td><strong>Extremely Efficient</strong>: Sequential keys reside on contiguous nodes. <code>BETWEEN '2026-01-01' AND '2026-01-31'</code> hits exactly 1-2 nodes.</td><td><strong>Terrible</strong>: Adjacent keys hash to completely random positions on the ring. Range queries require scatter-gather across 100% of nodes.</td></tr>\n          <tr><td><strong>Hot Spot Vulnerability</strong></td><td><strong>High</strong>: Monotonically increasing keys (auto-increment IDs, timestamps) direct 100% of write traffic to the single tail partition.</td><td>Spreads distinct sequential keys, but a single hot key or skewed request distribution can still overload one owner.</td></tr>\n          <tr><td><strong>Metadata Coordination</strong></td><td>Requires a centralized Partition Manager / Coordinator to track split boundaries and rebalance tablets.</td><td>Decentralized: Nodes determine partition ownership locally via token ring ranges and gossip protocols.</td></tr>\n        </tbody>\n      </table>\n    </div>",
    "keyTakeaways": [
      "Range partitioning keeps data sorted, enabling ultra-fast range queries but risking severe write hotspots on sequential keys.",
      "Consistent hashing uniformly distributes writes across nodes via hash tokens, but makes multi-key range scans prohibitively expensive.",
      "Spanner and Bigtable choose Range Partitioning; Cassandra and DynamoDB choose Consistent Hashing."
    ],
    "furtherReading": [
      {
        "title": "Google Spanner: Becoming a Globally Distributed Database",
        "url": "https://research.google/pubs/pub39966/"
      }
    ]
  },
  "partition-manager-and-map-table": {
    "title": "Partition manager and map table",
    "video": {
      "youtubeId": "5faMjKuB9bc",
      "title": "What is DATABASE SHARDING?",
      "channel": "Gaurav Sen"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Coordinating Range-Partitioned Tablets</h2>\n      <p>In range-partitioned storage engines (like Google Bigtable, CockroachDB, and Apache HBase), data is divided into contiguous dynamic ranges called <strong>Tablets</strong> or <strong>Ranges</strong>. As tablets grow through writes, they must split and migrate across the server fleet. The <strong>Partition Manager</strong> and <strong>Routing Map Table</strong> orchestrate this distributed metadata.</p>\n\n      <h2>Three-Level Routing Hierarchy (Bigtable Model)</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Client SDK\"] -->|\"1. Fetch Root Location\"| Chubby[\"Chubby / Etcd Consensus Lock Service\"]\n    Chubby -->|\"Points to\"| RootTablet[\"Root Tablet (Metadata Level 1)\"]\n    RootTablet -->|\"Points to\"| MetaTablets[\"Metadata Tablets (Metadata Level 2)\"]\n    MetaTablets -->|\"Points to\"| UserTablets[\"User Data Tablets (Thousands of Nodes)\"]\n    Client -->|\"2. Cache Routing Entries Locally\"| LocalCache[\"Client Route Cache\"]\n      </div>\n\n      <h2>Under the Hood: The 2-Phase Tablet Split</h2>\n      <p>When a user tablet exceeds a size threshold (e.g. 256MB):</p>\n      <ol>\n        <li>The tablet server hosting the range picks the median key and splits the tablet into two child ranges locally.</li>\n        <li>Because underlying SSTable data files are immutable, the split is instantaneous: child tablets reference the parent's SSTables with restricted start/end key boundaries (zero data copying).</li>\n        <li>The tablet server issues a two-phase transaction to the Metadata Table to register the two new child ranges and delete the parent range.</li>\n        <li>Clients querying the old range receive a <code>StaleRoutingException</code>, invalidate their local routing cache, and fetch fresh pointers from the Metadata Table.</li>\n      </ol>\n    </div>",
    "keyTakeaways": [
      "A 3-level hierarchical metadata table maps hundreds of millions of user ranges with zero central bottleneck.",
      "Clients cache range-to-node routing tables locally; stale cache hits trigger lazy single-round-trip cache invalidations.",
      "Tablet splits are instant metadata-only operations because immutable SSTables are partitioned by key boundaries without copying files."
    ],
    "furtherReading": [
      {
        "title": "Chang et al.: Bigtable: A Distributed Storage System for Structured Data",
        "url": "https://research.google/pubs/pub27898/"
      }
    ]
  },
  "metadata-db-for-object-storage": {
    "title": "Metadata database for object storage",
    "video": {
      "youtubeId": "RvaMHMxHjp4",
      "title": "Object Storage in System Design Interviews w/ Ex-Meta Staff Engineer",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: High-Throughput Inode Engines</h2>\n      <p>In an object storage system, object metadata (bucket, key, size, ETag, owner, ACLs, creation timestamp, and chunk pointers) is tiny (~500 bytes per object), but queries against it are astronomical. The metadata database must support millions of transactions per second, atomic key updates, and instantaneous lexicographical delimiter listings (e.g. <code>GET /bucket?prefix=logs/2026/&delimiter=/</code>).</p>\n\n      <h2>Metadata Schema and Index Architecture</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph Request [\"API Request\"]\n      Req[\"GET /photos/2026/march/beach.jpg\"]\n    end\n\n    subgraph MetaDB [\"Distributed Metadata Storage Tier (FoundationDB / CockroachDB)\"]\n      Schema[\"Primary Key: (bucket_id, object_prefix, object_name, version_id)\"]\n      Attributes[\"Columns: { size: 4194304, etag: 'a1b2c3d4', chunks: [chunk_id_1, chunk_id_2] }\"]\n      PrefixIdx[\"Inverted Prefix Index: 'photos/2026/march/' -> [beach.jpg, sunset.jpg]\"]\n    end\n\n    Req --> Schema\n      </div>\n\n      <h2>Under the Hood: Lexicographical Prefix Traversal</h2>\n      <p>Unlike traditional POSIX filesystems that represent directories as physical inode link trees (which require walking directory paths sequentially), object storage engines treat paths as flat string keys. By storing keys in a sorted B-tree or LSM-tree ordered by <code>(bucket_id, key_name)</code>, listing the contents of a \"virtual directory\" reduces to an efficient range scan from <code>photos/2026/march/</code> to <code>photos/2026/march/\u00ff</code>.</p>\n    </div>",
    "keyTakeaways": [
      "Object storage metadata treats directory paths as flat strings sorted lexicographically in distributed B-tree/LSM stores.",
      "Virtual folder listing reduces to a single contiguous range scan over composite index keys.",
      "Modern hyperscalers power object storage metadata using strongly consistent distributed key-value engines (e.g. FoundationDB)."
    ],
    "furtherReading": [
      {
        "title": "FoundationDB Architecture and ACID Transactions",
        "url": "https://www.foundationdb.org/files/fdb-paper.pdf"
      }
    ]
  },
  "append-only-object-storage-stream-layer": {
    "title": "Append-only stream layer",
    "video": {
      "youtubeId": "RvaMHMxHjp4",
      "title": "Object Storage in System Design Interviews w/ Ex-Meta Staff Engineer",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: The Low-Level Storage Stream Engine</h2>\n      <p>Modern cloud object storage engines (such as Azure Storage and Apache BookKeeper / Pulsar) do not write directly to arbitrary filesystem files. Instead, they operate on top of an internal <strong>Append-Only Stream Layer</strong>. A stream is an unbounded, durable sequence of immutable bytes composed of ordered chunks.</p>\n\n      <h2>The Chunk Append Pipeline</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    Writer[\"Primary Storage Worker\"] -->|\"Append(data)\"| ChunkServer1[\"Storage Node 1 (Primary)\"]\n    ChunkServer1 -->|\"Replicate Append\"| ChunkServer2[\"Storage Node 2 (Replica)\"]\n    ChunkServer1 -->|\"Replicate Append\"| ChunkServer3[\"Storage Node 3 (Replica)\"]\n    \n    ChunkServer2 & ChunkServer3 -->|\"Ack\"| ChunkServer1\n    ChunkServer1 -->|\"Committed Offset\"| Writer\n      </div>\n\n      <h2>Handling Network Partitions: Lease Fencing & Sealed Chunks</h2>\n      <p>The hardest challenge in distributed append-only storage is network split-brain: what happens if a primary storage node experiences a network blip and another node is promoted to take its place?</p>\n      <ul>\n        <li><strong>Sealing Chunks:</strong> To prevent two writers from appending conflicting data to the same chunk, chunks are strictly <strong>sealed</strong>. When a master promotes a new stream writer, it contacts the storage node quorum and updates the chunk status to <code>SEALED</code> at the last universally agreed byte offset.</li>\n        <li><strong>Fencing Tokens:</strong> The new writer is issued a monotonically increasing fencing epoch token. If the zombie old writer attempts an append, the storage node rejects it because its epoch is expired.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Stream layers provide append-only chunk sequences that serve as the durable foundation for object storage.",
      "To prevent split-brain write corruption, chunks are sealed at fixed byte offsets before promoting new writers.",
      "Storage nodes enforce fencing tokens to immediately reject zombie writer nodes."
    ],
    "furtherReading": [
      {
        "title": "Calder et al.: Windows Azure Storage: A Highly Available Cloud Storage Service with Strong Consistency",
        "url": "https://sigops.org/s/conferences/sosp/2011/current/2011-Cascais/printable/11-calder.pdf"
      }
    ]
  },
  "object-storage-durability-and-replication": {
    "title": "Durability and replication",
    "video": {
      "youtubeId": "bI8Ry6GhMSE",
      "title": "Database Replication Explained (in 5 Minutes)",
      "channel": "Aced (formerly Exponent)"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: 11 9s Durability & Reed-Solomon Erasure Coding</h2>\n      <p>Achieving 99.999999999% (11 9s) annual durability means that if you store 10,000,000 objects, you can expect to lose a single object once every 10,000 years. Physical hard drives have an Annualized Failure Rate (AFR) of 1% to 4%. To survive constant disk, server, and datacenter failures at scale, storage architectures transition from simple replication to <strong>Reed-Solomon Erasure Coding</strong>.</p>\n\n      <h2>Replication (3x) vs Erasure Coding (8+4)</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    subgraph Rep [\"3-Way Replication (300% Overhead)\"]\n      Data[\"Original 100MB Blob\"] --> R1[\"Copy 1 (100MB)\"]\n      Data --> R2[\"Copy 2 (100MB)\"]\n      Data --> R3[\"Copy 3 (100MB)\"]\n      Note1[\"Total Storage: 300MB. Can survive 2 disk failures.\"]\n    end\n\n    subgraph EC [\"Reed-Solomon 8+4 Erasure Coding (150% Overhead)\"]\n      ECData[\"Original 100MB Blob\"] --> Split[\"Split into 8 Data Chunks (12.5MB each)\"]\n      Split --> Parity[\"Generate 4 Parity Chunks via Galois Field Matrix Math\"]\n      Parity --> Distribute[\"Distribute 12 chunks across independent failure domains\"]\n      Note2[\"Total Storage: 150MB. Can survive ANY 4 simultaneous disk or rack failures!\"]\n    end\n      </div>\n\n      <h2>Under the Hood: Erasure Coding Math</h2>\n      <p>An $RS(k, m)$ scheme splits an object into $k$ data fragments and generates $m$ parity fragments using matrix multiplication over Galois finite fields $GF(2^w)$:</p>\n      <ul>\n        <li><strong>Storage Overhead:</strong> $\frac{k + m}{k}$. For $RS(8, 4)$, the overhead is $\frac{12}{8} = 1.5\times$ (50% storage overhead), compared to $3.0\times$ (200% overhead) for 3-way replication.</li>\n        <li><strong>Fault Tolerance:</strong> The system can reconstruct the entire original object from <em>any</em> $k$ surviving fragments out of the total $k + m$ fragments. In an $RS(8, 4)$ cluster, the code can tolerate any four unavailable fragments. Real durability also depends on placing fragments in independent failure domains, detecting corruption, repairing before additional losses, and keeping metadata recoverable.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "3-way replication incurs a 200% storage overhead and survives 2 drive failures.",
      "Reed-Solomon Erasure Coding (e.g. 8+4) reduces storage overhead to 50% while surviving 4 simultaneous rack/drive failures.",
      "Galois field matrix math allows perfect reconstruction of data from any k surviving chunks."
    ],
    "furtherReading": [
      {
        "title": "James Plank: A Tutorial on Reed-Solomon Coding for Fault-Tolerance in RAID-like Systems",
        "url": "http://web.eecs.utk.edu/~jplank/plank/papers/CS-96-332.html"
      }
    ]
  },
  "end-to-end-checksums": {
    "title": "End-to-end checksums",
    "video": {
      "youtubeId": "GAe5oB742dw",
      "title": "ACID Properties in Databases With Examples",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Silent Data Corruption & Bit Rot</h2>\n      <p>Modern storage systems do not fail merely by crashing or throwing I/O errors. Physical hardware experiences <strong>Silent Data Corruption (Bit Rot)</strong>: cosmic rays, voltage fluctuations, firmware bugs in RAID controllers, or cable noise flip bits on disk without returning an operating system error code. High-durability systems implement <strong>End-to-End Cryptographic & Cyclic Redundancy Checksums</strong>.</p>\n\n      <h2>The End-to-End Verification Pipeline</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Client SDK\"] -->|\"1. Compute CRC32C / MD5: '0x8A4B291F'\"| Gateway[\"API Gateway\"]\n    Gateway -->|\"2. Verify Checksum during ingest\"| ChunkServer[\"Storage Node\"]\n    ChunkServer -->|\"3. Write Block + Checksum Footer to Disk\"| Disk[(\"NVMe / HDD Media\")]\n    \n    subgraph Scrubber [\"Background Scrubbing Daemon\"]\n      Cron[\"Weekly Scrubbing Worker\"] -->|\"4. Read Block & Recalculate CRC32C\"| Verifier{\"Checksum Matches Footer?\"}\n      Verifier -->|\"Yes\"| OK[\"Data Valid\"]\n      Verifier -->|\"No (Bit Rot Detected!)\"| Heal[\"Trigger Auto-Repair: Rebuild Chunk via Erasure Coding\"]\n    end\n      </div>\n\n      <h2>Under the Hood: Checksum Algorithms & Hardware Acceleration</h2>\n      <ul>\n        <li><strong>CRC32C (Castagnoli):</strong> The gold standard for storage engines. Modern Intel and AMD x86 CPUs feature dedicated hardware instructions (<code>SSE 4.2 CRC32</code>) capable of calculating CRC32C at memory bus speeds (> 20 GB/s per core).</li>\n        <li><strong>Block-Level Checksum Footers:</strong> Instead of computing one checksum per 100GB file, storage engines compute a 32-bit checksum for every 4KB block. This enables immediate corruption detection during random reads without scanning the entire file.</li>\n        <li><strong>Continuous Background Scrubbing:</strong> A low-priority background daemon continuously reads cold disks sequentially, re-verifies block checksums, and invokes erasure coding repair before a second disk failure causes catastrophic data loss.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Silent bit rot corrupts bytes on physical media without triggering OS or hardware controller errors.",
      "CRC32C is hardware-accelerated by modern CPU instruction sets, delivering checksum verification at over 20GB/s per core.",
      "Continuous background scrubbers detect bit flips early and trigger automatic erasure-code repairs."
    ],
    "furtherReading": [
      {
        "title": "CERN Data Center: Silent Data Corruption in Large Scale Commodity Storage",
        "url": "https://indico.cern.ch/event/13797/contributions/1362288/attachments/115080/163419/chep07-silente-corruption.pdf"
      }
    ]
  }
};
