/**
 * WellTegra AI Assistant - Full Interactive Chatbot
 *
 * A conversational chatbot widget with client-side intelligence
 */
(function() {
    'use strict';

    // Knowledge base - responses about Ken's portfolio
    const KNOWLEDGE_BASE = {
        'ken|about|background|who': {
            response: "I'm Ken McKenzie, a Well Engineer with 10+ years in oil & gas (Chevron, Subsea 7). I'm now building WellTegra - a digital transformation platform for well engineering. I'm also a full-stack developer with skills in Python, JavaScript, GCP, and ML!",
            quickReplies: ["What is Well-Tegra?", "Show me the projects", "Your skills?"]
        },
        'welltegra|well-tegra|vision|platform': {
            response: "Well-Tegra is my Industry 4.0 platform for well engineering - it's like giving the industry 'round wheels' instead of square ones! It includes an Operations Planner, Equipment Catalog, ML Risk Predictions, and historical data analytics. The goal: replace fragmented Excel workflows with an integrated digital twin.",
            quickReplies: ["Show me the planner", "Tell me about ML predictions", "What's a digital twin?"]
        },
        'project|portfolio|built|work': {
            response: "My portfolio includes:\n\n🛠️ Operations Planner - Interactive toolstring builder\n📦 Equipment Catalog - 40+ downhole tools\n🤖 ML Risk Predictor - Stuck-in-hole probability\n📊 BigQuery Analytics - Historical run data\n\nAll deployed on GCP with modern tech stack!",
            quickReplies: ["Tell me about the planner", "ML predictions?", "Tech stack?"]
        },
        'planner|operations|toolstring': {
            response: "The Operations Planner lets you design toolstring configurations interactively. It auto-calculates clearances, flags risks, and (coming soon) provides ML-powered stuck-in-hole predictions. Try it at welltegra.network/planner.html!",
            quickReplies: ["What's the ML model?", "Show equipment catalog", "Tech stack?"]
        },
        'ml|machine learning|predict|model': {
            response: "I built a BigQuery ML model trained on 1000+ synthetic toolstring runs. It predicts stuck-in-hole probability based on tool count, length, clearance, deviation, and jarring capability. Achieves ~83% accuracy with logistic regression!",
            quickReplies: ["How was it trained?", "Can I try it?", "Tell me about the data"]
        },
        'tech|stack|technology|skills': {
            response: "My tech stack:\n\n💻 Frontend: JavaScript, HTML, CSS\n🐍 Backend: Python, Flask\n☁️ Cloud: GCP (BigQuery, Cloud Functions, Cloud Run)\n🤖 ML: BigQuery ML, Vertex AI\n🗄️ Data: BigQuery, ETL pipelines\n🔧 Tools: Git, Docker, gcloud CLI",
            quickReplies: ["Show me the projects", "Tell me about Ken", "Contact info?"]
        },
        'equipment|catalog|tools': {
            response: "The Equipment Catalog has 40+ downhole tools organized by category (fishing, completion, P&A, wireline). Each tool includes specs, applications, and compatibility notes. Check it out at welltegra.network/equipment.html!",
            quickReplies: ["Show me the planner", "What is Well-Tegra?", "ML predictions?"]
        },
        'contact|email|hire|linkedin': {
            response: "📬 Contact me:\n\n✉️ kenmck3772@gmail.com\n💼 LinkedIn: linkedin.com/in/kenmckenzie\n🐙 GitHub: github.com/kenmck3772\n\nI'm interested in full-stack developer roles, especially at Google or in digital transformation!",
            quickReplies: ["Tell me about Ken", "Show me the projects", "Tech stack?"]
        },
        'digital twin|data pool|integration': {
            response: "The Digital Twin concept means every physical well has a complete digital replica - all data, history, and real-time status in one place. The 'Data Pool' collects data from all wells so ML models can learn patterns across the entire fleet. It's Industry 4.0 for oil & gas!",
            quickReplies: ["Tell me about ML", "What is Well-Tegra?", "Show projects"]
        }
    };

    // Inject styles
    const styles = document.createElement('style');
    styles.textContent = `
        .chat-fab {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            border: none;
            border-radius: 50%;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
            cursor: pointer;
            z-index: 9999;
            font-size: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
            overflow: hidden;
            padding: 8px;
        }
        .chat-fab img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        }
        .chat-fab:hover { transform: scale(1.1); }
        .chat-fab.hidden { display: none; }

        .chat-window {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 380px;
            max-height: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            display: none;
            flex-direction: column;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .chat-window.open { display: flex; }

        .chat-header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 16px 16px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .chat-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
        .chat-header .status { font-size: 12px; opacity: 0.9; }
        .close-btn {
            background: transparent;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f9fafb;
            max-height: 400px;
        }

        .message {
            margin-bottom: 16px;
            display: flex;
            gap: 8px;
        }
        .message.bot { flex-direction: row; }
        .message.user { flex-direction: row-reverse; }

        .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            overflow: hidden;
        }
        .message.bot .message-avatar {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            padding: 0;
        }
        .message-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .message-content {
            max-width: 75%;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.5;
            white-space: pre-line;
        }
        .message.bot .message-content {
            background: white;
            border: 1px solid #e5e7eb;
            color: #1f2937;
        }
        .message.user .message-content {
            background: #3b82f6;
            color: white;
        }

        .quick-replies {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
        }
        .quick-reply {
            background: white;
            border: 1px solid #3b82f6;
            color: #3b82f6;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .quick-reply:hover {
            background: #3b82f6;
            color: white;
        }

        .chat-input-area {
            padding: 16px;
            background: white;
            border-top: 1px solid #e5e7eb;
            border-radius: 0 0 16px 16px;
        }
        .chat-input-wrapper {
            display: flex;
            gap: 8px;
        }
        .chat-input {
            flex: 1;
            padding: 10px 14px;
            border: 1px solid #d1d5db;
            border-radius: 24px;
            font-size: 14px;
            outline: none;
        }
        .chat-input:focus { border-color: #3b82f6; }
        .send-btn {
            background: #3b82f6;
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .send-btn:hover { background: #2563eb; }

        @media (max-width: 768px) {
            .chat-window {
                bottom: 10px;
                right: 10px;
                left: 10px;
                width: auto;
            }
        }
    `;
    document.head.appendChild(styles);

    // Create chat HTML
    const chatHTML = `
        <button class="chat-fab" id="chatFab">
            <img src="assets/images/brahanbot.png" alt="WellTegra AI Assistant">
        </button>
        <div class="chat-window" id="chatWindow">
            <div class="chat-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="assets/images/brahanbot.png" alt="Bot" style="width: 32px; height: 32px; border-radius: 50%;">
                    <div>
                        <h3>WellTegra AI</h3>
                        <div class="status">Ask me about Ken's portfolio!</div>
                    </div>
                </div>
                <button class="close-btn" id="closeChat">×</button>
            </div>
            <div class="chat-messages" id="chatMessages"></div>
            <div class="chat-input-area">
                <div class="chat-input-wrapper">
                    <input type="text" class="chat-input" id="chatInput" placeholder="Ask me anything...">
                    <button class="send-btn" id="sendBtn">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // Get elements
    const fab = document.getElementById('chatFab');
    const chatWindow = document.getElementById('chatWindow');
    const closeBtn = document.getElementById('closeChat');
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    const messagesDiv = document.getElementById('chatMessages');

    // Open/close functions
    fab.onclick = () => {
        chatWindow.classList.add('open');
        fab.classList.add('hidden');
        if (messagesDiv.children.length === 0) {
            showWelcome();
        }
        chatInput.focus();
    };

    closeBtn.onclick = () => {
        chatWindow.classList.remove('open');
        fab.classList.remove('hidden');
    };

    // Send message
    sendBtn.onclick = () => sendMessage();
    chatInput.onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    function sendMessage(quickReplyText = null) {
        const text = quickReplyText || chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';

        setTimeout(() => {
            const response = getResponse(text);
            addMessage(response.text, 'bot', response.quickReplies);
        }, 500);
    }

    function addMessage(text, sender, quickReplies = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';

        if (sender === 'bot') {
            const img = document.createElement('img');
            img.src = 'assets/images/brahanbot.png';
            img.alt = 'WellTegra AI Assistant';
            avatar.appendChild(img);
        } else {
            avatar.textContent = '👤';
        }

        const wrapper = document.createElement('div');
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = text;
        wrapper.appendChild(content);

        if (quickReplies) {
            const repliesDiv = document.createElement('div');
            repliesDiv.className = 'quick-replies';
            quickReplies.forEach(reply => {
                const btn = document.createElement('button');
                btn.className = 'quick-reply';
                btn.textContent = reply;
                btn.onclick = () => sendMessage(reply);
                repliesDiv.appendChild(btn);
            });
            wrapper.appendChild(repliesDiv);
        }

        msgDiv.appendChild(avatar);
        msgDiv.appendChild(wrapper);
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function getResponse(userMessage) {
        const msg = userMessage.toLowerCase();

        for (const [keywords, data] of Object.entries(KNOWLEDGE_BASE)) {
            const keywordList = keywords.split('|');
            if (keywordList.some(kw => msg.includes(kw))) {
                return {
                    text: data.response,
                    quickReplies: data.quickReplies
                };
            }
        }

        return {
            text: "I can help you learn about:\n\n• Ken McKenzie's background\n• Well-Tegra platform vision\n• Portfolio projects (Planner, ML, Analytics)\n• Tech stack and skills\n• Contact information\n\nWhat would you like to know?",
            quickReplies: ["About Ken", "Well-Tegra vision", "Show projects", "Contact info"]
        };
    }

    function showWelcome() {
        addMessage("Hi! I'm the WellTegra AI Assistant. I can tell you about Ken's portfolio, the Well-Tegra platform, and his projects. What would you like to know?", 'bot', [
            "About Ken",
            "What is Well-Tegra?",
            "Show me the projects"
        ]);
    }

    console.log('✅ WellTegra AI Assistant loaded!');
})();
