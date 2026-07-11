const { SearchEngine } = require('./utils/searchEngine');

const engine = new SearchEngine();

console.log('--- Testing Add Document ---');
engine.addDocument(
  { id: '1', title: 'The Ancient Art of Pottery', description: 'Ceramic artifacts from the Indus Valley.' },
  'culturalItem',
  ['title', 'description']
);

engine.addDocument(
  { id: '2', title: 'Dancing in the Rain', description: 'A folk tradition from rural India.' },
  'culturalItem',
  ['title', 'description']
);

console.log('Doc Count:', engine.docCount);
console.log('Total Tokens:', engine.totalTokenCount);

console.log('\n--- Testing Semantic Search (Synonyms) ---');
// 'terracotta' is a synonym for 'pottery' in our SYNONYMS map.
const res1 = engine.search('terracotta');
console.log('Search for "terracotta":', res1.map(r => r.title + ' (Score: ' + r._score + ')'));

console.log('\n--- Testing Fuzzy Search ---');
// 'artifct' should match 'artifact' (stemmed to 'artifact')
const res2 = engine.search('artifct');
console.log('Search for "artifct":', res2.map(r => r.title + ' (Score: ' + r._score + ')'));

console.log('\n--- Testing Stemming ---');
// 'dances' should match 'Dancing'/'dance'
const res3 = engine.search('dances');
console.log('Search for "dances":', res3.map(r => r.title + ' (Score: ' + r._score + ')'));

console.log('\n--- Testing Field Weighting ---');
engine.addDocument(
  { id: '3', title: 'Modern Dance', description: 'Nothing special' },
  'culturalItem',
  ['title', 'description']
);
const res4 = engine.search('dance');
console.log('Search for "dance" (Should rank Doc 3 higher because Dance is in title):', res4.map(r => r.title + ' (Score: ' + r._score + ')'));
