window.MODULE_CONTENT = window.MODULE_CONTENT || {};
window.MODULE_CONTENT["learning-caching-fast-reads"] = {
  "caching-layers": {
    "title": "Caching layers",
    "video": {
      "youtubeId": "dGAgxozNWFE",
      "title": "Cache Systems Every Developer Should Know",
      "channel": "ByteByteGo",
      "why": "Walks the exact stack this lesson covers (client, CDN, load balancer, app, distributed cache, database buffers) in under six minutes with clean ByteByteGo diagrams; still the most on-topic overview.",
      "length": "5:48"
    },
    "videos": [
      {
        "youtubeId": "1NngTUYPdpI",
        "title": "Caching in System Design Interviews w/ Meta Staff Engineer",
        "channel": "Hello Interview",
        "role": "interview",
        "why": "Hello Interview explains where to place each cache layer, what to cache, and the invalidation and consistency questions interviewers push on.",
        "length": "30:14"
      },
      {
        "youtubeId": "z4XdfFscxSk",
        "title": "Browser Caching Best Practices,  When to use no-cache vs max-age without breaking your site",
        "channel": "Hussein Nasser",
        "role": "deep-dive",
        "why": "Hussein Nasser digs into Cache-Control, max-age, no-cache and validation, the browser layer that most engineers get subtly wrong.",
        "length": "18:11"
      }
    ],
    "intuition": "<p>Think of a coffee shop. The barista keeps the most popular beans on the counter (in-process cache), a bigger stock in the back room (Redis), and a full pallet at the warehouse across town (the database). A customer gets served fastest when the answer sits closest to them, and the phone, browser, and CDN are just more counters placed nearer the customer.</p><p><strong>Mental model:</strong> every layer trades freshness and control for distance saved. The closer a copy sits to the user, the cheaper each read is, and the harder that copy is to invalidate.</p><ul><li><strong>Stacking layers without an invalidation story.</strong> Every extra layer is another place stale data can hide. You need to be able to say how a change reaches the browser, the CDN, the L1 and the L2.</li><li><strong>Caching personalised responses at a shared layer.</strong> A CDN or proxy that ignores <code>Cache-Control: private</code> or <code>Vary</code> can serve one user's data to another.</li><li><strong>Assuming L1 caches agree with each other.</strong> Fifty app instances hold fifty independent copies, so a write needs a broadcast or pub/sub invalidation, or short TTLs.</li></ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>The Full-Stack Caching Hierarchy</h2>\n      <p>In high-throughput distributed systems, performance is governed by memory hierarchy latency: L1 CPU cache (1ns) → RAM (100ns) → NVMe SSD (100µs) → Datacenter Network RTT (500µs - 2ms) → Cross-Region Internet RTT (50ms - 150ms). An end-to-end web architecture places specialized caching layers along this pipeline to intercept requests as close to the user as possible.</p>\n\n      <h2>The Multi-Tier Caching Flow</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Browser / Mobile Client\"] -->|\"1. Browser HTTP Cache (304 Not Modified)\"| Edge[\"Cloudflare Anycast CDN Edge (Static & Dynamic SSR)\"]\n    Edge -->|\"2. Cache Miss (Over WAN)\"| Gateway[\"API Gateway / Envoy (Reverse Proxy Response Cache)\"]\n    Gateway -->|\"3. Reverse Proxy Miss\"| App[\"Application Tier: Node / Go / Java\"]\n    \n    App -->|\"4. In-Process L1 Cache: Caffeine / Go sync.Map (0ms Network)\"| AppLogic{\"L1 Hit?\"}\n    AppLogic -->|\"Miss\"| RedisCluster[(\"5. Distributed L2 Cache: Redis Cluster (0.8ms RTT)\")]\n    RedisCluster -->|\"6. L2 Miss\"| DBBuffer[(\"6. Database Engine Buffer Pool: Postgres shared_buffers / InnoDB\")]\n    DBBuffer -->|\"7. Disk Read\"| Disk[(\"NVMe Disk Storage\")]\n      </div>\n\n      <h2>Under the Hood: Layer Mechanics & Headers</h2>\n      <h3>1. Client & Browser Cache</h3>\n      <p>Governed by HTTP caching headers (RFC 9111, which obsoleted RFC 7234 in 2022):</p>\n      <ul>\n        <li><code>Cache-Control: public, max-age=31536000, immutable</code>: Used for hashed static assets (JS/CSS/images). The browser never issues a network request for the lifetime of the file.</li>\n        <li><code>ETag: W/\"33a64df5\"</code> & <code>If-None-Match</code>: Weak entity tags enable conditional validation. If the resource is unchanged, the server returns <code>HTTP 304 Not Modified</code> with zero body payload, saving bandwidth.</li>\n      </ul>\n\n      <h3>2. Anycast CDN Edge</h3>\n      <p>CDNs (Cloudflare, Fastly, CloudFront) terminate TCP and TLS connections at hundreds of Point-of-Presence (PoP) locations worldwide. Fastly uses Varnish (VCL) in RAM, while Cloudflare uses custom Rust/Nginx proxies. Caching dynamic JSON responses at the edge can cut p95 API latency sharply for users near a PoP (for example, from around 120ms to under 15ms), but the gain depends on hit ratio and user geography.</p>\n\n      <h3>3. In-Process L1 vs. Distributed L2 Cache</h3>\n      <p>Distributed caches (Redis) incur a network hop (0.5ms - 2ms) and serialization/deserialization overhead. An in-process cache (Caffeine in Java, <code>sync.Map</code> or <code>bigcache</code> in Go) stores deserialized heap objects in application memory. Zero network overhead allows millions of reads per second on a single instance.</p>\n    \n<!-- enriched -->\n<h2>Worked example: what each layer buys you</h2><p>Take a product page API serving 50,000 requests per second. The origin database can comfortably handle about 2,000 queries per second. Suppose the browser cache absorbs 30 percent of requests through revalidation or fresh hits, the CDN absorbs 60 percent of what remains, and an in-process L1 plus Redis L2 absorb 95 percent of what reaches the app tier.</p><ul><li>After the browser: 50,000 x 0.70 = 35,000 rps leave devices.</li><li>After the CDN: 35,000 x 0.40 = 14,000 rps reach the origin.</li><li>After L1 and L2: 14,000 x 0.05 = 700 rps hit the database, about a third of its capacity.</li></ul><p>Now let the CDN hit ratio fall from 60 to 30 percent because someone added a per-user query string. Origin traffic becomes 35,000 x 0.70 = 24,500 rps and database load becomes about 1,225 qps. That is still survivable, but the headroom is gone. Hit ratios multiply, so a regression in one layer shows up downstream.</p><h2>Layer trade-offs</h2><table><thead><tr><th>Layer</th><th>Typical latency saved</th><th>Invalidation control</th><th>Main risk</th></tr></thead><tbody><tr><td>Browser / app</td><td>Full round trip</td><td>Weak: only TTL, validators, or versioned URLs</td><td>Users stuck on stale assets</td></tr><tr><td>CDN edge</td><td>Tens of ms of WAN</td><td>Medium: purge APIs, surrogate keys</td><td>Leaking personalised content, purge lag</td></tr><tr><td>Reverse proxy</td><td>App CPU</td><td>Good: you own it</td><td>Cache key mistakes, header handling</td></tr><tr><td>In-process L1</td><td>Network hop plus deserialisation</td><td>Poor across a fleet</td><td>Inconsistent copies per instance, heap pressure</td></tr><tr><td>Distributed L2</td><td>Database query cost</td><td>Good: single logical copy</td><td>Hot keys, outage causes miss storm</td></tr><tr><td>DB buffer pool</td><td>Disk I/O</td><td>Automatic</td><td>Evicted by large scans</td></tr></tbody></table><h2>How real systems do it</h2><ul><li><strong>Static assets:</strong> content-hashed filenames plus <code>Cache-Control: max-age=31536000, immutable</code>. You never invalidate. You ship a new URL.</li><li><strong>Facebook</strong> puts memcache between web servers and MySQL and uses McSqueal, which tails MySQL commits, to broadcast deletes to every region.</li><li><strong>Fastly and Cloudflare</strong> support tag-based purge (surrogate keys, cache tags), so one product update can purge every page that shows the product.</li></ul><h2>Failure modes</h2><ul><li>A deploy changes an API response shape, but browsers keep the old cached JSON. Version your API responses or keep TTLs short.</li><li>An L1 without a size bound grows until garbage-collection pauses appear. Always cap L1 caches by entries or bytes.</li></ul>\n</div>",
    "keyTakeaways": [
      "Modern web architecture employs a multi-layer cache hierarchy from browser headers to database buffer pools.",
      "Browser and CDN caching leverage Cache-Control immutable and ETag conditional validation to bypass servers.",
      "In-process L1 caching (Caffeine/Go) eliminates network serialization overhead, delivering sub-microsecond reads."
    ],
    "furtherReading": [
      {
        "title": "MDN Web Docs: HTTP Caching Guide",
        "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching"
      },
      {
        "title": "Cloudflare Learning Center: What is a CDN?",
        "url": "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/"
      }
    ]
  },
  "edge-caching-and-page-load-times": {
    "title": "Edge caching and page load times",
    "video": {
      "youtubeId": "RI9np1LWzqw",
      "title": "What Is A CDN? How Does It Work?",
      "channel": "ByteByteGo",
      "why": "Clear visual walkthrough of how global Edge PoPs, cache hits/misses, and geographic proximity cut round-trip latency for users far from your origin.",
      "length": "4:23"
    },
    "videos": [
      {
        "youtubeId": "fWoI9DXmpdk",
        "title": "A deep dive into optimizing LCP",
        "channel": "Chrome for Developers",
        "role": "deep-dive",
        "why": "Connects backend TTFB, CDN edge caching, and subresource discovery directly to Largest Contentful Paint (LCP) — the exact bridge between system design and what users actually feel.",
        "length": "29:15"
      },
      {
        "youtubeId": "z4XdfFscxSk",
        "title": "Browser Caching Best Practices,  When to use no-cache vs max-age without breaking your site",
        "channel": "Hussein Nasser",
        "role": "deep-dive",
        "why": "Breaks down Cache-Control directives, max-age, no-cache, and conditional validation so browser and edge caches stay fast without serving stale broken pages.",
        "length": "18:11"
      }
    ],
    "intuition": "<p>Imagine ordering a book from a warehouse across the ocean. Even if the warehouse packs your box in one second, the ship still has to cross the water—and before it even packs the box, you have to exchange three letters just to agree on the address and payment. That is what a browser does when a user in Mumbai or Sydney loads a web page hosted in Virginia.</p><p><strong>Mental model:</strong> fiber optic light travels at roughly 200 kilometers per millisecond, and a single page load needs multiple sequential round trips (TCP, TLS, HTML, then render-blocking CSS and the hero image). Caching at an edge Point of Presence (PoP) moves both the handshake and the bytes into the user's own city, turning a 2-second blank white screen into a sub-250ms paint.</p><ul><li><strong>Caching only images and JS leaves TTFB slow.</strong> The browser cannot even discover your CSS or hero image until the HTML arrives. If HTML still crosses the ocean, Largest Contentful Paint (LCP) stays high.</li><li><strong>Even a cache MISS at the edge is faster than direct-to-origin.</strong> Terminating TCP and TLS at the local PoP and reusing warm keep-alive connections to the origin saves two full transoceanic round trips.</li><li><strong>Shared edge caches amplify personalization mistakes.</strong> Caching a response that contains a user's session cookie or private header without <code>Cache-Control: private</code> or proper cache keys can leak one user's page to everyone in that city.</li></ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Speed of Light &amp; Why 1 RTT Turns Into 5</h2>\n      <p>System design benchmarks often report origin server latency in isolation: &ldquo;our API responds in 40 ms.&rdquo; Yet a user in Mumbai or Sydney opening that same page hosted in <code>us-east-1</code> (Virginia) stares at a blank screen for over two seconds. The culprit is physics multiplied by protocol waterfalls.</p>\n      <p>Light travels through glass fiber at roughly <strong>200 km/ms</strong> (about 1.5&times; slower than in vacuum), and real internet cables do not follow straight great-circle paths (add ~1.25&times;&ndash;1.35&times; routing stretch plus router switching). A 12,800 km fiber path from Mumbai to Virginia therefore has a physical round-trip time (RTT) of roughly <strong>170&ndash;220 ms</strong>. Before a browser paints a single pixel over HTTP/2, it pays that RTT sequentially:</p>\n      <ol>\n        <li><strong>TCP Handshake (1 RTT):</strong> SYN &rarr; SYN-ACK &rarr; ACK across the ocean (~200 ms).</li>\n        <li><strong>TLS 1.3 Handshake (1 RTT):</strong> Cryptographic negotiation (~200 ms; HTTP/3 QUIC merges TCP+TLS into 1 RTT).</li>\n        <li><strong>HTML Request &amp; TTFB (1 RTT + Origin SSR):</strong> Request travels to origin, origin queries DB and renders HTML (e.g., 140 ms), response returns (~340 ms). Total TTFB is already ~760 ms.</li>\n        <li><strong>Critical Subresources (1+ RTT):</strong> Only after parsing the HTML does the browser discover render-blocking CSS and the hero image, paying another full ocean RTT (~200 ms) plus transfer time before <strong>First Contentful Paint (FCP)</strong> and <strong>Largest Contentful Paint (LCP)</strong>.</li>\n      </ol>\n\n      <h2>Edge PoP Architecture: HIT, MISS, Origin Shield &amp; SWR</h2>\n      <div class=\"mermaid\">\nflowchart LR\n    User[\"User in Mumbai / Sydney\"] -->|\"12ms Local RTT (TCP+TLS Terminated)\"| PoP[\"Nearest Anycast Edge PoP (BOM / SYD)\"]\n    PoP -->|\"Warm HIT or STALE (SWR): ~18ms TTFB\"| User\n    PoP -->|\"Cold MISS (Warm Keep-Alive Pool)\"| Shield[\"Regional Origin Shield\"]\n    Shield -->|\"Shield MISS (Single Coalesced Fetch)\"| Origin[\"Origin Server (us-east-1)\"]\n    PoP -.->|\"Async Background Revalidate (SWR)\"| Origin\n      </div>\n\n      <h2>What Edge Caching Actually Moves Closer to the User</h2>\n      <h3>1. Local TCP &amp; TLS Termination (Wins Even on a Cache MISS)</h3>\n      <p>Anycast BGP routes the user to a Point of Presence (PoP) 10&ndash;20 ms away. Both TCP and TLS 1.3 complete locally in ~25 ms instead of ~400 ms. Even when the requested page is a cold <code>MISS</code>, the PoP forwards the HTTP request over a <strong>pre-warmed, persistent keep-alive connection pool</strong> to the origin, eliminating cross-ocean handshakes.</p>\n\n      <h3>2. Static Assets vs. Full-Page HTML Caching</h3>\n      <p>Putting only JS, CSS, and images on a CDN is the most common half-measure. While subresources load quickly, the HTML document still crosses the ocean and runs origin rendering. Because HTML is the root of the browser's critical rendering path, caching public HTML at the edge using <code>s-maxage</code> is what collapses TTFB from 800 ms to under 40 ms:</p>\n      <pre><code>Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=300, stale-if-error=86400</code></pre>\n      <ul>\n        <li><code>max-age=0</code> tells the user's browser to revalidate with the nearest PoP (so purges take effect immediately).</li>\n        <li><code>s-maxage=60</code> tells shared edge caches (CDNs) to serve the HTML fresh for 60 seconds.</li>\n        <li><code>stale-while-revalidate=300</code> lets the PoP serve a slightly expired response in ~18 ms while refreshing from the origin asynchronously in the background—hiding ocean latency from the user completely.</li>\n        <li><code>stale-if-error=86400</code> keeps serving the last good cached HTML if the origin suffers an outage.</li>\n      </ul>\n\n      <h3>3. Tiered Caching &amp; Origin Shielding</h3>\n      <p>A global CDN may run 300+ PoPs. If every PoP independently fetches from your origin on a cold start or after a cache purge, a single popular page triggers 300 origin renders. <strong>Tiered Caching (Origin Shield)</strong> places a small set of regional mid-tier caches in front of the origin. The first PoP miss populates the shield; the other 299 PoPs hit the shield instead of waking your origin database.</p>\n\n      <h2>Worked Example: Mumbai User Loading a Virginia Origin</h2>\n      <p>Consider a user in Mumbai on 100 Mbps fiber loading a product page hosted in <code>us-east-1</code> (12,800 km away, ~205 ms WAN RTT, 140 ms origin SSR render, 240 KB hero image):</p>\n      <table>\n        <thead>\n          <tr>\n            <th>Architecture</th>\n            <th>HTML TTFB</th>\n            <th>FCP</th>\n            <th>LCP (Hero Image)</th>\n            <th>What the User Feels</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>No CDN (Direct to Origin)</strong></td>\n            <td>~770 ms</td>\n            <td>~1,030 ms</td>\n            <td>~1,120&ndash;1,450 ms+</td>\n            <td>Noticeable blank pause; degrades past 2.5s (&ldquo;Poor&rdquo; CWV) on 4G/3G</td>\n          </tr>\n          <tr>\n            <td><strong>Static Assets Only at Edge</strong></td>\n            <td>~410 ms</td>\n            <td>~460 ms</td>\n            <td>~510 ms</td>\n            <td>Faster hero image, but initial blank wait still tied to Virginia</td>\n          </tr>\n          <tr>\n            <td><strong>Full Edge HTML (<code>s-maxage</code> + SWR)</strong></td>\n            <td>~55 ms</td>\n            <td>~115 ms</td>\n            <td>~165 ms</td>\n            <td>Instantaneous paint; feels like the server is in the next room</td>\n          </tr>\n        </tbody>\n      </table>\n      <p>Try the interactive <strong>Edge Caching &amp; Page Load Time Sandbox</strong> above to race these exact paths side by side from Mumbai, Sydney, Tokyo, London, and São Paulo, and trigger cache purges or <code>stale-while-revalidate</code> refreshes in real time.</p>\n\n      <h2>What You Can (and Cannot) Cache at the Edge</h2>\n      <ul>\n        <li><strong>Ideal for Edge HTML:</strong> Marketing pages, documentation, news articles, e-commerce product/catalog pages, public profiles, and read-heavy JSON APIs.</li>\n        <li><strong>Split Shell + Dynamic Islands:</strong> When a product page is 95% public but shows a personalized &ldquo;Cart (2)&rdquo; badge, cache the public HTML shell at the edge and hydrate the small user-specific fragment via an authenticated API call or Edge Worker (Edge Side Includes).</li>\n        <li><strong>Never Cache at Shared Edge:</strong> Account settings, checkout/payment state, private messages, or any response carrying user-specific PII—always emit <code>Cache-Control: private, no-store</code>.</li>\n      </ul>\n\n      <h2>Production Failure Modes</h2>\n      <ul>\n        <li><strong>Cache Key Fragmentation:</strong> Emitting <code>Vary: User-Agent</code> or including marketing query parameters (<code>utm_source</code>, <code>fbclid</code>) in the cache key creates thousands of near-identical variants, collapsing hit ratio from 95% to under 10%.</li>\n        <li><strong>Cookie-Induced Cache Bypasses:</strong> Many CDNs automatically bypass the cache whenever a request carries a <code>Cookie</code> header. Strip analytics cookies at the edge before cache lookup for public routes.</li>\n        <li><strong>Global Purge Storms:</strong> Issuing a wildcard purge (<code>/*</code>) across 300 PoPs simultaneously creates a thundering herd against your origin. Use surrogate keys (cache tags), Origin Shielding, and request coalescing so only one fetch per key reaches the origin.</li>\n      </ul>\n    </div>",
    "keyTakeaways": [
      "Speed of light in fiber (~200 km/ms) multiplies across sequential TCP, TLS, HTML, and subresource round trips, turning a 40ms origin into a multi-second page load for distant users.",
      "Terminating TCP/TLS at the nearest Anycast Edge PoP cuts latency even on a cache MISS via warm Edge-to-Origin keep-alive connections.",
      "Caching only static assets still leaves HTML TTFB bottlenecked by ocean RTT; combining s-maxage with stale-while-revalidate collapses both TTFB and LCP.",
      "Use Origin Shielding (tiered caching), cache tags, and normalized cache keys to prevent cold-miss storms and avoid leaking personalized responses."
    ],
    "furtherReading": [
      {
        "title": "web.dev: Optimize Time to First Byte (TTFB) & Largest Contentful Paint (LCP)",
        "url": "https://web.dev/articles/optimize-lcp"
      },
      {
        "title": "RFC 9111: HTTP Caching Specification (s-maxage & stale-while-revalidate)",
        "url": "https://www.rfc-editor.org/rfc/rfc9111.html"
      },
      {
        "title": "Cloudflare Docs: Tiered Cache & Edge Caching Architecture",
        "url": "https://developers.cloudflare.com/cache/how-to/tiered-cache/"
      }
    ]
  },
  "distributed-cache-design": {
    "title": "Distributed cache design",
    "video": {
      "youtubeId": "m4_7W4XzRgk",
      "title": "NSDI '13 - Scaling Memcache at Facebook",
      "channel": "USENIX",
      "why": "The NSDI 2013 'Scaling Memcache at Facebook' talk is the canonical account of building a distributed cache: consistent hashing, pools, regions, leases, invalidation fan-out and failure handling.",
      "length": "23:18"
    },
    "videos": [
      {
        "youtubeId": "3WOfXRjYnGA",
        "title": "Clustering in Redis",
        "channel": "Redis",
        "role": "intro",
        "why": "Official Redis explainer on cluster mode: 16,384 hash slots, masters and replicas, and resharding. It matches the Redis half of this lesson.",
        "length": "8:28"
      },
      {
        "youtubeId": "fmT5nlEkl3U",
        "title": "Redis Deep Dive w/ a Ex-Meta Senior Manager",
        "channel": "Hello Interview",
        "role": "interview",
        "why": "Hello Interview's Redis deep dive covers cluster sharding, hot keys and how to talk about a distributed cache in an interview.",
        "length": "31:00"
      }
    ],
    "intuition": "<p>Picture a library that has outgrown one building. You can hand every patron a map of which branch holds which shelf (Memcached: smart client, dumb servers). Or every branch can know the map and redirect you if you walk into the wrong one (Redis Cluster: the server replies MOVED). Either way the books are split up, and the hard problems are keeping the map current and not sending everyone to one branch.</p><p><strong>Mental model:</strong> a distributed cache is a partitioned in-memory hash map. The design questions are how keys map to nodes, what happens when that mapping changes, and what happens when a node dies.</p><ul><li><strong>Using hash mod N.</strong> Adding one node remaps almost every key and triggers a cold-cache storm. Use consistent hashing or fixed slots.</li><li><strong>Ignoring hot keys.</strong> Sharding spreads keys, not load. A single celebrity key still lands on one node, so you need replicas or a local L1 for it.</li><li><strong>Multi-key operations across slots.</strong> In Redis Cluster, <code>MGET</code> and Lua scripts need every key in the same slot. Use hash tags such as <code>{user:42}</code>.</li></ul>",
    "content": "<div class=\"lesson-content\">\n      <h2>Under the Hood: Redis Cluster vs. Memcached Multi-Node</h2>\n      <p>When caching requirements exceed the memory capacity of a single server (typically > 128GB) or require high write availability, the cache must be distributed across a cluster. Two distinct architectural paradigms dominate:</p>\n\n      <h3>1. Memcached: Dumb Server, Smart Client</h3>\n      <p>Memcached nodes do not communicate with each other. The client library maintains a list of node IPs and uses <strong>Ketama Consistent Hashing</strong> client-side to calculate which node holds key K. The client connects directly to that server. If a node fails, the client marks it dead and remaps its keys onto the surviving nodes. Those keys start cold and the extra load can cascade, which is why Facebook sends failed hosts' traffic to a separate Gutter pool instead (see below).</p>\n\n      <h3>2. Redis Cluster: Smart Server Hash Slots</h3>\n      <p>Redis Cluster partitions its keyspace into <strong>16,384 Hash Slots</strong>. Every key is assigned a slot via CRC16:</p>\n      <pre><code>hash_slot = CRC16(key) mod 16384</code></pre>\n      <p>Slots are divided among master nodes (e.g., Node A holds slots 0..5460, Node B holds 5461..10922, Node C holds 10923..16383). Each master has one or more replica nodes.</p>\n\n      <h2>Redis Cluster Topology and Redirection Flow</h2>\n      <div class=\"mermaid\">\nflowchart TD\n    Client[\"Application Client\"] -->|\"GET 'user:994' (Hash slot: 8402)\"| NodeA[\"Redis Node A (Slots: 0..5460)\"]\n    NodeA -->|\"MOVED 8402 10.0.1.2:6379 (Client Cache Updated)\"| Client\n    Client -->|\"GET 'user:994' (Direct to Correct Node)\"| NodeB[\"Redis Node B (Slots: 5461..10922)\"]\n    NodeB -->|\"Bulk string reply: Returns Data\"| Client\n\n    subgraph ClusterMesh [\"Inter-Node Gossip Mesh (Port 16379)\"]\n      NodeA &lt;-->|\"Heartbeat / Failure Detection\"| NodeB\n      NodeB &lt;-->|\"Slot Rebalancing\"| NodeC[\"Redis Node C (Slots: 10923..16383)\"]\n      NodeA &lt;--> NodeC\n    end\n      </div>\n\n      <h2>Redirection Mechanics: MOVED vs. ASK</h2>\n      <ul>\n        <li><strong>MOVED Redirection:</strong> When a client queries a node for a hash slot owned by another node, the server returns <code>-MOVED 8402 10.0.1.2:6379</code>. The client updates its internal slot-to-node routing table and retries against the target node.</li>\n        <li><strong>ASK Redirection:</strong> Occurs during online slot migration. If slot 8402 is migrating from Node B to Node C, Node B returns <code>-ASK 8402 10.0.1.3:6379</code>. The client sends an <code>ASKING</code> command followed by the query to Node C, but does <em>not</em> update its permanent routing table.</li>\n      </ul>\n    \n<!-- enriched -->\n<h2>Worked example: sizing a cache cluster</h2><p>Suppose you need to cache 400 million user-profile objects averaging 1 KB, which is about 400 GB of values. Redis adds per-key overhead, typically around 50 to 100 bytes for small keys, so budget roughly 450 GB. Keep nodes at no more than about 70 percent memory use to leave room for fragmentation and replication buffers. That means about 640 GB of usable RAM. With 64 GB nodes that is 10 primaries, plus one replica each for availability, so 20 nodes.</p><p>For throughput, assume 1.2 million reads per second at peak. A single Redis primary commonly serves on the order of 100,000 or more simple GETs per second per core, depending on payload and pipelining. Ten primaries at about 120,000 each fit, but with no headroom for a hot slot. Either add primaries or serve reads from replicas where slightly stale reads are acceptable.</p><h2>Memcached-style versus Redis Cluster</h2><table><thead><tr><th>Aspect</th><th>Client-side hashing (Memcached, mcrouter)</th><th>Server-side slots (Redis Cluster)</th></tr></thead><tbody><tr><td>Routing</td><td>Client or proxy computes the node with a Ketama ring</td><td>Client caches the slot map. Servers answer MOVED or ASK</td></tr><tr><td>Resharding</td><td>Change the ring, which remaps about 1/N of keys, all cold</td><td>Migrate slots online. Keys move with their data</td></tr><tr><td>Replication</td><td>None built in. Done by proxy or by the application</td><td>Built-in async replicas with automatic failover</td></tr><tr><td>Data types</td><td>Opaque blobs</td><td>Rich structures, Lua, transactions within one slot</td></tr><tr><td>Consistency on failover</td><td>Data lost, then refilled from the DB</td><td>Acknowledged writes can be lost, because replication is asynchronous</td></tr></tbody></table><h2>How real systems do it</h2><ul><li><strong>Facebook</strong> puts mcrouter in front of memcache pools, splits pools by access pattern, and uses a small Gutter pool to absorb traffic for failed hosts instead of rehashing onto healthy ones.</li><li><strong>Netflix EVCache</strong> writes to a copy in every availability zone and reads locally, falling back to another zone on a miss.</li><li><strong>Twitter</strong> ran twemproxy and later Pelikan to multiplex connections, because thousands of app servers each holding connections to every cache node exhausted file descriptors.</li></ul><h2>Failure modes</h2><ul><li><strong>Connection storms:</strong> N clients times M nodes connections. Put a proxy or connection pooling in between.</li><li><strong>Rehash cascade:</strong> when a dead node's keys move to its neighbours, the neighbours can overload in turn. Gutter pools or replicas avoid this.</li><li><strong>Split-brain after a partition:</strong> Redis Cluster may accept writes on a minority primary until <code>cluster-node-timeout</code> expires, and those writes are lost when it rejoins.</li></ul>\n</div>",
    "keyTakeaways": [
      "Memcached uses client-side consistent hashing (Ketama) with zero server-to-server coordination.",
      "Redis Cluster partitions keys across 16,384 hash slots using CRC16, managed via internal gossip protocols.",
      "MOVED redirections update the client's routing cache; ASK redirections handle active slot migrations without downtime."
    ],
    "furtherReading": [
      {
        "title": "Redis Cluster Specification",
        "url": "https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/"
      },
      {
        "title": "Facebook Engineering: Scaling Memcache at Facebook",
        "url": "https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala"
      }
    ]
  },
  "cache-eviction-policies": {
    "title": "Cache eviction policies",
    "video": {
      "youtubeId": "ofoz6wwz2p0",
      "title": "Caching algorithms (LIFO vs LRU vs CLOCK)",
      "channel": "Ben Dicken",
      "why": "Ben Dicken's animated walk-through of LIFO, LRU and CLOCK shows why eviction order matters and how real systems approximate LRU cheaply. It is visual and precise.",
      "length": "12:52"
    },
    "videos": [
      {
        "youtubeId": "0kOCyjFKKL4",
        "title": "The Approximated LRU Algorithm | Redis Internals",
        "channel": "Arpit Bhayani",
        "role": "deep-dive",
        "why": "Arpit Bhayani explains Redis's sampled, approximated LRU: the pool of candidates, the accuracy versus CPU trade-off, and why exact LRU is avoided.",
        "length": "23:15"
      },
      {
        "youtubeId": "DMfr9jMLnz0",
        "title": "How MySQL's Midpoint Insertion Strategy Prevents Cache Pollution",
        "channel": "Arpit Bhayani",
        "role": "case-study",
        "why": "Shows MySQL InnoDB's midpoint insertion strategy, a real fix for the scan-pollution failure mode this lesson opens with.",
        "length": "10:47"
      }
    ],
    "intuition": "<p>Your fridge is full and you just bought groceries. LRU throws out whatever you touched longest ago. LFU throws out whatever you use least often. An admission policy asks at the door whether this new item is more valuable than the thing it would push out. A one-off party platter should not evict the milk you use every day.</p><p><strong>Mental model:</strong> eviction is a bet about the future made from the past. Recency bets that what was just used will be used again. Frequency bets that popular items stay popular. Good caches combine both and refuse to admit one-hit wonders.</p><ul><li><strong>Assuming LRU is always good.</strong> A single large scan, such as a report or a crawler, can flush the whole working set. Scan resistance (TinyLFU, segmented LRU, midpoint insertion) matters.</li><li><strong>Confusing eviction with expiry.</strong> TTL expiry removes stale data. Eviction removes valid data because memory is full. In Redis, <code>volatile-*</code> policies only evict keys that have a TTL.</li><li><strong>Reporting item hit ratio only.</strong> If big objects miss, byte hit ratio and backend load can be terrible even when item hit ratio looks fine.</li></ul>",
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>A scan of one-time report keys evicts frequently reused product records from a fixed memory budget.</p><h2>Mechanics</h2><p>LRU favors recent access; LFU favors repeated access; admission policies such as Window TinyLFU, notably used by Caffeine, compare estimated frequency before admitting an item. Redis offers approximate LRU and LFU policies, not Window TinyLFU. Measure item and byte hit rates on a representative trace.</p><h2>Failure mode</h2><p>Pure LRU suffers scan pollution, LFU can retain old popularity, and oversized entries can consume capacity even with a good item policy. Sampling-based approximations vary by workload.</p><h2>Trade-off</h2><p>More metadata and sophisticated admission can improve hit ratio but consume CPU and memory. TTL, explicit invalidation, entry size, and business value may matter more than recency alone.</p>\n<!-- enriched -->\n<h2>Worked example: scan pollution</h2><p>A 1 GB cache holds 1 million product records of 1 KB each. About 200,000 of them are hot and receive 90 percent of reads, and the cache hit ratio is 92 percent. A nightly export job then reads 2 million distinct order rows through the same cache.</p><ul><li><strong>Pure LRU:</strong> each export row becomes the most recently used entry, so after 1 million rows the hot set is gone. For the next few minutes the hit ratio drops towards zero and product reads fall through to the database. At 20,000 reads per second that is about 18,000 extra DB queries per second.</li><li><strong>Window TinyLFU (Caffeine):</strong> each export row enters a small admission window, about 1 percent of capacity. To move into the main cache, it must beat the victim's estimated frequency in a Count-Min sketch. Export rows have frequency 1 and hot products have high counts, so the export churns only the window, and the hit ratio stays close to 92 percent.</li><li><strong>Redis allkeys-lfu:</strong> uses a logarithmic 8-bit counter with decay (<code>lfu-log-factor</code>, <code>lfu-decay-time</code>). One-time keys start with a low count and are evicted first.</li></ul><h2>Policy comparison</h2><table><thead><tr><th>Policy</th><th>Metadata cost</th><th>Scan resistant</th><th>Adapts to shifting popularity</th><th>Used by</th></tr></thead><tbody><tr><td>FIFO</td><td>Minimal</td><td>No</td><td>Yes</td><td>Simple caches. S3-FIFO research shows FIFO variants can match LRU</td></tr><tr><td>LRU (exact)</td><td>Linked list plus hash map, with a lock on every hit</td><td>No</td><td>Yes</td><td>Many application libraries</td></tr><tr><td>CLOCK / sampled LRU</td><td>A bit or timestamp per entry</td><td>No</td><td>Yes</td><td>OS page caches, Redis allkeys-lru</td></tr><tr><td>LFU</td><td>A counter per entry</td><td>Yes</td><td>Poorly without decay</td><td>Redis allkeys-lfu, which uses decay</td></tr><tr><td>Segmented LRU / 2Q</td><td>Two lists</td><td>Mostly</td><td>Yes</td><td>InnoDB midpoint insertion, memcached segmented LRU</td></tr><tr><td>W-TinyLFU</td><td>Count-Min sketch plus windows</td><td>Yes</td><td>Yes, through hill climbing</td><td>Caffeine, Ristretto</td></tr></tbody></table><h2>Practical guidance</h2><ul><li>Replay a real access trace through candidate policies before choosing one. Caffeine's simulator and libCacheSim exist for this.</li><li>Cap maximum entry size. One 50 MB value can evict thousands of useful small entries.</li><li>In Redis, set <code>maxmemory</code> and an explicit <code>maxmemory-policy</code>. The default, <code>noeviction</code>, makes writes fail when memory is full.</li></ul>\n</div>",
    "keyTakeaways": [
      "Redis provides approximate LRU and LFU; Caffeine is a Window TinyLFU implementation.",
      "Evaluate item and byte hit rates on representative access traces.",
      "Eviction interacts with TTL, entry size, invalidation, and business value."
    ],
    "furtherReading": [
      {
        "title": "Ben Manes: Design of the Caffeine Cache (TinyLFU)",
        "url": "https://github.com/ben-manes/caffeine/wiki/Design"
      },
      {
        "title": "Redis Documentation: Key eviction",
        "url": "https://redis.io/docs/latest/develop/reference/eviction/"
      }
    ]
  },
  "ttl-expiration-and-cache-reapers": {
    "title": "TTL expiration and cache reapers",
    "video": {
      "youtubeId": "SyQTG0hXPxY",
      "title": "The Evolution of Redis Key Expiration Algorithms",
      "channel": "Redis",
      "why": "A RedisConf talk from the Redis team on exactly this topic: how lazy and active expiration evolved, how the sampling loop works, and its CPU versus memory trade-offs.",
      "length": "24:49"
    },
    "videos": [
      {
        "youtubeId": "yGdk0hmvkgo",
        "title": "Implementing DEL, EXPIRE, and Cleanup in Redis | Redis Internals",
        "channel": "Arpit Bhayani",
        "role": "deep-dive",
        "why": "Arpit Bhayani implements EXPIRE and background cleanup from scratch, which makes the lazy-plus-sampling design concrete.",
        "length": "27:23"
      },
      {
        "youtubeId": "wh98s0XhMmQ",
        "title": "Caching Pitfalls Every Developer Should Know",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "A short ByteByteGo overview of cache avalanche from synchronised TTLs, with jitter as the fix.",
        "length": "6:41"
      }
    ],
    "intuition": "<p>Think of a supermarket that stamps a best-before date on every yoghurt. Staff do not stand next to each pot waiting for it to expire. Instead they check the date when a customer picks one up (lazy expiry), and a clerk walks a few random aisles every so often throwing out old stock (the background reaper). Cleanup stays cheap, at the cost of some expired pots sitting on the shelf for a while.</p><p><strong>Mental model:</strong> a TTL is a promise that the cache will not return the value after the deadline. It is not a promise that the memory is freed at that moment.</p><ul><li><strong>Giving every key the same TTL.</strong> A million keys written at the same second expire at the same second, and the database gets a synchronised miss storm. Add random jitter, for example TTL plus or minus 10 percent.</li><li><strong>Expecting memory to drop immediately.</strong> Expired but untouched keys can linger until the reaper samples them. Watch the <code>expired_keys</code> and memory metrics.</li><li><strong>Using TTL as your only consistency tool.</strong> TTL bounds staleness but does not fix it. Pair it with explicit invalidation on writes.</li></ul>",
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>Millions of sessions expire near midnight, but deleting every key with an individual timer would overload the cache.</p><h2>Mechanics</h2><p>Caches commonly combine lazy expiration on access with bounded background sampling or scanning. Exact Redis sample counts, time budgets, and frequency depend on version and configuration, so monitor expired-but-resident memory and event-loop latency rather than relying on one fixed algorithm.</p><h2>Failure mode</h2><p>Synchronized TTLs can create a miss storm, lazy cleanup can retain memory, and different nodes can expire copies at different moments. Clock steps and replication behavior require product-specific testing.</p><h2>Trade-off</h2><p>Aggressive reaping frees memory sooner but steals CPU from requests. Jittered TTLs smooth load; soft and hard expiry separate freshness from the maximum staleness the product permits.</p>\n<!-- enriched -->\n<h2>Worked example: jittering a session TTL</h2><p>A login service writes 2 million sessions between 09:00 and 09:05 each morning with a fixed 12-hour TTL. At 21:00 they all expire within five minutes, which is about 6,700 expirations per second on top of normal traffic. Any user still active triggers a reload from the session store.</p><p>Add uniform jitter of plus or minus 30 minutes and the same 2 million expirations spread over about 65 minutes, which is roughly 510 per second. Better still, use a <strong>sliding TTL</strong> for active users, refreshing <code>EXPIRE</code> on access, so only idle sessions expire.</p><h2>How Redis actually expires keys</h2><ul><li><strong>Lazy:</strong> every read checks the key's expiry timestamp and deletes it if it has passed.</li><li><strong>Active:</strong> a periodic cycle, driven by <code>hz</code> (default 10 times per second), samples keys from the set of keys that have a TTL. If a large fraction of the sample has expired, it repeats, bounded by a CPU time budget. Redis 6 and later make the effort tunable through <code>active-expire-effort</code>.</li><li><strong>Replicas</strong> do not expire keys independently. The primary sends explicit DEL commands, although replicas hide logically expired keys from reads.</li></ul><h2>Soft TTL versus hard TTL</h2><table><thead><tr><th>Approach</th><th>Behaviour</th><th>Good for</th><th>Risk</th></tr></thead><tbody><tr><td>Hard TTL only</td><td>Key disappears and the next read misses</td><td>Simple data, low traffic</td><td>Stampede on hot keys</td></tr><tr><td>Soft plus hard TTL</td><td>After the soft TTL, serve the stale value and refresh asynchronously. After the hard TTL, the key is gone</td><td>Hot keys with tolerable staleness</td><td>Needs a refresh-owner mechanism</td></tr><tr><td>Sliding TTL</td><td>Each access extends the TTL</td><td>Sessions</td><td>Keys that are never idle never refresh their contents</td></tr><tr><td>No TTL plus explicit invalidation</td><td>Key lives until it is deleted on write</td><td>Data with reliable change events</td><td>A missed invalidation means stale data forever</td></tr></tbody></table><h2>Other systems</h2><ul><li><strong>Memcached</strong> expires lazily and also runs an LRU crawler that reclaims expired items in the background.</li><li><strong>Cassandra</strong> TTLs turn cells into tombstones that are only purged at compaction after <code>gc_grace_seconds</code>, so TTL-heavy tables can accumulate tombstones and slow reads.</li><li><strong>DynamoDB TTL</strong> deletes expired items in the background, typically within a few days, so queries must still filter on the expiry attribute.</li></ul>\n</div>",
    "keyTakeaways": [
      "Lazy expiry and bounded background cleanup avoid one timer per key.",
      "Redis cleanup details vary by version and configuration.",
      "Jitter and soft versus hard TTLs make load and staleness explicit."
    ],
    "furtherReading": [
      {
        "title": "Redis Documentation: EXPIRE and Key Expiration Algorithms",
        "url": "https://redis.io/docs/latest/commands/expire/"
      },
      {
        "title": "Antirez: Random notes on improving the Redis LRU algorithm",
        "url": "http://antirez.com/news/109"
      }
    ]
  },
  "cache-concurrency-control": {
    "title": "Cache concurrency control",
    "video": {
      "youtubeId": "wh98s0XhMmQ",
      "title": "Caching Pitfalls Every Developer Should Know",
      "channel": "ByteByteGo",
      "why": "A concise ByteByteGo explanation of cache stampede (thundering herd), penetration and avalanche, with locking and early refresh as fixes. It is the core of this lesson in under seven minutes.",
      "length": "6:41"
    },
    "videos": [
      {
        "youtubeId": "uS8f5SSYDck",
        "title": "Scaling Memcache at Facebook",
        "channel": "Gaurav Sen",
        "role": "deep-dive",
        "why": "Gaurav Sen walks through Facebook's memcache paper, including leases, which solve both the thundering herd and the stale-set race this lesson describes.",
        "length": "31:53"
      },
      {
        "youtubeId": "m4_7W4XzRgk",
        "title": "NSDI '13 - Scaling Memcache at Facebook",
        "channel": "USENIX",
        "role": "case-study",
        "why": "The original NSDI talk. The section on leases and stale sets is the real-world version of cache concurrency control.",
        "length": "23:18"
      }
    ],
    "intuition": "<p>A popular bakery runs out of croissants. If every customer in the queue walks into the kitchen to bake their own, the kitchen collapses. That is a cache stampede. The fix is for one person to bake while everyone else waits a moment or takes yesterday's croissant. The subtler bug: a slow baker who started before the recipe changed can put an old-recipe batch on the shelf after the new one went out.</p><p><strong>Mental model:</strong> on a miss, make sure only one worker rebuilds each key, and make sure an old rebuild can never overwrite a newer value.</p><ul><li><strong>Thinking a local mutex is enough.</strong> <code>singleflight</code> deduplicates within one process. With 200 app servers you can still get 200 concurrent DB loads.</li><li><strong>The delete-then-stale-set race.</strong> Reader loads the old row, writer updates the DB and deletes the key, then the reader sets the old value. Use leases or versioned sets.</li><li><strong>Locks without timeouts.</strong> If the lock holder dies, waiters hang. Every rebuild lock needs a TTL and a fallback (serve stale data or fail fast).</li></ul>",
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>A product catalog key expires under 10,000 concurrent reads.</p><h2>Mechanics</h2><p>Singleflight coalesces duplicate work within one process; cross-process coordination needs a lock, lease, queue, or refresh owner with a bounded wait and failure policy. Probabilistic early refresh such as XFetch reduces synchronized expiry probability but does not guarantee permanent residency. Cache-aside writes still need race handling.</p><h2>Failure mode</h2><p>An old reader can load the database, race with an update-and-delete, then repopulate stale data. A refresh owner can crash, waiters can pile up, and a distributed lease can expire while work continues.</p><h2>Trade-off</h2><p>Coalescing protects the database but adds waiting and coordination. Versioned values, delayed double deletion, write-through, or stale-while-revalidate each exchange consistency, write latency, complexity, and availability.</p>\n<!-- enriched -->\n<h2>Worked example: one hot key, 10,000 readers</h2><p>A catalogue key takes 200 ms to rebuild from the database and receives 10,000 reads per second across 100 app servers. With no protection, when it expires every request in the 200 ms window misses, which is about 2,000 concurrent identical DB queries.</p><ul><li><strong>Per-process singleflight:</strong> at most one load per server, so 100 concurrent loads. That is 20 times better, but still 100.</li><li><strong>Distributed rebuild lock</strong> (<code>SET lock:key token NX PX 3000</code>): one load cluster-wide. The other callers either serve the stale value or poll briefly.</li><li><strong>Probabilistic early refresh (XFetch):</strong> each reader refreshes early with a probability that rises as expiry approaches, weighted by rebuild cost. Typically one reader refreshes shortly before expiry, and nobody ever sees a miss.</li></ul><h2>The stale-set race and leases</h2><div class=\"mermaid\">sequenceDiagram\n  participant Reader\n  participant Cache\n  participant DB\n  participant Writer\n  Reader->>Cache: get k is a miss so lease L1 is issued\n  Reader->>DB: read old value v1\n  Writer->>DB: update row to v2\n  Writer->>Cache: delete k which invalidates lease L1\n  Reader->>Cache: set k to v1 using lease L1\n  Cache-->>Reader: rejected because lease L1 is no longer valid\n</div><p>Facebook's memcache issues a lease token on a miss. A delete invalidates outstanding leases, so the late set of v1 is rejected. The same token also rate-limits rebuilds: memcache hands out at most one token per key every 10 seconds, and other clients briefly wait and retry.</p><h2>Technique comparison</h2><table><thead><tr><th>Technique</th><th>Stops stampede</th><th>Stops stale set</th><th>Cost</th></tr></thead><tbody><tr><td>Local singleflight</td><td>Per process only</td><td>No</td><td>Trivial</td></tr><tr><td>Distributed lock with TTL</td><td>Yes</td><td>No</td><td>Extra round trip. Stale lock holder</td></tr><tr><td>Leases (memcache)</td><td>Yes</td><td>Yes</td><td>Needs cache support</td></tr><tr><td>Versioned compare-and-set</td><td>No</td><td>Yes</td><td>Needs version from the DB row</td></tr><tr><td>Stale-while-revalidate</td><td>Yes, readers never wait</td><td>No</td><td>Serves bounded staleness</td></tr><tr><td>XFetch early refresh</td><td>Mostly</td><td>No</td><td>Tiny. Probabilistic</td></tr><tr><td>Delayed double delete</td><td>No</td><td>Reduces the window</td><td>Heuristic. The delay is a guess</td></tr></tbody></table>\n</div>",
    "keyTakeaways": [
      "Singleflight coalesces local work; cross-process refresh needs additional coordination.",
      "Cache-aside delete can race with a stale reader that repopulates the key.",
      "Probabilistic early refresh reduces stampedes but does not guarantee residency."
    ],
    "furtherReading": [
      {
        "title": "Vattani et al.: Optimal Probabilistic Cache Invalidation (XFetch Paper)",
        "url": "https://www.vldb.org/pvldb/vol8/p886-vattani.pdf"
      },
      {
        "title": "Go Singleflight Package Documentation",
        "url": "https://pkg.go.dev/golang.org/x/sync/singleflight"
      }
    ]
  },
  "cache-availability-and-database-fallback": {
    "title": "Cache availability and database fallback",
    "video": {
      "youtubeId": "Rzdxgx3RC0Q",
      "title": "\"Caching at Netflix: The Hidden Microservice\" by Scott Mansfield",
      "channel": "Strange Loop Conference",
      "why": "A Strange Loop talk by Scott Mansfield on Netflix EVCache: cross-zone replication, local reads with remote fallback, and how Netflix keeps serving when a cache zone fails.",
      "length": "35:22"
    },
    "videos": [
      {
        "youtubeId": "xrizarXJgC8",
        "title": "How to avoid cascading failures in a distributed system 💣💥🔥",
        "channel": "Gaurav Sen",
        "role": "deep-dive",
        "why": "Gaurav Sen explains how losing a shared dependency cascades into overload, and covers rate limiting, load shedding and backoff. That is the protection the database needs when the cache fails.",
        "length": "18:06"
      },
      {
        "youtubeId": "wh98s0XhMmQ",
        "title": "Caching Pitfalls Every Developer Should Know",
        "channel": "ByteByteGo",
        "role": "intro",
        "why": "A quick ByteByteGo primer on cache avalanche and cache-down scenarios, with the standard mitigations.",
        "length": "6:41"
      }
    ],
    "intuition": "<p>A dam holds back a river so the town below only sees a trickle. If the dam fails, the full river arrives at once. A cache in front of a database is that dam. At a 99 percent hit ratio the database sees 1 percent of traffic, and if the cache vanishes it sees 100 times its normal load in an instant.</p><p><strong>Mental model:</strong> design for the day the cache is gone. Decide in advance what gets served stale, what gets rejected, and how much the database is allowed to take.</p><ul><li><strong>Falling back to the DB without a limit.</strong> This turns a cache outage into a database outage. Put a concurrency cap or token bucket on the fallback path.</li><li><strong>Long cache timeouts.</strong> A 2-second timeout on a dead Redis ties up every worker thread. Use millisecond-scale timeouts and a circuit breaker around the cache client.</li><li><strong>Forgetting recovery.</strong> A cache that comes back empty causes a second miss storm. Warm it up gradually, or shift traffic back slowly.</li></ul>",
    "content": "<div class=\"lesson-content\"><h2>Concrete scenario</h2><p>A cache normally absorbs 99 percent of 100,000 reads per second, then becomes unreachable.</p><h2>Mechanics</h2><p>Protect the database with a concurrency limit or rate limiter based on measured capacity. Fail fast on cache timeouts, serve explicitly bounded stale local data where allowed, and reject excess work. A soft TTL starts refresh; a hard TTL is the product limit after which stale data must not be served.</p><h2>Failure mode</h2><p>Unrestricted fallback can overload the database, but a high hit ratio alone does not prove how the database was provisioned. Failover may expose cold replicas or stale data, and retrying cache calls can exhaust workers.</p><h2>Trade-off</h2><p>Stale responses preserve availability only for data whose correctness permits them. Redundant cache clusters reduce outage probability but add cost, failover complexity, replication lag, and recovery miss storms.</p>\n<!-- enriched -->\n<h2>Worked example: sizing the fallback</h2><p>Traffic is 100,000 reads per second with a 99 percent hit ratio, so the database normally serves 1,000 qps. Load tests show it saturates at 4,000 qps, with p99 latency degrading above 3,000. If the cache disappears:</p><ul><li>Unprotected, the database receives 100,000 qps, 25 times its capacity. Connection pools fill, latency explodes, and requests for uncached data fail too.</li><li>With a fallback limiter of 2,500 qps spread across app servers (for example 25 qps each on 100 instances), the database stays healthy. The remaining 97,500 rps must be served from an in-process stale copy, served as a degraded response, or rejected quickly with 503 and Retry-After.</li><li>If a local L1 with a 60-second soft TTL covers 80 percent of keys, only about 20,000 rps need the database, and the limiter decides which 2,500 of those get through.</li></ul><h2>Options when the cache is down</h2><table><thead><tr><th>Strategy</th><th>Availability</th><th>Correctness</th><th>Cost</th></tr></thead><tbody><tr><td>Unlimited DB fallback</td><td>Collapses under load</td><td>Fresh while it lasts</td><td>None, until the outage</td></tr><tr><td>Rate-limited fallback plus fast reject</td><td>Partial</td><td>Fresh for admitted requests</td><td>Limiter and tuning</td></tr><tr><td>Serve stale from L1 within a hard TTL</td><td>High</td><td>Bounded staleness</td><td>Memory on every instance</td></tr><tr><td>Replicated cache across zones</td><td>High</td><td>Replication lag</td><td>Two to three times the cache cost</td></tr><tr><td>Gutter pool (Facebook)</td><td>High</td><td>Short TTLs limit staleness</td><td>A small spare cache pool</td></tr><tr><td>Static degraded response</td><td>Highest</td><td>Feature partially off</td><td>Product design effort</td></tr></tbody></table><h2>How real systems do it</h2><ul><li><strong>Netflix EVCache</strong> writes to every availability zone and reads from the local zone. On a miss or timeout it reads from another zone before going to the source of truth.</li><li><strong>Facebook</strong> routes requests for a failed memcache host to a small Gutter pool with short TTLs instead of rehashing onto healthy hosts, which avoids a cascade.</li><li><strong>Circuit breaker around the cache client:</strong> after repeated timeouts, skip the cache immediately and go straight to the rate-limited fallback, rather than waiting on every request.</li></ul><h2>Recovery</h2><p>When the cache returns empty, the hit ratio climbs from 0 percent. Keep the fallback limiter on during warm-up. Optionally pre-warm the top N keys from access logs, and shift traffic back in steps (10, 25, 50, 100 percent).</p>\n</div>",
    "keyTakeaways": [
      "Bound database fallback by measured concurrency or rate capacity.",
      "Hard TTL defines when stale data must no longer be served.",
      "Cache redundancy adds failover, lag, recovery, and cost trade-offs."
    ],
    "furtherReading": [
      {
        "title": "Martin Fowler: Circuit Breaker Pattern",
        "url": "https://martinfowler.com/bliki/CircuitBreaker.html"
      },
      {
        "title": "Amazon Builders' Library (Jacob Gabrielson): Avoiding fallback in distributed systems",
        "url": "https://builder.aws.com/content/3EuS9Sakq7L3VLQIF3qzfMfke1Y/avoiding-fallback-in-distributed-systems"
      }
    ]
  }
};
