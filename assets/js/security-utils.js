/**
 * Security Utilities for Well-Tegra
 * Provides input sanitization and safe DOM manipulation
 */

/**
 * Sanitizes HTML string to prevent XSS attacks
 * Removes script tags, event handlers, and dangerous attributes
 * @param {string} html - The HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
function sanitizeHTML(html) {
    if (typeof html !== 'string') {
        return '';
    }

    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.textContent = html; // First escape everything as text
    const text = temp.innerHTML;

    // Allow only specific safe tags and attributes
    const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'span', 'div', 'p', 'br', 'ul', 'ol', 'li', 'a'];
    const allowedAttributes = ['class', 'id', 'href', 'title', 'data-'];

    // Remove script tags and event handlers
    let sanitized = text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:text\/html/gi, '');

    return sanitized;
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text safe for HTML insertion
 */
function escapeHTML(text) {
    if (typeof text !== 'string') {
        return '';
    }

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Safely sets element content using textContent instead of innerHTML
 * @param {HTMLElement} element - Target element
 * @param {string} content - Content to set
 */
function safeSetText(element, content) {
    if (!element || !(element instanceof HTMLElement)) {
        console.warn('safeSetText: Invalid element provided');
        return;
    }
    element.textContent = content || '';
}

/**
 * Safely sets innerHTML with sanitization
 * @param {HTMLElement} element - Target element
 * @param {string} html - HTML content to set
 */
function safeSetHTML(element, html) {
    if (!element || !(element instanceof HTMLElement)) {
        console.warn('safeSetHTML: Invalid element provided');
        return;
    }
    element.innerHTML = sanitizeHTML(html);
}

/**
 * Validates and sanitizes user input
 * @param {string} input - User input to validate
 * @param {Object} options - Validation options
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input, options = {}) {
    if (typeof input !== 'string') {
        return '';
    }

    const {
        maxLength = 1000,
        allowHTML = false,
        trim = true
    } = options;

    let sanitized = input;

    if (trim) {
        sanitized = sanitized.trim();
    }

    if (!allowHTML) {
        sanitized = escapeHTML(sanitized);
    } else {
        sanitized = sanitizeHTML(sanitized);
    }

    if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
function validateEmail(email) {
    if (typeof email !== 'string') {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates numeric PIN
 * @param {string} pin - PIN to validate
 * @param {number} length - Expected PIN length
 * @returns {boolean} - True if valid PIN
 */
function validatePIN(pin, length = 6) {
    if (typeof pin !== 'string') {
        return false;
    }
    const pinRegex = new RegExp(`^\\d{${length}}$`);
    return pinRegex.test(pin);
}

/**
 * Safely parses JSON with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} - Parsed object or default value
 */
function safeJSONParse(jsonString, defaultValue = null) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('JSON parse error:', e);
        return defaultValue;
    }
}

/**
 * Creates a safe DOM element with text content
 * @param {string} tagName - HTML tag name
 * @param {string} textContent - Text content
 * @param {Object} attributes - Element attributes
 * @returns {HTMLElement} - Created element
 */
function createSafeElement(tagName, textContent = '', attributes = {}) {
    const element = document.createElement(tagName);
    element.textContent = textContent;

    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (!key.startsWith('on')) { // Prevent event handler attributes
            element.setAttribute(key, value);
        }
    });

    return element;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sanitizeHTML,
        escapeHTML,
        safeSetText,
        safeSetHTML,
        sanitizeInput,
        validateEmail,
        validatePIN,
        safeJSONParse,
        createSafeElement
    };
}
