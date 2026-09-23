/**
 * Text Normalization and Tokenization Pipeline
 * 
 * Steps:
 * 1. Lowercasing & Unicode folding
 * 2. Non-alphanumeric punctuation stripping
 * 3. Stop-words filtering (removes high-frequency zero-entropy words)
 * 4. Algorithmic suffix stemming (Porter-style reduction of word inflections)
 */

const DEFAULT_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but',
  'by', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me',
  'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
  'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then',
  'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
  'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Lightweight Porter-inspired suffix stemmer for demonstration
 * Normalizes common inflections: "searched", "searching", "searches" -> "search"
 */
function stemWord(word) {
  if (word.length <= 3) return word;

  let w = word;
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('sses')) return w.slice(0, -2);
  if (w.endsWith('tions') || w.endsWith('tion')) return w.replace(/tions?$/, 't');
  if (w.endsWith('ments') || w.endsWith('ment')) return w.replace(/ments?$/, '');
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('ly') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);

  return w;
}

/**
 * Tokenize a continuous string into normalized linguistic tokens
 */
function tokenize(text, options = {}) {
  const {
    removeStopWords = true,
    stem = true,
    withPositions = false,
    customStopWords = DEFAULT_STOP_WORDS
  } = options;

  if (!text || typeof text !== 'string') return [];

  // 1. Lowercase and strip non-alphanumeric characters (keep single spaces)
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();

  if (!cleaned) return [];

  // 2. Split on whitespace
  const rawTokens = cleaned.split(/\s+/).filter(Boolean);

  // 3. Filter stop words & apply stemming
  const tokens = [];
  for (let pos = 0; pos < rawTokens.length; pos++) {
    const raw = rawTokens[pos];
    if (removeStopWords && customStopWords.has(raw)) {
      continue;
    }
    const finalToken = stem ? stemWord(raw) : raw;
    if (finalToken.length > 0) {
      if (withPositions) {
        tokens.push({ term: finalToken, position: pos });
      } else {
        tokens.push(finalToken);
      }
    }
  }

  return tokens;
}

module.exports = {
  tokenize,
  stemWord,
  DEFAULT_STOP_WORDS
};
