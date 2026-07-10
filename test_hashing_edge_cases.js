const { normalizeObject, hashObject } = require('./server/utils/hashUtils');

function runTests() {
  let passed = 0;
  let failed = 0;

  function assertEqual(actual, expected, testName) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr === expectedStr) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      console.error(`   Expected: ${expectedStr}`);
      console.error(`   Actual:   ${actualStr}`);
      failed++;
    }
  }

  // 1. Basic Object
  assertEqual(
    normalizeObject({ b: 2, a: 1 }), 
    { a: 1, b: 2 }, 
    "Keys should be sorted"
  );

  // 2. Ignore hash and _verified
  assertEqual(
    normalizeObject({ b: 2, hash: '123', a: 1, _verified: true }), 
    { a: 1, b: 2 }, 
    "Should ignore 'hash' and '_verified'"
  );

  // 3. String trimming
  assertEqual(
    normalizeObject({ a: ' test ', b: '   ' }), 
    { a: 'test', b: '' }, 
    "Strings should be trimmed"
  );

  // 4. Dates
  const d = new Date('2023-01-01T00:00:00.000Z');
  assertEqual(
    normalizeObject({ a: d }), 
    { a: '2023-01-01T00:00:00.000Z' }, 
    "Dates should be converted to ISO strings"
  );

  // 5. Undefined
  try {
    const hash = hashObject(undefined);
    console.log(`✅ [PASS] hashObject(undefined) does not throw (Hash: ${hash})`);
    passed++;
  } catch (e) {
    console.error(`❌ [FAIL] hashObject(undefined) threw: ${e.message}`);
    failed++;
  }

  // 6. Nested Objects and Arrays
  const complex1 = {
    z: [ { c: 3, b: 2, a: 1 } ],
    y: null,
    x: undefined, // JSON.stringify removes undefined
    w: new Date('2022-01-01Z')
  };
  const complex2 = {
    w: new Date('2022-01-01Z'),
    z: [ { a: 1, c: 3, b: 2, hash: 'ignoreme' } ],
    y: null
  };
  
  assertEqual(hashObject(complex1), hashObject(complex2), "Complex objects with different key orders but same content should have identical hashes");

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
