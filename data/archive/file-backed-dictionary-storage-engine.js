window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["file-backed-dictionary-storage-engine"] = `# A file-backed dictionary

Suppose we need an API that returns a word's meaning. Definitions change in a weekly batch, reads dominate, and the exercise excludes a database. The data file may be large, but the words and their locations can fit in memory.

We'll build the read path around that difference, then work through publishing an update. Several API servers should be able to read the same completed dictionary without each holding every definition in RAM.

## What belongs on each server?

The workload leaves us several choices:

| Arrangement | Cost or limitation for this dictionary |
| --- | --- |
| Load the complete dictionary | Simple lookups, but every server needs RAM for all values |
| One file or object per word | Independent updates, but many artifacts to publish and manage |
| Scan one large file per lookup | Simple format, but search work grows with the file |
| Mutable B-tree | Supports ordered updates; more machinery than a weekly rebuild needs |
| Memory index and immutable data file | Small lookup structure, with an extra read for the value |

Choose the last option while the full index fits memory and batch rebuilds are affordable. Keep the data file locally if replicated disk space and distribution are acceptable; object storage can instead hold a shared copy and serve selected byte ranges.

## A word points to bytes

Build the file and index together. As the builder writes each UTF-8 meaning, it records the starting byte offset and encoded length. This tiny uncompressed example packs two meanings without separators:

\`\`\`text
index for dictionary-v1:
  apple  -> offset 0, length 5
  banana -> offset 5, length 12

data bytes: fruityellow fruit
\`\`\`

The lengths separate \`fruit\` from \`yellow fruit\`. A server loads this version's index at startup. For banana it finds \`(5, 12)\`, then reads those bytes from dictionary-v1. If the key is absent from the complete index, it returns absence without reading the data file.

\`\`\`mermaid
sequenceDiagram
  accTitle: A lookup in dictionary v1
  accDescr: The API uses its loaded v1 index to locate banana, then reads the matching byte range from the immutable v1 object and returns the meaning.
  participant User
  participant API
  participant Index as Loaded v1 index
  participant Data as Dictionary v1 object
  User->>API: Meaning of banana
  API->>Index: Find banana
  Index-->>API: Offset 5, length 12
  API->>Data: Range bytes 5-16
  Data-->>API: yellow fruit, 12 bytes
  API-->>User: yellow fruit
\`\`\`

That successful uncached lookup uses one memory lookup and one value request, after loading the index. It is not a promise of one physical disk read or fixed latency. Validate the returned version, range and length; [[wiki/byte-range-indexed-object-storage|the byte-range lesson]] handles the HTTP details.

Budget the index from key bytes, offsets, lengths and the map's own overhead. At an assumed 40 bytes per complete in-memory entry, 500,000 words would need 20 MB. Measure the actual representation: object headers and spare hash-table capacity can make a compact serialized index much larger after loading. Replicating that index across API servers is the cost of keeping lookup local.

## Rebuild from the weekly changes

Sort the old dictionary and the week's changes by the same key ordering. Resolve multiple changes to one word before the merge, using an explicit update order. Then walk both sorted inputs:

- An old-only word keeps its definition.
- A changed word uses the new definition, or is omitted if the change deletes it.
- A new-only word is inserted.

Write dictionary-v2 and its index during this pass. New offsets come from the bytes actually emitted; changing apple's length moves later definitions. A streaming merge avoids loading all values together, though producing sorted inputs may itself require external sorting.

Validate the completed pair, then publish a version selector naming both. Readers load the new index and switch the file identity with it. Retain v1 while any reader still uses its index. Replacing v1's bytes beneath those offsets could return another word's text without causing a parse error.

## Practice publishing a complete candidate

Before implementing the remote design, the [storage-engine download](/course-assets/system-design/m12-storage-engine.py) exercises a smaller local snapshot. It stores the whole two-word map as JSON, so this version loads values into memory and has no offset index.

Its helper writes a candidate in the same directory, flushes Python's buffer, calls \`os.fsync\`, replaces the published filename with \`os.replace\`, then synchronizes the directory. A successful same-filesystem rename provides an atomic name change; durable publication also depends on the synchronization succeeding and the filesystem's guarantees. Errors propagate.

Snapshot mode writes an intentionally truncated candidate before publishing a complete replacement:

\`\`\`bash title="terminal"
python3 m12-storage-engine.py snapshot
\`\`\`

\`\`\`output
snapshot bytes: 41
reopened: {"apple":"fruit","banana":"yellow fruit"}
truncated candidate rejected; published apple: fruit
replacement bytes: 45 ; reopened apple: red fruit
\`\`\`

The old published dictionary survives rejection of the incomplete candidate. The complete replacement adds four encoded bytes. These sizes count compact JSON punctuation too; they are unrelated to the 17-byte raw value pack above.

The helper writes generated JSON. An importer also needs to validate the expected string-map shape and input limits before publication. A valid JSON array is not a dictionary. A malformed published file is a storage error, not an empty dictionary or a missing word.

A reader already holding the old map can keep answering from it while a new reader loads the replacement. Our weekly publication allows that overlap; instant visibility on every server would need a stronger refresh contract. This local truncation-and-reopen experiment does not test object storage or power loss.

The [[wiki/custom-binary-file-format|next lesson]] puts explicit boundaries into the stored bytes. [[wiki/immutable-versioned-data-files|Versioned files]] then keep those bytes and their readers together during replacement and cleanup.
`;
