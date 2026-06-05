/**
 * WellTegra AI Assistant - Chatbot Widget
 */
(function() {
    'use strict';

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
            transition: transform 0.2s;
        }
        .chat-fab:hover { transform: scale(1.1); }
    `;
    document.head.appendChild(styles);

    const fab = document.createElement('button');
    fab.className = 'chat-fab';
    fab.innerHTML = '💬';
    fab.title = 'WellTegra AI Assistant';
    fab.onclick = function() {
        alert('🤖 WellTegra AI Assistant\\n\\nHello! I can help you with:\\n\\n• Ken McKenzie\\'s background\\n• Well-Tegra vision\\n• Portfolio projects\\n• ML predictions\\n\\nFull AI interface coming soon!');
    };
    document.body.appendChild(fab);
})();
