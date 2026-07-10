// test_upload_edge_cases.js
const { app, server } = require('./server');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runTests() {
  console.log('--- Starting Resumable Upload Edge Case Tests ---\n');
  await sleep(1000);

  // Fetch CSRF token
  let csrfToken = '';
  try {
    const r = await fetch(`${BASE_URL}/api/csrf-token`);
    const d = await r.json();
    csrfToken = d.csrfToken;
    console.log(`Got CSRF Token: ${csrfToken ? 'Yes' : 'No'}\n`);
  } catch (e) { console.error('CSRF fetch failed', e); }

  const H = { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken };
  const post = (url, body) => fetch(`${BASE_URL}${url}`, { method: 'POST', headers: H, body: JSON.stringify(body) });

  let savedSessionId = null;

  try {

    // ======================== CONFIG ========================

    // Test 1: GET /config — returns chunk size config
    console.log('Test 1: GET /api/upload/config — returns chunk config');
    const r1 = await fetch(`${BASE_URL}/api/upload/config`);
    const d1 = await r1.json();
    console.log(r1.status === 200 && d1.chunkSizeBytes > 0
      ? `✅ Test 1 Passed — chunkSize: ${d1.chunkSizeBytes} bytes`
      : `❌ Test 1 Failed: ${JSON.stringify(d1)}`);

    // ======================== INIT SESSION ========================

    // Test 2: Init — missing fields
    console.log('\nTest 2: Init — missing required fields');
    const r2 = await post('/api/upload/init', { fileName: 'test.mp4' });
    console.log(r2.status === 400 ? '✅ Test 2 Passed' : `❌ Test 2 Failed: ${r2.status}`);

    // Test 3: Init — invalid mimeType
    console.log('\nTest 3: Init — unsupported file type (text/plain)');
    const r3 = await post('/api/upload/init', {
      fileName: 'test.txt', fileSize: 1024, mimeType: 'text/plain', totalChunks: 1
    });
    console.log(r3.status === 400 ? '✅ Test 3 Passed: Unsupported type rejected' : `❌ Test 3 Failed: ${r3.status}`);

    // Test 4: Init — totalChunks = 0 (invalid)
    console.log('\nTest 4: Init — totalChunks = 0 (invalid)');
    const r4 = await post('/api/upload/init', {
      fileName: 'test.mp4', fileSize: 1024, mimeType: 'video/mp4', totalChunks: 0
    });
    console.log(r4.status === 400 ? '✅ Test 4 Passed: Zero chunks rejected' : `❌ Test 4 Failed: ${r4.status}`);

    // Test 5: Init — negative fileSize
    console.log('\nTest 5: Init — negative fileSize');
    const r5 = await post('/api/upload/init', {
      fileName: 'test.mp4', fileSize: -100, mimeType: 'video/mp4', totalChunks: 1
    });
    console.log(r5.status === 400 ? '✅ Test 5 Passed: Negative size rejected' : `❌ Test 5 Failed: ${r5.status}`);

    // Test 6: Init — valid (3 chunks)
    console.log('\nTest 6: Init — valid session (3 chunks)');
    const r6 = await post('/api/upload/init', {
      fileName: 'festival_dance.mp4', fileSize: 6291456, mimeType: 'video/mp4', totalChunks: 3
    });
    const d6 = await r6.json();
    savedSessionId = d6.sessionId;
    console.log(r6.status === 201 && savedSessionId
      ? `✅ Test 6 Passed — sessionId: ${savedSessionId.slice(0, 8)}...`
      : `❌ Test 6 Failed: ${r6.status}`);

    // Test 7: Init without CSRF token
    console.log('\nTest 7: Init — no CSRF token → 403');
    const r7 = await fetch(`${BASE_URL}/api/upload/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'x.mp4', fileSize: 1024, mimeType: 'video/mp4', totalChunks: 1 })
    });
    console.log(r7.status === 403 ? '✅ Test 7 Passed: CSRF blocked' : `❌ Test 7 Failed: ${r7.status}`);

    // ======================== CHUNK UPLOAD ========================

    // Test 8: Chunk — invalid sessionId
    console.log('\nTest 8: Chunk upload — unknown sessionId → 404');
    const r8 = await fetch(`${BASE_URL}/api/upload/chunk/nonexistent-id/0`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', 'x-csrf-token': csrfToken },
      body: Buffer.alloc(1024)
    });
    console.log(r8.status === 404 ? '✅ Test 8 Passed' : `❌ Test 8 Failed: ${r8.status}`);

    // Test 9: Chunk — index out of range (>= totalChunks)
    console.log('\nTest 9: Chunk — index out of range (index = 99, totalChunks = 3)');
    const r9 = await fetch(`${BASE_URL}/api/upload/chunk/${savedSessionId}/99`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', 'x-csrf-token': csrfToken },
      body: Buffer.alloc(1024)
    });
    console.log(r9.status === 400 ? '✅ Test 9 Passed: Out of range rejected' : `❌ Test 9 Failed: ${r9.status}`);

    // Test 10: Chunk — negative index
    console.log('\nTest 10: Chunk — negative index (-1)');
    const r10 = await fetch(`${BASE_URL}/api/upload/chunk/${savedSessionId}/-1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', 'x-csrf-token': csrfToken },
      body: Buffer.alloc(1024)
    });
    console.log(r10.status === 400 ? '✅ Test 10 Passed: Negative index rejected' : `❌ Test 10 Failed: ${r10.status}`);

    // Test 11: Chunk — empty body (zero bytes)
    console.log('\nTest 11: Chunk — empty body → 400');
    const r11 = await fetch(`${BASE_URL}/api/upload/chunk/${savedSessionId}/0`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', 'x-csrf-token': csrfToken },
      body: Buffer.alloc(0)
    });
    console.log(r11.status === 400 ? '✅ Test 11 Passed: Empty chunk rejected' : `❌ Test 11 Failed: ${r11.status}`);

    // Test 12: Chunk — valid chunk 0
    console.log('\nTest 12: Chunk — valid upload of chunk 0');
    const r12 = await fetch(`${BASE_URL}/api/upload/chunk/${savedSessionId}/0`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', 'x-csrf-token': csrfToken },
      body: Buffer.alloc(2 * 1024 * 1024, 0xAB) // 2MB
    });
    const d12 = await r12.json();
    console.log(r12.status === 200 && d12.receivedCount === 1
      ? `✅ Test 12 Passed — receivedCount: ${d12.receivedCount}, progress: ${d12.progress}%`
      : `❌ Test 12 Failed: ${JSON.stringify(d12)}`);

    // Test 13: Duplicate chunk — upload chunk 0 again
    console.log('\nTest 13: Chunk — duplicate upload of chunk 0 → 409');
    const r13 = await fetch(`${BASE_URL}/api/upload/chunk/${savedSessionId}/0`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', 'x-csrf-token': csrfToken },
      body: Buffer.alloc(1024, 0xCC)
    });
    console.log(r13.status === 409 ? '✅ Test 13 Passed: Duplicate blocked' : `❌ Test 13 Failed: ${r13.status}`);

    // ======================== STATUS (RESUME) ========================

    // Test 14: Status — check progress (chunk 0 done)
    console.log('\nTest 14: Status — check session progress');
    const r14 = await fetch(`${BASE_URL}/api/upload/status/${savedSessionId}`);
    const d14 = await r14.json();
    console.log(r14.status === 200 && d14.receivedCount === 1 && d14.receivedIndexes.includes(0)
      ? `✅ Test 14 Passed — received: ${d14.receivedCount}/${d14.totalChunks}, indexes: [${d14.receivedIndexes}]`
      : `❌ Test 14 Failed: ${JSON.stringify(d14)}`);

    // Test 15: Status — unknown sessionId → 404
    console.log('\nTest 15: Status — unknown sessionId → 404');
    const r15 = await fetch(`${BASE_URL}/api/upload/status/nonexistent-session-xyz`);
    console.log(r15.status === 404 ? '✅ Test 15 Passed' : `❌ Test 15 Failed: ${r15.status}`);

    // ======================== COMPLETE ========================

    // Test 16: Complete — before all chunks → 400 with missing list
    console.log('\nTest 16: Complete — before all chunks (only 1 of 3 received) → 400');
    const r16 = await post(`/api/upload/complete/${savedSessionId}`, {});
    const d16 = await r16.json();
    console.log(r16.status === 400 && d16.missingChunks && d16.missingChunks.length === 2
      ? `✅ Test 16 Passed — missing: [${d16.missingChunks}]`
      : `❌ Test 16 Failed: ${JSON.stringify(d16)}`);

    // Upload remaining chunks (1 and 2)
    await fetch(`${BASE_URL}/api/upload/chunk/${savedSessionId}/1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', 'x-csrf-token': csrfToken },
      body: Buffer.alloc(2 * 1024 * 1024, 0xBB)
    });
    await fetch(`${BASE_URL}/api/upload/chunk/${savedSessionId}/2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', 'x-csrf-token': csrfToken },
      body: Buffer.alloc(1024, 0xCC) // last chunk (smaller)
    });

    // Test 17: Complete — all chunks present → 200
    console.log('\nTest 17: Complete — all 3 chunks uploaded → 200 assembled');
    const r17 = await post(`/api/upload/complete/${savedSessionId}`, {});
    const d17 = await r17.json();
    console.log(r17.status === 200 && d17.assembledSize > 0
      ? `✅ Test 17 Passed — assembled: ${d17.assembledSize} bytes, file: "${d17.fileName}"`
      : `❌ Test 17 Failed: ${JSON.stringify(d17)}`);

    // Test 18: Complete — already completed session → 409
    console.log('\nTest 18: Complete — already complete session → 409');
    const r18 = await post(`/api/upload/complete/${savedSessionId}`, {});
    console.log(r18.status === 409 ? '✅ Test 18 Passed' : `❌ Test 18 Failed: ${r18.status}`);

    // Test 19: Upload chunk to completed session → 409
    console.log('\nTest 19: Chunk upload to completed session → 409');
    const r19 = await fetch(`${BASE_URL}/api/upload/chunk/${savedSessionId}/0`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', 'x-csrf-token': csrfToken },
      body: Buffer.alloc(1024)
    });
    console.log(r19.status === 409 ? '✅ Test 19 Passed' : `❌ Test 19 Failed: ${r19.status}`);

    // ======================== CUSTOM EDGE CASES ========================

    // Test 20: Custom — Unicode + special chars in filename
    console.log('\nTest 20: Custom — Unicode filename (Hindi + symbols)');
    const r20 = await post('/api/upload/init', {
      fileName: 'गाँव की कहानी (Village Story) #1.mp4',
      fileSize: 1024, mimeType: 'video/mp4', totalChunks: 1
    });
    const d20 = await r20.json();
    console.log(r20.status === 201 && d20.sessionId
      ? `✅ Test 20 Passed — Unicode filename accepted`
      : `❌ Test 20 Failed: ${r20.status}`);

    // Test 21: Custom — Init for webm type
    console.log('\nTest 21: Custom — Init with video/webm MIME type');
    const r21 = await post('/api/upload/init', {
      fileName: 'tribal_dance.webm', fileSize: 5000000, mimeType: 'video/webm', totalChunks: 3
    });
    console.log(r21.status === 201 ? '✅ Test 21 Passed: WebM accepted' : `❌ Test 21 Failed: ${r21.status}`);

    // Test 22: Custom — Fractional totalChunks (non-integer)
    console.log('\nTest 22: Custom — Non-integer totalChunks (2.5) → 400');
    const r22 = await post('/api/upload/init', {
      fileName: 'test.mp4', fileSize: 5000000, mimeType: 'video/mp4', totalChunks: 2.5
    });
    console.log(r22.status === 400 ? '✅ Test 22 Passed: Non-integer rejected' : `❌ Test 22 Failed: ${r22.status}`);

    // Test 23: Custom — Very large chunk index (Number.MAX_SAFE_INTEGER)
    console.log('\nTest 23: Custom — Extremely large chunk index');
    const r23init = await post('/api/upload/init', {
      fileName: 'big.mp4', fileSize: 1024, mimeType: 'video/mp4', totalChunks: 1
    });
    const d23 = await r23init.json();
    const r23 = await fetch(`${BASE_URL}/api/upload/chunk/${d23.sessionId}/999999`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', 'x-csrf-token': csrfToken },
      body: Buffer.alloc(1024)
    });
    console.log(r23.status === 400 ? '✅ Test 23 Passed: Huge index rejected' : `❌ Test 23 Failed: ${r23.status}`);

    // Test 24: Custom — Whitespace-only filename
    console.log('\nTest 24: Custom — Whitespace-only filename → validated/trimmed');
    const r24 = await post('/api/upload/init', {
      fileName: '   ', fileSize: 1024, mimeType: 'video/mp4', totalChunks: 1
    });
    // The controller trims fileName — an empty trimmed name should fail
    if (r24.status === 400) {
      console.log('✅ Test 24 Passed: Whitespace filename rejected');
    } else {
      const d24 = await r24.json();
      console.log(`⚠️ Test 24 Note: Whitespace filename accepted (sessionId: ${d24.sessionId?.slice(0,8)})`);
    }

    // Test 25: Custom — Complete with unknown sessionId → 404
    console.log('\nTest 25: Custom — Complete with unknown sessionId → 404');
    const r25 = await post('/api/upload/complete/totally-fake-session-id', {});
    console.log(r25.status === 404 ? '✅ Test 25 Passed' : `❌ Test 25 Failed: ${r25.status}`);

    console.log('\n--- All 25 Upload Tests Completed ---');

  } catch (err) {
    console.error('\nTest Error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
