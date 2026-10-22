window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["direct-to-object-storage-upload"] = [
  {
    "id": "direct-to-object-storage-upload-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What a presigned PUT binds",
    "section": "How Pre-Signed URLs Work",
    "prompt": "Your API issues presigned S3 PUT URLs for avatar uploads and wants to allow any file between 1 byte and 5 MB. Which statement from the lesson is correct?",
    "options": [
      "A presigned PUT can sign a content-length range, so S3 rejects anything over 5 MB",
      "A presigned PUT cannot express a size range; use a presigned POST with content-length-range, and verify size afterwards",
      "Size limits are enforced by the expiry timestamp, since a short URL cannot carry a large upload",
      "Signing the Content-Type header also caps the upload size for that media type"
    ],
    "answer": 1,
    "explanation": "A presigned PUT binds key, method, expiry and any signed headers; signing Content-Length pins one exact length, not a range, so a POST policy with content-length-range plus post-upload verification is the right tool. Content-Type signing constrains the declared type only and says nothing about size.",
    "tags": [
      "direct-to-object-storage-upload",
      "recall",
      "inline"
    ]
  },
  {
    "id": "direct-to-object-storage-upload-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Cost of proxying bytes",
    "section": "Worked example: why proxying bytes hurts",
    "prompt": "You expect 20,000 concurrent uploads averaging 4 Mbit/s each. If they are proxied through your API servers to S3, roughly what bandwidth must the API tier carry, and how long does one 40 MB video hold a worker on a 2 Mbit/s uplink?",
    "options": [
      "About 8 Gbit/s in and out; about 20 seconds per video",
      "About 80 Gbit/s in only, since egress to S3 is internal; about 160 seconds per video",
      "About 80 Gbit/s of ingress plus about 80 Gbit/s of egress; about 160 seconds per video",
      "About 800 Gbit/s in and out; about 16 seconds per video"
    ],
    "answer": 2,
    "explanation": "20,000 x 4 Mbit/s = 80 Gbit/s arriving, and the same bytes must leave again to object storage; 40 MB is 320 Mbit, which takes 160 seconds at 2 Mbit/s. Treating the S3 leg as free is the tempting slip, but it still consumes the API tier's network interfaces and holds sockets and buffers the whole time.",
    "tags": [
      "direct-to-object-storage-upload",
      "apply",
      "inline"
    ]
  },
  {
    "id": "direct-to-object-storage-upload-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Trust nothing until validated",
    "section": "Upload flow in detail",
    "prompt": "An attacker uploads an executable renamed to photo.jpg, sending Content-Type image/jpeg and a size within limits, so the presigned POST policy accepts it. In the lesson's flow, what stops it being shown on profiles?",
    "options": [
      "The worker checks real size, magic bytes and malware, and only then copies it to a final key and marks the row ready",
      "S3 inspects the file extension against the signed Content-Type and rejects the mismatch at upload time",
      "The CDN refuses to serve objects whose bytes do not match their declared Content-Type",
      "The 15 minute expiry prevents the object from being referenced after the URL lapses"
    ],
    "answer": 0,
    "explanation": "The object lands under a pending key and stays unreferenced until the async worker validates magic bytes, scans it and marks the metadata row ready. S3 does not sniff content against Content-Type; the policy only checks the declared header, which the attacker controls.",
    "tags": [
      "direct-to-object-storage-upload",
      "staff",
      "inline"
    ]
  },
  {
    "id": "direct-to-object-storage-upload-n1",
    "topic": "direct-to-object-storage-upload",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: App-Server Bandwidth Saved via Presigned S3 Uploads",
    "scenario": "Users upload 1,000 videos/sec with an average file size of 50 MB. Originally, clients uploaded the 50 MB binary through your API servers (50 GB/s ingress + 50 GB/s egress to S3 = 100 GB/s total NIC traffic on app servers). You migrate to presigned S3 multipart URLs where the API server only returns a 2 KB JSON presigned URL.",
    "prompt": "How many gigabytes per second (GB/s) of total network traffic (ingress + egress) do your API servers save by switching to direct-to-object-storage uploads?",
    "question": "How many gigabytes per second (GB/s) of total network traffic (ingress + egress) do your API servers save by switching to direct-to-object-storage uploads?",
    "unit": "GB/s",
    "answer": 100,
    "tolerance": 0.25,
    "hint": "App server ingress (50 GB/s) + app server egress to S3 (50 GB/s) = 100 GB/s eliminated (replaced by 2 MB/s of JSON).",
    "explanation": "Proxying 1,000 × 50 MB/s through stateless API servers consumes 50 GB/s inbound and 50 GB/s outbound (100 GB/s = 800 Gbps total). Presigned URLs reduce API traffic to 1,000 × 2 KB/s = 2 MB/s, saving ~100 GB/s.",
    "tags": [
      "direct-to-object-storage-upload",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "direct-to-object-storage-upload-t1",
    "topic": "direct-to-object-storage-upload",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Presigned Upload Completion Verification & Orphan Cleanup",
    "scenario": "When clients upload directly to S3 via presigned URLs, the API server is no longer in the data path. Some clients crash mid-upload, while malicious clients call your `POST /upload-complete` API without actually uploading a valid image.",
    "prompt": "How should the control plane track upload lifecycle and enforce validation safely?",
    "question": "How should the control plane track upload lifecycle and enforce validation safely?",
    "options": [
      "Trust the client's `POST /upload-complete` call blindly and immediately publish the object URL to all users",
      "Record a `PENDING` metadata row when issuing the presigned URL (with strict Content-Length / SHA-256 policy conditions), transition to `READY` only upon verified S3 Event Notification (`ObjectCreated`) + magic-byte/virus scan, and expire incomplete multipart uploads via S3 Lifecycle rules",
      "Make the S3 bucket publicly writable without presigned URLs"
    ],
    "correctOption": 1,
    "reasons": [
      "Clients never lie about completing an upload or uploading malicious executables disguised as JPEGs",
      "Storage-emitted event notifications (`ObjectCreated`) provide ground-truth confirmation out-of-band from the untrusted client, while S3 lifecycle policies garbage-collect abandoned multipart chunks automatically",
      "Publicly writable buckets prevent unauthorized overwrites and storage-cost attacks"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Who is the source of truth that the bytes actually landed in S3: the untrusted browser or S3's own event notification?",
    "explanation": "Never trust the client to self-report upload completion. Enforce size/hash constraints in the presigned policy, trigger post-upload validation from S3 `ObjectCreated` event notifications, and configure S3 `AbortIncompleteMultipartUpload` lifecycle rules.",
    "tags": [
      "direct-to-object-storage-upload",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["image-cdn-and-resizing"] = [
  {
    "id": "image-cdn-and-resizing-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Allowlist transform parameters",
    "section": "Edge Transformation Mechanics",
    "prompt": "An on-demand image service accepts any integer width in the URL. Why does the lesson insist on an allowlist of widths or signed transform URLs?",
    "options": [
      "Because libvips cannot resize to widths that are not multiples of 16",
      "Because CDNs cap the number of query parameters they include in a cache key",
      "Because arbitrary widths let anyone force uncached, expensive resizes that bypass the cache",
      "Because unlisted widths make the browser choose the wrong responsive breakpoint"
    ],
    "answer": 2,
    "explanation": "If w can be any value, an attacker can request thousands of distinct widths, each a cache miss that triggers a fresh resize at the origin. The limitation is about cost and cache-busting abuse, not a technical restriction in the resize library.",
    "tags": [
      "image-cdn-and-resizing",
      "recall",
      "inline"
    ]
  },
  {
    "id": "image-cdn-and-resizing-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Pre-generate everything?",
    "section": "Worked example: pre-generate versus on demand",
    "prompt": "You have 5 million originals and the product uses 8 widths x 3 formats x 2 pixel densities, averaging 50 KB per variant. What would pre-generating every variant cost in extra storage and up-front resize jobs?",
    "options": [
      "About 1.2 TB and 24 million jobs",
      "About 12 TB and 240 million jobs",
      "About 12 TB and 48 million jobs",
      "About 120 TB and 240 million jobs"
    ],
    "answer": 1,
    "explanation": "8 x 3 x 2 = 48 variants; 5M x 48 = 240 million jobs, and 240M x 50 KB is about 12 TB, most of it for sizes nobody will view. The 48 million option gets the storage right but undercounts jobs: every one of the 48 variants of every original is a separate resize.",
    "tags": [
      "image-cdn-and-resizing",
      "apply",
      "inline"
    ]
  },
  {
    "id": "image-cdn-and-resizing-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Format negotiation and cache",
    "section": "Cache key normalization",
    "prompt": "The edge resolves fmt=auto from the Accept header and returns AVIF to browsers that support it, but the cache key is only path plus width plus quality. What goes wrong, and what is the fix?",
    "options": [
      "Nothing breaks, but hit ratio falls; add an origin shield so misses are shared",
      "AVIF files are larger than JPEG, so bandwidth rises; always serve WebP instead",
      "Each browser gets a separate copy, so storage multiplies; remove format from the URL entirely",
      "A browser that cannot decode AVIF may be served the cached AVIF; include the resolved format in the cache key or Vary"
    ],
    "answer": 3,
    "explanation": "If the negotiated format is not part of the key, whichever format was cached first is served to everyone, so a client lacking AVIF support can receive an image it cannot decode. An origin shield reduces duplicate resizes across edges but does nothing about serving the wrong format.",
    "tags": [
      "image-cdn-and-resizing",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["gravatar-style-avatar-service"] = [
  {
    "id": "gravatar-style-avatar-service-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Hashed emails are not anonymous",
    "section": "Hashing & Caching Strategy",
    "prompt": "A private company app plans to key avatar URLs by SHA-256 of the user's lowercased email, arguing that hashing makes them anonymous. What does the lesson say?",
    "options": [
      "The digest is pseudonymous: anyone with candidate emails can hash and match them, so prefer an opaque ID or a keyed derivation",
      "SHA-256 is safe but MD5 is not, so the plan is fine as long as MD5 is avoided",
      "The digest is anonymous as long as the email is trimmed and lowercased before hashing",
      "Hashing is unnecessary because avatar URLs are never visible to other users"
    ],
    "answer": 0,
    "explanation": "Fast hashes of emails can be tested against a candidate list in well under a second, so the stable digest is guessable pseudonymous data; a private service should use an opaque user ID or HMAC with a secret. Swapping MD5 for SHA-256 does not help, since both are fast and the weakness is the guessable input.",
    "tags": [
      "gravatar-style-avatar-service",
      "recall",
      "inline"
    ]
  },
  {
    "id": "gravatar-style-avatar-service-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Origin load at peak",
    "section": "Worked example: traffic and caching",
    "prompt": "An avatar service receives 3 billion requests per day, with peak at about 3 times the average and a 98 percent CDN hit ratio. Roughly how many requests per second reach the origin at peak?",
    "options": [
      "About 700 per second",
      "About 10,400 per second",
      "About 2,100 per second",
      "About 20,800 per second"
    ],
    "answer": 2,
    "explanation": "3B / 86,400 is about 34,700 per second, peak about 104,000, and 2 percent of that is about 2,100 per second at the origin. The 700 figure applies the miss rate to the average rather than the peak, which would under-provision the origin for the busiest hour.",
    "tags": [
      "gravatar-style-avatar-service",
      "apply",
      "inline"
    ]
  },
  {
    "id": "gravatar-style-avatar-service-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Stale avatars after a change",
    "section": "URL and caching strategies",
    "prompt": "Avatars are served from /avatar/42?s=64 with max-age=86400 and s-maxage=604800. Users complain their new photo takes days to appear for others. Which change does the lesson recommend?",
    "options": [
      "Lower max-age to 300 seconds, accepting more origin traffic and revalidation",
      "Keep the URL and purge the CDN on every avatar change",
      "Add stale-while-revalidate so the CDN refreshes the image in the background",
      "Reference a versioned URL such as /avatar/42/v7/64.webp with a one-year immutable max-age"
    ],
    "answer": 3,
    "explanation": "With a version in the URL, the page points to the new version as soon as metadata changes, so there is no staleness and variants can be cached forever. Purging works but is operationally fragile and needed on every change; stale-while-revalidate still serves the old image during the refresh window.",
    "tags": [
      "gravatar-style-avatar-service",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["video-upload-signed-url-multipart"] = [
  {
    "id": "video-upload-signed-url-multipart-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Abandoned parts cost money",
    "section": "Resilience & Parallelism",
    "prompt": "A user starts a 3 GB multipart upload, sends 150 parts, then uninstalls the app. What happens to those parts, and what should the platform configure?",
    "options": [
      "They are deleted automatically after the presigned part URLs expire",
      "They stay stored and billed until the upload is completed or aborted, so add a lifecycle rule to abort incomplete uploads",
      "They are assembled into a partial object after 24 hours and can be deleted normally",
      "They are held in S3's temporary tier at no cost until the UploadId is reused"
    ],
    "answer": 1,
    "explanation": "Uploaded parts persist and are billed until CompleteMultipartUpload or AbortMultipartUpload; a lifecycle rule to abort incomplete uploads after a few days cleans them up. URL expiry only stops new part uploads and does not remove what has already been stored.",
    "tags": [
      "video-upload-signed-url-multipart",
      "recall",
      "inline"
    ]
  },
  {
    "id": "video-upload-signed-url-multipart-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Part size for a huge file",
    "section": "Worked example: a 4 GB upload over a flaky connection",
    "prompt": "A client always uses 10 MiB parts. A user tries to upload a 200 GiB raw camera file and the upload fails. What is the cause and the right part size under the lesson's rule of thumb?",
    "options": [
      "It would need 20,480 parts, over the 10,000 limit; use about 21 MiB parts",
      "It exceeds the 5 GB single-object cap; use 5 GiB parts so the file fits in 40 parts",
      "Parts under 16 MiB are rejected for files over 100 GiB; use 16 MiB parts",
      "It would need 20,480 parts, over the 10,000 limit; use 5 MiB parts to stay near the minimum"
    ],
    "answer": 0,
    "explanation": "200 GiB is 204,800 MiB, so 10 MiB parts give 20,480 parts; the rule max(8 MiB, ceil(size / 10,000)) gives about 21 MiB. Shrinking parts to 5 MiB moves in the wrong direction and doubles the part count, while the 5 GB cap applies to single PUTs, not multipart objects.",
    "tags": [
      "video-upload-signed-url-multipart",
      "apply",
      "inline"
    ]
  },
  {
    "id": "video-upload-signed-url-multipart-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Resume after a long sleep",
    "section": "Failure modes",
    "prompt": "A laptop uploading 410 parts goes to sleep for three hours after part 250. On wake the app has restarted and its batch of presigned part URLs, valid for one hour, has expired. What should the client do?",
    "options": [
      "Abort the multipart upload and restart from part 1, since expired URLs invalidate the UploadId",
      "Re-sign the expired URLs on the client by extending their expiry timestamp",
      "Use the persisted UploadId, confirm completed parts with ListParts, and request fresh URLs for the remaining parts",
      "Call CompleteMultipartUpload with the 250 parts, then start a second upload for the rest"
    ],
    "answer": 2,
    "explanation": "Expired part URLs only mean new URLs are needed; the UploadId and stored parts remain, so ListParts confirms progress and only the remaining 160 parts are sent. Clients cannot extend an expiry themselves, since it is covered by the server's signature, and completing early would produce a truncated object.",
    "tags": [
      "video-upload-signed-url-multipart",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["video-transcoding-pipeline"] = [
  {
    "id": "video-transcoding-pipeline-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Aligned keyframes",
    "section": "Split-and-Stitch Parallelism",
    "prompt": "Why must every rendition in a transcoding ladder use the same keyframe and segment boundaries?",
    "options": [
      "Because the stitcher can only concatenate segments that have identical file sizes",
      "Because CDNs cache segments by timestamp, and misaligned boundaries cause cache misses",
      "Because codecs such as AV1 require shared keyframes to decode lower renditions",
      "Because ABR players switch renditions at segment boundaries, which must line up to switch cleanly"
    ],
    "answer": 3,
    "explanation": "A player that moves from 1080p to 480p mid-stream fetches the next segment in the new rendition, which only works if both renditions start that segment at the same keyframe and timestamp. Segment sizes differ by bitrate anyway, so identical sizes are neither possible nor required.",
    "tags": [
      "video-transcoding-pipeline",
      "recall",
      "inline"
    ]
  },
  {
    "id": "video-transcoding-pipeline-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Parallelism buys latency",
    "section": "Worked example: one hour of 1080p",
    "prompt": "A 90 minute upload is encoded into a 4-rung ladder at 0.5x real time (2 seconds of work per second of video), split into 6 second segments, with 600 workers available. What are the approximate wall-clock time and total compute?",
    "options": [
      "About 12 hours wall clock and 12 CPU-hours, since each rendition must run serially",
      "About 1 to 2 minutes wall clock, and about 12 CPU-hours of total compute",
      "About 1 to 2 minutes wall clock, and about 12 CPU-minutes because the work is parallel",
      "About 7 minutes wall clock, and about 2 CPU-hours thanks to shorter segments"
    ],
    "answer": 1,
    "explanation": "900 segments x 4 renditions = 3,600 tasks of about 12 seconds each; 600 workers finish in about 6 waves, roughly 72 seconds plus overhead, while total work stays 4 x 90 min x 2 = 12 CPU-hours. The CPU-minutes option is the classic confusion: parallelism buys latency, not efficiency.",
    "tags": [
      "video-transcoding-pipeline",
      "apply",
      "inline"
    ]
  },
  {
    "id": "video-transcoding-pipeline-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Poison inputs",
    "section": "Pipeline and failure handling",
    "prompt": "A malformed upload makes the encoder crash on the same segment every time. Workers retry it indefinitely, consuming capacity. What does the lesson's pipeline do instead?",
    "options": [
      "After N failed attempts, move the task to a dead-letter queue and mark the video failed with a reason",
      "Retry with exponential backoff forever, since transient worker faults look identical to bad inputs",
      "Skip the failing segment and publish the video with a gap, marking it playable",
      "Re-split the video into smaller segments on each retry until the failure disappears"
    ],
    "answer": 0,
    "explanation": "Bounded retries plus a dead-letter queue stop a poison input from looping forever, and the video gets an explicit failed state and reason. Backoff alone only slows the loop; the lesson also says to probe and validate inputs up front, and to publish only when every required piece exists, which rules out shipping a gap.",
    "tags": [
      "video-transcoding-pipeline",
      "staff",
      "inline"
    ]
  },
  {
    "id": "video-transcoding-pipeline-n1",
    "topic": "video-transcoding-pipeline",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Video Transcoding Worker Core Sizing",
    "scenario": "Creators upload 600 hours of raw video per hour (a 10-minute video every second). Each uploaded hour of raw video is transcoded into an ABR ladder (1080p, 720p, 480p, 360p) requiring a combined 20 CPU-core-hours of compute per 1 hour of source video.",
    "prompt": "What is the minimum number of CPU cores required to keep up with the 600 hours/hour upload rate in real time (at 100% utilization)?",
    "question": "What is the minimum number of CPU cores required to keep up with the 600 hours/hour upload rate in real time (at 100% utilization)?",
    "unit": "cores",
    "answer": 12000,
    "tolerance": 0.25,
    "hint": "Multiply 600 source video hours/hour × 20 CPU-core-hours per source hour.",
    "explanation": "600 source hours/hour × 20 core-hours/source hour = 12,000 CPU cores running continuously (or ~16,000 cores at 75% target utilization) just to transcode incoming uploads without growing queue lag.",
    "tags": [
      "video-transcoding-pipeline",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "video-transcoding-pipeline-t1",
    "topic": "video-transcoding-pipeline",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Whole-File Sequential Transcoding vs GOP-Aligned Chunk-Parallel DAG",
    "scenario": "A creator uploads a 2-hour 4K keynote video before a live product launch. Sequential single-worker transcoding takes 3 hours, missing the launch window.",
    "prompt": "How should the transcoding pipeline minimize time-to-publish AND optimize compute cost across the catalog?",
    "question": "How should the transcoding pipeline minimize time-to-publish AND optimize compute cost across the catalog?",
    "options": [
      "Transcode the entire 2-hour file on a single thread into AV1, HEVC, and H.264 before making any resolution playable",
      "Split the source video along keyframe (GOP) boundaries into independent 4–10 second chunks, transcode chunks + resolutions in parallel across a DAG worker pool (publishing 360p/720p H.264 first for fast startup), and defer expensive AV1 encoding to popular videos only",
      "Serve the raw 80 GB uncompressed camera file directly to mobile viewers over cellular networks"
    ],
    "correctOption": 1,
    "reasons": [
      "Single-threaded 2-hour AV1 encoding completes in milliseconds",
      "GOP-aligned chunking turns a 3-hour serial job into数百 parallel 5-second tasks, while popularity-tiered codec selection avoids burning 10x AV1 CPU on videos that get <10 views",
      "Mobile phones on 4G can stream 90 Mbps raw studio files without buffering"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Why transcode into expensive AV1 for the 80% of uploaded videos that receive fewer than 10 views?",
    "explanation": "Splitting along GOP (Group of Pictures) boundaries allows hundreds of workers to transcode 4-second segments in parallel (cutting latency from hours to seconds), while gating compute-heavy codecs (AV1/VP9) behind view-count thresholds saves massive fleet CPU.",
    "tags": [
      "video-transcoding-pipeline",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["adaptive-bitrate-and-cdn-decider"] = [
  {
    "id": "adaptive-bitrate-and-cdn-decider-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Switch before draining",
    "section": "Manifest and Segment Hierarchy",
    "prompt": "A simple player switches down only when a segment download takes longer than the segment's duration. Why does the lesson call this too late?",
    "options": [
      "Because the master playlist must be re-downloaded before any switch, adding a round trip",
      "Because the server enforces a minimum dwell time per rendition, so late switches are ignored",
      "Because by then the buffer is already draining; good players switch early on a smoothed estimate with a safety margin",
      "Because segment durations vary, so comparing download time with duration is meaningless"
    ],
    "answer": 2,
    "explanation": "Once a download is slower than real time, playback is already consuming buffer faster than it refills; players keep a smoothed throughput estimate, watch buffer level and pick a lower rung with margin before that happens. The client picks renditions itself, so there is no server-imposed dwell time.",
    "tags": [
      "adaptive-bitrate-and-cdn-decider",
      "recall",
      "inline"
    ]
  },
  {
    "id": "adaptive-bitrate-and-cdn-decider-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Choosing the next rung",
    "section": "Worked example: a throughput-based decision",
    "prompt": "The ladder is 6.0, 3.0 and 1.5 Mbit/s with 4 second segments. The smoothed throughput estimate is 4.0 Mbit/s and the safety factor is 0.8. Which rung does the player pick, and how does the buffer change per segment?",
    "options": [
      "6.0 Mbit/s; the buffer shrinks by about 2 seconds per segment",
      "1.5 Mbit/s; the buffer grows by about 2.5 seconds per segment",
      "3.0 Mbit/s; the buffer grows by about 3 seconds per segment",
      "3.0 Mbit/s; the buffer grows by about 1 second per segment"
    ],
    "answer": 3,
    "explanation": "The cap is 4.0 x 0.8 = 3.2 Mbit/s, so the player picks 3.0; a segment is 3.0 x 4 = 12 Mbit, which downloads in 3 seconds at 4.0 Mbit/s while adding 4 seconds of video, so the buffer grows about 1 second. The 1.5 option computes a real buffer gain but ignores that the higher rung fits within the margin.",
    "tags": [
      "adaptive-bitrate-and-cdn-decider",
      "apply",
      "inline"
    ]
  },
  {
    "id": "adaptive-bitrate-and-cdn-decider-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Mid-session CDN trouble",
    "section": "The CDN decider",
    "prompt": "Twenty minutes into a popular match, CDN A becomes congested for one ISP. Players were assigned CDN A once at session start. Which design from the lesson keeps those viewers playing smoothly?",
    "options": [
      "Lower every viewer to the lowest rung, since ABR alone compensates for any CDN congestion",
      "Have the steering service return an ordered CDN list the player can fail over along, updated during playback via content steering",
      "Pin each ISP permanently to the cheapest CDN, so congestion is handled by that CDN's capacity planning",
      "Retry failed segment requests against CDN A with exponential backoff until throughput recovers"
    ],
    "answer": 1,
    "explanation": "A static choice ignores mid-session congestion; returning ranked CDNs lets the player fail over, and HLS or DASH content steering lets the server change the preferred order during playback using QoE beacons. ABR can mask some congestion by lowering quality, but it cannot fix a failing or overloaded CDN path.",
    "tags": [
      "adaptive-bitrate-and-cdn-decider",
      "staff",
      "inline"
    ]
  },
  {
    "id": "adaptive-bitrate-and-cdn-decider-n1",
    "topic": "adaptive-bitrate-and-cdn-decider",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: CDN Origin Shield Bandwidth Offload",
    "scenario": "A live HLS/DASH video stream has 500,000 concurrent viewers distributed across 50 edge POPs. The video bitrate is 4 Mbps (0.5 MB/s), so edge POPs deliver `500,000 × 4 Mbps = 2,000 Gbps` (2 Tbps) to eyeballs. With an Origin Shield and 99.9% overall CDN offload, only 1 request per segment per edge POP reaches the shield, and only 1 request per segment (4 Mbps) reaches the origin storage bucket.",
    "prompt": "How many Tera-bits per second (Tbps) of egress bandwidth do the 50 edge POPs serve to the 500,000 viewers (500,000 × 4 Mbps, where 1 Tbps = 1,000,000 Mbps)?",
    "question": "How many Tera-bits per second (Tbps) of egress bandwidth do the 50 edge POPs serve to the 500,000 viewers (500,000 × 4 Mbps, where 1 Tbps = 1,000,000 Mbps)?",
    "unit": "Tbps",
    "answer": 2,
    "tolerance": 0.25,
    "hint": "Multiply 500,000 viewers × 4 Mbps = 2,000,000 Mbps = 2 Tbps.",
    "explanation": "500,000 concurrent streams × 4 Mbps = 2,000,000 Mbps = 2 Tbps of edge delivery—all collapsed down to a single 4 Mbps origin fetch via request coalescing at the CDN edge and Origin Shield!",
    "tags": [
      "adaptive-bitrate-and-cdn-decider",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "adaptive-bitrate-and-cdn-decider-t1",
    "topic": "adaptive-bitrate-and-cdn-decider",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: HLS/DASH Segment Duration (2s vs 10s) and Multi-CDN Steering",
    "scenario": "You are configuring HLS/DASH segment length and multi-CDN control plane steering for a live sports streaming platform.",
    "prompt": "What is the fundamental trade-off when shrinking segment duration from 10 seconds to 1–2 seconds (or CMAF chunks), and how should multi-CDN traffic be steered?",
    "question": "What is the fundamental trade-off when shrinking segment duration from 10 seconds to 1–2 seconds (or CMAF chunks), and how should multi-CDN traffic be steered?",
    "options": [
      "10-second segments reduce glass-to-glass live latency and allow faster bitrate adaptation on cellular drops",
      "Shorter segments (1–2s / Low-Latency CMAF) reduce live latency and react faster to bandwidth drops, at the cost of higher keyframe compression overhead and 5–10x higher HTTP request QPS (mitigated by client-side telemetry-driven Multi-CDN manifest/DNS steering)",
      "Hardcode a single CDN URL inside the mobile app binary so switching CDNs requires an App Store release"
    ],
    "correctOption": 1,
    "reasons": [
      "A 10-second segment requires zero keyframes and adapts bitrate every 100 ms",
      "Every segment starts with an IDR keyframe (reducing compression efficiency when segments are very short) and multiplies request rate, while dynamic control-plane manifest steering routes around regional CDN brownouts in real time",
      "App Store review cycles (24-48 hours) are fast enough for live mid-match CDN failover"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "Each segment must begin with a standalone IDR keyframe and requires a separate HTTP GET request.",
    "explanation": "Shortening segments reduces glass-to-glass latency and lets the ABR player downshift quickly when cellular throughput drops, but increases keyframe bitrate overhead and request QPS. A real-time Multi-CDN decider steers players between CDNs via manifest URL rewriting based on client QoE telemetry.",
    "tags": [
      "adaptive-bitrate-and-cdn-decider",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["signed-urls-drm-and-video-security"] = [
  {
    "id": "signed-urls-drm-and-video-security-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Clear-key is not DRM",
    "section": "Security Layers",
    "prompt": "A team encrypts HLS segments with AES-128 and serves the key over HTTPS to any logged-in player, then describes this as DRM. What is the flaw?",
    "options": [
      "AES-128 is too weak to protect video, so segments must use AES-256 to count as DRM",
      "Every authorized client receives the key, so a determined user can extract it; DRM keeps keys inside a CDM",
      "HTTPS key delivery is DRM, but only if the key rotates every segment",
      "The approach is DRM, but it only works for live streams and not for on-demand titles"
    ],
    "answer": 1,
    "explanation": "Clear-key encryption hands the actual key to the client, so any authorized user can pull it out; DRM systems like Widevine and FairPlay keep keys inside a content decryption module, ideally hardware-backed. Key length is not the issue, and rotating keys still delivers each one in the clear.",
    "tags": [
      "signed-urls-drm-and-video-security",
      "recall",
      "inline"
    ]
  },
  {
    "id": "signed-urls-drm-and-video-security-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "HD on a software CDM",
    "section": "Worked example: layering protection for a movie",
    "prompt": "A subscriber on an Android phone with only Widevine L3 (software-only) presses play on a 4K title. Following the lesson's worked example, what should happen?",
    "options": [
      "The license server returns keys with rules that restrict this device to standard definition",
      "The signed cookie is rejected at the CDN, so the phone cannot download any segments",
      "The player plays full 4K, because the signed cookie already proves entitlement",
      "The playback API refuses the session outright, because L3 devices cannot use CENC content"
    ],
    "answer": 0,
    "explanation": "Entitlement and cookies control who may fetch bytes, while license rules control what decryption is allowed: HD only on hardware-backed security levels, so L3 devices are commonly capped to SD. Rejecting the cookie is wrong because signed cookies do not know the device's DRM security level.",
    "tags": [
      "signed-urls-drm-and-video-security",
      "apply",
      "inline"
    ]
  },
  {
    "id": "signed-urls-drm-and-video-security-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "When the license server fails",
    "section": "Failure modes",
    "prompt": "During a big premiere, the DRM license service in one region goes down while the CDN stays healthy. What breaks first, and which mitigations does the lesson list?",
    "options": [
      "Segment delivery breaks first; add a second CDN so encrypted segments keep flowing",
      "Viewers already playing lose video immediately; shorten license expiry so recovery is faster",
      "Signed cookies stop validating; move signature checks from the edge to the origin",
      "New playbacks fail despite a healthy CDN; run licensing multi-region, cache entitlement, and allow persistent licenses for downloads"
    ],
    "answer": 3,
    "explanation": "Without a license, a player can fetch encrypted segments but has no usable key, so new sessions fail even though the CDN is fine; multi-region licensing, cached entitlement and persistent licenses reduce the blast radius. Adding a CDN is the tempting reflex, but segment delivery was never the problem.",
    "tags": [
      "signed-urls-drm-and-video-security",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["live-streaming-webrtc-and-latency"] = [
  {
    "id": "live-streaming-webrtc-and-latency-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What an SFU does",
    "section": "WebRTC vs. HTTP Streaming",
    "prompt": "In a WebRTC group call, what does a selective forwarding unit (SFU) do with each participant's stream?",
    "options": [
      "Decodes all streams and mixes them into one composite video per receiver",
      "Relays each stream only when UDP is blocked, acting as a TURN fallback",
      "Receives each participant's stream and forwards selected layers to each receiver",
      "Converts each stream into HLS segments so receivers can play them through a CDN"
    ],
    "answer": 2,
    "explanation": "An SFU receives one upload per participant and forwards the right layer to each receiver without mixing. Mixing into a composite is what an MCU does, saving client bandwidth at high server CPU cost; TURN is a transport fallback, not a topology.",
    "tags": [
      "live-streaming-webrtc-and-latency",
      "recall",
      "inline"
    ]
  },
  {
    "id": "live-streaming-webrtc-and-latency-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Classic HLS latency",
    "section": "Worked example: three latency budgets",
    "prompt": "A classic HLS setup has about 2 s of encoding and packaging, 4 second segments that must finish before publishing, about 1 s of CDN delay, and a player that buffers 3 segments. Roughly what glass-to-glass latency should you expect?",
    "options": [
      "About 7 seconds",
      "About 19 seconds",
      "About 15 seconds",
      "About 31 seconds"
    ],
    "answer": 1,
    "explanation": "2 s packaging + 4 s for the segment to complete + 1 s CDN + 3 x 4 s player buffer is about 19 seconds. The 7 second answer forgets the player buffer, which the lesson warns is usually the largest term.",
    "tags": [
      "live-streaming-webrtc-and-latency",
      "apply",
      "inline"
    ]
  },
  {
    "id": "live-streaming-webrtc-and-latency-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Mesh breaks first",
    "section": "Group call topology",
    "prompt": "A team ships a peer-to-peer mesh for group calls where each participant sends a 2 Mbit/s stream. With 8 people in a call, what breaks first, and what does the lesson recommend?",
    "options": [
      "Each participant must upload about 14 Mbit/s, beyond most home uplinks; move to an SFU with simulcast layers",
      "Each participant must download about 2 Mbit/s, which is too little for HD; switch to an MCU",
      "The signalling server must track 28 peer connections, overloading it; use LL-HLS instead",
      "The jitter buffer grows with participant count, pushing latency above 5 seconds; use RTMP ingest"
    ],
    "answer": 0,
    "explanation": "In a mesh each person sends 7 copies, 7 x 2 = 14 Mbit/s of upload, which most home connections cannot sustain; an SFU needs one upload (or a few simulcast layers) per participant. The download option gets the numbers wrong: each receiver also pulls 7 streams, about 14 Mbit/s, and the scarcer home resource is upload.",
    "tags": [
      "live-streaming-webrtc-and-latency",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["remote-file-sync-design"] = [
  {
    "id": "remote-file-sync-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Limits of fixed blocks",
    "section": "Delta Sync & Content Addressing",
    "prompt": "A sync client splits files into fixed 4 MB blocks and uploads only blocks whose SHA-256 changed. For which kind of edit does this delta scheme work poorly?",
    "options": [
      "Appending new data to the end of a large log file",
      "Overwriting a few bytes in the middle of a presentation in place",
      "Inserting data near the start of the file, which shifts every later block boundary",
      "Renaming the file without changing its contents"
    ],
    "answer": 2,
    "explanation": "An insertion near the start shifts all later fixed boundaries, so almost every block hash changes and nearly the whole file re-uploads. In-place edits and appends change only one or two blocks, which is exactly where fixed blocks do well.",
    "tags": [
      "remote-file-sync-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "remote-file-sync-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Delta upload size",
    "section": "Worked example: editing a 500 MB file",
    "prompt": "A 1 GiB video project file is stored as 4 MiB blocks. An in-place edit changes 3 blocks. How many blocks does the file have, and how much does the client upload before committing?",
    "options": [
      "250 blocks; about 12 MiB",
      "256 blocks; about 1 GiB, since the blocklist changed",
      "256 blocks; about 4 MiB, since only one block per edit is sent",
      "256 blocks; about 12 MiB"
    ],
    "answer": 3,
    "explanation": "1,024 MiB / 4 MiB = 256 blocks, and the server reports only the 3 changed hashes as missing, so the client uploads about 12 MiB, around 1 percent of the file. A changed blocklist is a small metadata commit, not a reason to re-upload unchanged blocks.",
    "tags": [
      "remote-file-sync-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "remote-file-sync-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Two offline edits",
    "section": "Conflict handling",
    "prompt": "Two laptops edit /deck.pptx offline, both starting from version 17. Laptop A reconnects and commits version 18. Laptop B then commits with base version 17. What should the server do, in the lesson's design?",
    "options": [
      "Accept B's commit as version 19, because the newest writer should win",
      "Reject B's base-version check and save B's version as a conflicted copy, so neither edit is lost",
      "Merge the two blocklists block by block, keeping whichever block changed in each position",
      "Lock the file for B until A's user approves overwriting version 18"
    ],
    "answer": 1,
    "explanation": "The commit is conditional on the base version still being current; B's base 17 no longer matches, so the server keeps B's edit as a conflicted copy rather than silently discarding A's work. Last writer wins is simple but causes silent data loss, and blocklist merging is not meaningful for arbitrary binary files.",
    "tags": [
      "remote-file-sync-design",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["fixed-block-chunking-and-content-addressing"] = [
  {
    "id": "fixed-block-chunking-and-content-addressing-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "The boundary shift problem",
    "section": "Fixed-Block Chunking vs. Variable-Block (Rabin Fingerprinting)",
    "prompt": "Why does inserting a single byte at the start of a file destroy deduplication under fixed-block chunking?",
    "options": [
      "Because the file's total size changes, and block hashes include the file size",
      "Because every later block boundary moves by one byte, so every block's contents and hash change",
      "Because the first block exceeds its fixed size and must be split, invalidating the index",
      "Because the file's metadata version increments, forcing a full re-upload by policy"
    ],
    "answer": 1,
    "explanation": "Fixed chunking cuts at every N bytes, so a one-byte insertion shifts all subsequent cuts and no block matches its old bytes. Block hashes depend only on the block's own contents, not on file size, which is why content-defined boundaries can recover alignment.",
    "tags": [
      "fixed-block-chunking-and-content-addressing",
      "recall",
      "inline"
    ]
  },
  {
    "id": "fixed-block-chunking-and-content-addressing-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Insert, fixed versus CDC",
    "section": "Worked example: inserting one byte",
    "prompt": "A 200 MB file is edited by inserting 10 bytes at offset 0. Compare fixed 4 MB blocks with the lesson's content-defined chunking (boundaries where the low 20 bits of a rolling hash are zero). Roughly how much must be re-uploaded in each case?",
    "options": [
      "Fixed about 4 MB; content-defined about 1 MB",
      "Fixed about 200 MB; content-defined about 200 MB, since all offsets shift",
      "Fixed about 200 MB; content-defined about 1 MB",
      "Fixed about 4 MB; content-defined about 4 MB"
    ],
    "answer": 2,
    "explanation": "With fixed blocks all 50 boundaries shift, so every block changes and the whole 200 MB goes up; with content-defined chunks averaging about 1 MiB, only the first chunk changes because later boundaries are found at the same content. Assuming the fixed scheme only resends the first block is the tempting mistake.",
    "tags": [
      "fixed-block-chunking-and-content-addressing",
      "apply",
      "inline"
    ]
  },
  {
    "id": "fixed-block-chunking-and-content-addressing-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Hash-only upload attack",
    "section": "Related techniques",
    "prompt": "To save bandwidth, a sync server links a chunk into a user's account whenever the client sends a chunk hash that already exists in global storage, without uploading bytes. What vulnerability does the lesson describe?",
    "options": [
      "SHA-256 collisions let attackers overwrite other users' chunks with forged data",
      "Reference counts drift, so shared chunks are deleted while still in use",
      "Rolling-hash boundaries leak file sizes to other users",
      "Anyone who learns a file's hashes can obtain the file, so hash-only uploads must still prove possession"
    ],
    "answer": 3,
    "explanation": "In 2011 researchers showed Dropbox's client-side dedup let anyone who knew a file's hashes obtain it, so uploads must prove possession of the bytes, and cross-user dedup also acts as an existence oracle. Practical SHA-256 collisions are not the risk; the weakness is treating knowledge of a hash as proof of ownership.",
    "tags": [
      "fixed-block-chunking-and-content-addressing",
      "staff",
      "inline"
    ]
  }
];

window.QUESTION_BANK["blocklist-versioned-file-metadata"] = [
  {
    "id": "blocklist-versioned-file-metadata-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What a rollback writes",
    "section": "Instant Rollbacks & Version History",
    "prompt": "A user rolls a 2 GB file back from version 9 to version 3. With immutable content-addressed blocks, what does the system actually do?",
    "options": [
      "Records a new commit pointing to version 3's blocklist, with no payload copied",
      "Copies version 3's 2 GB of blocks into new block addresses marked as version 10",
      "Deletes the blocks introduced in versions 4 to 9, restoring the old state",
      "Rewrites version 9's blocks in place with the contents of version 3"
    ],
    "answer": 0,
    "explanation": "Rollback is a metadata commit that points at the earlier blocklist, so it is nearly instant and copies nothing. Deleting later blocks is wrong because other versions may still reference them, and blocks are only reclaimed by garbage collection once unreferenced.",
    "tags": [
      "blocklist-versioned-file-metadata",
      "recall",
      "inline"
    ]
  },
  {
    "id": "blocklist-versioned-file-metadata-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Counting unique blocks",
    "section": "Worked example: three versions and a rollback",
    "prompt": "v1 is A, B, C, D. v2 edits the second block: A, B2, C, D. v3 edits the third block and appends: A, B2, C2, D, E. v4 rolls back to v2. How many blocks would naive full copies store, and how many unique blocks do blocklists need?",
    "options": [
      "13 naive, 7 unique",
      "17 naive, 5 unique",
      "17 naive, 7 unique",
      "17 naive, 9 unique"
    ],
    "answer": 2,
    "explanation": "Naive storage is 4 + 4 + 5 + 4 = 17 blocks; unique blocks are A, B, C, D, B2, C2 and E, which is 7, and the rollback adds none. The 5 option counts only v1 plus the first edit, forgetting the new blocks from v3.",
    "tags": [
      "blocklist-versioned-file-metadata",
      "apply",
      "inline"
    ]
  },
  {
    "id": "blocklist-versioned-file-metadata-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "GC racing an upload",
    "section": "Garbage collection options",
    "prompt": "A mark-and-sweep collector deletes every block not reachable from a retained version. A client uploads new blocks, and its commit arrives 30 seconds later. Some commits now reference missing blocks. What design from the lesson prevents this?",
    "options": [
      "Switch to reference counting, since counts are updated at upload time",
      "Only sweep unreferenced blocks older than a grace period, such as 7 days",
      "Make the client re-upload all blocks after every commit to be safe",
      "Run the sweep more often, so unreferenced blocks are cleaned before they pile up"
    ],
    "answer": 1,
    "explanation": "A block uploaded but not yet committed looks unreferenced, so a grace window keeps recent uploads safe until their commit lands, as git gc also does. Reference counting is incremented on commit, not upload, so it has the same race and adds its own count drift.",
    "tags": [
      "blocklist-versioned-file-metadata",
      "staff",
      "inline"
    ]
  }
];
