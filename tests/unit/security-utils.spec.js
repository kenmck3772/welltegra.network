/**
 * Unit tests for security-utils.js
 * Run with: npm test tests/unit/security-utils.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('Security Utilities', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to a test page that loads security-utils.js
        await page.goto('http://localhost:8000/index.html');
    });

    test.describe('escapeHTML', () => {
        test('should escape HTML special characters', async ({ page }) => {
            const result = await page.evaluate(() => {
                return escapeHTML('<script>alert("XSS")</script>');
            });

            expect(result).not.toContain('<script>');
            expect(result).toContain('&lt;script&gt;');
        });

        test('should escape quotes', async ({ page }) => {
            const result = await page.evaluate(() => {
                return escapeHTML('"Hello" & \'World\'');
            });

            expect(result).toContain('&quot;');
            expect(result).not.toContain('"Hello"');
        });

        test('should handle empty string', async ({ page }) => {
            const result = await page.evaluate(() => {
                return escapeHTML('');
            });

            expect(result).toBe('');
        });

        test('should handle null and undefined', async ({ page }) => {
            const results = await page.evaluate(() => {
                return {
                    null: escapeHTML(null),
                    undefined: escapeHTML(undefined)
                };
            });

            expect(results.null).toBe('');
            expect(results.undefined).toBe('');
        });
    });

    test.describe('sanitizeHTML', () => {
        test('should remove script tags', async ({ page }) => {
            const result = await page.evaluate(() => {
                return sanitizeHTML('<p>Hello</p><script>alert("bad")</script>');
            });

            expect(result).not.toContain('<script>');
            expect(result).toContain('Hello');
        });

        test('should remove event handlers', async ({ page }) => {
            const result = await page.evaluate(() => {
                return sanitizeHTML('<div onclick="alert()">Click</div>');
            });

            expect(result).not.toContain('onclick');
        });

        test('should remove javascript: URLs', async ({ page }) => {
            const result = await page.evaluate(() => {
                return sanitizeHTML('<a href="javascript:alert()">Link</a>');
            });

            expect(result).not.toContain('javascript:');
        });
    });

    test.describe('validateEmail', () => {
        test('should validate correct email', async ({ page }) => {
            const result = await page.evaluate(() => {
                return validateEmail('user@example.com');
            });

            expect(result).toBe(true);
        });

        test('should reject invalid emails', async ({ page }) => {
            const results = await page.evaluate(() => {
                return {
                    noAt: validateEmail('userexample.com'),
                    noDomain: validateEmail('user@'),
                    noUser: validateEmail('@example.com'),
                    empty: validateEmail('')
                };
            });

            expect(results.noAt).toBe(false);
            expect(results.noDomain).toBe(false);
            expect(results.noUser).toBe(false);
            expect(results.empty).toBe(false);
        });
    });

    test.describe('validatePIN', () => {
        test('should validate correct PIN', async ({ page }) => {
            const result = await page.evaluate(() => {
                return validatePIN('123456');
            });

            expect(result).toBe(true);
        });

        test('should reject invalid PINs', async ({ page }) => {
            const results = await page.evaluate(() => {
                return {
                    tooShort: validatePIN('123'),
                    tooLong: validatePIN('1234567'),
                    letters: validatePIN('abc123'),
                    empty: validatePIN('')
                };
            });

            expect(results.tooShort).toBe(false);
            expect(results.tooLong).toBe(false);
            expect(results.letters).toBe(false);
            expect(results.empty).toBe(false);
        });
    });

    test.describe('safeJSONParse', () => {
        test('should parse valid JSON', async ({ page }) => {
            const result = await page.evaluate(() => {
                return safeJSONParse('{"name":"test","value":123}');
            });

            expect(result).toEqual({ name: 'test', value: 123 });
        });

        test('should return default on invalid JSON', async ({ page }) => {
            const result = await page.evaluate(() => {
                return safeJSONParse('invalid json', { error: true });
            });

            expect(result).toEqual({ error: true });
        });

        test('should return null by default on error', async ({ page }) => {
            const result = await page.evaluate(() => {
                return safeJSONParse('invalid');
            });

            expect(result).toBeNull();
        });
    });

    test.describe('createSafeElement', () => {
        test('should create element with safe text', async ({ page }) => {
            const innerHTML = await page.evaluate(() => {
                const el = createSafeElement('div', '<script>alert()</script>', {
                    className: 'test-class'
                });
                return el.innerHTML;
            });

            expect(innerHTML).not.toContain('<script>');
            expect(innerHTML).toContain('&lt;script&gt;');
        });

        test('should not allow event handler attributes', async ({ page }) => {
            const hasOnclick = await page.evaluate(() => {
                const el = createSafeElement('button', 'Click', {
                    onclick: 'alert()'
                });
                return el.hasAttribute('onclick');
            });

            expect(hasOnclick).toBe(false);
        });

        test('should apply className', async ({ page }) => {
            const className = await page.evaluate(() => {
                const el = createSafeElement('div', 'Test', {
                    className: 'my-class another-class'
                });
                return el.className;
            });

            expect(className).toBe('my-class another-class');
        });
    });
});
