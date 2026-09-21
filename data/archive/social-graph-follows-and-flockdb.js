window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["social-graph-follows-and-flockdb"] = `# Social graph follows and FlockDB

Ada follows Bo. Opening Ada's following list asks for edges leaving Ada; publishing Bo's post asks for edges entering Bo. The relationship is the same, but the two reads need different access paths.

Most follow-graph work is shallow: test one relationship, list neighbors, page through followers, or count them. Start with those operations. A graph-shaped data model does not automatically require arbitrary graph traversal.

## Store the direction, then the relationship rule

The [[wiki/social-network-database-modeling|previous model]] uses \`(follower, followee)\` as a unique pair. A mutual friendship would need a different acceptance rule or two confirmed directions. A reverse lookup for Ada following Bo is not a second friendship and does not mean Bo follows Ada.

A broader \`relations(source, type, target, state, position)\` model can support follows, blocks or mutes when their storage needs are shared. Include the type in relationship identity. Keep each type's permissions and state transitions explicit: a pending follow request and an active block are not interchangeable just because both connect accounts.

A sort position supports ordered listing. State can distinguish active, removed or archived edges. Extra metadata belongs to the relationship it describes; it should not turn every pair into an unvalidated bag of unrelated values.

## Why the reverse lookup changes after sharding

On one database, a forward index on \`(follower, followee)\` and a reverse index on \`(followee, follower)\` can serve both reads. The database maintains the indexes when a row changes.

Now partition the rows by follower. Ada's outgoing list stays on Ada's partition. Bo's followers can be spread across all the other users' partitions. A local index on \`followee\` helps inside each partition, but does not tell the router which partitions contain Bo's incoming edges.

A separately placed reverse list solves that routing problem. The forward entry is grouped by Ada, and its reverse entry is grouped by Bo.

\`\`\`mermaid
flowchart TB
    accTitle: One follow has two access paths
    accDescr: Ada following Bo creates a forward entry grouped by Ada and a reverse entry grouped by Bo. Both entries describe the same directed relationship.
    E[Ada follows Bo] --> F[Grouped by Ada]
    E --> R[Grouped by Bo]
    F --> A[Following list<br/>contains Bo]
    R --> B[Follower list<br/>contains Ada]
\`\`\`

If Bo also follows Ada, that is a second logical relationship with its own forward and reverse entries: four entries for two follows. The cost is two logical entries per relationship before indexes and replication, plus the work of keeping them consistent. It is not a universal two-times storage estimate.

## What FlockDB chose

Twitter's 2010 FlockDB design used MySQL-backed adjacency lists, indexed and partitioned in both directions. It targeted large neighbor lists, ordered pagination and set operations rather than multi-hop graph walks. Its position field supported ordered reads; removed and archived states let it retain edges without exposing them as active follows.

That design also accepted retried and out-of-order writes using operation ordering. It did not make an arbitrary pair of remote database writes into a single SQLite transaction. The archived repository is no longer maintained; this is a historical design to understand, not a current package recommendation.

The useful distinction survives the implementation: listing direct followers is different work from finding paths, communities or recommendations across many hops. Choose an online adjacency service and an offline graph-analysis pipeline according to the queries each must answer.

## Keep the two representations consistent

Our [social example](/course-assets/system-design/m22-social.py), with its [shared helpers](/course-assets/system-design/m22-common.py), deliberately stores two tables in one SQLite database. One transaction writes the forward row, reverse row and operation receipt. An exception between the row writes rolls everything back. This exposes the maintenance obligation without pretending to implement distributed FlockDB.

The six-account graph starts with Ada and Dee following Bo and Cy, plus Eli and Fay following Cy. The replay interrupts Eli's new follow of Bo, retries it, and then unfollows. A delayed retry of the old follow returns its historical receipt without restoring the edge.

\`\`\`bash title="terminal"
python3 m22-social.py graph
\`\`\`
\`\`\`output
Ada follows: Bo,Cy
Cy followers: Ada,Dee,Eli,Fay
interrupted Eli->Bo: forward=False reverse=False
retry committed: {"accepted_state":true,"duplicate":true}
delayed old follow: current=False
absent unfollow: {"accepted_state":false,"duplicate":false}
changed operation: 409
committed forward/reverse pairs: 6 6
\`\`\`

The successful retry is repeated before printing, hence \`duplicate:true\`. Reusing its operation identity with different input returns conflict. The receipt describes an accepted operation; the current adjacency list describes the relationship now. The final check compares complete forward and reverse pair sets, not just equal counts.

Across independent stores, choose a consistency and recovery contract. A reverse projection updated asynchronously needs retained changes, duplicate handling, an applied position and repair. If it drives delivery, lag can omit recipients. A cached follower count cannot reconstruct who is missing.

## Page by a stable boundary

Offset pagination repeatedly skips earlier rows. An indexed cursor can seek to the last returned ordering key instead. Include a tie-breaker: several follows can share one timestamp.

For a relational extension with non-null \`created_at\` and a unique \`(followee, follower)\` pair, use an index beginning with \`(followee, created_at DESC, follower DESC)\`. After returning the row at \`(100, 'Eli')\`, the next-page query is:

\`\`\`sql title="Follower page after a cursor"
SELECT follower, created_at
FROM follows_by_time
WHERE followee = :author
  AND (created_at, follower) < (:last_time, :last_id)
ORDER BY created_at DESC, follower DESC
LIMIT :page_size;
\`\`\`

This is a proposed time-ordered table, separate from the example's alphabetically sorted lists. If Cy's followers sort as \`Fay@100, Eli@100, Dee@99, Ada@99\`, a two-row first page ends at \`(100, 'Eli')\`; the next page returns Dee and Ada. A one-row page ending at \`(100, 'Fay')\` still reaches Eli because the ID breaks the timestamp tie.

Keyset pagination avoids deep offset scans when an appropriate index is used. It does not freeze a changing graph. If an edge is removed or its sort position changes between requests, define whether the caller accepts a live list or needs a versioned snapshot. The cursor must also belong to the requested account and relationship type.

## Handle a very large follower list deliberately

A single popular account can dominate one reverse partition. Isolating it protects other accounts, but does not divide its own workload. Bucketing that list spreads storage and writes; reads now need to merge ordered bucket pages and carry enough cursor state to resume them.

Cache frequently read first pages when their freshness policy permits it. Separate an approximate public count from exact edge membership, and batch recipient enumeration for downstream delivery. Preserve current access rules when a cached list is used for a protected action.

Once outgoing and incoming relationships have clear meanings, the [[wiki/feed-generation-push-pull-hybrid|feed-generation comparison]] can decide whether to write feed references when a post appears or collect posts when a reader opens the page.
`;
