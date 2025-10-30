/**
 * Cryptography Utilities for Well-Tegra
 * Provides secure encryption/decryption for localStorage data
 * Uses Web Crypto API (SubtleCrypto)
 */

// App-specific salt for key derivation
const APP_SALT = 'welltegra-v23-salt-2025';

/**
 * Generates a cryptographic key from a password using PBKDF2
 * @param {string} password - User password or session key
 * @returns {Promise<CryptoKey>} - Derived encryption key
 */
async function deriveKey(password) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const saltBuffer = encoder.encode(APP_SALT);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    // Derive AES-GCM key
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts data using AES-GCM
 * @param {string} plaintext - Data to encrypt
 * @param {string} password - Encryption password
 * @returns {Promise<string>} - Encrypted data (base64)
 */
async function encryptData(plaintext, password) {
    try {
        const key = await deriveKey(password);
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);

        // Generate random IV (12 bytes for GCM)
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Encrypt
        const encrypted = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            data
        );

        // Combine IV + encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);

        // Convert to base64
        return arrayBufferToBase64(combined);
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypts AES-GCM encrypted data
 * @param {string} encryptedBase64 - Encrypted data (base64)
 * @param {string} password - Decryption password
 * @returns {Promise<string>} - Decrypted plaintext
 */
async function decryptData(encryptedBase64, password) {
    try {
        const key = await deriveKey(password);
        const combined = base64ToArrayBuffer(encryptedBase64);

        // Extract IV (first 12 bytes)
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12);

        // Decrypt
        const decrypted = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encrypted
        );

        // Convert to string
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Converts ArrayBuffer to base64 string
 * @param {ArrayBuffer} buffer - Buffer to convert
 * @returns {string} - Base64 string
 */
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Converts base64 string to ArrayBuffer
 * @param {string} base64 - Base64 string
 * @returns {Uint8Array} - Array buffer
 */
function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/**
 * Generates a secure session key for the current session
 * @returns {string} - Session key
 */
function generateSessionKey() {
    // Use session ID + timestamp + random value
    const sessionId = sessionStorage.getItem('sessionId') || crypto.randomUUID();
    const timestamp = Date.now().toString();
    const random = crypto.randomUUID();

    sessionStorage.setItem('sessionId', sessionId);

    return `${sessionId}-${timestamp}-${random}`;
}

/**
 * Encrypts and stores data in localStorage
 * @param {string} key - Storage key
 * @param {*} data - Data to store (will be JSON stringified)
 * @param {string} password - Optional password (uses session key if not provided)
 * @returns {Promise<boolean>} - True if successful
 */
async function secureSet(key, data, password = null) {
    try {
        const sessionKey = password || generateSessionKey();
        const plaintext = JSON.stringify(data);
        const encrypted = await encryptData(plaintext, sessionKey);

        localStorage.setItem(key, encrypted);

        // Store encrypted flag
        localStorage.setItem(`${key}_encrypted`, 'true');

        return true;
    } catch (error) {
        console.error('Secure set failed:', error);
        return false;
    }
}

/**
 * Retrieves and decrypts data from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @param {string} password - Optional password (uses session key if not provided)
 * @returns {Promise<*>} - Decrypted data or default value
 */
async function secureGet(key, defaultValue = null, password = null) {
    try {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) {
            return defaultValue;
        }

        const isEncrypted = localStorage.getItem(`${key}_encrypted`) === 'true';
        if (!isEncrypted) {
            // Legacy unencrypted data
            return JSON.parse(encrypted);
        }

        const sessionKey = password || generateSessionKey();
        const plaintext = await decryptData(encrypted, sessionKey);
        return JSON.parse(plaintext);
    } catch (error) {
        console.error('Secure get failed:', error);
        return defaultValue;
    }
}

/**
 * Hashes data using SHA-256
 * @param {string} data - Data to hash
 * @returns {Promise<string>} - Hex hash string
 */
async function hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Migrates existing unencrypted localStorage data to encrypted format
 * @param {Array<string>} keys - Keys to migrate
 * @returns {Promise<Object>} - Migration results
 */
async function migrateToEncrypted(keys) {
    const results = {
        success: [],
        failed: [],
        skipped: []
    };

    for (const key of keys) {
        try {
            const isEncrypted = localStorage.getItem(`${key}_encrypted`) === 'true';
            if (isEncrypted) {
                results.skipped.push(key);
                continue;
            }

            const data = localStorage.getItem(key);
            if (!data) {
                results.skipped.push(key);
                continue;
            }

            // Parse and re-encrypt
            const parsed = JSON.parse(data);
            const success = await secureSet(key, parsed);

            if (success) {
                results.success.push(key);
            } else {
                results.failed.push(key);
            }
        } catch (error) {
            console.error(`Migration failed for key ${key}:`, error);
            results.failed.push(key);
        }
    }

    console.log('Migration results:', results);
    return results;
}

/**
 * Checks if Web Crypto API is available
 * @returns {boolean} - True if available
 */
function isCryptoAvailable() {
    return !!(window.crypto && window.crypto.subtle);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        encryptData,
        decryptData,
        secureSet,
        secureGet,
        hashData,
        generateSessionKey,
        migrateToEncrypted,
        isCryptoAvailable
    };
}
