/**
 * WellTegra AI Assistant - Simple Contact Button
 */
(function() {
    'use strict';

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
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-size: 28px;
        }
        .chat-fab:hover {
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(styles);

    // Create floating button
    const fab = document.createElement('button');
    fab.className = 'chat-fab';
    fab.id = 'chatFab';
    fab.innerHTML = '💬';
    fab.title = 'Contact Ken McKenzie';
    fab.onclick = function() {
        // Simple contact instead of chatbot - focus on business
        window.location.href = '#contact';
    };
    document.body.appendChild(fab);

    console.log('✅ WellTegra AI Assistant loaded!');
})();