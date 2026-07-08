const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const triviaQuestions = require('../../config/triviaData');

class CollaborativeMapServer {
  constructor(port = 8080) {
    this.wss = new WebSocket.Server({ port });
    this.wss.on('error', (err) => {
      console.error(`❌ WebSocket Server Error on port ${port}:`, err.message);
    });
    this.clients = new Map(); // userId -> { ws, username, cursor }
    this.markers = new Map(); // markerId -> marker data
    this.rooms = new Map(); // roomId -> Set of userIds
    this.operationHistory = [];
    this.moderationVotes = new Map(); // itemId -> Set of peerIds who voted (for real-time tracking)
    
    // Trivia Game State
    this.triviaGames = new Map(); // roomId -> game state
    // Deduplication across reconnections
    this.processedMessageIds = new Set();
    this.processedMessageQueue = [];
    
    this.setupWebSocket();
    console.log(`WebSocket server running on port ${port}`);
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const userId = uuidv4();
      const clientInfo = {
        ws,
        userId,
        username: `User${userId.slice(0, 6)}`,
        cursor: { x: 0, y: 0, lat: 0, lng: 0 },
        roomId: 'map-session',
        lastActive: Date.now()
      };

      this.clients.set(userId, clientInfo);
      
      // Send initial state to new client
      this.sendInitialState(ws, userId);
      
      // Broadcast new user to everyone else
      this.broadcastToRoom('map-session', {
        type: 'user:joined',
        userId,
        username: clientInfo.username,
        timestamp: new Date().toISOString()
      }, ws);

      // Handle messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          
          // Respond to application-level ping for health check
          if (message.type === 'ping') {
              ws.send(JSON.stringify({ type: 'pong' }));
              return;
          }

          // Global deduplication check (cross-connection)
          if (message.msgId) {
              if (this.processedMessageIds.has(message.msgId)) {
                  return; // Ignore duplicate message
              }
              this.processedMessageIds.add(message.msgId);
              this.processedMessageQueue.push(message.msgId);
              
              // Keep memory bounds strict (only track last 5000 messages globally)
              if (this.processedMessageQueue.length > 5000) {
                  const oldestId = this.processedMessageQueue.shift();
                  this.processedMessageIds.delete(oldestId);
              }
          }

          this.handleMessage(userId, message);
        } catch (error) {
          console.error('Error parsing message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.handleDisconnection(userId);
      });

      // Handle ping/pong for connection health
      ws.on('pong', () => {
        const client = this.clients.get(userId);
        if (client) {
          client.lastActive = Date.now();
        }
      });
    });
  }

  sendInitialState(ws, userId) {
    const markersArray = Array.from(this.markers.values());
    const clientsArray = Array.from(this.clients.values()).map(client => ({
      userId: client.userId,
      username: client.username,
      cursor: client.cursor
    }));

    ws.send(JSON.stringify({
      type: 'init',
      userId,
      markers: markersArray,
      clients: clientsArray,
      history: this.operationHistory.slice(-50) // Last 50 operations
    }));
  }

  handleMessage(userId, message) {
    const client = this.clients.get(userId);
    if (!client) return;

    switch (message.type) {
      case 'marker:add':
        this.handleAddMarker(userId, message.data);
        break;
      case 'marker:update':
        this.handleUpdateMarker(userId, message.data);
        break;
      case 'marker:delete':
        this.handleDeleteMarker(userId, message.data);
        break;
      case 'marker:move':
        this.handleMoveMarker(userId, message.data);
        break;
      case 'cursor:update':
        this.handleCursorUpdate(userId, message.data);
        break;
      case 'room:join':
        this.handleJoinRoom(userId, message.roomId);
        break;
      case 'request:history':
        this.handleHistoryRequest(userId, message.limit);
        break;
      // TRIVIA EVENTS
      case 'trivia:join':
        this.handleTriviaJoin(userId, message.roomId, message.username);
        break;
      case 'trivia:start':
        this.handleTriviaStart(message.roomId);
        break;
      case 'trivia:answer':
        this.handleTriviaAnswer(userId, message.roomId, message.answerIndex, message.timeTaken);
        break;
      // WEBRTC SYNC SIGNALING
      case 'sync:join':
        this.handleSyncJoin(userId);
        break;
      case 'webrtc:offer':
      case 'webrtc:answer':
      case 'webrtc:candidate':
        this.handleWebRTCSignaling(userId, message);
        break;
      // MODERATION CONSENSUS
      case 'moderation:join':
        this.handleModerationJoin(userId, message.username);
        break;
      case 'moderation:request':
        this.handleModerationRequest(userId, message.data);
        break;
      case 'moderation:vote-broadcast':
        this.handleModerationVoteBroadcast(userId, message.data);
        break;
      default:
        client.ws.send(JSON.stringify({
          type: 'error',
          message: `Unknown message type: ${message.type}`
        }));
    }
  }

  handleAddMarker(userId, markerData) {
    const markerId = markerData.id || uuidv4();
    const marker = {
      id: markerId,
      ...markerData,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    this.markers.set(markerId, marker);
    this.addOperationHistory({
      type: 'marker:add',
      userId,
      data: marker,
      timestamp: new Date().toISOString()
    });

    this.broadcastToRoom('map-session', {
      type: 'marker:added',
      marker,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  handleUpdateMarker(userId, { markerId, updates, version }) {
    const marker = this.markers.get(markerId);
    if (!marker) {
      this.sendError(userId, `Marker ${markerId} not found`);
      return;
    }

    // Conflict detection
    if (version && marker.version !== version) {
      this.sendConflictResolution(userId, marker);
      return;
    }

    // Update marker
    const updatedMarker = {
      ...marker,
      ...updates,
      updatedAt: new Date().toISOString(),
      version: marker.version + 1
    };

    this.markers.set(markerId, updatedMarker);
    this.addOperationHistory({
      type: 'marker:update',
      userId,
      data: { markerId, updates, version: updatedMarker.version },
      timestamp: new Date().toISOString()
    });

    this.broadcastToRoom('map-session', {
      type: 'marker:updated',
      markerId,
      updates,
      userId,
      version: updatedMarker.version,
      timestamp: new Date().toISOString()
    });
  }

  handleDeleteMarker(userId, { markerId }) {
    if (this.markers.has(markerId)) {
      this.markers.delete(markerId);
      this.addOperationHistory({
        type: 'marker:delete',
        userId,
        data: { markerId },
        timestamp: new Date().toISOString()
      });

      this.broadcastToRoom('map-session', {
        type: 'marker:deleted',
        markerId,
        userId,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleMoveMarker(userId, { markerId, lat, lng }) {
    const marker = this.markers.get(markerId);
    if (marker) {
      const updatedMarker = {
        ...marker,
        coordinates: { lat, lng },
        updatedAt: new Date().toISOString(),
        version: marker.version + 1
      };
      this.markers.set(markerId, updatedMarker);
      
      this.broadcastToRoom('map-session', {
        type: 'marker:moved',
        markerId,
        lat,
        lng,
        userId,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleCursorUpdate(userId, { lat, lng, x, y }) {
    const client = this.clients.get(userId);
    if (client) {
      client.cursor = { lat, lng, x, y, lastUpdate: Date.now() };
      
      this.broadcastToRoom('map-session', {
        type: 'cursor:updated',
        userId,
        cursor: client.cursor,
        username: client.username,
        timestamp: new Date().toISOString()
      }, client.ws);
    }
  }

  handleJoinRoom(userId, roomId) {
    const client = this.clients.get(userId);
    if (!client) return;

    // Leave current room
    const currentRoom = client.roomId;
    if (currentRoom && this.rooms.has(currentRoom)) {
      this.rooms.get(currentRoom).delete(userId);
    }

    // Join new room
    client.roomId = roomId;
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(userId);

    // Send room data to client
    const roomMarkers = Array.from(this.markers.values())
      .filter(m => m.roomId === roomId);
    
    client.ws.send(JSON.stringify({
      type: 'room:joined',
      roomId,
      markers: roomMarkers,
      clients: Array.from(this.rooms.get(roomId))
    }));
  }

  handleHistoryRequest(userId, limit = 50) {
    const client = this.clients.get(userId);
    if (client) {
      const history = this.operationHistory.slice(-limit);
      client.ws.send(JSON.stringify({
        type: 'history:response',
        history,
        count: history.length
      }));
    }
  }

  // ==================== TRIVIA GAME LOGIC ====================

  handleTriviaJoin(userId, roomId, username) {
    const client = this.clients.get(userId);
    if (!client) return;

    client.username = username || client.username;
    this.handleJoinRoom(userId, roomId);

    if (!this.triviaGames.has(roomId)) {
      this.triviaGames.set(roomId, {
        state: 'waiting', // waiting, playing, ended
        currentQuestionIndex: -1,
        scores: {}, // userId -> score
        answers: {}, // userId -> answered this round?
        questions: this.shuffleArray([...triviaQuestions]).slice(0, 5) // 5 random questions
      });
    }

    const game = this.triviaGames.get(roomId);
    if (!game.scores[userId]) {
      game.scores[userId] = 0;
    }

    // Broadcast updated lobby
    this.broadcastTriviaState(roomId);
  }

  handleTriviaStart(roomId) {
    const game = this.triviaGames.get(roomId);
    if (!game || game.state === 'playing') return;

    game.state = 'playing';
    game.currentQuestionIndex = -1;
    game.scores = {}; // Reset scores for all players in room
    this.rooms.get(roomId).forEach(uid => game.scores[uid] = 0);

    this.nextTriviaQuestion(roomId);
  }

  nextTriviaQuestion(roomId) {
    const game = this.triviaGames.get(roomId);
    if (!game) return;

    game.currentQuestionIndex++;
    game.answers = {}; // Reset answers for the new round

    if (game.currentQuestionIndex >= game.questions.length) {
      game.state = 'ended';
      this.broadcastTriviaState(roomId);
      return;
    }

    const currentQ = game.questions[game.currentQuestionIndex];
    
    // Broadcast question (without the correct answer)
    this.broadcastToRoom(roomId, {
      type: 'trivia:question',
      question: {
        id: currentQ.id,
        question: currentQ.question,
        options: currentQ.options,
        time: currentQ.time
      },
      questionNumber: game.currentQuestionIndex + 1,
      totalQuestions: game.questions.length
    });

    // Set a timer to automatically move to the next question
    if (game.timer) clearTimeout(game.timer);
    
    game.timer = setTimeout(() => {
      // Time is up! Broadcast correct answer and leaderboard
      this.broadcastToRoom(roomId, {
        type: 'trivia:round_end',
        correctAnswer: currentQ.correct,
        scores: this.getLeaderboard(roomId)
      });

      // Wait 5 seconds before the next question
      setTimeout(() => this.nextTriviaQuestion(roomId), 5000);
    }, currentQ.time * 1000);
  }

  handleTriviaAnswer(userId, roomId, answerIndex, timeTaken) {
    const game = this.triviaGames.get(roomId);
    if (!game || game.state !== 'playing' || game.answers[userId]) return;

    const currentQ = game.questions[game.currentQuestionIndex];
    if (currentQ.correct === answerIndex) {
      // Base points + speed bonus
      const maxTime = currentQ.time * 1000;
      const timeRemaining = Math.max(0, maxTime - timeTaken);
      const points = 10 + Math.floor((timeRemaining / maxTime) * 10);
      game.scores[userId] = (game.scores[userId] || 0) + points;
    }

    game.answers[userId] = true;

    // Check if everyone answered
    const roomUsers = Array.from(this.rooms.get(roomId) || []);
    const allAnswered = roomUsers.every(uid => game.answers[uid]);

    if (allAnswered && game.timer) {
      clearTimeout(game.timer); // Skip the rest of the wait time
      
      this.broadcastToRoom(roomId, {
        type: 'trivia:round_end',
        correctAnswer: currentQ.correct,
        scores: this.getLeaderboard(roomId)
      });

      setTimeout(() => this.nextTriviaQuestion(roomId), 5000);
    }
  }

  getLeaderboard(roomId) {
    const game = this.triviaGames.get(roomId);
    if (!game) return [];
    
    return Object.entries(game.scores)
      .map(([userId, score]) => {
        const client = this.clients.get(userId);
        return {
          userId,
          username: client ? client.username : 'Unknown',
          score
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  broadcastTriviaState(roomId) {
    const game = this.triviaGames.get(roomId);
    if (!game) return;

    this.broadcastToRoom(roomId, {
      type: 'trivia:state',
      state: game.state,
      leaderboard: this.getLeaderboard(roomId)
    });
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  // ==========================================================

  sendConflictResolution(userId, marker) {
    const client = this.clients.get(userId);
    if (client) {
      client.ws.send(JSON.stringify({
        type: 'conflict:resolution',
        marker,
        message: 'Conflict detected. Please review changes.',
        timestamp: new Date().toISOString()
      }));
    }
  }

  sendError(userId, message) {
    const client = this.clients.get(userId);
    if (client) {
      client.ws.send(JSON.stringify({
        type: 'error',
        message,
        timestamp: new Date().toISOString()
      }));
    }
  }

  broadcastToRoom(roomId, data, excludeWs = null) {
    if (!this.rooms.has(roomId)) return;

    const message = JSON.stringify(data);
    this.rooms.get(roomId).forEach(userId => {
      const client = this.clients.get(userId);
      if (client && client.ws !== excludeWs && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  addOperationHistory(operation) {
    this.operationHistory.push(operation);
    // Keep only last 1000 operations to prevent memory issues
    if (this.operationHistory.length > 1000) {
      this.operationHistory.shift();
    }
  }

  // ==================== MODERATION CONSENSUS ====================

  handleModerationJoin(userId, username) {
    const client = this.clients.get(userId);
    if (!client) return;

    if (username) client.username = username;

    const roomId = 'moderation-room';
    if (!this.rooms.has(roomId)) this.rooms.set(roomId, new Set());
    this.rooms.get(roomId).add(userId);
    client.roomId = roomId;

    // Inform the joining peer of existing moderators
    const peers = Array.from(this.rooms.get(roomId))
      .filter(id => id !== userId)
      .map(id => {
        const c = this.clients.get(id);
        return { userId: id, username: c ? c.username : 'Unknown' };
      });

    client.ws.send(JSON.stringify({
      type: 'moderation:joined',
      userId,
      peers,
      timestamp: new Date().toISOString()
    }));

    // Broadcast new moderator to others
    this.broadcastToRoom(roomId, {
      type: 'moderation:peer-joined',
      userId,
      username: client.username,
      timestamp: new Date().toISOString()
    }, client.ws);
  }

  handleModerationRequest(userId, data) {
    // Broadcast a new submission to all moderators so they can review it
    this.broadcastToRoom('moderation-room', {
      type: 'moderation:new-item',
      data,
      fromUserId: userId,
      timestamp: new Date().toISOString()
    });
  }

  handleModerationVoteBroadcast(userId, data) {
    // Relay a vote result to all connected moderators for live UI update
    this.broadcastToRoom('moderation-room', {
      type: 'moderation:vote-update',
      data,
      fromUserId: userId,
      timestamp: new Date().toISOString()
    }, this.clients.get(userId)?.ws);
  }

  // ==================== WEBSOCKET SYNC NETWORK ====================

  handleSyncJoin(userId) {
    const client = this.clients.get(userId);
    if (!client) return;

    // Put client in sync room
    const roomId = 'sync-network';
    client.roomId = roomId;

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(userId);

    // Get all peers in sync network
    const peers = Array.from(this.rooms.get(roomId))
      .filter(id => id !== userId) // exclude self
      .map(id => {
        const c = this.clients.get(id);
        return { userId: id, username: c ? c.username : 'Unknown' };
      });

    // Send the current peer list to the joining node
    client.ws.send(JSON.stringify({
      type: 'sync:peers',
      peers
    }));

    // Broadcast to other peers that this node joined
    this.broadcastToRoom(roomId, {
      type: 'sync:peer-joined',
      userId,
      username: client.username
    }, client.ws);
  }

  handleWebRTCSignaling(sourceUserId, message) {
    const { targetId } = message;
    if (!targetId) return;

    const targetClient = this.clients.get(targetId);
    if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
      // Relay the signaling message to the target client exactly as is, 
      // but inject the sourceUserId so the target knows who sent it
      targetClient.ws.send(JSON.stringify({
        ...message,
        sourceId: sourceUserId
      }));
    }
  }

  handleDisconnection(userId) {
    const client = this.clients.get(userId);
    if (client) {
      // Remove from room
      if (client.roomId && this.rooms.has(client.roomId)) {
        this.rooms.get(client.roomId).delete(userId);
      }

      this.clients.delete(userId);

      // Broadcast user left
      if (client.roomId === 'map-session') {
        this.broadcastToRoom('map-session', {
          type: 'user:left',
          userId,
          timestamp: new Date().toISOString()
        });
      } else if (client.roomId && this.triviaGames.has(client.roomId)) {
        this.broadcastTriviaState(client.roomId);
      }
    }
  }

  getStats() {
    return {
      totalClients: this.clients.size,
      totalMarkers: this.markers.size,
      totalRooms: this.rooms.size,
      totalHistory: this.operationHistory.length
    };
  }
}

// Start server if run directly
if (require.main === module) {
  const wsServer = new CollaborativeMapServer(process.env.WS_PORT || 8080);
  setInterval(() => {
    const stats = wsServer.getStats();
    console.log('WebSocket Server Stats:', stats);
  }, 30000);
}

module.exports = CollaborativeMapServer;