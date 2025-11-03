/**
 * 100% FREE Security Configuration
 *
 * This configuration runs entirely in the browser with no external services.
 * Perfect for small teams (2-20 users) getting started.
 *
 * What's FREE:
 * ✅ Browser-based storage (IndexedDB)
 * ✅ Simple email/password authentication
 * ✅ All security features (ZKP, audit logging, etc.)
 * ✅ Session management
 * ✅ Activity tracking
 * ✅ Analytics dashboard
 *
 * What's NOT included (add later when needed):
 * ❌ SSO (Google, Microsoft) - requires Firebase
 * ❌ Phone-based MFA - requires Firebase/Twilio
 * ❌ Cross-device sync - requires cloud database
 * ❌ Centralized backup - requires server
 *
 * @version 1.0.0
 */

export const FREE_MODE_CONFIG = {
    // Storage Configuration
    storage: {
        type: 'indexeddb',              // FREE - browser-based
        enableFirestore: false,         // No Firebase needed
        enableCentralEndpoint: false,   // No server needed
        databaseName: 'WellTegraFree',
        version: 1
    },

    // Authentication Configuration
    authentication: {
        mode: 'browser-only',           // FREE - no external services
        providers: ['email'],           // Simple email/password
        enableSSO: false,               // Requires Firebase (paid)
        enableMFA: false,               // Requires SMS service (paid)
        sessionTimeout: 3600000,        // 1 hour (can adjust)
        rememberMe: true,               // Store login locally
        enableZeroTrust: true,          // Still validate sessions
        enableDeviceFingerprint: true   // Still track devices
    },

    // Audit Logging Configuration
    auditLogging: {
        enabled: true,                  // Keep full audit trail
        storage: 'indexeddb',           // FREE - local storage
        enableCryptoVerification: true, // Keep hash verification
        maxLogSize: 10000,              // Keep last 10k events
        retentionDays: 90,              // Auto-cleanup after 90 days
        enableProvenanceTracking: true  // Keep data lineage
    },

    // ZKP Verification Configuration
    zkpVerification: {
        enabled: true,                  // Keep privacy features
        enableProofGeneration: true,
        enableProofVerification: true,
        proofCacheDuration: 3600000     // 1 hour cache
    },

    // Playground Gateway Configuration
    playgroundGateway: {
        enableDemoMode: true,
        demoFeatureLimit: 3,            // Public demo limits
        demoDataLimit: 100,
        enableFeatureTracking: true,    // Track user interests
        enableInterestAnalytics: true   // Analytics still work
    },

    // Feature Access Defaults
    defaultAccessTier: 'public_demo',   // Start in demo mode

    // Performance Optimizations
    performance: {
        enableInMemoryCache: true,      // Fast local cache
        cacheSize: 1000,                // Cache recent data
        enableLazyLoading: true,        // Load on demand
        enableCompression: false        // Keep simple for now
    }
};

/**
 * Initialize FREE mode
 */
export async function initializeFreeMode() {
    console.log('🎉 Initializing WellTegra in 100% FREE mode');
    console.log('✅ No external services required');
    console.log('✅ All data stored locally in browser');
    console.log('✅ Full security features enabled');

    return FREE_MODE_CONFIG;
}

/**
 * Export for easy configuration
 */
export default FREE_MODE_CONFIG;
