/**
 * Parampara P2P File Sharing Engine
 * Establishes WebRTC Data Channels for direct browser-to-browser media transfer.
 */

document.addEventListener('DOMContentLoaded', () => {
    const CHUNK_SIZE = 64 * 1024; // 64 KB
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8080`;
    
    let ws = null;
    let myNodeId = null;
    let peers = new Map(); // peerId -> RTCPeerConnection
    let dataChannels = new Map(); // peerId -> RTCDataChannel
    
    let selectedPeerId = null;
    let selectedFile = null;

    // UI Elements
    const myNodeIdEl = document.getElementById('my-node-id');
    const peersListEl = document.getElementById('peers-list');
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name-display');
    const selectedPeerDisplay = document.getElementById('selected-peer-display');
    const sendBtn = document.getElementById('send-file-btn');
    
    const progressArea = document.getElementById('transfer-progress-area');
    const activeTransferItem = document.getElementById('active-transfer-item');
    const transferFilename = document.getElementById('transfer-filename');
    const transferPercentage = document.getElementById('transfer-percentage');
    const transferProgressFill = document.getElementById('transfer-progress-fill');
    const transferSpeed = document.getElementById('transfer-speed');

    const receivedArea = document.getElementById('received-files-area');
    const receivedList = document.getElementById('received-files-list');

    const rtcConfig = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };

    // State for receiving files
    let receivingFiles = new Map(); // peerId -> { name, size, type, chunks, receivedBytes, startTime }

    // Initialize Connection
    function initSignaling() {
        ws = new ResilientWebSocket(wsUrl);
        
        ws.onopen = () => {
            console.log('Connected to Signaling Server for File Sharing');
            ws.send(JSON.stringify({ type: 'sync:join' }));
        };

        ws.onmessage = async (e) => {
            const message = JSON.parse(e.data);
            switch (message.type) {
                case 'init':
                    myNodeId = message.userId;
                    myNodeIdEl.textContent = myNodeId;
                    break;
                case 'sync:peers':
                    message.peers.forEach(peer => createPeerConnection(peer.userId, true, peer.username));
                    break;
                case 'sync:peer-joined':
                    createPeerConnection(message.userId, false, message.username);
                    break;
                case 'sync:peer-left':
                case 'user:left':
                    handlePeerDisconnected(message.userId);
                    break;
                case 'webrtc:offer':
                    await handleOffer(message.sourceId, message.offer);
                    break;
                case 'webrtc:answer':
                    await handleAnswer(message.sourceId, message.answer);
                    break;
                case 'webrtc:candidate':
                    await handleCandidate(message.sourceId, message.candidate);
                    break;
            }
        };
    }

    // WebRTC Logic
    function createPeerConnection(peerId, isCaller, username = 'Unknown') {
        if (peers.has(peerId)) return;

        const pc = new RTCPeerConnection(rtcConfig);
        peers.set(peerId, pc);
        
        pc.username = username; // store for UI

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                ws.send(JSON.stringify({
                    type: 'webrtc:candidate',
                    targetId: peerId,
                    candidate: event.candidate
                }));
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'connected') {
                updatePeersUI();
            } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                handlePeerDisconnected(peerId);
            }
        };

        if (isCaller) {
            const dc = pc.createDataChannel('file-transfer');
            setupDataChannel(peerId, dc);
            
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    ws.send(JSON.stringify({
                        type: 'webrtc:offer',
                        targetId: peerId,
                        offer: pc.localDescription
                    }));
                });
        } else {
            pc.ondatachannel = (event) => {
                setupDataChannel(peerId, event.channel);
            };
        }
        
        updatePeersUI();
    }

    function setupDataChannel(peerId, channel) {
        channel.binaryType = 'arraybuffer';
        dataChannels.set(peerId, channel);

        channel.onopen = () => {
            console.log(`Data channel with ${peerId} open`);
            updatePeersUI();
        };

        channel.onmessage = (event) => {
            handleDataChannelMessage(peerId, event.data);
        };
        
        channel.onclose = () => updatePeersUI();
    }

    async function handleOffer(peerId, offer) {
        let pc = peers.get(peerId);
        if (!pc) {
            createPeerConnection(peerId, false);
            pc = peers.get(peerId);
        }
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: 'webrtc:answer', targetId: peerId, answer: pc.localDescription }));
    }

    async function handleAnswer(peerId, answer) {
        const pc = peers.get(peerId);
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }

    async function handleCandidate(peerId, candidate) {
        const pc = peers.get(peerId);
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }

    function handlePeerDisconnected(peerId) {
        if (peers.has(peerId)) {
            peers.get(peerId).close();
            peers.delete(peerId);
        }
        if (dataChannels.has(peerId)) dataChannels.delete(peerId);
        if (selectedPeerId === peerId) {
            selectedPeerId = null;
            selectedPeerDisplay.textContent = 'Select a peer from the left to send.';
            sendBtn.disabled = true;
        }
        if (receivingFiles.has(peerId)) {
            receivingFiles.delete(peerId);
        }
        updatePeersUI();
    }

    // UI Updates
    function updatePeersUI() {
        if (peers.size === 0) {
            peersListEl.innerHTML = '<li class="empty-state" style="padding:15px; color:#7f8c8d;">No peers found on the network.</li>';
            return;
        }

        peersListEl.innerHTML = '';
        peers.forEach((pc, peerId) => {
            const dc = dataChannels.get(peerId);
            const isConnected = dc && dc.readyState === 'open';
            
            const li = document.createElement('li');
            li.className = `peer-item ${selectedPeerId === peerId ? 'selected' : ''}`;
            li.onclick = () => selectPeer(peerId);
            
            li.innerHTML = `
                <div class="peer-icon"><i class="ti ti-device-desktop"></i></div>
                <div class="peer-info">
                    <strong>Node ${peerId.slice(0, 8)}</strong>
                    <span class="peer-status ${isConnected ? 'connected' : ''}">
                        ${isConnected ? 'Ready for transfer' : 'Connecting...'}
                    </span>
                </div>
            `;
            peersListEl.appendChild(li);
        });
    }

    function selectPeer(peerId) {
        const dc = dataChannels.get(peerId);
        if (!dc || dc.readyState !== 'open') return;

        selectedPeerId = peerId;
        selectedPeerDisplay.innerHTML = `Sending to <strong>Node ${peerId.slice(0,8)}</strong>`;
        selectedPeerDisplay.style.color = '#2ecc71';
        checkSendReady();
        updatePeersUI();
    }

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            selectedFile = e.target.files[0];
            fileNameDisplay.innerHTML = `<i class="ti ti-file" style="font-size:1.5rem; margin-right:10px;"></i> ${selectedFile.name} (${(selectedFile.size / (1024*1024)).toFixed(2)} MB)`;
            checkSendReady();
        }
    });

    function checkSendReady() {
        if (selectedFile && selectedPeerId) {
            sendBtn.disabled = false;
        } else {
            sendBtn.disabled = true;
        }
    }

    // File Sending Logic
    sendBtn.addEventListener('click', async () => {
        if (!selectedFile || !selectedPeerId) return;
        
        const channel = dataChannels.get(selectedPeerId);
        if (!channel || channel.readyState !== 'open') return;

        // Send Metadata
        channel.send(JSON.stringify({
            type: 'FILE_META',
            name: selectedFile.name,
            size: selectedFile.size,
            fileType: selectedFile.type
        }));

        sendBtn.disabled = true;
        progressArea.style.display = 'block';
        transferFilename.textContent = `Sending: ${selectedFile.name}`;
        
        const startTime = Date.now();
        let offset = 0;

        const readSlice = (o) => {
            const slice = selectedFile.slice(offset, o + CHUNK_SIZE);
            const reader = new FileReader();
            reader.onload = (e) => {
                const buffer = e.target.result;
                
                // Backpressure handling
                if (channel.bufferedAmount > channel.bufferedAmountLowThreshold) {
                    channel.onbufferedamountlow = () => {
                        channel.onbufferedamountlow = null;
                        sendBufferAndContinue(buffer, o);
                    };
                } else {
                    sendBufferAndContinue(buffer, o);
                }
            };
            reader.readAsArrayBuffer(slice);
        };

        const sendBufferAndContinue = (buffer, o) => {
            try {
                channel.send(buffer);
                offset += buffer.byteLength;
                
                // Update UI Progress
                const percent = selectedFile.size > 0 ? ((offset / selectedFile.size) * 100).toFixed(1) : 100;
                transferPercentage.textContent = `${percent}%`;
                transferProgressFill.style.width = `${percent}%`;
                
                const elapsedMs = Math.max(Date.now() - startTime, 1);
                const speed = (offset / 1024) / (elapsedMs / 1000); // KB/s
                transferSpeed.textContent = `${speed.toFixed(0)} KB/s`;

                if (offset < selectedFile.size) {
                    readSlice(offset);
                } else {
                    channel.send(JSON.stringify({ type: 'FILE_END' }));
                    setTimeout(() => {
                        transferPercentage.textContent = '100% (Complete)';
                        sendBtn.disabled = false;
                        transferSpeed.textContent = 'Done';
                    }, 500);
                }
            } catch (err) {
                console.error("Error sending chunk", err);
                transferPercentage.textContent = 'Error sending chunk';
                sendBtn.disabled = false;
            }
        };

        // Initialize buffered amount threshold for backpressure
        channel.bufferedAmountLowThreshold = 65536; // 64KB
        readSlice(0);
    });

    // File Receiving Logic
    function handleDataChannelMessage(peerId, data) {
        if (typeof data === 'string') {
            const msg = JSON.parse(data);
            if (msg.type === 'FILE_META') {
                receivingFiles.set(peerId, {
                    name: msg.name,
                    size: msg.size,
                    type: msg.fileType,
                    chunks: [],
                    receivedBytes: 0,
                    startTime: Date.now()
                });
                
                progressArea.style.display = 'block';
                transferFilename.textContent = `Receiving: ${msg.name}`;
                transferPercentage.textContent = '0%';
                transferProgressFill.style.width = '0%';
                
            } else if (msg.type === 'FILE_END') {
                const fileObj = receivingFiles.get(peerId);
                if (fileObj) {
                    const blob = new Blob(fileObj.chunks, { type: fileObj.type });
                    const url = URL.createObjectURL(blob);
                    
                    receivedArea.style.display = 'block';
                    const div = document.createElement('div');
                    div.className = 'received-file';
                    div.innerHTML = `
                        <div style="margin-bottom: 8px;">
                            <strong>${fileObj.name}</strong> <span style="color:#7f8c8d; font-size:0.8rem;">(${(fileObj.size / (1024*1024)).toFixed(2)} MB)</span>
                        </div>
                        <div class="received-actions" style="display:flex; gap:10px;">
                            <a href="${url}" download="${fileObj.name}" class="download-btn btn-small"><i class="ti ti-download"></i> Save Local</a>
                            <button class="archive-btn btn-small" style="background:#2980b9; color:white; border:none; border-radius:4px; padding:5px 10px; cursor:pointer;"><i class="ti ti-cloud-upload"></i> Sync to Archive</button>
                        </div>
                    `;

                    const archiveBtn = div.querySelector('.archive-btn');
                    archiveBtn.addEventListener('click', () => {
                        syncToBackend(blob, fileObj, archiveBtn);
                    });

                    receivedList.prepend(div);
                    
                    receivingFiles.delete(peerId);
                    transferPercentage.textContent = '100% (Received)';
                }
            }
        } else {
            // Binary chunk
            const fileObj = receivingFiles.get(peerId);
            if (fileObj) {
                fileObj.chunks.push(data);
                fileObj.receivedBytes += data.byteLength;
                
                // Update UI Progress
                const percent = fileObj.size > 0 ? ((fileObj.receivedBytes / fileObj.size) * 100).toFixed(1) : 100;
                transferPercentage.textContent = `${percent}%`;
                transferProgressFill.style.width = `${percent}%`;
                
                const elapsedMs = Math.max(Date.now() - fileObj.startTime, 1);
                const speed = (fileObj.receivedBytes / 1024) / (elapsedMs / 1000); // KB/s
                transferSpeed.textContent = `${speed.toFixed(0)} KB/s`;
            }
        }
    }

    // Backend Synchronization Logic
    async function syncToBackend(blob, fileObj, btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = '<i class="ti ti-loader ti-spin"></i> Uploading...';
        
        try {
            // 1. Initialize Session
            const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB backend chunks
            const totalChunks = Math.ceil(fileObj.size / CHUNK_SIZE);
            
            const initRes = await fetch('/api/upload/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: fileObj.name,
                    fileSize: fileObj.size,
                    mimeType: fileObj.type,
                    totalChunks: totalChunks
                })
            });
            
            if (!initRes.ok) throw new Error('Failed to init upload');
            const { sessionId } = await initRes.json();
            
            // 2. Upload Chunks
            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, fileObj.size);
                const chunk = blob.slice(start, end);
                
                const uploadRes = await fetch(`/api/upload/chunk/${sessionId}/${i}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/octet-stream' },
                    body: chunk
                });
                
                if (!uploadRes.ok) throw new Error(`Failed to upload chunk ${i}`);
            }
            
            // 3. Complete Upload
            const completeRes = await fetch(`/api/upload/complete/${sessionId}`, { method: 'POST' });
            if (!completeRes.ok) throw new Error('Failed to complete upload');
            const { fileUrl } = await completeRes.json();
            
            // 4. Create Cultural Item
            let itemType = 'story';
            if (fileObj.type.startsWith('image/')) itemType = 'visual';
            if (fileObj.type.startsWith('video/')) itemType = 'visual';
            if (fileObj.type.startsWith('audio/')) itemType = 'audio';
            
            const itemRes = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: fileObj.name.split('.')[0],
                    type: itemType,
                    location: 'P2P Transfer',
                    description: 'Uploaded via Peer-to-Peer network.',
                    imageUrl: itemType === 'visual' ? fileUrl : '',
                    audioUrl: itemType === 'audio' ? fileUrl : '',
                    tags: ['p2p', 'community']
                })
            });
            
            if (!itemRes.ok) throw new Error('Failed to create cultural item');
            
            btnElement.style.background = '#27ae60';
            btnElement.innerHTML = '<i class="ti ti-check"></i> Archived!';
        } catch (err) {
            console.error('Sync Error:', err);
            btnElement.disabled = false;
            btnElement.style.background = '#e74c3c';
            btnElement.innerHTML = '<i class="ti ti-alert-triangle"></i> Failed. Retry?';
        }
    }

    // Start
    initSignaling();
});
