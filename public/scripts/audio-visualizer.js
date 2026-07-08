/**
 * Advanced Audio Context Visualizer
 * Provides real-time visual representations (Spectrum, Waveform, Radial)
 * using the native Web Audio API and HTML5 Canvas.
 */

class AdvancedAudioVisualizer {
  constructor(audioElement) {
    this.audioElement = audioElement;
    
    // Prevent CORS issues when fetching external audio
    if (!this.audioElement.crossOrigin) {
      this.audioElement.crossOrigin = "anonymous";
    }

    // UI Setup
    this.container = document.createElement("div");
    this.container.className = "audio-visualizer-container";
    this.container.style.position = "relative";
    this.container.style.width = "100%";
    this.container.style.marginTop = "12px";
    
    this.canvas = document.createElement("canvas");
    this.canvas.className = "audio-visualizer-canvas";
    this.canvas.width = 1200; 
    this.canvas.height = 200;
    
    // Responsive styling
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100px";
    this.canvas.style.display = "block";
    this.canvas.style.borderRadius = "12px";
    this.canvas.style.background = "var(--surface-color, rgba(0,0,0,0.05))";
    this.canvas.style.boxShadow = "inset 0 2px 5px rgba(0,0,0,0.1)";
    this.canvas.style.cursor = "pointer";

    // Mode switch button
    this.modeBtn = document.createElement("button");
    this.modeBtn.className = "visualizer-mode-btn";
    this.modeBtn.textContent = "Mode: Spectrum";
    this.modeBtn.style.position = "absolute";
    this.modeBtn.style.top = "8px";
    this.modeBtn.style.right = "8px";
    this.modeBtn.style.padding = "4px 8px";
    this.modeBtn.style.fontSize = "11px";
    this.modeBtn.style.background = "rgba(0,0,0,0.5)";
    this.modeBtn.style.color = "white";
    this.modeBtn.style.border = "none";
    this.modeBtn.style.borderRadius = "4px";
    this.modeBtn.style.cursor = "pointer";
    this.modeBtn.style.zIndex = "10";
    this.modeBtn.style.fontFamily = "'Inter', sans-serif";
    this.modeBtn.style.transition = "background 0.2s ease";
    
    this.modeBtn.addEventListener('mouseenter', () => this.modeBtn.style.background = "rgba(0,0,0,0.8)");
    this.modeBtn.addEventListener('mouseleave', () => this.modeBtn.style.background = "rgba(0,0,0,0.5)");

    this.container.appendChild(this.canvas);
    this.container.appendChild(this.modeBtn);

    if (this.audioElement.parentNode) {
      this.audioElement.parentNode.insertBefore(this.container, this.audioElement.nextSibling);
    }

    this.ctx = this.canvas.getContext("2d");
    
    // Web Audio API State
    this.audioCtx = null;
    this.analyser = null;
    this.source = null;
    this.dataArray = null;
    this.animationId = null;
    this.isInitialized = false;
    
    // Modes: 'spectrum', 'waveform', 'radial'
    this.modes = ['spectrum', 'waveform', 'radial'];
    this.currentModeIndex = 0;
    
    // Hover state
    this.hoverRatio = null;

    this.bindEvents();
    this.drawStaticWaiting();
  }

  initWebAudio() {
    if (this.isInitialized) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.analyser = this.audioCtx.createAnalyser();
      
      // Check if source was already created for this element elsewhere
      if (!this.audioElement._sourceNode) {
        this.source = this.audioCtx.createMediaElementSource(this.audioElement);
        this.audioElement._sourceNode = this.source;
      } else {
        this.source = this.audioElement._sourceNode;
      }
      
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
      
      this.analyser.fftSize = 2048; // Good resolution
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      this.isInitialized = true;
      
      // If audio context is in suspended state, resume it
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch (e) {
      console.error("Web Audio API Initialization failed:", e);
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  drawStaticWaiting() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    
    // Draw generic waveform placeholder to indicate it's an audio player
    this.ctx.fillStyle = "rgba(150, 150, 150, 0.3)";
    const numBars = 50;
    const barWidth = width / numBars;
    for (let i = 0; i < numBars; i++) {
      const barHeight = 10 + Math.sin(i * 0.5) * 10;
      const x = i * barWidth;
      const y = (height - barHeight) / 2;
      this.ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
    }
    
    this.ctx.fillStyle = "var(--text-muted, #888)";
    this.ctx.font = "bold 16px 'Inter', sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("Press Play to Visualize", width / 2, height / 2);
  }

  draw() {
    if (!this.isInitialized || !this.analyser) {
        this.drawStaticWaiting();
        return;
    }

    const { width, height } = this.canvas;
    this.animationId = requestAnimationFrame(() => this.draw());

    const mode = this.modes[this.currentModeIndex];

    this.ctx.clearRect(0, 0, width, height);

    // Draw background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    this.ctx.fillRect(0, 0, width, height);

    if (mode === 'spectrum') {
      this.analyser.getByteFrequencyData(this.dataArray);
      this.drawSpectrum(width, height);
    } else if (mode === 'waveform') {
      this.analyser.getByteTimeDomainData(this.dataArray);
      this.drawWaveform(width, height);
    } else if (mode === 'radial') {
      this.analyser.getByteFrequencyData(this.dataArray);
      this.drawRadial(width, height);
    }

    this.drawProgressBar(width, height);
  }

  drawSpectrum(width, height) {
    const bufferLength = this.analyser.frequencyBinCount;
    // We only care about the lower half of the frequencies visually for typical audio
    const renderLength = Math.floor(bufferLength * 0.5); 
    const barWidth = (width / renderLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < renderLength; i++) {
      barHeight = this.dataArray[i] * (height / 255) * 0.8; // Scale down slightly

      const r = barHeight + (25 * (i / renderLength));
      const g = 100 + (100 * (i / renderLength));
      const b = 250 - (100 * (i / renderLength));

      this.ctx.fillStyle = `rgb(${r},${g},${b})`;
      this.ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  drawWaveform(width, height) {
    const bufferLength = this.analyser.frequencyBinCount;
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = "var(--primary-color, #3498db)";
    this.ctx.beginPath();

    const sliceWidth = width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = this.dataArray[i] / 128.0; // 128 is center
      const y = v * height / 2;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.ctx.lineTo(width, height / 2);
    this.ctx.stroke();
  }

  drawRadial(width, height) {
    const bufferLength = this.analyser.frequencyBinCount;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.3;
    
    this.ctx.lineWidth = 2;
    const bars = 100; // Limit bars for cleaner look
    const step = Math.floor(bufferLength / bars);
    
    for (let i = 0; i < bars; i++) {
      const value = this.dataArray[i * step];
      const percent = value / 255;
      const barHeight = percent * (Math.min(centerX, centerY) - radius) * 0.8;
      
      const angle = (i * Math.PI * 2) / bars;
      
      const startX = centerX + Math.cos(angle) * radius;
      const startY = centerY + Math.sin(angle) * radius;
      
      const endX = centerX + Math.cos(angle) * (radius + barHeight);
      const endY = centerY + Math.sin(angle) * (radius + barHeight);
      
      const hue = i * (360 / bars);
      this.ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }
    
    // Draw center circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius - 2, 0, 2 * Math.PI);
    this.ctx.fillStyle = "rgba(0,0,0,0.2)";
    this.ctx.fill();
    this.ctx.strokeStyle = "rgba(255,255,255,0.5)";
    this.ctx.stroke();
  }

  drawProgressBar(width, height) {
    const progress = this.audioElement.duration ? this.audioElement.currentTime / this.audioElement.duration : 0;
    
    // Playback head line
    const headX = progress * width;
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    this.ctx.fillRect(headX - 1, 0, 2, height);
    
    // Overlay for played portion (subtle)
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    this.ctx.fillRect(0, 0, headX, height);
    
    // Time labels
    const curTime = this.formatTime(this.audioElement.currentTime);
    const durTime = this.formatTime(this.audioElement.duration);
    
    this.ctx.font = "bold 14px 'Inter', sans-serif";
    
    // Draw current time
    const curTimeWidth = this.ctx.measureText(curTime).width;
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    this.ctx.fillRect(8, height - 30, curTimeWidth + 16, 22);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(curTime, 16, height - 19);
    
    // Draw duration
    const durTimeWidth = this.ctx.measureText(durTime).width;
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    this.ctx.fillRect(width - durTimeWidth - 24, height - 30, durTimeWidth + 16, 22);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(durTime, width - 16, height - 19);

    // Hover Preview
    if (this.hoverRatio !== null && this.audioElement.duration) {
      const hoverX = this.hoverRatio * width;
      const hoverTimeSec = this.hoverRatio * this.audioElement.duration;
      const hoverTimeStr = this.formatTime(hoverTimeSec);
      
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      this.ctx.fillRect(hoverX, 0, 1, height);
      
      this.ctx.font = "bold 12px 'Inter', sans-serif";
      const ttWidth = this.ctx.measureText(hoverTimeStr).width;
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      this.ctx.fillRect(hoverX - (ttWidth/2) - 8, height - 30, ttWidth + 16, 22);
      this.ctx.fillStyle = "#ffffff";
      this.ctx.textAlign = "center";
      this.ctx.fillText(hoverTimeStr, hoverX, height - 19);
    }
  }

  bindEvents() {
    this.modeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentModeIndex = (this.currentModeIndex + 1) % this.modes.length;
      const newMode = this.modes[this.currentModeIndex];
      this.modeBtn.textContent = `Mode: ${newMode.charAt(0).toUpperCase() + newMode.slice(1)}`;
      
      // Force draw if paused to reflect mode change
      if (this.audioElement.paused && this.isInitialized) {
        cancelAnimationFrame(this.animationId);
        this.draw();
        cancelAnimationFrame(this.animationId);
      }
    });

    this.audioElement.addEventListener("play", () => {
      this.initWebAudio();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.draw();
    });
    
    this.audioElement.addEventListener("pause", () => {
      // Allow one more frame to render paused state, then stop loop
      setTimeout(() => cancelAnimationFrame(this.animationId), 50);
    });

    this.audioElement.addEventListener("ended", () => {
      setTimeout(() => cancelAnimationFrame(this.animationId), 50);
    });

    this.audioElement.addEventListener("timeupdate", () => {
       if (this.audioElement.paused && this.isInitialized) {
         // Redraw progress bar when seeking while paused
         cancelAnimationFrame(this.animationId);
         this.draw();
         cancelAnimationFrame(this.animationId);
       }
    });

    // Interaction Events
    let isDragging = false;
    
    const getRatioFromMouse = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      let x = e.clientX - rect.left;
      return Math.max(0, Math.min(x, rect.width)) / rect.width;
    };

    const updateTimeFromMouse = (e) => {
      if (!this.audioElement.duration) return;
      const clickRatio = getRatioFromMouse(e);
      this.audioElement.currentTime = clickRatio * this.audioElement.duration;
      if (this.audioElement.paused && this.isInitialized) {
         cancelAnimationFrame(this.animationId);
         this.draw();
         cancelAnimationFrame(this.animationId);
      }
    };

    this.canvas.addEventListener("mousedown", (e) => {
      isDragging = true;
      updateTimeFromMouse(e);
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.audioElement.duration) {
        this.hoverRatio = getRatioFromMouse(e);
        if (this.audioElement.paused && this.isInitialized) {
           cancelAnimationFrame(this.animationId);
           this.draw();
           cancelAnimationFrame(this.animationId);
        }
      }
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.hoverRatio = null;
      if (this.audioElement.paused && this.isInitialized) {
         cancelAnimationFrame(this.animationId);
         this.draw();
         cancelAnimationFrame(this.animationId);
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (isDragging) updateTimeFromMouse(e);
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Handle resize
    window.addEventListener("resize", () => {
      if (this.audioElement.paused && this.isInitialized) {
         cancelAnimationFrame(this.animationId);
         this.draw();
         cancelAnimationFrame(this.animationId);
      }
    });
  }
}

// Attach globally for dynamic integrations
window.setupAudioVisualizer = function(audioElement) {
  if (audioElement.dataset.visualizerInit === "true") return;
  audioElement.dataset.visualizerInit = "true";
  new AdvancedAudioVisualizer(audioElement);
};
