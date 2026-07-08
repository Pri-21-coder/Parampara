// public/scripts/audioWorker.js

self.onmessage = function(e) {
  const { type, channelData, sampleRate } = e.data;

  if (type === 'PROCESS_AUDIO') {
    try {
      // 1. Extract Waveform Peaks
      const peaks = extractPeaks(channelData, 200); // 200 data points for canvas

      // 2. Estimate BPM
      const bpm = estimateBPM(channelData, sampleRate);

      // 3. Generate Audio Fingerprint
      const fingerprint = generateFingerprint(peaks, bpm);

      self.postMessage({
        status: 'SUCCESS',
        peaks,
        bpm,
        fingerprint
      });
    } catch (error) {
      self.postMessage({
        status: 'ERROR',
        error: error.message
      });
    }
  }
};

/**
 * Downsamples raw channel data into a fixed number of peaks for rendering
 */
function extractPeaks(channelData, numberOfPeaks) {
  const peaks = [];
  const step = Math.floor(channelData.length / numberOfPeaks);

  for (let i = 0; i < numberOfPeaks; i++) {
    let min = 1.0;
    let max = -1.0;
    for (let j = 0; j < step; j++) {
      const datum = channelData[(i * step) + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    // We store the max amplitude for the peak
    peaks.push(Math.max(Math.abs(min), Math.abs(max)));
  }

  // Normalize peaks between 0 and 1
  const globalMax = Math.max(...peaks);
  if (globalMax > 0) {
    return peaks.map(p => p / globalMax);
  }
  return peaks;
}

/**
 * Basic BPM estimation using amplitude thresholds and intervals
 */
function estimateBPM(channelData, sampleRate) {
  // A robust BPM algorithm involves FFT and filter banks.
  // For client-side performance, we do a basic amplitude peak detection.
  let peaks = [];
  const threshold = 0.6; 
  
  // Downsample roughly to check peaks every ~0.1 seconds to avoid noise
  const step = Math.floor(sampleRate / 10);
  
  for (let i = 0; i < channelData.length; i += step) {
    let localMax = 0;
    for (let j = 0; j < step && i+j < channelData.length; j++) {
      let val = Math.abs(channelData[i+j]);
      if (val > localMax) localMax = val;
    }
    if (localMax > threshold) {
      peaks.push(i / sampleRate); // Store time in seconds
    }
  }

  if (peaks.length < 2) return 0; // Not enough peaks

  // Find intervals between consecutive peaks
  let intervals = [];
  for (let i = 1; i < peaks.length; i++) {
    let diff = peaks[i] - peaks[i - 1];
    if (diff > 0.3 && diff < 2.0) { // between 30 and 200 bpm
      intervals.push(diff);
    }
  }

  if (intervals.length === 0) return 0;

  // Average the intervals
  let sum = intervals.reduce((a, b) => a + b, 0);
  let avgInterval = sum / intervals.length;

  let bpm = Math.round(60 / avgInterval);
  return bpm > 0 ? bpm : 0;
}

/**
 * Generates a lightweight perceptual hash of the audio
 */
function generateFingerprint(peaks, bpm) {
  // We'll create a simple hash using the peak distribution and BPM.
  // In a real acoustic fingerprinting system like Shazam, this uses spectral peaks (constellation maps).
  // Here we use a lightweight deterministic hash of the envelope.
  
  let hashStr = bpm.toString() + '-';
  for (let i = 0; i < peaks.length; i += 10) { // sample every 10th peak
    // quantize peak to 16 levels (hex)
    let hexChar = Math.floor(peaks[i] * 15).toString(16);
    hashStr += hexChar;
  }
  
  return 'pr-' + hashStr;
}
