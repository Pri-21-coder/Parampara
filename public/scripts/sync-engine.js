/**
 * Decentralized Local Device Synchronization Engine via WebRTC
 * Manages signaling, peer-to-peer connections, and data transfer.
 */

class SyncEngine {
    constructor(serverUrl) {
        this.serverUrl = serverUrl;
        this.ws = null;
        this.myUserId = null;
        
        // Peer connections: map of peerId -> RTCPeerConnection
        this.peers = new Map();
        
        // Data channels: map of peerId -> RTCDataChannel
        this.dataChannels = new Map();
        
        this.localDataHash = null; // Used to check if we actually need to sync
        
        this.onPeerDiscovered = null;
        this.onPeerConnected = null;
        this.onPeerDisconnected = null;
        this.onSyncProgress = null;
        this.onSyncComplete = null;
        
        // WebRTC configuration (STUN servers for NAT traversal, mostly for local dev we don't strictly need it but good practice)
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };
    }

    start() {
        console.log(`Starting Sync Engine connecting to ${this.serverUrl}`);
        this.ws = new ResilientWebSocket(this.serverUrl);

        this.ws.onopen = () => {
            console.log('Connected to Signaling Server');
            // Request to join the sync network
            this.ws.send(JSON.stringify({ type: 'sync:join' }));
        };

        this.ws.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            await this.handleSignalingMessage(message);
        };

        this.ws.onclose = () => {
            console.log('Disconnected from Signaling Server');
            // Optional: Implement reconnect logic
        };
    }

    async handleSignalingMessage(message) {
        switch (message.type) {
            case 'init':
                this.myUserId = message.userId;
                console.log(`My Node ID: ${this.myUserId}`);
                break;
                
            case 'sync:peers':
                // Existing peers in network
                message.peers.forEach(peer => {
                    if (this.onPeerDiscovered) this.onPeerDiscovered(peer);
                    // Initiate WebRTC connection as the "caller"
                    this.createPeerConnection(peer.userId, true);
                });
                break;

            case 'sync:peer-joined':
                // New peer joined
                if (this.onPeerDiscovered) this.onPeerDiscovered({ userId: message.userId, username: message.username });
                // We don't initiate here. We let the new peer initiate to avoid glare.
                this.createPeerConnection(message.userId, false);
                break;

            case 'sync:peer-left':
            case 'user:left':
                this.handlePeerDisconnected(message.userId);
                break;

            case 'webrtc:offer':
                await this.handleOffer(message.sourceId, message.offer);
                break;

            case 'webrtc:answer':
                await this.handleAnswer(message.sourceId, message.answer);
                break;

            case 'webrtc:candidate':
                await this.handleCandidate(message.sourceId, message.candidate);
                break;
        }
    }

    createPeerConnection(peerId, isCaller) {
        if (this.peers.has(peerId)) return;

        const pc = new RTCPeerConnection(this.rtcConfig);
        this.peers.set(peerId, pc);

        // Send ICE candidates to the signaling server
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.ws.send(JSON.stringify({
                    type: 'webrtc:candidate',
                    targetId: peerId,
                    candidate: event.candidate
                }));
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`Connection state with ${peerId}: ${pc.connectionState}`);
            if (pc.connectionState === 'connected') {
                if (this.onPeerConnected) this.onPeerConnected(peerId);
            } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                this.handlePeerDisconnected(peerId);
            }
        };

        // If caller, create the data channel
        if (isCaller) {
            const dataChannel = pc.createDataChannel('parampara-sync');
            this.setupDataChannel(peerId, dataChannel);

            // Create offer
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    this.ws.send(JSON.stringify({
                        type: 'webrtc:offer',
                        targetId: peerId,
                        offer: pc.localDescription
                    }));
                })
                .catch(err => console.error("Error creating offer", err));
        } else {
            // Wait for data channel
            pc.ondatachannel = (event) => {
                this.setupDataChannel(peerId, event.channel);
            };
        }
    }

    setupDataChannel(peerId, channel) {
        this.dataChannels.set(peerId, channel);

        channel.onopen = () => {
            console.log(`Data channel with ${peerId} opened!`);
            // Initiate Sync Protocol
            this.initiateSyncProtocol(peerId, channel);
        };

        channel.onmessage = (event) => {
            this.handleDataChannelMessage(peerId, event.data);
        };

        channel.onclose = () => {
            console.log(`Data channel with ${peerId} closed.`);
        };
    }

    async handleOffer(peerId, offer) {
        let pc = this.peers.get(peerId);
        if (!pc) {
            this.createPeerConnection(peerId, false);
            pc = this.peers.get(peerId);
        }

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            this.ws.send(JSON.stringify({
                type: 'webrtc:answer',
                targetId: peerId,
                answer: pc.localDescription
            }));
        } catch (e) {
            console.error('Error handling offer:', e);
        }
    }

    async handleAnswer(peerId, answer) {
        const pc = this.peers.get(peerId);
        if (pc) {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (e) {
                console.error('Error handling answer:', e);
            }
        }
    }

    async handleCandidate(peerId, candidate) {
        const pc = this.peers.get(peerId);
        if (pc) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error('Error handling candidate:', e);
            }
        }
    }

    handlePeerDisconnected(peerId) {
        if (this.peers.has(peerId)) {
            this.peers.get(peerId).close();
            this.peers.delete(peerId);
        }
        if (this.dataChannels.has(peerId)) {
            this.dataChannels.delete(peerId);
        }
        if (this.onPeerDisconnected) {
            this.onPeerDisconnected(peerId);
        }
    }

    // ==================== SYNC PROTOCOL ====================

    async initiateSyncProtocol(peerId, channel) {
        // Fetch local items to check their version/timestamp
        try {
            const res = await fetch('/api/items');
            const localItems = await res.json();
            
            // Just send metadata of what we have
            const metadata = localItems.map(item => ({
                id: item.id,
                title: item.title,
                timestamp: item.timestamp
            }));

            channel.send(JSON.stringify({
                type: 'SYNC_METADATA',
                payload: metadata
            }));
            
            if (this.onSyncProgress) this.onSyncProgress(peerId, 'Metadata sent, waiting for diff...');

        } catch (error) {
            console.error("Failed to fetch local items for sync", error);
        }
    }

    async handleDataChannelMessage(peerId, rawData) {
        try {
            const message = JSON.parse(rawData);
            
            switch (message.type) {
                case 'SYNC_METADATA':
                    await this.handlePeerMetadata(peerId, message.payload);
                    break;
                case 'SYNC_REQUEST_ITEMS':
                    await this.sendRequestedItems(peerId, message.payload);
                    break;
                case 'SYNC_DATA':
                    await this.receiveAndMergeData(peerId, message.payload);
                    break;
                case 'SYNC_COMPLETE':
                    console.log(`Sync with ${peerId} complete.`);
                    if (this.onSyncComplete) this.onSyncComplete(peerId);
                    break;
            }
        } catch (error) {
            console.error("Data channel message error:", error);
        }
    }

    async handlePeerMetadata(peerId, peerMetadata) {
        // Compare peer's metadata with local data
        const res = await fetch('/api/items');
        const localItems = await res.json();
        
        const localIds = new Set(localItems.map(item => item.id));
        
        // Find items the peer has that we DON'T have
        const missingItems = peerMetadata.filter(peerItem => !localIds.has(peerItem.id));
        
        const channel = this.dataChannels.get(peerId);
        if (missingItems.length > 0) {
            console.log(`Found ${missingItems.length} missing items from peer ${peerId}. Requesting...`);
            if (this.onSyncProgress) this.onSyncProgress(peerId, `Requesting ${missingItems.length} items...`);
            
            channel.send(JSON.stringify({
                type: 'SYNC_REQUEST_ITEMS',
                payload: missingItems.map(item => item.id)
            }));
        } else {
            console.log(`Local data is up to date with peer ${peerId}.`);
            if (this.onSyncProgress) this.onSyncProgress(peerId, 'Up to date');
            channel.send(JSON.stringify({ type: 'SYNC_COMPLETE' }));
            if (this.onSyncComplete) this.onSyncComplete(peerId);
        }
    }

    async sendRequestedItems(peerId, requestedIds) {
        // Peer requested specific items, send full data blobs
        const res = await fetch('/api/items');
        const localItems = await res.json();
        
        const itemsToSend = localItems.filter(item => requestedIds.includes(item.id));
        
        const channel = this.dataChannels.get(peerId);
        if (channel && itemsToSend.length > 0) {
            if (this.onSyncProgress) this.onSyncProgress(peerId, `Sending ${itemsToSend.length} items...`);
            channel.send(JSON.stringify({
                type: 'SYNC_DATA',
                payload: itemsToSend
            }));
        }
    }

    async receiveAndMergeData(peerId, itemsToMerge) {
        console.log(`Received ${itemsToMerge.length} new items via WebRTC from ${peerId}. Merging...`);
        if (this.onSyncProgress) this.onSyncProgress(peerId, `Merging ${itemsToMerge.length} items...`);
        
        let mergedCount = 0;

        for (const item of itemsToMerge) {
            try {
                // Post to local backend
                const res = await fetch('/api/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item) // Note: backend creates IDs for new ones, but ideally it keeps the same ID to prevent duplication
                });
                
                if (res.ok) {
                    mergedCount++;
                }
            } catch (err) {
                console.error("Failed to merge item:", err);
            }
        }
        
        console.log(`Successfully merged ${mergedCount} items!`);
        
        const channel = this.dataChannels.get(peerId);
        if (channel) {
            channel.send(JSON.stringify({ type: 'SYNC_COMPLETE' }));
        }
        if (this.onSyncComplete) this.onSyncComplete(peerId);
    }
}
