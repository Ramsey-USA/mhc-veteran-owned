// AI Construction Chatbot System

class MHChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.userId = this.generateUserId();
        this.isTyping = false;
        this.conversationStage = 'greeting';
        this.userContext = {};
        this.quickActions = {
            greeting: [
                "Get Project Estimate",
                "View Our Services", 
                "Schedule Consultation",
                "Ask About Pricing"
            ],
            services: [
                "Commercial Construction",
                "Medical Facilities",
                "Religious Buildings",
                "Industrial Projects"
            ],
            estimate: [
                "Start New Estimate",
                "Explain Process",
                "See Sample Projects",
                "Contact Sales Team"
            ]
        };
        this.init();
    }

    init() {
        this.createChatbotUI();
        this.setupEventListeners();
        this.showWelcomeMessage();
        console.log('MH Construction Chatbot initialized');
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    createChatbotUI() {
        const chatbotContainer = document.getElementById('chatbot-container');
        if (!chatbotContainer) return;

        chatbotContainer.innerHTML = `
            <button class="chatbot-trigger" id="chatbotTrigger">
                💬
                <div class="chatbot-notification" id="chatbotNotification" style="display: none;">1</div>
            </button>
            
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <div class="chatbot-avatar">🤖</div>
                    <div class="chatbot-title">
                        <h4>MH Construction Assistant</h4>
                        <p>Expert construction guidance</p>
                    </div>
                    <button class="chatbot-close" id="chatbotClose">✕</button>
                </div>
                
                <div class="chatbot-messages" id="chatbotMessages">
                    <div class="welcome-message">
                        <h5>👋 Welcome to MH Construction!</h5>
                        <p>I'm your AI construction assistant. How can I help you today?</p>
                    </div>
                </div>
                
                <div class="chatbot-input">
                    <textarea class="chat-input" id="chatInput" placeholder="Ask me about construction, pricing, or services..." rows="1"></textarea>
                    <button class="send-button" id="sendButton" disabled>
                        <span>→</span>
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const trigger = document.getElementById('chatbotTrigger');
        const closeBtn = document.getElementById('chatbotClose');
        const sendBtn = document.getElementById('sendButton');
        const input = document.getElementById('chatInput');

        if (trigger) {
            trigger.addEventListener('click', () => this.toggleChatbot());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeChatbot());
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (input) {
            input.addEventListener('input', (e) => this.handleInputChange(e));
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Close chatbot when clicking outside
        document.addEventListener('click', (e) => {
            const window = document.getElementById('chatbotWindow');
            const trigger = document.getElementById('chatbotTrigger');
            
            if (this.isOpen && window && !window.contains(e.target) && !trigger.contains(e.target)) {
                this.closeChatbot();
            }
        });

        // Show notification after delay if not interacted
        setTimeout(() => {
            if (!this.isOpen && this.messages.length === 0) {
                this.showNotificationBadge();
            }
        }, 30000);
    }

    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }

    openChatbot() {
        const window = document.getElementById('chatbotWindow');
        const trigger = document.getElementById('chatbotTrigger');
        
        if (window && trigger) {
            window.classList.add('active');
            trigger.classList.add('active');
            this.isOpen = true;
            this.hideNotificationBadge();
            this.focusInput();
            
            // Send initial greeting if first time
            if (this.messages.length === 0) {
                setTimeout(() => {
                    this.addBotMessage("Hello! I'm here to help with all your construction needs. What type of project are you considering?", this.quickActions.greeting);
                }, 1000);
            }
        }
    }

    closeChatbot() {
        const window = document.getElementById('chatbotWindow');
        const trigger = document.getElementById('chatbotTrigger');
        
        if (window && trigger) {
            window.classList.remove('active');
            trigger.classList.remove('active');
            this.isOpen = false;
        }
    }

    focusInput() {
        const input = document.getElementById('chatInput');
        if (input) {
            setTimeout(() => input.focus(), 300);
        }
    }

    handleInputChange(e) {
        const sendBtn = document.getElementById('sendButton');
        const hasContent = e.target.value.trim().length > 0;
        
        if (sendBtn) {
            sendBtn.disabled = !hasContent;
        }

        // Auto-resize textarea
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        if (!input || !input.value.trim()) return;

        const message = input.value.trim();
        input.value = '';
        input.style.height = 'auto';
        
        const sendBtn = document.getElementById('sendButton');
        if (sendBtn) sendBtn.disabled = true;

        // Add user message
        this.addUserMessage(message);

        // Show typing indicator
        this.showTypingIndicator();

        // Process message and get response
        const response = await this.processMessage(message);

        // Remove typing indicator and add response
        this.hideTypingIndicator();
        this.addBotMessage(response.text, response.quickActions);

        // Update conversation stage
        this.conversationStage = response.stage || this.conversationStage;
    }

    addUserMessage(text) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const messageElement = this.createMessageElement('user', text);
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();

        this.messages.push({
            type: 'user',
            text: text,
            timestamp: new Date()
        });
    }

    addBotMessage(text, quickActions = null) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const messageElement = this.createMessageElement('bot', text, quickActions);
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();

        this.messages.push({
            type: 'bot',
            text: text,
            timestamp: new Date(),
            quickActions: quickActions
        });
    }

    createMessageElement(type, text, quickActions = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = type === 'bot' ? '🤖' : '👤';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);

        // Add quick actions for bot messages
        if (type === 'bot' && quickActions && quickActions.length > 0) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'quick-actions';

            quickActions.forEach(action => {
                const actionBtn = document.createElement('button');
                actionBtn.className = 'quick-action';
                actionBtn.textContent = action;
                actionBtn.addEventListener('click', () => {
                    this.handleQuickAction(action);
                });
                actionsDiv.appendChild(actionBtn);
            });

            bubble.appendChild(actionsDiv);
        }

        return messageDiv;
    }

    handleQuickAction(action) {
        // Simulate user clicking on quick action
        this.addUserMessage(action);
        
        // Show typing indicator
        this.showTypingIndicator();

        // Process the quick action
        setTimeout(async () => {
            const response = await this.processMessage(action);
            this.hideTypingIndicator();
            this.addBotMessage(response.text, response.quickActions);
            this.conversationStage = response.stage || this.conversationStage;
        }, 1000);
    }

    async processMessage(message) {
        // Simulate AI processing delay
        await this.delay(1500);

        const lowerMessage = message.toLowerCase();

        // Intent detection
        if (this.containsWords(lowerMessage, ['estimate', 'cost', 'price', 'budget'])) {
            return this.handleEstimateIntent(message);
        }

        if (this.containsWords(lowerMessage, ['service', 'construction', 'build', 'project'])) {
            return this.handleServicesIntent(message);
        }

        if (this.containsWords(lowerMessage, ['contact', 'call', 'consultation', 'meeting'])) {
            return this.handleContactIntent(message);
        }

        if (this.containsWords(lowerMessage, ['about', 'company', 'veteran', 'experience'])) {
            return this.handleAboutIntent(message);
        }

        if (this.containsWords(lowerMessage, ['commercial', 'office', 'retail'])) {
            return this.handleCommercialIntent(message);
        }

        if (this.containsWords(lowerMessage, ['medical', 'healthcare', 'hospital', 'clinic'])) {
            return this.handleMedicalIntent(message);
        }

        // Default response
        return this.getDefaultResponse(message);
    }

    handleEstimateIntent(message) {
        return {
            text: "I'd be happy to help you get a project estimate! Our AI estimator can provide instant, transparent pricing. Would you like to start the 5-step estimation process or learn more about our pricing approach?",
            quickActions: ["Start AI Estimator", "Explain Pricing Process", "See Sample Estimates", "Schedule Consultation"],
            stage: 'estimate'
        };
    }

    handleServicesIntent(message) {
        return {
            text: "MH Construction specializes in multiple construction types. We're veteran-owned and bring military precision to every project. Which type of construction interests you most?",
            quickActions: this.quickActions.services,
            stage: 'services'
        };
    }

    handleContactIntent(message) {
        return {
            text: "Perfect! I can help you get in touch with our team. You can call us at (509) 308-6489 or I can help schedule a consultation. We serve Washington, Oregon, and Idaho. What works best for you?",
            quickActions: ["Schedule Consultation", "Get Phone Number", "Request Callback", "Send Email"],
            stage: 'contact'
        };
    }

    handleAboutIntent(message) {
        return {
            text: "MH Construction is a veteran-owned company with 15+ years of experience and 500+ completed projects. We combine military precision with cutting-edge technology like AI estimation and 3D visualization. What would you like to know more about?",
            quickActions: ["Our Experience", "Veteran Advantage", "Technology Innovation", "View Projects"],
            stage: 'about'
        };
    }

    handleCommercialIntent(message) {
        return {
            text: "Our commercial construction services include office buildings, retail spaces, and commercial complexes. We focus on modern, efficient designs that meet your business needs. Typical commercial projects range from $150-250 per sq ft. Would you like to explore your specific project?",
            quickActions: ["Get Commercial Estimate", "View Commercial Projects", "Discuss Requirements", "Schedule Site Visit"],
            stage: 'commercial'
        };
    }

    handleMedicalIntent(message) {
        return {
            text: "Medical facility construction requires specialized expertise, and we excel in healthcare projects. We understand compliance requirements, specialized systems, and patient-focused design. Medical projects typically range from $200-350 per sq ft. How can I help with your medical facility?",
            quickActions: ["Medical Facility Estimate", "Compliance Information", "View Medical Projects", "Discuss Specifications"],
            stage: 'medical'
        };
    }

    getDefaultResponse(message) {
        const responses = [
            "I'm here to help with all your construction questions! Could you tell me more about what you're looking for?",
            "That's a great question! Let me connect you with the right information. What type of construction project are you considering?",
            "As your construction assistant, I want to make sure I give you the best guidance. Could you be more specific about your project needs?",
            "I'd love to help you with that! MH Construction handles many types of projects. What kind of building or construction are you interested in?"
        ];

        return {
            text: responses[Math.floor(Math.random() * responses.length)],
            quickActions: this.quickActions.greeting,
            stage: 'general'
        };
    }

    containsWords(text, words) {
        return words.some(word => text.includes(word));
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer || this.isTyping) return;

        this.isTyping = true;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.style.background = 'var(--mh-primary-green)';
        avatar.style.color = 'var(--white)';
        avatar.textContent = '🤖';

        const dotsDiv = document.createElement('div');
        dotsDiv.className = 'typing-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            dotsDiv.appendChild(dot);
        }

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(dotsDiv);
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    showNotificationBadge() {
        const notification = document.getElementById('chatbotNotification');
        if (notification) {
            notification.style.display = 'flex';
        }
    }

    hideNotificationBadge() {
        const notification = document.getElementById('chatbotNotification');
        if (notification) {
            notification.style.display = 'none';
        }
    }

    showWelcomeMessage() {
        // Initial setup complete - welcome message shown in UI
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public methods for external access
    open() {
        this.openChatbot();
    }

    close() {
        this.closeChatbot();
    }

    sendCustomMessage(message) {
        if (this.isOpen) {
            const input = document.getElementById('chatInput');
            if (input) {
                input.value = message;
                this.sendMessage();
            }
        } else {
            this.openChatbot();
            setTimeout(() => {
                this.sendCustomMessage(message);
            }, 500);
        }
    }
}

// Global chatbot instance
window.MHChatbot = null;

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.MHChatbot = new MHChatbot();
});

// Global function for opening chatbot
function openChatbot() {
    if (window.MHChatbot) {
        window.MHChatbot.open();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MHChatbot;
}
