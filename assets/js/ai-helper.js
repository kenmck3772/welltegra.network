/**
 * Welltegra AI Assistant
 * Provides AI-powered assistance using Google Gemini API with Google Search grounding
 * and Firebase for message persistence
 */

// ===== CONFIGURATION =====
// TODO: Replace these with your actual configuration values

const AI_CONFIG = {
    // Firebase Configuration
    // Get this from your Firebase Console: Project Settings > General > Your apps > Firebase SDK snippet
    firebaseConfig: {
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef123456"
    },

    // Gemini API Key
    // Get this from: https://aistudio.google.com/app/apikey
    geminiApiKey: "YOUR_GEMINI_API_KEY",

    // App ID for Firebase collections
    appId: "welltegra-ai-assistant",

    // Custom auth token (optional, will use anonymous auth if not provided)
    initialAuthToken: null
};

// ===== GLOBAL STATE =====
let db = null;
let auth = null;
let userId = null;
let isAuthReady = false;
let isFirebaseInitialized = false;

// ===== FIREBASE INITIALIZATION =====

/**
 * Dynamically loads Firebase SDK modules
 */
async function loadFirebaseSDK() {
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
        const { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
        const { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");

        return {
            initializeApp,
            getAuth,
            signInAnonymously,
            signInWithCustomToken,
            onAuthStateChanged,
            getFirestore,
            collection,
            addDoc,
            query,
            orderBy,
            limit,
            onSnapshot,
            serverTimestamp
        };
    } catch (error) {
        console.error("Failed to load Firebase SDK:", error);
        throw error;
    }
}

/**
 * Initializes Firebase and sets up authentication
 */
async function initializeFirebase() {
    const messageContainer = document.getElementById('ai-chat-messages');

    // Check if Firebase config is provided
    if (!AI_CONFIG.firebaseConfig || AI_CONFIG.firebaseConfig.apiKey === "YOUR_FIREBASE_API_KEY") {
        console.warn("Firebase not configured. Message persistence will not work.");
        document.getElementById('ai-user-id-display').textContent = 'Offline Mode';
        return false;
    }

    try {
        const firebase = await loadFirebaseSDK();

        // Initialize Firebase
        const app = firebase.initializeApp(AI_CONFIG.firebaseConfig);
        db = firebase.getFirestore(app);
        auth = firebase.getAuth(app);

        // Authenticate user
        try {
            if (AI_CONFIG.initialAuthToken) {
                await firebase.signInWithCustomToken(auth, AI_CONFIG.initialAuthToken);
            } else {
                await firebase.signInAnonymously(auth);
            }
        } catch (error) {
            console.error("Firebase authentication failed:", error);
            // Fallback to anonymous if custom token fails
            try {
                await firebase.signInAnonymously(auth);
            } catch (anonError) {
                console.error("Anonymous sign-in also failed:", anonError);
                throw anonError;
            }
        }

        // Set up auth state listener
        firebase.onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                isAuthReady = true;
                console.log("Authenticated User ID:", userId);
                document.getElementById('ai-user-id-display').textContent = `User ID: ${userId.substring(0, 8)}...`;
                setupChatListener(firebase);
            } else {
                console.log("User is signed out.");
                isAuthReady = false;
                userId = crypto.randomUUID();
                document.getElementById('ai-user-id-display').textContent = `Anonymous: ${userId.substring(0, 8)}...`;
            }
        });

        // Store Firebase modules globally
        window.firebaseModules = firebase;
        isFirebaseInitialized = true;
        return true;

    } catch (error) {
        console.error("Firebase initialization failed:", error);
        document.getElementById('ai-user-id-display').textContent = 'Offline Mode';
        messageContainer.innerHTML += '<div class="flex justify-start"><div class="bg-red-900/50 border border-red-700 p-3 rounded-xl max-w-lg shadow"><p class="text-red-300 text-sm">Error: Could not initialize Firebase. Message history will not be saved.</p></div></div>';
        return false;
    }
}

/**
 * Sets up real-time listener for chat messages from Firestore
 */
function setupChatListener(firebase) {
    if (!db || !userId || !isAuthReady) return;

    const chatCollectionPath = `/artifacts/${AI_CONFIG.appId}/users/${userId}/messages`;
    const q = firebase.query(
        firebase.collection(db, chatCollectionPath),
        firebase.orderBy('timestamp', 'asc'),
        firebase.limit(50)
    );

    firebase.onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push(doc.data());
        });
        renderMessages(messages);
    }, (error) => {
        console.error("Error listening to Firestore:", error);
        const messageContainer = document.getElementById('ai-chat-messages');
        messageContainer.innerHTML += '<div class="flex justify-start"><div class="bg-red-900/50 border border-red-700 p-3 rounded-xl max-w-lg shadow"><p class="text-red-300 text-sm">Error loading messages. See console for details.</p></div></div>';
    });
}

/**
 * Saves a message to Firestore
 */
async function saveMessage(text, role, sources = []) {
    if (!db || !userId || !isAuthReady || !isFirebaseInitialized) {
        console.warn("Firebase not ready. Cannot save message.");
        return;
    }

    try {
        const firebase = window.firebaseModules;
        const chatCollectionPath = `/artifacts/${AI_CONFIG.appId}/users/${userId}/messages`;
        await firebase.addDoc(firebase.collection(db, chatCollectionPath), {
            text: text,
            role: role,
            sources: sources,
            timestamp: firebase.serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving message:", error);
    }
}

// ===== GEMINI API =====

/**
 * Calls the Gemini API to get an AI response with Google Search grounding
 */
async function getAiResponse(prompt) {
    // Check if API key is configured
    if (!AI_CONFIG.geminiApiKey || AI_CONFIG.geminiApiKey === "YOUR_GEMINI_API_KEY") {
        return {
            text: "⚠️ Gemini API key not configured. Please add your API key in the ai-helper.js file.\n\nGet your free API key at: https://aistudio.google.com/app/apikey",
            sources: []
        };
    }

    const systemPrompt = "You are the Welltegra Network Assistant. Your primary goal is to provide accurate, helpful, and concise information about welltegra.network services and operations. When needed, use the search tool to find the most current information. Always format your responses using Markdown.";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${AI_CONFIG.geminiApiKey}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    const maxRetries = 3;
    let currentDelay = 1000;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429 && i < maxRetries - 1) {
                    console.warn(`Rate limit exceeded. Retrying in ${currentDelay / 1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, currentDelay));
                    currentDelay *= 2;
                    continue;
                }

                const errorText = await response.text();
                console.error("Gemini API error:", errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                const text = candidate.content.parts[0].text;

                let sources = [];
                const groundingMetadata = candidate.groundingMetadata;
                if (groundingMetadata && groundingMetadata.groundingAttributions) {
                    sources = groundingMetadata.groundingAttributions
                        .map(attribution => ({
                            uri: attribution.web?.uri,
                            title: attribution.web?.title,
                        }))
                        .filter(source => source.uri && source.title);
                }

                return { text, sources };
            } else {
                return { text: "I apologize, the AI generated an empty response.", sources: [] };
            }
        } catch (error) {
            console.error("Gemini API call failed:", error);
            if (i === maxRetries - 1) {
                return { text: "I'm having trouble connecting to the AI service right now. Please try again in a moment.", sources: [] };
            }
            await new Promise(resolve => setTimeout(resolve, currentDelay));
            currentDelay *= 2;
        }
    }
}

// ===== UI FUNCTIONS =====

/**
 * Safely escapes HTML for display
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Renders the chat history
 */
function renderMessages(messages) {
    const messageContainer = document.getElementById('ai-chat-messages');

    // Save initial welcome message
    const welcomeMsg = messageContainer.querySelector('.flex.justify-start');

    // Clear container
    messageContainer.innerHTML = '';

    // Re-add welcome message
    if (welcomeMsg) {
        messageContainer.appendChild(welcomeMsg);
    }

    // Render all messages
    messages.forEach(msg => {
        const messageHtml = createMessageElement(msg.text, msg.role, msg.sources);
        messageContainer.appendChild(messageHtml);
    });

    // Scroll to bottom
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

/**
 * Creates an individual message element
 */
function createMessageElement(text, role, sources = []) {
    const isUser = role === 'user';
    const alignment = isUser ? 'justify-end' : 'justify-start';
    const bgColor = isUser ? 'bg-purple-600' : 'bg-slate-800/90';
    const nameColor = isUser ? 'text-purple-200' : 'text-purple-400';
    const name = isUser ? 'You' : 'AI Assistant';

    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${alignment}`;

    let content = `
        <div class="${bgColor} p-3 rounded-xl max-w-3xl shadow">
            <p class="font-semibold ${nameColor} mb-1">${name}</p>
            <div class="whitespace-pre-wrap">${escapeHtml(text)}</div>
    `;

    // Add sources if available
    if (!isUser && sources && sources.length > 0) {
        const sourceList = sources.map(source => `
            <li>
                <a href="${escapeHtml(source.uri)}" target="_blank" rel="noopener noreferrer" class="text-sm text-blue-300 hover:text-blue-200 underline">
                    ${escapeHtml(source.title || source.uri)}
                </a>
            </li>
        `).join('');

        content += `
            <div class="mt-2 pt-2 border-t border-slate-600">
                <p class="text-xs font-semibold text-slate-400">Sources:</p>
                <ul class="list-disc pl-5 space-y-1 text-sm">
                    ${sourceList}
                </ul>
            </div>
        `;
    }

    content += `</div>`;
    messageDiv.innerHTML = content;
    return messageDiv;
}

/**
 * Main function to handle sending a message
 */
window.sendAiMessage = async function() {
    const userInput = document.getElementById('ai-user-input');
    const sendButton = document.getElementById('ai-send-button');
    const messageContainer = document.getElementById('ai-chat-messages');

    const prompt = userInput.value.trim();
    if (prompt === "") return;

    // Disable input
    sendButton.disabled = true;
    userInput.disabled = true;
    userInput.value = '';

    // Add user message to UI
    const userMessage = createMessageElement(prompt, 'user');
    messageContainer.appendChild(userMessage);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Save user message if Firebase is available
    if (isFirebaseInitialized) {
        await saveMessage(prompt, 'user');
    }

    // Add loading message
    const loadingMessage = createMessageElement("Searching the Welltegra Knowledge Base... 🔍", 'model');
    messageContainer.appendChild(loadingMessage);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Get AI response
    const { text: aiResponseText, sources: aiSources } = await getAiResponse(prompt);

    // Remove loading message
    messageContainer.removeChild(loadingMessage);

    // Add AI response to UI
    const aiMessage = createMessageElement(aiResponseText, 'model', aiSources);
    messageContainer.appendChild(aiMessage);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Save AI message if Firebase is available
    if (isFirebaseInitialized) {
        await saveMessage(aiResponseText, 'model', aiSources);
    }

    // Re-enable input
    sendButton.disabled = false;
    userInput.disabled = false;
    userInput.focus();
};

// ===== INITIALIZATION =====

/**
 * Initializes the AI Assistant when the view is shown
 */
async function initializeAiAssistant() {
    if (window.aiAssistantInitialized) return;

    console.log("Initializing AI Assistant...");

    // Try to initialize Firebase
    await initializeFirebase();

    window.aiAssistantInitialized = true;
}

// Initialize when the AI Helper view is first shown
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            const aiHelperView = document.getElementById('ai-helper-view');
            if (aiHelperView && !aiHelperView.classList.contains('hidden')) {
                initializeAiAssistant();
            }
        });
    });

    const aiHelperView = document.getElementById('ai-helper-view');
    if (aiHelperView) {
        observer.observe(aiHelperView, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
});
