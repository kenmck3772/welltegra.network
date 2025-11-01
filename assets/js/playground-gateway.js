/**
 * Playground Access Gateway
 * Manages dual-access model: Public Demo → Private Playground
 *
 * This module provides:
 * - Access tier management and gating
 * - Feature access control based on authentication status
 * - Session-based feature tracking
 * - Seamless transition from demo to playground
 * - Client interest tracking and analytics
 *
 * @module playground-gateway
 * @version 1.0.0
 */

import { AuthAccessControl, ACCESS_TIERS, SESSION_STATES } from './auth-access-control.js';
import { logAuditEvent, trackDataProvenance, EVENT_CATEGORIES } from './audit-logger.js';
import { zkpVerification } from './zkp-verification.js';

/**
 * Feature access levels
 */
const FEATURE_ACCESS_LEVELS = {
    PUBLIC: 'public',           // Available in public demo
    PLAYGROUND: 'playground',   // Requires playground access
    ENTERPRISE: 'enterprise'    // Requires enterprise subscription
};

/**
 * Feature categories for tracking
 */
const FEATURE_CATEGORIES = {
    WELL_ANALYSIS: 'well_analysis',
    DEEP_RESEARCH: 'deep_research',
    PREDICTIVE_MODELS: 'predictive_models',
    DATA_VISUALIZATION: 'data_visualization',
    EQUIPMENT_CATALOG: 'equipment_catalog',
    COST_ANALYSIS: 'cost_analysis',
    SUSTAINABILITY: 'sustainability',
    WITSML_INTEGRATION: 'witsml_integration',
    AI_ASSISTANT: 'ai_assistant',
    ADVANCED_SIMULATION: 'advanced_simulation'
};

/**
 * Playground Gateway Class
 */
class PlaygroundGateway {
    constructor(config = {}) {
        this.config = {
            enableDemoMode: config.enableDemoMode !== false,
            demoFeatureLimit: config.demoFeatureLimit || 3,
            demoDataLimit: config.demoDataLimit || 100,
            enableFeatureTracking: config.enableFeatureTracking !== false,
            enableInterestAnalytics: config.enableInterestAnalytics !== false,
            ...config
        };

        // Initialize authentication controller
        this.authController = new AuthAccessControl({
            enableMFA: true,
            enableZeroTrust: true,
            enableSessionTracking: true
        });

        // Feature access registry
        this.featureRegistry = new Map();

        // Feature usage tracking
        this.featureUsage = new Map();
        this.userInterests = new Map();

        // Demo limitations tracking
        this.demoUsage = {
            featuresAccessed: 0,
            dataPointsViewed: 0,
            computationsRun: 0,
            startTime: Date.now()
        };

        // Initialize features
        this.initializeFeatures();

        console.log('[PlaygroundGateway] Initialized');
    }

    /**
     * Initialize feature registry with access levels
     */
    initializeFeatures() {
        // Public demo features (limited functionality)
        this.registerFeature('well_portfolio_view', {
            name: 'Well Portfolio View',
            category: FEATURE_CATEGORIES.WELL_ANALYSIS,
            accessLevel: FEATURE_ACCESS_LEVELS.PUBLIC,
            description: 'View basic well portfolio data',
            limitations: {
                maxWells: 3,
                maxDataPoints: 100,
                readOnly: true
            }
        });

        this.registerFeature('basic_visualization', {
            name: 'Basic Data Visualization',
            category: FEATURE_CATEGORIES.DATA_VISUALIZATION,
            accessLevel: FEATURE_ACCESS_LEVELS.PUBLIC,
            description: 'View basic charts and graphs',
            limitations: {
                maxCharts: 2,
                exportDisabled: true
            }
        });

        this.registerFeature('equipment_catalog_browse', {
            name: 'Equipment Catalog Browser',
            category: FEATURE_CATEGORIES.EQUIPMENT_CATALOG,
            accessLevel: FEATURE_ACCESS_LEVELS.PUBLIC,
            description: 'Browse equipment catalog',
            limitations: {
                detailsLimited: true
            }
        });

        // Playground features (full functionality)
        this.registerFeature('deep_research_models', {
            name: 'Deep Research Models',
            category: FEATURE_CATEGORIES.DEEP_RESEARCH,
            accessLevel: FEATURE_ACCESS_LEVELS.PLAYGROUND,
            description: 'Run full Deep Research analysis models',
            capabilities: {
                customParameters: true,
                fullDataAccess: true,
                exportResults: true,
                zkpVerification: true
            }
        });

        this.registerFeature('predictive_analytics', {
            name: 'Predictive Analytics',
            category: FEATURE_CATEGORIES.PREDICTIVE_MODELS,
            accessLevel: FEATURE_ACCESS_LEVELS.PLAYGROUND,
            description: 'Run predictive models on well data',
            capabilities: {
                mlModels: true,
                customTraining: true,
                modelExport: true
            }
        });

        this.registerFeature('advanced_simulation', {
            name: 'Advanced Well Simulation',
            category: FEATURE_CATEGORIES.ADVANCED_SIMULATION,
            accessLevel: FEATURE_ACCESS_LEVELS.PLAYGROUND,
            description: 'Run advanced drilling simulations',
            capabilities: {
                multiScenario: true,
                sensitivityAnalysis: true,
                riskModeling: true
            }
        });

        this.registerFeature('witsml_integration', {
            name: 'WITSML Data Integration',
            category: FEATURE_CATEGORIES.WITSML_INTEGRATION,
            accessLevel: FEATURE_ACCESS_LEVELS.PLAYGROUND,
            description: 'Connect to real-time WITSML data sources',
            capabilities: {
                realTimeData: true,
                dataImport: true,
                dataExport: true
            }
        });

        this.registerFeature('ai_assistant_full', {
            name: 'AI Assistant - Full Access',
            category: FEATURE_CATEGORIES.AI_ASSISTANT,
            accessLevel: FEATURE_ACCESS_LEVELS.PLAYGROUND,
            description: 'Full AI assistant capabilities',
            capabilities: {
                unlimitedQueries: true,
                customPrompts: true,
                conversationHistory: true
            }
        });

        // Enterprise features
        this.registerFeature('multi_user_collaboration', {
            name: 'Multi-User Collaboration',
            category: FEATURE_CATEGORIES.WELL_ANALYSIS,
            accessLevel: FEATURE_ACCESS_LEVELS.ENTERPRISE,
            description: 'Collaborate with team members',
            capabilities: {
                sharedWorkspaces: true,
                roleBasedAccess: true,
                auditTrails: true
            }
        });
    }

    /**
     * Register a feature with access control
     */
    registerFeature(featureId, featureConfig) {
        this.featureRegistry.set(featureId, {
            featureId,
            ...featureConfig,
            registeredAt: new Date().toISOString()
        });
    }

    /**
     * Check if user has access to a feature
     */
    async checkFeatureAccess(featureId) {
        const feature = this.featureRegistry.get(featureId);
        if (!feature) {
            return {
                hasAccess: false,
                reason: 'Feature not found',
                featureId
            };
        }

        // Get current access tier
        const currentTier = this.authController.getAccessTier();
        const sessionState = this.authController.getSessionState();
        const currentUser = this.authController.getCurrentUser();

        // Check session validity
        const sessionValid = await this.authController.validateSession();

        // Public features - always accessible
        if (feature.accessLevel === FEATURE_ACCESS_LEVELS.PUBLIC) {
            // Check demo limitations
            if (this.config.enableDemoMode && currentTier === ACCESS_TIERS.PUBLIC_DEMO) {
                const demoLimitReached = this.checkDemoLimits();
                if (demoLimitReached) {
                    return {
                        hasAccess: false,
                        reason: 'Demo limit reached',
                        featureId,
                        upgrade: 'playground',
                        message: 'Sign in to access unlimited features in the Private Playground'
                    };
                }
            }

            return {
                hasAccess: true,
                featureId,
                accessLevel: FEATURE_ACCESS_LEVELS.PUBLIC,
                limitations: feature.limitations
            };
        }

        // Playground features - require authentication
        if (feature.accessLevel === FEATURE_ACCESS_LEVELS.PLAYGROUND) {
            if (currentTier === ACCESS_TIERS.PUBLIC_DEMO) {
                return {
                    hasAccess: false,
                    reason: 'Authentication required',
                    featureId,
                    upgrade: 'playground',
                    message: 'Sign in to access this feature in the Private Playground'
                };
            }

            if (!sessionValid.valid) {
                return {
                    hasAccess: false,
                    reason: `Session invalid: ${sessionValid.reason}`,
                    featureId,
                    requiresReauth: true
                };
            }

            if (sessionState !== SESSION_STATES.MFA_VERIFIED && sessionState !== SESSION_STATES.AUTHENTICATED) {
                return {
                    hasAccess: false,
                    reason: 'MFA verification required',
                    featureId,
                    requiresMFA: true
                };
            }

            return {
                hasAccess: true,
                featureId,
                accessLevel: FEATURE_ACCESS_LEVELS.PLAYGROUND,
                capabilities: feature.capabilities
            };
        }

        // Enterprise features
        if (feature.accessLevel === FEATURE_ACCESS_LEVELS.ENTERPRISE) {
            if (currentTier !== ACCESS_TIERS.ENTERPRISE) {
                return {
                    hasAccess: false,
                    reason: 'Enterprise subscription required',
                    featureId,
                    upgrade: 'enterprise',
                    message: 'Upgrade to Enterprise for team collaboration features'
                };
            }

            return {
                hasAccess: true,
                featureId,
                accessLevel: FEATURE_ACCESS_LEVELS.ENTERPRISE,
                capabilities: feature.capabilities
            };
        }

        return {
            hasAccess: false,
            reason: 'Unknown access level',
            featureId
        };
    }

    /**
     * Request access to a feature and track usage
     */
    async requestFeatureAccess(featureId, metadata = {}) {
        const accessCheck = await this.checkFeatureAccess(featureId);
        const currentUser = this.authController.getCurrentUser();
        const currentSession = this.authController.getCurrentSession();

        // Track feature access attempt
        await this.trackFeatureUsage(featureId, {
            granted: accessCheck.hasAccess,
            userId: currentUser?.uid,
            sessionId: currentSession?.sessionId,
            ...metadata
        });

        // Track user interest
        if (this.config.enableInterestAnalytics) {
            await this.trackUserInterest(featureId, {
                userId: currentUser?.uid,
                sessionId: currentSession?.sessionId,
                accessGranted: accessCheck.hasAccess,
                ...metadata
            });
        }

        // Log access event
        await logAuditEvent(EVENT_CATEGORIES.ACCESS, {
            type: 'feature_access_request',
            action: accessCheck.hasAccess ? 'access_granted' : 'access_denied',
            resource: featureId,
            userId: currentUser?.uid,
            sessionId: currentSession?.sessionId,
            metadata: {
                featureId,
                accessLevel: accessCheck.accessLevel,
                reason: accessCheck.reason,
                ...metadata
            }
        });

        return accessCheck;
    }

    /**
     * Execute a feature with full tracking and verification
     */
    async executeFeature(featureId, parameters = {}) {
        const accessCheck = await this.requestFeatureAccess(featureId, {
            parameters: Object.keys(parameters)
        });

        if (!accessCheck.hasAccess) {
            throw new Error(`Access denied: ${accessCheck.reason}`);
        }

        const feature = this.featureRegistry.get(featureId);
        const currentUser = this.authController.getCurrentUser();
        const currentSession = this.authController.getCurrentSession();
        const executionId = this.generateExecutionId();

        // Track execution start
        const startTime = Date.now();

        try {
            // For playground features with ZKP verification capability
            if (accessCheck.accessLevel === FEATURE_ACCESS_LEVELS.PLAYGROUND &&
                feature.capabilities?.zkpVerification) {

                // Generate ZKP attestation for computation
                const attestation = await zkpVerification.generateAttestation({
                    name: feature.name,
                    type: feature.category,
                    operation: featureId,
                    inputData: parameters,
                    outputData: { executionId }, // Would contain actual results
                    function: featureId,
                    parameters,
                    userId: currentUser?.uid,
                    sessionId: currentSession?.sessionId,
                    dataType: 'well_engineering_analysis'
                });

                // Track data provenance
                await trackDataProvenance(executionId, 'computation', {
                    userId: currentUser?.uid,
                    sessionId: currentSession?.sessionId,
                    featureId,
                    zkpAttestationId: attestation.attestationId,
                    verified: attestation.verified
                });
            }

            // Log successful execution
            await logAuditEvent(EVENT_CATEGORIES.USER_ACTIVITY, {
                type: 'feature_executed',
                action: 'execute',
                resource: featureId,
                userId: currentUser?.uid,
                sessionId: currentSession?.sessionId,
                metadata: {
                    executionId,
                    featureId,
                    category: feature.category,
                    duration: Date.now() - startTime
                }
            });

            return {
                success: true,
                executionId,
                featureId,
                feature: feature.name,
                timestamp: new Date().toISOString(),
                duration: Date.now() - startTime
            };

        } catch (error) {
            await logAuditEvent(EVENT_CATEGORIES.USER_ACTIVITY, {
                type: 'feature_execution_failed',
                action: 'execute',
                resource: featureId,
                severity: 'error',
                userId: currentUser?.uid,
                sessionId: currentSession?.sessionId,
                metadata: {
                    executionId,
                    error: error.message
                }
            });

            throw error;
        }
    }

    /**
     * Grant playground access to authenticated user
     */
    async grantPlaygroundAccess() {
        const currentUser = this.authController.getCurrentUser();

        if (!currentUser) {
            throw new Error('No authenticated user');
        }

        const result = await this.authController.grantPlaygroundAccess(currentUser);

        // Reset demo usage tracking
        this.demoUsage = {
            featuresAccessed: 0,
            dataPointsViewed: 0,
            computationsRun: 0,
            startTime: Date.now()
        };

        await logAuditEvent(EVENT_CATEGORIES.ACCESS, {
            type: 'playground_access_granted',
            action: 'upgrade_access',
            resource: 'playground',
            userId: currentUser.uid,
            sessionId: result.sessionId,
            metadata: {
                previousTier: ACCESS_TIERS.PUBLIC_DEMO,
                newTier: ACCESS_TIERS.PRIVATE_PLAYGROUND
            }
        });

        return result;
    }

    /**
     * Check demo usage limits
     */
    checkDemoLimits() {
        if (this.demoUsage.featuresAccessed >= this.config.demoFeatureLimit) {
            return true;
        }

        if (this.demoUsage.dataPointsViewed >= this.config.demoDataLimit) {
            return true;
        }

        // Time-based limit: 30 minutes
        const sessionDuration = Date.now() - this.demoUsage.startTime;
        if (sessionDuration > 30 * 60 * 1000) {
            return true;
        }

        return false;
    }

    /**
     * Track feature usage
     */
    async trackFeatureUsage(featureId, metadata = {}) {
        if (!this.featureUsage.has(featureId)) {
            this.featureUsage.set(featureId, {
                featureId,
                totalAccesses: 0,
                grantedAccesses: 0,
                deniedAccesses: 0,
                uniqueUsers: new Set(),
                uniqueSessions: new Set(),
                firstAccess: new Date().toISOString(),
                lastAccess: new Date().toISOString()
            });
        }

        const usage = this.featureUsage.get(featureId);
        usage.totalAccesses++;
        usage.lastAccess = new Date().toISOString();

        if (metadata.granted) {
            usage.grantedAccesses++;

            // Update demo usage if in demo mode
            if (this.authController.getAccessTier() === ACCESS_TIERS.PUBLIC_DEMO) {
                this.demoUsage.featuresAccessed++;
            }
        } else {
            usage.deniedAccesses++;
        }

        if (metadata.userId) {
            usage.uniqueUsers.add(metadata.userId);
        }

        if (metadata.sessionId) {
            usage.uniqueSessions.add(metadata.sessionId);
        }
    }

    /**
     * Track user interest for analytics
     */
    async trackUserInterest(featureId, metadata = {}) {
        const userId = metadata.userId || 'anonymous';

        if (!this.userInterests.has(userId)) {
            this.userInterests.set(userId, {
                userId,
                features: {},
                categories: {},
                totalInteractions: 0,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString()
            });
        }

        const interest = this.userInterests.get(userId);
        interest.totalInteractions++;
        interest.lastSeen = new Date().toISOString();

        // Track feature-specific interest
        if (!interest.features[featureId]) {
            interest.features[featureId] = {
                featureId,
                accessAttempts: 0,
                accessesGranted: 0,
                accessesDenied: 0,
                firstAttempt: new Date().toISOString(),
                lastAttempt: new Date().toISOString()
            };
        }

        const featureInterest = interest.features[featureId];
        featureInterest.accessAttempts++;
        featureInterest.lastAttempt = new Date().toISOString();

        if (metadata.accessGranted) {
            featureInterest.accessesGranted++;
        } else {
            featureInterest.accessesDenied++;
        }

        // Track category interest
        const feature = this.featureRegistry.get(featureId);
        if (feature) {
            const category = feature.category;
            interest.categories[category] = (interest.categories[category] || 0) + 1;
        }
    }

    /**
     * Get user interest profile
     */
    getUserInterestProfile(userId) {
        const interest = this.userInterests.get(userId);
        if (!interest) {
            return null;
        }

        // Calculate top interests
        const topFeatures = Object.values(interest.features)
            .sort((a, b) => b.accessAttempts - a.accessAttempts)
            .slice(0, 5);

        const topCategories = Object.entries(interest.categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category, count]) => ({ category, count }));

        return {
            userId: interest.userId,
            totalInteractions: interest.totalInteractions,
            firstSeen: interest.firstSeen,
            lastSeen: interest.lastSeen,
            topFeatures,
            topCategories,
            engagementScore: this.calculateEngagementScore(interest)
        };
    }

    /**
     * Calculate user engagement score
     */
    calculateEngagementScore(interest) {
        const featureCount = Object.keys(interest.features).length;
        const categoryCount = Object.keys(interest.categories).length;
        const totalInteractions = interest.totalInteractions;

        // Simple engagement score calculation
        const diversityScore = (featureCount * 10) + (categoryCount * 20);
        const activityScore = Math.min(totalInteractions * 5, 100);

        return Math.min(diversityScore + activityScore, 100);
    }

    /**
     * Get analytics dashboard data
     */
    getAnalyticsDashboard() {
        const featureUsageStats = Array.from(this.featureUsage.values()).map(usage => ({
            featureId: usage.featureId,
            totalAccesses: usage.totalAccesses,
            grantedAccesses: usage.grantedAccesses,
            deniedAccesses: usage.deniedAccesses,
            uniqueUsers: usage.uniqueUsers.size,
            uniqueSessions: usage.uniqueSessions.size,
            conversionRate: usage.deniedAccesses > 0 ?
                ((usage.grantedAccesses / usage.totalAccesses) * 100).toFixed(2) : 100
        }));

        const userInterestStats = Array.from(this.userInterests.values()).map(interest => ({
            userId: interest.userId,
            totalInteractions: interest.totalInteractions,
            featuresExplored: Object.keys(interest.features).length,
            categoriesExplored: Object.keys(interest.categories).length,
            engagementScore: this.calculateEngagementScore(interest),
            topCategory: this.getTopCategory(interest.categories)
        }));

        return {
            overview: {
                totalFeatures: this.featureRegistry.size,
                publicFeatures: this.getFeaturesByAccessLevel(FEATURE_ACCESS_LEVELS.PUBLIC).length,
                playgroundFeatures: this.getFeaturesByAccessLevel(FEATURE_ACCESS_LEVELS.PLAYGROUND).length,
                enterpriseFeatures: this.getFeaturesByAccessLevel(FEATURE_ACCESS_LEVELS.ENTERPRISE).length,
                totalUsers: this.userInterests.size,
                totalSessions: this.authController.sessionTracker.size
            },
            featureUsage: featureUsageStats,
            userInterests: userInterestStats,
            demoUsage: { ...this.demoUsage }
        };
    }

    /**
     * Get features by access level
     */
    getFeaturesByAccessLevel(accessLevel) {
        return Array.from(this.featureRegistry.values())
            .filter(feature => feature.accessLevel === accessLevel);
    }

    /**
     * Get top category from categories object
     */
    getTopCategory(categories) {
        const entries = Object.entries(categories);
        if (entries.length === 0) return 'none';

        return entries.sort((a, b) => b[1] - a[1])[0][0];
    }

    /**
     * Generate unique execution ID
     */
    generateExecutionId() {
        return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    /**
     * Get auth controller for external use
     */
    getAuthController() {
        return this.authController;
    }

    /**
     * Get current access tier
     */
    getCurrentAccessTier() {
        return this.authController.getAccessTier();
    }

    /**
     * Get all features
     */
    getAllFeatures() {
        return Array.from(this.featureRegistry.values());
    }
}

// Create singleton instance
const playgroundGateway = new PlaygroundGateway();

// Export the module
export {
    PlaygroundGateway,
    playgroundGateway,
    FEATURE_ACCESS_LEVELS,
    FEATURE_CATEGORIES
};
