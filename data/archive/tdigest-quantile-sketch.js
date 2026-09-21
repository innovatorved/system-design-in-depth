window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["tdigest-quantile-sketch"] = `# T-digest quantile sketches

A service can have a comfortable p50 latency and an unpleasant p99. The median describes the middle request; the high percentile exposes slower requests that an average can hide. To query those percentiles across many hosts, we need more information than one average or p99 per host.

A t-digest keeps a compact, approximate description of a numerical distribution. We will look at what it stores, how local digests combine, and why a plausible percentile still needs an accuracy check.

## Store weighted groups

For an exact reference, choose the nearest-rank convention: sort N observations and take the one-based position \`ceil(q × N)\`, where q is the requested fraction. At q = 0.99, that gives p99. Retaining and sorting every observation becomes costly for large streams and many dashboard queries. Exact frequency counts are another option when the value domain is small enough.

A t-digest compresses observations into **centroids**. Each stores a mean and a weight: the number of observations it represents. For example, grouping 10, 11 and 12 yields mean 11 and weight 3. That record preserves the group's mass and mean, but not its individual values.

The distinctive choice is where to spend detail. T-digest limits centroid weights more tightly near the distribution's ends and allows larger groups near the middle. This helps preserve tail resolution without retaining every observation. The scale function, insertion order and interpolation rules still affect the result.

Each host can build a local digest. A backend combines compatible weighted centroids, recompresses them and queries the combined distribution. The weights prevent a quiet host from receiving the same influence as a busy one. This merge does not recognize duplicated observations or overlapping uploads; [[wiki/mergeable-sketches-for-analytics|the merge lesson]] covers that accounting separately.

## What a query returns

A percentile query uses the ordered centroids and their cumulative weights, often interpolating between them. Its answer can lie between values that actually occurred. That is different from our nearest-rank reference, which always returns an observed value.

Check two kinds of error:

- **Value difference:** how far the estimate is from the exact reference, in the measurement's units.
- **Rank distance:** how far the estimate lies from the requested fraction of the population.

For ties, use a rank interval: the fraction strictly below the estimate through the fraction at or below it. The rank distance is zero if q lies inside that interval; otherwise it is the distance to the closer endpoint. This lets an observed value represent a whole block of equal observations.

A small rank error can mean a large latency error in a sparse tail. A small latency difference can also cross a large repeated mass. Neither measure substitutes for the other.

## Run one pinned implementation

The example uses Cam Davidson-Pilon's Python \`tdigest\` package, version 0.5.2.2. It is a reproducible implementation study, not a claim that every package called t-digest has the same behavior.

This package uses an admission threshold \`4 × N × delta × q_c × (1 − q_c)\`, where q_c is a centroid's midpoint rank and N is total weight. It permits smaller centroid weights toward the ends. Here delta is a compression parameter, not a failure probability. We use delta 0.05 and K 25; the package triggers compression when its centroid count exceeds \`K / delta\`.

Download the [quantile example](/course-assets/system-design/m18-tdigest.py) and [pinned requirements](/course-assets/system-design/m18-tdigest-requirements.txt) into one directory, keeping their filenames. The [package license](/course-assets/system-design/m18-tdigest-license.txt) accompanies the dependency. The setup below requires Python 3.12.

The chosen input has 360 dimensionless observations: 0 through 89 repeated three times each, then 100 through 990 in steps of 10. These are constructed values, not measured service latencies. The example processes forward, reverse and shuffled orders, resetting the package's random seed to 23 for each build.

In the output, \`m\` is centroid mean and \`c\` is its weight. Centroid count measures stored entries, not complete memory allocation.

\`\`\`bash title="terminal"
python3.12 -m venv .venv-quantiles
.venv-quantiles/bin/python -m pip install -r m18-tdigest-requirements.txt
.venv-quantiles/bin/python m18-tdigest.py quantiles
\`\`\`

\`\`\`output
tdigest=0.5.2.2 accumulation-tree=0.6.4 pyudorandom=1.0.0
values=360; 0..89 each repeated3, then 100..990 step10; delta=0.05 K=25 seed=23
forward: centroids=102 total_weight=360 first={'m': 0.0, 'c': 3.0} last={'m': 990.0, 'c': 1.0}
  q=0.50 nearest_rank=59 estimate=59.500000 value_difference=0.500000 rank_distance=0.000000
  q=0.90 nearest_rank=630 estimate=635.000000 value_difference=5.000000 rank_distance=0.000000
  q=0.95 nearest_rank=810 estimate=815.000000 value_difference=5.000000 rank_distance=0.000000
  q=0.99 nearest_rank=960 estimate=959.000000 value_difference=-1.000000 rank_distance=0.001111
reverse: centroids=102 total_weight=360 first={'m': 0.0, 'c': 3.0} last={'m': 990.0, 'c': 1.0}
  q=0.50 nearest_rank=59 estimate=59.500000 value_difference=0.500000 rank_distance=0.000000
  q=0.90 nearest_rank=630 estimate=635.000000 value_difference=5.000000 rank_distance=0.000000
  q=0.95 nearest_rank=810 estimate=815.000000 value_difference=5.000000 rank_distance=0.000000
  q=0.99 nearest_rank=960 estimate=959.000000 value_difference=-1.000000 rank_distance=0.001111
shuffle: centroids=69 total_weight=360 first={'m': 0.0, 'c': 3.0} last={'m': 990.0, 'c': 1.0}
  q=0.50 nearest_rank=59 estimate=59.527273 value_difference=0.527273 rank_distance=0.000000
  q=0.90 nearest_rank=630 estimate=635.000000 value_difference=5.000000 rank_distance=0.000000
  q=0.95 nearest_rank=810 estimate=815.000000 value_difference=5.000000 rank_distance=0.000000
  q=0.99 nearest_rank=960 estimate=959.000000 value_difference=-1.000000 rank_distance=0.001111
repeated-zero control: n=1000 exact_median=0 estimate=0.110988 empirical_rank_interval=[0.90,0.90] rank_distance=0.40
\`\`\`

The forward and reverse runs retain 102 centroids; shuffled order retains 69. All preserve total weight 360. At p99, each estimates 959 against nearest-rank 960. At the median, interpolation returns roughly 59.5 instead of 59, with zero rank distance under our stated measure.

Those results look useful, but the final line tests a different shape.

## A small value error can hide a bad median

The control contains 900 zeros, the integers 1 through 90, and ten values of 1,000. There are 1,000 observations. The nearest-rank median is zero, and zero occupies the empirical rank interval [0, 0.90].

The pinned package returns about 0.110988. All 900 zeros lie below that answer and every positive observation lies above it. Its rank interval is therefore [0.90, 0.90], which is 0.40 away from the requested median rank 0.50.

The estimate is numerically close to zero but badly misplaced in rank. This package's interpolation does not handle this repeated mass acceptably for a median-rank requirement. Other t-digest implementations have different interpolation and repeated-value handling; test the one you will actually deploy.

:::note
Would reducing the compression parameter alone prove that this median is fixed?
:::

No. More retained detail may help some inputs, but the query's treatment of repeated values still matters. Rerun the control and check the actual result.

## Choose around the required error

T-digest is useful when you want compact, mergeable quantile estimates and can validate its behavior on representative distributions. Check repeated values, sorted and shuffled input, sparse tails and the same merge tree your backend will use. A local digest passing a test does not establish the error after repeated merges.

If the requirement is a relative error in the returned value, investigate a sketch designed for that measure, such as DDSketch. For a positive exact value of 200 ms, a 2% value-error target means 196–204 ms; it says nothing by itself about the rank interval. DDSketch uses logarithmic value buckets, while t-digest uses weighted centroids. Datadog's published distribution-metrics design describes DDSketch.

Keep exact reference populations small enough to inspect. For the repeated-zero population above, this pinned package fails our median-rank check, even though its other examples look good. The [[wiki/streaming-percentile-analytics|streaming percentile pipeline]] adds the next requirements: windows, compatible summaries and exactly which contributions reached a report.
`;
