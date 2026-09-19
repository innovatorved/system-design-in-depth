window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["design-operations"] = {
  "ride-matching-system-design": {
    "title": "Design: ride matching",
    "video": {
      "youtubeId": "DGtalg5efCw",
      "title": "Uber - System Design Interview Question (Ride Sharing Service)",
      "channel": "TechPrep"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Understanding the Ride Matching Problem</h2>\n      <p>A ride-matching service (like Uber or Lyft) is one of the most popular real-time geospatial system design case studies. At its core, the system takes a pickup request, finds eligible drivers nearby, and turns a driver's acceptance into a matched assignment. The map and real-time geospatial data help choose whom to ask.</p>\n      \n      <p>The complexity comes from the scale and the real-time nature of the requirements. The system must track millions of active drivers moving constantly, update their locations every few seconds, and query for nearest neighbors within milliseconds to fulfill rider requests.</p>\n      \n      <h3>Geospatial Indexing</h3>\n      <p>To match riders with drivers, we cannot simply iterate through a database of all active drivers and calculate the distance to the rider using the Haversine formula. That approach would require <code>O(N)</code> operations per request, which is prohibitively expensive when <code>N</code> is millions of drivers.</p>\n      \n      <p>Instead, we use a geospatial index. Common approaches include:</p>\n      <ul>\n        <li><strong>Geohash:</strong> Divides the world into a grid and represents each grid cell as a short string. Searching for nearby drivers becomes a prefix match search. Redis has built-in support for Geohashing and radius queries.</li>\n        <li><strong>Quadtrees:</strong> A tree data structure where each node represents a bounding box and has four children representing the four quadrants of the box. Quadtrees allow for efficient spatial partitioning and searching, particularly when driver density varies drastically between urban and rural areas.</li>\n        <li><strong>Google S2 or Uber H3:</strong> S2 uses hierarchical quadrilateral cells; H3 uses mostly hexagonal cells plus required pentagons. Both discretize the sphere for candidate lookup, but cell areas and center distances vary with location and resolution, so final radius eligibility still needs an exact distance calculation.</li>\n      </ul>\n      \n      <h3>The Architecture</h3>\n      <p>A standard architecture involves a few key services:</p>\n      \n      <div class=\"mermaid\">\nflowchart TD\n  Rider[\"Rider App\"] <--> API[\"API Gateway\"]\n  Driver[\"Driver App\"] <--> API\n  API --> Location[\"Location Service\"]\n  API --> Matching[\"Matching Service\"]\n  Location --> Redis[(\"Redis Geo Index\")]\n  Matching --> Location\n      </div>\n      \n      <p>The <strong>Location Service</strong> receives ping updates from drivers every 4 seconds via WebSockets or long polling. It updates the driver's current position in a distributed Redis cluster using geospatial indexes. To handle the high write volume, we can shard the Redis cluster based on regions or cities, since ride requests are fundamentally local (a rider in New York won't need a driver in Tokyo).</p>\n      \n      <h3>The Matching Algorithm</h3>\n      <p>When a rider requests a car, the Matching Service kicks in:</p>\n      <ol>\n        <li>It queries the Location Service to get a list of active, available drivers within a certain radius (e.g., 2 miles).</li>\n        <li>It filters out drivers who are already on a trip or have opted out of that specific ride type (e.g., UberX vs. UberXL).</li>\n        <li>It ranks the drivers based on factors like distance, ETA, and driver ratings. ETA is usually calculated by a dedicated Routing Service that uses real-time traffic data, rather than just simple \"as the crow flies\" distance.</li>\n        <li>It sends a dispatch request to the top-ranked driver. If the driver accepts, the match is made. If they decline or let the request timeout, the system moves to the next driver on the list.</li>\n      </ol>\n      \n      <h3>Real-time Communication</h3>\n      <p>HTTP request-response is not suitable for this real-time interaction. Instead, WebSockets or Server-Sent Events (SSE) are used. The Driver app maintains a persistent connection with a Dispatch/Gateway service. This allows the server to push ride requests instantly without the app needing to constantly poll.</p>\n      \n      <h3>Handling Concurrency and Race Conditions</h3>\n      <p>What happens if two riders request a ride simultaneously, and the system tries to match both of them with the same nearby driver? This is a classic distributed systems race condition.</p>\n      \n      <p>We must use distributed locks or atomic database operations to ensure that a driver can only accept one ride at a time. For instance, when a driver accepts a ride, the system can perform a conditional update (Optimistic Concurrency Control) on the driver's status in the database: <code>UPDATE driver SET status = 'busy', ride_id = 123 WHERE driver_id = 456 AND status = 'available'</code>. If this update fails (returns 0 rows affected), it means the driver accepted another ride a millisecond earlier, and the current rider's request must be routed to the next best driver.</p>\n    </div>",
    "keyTakeaways": [
      "Use geospatial indexes (Geohash, Quadtree, H3) to avoid O(N) distance calculations.",
      "Driver location updates generate massive write throughput; use distributed, in-memory stores like Redis.",
      "Ridesharing is highly localized; shard data and services by geographic region.",
      "Use WebSockets for low-latency, two-way communication between the server and the apps.",
      "Employ optimistic concurrency control to prevent multiple riders from claiming the same driver."
    ],
    "furtherReading": [
      {
        "title": "Uber H3 Hexagonal Grid",
        "url": "https://www.uber.com/en-CA/blog/h3/"
      },
      {
        "title": "Redis Geospatial Commands",
        "url": "https://redis.io/docs/data-types/geospatial/"
      }
    ]
  },
  "video-platform-system-design": {
    "title": "Design: a video platform",
    "video": {
      "youtubeId": "IUrQ5_g3XKs",
      "title": "System Design Interview: Design YouTube w/ a Ex-Meta Staff Engineer",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Designing a Video Streaming Platform</h2>\n      <p>A video platform like YouTube or Netflix turns an uploaded file into media that viewers can play on different devices and varying network connections. Uploading is only the first step: the service must prepare suitable versions, make them discoverable, and keep delivering the next segment while playback continues.</p>\n      \n      <p>The scale is staggering. YouTube processes hundreds of hours of video uploads every minute and serves billions of views daily. Netflix accounts for a massive percentage of the internet's downstream traffic.</p>\n      \n      <h3>The Upload Pipeline</h3>\n      <p>When a creator uploads a video, we don't just store the raw file and serve it. The upload goes to an object storage service like Amazon S3.</p>\n      <p>Because video files are large, we use <strong>Multipart Uploads</strong>. The client breaks the file into smaller chunks and uploads them in parallel. If a chunk fails, only that chunk is retried, rather than restarting a 5GB upload from scratch. To do this securely directly to object storage, the backend generates <strong>Pre-signed URLs</strong> for each chunk.</p>\n      \n      <h3>Transcoding and Adaptive Bitrate Streaming</h3>\n      <p>Raw video is huge and not universally playable. The platform must transcode the video into various formats (MP4, WebM) and resolutions (1080p, 720p, 480p) to support everything from high-end 4K TVs to 10-year-old smartphones on 3G connections.</p>\n      \n      <div class=\"mermaid\">\nflowchart LR\n  Raw[\"Raw Video in S3\"] --> Queue[\"Message Queue\"]\n  Queue --> Worker1[\"Transcode 1080p\"]\n  Queue --> Worker2[\"Transcode 720p\"]\n  Queue --> Worker3[\"Transcode 480p\"]\n  Worker1 --> CDN[(\"CDN\")]\n  Worker2 --> CDN\n  Worker3 --> CDN\n      </div>\n      \n      <p>Modern streaming uses protocols like <strong>HLS (HTTP Live Streaming)</strong> or <strong>DASH (Dynamic Adaptive Streaming over HTTP)</strong>. These protocols break the transcoded video into tiny segments (e.g., 2-second clips). The video player on the client's device downloads a manifest file listing all segments and quality levels.</p>\n      \n      <p>The magic is <strong>Adaptive Bitrate Streaming (ABR)</strong>. If the user's network speed drops, the video player automatically requests the next 2-second segment in 480p instead of 1080p, preventing playback buffering.</p>\n      \n      <h3>Delivering Content (CDN)</h3>\n      <p>Serving video directly from centralized application servers would melt the servers and result in terrible latency for users far away. Video platforms rely heavily on <strong>Content Delivery Networks (CDNs)</strong>.</p>\n      \n      <p>When a user in Tokyo clicks play, they stream the video chunks from an edge server in Tokyo, not from the primary data center in Virginia. CDNs cache the static video segments globally. Netflix takes this a step further with Open Connect, placing custom cache appliances directly inside the data centers of Internet Service Providers (ISPs).</p>\n      \n      <h3>Metadata and Search</h3>\n      <p>While the heavy video files live on CDNs and object storage, the video metadata (title, description, tags, view count) lives in a database (like MySQL or Cassandra). A search cluster (like Elasticsearch) indexes this metadata to power the search bar.</p>\n      \n      <p>View counting is notoriously difficult at scale. Updating a database row every time someone watches a video would cause massive write contention. Instead, platforms use distributed counters or stream processing (like Kafka + Flink) to aggregate views asynchronously and write them to the database periodically.</p>\n    </div>",
    "keyTakeaways": [
      "Use multipart uploads and pre-signed URLs to reliably move large files directly to object storage.",
      "Transcode video into multiple formats and resolutions to support all devices.",
      "HLS and DASH protocols segment video and enable Adaptive Bitrate Streaming to prevent buffering.",
      "Rely on CDNs to cache and deliver heavy video segments close to the user.",
      "Handle view counting asynchronously using event streams and aggregation to avoid database lock contention."
    ],
    "furtherReading": [
      {
        "title": "Netflix Open Connect",
        "url": "https://openconnect.netflix.com/"
      },
      {
        "title": "Understanding HLS",
        "url": "https://developer.apple.com/streaming/"
      }
    ]
  },
  "file-sync-system-design": {
    "title": "Design: a file sync service",
    "video": {
      "youtubeId": "RvaMHMxHjp4",
      "title": "Object Storage in System Design Interviews w/ Ex-Meta Staff Engineer",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Designing a File Sync Service (Dropbox/Google Drive)</h2>\n      <p>A file-sync service carries changes between a remote folder and devices that may be offline. It has to move the right bytes, distinguish an edit from a retry, and preserve work when two devices change the same file.</p>\n      \n      <p>The core challenge is minimizing bandwidth and ensuring consistency across multiple devices (laptops, phones) that might go offline and come back online at random times.</p>\n      \n      <h3>Block-Level Sync (Chunking)</h3>\n      <p>If a user changes one line in a 100MB file, uploading the whole file may be inefficient. A client can hash chunks and upload only missing content. Fixed 4MB boundaries work well for aligned replacements, but an insertion near the beginning shifts later boundaries and can make most blocks appear new; content-defined chunking trades more CPU for boundary stability.</p>\n      \n      <p>This is called <strong>block-level sync</strong>. The backend object storage doesn't store files as monolithic blobs; it stores these 4MB chunks, named by their cryptographic hash (Content-Addressable Storage). The metadata database maps a file version to an ordered list of chunk hashes.</p>\n      \n      <h3>Deduplication</h3>\n      <p>Content hashes make deduplication possible, but global cross-user deduplication is a security and lifecycle choice rather than an automatic consequence. The service must authorize every reference, avoid revealing whether another account owns a guessed hash, count references safely, and delete a block only after no retained version is entitled to it. Per-tenant deduplication is a simpler isolation boundary.</p>\n      \n      <h3>The Architecture</h3>\n      <p>A typical architecture splits metadata and block storage:</p>\n      \n      <div class=\"mermaid\">\nflowchart TD\n  Client[\"Desktop Client\"]\n  BlockServers[\"Block Servers\"]\n  MetadataServers[\"Metadata Servers\"]\n  Notification[\"Notification Service\"]\n  \n  Client -->|Upload Chunks| BlockServers\n  BlockServers --> S3[(\"Object Storage\")]\n  \n  Client -->|Update File Info| MetadataServers\n  MetadataServers --> DB[(\"Metadata DB\")]\n  MetadataServers --> Notification\n  Notification -->|Ping| Client\n      </div>\n      \n      <h3>Synchronization Protocol</h3>\n      <p>Clients need to know when files change on the server. Polling the server every second drains battery and wastes server resources. Instead, clients maintain a long-lived connection (like WebSockets or Long Polling) to a Notification Service.</p>\n      \n      <p>When Laptop A uploads a change, it updates the Metadata DB. The Metadata Service publishes an event to the Notification Service, which instantly pings Laptop B: \"There is a new version of 'document.docx'\". Laptop B then requests the new metadata and downloads only the missing chunks from the Block Servers.</p>\n      \n      <h3>Handling Conflicts</h3>\n      <p>If Laptop A and Laptop B both edit the same file while offline, and then both come online, we have a conflict. The system cannot merge the files itself (it doesn't know the business logic of a Word document). The standard approach is to accept both files, creating a \"Conflicted Copy\" of the second file to arrive, and relying on the user to resolve it.</p>\n    </div>",
    "keyTakeaways": [
      "Break files into chunks to only upload/download the parts of a file that actually changed.",
      "Use Content-Addressable Storage (naming chunks by their hash) to achieve automatic deduplication.",
      "Separate the metadata path (database) from the data path (object storage).",
      "Use long-polling or WebSockets to notify clients of changes instantly, avoiding inefficient polling.",
      "Handle offline conflicts gracefully by creating conflicted copies rather than silently overwriting data."
    ],
    "furtherReading": [
      {
        "title": "Inside Dropbox's Sync Engine",
        "url": "https://dropbox.tech/infrastructure/-testing-our-new-sync-engine"
      }
    ]
  },
  "observability-slo-case-study": {
    "title": "Design: observability and SLOs",
    "video": {
      "youtubeId": "Akri1BlGp10",
      "title": "SLO vs SLI vs SLA vs Error Budget | Google SRE in Plain English",
      "channel": "Google Cloud"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Designing Observability and SLOs</h2>\n      <p>An observability system connects a user's result to the work that produced it. It should help an operator answer three questions: is the service meeting its promise, which part failed, and did the repair work?</p>\n      \n      <p>Without observability, operating a distributed system is like flying a plane blindfolded. If the checkout button stops working, you need to know immediately, and you need data to tell you whether it's the payment gateway, the inventory database, or a network partition.</p>\n      \n      <h3>The Three Pillars of Observability</h3>\n      <ul>\n        <li><strong>Metrics:</strong> Aggregated numbers measured over time (e.g., requests per second, CPU usage, error rates). They are cheap to store and great for alerting. Tools: Prometheus, Datadog.</li>\n        <li><strong>Logs:</strong> Discrete events recording what happened (e.g., \"User 123 failed authentication because password expired\"). They are expensive to store in high volume but crucial for deep debugging. Tools: ELK stack (Elasticsearch, Logstash, Kibana).</li>\n        <li><strong>Traces:</strong> The lifecycle of a single request as it travels across multiple microservices. They show where the request spent its time. Tools: Jaeger, OpenTelemetry.</li>\n      </ul>\n      \n      <h3>Service Level Objectives (SLOs)</h3>\n      <p>Metrics don't mean anything without targets. We define:</p>\n      <ul>\n        <li><strong>SLI (Service Level Indicator):</strong> A carefully defined quantitative measure. Example: The proportion of HTTP GET requests to <code>/api/cart</code> that return HTTP 200 within 200ms.</li>\n        <li><strong>SLO (Service Level Objective):</strong> A target value for the SLI. Example: 99.9% of requests over a rolling 30-day window must meet the SLI.</li>\n        <li><strong>SLA (Service Level Agreement):</strong> An explicit contract with consequences (usually financial) if the SLO is not met.</li>\n      </ul>\n      \n      <h3>Error Budgets</h3>\n      <p>If an availability SLO is 99.9% over a 30-day window, the remaining 0.1% is about 43.2 minutes of unsuccessful eligible time. Event-based SLIs budget failed events rather than literal downtime.</p>\n      \n      <p>An error-budget policy aligns product and operations on what to do when burn is excessive. Slowing risky launches is common, but freezing every release is not inherent to the metric; urgent security and reliability repairs may need to continue.</p>\n      \n      <h3>Architecture of a Monitoring System</h3>\n      <p>A typical monitoring pipeline using Prometheus looks like this:</p>\n      \n      <div class=\"mermaid\">\nflowchart LR\n  App1[\"App Instance 1\"] -->|Exposes /metrics| Prom[\"Prometheus Server\"]\n  App2[\"App Instance 2\"] -->|Exposes /metrics| Prom\n  Prom --> AlertManager[\"AlertManager\"]\n  AlertManager --> PagerDuty[\"PagerDuty / Slack\"]\n  Prom --> Grafana[\"Grafana Dashboards\"]\n      </div>\n      \n      <p>Applications instrument their code to maintain counters in memory. The Prometheus server \"scrapes\" (pulls) these metrics periodically. It evaluates recording rules and alerts. If an alert condition is met (e.g., error rate > 5% for 5 minutes), it fires a webhook to an alerting service to wake up an on-call engineer.</p>\n    </div>",
    "keyTakeaways": [
      "Combine metrics (for alerting), logs (for detail), and traces (for context) for full observability.",
      "Define strict SLIs that measure user-facing symptoms, not just underlying system causes.",
      "Use Error Budgets to balance feature velocity with system reliability.",
      "Use distributed tracing with correlation IDs passed in HTTP headers to track requests across microservices.",
      "Design alerts to trigger on symptom-based SLO burn rates rather than individual CPU spikes."
    ],
    "furtherReading": [
      {
        "title": "Google SRE Book: Service Level Objectives",
        "url": "https://sre.google/sre-book/service-level-objectives/"
      }
    ]
  },
  "zero-downtime-database-migration-case-study": {
    "title": "Design: a database migration",
    "video": {
      "youtubeId": "u4EgIU8_f5U",
      "title": "Multi-active disaster recovery in CockroachDB",
      "channel": "CockroachDB"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Zero Downtime Database Migrations</h2>\n      <p>A database migration changes the representation that an application depends on. When you run a startup with 100 users, you can afford to take the application offline for 10 minutes to run an <code>ALTER TABLE</code> script. When you run a platform processing thousands of transactions per second, taking the database offline is not an option.</p>\n      \n      <p>Running a heavy schema change (like adding a column with a default value, or changing a column type) on a massive table can lock the table for hours, causing total service outage.</p>\n      \n      <h3>The Expand and Contract Pattern</h3>\n      <p>To achieve zero-downtime schema changes, we use the <strong>Expand and Contract</strong> pattern (also known as Parallel Runs). We break the migration into small, backward-compatible steps.</p>\n      \n      <p>Suppose we want to rename the column <code>first_name</code> to <code>given_name</code> in the <code>users</code> table.</p>\n      \n      <ol>\n        <li><strong>Expand (Schema):</strong> Add the new nullable column <code>given_name</code>. Whether this is metadata-only depends on the database engine, version, default, constraints, and DDL algorithm. Even an online operation may briefly acquire a schema lock or wait behind a long transaction, so test it on a production-like table and set lock timeouts.</li>\n        <li><strong>Dual Write (App):</strong> Deploy new application code that writes to <em>both</em> <code>first_name</code> and <code>given_name</code> whenever a user is created or updated. It continues to read from <code>first_name</code>.</li>\n        <li><strong>Backfill (Data):</strong> Run a background script to copy data from <code>first_name</code> to <code>given_name</code> for all old rows that existed before the dual write started.</li>\n        <li><strong>Switch Read (App):</strong> Deploy new application code that now reads from <code>given_name</code> instead of <code>first_name</code>. It continues to write to both.</li>\n        <li><strong>Stop Old Write (App):</strong> Deploy new application code that only writes to <code>given_name</code>. The <code>first_name</code> column is now completely unused by the app.</li>\n        <li><strong>Contract (Schema):</strong> Safely drop the <code>first_name</code> column from the database.</li>\n      </ol>\n      \n      <h3>Migrating Between Database Systems</h3>\n      <p>What if we are moving from MySQL to PostgreSQL, or from a self-hosted DB to Amazon Aurora? The pattern is similar but requires migrating the actual data stream.</p>\n      \n      <div class=\"mermaid\">\nflowchart LR\n  App[\"Application\"] --> OldDB[(\"Old Database\")]\n  OldDB -->|Logical Replication / CDC| NewDB[(\"New Database\")]\n  App -.->|Switch Connection| NewDB\n      </div>\n      \n      <p>We use <strong>Change Data Capture (CDC)</strong> or Logical Replication. A tool reads the transaction log (e.g., MySQL binlog, Postgres WAL) of the old database and streams every INSERT, UPDATE, and DELETE to the new database in near real-time.</p>\n      \n      <p>Once the new database has caught up and the replication lag is near zero, we pause the application traffic briefly, ensure the final transactions replicate, point the application configuration to the new database, and unpause. This cuts the downtime from hours to seconds.</p>\n    </div>",
    "keyTakeaways": [
      "Never run blocking ALTER TABLE commands on live, heavily used tables.",
      "Use the Expand and Contract (Parallel Change) pattern for safe schema evolutions.",
      "Separate schema changes from application deployment rollouts.",
      "Use Change Data Capture (CDC) to stream data for cross-engine migrations without downtime.",
      "Backfill scripts must run in small batches to avoid overwhelming the production database."
    ],
    "furtherReading": [
      {
        "title": "Stripe: Online Migrations",
        "url": "https://stripe.com/blog/online-migrations"
      }
    ]
  },
  "interview-design-instagram": {
    "title": "Design: a photo-sharing interview",
    "video": {
      "youtubeId": "hnpzNAPiC0E",
      "title": "Scaling Instagram Infrastructure",
      "channel": "InfoQ"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Designing a Photo-Sharing App (Instagram)</h2>\n      <p>A photo-sharing service has two connected jobs: publish an author's image and help other people discover it. The image bytes, post metadata, and follower feed have different storage and delivery needs.</p>\n      \n      <p>The classic Instagram system design interview covers uploading photos, storing relationships (following/followers), and generating the News Feed.</p>\n      \n      <h3>Storage Segregation</h3>\n      <p>We separate our storage layers based on the type of data:</p>\n      <ul>\n        <li><strong>Binary Data (Photos/Videos):</strong> Stored in Object Storage (Amazon S3). Served globally via a Content Delivery Network (CDN) to reduce latency for end-users.</li>\n        <li><strong>User Metadata and Social Graph:</strong> Relationships like \"User A follows User B\" need indexes for the actual access paths, such as followers and followees. Instagram historically used sharded PostgreSQL; graph or wide-column stores are alternatives only when their query, consistency, and operational tradeoffs fit the workload.</li>\n        <li><strong>Post Metadata:</strong> Pointers to the S3 objects, timestamps, captions, and view counts are stored in a relational database or NoSQL store.</li>\n      </ul>\n      \n      <h3>Generating the News Feed</h3>\n      <p>When you open the app, you see a chronological (or algorithmically sorted) list of photos from people you follow. Generating this on the fly (pull model) by querying the database for \"all photos by people I follow, sorted by time\" is incredibly slow if you follow 1,000 people.</p>\n      \n      <p>Instead, we use a <strong>Push Model (Fan-out on Write)</strong>:</p>\n      \n      <div class=\"mermaid\">\nflowchart LR\n  Author[\"Author Posts Photo\"] --> PostService[\"Post Service\"]\n  PostService --> DB[(\"Metadata DB\")]\n  PostService --> Fanout[\"Fanout Service\"]\n  Fanout --> RedisUser1[\"Follower 1 Feed Cache\"]\n  Fanout --> RedisUser2[\"Follower 2 Feed Cache\"]\n  Fanout --> RedisUserN[\"Follower N Feed Cache\"]\n      </div>\n      \n      <p>For an ordinary author, the Fanout Service can asynchronously push the post ID into followers' bounded feed caches. Reading one page is then a bounded range read plus batched hydration—not an <code>O(1)</code> operation independent of page size—and cache misses still need a durable fallback.</p>\n      \n      <h3>The Celebrity Problem</h3>\n      <p>The push model breaks down for celebrities with 200 million followers. Pushing one photo to 200 million Redis lists takes too long and wastes huge amounts of memory, especially for inactive users.</p>\n      \n      <p>A <strong>hybrid model</strong> can fan out ordinary authors and merge selected high-fanout authors at read time. The threshold is workload-dependent and moves cost rather than balancing it perfectly: reads now need bounded multi-source merge, ranking, pagination stability, and a policy for stale or missing cached entries.</p>\n    </div>",
    "keyTakeaways": [
      "Store heavy media in Object Storage and serve it strictly through a CDN.",
      "Use a Fan-out on Write (Push) model to pre-compute feeds for fast reads.",
      "Adopt a Hybrid Fan-out model to prevent the 'celebrity problem' (thundering herd on write).",
      "Scale relational databases by sharding users across multiple database instances.",
      "Use asynchronous workers to process image resizing, thumbnail generation, and feed fan-out."
    ],
    "furtherReading": [
      {
        "title": "Facebook: Needle in a haystack (Photo Storage)",
        "url": "https://engineering.fb.com/2009/04/30/core-infra/needle-in-a-haystack-efficient-storage-of-billions-of-photos/"
      }
    ]
  }
};
