/**
 * Portfolio AI Assistant
 * AI-powered chatbot to help employers navigate Ken McKenzie's portfolio
 */

class PortfolioAssistant {
    constructor(config) {
        this.isOpen = false;
        this.isTyping = false;

        // Portfolio context for the AI
        this.portfolioContext = `You are an AI assistant helping employers learn about Ken McKenzie's professional portfolio and qualifications.

ABOUT KEN:
Ken McKenzie is a Well Engineering Specialist with over 30 years of offshore experience across the North Sea, Middle East, Asia-Pacific, and West Africa. He witnessed the evolution from telex machines to computers on rig floors, and believes AI represents the next fundamental transformation.

In 2020, he pivoted from offshore operations to AI, data science, and digital well engineering, building tools that solve real problems: disconnected data, opaque decision-making, and friction between field operations and planning.

CURRENT FOCUS:
Seeking Cloud ML Engineer roles - leveraging 30+ years of offshore domain expertise to build production AI systems on Google Cloud Platform

TECHNICAL SKILLS:
- Well Engineering: P&A operations, well integrity, intervention planning, workover/wireline/coiled tubing operations
- Data Science & AI: Python, machine learning, LLM integration, data analysis, Chart.js
- Full-Stack Development: HTML/CSS/JavaScript, PostgreSQL, Python backends, RESTful APIs
- 3D Visualization: Three.js, WebGL, Canvas API
- Modern Web: Vite, Tailwind CSS, GitHub Actions, CI/CD pipelines
- Emerging Tech: Blockchain/Web3 analysis for oil & gas applications

PORTFOLIO PROJECTS:

1. THE BRAHAN VERTEX ENGINE - Production Cloud ML System for Industrial Assets
   - Production-grade Google Cloud Platform architecture (React 18 + Vertex AI + Cloud Run)
   - Physics-Informed ML: Hybrid probabilistic + deterministic models ($500K safety net)
   - Event-driven data pipeline: IoT → Pub/Sub → Cloud Functions → Dataflow → Vertex AI
   - Voice command interface for hands-free industrial environments (Web Speech API)
   - Sub-500ms end-to-end latency, 99.9% uptime, scale-to-zero efficiency (<$5/month demo)
   - Comprehensive Engineering Decision Logs (10,000+ words) documenting architecture rationale
   - Technologies: React, Vertex AI, Cloud Run, Pub/Sub, Firestore, Three.js, Docker, nginx
   - Link: /brahan-vertex-builds.html | Decision Logs: /docs/ENGINEERING_DECISION_LOGS.md

2. EVERNODE GENESIS NODE PROVIDER - Blockchain Infrastructure Operations
   - Operated Genesis Node on XRP Ledger decentralized hosting network (2023)
   - Ubuntu 22.04 bare-metal server infrastructure, 24/7 uptime monitoring
   - Smart contract hosting for decentralized applications
   - XRPL hooks integration, EVR token economics
   - Verifiable on-chain history proving early adopter status
   - Demonstrates: DevOps experience, distributed systems, Linux infrastructure, bleeding-edge tech adoption
   - Link: https://evernode.org | Blockchain: https://xrpl.org

3. CONCEPT BRIDGE - AI-Powered Personalized Learning Platform
   - Reduces well engineering training time by 75% (2 weeks → 3 days)
   - Google Gemini AI integration for personalized analogy generation
   - Adaptive learning pathways based on learner background
   - Real examples: MTB brakes analogy for hydraulic pressure, home plumbing for wellbore flow
   - Problem solved: Eliminated generic "one-size-fits-all" training inefficiency
   - Technologies: Google Gemini AI, LLM APIs, HTML5, Tailwind CSS, JavaScript
   - Link: /courses.html

4. ENGINEERING DECISION LOGS - Technical Interview Documentation
   - 10,000+ word comprehensive architecture documentation
   - 10 sections: Cloud platform selection, serverless architecture, frontend framework, data pipeline, physics-informed ML, voice interface, CI/CD, security, cost optimization, scalability
   - Each section includes: Options considered, decision rationale, trade-offs, code examples, production scaling
   - Answers "Walk me through your architecture" at senior engineer level
   - Demonstrates: Systems thinking beyond coding, production considerations
   - Link: /docs/ENGINEERING_DECISION_LOGS.md

5. 3D WELLBORE & TOOLSTRING SUITE - Interactive 3D Graphics Engine
   - Integrated visualization suite for well intervention planning
   - Component 1: 3D Wellbore Visualizer - renders complete wellbore architecture
   - Component 2: 3D Toolstring Builder - interactive assembly with clash detection
   - Technologies: Three.js, WebGL, JavaScript, Canvas API
   - Demonstrates: Advanced 3D graphics programming, systems-level thinking
   - GitHub: https://github.com/kenmck3772/3d-wellbore, https://github.com/kenmck3772/3d-Toolstring

6. THE CLAN HEARTH - Scottish Heritage Platform
   - Full-featured cultural heritage platform with multiple interactive features
   - Features: Clan Explorer, Interactive Trip Planner, Tartan Designer, Personality Quiz, Traditional Recipes, Legends
   - Technologies: Vite, Tailwind CSS, JavaScript, GitHub Actions, PostCSS
   - Live site: https://theclanhearth.com
   - Demonstrates: Modern build tooling, CI/CD pipelines, diverse content types
   - GitHub: https://github.com/kenmck3772/theclanhearth.com

7. CRAIK ELECTRICAL OPS CENTER - Enterprise Electrical Management Suite
   - Enterprise-grade operations management platform for electrical contractors
   - Features: AI-powered voice logging with Gemini, Vision Link AR integration, real-time job tracking, material management with barcode scanning, business analytics
   - Technologies: React 19, TypeScript, Gemini AI, Vite, Vision API
   - Demonstrates: Enterprise React/TypeScript development, cutting-edge AI integration (Gemini), AR/Vision capabilities, real-time data management, complex state handling
   - GitHub: https://github.com/kenmck3772/Craik-Electrical

THE CAREER NARRATIVE - Three-Act Transformation:
Act I (1990-2020): Offshore Well Engineering - 30 years of team-based operations across North Sea, Middle East, Asia-Pacific, West Africa
Act II (2023): Blockchain Pioneer - Operated Evernode Genesis Node, learned distributed systems & DevOps
Act III (2024-Now): Cloud ML Engineer - Built production AI systems on GCP with physics-informed ML

This isn't a career change—it's applying industrial-grade operational discipline to AI architecture.

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
                overflow: hidden;
            }

            .chat-header-icon img {
                width: 100%;
                height: 100%;
                object-fit: cover;
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
                overflow: hidden;
            }

            .message-avatar.bot img {
                width: 100%;
                height: 100%;
                object-fit: cover;
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
                    <div class="chat-header-icon">
                        <img src="assets/images/kenmck.jpg" alt="Ken McKenzie">
                    </div>
                    <div class="chat-header-text">
                        <h3>Portfolio Assistant</h3>
                        <p>Ask me about Ken's experience</p>
                    </div>
                </div>

                <div class="chat-messages" id="chat-messages"></div>
                <div class="suggested-questions" id="suggested-questions">
                    <div class="suggested-questions-title">Try asking:</div>
                    <div class="suggested-question" data-question="Tell me about Ken's Cloud ML architecture on GCP">
                        Tell me about Ken's Cloud ML architecture on GCP
                    </div>
                    <div class="suggested-question" data-question="What is the Evernode Genesis Node experience?">
                        What is the Evernode Genesis Node experience?
                    </div>
                    <div class="suggested-question" data-question="How does Concept Bridge reduce training time by 75%?">
                        How does Concept Bridge reduce training time by 75%?
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
            </div>
        `;

        document.body.appendChild(container);
        this.addWelcomeMessage();
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('assistant-toggle');
        toggleBtn.addEventListener('click', () => this.toggleChat());
        this.attachChatListeners();
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
            this.addMessage('bot', `👋 Hi! I'm Ken McKenzie's AI assistant. I can help you explore his journey from **30+ years offshore well engineering** to **Cloud ML Engineer on GCP**. Ask me about the Brahan Vertex Engine, Evernode Genesis Node, or his Engineering Decision Logs!`);
        }, 500);
    }

    addMessage(type, content) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message \${type}`;

        messageDiv.innerHTML = `
            <div class="message-avatar \${type}">
                \${type === 'bot' ? '<img src="assets/images/kenmck.jpg" alt="Ken McKenzie">' : '👤'}
            </div>
            <div class="message-content">
                <div class="message-bubble \${type}">
                    \${this.formatMessage(content)}
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
            <div class="message-avatar bot">
                <img src="assets/images/kenmck.jpg" alt="Ken McKenzie">
            </div>
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

        // Show typing indicator
        this.isTyping = true;
        this.showTypingIndicator();

        // Simulate thinking time for natural feel
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.hideTypingIndicator();
            this.addMessage('bot', response);
            this.isTyping = false;
        }, 600);
    }

    generateResponse(message) {
        const lower = message.toLowerCase();

        // Experience & Background
        if (lower.includes('experience') || lower.includes('background') || lower.includes('30 years') || lower.includes('offshore')) {
            return "Ken McKenzie has **30+ years of offshore well engineering experience** across the North Sea, Middle East, Asia-Pacific, and West Africa. He specializes in:\n\n• **P&A operations** and well integrity\n• **Intervention planning** (wireline, coiled tubing, workover)\n• **Real-time decision-making** during critical operations\n• Over **80+ intervention programs** reviewed and analyzed\n\n**The Three-Act Transformation:**\n• Act I (1990-2020): Offshore Well Engineering\n• Act II (2023): Blockchain Pioneer - Evernode Genesis Node\n• Act III (2024-Now): Cloud ML Engineer on GCP\n\nThis isn't a career change—it's a career evolution. The thread is solving industrial problems with better tools.";
        }

        // Cloud ML & GCP Architecture
        if (lower.includes('cloud ml') || lower.includes('gcp') || lower.includes('google cloud') || lower.includes('vertex ai') || lower.includes('cloud run')) {
            return "Ken built **production-grade AI systems on Google Cloud Platform**:\n\n**The Brahan Vertex Engine:**\n• React 18 + Vertex AI + Cloud Run architecture\n• Physics-Informed ML: Hybrid probabilistic + deterministic models\n• Event-driven pipeline: IoT → Pub/Sub → Cloud Functions → Dataflow → Vertex AI\n• Sub-500ms latency, 99.9% uptime, scale-to-zero (<$5/month demo)\n• Voice command interface for hands-free industrial use\n\n**Engineering Decision Logs:**\n10,000+ word documentation covering all architecture decisions—from why GCP over AWS to cost optimization strategies.\n\n[View architecture](/brahan-vertex-builds.html) | [Decision Logs](/docs/ENGINEERING_DECISION_LOGS.md)";
        }

        // Evernode & Blockchain
        if (lower.includes('evernode') || lower.includes('genesis node') || lower.includes('xrpl') || lower.includes('xrp ledger')) {
            return "Ken operated an **Evernode Genesis Node** on the XRP Ledger in 2023:\n\n**What is Evernode?**\nDecentralized hosting infrastructure for smart contracts—think AWS, but on blockchain.\n\n**Ken's Role:**\n• Ubuntu 22.04 bare-metal server infrastructure\n• 24/7 uptime monitoring and maintenance\n• Smart contract hosting operations\n• XRPL hooks integration\n\n**Why This Matters for Cloud ML:**\n• Proves DevOps experience with production Linux infrastructure\n• Demonstrates comfort with bleeding-edge, decentralized technology\n• Shows distributed systems understanding\n• Verifiable on-chain history as early adopter\n\nLinks: [evernode.org](https://evernode.org) | [xrpl.org](https://xrpl.org)";
        }

        // Concept Bridge & AI Learning
        if (lower.includes('concept bridge') || lower.includes('personalized learning') || lower.includes('gemini') || lower.includes('training time') || lower.includes('75%')) {
            return "**Concept Bridge** is Ken's AI-powered personalized learning platform that reduces training time by **75%** (2 weeks → 3 days).\n\n**The Problem:**\nGeneric training treats a mountain biker and a plumber the same way—both struggling with \"hydrostatic pressure.\"\n\n**The Solution:**\n• Google Gemini AI analyzes learner background\n• Generates personalized analogies from their domain\n• Example: MTB brakes analogy for hydraulic pressure (cyclist)\n• Example: Home plumbing analogy for wellbore flow (plumber)\n\n**Real Impact:**\n• 2 weeks → 3 days training time\n• Higher retention through familiar concepts\n• Adaptive learning pathways\n\n[View Concept Bridge](/courses.html)";
        }

        // Engineering Decision Logs
        if (lower.includes('decision log') || lower.includes('architecture decision') || lower.includes('why gcp') || lower.includes('engineering decisions')) {
            return "Ken's **Engineering Decision Logs** are 10,000+ words of comprehensive architecture documentation.\n\n**10 Major Sections:**\n1. Cloud Platform Selection (Why GCP over AWS/Azure)\n2. Serverless Architecture (Cloud Run + Cloud Functions)\n3. Frontend Framework (React 18 with hooks)\n4. Data Pipeline Design (Event-driven vs Request/Response)\n5. Physics-Informed ML ($500K safety net approach)\n6. Voice Interface (Web Speech API vs Whisper AI)\n7. CI/CD Pipeline (GitHub Actions + Cloud Build)\n8. Security & Access Control (IAM, TLS, Secret Manager)\n9. Cost Optimization (Scale-to-zero achieving <$5/month)\n10. Future Scalability (1 well → 1,000 wells)\n\n**Each section includes:** Options considered, decision rationale, trade-offs, code examples, production scaling.\n\nThis answers \"Walk me through your architecture\" at senior engineer level.\n\n[Read Decision Logs](/docs/ENGINEERING_DECISION_LOGS.md)";
        }

        // Projects & Portfolio
        if (lower.includes('project') || lower.includes('portfolio') || lower.includes('built')) {
            return "Ken's portfolio showcases diverse technical skills:\n\n**1. Brahan Vertex Engine** - Production Cloud ML system (React + Vertex AI + Cloud Run) ([View](/brahan-vertex-builds.html))\n\n**2. Evernode Genesis Node** - Blockchain infrastructure operations on XRPL ([Info](https://evernode.org))\n\n**3. Concept Bridge** - AI learning platform reducing training time 75% ([View](/courses.html))\n\n**4. Engineering Decision Logs** - 10K+ word architecture documentation ([Read](/docs/ENGINEERING_DECISION_LOGS.md))\n\n**5. 3D Wellbore Suite** - Interactive 3D graphics (Three.js/WebGL) ([GitHub](https://github.com/kenmck3772/3d-wellbore))\n\n**6. The Clan Hearth** - Scottish heritage platform ([Live](https://theclanhearth.com))\n\n**7. Craik Electrical** - Enterprise React/TypeScript + Gemini AI ([GitHub](https://github.com/kenmck3772/Craik-Electrical))";
        }

        // Skills & Technologies
        if (lower.includes('skill') || lower.includes('technology') || lower.includes('tech stack') || lower.includes('programming') || lower.includes('python') || lower.includes('javascript')) {
            return "Ken's technical skillset spans multiple domains:\n\n**Well Engineering:**\n• P&A operations, well integrity, intervention planning\n• Wireline, coiled tubing, workover operations\n\n**Programming & Development:**\n• Python, JavaScript, HTML/CSS\n• React 19, TypeScript, Vite\n• PostgreSQL, RESTful APIs\n\n**Data Science & AI:**\n• Machine learning, LLM integration\n• Data analysis with Chart.js\n• AI-powered voice logging (Gemini)\n\n**3D Graphics:**\n• Three.js, WebGL, Canvas API\n• Interactive 3D visualization\n\n**Modern Web:**\n• GitHub Actions, CI/CD pipelines\n• Tailwind CSS, responsive design";
        }

        // Job Search & Remote Work
        if (lower.includes('remote') || lower.includes('hire') || lower.includes('hiring') || lower.includes('job') || lower.includes('role') || lower.includes('looking')) {
            return "Ken is actively seeking **Cloud ML Engineer roles** where he can leverage:\n\n• **30+ years offshore domain expertise** - deep understanding of industrial operations and physics\n• **Production AI systems on GCP** - proven experience with Vertex AI, Cloud Run, event-driven architecture\n• **Physics-Informed ML** - hybrid models combining probabilistic ML with deterministic safety rules\n• **DevOps & Infrastructure** - from Evernode blockchain nodes to Docker/Kubernetes deployments\n\nWhat sets Ken apart: He's not a bootcamp graduate learning domain knowledge—he's a domain expert who mastered cloud AI. He builds systems that can't fail because he knows what failure costs offshore.\n\nContact: **ken@welltegra.network**";
        }

        // Contact Information
        if (lower.includes('contact') || lower.includes('email') || lower.includes('reach') || lower.includes('linkedin')) {
            return "You can reach Ken McKenzie at:\n\n📧 **Email:** ken@welltegra.network\n🔗 **LinkedIn:** [linkedin.com/in/ken-mckenzie-b8901658](https://www.linkedin.com/in/ken-mckenzie-b8901658)\n🌐 **Portfolio:** [welltegra.network](https://welltegra.network)\n💻 **GitHub:** Check out his repositories for code samples\n\nKen is open to discussing remote opportunities in well engineering, data analysis, and decommissioning planning!";
        }

        // Specific Projects - Brahan Engine
        if (lower.includes('intervention') || lower.includes('planning')) {
            return "**The Brahan Engine** is Ken's flagship project - an AI-powered well intervention planner that demonstrates his ability to bridge well engineering expertise with modern software development.\n\n**Key Features:**\n• 900+ equipment database entries\n• AI-powered intervention program generation\n• Cost analysis and optimization\n• Python backend with PostgreSQL\n• Interactive charts with Chart.js\n\nView the live demo: [/planner.html](/planner.html)\n\nThis project shows Ken's systems-level thinking and ability to build production-ready applications.";
        }

        // 3D Graphics
        if (lower.includes('3d') || lower.includes('three.js') || lower.includes('webgl') || lower.includes('visualization')) {
            return "Ken built an impressive **3D Wellbore & Toolstring Visualization Suite** using Three.js and WebGL:\n\n**Component 1:** 3D Wellbore Visualizer\n• Renders complete wellbore architecture in 3D\n• Interactive camera controls\n• Real-time rendering\n\n**Component 2:** 3D Toolstring Builder\n• Interactive tool assembly\n• Clash detection system\n• Drag-and-drop interface\n\nExplore on GitHub:\n• [3D Wellbore](https://github.com/kenmck3772/3d-wellbore)\n• [3D Toolstring](https://github.com/kenmck3772/3d-Toolstring)";
        }

        // Education & Training
        if (lower.includes('education') || lower.includes('academy') || lower.includes('course') || lower.includes('training')) {
            return "**Well-Tegra Academy** is Ken's experimental sandbox testing AI's capability to generate technical training content.\n\n**Interactive Modules:**\n• P&A Operations Course\n• Micro-Annulus Detection\n• Crisis Command Simulator\n• SOP Library\n\n**Technologies:** LLM APIs, HTML5, Tailwind CSS, JavaScript\n\n**Note:** This is an exploratory project demonstrating AI content generation, not production training material.\n\nExplore: [/courses.html](/courses.html)";
        }

        // AI & Machine Learning
        if (lower.includes('ai ') || lower.includes('artificial intelligence') || lower.includes('machine learning') || lower.includes('llm')) {
            return "Ken has pivoted strongly into **AI and data science** since 2020:\n\n**AI Integration:**\n• LLM APIs for intelligent assistants\n• AI-powered intervention program generation\n• Gemini AI voice logging in Craik Electrical\n• Experimental AI content generation\n\n**Philosophy:**\nKen believes AI represents the next fundamental transformation in oil & gas, similar to how computers revolutionized rig operations. He's building tools that combine domain expertise with modern AI capabilities to solve real industry problems.\n\nHis projects demonstrate practical AI application in well engineering contexts.";
        }

        // Blockchain
        if (lower.includes('blockchain') || lower.includes('web3') || lower.includes('smart contract')) {
            return "Ken conducted a **technical analysis of blockchain applications in oil & gas drilling operations**.\n\n**Use Cases Explored:**\n• Automated performance-based payments\n• Immutable well records and audit trails\n• JV cost reconciliation\n• Supply chain tracking\n\n**Real-World Example:**\n• Equinor & Data Gumbo partnership\n• Smart contracts for drilling operations\n\n**Technologies:** Blockchain, Smart Contracts, Web3, IoT Integration\n\nRead the full analysis: [/blockchain-analysis.html](/blockchain-analysis.html)";
        }

        // Default helpful response
        return "I'm here to help you learn about Ken McKenzie's portfolio! You can ask me about:\n\n• **Experience:** \"What is Ken's background in well engineering?\"\n• **Projects:** \"Tell me about Ken's technical projects\"\n• **Skills:** \"What programming languages does Ken know?\"\n• **Remote Work:** \"Is Ken looking for remote opportunities?\"\n• **Contact:** \"How can I reach Ken?\"\n• **Specific Topics:** AI, 3D graphics, blockchain, intervention planning\n\nWhat would you like to know?";
    }
}

// Initialize the assistant when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAssistant);
} else {
    initAssistant();
}

function initAssistant() {
    new PortfolioAssistant({});
}
