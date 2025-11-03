/**
 * Integration Tests for Dual-Access Security Architecture
 *
 * Tests:
 * - Authentication and access control
 * - Audit logging and data provenance
 * - ZKP verification
 * - Playground gateway and feature access
 * - Session management
 * - Interest tracking
 */

const { test, expect } = require('@playwright/test');

test.describe('Dual-Access Security Architecture', () => {

    test.describe('Module Loading', () => {
        test('should load all security modules without errors', async ({ page }) => {
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });

            await page.goto('/security-dashboard.html');
            await page.waitForLoadState('networkidle');

            // Check for module loading errors
            expect(errors.filter(e => e.includes('module'))).toHaveLength(0);
        });

        test('should initialize playground gateway', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const gatewayInitialized = await page.evaluate(() => {
                return window.securityDashboard !== undefined &&
                       window.securityDashboard.gateway !== undefined;
            });

            expect(gatewayInitialized).toBe(true);
        });
    });

    test.describe('Authentication & Access Control', () => {
        test('should start in public demo mode', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const accessTier = await page.evaluate(() => {
                return window.securityDashboard.gateway.getCurrentAccessTier();
            });

            expect(accessTier).toBe('public_demo');
        });

        test('should register all feature access levels correctly', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const features = await page.evaluate(() => {
                return window.securityDashboard.gateway.getAllFeatures();
            });

            expect(features.length).toBeGreaterThan(0);

            // Check for public, playground, and enterprise features
            const publicFeatures = features.filter(f => f.accessLevel === 'public');
            const playgroundFeatures = features.filter(f => f.accessLevel === 'playground');
            const enterpriseFeatures = features.filter(f => f.accessLevel === 'enterprise');

            expect(publicFeatures.length).toBeGreaterThan(0);
            expect(playgroundFeatures.length).toBeGreaterThan(0);
            expect(enterpriseFeatures.length).toBeGreaterThan(0);
        });

        test('should allow access to public features', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const accessCheck = await page.evaluate(async () => {
                const result = await window.securityDashboard.gateway.checkFeatureAccess('well_portfolio_view');
                return result;
            });

            expect(accessCheck.hasAccess).toBe(true);
            expect(accessCheck.accessLevel).toBe('public');
        });

        test('should deny access to playground features without auth', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const accessCheck = await page.evaluate(async () => {
                const result = await window.securityDashboard.gateway.checkFeatureAccess('deep_research_models');
                return result;
            });

            expect(accessCheck.hasAccess).toBe(false);
            expect(accessCheck.reason).toContain('Authentication required');
        });

        test('should track demo usage limits', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            // Request multiple features to test limits
            const results = await page.evaluate(async () => {
                const gateway = window.securityDashboard.gateway;
                const requests = [];

                for (let i = 0; i < 5; i++) {
                    const result = await gateway.requestFeatureAccess('well_portfolio_view');
                    requests.push(result);
                }

                return {
                    requests,
                    demoUsage: gateway.demoUsage
                };
            });

            expect(results.demoUsage.featuresAccessed).toBeGreaterThan(0);
        });
    });

    test.describe('Audit Logging', () => {
        test('should log audit events', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const eventLogged = await page.evaluate(async () => {
                const { logAuditEvent } = await import('/assets/js/audit-logger.js');

                await logAuditEvent('user_activity', {
                    type: 'test_event',
                    action: 'test_action',
                    userId: 'test_user_123'
                });

                const events = window.securityDashboard.auditLogger.getRecentEvents(10);
                return events.some(e => e.type === 'test_event');
            });

            expect(eventLogged).toBe(true);
        });

        test('should maintain audit log integrity with chained hashes', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const integrityCheck = await page.evaluate(async () => {
                const auditLogger = window.securityDashboard.auditLogger;

                // Log multiple events
                const { logAuditEvent } = await import('/assets/js/audit-logger.js');
                for (let i = 0; i < 5; i++) {
                    await logAuditEvent('user_activity', {
                        type: 'test_event_' + i,
                        action: 'test'
                    });
                }

                // Verify integrity
                const verification = await auditLogger.verifyLogIntegrity();
                return verification;
            });

            expect(integrityCheck.verified).toBe(true);
            expect(integrityCheck.errors).toHaveLength(0);
        });

        test('should query audit logs by category', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const queryResult = await page.evaluate(async () => {
                const auditLogger = window.securityDashboard.auditLogger;
                const { logAuditEvent } = await import('/assets/js/audit-logger.js');

                // Log events in different categories
                await logAuditEvent('auth', { type: 'login' });
                await logAuditEvent('access', { type: 'feature_access' });
                await logAuditEvent('security', { type: 'security_event' });

                // Query by category
                const authEvents = auditLogger.queryAuditLog({ category: 'auth' });
                const accessEvents = auditLogger.queryAuditLog({ category: 'access' });

                return {
                    authCount: authEvents.length,
                    accessCount: accessEvents.length
                };
            });

            expect(queryResult.authCount).toBeGreaterThan(0);
            expect(queryResult.accessCount).toBeGreaterThan(0);
        });

        test('should generate analytics reports', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const report = await page.evaluate(async () => {
                const auditLogger = window.securityDashboard.auditLogger;
                return auditLogger.generateAnalyticsReport();
            });

            expect(report).toHaveProperty('totalEvents');
            expect(report).toHaveProperty('byCategory');
            expect(report).toHaveProperty('bySeverity');
        });
    });

    test.describe('Data Provenance', () => {
        test('should track data creation', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const tracked = await page.evaluate(async () => {
                const { trackDataProvenance } = await import('/assets/js/audit-logger.js');

                const result = await trackDataProvenance('data_test_001', 'create', {
                    userId: 'test_user',
                    fileName: 'test.csv',
                    fileSize: 1024
                });

                return result !== null && result.dataId === 'data_test_001';
            });

            expect(tracked).toBe(true);
        });

        test('should build data lineage', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const lineage = await page.evaluate(async () => {
                const { trackDataProvenance } = await import('/assets/js/audit-logger.js');
                const auditLogger = window.securityDashboard.auditLogger;

                // Create parent data
                await trackDataProvenance('parent_data_001', 'create', {
                    userId: 'test_user'
                });

                // Create child data with transformation
                await trackDataProvenance('child_data_001', 'transform', {
                    userId: 'test_user',
                    parentDataIds: ['parent_data_001'],
                    transformations: ['normalize', 'aggregate']
                });

                // Query lineage
                const provenance = auditLogger.queryProvenance('child_data_001');
                return provenance;
            });

            expect(lineage).not.toBeNull();
            expect(lineage.parentDataIds).toContain('parent_data_001');
            expect(lineage.lineage.ancestors).toContain('parent_data_001');
        });
    });

    test.describe('ZKP Verification', () => {
        test('should generate commitments', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const commitment = await page.evaluate(async () => {
                const zkpVerification = window.securityDashboard.zkpVerification;

                const result = await zkpVerification.generateCommitment(
                    { wellData: [1, 2, 3, 4, 5] },
                    { dataType: 'well_analysis', userId: 'test_user' }
                );

                return result;
            });

            expect(commitment).toHaveProperty('commitmentId');
            expect(commitment).toHaveProperty('commitmentValue');
            expect(commitment).toHaveProperty('timestamp');
        });

        test('should generate and verify computation proofs', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const verification = await page.evaluate(async () => {
                const zkpVerification = window.securityDashboard.zkpVerification;

                // Generate commitment
                const commitment = await zkpVerification.generateCommitment(
                    { inputData: [1, 2, 3] },
                    { dataType: 'test', userId: 'test_user' }
                );

                // Generate proof
                const proof = await zkpVerification.generateComputationProof({
                    inputCommitmentId: commitment.commitmentId,
                    outputData: { result: 42 },
                    computationFunction: 'test_function',
                    parameters: {},
                    userId: 'test_user',
                    sessionId: 'test_session',
                    name: 'Test Computation',
                    type: 'test'
                });

                // Verify proof
                const verification = await zkpVerification.verifyProof(proof.proofId);

                return verification;
            });

            expect(verification.verified).toBe(true);
            expect(verification.checks.signatureValid).toBe(true);
            expect(verification.checks.commitmentValid).toBe(true);
        });

        test('should generate attestations', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const attestation = await page.evaluate(async () => {
                const zkpVerification = window.securityDashboard.zkpVerification;

                const result = await zkpVerification.generateAttestation({
                    name: 'Test Analysis',
                    type: 'test',
                    operation: 'test_op',
                    inputData: { test: 'data' },
                    outputData: { result: 123 },
                    function: 'test_function',
                    parameters: {},
                    userId: 'test_user',
                    sessionId: 'test_session',
                    dataType: 'test'
                });

                return result;
            });

            expect(attestation).toHaveProperty('attestationId');
            expect(attestation).toHaveProperty('verified');
            expect(attestation.verified).toBe(true);
        });
    });

    test.describe('Feature Usage Tracking', () => {
        test('should track feature usage', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const tracked = await page.evaluate(async () => {
                const gateway = window.securityDashboard.gateway;

                // Request feature access multiple times
                await gateway.requestFeatureAccess('well_portfolio_view');
                await gateway.requestFeatureAccess('well_portfolio_view');
                await gateway.requestFeatureAccess('well_portfolio_view');

                const usage = gateway.featureUsage.get('well_portfolio_view');
                return usage;
            });

            expect(tracked.totalAccesses).toBeGreaterThanOrEqual(3);
            expect(tracked.featureId).toBe('well_portfolio_view');
        });

        test('should track user interests', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const interests = await page.evaluate(async () => {
                const gateway = window.securityDashboard.gateway;

                // Simulate user interactions
                await gateway.requestFeatureAccess('well_portfolio_view', {
                    userId: 'test_user_123'
                });
                await gateway.requestFeatureAccess('basic_visualization', {
                    userId: 'test_user_123'
                });

                const profile = gateway.getUserInterestProfile('test_user_123');
                return profile;
            });

            expect(interests).not.toBeNull();
            expect(interests.totalInteractions).toBeGreaterThan(0);
            expect(interests.topFeatures.length).toBeGreaterThan(0);
        });

        test('should calculate engagement scores', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const score = await page.evaluate(async () => {
                const gateway = window.securityDashboard.gateway;

                // Simulate varied user activity
                const features = ['well_portfolio_view', 'basic_visualization', 'equipment_catalog_browse'];

                for (const feature of features) {
                    for (let i = 0; i < 3; i++) {
                        await gateway.requestFeatureAccess(feature, {
                            userId: 'engaged_user'
                        });
                    }
                }

                const profile = gateway.getUserInterestProfile('engaged_user');
                return profile.engagementScore;
            });

            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(100);
        });
    });

    test.describe('Analytics Dashboard', () => {
        test('should load dashboard without errors', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            // Wait for dashboard to initialize
            await page.waitForSelector('#stat-total-users');

            const stats = await page.evaluate(() => {
                return {
                    totalUsers: document.getElementById('stat-total-users').textContent,
                    activeSessions: document.getElementById('stat-active-sessions').textContent
                };
            });

            expect(stats.totalUsers).toBeDefined();
            expect(stats.activeSessions).toBeDefined();
        });

        test('should display analytics data', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            await page.waitForSelector('#stat-total-users');

            const analytics = await page.evaluate(() => {
                return window.securityDashboard.gateway.getAnalyticsDashboard();
            });

            expect(analytics).toHaveProperty('overview');
            expect(analytics).toHaveProperty('featureUsage');
            expect(analytics).toHaveProperty('userInterests');
            expect(analytics).toHaveProperty('demoUsage');
        });

        test('should switch between tabs', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            // Click on User Analytics tab
            await page.click('[data-tab="users"]');
            await page.waitForTimeout(100);

            const usersTabVisible = await page.isVisible('#users-tab:not(.hidden)');
            expect(usersTabVisible).toBe(true);

            // Click on Feature Usage tab
            await page.click('[data-tab="features"]');
            await page.waitForTimeout(100);

            const featuresTabVisible = await page.isVisible('#features-tab:not(.hidden)');
            expect(featuresTabVisible).toBe(true);
        });

        test('should filter audit log by category', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            // Switch to audit tab
            await page.click('[data-tab="audit"]');
            await page.waitForTimeout(100);

            // Select category filter
            await page.selectOption('#audit-category-filter', 'auth');
            await page.waitForTimeout(100);

            // Check that filter was applied
            const filterValue = await page.inputValue('#audit-category-filter');
            expect(filterValue).toBe('auth');
        });
    });

    test.describe('Session Management', () => {
        test('should track session activities', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const activities = await page.evaluate(async () => {
                const auditLogger = window.securityDashboard.auditLogger;
                const { logAuditEvent } = await import('/assets/js/audit-logger.js');

                const sessionId = 'test_session_123';

                // Log activities for session
                await logAuditEvent('user_activity', {
                    type: 'activity_1',
                    sessionId
                });
                await logAuditEvent('user_activity', {
                    type: 'activity_2',
                    sessionId
                });

                const session = auditLogger.getSessionActivity(sessionId);
                return session;
            });

            expect(activities).not.toBeNull();
            expect(activities.eventCount).toBeGreaterThan(0);
            expect(activities.activities.length).toBeGreaterThan(0);
        });
    });

    test.describe('Export Functionality', () => {
        test('should export audit log as CSV', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const csvExport = await page.evaluate(async () => {
                const auditLogger = window.securityDashboard.auditLogger;
                const { logAuditEvent } = await import('/assets/js/audit-logger.js');

                // Log some events
                await logAuditEvent('auth', { type: 'test_export' });

                // Export as CSV
                const csv = await auditLogger.exportAuditLog('csv');
                return csv;
            });

            expect(csvExport).toContain('Event ID');
            expect(csvExport).toContain('Timestamp');
            expect(csvExport).toContain('Category');
        });

        test('should export audit log as JSON', async ({ page }) => {
            await page.goto('/security-dashboard.html');

            const jsonExport = await page.evaluate(async () => {
                const auditLogger = window.securityDashboard.auditLogger;
                const json = await auditLogger.exportAuditLog('json');
                return JSON.parse(json);
            });

            expect(Array.isArray(jsonExport)).toBe(true);
        });
    });
});
