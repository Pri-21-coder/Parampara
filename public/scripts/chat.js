/**
 * Parampara - AI Chat Assistant (Talk to Elder)
 * Client-side script handling interactive chat virtual DOM rendering,
 * rate limiting, and server messaging.
 */

(function () {
  // --- Private State variables ---
  let chatLimiterInstance = null;
  let isSendingMessage = false;
  let limitFeedbackTimer = null;
  let botTypingState = false;
  let lastVirtualTree = null;
  let chatViewportNode = null;

  // Initial chat history structure with default welcome message
  let chatMessageHistory = [
    {
      id: 'welcome_message',
      authorType: 'bot',
      messageText: "Namaste! I'm a cultural curator who has learned from all the stories in our archive. Ask me about rural traditions, why people paint their doors blue, the meaning behind Kantha embroidery, or any village festival. What would you like to know?"
    }
  ];

  // --- Virtual DOM Components ---
  
  /**
   * Message Bubble Component
   * Renders single message bubble (bot or user)
   */
  const ChatMessageBubble = ({ messageItem }) => {
    const { h } = window.vdom;
    const authorAvatar = messageItem.authorType === 'bot' ? '👴' : '👤';
    const messageClass = `message ${messageItem.authorType}-message`;
    
    return h('div', { class: messageClass, key: messageItem.id },
      h('div', { class: 'message-avatar' }, authorAvatar),
      h('div', { class: 'message-content' }, 
        h('p', {}, messageItem.messageText)
      )
    );
  };

  /**
   * Thinking/Typing Indicator Component (Animated Dots)
   */
  const ChatTypingIndicator = () => {
    const { h } = window.vdom;
    return h('div', { class: 'skeleton-chat-bubble skeleton-root-element skeleton-delay-1 anim-shimmer', id: 'typing-indicator', key: 'typing_bubble' },
      h('div', { class: 'skeleton skeleton-avatar-small' }, ''),
      h('div', { class: 'skeleton-chat-content' }, 
        h('div', { class: 'skeleton skeleton-text', style: 'width: 80%' }, ''),
        h('div', { class: 'skeleton skeleton-text', style: 'width: 60%' }, ''),
        h('div', { class: 'skeleton skeleton-text', style: 'width: 40%' }, '')
      )
    );
  };

  // --- Virtual DOM Rendering Pipeline ---

  /**
   * Refreshes and updates chat user interface using Virtual DOM
   */
  function refreshChatView() {
    if (!window.vdom) {
      console.warn('[Parampara Chat] VDOM engine not found.');
      return;
    }
    
    const { h, diff, scheduleUpdate, render: vdomRender } = window.vdom;
    
    if (!chatViewportNode) {
      chatViewportNode = document.getElementById('chat-messages');
    }

    scheduleUpdate(() => {
      // Build virtual nodes array from state
      const virtualMessageNodes = chatMessageHistory.map(msg => 
        h(ChatMessageBubble, { messageItem: msg, key: msg.id })
      );

      // Append typing bubble if bot is currently thinking
      if (botTypingState) {
        virtualMessageNodes.push(h(ChatTypingIndicator, { key: 'typing_bubble' }));
      }

      // Root tree wrapper
      const currentVirtualTree = h(
        'div', 
        { id: 'chat-messages', class: 'chat-messages', key: 'chat-container-root' }, 
        ...virtualMessageNodes
      );

      // Patch the DOM
      if (!lastVirtualTree) {
        const compiledDOM = vdomRender(currentVirtualTree);
        chatViewportNode.replaceWith(compiledDOM);
        chatViewportNode = compiledDOM;
      } else {
        const renderStart = performance.now();
        const updatedDOM = diff(chatViewportNode, lastVirtualTree, currentVirtualTree);
        if (updatedDOM) {
          chatViewportNode = updatedDOM;
        }
        const renderEnd = performance.now();
        console.log(`[VDOM Patch] Completed in ${(renderEnd - renderStart).toFixed(2)}ms`);
      }
      
      lastVirtualTree = currentVirtualTree;
      scrollToActiveContent();
    });
  }

  // --- Scrolling Pipeline ---

  /**
   * Smoothly scrolls the chat history panel to show the latest messages.
   * If a user clicks a suggestion chip, it also aligns the chatbox in the window.
   */
  function scrollToActiveContent() {
    if (!chatViewportNode) return;
    
    // 1. Scroll chat message inner viewport to show the new message
    chatViewportNode.scrollTo({
      top: chatViewportNode.scrollHeight,
      behavior: 'smooth'
    });

    // 2. Scroll the window to center the chat window for better view focus
    const chatInterface = document.querySelector('.chat-interface');
    if (chatInterface) {
      chatInterface.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }

  // --- Core Action & Event Handlers ---

  /**
   * Sends user message to the server API and handles bot response
   */
  async function submitUserMessage() {
    if (isSendingMessage) return;

    const chatInputField = document.getElementById('chat-input');
    const sendButtonElement = document.getElementById('send-btn');
    const rateLimitFeedback = document.getElementById('chat-feedback');
    const userQueryText = chatInputField.value.trim();

    if (!userQueryText) return;

    // Check rate limit constraints
    if (chatLimiterInstance) {
      const limitStatus = chatLimiterInstance.check();
      if (!limitStatus.allowed) {
        chatInputField.disabled = true;
        sendButtonElement.disabled = true;
        sendButtonElement.classList.add('btn-disabled');
        rateLimitFeedback.style.display = 'block';
        
        let secondsRemaining = Math.ceil(limitStatus.remainingMs / 1000);
        rateLimitFeedback.textContent = `Rate limit exceeded. Please wait ${secondsRemaining}s...`;
        
        if (limitFeedbackTimer) clearInterval(limitFeedbackTimer);
        
        limitFeedbackTimer = setInterval(() => {
          secondsRemaining--;
          if (secondsRemaining <= 0) {
            clearInterval(limitFeedbackTimer);
            chatInputField.disabled = false;
            sendButtonElement.disabled = false;
            sendButtonElement.classList.remove('btn-disabled');
            rateLimitFeedback.style.display = 'none';
          } else {
            rateLimitFeedback.textContent = `Rate limit exceeded. Please wait ${secondsRemaining}s...`;
          }
        }, 1000);
        return;
      }
    }

    isSendingMessage = true;
    chatInputField.disabled = true;
    sendButtonElement.disabled = true;
    
    // Add user message to history state
    appendMessageToHistory(userQueryText, 'user');
    chatInputField.value = '';

    // Show typing bubble
    const typingIndicatorToken = activateTypingState();

    // Scroll window/chat view to focus immediately on typing state
    setTimeout(scrollToActiveContent, 50);

    try {
      const serverResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userQueryText }),
      });

      const responsePayload = await serverResponse.json();

      // Clear typing indicator
      deactivateTypingState(typingIndicatorToken);

      // Append chat message response
      appendMessageToHistory(responsePayload.response, 'bot');
      
      // Auto scroll to response
      setTimeout(scrollToActiveContent, 50);
    } catch (fetchError) {
      console.error('[Parampara Chat] Network communication failure:', fetchError);
      deactivateTypingState(typingIndicatorToken);
      appendMessageToHistory(
        "I apologize, but I'm having trouble connecting right now. Please try again later.",
        'bot'
      );
      setTimeout(scrollToActiveContent, 50);
    } finally {
      isSendingMessage = false;
      
      // Restore input states if not blocked by active rate-limiter timer
      const currentFeedback = document.getElementById('chat-feedback');
      if (currentFeedback.style.display === 'none' || currentFeedback.style.display === '') {
        const inputField = document.getElementById('chat-input');
        const submitBtn = document.getElementById('send-btn');
        if (inputField) {
          inputField.disabled = false;
          inputField.focus();
        }
        if (submitBtn) {
          submitBtn.disabled = false;
        }
      }
    }
  }

  /**
   * Appends messages to local history state array
   */
  function appendMessageToHistory(text, type) {
    chatMessageHistory.push({
      id: String(Date.now() + Math.random()),
      authorType: type,
      messageText: text
    });
    refreshChatView();
  }

  /**
   * Activates typing indicator visibility state
   */
  function activateTypingState() {
    botTypingState = true;
    refreshChatView();
    return 'typing-indicator';
  }

  /**
   * Deactivates typing indicator visibility state
   */
  function deactivateTypingState(id) {
    botTypingState = false;
    refreshChatView();
  }

  // --- Initializer and DOM binding ---

  function setupChatEventListeners() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    if (sendBtn) {
      sendBtn.addEventListener('click', submitUserMessage);
    }
    
    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          submitUserMessage();
        }
      });
    }

    // Suggested question chip listeners
    document.querySelectorAll('.question-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const dataQuestion = chip.getAttribute('data-question');
        if (chatInput && dataQuestion) {
          chatInput.value = dataQuestion;
          submitUserMessage();
        }
      });
    });
    
    // Bind Back To Top button behavior if present
    const scrollUpBtn = document.getElementById('backToTopBtn');
    if (scrollUpBtn) {
      scrollUpBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof RateLimiter !== 'undefined') {
      chatLimiterInstance = new RateLimiter(5, 10000); // 5 requests per 10 seconds
    }
    setupChatEventListeners();
    refreshChatView();

    // Prefill and send question from query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const askQuestion = urlParams.get('ask');
    if (askQuestion) {
      const chatInput = document.getElementById('chat-input');
      if (chatInput) {
        chatInput.value = decodeURIComponent(askQuestion);
        setTimeout(() => {
          submitUserMessage();
        }, 400);
      }
    }
  });
})();
