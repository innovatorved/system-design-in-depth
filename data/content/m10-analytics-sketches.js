window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-analytics-sketches"] = {
  "counting-at-scale": {
    "title": "Counting at scale",
    "video": {
      "youtubeId": "eV1haPUt0NU",
      "title": "Hyperloglog: Facebook's algorithm to count distinct elements",
      "channel": "Gaurav Sen"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Challenge of Counting at Scale</h2>\n      <p>Counting seems simple: <code>UPDATE table SET count = count + 1 WHERE id = 123</code>. However, in a distributed system with millions of events per second, this synchronous, locked approach creates severe bottlenecks. Database row locks lead to contention, timeouts, and system failure.</p>\n      \n      <h3>Batching and Asynchronous Processing</h3>\n      <p>To scale counting, we must decouple the event generation from the database update. Instead of updating the database immediately, events (like clicks, views, or impressions) are pushed to a high-throughput message queue like Apache Kafka.</p>\n      <p>Consumer services read from this queue, buffer the events in memory for a short window (e.g., 5 seconds), aggregate them (e.g., \"Video A got 500 views\"), and then execute a single batch update to the database. This reduces database write load by orders of magnitude.</p>\n      \n      <h3>Idempotency and Exactly-Once Processing</h3>\n      <p>Distributed queues commonly provide at-least-once delivery, so a worker can crash after incrementing the aggregate but before committing its input position. A retry then increments twice. Make the aggregate update and a durable event/partition receipt atomic, or publish immutable per-partition deltas and replace a partition's prior contribution during reconciliation. A separate cache check followed by an increment has its own crash race unless both actions share one atomic boundary.</p>\n      <p><strong>Concrete tradeoff:</strong> sharding one viral post's counter across 64 keys reduces write contention, but reads must sum 64 values and repairs must know which shards are complete. Keep the accepted events or durable deltas long enough to rebuild a disputed total.</p>\n    </div>",
    "keyTakeaways": [
      "Synchronous database increments cause lock contention at scale.",
      "Decouple writes using message queues (Kafka) and background aggregation.",
      "Handling duplicate events is critical for accurate counting."
    ],
    "furtherReading": [
      {
        "title": "Scaling counting at YouTube",
        "url": "https://bytebytego.com/"
      }
    ]
  },
  "view-counting-at-scale": {
    "title": "View counting at scale",
    "video": {
      "youtubeId": "eV1haPUt0NU",
      "title": "Hyperloglog: Facebook's algorithm to count distinct elements",
      "channel": "Gaurav Sen"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Designing a View Counter (Like YouTube)</h2>\n      <p>YouTube's view counter is one of the most famous examples of scaled counting. It must handle billions of views while preventing fraud and abuse.</p>\n      \n      <h3>The Architecture</h3>\n      <p>When a user watches a video, the client sends a \"heartbeat\" or log event to an API gateway. This event is immediately pushed to a Kafka stream. The architecture splits into two paths:</p>\n      <ol>\n        <li><strong>Real-time Path (Approximate):</strong> Stream processors (like Flink) consume the stream, aggregate counts in memory, and update a fast NoSQL database (like Redis or Cassandra) to provide immediate feedback to creators.</li>\n        <li><strong>Batch Path (Accurate & Audited):</strong> The raw logs are dumped into a data lake (HDFS/S3). MapReduce or Spark jobs run periodically to analyze the logs, remove bot traffic, deduplicate views based on strict business logic, and update the authoritative \"true\" view count in the main database.</li>\n      </ol>\n      \n      <h3>Why do views sometimes freeze?</h3>\n      <p>Famously, YouTube views used to freeze at \"301 views\". This was because the system relied on the fast, unchecked real-time counter until it hit a threshold (300). Once crossed, the system paused public updates until the slower, rigorous batch-processing system verified the traffic wasn't from bots.</p>\n    </div>",
    "keyTakeaways": [
      "Use Lambda Architecture: separate paths for fast/approximate and slow/accurate counting.",
      "Fraud detection must happen offline on raw logs.",
      "Event heartbeats are better than single 'play' events for verifying true engagement."
    ],
    "furtherReading": [
      {
        "title": "Lambda Architecture",
        "url": "https://en.wikipedia.org/wiki/Lambda_architecture"
      }
    ]
  },
  "impression-counting-system-design": {
    "title": "Impression counting",
    "video": {
      "youtubeId": "f69hh3KgFEk",
      "title": "Counting BILLIONS with Just Kilobytes? Meet HyperLogLog! 💡",
      "channel": "ByteMonk"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Scaling Ad Impressions</h2>\n      <p>Impression counting is critical for advertising platforms. Advertisers pay per 1,000 impressions (CPM), so accuracy translates directly to revenue. Unlike standard view counting, losing an ad impression means losing money.</p>\n      \n      <h3>The Data Pipeline</h3>\n      <p>When an ad renders, a pixel fires a request. The ingest servers must acknowledge this immediately. They write the event to a highly durable write-ahead log (like Kafka) before returning 200 OK. From there, Stream Processing engines (Spark Streaming, Flink) group events by Ad ID, Campaign ID, and time window.</p>\n      \n      <h3>Handling Late Data</h3>\n      <p>In mobile environments, users go offline. An impression might happen at 2:00 PM, but the device only connects and sends the event at 4:00 PM. The system must support Event Time processing. It maintains \"watermarks\" to decide when a time window can be closed, but allows late-arriving data to update historical tables.</p>\n      \n      <h3>Database Choice</h3>\n      <p>Time-Series Databases (TSDBs) like Druid, Pinot, or ClickHouse are the industry standard for this. They ingest massive streams of data, organize it by time, and support sub-second analytical queries (e.g., \"Show impressions for Campaign X broken down by hour\").</p>\n    </div>",
    "keyTakeaways": [
      "Impression counting directly impacts revenue, requiring high durability.",
      "Systems must handle late-arriving events using Event Time logic.",
      "OLAP/Time-Series databases (Druid, ClickHouse) are ideal for querying ad metrics."
    ],
    "furtherReading": [
      {
        "title": "Apache Druid Architecture",
        "url": "https://druid.apache.org/docs/latest/design/"
      }
    ]
  },
  "hyperloglog-cardinality-estimation": {
    "title": "HyperLogLog cardinality estimation",
    "video": {
      "youtubeId": "eV1haPUt0NU",
      "title": "Hyperloglog: Facebook's algorithm to count distinct elements",
      "channel": "Gaurav Sen"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>HyperLogLog for Unique Counting</h2>\n      <p>Counting the exact number of <em>unique</em> visitors (cardinality) over a month requires storing every single user ID in a Set. At Facebook or Google scale, this demands Terabytes of memory just to track unique counts.</p>\n      \n      <h3>The Magic of HyperLogLog (HLL)</h3>\n      <p>HyperLogLog is a probabilistic data structure that estimates cardinality with extreme memory efficiency. Instead of storing IDs, it hashes the ID and looks at the binary representation of the hash. It tracks the maximum number of leading zeros seen in any hash. If you see a hash with 10 leading zeros, probability dictates you must have processed roughly 2^10 unique items.</p>\n      \n      <h3>Memory vs Accuracy Trade-off</h3>\n      <p>Standard HLL uses one well-distributed hash per identity. The first <code>p</code> bits select one of <code>m = 2^p</code> registers; the remaining bits supply a rank based on the first set bit. Each register retains its maximum observed rank, and the estimator combines all registers with bias corrections. More registers use more memory and reduce standard error. Redis's implementation uses about 12 KB in its dense representation and targets roughly 0.81% standard error, but serialized format and sparse behavior are implementation-specific.</p>\n      <p>If you don't need exact accounting (e.g., displaying \"1.2M Unique Views\" on a dashboard), HLL is the perfect tool, replacing Terabytes of RAM with Kilobytes.</p>\n      \n      <pre><code>PFADD unique_visitors_today \"user_123\"\nPFCOUNT unique_visitors_today // Returns estimated count</code></pre>\n    </div>",
    "keyTakeaways": [
      "Exact cardinality counting requires linear memory (O(N)).",
      "HyperLogLog uses a fixed register array whose size is selected from the required error; Redis's dense representation is about 12 KB.",
      "Use HLL when a small error rate (~1%) is acceptable for unique counting."
    ],
    "furtherReading": [
      {
        "title": "Redis HyperLogLog",
        "url": "https://redis.io/docs/data-types/probabilistic/hyperloglogs/"
      }
    ]
  },
  "mergeable-sketches-for-analytics": {
    "title": "Mergeable sketches for analytics",
    "video": {
      "youtubeId": "f69hh3KgFEk",
      "title": "Counting BILLIONS with Just Kilobytes? Meet HyperLogLog! 💡",
      "channel": "ByteMonk"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Mergeable Sketches in Distributed Systems</h2>\n      <p>The true power of probabilistic data structures (sketches like HyperLogLog or Count-Min Sketch) is that they are <strong>mergeable</strong>. This property is critical for distributed analytics.</p>\n      \n      <h3>The Distributed Aggregation Problem</h3>\n      <p>Suppose you have 10 servers ingesting web traffic. Server A calculates 10,000 unique IPs. Server B calculates 15,000 unique IPs. The total unique IPs across your site is NOT 25,000, because users might have visited both servers. To find the exact total, you must ship all raw IPs to a central server and run a <code>UNION</code>, which is slow and network-heavy.</p>\n      \n      <h3>Merging Sketches</h3>\n      <p>Instead of shipping raw data, each server creates a HyperLogLog sketch (12KB). They send these tiny 12KB sketches to a central coordinator. The mathematical properties of HLL allow the coordinator to merge the sketches together without any raw data. The merged sketch accurately represents the unique count across all servers.</p>\n      \n      <h3>Time Window Rollups</h3>\n      <p>This mergeability also applies to time. You can compute an HLL sketch for every hour. To find the daily unique count, you don't rescan the raw data; you simply merge the 24 hourly sketches. This is how databases like Apache Druid achieve lightning-fast dashboard queries over massive datasets.</p>\n    </div>",
    "keyTakeaways": [
      "Sketches allow you to compress data locally before aggregating globally.",
      "HLL union avoids double-counting the same hashed identity, but additive sketches and repeated partition contributions still need receipt or deduplication protocols.",
      "Time-based rollups of sketches dramatically speed up analytical queries."
    ],
    "furtherReading": [
      {
        "title": "Apache DataSketches",
        "url": "https://datasketches.apache.org/"
      }
    ]
  },
  "bucketed-time-window-aggregation": {
    "title": "Bucketed time-window aggregation",
    "video": {
      "youtubeId": "pcTFiU7wKkQ",
      "title": "What is MapReduce in Hadoop",
      "channel": "Gate Smashers"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Time-Window Aggregation</h2>\n      <p>In streaming analytics, we rarely care about all data since the beginning of time. We want metrics over specific intervals: \"views per minute,\" \"errors per hour.\"</p>\n      \n      <h3>Tumbling vs Sliding Windows</h3>\n      <ul>\n        <li><strong>Tumbling Windows:</strong> Fixed, non-overlapping intervals (e.g., 1:00-1:05, 1:05-1:10). An event belongs to exactly one window.</li>\n        <li><strong>Sliding Windows:</strong> Overlapping intervals (e.g., last 5 minutes, updated every 1 minute). An event can belong to multiple windows.</li>\n      </ul>\n      \n      <h3>Implementation with Redis</h3>\n      <p>A common pattern for a 1-minute tumbling window is to use a timestamp rounded down to the minute as the cache key: <code>INCR api_errors:2026-09-19T17:10</code>. This is highly efficient and requires no complex stream processing. You set an expiry (TTL) on the key to automatically clean up old data.</p>\n      \n      <h3>Stream Processors</h3>\n      <p>For event-time windows, crossing the wall-clock boundary does not prove all events have arrived. Suppose a 10:00–10:05 bucket first publishes 90 views, then a mobile event with occurrence time 10:04 arrives at 10:08. A watermark and allowed-lateness policy decide whether to update the bucket to 91, emit a retraction/correction, or route the event to a late-data path. Retaining state longer improves completeness but consumes more memory and delays finality; discarding it early makes published results cheaper but permanently excludes accepted late events.</p>\n    </div>",
    "keyTakeaways": [
      "Tumbling windows do not overlap; sliding windows overlap.",
      "Rounded timestamps make excellent cache keys for simple bucketed counting.",
      "Stream processors are needed for complex windowing and handling late events."
    ],
    "furtherReading": [
      {
        "title": "Windowing in Apache Flink",
        "url": "https://nightlies.apache.org/flink/flink-docs-release-1.14/docs/dev/datastream/operators/windows/"
      }
    ]
  },
  "raw-events-vs-derived-analytics": {
    "title": "Raw events vs derived analytics",
    "video": {
      "youtubeId": "G-XKmlF08fY",
      "title": "What is a columnar database and how does it work?",
      "channel": "All Things Open"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Raw Events vs Derived Analytics</h2>\n      <p>A fundamental debate in analytics architecture is whether to store raw events forever, or to pre-aggregate (derive) the data and throw the raw events away to save storage.</p>\n      \n      <h3>The Value of Raw Events</h3>\n      <p>Raw event data (e.g., every single click, JSON payload, and timestamp stored in S3) is the ground truth. The primary advantage is flexibility. If a product manager asks a totally new question (\"How many users clicked X, then Y, but only on iOS 14?\"), you can write a Spark job to query the raw data and get the answer. If you only saved pre-aggregated daily counts, you cannot answer this question retroactively.</p>\n      \n      <h3>The Necessity of Derived Analytics</h3>\n      <p>However, running complex queries over petabytes of raw data is extremely slow and expensive. Dashboards cannot wait 10 minutes for a Hadoop job to finish. Therefore, systems build ETL pipelines to continuously pre-aggregate data (derived analytics) into OLAP databases (like ClickHouse) so dashboards load instantly.</p>\n      \n      <h3>The Best of Both Worlds</h3>\n      <p>Modern architectures often retain bounded raw history in object storage and serve versioned derived tables from an OLAP store. For example, if fraud rule v2 excludes two impressions that rule v1 counted, rebuild into a new aggregate version, validate it, then atomically switch the report; mutating rows in place can leave mixed definitions. Raw retention enables replay but increases privacy, deletion, schema-evolution, and storage obligations. Record event schema, transformation version, source range, and correction lineage, and define what happens when source history has expired.</p>\n    </div>",
    "keyTakeaways": [
      "Raw events provide ground-truth flexibility for retroactive, ad-hoc queries.",
      "Derived analytics (pre-aggregations) are required for fast dashboard rendering.",
      "Store raw data in cheap storage (S3/Parquet) and derived data in fast databases."
    ],
    "furtherReading": [
      {
        "title": "Data Lake vs Data Warehouse",
        "url": "https://aws.amazon.com/big-data/datalakes-and-analytics/what-is-a-data-lake/"
      }
    ]
  },
  "count-min-sketch": {
    "title": "Count-min sketch",
    "video": {
      "youtubeId": "kx-XDoPjoHw",
      "title": "System Design Interview - Top K Problem (Heavy Hitters)",
      "channel": "System Design Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Estimating Frequencies with Count-Min Sketch</h2>\n      <p>If you need to know how many times a specific user has visited a site (frequency), keeping a hash map of UserID -> Count works until you hit millions of users, at which point memory becomes a bottleneck.</p>\n      \n      <h3>How Count-Min Sketch Works</h3>\n      <p>The Count-Min Sketch is a probabilistic data structure used to estimate the frequency of events. It is essentially a 2D matrix of counters and a set of independent hash functions.</p>\n      <p>When an item arrives, you hash it using each hash function. The results correspond to column indices. You increment the counter in each corresponding row. To query the frequency of an item, you hash it again, look at the values in the corresponding cells, and take the <strong>minimum</strong> value.</p>\n      \n      <h3>Overcounting, Never Undercounting</h3>\n      <p>Because multiple items might hash to the same cell, a cell can include mass from other items. Taking the minimum mitigates that error. With non-negative updates, no counter overflow, and consistent hashes, the standard estimate does not fall below the true processed frequency; signed updates, overflow, decay, or incompatible merges require different guarantees. Width controls additive error, while depth controls failure probability.</p>\n      <p>It is heavily used in NLP (counting word frequencies), networking (tracking heavy traffic flows), and recommendation engines where perfect frequency accuracy isn't required but memory is strictly constrained.</p>\n    </div>",
    "keyTakeaways": [
      "Count-Min Sketch estimates frequency using a tiny, fixed memory footprint.",
      "With non-negative updates, sufficient counter width, and compatible hashes, collision error is one-sided; other update models need separate guarantees.",
      "Uses a 2D array of counters and takes the minimum value upon query to reduce error."
    ],
    "furtherReading": [
      {
        "title": "Count-Min Sketch Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch"
      }
    ]
  },
  "top-k-heavy-hitters": {
    "title": "Top-k heavy hitters",
    "video": {
      "youtubeId": "kx-XDoPjoHw",
      "title": "System Design Interview - Top K Problem (Heavy Hitters)",
      "channel": "System Design Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Finding the Heavy Hitters (Top-K)</h2>\n      <p>Finding the most frequent items in a massive data stream (e.g., \"Trending Hashtags\", \"Top 10 IP addresses DDOSing us\", \"Most viewed videos today\") is a classic system design problem known as the Top-K or Heavy Hitters problem.</p>\n      \n      <h3>The Exact Approach</h3>\n      <p>The exact way is to maintain a HashMap of frequencies, and a Min-Heap (Priority Queue) of size K. For every event, update the hash map, then update the heap. If the stream is infinite and the cardinality is high, the HashMap will exhaust memory.</p>\n      \n      <h3>The Probabilistic Approach (Count-Min Sketch + Heap)</h3>\n      <p>A Count-Min Sketch can estimate a supplied key's frequency, but it does not remember every key and therefore cannot discover candidates by itself. Pair it with a bounded candidate algorithm such as Space-Saving, or maintain an explicitly evaluated candidate set. A heap entry also needs updates when its estimate changes; simply inserting every estimate above the current minimum can retain stale entries and duplicates.</p>\n      \n      <h3>Distributed Top-K</h3>\n      <p>Merging only each worker's local K is approximate and can miss the global winner: one key can rank just below K on every shard yet have the largest combined count. Use a mergeable heavy-hitters sketch with a stated error bound, send an oversampled candidate set and obtain global estimates for its union, or compute exact counts when correctness requires it. Partitioning by key makes exact merging easier but can create a hot owner.</p>\n    </div>",
    "keyTakeaways": [
      "The exact Top-K approach requires too much memory for high-cardinality streams.",
      "Frequency estimation and candidate discovery are separate jobs; combine compatible sketches with a bounded candidate algorithm.",
      "Merging only local K can miss a global heavy hitter; oversample candidates or use a mergeable algorithm with explicit guarantees."
    ],
    "furtherReading": [
      {
        "title": "Heavy Hitters Problem",
        "url": "https://en.wikipedia.org/wiki/Streaming_algorithm#Heavy_hitters"
      }
    ]
  },
  "reservoir-sampling": {
    "title": "Reservoir sampling",
    "video": {
      "youtubeId": "f69hh3KgFEk",
      "title": "Counting BILLIONS with Just Kilobytes? Meet HyperLogLog! 💡",
      "channel": "ByteMonk"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Random Sampling Over Infinite Streams</h2>\n      <p>Suppose you have a continuing stream of log events and want to retain 1,000 items as a uniform sample of the finite prefix observed so far. There is no uniform sample over a completed infinite population; the guarantee is evaluated at each current count N.</p>\n      \n      <h3>The Reservoir Sampling Algorithm</h3>\n      <p>Reservoir Sampling is an elegant algorithmic solution to this problem.</p>\n      <ol>\n        <li>Create a \"reservoir\" array of size K (e.g., 1000).</li>\n        <li>Fill the array with the first K elements of the stream.</li>\n        <li>For every subsequent element at index <code>i</code> (where <code>i > K</code>), generate a random number <code>j</code> between 1 and <code>i</code>.</li>\n        <li>If <code>j <= K</code>, replace the element at index <code>j</code> in the reservoir with the new element. Otherwise, discard the new element.</li>\n      </ol>\n      \n      <h3>Why it works</h3>\n      <p>Through inductive mathematical proof, this algorithm guarantees that at any point in time, every element seen so far has an equal probability (K/N) of being in the reservoir. It requires only O(K) memory and O(N) time (a single pass through the stream).</p>\n      <p>A retained reservoir differs from independent head sampling that immediately keeps roughly 1% of traces: later arrivals can replace earlier reservoir members. Combining worker reservoirs also requires each worker's original population size; choosing equally from equal-sized local samples biases small partitions. Use a weighted merge algorithm or sample from a globally keyed priority, and record the randomization/version needed for reproducibility.</p>\n    </div>",
    "keyTakeaways": [
      "Reservoir sampling maintains a uniform random sample of the finite stream prefix observed so far.",
      "It requires only O(K) memory, completely independent of the stream size.",
      "Distributed reservoirs require population-aware merging and are not interchangeable with immediate per-trace sampling."
    ],
    "furtherReading": [
      {
        "title": "Reservoir Sampling Proof",
        "url": "https://en.wikipedia.org/wiki/Reservoir_sampling"
      }
    ]
  },
  "tdigest-quantile-sketch": {
    "title": "t-digest quantile sketch",
    "video": {
      "youtubeId": "G-XKmlF08fY",
      "title": "What is a columnar database and how does it work?",
      "channel": "All Things Open"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Accurate Percentiles with t-digest</h2>\n      <p>When measuring system latency, averages are misleading. We care about percentiles (p95, p99) to understand the tail latency experienced by users. Calculating exact percentiles requires sorting all data points, which requires O(N) memory and O(N log N) time—impossible for high-throughput metric streams.</p>\n      \n      <h3>The t-digest Algorithm</h3>\n      <p>t-digest is a data structure designed specifically to estimate quantiles (percentiles) from massive datasets with high accuracy, especially near the tails (p1, p99, p99.9). It works by clustering data points into \"centroids\" (a mean and a weight).</p>\n      <p>The brilliance of t-digest is that it restricts the size of the centroids near the extremes (the tails) to be very small, meaning it retains high accuracy where it matters most for SLAs, while allowing centroids in the middle (the median) to be larger, saving memory.</p>\n      \n      <h3>Mergeable and Distributed</h3>\n      <p>Like HyperLogLog, t-digests are mergeable. You can compute a t-digest of latency on Server A, and another on Server B, send compatible summaries to an aggregator and merge them to estimate the global p99. Do not average host p99 values; validate the deployed sketch, merge tree, duplicates, and representative distributions against exact references.</p>\n    </div>",
    "keyTakeaways": [
      "Calculating exact percentiles over massive data is computationally unfeasible.",
      "t-digest estimates percentiles with low memory, preserving high accuracy at the tails (p99).",
      "Compatible t-digests are mergeable, but merge order, duplicate contributions, and implementation behavior require validation."
    ],
    "furtherReading": [
      {
        "title": "The t-digest paper",
        "url": "https://arxiv.org/abs/1902.04023"
      }
    ]
  },
  "streaming-percentile-analytics": {
    "title": "Streaming percentile analytics",
    "video": {
      "youtubeId": "oUJbuFMyBDk",
      "title": "What is a MESSAGE QUEUE and Where is it used?",
      "channel": "Gaurav Sen"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Architecting Streaming Percentiles</h2>\n      <p>To provide real-time SLA dashboards, a system must process millions of latency metrics and output p90, p95, and p99 metrics instantaneously. This requires combining stream processing with sketch data structures.</p>\n      \n      <h3>The Pipeline</h3>\n      <p>Applications emit raw latency events to a message broker (Kafka). A stream processing framework (Apache Flink) reads these events in time windows (e.g., 10-second tumbling windows). Inside the Flink operators, a t-digest or HDRHistogram sketch is updated in memory. At the end of the 10 seconds, the sketch is emitted to a Time-Series Database (TSDB).</p>\n      \n      <h3>Query Time Rollups</h3>\n      <p>When a user opens an SLA dashboard and requests the p99 latency for the last 24 hours, the TSDB retrieves the thousands of stored 10-second sketches and merges them together on the fly. Merging thousands of sketches at every query can still be expensive, so retain hierarchical rollups with compatible parameters and contribution IDs. Validate approximation error against exact samples, and define whether late windows replace or add to a prior contribution.</p>\n    </div>",
    "keyTakeaways": [
      "Real-time percentiles rely on in-memory sketches (t-digest, HDRHistogram).",
      "Stream processors build sketches over small time windows and persist them.",
      "Dashboards merge historical sketches on the fly for fast, accurate aggregations."
    ],
    "furtherReading": [
      {
        "title": "High Dynamic Range Histogram",
        "url": "http://hdrhistogram.org/"
      }
    ]
  },
  "live-reactions-high-throughput-design": {
    "title": "Design: live reactions at high throughput",
    "video": {
      "youtubeId": "jo6U429l3JM",
      "title": "1 TRILLION messages #javascript #python #web #coding #programming",
      "channel": "ByteByteGo"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>System Design: Live Stream Reactions</h2>\n      <p>During live events (Apple keynotes, Twitch streams), users can send reactions (hearts, claps) that float across everyone's screen. The challenge is ingesting tens of thousands of clicks per second and broadcasting them with sub-second latency.</p>\n      \n      <h3>Ingestion and Local Buffering</h3>\n      <p>If millions of users click \"heart\", we cannot send every click to the database. The client app throttles clicks, sending a batch (e.g., \"5 hearts\") every second. The API gateway receives these and routes them to an ingestion service. The ingestion service buffers these counts in memory for 1-2 seconds, aggregating the total counts per reaction type.</p>\n      \n      <h3>Pub/Sub Broadcast</h3>\n      <p>The aggregated counts (e.g., \"Stream123: +500 hearts, +200 claps\") are published to a Redis Pub/Sub topic. The WebSocket servers handling the viewer connections subscribe to this topic. When they receive the aggregated update, they push it down to the clients. The client-side JavaScript then renders the floating animations based on these aggregated numbers, creating the illusion of continuous individual clicks.</p>\n      \n      <h3>Decoupled Analytics</h3>\n      <p>Do not make volatile buffers the only accepted record if permanent counts matter. Persist an event or idempotent delta before acknowledging it, then derive coarse broadcast updates separately. If Redis Pub/Sub drops an update or a WebSocket server restarts, clients should refetch a versioned snapshot and resume from a sequence boundary. Batching lowers fanout bandwidth, but it sacrifices one-to-one animation fidelity and adds up to one batch interval of delay; bound per-client queues and drop visual updates rather than exhausting memory for a slow viewer.</p>\n    </div>",
    "keyTakeaways": [
      "Client-side throttling and batching is the first line of defense against high throughput.",
      "Server-side memory buffering aggregates raw events into periodic updates.",
      "Visualizing high-volume data relies on client-side rendering interpolation, not 1-to-1 event mapping."
    ],
    "furtherReading": [
      {
        "title": "Scaling WebSocket Broadcasts",
        "url": "https://bytebytego.com/"
      }
    ]
  }
};
