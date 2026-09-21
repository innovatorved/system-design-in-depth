window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["boolean-tiered-search"] = `# Boolean and tiered search

A reader searches for \`cache index\`, and none of our documents contains both words. Returning nothing is defensible if both words are requirements. Returning separate cache and index lessons is defensible if the reader is exploring a topic. The service needs to choose that behavior explicitly before a score decides which document looks best.

We'll keep required filters fixed, group strict and partial matches, and use term coverage or proximity when two groups are too coarse.

## Requirements and preferences

[[wiki/inverted-index-and-posting-lists|The posting-list lesson]] gave you posting lists and two ways to combine them. Requiring every query term uses their intersection, commonly expressed as AND. Accepting any query term uses their union, expressed as OR. These operators describe a matching condition; they do not measure how useful the resulting documents are.

An unknown token makes an AND intersection empty because its posting list is empty. An OR union can still contain documents matching the remaining tokens. That difference is often hidden behind a search box, but it changes what a successful response means. The user who typed a precise part number may be poorly served by a result that matches only its accompanying description.

A condition supplied as a structured filter deserves separate treatment. An allowed-document set represents which documents may be exposed in this exercise. It is chosen test input, not an authentication implementation. Every retrieval tier intersects its candidates with that same set, so relevance fallback cannot turn an excluded document into a permitted one.

### Which conditions may relax?

Treat permissions and explicitly required filters as hard constraints. Treat an exploratory free-text query as a possible source of soft preferences when the interface says broader matches may appear. For a caller using an explicit “all words” search, keep AND semantics unless they request a broader search. A quiet fallback would make the response disagree with the request.

The alternatives are to return only strict matches, present broad matches separately, or mix all matches under one score. The last option is convenient, but a high score could put a partial match above a complete match unless the ranker also enforces the requirement. Choose separate ordered groups here because the behavior stays inspectable before we introduce numerical ranking.

## Ordered fallback groups

A group that runs under a particular matching rule is a tier. Our chosen policy first collects all permitted AND matches as tier zero. It then collects permitted OR matches that have not already appeared as tier one. The displayed response always appends the second tier, even when the first is nonempty; this differs from a policy that broadens only after an empty strict result.

Within each tier, identifiers sort ascending. A document appears once, under the earliest rule it satisfies. Later scoring may change order within a tier, but it may not move a tier-one document ahead of a tier-zero document under this contract. If the product wants that movement, it has chosen a different contract and should evaluate it as such.

Choose the default from what the caller asked for:

| Caller situation | Default | Reason |
|---|---|---|
| Every submitted word is required | AND only | Preserve the requested condition |
| Exploring with useful partial matches | AND tier, then labeled OR tier | Keep complete matches first |
| Any term is independently sufficient | OR with ranking | No complete-match priority promised |


## One policy against several queries

The allowed set contains \`d1\`, \`d2\`, \`d4\`, \`d5\` and \`d8\`. Documents \`d3\`, \`d6\` and \`d7\` remain in the corpus but are excluded from this response. The exclusion is deliberately visible so you can follow a broadening attempt without confusing candidate generation with access permission.

The [shared Python replay](/course-assets/system-design/m16-search.py) executes the rules directly against the [eight chosen documents](/course-assets/system-design/m16-corpus.json). In the capture, each tuple pairs a document identifier with its tier number. Empty input has an explicit empty-result rule, so it does not turn into a request for every permitted document.

\`\`\`bash title="terminal"
python3 public/course-assets/system-design/m16-search.py boolean
\`\`\`

\`\`\`output
'cache stores': AND=['d1'] OR=['d1', 'd2', 'd4'] tiers=[('d1', 0), ('d2', 1), ('d4', 1)]
'cache index': AND=[] OR=['d1', 'd4', 'd5', 'd8'] tiers=[('d1', 1), ('d4', 1), ('d5', 1), ('d8', 1)]
'queue cache': AND=[] OR=['d1', 'd4'] tiers=[('d1', 1), ('d4', 1)]
'': AND=[] OR=[] tiers=[]
all tiers retain allowed ids: ['d1', 'd2', 'd4', 'd5', 'd8']
\`\`\`

For \`cache stores\`, \`d1\` belongs to both raw sets but appears only in tier zero. The second group contains \`d2\` and \`d4\`; retaining \`d1\` again would make a later limit or evaluation count the same document twice. Deduplication belongs before the response is bounded or measured.

For \`cache index\`, the strict group is empty, so every result is a broader match. The response still carries tier one on each identifier. A UI can label that group “Matches some words” instead of presenting it as if every word had matched. The backend has already retained enough information for that explanation.

For \`queue cache\`, broader search still cannot expose the queue documents. Both are outside the allowed set. An empty strict result does not distinguish an absent document from an excluded one, and the public response should not reveal hidden document text to explain the difference. A diagnostic view needs its own access boundary.

## Work limits and missing answers

Taking the first few candidates before deduplication can fill the response with repeats. Taking a global score sort after grouping can erase tier priority. The two-tier replay retains the complete small result and therefore avoids both interactions. If you add a limit, apply it to the final deduplicated ordered sequence and document whether a nonempty strict tier may leave space for broader results.

Choose strict retrieval for explicit requirements, and ordered broader groups for this exploratory course search. Revisit that choice when [[wiki/search-evaluation-metrics|search evaluation]] supplies judgments showing which returned documents actually answer the intended question. A larger candidate set can recover a useful document and can also add irrelevant ones; result count alone cannot choose between those effects.

## More than two tiers

For a longer query, OR groups very different matches together. A four-term query can use four coverage levels: all four, any three, any two, then any one. Each document belongs to its highest satisfied level and appears once. Repeated query words do not create extra requirements in this chosen policy.

For \`database index maps rows\`, \`d5\` contains all four terms. No document contains exactly three. \`d2\` contains \`database\` and \`rows\`, while \`d8\` contains only \`index\`. The replay's additional coverage example returns the best two documents from those ordered groups:

\`\`\`bash title="terminal"
python3 public/course-assets/system-design/m16-search.py coverage
\`\`\`
\`\`\`output
query='database index maps rows' distinct terms=4
all coverage tiers: [('d5', 4), ('d2', 2), ('d8', 1)]
limit 2: [('d5', 4), ('d2', 2)]
\`\`\`

Here the number is matched-term count, not the earlier zero/one tier label. A real ranker can use BM25 within each coverage level while keeping the level as the primary ordering key. A boost alone does not guarantee that ordering.

A production query can require a minimum number of optional clauses. For example, Elasticsearch's \`minimum_should_match\` controls eligibility; it does not automatically implement this sequence of ranked groups. When combining text clauses with a required filter, set that minimum explicitly if text must match. A bool query with a filter otherwise defaults to zero required \`should\` clauses.

Choose whether to fetch every group or only broaden until the page is full. The replay counts all eligible candidates, sorts and then limits; it does not save retrieval work through early stopping. A staged implementation can reuse postings, exclude seen IDs and stop once enough results are retained. Keep query, filters and ordering stable across pagination so broadening does not introduce repeats or skip earlier groups.

## Presence, proximity and fields

Matching all the words does not mean matching their relationship. \`cache stores\` is adjacent in \`d1\`; \`cache copies\` occurs there with \`stores\` between them. Both pass AND. Only the first passes a zero-gap phrase condition. A positional check can require adjacency or allow a defined window, with ordered and unordered windows answering different questions.

Use phrase or proximity evidence within a tier when nearby words better express the intent. Requiring a phrase is stricter than giving it a ranking preference. Preserve that distinction when broadening: quoted words should not silently become unrelated words anywhere in a document.

Fields matter too. Requiring all terms in a title differs from allowing one in the title and another in the body. In Elasticsearch, \`multi_match\` with \`best_fields\` applies AND inside each field. A term-centric query such as \`combined_fields\` can match terms spread across compatible fields. Choose the intended rule before tuning title boosts.

An empty strict result can signal a typo, missing synonym, absent source item, unavailable inventory or indexing lag. Record enough internal diagnostics to distinguish them. Increasing breadth is useful only when the extra documents answer the need. The [[wiki/query-understanding-pipeline|query-understanding lesson]] changes which terms are searched; [[wiki/tf-idf-relevance-scoring|the next lesson]] orders equally eligible documents with a specified numerical baseline.
`;
