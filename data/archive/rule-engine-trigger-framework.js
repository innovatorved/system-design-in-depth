window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["rule-engine-trigger-framework"] = `# Rule engine and trigger framework

An order arrives, and the product wants some orders reviewed before fulfillment. The condition can change while old events remain available for replay. A rule engine must preserve why an action was selected, or the same recorded order can quietly acquire a different history each time a worker sees it.

The same pattern can issue a rider incentive after delivery, a coupon after cart abandonment or a workflow after document approval. We'll define the event-to-action path, resolve overlapping rules, then replay an order under a changed policy.

## A decision before an effect

[[wiki/dag-workflow-orchestration|The workflow lesson]] started with an agreed set of steps. Here the first decision is whether that workflow should exist at all. An incoming event supplies facts; a versioned rule tests those facts and chooses an action obligation, such as creating a review task.

Keep evaluating the rule separate from carrying out the action. Evaluation should produce the same decision from the same recorded input and rule version. That is a pure evaluation: it does not charge a card, send a message or ask a changing external database what the order looks like now. Effect workers use the identity and recovery agreements already established in Module 08.

If the rule needs additional facts, record those facts as inputs with their source versions or timestamps before evaluating. Otherwise a historical order can match differently because its customer's profile changed, even though the rule stayed fixed. Sometimes “use the current profile” is the intended product policy, but that evaluation must record which profile it actually used.

Normalize the incoming event into a validated, typed input before matching. The rule store supplies an immutable policy version; matching produces a decision and an action obligation. In this proposed architecture, a dispatcher carries out the obligation later and records the outcome.

\`\`\`mermaid
flowchart TD
    accTitle: Match first, dispatch from a retained decision
    accDescr: An event is validated and normalized before matching against a versioned rule store. The matcher commits a decision and action obligation together. A dispatcher executes the allowed action and records its outcome.
    E["Event"] --> N["Validate + normalize"]
    N --> M["Rule matcher"]
    R["Versioned rule store"] --> M
    M -->|One transaction| D["Decision + action obligation"]
    D --> W["Dispatcher"]
    W --> A["Allowed action"]
    A --> L["Execution outcome"]
\`\`\`

The decision explains why work was requested; the execution outcome explains what happened. Preserve both. An audit log written after an external effect cannot repair a lost decision by itself.

## The matching policy

Our chosen event is \`order-A\`, with type \`order.submitted\`, schema version one and a quantity of 150 units. The units describe a synthetic order size, not a measured production threshold. Rule \`review-large\` matches at or above 100 units in rule set version one; \`review-all\` matches at or above zero.

Both rules can therefore match the same event. We choose a policy where the lower priority number wins, with rule identifier as a deterministic tie-breaker. They select the same action category, review, so matching both must still create only one review obligation. Another product could permit several independent actions, but it would need an identity for each action and a defined conflict policy.

Read the table as the chosen rule data. The two version columns make the change visible without changing the recorded order.

| Rule | Priority | Version one minimum | Version two minimum |
|---|---|---|---|
| \`review-large\` | 10 | 100 units | 200 units |
| \`review-all\` | 20 | 0 units | 0 units |

*Changing the threshold changes the selected rule; the retained order stays the same.*

Rule-set version and event-schema version answer different questions. The schema version says how to interpret the event fields, as [[wiki/event-contracts|the event contract lesson]] established. The rule-set version says which policy evaluates those fields. Store both with the evaluation, together with the matched rules and selected action, so an explanation does not depend on today's configuration.

## A versioned replay

The [workflow replay](/course-assets/system-design/m15-workflows.py) stores evaluations and action obligations in a private temporary database; it creates no real review tasks or customer messages.

The evaluation key is event identity plus rule-set version, and the saved canonical input must agree on repeat delivery. \`dispatch\` records the first action obligation. \`audit\` records a new evaluation for comparison without issuing another action. A change of rule set on an ordinary repeat delivery is refused until someone explicitly requests that audit replay.

\`\`\`bash title="terminal"
python3 m15-workflows.py rules
\`\`\`
\`\`\`output
v1: matches=review-large,review-all winner=review-large mode=dispatch
same input: duplicate
changed input: payload-conflict
v2 ordinary delivery: requires-explicit-replay
v2 explicit replay: matches=review-all winner=review-all mode=audit
action feedback: ignored-type-or-schema
evaluations=2 action obligations=1
\`\`\`

The two evaluations explain different policy decisions about the same order. They leave one business action because the original action identity, \`order-A/review\`, survives the rule edit. The changed-input probe submits 151 units under the original event identity and receives a conflict. That prevents an event producer from rewriting the explanation of an already accepted decision.

## The rule representation

Ordinary code is the simplest representation when developers own a small policy and deploy it with the application. Reviewers can use the existing code tools, and conditions can use the language's type checks. Its cost appears when a product operator needs to adjust a threshold independently or compare many historical policy versions.

A restricted data representation makes those versions explicit. For example, this proposed JSON format describes the first review rule:

\`\`\`json
{
  "rule_id": "review-large",
  "event_type": "order.submitted",
  "version": 1,
  "priority": 10,
  "condition": {
    "field": "units",
    "operator": "gte",
    "value": 100
  },
  "action": { "type": "create_review" }
}
\`\`\`

This is our schema, not JsonLogic or a format parsed by the replay. A larger schema could compose allowed predicates with \`and\` and \`or\`. Define missing-field and type behavior explicitly: a numeric quantity and a string containing digits should not acquire accidental equivalence through an interpreter's coercion rules.

Start with allowed fields, typed operators and named actions, and reject unknown combinations before publication. The fixture is narrower still: trusted tuples supply integer thresholds and fixed action names. It never evaluates arbitrary expression text, and it exposes no user scripting interface.

User-authored scripts can express more complex conditions but add execution limits, isolation and authorization requirements. Choose that capability only when a restricted language demonstrably cannot express the needed decisions. Moving an \`if\` statement into a string creates those obligations without making the policy more understandable.

Index candidate rules by event type, tenant, region, product or active time window when those fields exclude unrelated policies. Keep priority as a conflict-resolution rule, not permission to discard a lower-priority match needed for audit. The selector must preserve the result of evaluating the applicable rule set. Measure candidate counts and compare outcomes before introducing a cache of active rules. A worker that uses a stale rule version must reveal that version in its receipt.

## Publication and feedback

Treat a new rule set as immutable data that can be reviewed and exercised on saved examples before activation. Pin the selected version when accepting evaluation work so a later deployment does not change a queued event's policy silently. Compare its matches in audit mode first, then publish a version that future events can select. Returning to an older version changes future decisions; it does not revoke actions already accepted under the intervening version.

The [[wiki/event-bus-for-product-events|transactional outbox]] supplies the next boundary. Commit the evaluation and its action obligation together, then let a worker deliver it. The local replay retains that obligation but does not run a dispatcher. Calling the action while evaluating and recording the decision afterward leaves a crash window where the effect exists without its explanation.

An action may emit another event, creating a possible feedback loop. The fixture accepts only the originating \`order.submitted\` type and ignores a \`review.created\` event. Broader systems should define which event types can trigger which action types, retain causal identifiers, and bound repeated transitions. Deduplicating the same event does not stop a loop that generates a fresh event identity every time.

For this review policy, use immutable versions, one winning review action and audit-only historical re-evaluation. Change to action-producing replay only when the product explicitly owes new work and supplies new identities for it. The next lesson, [[wiki/fanout-patterns|fanout patterns]], follows actions owed to several recipients. Later, [[wiki/flash-sale-inventory-locking|inventory reservations]] put a harder limit on an action: matching a rule can request a unit, but only the stock owner can grant it. The booking and payment designs will carry that distinction across separate services.
`;
