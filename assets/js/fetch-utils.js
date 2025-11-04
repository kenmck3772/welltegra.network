/**
 * Fetch Utilities for Well-Tegra
 * Provides robust fetch with error handling, retries, and validation
 */

/**
 * Fetches a resource with automatic retries and error handling
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retry attempts (default: 3)
 * @param {number} retryDelay - Delay between retries in ms (default: 1000)
 * @returns {Promise<Response>} - Fetch response
 */
async function fetchWithRetry(url, options = {}, retries = 3, retryDelay = 1000) {
    let lastError;

    for (let i = 0; i <= retries; i++) {
        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (error) {
            lastError = error;
            console.warn(`Fetch attempt ${i + 1} failed for ${url}:`, error.message);

            // Don't retry on last attempt or for certain errors
            if (i < retries && !isNonRetryableError(error)) {
                await sleep(retryDelay * Math.pow(2, i)); // Exponential backoff
            }
        }
    }

    throw new Error(`Failed to fetch ${url} after ${retries + 1} attempts: ${lastError.message}`);
}

/**
 * Checks if an error should not be retried
 * @param {Error} error - Error to check
 * @returns {boolean} - True if error should not be retried
 */
function isNonRetryableError(error) {
    // Don't retry for client errors (4xx) except 429 (Too Many Requests)
    if (error.message.includes('HTTP 4') && !error.message.includes('HTTP 429')) {
        return true;
    }

    // Don't retry for CORS errors
    if (error.message.includes('CORS') || error.message.includes('NetworkError')) {
        return true;
    }

    return false;
}

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetches JSON with validation
 * @param {string} url - URL to fetch
 * @param {Function} validator - Optional validation function for JSON data
 * @returns {Promise<any>} - Parsed JSON data
 */
async function fetchJSON(url, validator = null) {
    try {
        const response = await fetchWithRetry(url);
        const data = await response.json();

        if (validator && typeof validator === 'function') {
            if (!validator(data)) {
                throw new Error('JSON data failed validation');
            }
        }

        return data;
    } catch (error) {
        console.error(`Failed to fetch JSON from ${url}:`, error);
        throw error;
    }
}

/**
 * Fetches CSV with validation
 * @param {string} url - URL to fetch
 * @param {Object} options - Validation options
 * @returns {Promise<string>} - CSV text data
 */
async function fetchCSV(url, options = {}) {
    const {
        minLines = 1,
        requiredColumns = []
    } = options;

    try {
        const response = await fetchWithRetry(url);
        const text = await response.text();

        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

        if (lines.length < minLines) {
            throw new Error(`CSV has fewer than ${minLines} lines`);
        }

        if (requiredColumns.length > 0 && lines.length > 0) {
            const headers = lines[0].split(',').map(h => h.trim());
            const missingColumns = requiredColumns.filter(col => !headers.includes(col));

            if (missingColumns.length > 0) {
                throw new Error(`CSV missing required columns: ${missingColumns.join(', ')}`);
            }
        }

        return text;
    } catch (error) {
        console.error(`Failed to fetch CSV from ${url}:`, error);
        throw error;
    }
}

/**
 * Handles fetch errors with user-friendly messages
 * @param {Error} error - Error object
 * @param {string} resourceName - Name of resource being fetched
 * @returns {string} - User-friendly error message
 */
function getFetchErrorMessage(error, resourceName = 'resource') {
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        return `Unable to connect to server. Please check your internet connection.`;
    }

    if (error.message.includes('HTTP 404')) {
        return `${resourceName} not found. Please contact support.`;
    }

    if (error.message.includes('HTTP 403')) {
        return `Access denied to ${resourceName}. Please check your permissions.`;
    }

    if (error.message.includes('HTTP 500') || error.message.includes('HTTP 502') || error.message.includes('HTTP 503')) {
        return `Server error. Please try again later.`;
    }

    if (error.message.includes('timeout')) {
        return `Request timed out. Please try again.`;
    }

    return `Failed to load ${resourceName}. Please try again.`;
}

/**
 * Shows error to user in specified element
 * @param {HTMLElement} element - Element to show error in
 * @param {string} message - Error message
 */
function showFetchError(element, message) {
    if (!element) return;

    element.innerHTML = `
        <div class="rounded-lg border border-rose-500/50 bg-rose-500/10 p-4 text-sm text-rose-200">
            <svg class="inline h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            ${escapeHTML(message)}
        </div>
    `;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchWithRetry,
        fetchJSON,
        fetchCSV,
        getFetchErrorMessage,
        showFetchError
    };
}
