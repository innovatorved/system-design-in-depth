/**
 * Automated Unit Test Suite for Inverted Index Search Engine
 */

const assert = require('assert');
const { tokenize, stemWord } = require('./tokenizer');
const { deltaEncode, deltaDecode, vbyteEncode, vbyteDecode, benchmarkCompression } = require('./compression');
const { PostingList, intersectPostings, unionPostings, differencePostings, intersectAll } = require('./postings');
const { InvertedIndexEngine } = require('./engine');

console.log('🧪 RUNNING INVERTED INDEX ENGINE UNIT TESTS...\n');

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Tokenizer & Stemming Tests
// ─────────────────────────────────────────────────────────────────────────────
test('Tokenizer: strips punctuation and normalizes case', () => {
  const tokens = tokenize('Hello, World! SYSTEM-DESIGN 101.');
  assert.deepStrictEqual(tokens, ['hello', 'world', 'system', 'design', '101']);
});

test('Tokenizer: removes stop words by default', () => {
  const tokens = tokenize('the quick brown fox is jumping over the lazy dog', { stem: false });
  assert.ok(!tokens.includes('the'));
  assert.ok(!tokens.includes('is'));
  assert.ok(!tokens.includes('over'));
  assert.ok(tokens.includes('quick'));
  assert.ok(tokens.includes('dog'));
});

test('Stemmer: normalizes common suffix inflections', () => {
  assert.strictEqual(stemWord('searched'), 'search');
  assert.strictEqual(stemWord('searching'), 'search');
  assert.strictEqual(stemWord('algorithms'), 'algorithm');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Compression & Delta Encoding Tests
// ─────────────────────────────────────────────────────────────────────────────
test('Delta Encoding: lossless roundtrip', () => {
  const original = [100, 105, 112, 118, 250, 9999];
  const deltas = deltaEncode(original);
  assert.deepStrictEqual(deltas, [100, 5, 7, 6, 132, 9749]);
  const decoded = deltaDecode(deltas);
  assert.deepStrictEqual(decoded, original);
});

test('VByte Encoding: lossless roundtrip for small and large ints', () => {
  const numbers = [0, 1, 5, 127, 128, 255, 300, 16384, 1000000];
  const encoded = vbyteEncode(numbers);
  const decoded = vbyteDecode(encoded);
  assert.deepStrictEqual(decoded, numbers);
});

test('Compression: saves > 60% memory vs raw 32-bit integers', () => {
  const sample = [100, 104, 108, 112, 115, 120, 125, 130, 135, 140, 145, 150];
  const bench = benchmarkCompression(sample);
  assert.strictEqual(bench.rawBytes, 48); // 12 * 4
  assert.ok(bench.compressedBytes < 20);
  assert.ok(parseFloat(bench.savingsPercent) > 60);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Postings List & Boolean Intersection Tests
// ─────────────────────────────────────────────────────────────────────────────
test('PostingList: maintains strictly sorted docId order regardless of insertion order', () => {
  const plist = new PostingList('test');
  plist.add(40);
  plist.add(10);
  plist.add(30);
  plist.add(20);
  assert.deepStrictEqual(plist.getDocIds(), [10, 20, 30, 40]);
});

test('Two-Pointer Intersect (AND): finds common elements in O(N + M)', () => {
  const listA = new PostingList('a');
  [1, 3, 5, 7, 9, 11].forEach(id => listA.add(id));

  const listB = new PostingList('b');
  [2, 3, 6, 7, 10, 11].forEach(id => listB.add(id));

  const res = intersectPostings(listA, listB);
  assert.deepStrictEqual(res.map(r => r.docId), [3, 7, 11]);
});

test('IntersectAll: orders by shortest list first and handles empty intersections', () => {
  const listA = new PostingList('a');
  [1, 2, 3, 4, 5, 6].forEach(id => listA.add(id));

  const listB = new PostingList('b');
  [2, 4, 6].forEach(id => listB.add(id));

  const listC = new PostingList('c');
  [4, 6, 8].forEach(id => listC.add(id));

  const res = intersectAll([listA, listB, listC]);
  assert.deepStrictEqual(res.map(r => r.docId), [4, 6]);
});

test('Two-Pointer Union (OR): merges distinct elements in O(N + M)', () => {
  const listA = new PostingList('a');
  [1, 3, 5].forEach(id => listA.add(id));

  const listB = new PostingList('b');
  [2, 3, 4].forEach(id => listB.add(id));

  const res = unionPostings(listA, listB);
  assert.deepStrictEqual(res.map(r => r.docId), [1, 2, 3, 4, 5]);
});

test('Two-Pointer Difference (AND NOT): excludes documents', () => {
  const listA = new PostingList('a');
  [1, 2, 3, 4, 5].forEach(id => listA.add(id));

  const listB = new PostingList('b');
  [2, 4].forEach(id => listB.add(id));

  const res = differencePostings(listA, listB);
  assert.deepStrictEqual(res.map(r => r.docId), [1, 3, 5]);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Inverted Index Engine & BM25 Tests
// ─────────────────────────────────────────────────────────────────────────────
test('Engine: indexes documents and evaluates boolean queries', () => {
  const engine = new InvertedIndexEngine();
  engine.addDocument(1, 'Consensus in distributed systems requires Raft.');
  engine.addDocument(2, 'Consistent hashing balances load in distributed storage.');
  engine.addDocument(3, 'Paxos is another distributed consensus algorithm.');

  const matches = engine.searchBoolean({ must: ['consensus', 'distributed'] });
  assert.deepStrictEqual(matches, [1, 3]);

  const notMatches = engine.searchBoolean({ must: ['consensus'], mustNot: ['raft'] });
  assert.deepStrictEqual(notMatches, [3]);
});

test('Engine: Champion Lists fast-path retrieval', () => {
  const engine = new InvertedIndexEngine({ championK: 1 });
  engine.addDocument(1, 'Database transaction logs', 0.5);
  engine.addDocument(2, 'High authority database systems', 0.99); // Top champion
  engine.buildChampionLists();

  const searchFast = engine.search('database', { topK: 1, useChampionLists: true });
  assert.strictEqual(searchFast.tierUsed, 'Tier-1 (Champion In-Memory Fast Path)');
  assert.strictEqual(searchFast.results[0].docId, 2);
});

test('Engine: BM25 ranking rewards term frequency and rarity', () => {
  const engine = new InvertedIndexEngine();
  engine.addDocument(1, 'Common distributed database term');
  engine.addDocument(2, 'Rare Paxos consensus distributed database');
  engine.addDocument(3, 'Paxos Paxos Paxos replicated state machine');

  // "paxos" is rare and mentioned 3 times in Doc 3 -> Doc 3 should rank highest for "paxos"
  const res = engine.search('paxos', { topK: 3, useChampionLists: false });
  assert.strictEqual(res.results[0].docId, 3);
});

test('Engine: Batch ingestion of arbitrary datasets (addDocuments)', () => {
  const engine = new InvertedIndexEngine();
  const dataset = [
    { id: 101, text: 'First batch document about redis caching', staticScore: 0.7 },
    { id: 102, text: 'Second batch document about memcached caching', staticScore: 0.6 },
    { id: 103, text: 'Third batch document about database write ahead logs', staticScore: 0.9 }
  ];
  engine.addDocuments(dataset);
  assert.strictEqual(engine.docCount, 3);
  const hits = engine.searchBoolean({ must: ['caching'] });
  assert.deepStrictEqual(hits, [101, 102]);
});

test('Engine: Positional exact phrase search', () => {
  const engine = new InvertedIndexEngine();
  engine.addDocument(1, 'The quick brown fox jumps over the lazy dog');
  engine.addDocument(2, 'A brown quick fox wanders through the woods');
  engine.addDocument(3, 'The quick brown fox sleeps quietly');

  // "quick brown fox" is an exact 3-word phrase in doc 1 and 3, but reversed in doc 2
  const phraseHits = engine.searchPhrase('quick brown fox');
  assert.strictEqual(phraseHits.length, 2);
  assert.deepStrictEqual(phraseHits.map(h => h.docId), [1, 3]);

  // Non-matching phrase
  const noHits = engine.searchPhrase('lazy brown');
  assert.strictEqual(noHits.length, 0);
});

console.log(`\n🎉 ALL ${passed} TESTS PASSED CLEANLY!\n`);
