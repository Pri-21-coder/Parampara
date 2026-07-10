class ProgressiveVideoLoader {
    constructor(videoElement, videoSourceUrl, isSessionId = false) {
        this.video = videoElement;
        this.originalUrl = videoSourceUrl;
        
        // Build the backend stream URL
        this.streamUrl = isSessionId 
            ? `/api/video/stream?sessionId=${encodeURIComponent(videoSourceUrl)}`
            : `/api/video/stream?videoUrl=${encodeURIComponent(videoSourceUrl)}`;

        this.mediaSource = null;
        this.sourceBuffer = null;
        
        this.chunkSize = 1024 * 1024; // 1MB chunks
        this.currentByte = 0;
        this.totalBytes = 0;
        
        this.isFetching = false;
        this.isComplete = false;
        this.abortController = null;
        
        // UI Overlay
        this.setupUI();
        
        // Try MSE, fallback to native if unsupported/unfragmented
        this.initMSE();
    }

    setupUI() {
        this.container = document.createElement('div');
        this.container.style.position = 'relative';
        this.container.style.display = 'inline-block';
        
        this.video.parentNode.insertBefore(this.container, this.video);
        this.container.appendChild(this.video);
        
        this.progressOverlay = document.createElement('div');
        this.progressOverlay.style.position = 'absolute';
        this.progressOverlay.style.top = '10px';
        this.progressOverlay.style.right = '10px';
        this.progressOverlay.style.background = 'rgba(0,0,0,0.7)';
        this.progressOverlay.style.color = '#00ffcc';
        this.progressOverlay.style.padding = '5px 10px';
        this.progressOverlay.style.borderRadius = '20px';
        this.progressOverlay.style.fontSize = '12px';
        this.progressOverlay.style.fontFamily = 'monospace';
        this.progressOverlay.style.zIndex = '10';
        this.progressOverlay.style.transition = 'opacity 0.3s';
        this.progressOverlay.innerText = 'Initializing...';
        
        this.container.appendChild(this.progressOverlay);
    }

    updateUI(status, percent = null) {
        if (percent !== null) {
            this.progressOverlay.innerText = `${status} (${percent}%)`;
        } else {
            this.progressOverlay.innerText = status;
        }
        
        if (status === 'Ready' || status === 'Native Playback') {
            setTimeout(() => {
                this.progressOverlay.style.opacity = '0';
            }, 3000);
        } else {
            this.progressOverlay.style.opacity = '1';
        }
    }

    initMSE() {
        if (!window.MediaSource) {
            console.warn('MSE not supported. Falling back to native range requests.');
            this.fallbackToNative();
            return;
        }

        this.mediaSource = new MediaSource();
        this.video.src = URL.createObjectURL(this.mediaSource);

        this.mediaSource.addEventListener('sourceopen', async () => {
            try {
                // We use a highly compatible MP4 codec for MSE
                const mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
                if (!MediaSource.isTypeSupported(mimeCodec)) {
                    throw new Error('Codec not supported');
                }
                
                this.sourceBuffer = this.mediaSource.addSourceBuffer(mimeCodec);
                
                this.sourceBuffer.addEventListener('updateend', () => {
                    this.isFetching = false;
                    this.checkBufferAndFetch();
                });

                // Listen to timeupdate to buffer ahead
                this.video.addEventListener('timeupdate', () => this.checkBufferAndFetch());
                
                // Fetch first chunk to get total size and start playback
                await this.fetchNextChunk();
                
            } catch (err) {
                console.warn('MSE initialization failed, likely due to unfragmented MP4. Falling back.', err);
                this.fallbackToNative();
            }
        });
    }

    fallbackToNative() {
        if (this.abortController) {
            this.abortController.abort();
        }
        this.updateUI('Native Playback');
        // Pointing directly to our backend streaming API enables native HTTP Range requests
        // while still taking advantage of our backend proxy bandwidth optimizations!
        this.video.src = this.streamUrl;
    }

    async fetchNextChunk() {
        if (this.isFetching || this.isComplete) return;
        
        if (this.sourceBuffer && this.sourceBuffer.updating) return;

        this.isFetching = true;
        this.updateUI('Buffering...');
        this.abortController = new AbortController();

        const endByte = this.currentByte + this.chunkSize - 1;
        
        try {
            const response = await fetch(this.streamUrl, {
                headers: {
                    'Range': `bytes=${this.currentByte}-${endByte}`
                },
                signal: this.abortController.signal
            });

            if (response.status === 416) {
                // Requested range not satisfiable -> EOF
                this.isComplete = true;
                if (this.mediaSource && this.mediaSource.readyState === 'open') {
                    this.mediaSource.endOfStream();
                }
                this.updateUI('Ready', 100);
                this.isFetching = false;
                return;
            }
            
            if (response.status === 200) {
                console.warn('Server ignored Range header (returned 200 OK). Aborting MSE chunking and falling back to native.');
                this.abortController.abort();
                this.isFetching = false;
                this.fallbackToNative();
                return;
            }

            if (!response.ok && response.status !== 206) {
                throw new Error(`HTTP Error ${response.status}`);
            }

            // Parse Content-Range header to get total size
            const contentRange = response.headers.get('content-range');
            if (contentRange) {
                const match = contentRange.match(/\\/(\\d+)/);
                if (match) {
                    this.totalBytes = parseInt(match[1], 10);
                }
            }

            const buffer = await response.arrayBuffer();
            
            if (buffer.byteLength === 0) {
                this.isComplete = true;
                if (this.mediaSource.readyState === 'open') {
                    this.mediaSource.endOfStream();
                }
                this.updateUI('Ready', 100);
                this.isFetching = false;
                return;
            }

            this.currentByte += buffer.byteLength;
            
            // If MSE throws here, it's likely an unfragmented MP4. Catch and fallback.
            try {
                this.sourceBuffer.appendBuffer(buffer);
            } catch (appendErr) {
                console.warn('SourceBuffer append failed (likely unfragmented MP4):', appendErr);
                this.isFetching = false;
                this.fallbackToNative();
                return;
            }

            const percent = this.totalBytes ? Math.round((this.currentByte / this.totalBytes) * 100) : '?';
            this.updateUI('Ready', percent);

        } catch (err) {
            console.error('Progressive fetch error:', err);
            this.isFetching = false;
            this.fallbackToNative(); // Auto-recover
        }
    }

    checkBufferAndFetch() {
        if (!this.sourceBuffer || this.isComplete || this.isFetching) return;

        // Check how much is buffered ahead of current time
        const currentTime = this.video.currentTime;
        let bufferedEnd = 0;
        
        for (let i = 0; i < this.sourceBuffer.buffered.length; i++) {
            if (currentTime >= this.sourceBuffer.buffered.start(i) && currentTime <= this.sourceBuffer.buffered.end(i)) {
                bufferedEnd = this.sourceBuffer.buffered.end(i);
                break;
            }
        }

        // If we have less than 10 seconds buffered ahead, fetch next chunk
        if (bufferedEnd - currentTime < 10) {
            this.fetchNextChunk();
        }
    }
}

// Make globally available
window.ProgressiveVideoLoader = ProgressiveVideoLoader;
