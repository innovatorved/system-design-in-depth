window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["realtime-database-and-websocket-scaling"] = [
  {
    "id": "realtime-database-and-websocket-scaling-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Pub/Sub is not an inbox",
    "section": "Scaling Real-Time Connections",
    "prompt": "A chat backend publishes every new message to Redis Pub/Sub, and each WebSocket node forwards what it receives to its local sockets. A user's phone drops off Wi-Fi for 20 seconds. What happens to messages published during that gap, and what does the lesson say must fix it?",
    "options": [
      "Redis buffers them per channel until the node acknowledges them, so only acknowledgements need to be tuned",
      "They are missed, because Pub/Sub is fire-and-forget; the client must resume from its last acknowledged position in a durable store",
      "The load balancer's sticky session replays them once the phone reconnects to the same node",
      "They are queued in the node's outbound buffer indefinitely, so the fix is simply a larger per-socket queue"
    ],
    "answer": 1,
    "explanation": "Ephemeral Pub/Sub only reaches subscribers that are listening right now, so durability has to come from per-conversation or per-recipient positions the client resumes from. Sticky sessions only reduce churn; after a crash or deploy the reconnect can land on any node, so they cannot be the recovery mechanism.",
    "tags": [
      "realtime-database-and-websocket-scaling",
      "recall",
      "inline"
    ]
  },
  {
    "id": "realtime-database-and-websocket-scaling-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Sizing a gateway fleet",
    "section": "Worked example: sizing a WebSocket fleet",
    "prompt": "You expect 6 million concurrent users averaging 1.5 devices each. One gateway node comfortably holds 150,000 sockets, and you want about 30 percent headroom so a node can be drained or lost. Roughly how many gateway nodes should you provision?",
    "options": [
      "About 40 nodes",
      "About 60 nodes",
      "About 78 nodes",
      "About 117 nodes"
    ],
    "answer": 2,
    "explanation": "6M x 1.5 = 9M sockets; 9M / 150k = 60 nodes at steady state, and 30 percent headroom brings it to about 78. Stopping at 60 is the tempting mistake: losing or draining one node would push its 150k sockets onto neighbours that are already full.",
    "tags": [
      "realtime-database-and-websocket-scaling",
      "apply",
      "inline"
    ]
  },
  {
    "id": "realtime-database-and-websocket-scaling-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Stale registry after partition",
    "section": "Failure modes to name in an interview",
    "prompt": "Gateway A is partitioned away for 40 seconds; its users reconnect to Gateway B and re-register. When the partition heals, A still believes it owns those connections and rewrites its old registry entries. Which safeguard from the lesson stops messages being routed to A's dead sockets?",
    "options": [
      "Fence registry entries with a node generation or epoch and expire entries whose heartbeats stop",
      "Enable sticky sessions on the load balancer so users always return to Gateway A after the partition",
      "Switch the routing strategy to broadcasting every message to all gateway nodes so ownership never matters",
      "Increase the heartbeat interval so fewer registry writes race with each other during recovery"
    ],
    "answer": 0,
    "explanation": "An epoch or generation number lets the registry reject writes from a node whose ownership has been superseded, and heartbeat expiry removes entries nobody is renewing. Broadcasting sidesteps the registry but its traffic grows with nodes times messages and fails beyond a few dozen nodes, so it trades one problem for a worse one.",
    "tags": [
      "realtime-database-and-websocket-scaling",
      "staff",
      "inline"
    ]
  },
  {
    "id": "realtime-database-and-websocket-scaling-n1",
    "topic": "realtime-database-and-websocket-scaling",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: WebSocket Gateway Fleet Sizing by Connection Memory",
    "scenario": "You need to terminate 10 million concurrent WebSocket connections. Each open connection consumes 25 KB of kernel socket buffer + application session state, and each gateway server has 50 GB (50,000,000 KB) of RAM dedicated to connection state.",
    "prompt": "How many WebSocket gateway servers are required to hold all 10 million concurrent connections?",
    "question": "How many WebSocket gateway servers are required to hold all 10 million concurrent connections?",
    "unit": "servers",
    "answer": 5,
    "tolerance": 0.25,
    "hint": "Connections per server = 50,000,000 KB ÷ 25 KB = 2,000,000 connections/server. Divide 10,000,000 by 2,000,000.",
    "explanation": "Each server holds `50,000,000 KB / 25 KB = 2,000,000` concurrent connections. Thus 10M connections require `10,000,000 / 2,000,000 = 5` servers minimum (typically provisioned as 7–8 servers for N+2 rolling deploy & failover capacity).",
    "tags": [
      "realtime-database-and-websocket-scaling",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "realtime-database-and-websocket-scaling-t1",
    "topic": "realtime-database-and-websocket-scaling",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Reconnection Thundering Herd After WebSocket Gateway Crash",
    "scenario": "One WebSocket gateway server holding 500,000 active client connections crashes abruptly. All 500,000 clients detect TCP `FIN/RST` within the same 100 ms window and immediately attempt TLS handshakes + auth token validation + initial state sync against the remaining gateways.",
    "prompt": "Which defense layers prevent this reconnection storm from cascading across the remaining fleet?",
    "question": "Which defense layers prevent this reconnection storm from cascading across the remaining fleet?",
    "options": [
      "Configure clients to retry every 50 ms with zero jitter so users reconnect as quickly as possible",
      "Enforce client-side randomized exponential backoff with full jitter, perform stateless JWT verification + TLS session resumption at the edge, and shed non-essential state-sync queries when gateway handshake queues saturate",
      "Store all WebSocket TCP sockets inside the primary PostgreSQL database"
    ],
    "correctOption": 1,
    "reasons": [
      "Synchronized 50 ms retries spread 500,000 RSA/ECDSA TLS handshakes evenly across time",
      "Full-jitter backoff desynchronizes the 500k reconnects over tens of seconds, while TLS session tickets and stateless JWTs prevent auth-DB collapse during handshake bursts",
      "PostgreSQL natively terminates raw client WebSocket connections"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Consider both the CPU cost of 500k simultaneous TLS handshakes and the DB cost of 500k simultaneous auth lookups.",
    "explanation": "When a stateful gateway drops 500k connections at once, synchronized reconnects overwhelm both LB CPU (TLS handshakes) and the auth/state backend. Full-jitter client backoff, TLS session resumption, and edge admission control smooth the burst.",
    "tags": [
      "realtime-database-and-websocket-scaling",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["websockets-vs-sse-vs-long-polling"] = [
  {
    "id": "websockets-vs-sse-vs-long-polling-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What SSE gives for free",
    "section": "Comparing Real-Time Protocols",
    "prompt": "You are streaming LLM tokens from server to browser and considering SSE instead of WebSockets. Which capability does the browser's EventSource give you out of the box that you would otherwise have to design yourself on a WebSocket?",
    "options": [
      "Binary frames, so token payloads can be compressed before sending",
      "Full-duplex messaging, so the client can cancel generation on the same channel",
      "Multiplexing of many streams over one connection on HTTP/1.1",
      "Automatic reconnection that sends Last-Event-ID so the server can resume"
    ],
    "answer": 3,
    "explanation": "EventSource reconnects automatically and sends Last-Event-ID, whereas WebSocket session resume is something you must design. SSE is text-only and one-way, and over HTTP/1.1 each stream consumes one of about six connections per origin; multiplexing comes from HTTP/2, not from SSE.",
    "tags": [
      "websockets-vs-sse-vs-long-polling",
      "recall",
      "inline"
    ]
  },
  {
    "id": "websockets-vs-sse-vs-long-polling-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Cost of short polling",
    "section": "Worked example: one million clients, one update per minute",
    "prompt": "2,000,000 clients each receive about one update per 60 seconds. If they short-poll every 10 seconds, what is the fleet-wide request rate and roughly what share of polls come back empty?",
    "options": [
      "About 200,000 requests per second, with roughly 83 percent returning empty",
      "About 20,000 requests per second, with roughly 83 percent returning empty",
      "About 200,000 requests per second, with roughly 17 percent returning empty",
      "About 33,000 requests per second, with roughly 50 percent returning empty"
    ],
    "answer": 0,
    "explanation": "2M clients / 10 s = 200,000 requests per second, and with one update per 60 s only about 1 in 6 polls carries data, so about 83 percent is wasted. The 33,000 figure is the update rate (2M / 60), which is roughly what an SSE or WebSocket push would cost instead.",
    "tags": [
      "websockets-vs-sse-vs-long-polling",
      "apply",
      "inline"
    ]
  },
  {
    "id": "websockets-vs-sse-vs-long-polling-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Buffered SSE",
    "section": "Failure modes",
    "prompt": "An SSE notifications feed works in testing, but customers behind one corporate network report seeing nothing for minutes and then a burst of all events at once. What is the most likely cause and fix?",
    "options": [
      "The browser hit its six-connection limit; move the feed to a separate subdomain",
      "The server's event IDs are out of order; sort events before writing them to the stream",
      "An intermediary proxy is buffering the response; disable buffering and send periodic comment lines",
      "The load balancer's idle timeout is too long; shorten it so connections recycle more often"
    ],
    "answer": 2,
    "explanation": "A buffering proxy holds a streaming response until its buffer fills, producing exactly the nothing-then-everything symptom; disabling buffering (for nginx, X-Accel-Buffering) plus heartbeat comments fixes it. A connection-limit problem would block new streams entirely rather than delay and then burst events on an open one.",
    "tags": [
      "websockets-vs-sse-vs-long-polling",
      "staff",
      "inline"
    ]
  },
  {
    "id": "websockets-vs-sse-vs-long-polling-n1",
    "topic": "websockets-vs-sse-vs-long-polling",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Short-Polling Header Overhead vs Server-Sent Events (SSE)",
    "scenario": "100,000 browsers track a live order status page where state changes only once every 5 minutes. A naive implementation polls `GET /status` every 2 seconds, exchanging 1 KB (1,000 bytes) of HTTP headers + empty JSON per poll.",
    "prompt": "How many megabytes per second (MB/s, using 1 MB = 1,000 KB) of wasted polling bandwidth is consumed across the 100,000 clients?",
    "question": "How many megabytes per second (MB/s, using 1 MB = 1,000 KB) of wasted polling bandwidth is consumed across the 100,000 clients?",
    "unit": "MB/s",
    "answer": 50,
    "tolerance": 0.25,
    "hint": "Polls/sec = 100,000 clients ÷ 2 seconds = 50,000 req/s. Multiply by 1 KB/req and convert to MB/s.",
    "explanation": "100,000 clients polling every 2 seconds generate 50,000 req/s. At 1 KB per request/response cycle, the server burns 50,000 KB/s = 50 MB/s (400 Mbps) just saying 'nothing changed', whereas SSE sends 1 event every 5 minutes (~333 req/s).",
    "tags": [
      "websockets-vs-sse-vs-long-polling",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "websockets-vs-sse-vs-long-polling-t1",
    "topic": "websockets-vs-sse-vs-long-polling",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: WebSockets vs Server-Sent Events (SSE) over HTTP/2 for AI Token Streaming",
    "scenario": "You are building an LLM chat interface (like ChatGPT/Claude) where the user submits one prompt via HTTP and receives a unidirectional stream of generated tokens for 20 seconds through enterprise corporate proxies.",
    "prompt": "Should you use Server-Sent Events (SSE) over HTTP/2+ or bidirectional WebSockets, and what is the primary engineering justification?",
    "question": "Should you use Server-Sent Events (SSE) over HTTP/2+ or bidirectional WebSockets, and what is the primary engineering justification?",
    "options": [
      "Use custom raw UDP sockets directly from the browser",
      "Use Server-Sent Events (`text/event-stream`) over HTTP/2+, because traffic is unidirectional after the prompt POST, SSE multiplexes over a single HTTP/2 TCP connection, traverses L7 proxies/firewalls natively, and supports automatic `Last-Event-ID` resumption",
      "Use short polling every 10 milliseconds to fetch each generated token"
    ],
    "correctOption": 1,
    "reasons": [
      "Unprivileged browser JavaScript can open raw UDP sockets without WebRTC",
      "SSE avoids the HTTP/1.1 `Upgrade` handshake fragility on enterprise proxies, multiplexes streams over HTTP/2, and matches the request-then-stream interaction pattern natively",
      "10 ms HTTP polling has lower latency and header overhead than streaming"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Why do OpenAI, Anthropic, and most LLM APIs stream tokens over SSE (`text/event-stream`) instead of WebSockets?",
    "explanation": "LLM token streaming is request-response where the response happens to stream over time. SSE over HTTP/2 works with standard HTTP auth headers, L7 load balancers, and corporate firewalls without a special WebSocket `Upgrade` state machine.",
    "tags": [
      "websockets-vs-sse-vs-long-polling",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["social-network-database-modeling"] = [
  {
    "id": "social-network-database-modeling-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "The real bottleneck",
    "section": "Modeling Social Data at Scale",
    "prompt": "A colleague argues the home feed must move off MySQL because \"JOINs cannot scale for social networks\". According to the lesson, what is the more accurate diagnosis?",
    "options": [
      "Relational stores cannot shard, so any social product eventually needs a graph database",
      "The expensive part is the access pattern and fan-out of merging many authors under a latency target, not JOINs as such",
      "Indexes stop helping past a billion rows, so the only option is a wide-column store",
      "Multi-hop traversal is required for every feed render, which only traversal engines like Neo4j handle"
    ],
    "answer": 1,
    "explanation": "The lesson stresses that a normalized schema serves most entities well and that Facebook still runs core social data on sharded MySQL behind TAO; the feed gets expensive because of fan-out and merging, which can justify a materialized projection. Traversal engines are explicitly kept off the hot feed path.",
    "tags": [
      "social-network-database-modeling",
      "recall",
      "inline"
    ]
  },
  {
    "id": "social-network-database-modeling-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Read to write ratio",
    "section": "Worked example: read versus write volume",
    "prompt": "A network has 200 million daily active users who each open their feed 15 times a day, and 60 million posts are created per day. Approximately what are the average feed reads per second, posts per second, and the read to write ratio?",
    "options": [
      "About 3,500 reads per second, 700 posts per second, a ratio of 5 to 1",
      "About 35,000 reads per second, 7,000 posts per second, a ratio of 5 to 1",
      "About 350,000 reads per second, 700 posts per second, a ratio of 500 to 1",
      "About 35,000 reads per second, 700 posts per second, a ratio of 50 to 1"
    ],
    "answer": 3,
    "explanation": "200M x 15 = 3B reads per day, about 34,700 per second; 60M posts per day is about 694 per second, so reads outnumber writes about 50 to 1. That lopsided ratio is what justifies spending write-time work to precompute read-shaped timelines.",
    "tags": [
      "social-network-database-modeling",
      "apply",
      "inline"
    ]
  },
  {
    "id": "social-network-database-modeling-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "IDs, not bodies, in timelines",
    "section": "Query-driven tables (Cassandra CQL style)",
    "prompt": "A team denormalizes full post bodies into every follower's user_timeline rows to save a lookup at read time. Which operational problem gets markedly worse compared with storing only post IDs and hydrating bodies from a cache?",
    "options": [
      "Deleting or editing a post now requires fanning changes or tombstones out to every follower's partition",
      "First-page reads now require a multi-partition scatter-gather instead of a single partition read",
      "The time bucket in the partition key stops bounding partition size because bodies are large",
      "Clustering by post_id descending no longer returns the newest posts first"
    ],
    "answer": 0,
    "explanation": "With bodies copied into every timeline, a delete or edit must be propagated to all those copies, which the lesson notes is why many systems store only IDs and filter or hydrate at read time. The first page is still a single-partition read either way; embedding bodies changes what each row holds, not how it is partitioned.",
    "tags": [
      "social-network-database-modeling",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["social-graph-follows-and-flockdb"] = [
  {
    "id": "social-graph-follows-and-flockdb-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why store edges twice",
    "section": "Managing the Follower Graph",
    "prompt": "FlockDB stores each follow edge in a forward list sharded by source and a reverse list sharded by destination. What would happen to the query \"who follows user B?\" if edges were stored only once, sharded by source_id?",
    "options": [
      "It would still be a single-shard lookup, but it would need a secondary index on destination_id",
      "It would be served from the follower counter, so only pagination would suffer",
      "It would become a scatter-gather across every shard, since B's followers could live anywhere",
      "It would require a multi-hop traversal engine, because incoming edges are not adjacency lists"
    ],
    "answer": 2,
    "explanation": "Sharding by source puts each follower's edge on that follower's shard, so finding B's followers means asking every shard; the destination-sharded copy turns it back into one indexed range read. A local secondary index on destination_id does not help because the rows themselves are spread across all shards.",
    "tags": [
      "social-graph-follows-and-flockdb",
      "recall",
      "inline"
    ]
  },
  {
    "id": "social-graph-follows-and-flockdb-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Sizing the edge store",
    "section": "Worked example: how big is the graph?",
    "prompt": "Your platform has 100 million users who follow an average of 300 accounts. Using the lesson's row layout of about 25 bytes and storing both directions, roughly how much raw edge data is that before index overhead and replication?",
    "options": [
      "About 0.75 TB",
      "About 1.5 TB",
      "About 3 TB",
      "About 15 TB"
    ],
    "answer": 1,
    "explanation": "100M x 300 = 30 billion logical edges, 60 billion rows with both directions, times 25 bytes is about 1.5 TB raw. The 0.75 TB option forgets the reverse copy, which is the whole point of the design; overhead and three replicas would then multiply the real footprint several times.",
    "tags": [
      "social-graph-follows-and-flockdb",
      "apply",
      "inline"
    ]
  },
  {
    "id": "social-graph-follows-and-flockdb-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Unfollow versus late retry",
    "section": "Write path for a follow",
    "prompt": "A user follows then immediately unfollows an account. The reverse-edge write for the original follow is delayed in the queue and retried after the unfollow has been applied. What in the lesson's design stops the edge from being resurrected?",
    "options": [
      "The unfollow physically deletes both rows, so the retried write finds nothing to update",
      "A distributed transaction commits forward and reverse edges together, so retries are rejected",
      "The follower counter is decremented first, and writes that would push it negative are dropped",
      "Each edge carries a state and a position, and the store keeps whichever write has the higher position"
    ],
    "answer": 3,
    "explanation": "Unfollow is a state change with a newer position, so the stale follow with its older position loses and the edge stays removed; a repair job fixes any remaining drift. Physically deleting the row is the tempting wrong answer: the late retry would simply insert a fresh active edge, which is exactly the resurrection bug.",
    "tags": [
      "social-graph-follows-and-flockdb",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["feed-generation-push-pull-hybrid"] = [
  {
    "id": "feed-generation-push-pull-hybrid-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Hybrid read path",
    "section": "Designing a News Feed",
    "prompt": "In the hybrid feed model, what does the system do when a user who follows several celebrities opens their feed?",
    "options": [
      "Reads the precomputed timeline and, at read time, pulls recent posts from followed celebrity outboxes and merges them",
      "Reads every followed account's outbox and merges them, since the precomputed timeline is only a cache hint",
      "Reads only the precomputed timeline, because celebrity posts were fanned out on write in a background batch",
      "Triggers a fan-out of each celebrity's latest posts into the user's timeline, then reads that timeline"
    ],
    "answer": 0,
    "explanation": "The hybrid pushes posts from ordinary authors into timelines at write time and pulls the few large accounts at read time, merging the two. Reading every outbox is pure pull, which is exactly the expensive read path the hybrid avoids for normal authors.",
    "tags": [
      "feed-generation-push-pull-hybrid",
      "recall",
      "inline"
    ]
  },
  {
    "id": "feed-generation-push-pull-hybrid-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Pure push write rate",
    "section": "Worked example: the numbers behind the hybrid",
    "prompt": "A network sees 20 million posts per day and authors have 300 followers on average. Under pure push, roughly how many timeline inserts per second must the fan-out workers sustain on average?",
    "options": [
      "About 7,000 per second",
      "About 23,000 per second",
      "About 69,000 per second",
      "About 690,000 per second"
    ],
    "answer": 2,
    "explanation": "20M x 300 = 6 billion inserts per day, divided by 86,400 seconds is about 69,000 per second on average, with peaks several times higher. The 7,000 option is off by a factor of ten, a common slip when dividing billions by 86,400.",
    "tags": [
      "feed-generation-push-pull-hybrid",
      "apply",
      "inline"
    ]
  },
  {
    "id": "feed-generation-push-pull-hybrid-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Inactive-follower waste",
    "section": "Trade-off table",
    "prompt": "Analytics show that 40 percent of followers across the platform have not opened the app in over 30 days, yet push fan-out writes to all of them. What is the lesson's recommended way to cut this wasted work without hurting active users?",
    "options": [
      "Lower the celebrity threshold so far more authors are served by pull at read time",
      "Skip fan-out to inactive followers and rebuild their timeline when they return",
      "Cap every timeline at a smaller length so inactive users' lists stay cheap to store",
      "Batch fan-out writes into hourly jobs so inactive users are processed off-peak"
    ],
    "answer": 1,
    "explanation": "The trade-off table names fan-out to users who never open the app as push's wasted work, reduced by skipping inactive users and rebuilding on return. Lowering the celebrity threshold also cuts writes, but it shifts cost onto every active reader's merge, which is the wrong direction for a problem caused only by inactive users.",
    "tags": [
      "feed-generation-push-pull-hybrid",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["newly-unread-indicator"] = [
  {
    "id": "newly-unread-indicator-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why SET 0 is wrong",
    "section": "Implementation notes for a newly-unread badge",
    "prompt": "A badge implementation increments a counter on each arrival and runs SET badge 0 when the user opens the inbox overview. What correctness bug does the lesson identify?",
    "options": [
      "Increments from multiple devices can overflow the counter before the clear runs",
      "The clear advances every thread's read receipt, which marks unopened conversations as read",
      "A message that commits after the response was built but before the clear is silently dropped from the badge",
      "The counter measures distinct senders, so repeated messages from one sender are undercounted"
    ],
    "answer": 2,
    "explanation": "SET 0 wipes arrivals that race with the response, so a message committed in that window never shows on the badge. The lesson explicitly separates the overview badge from thread read receipts, so the receipt option describes something this design deliberately does not do.",
    "tags": [
      "newly-unread-indicator",
      "recall",
      "inline"
    ]
  },
  {
    "id": "newly-unread-indicator-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Badge after racing acks",
    "section": "Worked example with positions",
    "prompt": "Sender maxima are dan 2010 and erin 2015. The server returns an overview with snapshot token 2015. While that response is in flight, frank sends at 2018 and dan sends again at 2021. The phone then acknowledges 2015, and later an old tablet acknowledges 2012. What is the badge?",
    "options": [
      "0, because the phone's acknowledgement cleared the badge",
      "1, because only frank is a newly seen sender",
      "3, because the tablet moved the boundary back to 2012 and erin counts again",
      "2, because frank and dan both have maxima above the boundary of 2015"
    ],
    "answer": 3,
    "explanation": "The boundary becomes max(previous, 2015) = 2015, and the tablet's 2012 cannot lower it, so the count is senders whose maximum exceeds 2015: frank (2018) and dan (2021). Answering 1 forgets that dan's new message raises dan's maximum past the boundary even though dan was already seen.",
    "tags": [
      "newly-unread-indicator",
      "apply",
      "inline"
    ]
  },
  {
    "id": "newly-unread-indicator-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Projection lag",
    "section": "Failure modes",
    "prompt": "The sender-maxima projector has processed messages up to position 1046, but the authoritative message log is already at 1049 when a user opens the overview. What should the badge service do?",
    "options": [
      "Merge the projected counts with a scan of source positions 1047 to 1049 before returning",
      "Return the projected count, since the next projector run will correct the badge within seconds",
      "Block the request until the projector reaches 1049, then return the projected count",
      "Return 0 for this request and mark the badge dirty so the client polls again"
    ],
    "answer": 0,
    "explanation": "The lesson says to merge the projected prefix with the unprocessed tail from the source log rather than presenting a stale cache value as exact. Returning the stale count is tempting because it is cheap, but it is presented as exact and silently misses arrivals, which is the very bug the design exists to prevent.",
    "tags": [
      "newly-unread-indicator",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["hashtag-extraction-and-tag-store"] = [
  {
    "id": "hashtag-extraction-and-tag-store-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Tag partition key",
    "section": "Extracting and Indexing Hashtags",
    "prompt": "Why does the lesson partition the Cassandra tag index by (hashtag, time bucket, shard) instead of by hashtag alone?",
    "options": [
      "Cassandra cannot cluster rows by post_id unless the partition key includes a timestamp",
      "Partitioning by hashtag alone would create unbounded, hot partitions for popular tags",
      "The shard component lets one partition serve relevance-ranked multi-term queries",
      "Time buckets let the trending job read counts directly from the index partitions"
    ],
    "answer": 1,
    "explanation": "A popular or event tag would pile every posting into one ever-growing partition that also absorbs all the write heat; time buckets bound size and a shard suffix spreads writes. Relevance ranking and multi-term queries are what the lesson assigns to a search engine, not to a wide-column index.",
    "tags": [
      "hashtag-extraction-and-tag-store",
      "recall",
      "inline"
    ]
  },
  {
    "id": "hashtag-extraction-and-tag-store-c2",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Hot tag write spread",
    "section": "Worked example: volume and hot tags",
    "prompt": "During a final, a tag receives 60,000 posts per minute. You adopt the lesson's key (tag, day, shard) with shard = hash(post_id) mod 16. What cost do you knowingly accept in exchange for spreading the writes?",
    "options": [
      "Each post must be written 16 times, once per shard, so write amplification grows 16-fold",
      "Posts for the tag lose time ordering, so the newest page cannot be produced at all",
      "Reading the newest page must query all 16 shards and merge, unless a cached merged page is served",
      "The day bucket must shrink to one hour, otherwise each shard still exceeds its size limit"
    ],
    "answer": 2,
    "explanation": "Hashing spreads the roughly 1,000 writes per second to about 62 per partition, but a reader wanting the newest posts must fetch from every shard and merge, which is why the lesson suggests caching a merged first page. Each post still lands on exactly one shard, so there is no 16-fold write amplification.",
    "tags": [
      "hashtag-extraction-and-tag-store",
      "staff",
      "inline"
    ]
  },
  {
    "id": "hashtag-extraction-and-tag-store-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Count-min sketch sizing",
    "section": "Trending with bounded memory",
    "prompt": "You size a count-min sketch with epsilon = 0.0001 and delta = 0.01, and a trending window holds 20 million tag events. What are the approximate width and the maximum overcount (with probability 0.99)?",
    "options": [
      "Width about 27,183; overcount at most about 200",
      "Width about 2,718; overcount at most about 2,000",
      "Width about 271,828; overcount at most about 20",
      "Width about 27,183; overcount at most about 2,000"
    ],
    "answer": 3,
    "explanation": "Width is ceil(e / epsilon) = ceil(2.71828 / 0.0001) = 27,183, and the error bound is epsilon x N = 0.0001 x 20M = 2,000 counts. The option with 200 applies the right width but slips a factor of ten on epsilon x N, which matters when you decide whether small tags can be ranked reliably.",
    "tags": [
      "hashtag-extraction-and-tag-store",
      "apply",
      "inline"
    ]
  }
];

window.QUESTION_BANK["reaction-modeling"] = [
  {
    "id": "reaction-modeling-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Source of truth for likes",
    "section": "Designing Like and Reaction Systems",
    "prompt": "In the lesson's reaction design, what is the durable source of truth from which like and love counts are derived?",
    "options": [
      "The denormalized like_count and love_count columns on the posts table",
      "The Redis counters that absorb INCR operations before periodic flushes",
      "The Kafka topic of raw tap events, replayed to recompute totals",
      "One durable record per (post, user) holding that user's current reaction"
    ],
    "answer": 3,
    "explanation": "The (post, user) row is authoritative and counters are derived from its state transitions, which also answers \"did I like this?\". The counter columns are the tempting choice because feeds read them, but they are a derived summary that drifts and must be rebuildable from the per-user records.",
    "tags": [
      "reaction-modeling",
      "recall",
      "inline"
    ]
  },
  {
    "id": "reaction-modeling-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Deltas from transitions",
    "section": "Worked example: a viral post",
    "prompt": "A user taps Like, the client retries the same Like request because of a timeout, and then the user switches the reaction to Love. Under the lesson's upsert-plus-delta design, what net change is applied to the counters?",
    "options": [
      "Like +2, Love +1",
      "Like 0, Love +1",
      "Like +1, Love +1",
      "Like -1, Love +1"
    ],
    "answer": 1,
    "explanation": "The first tap emits like +1, the retry upserts the same row with no state change and emits nothing, and like to love emits like -1 and love +1, netting like 0 and love +1. Like +2 is what naive per-click increments would produce, the double counting the design is built to avoid.",
    "tags": [
      "reaction-modeling",
      "apply",
      "inline"
    ]
  },
  {
    "id": "reaction-modeling-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Redis counters after failover",
    "section": "Reconciliation and real systems",
    "prompt": "You use Redis INCR with periodic flushes to the database. A Redis primary fails over to an asynchronously replicated replica that is missing the last few seconds of increments. Which mechanism from the lesson restores correct counts?",
    "options": [
      "A periodic job that recounts reactions rows for recently active posts and corrects the counters",
      "Replaying the client tap events from their local caches once the new primary is promoted",
      "Switching the counter keys to sharded counters so that one failover loses fewer increments",
      "Freezing the public count display until the replica catches up with the lost increments"
    ],
    "answer": 0,
    "explanation": "Because the (post, user) rows are the source of truth, a reconciliation job can recount them and fix counter drift after any loss. Sharding counters reduces contention, but lost increments on those shards would still be lost, so it does not restore correctness on its own.",
    "tags": [
      "reaction-modeling",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["photo-tagging-coordinate-model"] = [
  {
    "id": "photo-tagging-coordinate-model-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Normalized tag coordinates",
    "section": "System Design: Photo Tagging",
    "prompt": "Why does the lesson store a tag as a normalized point (u, v) tied to an immutable image version rather than as pixel coordinates?",
    "options": [
      "Normalized floats take less storage than integer pixel pairs across billions of tags",
      "Pixel coordinates cannot express bounding boxes, while normalized values can",
      "Fractions of a fixed image version map correctly to any rendered size, while pixels break across devices",
      "Normalized values let the client skip applying EXIF orientation when it renders the image"
    ],
    "answer": 2,
    "explanation": "The client multiplies u and v by the rendered dimensions, so the tag lands correctly on any screen as long as the image version is fixed. Orientation still matters: the lesson measures u and v on the orientation-corrected canonical image, so skipping EXIF handling would misplace tags.",
    "tags": [
      "photo-tagging-coordinate-model",
      "recall",
      "inline"
    ]
  },
  {
    "id": "photo-tagging-coordinate-model-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Tag inside a center crop",
    "section": "Worked example: from tap to stored tag to rendering",
    "prompt": "The canonical image is 4000 x 3000 pixels and a tag is stored at u = 0.25, v = 0.5. A square center-crop thumbnail uses a 3000 x 3000 crop. What is the tag's horizontal position u' within the crop?",
    "options": [
      "About 0.083",
      "About 0.167",
      "0.25, since normalized coordinates are unaffected by cropping",
      "About 0.333"
    ],
    "answer": 1,
    "explanation": "The tag is at pixel x = 0.25 x 4000 = 1000, the crop starts at x offset 500, so u' = (1000 - 500) / 3000 = 0.167. Keeping 0.25 is the tempting error: normalized coordinates survive resizing, not cropping, which needs the same transform used to draw the image.",
    "tags": [
      "photo-tagging-coordinate-model",
      "apply",
      "inline"
    ]
  },
  {
    "id": "photo-tagging-coordinate-model-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Editing a tagged photo",
    "section": "Representation trade-offs",
    "prompt": "The owner of a photo with ten existing tags rotates it 90 degrees and trims the edges. What does the lesson's recommended representation do?",
    "options": [
      "Overwrite the original image and keep the tags as-is, because normalized coordinates survive edits",
      "Delete all tags on the photo and notify the tagged users to re-tag the edited version",
      "Keep serving the pre-edit image wherever tags exist, and the edited image only when tags are hidden",
      "Create a new immutable version with its recorded crop and rotation, and re-validate tags against it"
    ],
    "answer": 3,
    "explanation": "Normalized coordinates on an immutable version survive crop or rotation via the version's recorded transform, and edits create a new version whose tags are re-validated. Keeping tags as-is on an overwritten image is the classic bug: a rotated image puts the same (u, v) on a different face.",
    "tags": [
      "photo-tagging-coordinate-model",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["live-commentary-system-design"] = [
  {
    "id": "live-commentary-system-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Database off the live path",
    "section": "Designing Live Commentary (Twitch Chat)",
    "prompt": "In the lesson's live commentary design, how are chat messages persisted for later VOD replay without slowing the live experience?",
    "options": [
      "Each WebSocket server writes messages to Cassandra synchronously before pushing them to viewers",
      "Messages are also sent to Kafka, and background consumers batch-write them to cold storage",
      "The pub/sub layer keeps a full history per channel that replay later reads back",
      "Clients upload their received messages at the end of the stream for server-side merging"
    ],
    "answer": 1,
    "explanation": "Live traffic is served from memory through pub/sub, while a parallel Kafka path lets consumers batch-write to a store such as Cassandra. Writing synchronously before pushing puts disk I/O on the hot path, the exact coupling the design removes.",
    "tags": [
      "live-commentary-system-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "live-commentary-system-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Edge server frame rate",
    "section": "Worked example: 500,000 viewers, 2,000 messages per second",
    "prompt": "A stream has 1,000,000 viewers spread over 400 edge servers. Each edge flushes a batched frame to each viewer every 250 ms. How many frames per second does each edge server send?",
    "options": [
      "About 2,500 frames per second",
      "About 4,000 frames per second",
      "About 10,000 frames per second",
      "About 40,000 frames per second"
    ],
    "answer": 2,
    "explanation": "Each server holds 1,000,000 / 400 = 2,500 viewers, and a 250 ms flush is 4 frames per viewer per second, so 10,000 frames per second. The 2,500 option counts viewers rather than frames and forgets that batching still sends several frames per second to each.",
    "tags": [
      "live-commentary-system-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "live-commentary-system-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Redis Cluster pub/sub trap",
    "section": "How real systems do it",
    "prompt": "You build the live pub/sub layer on a 30-node Redis Cluster using classic PUBLISH. As more hot streams go live, every node's network usage climbs, not just the nodes serving those streams. What explains it and what does the lesson suggest?",
    "options": [
      "Classic cluster PUBLISH is broadcast to every node; use Redis 7 sharded pub/sub (SPUBLISH) so a channel stays on its shard",
      "Subscribers are unevenly hashed across nodes; rebalance hash slots so each node owns an equal share of channels",
      "Too many edge servers subscribe per channel; move per-viewer fan-out back to the central pub/sub layer",
      "Messages are persisted synchronously by each node; move persistence to a Kafka consumer path"
    ],
    "answer": 0,
    "explanation": "In classic Redis Cluster a PUBLISH is propagated to all nodes, so total traffic grows with nodes times messages; sharded pub/sub keeps each channel's traffic on its own shard. Rebalancing hash slots does not help because classic pub/sub channels are not confined to slots in the first place.",
    "tags": [
      "live-commentary-system-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "live-commentary-system-design-n1",
    "topic": "live-commentary-system-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Live Event Broadcast Egress Bandwidth",
    "scenario": "During a World Cup final, 2 million concurrent viewers watch a live commentary stream. You batch and broadcast a 500-byte (0.5 KB) compressed commentary delta frame once per second to every connected viewer.",
    "prompt": "What is the total outbound payload bandwidth across the edge broadcast tier in GB/s (using 1 GB = 1,000 MB = 1,000,000 KB)?",
    "question": "What is the total outbound payload bandwidth across the edge broadcast tier in GB/s (using 1 GB = 1,000 MB = 1,000,000 KB)?",
    "unit": "GB/s",
    "answer": 1,
    "tolerance": 0.25,
    "hint": "2,000,000 viewers × 0.5 KB/s = 1,000,000 KB/s = 1 GB/s.",
    "explanation": "2,000,000 viewers × 0.5 KB/s = 1,000,000 KB/s = 1 GB/s (8 Gbps) of pure payload egress. Notice that if you sent 20 unbatched comments/sec individually with frame overhead, egress and packet-per-second rates would jump 10–20x.",
    "tags": [
      "live-commentary-system-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "live-commentary-system-design-t1",
    "topic": "live-commentary-system-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Per-Comment Push vs Windowed Reservoir Sampling & Edge Coalescing",
    "scenario": "When a goal is scored in a live match with 2 million concurrent viewers, 50,000 viewers submit a comment in the same second. Pushing all 50,000 comments/sec to all 2 million viewers would require 100 billion message deliveries/sec and render the client UI unreadable.",
    "prompt": "How should a Staff engineer design the live comment ingestion and broadcast pipeline for mega-events?",
    "question": "How should a Staff engineer design the live comment ingestion and broadcast pipeline for mega-events?",
    "options": [
      "Broadcast all 50,000 comments/sec to all 2 million clients and let the browser DOM sort and render them at 60 fps",
      "Echo the author's own comment locally immediately (optimistic UI), sample/rank incoming comments in 250–500 ms micro-batches (e.g., reservoir/quality sampling to ~5–10 comments/sec), and fan out via a hierarchical pub/sub tree or short-TTL edge CDN micro-cache",
      "Lock the comment box globally so only 1 user per minute can submit a comment"
    ],
    "correctOption": 1,
    "reasons": [
      "Human eyes can read 50,000 scrolling chat messages per second and mobile browsers never drop frames rendering 50,000 DOM nodes/sec",
      "Humans can only read ~5–10 messages/sec; optimistic local echo satisfies the sender's Read-Your-Own-Writes expectation while micro-batch sampling caps broadcast egress by 5,000x",
      "Blocking 99.999% of users from commenting meets the product engagement goal"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Can a human read 50,000 messages/sec? What does the sender of a comment need to see vs everyone else?",
    "explanation": "In mega-event live chat (YouTube Live / Twitch / Hotstar), no human can read 50,000 messages/sec. Echoing the sender's own message locally preserves instant feedback, while window-sampling the global firehose down to ~10 messages/sec caps egress bandwidth and client CPU.",
    "tags": [
      "live-commentary-system-design",
      "tradeoff",
      "staff"
    ]
  }
];
