/**
 * Toast Notification System
 * Provides visual feedback for success, error, warning, and info messages
 */

(function(window) {
    'use strict';

    /**
     * Toast Manager
     */
    const ToastManager = {
        container: null,
        defaultDuration: 4000,
        maxToasts: 5,

        /**
         * Initialize toast container
         */
        init() {
            if (this.container) return;

            // Create toast container
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.setAttribute('aria-live', 'polite');
            this.container.setAttribute('aria-atomic', 'true');
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
                pointer-events: none;
            `;

            document.body.appendChild(this.container);
            console.log('[Toast] Notification system initialized');
        },

        /**
         * Create and show a toast notification
         * @param {string} message - Toast message
         * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
         * @param {number} duration - Duration in ms (0 = no auto-dismiss)
         * @returns {HTMLElement} Toast element
         */
        show(message, type = 'info', duration = null) {
            this.init();

            const toast = this.createToast(message, type);
            this.container.appendChild(toast);

            // Limit number of toasts
            const toasts = this.container.querySelectorAll('.toast');
            if (toasts.length > this.maxToasts) {
                this.remove(toasts[0]);
            }

            // Trigger animation
            setTimeout(() => {
                toast.classList.add('toast-show');
            }, 10);

            // Auto-dismiss
            if (duration !== 0) {
                const dismissTime = duration || this.defaultDuration;
                setTimeout(() => {
                    this.remove(toast);
                }, dismissTime);
            }

            return toast;
        },

        /**
         * Create toast element
         * @param {string} message - Toast message
         * @param {string} type - Toast type
         * @returns {HTMLElement} Toast element
         */
        createToast(message, type) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.setAttribute('role', 'alert');

            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ⓘ'
            };

            const colors = {
                success: { bg: '#10b981', border: '#059669' },
                error: { bg: '#ef4444', border: '#dc2626' },
                warning: { bg: '#f59e0b', border: '#d97706' },
                info: { bg: '#3b82f6', border: '#2563eb' }
            };

            const color = colors[type] || colors.info;
            const icon = icons[type] || icons.info;

            toast.style.cssText = `
                background: ${color.bg};
                border-left: 4px solid ${color.border};
                color: white;
                padding: 16px 20px;
                border-radius: 8px;
                margin-bottom: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 300px;
                max-width: 400px;
                opacity: 0;
                transform: translateX(400px);
                transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                pointer-events: auto;
                cursor: pointer;
            `;

            toast.innerHTML = `
                <div style="
                    font-size: 20px;
                    font-weight: bold;
                    flex-shrink: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                ">${icon}</div>
                <div style="
                    flex: 1;
                    font-size: 14px;
                    line-height: 1.5;
                    word-wrap: break-word;
                ">${this.escapeHtml(message)}</div>
                <button class="toast-close" style="
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                " aria-label="Close notification">×</button>
            `;

            // Close button handler
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.remove(toast);
            });

            // Click to dismiss
            toast.addEventListener('click', () => {
                this.remove(toast);
            });

            return toast;
        },

        /**
         * Remove a toast
         * @param {HTMLElement} toast - Toast element to remove
         */
        remove(toast) {
            if (!toast || !toast.parentNode) return;

            toast.classList.remove('toast-show');
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(400px)';

            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        },

        /**
         * Clear all toasts
         */
        clearAll() {
            if (!this.container) return;

            const toasts = this.container.querySelectorAll('.toast');
            toasts.forEach(toast => this.remove(toast));
        },

        /**
         * Escape HTML to prevent XSS
         * @param {string} text - Text to escape
         * @returns {string} Escaped text
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        // Convenience methods
        success(message, duration) {
            return this.show(message, 'success', duration);
        },

        error(message, duration) {
            return this.show(message, 'error', duration);
        },

        warning(message, duration) {
            return this.show(message, 'warning', duration);
        },

        info(message, duration) {
            return this.show(message, 'info', duration);
        }
    };

    // Add CSS class for show animation
    const style = document.createElement('style');
    style.textContent = `
        .toast-show {
            opacity: 1 !important;
            transform: translateX(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Export to window
    window.Toast = ToastManager;

    console.log('[Toast] Module loaded');

})(window);
