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
  }
];
