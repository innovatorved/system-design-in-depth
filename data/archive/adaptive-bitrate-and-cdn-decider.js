window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["adaptive-bitrate-and-cdn-decider"] = `# Adaptive bitrate and CDN selection

Adaptive bitrate streaming lets a player choose among encoded representations as network and playback conditions change. A smaller next segment can help avoid a stall. It cannot undo time already spent waiting for an earlier segment.

There are three related decisions: which rendition the viewer requests now, which renditions the service prepares, and where their bytes should be cached. We'll separate them, then use real segment sizes in a small simulation to see why reacting to the last transfer can be too late.

## The player chooses from a prepared offer

The [[wiki/video-transcoding-pipeline|transcoding pipeline]] creates the representations. In HLS, a master playlist identifies available variants, and their media playlists identify ordered segments. The player chooses files that already exist; it does not ask the encoder to change an in-flight file's quality.

The ladder is the set of offered resolutions and bitrates. It must fit supported devices and codecs, with corresponding content aligned in time. A higher resolution is not automatically useful on a small display, and bitrate alone does not compare visual quality across different codecs or scenes.

Three quantities guide playback:

| Quantity | Meaning |
|---|---|
| Media bitrate | Encoded bits per second of media |
| Download throughput | Received bits per second of transfer time |
| Buffer | Seconds of media available ahead of playback |

A rendition can have a modest average bitrate and still contain a large segment. The player needs enough buffer to survive that segment's actual transfer. A path's last observed throughput is evidence about the next request, not knowledge of its future capacity.

Production selectors may combine throughput estimates, buffer levels, device limits and switching history. For example, dash.js documents distinct throughput, buffer, dropped-frame and request-abandonment rules. Our rule below intentionally uses only the previous completed transfer so its delay is easy to see.

## A three-request experiment

The [lab](/course-assets/system-design/m24-lab.py) and [media helper](/course-assets/system-design/m24-media.py) generate the same HLS files as the preceding lesson. Use its pinned Python environment and FFmpeg 8.1.2. File sizes are measured; download times and stalls are calculated under a chosen capacity schedule, with no real congested network.

Both policies start with one second buffered. Fixed-high always requests the larger rendition. Adaptive requests high if its previous observed capacity is at least 200,000 bits/s, otherwise low. Its initial observation is 400,000 bits/s; neither policy can see the next capacity before choosing.

\`\`\`bash title="terminal"
/tmp/fanout-m24/bin/python m24-lab.py abr
\`\`\`
\`\`\`output
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=55648,RESOLUTION=160x90
low/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=188000,RESOLUTION=320x180
high/index.m3u8
chosen capacity bits/s=[400000, 40000, 400000] initial buffer=1.000s
fixed-high download/buffer/stall: high:0.447s/1.553s/0.000s, high:4.474s/1.000s/2.922s, high:0.470s/1.530s/0.000s total_stall=2.922s
adaptive download/buffer/stall: high:0.447s/1.553s/0.000s, high:4.474s/1.000s/2.922s, low:0.139s/1.861s/0.000s total_stall=2.922s
simulated origin observations: A age=4 refused; B age=1 selected=B
\`\`\`

Each generated segment lasts one second. The largest high segment contains 23,500 bytes, giving the advertised peak of 188,000 bits/s. This calculation is valid for the fixture's equal one-second segments and one-second target duration; it is not a promise of network capacity.

For a segment of \`S\` bytes and a path capacity of \`C\` bits/s, ideal transfer time is \`8*S/C\`. If the player starts that request with \`B\` seconds buffered, the stall is \`max(0, transfer time − B)\`. Afterward, the buffer is \`max(0, B − transfer time) + segment duration\`.

The first high segment is 22,372 bytes. At 400,000 bits/s it takes 0.44744 seconds, leaving 1.55256 seconds buffered after adding the new second of media. The next high segment has the same size, but capacity drops to 40,000 bits/s.

That transfer takes 4.4744 seconds: 2.92184 seconds longer than the available buffer. Both policies stall by the displayed 2.922 seconds. Adaptive learns about the drop only after that transfer completes, then switches low just as capacity recovers.

\`\`\`mermaid
flowchart TD
    accTitle: A playback decision arrives late
    accDescr: The first fast transfer makes the selector choose high again. The second transfer is slow and stalls. Only afterward does the selector choose low, when the path has already recovered.
    A["Request 1: high<br/>Fast transfer"] --> B["Request 2: high<br/>Capacity drops; stall"]
    B --> C["Observe slow transfer"]
    C --> D["Request 3: low<br/>Capacity has recovered"]
\`\`\`

The last low segment's 6,956 bytes arrive quickly, but cannot recover time already stalled. On this schedule the adaptive rule does not improve the total-stall metric. The experiment omits round trips, protocol overhead, contention and decoder startup; it tests the consequence of delayed information, not a production ABR algorithm.

A buffer-aware rule could become more cautious as playable time runs low. More startup buffer can absorb longer transfers, but makes the viewer wait before playback. Evaluate startup delay, rebuffering and quality changes together rather than choosing a universal threshold from this three-second clip.

## Which renditions should exist?

The player cannot select a version the service has not prepared. Encoding every upload into every possible format spends compute and storage even on videos that nobody watches. Deferring everything makes the first viewer wait for processing.

| Preparation policy | Useful when | Cost or delay |
|---|---|---|
| Eager ladder | The expected audience needs several representations immediately | Work is paid even if some renditions are never watched |
| Baseline, then more on demand | A complete initial offer is enough for less-watched uploads | New representations take time to become available |
| Prepare for predicted demand | A release or rising audience provides advance notice | A wrong prediction wastes work or misses demand |

In our proposed service, an on-demand miss queues a deduplicated job keyed by source and encoding recipe. The existing baseline remains playable while the new rendition is prepared. Add it to the advertised offer only after validation; a viewer request should not receive a playlist pointing at unfinished work.

This is independent of the request-by-request ABR rule. It changes what the rule will be able to choose later.

## The CDN decider controls preparation and placement

“CDN decider” is a name for our proposed policy service, not a standard CDN API. It combines recent view velocity, viewer geography, channel audience, content type, shares, trending signals and known release spikes to decide where extra work is justified.

Its actions may include generating another rendition, warming selected ready objects in a region, retaining an origin copy or retiring an unused cache placement. The available controls depend on the delivery provider; ordinary CDN eviction is often automatic, not a per-object command the application owns.

Warming transfers bytes before a viewer requests them. It can reduce a first miss while consuming fill bandwidth and cache space. Moving a source to colder storage is a separate retention choice and may increase retrieval delay. Keep encoding, cache placement and storage tiering as separate actions with explicit costs.

Netflix's Open Connect fill documentation gives a concrete placement example: appliances hold portions of the catalog and primarily receive updates in off-peak windows. Popularity changes and new or re-encoded titles affect those updates. This is Netflix's documented delivery model, not a guarantee offered by every CDN.

Our controller can consume [[wiki/event-bus-for-product-events|product events]] such as \`video.published\`, \`video.viewed\` and \`video.trending\`, and emit a request to prepare or cache a version. Treat \`variant.generated\` as evidence of a ready output, not merely a queued task. Repeated events should converge on one intended action.

Use bounded budgets and a quiet period before reversing a placement decision. Otherwise noisy demand can repeatedly trigger expensive encodes or cache fills. Measure useful cache hits and avoided viewer delay against the work spent; traffic volume alone does not show that warming paid off.

## Choosing a delivery location

After selecting a ready object, a player or delivery service may still choose which CDN or origin serves it. This is a separate decision from choosing the rendition. Old latency samples can mislead either choice.

The final line of the replay compares two simulated origins transferring the same 1,000 bytes. A took 0.1 seconds at tick 1; B took 0.2 seconds at tick 4. At tick 5, a maximum age of two ticks excludes the faster but stale A sample, so B wins.

That toy rule only compares fresh equal-size observations. A real selector also needs failure rates, comparable workloads and a fallback when no candidate is eligible. Neither the example nor the label “CDN” establishes a global performance result.

The next [[wiki/signed-urls-drm-and-video-security|access lesson]] checks permission on every playlist and segment the player chooses.
`;
