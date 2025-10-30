/**
 * Unit tests for crypto-utils.js
 * Run with: npm test tests/unit/crypto-utils.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('Crypto Utilities', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000/index.html');
    });

    test.describe('isCryptoAvailable', () => {
        test('should return true in modern browsers', async ({ page }) => {
            const available = await page.evaluate(() => {
                return isCryptoAvailable();
            });

            expect(available).toBe(true);
        });
    });

    test.describe('Encryption/Decryption', () => {
        test('should encrypt and decrypt data', async ({ page }) => {
            const result = await page.evaluate(async () => {
                const password = 'test-password-123';
                const plaintext = 'Hello, World!';

                // Encrypt
                const encrypted = await encryptData(plaintext, password);

                // Decrypt
                const decrypted = await decryptData(encrypted, password);

                return {
                    plaintext,
                    encrypted,
                    decrypted,
                    matches: plaintext === decrypted
                };
            });

            expect(result.matches).toBe(true);
            expect(result.encrypted).not.toBe(result.plaintext);
            expect(result.decrypted).toBe(result.plaintext);
        });

        test('should fail with wrong password', async ({ page }) => {
            const error = await page.evaluate(async () => {
                try {
                    const encrypted = await encryptData('secret', 'password1');
                    await decryptData(encrypted, 'wrong-password');
                    return null;
                } catch (e) {
                    return e.message;
                }
            });

            expect(error).toBeTruthy();
            expect(error).toContain('decrypt');
        });

        test('should handle special characters', async ({ page }) => {
            const result = await page.evaluate(async () => {
                const plaintext = '{"key": "value", "emoji": "🔒", "special": "<>&\'"}';
                const encrypted = await encryptData(plaintext, 'pass');
                const decrypted = await decryptData(encrypted, 'pass');
                return decrypted === plaintext;
            });

            expect(result).toBe(true);
        });
    });

    test.describe('Secure Storage', () => {
        test('should store and retrieve encrypted data', async ({ page }) => {
            const result = await page.evaluate(async () => {
                const data = { user: 'test', token: '123456' };

                // Set
                await secureSet('test-key', data, 'password');

                // Get
                const retrieved = await secureGet('test-key', null, 'password');

                return {
                    original: data,
                    retrieved,
                    matches: JSON.stringify(data) === JSON.stringify(retrieved)
                };
            });

            expect(result.matches).toBe(true);
        });

        test('should return default value for missing key', async ({ page }) => {
            const result = await page.evaluate(async () => {
                return await secureGet('non-existent-key', { default: true });
            });

            expect(result).toEqual({ default: true });
        });

        test('should mark data as encrypted', async ({ page }) => {
            const isEncrypted = await page.evaluate(async () => {
                await secureSet('test-key-2', { test: true });
                return localStorage.getItem('test-key-2_encrypted') === 'true';
            });

            expect(isEncrypted).toBe(true);
        });
    });

    test.describe('hashData', () => {
        test('should generate consistent hash', async ({ page }) => {
            const result = await page.evaluate(async () => {
                const data = 'test-data';
                const hash1 = await hashData(data);
                const hash2 = await hashData(data);

                return {
                    hash1,
                    hash2,
                    matches: hash1 === hash2,
                    isHex: /^[0-9a-f]{64}$/.test(hash1)
                };
            });

            expect(result.matches).toBe(true);
            expect(result.isHex).toBe(true);
            expect(result.hash1.length).toBe(64); // SHA-256 produces 64 hex chars
        });

        test('should generate different hashes for different data', async ({ page }) => {
            const result = await page.evaluate(async () => {
                const hash1 = await hashData('data1');
                const hash2 = await hashData('data2');

                return {
                    hash1,
                    hash2,
                    different: hash1 !== hash2
                };
            });

            expect(result.different).toBe(true);
        });
    });

    test.describe('generateSessionKey', () => {
        test('should generate unique session keys', async ({ page }) => {
            const result = await page.evaluate(() => {
                const key1 = generateSessionKey();
                const key2 = generateSessionKey();

                return {
                    key1,
                    key2,
                    different: key1 !== key2,
                    hasUUID: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(key1)
                };
            });

            expect(result.different).toBe(true);
            expect(result.hasUUID).toBe(true);
        });

        test('should store session ID', async ({ page }) => {
            const hasSessionId = await page.evaluate(() => {
                generateSessionKey();
                return sessionStorage.getItem('sessionId') !== null;
            });

            expect(hasSessionId).toBe(true);
        });
    });

    test.describe('Migration', () => {
        test('should migrate unencrypted data', async ({ page }) => {
            const result = await page.evaluate(async () => {
                // Store unencrypted data
                localStorage.setItem('legacy-key', JSON.stringify({ old: true }));

                // Migrate
                const migrationResult = await migrateToEncrypted(['legacy-key']);

                // Verify encrypted
                const isEncrypted = localStorage.getItem('legacy-key_encrypted') === 'true';

                return {
                    success: migrationResult.success.includes('legacy-key'),
                    isEncrypted
                };
            });

            expect(result.success).toBe(true);
            expect(result.isEncrypted).toBe(true);
        });

        test('should skip already encrypted data', async ({ page }) => {
            const result = await page.evaluate(async () => {
                // Set encrypted data
                await secureSet('already-encrypted', { data: true });

                // Try to migrate again
                const migrationResult = await migrateToEncrypted(['already-encrypted']);

                return migrationResult.skipped.includes('already-encrypted');
            });

            expect(result).toBe(true);
        });
    });
});
