window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["blocklist-versioned-file-metadata"] = `# Blocklists and file revisions

A blocklist records which pieces make up a file and in what order. An immutable revision preserves that recipe, while a mutable path pointer selects the version users currently see. Publishing the recipe must wait until its referenced bytes are ready to read.

We'll connect the blocklist to a namespace journal, follow the publication transaction, and test missing bytes, corruption and retries in the local sync service.

## One file, several kinds of identity

A path names a location within a namespace. A revision identifies an accepted publication. A digest identifies bytes. Two revisions can contain identical bytes, and two positions in one file can reference the same blob.

Our sixteen-byte file still contains \`AAAA\`, \`BBBB\`, \`CCCC\`, \`AAAA\`. Its four ordered references need three stored blobs. Turning the blocklist into a set loses the final \`AAAA\`; sorting the references can produce a different file.

| Record | Key | Relevant content |
| --- | --- | --- |
| Journal entry | Namespace and revision | Path, ordered blocks, size, digest, deletion state |
| Current path | Namespace and path | Selected revision |
| Operation receipt | Device and operation | Exact proposal and accepted result |
| Blob | Content digest within allowed storage | Verified immutable bytes |

A fuller file model may also retain timestamps, permissions and application metadata. Keep server acceptance order separate from client modification time. Dropbox's 2016 Magic Pocket account describes the same broad separation of mutable file history from immutable stored blocks; our SQLite schema is a teaching implementation, not its production database.

## The cursor spans the namespace

A journal cursor answers “which accepted changes have I learned about?” across the file tree. A file's base revision answers “which version of this path did I edit?” Those numbers can differ.

For example, suppose \`notes.txt\` is revision 14 and another file changes at revision 15. A device can read through cursor 15 while still proposing a new \`notes.txt\` version against base 14. Rejecting it merely because 14 is not the namespace head would create a conflict with an unrelated edit.

The proposed query has this shape:

\`\`\`sql title="changes.sql"
SELECT revision, path, blocks, digest, size, deleted
FROM file_journal
WHERE namespace_id = :namespace
  AND revision > :after
ORDER BY revision
LIMIT :page_size;
\`\`\`

The server derives the permitted namespace from authenticated access. A page returns a continuation position for the rows it actually supplies; a client must not skip straight to a later head while earlier pages remain unread. Receiving metadata also does not mean its files have been applied locally.

Our fixture holds only Ada's namespace, so its tables omit a namespace column. It caps history and returns all later rows without pagination. Publication allocates revisions inside the transaction. Its restricted append/rollback path maintains contiguous history; SQLite \`AUTOINCREMENT\` alone does not promise gap-free IDs.

## Prepare bytes before selecting the revision

The [[wiki/metadata-db-for-object-storage|object-metadata lesson]] separated stored bytes from published state. Apply the same ordering here:

\`\`\`mermaid
flowchart TD
  accTitle: Publishing a reconstructable revision
  accDescr: For a new proposal, the local authority checks permission and base, verifies and synchronizes referenced blobs, then commits the journal entry, path pointer and receipt together before replying. Missing or corrupt bytes stop publication.
  A[Check permission and base] --> B[Verify referenced blobs]
  B --> C[Synchronize blob files]
  C --> D[Commit metadata and receipt]
  D --> E[Reply with revision]
\`\`\`

A new blob is written to a temporary file, flushed and synchronized, then renamed to its final address and followed by directory synchronization. The lab repeats synchronization for an identical existing blob: a previous attempt may have left complete bytes but failed before reporting preparation success.

Publication verifies each referenced length and digest and the assembled whole-file identity. One SQLite transaction then appends the revision, moves the path pointer and records the operation's result. A failure rolls back these metadata changes together.

The file writes occur outside SQLite's storage format; this is not one atomic transaction spanning arbitrary files and a database. The ordering allows unreferenced prepared blobs after a failed publication, which cleanup can handle. It avoids intentionally committing a reference before preparation succeeds.

The fixture serializes upload, publication and cleanup through SQLite write transactions, including verification and synchronization. That makes the boundary straightforward but holds the writer while doing file I/O. Preparing outside that lock in a larger service needs a pin or equivalent ownership rule so cleanup cannot remove bytes before commitment.

## Run the publication boundary

Download [the publication example](/course-assets/system-design/m25-sync.py). The command uses temporary private files and SQLite. The corruption step alters only its own fixture and restores the original bytes before retrying.

\`\`\`bash title="terminal"
uv venv --quiet --allow-existing --python 3.12.12 /tmp/fanout-m25
/tmp/fanout-m25/bin/python m25-sync.py publication
\`\`\`
\`\`\`output
before blocks=409
uploaded unique bytes=12; visible paths before commit=0
published=201; revision=1; ordered references=4
reconstructed bytes=16; identical=True
duplicate commit=200
corrupt referenced block=503
restored-byte retry=201
stale base=409
reopened revisions=2; first ordered digests=['63c1dd95', '4a8d8134', '90b4853e', '63c1dd95']
\`\`\`

Twelve uploaded bytes initially expose zero paths. Publication selects four references, and the other device reconstructs all sixteen bytes. The last digest display repeats the first because the file repeats that block; storage uses full digests, not these eight-character labels.

Changing stored \`BBBB\` to same-length \`xxxx\` defeats a size-only check but fails digest verification. No revision is published until the bytes are restored and synchronized again. The stale base still refuses afterward.

The database uses \`synchronous=EXTRA\`; files and directories have explicit synchronization calls. Reopening verifies retained records, but this experiment does not test power loss, disk-controller behavior or replicated durability.

## Recover an operation without authorizing a new one

A matching receipt must be checked before rejecting its now-old base: the original proposal may already have advanced the path. Current device permission still comes first. Reusing an operation ID with a different path, base or payload is a conflict.

That distinction lets a lost reply recover the original revision while a new stale proposal receives a conflict. Receipt device/operation fields are non-null and unique together; missing identity must not bypass the rule. The original payload is retained so equality can be checked.

Revision history also creates lifecycle work. A deletion record, or tombstone, tells an offline client that absence is intentional. Renames need a defined identity model: this fixture atomically tombstones the old path and appends the destination; a stable file ID can instead preserve identity while its path changes.

Keep blocks while any retained revision still needs them, including history retained after deletion. Then separately decide when history expires, how an old cursor recovers, and how privacy deletion reaches shared blobs and backups. Immutability makes old versions readable; it does not decide how long they should remain.

The [[wiki/file-sync-system-design|complete file-sync service]] exercises those rename, replay and cleanup paths. [[wiki/data-retention-and-deletion|Data retention and deletion]] develops the broader lifecycle policy.
`;
