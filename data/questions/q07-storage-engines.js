window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["storage-engine-design-constraints"] = [
  {
    "id": "storage-engine-design-constraints-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Durable new files",
    "section": "Under the Hood: fsync vs fdatasync vs O_DIRECT",
    "prompt": "An engine creates a new SSTable file, writes it, calls fsync on the file descriptor and returns success. The machine then loses power, and after reboot the file does not exist. What was missing?",
    "options": [
      "An fsync of the containing directory, because the file fsync does not make the new directory entry durable",
      "A second fsync on the file, because the first one only moves pages from the page cache into the block layer",
      "Opening the file with O_DIRECT, which makes both the data and the file name durable on every write",
      "An fdatasync before the fsync, because otherwise the kernel discards the metadata of newly created files"
    ],
    "answer": 0,
    "explanation": "A file fsync persists that file's data and metadata, but publishing a new or renamed name also requires syncing the directory. O_DIRECT only bypasses the page cache; it says nothing about directory entries being durable.",
    "tags": [
      "storage-engine-design-constraints",
      "recall",
      "inline"
    ]
  },
  {
    "id": "storage-engine-design-constraints-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Group commit sizing",
    "section": "Worked example: why group commit exists",
    "prompt": "A service must durably commit 20,000 transactions per second to a single log on a device where one fdatasync takes about 1 ms. What is the minimum average number of commits each flush must carry?",
    "options": [
      "At least 2 commits per flush",
      "At least 20 commits per flush",
      "At least 200 commits per flush",
      "At least 20,000 commits per flush"
    ],
    "answer": 1,
    "explanation": "A 1 ms flush allows at most about 1,000 flushes per second, so 20,000 commits per second needs at least 20 commits per flush. The cost is that each commit waits roughly one flush interval; 200 per flush would work but is ten times more batching than required.",
    "tags": [
      "storage-engine-design-constraints",
      "apply",
      "inline"
    ]
  },
  {
    "id": "storage-engine-design-constraints-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "fsync error handling",
    "section": "Failure modes worth knowing",
    "prompt": "On Linux, your engine's fsync on a data file returns EIO. A retry of the same fsync then returns success. Based on the PostgreSQL experience, what is the safe response?",
    "options": [
      "Trust the retry, because the kernel re-queues the dirty pages after a failed write-back and the second flush persisted them",
      "Switch that file to fdatasync, which keeps dirty pages in the cache after an error so they can be flushed again",
      "Call sync() on the whole filesystem, which re-flushes any pages that the failed fsync dropped from the cache",
      "Treat the failure as fatal, crash, and recover from the WAL, because the failed pages may already have been dropped"
    ],
    "answer": 3,
    "explanation": "PostgreSQL found that a failed fsync could drop the dirty pages, so a later fsync reports success even though the data never reached the device. Trusting the retry is exactly the bug; the only safe path is to treat the error as fatal and replay the WAL.",
    "tags": [
      "storage-engine-design-constraints",
      "staff",
      "inline"
    ]
  },
  {
    "id": "storage-engine-design-constraints-n1",
    "topic": "storage-engine-design-constraints",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Write Amplification and SSD Wear Budget",
    "scenario": "An application writes 50 MB/s of logical updates to a storage engine whose internal write amplification factor (WAF) is 12×.",
    "prompt": "How many megabytes per second (MB/s) of physical flash writes hit the NVMe drive?",
    "question": "How many megabytes per second (MB/s) of physical flash writes hit the NVMe drive?",
    "unit": "MB/s",
    "answer": 600,
    "tolerance": 0.2,
    "hint": "Multiply the 50 MB/s logical write rate by the 12× write amplification factor.",
    "explanation": "At a 12× WAF, 50 MB/s of logical user writes generate 50 × 12 = 600 MB/s of physical flash writes (consuming SSD endurance and saturating I/O bandwidth).",
    "tags": [
      "storage-engine-design-constraints",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "storage-engine-design-constraints-t1",
    "topic": "storage-engine-design-constraints",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: RUM Conjecture (Read, Update/Write, Memory Overhead)",
    "scenario": "You are selecting a storage engine for an IoT telemetry ingestion tier that receives 500,000 append/update events per second per node and only runs batch compaction and occasional time-range reads.",
    "prompt": "According to the RUM Conjecture, which storage engine architecture fits this workload best, and why?",
    "question": "According to the RUM Conjecture, which storage engine architecture fits this workload best, and why?",
    "options": [
      "In-place B+Tree with 6 secondary indexes and small 4 KB pages",
      "Uncompressed in-memory hash table with no disk persistence",
      "Log-Structured Merge (LSM) tree with append-only WAL + MemTable and leveled/tiered SSTable compaction"
    ],
    "correctOption": 2,
    "reasons": [
      "B+Trees convert every random key write into sequential disk appends",
      "Dropping disk persistence satisfies telemetry durability requirements",
      "The RUM Conjecture states you can optimize at most two of Read, Update, and Memory overhead; LSM trees optimize Update (sequential writes) and space efficiency at the cost of bounded multi-SSTable Read amplification"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Which storage structure turns random key updates into sequential disk writes?",
    "explanation": "B+Trees optimize read latency at the cost of random in-place page rewrites (high write amplification), whereas LSM trees convert random writes into sequential WAL + SSTable flushes.",
    "tags": [
      "storage-engine-design-constraints",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["storage-engine-tradeoffs"] = [
  {
    "id": "storage-engine-tradeoffs-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "The M in RUM",
    "section": "Under the Hood: The RUM Conjecture",
    "prompt": "In the RUM Conjecture as this lesson defines it, what does the M (memory overhead) measure?",
    "options": [
      "Disk-space amplification caused by obsolete versions waiting for compaction",
      "Auxiliary in-memory state the access method needs, such as indexes, filters and routing metadata",
      "The size the memtable reaches before it is frozen and flushed to disk",
      "The merge cost that compaction adds on top of the original user writes"
    ],
    "answer": 1,
    "explanation": "M is the auxiliary memory an access method needs, such as filters and indexes. Disk-space amplification is a related operational metric that the lesson says should be measured separately, which makes it the tempting but wrong choice.",
    "tags": [
      "storage-engine-tradeoffs",
      "recall",
      "inline"
    ]
  },
  {
    "id": "storage-engine-tradeoffs-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Read-heavy engine choice",
    "section": "Detailed Comparison: B+ Trees vs LSM Trees",
    "prompt": "A workload is 95% point lookups over a working set that mostly fits in cache and 5% small updates. Which engine does the lesson's comparison favour, and for what reason?",
    "options": [
      "An LSM-tree, because turning every write into a sequential append also makes each read cheaper",
      "An LSM-tree, because Bloom filters make point reads cheaper than any tree traversal",
      "A B+ tree, because a lookup is a few mostly cached page reads while an LSM may probe several sorted runs",
      "A B+ tree, because in-place page updates give it lower write amplification than an LSM"
    ],
    "answer": 2,
    "explanation": "B+ trees answer a point read in about 2 to 3 page reads, usually from cache, while an LSM has to check the memtable, filters and possibly several SSTables. Choosing the B+ tree for its write amplification gets the reason backwards, because B+ trees usually have the higher write amplification.",
    "tags": [
      "storage-engine-tradeoffs",
      "apply",
      "inline"
    ]
  },
  {
    "id": "storage-engine-tradeoffs-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Sustained LSM throughput",
    "section": "Detailed Comparison: B+ Trees vs LSM Trees",
    "prompt": "An LSM engine absorbs a heavy write burst smoothly for ten minutes, then starts stalling writers even though the WAL device is far from its sequential bandwidth limit. What limit has it most likely hit?",
    "options": [
      "Compaction bandwidth, which cannot keep up with ingest, so the engine throttles writes as debt grows",
      "Sequential WAL bandwidth, which drops sharply once the log file grows past a few gigabytes",
      "Lock contention in the skiplist memtable, which grows with the number of keys it holds",
      "Bloom filter memory, which fills up and forces every new write to wait for eviction"
    ],
    "answer": 0,
    "explanation": "Bursts are limited by sequential bandwidth, but sustained LSM throughput is bounded by compaction, and engines stall writes when compaction falls behind. The WAL explanation does not fit, because the device still has spare sequential bandwidth.",
    "tags": [
      "storage-engine-tradeoffs",
      "staff",
      "inline"
    ]
  },
  {
    "id": "storage-engine-tradeoffs-n1",
    "topic": "storage-engine-tradeoffs",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: B-Tree Random Update Page Write Amplification",
    "scenario": "A B-tree storage engine uses 16 KB (16,384-byte) disk pages (like MySQL InnoDB). A workload performs random in-place updates of 128-byte rows scattered across uncached leaf pages, flushing the full dirty 16 KB page to disk for each updated row.",
    "prompt": "What is the page-level write amplification factor (physical bytes written divided by logical row bytes modified: 16,384 ÷ 128)?",
    "question": "What is the page-level write amplification factor (physical bytes written divided by logical row bytes modified: 16,384 ÷ 128)?",
    "unit": "x",
    "answer": 128,
    "tolerance": 0.25,
    "hint": "Divide the page size (16,384 bytes) by the modified row size (128 bytes).",
    "explanation": "Writing a full 16,384-byte page (plus redo/doublewrite buffer overhead) to persist a single 128-byte random row modification produces a 16,384 / 128 = 128x page write amplification factor.",
    "tags": [
      "storage-engine-tradeoffs",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "storage-engine-tradeoffs-t1",
    "topic": "storage-engine-tradeoffs",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: RUM Conjecture Selection for IoT Time-Series vs OLTP Banking",
    "scenario": "According to the RUM Conjecture, a storage engine can optimize at most two of Read overhead (R), Update/write overhead (U), and Memory/space overhead (M). You must choose engines for (1) an IoT telemetry ingestion pipeline (500k writes/sec, sequential range scans) and (2) an OLTP account lookup table (95% point reads, strict disk quota).",
    "prompt": "Which engine pairing aligns with the RUM Conjecture, and why?",
    "question": "Which engine pairing aligns with the RUM Conjecture, and why?",
    "options": [
      "Use a B+Tree with 6 secondary indexes for the 500k writes/sec IoT pipeline and an uncompacted append-only log for the OLTP banking table",
      "Use an LSM-tree (with time-window compaction) for the write-heavy IoT pipeline (optimizing U + M) and a B+Tree for the point-read-heavy OLTP table (optimizing R + M)",
      "Use in-memory linear array scans for both workloads"
    ],
    "correctOption": 1,
    "reasons": [
      "B+Trees with many secondary indexes excel at random write ingestion by doing in-place 16 KB page writes",
      "LSM-trees convert random writes into sequential append I/O (low U), whereas B+Trees maintain a single canonical location per key for predictable low-latency point reads (low R)",
      "The RUM Conjecture states that B+Trees have zero read, write, and space overhead simultaneously"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Match LSM sequential appends to high-throughput write ingestion and B+Tree single-page lookups to low-latency reads.",
    "explanation": "LSM-trees absorb massive write rates sequentially in memory/WAL and compact time-series windows cleanly without random page I/O. Conversely, B+Trees update keys in a single canonical leaf page, offering superior point-read latency without checking multiple SSTable levels.",
    "tags": [
      "storage-engine-tradeoffs",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["file-backed-dictionary-storage-engine"] = [
  {
    "id": "file-backed-dictionary-storage-engine-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Deleting in a log",
    "section": "Internal Mechanics & Step-by-Step Operations",
    "prompt": "In an append-only log with an in-memory hash index, how must a delete be implemented so that it survives a restart?",
    "options": [
      "Overwrite the old record's value bytes with zeros in place, then update the index",
      "Append a tombstone record and remove the key from the in-memory index",
      "Remove the key from the in-memory index only, since the old record becomes unreachable",
      "Truncate the data file at the old record's offset and re-append any later records"
    ],
    "answer": 1,
    "explanation": "The log cannot be modified in place, so a delete appends a tombstone and drops the key from the index. Removing the key only from RAM is the tempting shortcut, but a restart rebuilds the index by scanning the log and would bring the deleted key back.",
    "tags": [
      "file-backed-dictionary-storage-engine",
      "recall",
      "inline"
    ]
  },
  {
    "id": "file-backed-dictionary-storage-engine-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Hash index RAM",
    "section": "Worked example: sizing a log plus hash index",
    "prompt": "Using the lesson's budget of about 80 to 100 bytes of RAM per key, how much memory does the hash index need for 50 million keys with 20-byte keys and 1 KB values?",
    "options": [
      "About 50 MB",
      "About 500 MB",
      "About 4 to 5 GB",
      "About 50 GB"
    ],
    "answer": 2,
    "explanation": "50 million keys times 80 to 100 bytes is about 4 to 5 GB. Value size does not affect index RAM; 50 GB is roughly the size of the data on disk, not the index.",
    "tags": [
      "file-backed-dictionary-storage-engine",
      "apply",
      "inline"
    ]
  },
  {
    "id": "file-backed-dictionary-storage-engine-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Torn tail recovery",
    "section": "Write, read and recover, step by step",
    "prompt": "During recovery the scan reaches the final record of the newest segment and its CRC does not match. What should recovery do?",
    "options": [
      "Refuse to start until an operator restores the segment from a backup copy",
      "Skip the record but keep its bytes, so the next append lands after it",
      "Index the key anyway using the length field, since the header parsed correctly",
      "Truncate the segment back to that record's start offset and continue"
    ],
    "answer": 3,
    "explanation": "A bad CRC on the very last record is the signature of a crash mid-append, so recovery truncates that torn tail. Indexing it because the header parsed would serve corrupt data, and keeping its bytes leaves garbage that every later scan would have to step over.",
    "tags": [
      "file-backed-dictionary-storage-engine",
      "staff",
      "inline"
    ]
  },
  {
    "id": "file-backed-dictionary-storage-engine-n1",
    "topic": "file-backed-dictionary-storage-engine",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Hash Index Memory Footprint for 100M Keys",
    "scenario": "A file-backed dictionary engine keeps an in-memory hash directory mapping each of 100,000,000 keys to its on-disk `(file_id, byte_offset, byte_length)` metadata (32 bytes per entry including hash bucket overhead).",
    "prompt": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of RAM are required to hold the in-memory directory for 100M keys?",
    "question": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of RAM are required to hold the in-memory directory for 100M keys?",
    "unit": "GB",
    "answer": 3.2,
    "tolerance": 0.2,
    "hint": "Multiply 100,000,000 keys by 32 bytes per key and divide by 10^9.",
    "explanation": "100,000,000 × 32 bytes = 3,200,000,000 bytes = 3.2 GB of RAM, allowing every point lookup to resolve in exactly 1 disk `pread` regardless of value size.",
    "tags": [
      "file-backed-dictionary-storage-engine",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "file-backed-dictionary-storage-engine-t1",
    "topic": "file-backed-dictionary-storage-engine",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: In-Memory Offset Directory vs Sparse On-Disk Index",
    "scenario": "Your file-backed dictionary engine grows from 100M keys (average 4 KB value) to 20 billion tiny keys (average 40-byte value). Suddenly the in-memory hash directory alone requires 640 GB of RAM per node.",
    "prompt": "Why did the in-memory hash directory hit a wall, and what architectural shift solves it?",
    "question": "Why did the in-memory hash directory hit a wall, and what architectural shift solves it?",
    "options": [
      "Store the values in RAM and the keys on disk",
      "Scan the entire 800 GB log file from byte 0 on every read",
      "Switch from a full in-memory per-key hash table to sorted SSTables with a sparse in-memory block index (1 entry per 4 KB–64 KB block) plus Bloom filters"
    ],
    "correctOption": 2,
    "reasons": [
      "Putting values in RAM reduces total memory usage",
      "Linear file scans run in microseconds on 800 GB files",
      "A full in-memory key directory requires O(N) RAM proportional to key count; sorting keys on disk lets you keep only 1 pointer per disk block in RAM (reducing index RAM by ~100×)"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens when the metadata per key (32 B) is nearly as large as the value itself (40 B)?",
    "explanation": "File-backed hash directories (like Bitcask) excel when values are large and key count fits in RAM, but when key count explodes into billions of tiny records, a sorted SSTable + sparse block index is needed so index RAM scales with block count rather than key count.",
    "tags": [
      "file-backed-dictionary-storage-engine",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["custom-binary-file-format"] = [
  {
    "id": "custom-binary-file-format-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why a version field",
    "section": "Header Specification & Hardware Alignment",
    "prompt": "Which file header field lets a newer build of the engine read, or migrate, files written by an older build without guessing their layout?",
    "options": [
      "The magic bytes",
      "The format version",
      "The block size",
      "The endianness marker"
    ],
    "answer": 1,
    "explanation": "The format version tells a reader which layout rules apply, so upgrades can read or migrate old files. Magic bytes only confirm that the file is the right kind of file; they say nothing about which revision of the layout it uses.",
    "tags": [
      "custom-binary-file-format",
      "recall",
      "inline"
    ]
  },
  {
    "id": "custom-binary-file-format-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Next record offset",
    "section": "Worked example: one record, byte by byte",
    "prompt": "Using the lesson's layout (4-byte CRC, 8-byte timestamp, 4-byte key length, 4-byte value length, then key and value), a record starts at offset 8,192 with a 12-byte key and a 500-byte value. At what offset does the next record start?",
    "options": [
      "8,704",
      "8,712",
      "8,744",
      "8,724"
    ],
    "answer": 3,
    "explanation": "The fixed header is 20 bytes, so the record is 20 + 12 + 500 = 532 bytes and the next record starts at 8,724. 8,704 forgets the header and 8,712 forgets the key.",
    "tags": [
      "custom-binary-file-format",
      "apply",
      "inline"
    ]
  },
  {
    "id": "custom-binary-file-format-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Parquet footer placement",
    "section": "How real formats do it",
    "prompt": "Parquet puts its metadata (row group and column chunk offsets) in a footer at the end of the file rather than in a header. What does this design buy?",
    "options": [
      "A writer can stream row groups without knowing their offsets up front, and a reader finds the metadata with one small read from the tail",
      "The file can later be appended to in place, with new row groups written after the old footer without rewriting it",
      "Object stores can only serve range requests that end at the final byte, so metadata must live at the end",
      "The metadata reaches durable storage before the data, so it survives a crash in the middle of the data write"
    ],
    "answer": 0,
    "explanation": "Offsets are only known once the data has been written, so a footer lets the writer stream first and describe afterwards, and a reader can fetch it with one small tail read. The metadata is actually written last, not first, so the crash-safety option has it backwards.",
    "tags": [
      "custom-binary-file-format",
      "staff",
      "inline"
    ]
  },
  {
    "id": "custom-binary-file-format-n1",
    "topic": "custom-binary-file-format",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Binary Frame vs Verbose JSON Wire/Disk Overhead",
    "scenario": "A storage engine writes 200,000,000 records. In verbose JSON (`{\"timestamp\":1710000000000,\"user_id\":91827364,\"flags\":3,\"score\":42}`), each record averages 75 bytes. In a packed binary format (8B timestamp + 8B user_id + 1B flags + 4B score + 4B CRC = 25 bytes), each record is 25 bytes.",
    "prompt": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of disk space are saved across 200M records by using the 25-byte binary frame instead of 75-byte JSON?",
    "question": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of disk space are saved across 200M records by using the 25-byte binary frame instead of 75-byte JSON?",
    "unit": "GB",
    "answer": 10,
    "tolerance": 0.2,
    "hint": "Multiply 200,000,000 records by the 50-byte savings per record (`75 - 25 = 50`).",
    "explanation": "Saving 50 bytes per record across 200,000,000 records saves 200,000,000 × 50 B = 10 × 10^9 B = 10 GB of storage and avoids repeated ASCII field-name parsing.",
    "tags": [
      "custom-binary-file-format",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "custom-binary-file-format-t1",
    "topic": "custom-binary-file-format",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Header Magic Bytes, Format Version, and Footer Index Placement",
    "scenario": "You are designing an immutable custom binary file format (like Parquet or an SSTable) that is written in a single streaming pass as records arrive and later read via random access.",
    "prompt": "Where should the block index and schema metadata directory be placed in a streaming single-pass binary file, and why?",
    "question": "Where should the block index and schema metadata directory be placed in a streaming single-pass binary file, and why?",
    "options": [
      "Write the full block offset table at byte 0 before any data blocks have been compressed or written",
      "Interleave random metadata pointers without length prefixes",
      "Put a fixed magic number + version header at byte 0, stream data blocks sequentially, and write the block index + metadata directory in the file footer with a fixed-size footer length pointer at EOF"
    ],
    "correctOption": 2,
    "reasons": [
      "You know the exact compressed byte size of every future block before compressing it",
      "Omitting length prefixes makes binary parsing deterministic",
      "Block byte offsets are only known after all variable-length compressed data blocks are written; placing the directory in the footer with a trailing fixed-offset pointer enables single-pass streaming writes and two-read (`EOF` -> index -> block) random access"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Why do Parquet, ORC, RocksDB SSTables, and ZIP files all put their central directory in the footer at the end of the file?",
    "explanation": "When streaming compressed blocks sequentially, block sizes aren't known upfront. Writing the index in the footer (with a final 8-byte footer offset + magic bytes at EOF) allows single-pass sequential creation without seeking back to rewrite the beginning of the file.",
    "tags": [
      "custom-binary-file-format",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["byte-range-indexed-object-storage"] = [
  {
    "id": "byte-range-indexed-object-storage-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why pread",
    "section": "Implementation Mechanics: Sparse Indexes & Offset Maps",
    "prompt": "Many threads serve range reads from the same open file descriptor. Why does the lesson prefer pread over lseek followed by read?",
    "options": [
      "pread bypasses the page cache, so concurrent readers never see stale cached bytes",
      "pread is asynchronous, so a thread can issue many reads without waiting for any of them",
      "pread reads at an explicit offset without moving the shared file pointer, so threads cannot race on it",
      "pread takes an advisory lock on the byte range, so two threads cannot read overlapping bytes"
    ],
    "answer": 2,
    "explanation": "lseek changes a file pointer that all threads share, so another thread can move it between the seek and the read; pread passes the offset explicitly and avoids that race. It is still a synchronous, page-cached call, so the cache-bypass and async options are wrong.",
    "tags": [
      "byte-range-indexed-object-storage",
      "recall",
      "inline"
    ]
  },
  {
    "id": "byte-range-indexed-object-storage-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Chunks touched by a range",
    "section": "Worked example: seeking inside a 10 GiB video",
    "prompt": "A file is indexed in 4 MiB (4,194,304-byte) chunks numbered from 0. A client requests Range: bytes=12582912-20971519. Which chunks must be read?",
    "options": [
      "One chunk: chunk 3",
      "Two chunks: chunks 3 and 4",
      "Three chunks: chunks 3, 4 and 5",
      "Two chunks: chunks 2 and 3"
    ],
    "answer": 1,
    "explanation": "12,582,912 / 4,194,304 is exactly 3, and the last byte 20,971,519 falls in chunk 4 (it is one byte short of chunk 5's start at 20,971,520). Range end offsets are inclusive, which is why chunk 5 is not touched.",
    "tags": [
      "byte-range-indexed-object-storage",
      "apply",
      "inline"
    ]
  },
  {
    "id": "byte-range-indexed-object-storage-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Stale offsets",
    "section": "Failure modes",
    "prompt": "A query engine reads a Parquet footer from object storage, then issues range reads for column chunks. Occasionally the data reads return bytes that fail to decode. Another job sometimes overwrites the same key. What is the right fix?",
    "options": [
      "Increase the range size so fewer requests are exposed to a concurrent rewrite",
      "Re-fetch the footer after each data read and discard results if it changed",
      "Use parallel range GETs so all data reads finish before any overwrite lands",
      "Pin the object version ID, or send If-Match with the footer's ETag, on every data read"
    ],
    "answer": 3,
    "explanation": "The footer's offsets describe one version of the object, so every data read must be tied to that version with a version ID or a conditional request. Re-checking the footer afterwards narrows the race but does not close it, and bigger or faster reads only make the race less likely.",
    "tags": [
      "byte-range-indexed-object-storage",
      "staff",
      "inline"
    ]
  },
  {
    "id": "byte-range-indexed-object-storage-n1",
    "topic": "byte-range-indexed-object-storage",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: S3 Coalesced Byte-Range Read Savings",
    "scenario": "A query needs 50 adjacent 8 KB pages (400 KB total) from a Parquet file on S3. Issuing 50 separate `Range: bytes=...` HTTP GET requests at 25 ms per request vs coalescing them into a single 400 KB byte-range GET (`25 ms` TTFB + `5 ms` transfer).",
    "prompt": "How many milliseconds of total request wall-clock time are saved if those reads were otherwise issued as 10 sequential rounds of 5 requests (`10 × 25 ms = 250 ms`) vs 1 coalesced range request (`30 ms`)?",
    "question": "How many milliseconds of total request wall-clock time are saved if those reads were otherwise issued as 10 sequential rounds of 5 requests (`10 × 25 ms = 250 ms`) vs 1 coalesced range request (`30 ms`)?",
    "unit": "ms",
    "answer": 220,
    "tolerance": 0.2,
    "hint": "Subtract the 30 ms single coalesced range read from the 250 ms multi-round latency.",
    "explanation": "Object storage has high per-request TTFB (~15–30 ms) and charges per GET request, but high throughput per stream. Coalescing nearby byte ranges (\"hole filling\" up to ~1 MB gap) cuts 250 ms down to 30 ms (saving 220 ms and 98% of API request costs).",
    "tags": [
      "byte-range-indexed-object-storage",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "byte-range-indexed-object-storage-t1",
    "topic": "byte-range-indexed-object-storage",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Fine-Grained 4 KB Object GETs vs Coalesced Range Reads + Cached Footer",
    "scenario": "An analytics engine queries multi-gigabyte files on S3. Initially it translates every 4 KB page read directly into a separate S3 `GET` with `Range: bytes=offset..offset+4095`.",
    "prompt": "Why does a 4 KB S3 range-read strategy perform poorly, and how should an object-store query engine optimize byte-range access?",
    "question": "Why does a 4 KB S3 range-read strategy perform poorly, and how should an object-store query engine optimize byte-range access?",
    "options": [
      "Split the multi-gigabyte file into millions of separate 4 KB S3 objects",
      "Download the entire 10 GB S3 object into local memory for every single-row lookup",
      "Cache file footers/indexes in local NVMe/RAM, use larger block sizes (64 KB–1 MB), and coalesce nearby byte ranges (merging gaps smaller than ~256 KB–1 MB into a single HTTP Range GET)"
    ],
    "correctOption": 2,
    "reasons": [
      "Millions of tiny S3 `PUT`/`GET` calls minimize per-request billing and latency",
      "Downloading 10 GB for a 100-byte lookup minimizes network egress",
      "Amortizing S3's 15–30 ms TTFB overhead requires caching the footer index locally and fetching coarse/coalesced byte ranges rather than chatty 4 KB micro-reads"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Compare S3 time-to-first-byte (~20 ms) with the time to transfer an extra 256 KB (~2 ms at 1 Gbps).",
    "explanation": "Because 20 ms of S3 request latency equals ~2.5 MB of transfer time on a 1 Gbps link, reading across a small 256 KB gap in one HTTP Range request is faster and cheaper than issuing two separate HTTP requests.",
    "tags": [
      "byte-range-indexed-object-storage",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["immutable-versioned-data-files"] = [
  {
    "id": "immutable-versioned-data-files-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "CoW commit ordering",
    "section": "Why Immutability Eliminates Concurrency Locks",
    "prompt": "A copy-on-write B+tree has built a new leaf, internal page and root for an update. In what order must it persist things for the commit to be crash safe?",
    "options": [
      "Flush the new pages first, then write and flush the metadata page that names the new root",
      "Write the metadata page first so readers see the new root sooner, then flush the new pages",
      "Swap the in-memory root pointer atomically; that CPU-atomic store is itself the commit",
      "Issue the pages and metadata in one write call and let the device keep them in order"
    ],
    "answer": 0,
    "explanation": "The metadata must never point at pages that might not be on disk, so the pages are flushed before the metadata that references them. An atomic in-memory pointer swap is not a durable commit, and a single write call gives no ordering guarantee across a crash.",
    "tags": [
      "immutable-versioned-data-files",
      "recall",
      "inline"
    ]
  },
  {
    "id": "immutable-versioned-data-files-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Path copy cost",
    "section": "Worked example: one update in a copy-on-write B+tree",
    "prompt": "A copy-on-write B+tree has depth 4 (root, two internal levels, leaf) and 8 KB pages. How many bytes of tree pages are written to update one 100-byte value?",
    "options": [
      "8 KB plus a meta page",
      "16 KB plus a meta page",
      "32 KB plus a meta page",
      "64 KB plus a meta page"
    ],
    "answer": 2,
    "explanation": "Every page on the path from the leaf to the root is copied: 4 pages of 8 KB is 32 KB, plus the meta page that publishes the new root. Answering 8 KB assumes only the leaf changes, which ignores that each parent must be rewritten to point at its new child.",
    "tags": [
      "immutable-versioned-data-files",
      "apply",
      "inline"
    ]
  },
  {
    "id": "immutable-versioned-data-files-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Growing LMDB file",
    "section": "Failure modes",
    "prompt": "An LMDB-backed service keeps a steady amount of live data, yet its data file grows every day. What is the most likely cause?",
    "options": [
      "The single-writer lock serializes commits, so pages queue up waiting to be written",
      "The two alternating meta pages double the file size on every other transaction",
      "A forgotten long-running read transaction pins an old snapshot, so freed pages cannot be reused",
      "Copy-on-write has no reclamation, so every replaced path copy stays on disk forever"
    ],
    "answer": 2,
    "explanation": "Old pages are reused only once no reader still needs their snapshot, so one stale reader stops reclamation and the file grows. CoW engines do reclaim pages, so the no-reclamation option is wrong; the lesson's advice is to monitor the age of the oldest reader.",
    "tags": [
      "immutable-versioned-data-files",
      "staff",
      "inline"
    ]
  },
  {
    "id": "immutable-versioned-data-files-n1",
    "topic": "immutable-versioned-data-files",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Snapshot Space Overhead Under Copy-on-Write / Immutable Files",
    "scenario": "A table consists of 1,000 immutable 1 GB Parquet data files (1,000 GB total). An update batch modifies rows in 40 of those files, writing 40 new 1 GB files and publishing a new manifest version while keeping the previous snapshot retained for time-travel queries.",
    "prompt": "What is the total storage footprint (in GB) across both snapshots combined?",
    "question": "What is the total storage footprint (in GB) across both snapshots combined?",
    "unit": "GB",
    "answer": 1040,
    "tolerance": 0.2,
    "hint": "960 unchanged files are shared by reference (`960 GB`), plus 40 old files (`40 GB`) and 40 new files (`40 GB`).",
    "explanation": "Because immutable files are shared by pointer across manifest versions, retaining the prior snapshot only retains the 40 replaced files: 1,000 + 40 = 1,040 GB (4% overhead instead of a 2,000 GB full copy).",
    "tags": [
      "immutable-versioned-data-files",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "immutable-versioned-data-files-t1",
    "topic": "immutable-versioned-data-files",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Lock-Free Readers via Atomic Manifest Swap vs In-Place File Mutation",
    "scenario": "In a data lakehouse (Iceberg / Delta Lake) or LSM engine, long-running analytical readers scan data files for 5 minutes while concurrent writers commit new batches every 10 seconds.",
    "prompt": "How do immutable versioned data files enable completely lock-free concurrent readers and writers?",
    "question": "How do immutable versioned data files enable completely lock-free concurrent readers and writers?",
    "options": [
      "Writers overwrite existing files in place while readers hold shared POSIX file locks",
      "Readers pause every 10 seconds to reload partially written files",
      "Writers write new immutable data files and atomically swap a versioned metadata manifest pointer; each reader pins the manifest snapshot from when its query started"
    ],
    "correctOption": 2,
    "reasons": [
      "Overwriting compressed files in-place never corrupts concurrent readers",
      "Reading half-written files provides snapshot isolation",
      "Because published data files never mutate in place, a reader pinning Manifest v42 sees a consistent snapshot with zero read locks, while a background GC only deletes unreferenced files after the snapshot retention window expires"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "If a data file never changes after creation, does a reader ever need a lock to read it?",
    "explanation": "Immutability decouples readers from writers: writers prepare new files invisibly and commit via a single atomic pointer/manifest CAS, while readers scan their pinned manifest snapshot completely lock-free.",
    "tags": [
      "immutable-versioned-data-files",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["log-structured-storage"] = [
  {
    "id": "log-structured-storage-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What the cleaner keeps",
    "section": "The Fundamental Challenge: The Cleaner & Space Reclaim",
    "prompt": "When the cleaner processes a segment, how does it decide which records to copy forward?",
    "options": [
      "It keeps records that the index still identifies as the latest version of their key",
      "It keeps records written after the segment's creation timestamp and drops the rest",
      "It keeps every record whose checksum is valid, since those are known to be intact",
      "It keeps the most recently written half of the segment and drops the older half"
    ],
    "answer": 0,
    "explanation": "The cleaner asks the index which record is the live version of each key, copies only those, and drops overwritten values and tombstones. A valid checksum only shows the bytes are intact; it says nothing about whether a newer version has replaced the record.",
    "tags": [
      "log-structured-storage",
      "recall",
      "inline"
    ]
  },
  {
    "id": "log-structured-storage-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Cleaning write cost",
    "section": "Worked example: the cost of cleaning",
    "prompt": "Using the LFS model, write cost is 2 / (1 - u). If segments are 75% live when the cleaner picks them, how many bytes of I/O are moved per byte of new data?",
    "options": [
      "About 2.7",
      "4",
      "8",
      "16"
    ],
    "answer": 2,
    "explanation": "With u = 0.75, 2 / 0.25 = 8: the cleaner reads the whole segment and rewrites three quarters of it to free one quarter. 2.7 comes from using 1 - u = 0.75 by mistake, which would describe a mostly empty segment.",
    "tags": [
      "log-structured-storage",
      "apply",
      "inline"
    ]
  },
  {
    "id": "log-structured-storage-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Running a log store full",
    "section": "Worked example: the cost of cleaning",
    "prompt": "A log-structured store is run at 95% disk utilization with uniformly random updates across all keys. What degrades first?",
    "options": [
      "Reads, because the most recent versions are scattered by write time across segments",
      "Write throughput, because cleaned segments are mostly live and each new byte costs tens of bytes of cleaning",
      "Crash recovery, because the log replay after a checkpoint grows with disk utilization",
      "Index memory, because dead versions stay in the index until their segment is cleaned"
    ],
    "answer": 1,
    "explanation": "With random updates the segments the cleaner can choose are nearly as full as the disk, so u is around 0.95 and write cost approaches 2 / 0.05 = 40. Scattered reads are a real cost, but an index handles them; the cleaner is what stalls near full utilization.",
    "tags": [
      "log-structured-storage",
      "staff",
      "inline"
    ]
  },
  {
    "id": "log-structured-storage-n1",
    "topic": "log-structured-storage",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Log Segment Cleaning Utilization Cost",
    "scenario": "A log-structured storage system cleans old 64 MB segments when they are 75% live (25% obsolete/deleted bytes). To reclaim 16 MB of free space per segment, the cleaner must read the 64 MB segment and rewrite the 48 MB of live data into a new segment.",
    "prompt": "What is the ratio of bytes rewritten (`48 MB`) to free space reclaimed (`16 MB`) during segment cleaning at 75% utilization?",
    "question": "What is the ratio of bytes rewritten (`48 MB`) to free space reclaimed (`16 MB`) during segment cleaning at 75% utilization?",
    "unit": "x",
    "answer": 3,
    "tolerance": 0.2,
    "hint": "Divide 48 MB of copied live data by 16 MB of reclaimed dead space.",
    "explanation": "To free 16 MB of dead space in a 75%-full segment, the cleaner must copy 48 MB of live records (`48 / 16 = 3×` copy overhead), which is why log-structured cleaners separate hot (rapidly dying) and cold (long-lived) segments.",
    "tags": [
      "log-structured-storage",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "log-structured-storage-t1",
    "topic": "log-structured-storage",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Hot/Cold Segment Segregation in Log-Structured Compaction",
    "scenario": "A log-structured storage engine mixes frequently updated session keys and rarely updated archive blobs in the same log segments, causing the garbage collector to repeatedly copy the unchanging archive blobs.",
    "prompt": "Which segment cleaning optimization minimizes compaction write amplification, and why?",
    "question": "Which segment cleaning optimization minimizes compaction write amplification, and why?",
    "options": [
      "Disable segment compaction altogether and buy infinite disks",
      "Always compact the segments with 99% live data first",
      "Segregate hot (short-lived) and cold (long-lived) data into separate segments and prioritize cleaning segments with the lowest live-data ratio weighted by data age (cost-benefit policy)"
    ],
    "correctOption": 2,
    "reasons": [
      "Never reclaiming dead tombstones works on bounded disks",
      "Compacting 99%-live segments frees the most space per byte copied",
      "Hot segments quickly drop to <20% live bytes (cheap to clean), while cold segments stay near 100% live and are rarely rewritten—dramatically reducing write amplification"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Recall Rosenblum & Ousterhout's Sprite LFS cost-benefit segment cleaning insight.",
    "explanation": "Separating rapidly mutating records from long-lived cold records prevents cold bytes from being copied over and over alongside hot records during segment garbage collection.",
    "tags": [
      "log-structured-storage",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["bitcask-storage-engine"] = [
  {
    "id": "bitcask-storage-engine-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Hint file contents",
    "section": "Compaction & The Hint File Optimization",
    "prompt": "What does a Bitcask hint file entry contain?",
    "options": [
      "The key and a compressed copy of the value, so reads can skip the data file",
      "Only the key; value positions are recomputed by scanning the matching data file",
      "A snapshot of the full keydir, including open file handles and active file state",
      "Timestamp, key size, value size, value position and the key, but not the value"
    ],
    "answer": 3,
    "explanation": "A hint entry is a data-file entry with the value bytes replaced by the value's position, which is enough to rebuild the keydir without reading values. If positions had to be recomputed by scanning data files, the hint file would save nothing at startup.",
    "tags": [
      "bitcask-storage-engine",
      "recall",
      "inline"
    ]
  },
  {
    "id": "bitcask-storage-engine-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Keydir RAM budget",
    "section": "Worked example: capacity planning",
    "prompt": "Using Riak's guidance of about 45 bytes of fixed keydir overhead per key plus the key itself, how much keydir RAM does one replica need for 500 million keys averaging 20 bytes?",
    "options": [
      "About 10 GB",
      "About 22 GB",
      "About 32 GB",
      "About 65 GB"
    ],
    "answer": 2,
    "explanation": "500 million times (20 + 45) bytes is about 32.5 GB per replica. 22 GB counts only the fixed overhead and 10 GB only the key bytes; the real cost is both together.",
    "tags": [
      "bitcask-storage-engine",
      "apply",
      "inline"
    ]
  },
  {
    "id": "bitcask-storage-engine-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Safe merge rule",
    "section": "Merge, step by step",
    "prompt": "During a Bitcask merge, which rule decides whether a record from an old data file is copied into the merged file?",
    "options": [
      "Keep it only if the keydir still points at that exact file and offset",
      "Keep the record with the highest timestamp for each key among the files being merged",
      "Keep it if its CRC is valid and it is not a tombstone record",
      "Keep the last occurrence of each key within each file being merged"
    ],
    "answer": 0,
    "explanation": "Only the keydir knows the current location of each key, which may be in the active file or another file outside the merge. Keeping the newest record among the merged files would copy a stale version, and repointing the keydir at it would roll the key back.",
    "tags": [
      "bitcask-storage-engine",
      "staff",
      "inline"
    ]
  },
  {
    "id": "bitcask-storage-engine-n1",
    "topic": "bitcask-storage-engine",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Bitcask Crash Recovery Speed with Hint Files",
    "scenario": "A Bitcask node has 500 GB of data files containing 50,000,000 keys (average 10 KB value), plus compact `.hint` files containing only `(timestamp, key_size, value_size, value_offset, key)` (~40 bytes per entry = 2 GB total). Disk sequential read throughput is 1 GB/s.",
    "prompt": "How many seconds does it take to rebuild the in-memory `KeyDir` on startup by scanning the 2 GB `.hint` files instead of scanning all 500 GB of data files?",
    "question": "How many seconds does it take to rebuild the in-memory `KeyDir` on startup by scanning the 2 GB `.hint` files instead of scanning all 500 GB of data files?",
    "unit": "seconds",
    "answer": 2,
    "tolerance": 0.2,
    "hint": "Divide 2 GB of hint files by 1 GB/s sequential read speed.",
    "explanation": "Scanning the 2 GB `.hint` files at 1 GB/s rebuilds the in-memory `KeyDir` in 2 seconds instead of 500 seconds (8+ minutes) to scan the full 500 GB data logs.",
    "tags": [
      "bitcask-storage-engine",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "bitcask-storage-engine-t1",
    "topic": "bitcask-storage-engine",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Bitcask (`KeyDir` in RAM) vs LSM Tree for Range Scans and High Key Counts",
    "scenario": "You use a Bitcask storage engine (in-memory hash `KeyDir` pointing to append-only log files) for a workload that now requires `SCAN prefix_*` range queries and has grown to 5 billion small keys.",
    "prompt": "Why is Bitcask a poor fit for this evolved workload, and what does it trade off?",
    "question": "Why is Bitcask a poor fit for this evolved workload, and what does it trade off?",
    "options": [
      "Bitcask requires 4 disk seeks per point lookup",
      "Bitcask cannot write sequentially to disk",
      "Bitcask's `KeyDir` is an unordered hash table that must hold every key in RAM—making ordered range scans impossible without scanning all keys and bounding total key count by RAM capacity"
    ],
    "correctOption": 2,
    "reasons": [
      "Bitcask serves point reads in a single disk seek using `KeyDir`",
      "Bitcask appends all writes sequentially to the active data file",
      "Bitcask gives unbeatable O(1) single-seek point reads and sequential writes when all keys fit in RAM, but lacks key ordering for range scans and cannot exceed RAM key capacity"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Can a hash table in RAM support ordered prefix range queries or store more keys than fit in memory?",
    "explanation": "Bitcask guarantees at most 1 disk seek per read and sequential appends per write, at the strict requirement that 100% of keys fit in the in-memory `KeyDir` hash map and that range queries are not needed.",
    "tags": [
      "bitcask-storage-engine",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["lsm-tree-storage-engine"] = [
  {
    "id": "lsm-tree-storage-engine-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why L0 is special",
    "section": "Core Invariants of the LSM-Tree",
    "prompt": "Why might a point lookup have to check every Level 0 file, while in leveled compaction it checks at most one file per lower level?",
    "options": [
      "L0 files are stored unsorted so they can be flushed faster, so they must be scanned in full",
      "L0 files do not carry Bloom filters until compaction moves them into Level 1",
      "L0 files stay mutable until compacted, so their key ranges cannot be trusted",
      "L0 files are flushed memtables whose key ranges overlap, so any of them may hold the key"
    ],
    "answer": 3,
    "explanation": "Each L0 file is a flushed memtable covering an arbitrary key range, so ranges overlap; lower leveled files are kept non-overlapping so key-range metadata picks one. L0 files are still sorted and immutable, so the unsorted and mutable options are wrong.",
    "tags": [
      "lsm-tree-storage-engine",
      "recall",
      "inline"
    ]
  },
  {
    "id": "lsm-tree-storage-engine-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Levels for 20 TB",
    "section": "Worked example: how many levels for 2 TB?",
    "prompt": "With a Level 1 target of 256 MB and a size multiplier of 10 per level, how many levels below L0 are needed to hold 20 TB?",
    "options": [
      "6",
      "4",
      "5",
      "7"
    ],
    "answer": 0,
    "explanation": "Cumulative capacity through L5 is about 2.8 TB, and adding L6 at 25.6 TB brings it to about 28 TB, so six levels are needed. Five levels is right for the lesson's 2 TB case but falls an order of magnitude short here.",
    "tags": [
      "lsm-tree-storage-engine",
      "apply",
      "inline"
    ]
  },
  {
    "id": "lsm-tree-storage-engine-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "L0 pile-up effect",
    "section": "A point lookup, worst case",
    "prompt": "Compaction falls behind and L0 grows from 4 files to 40, with five levels below. Every file has a 1% false-positive Bloom filter. What happens to a lookup for a key that does not exist?",
    "options": [
      "Almost nothing, because Bloom filters make the number of L0 files irrelevant",
      "Expected wasted block reads and filter probes both grow about fivefold",
      "Every lookup now reads all 40 L0 files, since L0 files are not covered by filters",
      "Only range scans slow down; a point lookup picks one L0 file by key range"
    ],
    "answer": 1,
    "explanation": "Candidate files rise from 9 to 45, so filter probes rise fivefold and expected false-positive block reads go from about 0.09 to about 0.45. Filters reduce the cost per file but not the number of files, which is why engines throttle writes when L0 grows.",
    "tags": [
      "lsm-tree-storage-engine",
      "staff",
      "inline"
    ]
  },
  {
    "id": "lsm-tree-storage-engine-n1",
    "topic": "lsm-tree-storage-engine",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Leveled Compaction Write Amplification",
    "scenario": "An LSM-tree storage engine uses leveled compaction with a level size multiplier of `T = 10` across `L = 4` disk levels (`L1` through `L4`). In the worst case, compacting an SSTable from level `i` into level `i+1` reads and rewrites ~10 overlapping SSTables in level `i+1`.",
    "prompt": "Approximating total compaction write amplification across the 4 levels as `T × L` (10 × 4), how many megabytes of physical disk writes occur per 1 MB of logical user data written?",
    "question": "Approximating total compaction write amplification across the 4 levels as `T × L` (10 × 4), how many megabytes of physical disk writes occur per 1 MB of logical user data written?",
    "unit": "MB",
    "answer": 40,
    "tolerance": 0.25,
    "hint": "Multiply the fanout factor T = 10 by the number of compacted levels L = 4.",
    "explanation": "In leveled compaction with fanout `T = 10` across 4 levels, each byte flushed from the MemTable is rewritten up to ~10 times per level transition, yielding a write amplification factor of ~40 MB of physical SSD writes per 1 MB of logical ingestion.",
    "tags": [
      "lsm-tree-storage-engine",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "lsm-tree-storage-engine-t1",
    "topic": "lsm-tree-storage-engine",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Size-Tiered (STCS) vs Leveled (LCS) Compaction",
    "scenario": "You operate a RocksDB/Cassandra cluster on NVMe SSDs that is currently at 72% disk utilization and serves latency-sensitive point reads (p99 < 8 ms) alongside steady writes.",
    "prompt": "Which compaction strategy should you configure, and what is the primary engineering justification?",
    "question": "Which compaction strategy should you configure, and what is the primary engineering justification?",
    "options": [
      "Size-Tiered Compaction (STCS), because it needs zero temporary disk headroom during major compactions",
      "Leveled Compaction (LCS), because it bounds space amplification to ~10-15% (functioning safely at 72% disk usage) and bounds the number of SSTables checked on point/range reads",
      "Disable compaction entirely so SSTables accumulate forever without background I/O"
    ],
    "correctOption": 1,
    "reasons": [
      "Size-Tiered Compaction requires up to 50% free disk space to compact the largest tier and leaves many overlapping SSTables that hurt p99 read latency",
      "Leveled Compaction trades higher write amplification for tight space amplification (~10%) and predictable read latency (at most one SSTable per level L1+ for point lookups)",
      "Disabling compaction keeps p99 read latency constant as thousands of SSTables accumulate"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "At 72% disk usage, can Size-Tiered Compaction rewrite the largest SSTable tier (requiring ~50% free space)?",
    "explanation": "Size-Tiered Compaction (STCS) can require up to 50% free disk space for major compactions (which will fail at 72% disk fullness) and degrades read latency across overlapping tables. Leveled Compaction (LCS) keeps space overhead around ~10% and guarantees non-overlapping key ranges within each level `L1..Ln`.",
    "tags": [
      "lsm-tree-storage-engine",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["memtable-wal-and-sstable"] = [
  {
    "id": "memtable-wal-and-sstable-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "When a WAL can go",
    "section": "Worked example: one write, one flush, one crash",
    "prompt": "A memtable backed by log file 000123.log has been frozen and is being flushed to 000124.sst. At what point can 000123.log safely be deleted?",
    "options": [
      "As soon as the memtable is frozen and a new log file has been opened",
      "Once the background thread has started writing the new SSTable",
      "After the SSTable is synced and recorded in the MANIFEST",
      "After the next compaction has moved the SSTable into Level 1"
    ],
    "answer": 2,
    "explanation": "Until the SSTable is durable and the MANIFEST lists it as live, the log is the only durable copy of those writes. Waiting for a later compaction is unnecessary, because once the SST is recorded the data is already safe.",
    "tags": [
      "memtable-wal-and-sstable",
      "recall",
      "inline"
    ]
  },
  {
    "id": "memtable-wal-and-sstable-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Periodic sync loss window",
    "section": "Durability knobs",
    "prompt": "A Cassandra node uses the default periodic commitlog sync of 10 seconds. The node loses power. What can be lost on that node?",
    "options": [
      "Nothing, because every write was appended to the commit log before it was acknowledged",
      "Up to about 10 seconds of writes that were already acknowledged to clients",
      "The whole memtable since the last flush, regardless of the commit log",
      "Only writes still in the memtable that had not yet been appended to the log"
    ],
    "answer": 1,
    "explanation": "In periodic mode the append reaches the log file in the OS page cache and the write is acknowledged before the next sync, so a power loss can drop up to one interval of acknowledged writes. The first option confuses appended with durable; a process crash alone would be safe.",
    "tags": [
      "memtable-wal-and-sstable",
      "apply",
      "inline"
    ]
  },
  {
    "id": "memtable-wal-and-sstable-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Oversized memtables",
    "section": "Failure modes",
    "prompt": "To reduce flush frequency, a team raises the memtable size from 64 MB to 2 GB per column family. What gets worse?",
    "options": [
      "Crash recovery, because far more WAL must be replayed, and RAM use grows",
      "Write amplification, because each larger flush is rewritten more times by compaction",
      "Bloom filter accuracy, because larger SSTables raise the false-positive rate",
      "Level ordering, because big flushes create overlapping files in Level 1"
    ],
    "answer": 0,
    "explanation": "A bigger memtable covers more unflushed log, so recovery replays much more WAL and memory use rises. Larger memtables tend to reduce compaction work rather than increase it, and filter accuracy depends on bits per key, not file size.",
    "tags": [
      "memtable-wal-and-sstable",
      "staff",
      "inline"
    ]
  },
  {
    "id": "memtable-wal-and-sstable-n1",
    "topic": "memtable-wal-and-sstable",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: MemTable Flush Interval and L0 SSTable Generation",
    "scenario": "A RocksDB instance configures a `64 MB` MemTable size and receives sustained writes at `16 MB/s`.",
    "prompt": "Every how many seconds does the active MemTable fill up and flush a new L0 SSTable to disk?",
    "question": "Every how many seconds does the active MemTable fill up and flush a new L0 SSTable to disk?",
    "unit": "seconds",
    "answer": 4,
    "tolerance": 0.2,
    "hint": "Divide the 64 MB MemTable capacity by the 16 MB/s write rate.",
    "explanation": "64 MB / 16 MB/s = 4 seconds per MemTable flush (producing 15 L0 SSTables per minute before background compaction merges them).",
    "tags": [
      "memtable-wal-and-sstable",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "memtable-wal-and-sstable-t1",
    "topic": "memtable-wal-and-sstable",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Why LSM Engines Need Both a WAL and a MemTable",
    "scenario": "An engineer asks: \"Since SSTables are written sequentially on flush anyway, why does an LSM engine write every mutation to a Write-Ahead Log (WAL) AND insert it into an in-memory SkipList MemTable?\"",
    "prompt": "What distinct role does each structure play on the write and crash-recovery path?",
    "question": "What distinct role does each structure play on the write and crash-recovery path?",
    "options": [
      "The WAL is sorted by key for binary search, while the MemTable is an unsorted append array",
      "The MemTable is stored on magnetic tape while the WAL is kept only in CPU L1 cache",
      "The WAL is an unsorted append-only disk file ensuring crash durability for uncommitted MemTable state, while the in-memory SkipList MemTable sorts keys in RAM so they can be flushed as a sorted SSTable in one sequential pass"
    ],
    "correctOption": 2,
    "reasons": [
      "Sorting an on-disk file on every 100-byte write is fast",
      "If the process crashes before the 64 MB MemTable flushes, RAM is volatile",
      "Maintaining sorted order on disk per write would require random I/O; sorting in RAM (SkipList) is fast and volatile, while appending unsorted records to the WAL on disk is sequential and durable"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How can you get both durability (disk) and sorted order (for SSTables) without doing random disk I/O?",
    "explanation": "The WAL gives sequential disk durability for recent writes, while the MemTable (SkipList/B-Tree in RAM) absorbs and sorts writes in memory until a full 64 MB sorted run can be written sequentially as an SSTable.",
    "tags": [
      "memtable-wal-and-sstable",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["lsm-read-path-bloom-and-sparse-index"] = [
  {
    "id": "lsm-read-path-bloom-and-sparse-index-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Negative filter answer",
    "section": "Under the Hood: Bloom Filter Mathematics",
    "prompt": "An SSTable's Bloom filter reports that key K is not present. What can the engine conclude?",
    "options": [
      "K is probably absent, so it should still check the sparse index about 1% of the time",
      "K is definitely not in that SSTable, so the file can be skipped with no disk read",
      "K is absent from every level, so the whole lookup can return not found",
      "K is absent unless it was deleted, in which case only a tombstone may remain"
    ],
    "answer": 1,
    "explanation": "Bloom filters have no false negatives, so a negative answer means that file does not contain K. The roughly 1% uncertainty applies only to positive answers, and one file's filter says nothing about other files or levels.",
    "tags": [
      "lsm-read-path-bloom-and-sparse-index",
      "recall",
      "inline"
    ]
  },
  {
    "id": "lsm-read-path-bloom-and-sparse-index-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Filter size at 15 bits",
    "section": "Worked example: sizing filters and indexes",
    "prompt": "You give an SSTable holding 50 million keys a Bloom filter of 15 bits per key. Roughly how large is the filter and what false-positive rate should you expect?",
    "options": [
      "About 94 MB, false positive rate about 0.07%",
      "About 750 MB, false positive rate about 0.07%",
      "About 94 MB, false positive rate about 0.8%",
      "About 62 MB, false positive rate about 0.07%"
    ],
    "answer": 0,
    "explanation": "50 million times 15 bits is 750 million bits, which is about 94 MB, and the lesson's table gives about 0.07% at 15 bits per key. 750 MB treats bits as bytes, and 0.8% is the rate for 10 bits per key.",
    "tags": [
      "lsm-read-path-bloom-and-sparse-index",
      "apply",
      "inline"
    ]
  },
  {
    "id": "lsm-read-path-bloom-and-sparse-index-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Filters and range scans",
    "section": "Optimizations real engines use",
    "prompt": "A workload is dominated by short range scans within one user's key prefix, such as all orders for user 42. Why do standard point Bloom filters not help, and what does?",
    "options": [
      "Point filters help scans only after compaction has moved all data to the last level",
      "Range scans are served entirely from the memtable, so filters are not needed at all",
      "Point filters do help scans once bits per key are raised to about 20",
      "Point filters only answer exact-key membership; prefix Bloom filters let scans within one prefix skip files"
    ],
    "answer": 3,
    "explanation": "A point filter hashes whole keys, so it cannot say whether any key in a range exists; a prefix filter hashes the prefix and can rule a file out for a bounded scan. More bits per key only makes exact-key answers more accurate and does nothing for ranges.",
    "tags": [
      "lsm-read-path-bloom-and-sparse-index",
      "staff",
      "inline"
    ]
  },
  {
    "id": "lsm-read-path-bloom-and-sparse-index-n1",
    "topic": "lsm-read-path-bloom-and-sparse-index",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Bloom Filter Disk-Seek Elimination on LSM Point Lookups",
    "scenario": "A point lookup for a key that resides only in the deepest level (`L4`) must check 10 overlapping SSTables across `L0..L3` first. Each SSTable has a Bloom filter in RAM with a 1% false positive rate (`0.01`).",
    "prompt": "Across 100 point lookups for keys located in `L4` (1,000 negative SSTable checks across `L0..L3`), how many unnecessary disk block reads occur in total across `L0..L3` due to the 1% Bloom filter false positive rate?",
    "question": "Across 100 point lookups for keys located in `L4` (1,000 negative SSTable checks across `L0..L3`), how many unnecessary disk block reads occur in total across `L0..L3` due to the 1% Bloom filter false positive rate?",
    "unit": "reads",
    "answer": 10,
    "tolerance": 0.2,
    "hint": "Multiply 1,000 negative SSTable checks (`100 lookups × 10 SSTables`) by the 1% (`0.01`) false positive rate.",
    "explanation": "Without Bloom filters, 100 lookups across 10 SSTables would issue 1,000 wasted SSTable reads. A 1% (~10 bits/key) Bloom filter eliminates 99% of them, leaving only 1,000 × 0.01 = 10 extra reads (0.1 per lookup).",
    "tags": [
      "lsm-read-path-bloom-and-sparse-index",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "lsm-read-path-bloom-and-sparse-index-t1",
    "topic": "lsm-read-path-bloom-and-sparse-index",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Full Key Bloom Filters vs Prefix Bloom Filters for Range Scans",
    "scenario": "Your RocksDB workload performs both point `Get(key)` lookups and short range scans `Seek(tenant_id + \":\")` iterating over all keys for a single tenant. You configured whole-key Bloom filters, but `Seek()` calls are still reading every L0 SSTable from disk.",
    "prompt": "Why is a whole-key Bloom filter bypassed during `Seek(prefix)`, and how do you fix it?",
    "question": "Why is a whole-key Bloom filter bypassed during `Seek(prefix)`, and how do you fix it?",
    "options": [
      "Bloom filters automatically match arbitrary substrings of hashed keys",
      "Increase the whole-key Bloom filter from 10 bits/key to 100 bits/key",
      "A hash of the full key `H(tenant_id + \":\" + item_id)` tells you nothing about whether prefix `tenant_id + \":\"` exists; configure a `prefix_extractor` and Prefix Bloom Filter so `Seek(prefix)` skips SSTables lacking that prefix"
    ],
    "correctOption": 2,
    "reasons": [
      "Cryptographic and murmur hashes preserve prefix ordering",
      "More bits per full key allow prefix matching",
      "Hashing a fixed-length key prefix into a Prefix Bloom Filter allows `Iterator::Seek(prefix)` to test `H(prefix)` against each SSTable before touching disk"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Can you test whether any key starting with `\"user_42:\"` is in a Bloom filter if the filter only hashed `\"user_42:order_99\"`?",
    "explanation": "A Bloom filter only tests exact membership of whatever byte slice was hashed. Configuring a `prefix_extractor` hashes the prefix into a prefix Bloom filter, enabling `Seek(prefix)` to skip irrelevant SSTables.",
    "tags": [
      "lsm-read-path-bloom-and-sparse-index",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["compaction-and-amplification"] = [
  {
    "id": "compaction-and-amplification-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why leveled reads win",
    "section": "Compaction Strategies Compared",
    "prompt": "Why are point reads usually cheaper under leveled compaction than under size-tiered compaction?",
    "options": [
      "Leveled compaction compresses more aggressively, so each data block read is smaller",
      "Leveled compaction keeps recently written data in memory until it reaches the last level",
      "Leveled compaction keeps each level below L0 non-overlapping, so at most one file per level can hold a key",
      "Size-tiered compaction cannot use Bloom filters because its runs overlap"
    ],
    "answer": 2,
    "explanation": "Non-overlapping levels mean key-range metadata points to at most one file per level, while size-tiered keeps several overlapping runs per tier that may all need probing. Size-tiered runs still use Bloom filters; they simply have more candidate files to check.",
    "tags": [
      "compaction-and-amplification",
      "recall",
      "inline"
    ]
  },
  {
    "id": "compaction-and-amplification-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Device write rate",
    "section": "Worked example: what amplification costs in hardware",
    "prompt": "A leveled LSM ingests 80 MB/s of user data and has a measured write amplification of 25x. What sustained write rate must the storage devices absorb?",
    "options": [
      "About 2 GB/s",
      "About 80 MB/s",
      "About 320 MB/s",
      "About 20 GB/s"
    ],
    "answer": 0,
    "explanation": "Write amplification multiplies user bytes: 80 MB/s times 25 is 2 GB/s, or roughly 170 TB per day. 80 MB/s ignores compaction rewrites entirely, and that gap is why write-heavy clusters wear out drives rated in drive writes per day.",
    "tags": [
      "compaction-and-amplification",
      "apply",
      "inline"
    ]
  },
  {
    "id": "compaction-and-amplification-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Queue-shaped deletes",
    "section": "Failure modes",
    "prompt": "A team uses a Cassandra table as a work queue: insert a row, read the oldest rows, delete them. After a few days, reads of the queue partition start failing. What is happening?",
    "options": [
      "Deletes are applied synchronously and hold partition locks that block the reads",
      "Reads must scan long runs of tombstones that cannot be purged yet, crossing the tombstone failure threshold",
      "Leveled compaction rewrites the whole queue partition on every delete, starving reads",
      "Bloom filters saturate because deleted keys are never removed from them"
    ],
    "answer": 1,
    "explanation": "Each delete leaves a tombstone that stays until compaction and gc_grace_seconds (10 days by default) allow purging, so reading the head of the queue walks thousands of them; Cassandra fails a query at 100,000 by default. Cassandra does not lock partitions on delete, so the locking option describes a different kind of database.",
    "tags": [
      "compaction-and-amplification",
      "staff",
      "inline"
    ]
  },
  {
    "id": "compaction-and-amplification-n1",
    "topic": "compaction-and-amplification",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Leveled Compaction Write Amplification vs Space Overhead",
    "scenario": "A Leveled Compaction LSM tree has a level size multiplier of `10×`, where the last level `L_max` holds `900 GB` and all upper levels `L0..L_{max-1}` combined hold `100 GB` (`1,000 GB` total on disk). Almost all obsolete/overwritten keys in upper levels shadow keys in `L_max` (`100 GB` of dead space).",
    "prompt": "What percentage of total disk storage (`100 GB / 1,000 GB`) is occupied by obsolete/duplicate versions in Leveled Compaction?",
    "question": "What percentage of total disk storage (`100 GB / 1,000 GB`) is occupied by obsolete/duplicate versions in Leveled Compaction?",
    "unit": "%",
    "answer": 10,
    "tolerance": 0.2,
    "hint": "Divide 100 GB in upper levels by 1,000 GB total disk footprint.",
    "explanation": "Because `L_max` holds ~90% of all bytes in a 10× leveled tree and has no duplicate keys within itself, space amplification is bounded to ~10% (`100 / 1,000`), compared to ~50% temporary space amplification in Size-Tiered Compaction.",
    "tags": [
      "compaction-and-amplification",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "compaction-and-amplification-t1",
    "topic": "compaction-and-amplification",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Size-Tiered (STCS) vs Leveled (LCS) vs FIFO/Time-Window Compaction (TWCS)",
    "scenario": "You store immutable time-series metrics with a strict 30-day TTL in Cassandra/RocksDB. Using Leveled Compaction causes massive CPU/IO churn rewriting old metrics across levels.",
    "prompt": "Which compaction strategy is optimal for append-only time-series data with a fixed TTL, and why?",
    "question": "Which compaction strategy is optimal for append-only time-series data with a fixed TTL, and why?",
    "options": [
      "Leveled Compaction (LCS) with a level multiplier of 2",
      "Randomly merging 20-day-old SSTables with 1-minute-old SSTables",
      "Time-Window Compaction Strategy (TWCS) / FIFO Compaction, which groups SSTables into non-overlapping time buckets (e.g., 1 day) and drops entire expired SSTable files when the bucket passes the 30-day TTL"
    ],
    "correctOption": 2,
    "reasons": [
      "LCS avoids rewriting immutable time-series data across levels",
      "Merging old and new time windows allows whole-file TTL drops",
      "TWCS compacts only within the active time window and never merges across windows, reducing write amplification near 1× and turning TTL expiration into an O(1) whole-file unlink"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens if an SSTable contains keys from Day 1 mixed with keys from Day 29 when the 30-day TTL expires?",
    "explanation": "Mixing timestamps across SSTables prevents dropping expired files until every key in the file expires. Time-Window Compaction keeps time buckets strictly isolated so expired daily SSTables drop cleanly with zero rewrite.",
    "tags": [
      "compaction-and-amplification",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["object-storage-vs-database"] = [
  {
    "id": "object-storage-vs-database-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Editing an object",
    "section": "Detailed Architectural Differences",
    "prompt": "You need to change 1 KB in the middle of a 2 GB object stored in S3. What does the object model require?",
    "options": [
      "Send a PUT with a Range header covering just the bytes that changed",
      "Write a whole new version of the object, because objects cannot be modified in place",
      "Send a PATCH request, which the store applies atomically to the stored bytes",
      "Append the new bytes to the object and let the store compact them later"
    ],
    "answer": 1,
    "explanation": "Object storage is coarse grained: an object can only be replaced or deleted as a whole. Range headers apply to reads (GET), not to in-place writes, which is what makes the first option tempting but wrong.",
    "tags": [
      "object-storage-vs-database",
      "recall",
      "inline"
    ]
  },
  {
    "id": "object-storage-vs-database-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Photo storage bill",
    "section": "Worked example: 50 million photos",
    "prompt": "Using the lesson's price of about USD 0.023 per GB-month for S3 Standard, roughly what is the monthly storage cost for 200 million images averaging 250 KB?",
    "options": [
      "About USD 11,500",
      "About USD 4,600",
      "About USD 1,150",
      "About USD 115"
    ],
    "answer": 2,
    "explanation": "200 million times 250 KB is 50 TB, or 50,000 GB, and 50,000 times 0.023 is about USD 1,150 a month. About USD 11,500 is closer to what three SSD database replicas would cost, which is the point of the comparison.",
    "tags": [
      "object-storage-vs-database",
      "apply",
      "inline"
    ]
  },
  {
    "id": "object-storage-vs-database-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Abandoned uploads",
    "section": "The standard pattern",
    "prompt": "In the presigned-upload pattern, a client uploads the object and then crashes before the completion callback, so the row stays pending. What cleans this up?",
    "options": [
      "The database transaction that created the pending row rolls back the upload automatically",
      "S3 deletes any object that no database row references within 24 hours",
      "The presigned URL's expiry deletes whatever was uploaded through it",
      "A periodic sweeper deletes objects that have no active row after a grace period"
    ],
    "answer": 3,
    "explanation": "The database and the object store are two systems with no shared transaction, so the design adds a sweeper that removes orphans and alerts on rows whose object is missing. URL expiry only stops new uploads through that URL; it never deletes objects already stored.",
    "tags": [
      "object-storage-vs-database",
      "staff",
      "inline"
    ]
  },
  {
    "id": "object-storage-vs-database-n1",
    "topic": "object-storage-vs-database",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Storing Blobs in SQL DB vs Object Storage Cost & Backup Time",
    "scenario": "An application stores 100,000,000 PDF receipts averaging 200 KB each (`20 TB` of blobs) plus 200 bytes of relational metadata per receipt (`20 GB` total metadata).",
    "prompt": "By what factor (`20,000 GB / 20 GB`) does the relational database size shrink when you move the 200 KB PDF blobs to S3 and store only the 200-byte metadata + S3 URI in PostgreSQL?",
    "question": "By what factor (`20,000 GB / 20 GB`) does the relational database size shrink when you move the 200 KB PDF blobs to S3 and store only the 200-byte metadata + S3 URI in PostgreSQL?",
    "unit": "x",
    "answer": 1000,
    "tolerance": 0.2,
    "hint": "Divide 200,000 bytes (200 KB) by 200 bytes of metadata.",
    "explanation": "Moving the 200 KB blobs to object storage shrinks PostgreSQL from ~20 TB down to 20 GB (a 1,000× reduction), allowing the entire relational database and its indexes to fit entirely in RAM.",
    "tags": [
      "object-storage-vs-database",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "object-storage-vs-database-t1",
    "topic": "object-storage-vs-database",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Dual-Write Consistency Between Database Metadata and Object Storage",
    "scenario": "When a user uploads an invoice, the backend must save the PDF in S3 and insert an `invoices` row in PostgreSQL. If the app writes to S3 first and crashes before inserting into PostgreSQL (or vice versa), orphan blobs or broken links appear.",
    "prompt": "Which workflow safely coordinates the PostgreSQL metadata row and the S3 blob upload without holding a DB transaction open during slow network uploads?",
    "question": "Which workflow safely coordinates the PostgreSQL metadata row and the S3 blob upload without holding a DB transaction open during slow network uploads?",
    "options": [
      "Open a PostgreSQL `SERIALIZABLE` transaction, stream the 50 MB upload through the DB connection, and commit",
      "Insert the DB row as `status = READY` first and hope the client upload never fails",
      "Insert a `PENDING_UPLOAD` intent row in PostgreSQL, issue a pre-signed S3 PUT URL, transition the row to `ACTIVE` upon S3 completion notification/verification, and run a background sweeper to garbage-collect stale `PENDING_UPLOAD` intents"
    ],
    "correctOption": 2,
    "reasons": [
      "Holding database connections open during slow client uploads maximizes connection pool capacity",
      "Marking rows `READY` before the file exists prevents 404 errors",
      "A two-state intent record (`PENDING_UPLOAD` -> `ACTIVE`) prevents dangling references on crash while keeping slow blob transfers off the database connection pool and enabling deterministic orphan cleanup"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Should a database transaction ever stay open while waiting for a multi-megabyte HTTP upload?",
    "explanation": "Recording an intent state (`PENDING_UPLOAD`) before issuing a pre-signed upload URL ensures every S3 object is tracked for garbage collection if the upload fails, and readers never see an unuploaded file.",
    "tags": [
      "object-storage-vs-database",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["s3-object-storage-architecture"] = [
  {
    "id": "s3-object-storage-architecture-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why a sorted index",
    "section": "Internal Subsystems of S3",
    "prompt": "Why does an S3-like metadata tier keep keys in partitioned B-trees or LSM-trees instead of a simple hash ring?",
    "options": [
      "Prefix LIST needs keys stored in sorted order so a listing becomes a range scan",
      "Hash rings cannot replicate entries across Availability Zones",
      "Sorted trees use less memory per key than a hash-based layout",
      "SigV4 signature checks require keys to be looked up in sorted order"
    ],
    "answer": 0,
    "explanation": "LIST with a prefix is a range scan, which only works if adjacent keys sit together in sorted order; hashing would scatter them across every partition. Hash rings replicate across zones perfectly well, so that option names a problem that does not exist.",
    "tags": [
      "s3-object-storage-architecture",
      "recall",
      "inline"
    ]
  },
  {
    "id": "s3-object-storage-architecture-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "PUT commit point",
    "section": "Worked example: the life of a PUT",
    "prompt": "During a PUT, the front end has durably stored enough shards but crashes before writing the index entry. What does a client observe, and why?",
    "options": [
      "The object is visible, because durable shards are what define the object's existence",
      "The object is not visible and the client never got a 200, so it retries; the orphaned shards are reclaimed later",
      "The object appears in LIST results, but GET returns 404 until a repair process runs",
      "The client can read a partial object, because index entries are written as shards arrive"
    ],
    "answer": 1,
    "explanation": "The index write is the commit point: without it no key maps to the shards, so the object does not exist and the client, lacking a 200, retries. Shards alone are not an object, and because the index is written only after the shards, a partial read is not possible.",
    "tags": [
      "s3-object-storage-architecture",
      "staff",
      "inline"
    ]
  },
  {
    "id": "s3-object-storage-architecture-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Valid multipart plan",
    "section": "Public numbers worth knowing",
    "prompt": "You need to upload a 50 GB file to S3. Which plan fits the published limits?",
    "options": [
      "A single PUT of the whole 50 GB object",
      "A multipart upload of 50,000 parts of 1 MB each",
      "A multipart upload of 5,000 parts of 10 MB each",
      "A multipart upload of 5 parts of 10 GB each"
    ],
    "answer": 2,
    "explanation": "Parts must be 5 MB to 5 GB (except the last) and there can be at most 10,000, so 5,000 parts of 10 MB fits. A single PUT is capped at 5 GB, 1 MB parts are too small and exceed the part count, and 10 GB parts exceed the 5 GB part limit.",
    "tags": [
      "s3-object-storage-architecture",
      "apply",
      "inline"
    ]
  },
  {
    "id": "s3-object-storage-architecture-n1",
    "topic": "s3-object-storage-architecture",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Erasure Coding vs 3x Replication Storage Savings",
    "scenario": "An object store holds 100 PB (petabytes) of logical user objects. Previously it used 3-way full replication (3.0x overhead = 300 PB raw disk). It migrates to Reed-Solomon `(k = 8, m = 4)` erasure coding across 12 storage racks (1.5x overhead = 150 PB raw disk).",
    "prompt": "How many petabytes (PB) of raw physical disk capacity are saved by migrating from 3x replication to `(8, 4)` erasure coding?",
    "question": "How many petabytes (PB) of raw physical disk capacity are saved by migrating from 3x replication to `(8, 4)` erasure coding?",
    "unit": "PB",
    "answer": 150,
    "tolerance": 0.25,
    "hint": "Raw disk with 3x replication = 300 PB. Raw disk with (8+4)/8 = 1.5x erasure coding = 150 PB. Subtract the two.",
    "explanation": "3x replication requires 300 PB of raw disk for 100 PB of logical data, whereas `(8, 4)` Reed-Solomon splits each object into 8 data chunks + 4 parity chunks (`12/8 = 1.5x` overhead = 150 PB), saving 300 - 150 = 150 PB while tolerating up to 4 simultaneous rack/node failures (vs 2 in 3x replication).",
    "tags": [
      "s3-object-storage-architecture",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "s3-object-storage-architecture-t1",
    "topic": "s3-object-storage-architecture",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Small-Object Packing vs Direct Per-Object Files on Disk",
    "scenario": "A workload uploads 10 billion tiny 4 KB JSON objects into your object storage engine. Storing each 4 KB object as a separate Linux filesystem file exhausts inode tables and turns every read/scrubber pass into random metadata I/O.",
    "prompt": "How do hyperscale object stores (like Haystack / S3 / Tectonic) store billions of small objects efficiently, and what is the trade-off?",
    "question": "How do hyperscale object stores (like Haystack / S3 / Tectonic) store billions of small objects efficiently, and what is the trade-off?",
    "options": [
      "Format the storage drives with 512-byte blocks and create 10 billion nested subdirectories",
      "Append small objects sequentially into large immutable multi-gigabyte volume/extent files and store `(volume_id, byte_offset, length)` in a separate partitioned metadata index, requiring background garbage collection to reclaim deleted extents",
      "Reject all objects smaller than 64 MB at the API gateway"
    ],
    "correctOption": 1,
    "reasons": [
      "Deep nested POSIX directories eliminate inode lookups and disk seeks",
      "Packing small objects into large append-only extents eliminates filesystem inode overhead and enables single-seek byte-range reads, trading off background compaction/GC for deleted objects",
      "Object stores are only used for multi-gigabyte video archives"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Think about Facebook Haystack / S3 extent storage: how do you avoid 3 POSIX disk seeks per small file read?",
    "explanation": "Appending small blobs into large immutable extent/log files (e.g., 1–64 GB volumes) and indexing `(volume_id, offset, size)` in a fast metadata KV store reduces object retrieval to a single disk read while eliminating POSIX inode bloat, at the cost of periodic compaction to reclaim space from deleted objects.",
    "tags": [
      "s3-object-storage-architecture",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["range-partitioning-vs-consistent-hashing-storage"] = [
  {
    "id": "range-partitioning-vs-consistent-hashing-storage-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Hot keys and hashing",
    "section": "Tradeoff Matrix",
    "prompt": "A single product key receives 40% of all reads. Does consistent hashing solve this hotspot?",
    "options": [
      "Yes, virtual nodes spread one key's requests across many physical owners",
      "No, one key still maps to one owner, so it needs splitting, caching or replication",
      "Yes, as long as the token ring uses the full 64-bit token space",
      "No, but range partitioning fixes it automatically by splitting the hot range"
    ],
    "answer": 1,
    "explanation": "Hashing spreads distinct keys, but every request for one key hashes to the same owner, so the key itself must be cached, replicated or split. Range splitting cannot divide a single key either, so the last option is also wrong.",
    "tags": [
      "range-partitioning-vs-consistent-hashing-storage",
      "recall",
      "inline"
    ]
  },
  {
    "id": "range-partitioning-vs-consistent-hashing-storage-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Data moved on scale-out",
    "section": "Worked example: how much data moves when you add a node",
    "prompt": "A cluster of 20 nodes holds 40 TB spread evenly using consistent hashing with many virtual nodes. You grow it to 25 nodes. About how much data moves?",
    "options": [
      "About 32 TB",
      "About 10 TB",
      "About 1.6 TB",
      "About 8 TB"
    ],
    "answer": 3,
    "explanation": "The new nodes end up owning 5/25 = 20% of the ring, so about 8 TB moves, taken evenly from existing nodes. About 32 TB is what naive mod-N hashing would move (roughly 80% of keys), and 10 TB wrongly uses 5/20.",
    "tags": [
      "range-partitioning-vs-consistent-hashing-storage",
      "apply",
      "inline"
    ]
  },
  {
    "id": "range-partitioning-vs-consistent-hashing-storage-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Cost of salting",
    "section": "Worked example: the timestamp hotspot",
    "prompt": "To fix a timestamp hotspot under range partitioning, you prefix each key with hash(event_id) mod 16. What is the main cost of this fix?",
    "options": [
      "Writes spread over 16 ranges, but every time-range query must now fan out to all 16",
      "Writes spread over 16 ranges, but events for one device lose their time ordering",
      "There is no real cost beyond storing 16 times more partition metadata",
      "The hotspot simply moves to salt bucket 0, which receives the newest keys"
    ],
    "answer": 0,
    "explanation": "Salting spreads writes, but a query for a time window must now ask all 16 ranges and merge the results. Within each salt bucket keys are still in time order, and new writes are spread across buckets rather than piling into bucket 0.",
    "tags": [
      "range-partitioning-vs-consistent-hashing-storage",
      "staff",
      "inline"
    ]
  },
  {
    "id": "range-partitioning-vs-consistent-hashing-storage-n1",
    "topic": "range-partitioning-vs-consistent-hashing-storage",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Range Scan Scatter-Gather Reduction",
    "scenario": "A cluster has 64 storage nodes. A query fetches all orders for `customer_id = 42` between Jan 1 and Jan 7 (covering 150 rows). Under pure random hash partitioning on `order_id`, the query must fan out to all 64 nodes; under range partitioning on `(customer_id, created_at)`, all 150 rows sit contiguously in 1 range tablet.",
    "prompt": "By what factor (`64 / 1`) does range partitioning on `(customer_id, created_at)` reduce the number of nodes contacted for this customer time-range query?",
    "question": "By what factor (`64 / 1`) does range partitioning on `(customer_id, created_at)` reduce the number of nodes contacted for this customer time-range query?",
    "unit": "x",
    "answer": 64,
    "tolerance": 0.2,
    "hint": "Compare 64 nodes contacted (scatter-gather) vs 1 range tablet node.",
    "explanation": "Range partitioning on `(customer_id, created_at)` co-locates a customer's contiguous time window onto a single range tablet (1 node instead of 64), reducing RPC fan-out by 64×.",
    "tags": [
      "range-partitioning-vs-consistent-hashing-storage",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "range-partitioning-vs-consistent-hashing-storage-t1",
    "topic": "range-partitioning-vs-consistent-hashing-storage",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Pure Monotonic Range Partitioning vs Hash-Prefixed Range Tablets",
    "scenario": "In a range-partitioned database (e.g., Spanner, CockroachDB, HBase), a table is keyed solely by `created_at` timestamp. Under 100,000 inserts/sec, 100% of writes hit the single last range tablet while the other 99 nodes sit idle.",
    "prompt": "How do you preserve efficient range scans per entity/bucket while eliminating the monotonic timestamp write hotspot?",
    "question": "How do you preserve efficient range scans per entity/bucket while eliminating the monotonic timestamp write hotspot?",
    "options": [
      "Keep `created_at` as the sole prefix key and buy a bigger CPU for the last node",
      "Hash every column separately so range scans are impossible",
      "Prefix the key with a high-cardinality entity key `(tenant_id, created_at)` or a bounded hash bucket `(hash(id) % B, created_at)` so writes distribute across all nodes while range scans within a tenant or across `B` buckets stay ordered"
    ],
    "correctOption": 2,
    "reasons": [
      "A single range tablet can absorb unlimited cluster-wide write throughput",
      "Full-cluster scatter-gather on every query is optimal",
      "A compound key `(entity_id, timestamp)` or hash-bucket prefix spreads concurrent writes across tablets while keeping timestamp ordering contiguous within each prefix"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Why does starting the primary key with `created_at` route every new insert to the exact same range tablet?",
    "explanation": "Monotonic leading keys concentrate all writes on the highest key range. Prefixing with `tenant_id` (or a small shard bucket `0..15`) distributes active writes across the cluster while preserving local sort order.",
    "tags": [
      "range-partitioning-vs-consistent-hashing-storage",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["partition-manager-and-map-table"] = [
  {
    "id": "partition-manager-and-map-table-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why splits are cheap",
    "section": "Under the Hood: The Tablet Split",
    "prompt": "Why can a Bigtable-style tablet split finish almost instantly even when the tablet holds hundreds of megabytes?",
    "options": [
      "The server copies the data to the new tablet in the background while still serving the old one",
      "The master pre-allocates both halves when the tablet is created, so a split only flips a flag",
      "Child tablets reference the parent's immutable SSTables with narrowed key ranges; compaction rewrites later",
      "Only the memtable is split; SSTables are shared and never divided by key range"
    ],
    "answer": 2,
    "explanation": "Because SSTables never change, both children can point at the same files with restricted start and end keys, and later compaction produces separate files. A background copy would make the split cost proportional to data size, which is exactly what the design avoids.",
    "tags": [
      "partition-manager-and-map-table",
      "recall",
      "inline"
    ]
  },
  {
    "id": "partition-manager-and-map-table-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Hierarchy capacity",
    "section": "Worked example: Bigtable's location hierarchy capacity",
    "prompt": "Suppose METADATA rows were 2 KB instead of 1 KB, with METADATA tablets still capped at 128 MB and a single root tablet. About how many user tablets could the three-level hierarchy address?",
    "options": [
      "2^34",
      "2^32",
      "2^16",
      "2^17"
    ],
    "answer": 1,
    "explanation": "Each METADATA tablet now holds 128 MB / 2 KB = 2^16 locations, so root times METADATA gives 2^16 x 2^16 = 2^32 user tablets. 2^34 is the original 1 KB figure, and 2^16 counts only one level.",
    "tags": [
      "partition-manager-and-map-table",
      "apply",
      "inline"
    ]
  },
  {
    "id": "partition-manager-and-map-table-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Stale route after split",
    "section": "A split, step by step (CockroachDB style)",
    "prompt": "After a CockroachDB-style split, a client with a cached route sends a request to the old range descriptor. What happens?",
    "options": [
      "The request is served by the old range, which still holds all of the data",
      "The leaseholder forwards it transparently and pushes cache updates to every client",
      "The request blocks until the rebalancer finishes moving one half to other nodes",
      "The client gets a range-key-mismatch error, refreshes its cache from meta2 and retries"
    ],
    "answer": 3,
    "explanation": "Routing caches are corrected lazily: a stale request is rejected with a mismatch error and the client re-resolves from meta2. Pushing updates to every client would put the coordinator back on the hot path, which lazy caching is designed to avoid.",
    "tags": [
      "partition-manager-and-map-table",
      "staff",
      "inline"
    ]
  },
  {
    "id": "partition-manager-and-map-table-n1",
    "topic": "partition-manager-and-map-table",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Dynamic Tablet Split Metadata Scale",
    "scenario": "A distributed storage cluster holds 256 TB (262,144 GB) of data split into dynamic range tablets targeting 64 GB per tablet. Each tablet entry in the Partition Map Table takes 256 bytes.",
    "prompt": "How many total tablets (`262,144 GB / 64 GB`) exist in the Partition Map Table?",
    "question": "How many total tablets (`262,144 GB / 64 GB`) exist in the Partition Map Table?",
    "unit": "tablets",
    "answer": 4096,
    "tolerance": 0.2,
    "hint": "Divide 262,144 GB by 64 GB per tablet.",
    "explanation": "262,144 GB / 64 GB = 4,096 tablets (occupying just 4,096 × 256 B = 1 MB of metadata), which easily fits in the memory of every client and router.",
    "tags": [
      "partition-manager-and-map-table",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "partition-manager-and-map-table-t1",
    "topic": "partition-manager-and-map-table",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Zero-Downtime Tablet Split Execution",
    "scenario": "A 64 GB range partition `[A, M)` grows past the split threshold and must split at midpoint `F` into `[A, F)` and `[F, M)` without copying 64 GB over the network before accepting writes.",
    "prompt": "How do modern LSM-based range stores (Bigtable, Spanner, CockroachDB, TiKV) execute an instant tablet split, and why?",
    "question": "How do modern LSM-based range stores (Bigtable, Spanner, CockroachDB, TiKV) execute an instant tablet split, and why?",
    "options": [
      "Block all writes for 20 minutes while copying 32 GB of files to another server",
      "Delete the upper half of the keys and ask clients to re-upload them",
      "Perform an instant metadata split in the Raft/Paxos group by recording two child range descriptors referencing the same immutable underlying SSTables (clipped by `[A, F)` and `[F, M)` bounds), then lazily separate files during background compaction"
    ],
    "correctOption": 2,
    "reasons": [
      "Blocking writes for 20 minutes during auto-split meets 99.99% availability SLOs",
      "Data loss is acceptable during partition splits",
      "Because SSTables are immutable, two child tablets can initially share hardlinks/references to the parent SSTables with logical key-range bounds, completing the split in milliseconds and physically separating bytes during normal compaction"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Do you need to physically rewrite immutable SSTables before declaring the range split in metadata?",
    "explanation": "An LSM tablet split is initially a fast metadata operation that creates two logical ranges backed by the parent's immutable SSTables; subsequent compactions physically materialize separate files and allow independent rebalancing.",
    "tags": [
      "partition-manager-and-map-table",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["metadata-db-for-object-storage"] = [
  {
    "id": "metadata-db-for-object-storage-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Sorted metadata keys",
    "section": "Under the Hood: Lexicographical Prefix Traversal",
    "prompt": "Why must object metadata be ordered by (bucket, key) rather than hash-partitioned by the full key if the system supports prefix listing?",
    "options": [
      "Sorted storage takes less disk space per key than a hashed layout",
      "Hash partitioning cannot provide strongly consistent reads of a single key",
      "Hashing scatters keys that share a prefix, so a listing would have to scan every partition",
      "Sorted order lets deletes remove entries without leaving any tombstones"
    ],
    "answer": 2,
    "explanation": "In sorted order a virtual folder is one contiguous range scan starting at the prefix; hashing scatters those keys so every partition must be searched. Hash-partitioned stores can still be strongly consistent per key, so that option names the wrong limitation.",
    "tags": [
      "metadata-db-for-object-storage",
      "recall",
      "inline"
    ]
  },
  {
    "id": "metadata-db-for-object-storage-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Delimiter listing result",
    "section": "Worked example: a delimiter listing",
    "prompt": "A bucket holds logs/2026/09/a.gz, logs/2026/09/b/x.gz, logs/2026/09/b/y.gz, logs/2026/09/c.gz and logs/2026/10/d.gz. What does LIST with prefix logs/2026/09/ and delimiter / return?",
    "options": [
      "Objects a.gz and c.gz, plus the common prefix logs/2026/09/b/",
      "Objects a.gz, b/x.gz, b/y.gz and c.gz, with no common prefixes",
      "Objects a.gz and c.gz only, since keys under b/ are hidden",
      "The common prefix logs/2026/09/b/, plus objects a.gz, c.gz and d.gz"
    ],
    "answer": 0,
    "explanation": "Keys with another / after the prefix collapse into one common prefix, emitted once, and the scan stops at logs/2026/10/ because it no longer matches. Returning b/x.gz and b/y.gz as objects is what happens without a delimiter.",
    "tags": [
      "metadata-db-for-object-storage",
      "apply",
      "inline"
    ]
  },
  {
    "id": "metadata-db-for-object-storage-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Data versus metadata order",
    "section": "Failure modes",
    "prompt": "To make uploads appear sooner, an engineer proposes writing the metadata entry before the data chunks. What is the flaw?",
    "options": [
      "None, as long as the metadata database is strongly consistent",
      "Readers can see entries that point at missing data; writing data first leaves only orphaned chunks, which GC can reclaim",
      "Listings get slower because pending entries must be filtered out on every scan",
      "Writing data first creates dangling entries, so metadata first is actually the safer order"
    ],
    "answer": 1,
    "explanation": "If metadata commits first, a failed or slow data write leaves a visible object with nothing behind it. Data first means the worst case is unreferenced chunks, a cleanup problem rather than a correctness bug; strong consistency of the metadata store does not change this.",
    "tags": [
      "metadata-db-for-object-storage",
      "staff",
      "inline"
    ]
  },
  {
    "id": "metadata-db-for-object-storage-n1",
    "topic": "metadata-db-for-object-storage",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Object Metadata Footprint for 10 Billion Objects",
    "scenario": "A planet-scale object store holds 10,000,000,000 (`10^10`) objects. Each object's metadata entry (`bucket, key, version, size, etag, chunk_locations`) averages 300 bytes before replication.",
    "prompt": "With 3× Raft replication across the metadata database tier, how many terabytes (TB, where 1 TB = 10^12 bytes) of storage does the metadata database alone require?",
    "question": "With 3× Raft replication across the metadata database tier, how many terabytes (TB, where 1 TB = 10^12 bytes) of storage does the metadata database alone require?",
    "unit": "TB",
    "answer": 9,
    "tolerance": 0.2,
    "hint": "Multiply `10^10` objects by 300 bytes (= 3 TB logical) and multiply by 3 replicas.",
    "explanation": "10^10 × 300 bytes = 3 × 10^12 bytes (3 TB logical); with 3× replication, the metadata database alone spans 9 TB—far too large for a single SQL node, requiring a horizontally sharded metadata KV/range store.",
    "tags": [
      "metadata-db-for-object-storage",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "metadata-db-for-object-storage-t1",
    "topic": "metadata-db-for-object-storage",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Partitioning the Object Metadata Namespace for `LIST prefix/`",
    "scenario": "Users of an S3-compatible object store require both 500,000/sec random `GET /bucket/key` lookups and fast lexicographical `LIST /bucket/logs/2026-10-23/` prefix scans.",
    "prompt": "How should the metadata database partition keys to support lexicographical `LIST` prefix scans while avoiding single-bucket hotspots?",
    "question": "How should the metadata database partition keys to support lexicographical `LIST` prefix scans while avoiding single-bucket hotspots?",
    "options": [
      "Hash the full `(bucket, object_key)` with SHA-256 so `LIST prefix/` must scan every shard in the cluster",
      "Pin each bucket to a single unsplitable SQLite file permanently",
      "Use lexicographically ordered range tablets keyed by `(bucket_id, object_key)` with automatic range splitting and load-based tablet rebalancing across nodes"
    ],
    "correctOption": 2,
    "reasons": [
      "Full-cluster scatter-gather across 1,000 metadata shards makes `LIST` calls cheap",
      "A single SQLite file handles 500,000 requests/sec per bucket",
      "Lexicographical range tablets preserve contiguous key order for `LIST prefix/` scans while dynamic range splitting spreads hot prefixes across multiple metadata Raft groups"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How can you keep keys sorted for `LIST prefix/` while spreading a huge bucket across hundreds of servers?",
    "explanation": "Range-partitioning `(bucket_id, object_key)` with automatic tablet splitting keeps lexicographical neighbors contiguous for fast `LIST` scans while splitting hot key prefixes across independent storage nodes.",
    "tags": [
      "metadata-db-for-object-storage",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["append-only-object-storage-stream-layer"] = [
  {
    "id": "append-only-object-storage-stream-layer-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Purpose of fencing",
    "section": "Handling Network Partitions: Lease Fencing & Sealed Chunks",
    "prompt": "In Apache BookKeeper, what does ledger recovery's fencing step accomplish?",
    "options": [
      "It makes the new writer wait until the old writer's lease expires before appending anything",
      "It lets both writers keep appending, then merges their entries by timestamp during reads",
      "It copies the ledger to a fresh set of bookies so the old ones can be discarded",
      "It makes storage nodes reject further appends from the old writer, so a paused zombie cannot extend the ledger"
    ],
    "answer": 3,
    "explanation": "Fencing is enforced on the storage nodes, so an old writer that wakes up after a pause has its appends refused. Waiting for a lease to expire is not enough, because a paused process may not notice its lease is gone and can still send writes.",
    "tags": [
      "append-only-object-storage-stream-layer",
      "recall",
      "inline"
    ]
  },
  {
    "id": "append-only-object-storage-stream-layer-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Seal length",
    "section": "Worked example: sealing after a failure",
    "prompt": "An extent's primary acknowledges appends only after all three replicas write them. Appends through byte 1,200 were acknowledged. The next append (bytes 1,200 to 1,500) reached replica A only, then the primary crashed. All replicas are reachable: A = 1,500, B = 1,200, C = 1,200. Where is the extent sealed?",
    "options": [
      "At 1,200, the smallest reachable length",
      "At 1,500, the longest replica's length",
      "At 1,350, the midpoint of the unacknowledged append",
      "It cannot be sealed until replica A trims itself"
    ],
    "answer": 0,
    "explanation": "The manager seals at the smallest length among reachable replicas, 1,200, and A trims to match. Nothing acknowledged is lost, because bytes 1,200 to 1,500 were never acknowledged and the client will retry them.",
    "tags": [
      "append-only-object-storage-stream-layer",
      "apply",
      "inline"
    ]
  },
  {
    "id": "append-only-object-storage-stream-layer-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Ack policy and sealing",
    "section": "Comparing append-only log layers",
    "prompt": "A team copies Azure's rule of sealing at the shortest reachable replica, but their primary acknowledges appends after 2 of 3 replicas, BookKeeper-style. What can go wrong?",
    "options": [
      "The longest replica may contain corrupt bytes, so sealing at the shortest length becomes mandatory",
      "Nothing, because clients retry anything missing from the sealed extent",
      "The shortest replica may lack acknowledged bytes, so sealing at its length can drop committed data",
      "Replicas never diverge under a 2-of-3 policy, so the sealing rule never actually matters"
    ],
    "answer": 2,
    "explanation": "Sealing at the minimum is safe only if every acknowledged byte is on every replica; with a 2-of-3 ack the lagging replica can miss acknowledged data. Clients do not retry writes they were told succeeded, which is why the nothing-goes-wrong option is the dangerous one.",
    "tags": [
      "append-only-object-storage-stream-layer",
      "staff",
      "inline"
    ]
  },
  {
    "id": "append-only-object-storage-stream-layer-n1",
    "topic": "append-only-object-storage-stream-layer",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Small-Object Inode Overhead Elimination (Haystack / SeaweedFS Volume Packing)",
    "scenario": "Storing 100,000,000 small 4 KB thumbnails as individual POSIX files requires 100,000,000 filesystem inodes (plus directory dentry lookups), consuming ~2 disk seeks per read when inodes miss cache. Packing them into large 32 GB append-only volume superfiles keeps a compact 24-byte per-needle index in RAM.",
    "prompt": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of RAM does the 24-byte-per-needle index require for 100,000,000 packed thumbnails?",
    "question": "How many gigabytes (GB, where 1 GB = 10^9 bytes) of RAM does the 24-byte-per-needle index require for 100,000,000 packed thumbnails?",
    "unit": "GB",
    "answer": 2.4,
    "tolerance": 0.2,
    "hint": "Multiply 100,000,000 needles by 24 bytes and divide by 10^9.",
    "explanation": "100,000,000 × 24 bytes = 2.4 GB of RAM, eliminating POSIX inode disk seeks completely so every thumbnail read takes exactly 1 disk `pread` into the append-only volume file.",
    "tags": [
      "append-only-object-storage-stream-layer",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "append-only-object-storage-stream-layer-t1",
    "topic": "append-only-object-storage-stream-layer",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: 1-File-Per-Object POSIX Storage vs Packed Append-Only Extent Volumes",
    "scenario": "Your object storage data nodes store millions of 10 KB–100 KB objects. Using standard ext4/XFS with one POSIX file per object causes disk IOPS saturation even at low bandwidth because `open()` + `stat()` + `read()` requires multiple metadata disk reads.",
    "prompt": "Why do production blob stores (Facebook Haystack, Tectonic, SeaweedFS, MinIO XL) pack small objects into large append-only volume extents?",
    "question": "Why do production blob stores (Facebook Haystack, Tectonic, SeaweedFS, MinIO XL) pack small objects into large append-only volume extents?",
    "options": [
      "POSIX filesystems forbid creating more than 1,000 files per disk",
      "Packing files into volumes disables checksum verification",
      "Packing thousands of objects as sequential \"needles\" inside multi-gigabyte volume files bypasses POSIX directory/inode lookups, turns writes into sequential appends, and serves reads in a single `pread(fd, offset, size)` using analready-open file descriptor"
    ],
    "correctOption": 2,
    "reasons": [
      "ext4 has a hard limit of 1,000 inodes",
      "Append-only needles cannot include CRC32 checksums",
      "POSIX inode metadata for hundreds of millions of tiny files overflows page cache and causes extra disk seeks per read; extent packing collapses metadata to a tiny in-memory offset map"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Recall the core insight of Facebook's Haystack paper (\"Finding a needle in Haystack\").",
    "explanation": "Filesystem inodes (128–256 bytes plus directory b-trees) are too heavy to cache in RAM for billions of small photos. Appending objects into large open volume files with a tiny in-memory needle index achieves 1-seek reads.",
    "tags": [
      "append-only-object-storage-stream-layer",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["object-storage-durability-and-replication"] = [
  {
    "id": "object-storage-durability-and-replication-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "RS overhead and tolerance",
    "section": "Under the Hood: Erasure Coding Math",
    "prompt": "For a Reed-Solomon RS(12, 4) code, what are the storage overhead and the number of lost fragments it can tolerate?",
    "options": [
      "1.25x overhead, any 4 lost fragments",
      "About 1.33x overhead, any 4 lost fragments",
      "About 1.33x overhead, any 12 lost fragments",
      "1.5x overhead, any 4 lost fragments"
    ],
    "answer": 1,
    "explanation": "Overhead is (k + m) / k = 16 / 12, about 1.33x, and any 12 of the 16 fragments rebuild the object, so any 4 can be lost. Tolerating 12 losses confuses k (fragments needed) with m (parity fragments).",
    "tags": [
      "object-storage-durability-and-replication",
      "recall",
      "inline"
    ]
  },
  {
    "id": "object-storage-durability-and-replication-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Disk failure rate",
    "section": "Worked example: how often do disks fail?",
    "prompt": "A fleet has 50,000 drives with a 1.5% annualized failure rate. Roughly how often does a drive fail?",
    "options": [
      "About once a week",
      "About once every two days",
      "About 750 times a day",
      "About twice a day"
    ],
    "answer": 3,
    "explanation": "1.5% of 50,000 is 750 failures a year, and 750 / 365 is about 2 a day. 750 a day misreads the annual count as daily; at this scale repair is continuous background work, not an occasional event.",
    "tags": [
      "object-storage-durability-and-replication",
      "apply",
      "inline"
    ]
  },
  {
    "id": "object-storage-durability-and-replication-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Hidden repair cost",
    "section": "Replication and erasure codes compared",
    "prompt": "Compared with 3-way replication, what is the main hidden operational cost of RS(10, 4), and how does Azure's LRC address it?",
    "options": [
      "Rebuilding one lost fragment reads ten fragments over the network; LRC adds local parities so a single loss reads fewer",
      "It tolerates fewer simultaneous losses than replication; LRC adds a full extra replica to compensate",
      "Its fragments cannot be spread across Availability Zones; LRC keeps groups inside one zone",
      "Every normal read must decode all 14 fragments; LRC stores one plain copy for reads"
    ],
    "answer": 0,
    "explanation": "Replication repairs by copying one replica, while RS(10, 4) must read ten fragments per lost fragment, which multiplies repair traffic. RS(10, 4) actually tolerates 4 losses to replication's 2, so the fewer-losses option is backwards.",
    "tags": [
      "object-storage-durability-and-replication",
      "staff",
      "inline"
    ]
  },
  {
    "id": "object-storage-durability-and-replication-n1",
    "topic": "object-storage-durability-and-replication",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Reed-Solomon Erasure Coding vs 3× Replication Storage Overhead",
    "scenario": "An object store holds `100 PB` of logical user data. Storing it with 3-way full replication requires `300 PB` of raw disk (`3.0×` overhead). Switching to Reed-Solomon `RS(10, 4)` erasure coding splits each object into 10 data stripes + 4 parity stripes (`14 / 10 = 1.4×` overhead) while tolerating any 4 concurrent failures.",
    "prompt": "How many petabytes (PB) of raw disk capacity are saved on `100 PB` of logical data by using `RS(10, 4)` (`140 PB`) instead of 3-way replication (`300 PB`)?",
    "question": "How many petabytes (PB) of raw disk capacity are saved on `100 PB` of logical data by using `RS(10, 4)` (`140 PB`) instead of 3-way replication (`300 PB`)?",
    "unit": "PB",
    "answer": 160,
    "tolerance": 0.2,
    "hint": "Subtract 140 PB (`100 × 1.4`) from 300 PB (`100 × 3.0`).",
    "explanation": "`RS(10, 4)` requires 140 PB of raw disk compared to 300 PB for 3× replication—saving 160 PB of raw storage while actually tolerating 4 simultaneous disk/rack failures instead of 2.",
    "tags": [
      "object-storage-durability-and-replication",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "object-storage-durability-and-replication-t1",
    "topic": "object-storage-durability-and-replication",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: 3-Way Replication vs Reed-Solomon Erasure Coding on the Hot Write Path",
    "scenario": "Erasure coding `RS(10, 4)` cuts disk cost by more than half, yet many storage engines first land incoming small writes on 3-way replicated journals/extents before background-encoding them into `RS(10, 4)` stripes.",
    "prompt": "Why do storage engines often combine 3-way replicated write staging with background Reed-Solomon erasure coding?",
    "question": "Why do storage engines often combine 3-way replicated write staging with background Reed-Solomon erasure coding?",
    "options": [
      "Reed-Solomon parity calculation is impossible on modern CPUs",
      "3-way replication uses less disk space than `RS(10, 4)`",
      "Erasure coding requires fanning out across 14 nodes (hurting tail latency on small writes and degraded reads); staging hot/small writes on 3 replicas gives low write latency, and background sealing into large `RS(10, 4)` extents captures the 1.4× space efficiency"
    ],
    "correctOption": 2,
    "reasons": [
      "SIMD Reed-Solomon encoding is slower than 1 KB/s",
      "300% overhead is smaller than 140% overhead",
      "Contacting 14 fault domains synchronously amplifies p99 tail latency and small-write overhead, whereas background encoding full immutable extents amortizes stripe fan-out"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens to p99 tail latency when every tiny write must synchronously coordinate across 14 storage nodes instead of 3?",
    "explanation": "Tiering from 3× replicated write journals/buffers into immutable `RS(k, m)` erasure-coded extents combines fast low-fanout write latency with low long-term storage overhead.",
    "tags": [
      "object-storage-durability-and-replication",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["end-to-end-checksums"] = [
  {
    "id": "end-to-end-checksums-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Per-block checksums",
    "section": "Under the Hood: Checksum Algorithms & Hardware Acceleration",
    "prompt": "Why do storage engines keep a checksum for every 4 KB block rather than one checksum per large file?",
    "options": [
      "A 32-bit CRC cannot be computed over inputs larger than a few megabytes",
      "Per-block checksums allow a damaged block to be repaired from the checksum itself",
      "A random read can verify just the blocks it touches without scanning the whole file",
      "Per-block checksums use less total space than a single file-level checksum"
    ],
    "answer": 2,
    "explanation": "With per-block checksums a 4 KB random read verifies only that block; a single file checksum would require reading the whole file. Checksums only detect damage, and repair still comes from replicas or parity, so the repair option is wrong.",
    "tags": [
      "end-to-end-checksums",
      "recall",
      "inline"
    ]
  },
  {
    "id": "end-to-end-checksums-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Checksum overhead at 10 PB",
    "section": "Overhead of block checksums",
    "prompt": "You store 10 PB in 4 KB blocks and use an 8-byte xxHash64 per block instead of a 4-byte CRC32C. Roughly how much checksum storage is that?",
    "options": [
      "About 2 TB, roughly 0.02% overhead",
      "About 20 TB, roughly 0.2% overhead",
      "About 200 TB, roughly 2% overhead",
      "About 10 TB, roughly 0.1% overhead"
    ],
    "answer": 1,
    "explanation": "10 PB / 4 KB is about 2.4 trillion blocks, and at 8 bytes each that is about 20 TB, or 8/4096, about 0.2%. 10 TB is the figure for 4-byte CRC32C, which is why it looks right at first glance.",
    "tags": [
      "end-to-end-checksums",
      "apply",
      "inline"
    ]
  },
  {
    "id": "end-to-end-checksums-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Checksum placement",
    "section": "Where silent corruption comes from",
    "prompt": "A storage node without ECC RAM receives an upload, and a bit flips in its buffer before the node computes the checksum it stores with the block. No client checksum was sent. What happens?",
    "options": [
      "The background scrubber detects the flip on its next pass and rebuilds the block",
      "TCP's checksum catches it, because the bytes are checked again on the way to disk",
      "Erasure coding repairs it automatically, because the parity was computed from the correct bytes",
      "The stored checksum matches the corrupted bytes, so every later check passes; only an earlier checksum could catch it"
    ],
    "answer": 3,
    "explanation": "A checksum computed after corruption faithfully protects the wrong data, so scrubbing and read checks all pass. That is why the lesson says to compute the checksum as close to the origin as possible; the scrubber cannot tell anything is wrong.",
    "tags": [
      "end-to-end-checksums",
      "staff",
      "inline"
    ]
  },
  {
    "id": "end-to-end-checksums-n1",
    "topic": "end-to-end-checksums",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Uncorrectable Bit Error Rate (UBER) Across a 100 PB Fleet",
    "scenario": "Enterprise SSDs specify an Uncorrectable Bit Error Rate (UBER) of 1 error per `10^16` bits read (`1.25 PB`). Your storage fleet scans `25 PB` of data per day during queries and background compaction.",
    "prompt": "How many silent/uncorrectable bit errors per day should you expect across a `25 PB/day` read workload (`25 / 1.25`)?",
    "question": "How many silent/uncorrectable bit errors per day should you expect across a `25 PB/day` read workload (`25 / 1.25`)?",
    "unit": "errors/day",
    "answer": 20,
    "tolerance": 0.2,
    "hint": "Divide 25 PB read per day by 1.25 PB per error.",
    "explanation": "At 1 error per 1.25 PB (`10^16` bits), reading 25 PB/day encounters an average of `25 / 1.25 = 20` silent bit-rot events every single day—proving why hardware ECC alone is never enough at scale.",
    "tags": [
      "end-to-end-checksums",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "end-to-end-checksums-t1",
    "topic": "end-to-end-checksums",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Co-Located Checksums vs Parent-Pointer Separated Checksums (ZFS / Merkle Tree Pattern)",
    "scenario": "A storage engine stores each 4 KB data block's CRC32C checksum inside the header of that exact same 4 KB disk block. During a firmware bug (\"lost write\" or \"misdirected write\"), the disk controller fails to write the new 4 KB block cleanly, leaving the old valid block (with its own matching old checksum) at that physical sector.",
    "prompt": "Why does a self-contained block checksum fail to detect lost/misdirected writes, and how do ZFS and modern storage engines solve this?",
    "question": "Why does a self-contained block checksum fail to detect lost/misdirected writes, and how do ZFS and modern storage engines solve this?",
    "options": [
      "Switch from CRC32C to MD5 inside the same 4 KB block header",
      "Never verify checksums on read",
      "Store each block's checksum (and logical block ID / generation) in its parent pointer (e.g., SSTable index block, manifest, or ZFS indirect block) so a stale or misdirected physical block fails verification against the parent's expected hash"
    ],
    "correctOption": 2,
    "reasons": [
      "An old block's MD5 still matches the old block's data on a lost write",
      "Skipping verification prevents corruption errors",
      "A block is always self-consistent with its own header if an entire write is dropped; storing the expected checksum in the parent pointer forms a Merkle tree that catches lost, torn, and misdirected writes"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "If a disk silently drops a write to Sector 500, does the old data at Sector 500 still match the old checksum stored at Sector 500?",
    "explanation": "A checksum stored inside the block itself only catches random bit flips; it cannot detect when the drive returns an older version of the block or a block from the wrong sector. Storing checksums in the parent pointer plus periodic background scrubbing guarantees end-to-end integrity.",
    "tags": [
      "end-to-end-checksums",
      "tradeoff",
      "staff"
    ]
  }
];
