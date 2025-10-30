/**
 * Error Handling Utilities for Well-Tegra
 * Provides comprehensive error boundaries and user-friendly error messages
 */

/**
 * Global error handler for uncaught errors
 */
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    showGlobalError('An unexpected error occurred. Please refresh the page.');

    // Prevent default browser error handling
    event.preventDefault();
});

/**
 * Global handler for unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showGlobalError('An error occurred while loading data. Please try again.');

    // Prevent default browser error handling
    event.preventDefault();
});

/**
 * Shows a global error message to the user
 * @param {string} message - Error message to display
 * @param {Object} options - Display options
 */
function showGlobalError(message, options = {}) {
    const {
        duration = 5000,
        type = 'error',
        dismissible = true
    } = options;

    // Remove existing error toast
    const existing = document.getElementById('global-error-toast');
    if (existing) {
        existing.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'global-error-toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    const bgColor = type === 'error' ? 'bg-rose-500' : type === 'warning' ? 'bg-amber-500' : 'bg-blue-500';

    toast.className = `fixed bottom-6 right-6 max-w-md ${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-start gap-3 animate-slide-in`;

    toast.innerHTML = `
        <svg class="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <div class="flex-1">
            <p class="font-semibold">Error</p>
            <p class="text-sm mt-1">${escapeHTML(message)}</p>
        </div>
        ${dismissible ? `
            <button onclick="this.parentElement.remove()" class="flex-shrink-0 hover:opacity-75" aria-label="Dismiss">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        ` : ''}
    `;

    document.body.appendChild(toast);

    // Auto-dismiss after duration
    if (duration > 0) {
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }
}

/**
 * Wraps async functions with error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context description for error messages
 * @returns {Function} - Wrapped function
 */
function withErrorBoundary(fn, context = 'operation') {
    return async function(...args) {
        try {
            return await fn.apply(this, args);
        } catch (error) {
            console.error(`Error in ${context}:`, error);
            showGlobalError(`Failed to ${context}. Please try again.`);
            throw error;
        }
    };
}

/**
 * Validates required DOM elements exist
 * @param {Object} elements - Object with element names as keys and element references as values
 * @throws {Error} - If any required element is missing
 */
function validateRequiredElements(elements) {
    const missing = [];

    Object.entries(elements).forEach(([name, element]) => {
        if (!element) {
            missing.push(name);
        }
    });

    if (missing.length > 0) {
        const error = new Error(`Missing required elements: ${missing.join(', ')}`);
        console.error(error);
        showGlobalError('Page failed to load correctly. Please refresh.');
        throw error;
    }
}

/**
 * Safe wrapper for localStorage operations
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} - True if successful
 */
function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('localStorage set error:', error);
        if (error.name === 'QuotaExceededError') {
            showGlobalError('Storage quota exceeded. Please clear browser data.', { type: 'warning' });
        } else {
            showGlobalError('Failed to save data locally.', { type: 'warning' });
        }
        return false;
    }
}

/**
 * Safe wrapper for localStorage retrieval
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist or parse fails
 * @returns {*} - Retrieved value or default
 */
function safeLocalStorageGet(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('localStorage get error:', error);
        return defaultValue;
    }
}

/**
 * Retry a failed operation with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise} - Result of function
 */
async function retryOperation(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (i < maxRetries) {
                const delay = baseDelay * Math.pow(2, i);
                console.log(`Retry attempt ${i + 1} in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

/**
 * Creates a user-friendly error message from an error object
 * @param {Error} error - Error object
 * @returns {string} - User-friendly message
 */
function getUserFriendlyErrorMessage(error) {
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        return 'Unable to connect. Please check your internet connection.';
    }

    if (error.message.includes('timeout')) {
        return 'Request timed out. Please try again.';
    }

    if (error.name === 'SyntaxError') {
        return 'Data format error. Please contact support.';
    }

    if (error.name === 'TypeError') {
        return 'An internal error occurred. Please refresh the page.';
    }

    return 'An unexpected error occurred. Please try again.';
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showGlobalError,
        withErrorBoundary,
        validateRequiredElements,
        safeLocalStorageSet,
        safeLocalStorageGet,
        retryOperation,
        getUserFriendlyErrorMessage
    };
}
