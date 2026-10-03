# Assets Needing Removal or Restructuring

**Date:** 3 October 2026  
**Status:** In Progress (Remediation Execution)

---

## 1. Structural Assets to Dissolve

The following elements of the project's information architecture are designated for replacement to eliminate 1:1 structural correspondence with Fanout:

1. **The 18-Module Partition Scheme (`data/curriculum.js`):**
   - `learning-foundations` (Module 01)
   - `learning-apis-services` (Module 02)
   - `learning-data-sql` (Module 03)
   - `learning-nosql-partitioning` (Module 04)
   - `learning-caching-fast-reads` (Module 05)
   - `learning-distributed-coordination` (Module 06)
   - `learning-storage-engines` (Module 07)
   - `learning-async-streams` (Module 08)
   - `learning-search-retrieval` (Module 09)
   - `learning-analytics-sketches` (Module 10)
   - `learning-realtime-social` (Module 11)
   - `learning-geo-matching` (Module 12)
   - `learning-media-files` (Module 13)
   - `learning-reliability-ops` (Module 14)
   - `design-services` (Module 15)
   - `design-products` (Module 16)
   - `design-operations` (Module 17)
   - `company-cases` (Module 18)

2. **Rigid "200 Units / 18 Modules" Branding & Claims:**
   - Meta description and Open Graph strings in `index.html`.
   - Landing page hero stats (`<dt>200</dt><dd>Topics</dd>`).
   - Search placeholder (`Search 200 topics…`).
   - README headline and section titles.

---

## 2. Content Replacement & Reassignment Actions

- **Dissolve 3-Part Partition:** Discard the Fanout-matching 14 + 3 + 1 three-part taxonomy.
- **Relocate to 6 Tracks:** Reassign all 200 topics into 6 logically coherent functional engineering tracks.
- **Remove Obsolete Redundant Markers:** Clean up legacy routing references in `js/app.js` (`#paths`, `#cards`, `#review`).
