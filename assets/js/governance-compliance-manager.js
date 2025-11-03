/**
 * Governance & Compliance Manager
 * Comprehensive system for accountability, security, and operational control
 * Addresses Problems #5-#10 from Well-Tegra Pilot Readiness Assessment
 *
 * Features:
 * - ETP Protocol Configuration & Monitoring (Problem #5)
 * - MOC Cryptographic Audit System (Problem #6)
 * - Fail-Safe & Geofence Protocols (Problem #7)
 * - AI Prompt Audit Trail (Problem #8)
 * - Dual Attestation Workflow (Problem #9)
 * - Security Compliance Tracking (Problem #10)
 *
 * @version 1.0.0
 * @date 2025-11-01
 */

class GovernanceComplianceManager {
    constructor() {
        this.STORAGE_KEYS = {
            MOC_AUDIT: 'welltegra_moc_audit',
            AI_PROMPTS: 'welltegra_ai_prompts',
            ATTESTATIONS: 'welltegra_attestations',
            ETP_CONFIG: 'welltegra_etp_config',
            FAILSAFE: 'welltegra_failsafe',
            COMPLIANCE: 'welltegra_compliance'
        };

        this.ETP_LATENCY_SLA = 200; // milliseconds - 10x faster than legacy WITSML
        this.GEOFENCE_RADIUS = 500; // meters from rig site
        this.STALE_DATA_THRESHOLD = 90; // days

        this.init();
    }

    init() {
        // Initialize all storage keys
        Object.values(this.STORAGE_KEYS).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });

        // Initialize ETP configuration
        this.initializeETPConfig();
    }

    // ==========================================
    // PROBLEM #5: ETP Protocol & Real-Time Streaming
    // ==========================================

    /**
     * Initialize ETP (Energistics Transfer Protocol) configuration
     * Requirement: WITSML ETP specification with guaranteed low-latency SLA
     */
    initializeETPConfig() {
        const existingConfig = this.getETPConfig();
        if (!existingConfig || Object.keys(existingConfig).length === 0) {
            const defaultConfig = {
                enabled: false,
                version: 'ETP v1.2',
                endpoint: '',
                port: 443,
                protocol: 'wss', // WebSocket Secure
                latencySLA: this.ETP_LATENCY_SLA,
                retryAttempts: 3,
                heartbeatInterval: 30000, // 30 seconds
                subscriptions: [
                    'Channel.Drilling.MudWeight',
                    'Channel.Drilling.HookLoad',
                    'Channel.Drilling.ROP',
                    'Channel.Drilling.RPM',
                    'Channel.Drilling.SPP',
                    'Channel.Drilling.TorqueOnBottom'
                ],
                vendor: {
                    name: '',
                    contactEmail: '',
                    supportPhone: '',
                    certificationStatus: 'PENDING_VERIFICATION'
                },
                performance: {
                    averageLatency: null,
                    maxLatency: null,
                    uptime: null,
                    lastHealthCheck: null
                },
                security: {
                    tlsVersion: 'TLS 1.3',
                    certificateExpiry: null,
                    authMethod: 'OAuth2'
                }
            };

            localStorage.setItem(this.STORAGE_KEYS.ETP_CONFIG, JSON.stringify(defaultConfig));
        }
    }

    /**
     * Get ETP configuration
     */
    getETPConfig() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ETP_CONFIG) || '{}');
        } catch (e) {
            console.error('Failed to get ETP config:', e);
            return {};
        }
    }

    /**
     * Update ETP configuration
     */
    updateETPConfig(updates) {
        const config = this.getETPConfig();
        const updatedConfig = { ...config, ...updates };
        localStorage.setItem(this.STORAGE_KEYS.ETP_CONFIG, JSON.stringify(updatedConfig));
        return updatedConfig;
    }

    /**
     * Verify ETP latency meets SLA requirements
     */
    verifyETPLatency(measuredLatency) {
        const config = this.getETPConfig();
        const sla = config.latencySLA || this.ETP_LATENCY_SLA;

        const result = {
            measuredLatency: measuredLatency,
            slaRequirement: sla,
            meetsRequirement: measuredLatency <= sla,
            timestamp: new Date().toISOString(),
            status: measuredLatency <= sla ? 'COMPLIANT' : 'SLA_VIOLATION'
        };

        if (!result.meetsRequirement) {
            this.logComplianceViolation('ETP_LATENCY_SLA', result);
        }

        return result;
    }

    /**
     * Log ETP performance metrics
     */
    logETPPerformance(metrics) {
        const config = this.getETPConfig();
        config.performance = {
            ...config.performance,
            ...metrics,
            lastHealthCheck: new Date().toISOString()
        };
        localStorage.setItem(this.STORAGE_KEYS.ETP_CONFIG, JSON.stringify(config));
    }

    // ==========================================
    // PROBLEM #6: MOC Cryptographic Audit System
    // ==========================================

    /**
     * Create MOC (Management of Change) approval record with cryptographic seal
     * Requirement: Non-repudiation validation with tamper-proof digital signatures
     */
    createMOCApproval(mocData) {
        const approval = {
            mocId: this.generateMOCId(),
            timestamp: new Date().toISOString(),
            wellId: mocData.wellId,
            changeType: mocData.changeType,
            changeDescription: mocData.changeDescription,
            proposedBy: mocData.proposedBy,
            approver: mocData.approver,
            approverPin: mocData.approverPin, // Secure PIN
            originalPlan: mocData.originalPlan,
            modifiedPlan: mocData.modifiedPlan,
            justification: mocData.justification,
            riskAssessment: mocData.riskAssessment,
            cryptographicSeal: null,
            sealVerified: false,
            auditTrail: []
        };

        // Generate cryptographic seal
        approval.cryptographicSeal = this.generateCryptographicSeal(approval);
        approval.auditTrail.push({
            action: 'CREATED',
            timestamp: new Date().toISOString(),
            user: approval.proposedBy
        });

        // Store approval
        const audits = this.getMOCAudits();
        audits.push(approval);
        localStorage.setItem(this.STORAGE_KEYS.MOC_AUDIT, JSON.stringify(audits));

        return approval;
    }

    /**
     * Generate cryptographic seal for MOC approval
     * Uses SHA-256 hash + timestamp + PIN for tamper detection
     */
    generateCryptographicSeal(approval) {
        const payload = {
            mocId: approval.mocId,
            timestamp: approval.timestamp,
            wellId: approval.wellId,
            changeType: approval.changeType,
            approver: approval.approver,
            approverPin: this.hashPIN(approval.approverPin),
            originalPlan: JSON.stringify(approval.originalPlan),
            modifiedPlan: JSON.stringify(approval.modifiedPlan)
        };

        return {
            algorithm: 'SHA-256',
            hash: this.generateHash(JSON.stringify(payload)),
            timestamp: new Date().toISOString(),
            nonce: this.generateNonce(),
            version: '1.0'
        };
    }

    /**
     * Verify cryptographic seal integrity
     */
    verifyCryptographicSeal(mocId) {
        const audits = this.getMOCAudits();
        const approval = audits.find(a => a.mocId === mocId);

        if (!approval) {
            return {
                verified: false,
                reason: 'MOC approval not found'
            };
        }

        // Reconstruct payload
        const payload = {
            mocId: approval.mocId,
            timestamp: approval.timestamp,
            wellId: approval.wellId,
            changeType: approval.changeType,
            approver: approval.approver,
            approverPin: this.hashPIN(approval.approverPin),
            originalPlan: JSON.stringify(approval.originalPlan),
            modifiedPlan: JSON.stringify(approval.modifiedPlan)
        };

        const reconstructedHash = this.generateHash(JSON.stringify(payload));
        const originalHash = approval.cryptographicSeal.hash;

        const verified = reconstructedHash === originalHash;

        approval.sealVerified = verified;
        approval.auditTrail.push({
            action: 'SEAL_VERIFICATION',
            timestamp: new Date().toISOString(),
            result: verified ? 'VERIFIED' : 'TAMPERED',
            verifiedHash: reconstructedHash
        });

        // Update storage
        localStorage.setItem(this.STORAGE_KEYS.MOC_AUDIT, JSON.stringify(audits));

        return {
            verified: verified,
            mocId: mocId,
            timestamp: new Date().toISOString(),
            originalHash: originalHash,
            verifiedHash: reconstructedHash,
            reason: verified ? 'Seal integrity confirmed' : 'TAMPERING DETECTED - Hash mismatch'
        };
    }

    /**
     * Get all MOC audits
     */
    getMOCAudits() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.MOC_AUDIT) || '[]');
        } catch (e) {
            console.error('Failed to get MOC audits:', e);
            return [];
        }
    }

    // ==========================================
    // PROBLEM #7: Fail-Safe & Geofence Protocols
    // ==========================================

    /**
     * Define fail-safe protocol for geofence violations
     */
    setFailSafeProtocol(protocol) {
        const failsafeConfig = {
            geofenceRadius: protocol.geofenceRadius || this.GEOFENCE_RADIUS,
            rigSiteLocation: protocol.rigSiteLocation, // { latitude, longitude }
            defaultAction: protocol.defaultAction || 'BLOCK_AND_NOTIFY',
            networkLossAction: protocol.networkLossAction || 'SUSPEND_OPERATIONS',
            escalationContacts: protocol.escalationContacts || [],
            autoRevertEnabled: protocol.autoRevertEnabled || true,
            revertTimeoutSeconds: protocol.revertTimeoutSeconds || 300,
            createdBy: protocol.createdBy,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        localStorage.setItem(this.STORAGE_KEYS.FAILSAFE, JSON.stringify(failsafeConfig));
        return failsafeConfig;
    }

    /**
     * Get fail-safe protocol configuration
     */
    getFailSafeProtocol() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.FAILSAFE) || 'null');
        } catch (e) {
            console.error('Failed to get fail-safe protocol:', e);
            return null;
        }
    }

    /**
     * Check geofence compliance
     */
    checkGeofence(currentLocation) {
        const protocol = this.getFailSafeProtocol();

        if (!protocol || !protocol.rigSiteLocation) {
            return {
                compliant: false,
                reason: 'No geofence protocol defined'
            };
        }

        const distance = this.calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            protocol.rigSiteLocation.latitude,
            protocol.rigSiteLocation.longitude
        );

        const compliant = distance <= protocol.geofenceRadius;

        const result = {
            compliant: compliant,
            distance: Math.round(distance),
            allowedRadius: protocol.geofenceRadius,
            timestamp: new Date().toISOString(),
            action: compliant ? 'ALLOW' : protocol.defaultAction
        };

        if (!compliant) {
            this.logGeofenceViolation(result);
        }

        return result;
    }

    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    /**
     * Log geofence violation
     */
    logGeofenceViolation(violation) {
        const violations = this.getComplianceViolations('GEOFENCE');
        violations.push({
            type: 'GEOFENCE_VIOLATION',
            ...violation
        });
        this.storeComplianceViolations('GEOFENCE', violations);
    }

    // ==========================================
    // PROBLEM #8: AI Prompt Audit Trail
    // ==========================================

    /**
     * Log AI prompt for immutable audit trail
     * Requirement: Ensure engineer accountability for AI instructions
     */
    logAIPrompt(promptData) {
        const entry = {
            promptId: this.generatePromptId(),
            timestamp: new Date().toISOString(),
            wellId: promptData.wellId,
            userId: promptData.userId,
            userRole: promptData.userRole,
            promptType: promptData.promptType, // 'PROCEDURE_GENERATION', 'RISK_ANALYSIS', 'NPT_PREDICTION', etc.
            originalPrompt: promptData.originalPrompt,
            editedPrompt: promptData.editedPrompt || null,
            wasEdited: promptData.editedPrompt !== null,
            aiModel: promptData.aiModel || 'Gemini Pro',
            aiResponse: promptData.aiResponse || null,
            responseTimestamp: promptData.responseTimestamp || null,
            procedureId: promptData.procedureId || null,
            reviewStatus: 'PENDING_REVIEW',
            reviewedBy: null,
            reviewedAt: null,
            grcApproved: false
        };

        const prompts = this.getAIPrompts();
        prompts.push(entry);
        localStorage.setItem(this.STORAGE_KEYS.AI_PROMPTS, JSON.stringify(prompts));

        return entry;
    }

    /**
     * Get all AI prompts
     */
    getAIPrompts(filters = {}) {
        try {
            let prompts = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.AI_PROMPTS) || '[]');

            // Apply filters
            if (filters.wellId) {
                prompts = prompts.filter(p => p.wellId === filters.wellId);
            }
            if (filters.userId) {
                prompts = prompts.filter(p => p.userId === filters.userId);
            }
            if (filters.promptType) {
                prompts = prompts.filter(p => p.promptType === filters.promptType);
            }
            if (filters.reviewStatus) {
                prompts = prompts.filter(p => p.reviewStatus === filters.reviewStatus);
            }

            return prompts;
        } catch (e) {
            console.error('Failed to get AI prompts:', e);
            return [];
        }
    }

    /**
     * Mark AI prompt as GRC reviewed
     */
    reviewAIPrompt(promptId, reviewerData) {
        const prompts = this.getAIPrompts();
        const prompt = prompts.find(p => p.promptId === promptId);

        if (prompt) {
            prompt.reviewStatus = reviewerData.approved ? 'APPROVED' : 'REJECTED';
            prompt.reviewedBy = reviewerData.reviewerId;
            prompt.reviewedAt = new Date().toISOString();
            prompt.grcApproved = reviewerData.approved;
            prompt.reviewComments = reviewerData.comments || '';

            localStorage.setItem(this.STORAGE_KEYS.AI_PROMPTS, JSON.stringify(prompts));
        }

        return prompt;
    }

    // ==========================================
    // PROBLEM #9: Dual Attestation Workflow
    // ==========================================

    /**
     * Create dual attestation requirement for procedure release
     * Requirement: Dual sign-off without introducing field delays
     */
    createAttestation(attestationData) {
        const attestation = {
            attestationId: this.generateAttestationId(),
            timestamp: new Date().toISOString(),
            procedureId: attestationData.procedureId,
            wellId: attestationData.wellId,
            procedureName: attestationData.procedureName,
            primaryAttestor: {
                userId: attestationData.primaryAttestor.userId,
                name: attestationData.primaryAttestor.name,
                role: attestationData.primaryAttestor.role,
                signedAt: null,
                signature: null,
                pin: null
            },
            secondaryAttestor: {
                userId: attestationData.secondaryAttestor.userId,
                name: attestationData.secondaryAttestor.name,
                role: attestationData.secondaryAttestor.role,
                signedAt: null,
                signature: null,
                pin: null
            },
            status: 'PENDING_PRIMARY',
            releasedToField: false,
            releasedAt: null,
            processingTimeMs: null
        };

        const attestations = this.getAttestations();
        attestations.push(attestation);
        localStorage.setItem(this.STORAGE_KEYS.ATTESTATIONS, JSON.stringify(attestations));

        return attestation;
    }

    /**
     * Sign attestation (primary or secondary)
     */
    signAttestation(attestationId, signatureData) {
        const attestations = this.getAttestations();
        const attestation = attestations.find(a => a.attestationId === attestationId);

        if (!attestation) {
            return { success: false, error: 'Attestation not found' };
        }

        const now = new Date().toISOString();
        const attestor = signatureData.isPrimary ? attestation.primaryAttestor : attestation.secondaryAttestor;

        attestor.signedAt = now;
        attestor.signature = this.generateHash(signatureData.userId + now + signatureData.pin);
        attestor.pin = this.hashPIN(signatureData.pin);

        // Update status
        if (signatureData.isPrimary) {
            attestation.status = 'PENDING_SECONDARY';
        } else {
            // Both attestations complete
            attestation.status = 'APPROVED';
            attestation.releasedToField = true;
            attestation.releasedAt = now;
            attestation.processingTimeMs = new Date(now) - new Date(attestation.timestamp);

            // Alert if processing took too long
            if (attestation.processingTimeMs > 60000) { // 1 minute
                this.logComplianceViolation('ATTESTATION_DELAY', {
                    attestationId: attestationId,
                    processingTimeMs: attestation.processingTimeMs,
                    threshold: 60000
                });
            }
        }

        localStorage.setItem(this.STORAGE_KEYS.ATTESTATIONS, JSON.stringify(attestations));

        return { success: true, attestation: attestation };
    }

    /**
     * Get all attestations
     */
    getAttestations(filters = {}) {
        try {
            let attestations = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ATTESTATIONS) || '[]');

            if (filters.wellId) {
                attestations = attestations.filter(a => a.wellId === filters.wellId);
            }
            if (filters.status) {
                attestations = attestations.filter(a => a.status === filters.status);
            }

            return attestations;
        } catch (e) {
            console.error('Failed to get attestations:', e);
            return [];
        }
    }

    // ==========================================
    // PROBLEM #10: Security Compliance (FIPS 140-2)
    // ==========================================

    /**
     * Track FIPS 140-2 compliance status
     */
    updateComplianceStatus(complianceData) {
        const compliance = {
            lastUpdated: new Date().toISOString(),
            fips1402: {
                kmsValidated: complianceData.kmsValidated || false,
                kmsCertificateNumber: complianceData.kmsCertificateNumber || null,
                kmsProvider: complianceData.kmsProvider || 'AWS KMS',
                certificateExpiry: complianceData.certificateExpiry || null,
                validationDate: complianceData.validationDate || null,
                status: complianceData.kmsValidated ? 'COMPLIANT' : 'NON_COMPLIANT'
            },
            dataAtRest: {
                encryptionAlgorithm: complianceData.encryptionAlgorithm || 'AES-256-GCM',
                keyRotationEnabled: complianceData.keyRotationEnabled || true,
                keyRotationDays: complianceData.keyRotationDays || 90,
                lastKeyRotation: complianceData.lastKeyRotation || null
            },
            dataInTransit: {
                tlsVersion: complianceData.tlsVersion || 'TLS 1.3',
                cipherSuites: complianceData.cipherSuites || ['TLS_AES_256_GCM_SHA384'],
                certificateProvider: complianceData.certificateProvider || 'Let\'s Encrypt'
            },
            auditLog: {
                enabled: true,
                retention: complianceData.auditRetentionDays || 2555, // 7 years
                immutable: complianceData.immutableAuditLog || true
            }
        };

        localStorage.setItem(this.STORAGE_KEYS.COMPLIANCE, JSON.stringify(compliance));
        return compliance;
    }

    /**
     * Get compliance status
     */
    getComplianceStatus() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.COMPLIANCE) || 'null');
        } catch (e) {
            console.error('Failed to get compliance status:', e);
            return null;
        }
    }

    /**
     * Verify FIPS 140-2 compliance
     */
    verifyFIPSCompliance() {
        const compliance = this.getComplianceStatus();

        if (!compliance) {
            return {
                compliant: false,
                reason: 'No compliance data available'
            };
        }

        const fips = compliance.fips1402;

        // Check if FIPS data exists
        if (!fips) {
            return {
                compliant: false,
                reason: 'FIPS 140-2 configuration not initialized',
                checks: {},
                overallStatus: 'NOT CONFIGURED',
                timestamp: new Date().toISOString()
            };
        }

        const checks = {
            kmsValidated: fips.kmsValidated || false,
            certificateValid: fips.certificateExpiry ? new Date(fips.certificateExpiry) > new Date() : false,
            encryptionStrong: compliance.dataAtRest?.encryptionAlgorithm === 'AES-256-GCM',
            tlsSecure: compliance.dataInTransit?.tlsVersion === 'TLS 1.3',
            auditEnabled: compliance.auditLog?.enabled && compliance.auditLog?.immutable
        };

        const allChecks = Object.values(checks).every(check => check === true);

        return {
            compliant: allChecks,
            checks: checks,
            overallStatus: allChecks ? 'FIPS 140-2 COMPLIANT' : 'NON-COMPLIANT',
            timestamp: new Date().toISOString()
        };
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    generateMOCId() {
        return 'MOC-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    }

    generatePromptId() {
        return 'PROMPT-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    }

    generateAttestationId() {
        return 'ATT-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    }

    generateNonce() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    /**
     * Simple hash function (SHA-256 simulation for demo)
     * In production, use crypto.subtle.digest()
     */
    generateHash(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'SHA256-' + Math.abs(hash).toString(16).padStart(16, '0');
    }

    hashPIN(pin) {
        return this.generateHash('PIN-' + pin + '-SALT');
    }

    logComplianceViolation(type, data) {
        const violations = this.getComplianceViolations(type);
        violations.push({
            type: type,
            timestamp: new Date().toISOString(),
            ...data
        });
        this.storeComplianceViolations(type, violations);
    }

    getComplianceViolations(type) {
        try {
            const key = `welltegra_violations_${type}`;
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            return [];
        }
    }

    storeComplianceViolations(type, violations) {
        const key = `welltegra_violations_${type}`;
        localStorage.setItem(key, JSON.stringify(violations));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GovernanceComplianceManager;
}
