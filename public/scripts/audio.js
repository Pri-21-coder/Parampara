// public/scripts/audio.js

document.addEventListener('DOMContentLoaded', () => {
  const audioInput = document.getElementById('audio-input');
  const dropZone = document.getElementById('drop-zone');
  const spinnerContainer = document.getElementById('loading-spinner');
  const progressText = document.getElementById('progress-percent');
  const resultsPanel = document.getElementById('results-panel');
  const canvas = document.getElementById('waveform-canvas');
  
  const playBtn = document.getElementById('play-btn');
  const timeDisplay = document.getElementById('time-display');

  let audioContext;
  let sourceNode;
  let audioBuffer;
  let isPlaying = false;
  let startTime = 0;
  let pausedAt = 0;
  let animationFrame;

  // Setup Drag & Drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAudioFile(e.dataTransfer.files[0]);
    }
  });

  audioInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleAudioFile(e.target.files[0]);
    }
  });

  async function handleAudioFile(file) {
    if (!file.type.startsWith('audio/')) {
      alert('Please upload a valid audio file.');
      return;
    }

    // Reset UI
    dropZone.classList.add('hidden');
    spinnerContainer.classList.remove('hidden');
    resultsPanel.classList.add('hidden');
    progressText.innerText = '0%';
    
    if (sourceNode) {
      try { sourceNode.stop(); } catch(e){}
    }
    isPlaying = false;
    pausedAt = 0;

    try {
      progressText.innerText = 'Reading file...';
      const arrayBuffer = await file.arrayBuffer();

      progressText.innerText = 'Decoding audio...';
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      progressText.innerText = 'Extracting features...';
      
      // Get raw channel data (Float32Array)
      const channelData = audioBuffer.getChannelData(0);
      
      // Spawn Web Worker for heavy lifting
      const worker = new Worker('/scripts/audioWorker.js');
      
      worker.postMessage({
        type: 'PROCESS_AUDIO',
        channelData: channelData,
        sampleRate: audioBuffer.sampleRate
      }); // Note: we can't easily transfer channelData if we still want to play it, so we copy it.

      worker.onmessage = async function(e) {
        if (e.data.status === 'SUCCESS') {
          spinnerContainer.classList.add('hidden');
          resultsPanel.classList.remove('hidden');

          const { peaks, bpm, fingerprint } = e.data;
          
          const duration = audioBuffer.duration;
          const channels = audioBuffer.numberOfChannels;
          const sampleRate = audioBuffer.sampleRate;
          const bitrate = Math.round((file.size * 8) / duration / 1000) + ' kbps';

          // Update DOM
          document.getElementById('meta-duration').innerText = formatTime(duration);
          document.getElementById('meta-samplerate').innerText = sampleRate + ' Hz';
          document.getElementById('meta-channels').innerText = channels === 1 ? 'Mono' : 'Stereo';
          document.getElementById('meta-bpm').innerText = bpm || 'N/A';
          document.getElementById('meta-fingerprint').innerText = fingerprint;
          
          // Draw Waveform
          drawWaveform(peaks);

          // Setup playback
          setupPlayback(duration);

          // Sync to backend
          await syncMetadata(file.name, duration, sampleRate, bitrate, channels, bpm, fingerprint, peaks);

        } else {
          alert('Error processing audio: ' + e.data.error);
          spinnerContainer.classList.add('hidden');
          dropZone.classList.remove('hidden');
        }
        worker.terminate();
      };

    } catch (err) {
      console.error(err);
      alert('Failed to process audio file.');
      spinnerContainer.classList.add('hidden');
      dropZone.classList.remove('hidden');
    }
  }

  function drawWaveform(peaks) {
    const ctx = canvas.getContext('2d');
    
    // Set actual size in memory (scaled for retina displays)
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#c16e28';
    
    const barWidth = width / peaks.length;

    for (let i = 0; i < peaks.length; i++) {
      const peak = peaks[i];
      const barHeight = peak * height;
      const x = i * barWidth;
      const y = (height - barHeight) / 2; // Center vertically
      
      // Draw bar with gap
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    }
  }

  function setupPlayback(totalDuration) {
    playBtn.disabled = false;
    playBtn.innerHTML = '<i class="ti ti-player-play"></i> Play';
    timeDisplay.innerText = `0:00 / ${formatTime(totalDuration)}`;

    playBtn.onclick = () => {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      if (isPlaying) {
        // Pause
        sourceNode.stop();
        pausedAt += audioContext.currentTime - startTime;
        isPlaying = false;
        playBtn.innerHTML = '<i class="ti ti-player-play"></i> Play';
        cancelAnimationFrame(animationFrame);
      } else {
        // Play
        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(audioContext.destination);
        sourceNode.start(0, pausedAt);
        startTime = audioContext.currentTime;
        isPlaying = true;
        playBtn.innerHTML = '<i class="ti ti-player-pause"></i> Pause';

        sourceNode.onended = () => {
          if (!isPlaying) return; // Means we manually paused
          isPlaying = false;
          pausedAt = 0;
          playBtn.innerHTML = '<i class="ti ti-player-play"></i> Play';
          timeDisplay.innerText = `0:00 / ${formatTime(totalDuration)}`;
          cancelAnimationFrame(animationFrame);
        };

        const updateTime = () => {
          if (!isPlaying) return;
          const current = pausedAt + (audioContext.currentTime - startTime);
          timeDisplay.innerText = `${formatTime(current)} / ${formatTime(totalDuration)}`;
          animationFrame = requestAnimationFrame(updateTime);
        };
        updateTime();
      }
    };
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  async function syncMetadata(fileName, duration, sampleRate, bitrate, channels, bpm, fingerprint, peaks) {
    const syncText = document.getElementById('meta-sync');
    syncText.innerText = 'Syncing...';
    syncText.style.color = '#c16e28'; // orange

    try {
      // Fetch CSRF token
      let csrfToken = '';
      try {
        const csrfRes = await fetch('/api/csrf-token');
        const csrfData = await csrfRes.json();
        csrfToken = csrfData.csrfToken;
      } catch(e) {}

      const res = await fetch('/api/audio/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({
          fileName,
          duration,
          sampleRate,
          bitrate,
          channels,
          bpm,
          fingerprint,
          peaks
        })
      });

      if (res.ok) {
        const data = await res.json();
        syncText.innerText = 'Saved (ID: ' + data.id.substring(0, 8) + '...)';
        syncText.style.color = '#28a745'; // green
      } else {
        syncText.innerText = 'Failed to sync';
        syncText.style.color = '#dc3545'; // red
      }
    } catch (err) {
      console.error(err);
      syncText.innerText = 'Network error';
      syncText.style.color = '#dc3545';
    }
  }
});
