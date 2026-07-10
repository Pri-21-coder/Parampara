const { SearchEngine } = require('./utils/searchEngine');

const engine = new SearchEngine();
let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ PASS: ${message}`);
  } else {
    console.log(`❌ FAIL: ${message}`);
  }
}

console.log('--- Testing Semantic Search Edge Cases ---\n');

try {
  // Edge Case 1: Empty queries
  const resEmpty = engine.search('');
  assert(resEmpty.length === 0, 'Empty string query returns empty array');
  
  const resNull = engine.search(null);
  assert(resNull.length === 0, 'Null query returns empty array');
  
  const resSpecial = engine.search('!@#$%^');
  assert(resSpecial.length === 0, 'Only special characters query returns empty array');

  // Edge Case 2: No documents
  const resNoDocs = engine.search('hello');
  assert(resNoDocs.length === 0, 'Search with 0 documents returns empty array');

  // Edge Case 3: Empty documents (testing avgdl division by zero)
  engine.addDocument({ id: 'empty1', title: '' }, 'test', ['title']);
  engine.addDocument({ id: 'empty2' }, 'test', ['title']);
  const resEmptyDocs = engine.search('hello');
  assert(resEmptyDocs.length === 0, 'Search against empty documents does not crash');

  // Edge Case 4: Missing fields and number fields
  engine.addDocument({ id: 'num1', title: 12345, tags: null }, 'test', ['title', 'tags', 'missing']);
  const resNum = engine.search('12345');
  assert(resNum.length === 1 && resNum[0].id === 'num1', 'Numbers are cast to string and indexed correctly, missing fields ignored');

  // Edge Case 5: Document Updating (Ghost tokens)
  engine.addDocument({ id: 'upd1', title: 'Old Title Apple' }, 'test', ['title']);
  let resApple = engine.search('apple');
  assert(resApple.length === 1, 'Document found by old title');
  
  // Update document (removes 'Apple', adds 'Banana')
  engine.addDocument({ id: 'upd1', title: 'New Title Banana' }, 'test', ['title']);
  resApple = engine.search('apple');
  assert(resApple.length === 0, 'Ghost tokens removed after document update');
  
  const resBanana = engine.search('banana');
  assert(resBanana.length === 1, 'Document found by new title');

  // Edge Case 6: Fuzzy match with long words
  engine.addDocument({ id: 'fuzz1', title: 'Archaeological' }, 'test', ['title']);
  const resFuzz = engine.search('archaeologcal'); // Missing 'i'
  assert(resFuzz.length === 1 && resFuzz[0].id === 'fuzz1', 'Fuzzy search works for long words with typo');

  // Edge Case 7: Type Filtering
  engine.addDocument({ id: 'type1', title: 'Find Me' }, 'typeA', ['title']);
  engine.addDocument({ id: 'type2', title: 'Find Me' }, 'typeB', ['title']);
  const resTypeA = engine.search('find', 'typeA');
  assert(resTypeA.length === 1 && resTypeA[0].id === 'type1', 'Type filtering strictly returns correct type');

  // Edge Case 8: Remove non-existent doc
  engine.removeDocument('does-not-exist');
  assert(true, 'Removing non-existent document does not crash');

} catch (err) {
  console.log(`❌ CRASH: ${err.message}`);
  console.error(err.stack);
}

console.log(`\nResults: ${passed}/${total} passed.`);
