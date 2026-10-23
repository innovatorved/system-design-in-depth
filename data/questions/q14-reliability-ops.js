window.QUESTION_BANK = window.QUESTION_BANK || {};

window.QUESTION_BANK["observability-for-distributed-systems"] = [
  {
    "id": "observability-for-distributed-systems-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Saturation signal",
    "section": "The Four Golden Signals",
    "prompt": "A service's p99 latency and error rate both look normal, but its worker thread pool is 97% busy and the request queue is growing every minute. Which golden signal is warning you before users notice?",
    "options": [
      "Traffic, because the queue growth means demand has risen",
      "Latency, because queued requests will soon take longer",
      "Saturation, because the most constrained resource is nearly full",
      "Errors, because a full pool will start rejecting requests"
    ],
    "answer": 2,
    "explanation": "Saturation measures how close the most constrained resource (here the thread pool) is to its limit, and it is the leading indicator before latency and errors degrade. Latency is tempting, but it is still normal; it is the lagging symptom that saturation predicts.",
    "tags": [
      "observability-for-distributed-systems",
      "recall",
      "inline"
    ]
  },
  {
    "id": "observability-for-distributed-systems-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Label cardinality math",
    "section": "Worked example: sizing telemetry for one service fleet",
    "prompt": "A latency histogram has 12 buckets and labels endpoint (40 values), status_class (5) and region (3), giving 7,200 series. An engineer adds a pod label with 60 values. Roughly how many series does the metric now produce?",
    "options": [
      "About 7,260, since one new label adds 60 series",
      "About 72,000, since pods only multiply the bucket count",
      "About 14,400, since each label doubles the series count",
      "About 432,000, since every label value multiplies the total"
    ],
    "answer": 3,
    "explanation": "Series count is the product of all label value counts and buckets, so 7,200 x 60 = 432,000. Treating a new label as additive (7,260) is the common mistake, and it is exactly why identifiers like customer_id belong in logs and trace attributes instead of metric labels.",
    "tags": [
      "observability-for-distributed-systems",
      "apply",
      "inline"
    ]
  },
  {
    "id": "observability-for-distributed-systems-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Dead man's switch",
    "section": "Failure modes to design for",
    "prompt": "During a cluster-wide memory incident, the Prometheus server running inside the same Kubernetes cluster was OOM-killed, and no alerts fired for 40 minutes. Which change most directly prevents a repeat?",
    "options": [
      "Add more alert rules for memory pressure to that same Prometheus",
      "Run alerting on independent infrastructure with an always-firing heartbeat alert",
      "Lower the scrape interval so the outage is detected more quickly",
      "Switch the cluster's traces from head sampling to tail sampling"
    ],
    "answer": 1,
    "explanation": "The monitoring system failed together with what it monitored, so the fix is independent alerting plus a dead man's switch that pages when the heartbeat stops arriving. More rules or faster scrapes in the same Prometheus still die with it.",
    "tags": [
      "observability-for-distributed-systems",
      "staff",
      "inline"
    ]
  },
  {
    "id": "observability-for-distributed-systems-n1",
    "topic": "observability-for-distributed-systems",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: High-Cardinality Metric Time-Series Explosion",
    "scenario": "A team adds a `user_id` label (`5,000,000` active users) to an HTTP latency histogram that already has `5` endpoints × `4` status codes × `10` histogram buckets (`200` base time series without `user_id`).",
    "prompt": "How many billions of active time series (`200 × 5,000,000` in billions) would be created in Prometheus/TSDB by adding `user_id` as a metric label?",
    "question": "How many billions of active time series (`200 × 5,000,000` in billions) would be created in Prometheus/TSDB by adding `user_id` as a metric label?",
    "unit": "billion series",
    "answer": 1,
    "tolerance": 0.2,
    "hint": "Multiply 200 base series by 5,000,000 distinct `user_id` values (`1,000,000,000`).",
    "explanation": "200 × 5,000,000 = 1,000,000,000 (1 billion) active time series, which will immediately OOM-crash any time-series database—high-cardinality identifiers (`user_id`, `request_id`, `ip`) belong in structured logs/traces or exemplars, never metric labels.",
    "tags": [
      "observability-for-distributed-systems",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "observability-for-distributed-systems-t1",
    "topic": "observability-for-distributed-systems",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Head-Based vs Tail-Based Distributed Trace Sampling",
    "scenario": "Your microservices handle 200,000 req/s and you can afford to store 1% of distributed traces (`2,000 traces/sec`), but only 0.05% of requests throw HTTP 500 or exceed 2 seconds latency, and engineers need 100% of those anomalous traces.",
    "prompt": "Should you use Head-Based Sampling at the ingress gateway or Tail-Based Sampling at a trace collector tier, and why?",
    "question": "Should you use Head-Based Sampling at the ingress gateway or Tail-Based Sampling at a trace collector tier, and why?",
    "options": [
      "Use 1% random Head-Based Sampling at ingress so 99% of rare production 500 errors are discarded",
      "Store 100% of all 200,000 traces/sec uncompressed forever",
      "Combine a baseline Head-Based sample (e.g., 0.5% for normal baselines) with Tail-Based Sampling at stateful trace collector buffers (routing spans by `trace_id` hash) that retain 100% of traces containing an error status or high tail latency"
    ],
    "correctOption": 2,
    "reasons": [
      "Ingress gateways know in advance whether a downstream DB call will fail 300 ms later",
      "Storing 100% of spans costs nothing at 200k RPS",
      "Whether a request fails or breaches latency SLO is only known after the request finishes; routing spans by `trace_id` to collector ring buffers lets Tail-Based Sampling keep 100% of slow/error traces while dropping boring healthy traces"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "At the moment a request enters the API gateway (the \"head\"), do you know if the 4th microservice hop will throw an exception?",
    "explanation": "Head-based sampling decides before execution and misses 99% of rare errors. Tail-based sampling buffers spans by `trace_id` for a few seconds and retains 100% of error and high-latency traces.",
    "tags": [
      "observability-for-distributed-systems",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["slos-and-error-budgets"] = [
  {
    "id": "slos-and-error-budgets-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "SLO versus SLA",
    "section": "SLI, SLO, and SLA Demystified",
    "prompt": "Your contract promises customers 99.9% monthly availability with service credits below that. How should the internal SLO relate to this SLA?",
    "options": [
      "Set it stricter, such as 99.95%, so you react before penalties apply",
      "Set it equal to 99.9%, so engineering and the contract use one number",
      "Set it looser, such as 99.5%, so the team has room to ship features",
      "Leave it undefined, since the SLA already defines the error budget"
    ],
    "answer": 0,
    "explanation": "A stricter internal SLO gives a margin: you burn through internal budget and change behaviour before customers are owed credits. Setting it equal to the SLA means the first time you notice trouble is the moment it already costs money.",
    "tags": [
      "slos-and-error-budgets",
      "recall",
      "inline"
    ]
  },
  {
    "id": "slos-and-error-budgets-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Burn-rate threshold",
    "section": "Burn-rate alerting",
    "prompt": "A service has a 99.5% SLO over 30 days. Using the 14.4x burn-rate page (1-hour long window, 5-minute short window), what 1-hour error ratio triggers the page?",
    "options": [
      "Above 1.44%, the same threshold used for a 99.9% SLO",
      "Above 14.4%, since the burn rate maps directly to a percentage",
      "Above 7.2%, which is 14.4 times the 0.5% error budget",
      "Above 0.72%, which is 14.4 times the budget divided by ten"
    ],
    "answer": 2,
    "explanation": "The threshold is burn rate times the budget fraction: 14.4 x 0.5% = 7.2%. Reusing 1.44% is tempting, but that value is specific to a 99.9% SLO with its 0.1% budget.",
    "tags": [
      "slos-and-error-budgets",
      "apply",
      "inline"
    ]
  },
  {
    "id": "slos-and-error-budgets-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Low-traffic SLIs",
    "section": "Writing a good SLI",
    "prompt": "An internal admin API gets about 100 requests per hour and has a 99.9% SLO with standard burn-rate alerts. On-call gets paged whenever a single request fails. What is the best fix?",
    "options": [
      "Raise the burn-rate multiplier until single failures stop paging",
      "Use longer windows, add synthetic probes, or fold it into a combined SLO",
      "Drop the SLI and alert on raw 5xx counts over five minutes instead",
      "Loosen the SLO to 99% so that each failure consumes less budget"
    ],
    "answer": 1,
    "explanation": "At 100 requests per hour one failure is 1% of the hour, so the ratio is too noisy to judge on short windows. The lesson's remedies are longer windows, synthetic traffic, or aggregating services. Tweaking the multiplier or loosening the SLO hides the problem and also hides real outages.",
    "tags": [
      "slos-and-error-budgets",
      "staff",
      "inline"
    ]
  },
  {
    "id": "slos-and-error-budgets-n1",
    "topic": "slos-and-error-budgets",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Monthly 99.9% Availability Error Budget in Minutes",
    "scenario": "Your checkout service commits to a 99.9% ('three nines') monthly availability SLO over a 30-day window (`30 days × 24 hours × 60 minutes = 43,200 minutes`).",
    "prompt": "How many minutes of total downtime (or equivalent 100%-error minutes) are allowed in a 30-day month under a 99.9% availability SLO (rounded to the nearest integer)?",
    "question": "How many minutes of total downtime (or equivalent 100%-error minutes) are allowed in a 30-day month under a 99.9% availability SLO (rounded to the nearest integer)?",
    "unit": "minutes",
    "answer": 43,
    "tolerance": 0.25,
    "hint": "Error budget fraction = 1 - 0.999 = 0.001. Multiply 43,200 minutes × 0.001.",
    "explanation": "In a 30-day month (43,200 minutes), a 99.9% SLO permits `0.1%` unavailability: `43,200 × 0.001 = 43.2 minutes` (~43 minutes). At 99.99% ('four nines'), that drops to just 4.32 minutes per month!",
    "tags": [
      "slos-and-error-budgets",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "slos-and-error-budgets-t1",
    "topic": "slos-and-error-budgets",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Multi-Window Multi-Burn-Rate Alerting vs Static 1-Minute Error Thresholds",
    "scenario": "Your team pages the on-call engineer whenever the 1-minute HTTP 5xx error rate exceeds 0.1%. On-call engineers are paged 15 times a week for 20-second transient blips that consume less than 0.05% of the monthly error budget, causing severe alert fatigue.",
    "prompt": "Which SRE alerting strategy eliminates false-positive pages while still catching catastrophic outages in minutes?",
    "question": "Which SRE alerting strategy eliminates false-positive pages while still catching catastrophic outages in minutes?",
    "options": [
      "Raise the 1-minute threshold to 50% errors so only complete outages page on-call",
      "Use Multi-Window, Multi-Burn-Rate alerts (e.g., paging only when BOTH a 1-hour window AND a 5-minute confirmation window exceed a 14.4x error-budget burn rate, and creating a ticket for slow 1x–3x burns)",
      "Disable all automated alerts and rely on customers posting on social media"
    ],
    "correctOption": 1,
    "reasons": [
      "A 40% error rate for 30 days preserves a 99.9% availability SLO",
      "Requiring both a short window (fast detection + fast reset when resolved) and a longer window at a high burn-rate multiplier guarantees pages only fire when a meaningful fraction (e.g., 2%) of the 30-day error budget is actually threatened",
      "Customer tweets have a guaranteed sub-minute MTTD (Mean Time To Detect)"
    ],
    "correctReason": 1,
    "answer": {
      "option": 1,
      "reason": 1
    },
    "hint": "From the Google SRE Workbook: why pair a 1-hour window with a 5-minute window at a 14.4x burn rate?",
    "explanation": "A 14.4x burn rate consumes 2% of a 30-day error budget in 1 hour. Requiring both the 1-hour and 5-minute windows to exceed 14.4x prevents brief 30-second blips from paging while firing within minutes of a real incident and clearing within 5 minutes of mitigation.",
    "tags": [
      "slos-and-error-budgets",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["incident-response"] = [
  {
    "id": "incident-response-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Who approves rollback",
    "section": "Structured Incident Roles",
    "prompt": "In a SEV1, the ops lead proposes rolling back a deploy while the comms lead is drafting a status update. Who has final authority to approve the rollback?",
    "options": [
      "The ops lead, because they are closest to the technical evidence",
      "The engineer who made the deploy, because they know the change best",
      "The incident commander, because they own mitigation decisions",
      "The comms lead, because the rollback will change customer messaging"
    ],
    "answer": 2,
    "explanation": "The IC owns the incident and has final say on mitigations such as rollback or failover, while the ops lead executes. Letting the ops lead decide seems natural, but it collapses coordination and hands-on work into one person, which the role split is designed to avoid.",
    "tags": [
      "incident-response",
      "recall",
      "inline"
    ]
  },
  {
    "id": "incident-response-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Detect and mitigate times",
    "section": "Worked timeline",
    "prompt": "A deploy ships at 09:40. The burn-rate alert pages at 09:47, the IC is appointed at 09:50, rollback is approved at 09:58, and errors return to baseline at 10:05. Using the lesson's definitions, what are time to detect and time to mitigate?",
    "options": [
      "Detect 10 minutes and mitigate 15 minutes, counted from the IC",
      "Detect 7 minutes and mitigate 25 minutes, counted from the deploy",
      "Detect 7 minutes and mitigate 7 minutes, counted from the approval",
      "Detect 7 minutes and mitigate 18 minutes, counted from the page"
    ],
    "answer": 3,
    "explanation": "Detection runs from the triggering change to the page (09:40 to 09:47), and mitigation from the page to errors at baseline (09:47 to 10:05), matching the lesson's 4 and 17 minute example. Measuring mitigation from the deploy double-counts the detection time.",
    "tags": [
      "incident-response",
      "apply",
      "inline"
    ]
  },
  {
    "id": "incident-response-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Blameless action items",
    "section": "What goes in a postmortem",
    "prompt": "A draft postmortem says: root cause, engineer renamed a config key in one service but not the other; action item, remind engineers to be careful. Which revision best matches the lesson?",
    "options": [
      "Keep the single root cause but add mandatory two-person review for every change",
      "List contributing factors such as no schema check in CI and a canary that ignored 5xx, each with an owner and due date",
      "Replace the root cause with a broader one, human error under time pressure, and schedule training",
      "Move the analysis to a private document so that the engineer involved is not identified"
    ],
    "answer": 1,
    "explanation": "Blameless reviews ask why the system allowed one mistake to cause an outage and produce owned, dated guardrails such as CI schema validation and canary gates. Blanket two-person review sounds rigorous but still treats the person as the fault and does not fix the missing automated checks.",
    "tags": [
      "incident-response",
      "staff",
      "inline"
    ]
  },
  {
    "id": "incident-response-n1",
    "topic": "incident-response",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Monthly Error Budget Burn Rate (`99.9%` SLO)",
    "scenario": "A service has a 30-day (`43,200-minute`) availability SLO of `99.9%` (`0.1%` allowed unavailability = `43.2 minutes` of total error budget per 30 days). During a partial outage where `20%` of requests are failing, the service burns through its error budget much faster than `1×`.",
    "prompt": "At a `20%` error rate (`0.20`) against a `0.1%` (`0.001`) error budget, what is the dimensionless burn rate (`0.20 / 0.001`)?",
    "question": "At a `20%` error rate (`0.20`) against a `0.1%` (`0.001`) error budget, what is the dimensionless burn rate (`0.20 / 0.001`)?",
    "unit": "x",
    "answer": 200,
    "tolerance": 0.2,
    "hint": "Divide the current 20% (`0.20`) error rate by the allowed 0.1% (`0.001`) error budget.",
    "explanation": "A 20% error rate against a 0.1% error budget is a `0.20 / 0.001 = 200×` burn rate, meaning the entire 30-day error budget will be exhausted in `43,200 / 200 = 216 minutes` (`3.6 hours`).",
    "tags": [
      "incident-response",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "incident-response-t1",
    "topic": "incident-response",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Root-Cause Debugging First vs Mitigate/Restore Service First During a SEV-1",
    "scenario": "Two minutes after a deployment, checkout error rates jump to 35% (SEV-1). One engineer wants to attach a profiler and spend 40 minutes reading stack traces on the live broken pods before rolling back, fearing a rollback will \"destroy the crime scene\".",
    "prompt": "What is the disciplined Incident Command (ICS) priority during a live customer-impacting SEV-1?",
    "question": "What is the disciplined Incident Command (ICS) priority during a live customer-impacting SEV-1?",
    "options": [
      "Leave checkout broken for 40 minutes while stepping through a live debugger in production",
      "Have 15 engineers simultaneously SSH into production and edit config files without coordination",
      "Prioritize immediate customer impact mitigation (rollback deploy, flip feature flag, shift traffic, or quarantine a single canary pod for forensics while rolling back the other 99% of pods) under a single Incident Commander"
    ],
    "correctOption": 2,
    "reasons": [
      "Customers prefer a 40-minute outage over a fast rollback",
      "Uncoordinated SSH edits during an outage prevent cascading mistakes",
      "Stopping the bleeding (reducing MTTR) comes first; you can preserve forensic state by snapshotting heap/logs or isolating 1 pod out of the load balancer while immediately rolling back the serving fleet"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How can you both stop customer bleeding in 60 seconds AND preserve forensic evidence?",
    "explanation": "In incident response, mitigating user impact (rollback, feature flag kill-switch, traffic drain) always takes precedence over root-cause investigation. Isolating one pod from the load balancer preserves any needed memory dump while restoring service.",
    "tags": [
      "incident-response",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["deployment-and-migration-safety"] = [
  {
    "id": "deployment-and-migration-safety-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Blue-green trade-off",
    "section": "Trade-offs between strategies",
    "prompt": "Which deployment strategy needs roughly double the fleet capacity, exposes all traffic at the moment of the switch, and can roll back in seconds by flipping the router?",
    "options": [
      "Blue-green deployment",
      "Rolling update",
      "Canary release",
      "Feature-flag dark launch"
    ],
    "answer": 0,
    "explanation": "Blue-green keeps two full fleets and moves all traffic at once, so rollback is fast but the blast radius at the switch is everything. A canary also rolls back in seconds, but it only exposes the canary percentage and needs little extra capacity.",
    "tags": [
      "deployment-and-migration-safety",
      "recall",
      "inline"
    ]
  },
  {
    "id": "deployment-and-migration-safety-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Canary signal versus noise",
    "section": "Worked example: is the canary actually worse?",
    "prompt": "A fleet serves 10,000 requests per second with a 0.1% baseline 5xx rate. A 1% canary bakes for 10 minutes, and the new build actually fails 0.11% of requests. What should the automated analysis conclude?",
    "options": [
      "About 660 errors against 600, a 10% jump, so roll back immediately",
      "About 66 errors against 60, under 1% worse, so promote to 10%",
      "About 66 errors against 60, inside noise, so bake longer or widen the canary",
      "About 6 errors against 60, too few requests, so skip the canary stage"
    ],
    "answer": 2,
    "explanation": "The canary gets 100 requests per second, so 60,000 requests in 10 minutes: about 60 errors expected against about 66 observed, which is within normal variation. Promoting on that evidence is the tempting mistake; the lesson's answer is more samples, a longer bake or a more sensitive signal such as latency percentiles.",
    "tags": [
      "deployment-and-migration-safety",
      "apply",
      "inline"
    ]
  },
  {
    "id": "deployment-and-migration-safety-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Rollback that cannot roll back",
    "section": "Keeping old and new versions compatible",
    "prompt": "Release N+1 starts writing a new enum value into a shared queue. Its canary looks healthy, but after a rollback for an unrelated bug, version N consumers crash on the messages already in the queue. What practice would have prevented this?",
    "options": [
      "Run the canary longer so that the enum problem shows up in metrics first",
      "Use blue-green deployment so that rollback happens in seconds instead of minutes",
      "Pin consumers to the producer version so both always upgrade together",
      "Ship readers that tolerate the new value one release before any writer emits it"
    ],
    "answer": 3,
    "explanation": "Versions N and N+1 coexist during deploys and rollbacks, so formats must be added before they are used: first deploy code that can read the value, then start writing it. A faster rollback does not help, because the incompatible data is already in the queue.",
    "tags": [
      "deployment-and-migration-safety",
      "staff",
      "inline"
    ]
  },
  {
    "id": "deployment-and-migration-safety-n1",
    "topic": "deployment-and-migration-safety",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Statistical Detection Sample Size on a 1% Canary",
    "scenario": "Your cluster serves `10,000 req/s` total. You route `1%` of traffic (`100 req/s`) to a Canary deployment that introduces a regression increasing error rate by `+2%` (`2` extra errors/sec on the canary). Your automated canary judge requires observing at least `60` excess errors to trigger an automatic rollback with high statistical confidence.",
    "prompt": "How many seconds of canary observation (`60 excess errors / 2 errors/s`) are required to trigger the automated rollback?",
    "question": "How many seconds of canary observation (`60 excess errors / 2 errors/s`) are required to trigger the automated rollback?",
    "unit": "seconds",
    "answer": 30,
    "tolerance": 0.2,
    "hint": "Divide 60 required excess errors by 2 excess errors per second.",
    "explanation": "At 100 req/s on the 1% canary with a +2% error delta (2 errors/sec), collecting 60 errors takes 30 seconds, while shielding 99% of users from the bad build.",
    "tags": [
      "deployment-and-migration-safety",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "deployment-and-migration-safety-t1",
    "topic": "deployment-and-migration-safety",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Big-Bang Cutover vs Progressive Canary + Feature Flags",
    "scenario": "A team has spent 3 months rewriting the pricing calculation engine and wants to ship it to 100% of users on Friday afternoon by replacing the old deployment in one step.",
    "prompt": "How should a high-risk core logic rewrite be rolled out safely in production?",
    "question": "How should a high-risk core logic rewrite be rolled out safely in production?",
    "options": [
      "Deploy to 100% of production pods simultaneously with no fallback path",
      "Test only on staging with 5 synthetic requests and assume production traffic is identical",
      "Decouple deployment from release: ship dark behind a feature flag, run asynchronous shadow/dark-read comparisons against the legacy engine first, then ramp user traffic progressively (1% -> 5% -> 25% -> 100%) with automated SLO rollback gates"
    ],
    "correctOption": 2,
    "reasons": [
      "100% instant cutovers minimize blast radius when a bug occurs",
      "5 synthetic staging requests cover all production edge cases",
      "Shadow comparisons validate output parity on real production inputs with zero user risk, and progressive feature-flag ramping enables instant (<1s) kill-switch rollback without waiting for container redeploys"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What is the difference between *deploying* binaries and *releasing* behavior to traffic?",
    "explanation": "Decoupling container deployment from feature activation (via feature flags, dark shadowing, and progressive canary ramps) shrinks blast radius and reduces rollback time from minutes to milliseconds.",
    "tags": [
      "deployment-and-migration-safety",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["database-migration-safety"] = [
  {
    "id": "database-migration-safety-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Why keep dual writing",
    "section": "The Expand and Contract Pattern",
    "prompt": "In the switch-read phase of expand and contract, the application reads the new column but keeps writing to both columns. Why keep the old writes going at this stage?",
    "options": [
      "So the background backfill can keep copying rows into the new column",
      "So rolling back to the previous release, which reads the old column, stays safe",
      "So database replicas can apply the change without any extra lag",
      "So the old column can be dropped in this same release without errors"
    ],
    "answer": 1,
    "explanation": "Dual writing after the read switch keeps the old column current, so reverting to the release that reads it loses nothing. The backfill has already finished before reads switch, so it is not the reason; dropping the column in the same release is exactly what the pattern forbids.",
    "tags": [
      "database-migration-safety",
      "recall",
      "inline"
    ]
  },
  {
    "id": "database-migration-safety-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Backfill duration",
    "section": "Backfill arithmetic",
    "prompt": "You must backfill 900 million rows. Each batch updates 10,000 rows in its own transaction, and the job runs one batch every 200 ms. Ignoring throttling, roughly how long will the backfill take?",
    "options": [
      "About 2.5 hours",
      "About 10 hours",
      "About 5 hours",
      "About 50 minutes"
    ],
    "answer": 2,
    "explanation": "10,000 rows every 0.2 s is 50,000 rows per second, and 900,000,000 / 50,000 = 18,000 s, or 5 hours. Getting 2.5 hours comes from counting five batches per second as ten; in practice replica-lag throttling will stretch the real run further.",
    "tags": [
      "database-migration-safety",
      "apply",
      "inline"
    ]
  },
  {
    "id": "database-migration-safety-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "DDL lock queue",
    "section": "Engine-specific facts that matter",
    "prompt": "On PostgreSQL 15 you run ALTER TABLE orders ADD COLUMN note text, a metadata-only change. The site nevertheless stalls for four minutes. What is the most likely cause and fix?",
    "options": [
      "The ALTER waited behind a long transaction and queued all queries behind it; set a short lock_timeout and retry",
      "The ALTER rewrote the entire table because no default was supplied; add a constant DEFAULT to avoid the rewrite",
      "The ALTER flooded replicas with WAL and triggered failover; run it through gh-ost to copy into a shadow table",
      "The ALTER invalidated every index on the table; rebuild the indexes afterwards with CREATE INDEX CONCURRENTLY"
    ],
    "answer": 0,
    "explanation": "Even instant DDL needs a brief exclusive lock; if a long-running transaction holds a conflicting lock, the ALTER waits and every new query queues behind it. Setting lock_timeout makes it fail fast and retry. Adding a nullable column without a default does not rewrite the table, so the rewrite explanation is wrong.",
    "tags": [
      "database-migration-safety",
      "staff",
      "inline"
    ]
  },
  {
    "id": "database-migration-safety-n1",
    "topic": "database-migration-safety",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Batched Backfill Throttle Rate and Duration",
    "scenario": "You need to backfill a new column across `100,000,000` rows. Updating all 100M rows in one transaction would blow up undo/WAL logs and replication lag. Instead, a migration worker updates batches of `5,000` rows per transaction at a throttled rate of `20` batches/sec (`100,000 rows/sec`), pausing whenever replica lag exceeds 500 ms.",
    "prompt": "How many seconds (`100,000,000 / 100,000`) will the throttled backfill take assuming no lag pauses?",
    "question": "How many seconds (`100,000,000 / 100,000`) will the throttled backfill take assuming no lag pauses?",
    "unit": "seconds",
    "answer": 1000,
    "tolerance": 0.2,
    "hint": "Divide 100,000,000 rows by 100,000 rows/sec (`5,000 × 20`).",
    "explanation": "At 20 batches/sec × 5,000 rows = 100,000 rows/sec, backfilling 100M rows completes in 1,000 seconds (~16.7 minutes) with tiny 5,000-row transactions and bounded replication lag.",
    "tags": [
      "database-migration-safety",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "database-migration-safety-t1",
    "topic": "database-migration-safety",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Adding `NOT NULL` Constraints Safely on Large Tables",
    "scenario": "You want to enforce `ALTER TABLE orders ALTER COLUMN currency SET NOT NULL` on a 500M-row PostgreSQL table. Directly running `SET NOT NULL` acquires an `ACCESS EXCLUSIVE` lock while scanning all 500M rows to verify no `NULL` values exist.",
    "prompt": "Which two-step PostgreSQL migration idiom enforces `NOT NULL` without a long table-locking scan?",
    "question": "Which two-step PostgreSQL migration idiom enforces `NOT NULL` without a long table-locking scan?",
    "options": [
      "Run `ALTER TABLE orders ALTER COLUMN currency SET NOT NULL` directly during peak hours",
      "Skip database constraints and hope no bug ever inserts `NULL`",
      "First add `ALTER TABLE orders ADD CONSTRAINT chk_currency_nn CHECK (currency IS NOT NULL) NOT VALID;`, then run `ALTER TABLE orders VALIDATE CONSTRAINT chk_currency_nn;` (which takes only a non-blocking `SHARE UPDATE EXCLUSIVE` lock), and then set `NOT NULL`"
    ],
    "correctOption": 2,
    "reasons": [
      "Holding an `ACCESS EXCLUSIVE` lock during a 500M-row scan never blocks live traffic",
      "Application bugs never insert `NULL` into unconstrained columns",
      "`ADD CONSTRAINT ... NOT VALID` commits in milliseconds, enforcing the check on new writes immediately, while `VALIDATE CONSTRAINT` scans existing rows online without blocking concurrent reads or writes (and Postgres 12+ then makes `SET NOT NULL` instant!)"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How does PostgreSQL's `NOT VALID` + `VALIDATE CONSTRAINT` avoid holding `ACCESS EXCLUSIVE` during the full table scan?",
    "explanation": "Adding a `CHECK (col IS NOT NULL) NOT VALID` constraint followed by `VALIDATE CONSTRAINT` validates all 500M rows under a weak lock that permits concurrent reads and writes; once validated, PostgreSQL proves no nulls exist and sets `NOT NULL` instantaneously.",
    "tags": [
      "database-migration-safety",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["parallel-monolith-read-drain"] = [
  {
    "id": "parallel-monolith-read-drain-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "What not to shadow",
    "section": "Dark Launching / Shadow Traffic",
    "prompt": "You are mirroring gateway traffic from the monolith to a new orders service that shares the production database. Which endpoint is unsafe to shadow as-is?",
    "options": [
      "POST /orders/{id}/refund, which issues a refund",
      "GET /orders?status=open, which lists open orders",
      "GET /orders/{id}, which returns one order",
      "HEAD /orders/{id}, which checks existence"
    ],
    "answer": 0,
    "explanation": "Shadowing duplicates the request, so a non-idempotent write such as a refund would execute twice. Reads are safe to mirror; the listing endpoint may be expensive, but duplicating it does not change any data.",
    "tags": [
      "parallel-monolith-read-drain",
      "recall",
      "inline"
    ]
  },
  {
    "id": "parallel-monolith-read-drain-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Triage the mismatch report",
    "section": "Worked example: reading the mismatch report",
    "prompt": "A 24-hour shadow run finds 41,000 mismatches: 28,000 in updated_at precision, 12,500 in currency rounding on discounted orders, and 500 read-after-write races against a lagging replica. Which group must be fixed in the new service before cutover?",
    "options": [
      "The updated_at precision group, because it is the largest share",
      "The read-after-write races, because they reveal stale replica reads",
      "None, because a 0.016% overall mismatch rate is low enough",
      "The currency rounding group, because it is a real correctness bug"
    ],
    "answer": 3,
    "explanation": "Rounding differences on discounted orders change what users are charged or shown, so that is a genuine bug. The precision group is the largest but harmless and should be normalised in the comparator, and the races are comparison artefacts handled by delayed re-comparison.",
    "tags": [
      "parallel-monolith-read-drain",
      "apply",
      "inline"
    ]
  },
  {
    "id": "parallel-monolith-read-drain-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Finishing the drain",
    "section": "Draining the monolith",
    "prompt": "Two weeks after the new service took 100% of gateway traffic, the monolith's /orders handler still receives about 3 requests per second. What should the team do next?",
    "options": [
      "Delete the handler now, since the gateway no longer routes users there",
      "Find the remaining callers, such as cron jobs or old app versions, and move them first",
      "Proxy those requests to the new service and treat the migration as complete",
      "Keep the handler deployed indefinitely in case the new service fails"
    ],
    "answer": 1,
    "explanation": "The drain is only done when the request counter stays at zero, and residual traffic usually comes from forgotten internal callers, scheduled jobs or old mobile clients. Deleting now breaks them silently; keeping it forever means the migration never finishes and the old code keeps costing maintenance.",
    "tags": [
      "parallel-monolith-read-drain",
      "staff",
      "inline"
    ]
  },
  {
    "id": "parallel-monolith-read-drain-n1",
    "topic": "parallel-monolith-read-drain",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Shadow Read Parity Mismatch Rate",
    "scenario": "During a Strangler Fig migration from a monolith to a new Catalog service, you shadow-read `1,000,000` production requests per hour to both services and asynchronously compare their normalized JSON responses. Out of 1,000,000 requests, `999,850` match identically and `150` show field discrepancies.",
    "prompt": "What is the mismatch rate in parts per million (ppm, i.e., mismatches per `1,000,000` requests)?",
    "question": "What is the mismatch rate in parts per million (ppm, i.e., mismatches per `1,000,000` requests)?",
    "unit": "ppm",
    "answer": 150,
    "tolerance": 0.2,
    "hint": "150 mismatches out of 1,000,000 requests is 150 parts per million.",
    "explanation": "150 mismatches per 1,000,000 requests = 150 ppm (0.015%), giving engineers a concrete queue of 150 diff payloads to inspect and fix before shifting live user reads.",
    "tags": [
      "parallel-monolith-read-drain",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "parallel-monolith-read-drain-t1",
    "topic": "parallel-monolith-read-drain",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Synchronous Dual-Read Blocking vs Asynchronous Shadow Read + Diff Demon",
    "scenario": "You are verifying that a newly extracted microservice returns identical responses to the legacy monolith before draining monolith read traffic.",
    "prompt": "How should the parallel shadow-read comparator be wired so bugs or latency spikes in the new service never affect live users during the verification phase?",
    "question": "How should the parallel shadow-read comparator be wired so bugs or latency spikes in the new service never affect live users during the verification phase?",
    "options": [
      "Call the monolith and the new service sequentially on the main thread and return HTTP 500 to the user if they differ",
      "Switch 100% of users to the new service immediately and wait for customer support tickets",
      "Serve the user directly from the legacy monolith while firing a non-blocking async shadow copy (with a tight timeout and separate bulkhead pool) to the new service, logging normalized response diffs (ignoring volatile fields like `request_id`/`server_time`) to a diff queue"
    ],
    "correctOption": 2,
    "reasons": [
      "Returning HTTP 500 on shadow diffs improves user experience",
      "Customer support tickets catch subtle rounding errors faster than automated diffing",
      "Fire-and-forget shadow reads with a dedicated bulkhead ensure zero added latency or failure risk to the live monolith path while testing the new service against 100% real production query shapes and concurrency"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens if the new candidate service crashes or hangs for 5 seconds while you are shadow-testing it?",
    "explanation": "Shadow reads must be completely decoupled from the user response path via an isolated thread/connection pool and short timeout so a candidate crash or tail-latency spike cannot degrade the legacy serving path.",
    "tags": [
      "parallel-monolith-read-drain",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["database-backups-and-restore"] = [
  {
    "id": "database-backups-and-restore-c1",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Precise PITR target",
    "section": "How PITR Works",
    "prompt": "An accidental DELETE ran at 14:02:15. An engineer plans to set recovery_target_time = '14:02:15'. What is the main risk, and what is the more precise approach?",
    "options": [
      "Timestamps may include or exclude the wrong commits; target the bad transaction's XID or LSN with inclusive set to false",
      "WAL can only be replayed to whole minutes; restore to 14:02:00 and manually re-enter the missing writes",
      "The snapshot may be newer than the target; always restore the oldest retained snapshot instead",
      "Replay may be too slow at this point; promote a streaming replica and skip replay entirely"
    ],
    "answer": 0,
    "explanation": "Several transactions may commit within the same second, so a timestamp target can replay the DELETE or drop good work. Finding the exact XID or LSN with pg_waldump and using recovery_target_inclusive = false stops just before it. A streaming replica is no help because it already applied the DELETE.",
    "tags": [
      "database-backups-and-restore",
      "staff",
      "inline"
    ]
  },
  {
    "id": "database-backups-and-restore-c2",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Replicas are not backups",
    "section": "Backup methods compared",
    "prompt": "A team says they need no backups because they run two synchronous streaming replicas in different zones. What failure are they unprotected against?",
    "options": [
      "Loss of the primary's disk during peak write traffic",
      "An outage of the availability zone that hosts the primary",
      "A mistaken DROP TABLE that is replicated within milliseconds",
      "A crash of the primary during a minor version upgrade"
    ],
    "answer": 2,
    "explanation": "Replicas copy every change, including deletes and corruption, almost immediately, so they protect against hardware and zone failure but not against mistakes. Disk and zone failure are precisely what replicas do cover, which is why teams mistake them for backups.",
    "tags": [
      "database-backups-and-restore",
      "recall",
      "inline"
    ]
  },
  {
    "id": "database-backups-and-restore-c3",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Estimating restore RTO",
    "section": "Worked example: RTO for a 2 TB PostgreSQL database",
    "prompt": "A 4 TB database has a base backup at 00:00 and generates 20 GB of WAL per hour. A bad write happens at 18:00. Restore runs at about 500 MB/s and WAL replay at about 100 MB/s. Roughly how long do restore plus replay take, before detection and validation?",
    "options": [
      "About 1.2 hours, dominated by the WAL replay",
      "About 3.2 hours, roughly 2.2 hours restore and 1 hour replay",
      "About 6 hours, because replay must process the full day of WAL",
      "About 45 minutes, since the restore and replay run in parallel"
    ],
    "answer": 1,
    "explanation": "4 TB at 500 MB/s is about 8,000 s (2.2 hours), and 18 hours x 20 GB = 360 GB at 100 MB/s is 3,600 s (1 hour). Replay only covers WAL since the base backup, not a full day, and it cannot start until the base copy is in place.",
    "tags": [
      "database-backups-and-restore",
      "apply",
      "inline"
    ]
  },
  {
    "id": "database-backups-and-restore-n1",
    "topic": "database-backups-and-restore",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Point-In-Time Recovery (PITR) Restore Time (`RTO`)",
    "scenario": "At `14:30`, an accidental `DROP TABLE` occurs. Your latest physical base backup (`4 TB`) was taken at `12:00`. Restoring the 4 TB physical snapshot from high-throughput object storage across striped NVMe drives runs at `4 GB/s` (`1,000 seconds`), and replaying `2.5 hours` (`90 GB`) of archived WAL segments runs at `150 MB/s` (`600 seconds`).",
    "prompt": "What is the total Recovery Time Objective (`RTO`, in seconds) to restore the base backup (`1,000 s`) and replay the WAL (`600 s`) up to `14:29:59`?",
    "question": "What is the total Recovery Time Objective (`RTO`, in seconds) to restore the base backup (`1,000 s`) and replay the WAL (`600 s`) up to `14:29:59`?",
    "unit": "seconds",
    "answer": 1600,
    "tolerance": 0.2,
    "hint": "Add the 1,000-second base snapshot restore and the 600-second WAL replay.",
    "explanation": "`1,000 s` (physical snapshot restore) + `600 s` (WAL archive replay) = `1,600 seconds` (~26.7 minutes) total RTO with near-zero data loss (`RPO ≈ 0`).",
    "tags": [
      "database-backups-and-restore",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "database-backups-and-restore-t1",
    "topic": "database-backups-and-restore",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Why Asynchronous Read Replicas Are NOT a Substitute for PITR Backups",
    "scenario": "A startup CTO says: \"We don't need automated snapshots or WAL archiving because we have 3 synchronous and asynchronous read replicas across 3 Availability Zones.\"",
    "prompt": "Why do read replicas fail to protect against logical data corruption, and what backup architecture is required?",
    "question": "Why do read replicas fail to protect against logical data corruption, and what backup architecture is required?",
    "options": [
      "Read replicas automatically block `DROP TABLE` and `DELETE FROM users` statements",
      "3 AZ replicas protect against accidental application bugs that overwrite rows",
      "Replication faithfully replicates `DROP TABLE`, `TRUNCATE`, and buggy `UPDATE` statements without a `WHERE` clause to all replicas within milliseconds; you must maintain immutable Point-In-Time Recovery (PITR = physical base snapshots + continuous WAL archiving) plus a delayed replica or cross-account WORM bucket"
    ],
    "correctOption": 2,
    "reasons": [
      "Consensus replication distinguishes accidental human `DROP TABLE` from intentional DDL",
      "Ransomware or compromised admin credentials cannot touch replicas in the same account",
      "Replication provides High Availability against hardware failure, whereas PITR backups (stored in an isolated immutable/WORM bucket) provide Recovery against human error, bad deploys, and security compromise"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How fast does `DELETE FROM users;` replicate to your 3 AZ replicas?",
    "explanation": "Replication is for hardware high availability; PITR (base snapshots + continuous WAL archive in an isolated account, tested via automated restore drills) is for logical corruption and human error.",
    "tags": [
      "database-backups-and-restore",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["disaster-recovery"] = [
  {
    "id": "disaster-recovery-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Naming RPO and RTO",
    "section": "RTO and RPO Targets",
    "prompt": "The business says: we can lose at most the last 5 minutes of orders, and the shop must be taking orders again within 1 hour. How do these map to recovery objectives?",
    "options": [
      "RTO is 5 minutes and RPO is 1 hour",
      "RPO and RTO are both 5 minutes",
      "RPO is 1 hour and RTO is 1 hour",
      "RPO is 5 minutes and RTO is 1 hour"
    ],
    "answer": 3,
    "explanation": "RPO is the acceptable data loss (the age of the newest data you may lose), and RTO is the acceptable downtime. Swapping them is the classic mix-up, and it leads to buying the wrong architecture.",
    "tags": [
      "disaster-recovery",
      "recall",
      "inline"
    ]
  },
  {
    "id": "disaster-recovery-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Zero RPO for payments",
    "section": "Worked example: what does failover really cost in time?",
    "prompt": "A warm-standby design uses asynchronous replication with up to 10 s of lag at peak. The payments team now demands an RPO of zero across a regional failure. What does that require, and what does it cost?",
    "options": [
      "Faster health checks, which cut detection time to seconds with no write penalty",
      "Synchronous cross-region replication or a consensus database, adding tens of ms per write",
      "A lower DNS TTL, so clients reach the new region before any data is lost",
      "Pre-scaling the standby to 100%, so no writes queue while it scales up"
    ],
    "answer": 1,
    "explanation": "With async replication, anything inside the lag window is lost on failover; zero RPO means a write is acknowledged only after another region has it, which costs a cross-region round trip per write. Detection, DNS and scaling changes reduce RTO but do nothing for data already committed only in the failed region.",
    "tags": [
      "disaster-recovery",
      "apply",
      "inline"
    ]
  },
  {
    "id": "disaster-recovery-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Split brain after failover",
    "section": "Failure modes",
    "prompt": "After failing over to the standby region, the old primary recovers and some application servers with stale config start writing to it again. Which control is designed to stop this?",
    "options": [
      "Fencing with a lease or quorum, so the old primary can no longer accept writes",
      "A lower replication lag target, so both copies stay nearly identical",
      "Point-in-time backups, so the conflicting writes can be restored later",
      "A shorter DNS TTL, so stale servers resolve the new primary sooner"
    ],
    "answer": 0,
    "explanation": "Split brain is two nodes both acting as primary; fencing revokes the old primary's right to accept writes so conflicting histories cannot form. A shorter TTL narrows the window but does not stop a server with stale config or cached connections from writing.",
    "tags": [
      "disaster-recovery",
      "staff",
      "inline"
    ]
  },
  {
    "id": "disaster-recovery-n1",
    "topic": "disaster-recovery",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Asynchronous Cross-Region RPO Data Loss Volume",
    "scenario": "A primary region ingests `4,000` committed orders/sec (`2 KB` per order = `8 MB/s`) and replicates asynchronously to a secondary disaster-recovery region with a replication lag of `5 seconds` when a sudden fiber cut + power failure destroys the primary region.",
    "prompt": "How many thousands of committed orders (`4,000 orders/s × 5 s`, in thousands) were acknowledged to users in the primary region but had not yet reached the DR region?",
    "question": "How many thousands of committed orders (`4,000 orders/s × 5 s`, in thousands) were acknowledged to users in the primary region but had not yet reached the DR region?",
    "unit": "thousand orders",
    "answer": 20,
    "tolerance": 0.2,
    "hint": "Multiply 4,000 orders/sec by the 5-second replication lag window, expressed in thousands.",
    "explanation": "With a 5-second async replication lag (`RPO = 5s`), an ungraceful primary region loss leaves `4,000 × 5 = 20,000` acknowledged orders un-replicated—highlighting the exact business trade-off between `RPO = 0` (synchronous multi-region quorum) and low local write latency.",
    "tags": [
      "disaster-recovery",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "disaster-recovery-t1",
    "topic": "disaster-recovery",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Cold Backup Restore vs Warm Pilot Light vs Active-Active Multi-Region",
    "scenario": "You are designing Disaster Recovery for two systems: System A (a core payment ledger requiring `RPO = 0` and `RTO < 30 seconds`) and System B (an internal batch reporting warehouse tolerating `RPO = 4 hours` and `RTO = 6 hours`).",
    "prompt": "How should you match DR tiers to System A and System B to optimize reliability vs cloud cost?",
    "question": "How should you match DR tiers to System A and System B to optimize reliability vs cloud cost?",
    "options": [
      "Use cold S3 tape backups for the payment ledger and 5-region synchronous Paxos for the internal batch warehouse",
      "Run every internal dev tool Active-Active across 4 continents",
      "Use multi-region synchronous consensus (or Active-Active / Hot-Standby across 3 regions) for System A (Payment Ledger), and Cross-Region Snapshot + WAL Replication (Pilot Light / Warm Standby) for System B (Reporting Warehouse)"
    ],
    "correctOption": 2,
    "reasons": [
      "A 6-hour outage on a payment ledger meets `RTO < 30s`",
      "Active-Active multi-region doubles or triples infrastructure and cross-region network egress cost",
      "Matching DR architecture to business criticality reserves expensive synchronous cross-region quorum and spare compute capacity for tier-0 revenue/ledger paths"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Compare the cost and latency of `RPO = 0, RTO < 30s` against `RPO = 4h, RTO = 6h`.",
    "explanation": "DR tiers (Backup & Restore, Pilot Light, Warm Standby, Multi-Site Active-Active) form a cost-vs-RTO/RPO spectrum; tiering services by criticality avoids paying tier-0 multi-region tax on tier-3 workloads.",
    "tags": [
      "disaster-recovery",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["data-retention-and-deletion"] = [
  {
    "id": "data-retention-and-deletion-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Tombstone resurrection",
    "section": "Core Production Deletion Mechanics",
    "prompt": "A Cassandra node was offline for 14 days. gc_grace_seconds is 10 days, and deletes happened while it was down. It rejoins and repair runs. What is the risk?",
    "options": [
      "Repair fails, because the node's SSTables are now in an older format",
      "The deletes are applied twice, which removes rows written after rejoining",
      "Deleted rows come back, because the tombstones were already purged elsewhere",
      "The node refuses reads until a full compaction finishes on every peer"
    ],
    "answer": 2,
    "explanation": "Once tombstones are garbage-collected after gc_grace_seconds, the returning node's old copies look like valid data and repair spreads them back. That is why repairs must complete within the grace period. Deletes are idempotent, so double application is not the risk.",
    "tags": [
      "data-retention-and-deletion",
      "recall",
      "inline"
    ]
  },
  {
    "id": "data-retention-and-deletion-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Asynchronous TTL",
    "section": "Retention schedule: decide the lifetime of data when you create it",
    "prompt": "Session records in DynamoDB carry a TTL attribute set to expiry time. Users report that some sessions still work hours after they should have expired. What is the correct fix?",
    "options": [
      "Shorten the TTL value so that DynamoDB deletes items sooner",
      "Run a scheduled scan that deletes expired items every minute",
      "Move sessions to a Redis cluster, which deletes keys exactly on time",
      "Treat TTL as cleanup only and reject expired items when reading"
    ],
    "answer": 3,
    "explanation": "DynamoDB TTL deletes are asynchronous and can lag expiry by days, so correctness must come from checking the expiry on read. Shortening the TTL would expire valid sessions early and still not make deletion timely, and a full scan every minute is expensive.",
    "tags": [
      "data-retention-and-deletion",
      "apply",
      "inline"
    ]
  },
  {
    "id": "data-retention-and-deletion-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Lake snapshots retain data",
    "section": "Worked example: an erasure request across 7 systems",
    "prompt": "The data-warehouse handler runs an Iceberg row-level DELETE for a user and reports success. Why might the user's data still be recoverable, and what completes the erasure?",
    "options": [
      "The delete only hid the rows from one engine; rerun it from every query engine",
      "Older table snapshots still reference the data; compact and expire those snapshots",
      "The catalog caches old metadata; restart the metastore so readers see the delete",
      "The rows remain in the WAL; rotate the database logs to finish the erasure"
    ],
    "answer": 1,
    "explanation": "Table formats keep prior snapshots for time travel, so the original data files remain until compaction rewrites them and snapshot expiry removes the old ones. The handler must not report completion until then; the delete itself is visible to all engines once committed.",
    "tags": [
      "data-retention-and-deletion",
      "staff",
      "inline"
    ]
  },
  {
    "id": "data-retention-and-deletion-n1",
    "topic": "data-retention-and-deletion",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: GDPR Crypto-Shredding vs Petabyte Backup Rewrite",
    "scenario": "A user exercises their GDPR \"Right to Erasure\" (Right to be Forgotten). Their records appear across `500 TB` of immutable Parquet data lake files and 30 days of cold database backups. Instead of rewriting `500 TB` of immutable files, each user's PII fields were encrypted with a per-user Data Encryption Key (`DEK`, `32 bytes`), stored in a central KMS/key table.",
    "prompt": "How many bytes of key material (`1 × 32 bytes`) must be permanently deleted from the KMS key store to crypto-shred all historical copies of that user's PII across the 500 TB lake?",
    "question": "How many bytes of key material (`1 × 32 bytes`) must be permanently deleted from the KMS key store to crypto-shred all historical copies of that user's PII across the 500 TB lake?",
    "unit": "bytes",
    "answer": 32,
    "tolerance": 0.2,
    "hint": "Deleting the user's single 32-byte `DEK` renders all ciphertext across backups permanently irrecoverable.",
    "explanation": "Destroying the single 32-byte per-subject `DEK` (crypto-shredding) renders every historical encrypted PII field in immutable backups and cold Parquet files permanently indecipherable in O(1) time without rewriting 500 TB.",
    "tags": [
      "data-retention-and-deletion",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "data-retention-and-deletion-t1",
    "topic": "data-retention-and-deletion",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Synchronous Cascading Hard-Delete Across 40 Microservices vs Async Erasure Workflow + Crypto-Shredding",
    "scenario": "When a user deletes their account, data exists in 40 microservices, search indexes, caches, Kafka logs, and immutable S3 backups, with a legal compliance SLA of 30 days (and immediate login/profile invisibility).",
    "prompt": "What is the production architecture for reliable, auditable user data deletion across a distributed ecosystem?",
    "question": "What is the production architecture for reliable, auditable user data deletion across a distributed ecosystem?",
    "options": [
      "Run a single synchronous HTTP request that calls `DELETE` across 40 microservices and rewrites S3 backups before returning 200 OK",
      "Only set `is_deleted = true` in the frontend UI and keep all plain-text PII forever",
      "Immediately revoke auth tokens and tombstone the profile at the gateway, emit a durable `UserErasureRequested` workflow event tracked by a central compliance orchestrator (requiring signed completion ACKs from all 40 data owners + compaction/TTL purges), and crypto-shred the user's KMS encryption key for immutable logs/backups"
    ],
    "correctOption": 2,
    "reasons": [
      "Synchronous 40-service cascading deletes never partially fail",
      "UI-only hiding satisfies GDPR/CCPA legal audits",
      "Immediate gateway/auth revocation gives instant user-facing deletion, a durable saga orchestrator tracks and retries physical erasure across every datastore with an audit trail, and crypto-shredding handles immutable append-only archives"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "How do you combine immediate user-visible deactivation, audited multi-service physical purge, and immutable backup compliance?",
    "explanation": "A three-part erasure pipeline—(1) instant auth/profile tombstoning, (2) orchestrated multi-service deletion saga with completion audit logs, and (3) per-user DEK crypto-shredding for immutable backups—solves deletion at scale.",
    "tags": [
      "data-retention-and-deletion",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["security-and-abuse-prevention"] = [
  {
    "id": "security-and-abuse-prevention-c1",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Containing lateral movement",
    "section": "Threat-to-control map",
    "prompt": "An attacker gains code execution in a low-value internal reporting service and starts calling the payments service directly. Which control is designed to limit this?",
    "options": [
      "A stricter WAF ruleset at the edge covering the OWASP Top 10",
      "Shorter JWT lifetimes for end-user access tokens",
      "mTLS workload identity with per-service authorisation policy",
      "Anycast scrubbing and SYN cookies at the network edge"
    ],
    "answer": 2,
    "explanation": "Lateral movement happens inside the perimeter, so the defence is verifying each caller's workload identity and allowing only the services that should reach payments. The WAF is tempting but sits at the edge; internal service-to-service calls never pass through it.",
    "tags": [
      "security-and-abuse-prevention",
      "staff",
      "inline"
    ]
  },
  {
    "id": "security-and-abuse-prevention-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Why IP limits fail",
    "section": "Worked example: credential stuffing against a login endpoint",
    "prompt": "An attacker sends 2 million login attempts per hour spread over 50,000 residential proxy IPs. The per-IP limit is 100 per hour. What happens, and which signal reveals the attack?",
    "options": [
      "Each IP sends 400 per hour, so the IP limit blocks the attack by itself",
      "Each IP sends 40 per hour, so detection requires a JA3 match on every IP",
      "Each IP sends 4 per hour, so only MFA on every login can stop it",
      "Each IP sends 40 per hour, under the limit; the global failure ratio spikes"
    ],
    "answer": 3,
    "explanation": "2,000,000 / 50,000 = 40 attempts per IP, below the 100 limit, so per-IP limits do nothing. The global login failure ratio jumping from about 5% toward 95% is the tell, and it can trigger endpoint-wide challenges. Fingerprinting helps, but it is one of several layered controls rather than the detection signal described.",
    "tags": [
      "security-and-abuse-prevention",
      "apply",
      "inline"
    ]
  },
  {
    "id": "security-and-abuse-prevention-c3",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Rotating the root key",
    "section": "Envelope encryption, step by step",
    "prompt": "With envelope encryption backed by KMS, why can you rotate the root key without re-encrypting terabytes of stored data?",
    "options": [
      "The root key wraps only the data keys, so only those small keys need rewrapping",
      "KMS transparently re-encrypts every object in the store during rotation",
      "The data is encrypted with the root key directly, and old versions stay valid",
      "The plaintext data keys are cached by the service, so data never needs them"
    ],
    "answer": 0,
    "explanation": "Payloads are encrypted with per-object data keys, and only those keys are wrapped by the root key in the HSM, so rotation touches keys, not data. Keeping plaintext data keys cached would defeat the design, since the plaintext DEK should exist only briefly in memory.",
    "tags": [
      "security-and-abuse-prevention",
      "recall",
      "inline"
    ]
  },
  {
    "id": "security-and-abuse-prevention-n1",
    "topic": "security-and-abuse-prevention",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Credential Stuffing Block Rate via Edge IP + Account Velocity Limits",
    "scenario": "A botnet launches a credential stuffing attack against `/api/login` at `50,000 req/s`, compared to `500 req/s` of legitimate user logins (`50,500 req/s` total). Password hashing with `Argon2id` costs `0.1 CPU-seconds` per attempt (`5,050 CPU cores` if unfiltered!). Edge WAF + IP/JA4/Account velocity rules drop `99%` of the botnet traffic (`49,500 req/s` blocked at the edge) before reaching the auth service.",
    "prompt": "How many total login requests per second (`500 legitimate + 500 remaining bot = 1,000`) actually reach the `Argon2id` auth service after the 99% edge block?",
    "question": "How many total login requests per second (`500 legitimate + 500 remaining bot = 1,000`) actually reach the `Argon2id` auth service after the 99% edge block?",
    "unit": "req/s",
    "answer": 1000,
    "tolerance": 0.2,
    "hint": "Add the 500 legitimate req/s and the remaining 1% of 50,000 bot req/s (`500`).",
    "explanation": "Blocking 99% of the 50,000 req/s attack at the CDN/WAF edge leaves only `500 + 500 = 1,000 req/s` reaching the auth service (needing 100 CPU cores instead of 5,050 cores), preventing an authentication DoS outage.",
    "tags": [
      "security-and-abuse-prevention",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "security-and-abuse-prevention-t1",
    "topic": "security-and-abuse-prevention",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Blocking Solely by IP Address vs Layered Defense-in-Depth (IP + Target Account + Device/TLS Fingerprint)",
    "scenario": "An attacker uses a residential proxy botnet of 200,000 distinct IP addresses where each IP sends only 1 request per minute, targeting a specific set of high-value user accounts. Meanwhile, 5,000 legitimate employees behind a corporate NAT (or university Wi-Fi) share a single public IP address.",
    "prompt": "Why does naive per-IP rate limiting both miss the botnet AND lock out legitimate users, and what is the correct defense?",
    "question": "Why does naive per-IP rate limiting both miss the botnet AND lock out legitimate users, and what is the correct defense?",
    "options": [
      "Lower the per-IP rate limit to 2 requests/minute globally so the corporate NAT is permanently blocked",
      "Remove all rate limiting on `/login` and `/checkout`",
      "Use composite multi-dimensional rate limiting and risk scoring across `(target_account_id)`, `(ip_subnet / ASN)`, and `(TLS JA4 / device fingerprint)`, escalating suspicious flows to step-up challenges (Turnstile/WebAuthn/MFA) rather than hard-blocking shared NAT IPs"
    ],
    "correctOption": 2,
    "reasons": [
      "Blocking an entire university or hospital sharing one NAT IP is acceptable collateral damage",
      "Residential proxy botnets use only a single IP address",
      "Per-account limits catch distributed low-and-slow attacks against a single user regardless of how many proxy IPs are used, while device/TLS fingerprinting + step-up CAPTCHA/MFA protects shared corporate NAT IPs from false lockouts"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "What happens when 200,000 proxy IPs each try 1 password against `victim@company.com`, vs 5,000 students logging in from 1 campus IP?",
    "explanation": "Attackers rotate IPs while legitimate enterprise/mobile users share carrier-grade NAT IPs. Keying limits separately on `target_username` (with progressive backoff/challenge), `device_fingerprint`, and `IP + Reputation` stops both distributed attacks and NAT false positives.",
    "tags": [
      "security-and-abuse-prevention",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["rate-limiter-placement-and-keys"] = [
  {
    "id": "rate-limiter-placement-and-keys-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "IPv6 keying",
    "section": "Choosing the Rate Limit Key",
    "prompt": "Why does the lesson recommend keying anonymous IPv6 clients by prefix, such as a /64, rather than by full address?",
    "options": [
      "IPv6 headers are larger, so full addresses make keys too costly to store",
      "One subscriber usually controls a whole /64 and can rotate addresses in it",
      "Carrier-grade NAT makes every IPv6 user share a single full address",
      "Full IPv6 addresses cannot be read reliably from the X-Forwarded-For header"
    ],
    "answer": 1,
    "explanation": "A single home or device is typically assigned a /64 with an enormous number of addresses, so per-address limits are trivially evaded. The NAT sharing problem is an IPv4 issue; IPv6 has the opposite problem of too many addresses per client.",
    "tags": [
      "rate-limiter-placement-and-keys",
      "recall",
      "inline"
    ]
  },
  {
    "id": "rate-limiter-placement-and-keys-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Two limits on reset",
    "section": "Worked example: keys for a public API",
    "prompt": "POST /password-reset has two limits that must both pass: 5 per hour per email and 20 per hour per IP prefix. Which attack does each limit stop?",
    "options": [
      "Both limits stop the same attack, and the second only adds redundancy",
      "The IP limit stops harassment of one victim; the email limit stops broad spraying",
      "The email limit stops harassment from many IPs; the IP limit stops spraying many emails",
      "The email limit stops bots; the IP limit stops users sharing office NAT"
    ],
    "answer": 2,
    "explanation": "An attacker flooding one victim from many IPs is caught by the per-email key, while one source spraying resets across many emails is caught by the per-prefix key. Swapping them is the tempting error: an IP limit cannot catch an attack that comes from many IPs.",
    "tags": [
      "rate-limiter-placement-and-keys",
      "apply",
      "inline"
    ]
  },
  {
    "id": "rate-limiter-placement-and-keys-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Fail open or closed",
    "section": "Failure behaviour",
    "prompt": "The shared Redis behind your limiter becomes unreachable and calls time out after 5 ms. How should GET /catalog and POST /otp/send behave?",
    "options": [
      "Catalog fails open with a local approximate limit; OTP send fails closed",
      "Both fail closed, since any request without a limit check is a risk",
      "Both fail open, since the limiter must never become a single point of failure",
      "Catalog fails closed to protect the fleet; OTP send fails open for usability"
    ],
    "answer": 0,
    "explanation": "Low-risk reads should keep serving with a coarse per-instance backstop, while OTP sends cost money and enable abuse, so they fail closed. Failing everything open sounds principled, but it leaves SMS pumping and brute force unprotected exactly when the limiter is down.",
    "tags": [
      "rate-limiter-placement-and-keys",
      "staff",
      "inline"
    ]
  },
  {
    "id": "rate-limiter-placement-and-keys-n1",
    "topic": "rate-limiter-placement-and-keys",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Local Batch Token Reservation vs Per-Request Redis RPC",
    "scenario": "An API gateway fleet of 80 nodes handles `400,000 req/s`. Calling a central Redis rate limiter on every single request issues `400,000 RPCs/sec`. Instead, each gateway node syncs/leases token batches with Redis asynchronously every `100 ms` (`10 syncs/sec` per gateway node).",
    "prompt": "How many Redis RPCs per second (`80 nodes × 10 syncs/s`) are issued across the entire gateway fleet with 100 ms local batch syncing?",
    "question": "How many Redis RPCs per second (`80 nodes × 10 syncs/s`) are issued across the entire gateway fleet with 100 ms local batch syncing?",
    "unit": "RPCs/s",
    "answer": 800,
    "tolerance": 0.2,
    "hint": "Multiply 80 gateway nodes by 10 syncs per second.",
    "explanation": "80 nodes × 10 syncs/sec = 800 Redis RPCs/sec instead of 400,000 RPCs/sec—a 500× reduction in Redis load and zero added network latency on the request path!",
    "tags": [
      "rate-limiter-placement-and-keys",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "rate-limiter-placement-and-keys-t1",
    "topic": "rate-limiter-placement-and-keys",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Fail-Open vs Fail-Closed When the Rate-Limiter Redis Cluster Degrades",
    "scenario": "Your edge API gateway checks a Redis cluster for rate limiting. Suddenly a network blip causes Redis timeouts across the region.",
    "prompt": "Should the API gateway Fail-Open (allow traffic), Fail-Closed (reject 100% of traffic with HTTP 500/429), or use Local Fallback Enforcement, and why?",
    "question": "Should the API gateway Fail-Open (allow traffic), Fail-Closed (reject 100% of traffic with HTTP 500/429), or use Local Fallback Enforcement, and why?",
    "options": [
      "Fail-Closed unconditionally so a Redis cache blip causes a 100% global outage of your entire company",
      "Wait 30 seconds on every Redis timeout before forwarding the request",
      "Enforce a ultra-tight timeout (<5 ms) on Redis and fall back to an in-memory per-gateway token bucket (`global_limit / num_gateways`) so normal traffic continues (Fail-Open with local bounding) without turning a cache outage into a total site outage"
    ],
    "correctOption": 2,
    "reasons": [
      "Turning a minor Redis glitch into a 100% site-wide outage improves availability",
      "30-second timeouts protect gateway worker pools",
      "Rate limiting is a protective control, not a business invariant; falling back to local in-memory per-pod rate limits preserves both service availability and overload protection while Redis recovers"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "If Redis goes down for 30 seconds, should your entire API go down, or can each gateway pod divide the limit locally?",
    "explanation": "Failing closed on a Redis rate-limiter outage turns Redis into a single point of failure for the entire platform. Falling back to local in-memory token buckets (`limit / N_pods`) keeps the platform up while still capping total ingress.",
    "tags": [
      "rate-limiter-placement-and-keys",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["sliding-window-rate-limiter"] = [
  {
    "id": "sliding-window-rate-limiter-c1",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Weighted estimate",
    "section": "Sliding Window Counter Mathematics & Implementation",
    "prompt": "The limit is 100 requests per 60 s. The previous window saw 60 requests. You are 45 s into the current window, which has 80 requests so far. What does the sliding window counter estimate, and is the next request allowed?",
    "options": [
      "140, so the request is rejected",
      "125, so the request is rejected",
      "80, so the request is allowed",
      "95, so the request is allowed"
    ],
    "answer": 3,
    "explanation": "The offset ratio is 45/60 = 0.75, so the previous window contributes 60 x 0.25 = 15, and 15 + 80 = 95, under 100. Using 0.75 as the weight instead of 1 minus 0.75 gives 125, the most common slip.",
    "tags": [
      "sliding-window-rate-limiter",
      "apply",
      "inline"
    ]
  },
  {
    "id": "sliding-window-rate-limiter-c2",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Exact versus approximate",
    "section": "Algorithm comparison",
    "prompt": "A login endpoint allows 5 attempts per 15 minutes and must never allow a sixth inside any 15-minute span. Which algorithm fits best, and what does it cost?",
    "options": [
      "Fixed window counter, one integer per key",
      "Sliding window log, one timestamp per request",
      "Sliding window counter, two integers per key",
      "Token bucket, a token count plus refill time"
    ],
    "answer": 1,
    "explanation": "The sliding window log stores each request's timestamp and gives exact counts, and with a limit of 5 the memory cost is trivial. The sliding window counter is cheaper but approximate, since it assumes the previous window's requests were evenly spread.",
    "tags": [
      "sliding-window-rate-limiter",
      "recall",
      "inline"
    ]
  },
  {
    "id": "sliding-window-rate-limiter-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "Lua on Redis Cluster",
    "section": "Atomic implementation sketch (Redis)",
    "prompt": "The limiter's Lua script reads rl:user42:1700 and rl:user42:1699. After moving to Redis Cluster, it fails with a CROSSSLOT error. What is the right fix?",
    "options": [
      "Replace the script with a GET followed by an INCR from the application",
      "Wrap both keys in a MULTI and EXEC transaction instead of using Lua",
      "Use hash tags such as rl:{user42}:1700 so both keys land in one slot",
      "Store both windows in a single key by adding the counts together"
    ],
    "answer": 2,
    "explanation": "A multi-key script in Redis Cluster needs all keys in the same hash slot, and a hash tag makes only the part in braces determine the slot. Splitting into GET then INCR reintroduces the race the script exists to prevent, and MULTI has the same cross-slot restriction.",
    "tags": [
      "sliding-window-rate-limiter",
      "staff",
      "inline"
    ]
  },
  {
    "id": "sliding-window-rate-limiter-n1",
    "topic": "sliding-window-rate-limiter",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Sliding-Window Counter Weighted Approximation",
    "scenario": "A rate limiter uses the 2-bucket Sliding-Window Counter approximation with a 60-second window size and a limit of 100 requests. For a given API key, the previous minute (`00:00–01:00`) recorded `80` requests, and the current minute (`01:00–02:00`) has recorded `30` requests so far at timestamp `01:15` (25% into the current minute, so 75% overlap with the previous minute).",
    "prompt": "What is the estimated sliding-window request count at `01:15` (`80 × 0.75 + 30`)?",
    "question": "What is the estimated sliding-window request count at `01:15` (`80 × 0.75 + 30`)?",
    "unit": "requests",
    "answer": 90,
    "tolerance": 0.25,
    "hint": "Weighted count = prev_count × (1 - elapsed_fraction) + curr_count = 80 × 0.75 + 30.",
    "explanation": "At `01:15`, the 60-second sliding window covers the last 45 seconds (75%) of the previous minute plus the first 15 seconds of the current minute: `80 × 0.75 + 30 = 60 + 30 = 90` requests (which is <= 100, so the request is allowed using only 2 integer counters!).",
    "tags": [
      "sliding-window-rate-limiter",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "sliding-window-rate-limiter-t1",
    "topic": "sliding-window-rate-limiter",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Redis ZSET Sliding Log vs 2-Counter Sliding Window Approximation",
    "scenario": "Cloudflare-scale edge rate limiting must enforce a 10,000 req/min limit across 50 million active IPs. Storing an exact Redis Sorted Set (`ZSET`) of request timestamps per IP requires ~64 bytes per request (`10,000 × 64 B = 640 KB` per heavy IP).",
    "prompt": "Which algorithm should you deploy for high-volume rate limiting, and what is the primary engineering justification?",
    "question": "Which algorithm should you deploy for high-volume rate limiting, and what is the primary engineering justification?",
    "options": [
      "Store every request timestamp in a Redis `ZSET` and run `ZREMRANGEBYSCORE` + `ZADD` + `ZCARD` on every packet",
      "Use a Fixed-Window Counter so callers can burst 2x the limit (`20,000` requests in 2 seconds) across every minute boundary",
      "Use the 2-bucket Sliding-Window Counter approximation (`prev_count × overlap + curr_count`), which smooths boundary bursts using O(1) memory (just 2 integers per key) and a single atomic increment"
    ],
    "correctOption": 2,
    "reasons": [
      "A `ZSET` with 10,000 timestamps per IP uses less RAM than two 64-bit integers",
      "Allowing 2x boundary bursts at `00:59.9` and `01:00.1` protects fragile downstream origins from spike overload",
      "The 2-counter sliding window eliminates the 2x fixed-window boundary burst while reducing memory footprint from O(N_requests) to O(1) (16 bytes per active key)"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Compare memory per IP for a `ZSET` of 10,000 timestamps (~640 KB) vs two 64-bit counters (16 bytes).",
    "explanation": "A `ZSET` sliding log consumes `O(limit)` memory and `O(log N)` CPU per request, exploding on high-rate limits. The 2-bucket Sliding-Window Counter requires only 2 integers per key (`O(1)` space and time) while preventing fixed-window boundary double-bursts.",
    "tags": [
      "sliding-window-rate-limiter",
      "tradeoff",
      "staff"
    ]
  }
];

window.QUESTION_BANK["multi-tenant-design"] = [
  {
    "id": "multi-tenant-design-c1",
    "type": "mcq",
    "difficulty": "recall",
    "title": "Catalogue bloat model",
    "section": "Isolation models compared",
    "prompt": "Which tenancy model runs into repeating every schema migration per tenant and PostgreSQL catalogue bloat as you approach 10,000 tenants?",
    "options": [
      "Bridge, a schema per tenant",
      "Pool, shared tables with tenant_id",
      "Silo, a database per tenant",
      "Cell-based, pools inside cells"
    ],
    "answer": 0,
    "explanation": "Schema-per-tenant means 10,000 copies of every table and index in one engine's catalogue, and each migration runs 10,000 times. Silo has an even larger operational burden, but spread across separate databases rather than bloating one catalogue.",
    "tags": [
      "multi-tenant-design",
      "recall",
      "inline"
    ]
  },
  {
    "id": "multi-tenant-design-c2",
    "type": "mcq",
    "difficulty": "apply",
    "title": "Promoting a whale tenant",
    "section": "Worked example: tiered tenancy for a B2B analytics product",
    "prompt": "A pooled tenant has grown from 2 GB to 1.3 TB, and its queries now slow down its shard. Following the lesson's tiering rules, what should happen?",
    "options": [
      "Raise its statement timeout so heavy queries can finish on the shared shard",
      "Split its rows across all 8 pooled shards to spread out the load evenly",
      "Keep it pooled but lower its limit from 50 to 10 queries per second",
      "Move it to a silo database via copy, dual-write and cut-over on tenant_id"
    ],
    "answer": 3,
    "explanation": "Tenants above 1 TB get their own silo, moved with the same expand, copy, dual-write, cut-over process as any migration, keyed on tenant_id. Tighter limits reduce the harm but throttle a paying customer while the root cause, a whale in the pool, remains.",
    "tags": [
      "multi-tenant-design",
      "apply",
      "inline"
    ]
  },
  {
    "id": "multi-tenant-design-c3",
    "type": "mcq",
    "difficulty": "staff",
    "title": "RLS setting leak",
    "section": "Enforcing isolation in the pool",
    "prompt": "RLS filters on current_setting('app.tenant_id'). The app runs SET app.tenant_id once when it checks out a connection from PgBouncer in transaction mode. Occasionally tenant B sees tenant A's rows. What is the cause?",
    "options": [
      "The session-level SET persists on a pooled connection; use SET LOCAL in each transaction",
      "RLS policies are evaluated only once per session, not per statement",
      "The app runs as the table owner, so RLS is bypassed for all queries",
      "PgBouncer strips custom settings, so the policy falls back to showing all rows"
    ],
    "answer": 0,
    "explanation": "In transaction pooling, consecutive transactions on one server connection can belong to different clients, so a session SET leaks to whoever gets the connection next. SET LOCAL scopes it to the transaction. Owner bypass is a real pitfall, but it would leak on every query, not occasionally.",
    "tags": [
      "multi-tenant-design",
      "staff",
      "inline"
    ]
  },
  {
    "id": "multi-tenant-design-n1",
    "topic": "multi-tenant-design",
    "type": "numeric",
    "difficulty": "apply",
    "title": "Napkin Math: Shuffle Sharding Blast Radius Reduction",
    "scenario": "You operate an 8-worker-node stateless cluster and assign each customer a virtual shard of 2 nodes using Shuffle Sharding. The total number of unique 2-node combinations from 8 nodes is `C(8, 2) = (8 × 7) / 2`.",
    "prompt": "How many distinct 2-node virtual shards (`C(8, 2)`) exist in an 8-node cluster (such that a noisy neighbor Poison Pill affecting both of its assigned nodes only impacts the `1 / C(8, 2)` fraction of tenants sharing that exact pair)?",
    "question": "How many distinct 2-node virtual shards (`C(8, 2)`) exist in an 8-node cluster (such that a noisy neighbor Poison Pill affecting both of its assigned nodes only impacts the `1 / C(8, 2)` fraction of tenants sharing that exact pair)?",
    "unit": "virtual shards",
    "answer": 28,
    "tolerance": 0.25,
    "hint": "Compute C(8, 2) = (8 × 7) ÷ 2.",
    "explanation": "`C(8, 2) = 56 / 2 = 28` unique 2-node combinations. If one tenant sends a poison-pill request that crashes both of its assigned nodes, any other tenant with a different 2-node pair still has at least 1 healthy node—cutting the multi-tenant outage blast radius from 25% (simple 4-shard partitioning) down to `1/28 ≈ 3.57%`!",
    "tags": [
      "multi-tenant-design",
      "numeric",
      "capacity-planning"
    ]
  },
  {
    "id": "multi-tenant-design-t1",
    "topic": "multi-tenant-design",
    "type": "tradeoff",
    "difficulty": "staff",
    "title": "Trade-Off Matrix: Pool vs Bridge (Schema-per-Tenant) vs Silo Multi-Tenant Database Isolation",
    "scenario": "Your B2B SaaS platform serves 50,000 free/SMB tenants (each storing <10 MB) and 25 regulated Enterprise healthcare tenants (each storing 500 GB, requiring customer-managed KMS encryption keys, custom maintenance windows, and contractual noisy-neighbor isolation).",
    "prompt": "Which multi-tenant storage architecture best serves this hybrid customer base, and why?",
    "question": "Which multi-tenant storage architecture best serves this hybrid customer base, and why?",
    "options": [
      "Provision 50,025 dedicated RDS instances (one physical database cluster per free and enterprise tenant)",
      "Put all 50,025 tenants into a single unsharded shared table with no tenant-level quotas or row-level security",
      "Use a tiered Cell/Silo + Pool model: pack the 50,000 SMB tenants into shared multi-tenant Pooled shards (enforcing `tenant_id` RLS + per-tenant rate quotas), and provision dedicated Silo instances/cells for the 25 high-value Enterprise tenants"
    ],
    "correctOption": 2,
    "reasons": [
      "Running 50,000 idle RDS instances for free-tier users minimizes cloud infrastructure cost",
      "A single unsharded table supports per-tenant KMS keys and isolates 500 GB enterprise batch jobs from SMB queries",
      "Tiered Pool + Silo isolation matches unit economics: pooled shards amortize fixed baseline costs across 50k small tenants, while enterprise silos satisfy strict KMS, noisy-neighbor, and blast-radius SLAs"
    ],
    "correctReason": 2,
    "answer": {
      "option": 2,
      "reason": 2
    },
    "hint": "Match infrastructure isolation cost to tenant revenue and compliance requirements.",
    "explanation": "Dedicated silos for 50,000 free-tier tenants would bankrupt the business in idle compute, while forcing regulated 500 GB enterprise tenants into a shared pool violates KMS/noisy-neighbor requirements. A hybrid Pool (with tenant routing + RLS + quotas) + Enterprise Silo architecture optimizes both margin and compliance.",
    "tags": [
      "multi-tenant-design",
      "tradeoff",
      "staff"
    ]
  }
];
