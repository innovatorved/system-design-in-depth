window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["requirements-clarification"] = `# Requirements clarification

Requirements clarification turns a broad request into a design problem you can reason about. Before choosing a database or drawing services, establish who uses the system, what they need to accomplish, and which promises must survive load and failures.

We will turn “design a URL shortener” into a small brief. The same questions apply to a feed, file store, or payment service; the answers will change.

## Start with the people and the operation

A link creator submits a destination and receives a short address. A reader opens that address and expects to reach the destination. An administrator may need to disable an abusive link. These are three roles with different permissions, even if one person sometimes fills all three.

Now follow the main operation. Can the creator choose the short name? Can its destination change? Must readers sign in? Each answer changes something the implementation must enforce.

For this course's shortener, assume approved callers can create links, names are generated, destinations stay fixed, and anyone can follow a link. Custom aliases and destination editing are outside the first version. Abuse handling still needs an owner; leaving out editing does not make unsafe destinations harmless.

Write these choices down as assumptions to confirm with the product owner. A plausible answer becomes a requirement only when the people responsible for the product agree to it.

## Ask what must remain true

A generated name must not silently replace somebody else's mapping. A saved link must keep its destination through the promised retention period. These are **invariants**: conditions the implementation must preserve, including when requests overlap or are retried.

Also identify the authoritative data. The stored mapping decides where a link goes. A cached copy can speed up reading it, but does not become a separate authority that may choose a different destination.

Freshness needs its own question. If an administrator disables a link, how long may a cached copy still redirect readers? An acceptable delay of a minute permits different choices from a requirement to stop every new redirect immediately. Do not leave that promise hidden inside “we will cache it.”

## Separate work that must finish now from work that can wait

“Record clicks” is ambiguous. Our server can record a redirect request; it cannot infer a distinct person or prove that the destination page loaded.

The shortener exercise requires each accepted redirect request to have a stored event before the response. Reports may be calculated later. If storing the event fails, this version returns an error. That is a deliberate product tradeoff: event retention takes priority over redirect availability during that failure.

Another product could choose to redirect anyway and tolerate missing events. The important question is which promise the design is supposed to keep. Moving report calculation into the background does not answer whether losing its input is acceptable.

## Put numbers and boundaries in the brief

Keep these questions nearby when the conversation moves beyond the ordinary request:

| Area | Question to settle |
|---|---|
| Scale | How many reads and writes arrive, how bursty are they, and in which regions? |
| Retention | How long must records remain, and what growth should we plan for? |
| Reliability | Which operations may degrade, and how quickly must service and data recover? |
| Privacy | Who can read each record, and which sensitive fields are actually needed? |
| Scope | Which workflows are required now, and which are explicitly deferred? |

For the course exercise, use 100 million redirects and 1 million new links per day, with mappings retained for at least five years. These are planning assumptions, not measured traffic. [[wiki/back-of-the-envelope-capacity-planning|Capacity planning]] turns them into rates and storage estimates.

Before handing off the brief, check one failure: the analytics report is unavailable, but event storage works. Should redirects continue? Yes, under our chosen contract. Now make event storage unavailable. The answer changes. Being able to explain that difference means the requirements are specific enough to guide a design.

Targets such as “fast” and “highly available” still need a measurement and a time window. [[wiki/non-functional-requirements|Non-functional requirements]] makes those promises testable.
`;
