const { app, server } = require('./server');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('--- Starting Audio Engine Edge Case Tests ---\n');

  // Wait a moment for server to bind
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Fetch CSRF token for all POST requests
  let csrfToken = '';
  try {
    const csrfRes = await fetch(`${BASE_URL}/api/csrf-token`);
    const csrfData = await csrfRes.json();
    csrfToken = csrfData.csrfToken;
    console.log(`Got CSRF Token: ${csrfToken ? 'Yes' : 'No'}\n`);
  } catch (e) {
    console.error('Failed to get CSRF token', e);
  }

  const postHeaders = {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken
  };

  let savedMetadataId = null;

  try {

    // ========================
    // BACKEND API EDGE CASES
    // ========================

    // Test 1: Missing required fields (fileName)
    console.log('Test 1: POST /api/audio/metadata - Missing fileName');
    const res1 = await fetch(`${BASE_URL}/api/audio/metadata`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({
        duration: 120,
        fingerprint: 'pr-120-abc',
        peaks: [0.1, 0.5, 0.3]
      })
    });
    if (res1.status === 400) {
      console.log('✅ Test 1 Passed: Correctly rejected missing fileName\n');
    } else {
      console.error(`❌ Test 1 Failed: Expected 400, got ${res1.status}\n`);
    }

    // Test 2: Missing required fields (duration)
    console.log('Test 2: POST /api/audio/metadata - Missing duration');
    const res2 = await fetch(`${BASE_URL}/api/audio/metadata`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({
        fileName: 'folk_song.mp3',
        fingerprint: 'pr-120-abc',
        peaks: [0.1, 0.5, 0.3]
      })
    });
    if (res2.status === 400) {
      console.log('✅ Test 2 Passed: Correctly rejected missing duration\n');
    } else {
      console.error(`❌ Test 2 Failed: Expected 400, got ${res2.status}\n`);
    }

    // Test 3: Missing required fields (fingerprint)
    console.log('Test 3: POST /api/audio/metadata - Missing fingerprint');
    const res3 = await fetch(`${BASE_URL}/api/audio/metadata`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({
        fileName: 'folk_song.mp3',
        duration: 120,
        peaks: [0.1, 0.5, 0.3]
      })
    });
    if (res3.status === 400) {
      console.log('✅ Test 3 Passed: Correctly rejected missing fingerprint\n');
    } else {
      console.error(`❌ Test 3 Failed: Expected 400, got ${res3.status}\n`);
    }

    // Test 4: Missing required fields (peaks)
    console.log('Test 4: POST /api/audio/metadata - Missing peaks array');
    const res4 = await fetch(`${BASE_URL}/api/audio/metadata`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({
        fileName: 'folk_song.mp3',
        duration: 120,
        fingerprint: 'pr-120-abc'
      })
    });
    if (res4.status === 400) {
      console.log('✅ Test 4 Passed: Correctly rejected missing peaks\n');
    } else {
      console.error(`❌ Test 4 Failed: Expected 400, got ${res4.status}\n`);
    }

    // Test 5: POST without CSRF token
    console.log('Test 5: POST /api/audio/metadata - Missing CSRF token');
    const res5 = await fetch(`${BASE_URL}/api/audio/metadata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // NO CSRF
      body: JSON.stringify({
        fileName: 'folk_song.mp3',
        duration: 120,
        fingerprint: 'pr-120-abc',
        peaks: [0.1, 0.5]
      })
    });
    if (res5.status === 403) {
      console.log('✅ Test 5 Passed: CSRF protection working correctly\n');
    } else {
      console.error(`❌ Test 5 Failed: Expected 403, got ${res5.status}\n`);
    }

    // Test 6: Valid full metadata submission
    console.log('Test 6: POST /api/audio/metadata - Valid full payload');
    const res6 = await fetch(`${BASE_URL}/api/audio/metadata`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({
        fileName: 'raga_bhairav.mp3',
        duration: 183.4,
        sampleRate: 44100,
        bitrate: '192 kbps',
        channels: 2,
        bpm: 72,
        fingerprint: 'pr-72-a5b3c9d1e2',
        peaks: Array.from({ length: 200 }, (_, i) => Math.abs(Math.sin(i * 0.1)))
      })
    });
    if (res6.status === 201) {
      const body6 = await res6.json();
      savedMetadataId = body6.id;
      console.log(`✅ Test 6 Passed: Metadata saved with ID: ${savedMetadataId}\n`);
    } else {
      console.error(`❌ Test 6 Failed: Expected 201, got ${res6.status}\n`);
    }

    // Test 7: Valid minimal payload (only required fields)
    console.log('Test 7: POST /api/audio/metadata - Valid minimal payload');
    const res7 = await fetch(`${BASE_URL}/api/audio/metadata`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({
        fileName: 'oral_history.wav',
        duration: 3600.0,
        fingerprint: 'pr-0-00000000',
        peaks: [0, 0, 0, 0.1, 0.2]
      })
    });
    if (res7.status === 201) {
      const body7 = await res7.json();
      console.log(`✅ Test 7 Passed: Minimal payload saved with ID: ${body7.id}\n`);
    } else {
      const body7 = await res7.json();
      console.error(`❌ Test 7 Failed: Expected 201, got ${res7.status}, body:`, body7, '\n');
    }

    // Test 8: GET existing metadata by ID
    console.log('Test 8: GET /api/audio/metadata/:id - Fetch saved metadata');
    if (savedMetadataId) {
      const res8 = await fetch(`${BASE_URL}/api/audio/metadata/${savedMetadataId}`);
      const body8 = await res8.json();
      if (res8.status === 200 && body8.fileName === 'raga_bhairav.mp3' && body8.bpm === 72) {
        console.log(`✅ Test 8 Passed: Retrieved record - ${body8.fileName}, BPM: ${body8.bpm}\n`);
      } else {
        console.error(`❌ Test 8 Failed: Unexpected response`, body8, '\n');
      }
    } else {
      console.warn('⚠️  Test 8 Skipped: No ID from Test 6\n');
    }

    // Test 9: GET non-existent metadata ID
    console.log('Test 9: GET /api/audio/metadata/:id - Non-existent ID');
    const res9 = await fetch(`${BASE_URL}/api/audio/metadata/non-existent-id-12345`);
    if (res9.status === 404) {
      console.log('✅ Test 9 Passed: Correctly returned 404 for missing ID\n');
    } else {
      console.error(`❌ Test 9 Failed: Expected 404, got ${res9.status}\n`);
    }

    // Test 10: Custom edge case - empty peaks array (should now be rejected after fix)
    console.log('Test 10: POST /api/audio/metadata - Empty peaks array (should reject)');
    const res10 = await fetch(`${BASE_URL}/api/audio/metadata`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({
        fileName: 'silence.mp3',
        duration: 5.0,
        fingerprint: 'pr-0-empty',
        peaks: []
      })
    });
    if (res10.status === 400) {
      console.log('✅ Test 10 Passed: Empty peaks array correctly rejected with 400\n');
    } else {
      console.error(`❌ Test 10 Failed: Expected 400, got ${res10.status}\n`);
    }

    // Test 11: Custom edge case - very long duration (24hr recording)
    console.log('Test 11: POST /api/audio/metadata - Very long duration (24hr recording)');
    const res11 = await fetch(`${BASE_URL}/api/audio/metadata`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({
        fileName: 'village_oral_archive_full_day.wav',
        duration: 86400, // 24 hours
        sampleRate: 44100,
        bitrate: '128 kbps',
        channels: 1,
        bpm: 0,
        fingerprint: 'pr-0-longfile',
        peaks: Array.from({ length: 200 }, () => Math.random() * 0.5)
      })
    });
    if (res11.status === 201) {
      console.log('✅ Test 11 Passed: 24-hour recording metadata handled correctly\n');
    } else {
      console.error(`❌ Test 11 Failed: Expected 201, got ${res11.status}\n`);
    }

    // Test 12: Custom edge case - special characters in filename
    console.log('Test 12: POST /api/audio/metadata - Special characters in fileName');
    const res12 = await fetch(`${BASE_URL}/api/audio/metadata`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({
        fileName: 'गाँव की कहानी (Village Story) #1 <test>.mp3',
        duration: 45.3,
        fingerprint: 'pr-80-unicode',
        peaks: [0.1, 0.2, 0.3]
      })
    });
    if (res12.status === 201) {
      const body12 = await res12.json();
      console.log(`✅ Test 12 Passed: Unicode filename handled. ID: ${body12.id}\n`);
    } else {
      console.error(`❌ Test 12 Failed: Expected 201, got ${res12.status}\n`);
    }

    // Test 13: Custom edge case - BPM is 0 (silent track / chant with no beat)
    console.log('Test 13: POST /api/audio/metadata - BPM is 0 (ambient / chant recording)');
    const res13 = await fetch(`${BASE_URL}/api/audio/metadata`, {
      method: 'POST',
      headers: postHeaders,
      body: JSON.stringify({
        fileName: 'morning_chant.wav',
        duration: 300,
        sampleRate: 48000,
        channels: 1,
        bpm: 0,
        fingerprint: 'pr-0-chant',
        peaks: [0.05, 0.1, 0.12, 0.08]
      })
    });
    if (res13.status === 201) {
      console.log('✅ Test 13 Passed: BPM=0 (ambient/chant) handled correctly\n');
    } else {
      console.error(`❌ Test 13 Failed: Expected 201, got ${res13.status}\n`);
    }

    console.log('--- All Audio Engine Tests Completed ---');

  } catch (err) {
    console.error('\nTest Execution Error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
