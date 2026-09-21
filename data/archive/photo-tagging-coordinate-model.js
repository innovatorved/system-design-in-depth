window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["photo-tagging-coordinate-model"] = `# Design: photo tags that survive resizing

A photo tag associates an account with a place in an image. That place should stay attached to its subject when a laptop-sized photo becomes a phone thumbnail. Storing the click's screen coordinates cannot provide that guarantee: the next display may have a different size, margins or crop.

We'll work through source coordinates, map a point into a square card, and extend the model to boxes and crop edits. Then we'll follow a tag through placement, approval and image replacement in a small executable service.

## Store a place in the source image

Choose a coordinate convention before choosing a database. Here the origin is the upper-left corner, horizontal coordinates increase rightward, and vertical coordinates increase downward. Each tag belongs to one immutable image version with known dimensions and orientation.

For our 800 by 600 source, a point at (200,150) is one quarter of the way across and down. Store those fractions as \`u=0.25\` and \`v=0.25\`. In a simple 400 by 300 resize, the same point becomes (100,75).

\`\`\`text
u = source_x / source_width
v = source_y / source_height

rendered_x = u * rendered_image_width
rendered_y = v * rendered_image_height
\`\`\`

Source pixels would also work if every consumer knew which source dimensions they referred to. The mistake is storing pixels from an unspecified display. Ratios make the convention convenient; the image version keeps their meaning stable.

Keep full precision in storage. For example, rounding a 600/1024 ratio to 0.586 before multiplying it by 512 yields 300.032 instead of 300. Round only when presenting a value or placing a raster pixel.

Our point domain includes 0 and 1. The point (1,1) denotes the lower-right boundary of the image extent, not an indexed raster pixel. Whether the marker's label extends beyond that boundary is a separate layout choice.

## Account for the display box

The rendered image and its surrounding box are not always the same size. With \`contain\`, the entire image fits and unused space becomes margins. With \`cover\`, the image fills the box and some source content may be cropped. Both preserve aspect ratio.

For a centered image in a box of width W and height H, choose a scale and then an offset:

\`\`\`text
contain: s = min(W / 800, H / 600)
cover:   s = max(W / 800, H / 600)

ox = (W - 800*s) / 2
oy = (H - 600*s) / 2
X = ox + 800*s*u
Y = oy + 600*s*v
\`\`\`

These are CSS-pixel positions within the box, independent of the display's physical pixel density. The formulas assume centered positioning and no border, padding or CSS rotation. A different \`object-position\` needs different offsets.

| In a 500 by 500 box | Result for the quarter-width, quarter-height point |
| --- | --- |
| Contain: image is 500 by 375, with 62.5-pixel top and bottom margins | (125,156.25) |
| Cover: image is about 666.67 by 500, with 83.33 pixels cropped from each side | About (83.33,125) |

Multiplying both fractions by 500 misses the contain margin. It gives (125,125), which is a valid place in the square but the wrong place on the photo.

The generated preview below puts the marker over the source's upper-left circle. Its raster rounds the 62.5-pixel top offset to an integer row; the calculation above retains the fractional position.

![Contained square preview with the chosen marker over the upper-left circle and blank margins above and below the image](/course-assets/system-design/m22-photo-overlay.png)

For editing, invert the transform: subtract the offsets, then divide by the scaled source dimensions. Reject a click in a contain margin. For viewing, hide a point outside a cover crop instead of moving it to the edge, where it would label a different place.

The example checks exact display-space membership first and clips only floating-point quotient roundoff at 0 and 1. It does not use clamping to turn an invalid click into a valid tag.

## Boxes and crop edits

A point is enough for a small name marker. To identify an area, store a rectangle using either normalized corners \`(u1,v1,u2,v2)\` or normalized origin and size \`(u,v,width,height)\`.

For corners, require finite values with \`0 <= u1 < u2 <= 1\` and \`0 <= v1 < v2 <= 1\`. For origin and size, require positive dimensions and an extent that stays inside the source. Keep the representation explicit; a point with a decorative label is not automatically a bounding box.

Render both corners through the same transform. A partially cropped box can be clipped for display while retaining its original source bounds. This box extension is a design choice; the executable below accepts only points.

A crop creates another coordinate space. Suppose an 800 by 600 source is cropped to the rectangle starting at (100,50), with width 400 and height 300. The original point (200,150) becomes (100,100) inside that crop, or fractions (0.25,1/3).

\`\`\`text
cropped_u = (source_u * 800 - crop_left) / crop_width
cropped_v = (source_v * 600 - crop_top) / crop_height
\`\`\`

A point outside the crop is hidden, not reassigned to its nearest edge. Store the crop transform with the derived variant so the client can recover this relationship. A rotation needs its own transform and orientation convention too.

An unrelated replacement has no such relationship. Even another 800 by 600 image may contain something different at the same fractions. Give it a new version and require explicit retagging. The [[wiki/image-cdn-and-resizing|image pipeline]] should normalize orientation before establishing the canonical coordinate space.

## Separate the tag from the image bytes

Our service starts with a generated upright geometric image. Ada owns it and selects Bo as the target of a point tag. This records a person's account selection; it performs no face recognition.

The image bytes stay immutable. A database stores version metadata and tag relationships. The client reads the image through the media path, while the tagging API handles coordinates and permission.

\`\`\`mermaid
flowchart TB
  accTitle: Coordinates refer to an image version
  accDescr: The client reads immutable image bytes through the media path and sends coordinates or consent to the tag API. The API checks image version and permission in the tag database.
  C[Image client] -->|point or consent| A[Tag API]
  A --> D[(Versions and tags)]
  C -->|media path| I[Immutable image bytes]
\`\`\`

The fixture has three main records:

| Record | Meaning |
| --- | --- |
| Image | Owner, current version, visibility and placement revision |
| Immutable version | Image/version key, digest, dimensions and orientation |
| Tag | Tag ID, image/version, target account, u, v and approval state |

An extended box schema would replace the point fields with one declared rectangle representation. Record the creator and creation time explicitly if other accounts may propose tags; this fixture restricts all placement to the image owner.

Decide the product rules early. Unregistered names need a separate label identity rather than a fabricated account ID. Machine-suggested boxes need an explicit confirmation state. A per-image tag limit, bounded reads and marker clustering keep hundreds of tags from turning into an unreadable overlay. Those extensions are not implemented here.

## Place, approve and read

Ada sends \`POST /images/photo-1/tags\` with an operation ID, image version, base placement revision, target and point. The server binds Ada from her credential, validates the numbers and verifies ownership. It never accepts a caller-supplied owner as authority.

The new tag begins pending. In one transaction the service inserts it, advances the placement revision and saves the operation receipt. Repeating the identical request returns the receipt; reusing its identity with changed coordinates conflicts.

Bo can approve or withdraw through \`POST /tags/1/consent\`. Reads expose only approved tags for the current version, with active owner and target accounts and current permission to view the image. Placement and approval answer different questions: Ada can suggest an association, while Bo controls whether this design displays it.

\`\`\`mermaid
sequenceDiagram
  accTitle: A proposed tag becomes visible after approval
  accDescr: Ada places a pending tag. A reader sees no tag until Bo approves it. A later withdrawal hides it from subsequent reads.
  participant A as Ada
  participant S as Tag service
  participant B as Bo
  A->>S: Place tag, v1
  S-->>A: Pending tag 1
  B->>S: Approve tag 1
  Note over S: Approved: visible
  B->>S: Withdraw approval
  Note over S: Withdrawn: hidden
\`\`\`

Two placements based on revision 1 cannot both advance this editor to revision 2. One succeeds; the other refetches. This whole-image precondition is a deliberate editing policy. Independent annotations could instead use per-tag revisions or a declared merge rule.

Consent does not advance the placement revision. The fixture serializes new consent writes in arrival order, so a production interface with multiple active editing devices would need a separate consent revision if it must reject stale new intentions.

An identical old approval retry only returns its historical receipt; it does not undo a later withdrawal. As in [[wiki/reaction-modeling|reaction modeling]], the client must distinguish an operation result from current state.

## Run the geometry and HTTP example

Save the [tagging service](/course-assets/system-design/m22-tagging.py), [shared helpers](/course-assets/system-design/m22-common.py) and [pinned image dependency](/course-assets/system-design/m22-image-requirements.txt) together. Use an isolated Python environment with the pinned Pillow version. The program generates geometric images, owns a temporary SQLite database and serves requests only on loopback.

\`\`\`bash title="setup"
python3 -m venv /tmp/fanout-m22
uv pip install --python /tmp/fanout-m22/bin/python -r m22-image-requirements.txt
\`\`\`

Before running it, predict two outcomes: whether a top-margin click is accepted, and whether an editor holding image version 1 can place a tag after the source is replaced by version 2.

\`\`\`bash title="terminal"
/tmp/fanout-m22/bin/python m22-tagging.py --images ./m22-images
\`\`\`
\`\`\`output
Pillow=12.1.0 source=800x600 orientation=1
normalized point: u=0.25 v=0.25; source=(200,150)
contain 500x500: (125.000000,156.250000) roundtrip_error=0.000000000000
cover 500x500: (83.333333,125.000000) roundtrip_error=0.000000000000
right/bottom equality: (1.0, 1.0)
letterbox click: refused
cover left-edge source point: None
owner placement: 201 pending
identical retry: 200
changed retry: 409
non-owner placement: 403
before consent visible tags: 0
after Bo consent visible tags: 1
concurrent revision1: [201, 409]
consent withdrawn visible tags: 0
malformed framing: [["empty transfer encoding",400],["ambiguous length",400],["huge numeric length",400],["unpaired surrogate",400],["short body",400]]
retained tags=2 coordinate pairs=2
replacement visible tags: 0
old image placement: 409
private image read: 404
\`\`\`

The inverse calculation is checked before its error is rounded for printing. The HTTP run exercises retries, permission, approval and concurrent placement. The five malformed framing probes are refused without adding tags. Either concurrent target may win; sorting the status codes makes the capture independent of that choice.

Two rows remain because the initial placement and one concurrent placement succeeded. Replacement retains those rows under version 1 but makes the current version's visible list empty. An old editor must reload the image and ask for confirmation; silently resending its fractions under version 2 defeats the version check.

Finally, Bo's earlier approval does not grant access after Ada makes the image private. The fixture returns 404 for that read. A real private-media product must also authorize the image bytes and every variant: filtering tag metadata alone cannot protect a publicly served photo.
`;
