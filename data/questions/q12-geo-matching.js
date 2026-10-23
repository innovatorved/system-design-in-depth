window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["nearby-geospatial-search-system-design"] = [
  {
    "id": "nearby-geospatial-search-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Candidates are not answers",
    "section": "Understanding Nearby Geospatial Search",
    "prompt": "A courier search for \"within 3 km\" fetches candidates from the spatial index cells covering the circle. One courier sits inside a covered cell, 2.1 km away, but last reported location five minutes ago. According to the lesson, what should happen to that courier?",
    "options": [
      "Return it, because the index already proved it lies inside the covering",
      "Return it ranked last, because distance is the only hard filter after the index",
      "Drop it only if its cell is a neighbour cell rather than the centre cell",
      "Drop it in the exact filter step, because a stale location fails the freshness cutoff"
    ],
    "answer": 3,
    "explanation": "The index only generates a bounded candidate set; the exact step then filters by geodesic distance, availability, permissions and a freshness cutoff, so geometric closeness does not make a stale courier eligible. Treating the covering as proof is the classic mistake, since cells over-cover the circle and say nothing about freshness.",
    "tags": [
      "nearby-geospatial-search-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "nearby-geospatial-search-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Covering size and hit rate",
    "section": "Worked example: sizing a covering",
    "prompt": "Using the lesson's San Francisco example (2 km radius, precision 5 covering about 171 square km with 9 cells, precision 6 covering about 29 square km with 48 cells), suppose density is 200 places per square km. Roughly how many candidates does each covering return, and how many are real hits?",
    "options": [
      "Precision 5 about 3,400 and precision 6 about 580, with about 250 real hits",
      "Precision 5 about 34,000 and precision 6 about 5,800, with about 2,500 real hits",
      "Precision 5 about 34,000 and precision 6 about 5,800, with all 5,800 at precision 6 being real hits",
      "Both about 2,500, because the covering choice does not change the candidate count"
    ],
    "answer": 1,
    "explanation": "171 x 200 is about 34,000 and 29 x 200 about 5,800, while the circle is only 12.6 square km, so about 2,500 places are truly within 2 km either way. Assuming every precision 6 candidate is a hit is tempting because the cells are small, but the covering still over-covers the circle, so the exact distance check is always needed.",
    "tags": [
      "nearby-geospatial-search-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "nearby-geospatial-search-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Do you need to geo-shard?",
    "section": "Scaling the read path",
    "prompt": "A team plans to shard a 150 million POI proximity index across 20 regional shards from day one. POIs change rarely and each index entry is about 50 bytes. What does the lesson's reasoning suggest instead?",
    "options": [
      "Keep the whole index, about 7.5 GB, in memory on stateless replicas updated from a change stream, and shard only if it outgrows a node",
      "Shard by region anyway, because boundary queries between regions are cheaper than replicating a full index",
      "Store the index only in PostGIS and scale with read replicas, since in-memory indexes cannot be rebuilt",
      "Shard by POI ID hash so each shard is balanced, and scatter-gather every proximity query"
    ],
    "answer": 0,
    "explanation": "150M x 50 bytes is about 7.5 GB, which fits in memory, so read-heavy traffic scales by adding stateless replicas; regional partitioning brings boundary queries, hot-city imbalance and handoff work. Sharding by ID hash is worse still, because every nearby query would have to touch every shard.",
    "tags": [
      "nearby-geospatial-search-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "nearby-geospatial-search-system-design-n1",
    "topic": "nearby-geospatial-search-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Driver Location Ping Write Throughput",
    "scenario": "A ride-hailing platform has 2,000,000 concurrently active drivers on the road globally. Every active driver's app transmits a GPS coordinate ping once every 4 seconds.",
    "prompt": "What is the sustained global location update write rate in thousands of requests per second (k req/s)?",
    "question": "What is the sustained global location update write rate in thousands of requests per second (k req/s)?",
    "unit": "k req/s",
    "answer": 500,
    "tolerance": 0.25,
    "hint": "Divide 2,000,000 active drivers by 4 seconds per ping, and express in thousands (k req/s).",
    "explanation": "2,000,000 drivers ÷ 4 seconds = 500,000 location pings/sec = 500 k req/s of continuous mutable coordinate writes—far too high for unsharded disk-backed B+Tree updates.",
    "tags": [
      "nearby-geospatial-search-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "nearby-geospatial-search-system-design-t1",
    "topic": "nearby-geospatial-search-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Ephemeral In-Memory Spatial Index vs Durable SQL Row Updates for Live GPS Pings",
    "scenario": "Your location ingestion service receives 500,000 GPS pings/sec from active drivers and must serverider nearby-driver queries (`radius <= 3 km`) within 15 ms p99.",
    "prompt": "How should live driver coordinates be stored and indexed vs historical trip traces, and why?",
    "question": "How should live driver coordinates be stored and indexed vs historical trip traces, and why?",
    "options": [
      "Execute synchronous `UPDATE drivers SET lat=?, lng=?` + R-Tree re-indexing in PostgreSQL on all 500,000 pings/sec",
      "Maintain live driver positions in a city-sharded in-memory spatial index (H3/S2/Geohash cells in RAM/Redis) for sub-10ms matching, while asynchronously batching pings to an append-only stream (Kafka → columnar/object store) for trip history",
      "Have rider apps broadcast Bluetooth beacons to discover drivers within 3 km"
    ],
    "correctOption": 1,
    "reasons": [
      "Synchronous disk B+Tree/R-Tree page splits handle 500,000 random updates/sec on a single database effortlessly",
      "A 4-second-old GPS coordinate is ephemeral state; decoupling the in-memory H3/Geohash matching hot path from batched async archival avoids random disk write amplification",
      "Bluetooth Low Energy has a 3 km urban non-line-of-sight range"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Separate the mutable ephemeral 'current location' hot path from the immutable 'historical breadcrumb' log.",
    "explanation": "Current driver location is overwritten every 4 seconds. Holding the latest coordinate in an in-memory city-sharded H3/Geohash index serves K-ring lookups in <5 ms, while async streaming batches historical breadcrumbs to cold storage.",
    "tags": [
      "nearby-geospatial-search-system-design",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["geohash-prefix-spatial-index"] = [
  {
    "id": "geohash-prefix-spatial-index-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Prefix is not proximity",
    "section": "Deep Dive into Geohashes",
    "prompt": "Two cafes are 15 metres apart but sit on opposite sides of a geohash cell border. Which statement about their geohashes is correct?",
    "options": [
      "They must share at least the first five characters, because they are within one precision 5 cell width",
      "They share a prefix whose length is fixed by their distance, so a prefix query always finds both",
      "They may share very little prefix, so prefix lookup alone can miss one; neighbour cells are needed",
      "Their geohashes differ only in the last character, because adjacent cells always have adjacent codes"
    ],
    "answer": 2,
    "explanation": "A shared prefix means the same rectangular cell, but nearby points across a border can have very different codes, which is why a covering includes neighbour cells and then filters exactly. The fixed-prefix idea is the tempting misconception; near the equator or prime meridian even the first character can differ.",
    "tags": [
      "geohash-prefix-spatial-index",
      "recall",
      "inline"
    ]
  },
  {
    "id": "geohash-prefix-spatial-index-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Encoding the first character",
    "section": "Worked example: encoding San Francisco",
    "prompt": "Apply the lesson's encoding steps to Sydney (latitude -33.87, longitude 151.21): alternate bits starting with longitude, halving the range each time. What are the first five bits and the resulting first geohash character (base32 alphabet 0123456789bcdefghjkmnpqrstuvwxyz)?",
    "options": [
      "01001, giving 9",
      "10110, giving q",
      "11101, giving x",
      "10111, giving r"
    ],
    "answer": 3,
    "explanation": "Longitude 151 is at or above 0 (1), latitude -33.9 is below 0 (0), longitude is at or above 90 (1), latitude is at or above -45 (1), longitude is at or above 135 (1): 10111 = 23, which is r in the geohash alphabet. The 10110 option gets the last longitude step wrong; 151.21 is above the midpoint 135 of the range 90 to 180.",
    "tags": [
      "geohash-prefix-spatial-index",
      "apply",
      "inline"
    ]
  },
  {
    "id": "geohash-prefix-spatial-index-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Covering at high latitude",
    "section": "Choosing a covering",
    "prompt": "You need a 3 km radius search in Oslo (about 60 degrees north) and want center plus 8 neighbours to be guaranteed to cover the circle. Using the lesson's precision table, which choice is correct?",
    "options": [
      "Precision 6 with 9 cells, because smaller cells reduce false candidates",
      "Precision 5 with 9 cells, because a 4.89 km cell exceeds the 3 km radius",
      "Precision 4 with 9 cells, or precision 5 with every cell intersecting the bounding box, since precision 5 is only about 2.4 km wide here",
      "Precision 7 with 9 cells, because driver matching uses 153 m cells"
    ],
    "answer": 2,
    "explanation": "Cell width shrinks with the cosine of latitude, so at 60 degrees a precision 5 cell is about 2.4 km wide, less than the 3 km radius, and 9 cells are no longer guaranteed; drop to precision 4 or compute the full covering. Precision 5 looks correct if you read the equatorial table without adjusting for latitude, which is exactly the trap.",
    "tags": [
      "geohash-prefix-spatial-index",
      "staff",
      "inline"
    ]
  },
  {
    "id": "geohash-prefix-spatial-index-n1",
    "topic": "geohash-prefix-spatial-index",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Geohash 9-Cell Covering Candidate Fetch Size",
    "scenario": "To guarantee full coverage of a 1.5 km search circle without edge blind spots, your query fetches points from the center precision-5 Geohash cell plus its 8 immediate neighbors (9 cells total). In a dense city district, each precision-5 cell (~24 km²) contains an average of 400 restaurants.",
    "prompt": "How many total candidate restaurants are fetched across the 9 Geohash cells before exact Haversine distance filtering?",
    "question": "How many total candidate restaurants are fetched across the 9 Geohash cells before exact Haversine distance filtering?",
    "unit": "candidates",
    "answer": 3600,
    "tolerance": 0.2,
    "hint": "Multiply 9 cells by 400 restaurants per cell.",
    "explanation": "Fetching the center cell plus 8 neighbor cells inspects 9 cells × 400 restaurants/cell = 3,600 candidate points, which are then filtered in memory by exact geodesic distance in under a millisecond.",
    "tags": [
      "geohash-prefix-spatial-index",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "geohash-prefix-spatial-index-t1",
    "topic": "geohash-prefix-spatial-index",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Single-Prefix Geohash Query vs Multi-Cell Covering + Exact Distance Filter",
    "scenario": "A food-delivery app stores restaurant locations in a B-Tree indexed by a 6-character Geohash string and needs to return all restaurants within 1 km of a user.",
    "prompt": "Which query strategy should you choose, and what is the primary justification?",
    "question": "Which query strategy should you choose, and what is the primary justification?",
    "options": [
      "Run a single `WHERE geohash LIKE '9q8yyk%'` prefix query and return all matching rows directly",
      "Compute the 9-cell (or bounding-box intersecting) Geohash prefixes covering the 1 km circle, issue a union/IN range scan, and post-filter candidates by exact Haversine/Euclidean distance",
      "Scan the entire table computing exact `acos/sin/cos` spherical trigonometry on all 10 million rows per request"
    ],
    "correctOption": 1,
    "reasons": [
      "Points that are 10 meters apart always share the exact same 6-character Geohash prefix",
      "Z-order curve boundaries can assign completely different prefixes to points meters apart, and rectangular cells over-cover circles at the corners, requiring neighbor-cell covering plus exact distance filtering",
      "Full-table trigonometric scans scale to 50,000 QPS with sub-10ms latency"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Consider what happens when a user stands 5 meters from a Geohash cell edge or near the prime meridian/equator.",
    "explanation": "A single Geohash prefix lookup suffers from boundary cliff effects where a restaurant across the street sits in a neighbor cell with a different prefix. Querying all cells intersecting the search circle eliminates false negatives, and exact distance post-filtering removes false positives from cell corners.",
    "tags": [
      "geohash-prefix-spatial-index",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["geospatial-grid-systems-h3-s2-geohash"] = [
  {
    "id": "geospatial-grid-systems-h3-s2-geohash-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why hexagons for ride-sharing",
    "section": "Comparing Geospatial Grid Systems",
    "prompt": "Uber's H3 is favoured for continuous neighbour traversal such as spreading demand to nearby cells. Which property of its cells is the main reason?",
    "options": [
      "Each hexagon has six neighbours that all share an edge and sit at one distance",
      "Cell IDs are ordered along a Hilbert curve, so neighbours have adjacent integer IDs",
      "Each child hexagon nests exactly inside its parent, so rollups are exact",
      "Cell areas are identical everywhere on Earth, so radius checks become unnecessary"
    ],
    "answer": 0,
    "explanation": "Hexagons give six edge-sharing neighbours at a single distance, unlike rectangles whose diagonal neighbours are farther away, which makes k-ring spreading smooth. The Hilbert curve ordering belongs to S2; H3 IDs are hierarchical but not a locality-preserving range.",
    "tags": [
      "geospatial-grid-systems-h3-s2-geohash",
      "recall",
      "inline"
    ]
  },
  {
    "id": "geospatial-grid-systems-h3-s2-geohash-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Picking a surge resolution",
    "section": "Worked example: picking a resolution",
    "prompt": "A surge-pricing team wants zones of about 5 square km across an 800 square km city. Using the lesson's H3 averages, which resolution fits and roughly how many cells cover the city?",
    "options": [
      "Resolution 8, about 1,100 cells",
      "Resolution 7, about 150 cells",
      "Resolution 9, about 7,300 cells",
      "Resolution 6, about 20 cells"
    ],
    "answer": 1,
    "explanation": "Resolution 7 hexagons average about 5.2 square km, so 800 / 5.2 is about 154 cells. Resolution 8 is the tempting pick from the lesson's own city example, but its 0.74 square km cells are about seven times smaller than the requested zone.",
    "tags": [
      "geospatial-grid-systems-h3-s2-geohash",
      "apply",
      "inline"
    ]
  },
  {
    "id": "geospatial-grid-systems-h3-s2-geohash-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Exact rollups by parent",
    "section": "Comparison",
    "prompt": "Finance wants billing totals per parent zone that exactly equal the sum of trips recorded at a finer resolution. The analytics team indexes trips by H3 resolution 9 and rolls up to parents. What problem should you raise?",
    "options": [
      "H3 has no parent cells, so rollups require re-indexing each trip at the coarser resolution",
      "H3 IDs are strings, so aggregation by prefix is too slow for billing workloads",
      "H3 parents nest approximately, so child cells do not exactly tile the parent and edge trips can be misassigned; S2 or geohash nest exactly",
      "H3 pentagons make every rollup inaccurate, so results must be corrected by a factor of five-sixths"
    ],
    "answer": 2,
    "explanation": "The comparison table lists H3 hierarchy as approximate nesting with 7 children, so parent totals from child cells are approximate at the edges, while S2 and geohash nest exactly. H3 does have parents; the issue is that seven children only approximately cover their parent.",
    "tags": [
      "geospatial-grid-systems-h3-s2-geohash",
      "staff",
      "inline"
    ]
  },
  {
    "id": "geospatial-grid-systems-h3-s2-geohash-n1",
    "topic": "geospatial-grid-systems-h3-s2-geohash",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: H3 Hexagonal K-Ring Neighbor Cell Count",
    "scenario": "To find all drivers within ~1.5 km of a rider without boundary blind spots, your matching service queries the rider's H3 hexagon cell plus its immediate `k = 1` ring of adjacent hexagons (`kRing(origin, 1)`), and for wider searches its `k = 2` ring (`1 + 6×1 + 6×2`).",
    "prompt": "How many total H3 hexagonal cells are queried in a `k = 2` ring (`1 + 6 + 12`)?",
    "question": "How many total H3 hexagonal cells are queried in a `k = 2` ring (`1 + 6 + 12`)?",
    "unit": "cells",
    "answer": 19,
    "tolerance": 0.25,
    "hint": "Ring 0 = 1 center cell; Ring 1 = 6 neighbor cells; Ring 2 = 12 outer cells. Sum: 1 + 6 + 12.",
    "explanation": "A hexagonal grid has `3k(k + 1) + 1` cells within distance `k`. For `k = 1`, that is `1 + 6 = 7` cells; for `k = 2`, that is `1 + 6 + 12 = 19` cells, all with uniform center-to-center neighbor distances.",
    "tags": [
      "geospatial-grid-systems-h3-s2-geohash",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "geospatial-grid-systems-h3-s2-geohash-t1",
    "topic": "geospatial-grid-systems-h3-s2-geohash",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Uber H3 Hexagons vs Rectangular Geohash for Surge Pricing & Smoothing",
    "scenario": "You are building a real-time dynamic surge pricing engine that computes supply-to-demand ratios per spatial cell and smooths surge multipliers across neighboring cells via convolution.",
    "prompt": "Why did Uber choose H3 hexagonal cells over rectangular Geohash / S2 squares for surge smoothing, and what trade-off do hexagons introduce?",
    "question": "Why did Uber choose H3 hexagonal cells over rectangular Geohash / S2 squares for surge smoothing, and what trade-off do hexagons introduce?",
    "options": [
      "Hexagons subdivide into 4 exact child hexagons with zero boundary distortion",
      "Every neighbor of a hexagon shares an edge and has an identical center-to-center distance (6 equidistant neighbors), eliminating the corner-vs-edge distance bias of squares at the cost of approximate (1-to-7) hierarchical parent-child containment",
      "Geohash rectangles have identical area at the equator and at 75° latitude"
    ],
    "correctOption": 1,
    "reasons": [
      "A regular hexagon can be tiled cleanly into smaller congruent hexagons without overhanging edges",
      "Squares have 4 edge neighbors (distance 1) and 4 diagonal corner neighbors (distance √2 ≈ 1.414), whereas hexagons have 6 equidistant neighbors ideal for isotropic radial smoothing, trading off exact hierarchical containment",
      "Mercator/lat-lng Geohash boxes never distort cell width near the poles"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Compare neighbor distances in a square grid (edge = 1, diagonal = √2) vs a hexagonal grid (all 6 neighbors = 1).",
    "explanation": "In a square grid, diagonal neighbors are 41% farther away than edge neighbors, biasing radial gradients and surge smoothing. Hexagons have 6 equidistant neighbors, making radial k-ring expansion and spatial smoothing isotropic, at the cost of approximate 7-child subdivision.",
    "tags": [
      "geospatial-grid-systems-h3-s2-geohash",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["redis-geo-spatial-hot-path"] = [
  {
    "id": "redis-geo-spatial-hot-path-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "No per-member expiry",
    "section": "Leveraging Redis for Fast Geospatial Queries",
    "prompt": "A driver's app crashes and stops sending locations. Why can you not simply set a TTL on that driver in the Redis GEO index?",
    "options": [
      "GEO members are geohash scores, and Redis forbids TTLs on any numeric value",
      "TTLs work per member, but they are not replicated to read replicas",
      "GEOADD resets any TTL on every write, so the TTL would never fire for active drivers",
      "A TTL applies to the whole GEO sorted set key, not to a single member"
    ],
    "answer": 3,
    "explanation": "Redis expiry is per key, and a GEO index is one sorted set, so stale members must be removed explicitly using separate freshness tracking. The option about GEOADD resetting TTLs sounds technical but misses the point: there is no member-level TTL to reset in the first place.",
    "tags": [
      "redis-geo-spatial-hot-path",
      "recall",
      "inline"
    ]
  },
  {
    "id": "redis-geo-spatial-hot-path-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Where the load really is",
    "section": "Worked example: one million active drivers",
    "prompt": "Scale the lesson's example to 2 million active drivers reporting every 5 seconds, with the largest city holding 80,000 of them. Which estimate and conclusion are right?",
    "options": [
      "About 400,000 writes per second globally and 16,000 on the city key; memory is about 200 MB, so write rate and the hot key matter most",
      "About 400,000 writes per second globally; memory is about 20 GB, so RAM is the main constraint",
      "About 40,000 writes per second globally and 1,600 on the city key, so no sharding is needed",
      "About 400,000 writes per second globally and 16,000 on the city key; memory is about 2 GB per shard, so RAM limits the city key"
    ],
    "answer": 0,
    "explanation": "2M / 5 s = 400,000 writes per second and 80,000 / 5 = 16,000 on the city key; at roughly 60 to 100 bytes per entry, 2M drivers is on the order of 200 MB. As in the lesson, memory is not the bottleneck; write rate and hot keys are, so the RAM-focused options misread the numbers.",
    "tags": [
      "redis-geo-spatial-hot-path",
      "apply",
      "inline"
    ]
  },
  {
    "id": "redis-geo-spatial-hot-path-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Why queries recheck freshness",
    "section": "Freshness without per-member TTL",
    "prompt": "You run the lesson's design: a GEO key plus a last-seen sorted set per city, and a Lua sweeper every few seconds that removes drivers silent for 30 seconds. Why must each rider query still check last-seen on its results?",
    "options": [
      "Because the Lua script is not atomic, so it may remove a driver from one key but not the other",
      "Because GEOSEARCH returns results in random order, so freshness is needed to sort them",
      "Because the sweep can lag or stall, so stale drivers may still be in the GEO key when a query runs",
      "Because last-seen scores are stored in seconds while GEO scores are geohashes, so they drift apart"
    ],
    "answer": 2,
    "explanation": "The sweeper is periodic and can fall behind, so the query itself must reject candidates older than its freshness limit rather than trusting the index to be clean. The lesson's script removes members from both keys atomically, so the non-atomic option describes a problem the design already avoids.",
    "tags": [
      "redis-geo-spatial-hot-path",
      "staff",
      "inline"
    ]
  },
  {
    "id": "redis-geo-spatial-hot-path-n1",
    "topic": "redis-geo-spatial-hot-path",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: City-Sharded Redis GEO Write QPS",
    "scenario": "A major metro area has 60,000 active couriers online during dinner peak, each reporting their GPS location every 3 seconds. Each update executes a pipelined `GEOADD` + `ZADD` (for freshness tracking) on that city's Redis shard.",
    "prompt": "How many location update batches per second reach that city's Redis primary?",
    "question": "How many location update batches per second reach that city's Redis primary?",
    "unit": "req/s",
    "answer": 20000,
    "tolerance": 0.2,
    "hint": "Divide 60,000 active couriers by the 3-second reporting interval.",
    "explanation": "60,000 couriers ÷ 3 seconds = 20,000 update batches/sec (40,000 Redis sorted-set operations/sec), well within the ~100k ops/sec capacity of a single city-dedicated Redis instance.",
    "tags": [
      "redis-geo-spatial-hot-path",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "redis-geo-spatial-hot-path-t1",
    "topic": "redis-geo-spatial-hot-path",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Handling Stale Members in Redis GEO Sorted Sets",
    "scenario": "Redis `GEOADD` stores all drivers in a city inside a single Sorted Set (`ZSET`), which only supports key-level TTLs rather than per-member TTLs. When driver apps lose cellular connectivity, their stale positions remain in the `GEO` index indefinitely.",
    "prompt": "Which architectural approach should you choose, and what is the primary justification?",
    "question": "Which architectural approach should you choose, and what is the primary justification?",
    "options": [
      "Create a separate top-level Redis key per driver with a 30-second TTL and run `KEYS driver:*` to scan all drivers on every rider search",
      "Maintain a companion `last_seen` ZSET (scored by Unix timestamp) alongside the `GEO` ZSET, sweep expired members periodically via a Lua script, and verify `last_seen` freshness on query results",
      "Set a 30-second `EXPIRE` on the entire city's `GEO` key so all 60,000 drivers are wiped every 30 seconds"
    ],
    "correctOption": 1,
    "reasons": [
      "Scanning 60,000 individual keys in Redis takes O(1) time and supports spatial radius queries natively",
      "Pairing the `GEO` ZSET with a timestamp-scored `last_seen` ZSET enables O(log N) background eviction of offline drivers via `ZRANGEBYSCORE` while read-time freshness validation guards against sweeper lag",
      "Wiping the entire city index every 30 seconds guarantees 100% matching availability during the rebuild window"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "How do you combine fast spatial indexing (`GEOSEARCH`) with O(log N) expiration discovery when Redis ZSETs lack member TTLs?",
    "explanation": "Because Redis Sorted Sets do not natively expire individual members, maintaining a parallel `last_seen` ZSET scored by epoch timestamp lets a periodic Lua job atomically prune drivers older than `now - 30s` from both sets, while read-time filtering ensures zero ghost matches even if the sweeper lags.",
    "tags": [
      "redis-geo-spatial-hot-path",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["geofencing-point-in-polygon"] = [
  {
    "id": "geofencing-point-in-polygon-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Flapping at the boundary",
    "section": "Geofencing and the Point-in-Polygon Problem",
    "prompt": "A driver waiting at an airport pickup boundary produces GPS fixes that alternate inside and outside every second. What must the system add so it does not fire a stream of enter and exit events?",
    "options": [
      "A finer spatial index, so the exact point-in-polygon test is more precise at the edge",
      "Persisted per-device membership plus hysteresis, consecutive fixes or a dwell interval before a transition",
      "A larger bounding box around the polygon, so the driver stays inside the candidate set",
      "A shorter location reporting interval, so the average position settles on one side"
    ],
    "answer": 1,
    "explanation": "Membership alone does not define an event; you need the last state per device and a rule such as hysteresis or several consecutive fixes before emitting enter or exit. A finer index or a more precise test does not help, because the jitter is in the input positions, not in the geometry.",
    "tags": [
      "geofencing-point-in-polygon",
      "recall",
      "inline"
    ]
  },
  {
    "id": "geofencing-point-in-polygon-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Two-stage filter cost",
    "section": "Worked example: delivery zones",
    "prompt": "You have 20,000 zones averaging 500 vertices and 100,000 location updates per second. An R-tree on bounding boxes leaves about 2 candidate polygons per point. Roughly what exact-test load remains?",
    "options": [
      "About 2 billion exact tests and 1 trillion edge checks per second",
      "About 100,000 exact tests and 50 million edge checks per second",
      "About 200,000 exact tests and 10 billion edge checks per second",
      "About 200,000 exact tests and 100 million edge checks per second"
    ],
    "answer": 3,
    "explanation": "100,000 points x 2 candidates = 200,000 exact tests, each O(V) with 500 edges, about 100 million edge checks per second, which a handful of cores can handle. The 2 billion figure is the naive every-point-against-every-polygon load that the bounding-box stage exists to eliminate.",
    "tags": [
      "geofencing-point-in-polygon",
      "apply",
      "inline"
    ]
  },
  {
    "id": "geofencing-point-in-polygon-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Replay without duplicates",
    "section": "Event pipeline",
    "prompt": "A geofence worker crashes and replays the last minute of location fixes on restart. Customers must not receive a second \"your courier has arrived\" notification. What does the lesson's pipeline rely on?",
    "options": [
      "Event IDs derived from device, polygon, polygon version and transition sequence, so replays produce the same ID for consumers to deduplicate",
      "A fresh random UUID per emitted event, so consumers can tell the replayed events apart",
      "Skipping replay entirely and resuming from the newest fix, so no transition is evaluated twice",
      "Round-robin partitioning of fixes, so the replay lands on a different worker than the original"
    ],
    "answer": 0,
    "explanation": "A deterministic event ID means a replayed transition yields the same ID, so consumers drop the duplicate. Random UUIDs are the tempting wrong choice: every replay would look like a brand new event, which is exactly what causes duplicate notifications.",
    "tags": [
      "geofencing-point-in-polygon",
      "staff",
      "inline"
    ]
  },
  {
    "id": "geofencing-point-in-polygon-n1",
    "topic": "geofencing-point-in-polygon",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Two-Stage Bounding-Box R-Tree Speedup Factor",
    "scenario": "A logistics platform tracks 50,000 delivery zones, each modeled as a 200-vertex polygon. Without spatial indexing, every GPS fix checks all 50,000 polygons (`10,000,000` edge checks). With an in-memory R-Tree of bounding boxes, each GPS fix narrows down to an average of 2.5 candidate polygons (`500` edge checks).",
    "prompt": "By what factor (`50,000 ÷ 2.5`) does the R-Tree bounding-box filter reduce the number of exact polygon edge checks per GPS fix?",
    "question": "By what factor (`50,000 ÷ 2.5`) does the R-Tree bounding-box filter reduce the number of exact polygon edge checks per GPS fix?",
    "unit": "x",
    "answer": 20000,
    "tolerance": 0.2,
    "hint": "Divide 50,000 total polygons by 2.5 candidate polygons after bounding-box pruning.",
    "explanation": "Pruning 50,000 polygons down to 2.5 bounding-box hits reduces expensive O(V) vertex ray-casting checks by 50,000 ÷ 2.5 = 20,000x (from 10 million edge checks per ping to just 500).",
    "tags": [
      "geofencing-point-in-polygon",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "geofencing-point-in-polygon-t1",
    "topic": "geofencing-point-in-polygon",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Stateless Per-Ping Polygon Checks vs Stateful Hysteresis for Geofence Transitions",
    "scenario": "Scooter riders parked near the boundary of a 'no-parking' geofence experience ±12 meter urban-canyon GPS drift, causing raw point-in-polygon checks to flip between inside and outside every 3 seconds and triggering dozens of false penalty notifications.",
    "prompt": "Which architectural approach should you choose, and what is the primary justification?",
    "question": "Which architectural approach should you choose, and what is the primary justification?",
    "options": [
      "Emit an enter or exit webhook immediately whenever a single GPS ping's ray-casting result differs from the previous ping",
      "Partition the GPS stream by `device_id` into stateful stream workers that enforce spatial hysteresis (separate inner/outer buffer thresholds) and require N consecutive fixes or a minimum dwell window before emitting a deterministic transition event",
      "Round all GPS coordinates to 2 decimal places (~1.1 km resolution) so small movements never register"
    ],
    "correctOption": 1,
    "reasons": [
      "Raw urban GPS coordinates have sub-millimeter accuracy and never jitter across polygon edges",
      "Stateful per-device hysteresis and dwell-time debouncing absorb GPS multi-path noise at polygon boundaries without sacrificing spatial precision",
      "Rounding coordinates to 1.1 km grids accurately enforces 50-meter scooter parking corrals"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Think about how a thermostat prevents rapid on/off cycling at the target temperature.",
    "explanation": "Geofence enter/exit detection is inherently stateful. Routing pings by `device_id` to stateful workers that require both a spatial buffer margin (hysteresis) and temporal confirmation (e.g., 3 consecutive fixes or 15s dwell time) eliminates boundary flapping from GPS multipath noise.",
    "tags": [
      "geofencing-point-in-polygon",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["ray-casting-point-in-polygon"] = [
  {
    "id": "ray-casting-point-in-polygon-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why the half-open rule",
    "section": "The Ray Casting Algorithm",
    "prompt": "In ray casting, what problem does the half-open endpoint rule (count an edge only if exactly one endpoint is strictly above the ray) solve?",
    "options": [
      "It prevents a ray passing exactly through a vertex from counting two crossings",
      "It decides whether a point lying on an edge counts as inside or outside",
      "It makes the test run in O(log V) instead of O(V) for polygons with many edges",
      "It corrects for longitude wrapping when a polygon crosses the antimeridian"
    ],
    "answer": 0,
    "explanation": "A ray through a vertex touches two edges, and the half-open rule ensures that vertex contributes once, which also skips horizontal edges. Boundary policy is separate: the lesson says to detect on-edge points explicitly before odd/even counting, not to rely on the vertex rule.",
    "tags": [
      "ray-casting-point-in-polygon",
      "recall",
      "inline"
    ]
  },
  {
    "id": "ray-casting-point-in-polygon-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Ray through a vertex",
    "section": "Worked example",
    "prompt": "Triangle vertices are (0,0), (6,3) and (0,6). Test point (2,3) with a ray toward +x, using the lesson's standard loop. How many crossings are counted, and what is the verdict?",
    "options": [
      "0 crossings, so outside",
      "2 crossings, so outside",
      "1 crossing, so inside",
      "3 crossings, so inside"
    ],
    "answer": 2,
    "explanation": "Edge (0,0)-(6,3) is skipped since neither endpoint is strictly above y = 3; edge (6,3)-(0,6) counts and crosses at x = 6, right of the point; edge (0,6)-(0,0) crosses at x = 0, left of the point, so it does not count. That leaves 1 crossing, inside; counting both edges at vertex (6,3) would give 2 and the wrong answer.",
    "tags": [
      "ray-casting-point-in-polygon",
      "apply",
      "inline"
    ]
  },
  {
    "id": "ray-casting-point-in-polygon-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Star-shaped zone mismatch",
    "section": "Crossing number versus winding number",
    "prompt": "An ops user draws a delivery zone as a self-intersecting five-pointed star. Your service uses crossing-number ray casting, while the admin map renders polygons with the SVG default fill rule. A courier in the star's centre is \"outside\" per the service but shown as inside on the map. Why?",
    "options": [
      "Floating-point error near the centre flips the parity, so the service needs robust predicates",
      "The ray passes through a vertex of the star, so the half-open rule is miscounting",
      "The map projects coordinates differently, so the point is really outside the drawn shape",
      "Even-odd treats the overlapping centre as a hole while the nonzero rule used by the map fills it"
    ],
    "answer": 3,
    "explanation": "For self-intersecting shapes the two rules disagree: crossing number counts an even number of crossings at the centre and calls it outside, while winding number sees the boundary wrap the point and fills it; SVG's default is nonzero. Floating-point issues only affect points within a tiny tolerance of an edge, not the middle of a region.",
    "tags": [
      "ray-casting-point-in-polygon",
      "staff",
      "inline"
    ]
  },
  {
    "id": "ray-casting-point-in-polygon-n1",
    "topic": "ray-casting-point-in-polygon",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Polygon Decomposition Speedup for High-Vertex Delivery Zones",
    "scenario": "A coastal city's delivery zone polygon has 4,000 vertices. A raw ray-casting check inspects all 4,000 edges per GPS ping. By pre-tiling the polygon into fine grid cells (interior cells, exterior cells, and boundary cells each clipped to an average of 16 edges), 90% of pings hit interior/exterior cells (0 edge checks) and 10% hit boundary cells (16 edge checks).",
    "prompt": "What is the average number of edge checks per GPS ping (`0.9 × 0 + 0.1 × 16`) with pre-tiled boundary clipping?",
    "question": "What is the average number of edge checks per GPS ping (`0.9 × 0 + 0.1 × 16`) with pre-tiled boundary clipping?",
    "unit": "edge checks",
    "answer": 1.6,
    "tolerance": 0.2,
    "hint": "90% of queries do 0 edge checks and 10% do 16 edge checks: 0.10 × 16.",
    "explanation": "Pre-classifying interior and exterior grid cells answers 90% of queries in O(1) hash lookup (0 edge checks), while the remaining 10% near the border test against a clipped 16-edge fragment—averaging `0.1 × 16 = 1.6` edge checks instead of 4,000 (a 2,500x speedup).",
    "tags": [
      "ray-casting-point-in-polygon",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "ray-casting-point-in-polygon-t1",
    "topic": "ray-casting-point-in-polygon",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Raw O(V) Ray Casting vs Pre-Tiled Interior/Boundary Cell Indexing",
    "scenario": "Your compliance engine evaluates 250,000 GPS pings/sec against country and state borders represented by complex 50,000-vertex polygons that change only once a quarter.",
    "prompt": "Which architectural approach should you choose, and what is the primary justification?",
    "question": "Which architectural approach should you choose, and what is the primary justification?",
    "options": [
      "Run full 50,000-edge ray casting from scratch on every GPS ping",
      "Pre-compute a spatial grid (H3/S2/quadtree) classifying cells as `FULLY_INSIDE`, `FULLY_OUTSIDE`, or `BOUNDARY` (storing only the clipped polygon edges intersecting each boundary cell), trading a modest offline build step for O(1) runtime lookups on >95% of pings",
      "Approximate every country and state as a single circle centered on its capital city"
    ],
    "correctOption": 1,
    "reasons": [
      "Iterating 50,000 floating-point divisions 250,000 times per second uses negligible CPU",
      "Static high-vertex polygons amortize offline grid rasterization and edge-clipping across billions of runtime lookups, turning most O(V) ray casts into a single O(1) cell lookup",
      "Circular country borders satisfy legal tax and regulatory compliance boundaries"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "If 95% of points fall deep inside a polygon's interior, why test 50,000 border edges on every query?",
    "explanation": "When polygons are static or rarely updated, pre-indexing cells into `FULLY_INSIDE`, `FULLY_OUTSIDE`, and clipped `BOUNDARY` edge lists eliminates ray casting entirely for interior/exterior points and reduces boundary ray casts to a handful of local edges.",
    "tags": [
      "ray-casting-point-in-polygon",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["seen-filtering-bloom-vs-exact-sets"] = [
  {
    "id": "seen-filtering-bloom-vs-exact-sets-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Which error Bloom makes",
    "section": "Filtering 'Seen' Items in Recommendations",
    "prompt": "A feed checks a Bloom filter of seen item IDs before showing each candidate. What is the only kind of mistake the filter can make, and what does the user experience?",
    "options": [
      "A false negative: an already seen item is reported unseen and shown again",
      "A false positive: an unseen item is reported seen and silently skipped",
      "Both kinds equally often, so the feed sometimes repeats and sometimes skips items",
      "A deletion error: removed items reappear once the filter is rebuilt"
    ],
    "answer": 1,
    "explanation": "Bloom filters say definitely not seen or possibly seen, so the only error is a false positive, which in a feed means a valid item is skipped, usually acceptable. False negatives cannot happen because every inserted item sets all of its bits.",
    "tags": [
      "seen-filtering-bloom-vs-exact-sets",
      "recall",
      "inline"
    ]
  },
  {
    "id": "seen-filtering-bloom-vs-exact-sets-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Overfilled filter",
    "section": "Filtering 'Seen' Items in Recommendations",
    "prompt": "Monthly seen-filters are sized for 15,000 items at 1 percent (about 9.6 bits per item, 7 hashes). A heavy user racks up 45,000 impressions in one month. What happens to that user's filter?",
    "options": [
      "The false-positive rate stays near 1 percent, because the hash count was fixed at sizing time",
      "The filter starts producing false negatives, so seen items reappear in the feed",
      "The false-positive rate climbs to roughly 40 percent, so many fresh items are wrongly skipped",
      "The false-positive rate rises linearly to about 3 percent, which is still acceptable"
    ],
    "answer": 2,
    "explanation": "At three times capacity only about 3.2 bits per item remain, and with 7 hashes the false-positive rate is (1 - e^-2.19)^7, roughly 40 percent, so the error climbs far faster than linearly. That is why the lesson says to monitor insert count and rotate or rebuild; false negatives still cannot occur.",
    "tags": [
      "seen-filtering-bloom-vs-exact-sets",
      "staff",
      "inline"
    ]
  },
  {
    "id": "seen-filtering-bloom-vs-exact-sets-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Sizing a large filter",
    "section": "Sizing formulas and a rotation example",
    "prompt": "Using m = -n ln(p) / (ln 2)^2 and k = (m / n) ln 2, size a Bloom filter for 1,000,000 seen items at a 1 percent false-positive rate. What are the approximate memory and hash count?",
    "options": [
      "About 1.2 MB with 3 hash functions",
      "About 120 KB with 7 hash functions",
      "About 12 MB with 10 hash functions",
      "About 1.2 MB with 7 hash functions"
    ],
    "answer": 3,
    "explanation": "m is about 9.59 bits per item, so 1M items need about 9.6 million bits, roughly 1.2 MB, and k = 9.59 x 0.693 is about 7. The 120 KB option is the lesson's figure for 100,000 items; memory scales linearly with n at a fixed error rate.",
    "tags": [
      "seen-filtering-bloom-vs-exact-sets",
      "apply",
      "inline"
    ]
  },
  {
    "id": "seen-filtering-bloom-vs-exact-sets-n1",
    "topic": "seen-filtering-bloom-vs-exact-sets",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Per-User Seen-Post Bloom Filter Fleet Memory",
    "scenario": "A short-video feed tracks the last 50,000 watched video IDs for each of 20 million Daily Active Users (DAU) so users aren't shown duplicate videos. Using a Bloom filter at 10 bits per item, each user's filter takes `50,000 × 10 bits = 500,000 bits = 62.5 KB ≈ 60 KB` (compared to 400 KB for raw 8-byte IDs).",
    "prompt": "Using 60 KB per active user, how many gigabytes (GB, using 1 GB = 1,000,000 KB) of storage/memory are required across the 20 million DAU?",
    "question": "Using 60 KB per active user, how many gigabytes (GB, using 1 GB = 1,000,000 KB) of storage/memory are required across the 20 million DAU?",
    "unit": "GB",
    "answer": 1200,
    "tolerance": 0.25,
    "hint": "Multiply 20,000,000 users × 60 KB/user and divide by 1,000,000 KB/GB.",
    "explanation": "20,000,000 × 60 KB = 1,200,000,000 KB = 1,200 GB (1.2 TB), compared to 8 TB for raw 64-bit integer arrays—savingnearly 7 TB of cluster memory.",
    "tags": [
      "seen-filtering-bloom-vs-exact-sets",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "seen-filtering-bloom-vs-exact-sets-t1",
    "topic": "seen-filtering-bloom-vs-exact-sets",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Bloom Filter False Positives in Content Feed Seen-Filtering",
    "scenario": "You use a per-user Bloom filter (1% false-positive rate) to filter out previously watched videos from a recommendation candidate pool of 500 videos per feed refresh.",
    "prompt": "Why is a 1% false-positive rate acceptable for feed seen-filtering (unlike financial/security blocklists), and how do you prevent the filter from saturating over years?",
    "question": "Why is a 1% false-positive rate acceptable for feed seen-filtering (unlike financial/security blocklists), and how do you prevent the filter from saturating over years?",
    "options": [
      "A false positive shows the user an already-watched video 1% of the time",
      "A false positive merely skips 1% of unseen candidate videos (harmless when millions of unseen videos exist), and time-bucketed / rotating sliding-window Bloom filters prevent bit saturation as history grows",
      "Bloom filters automatically evict old bits when 100% of bits become 1"
    ],
    "correctOption": 1,
    "reasons": [
      "Bloom filters have false negatives that let watched videos slip through",
      "In seen-filtering, a false positive means 'falsely marked as already seen', which only drops ~5 of 500 candidate recommendations; rotating time-windowed filters (e.g., 30-day buckets) bounds fill ratio",
      "A single fixed-size Bloom filter maintains a 1% false-positive rate even after 100 million insertions"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "In a seen-filter, what does a false positive ('filter says seen when actually unseen') do to the user experience?",
    "explanation": "Bloom filters have zero false negatives (so a watched video is never re-shown). A 1% false positive simply hides 1% of unseen candidate videos—invisible to the user when the catalog has millions of videos. Rotating time-bucketed filters retires old epochs before bit density saturates.",
    "tags": [
      "seen-filtering-bloom-vs-exact-sets",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["matching-and-recommendation-algorithms"] = [
  {
    "id": "matching-and-recommendation-algorithms-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Leakage in training",
    "section": "Scaling Matching and Recommendations",
    "prompt": "A ranking model trained with a \"messages exchanged after match\" feature shows a large offline gain but no improvement in production. What does the lesson identify as the cause?",
    "options": [
      "The feature is computed after the recommendation, so it leaks the label and cannot be reproduced at serving time",
      "The feature is too sparse for a deep model, so it should be moved into candidate generation instead",
      "The ANN index version differs from the model version, so embeddings are misaligned",
      "Offline evaluation measures recall, while production measures precision, so gains never transfer"
    ],
    "answer": 0,
    "explanation": "Features must be available at serving time; an outcome observed after the recommendation leaks the label, producing offline wins production cannot reproduce. Version mismatch is a real risk the lesson mentions, but it would not explain a gain that exists only because of a post-outcome feature.",
    "tags": [
      "matching-and-recommendation-algorithms",
      "recall",
      "inline"
    ]
  },
  {
    "id": "matching-and-recommendation-algorithms-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Fitting a slower ranker",
    "section": "Worked example: a 150 ms budget",
    "prompt": "In the lesson's 150 ms pipeline (retrieval 20 ms, filtering 5 ms, ranking 60 ms for 800 candidates, re-ranking 5 ms), a new ranker needs about 120 ms for 800 candidates, scaling roughly linearly with batch size. What is the most sensible way to keep the p99 budget?",
    "options": [
      "Remove the Bloom filter and exact seen checks to free enough time for the new ranker",
      "Drop the re-ranking stage and exploration slots, which recovers the needed time",
      "Pass about 400 candidates to the new ranker, bringing ranking near 60 ms",
      "Replace ANN with exact nearest neighbour search so fewer candidates need ranking"
    ],
    "answer": 2,
    "explanation": "Filtering and re-ranking together take only 10 ms, so dropping them cannot absorb a 60 ms overrun; halving the ranked set restores ranking to about 60 ms and keeps the remaining budget for network hops and feature reads. Exact nearest neighbour search is far slower than ANN and would blow the retrieval budget.",
    "tags": [
      "matching-and-recommendation-algorithms",
      "apply",
      "inline"
    ]
  },
  {
    "id": "matching-and-recommendation-algorithms-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Two-sided attention",
    "section": "Two-sided matching notes",
    "prompt": "A dating app ranks candidates purely by each viewer's predicted chance of liking them. After a month, the top 5 percent of profiles receive most impressions and complain of overload, while most users get few matches. What does the lesson recommend?",
    "options": [
      "Increase exploration slots so the ranker learns faster which profiles are popular",
      "Cap exposure for very popular profiles and rank on mutual-interest likelihood rather than one-sided attractiveness",
      "Reintroduce an Elo-style desirability score so popular profiles are matched only with each other",
      "Shrink the geospatial radius so each popular profile is shown to fewer nearby viewers"
    ],
    "answer": 1,
    "explanation": "Two-sided markets must balance attention, so systems cap exposure and optimise for mutual interest instead of one-sided appeal. The Elo option is tempting because it sounds like balancing, but the lesson notes Tinder moved away from Elo-style desirability toward models of mutual activity and preferences.",
    "tags": [
      "matching-and-recommendation-algorithms",
      "staff",
      "inline"
    ]
  },
  {
    "id": "matching-and-recommendation-algorithms-n1",
    "topic": "matching-and-recommendation-algorithms",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Multi-Stage Funnel Inference Compute Savings",
    "scenario": "A recommendation catalog holds 10,000,000 items. A heavy deep-learning cross-network ranker costs 0.1 ms of GPU compute per item scored. Instead of scoring all 10,000,000 items (`1,000,000 ms` of GPU time), a two-tower ANN retrieval stage narrows the pool to 500 candidates before running the heavy ranker.",
    "prompt": "How many milliseconds (ms) of GPU compute does the heavy ranker spend scoring the 500 retrieved candidates?",
    "question": "How many milliseconds (ms) of GPU compute does the heavy ranker spend scoring the 500 retrieved candidates?",
    "unit": "ms",
    "answer": 50,
    "tolerance": 0.2,
    "hint": "Multiply 500 candidates by 0.1 ms per candidate.",
    "explanation": "500 candidates × 0.1 ms/candidate = 50 ms of GPU compute (a 20,000x reduction compared to scoring all 10 million catalog items with the cross-feature ranker).",
    "tags": [
      "matching-and-recommendation-algorithms",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "matching-and-recommendation-algorithms-t1",
    "topic": "matching-and-recommendation-algorithms",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Two-Tower Dot-Product Retrieval vs Cross-Attention Heavy Ranking",
    "scenario": "Your ML team wants to use a single Transformer cross-attention model (which takes user-item interaction features jointly as input) to score all 20 million items in the catalog on every feed request within a 100 ms SLA.",
    "prompt": "Which architectural approach should you choose, and what is the primary justification?",
    "question": "Which architectural approach should you choose, and what is the primary justification?",
    "options": [
      "Run the cross-attention model over all 20 million items in real time on every user request",
      "Use a decoupled Two-Tower architecture (where item embeddings are pre-computed offline and indexed in HNSW/IVF-PQ for sub-15ms ANN candidate retrieval of ~1,000 items), followed by the joint cross-feature ranker on only those ~1,000 candidates",
      "Pre-compute and store all `100M users × 20M items` pairwise cross-attention scores every minute"
    ],
    "correctOption": 1,
    "reasons": [
      "Evaluating 20 million Transformer forward passes per request easily finishes in 10 ms on one GPU",
      "Decoupling user and item towers allows item embeddings to be indexed for sub-linear ANN lookup (sacrificing early cross-features for speed), while the second-stage ranker restores rich cross-feature precision on a bounded candidate set",
      "Computing 2 quadrillion pairwise scores every minute is cheap and handles real-time session context"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Why can a Two-Tower model use an HNSW vector index while a joint Cross-Encoder cannot?",
    "explanation": "A joint cross-encoder cannot pre-index item vectors because its internal representations depend on the specific user query. A Two-Tower model restricts user-item interaction to a final dot product/cosine similarity, enabling O(log N) ANN retrieval over millions of items before heavy ranking.",
    "tags": [
      "matching-and-recommendation-algorithms",
      "tradeoff",
      "staff"
    ]
  }
];
