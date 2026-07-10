const fs = require('fs');
const path = require('path');
const { app, server } = require('./server');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Simple mock for browser environment
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); },
  removeItem(key) { delete this.store[key]; }
};

global.window = {};

// Load the clientSearchEngine.js script into Node using eval
const clientEnginePath = path.join(__dirname, 'public', 'scripts', 'clientSearchEngine.js');
const clientEngineCode = fs.readFileSync(clientEnginePath, 'utf8');

// To let eval work properly without throwing fetch errors initially, we mock fetch
global.fetch = async (url) => {
  if (url.includes('/api/search/index-data')) {
    // Actually hit our local server to test the endpoint
    const http = require('http');
    return new Promise((resolve) => {
      http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            ok: true,
            json: async () => JSON.parse(data)
          });
        });
      });
    });
  }
  return { ok: false };
};

// Evaluate the client code in the current global context
eval(clientEngineCode);
const engine = window.clientSearchEngine;

async function runTests() {
  console.log('--- Starting Client-Side Search Edge Case Tests ---\n');

  try {
    // Test 1: Fetch Index Data Endpoint directly
    console.log('Test 1: Check GET /api/search/index-data');
    const indexResponse = await fetch(`${BASE_URL}/api/search/index-data`);
    const indexData = await indexResponse.json();
    console.log((indexData.culturalItems && indexData.villagePosts) 
      ? `✅ Test 1 Passed — got index data` 
      : '❌ Test 1 Failed');

    // Test 2: Engine Initialization
    console.log('\nTest 2: Engine Initialization (fetching + building index)');
    await engine.init(BASE_URL + '/api/search');
    console.log(engine.isReady && engine.docCount > 0
      ? `✅ Test 2 Passed — Engine ready, indexed ${engine.docCount} docs`
      : '❌ Test 2 Failed');

    // Test 3: Basic Exact Search
    console.log('\nTest 3: Basic Exact Search ("pottery")');
    const exactResults = engine.search('pottery');
    console.log(exactResults.length > 0 
      ? `✅ Test 3 Passed — found ${exactResults.length} results` 
      : '❌ Test 3 Failed');

    // Test 4: Fuzzy Search (Typo)
    console.log('\nTest 4: Fuzzy Search ("kanta" typo for kantha)');
    const fuzzyResults = engine.search('kanta');
    console.log(fuzzyResults.length > 0 
      ? `✅ Test 4 Passed — found ${fuzzyResults.length} results despite typo` 
      : '❌ Test 4 Failed');

    // Test 5: Empty Search
    console.log('\nTest 5: Empty Search');
    const emptyResults = engine.search('   ');
    console.log(emptyResults.length === 0
      ? '✅ Test 5 Passed — handled empty input correctly'
      : '❌ Test 5 Failed');

    // Test 6: Synonym Search
    console.log('\nTest 6: Synonym Search ("ceramic" should find "pottery")');
    const synResults = engine.search('ceramic');
    console.log(synResults.length > 0
      ? `✅ Test 6 Passed — synonym search successful`
      : '❌ Test 6 Failed');
      
    // Test 7: Case Insensitivity
    console.log('\nTest 7: Case Insensitivity Search ("POTTERY")');
    const caseResults = engine.search('POTTERY');
    console.log(caseResults.length === exactResults.length
      ? '✅ Test 7 Passed — case handled correctly'
      : '❌ Test 7 Failed');

    // Test 8: Special Characters & Emojis
    console.log('\nTest 8: Special Characters & Emojis ("pottery!!! 🎨")');
    const specialResults = engine.search('pottery!!! 🎨');
    console.log(specialResults.length === exactResults.length
      ? '✅ Test 8 Passed — handled special characters properly'
      : '❌ Test 8 Failed');

    // Test 9: Malformed/Missing Data Handling
    console.log('\nTest 9: Malformed Document Indexing');
    const initialDocCount = engine.docCount;
    engine.addDocument({ title: 'Ghost Doc without ID' }, 'culturalItem', ['title']);
    engine.addDocument({ id: 'valid_id_no_content' }, 'culturalItem', ['title', 'description']);
    console.log(engine.docCount > initialDocCount 
      ? '✅ Test 9 Passed — gracefully indexed malformed documents'
      : '❌ Test 9 Failed');

    // Test 10: Multi-Word Query Scoring
    console.log('\nTest 10: Multi-Word Query ("kantha embroidery")');
    const multiResults = engine.search('kantha embroidery');
    console.log(multiResults.length > 0 && multiResults[0]._score > 0
      ? `✅ Test 10 Passed — found ${multiResults.length} results and scored them`
      : '❌ Test 10 Failed');

    // Test 11: Non-Existent Gibberish Query
    console.log('\nTest 11: Gibberish Query ("xyzqwertydfh")');
    const gibberishResults = engine.search('xyzqwertydfh');
    console.log(gibberishResults.length === 0
      ? '✅ Test 11 Passed — found 0 results for gibberish'
      : '❌ Test 11 Failed');

    console.log('\n--- All Client-Side Search Tests Completed ---');
  } catch (err) {
    console.error('\nTest Error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

// Give server a moment to start
setTimeout(runTests, 1000);
