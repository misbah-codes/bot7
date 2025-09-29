document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const voiceButton = document.getElementById('voice-btn');
    const voiceStatus = document.getElementById('voice-status');
    const themeToggle = document.getElementById('theme-toggle');
    const clearChatBtn = document.getElementById('clear-chat');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const quickActions = document.getElementById('quick-actions');
    const attachBtn = document.getElementById('attach-btn');

    // State Management
    let isListening = false;
    let recognition = null;
    let messageCount = 0;
    let settings = {
        theme: 'dark',
        fontSize: 'medium',
        animations: true,
        soundEffects: true
    };

    // Initialize App
    initApp();

    // ---- App Initialization ----
    function initApp() {
        loadSettings();
        setupEventListeners();
        setupSpeechRecognition();
        setupTheme();
        setupQuickActions();
        setupSettings();
        scrollToBottom();
        
        // Show welcome animation
        setTimeout(() => {
            const welcomeMessage = document.querySelector('.welcome-message');
            if (welcomeMessage) {
                welcomeMessage.style.opacity = '1';
                welcomeMessage.style.transform = 'translateY(0)';
            }
        }, 500);
    }

    // ---- Settings Management ----
    function loadSettings() {
        const savedSettings = localStorage.getItem('chatbot-settings');
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
        applySettings();
    }

    function saveSettings() {
        localStorage.setItem('chatbot-settings', JSON.stringify(settings));
    }

    function applySettings() {
        // Apply theme
        document.documentElement.setAttribute('data-theme', settings.theme);
        updateThemeIcon();
        
        // Apply font size
        document.documentElement.style.fontSize = 
            settings.fontSize === 'small' ? '14px' : 
            settings.fontSize === 'large' ? '18px' : '16px';
        
        // Apply animations
        if (!settings.animations) {
            document.documentElement.style.setProperty('--transition-fast', '0ms');
            document.documentElement.style.setProperty('--transition-normal', '0ms');
            document.documentElement.style.setProperty('--transition-slow', '0ms');
        }
    }

    // ---- Theme Management ----
    function setupTheme() {
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
    }

    function toggleTheme() {
        settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
        applySettings();
        saveSettings();
        playSound('click');
    }

    function updateThemeIcon() {
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            icon.className = settings.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // ---- Event Listeners ----
    function setupEventListeners() {
        // Send message events
        if (sendButton) {
            sendButton.addEventListener('click', handleSendMessage);
        }
        
        if (userInput) {
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                }
            });
            
            userInput.addEventListener('input', handleInputChange);
        }

        // Voice recognition
        if (voiceButton) {
            voiceButton.addEventListener('click', toggleVoiceRecognition);
        }

        // Clear chat
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', clearChat);
        }

        // Settings modal
        if (settingsBtn) {
            settingsBtn.addEventListener('click', openSettings);
        }
        
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', closeSettings);
        }

        // Close modal on outside click
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    closeSettings();
                }
            });
        }

        // Attach button
        if (attachBtn) {
            attachBtn.addEventListener('click', handleAttach);
        }
    }

    // ---- Quick Actions ----
    function setupQuickActions() {
        if (quickActions) {
            quickActions.addEventListener('click', (e) => {
                const quickBtn = e.target.closest('.quick-btn');
                if (quickBtn) {
                    const query = quickBtn.dataset.query;
                    if (query) {
                        userInput.value = query;
                        sendMessage(query);
                        playSound('click');
                    }
                }
            });
        }
    }

    // ---- Settings Modal ----
    function setupSettings() {
        const fontSizeSelect = document.getElementById('font-size');
        const animationsCheckbox = document.getElementById('animations');
        const soundEffectsCheckbox = document.getElementById('sound-effects');

        if (fontSizeSelect) {
            fontSizeSelect.value = settings.fontSize;
            fontSizeSelect.addEventListener('change', (e) => {
                settings.fontSize = e.target.value;
                applySettings();
                saveSettings();
            });
        }

        if (animationsCheckbox) {
            animationsCheckbox.checked = settings.animations;
            animationsCheckbox.addEventListener('change', (e) => {
                settings.animations = e.target.checked;
                applySettings();
                saveSettings();
            });
        }

        if (soundEffectsCheckbox) {
            soundEffectsCheckbox.checked = settings.soundEffects;
            soundEffectsCheckbox.addEventListener('change', (e) => {
                settings.soundEffects = e.target.checked;
                saveSettings();
            });
        }
    }

    function openSettings() {
        if (settingsModal) {
            settingsModal.classList.add('active');
            playSound('click');
        }
    }

    function closeSettings() {
        if (settingsModal) {
            settingsModal.classList.remove('active');
        }
    }

    // ---- Input Handling ----
    function handleInputChange() {
        if (userInput) {
            const isEmpty = userInput.value.trim() === '';
            if (sendButton) {
                sendButton.style.opacity = isEmpty ? '0.5' : '1';
                sendButton.style.transform = isEmpty ? 'scale(0.95)' : 'scale(1)';
            }
        }
    }

    function handleSendMessage() {
        if (userInput && userInput.value.trim()) {
            sendMessage(userInput.value.trim());
        }
    }

    function handleAttach() {
        // Placeholder for file attachment functionality
        showNotification('File attachment feature coming soon!', 'info');
        playSound('click');
    }

    // ---- Speech Recognition ----
    function setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = function (event) {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                sendMessage(transcript);
                playSound('success');
            };

            recognition.onerror = function (event) {
                console.error('Speech recognition error:', event.error);
                updateVoiceUI(false);
                showNotification('Voice recognition error: ' + event.error, 'error');
                playSound('error');
            };

            recognition.onend = function () {
                if (isListening) {
                    try {
                        recognition.start();
                    } catch (e) {
                        // Ignore if already started
                    }
                } else {
                    updateVoiceUI(false);
                }
            };
        } else {
            if (voiceButton) {
                voiceButton.style.display = 'none';
            }
            console.warn('SpeechRecognition not supported in this browser.');
        }
    }

    function toggleVoiceRecognition() {
        if (!recognition) {
            showNotification('Speech recognition not supported in this browser.', 'error');
            return;
        }

        isListening = !isListening;
        
        if (isListening) {
            try {
                recognition.start();
                updateVoiceUI(true);
                playSound('start');
            } catch (err) {
                console.error('Error starting recognition:', err);
                isListening = false;
                updateVoiceUI(false);
                showNotification('Unable to access microphone. Please allow mic permission.', 'error');
                playSound('error');
            }
        } else {
            recognition.stop();
            updateVoiceUI(false);
            playSound('stop');
        }
    }

    function updateVoiceUI(listening) {
        if (voiceButton && voiceStatus) {
            voiceButton.classList.toggle('listening', listening);
            voiceStatus.classList.toggle('active', listening);
        }
    }

    // ---- Chat Functions ----
    function scrollToBottom() {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator-container';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        
        if (chatMessages) {
            chatMessages.appendChild(typingDiv);
            scrollToBottom();
        }
        
        return typingDiv;
    }

    function removeTypingIndicator(typingIndicator) {
        if (typingIndicator && typingIndicator.parentNode) {
            typingIndicator.remove();
        }
    }

    function addMessage(message, isUser = false, options = {}) {
        const messageDiv = document.createElement('div');
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const messageId = `message-${++messageCount}`;
        
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.id = messageId;
        
        if (isUser) {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">
                        <p>${escapeHtml(message)}</p>
                    </div>
                    <div class="message-time">${time}</div>
                </div>
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">
                        <p>${escapeHtml(message)}</p>
                    </div>
                    <div class="message-time">${time}</div>
                </div>
            `;
        }
        
        if (chatMessages) {
            chatMessages.appendChild(messageDiv);
            scrollToBottom();
            
            // Add message reactions for bot messages
            if (!isUser && settings.animations) {
                addMessageReactions(messageDiv);
            }
        }
        
        return messageDiv;
    }

    function addMessageReactions(messageElement) {
        const messageContent = messageElement.querySelector('.message-content');
        if (!messageContent) return;

        const reactionsDiv = document.createElement('div');
        reactionsDiv.className = 'message-reactions';
        reactionsDiv.innerHTML = `
            <button class="reaction-btn" data-reaction="👍" title="Like">
                <i class="fas fa-thumbs-up"></i>
            </button>
            <button class="reaction-btn" data-reaction="👎" title="Dislike">
                <i class="fas fa-thumbs-down"></i>
            </button>
            <button class="reaction-btn" data-reaction="❤️" title="Love">
                <i class="fas fa-heart"></i>
            </button>
        `;

        // Add reaction event listeners
        reactionsDiv.addEventListener('click', (e) => {
            const reactionBtn = e.target.closest('.reaction-btn');
            if (reactionBtn) {
                const reaction = reactionBtn.dataset.reaction;
                handleReaction(messageElement, reaction, reactionBtn);
            }
        });

        messageContent.appendChild(reactionsDiv);
    }

    function handleReaction(messageElement, reaction, buttonElement) {
        // Toggle reaction
        buttonElement.classList.toggle('active');
        
        // Show feedback
        showNotification(`Reacted with ${reaction}`, 'success');
        playSound('click');
        
        // Add visual feedback
        if (settings.animations) {
            buttonElement.style.transform = 'scale(1.2)';
            setTimeout(() => {
                buttonElement.style.transform = 'scale(1)';
            }, 200);
        }
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ---- Messaging ----
    async function sendMessage(message) {
        const clean = message.trim();
        if (!clean) return;

        addMessage(clean, true);
        if (userInput) {
            userInput.value = '';
        }
        handleInputChange();

        const typing = showTypingIndicator();
        
        try {
            const response = await fetch('/get_response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: clean })
            });
            
            const data = await response.json();
            removeTypingIndicator(typing);
            
            const botResponse = data && data.response ? data.response : "I'm sorry, I didn't catch that. Could you rephrase?";
            addMessage(botResponse, false);
            
            playSound('message');
            
        } catch (err) {
            console.error('Request error:', err);
            removeTypingIndicator(typing);
            addMessage("I'm having trouble reaching the server. Please try again later.", false);
            playSound('error');
        }
    }

    // ---- Chat Management ----
    function clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            if (chatMessages) {
                // Keep only the welcome message
                const welcomeMessage = chatMessages.querySelector('.welcome-message');
                chatMessages.innerHTML = '';
                if (welcomeMessage) {
                    chatMessages.appendChild(welcomeMessage);
                }
            }
            messageCount = 0;
            playSound('click');
            showNotification('Chat cleared successfully!', 'success');
        }
    }

    // ---- Notifications ----
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-surface);
            color: var(--text-primary);
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border-color);
            z-index: 1001;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    function getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // ---- Sound Effects ----
    function playSound(type) {
        if (!settings.soundEffects) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const frequencies = {
            click: 800,
            message: 600,
            success: 1000,
            error: 300,
            start: 500,
            stop: 400
        };
        
        oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    // ---- CSS Animations ----
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .message-reactions {
            display: flex;
            gap: 8px;
            margin-top: 8px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .message:hover .message-reactions {
            opacity: 1;
        }
        
        .reaction-btn {
            width: 28px;
            height: 28px;
            border: 1px solid var(--border-color);
            border-radius: 50%;
            background: var(--bg-surface);
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 12px;
        }
        
        .reaction-btn:hover {
            background: var(--primary-color);
            color: var(--text-inverse);
            border-color: var(--primary-color);
        }
        
        .reaction-btn.active {
            background: var(--primary-color);
            color: var(--text-inverse);
            border-color: var(--primary-color);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .notification-success {
            border-left: 4px solid var(--success);
        }
        
        .notification-error {
            border-left: 4px solid var(--error);
        }
        
        .notification-warning {
            border-left: 4px solid var(--warning);
        }
        
        .notification-info {
            border-left: 4px solid var(--info);
        }
    `;
    document.head.appendChild(style);

    // ---- Keyboard Shortcuts ----
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (userInput) {
                userInput.focus();
            }
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            closeSettings();
        }
        
        // Ctrl/Cmd + / to toggle voice
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            toggleVoiceRecognition();
        }
    });

    // ---- Performance Optimizations ----
    let scrollTimeout;
    function throttledScrollToBottom() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(scrollToBottom, 100);
    }

    // Replace direct scrollToBottom calls with throttled version
    const originalScrollToBottom = scrollToBottom;
    scrollToBottom = throttledScrollToBottom;

    // ---- Error Handling ----
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        showNotification('An unexpected error occurred. Please refresh the page.', 'error');
    });

    // ---- Service Worker Registration (for future PWA features) ----
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('Service Worker registration failed:', err);
        });
    }
});