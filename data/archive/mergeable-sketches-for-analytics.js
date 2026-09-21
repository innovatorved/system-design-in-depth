window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["mergeable-sketches-for-analytics"] = `# Mergeable sketches for analytics

A mergeable summary lets workers combine retained state without sending every original event to one reader. Regions, shards and time buckets can each produce a summary, then supply it to a larger report.

We'll choose a summary by its query, compare a merged build with one pass over the input, and see what happens when a partition arrives twice.

## Start with the query

| Required answer | Candidate | Detail it must preserve |
|---|---|---|
| Approximate distinct IDs | HLL | Compatible identity and hash observations |
| Estimated frequency of a supplied key | Count-Min Sketch | Counter mass and matching row hashes |
| Frequent items | A frequent-items sketch | Candidate identities and its frequency guarantees |
| Latency percentiles | A suitable quantile sketch | Distribution evidence and observation weights |
| Exact integer-set operations | Roaring bitmap | Exact integer membership |

Roaring is a compressed exact set representation, not an approximate count. HLL supports union, while other distinct-count families, such as Theta, support additional set operations. These choices are not interchangeable simply because all can combine stored state.

Local summaries reduce transport and allow precomputed rollups or “last N buckets” queries. They can also rebuild a larger rollup from retained smaller summaries. A new metric or dimension may still require raw events: a summary cannot restore information it never kept.

## Compatible evidence

We split the twelve document-ID occurrences used in the HLL lesson into a left partition containing the first six and a right partition containing the remaining six. Their arrival occurrences are disjoint, although some document IDs appear in both. Processing their union gives twelve occurrences and nine distinct IDs under the same string-identity rule.

For Bloom filters, merge corresponding bits with logical OR. If either input has set a position, the combined filter sets it. For HLL, merge corresponding registers by maximum. Each combined register then holds the strongest observation seen by either partition.

For a count-min sketch, add corresponding counters. Each counter receives the sum of the contributions assigned to it by both partitions. That operation represents combined event mass only when each contribution belongs in the intended population with the multiplicity being added.

These rules require compatible layouts. The Bloom filter needs the same array length, probe count, hash scheme, and input encoding. HLL needs the same precision, hash width, and register interpretation. Count-min needs matching matrix dimensions and row hashes. Matching payload size alone does not establish compatibility.

## The local merge path

Our [replay](/course-assets/system-design/m18-sketches.py) builds each summary separately for the two partitions, merges them, and compares their retained states against a single pass over the whole stream. It also attempts incompatible merges, which its wrappers explicitly reject. No network transport or distributed coordination is implemented here.

The diagram separates the observed partition summaries from the external contribution receipts used later in the replay. A receipt identifies a partition already included in a total; it is application state, with a different role from hash registers or shared counters.

\`\`\`mermaid
flowchart TD
    accTitle: Merge summaries over a declared population
    accDescr: Left and right partitions produce compatible summaries. The merger combines their state and compares it with a single pass over the whole input. Contribution receipts are separate application state for additive summaries.
    left[First six arrivals] --> ls[Left summary]
    right[Last six arrivals] --> rs[Right summary]
    ls --> merge[Compatible merge]
    rs --> merge
    receipts[Contribution receipts] -.->|For additive summaries| merge
    merge --> result[Combined state]
    whole[Single pass over all arrivals] --> check[Compare retained states]
    result --> check
\`\`\`


## Unequal reservoirs

A reservoir holds a fixed-size uniform sample of arrivals. Combining samples needs the original population sizes as well as the retained items.

Consider a capacity-one reservoir from a left partition with one original item and another from a right partition with three original items. The left sample always contains its sole item. The right sample chooses each of its originals with probability one third.

If we concatenate those two samples and choose either stored item uniformly, the left original wins with probability one half. Each right original wins with probability one third times one half, or one sixth. A uniform sample from all four originals would give each probability one quarter.

The replay enumerates the possible sample-and-selection paths using exact fractions and prints those probabilities. It demonstrates why equal treatment of retained samples loses the populations they represent. A correct distributed sampling algorithm needs appropriate population accounting and a defined merge procedure; concatenation alone supplies neither.

The capture compares the partition summaries and prints the unequal-reservoir probabilities. Save the replay as \`m18-sketches.py\` and run its standard-library mode. It uses the same implementations as the individual sketch lessons; the count-min details follow later in this module.

\`\`\`bash title="terminal"
python3 m18-sketches.py merge
\`\`\`

\`\`\`output
left_events=6 right_events=6 total=12 exact_distinct=9
Bloom merged matches single: True
HLL merged matches single: True
CMS merged matches single: True
duplicate HLL partition changes registers: False
duplicate CMS partition row sums: [18, 18, 18]
Bloom incompatible merge: rejected
CMS incompatible merge: rejected
HLL incompatible merge: rejected
with external partition receipts row sums: [12, 12, 12]
unequal reservoir enumerated probabilities: {'L': '1/2', 'R1': '1/6', 'R2': '1/6', 'R3': '1/6'}
uniform target per original item: 1/4
\`\`\`

All three merged states match their corresponding single-pass states for the correctly split population. That equality says the merge operation preserves this representation on these contributions. It does not establish that a real ingestion service delivered each original event exactly once.

## A repeated partition

Merging the right HLL partition again leaves its registers unchanged because taking a maximum with the same observation is idempotent. Bloom OR has the same duplicate-state property. Repeating the same bits or register observations leaves their state unchanged.

Adding the right count-min partition again raises each row sum from twelve to eighteen. The repeated six-occurrence contribution has been counted twice. This is the correct result for counter addition on the delivered inputs, and the wrong population if the application intended each partition to contribute once.

The replay then uses an external set of partition receipts while processing left, right, and right again. It skips the repeated receipt and recovers row sums of twelve. This is a sequential in-memory illustration; it does not implement a durable atomic transaction between checking a receipt and recording the merged result.

If a worker crashes between those actions, a real service needs to decide whether to retry or skip without losing or doubling contributions. A merge function cannot settle that question because the failure occurs around its invocation. The event-processing module owns those identity and recovery boundaries.

## Distribution summaries

A t-digest retains weighted groups of numerical observations, called centroids, for percentile queries. The [[wiki/tdigest-quantile-sketch|later t-digest lesson]] examines the algorithm and this package's limitations. Here the narrower question is whether partition merging preserves the intended weight.

Our chosen population contains 360 values: 0 through 89 three times each, followed by 100 through 990 in steps of ten. Split it into two disjoint 180-observation partitions. Compare a single build, both merge orders and a repeated right partition.

For this optional package replay, save [the t-digest script](/course-assets/system-design/m18-tdigest.py) and [its pinned requirements](/course-assets/system-design/m18-tdigest-requirements.txt) beside each other. Use Python 3.12 and a new virtual environment:

\`\`\`bash title="terminal"
python3.12 -m venv .venv-sketch-merge
.venv-sketch-merge/bin/python -m pip install -r m18-tdigest-requirements.txt
\`\`\`

The wrapper checks \`tdigest==0.5.2.2\` and its dependency versions, fixes the random seed, and rejects a chosen incompatible parameter pair before calling the package merge.

\`\`\`bash title="terminal"
.venv-sketch-merge/bin/python m18-tdigest.py merge
\`\`\`

\`\`\`output
disjoint value partitions: left=180 right=180 total=360
single: weight=360 centroids=102 p50=59.500000 p99=959.000000
L+R: weight=360 centroids=84 p50=59.500000 p99=959.000000
R+L: weight=360 centroids=83 p50=59.500000 p99=959.000000
L+R+R: weight=540 centroids=81 p50=74.557143 p99=968.000000
wrapper incompatible delta: rejected before package merge
exact nearest-rank p50=59 p99=960 for original360
\`\`\`

The correctly merged digests retain total weight three hundred sixty and match the printed single-build percentile estimates on this fixture. Their centroid counts differ, including between the two merge orders. Equal queried values here therefore do not imply identical retained state or universal order independence.

The repeated right partition raises total weight to five hundred forty and changes the median and ninety-ninth-percentile estimates. The summary has faithfully accepted extra weight, even though the original population remains unchanged. Keeping contribution identities outside the digest is necessary when that duplicate is unintended.

| Summary | Compatible merge | Repeating identical contribution |
|---|---|---|
| Bloom filter | Bitwise OR | Bits unchanged |
| HLL | Register maxima | Registers unchanged |
| Count-min | Counter sums | Counts increase |
| This t-digest | Weighted centroid merge | Weight increases; estimates may change |

## Store enough to interpret the bytes

A stored summary needs its algorithm/version, parameters, encoding and identity rule. Its envelope also needs the metric, bucket boundaries, source partition/range and contribution identity. Test serialized compatibility across the actual producer and consumer library versions; a common algorithm name or payload size is insufficient.

The replay checks a few wrapper fields and compares in-memory arrays. It does not implement cross-language serialization or durable receipts. DataSketches and Roaring publish compatibility mechanisms for their own representations; those do not make our Python arrays directly interchangeable with them.

For additive summaries, a contribution ID must name immutable content. If a worker sends a revised cumulative partition under a new ID, adding it to the earlier version counts the overlap again. Replace that partition's retained version and recompute the union, or publish disjoint deltas with their own receipt protocol.

Persist the receipt with the aggregate change, or use a recoverable publication scheme that makes a retry unambiguous. Also verify that all expected partitions are present. Duplicate-safe merging alone cannot distinguish an empty partition from a lost one.

Choose exact aggregation while the population fits and exact answers are needed. When summaries are justified, retain controls for their error and a fallback for unsupported queries or broken versions. The [[wiki/bucketed-time-window-aggregation|next lesson]] assigns events to buckets and defines when their published answers may stop changing.
`;
