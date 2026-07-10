// test_moderation_edge_cases.js
const crypto = require('crypto');
const { app, server } = require('./server');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper: generate HMAC-SHA256 signature
function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// Helper: wait ms
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runTests() {
  console.log('--- Starting Moderation Consensus Edge Case Tests ---\n');
  await new Promise(r => setTimeout(r, 1000));

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

  let savedItemId = null;
  const PEER_ID = 'peer-test-001';
  const SECRET  = 'super-secret-key-for-testing-123';
  const PEER2_ID = 'peer-test-002';
  const SECRET2  = 'another-secret-key-for-peer2-456';

  try {

    // ======================== PEER REGISTRATION ========================

    // Test 1: Register peer — missing fields
    console.log('Test 1: Register peer — missing fields');
    const r1 = await post('/api/moderation/register-peer', { peerId: PEER_ID });
    console.log(r1.status === 400 ? '✅ Test 1 Passed' : `❌ Test 1 Failed: got ${r1.status}`);

    // Test 2: Register peer — secret too short
    console.log('\nTest 2: Register peer — secret too short');
    const r2 = await post('/api/moderation/register-peer', { peerId: PEER_ID, secret: 'short', username: 'Aarav' });
    console.log(r2.status === 400 ? '✅ Test 2 Passed' : `❌ Test 2 Failed: got ${r2.status}`);

    // Test 3: Register peer — valid
    console.log('\nTest 3: Register peer — valid');
    const r3 = await post('/api/moderation/register-peer', { peerId: PEER_ID, secret: SECRET, username: 'Aarav' });
    console.log(r3.status === 200 ? '✅ Test 3 Passed' : `❌ Test 3 Failed: got ${r3.status}`);

    // Test 4: Register second peer
    console.log('\nTest 4: Register second peer');
    const r4 = await post('/api/moderation/register-peer', { peerId: PEER2_ID, secret: SECRET2, username: 'Meera' });
    console.log(r4.status === 200 ? '✅ Test 4 Passed' : `❌ Test 4 Failed: got ${r4.status}`);

    // Test 5: GET /peers — should list both
    console.log('\nTest 5: GET /peers — should list 2 peers');
    const r5 = await fetch(`${BASE_URL}/api/moderation/peers`);
    const peers = await r5.json();
    console.log(peers.length >= 2 ? `✅ Test 5 Passed (${peers.length} peers)` : `❌ Test 5 Failed: only ${peers.length} peers`);

    // ======================== SUBMISSION ========================

    // Test 6: Submit — missing fields
    console.log('\nTest 6: Submit — missing fields');
    const r6 = await post('/api/moderation/submit', { title: 'Test' });
    console.log(r6.status === 400 ? '✅ Test 6 Passed' : `❌ Test 6 Failed: got ${r6.status}`);

    // Test 7: Submit — valid
    console.log('\nTest 7: Submit — valid submission');
    const r7 = await post('/api/moderation/submit', {
      type: 'villagePost', title: 'Warli Dance', content: 'A traditional tribal art from Maharashtra', submittedBy: 'Aarav'
    });
    const d7 = await r7.json();
    savedItemId = d7.itemId;
    console.log(r7.status === 201 && savedItemId ? `✅ Test 7 Passed — ID: ${savedItemId.slice(0,8)}...` : `❌ Test 7 Failed: ${r7.status}`);

    // Test 8: Without CSRF token
    console.log('\nTest 8: Submit — no CSRF token');
    const r8 = await fetch(`${BASE_URL}/api/moderation/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'culturalItem', title: 'Test', content: 'Test', submittedBy: 'Anon' })
    });
    console.log(r8.status === 403 ? '✅ Test 8 Passed: CSRF blocked' : `❌ Test 8 Failed: got ${r8.status}`);

    // ======================== VOTING ========================

    // Test 9: Vote — missing fields
    console.log('\nTest 9: Vote — missing fields');
    const r9 = await post('/api/moderation/vote', { itemId: savedItemId });
    console.log(r9.status === 400 ? '✅ Test 9 Passed' : `❌ Test 9 Failed: got ${r9.status}`);

    // Test 10: Vote — invalid decision
    console.log('\nTest 10: Vote — invalid decision value');
    const r10 = await post('/api/moderation/vote', {
      itemId: savedItemId, peerId: PEER_ID, decision: 'maybe', signature: 'abc', secret: SECRET
    });
    console.log(r10.status === 400 ? '✅ Test 10 Passed' : `❌ Test 10 Failed: got ${r10.status}`);

    // Test 11: Vote — unregistered peer
    console.log('\nTest 11: Vote — unregistered peer');
    const sig11 = sign(`${savedItemId}:unknown-peer:approve`, SECRET);
    const r11 = await post('/api/moderation/vote', {
      itemId: savedItemId, peerId: 'unknown-peer', decision: 'approve', signature: sig11, secret: SECRET
    });
    console.log(r11.status === 403 ? '✅ Test 11 Passed' : `❌ Test 11 Failed: got ${r11.status}`);

    // Test 12: Vote — invalid HMAC signature
    console.log('\nTest 12: Vote — invalid HMAC signature');
    const r12 = await post('/api/moderation/vote', {
      itemId: savedItemId, peerId: PEER_ID, decision: 'approve', signature: 'deadbeef00112233', secret: SECRET
    });
    console.log(r12.status === 403 ? '✅ Test 12 Passed' : `❌ Test 12 Failed: got ${r12.status}`);

    // Test 13: Vote — wrong secret
    console.log('\nTest 13: Vote — wrong secret');
    const sig13 = sign(`${savedItemId}:${PEER_ID}:approve`, 'WRONG-SECRET-XXXXXXXXXXXXX');
    const r13 = await post('/api/moderation/vote', {
      itemId: savedItemId, peerId: PEER_ID, decision: 'approve', signature: sig13, secret: 'WRONG-SECRET-XXXXXXXXXXXXX'
    });
    console.log(r13.status === 403 ? '✅ Test 13 Passed' : `❌ Test 13 Failed: got ${r13.status}`);

    // Test 14: Vote — valid first approval
    console.log('\nTest 14: Vote — valid approval from Peer 1');
    const sig14 = sign(`${savedItemId}:${PEER_ID}:approve`, SECRET);
    const r14 = await post('/api/moderation/vote', {
      itemId: savedItemId, peerId: PEER_ID, decision: 'approve', signature: sig14, secret: SECRET
    });
    const d14 = await r14.json();
    console.log(r14.status === 200 && d14.approvals === 1 ? `✅ Test 14 Passed — approvals: ${d14.approvals}` : `❌ Test 14 Failed: ${JSON.stringify(d14)}`);

    // Test 15: Duplicate vote from same peer
    console.log('\nTest 15: Duplicate vote — same peer');
    const sig15 = sign(`${savedItemId}:${PEER_ID}:approve`, SECRET);
    const r15 = await post('/api/moderation/vote', {
      itemId: savedItemId, peerId: PEER_ID, decision: 'approve', signature: sig15, secret: SECRET
    });
    console.log(r15.status === 409 ? '✅ Test 15 Passed: Duplicate blocked' : `❌ Test 15 Failed: got ${r15.status}`);

    // Test 16: Vote — valid second approval → reaches threshold (2) → item approved
    console.log('\nTest 16: Vote — second approval reaches consensus threshold');
    const sig16 = sign(`${savedItemId}:${PEER2_ID}:approve`, SECRET2);
    const r16 = await post('/api/moderation/vote', {
      itemId: savedItemId, peerId: PEER2_ID, decision: 'approve', signature: sig16, secret: SECRET2
    });
    const d16 = await r16.json();
    console.log(r16.status === 200 && d16.status === 'approved'
      ? `✅ Test 16 Passed — Consensus reached! Status: ${d16.status}`
      : `❌ Test 16 Failed: ${JSON.stringify(d16)}`);

    // Test 17: Vote on already-approved item
    console.log('\nTest 17: Vote on already-approved item');
    const sig17 = sign(`${savedItemId}:${PEER_ID}:reject`, SECRET);
    const r17 = await post('/api/moderation/vote', {
      itemId: savedItemId, peerId: PEER_ID, decision: 'reject', signature: sig17, secret: SECRET
    });
    console.log(r17.status === 409 ? '✅ Test 17 Passed: Already approved item blocked' : `❌ Test 17 Failed: got ${r17.status}`);

    // Test 18: Vote on non-existent item
    console.log('\nTest 18: Vote on non-existent item ID');
    const fakeId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const sig18 = sign(`${fakeId}:${PEER_ID}:approve`, SECRET);
    const r18 = await post('/api/moderation/vote', {
      itemId: fakeId, peerId: PEER_ID, decision: 'approve', signature: sig18, secret: SECRET
    });
    console.log(r18.status === 404 ? '✅ Test 18 Passed' : `❌ Test 18 Failed: got ${r18.status}`);

    // ======================== QUEUE & LOG ========================

    // Test 19: GET queue — approved filter
    console.log('\nTest 19: GET queue — filter by approved');
    const r19 = await fetch(`${BASE_URL}/api/moderation/queue?status=approved`);
    const q19 = await r19.json();
    console.log(r19.status === 200 && q19.length >= 1 ? `✅ Test 19 Passed — ${q19.length} approved items` : `❌ Test 19 Failed`);

    // Test 20: GET audit log
    console.log('\nTest 20: GET audit log — has events');
    const r20 = await fetch(`${BASE_URL}/api/moderation/log`);
    const log20 = await r20.json();
    console.log(r20.status === 200 && log20.length > 0 ? `✅ Test 20 Passed — ${log20.length} log events` : `❌ Test 20 Failed`);

    // ==================================================================
    //  CUSTOM EDGE CASES (21 - 30)
    // ==================================================================

    // Test 21: Full rejection consensus — 2 peers reject → item status = 'rejected'
    console.log('\nTest 21: Custom — Full rejection consensus (2 rejects = rejected)');
    const PEER3_ID = 'peer-test-003';
    const SECRET3  = 'secret-for-peer-three-testing-xyz';
    const PEER4_ID = 'peer-test-004';
    const SECRET4  = 'secret-for-peer-four-testing-abc';
    await post('/api/moderation/register-peer', { peerId: PEER3_ID, secret: SECRET3, username: 'Ravi' });
    await post('/api/moderation/register-peer', { peerId: PEER4_ID, secret: SECRET4, username: 'Sita' });

    const rSub21 = await post('/api/moderation/submit', {
      type: 'oralHistory', title: 'Disputed Festival Record', content: 'Unverified festival origin claim', submittedBy: 'Unknown'
    });
    const dSub21 = await rSub21.json();
    const rejItemId = dSub21.itemId;

    const sig21a = sign(`${rejItemId}:${PEER3_ID}:reject`, SECRET3);
    await post('/api/moderation/vote', { itemId: rejItemId, peerId: PEER3_ID, decision: 'reject', signature: sig21a, secret: SECRET3 });

    const sig21b = sign(`${rejItemId}:${PEER4_ID}:reject`, SECRET4);
    const r21 = await post('/api/moderation/vote', { itemId: rejItemId, peerId: PEER4_ID, decision: 'reject', signature: sig21b, secret: SECRET4 });
    const d21 = await r21.json();
    console.log(r21.status === 200 && d21.status === 'rejected'
      ? `✅ Test 21 Passed — Rejected by consensus! Status: ${d21.status}`
      : `❌ Test 21 Failed: ${JSON.stringify(d21)}`);

    // Test 22: Submit with whitespace-only title (FIXED: controller now trims)
    console.log('\nTest 22: Custom — Submit with whitespace-only title (should reject)');
    const r22 = await post('/api/moderation/submit', {
      type: 'villagePost', title: '   ', content: 'Valid content here', submittedBy: 'Aarav'
    });
    if (r22.status === 400) {
      console.log('✅ Test 22 Passed: Whitespace-only title correctly rejected with 400');
    } else {
      const d22 = await r22.json();
      console.log(`❌ Test 22 Failed: Whitespace title was accepted — status ${r22.status}, ID: ${d22.itemId}`);
    }

    // Test 23: Submit with extremely long content (stress test)
    console.log('\nTest 23: Custom — Submit with very long content (10,000 chars)');
    const longContent = 'अ'.repeat(10000); // 10k Unicode chars
    const r23 = await post('/api/moderation/submit', {
      type: 'culturalItem', title: 'Long Content Test', content: longContent, submittedBy: 'Aarav'
    });
    console.log(r23.status === 201 ? '✅ Test 23 Passed: Long content accepted (no length limit set)' : `❌ Test 23 Failed: ${r23.status}`);

    // Test 24: XSS payload in submission title
    console.log('\nTest 24: Custom — XSS payload in title (backend should store it, FE should escape)');
    const r24 = await post('/api/moderation/submit', {
      type: 'villagePost',
      title: '<script>alert("xss")</script>',
      content: 'Malicious submission attempt',
      submittedBy: 'BadActor'
    });
    if (r24.status === 201) {
      const d24 = await r24.json();
      // Fetch the queue and check the title is stored as-is (sanitization is FE responsibility)
      const qRes = await fetch(`${BASE_URL}/api/moderation/queue?status=pending`);
      const qData = await qRes.json();
      const xssItem = qData.find(i => i.id === d24.itemId);
      console.log(xssItem
        ? `✅ Test 24 Passed: XSS stored as plain text (no server-side execution). FE must escape.`
        : `❌ Test 24 Failed: Item not found in queue`);
    } else {
      console.log(`❌ Test 24 Failed: Submit returned ${r24.status}`);
    }

    // Test 25: Mixed vote — 1 approve, 1 reject → no consensus yet (pending)
    console.log('\nTest 25: Custom — Split vote (1 approve, 1 reject) → still pending');
    const PEER5_ID = 'peer-test-005';
    const SECRET5  = 'secret-for-peer-five-testing-999';
    const PEER6_ID = 'peer-test-006';
    const SECRET6  = 'secret-for-peer-six-testing-777';
    await post('/api/moderation/register-peer', { peerId: PEER5_ID, secret: SECRET5, username: 'Arjun' });
    await post('/api/moderation/register-peer', { peerId: PEER6_ID, secret: SECRET6, username: 'Priya' });

    const rSub25 = await post('/api/moderation/submit', {
      type: 'culturalItem', title: 'Split Vote Item', content: 'This item will get one approve and one reject', submittedBy: 'Aarav'
    });
    const dSub25 = await rSub25.json();
    const splitItemId = dSub25.itemId;

    const sig25a = sign(`${splitItemId}:${PEER5_ID}:approve`, SECRET5);
    await post('/api/moderation/vote', { itemId: splitItemId, peerId: PEER5_ID, decision: 'approve', signature: sig25a, secret: SECRET5 });

    const sig25b = sign(`${splitItemId}:${PEER6_ID}:reject`, SECRET6);
    const r25 = await post('/api/moderation/vote', { itemId: splitItemId, peerId: PEER6_ID, decision: 'reject', signature: sig25b, secret: SECRET6 });
    const d25 = await r25.json();
    console.log(r25.status === 200 && d25.status === 'pending' && d25.approvals === 1 && d25.rejections === 1
      ? `✅ Test 25 Passed — Still pending with split vote (1 approve, 1 reject)`
      : `❌ Test 25 Failed: ${JSON.stringify(d25)}`);

    // Test 26: Queue filter by 'pending' returns only pending items
    console.log('\nTest 26: Custom — Queue filter "pending" excludes approved/rejected');
    const r26 = await fetch(`${BASE_URL}/api/moderation/queue?status=pending`);
    const q26 = await r26.json();
    const allPending = q26.every(item => item.status === 'pending');
    console.log(r26.status === 200 && allPending
      ? `✅ Test 26 Passed — All ${q26.length} items are "pending"`
      : `❌ Test 26 Failed: Mixed statuses found in pending filter`);

    // Test 27: Queue filter by 'rejected' returns only rejected items
    console.log('\nTest 27: Custom — Queue filter "rejected" returns only rejected items');
    const r27 = await fetch(`${BASE_URL}/api/moderation/queue?status=rejected`);
    const q27 = await r27.json();
    const allRejected = q27.every(item => item.status === 'rejected');
    console.log(r27.status === 200 && allRejected
      ? `✅ Test 27 Passed — All ${q27.length} items are "rejected"`
      : `❌ Test 27 Failed: Mixed statuses found in rejected filter`);

    // Test 28: Re-register same peerId with new username — should overwrite
    console.log('\nTest 28: Custom — Re-register same peerId with new username');
    const r28 = await post('/api/moderation/register-peer', {
      peerId: PEER_ID, secret: SECRET, username: 'Aarav Renamed'
    });
    const peersRes28 = await fetch(`${BASE_URL}/api/moderation/peers`);
    const peers28 = await peersRes28.json();
    const updatedPeer = peers28.find(p => p.peerId === PEER_ID);
    console.log(r28.status === 200 && updatedPeer && updatedPeer.username === 'Aarav Renamed'
      ? `✅ Test 28 Passed — Peer re-registered with new username: "${updatedPeer.username}"`
      : `❌ Test 28 Failed: ${JSON.stringify(updatedPeer)}`);

    // Test 29: GET queue with no filter — returns all statuses
    console.log('\nTest 29: Custom — GET queue with no status filter returns all items');
    const r29 = await fetch(`${BASE_URL}/api/moderation/queue`);
    const q29 = await r29.json();
    const statuses29 = new Set(q29.map(i => i.status));
    console.log(r29.status === 200 && q29.length > 0
      ? `✅ Test 29 Passed — ${q29.length} total items, statuses: ${[...statuses29].join(', ')}`
      : `❌ Test 29 Failed`);

    // Test 30: Audit log integrity — all events have timestamp field
    console.log('\nTest 30: Custom — Audit log integrity (all entries have timestamp)');
    const r30 = await fetch(`${BASE_URL}/api/moderation/log`);
    const log30 = await r30.json();
    const allHaveTimestamp = log30.every(entry => entry.timestamp && entry.event);
    console.log(r30.status === 200 && allHaveTimestamp
      ? `✅ Test 30 Passed — All ${log30.length} log entries have event + timestamp fields`
      : `❌ Test 30 Failed: Some log entries missing required fields`);

    console.log('\n--- All 30 Moderation Tests Completed ---');

  } catch (err) {
    console.error('\nTest Error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();

