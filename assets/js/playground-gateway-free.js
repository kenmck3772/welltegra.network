/**
 * Playground Gateway (FREE Mode Adapter)
 *
 * This adapter configures the playground gateway to work with browser-only authentication.
 * Automatically detects if Firebase is available and uses appropriate auth method.
 *
 * @module playground-gateway-free
 * @version 1.0.0
 */

import { browserAuth } from './auth-browser-only.js';
import { auditLogger } from './audit-logger.js';
import { zkpVerification } from './zkp-verification.js';
import { FREE_MODE_CONFIG } from './security-config-free.js';
import { FEATURE_ACCESS_LEVELS, FEATURE_CATEGORIES } from './playground-gateway.js';

/**
 * Access tiers (same as main module)
 */
const ACCESS_TIERS = {
    PUBLIC_DEMO: 'public_demo',
    PRIVATE_PLAYGROUND: 'private_playground',
    ENTERPRISE: 'enterprise'
};

/**
 * Playground Gateway (FREE Mode)
 */
class PlaygroundGatewayFree {
    constructor(config = {}) {
        this.config = {
            ...FREE_MODE_CONFIG.playgroundGateway,
            ...config
        };

        // Use browser-only auth
        this.auth = browserAuth;
        this.auditLogger = auditLogger;
        this.zkpVerification = zkpVerification;

        // Feature registry
        this.featureRegistry = new Map();

        // Feature usage tracking
        this.featureUsage = new Map();
        this.userInterests = new Map();

        // Demo usage
        this.demoUsage = {
            featuresAccessed: 0,
            dataPointsViewed: 0,
            computationsRun: 0,
            startTime: Date.now()
        };

        // Initialize features
        this.initializeFeatures();

        console.log('[PlaygroundGatewayFree] Initialized in FREE mode');
    }

    /**
     * Initialize feature registry
     */
    initializeFeatures() {
        // Public demo features
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

        // Playground features (requires authentication)
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
    }

    /**
     * Register feature
     */
    registerFeature(featureId, featureConfig) {
        this.featureRegistry.set(featureId, {
            featureId,
            ...featureConfig,
            registeredAt: new Date().toISOString()
        });
    }

    /**
     * Check feature access
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

        // Get current user
        const currentUser = this.auth.getCurrentUser();
        const isAuthenticated = this.auth.isAuthenticated();

        // Public features
        if (feature.accessLevel === FEATURE_ACCESS_LEVELS.PUBLIC) {
            if (this.config.enableDemoMode && !isAuthenticated) {
                const demoLimitReached = this.checkDemoLimits();
                if (demoLimitReached) {
                    return {
                        hasAccess: false,
                        reason: 'Demo limit reached',
                        featureId,
                        upgrade: 'playground',
                        message: 'Sign in to access unlimited features'
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
            if (!isAuthenticated) {
                return {
                    hasAccess: false,
                    reason: 'Authentication required',
                    featureId,
                    upgrade: 'playground',
                    message: 'Sign in to access this feature',
                    loginUrl: '/login-free.html'
                };
            }

            // Validate session
            const sessionValid = await this.auth.validateSession();
            if (!sessionValid.valid) {
                return {
                    hasAccess: false,
                    reason: `Session invalid: ${sessionValid.reason}`,
                    featureId,
                    requiresReauth: true,
                    loginUrl: '/login-free.html'
                };
            }

            return {
                hasAccess: true,
                featureId,
                accessLevel: FEATURE_ACCESS_LEVELS.PLAYGROUND,
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
     * Request feature access with tracking
     */
    async requestFeatureAccess(featureId, metadata = {}) {
        const accessCheck = await this.checkFeatureAccess(featureId);
        const currentUser = this.auth.getCurrentUser();
        const currentSession = this.auth.getCurrentSession();

        // Track usage
        await this.trackFeatureUsage(featureId, {
            granted: accessCheck.hasAccess,
            userId: currentUser?.uid,
            sessionId: currentSession?.sessionId,
            ...metadata
        });

        // Track interest
        if (this.config.enableInterestAnalytics) {
            await this.trackUserInterest(featureId, {
                userId: currentUser?.uid,
                sessionId: currentSession?.sessionId,
                accessGranted: accessCheck.hasAccess,
                ...metadata
            });
        }

        return accessCheck;
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

            if (!this.auth.isAuthenticated()) {
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
     * Track user interest
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

        const feature = this.featureRegistry.get(featureId);
        if (feature) {
            const category = feature.category;
            interest.categories[category] = (interest.categories[category] || 0) + 1;
        }
    }

    /**
     * Check demo limits
     */
    checkDemoLimits() {
        if (this.demoUsage.featuresAccessed >= this.config.demoFeatureLimit) {
            return true;
        }

        if (this.demoUsage.dataPointsViewed >= this.config.demoDataLimit) {
            return true;
        }

        const sessionDuration = Date.now() - this.demoUsage.startTime;
        if (sessionDuration > 30 * 60 * 1000) {
            return true;
        }

        return false;
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
                enterpriseFeatures: 0, // Not available in free mode
                totalUsers: this.userInterests.size,
                totalSessions: this.auth.isAuthenticated() ? 1 : 0
            },
            featureUsage: featureUsageStats,
            userInterests: userInterestStats,
            demoUsage: { ...this.demoUsage }
        };
    }

    /**
     * Calculate engagement score
     */
    calculateEngagementScore(interest) {
        const featureCount = Object.keys(interest.features).length;
        const categoryCount = Object.keys(interest.categories).length;
        const totalInteractions = interest.totalInteractions;

        const diversityScore = (featureCount * 10) + (categoryCount * 20);
        const activityScore = Math.min(totalInteractions * 5, 100);

        return Math.min(diversityScore + activityScore, 100);
    }

    /**
     * Get features by access level
     */
    getFeaturesByAccessLevel(accessLevel) {
        return Array.from(this.featureRegistry.values())
            .filter(feature => feature.accessLevel === accessLevel);
    }

    /**
     * Get top category
     */
    getTopCategory(categories) {
        const entries = Object.entries(categories);
        if (entries.length === 0) return 'none';
        return entries.sort((a, b) => b[1] - a[1])[0][0];
    }

    /**
     * Get user interest profile
     */
    getUserInterestProfile(userId) {
        const interest = this.userInterests.get(userId);
        if (!interest) return null;

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
     * Get all features
     */
    getAllFeatures() {
        return Array.from(this.featureRegistry.values());
    }

    /**
     * Get current access tier
     */
    getCurrentAccessTier() {
        return this.auth.isAuthenticated() ?
            ACCESS_TIERS.PRIVATE_PLAYGROUND :
            ACCESS_TIERS.PUBLIC_DEMO;
    }

    /**
     * Get auth controller
     */
    getAuthController() {
        return this.auth;
    }
}

// Create singleton instance
export const playgroundGatewayFree = new PlaygroundGatewayFree();

// Export for external use
export { PlaygroundGatewayFree, ACCESS_TIERS, FEATURE_ACCESS_LEVELS, FEATURE_CATEGORIES };
export default playgroundGatewayFree;
