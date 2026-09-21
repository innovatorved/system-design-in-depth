window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["caching-layers"] = `# Caching layers

A cache keeps an answer so the next request can avoid some work: reading a database row, calling another service, resizing an image or recomputing a report. The useful question is which work a hit removes. That determines where the copy belongs.

We’ll compare the places a cache can live, follow a read that fills one, and distinguish a database’s page cache from a disposable SQL table.

## Keep the source separate

Suppose a catalog service copies product \`p7\` into a cache. Finding a usable copy is a **hit**; finding none is a **miss**. The product database remains the source of truth. Losing the cached copy should leave somewhere to recover the answer.

![A source ledger retains product p7 while an arrow labeled copy points to a separate cache card held by a reader.](/course-assets/system-design/illustrations/cache-copy.webp)

That makes the copy replaceable, but does not make its contents permanently correct. If the product changes, the old copy needs a rule for when readers must stop using it. Name the allowed staleness before choosing a cache lifetime.

The key must distinguish answers that are different. A public product description might use its product ID and locale. An account’s private report also needs its account boundary; a report-name-only key could expose one customer’s data to another.

## Choose the work to avoid

These layers are alternatives you can combine when each earns its place. They are not a checklist of infrastructure every request should traverse.

| Placement | A hit can avoid | What needs care |
| --- | --- | --- |
| Client | Fetching or recomputing local data | Stale state and switching accounts |
| CDN | Sending a reusable public response from the origin | Invalidation and personalized responses |
| Gateway or reverse proxy | Running the application for a reusable response | Authorization and correct request matching |
| API process memory | A repeated lookup or computation | Separate copies and fills in every instance |
| API disk | Regenerating a larger artifact | Space limits and cleanup across deployments |
| Redis or Memcached | Repeated source lookups across instances | Network delay, outages and invalidation |
| Database buffer pool | Reading database pages from storage | Engine-specific memory management |
| Materialized view | Repeating a join or aggregation | Refresh cost and out-of-date results |

A buffer-pool hit still leaves the database executing the query. A cached query result can avoid that execution. A reusable HTTP response can skip the application entirely. Each moves the boundary of work saved, and therefore the behavior being skipped.

For example, our [[wiki/url-shortener-system-design|shortener design]] records every accepted redirect reaching the application. Caching its destination lookup preserves that write. Reusing a whole redirect before it reaches the application would bypass it.

An HTTP cache also needs the response’s reuse rules, not just a URL lookup. A response that varies by a request header needs matching variants; private and public answers must not become interchangeable.

## Follow a cache-aside read

With **cache-aside**, the application checks the cache, reads the source on a miss and saves the result for another request. This diagram follows a successful lookup of an existing product. It omits authorization and error handling to isolate the fill.

\`\`\`mermaid
sequenceDiagram
    accTitle: Filling a product cache on a miss
    accDescr: The application misses in the cache, reads product p7 from the database, and stores a copy. The database remains the source of truth.
    participant A as Application
    participant C as Cache
    participant D as Product database
    A->>C: Get p7
    C-->>A: Miss
    A->>D: Read p7
    D-->>A: Product
    A->>C: Store product copy
    C-->>A: Stored
\`\`\`

A process-local map avoids a network exchange. A shared cache lets different application instances reuse the same fill and can outlive an application restart. Shared ownership adds a dependency, so choose it when that reuse is worth the cost.

For changing data, you might delete a copy after a source update, give it a time limit, or update it through the write path. Writing both stores does not by itself make them atomic: a failure or concurrent fill can leave them disagreeing. The concurrency lesson follows that race.

## A SQL-shaped cache

MySQL’s \`MEMORY\` engine offers a transient table with SQL access. It can suit a disposable derived dataset when retaining an existing schema and query shape simplifies the application. The [MEMORY engine recording](/system/archive/caching-layers?recording=sd-60) explores this option.

In MySQL 8.4, the rows disappear on server restart while the table definition survives. This differs from InnoDB’s buffer pool, which holds pages belonging to durable tables. A materialized view is different again: it stores a query’s results until refreshed.

\`MEMORY\` lacks transactions, uses table-level locks and cannot store \`TEXT\` or \`BLOB\` columns. Even \`VARCHAR\` occupies a fixed-length row representation. Table size is bounded by configured memory limits; extra rows do not automatically spill to disk.

SQL reuse can be convenient, but these restrictions may cost more than they save. Compare the actual queries and schema with InnoDB or direct key access before assuming an in-memory table will be faster.

For any placement, measure the avoided operation, miss cost and total response time. A high hit ratio helps only if it removes meaningful work and the answers remain usable.
`;
