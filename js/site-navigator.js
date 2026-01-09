/**
 * Enhanced Portfolio AI Assistant with Intelligent Site Navigation
 * Guides recruiters, engineers, and clients through the welltegra.network ecosystem
 */

class PortfolioAssistant {
    constructor(config) {
        this.isOpen = false;
        this.isTyping = false;
        this.conversationContext = [];

        // Enhanced portfolio context with all new modules
        this.portfolioContext = `You are an intelligent site guide for Ken McKenzie's portfolio at welltegra.network.

ROLE: Help visitors navigate this extensive portfolio based on their needs (recruiter, engineer, potential client, student).

SITE STRUCTURE - COMPREHENSIVE MAP:

🏠 MAIN PAGES:
1. Homepage (index.html) - Professional overview, KPIs, engagement models
2. About (about.html) - 30-year journey, technical evolution, Evernode Genesis Node
3. Training Academy (accessible via Brahan Vertex app) - 4 interactive modules

🚀 FLAGSHIP APPLICATIONS:

1. BRAHAN VERTEX ENGINE (brahan-vertex.html)
   - Production Cloud ML system on Google Cloud Platform
   - Physics-Informed ML: Hybrid probabilistic + deterministic models
   - Sub-500ms latency, 99.9% uptime, scale-to-zero architecture
   - Voice command interface for industrial environments
   - Real-time well integrity monitoring and forensic analysis
   - Access Training Module from here

2. INTERACTIVE DEMOS (brahan-vertex-interactive.html) ⭐ NEW
   - Live executable React demonstrations
   - Demo 1: Physics-Informed ML Override (toggle to see ML overridden by physics)
   - Demo 2: Closed-Loop Training Trigger (simulate procedural violations)
   - Demo 3: Voice Command Simulator (working speech recognition)
   - Perfect for recruiters wanting quick proof of capabilities

3. ARCHITECTURE DOCS (brahan-vertex-builds.html)
   - 10,000+ word engineering decision logs
   - GCP cloud architecture with Mermaid diagrams
   - Code examples, performance benchmarks, CI/CD pipeline

🎓 TRAINING ACADEMY (4 INTEGRATED MODULES):
Access via Brahan Vertex app's Training tab:

1. HYDROSTATIC TRAINING ACADEMY
   - 10-module course curriculum (IADC WellSharp & IWCF standards)
   - Interactive Well Control Simulator with real-time physics
   - Exam preparation with calculation drills
   - Covers: Levels 1-5 certification, MPD, HPHT, deepwater engineering, P&A

2. BRAHAN HUB - VISIONARY INTEGRITY
   - AI-powered predictive well integrity monitoring
   - Christmas tree diagnostics with interactive SVG visualizations
   - Real-time telemetry simulation and drift detection
   - Gemini AI-powered predictive alerts
   - Maintenance history tracking and forecasting

3. 3D WELLBORE VISUALIZER
   - Interactive 3D well deviation path visualization
   - Drag-and-drop wellbore schematic editor
   - Component library (casing, tubing, packers, perforations)
   - Survey data management with MD/TVD calculations
   - Multi-well project management

4. 3D SLICKLINE TOOL STRING ASSEMBLER
   - Interactive 3D tool string builder with physics validation
   - Comprehensive component database (rope sockets, jars, gauges)
   - Real-time compatibility validation (threaded/latched connections)
   - Clearance checks and physics calculations
   - Bill of Materials generation

📊 SPECIALIZED PAGES:

1. CONCEPT BRIDGE (courses.html)
   - AI-powered personalized learning platform
   - Google Gemini AI integration
   - Reduces training time by 75% (2 weeks → 3 days)
   - Adaptive learning with custom analogies

2. DATA INGESTION (data-ingestion.html)
   - Real-time streaming architecture
   - Pub/Sub → Cloud Functions → Firestore pipeline
   - Performance benchmarks and monitoring

3. OPERATIONS DASHBOARD (operations-dashboard.html)
   - Executive KPI monitoring
   - Real-time well status tracking
   - Multi-asset portfolio management

4. FIELD NOTES (field-notes.html)
   - 30 years of offshore experience documented
   - Technical case studies and lessons learned

5. SOP LIBRARY (sop-library.html)
   - Standard Operating Procedures database
   - Best practices from decades of field work

6. METHODOLOGY (methodology.html)
   - Technical approach and frameworks
   - Decision-making processes

💼 FOR RECRUITERS/HIRING MANAGERS:

Quick Path (5 minutes):
1. Start: Interactive Demos (brahan-vertex-interactive.html) - See working code
2. Then: Homepage (index.html) - See KPIs and engagement models
3. Finally: About (about.html) - Understand the journey

Deep Dive (15 minutes):
1. Interactive Demos → 2. Full Brahan Vertex App → 3. Training Academy modules → 4. Architecture Docs

🔧 FOR ENGINEERS/TECHNICAL REVIEWERS:

1. brahan-vertex-builds.html - Architecture & engineering decisions
2. brahan-vertex-interactive.html - Live code demonstrations
3. GitHub repos:
   - welltegra.network (main project)
   - Hydrostatic-concept
   - Integrity (Brahan Hub)
   - 3d-wellbore
   - 3d-Toolstring

🏢 FOR POTENTIAL CLIENTS:

1. Homepage - See proven track record and KPIs
2. Brahan Vertex App - Experience the technology
3. Training Academy - See comprehensive capabilities
4. Contact for engagement models

🎯 KEY NAVIGATION TIPS:

- "Show me working code" → Interactive Demos
- "What can you build?" → Brahan Vertex + Training Academy
- "Technical deep dive" → Architecture Docs + Engineering Logs
- "Quick overview" → Homepage + About
- "Hands-on experience" → Launch Brahan Vertex, explore Training modules
- "AI capabilities" → Integrity Hub (Gemini AI) + Concept Bridge
- "3D visualization" → Wellbore Visualizer + Toolstring Assembler
- "Well control training" → Hydrostatic Academy

RESPONSE STYLE:
- Ask visitor role first (recruiter/engineer/client/student)
- Provide direct navigation links
- Suggest optimal path based on time available
- Highlight interactive elements
- Use emojis for visual clarity
- Keep responses concise but informative

When asked about specific topics, provide:
1. Direct page link
2. What they'll see there
3. Why it matters for their role
4. Estimated time to explore`;

        this.config = config || {};
        this.init();
    }

    init() {
        this.injectStyles();
        this.createWidget();
        this.addEventListeners();
        this.displayWelcomeMessage();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .portfolio-assistant-container {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .assistant-button {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 20px rgba(249, 115, 22, 0.4);
                transition: all 0.3s ease;
                position: relative;
            }

            .assistant-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(249, 115, 22, 0.6);
            }

            .assistant-button svg {
                width: 32px;
                height: 32px;
                color: white;
            }

            .assistant-button.active {
                background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
            }

            .assistant-pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 3px solid #f97316;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                100% {
                    transform: scale(1.5);
                    opacity: 0;
                }
            }

            .chat-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 420px;
                max-width: calc(100vw - 48px);
                height: 650px;
                max-height: calc(100vh - 120px);
                background: #1e293b;
                border: 2px solid rgba(249, 115, 22, 0.3);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
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
                justify-content: space-between;
            }

            .chat-header-left {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .chat-header-icon {
                width: 44px;
                height: 44px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }

            .chat-header-text h3 {
                margin: 0;
                font-size: 1.1rem;
                font-weight: 700;
            }

            .chat-header-text p {
                margin: 4px 0 0 0;
                font-size: 0.85rem;
                opacity: 0.95;
            }

            .chat-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .chat-close:hover {
                background: rgba(255, 255, 255, 0.3);
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

            .chat-messages::-webkit-scrollbar {
                width: 8px;
            }

            .chat-messages::-webkit-scrollbar-track {
                background: #1e293b;
            }

            .chat-messages::-webkit-scrollbar-thumb {
                background: #f97316;
                border-radius: 4px;
            }

            .chat-message {
                display: flex;
                gap: 12px;
                animation: messageSlide 0.3s ease;
            }

            @keyframes messageSlide {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .chat-message.user {
                flex-direction: row-reverse;
            }

            .message-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                font-size: 18px;
            }

            .message-avatar.assistant {
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                color: white;
            }

            .message-avatar.user {
                background: #334155;
                color: white;
            }

            .message-content {
                max-width: 75%;
                padding: 12px 16px;
                border-radius: 16px;
                line-height: 1.6;
                font-size: 0.95rem;
            }

            .message-content.assistant {
                background: #1e293b;
                color: #e2e8f0;
                border: 1px solid rgba(148, 163, 184, 0.2);
            }

            .message-content.user {
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                color: white;
            }

            .message-content a {
                color: #fbbf24;
                text-decoration: none;
                font-weight: 600;
                border-bottom: 1px solid currentColor;
            }

            .message-content a:hover {
                color: #fcd34d;
            }

            .message-content.assistant a {
                color: #60a5fa;
            }

            .message-content.assistant a:hover {
                color: #93c5fd;
            }

            .quick-actions {
                padding: 12px 16px;
                background: #1e293b;
                border-top: 1px solid rgba(148, 163, 184, 0.2);
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .quick-action-btn {
                background: rgba(249, 115, 22, 0.1);
                border: 1px solid rgba(249, 115, 22, 0.3);
                color: #f97316;
                padding: 8px 14px;
                border-radius: 20px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
            }

            .quick-action-btn:hover {
                background: rgba(249, 115, 22, 0.2);
                border-color: rgba(249, 115, 22, 0.5);
                transform: translateY(-2px);
            }

            .chat-input-container {
                padding: 16px;
                background: #1e293b;
                border-top: 1px solid rgba(148, 163, 184, 0.2);
                display: flex;
                gap: 10px;
            }

            .chat-input {
                flex: 1;
                background: #0f172a;
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 24px;
                padding: 12px 18px;
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

            .chat-send {
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                border: none;
                color: white;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .chat-send:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 16px rgba(249, 115, 22, 0.4);
            }

            .chat-send:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .typing-indicator {
                display: flex;
                gap: 4px;
                padding: 8px 0;
            }

            .typing-dot {
                width: 8px;
                height: 8px;
                background: #f97316;
                border-radius: 50%;
                animation: typingBounce 1.4s infinite;
            }

            .typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typingBounce {
                0%, 60%, 100% {
                    transform: translateY(0);
                }
                30% {
                    transform: translateY(-10px);
                }
            }

            @media (max-width: 480px) {
                .chat-window {
                    width: calc(100vw - 32px);
                    height: calc(100vh - 100px);
                    bottom: 76px;
                    right: 16px;
                }

                .portfolio-assistant-container {
                    bottom: 16px;
                    right: 16px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    createWidget() {
        const container = document.createElement('div');
        container.className = 'portfolio-assistant-container';
        container.innerHTML = `
            <button class="assistant-button" id="assistant-toggle" aria-label="Open Site Guide">
                <div class="assistant-pulse"></div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>
            <div class="chat-window" id="chat-window">
                <div class="chat-header">
                    <div class="chat-header-left">
                        <div class="chat-header-icon">🧭</div>
                        <div class="chat-header-text">
                            <h3>Site Guide</h3>
                            <p>Navigate Ken's Portfolio</p>
                        </div>
                    </div>
                    <button class="chat-close" id="chat-close" aria-label="Close">✕</button>
                </div>
                <div class="chat-messages" id="chat-messages"></div>
                <div class="quick-actions" id="quick-actions">
                    <button class="quick-action-btn" data-action="recruiter">👔 I'm a Recruiter</button>
                    <button class="quick-action-btn" data-action="engineer">💻 I'm an Engineer</button>
                    <button class="quick-action-btn" data-action="client">🏢 Potential Client</button>
                    <button class="quick-action-btn" data-action="interactive">⚡ Show Interactive Demos</button>
                </div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" id="chat-input" placeholder="Ask me anything about the portfolio..." />
                    <button class="chat-send" id="chat-send" aria-label="Send">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addEventListeners() {
        const toggleBtn = document.getElementById('assistant-toggle');
        const closeBtn = document.getElementById('chat-close');
        const sendBtn = document.getElementById('chat-send');
        const input = document.getElementById('chat-input');
        const quickActions = document.getElementById('quick-actions');

        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        quickActions.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action-btn')) {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('chat-window');
        const toggleBtn = document.getElementById('assistant-toggle');

        if (this.isOpen) {
            chatWindow.classList.add('open');
            toggleBtn.classList.add('active');
        } else {
            chatWindow.classList.remove('open');
            toggleBtn.classList.remove('active');
        }
    }

    displayWelcomeMessage() {
        const welcomeMsg = `👋 Welcome to Ken McKenzie's portfolio!

I'm your intelligent site guide. I can help you navigate this extensive portfolio based on your interests.

What brings you here today?`;

        this.addMessage(welcomeMsg, 'assistant');
    }

    handleQuickAction(action) {
        const responses = {
            recruiter: {
                user: "I'm a recruiter looking to evaluate Ken's qualifications",
                assistant: `Perfect! Here's your **5-minute quick path** ⏱️:

**1. Interactive Demos** (2 min) ⚡
<a href="/brahan-vertex-interactive.html" target="_blank">→ Live Code Demonstrations</a>
See working React code, physics-informed ML, and voice commands

**2. Homepage** (1 min) 📊
<a href="/index.html" target="_blank">→ Professional Overview</a>
See KPIs, technical skills, engagement models

**3. About Page** (2 min) 👤
<a href="/about.html" target="_blank">→ 30-Year Journey</a>
Understand the career evolution

**Want more depth?** I can show you:
• Full Brahan Vertex Application
• Training Academy (4 modules)
• Architecture Documentation`
            },
            engineer: {
                user: "I'm an engineer wanting to review the technical work",
                assistant: `Great! Here's your **technical deep dive** 🔧:

**1. Architecture Docs** (5 min) 📐
<a href="/brahan-vertex-builds.html" target="_blank">→ Engineering Decision Logs</a>
10,000+ words, GCP architecture, Mermaid diagrams

**2. Interactive Demos** (5 min) ⚡
<a href="/brahan-vertex-interactive.html" target="_blank">→ Live React Components</a>
Execute code, test physics override, voice commands

**3. Full Application** (10 min) 🚀
<a href="/brahan-vertex.html" target="_blank">→ Brahan Vertex Engine</a>
Explore Training Academy with 4 integrated modules

**4. GitHub Repos** 💻
• <a href="https://github.com/kenmck3772/welltegra.network" target="_blank">Main Project</a>
• <a href="https://github.com/kenmck3772/Hydrostatic-concept" target="_blank">Hydrostatic Training</a>
• <a href="https://github.com/kenmck3772/3d-wellbore" target="_blank">3D Wellbore Visualizer</a>

What interests you most?`
            },
            client: {
                user: "I'm a potential client exploring capabilities",
                assistant: `Welcome! Let me show you Ken's **proven capabilities** 🎯:

**1. See It Working** (3 min) 🚀
<a href="/brahan-vertex.html" target="_blank">→ Brahan Vertex Engine</a>
Production-ready cloud ML system

**2. Explore Training Academy** (10 min) 🎓
Launch Brahan Vertex → Click "Training" tab
• Hydrostatic Training Academy
• AI-Powered Integrity Monitoring
• 3D Well Design Tools
• Toolstring Assembly System

**3. Review Track Record** (2 min) 📊
<a href="/index.html" target="_blank">→ Homepage KPIs</a>
See results and engagement models

**Ready to discuss your project?**
<a href="/index.html#engagement" target="_blank">→ View Engagement Models</a>

What challenges are you looking to solve?`
            },
            interactive: {
                user: "Show me the interactive demos",
                assistant: `Perfect! Here are the **live interactive demonstrations** ⚡:

**🔬 Physics-Informed ML Demo**
<a href="/brahan-vertex-interactive.html" target="_blank">→ Launch Interactive Demos</a>
• Toggle physics mode on/off
• Watch ML scores get overridden in real-time
• See live metrics and safety locks

**🎓 Closed-Loop Training Demo**
• Trigger procedural violations
• Watch automatic training redirect
• View real-time event logs

**🎙️ Voice Command Demo**
• Type or speak commands
• Test natural language processing
• Experience hands-free interface

**Want to explore the full system?**
<a href="/brahan-vertex.html" target="_blank">→ Launch Brahan Vertex App</a>

Then navigate to Training tab for 4 complete modules!`
            }
        };

        const response = responses[action];
        if (response) {
            this.addMessage(response.user, 'user');
            setTimeout(() => {
                this.addMessage(response.assistant, 'assistant');
            }, 500);
        }
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message) return;

        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate AI response (you can replace this with actual API call)
        await this.generateResponse(message);
    }

    async generateResponse(userMessage) {
        const lowerMsg = userMessage.toLowerCase();
        let response = '';

        // Smart routing based on keywords
        if (lowerMsg.includes('recruiter') || lowerMsg.includes('hiring') || lowerMsg.includes('job')) {
            response = `I see you're interested from a hiring perspective! 👔

**Quick Evaluation Path:**
1. <a href="/brahan-vertex-interactive.html" target="_blank">Interactive Demos</a> - See working code (2 min)
2. <a href="/index.html" target="_blank">Homepage</a> - Review KPIs and skills (1 min)
3. <a href="/about.html" target="_blank">About</a> - Understand the journey (2 min)

Want to dive deeper into specific technical areas?`;
        } else if (lowerMsg.includes('interactive') || lowerMsg.includes('demo') || lowerMsg.includes('working')) {
            response = `**Interactive Demonstrations** ⚡

<a href="/brahan-vertex-interactive.html" target="_blank">→ Launch Live Demos</a>

You'll see:
• Physics-Informed ML override (toggle to watch)
• Closed-loop training trigger (click to activate)
• Voice command simulator (type or speak)

All code is executable - not just screenshots!`;
        } else if (lowerMsg.includes('training') || lowerMsg.includes('academy') || lowerMsg.includes('module')) {
            response = `**Training Academy** 🎓 (4 Complete Modules)

Access via: <a href="/brahan-vertex.html" target="_blank">Brahan Vertex App</a> → Training Tab

**Modules:**
1. **Hydrostatic Training** - IADC/IWCF standards, simulator, exam prep
2. **Integrity Hub** - AI-powered predictive monitoring with Gemini
3. **Wellbore Visualizer** - 3D well design and survey data
4. **Toolstring Assembler** - Interactive physics validation

Each is a complete, production-ready application!`;
        } else if (lowerMsg.includes('architecture') || lowerMsg.includes('technical') || lowerMsg.includes('engineering')) {
            response = `**Technical Deep Dive** 🔧

<a href="/brahan-vertex-builds.html" target="_blank">→ Architecture Documentation</a>

Includes:
• 10,000+ word engineering decision logs
• GCP cloud architecture (Mermaid diagrams)
• Performance benchmarks (<500ms latency)
• CI/CD pipeline details
• Code examples with rationale

Perfect for technical reviewers!`;
        } else if (lowerMsg.includes('client') || lowerMsg.includes('business') || lowerMsg.includes('hire')) {
            response = `**For Potential Clients** 🏢

**See Capabilities:**
1. <a href="/brahan-vertex.html" target="_blank">Brahan Vertex Engine</a> - Production system
2. Training Academy - 4 integrated modules (launch from app)
3. <a href="/index.html#engagement" target="_blank">Engagement Models</a> - How we work together

**Track Record:**
• Sub-500ms latency in production
• 99.9% uptime architecture
• Scale-to-zero cost optimization
• 30 years domain expertise

What challenges are you solving?`;
        } else if (lowerMsg.includes('3d') || lowerMsg.includes('visualiz') || lowerMsg.includes('graphics')) {
            response = `**3D Visualization Suite** 🌐

Access via <a href="/brahan-vertex.html" target="_blank">Brahan Vertex</a> → Training Tab:

**3D Wellbore Visualizer:**
• Interactive well deviation paths
• Drag-and-drop schematic editor
• Real-time MD/TVD calculations
• Multi-well project management

**3D Toolstring Assembler:**
• Physics-based component validation
• Clearance checks and compatibility
• Bill of Materials generation
• Comprehensive component database

Both use Three.js with WebGL rendering!`;
        } else {
            response = `I can help you navigate to:

**Quick Links:**
• <a href="/brahan-vertex-interactive.html" target="_blank">⚡ Interactive Demos</a> - See code working
• <a href="/brahan-vertex.html" target="_blank">🚀 Brahan Vertex App</a> - Full system + Training Academy
• <a href="/brahan-vertex-builds.html" target="_blank">📐 Architecture Docs</a> - Technical deep dive
• <a href="/index.html" target="_blank">🏠 Homepage</a> - Overview and KPIs
• <a href="/about.html" target="_blank">👤 About</a> - 30-year journey

**Or tell me:**
• Your role (recruiter/engineer/client)
• What interests you
• How much time you have

How can I help?`;
        }

        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.hideTypingIndicator();
        this.addMessage(response, 'assistant');
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar assistant">🧭</div>
            <div class="message-content assistant">
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
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;

        const avatar = sender === 'assistant' ? '🧭' : '👤';
        messageDiv.innerHTML = `
            <div class="message-avatar ${sender}">${avatar}</div>
            <div class="message-content ${sender}">${this.parseMarkdown(content)}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    parseMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PortfolioAssistant();
    });
} else {
    new PortfolioAssistant();
}
