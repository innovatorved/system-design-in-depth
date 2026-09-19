window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-realtime-social"] = {
  "realtime-database-and-websocket-scaling": {
    "title": "Realtime database and WebSocket scaling",
    "video": {
      "youtubeId": "zYPWtksjabk",
      "title": "System Design - Part 25 | Web Sockets | Client Server Communication",
      "channel": "Nikhil Lohia"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Scaling Real-Time Connections</h2>\n      <p>Traditional HTTP follows a request-response model, which is inefficient for real-time applications like chat, live sports updates, or collaborative editing. To push data from the server to the client instantly, we need persistent connections, most commonly achieved via WebSockets.</p>\n      \n      <h3>The Stateful Nature of WebSockets</h3>\n      <p>Unlike stateless HTTP REST APIs, WebSocket connections are stateful. Once a client connects to a specific server (e.g., Server A), that TCP connection remains open. If a message needs to be sent to that user, the system must know exactly which server holds their active connection.</p>\n      \n      <h3>The Connection Manager & Pub/Sub</h3>\n      <p>To scale WebSockets across millions of users, a single server cannot hold all connections. We use a cluster of WebSocket servers. The architecture requires two main components:</p>\n      <ol>\n        <li><strong>Connection registry:</strong> Track each connection or device, not only one node per user: <code>(user, connection_id) -> node, expiry, capabilities</code>. Heartbeats and node-generation fencing remove stale registrations after crashes.</li>\n        <li><strong>Routing and recovery:</strong> Ephemeral Pub/Sub can notify the nodes holding a user's sockets, but it is not a durable inbox. Give durable messages per-conversation or per-recipient positions. After disconnect or node failure, the client resumes from its last acknowledged position and fetches gaps from the source of truth.</li>\n      </ol>\n      \n      <h3>Load Balancing</h3>\n      <p>Load balancers must support long-lived upgraded connections and drain them during deployments. Affinity can reduce reconnect churn but cannot be the recovery mechanism: a reconnect may land on another node. Bound outbound queues per connection; disconnect or coalesce updates for a slow client before one socket consumes unbounded memory.</p>\n      \n    </div>",
    "keyTakeaways": [
      "WebSockets require stateful, persistent TCP connections.",
      "Scaling requires a registry (like Redis) to map users to their connected servers.",
      "Ephemeral Pub/Sub can route live hints, while durable positions and gap fetches recover messages missed during disconnects or node failure."
    ],
    "furtherReading": [
      {
        "title": "Designing a Chat System",
        "url": "https://bytebytego.com/"
      }
    ]
  },
  "websockets-vs-sse-vs-long-polling": {
    "title": "WebSockets vs SSE vs long polling",
    "video": {
      "youtubeId": "zYPWtksjabk",
      "title": "System Design - Part 25 | Web Sockets | Client Server Communication",
      "channel": "Nikhil Lohia"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Comparing Real-Time Protocols</h2>\n      <p>When designing a real-time feature, you have three primary architectural choices for pushing data to the client. Choosing the wrong one can lead to massive network overhead or battery drain.</p>\n      \n      <h3>Short & Long Polling</h3>\n      <p><strong>Short Polling:</strong> The client asks the server every X seconds if there is new data. This is simple but highly inefficient. Most requests return empty, wasting server CPU and mobile battery.</p>\n      <p><strong>Long Polling:</strong> The client makes a request, but the server holds the connection open until new data is available or a timeout occurs. Once the client gets data, it immediately opens a new long-polling request. It works over standard HTTP, bypassing corporate firewalls easily, but it still incurs the overhead of HTTP headers on every new connection.</p>\n      \n      <h3>Server-Sent Events (SSE)</h3>\n      <p>SSE is a unidirectional protocol over HTTP. The client establishes a connection, and the server continuously streams data down to the client. The client cannot send data back over this same channel (it must make separate POST requests).</p>\n      <p><strong>Best for:</strong> Real-time feeds, stock tickers, or live sports scores where data flows only from Server to Client.</p>\n      \n      <h3>WebSockets</h3>\n      <p>WebSockets upgrade a standard HTTP connection into a fully bidirectional, persistent TCP connection. Both client and server can send data asynchronously with minimal overhead (no heavy HTTP headers).</p>\n      <p><strong>Best for:</strong> Multiplayer games, collaborative editing (Google Docs), and low-latency chat applications.</p>\n      \n      <table border=\"1\">\n        <tr>\n          <th>Protocol</th>\n          <th>Direction</th>\n          <th>Use Case</th>\n        </tr>\n        <tr>\n          <td>Long Polling</td>\n          <td>Simulated Bi-directional</td>\n          <td>Legacy support, strict firewalls</td>\n        </tr>\n        <tr>\n          <td>SSE</td>\n          <td>Server to Client only</td>\n          <td>Live feeds, notifications</td>\n        </tr>\n        <tr>\n          <td>WebSockets</td>\n          <td>Bi-directional</td>\n          <td>Chat, gaming, real-time collab</td>\n        </tr>\n      </table>\n      \n    </div>",
    "keyTakeaways": [
      "Long polling is resource-intensive but works when WebSockets are blocked.",
      "SSE is perfect for unidirectional data streams (like stock tickers).",
      "WebSockets offer full-duplex, low-latency communication for interactive apps."
    ],
    "furtherReading": [
      {
        "title": "MDN WebSockets API",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API"
      }
    ]
  },
  "social-network-database-modeling": {
    "title": "Social network database modeling",
    "video": {
      "youtubeId": "Nfa-uUHuFHg",
      "title": "System Design Interview Walkthrough: Design Twitter",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Modeling Social Data at Scale</h2>\n      <p>Social networks deal with highly interconnected data: users, posts, comments, likes, and follows. Choosing the right database model is critical for read efficiency, as social feeds are extremely read-heavy.</p>\n      \n      <h3>Relational Models</h3>\n      <p>A normalized SQL schema with appropriate indexes can serve users, posts, comments, and reactions well. A home feed may become expensive when it must repeatedly merge large author sets under a strict latency target; measurements can then justify a materialized feed or query-specific projection. The problem is the access pattern and fanout, not the mere presence of a JOIN.</p>\n      \n      <h3>NoSQL & Wide-Column Stores</h3>\n      <p>Databases like Cassandra (used by Instagram and Discord) or ScyllaDB are preferred for massive social scale. They use a denormalized, query-driven modeling approach. Instead of joining tables, you design tables to answer specific queries.</p>\n      <p>For example, to load a user's timeline, you don't join Users and Posts. You have a specific table <code>user_timeline</code> partitioned by <code>user_id</code> and clustered by <code>timestamp</code> (descending). When a user posts, it is fanned out and written directly to the timelines of their followers. Reads become a bounded single-partition range query whose cost still depends on page size, filtering, storage latency, and hot-partition load.</p>\n      \n      <h3>Graph Databases</h3>\n      <p>For deep relationship queries (e.g., \"Find friends of friends who like this band\"), Graph databases like Neo4j or Amazon Neptune excel. However, they are generally too slow for rendering high-throughput home feeds. They are typically used asynchronously for recommendation engines and anti-fraud detection, rather than the hot path of feed generation.</p>\n      \n    </div>",
    "keyTakeaways": [
      "Relational JOINs do not scale well for massive, interconnected social feeds.",
      "Wide-column NoSQL databases optimize reads by denormalizing data into query-specific tables.",
      "Graph databases are powerful for relationship analytics but usually kept off the hot read path."
    ],
    "furtherReading": [
      {
        "title": "Data Modeling in Cassandra",
        "url": "https://cassandra.apache.org/doc/latest/cassandra/data_modeling/"
      }
    ]
  },
  "social-graph-follows-and-flockdb": {
    "title": "Social graph: follows and FlockDB",
    "video": {
      "youtubeId": "Nfa-uUHuFHg",
      "title": "System Design Interview Walkthrough: Design Twitter",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Managing the Follower Graph</h2>\n      <p>The \"social graph\" is the mapping of relationships between users. In systems like Twitter or Instagram, this is a directed graph (User A follows User B, but B might not follow A). Managing this graph efficiently is crucial because every feed generation relies on knowing who a user follows.</p>\n      \n      <h3>The Twitter Approach: FlockDB</h3>\n      <p>Twitter famously built FlockDB to handle their social graph. Rather than a complex traversal-focused graph database (like Neo4j), FlockDB is essentially a highly optimized, distributed adjacency list stored on top of MySQL shards.</p>\n      \n      <h3>Adjacency Lists in SQL</h3>\n      <p>The core concept is storing directed edges in simple tables. An edge table has three main columns: <code>source_id</code>, <code>destination_id</code>, and <code>state</code> (active, blocked, etc.).</p>\n      <p>To find who User 1 follows: <code>SELECT destination_id FROM edges WHERE source_id = 1</code>.</p>\n      <p>To find User 1's followers: <code>SELECT source_id FROM edges WHERE destination_id = 1</code>.</p>\n      \n      <h3>Sharding the Graph</h3>\n      <p>Because the graph is too large for one machine, it must be sharded. FlockDB maintained indexed adjacency lists in both directions. A forward representation grouped by <code>source_id</code> serves outgoing edges, while a reverse representation grouped by destination serves incoming edges; keeping both paths consistent requires ordered, retry-safe updates and repair. This makes \"Who do I follow?\" queries extremely fast because all out-edges for a user live on the same database shard. However, \"Who follows me?\" queries are slightly slower, often requiring an index or a secondary table sharded by <code>destination_id</code> to maintain performance.</p>\n      \n    </div>",
    "keyTakeaways": [
      "Large-scale follow graphs are often implemented as simple, distributed adjacency lists.",
      "Sharding by source ID optimizes read queries for feed generation.",
      "Twitter's FlockDB demonstrated how to scale graph edges using standard relational databases."
    ],
    "furtherReading": [
      {
        "title": "FlockDB Architecture",
        "url": "https://github.com/twitter-archive/flockdb"
      }
    ]
  },
  "feed-generation-push-pull-hybrid": {
    "title": "Feed generation: push, pull, hybrid",
    "video": {
      "youtubeId": "Nfa-uUHuFHg",
      "title": "System Design Interview Walkthrough: Design Twitter",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Designing a News Feed</h2>\n      <p>Generating a timeline of content from people a user follows is a classic system design challenge. The core decision is how content moves from a creator to a consumer's feed.</p>\n      \n      <h3>Push Model (Fan-out on Write)</h3>\n      <p>When a user posts, the system immediately \"pushes\" the post ID into the pre-computed feed caches of all their followers. When a follower opens the app, their feed is already built and stored in memory (e.g., a Redis List).</p>\n      <p><strong>Pros:</strong> Reads are incredibly fast (O(1)).</p>\n      <p><strong>Cons:</strong> The \"Justin Bieber Problem.\" If a celebrity with 100 million followers makes a post, the system must write to 100 million Redis lists. This massive fan-out takes time, consumes enormous CPU/Network, and delays feed updates.</p>\n      \n      <h3>Pull Model (Fan-out on Read)</h3>\n      <p>When a user posts, it is simply saved to their personal outbox. No feed updates are made. When a follower opens the app, the system queries the outboxes of all people they follow, merges the posts, sorts them by timestamp, and returns the result.</p>\n      <p><strong>Pros:</strong> Writes are instant. No celebrity fan-out issue.</p>\n      <p><strong>Cons:</strong> Reads are slow and computationally expensive, especially for users who follow thousands of people.</p>\n      \n      <h3>The Hybrid Approach</h3>\n      <p>Modern systems use a hybrid model. For normal users, the system uses Push (fan-out on write) to keep feeds fast. For celebrities or highly active accounts, the system uses Pull. When you load your feed, the system grabs your pre-computed Push feed, then dynamically Pulls recent posts from the celebrities you follow, and merges them together at read-time.</p>\n      \n    </div>",
    "keyTakeaways": [
      "Push (fan-out on write) optimizes for fast reads but struggles with massive follower counts.",
      "Pull (fan-out on read) optimizes for fast writes but slows down feed loading.",
      "Hybrid models apply different strategies based on user follower topology."
    ],
    "furtherReading": [
      {
        "title": "Twitter Timeline Architecture",
        "url": "https://blog.x.com/engineering/en_us/topics/infrastructure/2015/building-the-chronological-timeline.html"
      }
    ]
  },
  "newly-unread-indicator": {
    "title": "Design: a newly-unread indicator",
    "video": {
      "youtubeId": "cr6p0n0N-VA",
      "title": "Design Whatsapp: System Design Interview w/ a Ex-Meta Senior Manager",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Implementation notes for the archive's newly-unread badge</h2>\n      <p>The archive defines this badge precisely as distinct eligible senders after the last acknowledged inbox snapshot. It is not a count of unread messages or conversations, and opening the overview does not advance thread read receipts.</p>\n      \n      <h3>The unsafe clear-all approach</h3>\n      <p><code>SET badge 0</code> loses an arrival that commits after the server prepared the inbox response but before the clear. Counting rows with <code>read = false</code> also computes a different product metric from distinct senders after an overview boundary.</p>\n      \n      <h3>Prepared sender maxima</h3>\n      <p>Keep the accepted message stream authoritative. A projection may store each sender's greatest recipient-local position, for example as a Redis sorted-set member scored by position. Count members strictly above the acknowledged-through boundary. If projection progress lags, merge the projected prefix with source messages in the unprocessed tail rather than returning a stale cache value as exact.</p>\n      \n      <h3>Handling Consistency and High Water Marks</h3>\n      <p>Counters can easily drift out of sync due to network failures or race conditions. A more robust approach uses a \"High Water Mark\" or cursor. The server issues an inbox snapshot containing the recipient and the greatest accepted position included in that response. An acknowledgement names that server-issued snapshot, and the stored boundary advances by <code>max(current, snapshot_position)</code> so a delayed device cannot move it backward.</p>\n      <p>An arrival beyond the acknowledged snapshot remains newly unread even if it races with the acknowledgement. Cache loss triggers reconstruction from retained source messages or a checkpoint; it must not turn unknown state into zero.</p>\n      \n    </div>",
    "keyTakeaways": [
      "Keep newly-unread semantics distinct from message counts, conversation unread state, and read receipts.",
      "Use recipient-local positions and server-issued snapshot acknowledgements so racing arrivals are not cleared.",
      "A prepared sender projection may accelerate reads, but retained source messages and projection progress make lag recoverable."
    ],
    "furtherReading": [
      {
        "title": "Facebook's Notification Architecture",
        "url": "https://engineering.fb.com/"
      }
    ]
  },
  "hashtag-extraction-and-tag-store": {
    "title": "Hashtag extraction and tag store",
    "video": {
      "youtubeId": "Nfa-uUHuFHg",
      "title": "System Design Interview Walkthrough: Design Twitter",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Extracting and Indexing Hashtags</h2>\n      <p>Hashtags power content discovery and trending topics. Processing them at scale involves real-time text parsing, indexing, and aggregation.</p>\n      \n      <h3>Extraction Pipeline</h3>\n      <p>When a post is created, it is pushed to an asynchronous processing queue (e.g., Kafka). Stream processors (like Apache Flink or Storm) consume the posts, run regex to extract hashtags, normalize them (lowercasing, stripping punctuation), and emit them as events.</p>\n      \n      <h3>The Tag Store (Inverted Index)</h3>\n      <p>To find all posts for a hashtag, the system uses an Inverted Index—the same core structure used by search engines like Elasticsearch. Instead of mapping a Post to its Tags, it maps a Tag to a list of Post IDs.</p>\n      <p>In a NoSQL database like Cassandra, this looks like a table partitioned by <code>hashtag</code>, with rows clustered by <code>post_id</code> (or time). Querying <code>SELECT post_id FROM tags WHERE hashtag = '#systemdesign'</code> returns the timeline instantly.</p>\n      \n      <h3>Trending Algorithms</h3>\n      <p>To calculate what is \"trending,\" you don't just count the total volume of a tag; you calculate its velocity. An algorithm like Exponential Moving Average (EMA) or sliding window counters (often using Redis or Count-Min Sketches for memory efficiency) gives higher weight to hashtags that have suddenly spiked in usage in the last few minutes compared to their historical baseline.</p>\n      \n    </div>",
    "keyTakeaways": [
      "Hashtag extraction is done asynchronously via stream processing.",
      "An Inverted Index is used to map hashtags to lists of content.",
      "Trending algorithms prioritize velocity and sudden spikes over sheer total volume."
    ],
    "furtherReading": [
      {
        "title": "Elasticsearch Inverted Index",
        "url": "https://www.elastic.co/guide/en/elasticsearch/reference/current/documents-indices.html"
      }
    ]
  },
  "reaction-modeling": {
    "title": "Reaction modeling",
    "video": {
      "youtubeId": "Nfa-uUHuFHg",
      "title": "System Design Interview Walkthrough: Design Twitter",
      "channel": "Hello Interview"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Designing Like and Reaction Systems</h2>\n      <p>Likes and reactions (Love, Haha, Wow) generate the highest volume of write traffic on a social network. Modeling this data efficiently is vital for both fast ingestion and fast display.</p>\n      \n      <h3>Denormalization is Key</h3>\n      <p>When rendering a feed, you need to know two things: the total reaction count, and whether the viewing user has reacted. A normalized SQL approach (checking a Reactions table for every post) is too slow.</p>\n      <p>Instead, the <code>Posts</code> table itself stores denormalized counters: <code>like_count</code>, <code>love_count</code>, etc. When a reaction occurs, these counters are incremented. The user's specific reaction state is stored separately (e.g., in a fast Key-Value store) so the UI can highlight the correct button.</p>\n      \n      <h3>Handling High Write Throughput</h3>\n      <p>For viral posts, incrementing a counter in a database causes severe lock contention (Hot Key Problem). If a million people like a post in a minute, updating that single row directly will fail.</p>\n      <p>To solve this, systems use asynchronous buffering. Reactions are dropped into a Kafka queue. A background worker aggregates the counts (e.g., \"+500 likes in the last second\") and performs a single bulk update to the database. Alternatively, Redis can handle high-throughput atomic increments (<code>INCR</code>) and sync to the persistent database periodically.</p>\n      \n    </div>",
    "keyTakeaways": [
      "Reaction counts must be denormalized directly onto the post or content object.",
      "High-velocity reactions on viral posts cause database lock contention.",
      "Use stream aggregation (buffering in Kafka) or Redis to batch database updates."
    ],
    "furtherReading": [
      {
        "title": "Scaling Likes on Facebook",
        "url": "https://engineering.fb.com/"
      }
    ]
  },
  "photo-tagging-coordinate-model": {
    "title": "Design: photo tagging coordinates",
    "video": {
      "youtubeId": "hnpzNAPiC0E",
      "title": "Scaling Instagram Infrastructure",
      "channel": "InfoQ"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>System Design: Photo Tagging</h2>\n      <p>Photo tagging requires mapping a user entity to specific geometric coordinates within an image. This involves coordinate mathematics, database modeling, and permission handling.</p>\n      \n      <h3>Coordinate Modeling</h3>\n      <p>Image dimensions vary across devices, so storing absolute pixel coordinates (e.g., x:400, y:300) is fragile. Instead, tags are stored using relative coordinates (percentages). The archive's executable design stores a normalized point <code>(u, v)</code> tied to an immutable image version. If the product needs boxes, declare a separate representation such as normalized corners <code>(u1, v1, u2, v2)</code> and validate positive in-bounds extents; do not imply box dimensions that the shown schema does not store. The client application multiplies these by the rendered image dimensions to draw the box accurately on any screen.</p>\n      \n      <h3>Database Schema</h3>\n      <p>A relational approach works well here since tags are closely tied to the photo entity. A point-tag table includes image and immutable version IDs, target and creator account IDs, normalized <code>u</code>/<code>v</code>, approval state, and operation/revision metadata. A box-tag extension must add its declared corner fields consistently.</p>\n      \n      <h3>Fan-out and Permissions</h3>\n      <p>Tagging someone is a social action. When a tag is created, it triggers a workflow: notification generation, privacy checks, and timeline fan-out. If User A tags User B, the photo might need to appear on User B's timeline, subject to User B's privacy settings. This complexity requires the tagging action to be processed asynchronously, keeping the initial tag creation API call fast.</p>\n      \n    </div>",
    "keyTakeaways": [
      "Store image coordinates as relative percentages, not absolute pixels.",
      "Tags involve complex privacy and permission workflows.",
      "The social fan-out resulting from a tag should be handled asynchronously."
    ],
    "furtherReading": [
      {
        "title": "Understanding Image Coordinates",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes"
      }
    ]
  },
  "live-commentary-system-design": {
    "title": "Design: live commentary",
    "video": {
      "youtubeId": "zYPWtksjabk",
      "title": "System Design - Part 25 | Web Sockets | Client Server Communication",
      "channel": "Nikhil Lohia"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Designing Live Commentary (Twitch Chat)</h2>\n      <p>Live commentary for events (sports, game streams) presents unique challenges: extreme write throughput concentrated on a single channel, and the need for sub-second read latency for millions of viewers simultaneously.</p>\n      \n      <h3>The Hot Key Dilemma</h3>\n      <p>Standard database partitions group data by chat room ID. But if a popular streamer has 500,000 concurrent viewers chatting, that single partition will be overwhelmed, leading to massive lag or failure.</p>\n      \n      <h3>In-Memory Pub/Sub and Sampling</h3>\n      <p>To handle this, live commentary completely bypasses persistent storage for the hot read path. Messages are routed through a highly distributed Pub/Sub system (like Redis Cluster or specialized systems like Twitch's Edge Chat architecture). The WebSocket servers subscribe to the channel and push messages directly to viewers.</p>\n      <p>When velocity is too high (e.g., 10,000 messages per second), human readability is impossible. The WebSocket servers intelligently drop or sample messages before sending them down the wire to prevent crashing the client's browser and to save bandwidth.</p>\n      \n      <h3>Asynchronous Persistence</h3>\n      <p>While the live chat is served from memory, the messages are simultaneously sent to a Kafka topic. Background consumer workers batch these messages and write them in bulk to a cold storage database (like Cassandra) for later VOD (Video on Demand) playback, completely decoupling the live experience from disk I/O.</p>\n      \n    </div>",
    "keyTakeaways": [
      "Live fanout can use an in-memory path for low latency, while durable source positions support reconnect, moderation, and replay.",
      "Use Pub/Sub and WebSocket fan-out for sub-second latency.",
      "At unreadable rates, apply an explicit server/client coalescing or sampling policy and preserve moderation and durable-history requirements separately."
    ],
    "furtherReading": [
      {
        "title": "How Twitch Scales Chat",
        "url": "https://blog.twitch.tv/en/2015/12/18/replacing-irc-how-twitch-chat-reached-400-billion-messages-a-day-822eb1f48fa1/"
      }
    ]
  }
};
