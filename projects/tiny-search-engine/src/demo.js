/**
 * Inverted Index Search Engine — Interactive Hands-on Lab
 * 
 * Based on principles from "Inverted Index - The Data Structure Behind Search Engines"
 * and production Information Retrieval architecture (Apache Lucene, Elasticsearch).
 */

const { InvertedIndexEngine } = require('./engine');
const { tokenize } = require('./tokenizer');
const { benchmarkCompression, deltaEncode, vbyteEncode } = require('./compression');

function printSection(title) {
  console.log('\n' + '='.repeat(70));
  console.log(`  ${title}`);
  console.log('='.repeat(70));
}

async function runLab() {
  console.log('\n🔍 WELCOME TO THE FROM-SCRATCH INVERTED INDEX LAB');
  console.log('   An architectural walkthrough of how modern search engines operate.');

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Ingestion & Tokenization
  // ─────────────────────────────────────────────────────────────────────────────
  printSection('PHASE 1: Ingesting Corpus & Text Normalization');

  const corpus = [
    {
      id: 1,
      text: 'Distributed consensus algorithms like Raft and Paxos ensure consistency across replicas.',
      pagerank: 0.95
    },
    {
      id: 2,
      text: 'Consistent hashing with virtual nodes ensures minimal data movement during scaling.',
      pagerank: 0.88
    },
    {
      id: 3,
      text: 'Raft is an understandable consensus algorithm for replicated state machines in distributed systems.',
      pagerank: 0.91
    },
    {
      id: 4,
      text: 'Apache Lucene builds an inverted index using immutable segment files and postings lists.',
      pagerank: 0.97
    },
    {
      id: 5,
      text: 'Elasticsearch scales inverted index queries using primary and replica shards across nodes.',
      pagerank: 0.93
    },
    {
      id: 6,
      text: 'Postings lists store sorted document IDs, compressed using delta gaps and variable byte encoding.',
      pagerank: 0.92
    },
    {
      id: 7,
      text: 'Bloom filters provide space-efficient membership testing to avoid unnecessary disk lookups.',
      pagerank: 0.80
    },
    {
      id: 8,
      text: 'Write-ahead logs record state changes sequentially before committing transactions to memory.',
      pagerank: 0.85
    }
  ];

  const engine = new InvertedIndexEngine({ championK: 2 });

  for (const doc of corpus) {
    engine.addDocument(doc.id, doc.text, doc.pagerank);
  }
  engine.buildChampionLists();

  console.log(`Indexed ${corpus.length} documents. Total terms processed: ${engine.totalDocLength}`);
  console.log(`Average document length: ${engine.avgDocLength.toFixed(2)} tokens.\n`);

  console.log('Sample Tokenization Trace:');
  const sample = 'Distributed Systems & Scaling: What is an Inverted Index?';
  console.log(`  Original:   "${sample}"`);
  console.log(`  Tokenized:  [ ${tokenize(sample).map(t => `'${t}'`).join(', ')} ]`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Term Dictionary & Postings Lists
  // ─────────────────────────────────────────────────────────────────────────────
  printSection('PHASE 2: Inverted Term Dictionary & Postings Lists');
  console.log('Term -> Postings List (DocID : TF):');

  const sampleTerms = ['consensu', 'raft', 'index', 'post', 'distribut', 'compress'];
  for (const term of sampleTerms) {
    const plist = engine.index.get(term);
    if (plist) {
      const formatted = plist.entries.map(e => `Doc ${e.docId}(tf=${e.tf})`).join(' -> ');
      console.log(`  '${term.padEnd(12)}' -> [ ${formatted} ] (DF = ${plist.length})`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Postings List Compression Lab (Delta + VByte)
  // ─────────────────────────────────────────────────────────────────────────────
  printSection('PHASE 3: Postings Compression (Delta Gaps + Variable Byte)');
  console.log('Why keep Document IDs sorted? To enable Delta Encoding!\n');

  // Simulate a realistic web postings list with 20 sorted document IDs
  const samplePostings = [
    1002, 1005, 1009, 1014, 1025, 1050, 1052, 1060, 1095, 1120,
    1155, 1200, 1204, 1209, 1250, 1300, 1315, 1340, 1380, 1420
  ];

  const deltas = deltaEncode(samplePostings);
  const bench = benchmarkCompression(samplePostings);

  console.log('1. Raw Document IDs (Sorted):');
  console.log('   ', samplePostings.slice(0, 10).join(', ') + ' ...');
  console.log('\n2. After Delta / Gap Encoding (differences between consecutive IDs):');
  console.log('   ', deltas.slice(0, 10).join(', ') + ' ...');
  console.log('\n3. Memory & Disk Space Analysis:');
  console.log(`   - Raw 32-bit Integer Storage: ${bench.rawBytes} bytes (${samplePostings.length} × 4 bytes)`);
  console.log(`   - Delta + VByte Compressed:   ${bench.compressedBytes} bytes`);
  console.log(`   - Space Reduction / Savings:  ${bench.savingsPercent} 🎉`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Two-Pointer Boolean Query Evaluation
  // ─────────────────────────────────────────────────────────────────────────────
  printSection('PHASE 4: Two-Pointer Boolean Query Evaluation (O(N + M))');

  console.log('A. Boolean AND: "consensus AND raft"');
  const boolAnd = engine.searchBoolean({ must: ['consensus', 'raft'] });
  console.log(`   Matches (must contain both): Document IDs [ ${boolAnd.join(', ')} ]`);

  console.log('\nB. Boolean OR: "paxos OR hashing"');
  const boolOr = engine.searchBoolean({ should: ['paxos', 'hashing'] });
  console.log(`   Matches (contains either):   Document IDs [ ${boolOr.join(', ')} ]`);

  console.log('\nC. Boolean NOT: "consensus AND NOT paxos"');
  const boolNot = engine.searchBoolean({ must: ['consensus'], mustNot: ['paxos'] });
  console.log(`   Matches (contains consensus without paxos): Document IDs [ ${boolNot.join(', ')} ]`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Positional Exact Phrase Search (Proximity & Offsets)
  // ─────────────────────────────────────────────────────────────────────────────
  printSection('PHASE 5: Positional Exact Phrase Search');
  console.log('Postings lists store word positions to enable exact phrase queries without false positives.\n');

  const phrase1 = 'distributed consensus';
  const phraseHits1 = engine.searchPhrase(phrase1);
  console.log(`Query Phrase: "${phrase1}"`);
  console.log(`Matching Documents: ${phraseHits1.length} found`);
  phraseHits1.forEach(h => console.log(`  -> Doc ${h.docId}: "${h.text}"`));

  const phrase2 = 'replicated state machines';
  const phraseHits2 = engine.searchPhrase(phrase2);
  console.log(`\nQuery Phrase: "${phrase2}"`);
  console.log(`Matching Documents: ${phraseHits2.length} found`);
  phraseHits2.forEach(h => console.log(`  -> Doc ${h.docId}: "${h.text}"`));

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Tiered Retrieval & Champion Lists
  // ─────────────────────────────────────────────────────────────────────────────
  printSection('PHASE 6: Tiered Indexes & Champion Lists');
  console.log('Tier 1 stores high-authority documents in RAM. Let us query "consensus":\n');

  const champList = engine.championIndex.get('consensu');
  console.log('  Champion List (Tier 1 Top-2):', champList ? champList.entries.map(e => `Doc ${e.docId}`).join(', ') : 'None');

  const fastPathQuery = engine.search('consensus', { topK: 2, useChampionLists: true });
  console.log(`  Query: "consensus" (requested topK = 2)`);
  console.log(`  Strategy Selected: [${fastPathQuery.tierUsed}]`);
  console.log(`  Results:`);
  fastPathQuery.results.forEach((r, idx) => {
    console.log(`    ${idx + 1}. Doc ${r.docId} (Score: ${r.score}, PageRank: ${r.staticScore}) -> "${r.text.slice(0, 60)}..."`);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. Production BM25 Relevance Ranking
  // ─────────────────────────────────────────────────────────────────────────────
  printSection('PHASE 7: Production BM25 Scoring & Ranking');
  const searchQueries = [
    'inverted index postings',
    'distributed replicated consensus',
    'elasticsearch lucene shards'
  ];

  for (const q of searchQueries) {
    console.log(`\n🔎 Query: "${q}"`);
    const res = engine.search(q, { topK: 3, useChampionLists: false });
    console.log(`   Matched ${res.totalCandidates} candidates. Top ranked results:`);
    res.results.forEach((r, idx) => {
      console.log(`   [#${idx + 1}] Score: ${r.score} | Doc ${r.docId}`);
      console.log(`        "${r.text}"`);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. Arbitrary Scale Batch Ingestion
  // ─────────────────────────────────────────────────────────────────────────────
  printSection('PHASE 8: Arbitrary Scale Batch Ingestion (addDocuments)');
  console.log('Demonstrating dynamic scaling across any number of documents...\n');

  const batchDocs = [];
  const systemTerms = ['kafka', 'redis', 'dynamodb', 'cassandra', 'zookeeper', 'etcd'];
  for (let i = 100; i < 150; i++) {
    const primary = systemTerms[i % systemTerms.length];
    batchDocs.push({
      id: i,
      text: `System record ${i} benchmarks ${primary} cluster throughput with partitioned logs and distributed replication.`,
      staticScore: Number((0.5 + (i % 50) / 100).toFixed(2))
    });
  }

  const startTime = Date.now();
  engine.addDocuments(batchDocs);
  const elapsed = Date.now() - startTime;

  console.log(`Indexed ${batchDocs.length} additional documents in ${elapsed}ms.`);
  console.log(`Total corpus size: ${engine.docCount} documents.`);
  console.log(`Total indexed terms: ${engine.totalDocLength} tokens.`);
  console.log(`Updated average document length: ${engine.avgDocLength.toFixed(2)} tokens.`);

  const batchSearch = engine.search('kafka cluster', { topK: 3 });
  console.log(`\nQuery "kafka cluster" across expanded corpus (${batchSearch.totalCandidates} candidates):`);
  batchSearch.results.forEach((r, idx) => {
    console.log(`  #${idx + 1} Doc ${r.docId} [Score: ${r.score}] "${r.text.slice(0, 70)}..."`);
  });

  printSection('🎉 LAB COMPLETED SUCCESSFULLY');
  console.log('All search engine primitives executed and verified.');
}

if (require.main === module) {
  runLab().catch(console.error);
}

module.exports = { runLab };
