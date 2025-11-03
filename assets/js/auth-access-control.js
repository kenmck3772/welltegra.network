/**
 * Authentication and Access Control Module
 * Implements SSO, MFA, and Zero-Trust principles for dual-access model
 *
 * This module provides:
 * - Single Sign-On (SSO) integration
 * - Multi-Factor Authentication (MFA)
 * - Unified login tracking
 * - Session management
 * - Access tier management (Public Demo vs Private Playground)
 *
 * @module auth-access-control
 * @version 1.0.0
 */

import { sanitizeInput, validateEmail } from './security-utils.js';
import { logAuditEvent } from './audit-logger.js';

/**
 * Access tiers for the dual-access model
 */
const ACCESS_TIERS = {
    PUBLIC_DEMO: 'public_demo',
    PRIVATE_PLAYGROUND: 'private_playground',
    ENTERPRISE: 'enterprise'
};

/**
 * Session states
 */
const SESSION_STATES = {
    UNAUTHENTICATED: 'unauthenticated',
    AUTHENTICATED: 'authenticated',
    MFA_PENDING: 'mfa_pending',
    MFA_VERIFIED: 'mfa_verified',
    EXPIRED: 'expired'
};

/**
 * Authentication provider types
 */
const AUTH_PROVIDERS = {
    EMAIL: 'email',
    GOOGLE: 'google.com',
    MICROSOFT: 'microsoft.com',
    OKTA: 'okta',
    AUTH0: 'auth0'
};

/**
 * Main authentication and access control class
 */
class AuthAccessControl {
    constructor(config = {}) {
        this.config = {
            enableMFA: config.enableMFA !== false, // Default true
            sessionTimeout: config.sessionTimeout || 3600000, // 1 hour default
            mfaTimeout: config.mfaTimeout || 300000, // 5 minutes default
            enableZeroTrust: config.enableZeroTrust !== false, // Default true
            enableSessionTracking: config.enableSessionTracking !== false, // Default true
            ...config
        };

        this.currentUser = null;
        this.currentSession = null;
        this.accessTier = ACCESS_TIERS.PUBLIC_DEMO;
        this.sessionState = SESSION_STATES.UNAUTHENTICATED;

        // Initialize session tracking
        this.sessionTracker = new Map();
        this.activityLog = [];

        // Initialize Firebase Auth if available
        this.initializeFirebaseAuth();
    }

    /**
     * Initialize Firebase Authentication
     */
    async initializeFirebaseAuth() {
        try {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                this.firebaseAuth = firebase.auth();

                // Set up auth state observer
                this.firebaseAuth.onAuthStateChanged((user) => {
                    this.handleAuthStateChange(user);
                });

                console.log('[AuthAccessControl] Firebase Auth initialized');
            }
        } catch (error) {
            console.error('[AuthAccessControl] Firebase initialization error:', error);
        }
    }

    /**
     * Handle authentication state changes
     */
    async handleAuthStateChange(user) {
        if (user) {
            this.currentUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                metadata: user.metadata,
                providerData: user.providerData
            };

            // Check if MFA is enabled and verified
            if (this.config.enableMFA) {
                const mfaVerified = await this.checkMFAStatus(user);
                this.sessionState = mfaVerified ?
                    SESSION_STATES.MFA_VERIFIED :
                    SESSION_STATES.MFA_PENDING;
            } else {
                this.sessionState = SESSION_STATES.AUTHENTICATED;
            }

            // Create session
            await this.createSession(user);

            // Log authentication event
            await this.logAuthEvent('user_authenticated', {
                userId: user.uid,
                email: user.email,
                provider: user.providerData[0]?.providerId,
                mfaEnabled: this.config.enableMFA
            });

        } else {
            this.currentUser = null;
            this.sessionState = SESSION_STATES.UNAUTHENTICATED;
            this.accessTier = ACCESS_TIERS.PUBLIC_DEMO;

            await this.logAuthEvent('user_signed_out');
        }
    }

    /**
     * Sign in with email and password
     */
    async signInWithEmail(email, password) {
        try {
            const sanitizedEmail = sanitizeInput(email, { maxLength: 255 });

            if (!validateEmail(sanitizedEmail)) {
                throw new Error('Invalid email format');
            }

            const userCredential = await this.firebaseAuth.signInWithEmailAndPassword(
                sanitizedEmail,
                password
            );

            await this.logAuthEvent('email_signin_success', {
                userId: userCredential.user.uid,
                email: sanitizedEmail
            });

            return {
                success: true,
                user: userCredential.user,
                requiresMFA: this.config.enableMFA && !await this.checkMFAStatus(userCredential.user)
            };

        } catch (error) {
            await this.logAuthEvent('email_signin_failure', {
                email,
                error: error.code
            });

            throw this.handleAuthError(error);
        }
    }

    /**
     * Sign in with SSO provider
     */
    async signInWithSSO(provider = AUTH_PROVIDERS.GOOGLE) {
        try {
            let authProvider;

            switch (provider) {
                case AUTH_PROVIDERS.GOOGLE:
                    authProvider = new firebase.auth.GoogleAuthProvider();
                    break;
                case AUTH_PROVIDERS.MICROSOFT:
                    authProvider = new firebase.auth.OAuthProvider('microsoft.com');
                    break;
                default:
                    throw new Error(`Unsupported SSO provider: ${provider}`);
            }

            // Configure provider scopes
            authProvider.addScope('email');
            authProvider.addScope('profile');

            const result = await this.firebaseAuth.signInWithPopup(authProvider);

            await this.logAuthEvent('sso_signin_success', {
                userId: result.user.uid,
                provider: provider,
                email: result.user.email
            });

            return {
                success: true,
                user: result.user,
                credential: result.credential,
                requiresMFA: this.config.enableMFA && !await this.checkMFAStatus(result.user)
            };

        } catch (error) {
            await this.logAuthEvent('sso_signin_failure', {
                provider,
                error: error.code
            });

            throw this.handleAuthError(error);
        }
    }

    /**
     * Enable Multi-Factor Authentication
     */
    async enableMFA(user, phoneNumber) {
        try {
            if (!this.firebaseAuth.currentUser) {
                throw new Error('No authenticated user');
            }

            // Use Firebase's multi-factor authentication
            const multiFactorUser = firebase.auth.multiFactor(user || this.firebaseAuth.currentUser);
            const session = await multiFactorUser.getSession();

            // Set up phone authentication
            const phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
            const verificationId = await phoneAuthProvider.verifyPhoneNumber(
                phoneNumber,
                session
            );

            await this.logAuthEvent('mfa_enrollment_started', {
                userId: user.uid,
                method: 'phone'
            });

            return {
                success: true,
                verificationId,
                method: 'phone'
            };

        } catch (error) {
            await this.logAuthEvent('mfa_enrollment_failure', {
                error: error.code
            });

            throw this.handleAuthError(error);
        }
    }

    /**
     * Verify MFA code
     */
    async verifyMFACode(verificationId, code) {
        try {
            const credential = firebase.auth.PhoneAuthProvider.credential(
                verificationId,
                code
            );

            const user = this.firebaseAuth.currentUser;
            const multiFactorUser = firebase.auth.multiFactor(user);

            const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(credential);
            await multiFactorUser.enroll(multiFactorAssertion, 'Primary Phone');

            this.sessionState = SESSION_STATES.MFA_VERIFIED;

            await this.logAuthEvent('mfa_verification_success', {
                userId: user.uid
            });

            return {
                success: true,
                verified: true
            };

        } catch (error) {
            await this.logAuthEvent('mfa_verification_failure', {
                error: error.code
            });

            throw this.handleAuthError(error);
        }
    }

    /**
     * Check MFA status for user
     */
    async checkMFAStatus(user) {
        try {
            if (!user) return false;

            const multiFactorUser = firebase.auth.multiFactor(user);
            const enrolledFactors = multiFactorUser.enrolledFactors;

            return enrolledFactors && enrolledFactors.length > 0;

        } catch (error) {
            console.error('[AuthAccessControl] MFA status check error:', error);
            return false;
        }
    }

    /**
     * Create and track user session (Zero-Trust principle)
     */
    async createSession(user) {
        const sessionId = this.generateSessionId();
        const now = Date.now();

        this.currentSession = {
            sessionId,
            userId: user.uid,
            email: user.email,
            accessTier: this.accessTier,
            createdAt: now,
            lastActivity: now,
            expiresAt: now + this.config.sessionTimeout,
            deviceInfo: this.getDeviceInfo(),
            ipAddress: await this.getIPAddress(),
            activities: []
        };

        // Store session in tracker
        this.sessionTracker.set(sessionId, this.currentSession);

        // Log session creation
        await this.logAuthEvent('session_created', {
            sessionId,
            userId: user.uid,
            accessTier: this.accessTier
        });

        // Start session monitoring (Zero-Trust continuous verification)
        this.startSessionMonitoring();

        return this.currentSession;
    }

    /**
     * Validate current session (Zero-Trust continuous verification)
     */
    async validateSession() {
        if (!this.currentSession) {
            return { valid: false, reason: 'no_session' };
        }

        const now = Date.now();

        // Check session expiration
        if (now > this.currentSession.expiresAt) {
            this.sessionState = SESSION_STATES.EXPIRED;
            await this.terminateSession('expired');
            return { valid: false, reason: 'session_expired' };
        }

        // Check MFA verification (if enabled)
        if (this.config.enableMFA && this.sessionState !== SESSION_STATES.MFA_VERIFIED) {
            return { valid: false, reason: 'mfa_not_verified' };
        }

        // Update last activity
        this.currentSession.lastActivity = now;

        // Zero-Trust: Verify user context hasn't changed
        const contextValid = await this.verifyUserContext();
        if (!contextValid) {
            await this.terminateSession('context_changed');
            return { valid: false, reason: 'context_changed' };
        }

        return { valid: true, session: this.currentSession };
    }

    /**
     * Verify user context (Zero-Trust)
     */
    async verifyUserContext() {
        // Check if user is still authenticated
        if (!this.firebaseAuth.currentUser) {
            return false;
        }

        // Check if device fingerprint matches
        const currentDevice = this.getDeviceInfo();
        if (currentDevice.fingerprint !== this.currentSession.deviceInfo.fingerprint) {
            await this.logAuthEvent('device_fingerprint_mismatch', {
                sessionId: this.currentSession.sessionId,
                original: this.currentSession.deviceInfo.fingerprint,
                current: currentDevice.fingerprint
            });
            return false;
        }

        return true;
    }

    /**
     * Grant access to Private Playground
     */
    async grantPlaygroundAccess(user) {
        // Validate session first
        const sessionValid = await this.validateSession();
        if (!sessionValid.valid) {
            throw new Error(`Cannot grant playground access: ${sessionValid.reason}`);
        }

        // Check MFA verification
        if (this.config.enableMFA && this.sessionState !== SESSION_STATES.MFA_VERIFIED) {
            throw new Error('MFA verification required for playground access');
        }

        // Upgrade access tier
        this.accessTier = ACCESS_TIERS.PRIVATE_PLAYGROUND;
        if (this.currentSession) {
            this.currentSession.accessTier = this.accessTier;
        }

        await this.logAuthEvent('playground_access_granted', {
            userId: user.uid,
            sessionId: this.currentSession?.sessionId,
            previousTier: ACCESS_TIERS.PUBLIC_DEMO,
            newTier: ACCESS_TIERS.PRIVATE_PLAYGROUND
        });

        return {
            success: true,
            accessTier: this.accessTier,
            sessionId: this.currentSession?.sessionId
        };
    }

    /**
     * Check if user has access to specific tier
     */
    hasAccess(requiredTier) {
        const tierHierarchy = {
            [ACCESS_TIERS.PUBLIC_DEMO]: 1,
            [ACCESS_TIERS.PRIVATE_PLAYGROUND]: 2,
            [ACCESS_TIERS.ENTERPRISE]: 3
        };

        return tierHierarchy[this.accessTier] >= tierHierarchy[requiredTier];
    }

    /**
     * Terminate session
     */
    async terminateSession(reason = 'user_signout') {
        if (this.currentSession) {
            await this.logAuthEvent('session_terminated', {
                sessionId: this.currentSession.sessionId,
                userId: this.currentSession.userId,
                reason,
                duration: Date.now() - this.currentSession.createdAt
            });

            this.sessionTracker.delete(this.currentSession.sessionId);
            this.currentSession = null;
        }

        this.sessionState = SESSION_STATES.UNAUTHENTICATED;
        this.accessTier = ACCESS_TIERS.PUBLIC_DEMO;

        // Stop session monitoring
        if (this.sessionMonitorInterval) {
            clearInterval(this.sessionMonitorInterval);
        }
    }

    /**
     * Sign out user
     */
    async signOut() {
        try {
            await this.terminateSession('user_signout');

            if (this.firebaseAuth) {
                await this.firebaseAuth.signOut();
            }

            await this.logAuthEvent('user_signed_out', {
                userId: this.currentUser?.uid
            });

            this.currentUser = null;

            return { success: true };

        } catch (error) {
            console.error('[AuthAccessControl] Sign out error:', error);
            throw error;
        }
    }

    /**
     * Start continuous session monitoring (Zero-Trust)
     */
    startSessionMonitoring() {
        // Clear any existing monitor
        if (this.sessionMonitorInterval) {
            clearInterval(this.sessionMonitorInterval);
        }

        // Monitor session every 30 seconds
        this.sessionMonitorInterval = setInterval(async () => {
            const validation = await this.validateSession();

            if (!validation.valid) {
                console.log('[AuthAccessControl] Session invalidated:', validation.reason);
                // Session will be terminated by validateSession
            }
        }, 30000);
    }

    /**
     * Log authentication event
     */
    async logAuthEvent(eventType, data = {}) {
        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            sessionId: this.currentSession?.sessionId,
            userId: this.currentUser?.uid || data.userId,
            data
        };

        this.activityLog.push(event);

        // Send to audit logger
        if (typeof logAuditEvent === 'function') {
            await logAuditEvent('auth', event);
        }

        console.log('[AuthAccessControl]', eventType, data);
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 15);
        return `sess_${timestamp}_${randomPart}`;
    }

    /**
     * Get device information for fingerprinting
     */
    getDeviceInfo() {
        const navigator = window.navigator;
        const screen = window.screen;

        const fingerprint = btoa(JSON.stringify({
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }));

        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            fingerprint
        };
    }

    /**
     * Get IP address (approximate)
     */
    async getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Handle authentication errors
     */
    handleAuthError(error) {
        const errorMessages = {
            'auth/invalid-email': 'Invalid email address',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later',
            'auth/popup-closed-by-user': 'Sign-in popup was closed',
            'auth/cancelled-popup-request': 'Sign-in was cancelled'
        };

        return {
            code: error.code,
            message: errorMessages[error.code] || error.message
        };
    }

    /**
     * Get current user info
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get current session info
     */
    getCurrentSession() {
        return this.currentSession;
    }

    /**
     * Get access tier
     */
    getAccessTier() {
        return this.accessTier;
    }

    /**
     * Get session state
     */
    getSessionState() {
        return this.sessionState;
    }

    /**
     * Get activity log
     */
    getActivityLog(limit = 100) {
        return this.activityLog.slice(-limit);
    }
}

// Export the module
export {
    AuthAccessControl,
    ACCESS_TIERS,
    SESSION_STATES,
    AUTH_PROVIDERS
};
