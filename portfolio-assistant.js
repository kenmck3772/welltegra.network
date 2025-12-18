/**
 * Portfolio AI Assistant
 * AI-powered chatbot to help employers navigate Ken McKenzie's portfolio
 */

class PortfolioAssistant {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;

        // Portfolio context for the AI
        this.portfolioContext = `You are an AI assistant helping employers learn about Ken McKenzie's professional portfolio and qualifications.

ABOUT KEN:
Ken McKenzie is a Well Engineering Specialist with over 30 years of offshore experience across the North Sea, Middle East, Asia-Pacific, and West Africa. He witnessed the evolution from telex machines to computers on rig floors, and believes AI represents the next fundamental transformation.

In 2020, he pivoted from offshore operations to AI, data science, and digital well engineering, building tools that solve real problems: disconnected data, opaque decision-making, and friction between field operations and planning.

CURRENT FOCUS:
Seeking remote roles in: Well Engineering, Data Analysis, Decommissioning Planning

TECHNICAL SKILLS:
- Well Engineering: P&A operations, well integrity, intervention planning, workover/wireline/coiled tubing operations
- Data Science & AI: Python, machine learning, LLM integration, data analysis, Chart.js
- Full-Stack Development: HTML/CSS/JavaScript, PostgreSQL, Python backends, RESTful APIs
- 3D Visualization: Three.js, WebGL, Canvas API
- Modern Web: Vite, Tailwind CSS, GitHub Actions, CI/CD pipelines
- Emerging Tech: Blockchain/Web3 analysis for oil & gas applications

PORTFOLIO PROJECTS:

1. THE BRAHAN ENGINE - AI-Powered Well Intervention Planner
   - Full-stack web application with Python backend, PostgreSQL database
   - 900+ equipment database entries for well intervention operations
   - AI-powered intervention program generation with cost analysis
   - Technologies: Python, PostgreSQL, LLM APIs, HTML/CSS/JS, Chart.js
   - Link: /planner.html

2. WELL-TEGRA ACADEMY - AI-Assisted Content Generation Experiment
   - Experimental sandbox testing AI's capability to generate technical training content
   - Interactive modules: P&A Operations, Micro-Annulus Course, Crisis Command, SOP Library
   - Technologies: LLM APIs, HTML5, Tailwind CSS, JavaScript, Chart.js
   - Transparency: Exploratory project, not production training
   - Link: /courses.html

3. BLOCKCHAIN FOR WELL ENGINEERING - Web3 & Smart Contracts Analysis
   - Technical analysis of blockchain applications in drilling operations
   - Use cases: automated performance-based payments, immutable well records, JV cost reconciliation, supply chain tracking
   - Real-world example: Equinor & Data Gumbo partnership
   - Technologies: Blockchain, Smart Contracts, Web3, IoT Integration
   - Link: /blockchain-analysis.html

4. 3D WELLBORE & TOOLSTRING SUITE - Interactive 3D Graphics Engine
   - Integrated visualization suite for well intervention planning
   - Component 1: 3D Wellbore Visualizer - renders complete wellbore architecture
   - Component 2: 3D Toolstring Builder - interactive assembly with clash detection
   - Technologies: Three.js, WebGL, JavaScript, Canvas API
   - Demonstrates: Advanced 3D graphics programming, systems-level thinking
   - GitHub: https://github.com/kenmck3772/3d-wellbore, https://github.com/kenmck3772/3d-Toolstring

5. THE CLAN HEARTH - Scottish Heritage Platform
   - Full-featured cultural heritage platform with multiple interactive features
   - Features: Clan Explorer, Interactive Trip Planner, Tartan Designer, Personality Quiz, Traditional Recipes, Legends
   - Technologies: Vite, Tailwind CSS, JavaScript, GitHub Actions, PostCSS
   - Live site: https://theclanhearth.com
   - Demonstrates: Modern build tooling, CI/CD pipelines, diverse content types
   - GitHub: https://github.com/kenmck3772/theclanhearth.com

6. CRAIK ELECTRICAL OPS CENTER - Enterprise Electrical Management Suite
   - Enterprise-grade operations management platform for electrical contractors
   - Features: AI-powered voice logging with Gemini, Vision Link AR integration, real-time job tracking, material management with barcode scanning, business analytics
   - Technologies: React 19, TypeScript, Gemini AI, Vite, Vision API
   - AI Studio: https://ai.google.dev/competition/projects/craik-electrical-ops-center
   - Demonstrates: Enterprise React/TypeScript development, cutting-edge AI integration (Gemini), AR/Vision capabilities, real-time data management, complex state handling
   - GitHub: https://github.com/kenmck3772/Craik-Electrical

EXPERIENCE HIGHLIGHTS:
- 30+ years offshore well engineering across multiple regions
- 80+ intervention programs reviewed and analyzed
- Multiple P&A campaigns across mature fields
- Expertise in wireline, coiled tubing, and workover operations
- Real-time decision-making during critical operations

CONTACT:
- Email: ken@welltegra.network
- LinkedIn: https://www.linkedin.com/in/ken-mckenzie-b8901658
- Portfolio: https://welltegra.network

When answering questions:
1. Be conversational and helpful
2. Provide specific details from the portfolio
3. When mentioning projects, include the link like this: "View project: [link]"
4. If asked about experience not covered above, politely say you don't have that information but Ken can discuss it directly
5. Encourage contacting Ken for detailed discussions or opportunities
6. Keep responses concise but informative (2-4 paragraphs max)`;

        this.init();
    }

    init() {
        this.injectStyles();
        this.createWidget();
        this.attachEventListeners();
    }

    injectStyles() {
        const styles = `
            .portfolio-assistant-container {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .assistant-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(249, 115, 22, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                position: relative;
            }

            .assistant-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(249, 115, 22, 0.6);
            }

            .assistant-button svg {
                width: 28px;
                height: 28px;
                color: white;
            }

            .assistant-button.active {
                background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
            }

            .chat-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 400px;
                max-width: calc(100vw - 48px);
                height: 600px;
                max-height: calc(100vh - 120px);
                background: #1e293b;
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                display: none;
                flex-direction: column;
                overflow: hidden;
            }

            .chat-window.open {
                display: flex;
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .chat-header {
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                padding: 20px;
                color: white;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .chat-header-icon {
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }

            .chat-header-text h3 {
                margin: 0;
                font-size: 1.1rem;
                font-weight: 600;
            }

            .chat-header-text p {
                margin: 2px 0 0 0;
                font-size: 0.85rem;
                opacity: 0.9;
            }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                background: #0f172a;
            }

            .chat-message {
                display: flex;
                gap: 12px;
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .chat-message.user {
                flex-direction: row-reverse;
            }

            .message-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                flex-shrink: 0;
            }

            .message-avatar.bot {
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            }

            .message-avatar.user {
                background: #334155;
                color: #94a3b8;
            }

            .message-content {
                flex: 1;
                max-width: 75%;
            }

            .message-bubble {
                padding: 12px 16px;
                border-radius: 12px;
                line-height: 1.5;
                font-size: 0.95rem;
            }

            .message-bubble.bot {
                background: #1e293b;
                color: #e2e8f0;
                border: 1px solid rgba(148, 163, 184, 0.2);
            }

            .message-bubble.user {
                background: #f97316;
                color: white;
                margin-left: auto;
            }

            .message-bubble a {
                color: #60a5fa;
                text-decoration: none;
                border-bottom: 1px solid rgba(96, 165, 250, 0.3);
            }

            .message-bubble a:hover {
                color: #93c5fd;
                border-bottom-color: #93c5fd;
            }

            .typing-indicator {
                display: flex;
                gap: 4px;
                padding: 12px 16px;
                background: #1e293b;
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 12px;
                width: fit-content;
            }

            .typing-dot {
                width: 8px;
                height: 8px;
                background: #94a3b8;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }

            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }

            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
                30% { transform: translateY(-10px); opacity: 1; }
            }

            .suggested-questions {
                padding: 12px 20px;
                background: #1e293b;
                border-top: 1px solid rgba(148, 163, 184, 0.2);
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .suggested-questions-title {
                font-size: 0.8rem;
                color: #94a3b8;
                font-weight: 600;
            }

            .suggested-question {
                background: #334155;
                border: 1px solid rgba(148, 163, 184, 0.2);
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 0.85rem;
                color: #e2e8f0;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .suggested-question:hover {
                background: #475569;
                border-color: #f97316;
                color: white;
            }

            .chat-input-area {
                padding: 16px 20px;
                background: #1e293b;
                border-top: 1px solid rgba(148, 163, 184, 0.2);
            }

            .chat-input-wrapper {
                display: flex;
                gap: 8px;
            }

            .chat-input {
                flex: 1;
                background: #0f172a;
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 8px;
                padding: 12px;
                color: #e2e8f0;
                font-size: 0.95rem;
                outline: none;
                transition: border-color 0.2s;
            }

            .chat-input:focus {
                border-color: #f97316;
            }

            .chat-input::placeholder {
                color: #64748b;
            }

            .send-button {
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                border: none;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                flex-shrink: 0;
            }

            .send-button:hover:not(:disabled) {
                transform: scale(1.05);
            }

            .send-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .send-button svg {
                width: 20px;
                height: 20px;
                color: white;
            }

            .api-key-prompt {
                padding: 20px;
                background: #0f172a;
                text-align: center;
            }

            .api-key-prompt h4 {
                color: #e2e8f0;
                margin: 0 0 8px 0;
                font-size: 1rem;
            }

            .api-key-prompt p {
                color: #94a3b8;
                font-size: 0.85rem;
                margin: 0 0 16px 0;
                line-height: 1.5;
            }

            .api-key-input {
                width: 100%;
                background: #1e293b;
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 8px;
                padding: 10px;
                color: #e2e8f0;
                font-size: 0.9rem;
                margin-bottom: 12px;
            }

            .api-key-submit {
                width: 100%;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                color: white;
                border: none;
                padding: 10px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            }

            .api-key-link {
                color: #60a5fa;
                text-decoration: none;
                font-size: 0.85rem;
            }

            @media (max-width: 480px) {
                .chat-window {
                    width: calc(100vw - 24px);
                    right: 12px;
                    bottom: 90px;
                    height: calc(100vh - 120px);
                }

                .portfolio-assistant-container {
                    bottom: 16px;
                    right: 16px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    createWidget() {
        const container = document.createElement('div');
        container.className = 'portfolio-assistant-container';
        container.innerHTML = `
            <button class="assistant-button" id="assistant-toggle" aria-label="Open AI Assistant">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </button>

            <div class="chat-window" id="chat-window">
                <div class="chat-header">
                    <div class="chat-header-icon">🤖</div>
                    <div class="chat-header-text">
                        <h3>Portfolio Assistant</h3>
                        <p>Ask me about Ken's experience</p>
                    </div>
                </div>

                <div id="chat-content">
                    ${!this.apiKey ? this.getApiKeyPrompt() : ''}
                </div>

                ${this.apiKey ? `
                    <div class="chat-messages" id="chat-messages"></div>
                    <div class="suggested-questions" id="suggested-questions">
                        <div class="suggested-questions-title">Try asking:</div>
                        <div class="suggested-question" data-question="What is Ken's background in well engineering?">
                            What is Ken's background in well engineering?
                        </div>
                        <div class="suggested-question" data-question="Tell me about Ken's technical projects">
                            Tell me about Ken's technical projects
                        </div>
                        <div class="suggested-question" data-question="What programming languages does Ken know?">
                            What programming languages does Ken know?
                        </div>
                    </div>
                    <div class="chat-input-area">
                        <div class="chat-input-wrapper">
                            <input
                                type="text"
                                class="chat-input"
                                id="chat-input"
                                placeholder="Ask about Ken's portfolio..."
                                autocomplete="off"
                            />
                            <button class="send-button" id="send-button" aria-label="Send message">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(container);

        if (this.apiKey) {
            this.addWelcomeMessage();
        }
    }

    getApiKeyPrompt() {
        return `
            <div class="api-key-prompt">
                <h4>🔑 API Key Required</h4>
                <p>This AI assistant uses Claude API. Enter your Anthropic API key to start chatting.</p>
                <input
                    type="password"
                    class="api-key-input"
                    id="api-key-input"
                    placeholder="sk-ant-api03-..."
                />
                <button class="api-key-submit" id="api-key-submit">Start Chat</button>
                <p style="margin-top: 12px;">
                    <a href="https://console.anthropic.com/" target="_blank" class="api-key-link">
                        Get API key from Anthropic →
                    </a>
                </p>
            </div>
        `;
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('assistant-toggle');
        const chatWindow = document.getElementById('chat-window');

        toggleBtn.addEventListener('click', () => this.toggleChat());

        if (this.apiKey) {
            this.attachChatListeners();
        } else {
            const submitBtn = document.getElementById('api-key-submit');
            const input = document.getElementById('api-key-input');

            submitBtn.addEventListener('click', () => this.setApiKey());
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.setApiKey();
            });
        }
    }

    attachChatListeners() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-button');
        const suggestedQuestions = document.querySelectorAll('.suggested-question');

        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        suggestedQuestions.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.getAttribute('data-question');
                this.sendMessage(question);
                document.getElementById('suggested-questions').style.display = 'none';
            });
        });
    }

    setApiKey() {
        const input = document.getElementById('api-key-input');
        const key = input.value.trim();

        if (!key || !key.startsWith('sk-ant-')) {
            alert('Please enter a valid Anthropic API key (starts with sk-ant-)');
            return;
        }

        this.apiKey = key;
        localStorage.setItem('portfolio_assistant_api_key', key);

        // Reload the widget with the API key
        document.querySelector('.portfolio-assistant-container').remove();
        this.init();
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('chat-window');
        const toggleBtn = document.getElementById('assistant-toggle');

        if (this.isOpen) {
            chatWindow.classList.add('open');
            toggleBtn.classList.add('active');
            // Focus input after opening
            setTimeout(() => {
                const input = document.getElementById('chat-input');
                if (input) input.focus();
            }, 300);
        } else {
            chatWindow.classList.remove('open');
            toggleBtn.classList.remove('active');
        }
    }

    addWelcomeMessage() {
        setTimeout(() => {
            this.addMessage('bot', `👋 Hi! I'm Ken McKenzie's AI assistant. I can help you learn about his 30+ years of well engineering experience, technical projects, and skills. What would you like to know?`);
        }, 500);
    }

    addMessage(type, content) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;

        messageDiv.innerHTML = `
            <div class="message-avatar ${type}">
                ${type === 'bot' ? '🤖' : '👤'}
            </div>
            <div class="message-content">
                <div class="message-bubble ${type}">
                    ${this.formatMessage(content)}
                </div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(content) {
        // Convert markdown-style links to HTML
        content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Convert project links like "/planner.html" to clickable links
        content = content.replace(/View project: (\/[^\s]+)/g, '<a href="$1">View project →</a>');

        // Convert newlines to <br>
        content = content.replace(/\n/g, '<br>');

        return content;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar bot">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async sendMessage(text = null) {
        const input = document.getElementById('chat-input');
        const message = text || input.value.trim();

        if (!message || this.isTyping) return;

        // Clear input
        if (!text) input.value = '';

        // Add user message
        this.addMessage('user', message);
        this.messages.push({ role: 'user', content: message });

        // Show typing indicator
        this.isTyping = true;
        this.showTypingIndicator();

        try {
            const response = await this.callClaudeAPI(message);
            this.hideTypingIndicator();
            this.addMessage('bot', response);
            this.messages.push({ role: 'assistant', content: response });
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('bot', `I encountered an error: ${error.message}. Please try again or contact Ken directly at ken@welltegra.network.`);
        } finally {
            this.isTyping = false;
        }
    }

    async callClaudeAPI(userMessage) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                system: this.portfolioContext,
                messages: this.messages
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        return data.content[0].text;
    }
}

// Initialize the assistant when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAssistant);
} else {
    initAssistant();
}

function initAssistant() {
    // Check for API key in localStorage
    const savedApiKey = localStorage.getItem('portfolio_assistant_api_key');

    new PortfolioAssistant({
        apiKey: savedApiKey || null
    });
}
