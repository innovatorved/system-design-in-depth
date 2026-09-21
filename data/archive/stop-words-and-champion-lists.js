window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["stop-words-and-champion-lists"] = `# Stop words and champion lists

A scoring function cannot rescue a document that was removed before scoring began. We can reduce search work by omitting common words or retaining only selected candidates for each term, but each shortcut discards information. The useful question is which queries lose an answer when that information disappears.

We'll compare removing words with capping candidates, then follow how each changes the results.

## Removing words from the representation

[[wiki/bm25-production-ranking|The BM25 lesson]] kept every analyzed token and let document frequency influence its weight. Another approach removes selected words entirely. A configured list of words to omit is a stop-word list. Commonness may motivate the choice, but the actual removal is a product and language policy rather than a consequence of the score formula.

Our experiment chooses exactly \`a\`, \`and\` and \`to\`. They are test inputs, not a recommended English stop list. The unchanged corpus retains them; the replay creates a separate pruned copy so later lessons continue to use the same source texts and statistics.

Deleting tokens can change more than whether a term is searchable. If the remaining tokens are packed together, their positions change. The original \`d5\` text includes \`keys to rows\`. A packed pruned representation contains \`keys rows\`, so a request for that exact adjacent phrase can match even though the original document did not contain it.

The posting-list lesson's phrase helper checks adjacent analyzed tokens. In this experiment the stop policy is applied to both document and query text. That lets \`keys to rows\` continue to match after both sides lose \`to\`, while the distinct literal request \`keys rows\` also becomes a match. Preserving the original position gaps would avoid that particular adjacency error, though queries requiring a removed word would still need a representation that retained it.

## Which common words are expendable?

Inspect both how widely a term occurs (\`df / N\`) and how often it repeats. Define the averaging population: total occurrences divided by all documents differs from the average among matching documents. These are diagnostics, not a universal rule for deleting terms.

In a database-only catalog, \`database\` may occur almost everywhere yet still matter in an exact title. A required word, negation or direction can be essential even when it has little ranking weight. Review representative title and phrase queries before choosing a stop list. Lower weighting retains evidence that deletion removes.

A configured language list is only a starting policy. Elasticsearch's stop filter allows explicit words, language lists and case handling. Its trailing-token option also matters for completion: removing the word currently being typed can change the offered suggestions. Our experiment does not emulate that analyzer; it deliberately repacks tokens to expose the phrase error.

## Keeping selected candidates

There is another way to reduce work without deleting a word: retain a small preselected list of documents for it. Such a retained subset is called a champion list. The subset is chosen before the full query is known. It can be built for any term, not only common words; list sizes can differ by term.

Our chosen cap is one document per term. Build each list by scoring that single term with our BM25 variant and retaining the highest result, using identifier order for ties. At query time, take the union of the retained lists, then apply the full requested matching condition to those candidates. This is a candidate restriction, not a complete implementation of arbitrary top-result search.

For \`database\`, the equal-length single-term tie retains \`d2\` ahead of \`d5\`. For \`index\`, the shorter document \`d8\` wins over \`d5\`. The combined query \`database index\` therefore begins with only \`d2\` and \`d8\` available, even though \`d5\` contains both terms. A document that is second for each individual term can be the best combined answer.

The two retained single-term winners contain different words. Requiring both after the cap cannot recover \`d5\`:

\`\`\`mermaid
flowchart TD
    accTitle: A per-term cap loses the combined match
    accDescr: Database retains d2 and index retains d8. Their union contains d2 and d8; requiring both terms returns no document. A separate full posting-list path retains d5, which contains both query terms.
    Q["database index"] --> C["One champion per term"]
    C --> U["Candidates: d2, d8"]
    U --> A["Require both terms"]
    A --> E["No result"]
    Q --> F["Complete posting lists"]
    F --> D["Require both: d5"]
\`\`\`

## The losses in one capture

The [Python replay](/course-assets/system-design/m16-search.py) performs both transformations from the [original corpus](/course-assets/system-design/m16-corpus.json). \`original\` and \`pruned\` label separately analyzed document sets. The champion portion prints complete either-term candidates, retained candidates and the result after requiring both query terms.

\`\`\`bash title="terminal"
python3 public/course-assets/system-design/m16-search.py pruning
\`\`\`

\`\`\`output
stop words: ['a', 'and', 'to']
token occurrences: 50 -> 43
phrase keys to rows: original= ['d5'] pruned= ['d5']
phrase keys rows: original= [] pruned= ['d5']
champions database/index: {'database': ['d2'], 'index': ['d8']}
full OR candidates: ['d2', 'd5', 'd8'] capped candidates: ['d2', 'd8']
full AND: ['d5'] capped then AND: [] missed: ['d5']
\`\`\`

Fifty token occurrences become forty-three under the selected stop policy. That is a count of retained occurrences, not measured index bytes or a latency improvement. The byte layout of a real posting list could include dictionaries, offsets, positions and compression, each with its own cost.

The champion restriction removes \`d5\`, so the required-term check returns nothing. Running the scorer over the retained documents cannot repair that result because the missing identifier never reaches it. Keeping a complete index behind the shortcut would allow a fallback, but that means the complete representation and its maintenance cost still exist.

## The policy boundary

For this corpus, retain every token and the complete posting lists. Their counts are small, and the counterexamples give a concrete cost for removing information. If a measured workload later makes common-term traversal expensive, first consider a query-specific policy that preserves required phrases and filters. That lets a broad browsing request accept a shortcut without silently changing exact phrase semantics.

Choose the shortcut from the kind of answer the caller expects:

| Query contract | Default | Reason |
|---|---|---|
| Required words or exact phrase | Complete retained representation | Omitted evidence can change eligibility |
| Broad exploration with complete fallback | Try bounded candidates, then complete search | Recover misses at additional work |
| Explicitly approximate suggestions | Evaluated candidate cap | The product accepts evaluated coverage loss |



Champion selection can also incorporate a quality or freshness score, but that still chooses candidates before the complete query. Keeping a full fallback costs storage and maintenance; omitting it accepts a loss that must be evaluated.

Choosing query-specific pruning adds branches that need tests. A rule that ignores \`to\` in a broad topic query must not also erase it from an exact title request. Keeping a separate phrase-capable representation is another option, with the cost of another field or index. Choose that complexity only when the query contract and measurements justify it.

## Evidence before an approximation

The missed \`d5\` is an exact matching failure, which requires no user judgment to detect. Whether dropping a broader result harms the reader is a different question. [[wiki/search-evaluation-metrics|Search evaluation]] will label documents against particular information needs and compare what the result list preserves.

Champion lists also need a publication boundary. Recomputing them after documents change can alter who survives the cap; an outdated champion entry may refer to a removed or now-inaccessible document. [[wiki/search-index-synchronization|Index synchronization]] owns that version and deletion work. A preselected list never replaces the access check before exposure.

The next lesson changes another part of the path: it interprets the caller's words before retrieval. [[wiki/query-understanding-pipeline|Query understanding]] makes those transformations visible so that a broader answer can be traced to a chosen rule rather than mistaken for a match to the original request.
`;
