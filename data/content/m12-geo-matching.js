window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-geo-matching"] = {
  "nearby-geospatial-search-system-design": {
    "title": "Nearby geospatial search",
    "video": {
      "youtubeId": "ENbivJwB3BY",
      "title": "Designing Location-Based Systems | Geohashing vs Quadtrees Explained for Engineers",
      "channel": "Ultimate System Design"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Understanding Nearby Geospatial Search</h2>\n      <p>Geospatial search is a core component of many modern applications, from ride-sharing services like Uber to review platforms like Yelp. At its core, the problem is about finding points of interest (POIs) that are physically close to a user's current location within a given radius.</p>\n      \n      <h3>The Naive Approach</h3>\n      <p>A naive approach might involve storing the latitude and longitude of every POI in a relational database and calculating the distance between the user and every POI on the fly. You could use the Haversine formula for this:</p>\n      <pre><code>SELECT * FROM places WHERE haversine(lat, lon, user_lat, user_lon) < radius;</code></pre>\n      <p>However, this requires a full table scan, computing a complex trigonometric function for millions of rows. It is highly inefficient and will not scale.</p>\n      \n      <h3>Spatial Indexing</h3>\n      <p>To optimize this, we need spatial indexing. The fundamental idea of spatial indexing is to map two-dimensional coordinates (latitude and longitude) into one-dimensional strings or numbers, which can then be efficiently indexed by standard databases (using B-Trees, for example). Common strategies include:</p>\n      <ul>\n        <li><strong>Geohash:</strong> Divides the world into a grid of rectangles, assigning a string to each.</li>\n        <li><strong>Quadtree:</strong> Recursively subdivides space into four quadrants based on POI density.</li>\n        <li><strong>Google S2 / Uber H3:</strong> Uses spherical projections to map the Earth into cells.</li>\n      </ul>\n      \n      <h3>Database Support</h3>\n      <p>Many modern databases support spatial queries out of the box using extensions:</p>\n      <ul>\n        <li><strong>PostGIS:</strong> An extension for PostgreSQL that adds support for geographic objects.</li>\n        <li><strong>Redis GEO:</strong> Built-in commands like GEOSEARCH for ultra-fast, in-memory proximity queries based on Geohash.</li>\n        <li><strong>Elasticsearch:</strong> Provides geo-point and geo-shape data types for powerful search capabilities.</li>\n      </ul>\n\n      <h3>Trade-offs in Geospatial Design</h3>\n      <p><strong>Concrete query:</strong> for couriers within 3 km, first use a spatial index to fetch a bounded candidate set whose cells or bounding boxes cover the circle, then exact-filter by geodesic distance, availability, tenant/permission, and a location freshness cutoff before sorting by ETA. A courier last updated five minutes ago is not made eligible by being geometrically close. Cap candidates and state whether an incomplete shard returns a partial result or an error.</p>\n      <p>Static POIs tolerate slower writes and aggressive caching. Moving couriers need frequent index updates and stale-member removal, but an in-memory index adds rebuild and failover work. Geographic partitioning reduces the working set while creating boundary queries, hot-city imbalance, and handoff work when an object crosses regions.</p>\n      \n      <div class=\"mermaid\">\n      flowchart TD\n          User[\"User App\"] --> API[\"API Gateway\"]\n          API --> SearchService[\"Search Service\"]\n          SearchService --> Cache[\"Redis GEO Cache\"]\n          SearchService --> DB[(\"PostGIS Database\")]\n      </div>\n    </div>",
    "keyTakeaways": [
      "Naive distance calculations do not scale.",
      "Spatial indexing converts 2D coordinates into 1D keys.",
      "PostGIS and Redis are excellent choices for geospatial workloads."
    ],
    "furtherReading": [
      {
        "title": "Yelp System Design",
        "url": "https://bytebytego.com/"
      }
    ]
  },
  "geohash-prefix-spatial-index": {
    "title": "Geohash prefix spatial index",
    "video": {
      "youtubeId": "ENbivJwB3BY",
      "title": "Designing Location-Based Systems | Geohashing vs Quadtrees Explained for Engineers",
      "channel": "Ultimate System Design"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Deep Dive into Geohashes</h2>\n      <p>Geohash is a public domain geocode system that encodes a geographic location into a short string of letters and digits. It works by recursively subdividing the Earth's surface into a grid.</p>\n      \n      <h3>How Geohash Works</h3>\n      <p>The algorithm interleaves bits derived from the latitude and longitude. The first step is to divide the Earth into two halves. If the point is in the right half, it gets a 1; if left, a 0. This process is repeated recursively, alternating between longitude and latitude, until the desired precision is reached. Finally, the binary string is converted to a base32 string.</p>\n      \n      <h3>Prefix Matching for Proximity</h3>\n      <p>A geohash prefix identifies one rectangular cell. Two points with a sufficiently long shared prefix occupy that cell, but they may still be far apart within it; nearby points on opposite sides of a cell boundary may share little prefix. Prefix lookup is candidate generation, not proof that a point lies within the requested radius.</p>\n      <pre><code>SELECT * FROM places WHERE geohash LIKE '9q8y%';</code></pre>\n      \n      <h3>The Edge Case Problem</h3>\n      <p>A robust query chooses a cell precision from the requested radius and latitude, computes a covering that fully contains the search shape, fetches candidates from every covered cell, deduplicates them, and applies an exact distance check. The center cell plus eight neighbors is sufficient only for particular radius/cell-size combinations; larger radii require more cells, and dateline or polar cases need explicit longitude-wrapping and geometry handling.</p>\n      \n      <h3>Choosing the Right Precision</h3>\n      <p>The length of the Geohash string determines its precision:</p>\n      <ul>\n        <li>4 characters: ~39 km x 19.5 km</li>\n        <li>5 characters: ~4.9 km x 4.9 km</li>\n        <li>6 characters: ~1.2 km x 0.6 km</li>\n      </ul>\n      <p>In a system design interview, selecting a precision of 5 or 6 characters is typically appropriate for a localized proximity search (like finding nearby restaurants).</p>\n      \n      <div class=\"mermaid\">\n      flowchart LR\n          LatLon(Latitude / Longitude) --> Interleave(Interleave Bits)\n          Interleave --> Base32(Base32 Encoding)\n          Base32 --> GeohashString(Geohash String)\n      </div>\n    </div>",
    "keyTakeaways": [
      "Geohash encodes 2D coordinates into a 1D string.",
      "Prefix matching enables fast proximity searches using B-Tree indexes.",
      "Choose a covering large enough for the requested shape, then exact-filter candidates; nine cells are not universally sufficient."
    ],
    "furtherReading": [
      {
        "title": "Understanding Geohash",
        "url": "https://en.wikipedia.org/wiki/Geohash"
      }
    ]
  },
  "geospatial-grid-systems-h3-s2-geohash": {
    "title": "Grid systems: H3, S2, geohash",
    "video": {
      "youtubeId": "ENbivJwB3BY",
      "title": "Designing Location-Based Systems | Geohashing vs Quadtrees Explained for Engineers",
      "channel": "Ultimate System Design"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Comparing Geospatial Grid Systems</h2>\n      <p>When building large-scale spatial applications, choosing the right grid system is critical. Geohash, Google's S2, and Uber's H3 are the three most prominent grid systems, each with distinct characteristics and trade-offs.</p>\n      \n      <h3>Geohash (Rectangles)</h3>\n      <p>Geohash divides the world into rectangles. Its main advantage is simplicity and native support in many databases. However, because the Earth is spherical, the actual physical area of Geohash rectangles varies significantly depending on the latitude. A Geohash near the equator covers much more area than one near the poles, making radius calculations inconsistent.</p>\n      \n      <h3>Google S2 (Quadrilaterals)</h3>\n      <p>Google developed the S2 geometry library to solve the distortion problem. It maps the sphere to a cube and then recursively subdivides the faces into quadrilaterals (using a Hilbert curve). S2 provides excellent precision and mathematical guarantees about cell sizes. It is widely used in systems like MongoDB and Foursquare.</p>\n      \n      <h3>Uber H3 (Hexagons)</h3>\n      <p>H3 indexes the sphere with mostly hexagonal cells plus required pentagons, across a hierarchy of resolutions. Neighbor traversal is convenient for aggregation and approximate coverings, but projection distortion means real-world cell areas and center distances are not identical everywhere. Radius and boundary decisions still require exact geometry or distance checks after candidate generation.</p>\n      \n      <h3>Summary of Trade-offs</h3>\n      <table border=\"1\">\n        <tr>\n          <th>System</th>\n          <th>Shape</th>\n          <th>Best Use Case</th>\n        </tr>\n        <tr>\n          <td>Geohash</td>\n          <td>Rectangle</td>\n          <td>Simple string-based indexing, fast prototyping</td>\n        </tr>\n        <tr>\n          <td>S2</td>\n          <td>Quadrilateral</td>\n          <td>General-purpose mapping, minimal distortion</td>\n        </tr>\n        <tr>\n          <td>H3</td>\n          <td>Hexagon</td>\n          <td>Ride-sharing, continuous neighbor traversal</td>\n        </tr>\n      </table>\n      \n    </div>",
    "keyTakeaways": [
      "Grid systems solve the 2D to 1D mapping problem.",
      "S2 maps the earth to a cube and uses a Hilbert curve.",
      "H3 provides hierarchical mostly-hexagonal cells for aggregation and neighborhood traversal; it includes pentagons and does not replace exact distance or routing."
    ],
    "furtherReading": [
      {
        "title": "Uber H3 Documentation",
        "url": "https://h3geo.org/"
      }
    ]
  },
  "redis-geo-spatial-hot-path": {
    "title": "Redis GEO hot path",
    "video": {
      "youtubeId": "ENbivJwB3BY",
      "title": "Designing Location-Based Systems | Geohashing vs Quadtrees Explained for Engineers",
      "channel": "Ultimate System Design"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Leveraging Redis for Fast Geospatial Queries</h2>\n      <p>When you need to track dynamic points of interest—such as moving vehicles in a ride-sharing app or real-time delivery tracking—traditional disk-based databases like PostGIS may struggle with the high write throughput. This is where Redis GEO commands shine.</p>\n      \n      <h3>How Redis GEO Works</h3>\n      <p>Under the hood, Redis GEO utilizes Sorted Sets (ZSET). When you add a geospatial point using <code>GEOADD</code>, Redis calculates a 52-bit Geohash for the latitude and longitude, and uses this Geohash as the score for the sorted set. This allows Redis to store and retrieve locations rapidly in memory.</p>\n      \n      <h3>Key Commands</h3>\n      <ul>\n        <li><code>GEOADD key longitude latitude member</code>: Adds a location to the index.</li>\n        <li><code>GEODIST key member1 member2 [unit]</code>: Calculates the distance between two members.</li>\n        <li><code>GEOSEARCH key [FROMLONLAT|FROMMEMBER] [BYRADIUS|BYBOX]</code>: The modern way to query for members within a specific radius or bounding box.</li>\n      </ul>\n      \n      <h3>Handling High Write Throughput</h3>\n      <p>In a system like Uber, millions of drivers send location updates every few seconds. To handle this:</p>\n      <ol>\n        <li><strong>Sharding:</strong> You cannot store all global locations in a single Redis node. Shard the Redis cluster geographically (e.g., one shard per city or country).</li>\n        <li><strong>Expiry:</strong> Redis key TTL applies to the whole GEO sorted set, not one member. Store per-driver freshness separately and remove stale members with a sweeper or atomic maintenance script; every query must reject candidates older than its freshness limit.</li>\n        <li><strong>Batching:</strong> Use Redis pipelines to batch <code>GEOADD</code> commands from the ingestion service to the Redis nodes.</li>\n      </ol>\n      \n      <p>Example of adding a driver and searching for nearby drivers:</p>\n      <pre><code>GEOADD drivers -122.4194 37.7749 \"driver123\"\nGEOSEARCH drivers FROMLONLAT -122.4194 37.7749 BYRADIUS 5 km WITHDIST</code></pre>\n      \n    </div>",
    "keyTakeaways": [
      "Redis GEO uses Geohashes stored in Sorted Sets.",
      "It is optimized for low-latency, high-throughput in-memory queries.",
      "Regional partitioning can limit working sets, but boundary queries, hot cities, failover, and cross-region movement need explicit routing and rebalancing."
    ],
    "furtherReading": [
      {
        "title": "Redis GEOSEARCH documentation",
        "url": "https://redis.io/commands/geosearch/"
      }
    ]
  },
  "geofencing-point-in-polygon": {
    "title": "Geofencing: point in polygon",
    "video": {
      "youtubeId": "ENbivJwB3BY",
      "title": "Designing Location-Based Systems | Geohashing vs Quadtrees Explained for Engineers",
      "channel": "Ultimate System Design"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Geofencing and the Point-in-Polygon Problem</h2>\n      <p>Geofencing involves creating virtual boundaries (polygons) around real-world geographical areas. When a user or device enters, exits, or lingers within these boundaries, the system triggers an event. Applications range from targeted advertising and location-based reminders to fleet management and airport surge pricing zones.</p>\n      \n      <h3>The Core Algorithm</h3>\n      <p>At the mathematical heart of geofencing is the \"Point-in-Polygon\" (PIP) problem. Given a coordinate (a point) and a set of vertices (a polygon), how do we determine if the point is inside the polygon?</p>\n      \n      <h3>Optimizing Geofencing at Scale</h3>\n      <p>Evaluating the PIP algorithm for every user against every polygon is computationally impossible at scale. System design requires multi-stage filtering:</p>\n      \n      <ol>\n        <li><strong>Bounding Box Filtering:</strong> Every polygon has a minimum bounding box (MBR). PostGIS commonly uses a GiST spatial index with bounding-box operators to find candidate polygons before the exact predicate. This reduces the candidate polygons from millions to a handful.</li>\n        <li><strong>Exact PIP Calculation:</strong> Only for the polygons that pass the bounding box filter, the system runs the CPU-intensive ray-casting algorithm to confirm if the point is truly inside the precise polygon boundaries.</li>\n      </ol>\n      \n      <h3>System Architecture</h3>\n      <p>A stream processor can index versioned polygons and consume location updates, but point membership alone does not define an enter/exit event. Persist the last evaluated polygon version and membership per device. For example, GPS jitter around an airport boundary can alternate inside/outside every second; require hysteresis, consecutive observations, or a dwell interval before emitting a transition. Give transitions stable IDs so replay after a crash does not send duplicate notifications, and define how a polygon edit re-evaluates devices already nearby.</p>\n      \n    </div>",
    "keyTakeaways": [
      "Geofencing triggers events based on location boundaries.",
      "Use a supported spatial index for bounding-box candidate filtering, then run the exact boundary-aware geometry predicate.",
      "Stream processing engines are ideal for evaluating continuous location updates against geofences."
    ],
    "furtherReading": [
      {
        "title": "PostGIS R-Tree Spatial Indexes",
        "url": "https://postgis.net/workshops/postgis-intro/indexing.html"
      }
    ]
  },
  "ray-casting-point-in-polygon": {
    "title": "Ray casting point in polygon",
    "video": {
      "youtubeId": "RSXM9bgqxJM",
      "title": "Checking if a point is inside a polygon is RIDICULOUSLY simple (Ray casting algorithm) - Inside code",
      "channel": "Inside code"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>The Ray Casting Algorithm</h2>\n      <p>The ray casting algorithm is the most common mathematical solution to the Point-in-Polygon problem. It determines whether a point sits inside a complex, irregular polygon.</p>\n      \n      <h3>How It Works</h3>\n      <p>The logic is elegantly simple based on topology: draw a horizontal ray (a straight line) starting from the point in question and extending to infinity in one direction (usually to the right). Then, count how many times this ray intersects the edges of the polygon.</p>\n      <ul>\n        <li>If the number of intersections is <strong>ODD</strong>, the point is <strong>INSIDE</strong> the polygon.</li>\n        <li>If the number of intersections is <strong>EVEN</strong>, the point is <strong>OUTSIDE</strong> the polygon.</li>\n      </ul>\n      \n      <h3>Handling Edge Cases</h3>\n      <p>While conceptually simple, the implementation must handle tricky edge cases carefully:</p>\n      <ul>\n        <li><strong>Boundary policy:</strong> First decide whether a point on an edge or vertex counts as inside, corresponding to semantics such as <code>covers</code> versus strict <code>contains</code>. Detect that case explicitly before odd/even counting. A half-open endpoint rule then prevents a vertex from contributing twice.</li>\n        <li><strong>Horizontal edges:</strong> If the ray perfectly overlaps a horizontal edge of the polygon, it could cause issues. The vertex rules mentioned above usually resolve this naturally by ignoring horizontal edges entirely.</li>\n      </ul>\n      \n      <h3>Computational Complexity</h3>\n      <p>The basic test is O(N) in polygon edges. Production geometry also needs valid ring orientation, holes and multipolygons, a documented boundary rule, robust predicates near edges, and a coordinate model. Applying planar longitude/latitude arithmetic across the antimeridian or over large regions can be wrong; use an appropriate projected or spherical library. Spatial indexing narrows candidates but never replaces the exact predicate.</p>\n      \n    </div>",
    "keyTakeaways": [
      "Ray casting uses an odd/even intersection count to determine inclusion.",
      "It runs in O(N) time relative to the number of polygon edges.",
      "Edge cases like passing through vertices require careful algorithmic handling."
    ],
    "furtherReading": [
      {
        "title": "Point in Polygon Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Point_in_polygon"
      }
    ]
  },
  "seen-filtering-bloom-vs-exact-sets": {
    "title": "Seen filtering: Bloom vs exact sets",
    "video": {
      "youtubeId": "a6TCF1BUovU",
      "title": "What is a Bloom Filter?  | System Design",
      "channel": "Anand Pandey"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Filtering 'Seen' Items in Recommendations</h2>\n      <p>In feed and recommendation systems (like Tinder, TikTok, or Twitter), a critical requirement is ensuring users don't repeatedly see the same items. We need an efficient way to filter out items a user has already \"seen.\"</p>\n      \n      <h3>Exact Sets (HashSets / Redis Sets)</h3>\n      <p>The straightforward approach is to maintain an exact set of seen item IDs for every user. In Redis, you would use a Set (<code>SADD user:123:seen item:456</code>). Before showing an item, you check <code>SISMEMBER</code>.</p>\n      <p><strong>Pros:</strong> 100% accurate. No false positives or false negatives.</p>\n      <p><strong>Cons:</strong> Memory grows linearly. The raw payload for 100,000 eight-byte IDs is about 800 KB, but a Redis Set also pays object, hash-table, allocator, replication, and persistence overhead. Measure the actual representation before comparing it with a Bloom filter.</p>\n      \n      <h3>Bloom Filters</h3>\n      <p>A Bloom Filter is a probabilistic data structure that is incredibly space-efficient. It tells you if an item is definitely not in the set, or possibly in the set.</p>\n      <ul>\n        <li><strong>False Positives:</strong> It might say a user has seen an item when they haven't. In a recommendation system, this just means a valid item gets skipped. This is usually an acceptable product trade-off.</li>\n        <li><strong>False Negatives:</strong> It will never say a user hasn't seen an item if they actually have.</li>\n      </ul>\n      \n      <p>For 100,000 expected items and a 1% target false-positive rate, the optimal bit array is about 958,506 bits, or roughly 120 KB, before implementation metadata. That is much smaller than a typical exact Redis Set, whose entries cost far more than the raw eight-byte ID, but it is not only a few kilobytes. Exceeding planned capacity raises the false-positive rate, so monitor insert count and rotate or rebuild by time window.</p>\n      \n      <h3>Hybrid Approaches</h3>\n      <p>Many systems use a hybrid approach based on time windows. They use an exact set (Redis) for the most recent session or the last 7 days (where accuracy matters most to avoid immediate repetition), and rely on a Bloom filter (or just drop filtering entirely) for historical interactions older than a month, assuming users forget or won't mind seeing very old content again.</p>\n      \n    </div>",
    "keyTakeaways": [
      "Exact sets use too much memory for high-volume historical tracking.",
      "Bloom filters save massive amounts of RAM in exchange for a small false positive rate.",
      "False positives mean skipping valid content, which is often an acceptable trade-off in feeds."
    ],
    "furtherReading": [
      {
        "title": "Bloom Filters Explained",
        "url": "https://llimllib.github.io/bloomfilter-tutorial/"
      }
    ]
  },
  "matching-and-recommendation-algorithms": {
    "title": "Matching and recommendation algorithms",
    "video": {
      "youtubeId": "Eeg1DEeWUjA",
      "title": "Recommender Systems",
      "channel": "CS50"
    },
    "content": "<div class=\"lesson-content\">\n      <h2>Scaling Matching and Recommendations</h2>\n      <p>Recommendation systems drive engagement on platforms like YouTube, Netflix, and Tinder. At a high level, these systems operate in a funnel architecture: from millions of possible candidates down to a ranked list of a dozen items presented to the user.</p>\n      \n      <h3>The Two-Stage Funnel</h3>\n      <ol>\n        <li><strong>Candidate Generation (Retrieval):</strong> The goal is to quickly reduce the corpus from billions to hundreds. Speed is critical. This stage uses lightweight algorithms:\n          <ul>\n            <li>Collaborative Filtering (Matrix Factorization)</li>\n            <li>Two-Tower Deep Learning Models (User embeddings and Item embeddings)</li>\n            <li>Approximate Nearest Neighbor (ANN) search using FAISS to find similar embeddings in vector databases.</li>\n          </ul>\n        </li>\n        <li><strong>Ranking (Scoring):</strong> The goal is precision. The system takes the hundreds of candidates and scores them using a heavy, complex machine learning model (e.g., Deep Neural Networks, XGBoost). This model incorporates dense features (time of day, context, detailed user history) to predict the probability of engagement (click, watch, swipe right).</li>\n      </ol>\n      \n      <h3>Geospatial Matching (The Tinder Model)</h3>\n      <p>For apps like Tinder or Uber, recommendations are heavily constrained by geography. The candidate generation phase is primarily a geospatial query (using Geohash or S2) combined with filters (age, gender, vehicle type). Only users within the active Geohash cells are pulled into the ranking phase. Elo rating systems or machine learning models then rank the nearby candidates based on historical swipe likelihoods.</p>\n      \n      <h3>Infrastructure</h3>\n      <p>Candidate generation and ranking must use features available at serving time. Training on a future conversion, post-match outcome, or a feature computed after the recommendation creates leakage and an offline score that production cannot reproduce. Version model, embedding, feature schema, and ANN index together; during rollout, log which versions produced each result.</p>\n      <p><strong>Failure and tradeoff:</strong> if the feature store is unavailable, choose a bounded fallback such as popular eligible items rather than silently treating missing features as zero. Fresh streaming features improve responsiveness but add ordering and training/serving-skew risk; slower batch features are easier to reproduce. Evaluate retrieval recall and ranking quality offline, then validate engagement, diversity, safety, and long-term feedback effects online. Reserve some exploration so the existing ranker does not permanently hide new items.</p>\n      \n    </div>",
    "keyTakeaways": [
      "Recommendations use a funnel: Candidate Generation (fast/light) followed by Ranking (slow/heavy).",
      "Vector embeddings and Approximate Nearest Neighbor (ANN) are standard for modern retrieval.",
      "Geospatial apps filter heavily by location before applying complex ranking models."
    ],
    "furtherReading": [
      {
        "title": "Google Developers Course on Recommendation Systems",
        "url": "https://developers.google.com/machine-learning/recommendation"
      }
    ]
  }
};
