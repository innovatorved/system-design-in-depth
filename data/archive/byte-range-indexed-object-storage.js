window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["byte-range-indexed-object-storage"] = `# Byte-range indexed object storage

A byte-range read retrieves part of an object. Add an index from logical keys to byte locations, and a large dictionary or catalog can answer a point lookup without transferring its entire data file.

The application supplies the lookup logic; object storage supplies bytes. We'll translate an index entry into a range, verify a local read, then handle response validation, compression and access control.

## Name the object as well as the position

The [[wiki/file-backed-dictionary-storage-engine|dictionary design]] needs an entry shaped like this:

\`\`\`text
key -> object identity, start byte, length
\`\`\`

Object identity must select the version used to build the index. An unchanged offset in a replaced object can return a different value with a perfectly valid length. Use immutable object names or an explicit retained version; [[wiki/immutable-versioned-data-files|the next lesson]] covers publication and cleanup.

Our exercise uses a separate color pack: \`red\\n\`, \`green\\n\`, then \`purple\\n\`. The newline is one byte, making the values four, six and seven bytes long. This is not the previous lesson's word-meaning file.

| Key | Half-open byte slice and length |
| --- | --- |
| apple | \`[0:4]\`: 4 bytes |
| pear | \`[4:10]\`: 6 bytes |
| plum | \`[10:17]\`: 7 bytes |

A program slice excludes its right endpoint. HTTP byte ranges include it, so pear's six bytes become \`Range: bytes=4-9\`. For a nonempty indexed value, the last byte is \`start + length - 1\`. An empty value needs no body read; do not turn zero length into an invalid reversed range.

## Exercise the boundary

The [object-storage download](/course-assets/system-design/m13-object-store.py) writes this 17-byte pack in a private temporary directory. It compares a full read with a seek to pear's offset, then tries invalid metadata and an actually shortened source file.

\`\`\`bash title="terminal"
python3 m13-object-store.py ranges
\`\`\`

\`\`\`output
pack bytes: 17 ; index: {"apple":[0,4],"pear":[4,6],"plum":[10,7]}
full: b'red\\ngreen\\npurple\\n'
pear slice [4:10] -> b'green\\n'
HTTP range spelling: bytes=4-9; returned length=6
index (-1,1): invalid indexed boundary
index (10,8): invalid indexed boundary
shortened source: truncated source
\`\`\`

The helper rejects a negative offset or an interval beyond the recorded complete length. It also checks the returned byte count. A valid-looking index cannot make a shortened source return all its promised bytes.

This mode performs local file reads. Its HTTP line is calculated syntax, not a network response or an S3 measurement. Returned bytes also do not tell us the number of physical disk reads.

## Check what the server actually returned

A served single HTTP range uses \`206 Partial Content\` and a \`Content-Range\` describing the interval. An unsatisfiable range can produce \`416\`. A server may also ignore Range and send the full representation, so sending the header does not guarantee a partial response.

For our six-byte lookup, require the expected interval and body length before decoding. Handle a full response explicitly within a bounded fallback policy, rather than passing its first bytes off as the requested value. A short body, wrong version or unexpected encoding is a failed read.

S3's GetObject supports one selected range per request, and \`versionId\` can select a retained version where versioning is supported. The server still does not know which logical dictionary key the interval represents. Our index makes that connection.

## Keep compression and caching aligned

As in [[wiki/custom-binary-file-format|the format lesson]], HTTP offsets refer to the encoded representation. Offsets measured before whole-file compression cannot generally locate independently decodable values afterward. Keep data uncompressed, compress each record independently, or index compressed blocks and decode the containing block locally.

A block can contain several values, so requesting one key may still fetch its neighbors. Verify the appropriate block or record checksum against trusted metadata before using it. Matching length alone misses same-length substitutions; fetching the whole object for every checksum would defeat a small-range read.

Cache frequently requested values near the API. Include the object generation and logical key in the cache identity so an update cannot reuse the old answer accidentally. Fetching nearby entries together may reduce request overhead; measure the extra bytes against the saved requests.

This pattern also suits indexed file sections and selected media chunks. It is less attractive when every request needs most of the object, or values require frequent independent updates. Separate objects give each value its own lifecycle; a pack trades that independence for one published collection.

## Authorize the key before deriving the range

Accept a logical key at the API, check the caller's permission, then look up its trusted location. Allowing arbitrary object paths and byte offsets would let a caller reach neighboring data outside that key's policy.

Bound the range length, total returned bytes, retries and request rate. Check the expected content type and encoding. Storage failures remain errors; they must not become “key missing” or a cached partial value. With those boundaries in place, the index provides precise access without turning the byte store into a database.
`;
