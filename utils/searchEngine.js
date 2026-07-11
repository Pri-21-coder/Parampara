// utils/searchEngine.js

/**
 * Advanced TF-IDF / BM25 Semantic Search Engine
 * Features: Okapi BM25 Ranking, Field Weighting, Stemming, Synonyms, Fuzzy Matching (Levenshtein), Multilingual Stopwords.
 */

// Simple Suffix-Stripping Stemmer (English)
function stem(word) {
  if (word.length < 4) return word;
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('es') && !word.endsWith('ies')) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  if (word.endsWith('ing')) {
    let root = word.slice(0, -3);
    if (/(bb|gg|ll|nn|pp|tt)$/.test(root)) root = root.slice(0, -1);
    return root;
  }
  if (word.endsWith('ed')) return word.slice(0, -2);
  if (word.endsWith('ly')) return word.slice(0, -2);
  if (word.endsWith('ment')) return word.slice(0, -4);
  if (word.endsWith('tion')) return word.slice(0, -4);
  if (word.endsWith('ity')) return word.slice(0, -3);
  return word;
}

// Levenshtein Distance for Fuzzy Matching
function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

const SYNONYMS = {
  'pottery': ['ceramic', 'clay', 'terracotta'],
  'dance': ['dancing', 'folk', 'performance'],
  'painting': ['art', 'canvas', 'drawing', 'mural'],
  'music': ['song', 'instrument', 'audio', 'singing'],
  'artifact': ['relic', 'antique', 'item', 'object', 'heritage'],
  'textile': ['fabric', 'cloth', 'weaving', 'saree', 'apparel'],
  'tradition': ['culture', 'custom', 'ritual', 'heritage']
};

class SearchEngine {
  constructor() {
    this.invertedIndex = {}; // term -> { docId: tf }
    this.documentLengths = {}; // docId -> length
    this.documents = {}; // docId -> { type, data }
    this.docCount = 0;
    this.totalTokenCount = 0; // For BM25 avgdl

    // BM25 Parameters
    this.k1 = 1.2;
    this.b = 0.75;

    // Multilingual Stop Words
    this.stopWords = new Set([
      // English
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in',
      'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the',
      'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with',
      // Hindi (Transliterated & Devanagari)
      'aur', 'hai', 'ki', 'ke', 'ka', 'ko', 'mein', 'se', 'ek', 'par', 'bhi', 'kya',
      'है', 'कि', 'के', 'का', 'को', 'में', 'से', 'एक', 'पर', 'भी', 'क्या', 'और',
      // Marathi
      'ahe', 'ani', 'va', 'tar', 'pan', 'mag',
      'आहे', 'आणि', 'व', 'तर', 'पण', 'मग'
    ]);

    this.fieldWeights = {
      title: 3.0,
      name: 3.0, // for artisans
      tags: 2.0,
      craft: 2.0,
      category: 2.0,
      theme: 2.0,
      village: 1.5,
      location: 1.5
    };
  }

  tokenize(text) {
    if (!text || typeof text !== 'string') return [];

    return text
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0 && !this.stopWords.has(token))
      .map(token => stem(token)); // Apply Stemmer
  }

  addDocument(doc, type, indexableFields) {
    if (!doc || !doc.id) return;

    if (this.documents[doc.id]) {
      this.removeDocument(doc.id);
    }

    const tokenCounts = {};
    let docLength = 0;

    for (const field of indexableFields) {
      if (!doc[field]) continue;

      let text = Array.isArray(doc[field]) ? doc[field].join(' ') : String(doc[field]);
      const tokens = this.tokenize(text);
      const weight = this.fieldWeights[field] || 1.0;

      for (const token of tokens) {
        tokenCounts[token] = (tokenCounts[token] || 0) + weight;
        docLength++;
      }
    }

    this.documents[doc.id] = { type, data: doc };
    this.documentLengths[doc.id] = docLength;
    this.docCount++;
    this.totalTokenCount += docLength;

    for (const [token, tf] of Object.entries(tokenCounts)) {
      if (!this.invertedIndex[token]) {
        this.invertedIndex[token] = {};
      }
      this.invertedIndex[token][doc.id] = tf;
    }
  }

  removeDocument(docId) {
    if (!this.documents[docId]) return;

    for (const token in this.invertedIndex) {
      if (this.invertedIndex[token][docId]) {
        delete this.invertedIndex[token][docId];
        if (Object.keys(this.invertedIndex[token]).length === 0) {
          delete this.invertedIndex[token];
        }
      }
    }

    this.totalTokenCount -= this.documentLengths[docId];
    delete this.documents[docId];
    delete this.documentLengths[docId];
    this.docCount--;
  }

  expandQuery(queryTokens) {
    const expanded = new Set(queryTokens);
    for (const token of queryTokens) {
      for (const [key, synonyms] of Object.entries(SYNONYMS)) {
        if (key === token || synonyms.includes(token)) {
          expanded.add(key);
          synonyms.forEach(syn => expanded.add(syn));
        }
      }
    }
    return Array.from(expanded);
  }

  findFuzzyMatches(token) {
    // If exact match exists, return it
    if (this.invertedIndex[token]) return [token];

    // Otherwise, find closest terms (Levenshtein distance <= 1 or 2 depending on length)
    const maxDist = token.length > 5 ? 2 : 1;
    const matches = [];

    for (const indexTerm of Object.keys(this.invertedIndex)) {
      // Fast length filter before expensive Levenshtein
      if (Math.abs(indexTerm.length - token.length) > maxDist) continue;

      if (levenshtein(token, indexTerm) <= maxDist) {
        matches.push(indexTerm);
      }
    }
    return matches;
  }

  search(query, typeFilter = null) {
    if (!query || typeof query !== 'string') return [];

    let queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    // 1. Synonym Expansion
    queryTokens = this.expandQuery(queryTokens);

    const scores = {};
    const avgdl = this.docCount > 0 ? this.totalTokenCount / this.docCount : 0;

    for (const token of queryTokens) {
      // 2. Fuzzy Matching
      const matchedTerms = this.findFuzzyMatches(token);

      for (const matchedTerm of matchedTerms) {
        const docEntries = this.invertedIndex[matchedTerm];
        if (!docEntries) continue;

        // Okapi BM25 IDF
        const n_q = Object.keys(docEntries).length;
        const idf = Math.log((this.docCount - n_q + 0.5) / (n_q + 0.5) + 1);

        // Score docs
        for (const [docId, tf] of Object.entries(docEntries)) {
          if (!scores[docId]) scores[docId] = 0;

          const D = this.documentLengths[docId];

          // BM25 TF calculation
          const tf_numerator = tf * (this.k1 + 1);
          const tf_denominator = tf + this.k1 * (1 - this.b + this.b * (D / avgdl));

          // Multiply by a dampening factor for fuzzy matches so exact matches rank higher
          const fuzzyPenalty = matchedTerm === token ? 1.0 : 0.7;

          scores[docId] += idf * (tf_numerator / tf_denominator) * fuzzyPenalty;
        }
      }
    }

    const results = [];
    for (const [docId, score] of Object.entries(scores)) {
      const docEntry = this.documents[docId];
      if (!docEntry) continue;
      if (typeFilter && typeFilter !== 'all' && docEntry.type !== typeFilter) continue;

      results.push({
        ...docEntry.data,
        _score: score
      });
    }

    results.sort((a, b) => b._score - a._score);
    return results;
  }
}

function createSearchProxy(searchEngine, resourceType, indexableFields, cacheInstance) {
  const originalSet = cacheInstance.set.bind(cacheInstance);
  const originalDelete = cacheInstance.delete.bind(cacheInstance);
  const originalClear = cacheInstance.clear.bind(cacheInstance);

  cacheInstance.set = (key, value) => {
    originalSet(key, value);
    searchEngine.addDocument(value, resourceType, indexableFields);
  };

  cacheInstance.delete = (key) => {
    originalDelete(key);
    searchEngine.removeDocument(key);
  };

  cacheInstance.clear = () => {
    const allValues = Array.from(cacheInstance.values());

    allValues.forEach(val => {
      searchEngine.removeDocument(val.id || 'unknown');
    });

    originalClear();
  };

  const originalPush = cacheInstance.push.bind(cacheInstance);
  if (originalPush) {
    cacheInstance.push = (item) => {
      const key = item.id || Date.now().toString() + Math.random().toString(36).substr(2, 5);
      cacheInstance.set(key, item);
      return cacheInstance.length;
    };
  }

  return cacheInstance;
}

module.exports = {
  SearchEngine,
  createSearchProxy
};
