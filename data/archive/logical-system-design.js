window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["logical-system-design"] = `# Logical system design

Logical system design decides where application rules live and how modules work together. It helps answer a practical question: when a product rule or external provider changes, which code should need to change with it?

We will separate the shortener's HTTP handling, link rules, and storage work, then check whether those boundaries make a change easier to test.

## Give each responsibility an owner

A route handler can parse a request, run SQL, check whether a link is disabled, record a click, and format the redirect. For a small operation, that can be readable. Trouble starts when an import job needs the same rules, or every handler begins interpreting database rows differently.

Separate the work when those responsibilities need to vary independently:

| Responsibility | What it owns |
|---|---|
| HTTP adapter | Parse the request and translate the result into an HTTP response |
| Link operation | Apply the product's rules for creating or opening a link |
| Storage adapter | Execute queries and map stored records into the application's result types |

A **boundary** is the agreement between these parts. It can be an ordinary function call inside one process. Drawing separate boxes does not require separate servers or deployments.

\`\`\`mermaid
flowchart TB
  accTitle: Two callers share the same link rules
  accDescr: HTTP handling and an import job call link operations, which use a storage adapter. These are application responsibilities, not separate machines.
  HTTP[HTTP handling] --> Rules[Link operations]
  Import[Import job] --> Rules
  Rules --> Storage[Storage adapter]
  Storage --> DB[(Database)]
\`\`\`

The HTTP path creates one link; the import job may create many. Both must enforce the same rule that a generated code cannot replace an existing mapping. The database's uniqueness constraint enforces the collision rule atomically; the application decides whether to retry with another candidate or return an error.

## Make the agreement useful to its caller

Consider \`resolve(code)\`. “Returns a URL” leaves several cases unstated. The link might be absent, disabled, or temporarily impossible to look up.

| Result | Meaning | HTTP caller's action |
|---|---|---|
| Found | The operation permits this link and supplies its destination | Continue the redirect path |
| Missing | The lookup succeeded, but no mapping exists | Return not found |
| Disabled | The mapping exists but cannot be used | Refuse the redirect |
| Unavailable | The operation could not establish an answer | Return a service error |

Keep unavailable distinct from missing. Translating a connection failure into “no such link” gives the caller a false answer. Likewise, the storage adapter should not leak a vendor-specific exception into every route and job that uses it.

For the shortener's agreed contract, a successful redirect also waits for its request event to be stored. That sequencing belongs to the link operation. HTTP formatting does not decide whether losing a click is acceptable.

## Test the rule through the boundary

To test “disabled links never redirect,” supply a small in-memory storage implementation that returns a disabled record. Exercise the link operation directly. The test should not need a browser, a live database, or knowledge of SQL syntax to check that product rule.

That test does not establish that the real database query works. Test the storage adapter against the database separately, including missing rows, uniqueness conflicts, and failures. Keeping these tests distinct helps identify whether a failure comes from a rule or its persistence implementation.

The same approach applies to a payment or notification provider: expose the operation the application needs, then translate it to the provider's API in one place. A replacement provider may have different guarantees, so an interface reduces the places to inspect; it does not make providers automatically interchangeable.

## Stop before the boundary becomes ceremony

A function that forwards unchanged arguments through three layers is not necessarily protecting anything. Introduce a boundary around a repeated rule, a dependency that changes, or a decision worth testing independently.

Review a likely change: add an import job, replace a notification provider, or introduce link expiry. If each requires edits across unrelated route handlers, the rule probably has no clear owner. If one focused operation owns the change and its tests, the logical design is doing useful work.

The [[wiki/repository-pattern|repository pattern]] develops the storage boundary further. [[wiki/monolith-vs-microservices|Monoliths and microservices]] asks a separate question: which of these responsibilities need independent deployment?
`;
