/**
 * Audit Logger and Data Provenance System
 * Implements comprehensive logging, tracking, and data lineage for accountability
 *
 * This module provides:
 * - Immutable audit logging with cryptographic verification
 * - Data provenance tracking (creation -> transformation -> usage)
 * - User activity monitoring and analytics
 * - Centralized oversight for distributed activity
 * - Compliance and regulatory reporting
 *
 * @module audit-logger
 * @version 1.0.0
 */

import { generateHash, verifyHash } from './crypto-utils.js';

/**
 * Event categories for audit logging
 */
const EVENT_CATEGORIES = {
    AUTH: 'auth',
    ACCESS: 'access',
    DATA: 'data',
    COMPUTATION: 'computation',
    SECURITY: 'security',
    COMPLIANCE: 'compliance',
    USER_ACTIVITY: 'user_activity',
    SYSTEM: 'system'
};

/**
 * Event severity levels
 */
const SEVERITY_LEVELS = {
    DEBUG: 'debug',
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
};

/**
 * Data operation types for provenance tracking
 */
const DATA_OPERATIONS = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    TRANSFORM: 'transform',
    EXPORT: 'export',
    IMPORT: 'import',
    SHARE: 'share'
};

/**
 * Main audit logging class
 */
class AuditLogger {
    constructor(config = {}) {
        this.config = {
            enableCryptoVerification: config.enableCryptoVerification !== false,
            enableProvenanceTracking: config.enableProvenanceTracking !== false,
            maxLogSize: config.maxLogSize || 10000,
            storageType: config.storageType || 'indexeddb', // 'indexeddb', 'firestore', 'localstorage'
            centralEndpoint: config.centralEndpoint || null,
            retentionDays: config.retentionDays || 90,
            ...config
        };

        // In-memory audit log
        this.auditLog = [];

        // Provenance graph (data lineage)
        this.provenanceGraph = new Map();

        // Session activity tracking
        this.sessionActivities = new Map();

        // Initialize storage
        this.initializeStorage();
    }

    /**
     * Initialize storage backend
     */
    async initializeStorage() {
        try {
            if (this.config.storageType === 'indexeddb') {
                await this.initializeIndexedDB();
            } else if (this.config.storageType === 'firestore' && typeof firebase !== 'undefined') {
                this.initializeFirestore();
            }

            console.log('[AuditLogger] Storage initialized:', this.config.storageType);
        } catch (error) {
            console.error('[AuditLogger] Storage initialization error:', error);
            // Fallback to in-memory only
            this.config.storageType = 'memory';
        }
    }

    /**
     * Initialize IndexedDB for persistent audit logging
     */
    async initializeIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('WellTegraAuditDB', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create audit log store
                if (!db.objectStoreNames.contains('auditLog')) {
                    const auditStore = db.createObjectStore('auditLog', {
                        keyPath: 'eventId',
                        autoIncrement: false
                    });
                    auditStore.createIndex('timestamp', 'timestamp', { unique: false });
                    auditStore.createIndex('userId', 'userId', { unique: false });
                    auditStore.createIndex('category', 'category', { unique: false });
                    auditStore.createIndex('sessionId', 'sessionId', { unique: false });
                }

                // Create provenance store
                if (!db.objectStoreNames.contains('provenance')) {
                    const provenanceStore = db.createObjectStore('provenance', {
                        keyPath: 'dataId',
                        autoIncrement: false
                    });
                    provenanceStore.createIndex('timestamp', 'timestamp', { unique: false });
                    provenanceStore.createIndex('userId', 'userId', { unique: false });
                    provenanceStore.createIndex('operation', 'operation', { unique: false });
                }
            };
        });
    }

    /**
     * Initialize Firestore for centralized logging
     */
    initializeFirestore() {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            this.firestore = firebase.firestore();
            console.log('[AuditLogger] Firestore initialized');
        }
    }

    /**
     * Log an audit event
     */
    async logAuditEvent(category, data = {}) {
        const eventId = this.generateEventId();
        const timestamp = new Date().toISOString();

        // Create audit event object
        const auditEvent = {
            eventId,
            category,
            timestamp,
            timestampMs: Date.now(),
            severity: data.severity || SEVERITY_LEVELS.INFO,
            userId: data.userId || null,
            sessionId: data.sessionId || null,
            type: data.type || 'unknown',
            action: data.action || null,
            resource: data.resource || null,
            metadata: data.metadata || {},
            deviceInfo: data.deviceInfo || this.getDeviceContext(),
            ipAddress: data.ipAddress || 'unknown',
            data: {
                ...data,
                severity: undefined,
                userId: undefined,
                sessionId: undefined
            }
        };

        // Add cryptographic hash for verification
        if (this.config.enableCryptoVerification) {
            auditEvent.hash = await this.generateEventHash(auditEvent);
            auditEvent.previousHash = this.getLastEventHash();
        }

        // Add to in-memory log
        this.auditLog.push(auditEvent);

        // Enforce max log size
        if (this.auditLog.length > this.config.maxLogSize) {
            this.auditLog.shift(); // Remove oldest
        }

        // Persist to storage
        await this.persistEvent(auditEvent);

        // Send to central endpoint if configured
        if (this.config.centralEndpoint) {
            await this.sendToCentralEndpoint(auditEvent);
        }

        // Track session activity
        if (data.sessionId) {
            this.trackSessionActivity(data.sessionId, auditEvent);
        }

        return auditEvent;
    }

    /**
     * Track data provenance (data lineage)
     */
    async trackDataProvenance(dataId, operation, metadata = {}) {
        const provenanceId = this.generateProvenanceId();
        const timestamp = new Date().toISOString();

        // Get parent data IDs if this is a transformation
        const parentIds = metadata.parentDataIds || [];

        const provenanceRecord = {
            provenanceId,
            dataId,
            operation,
            timestamp,
            timestampMs: Date.now(),
            userId: metadata.userId || null,
            sessionId: metadata.sessionId || null,
            parentDataIds: parentIds,
            transformations: metadata.transformations || [],
            computationHash: metadata.computationHash || null,
            metadata: {
                fileName: metadata.fileName,
                fileType: metadata.fileType,
                fileSize: metadata.fileSize,
                checksumBefore: metadata.checksumBefore,
                checksumAfter: metadata.checksumAfter,
                ...metadata
            },
            lineage: await this.buildLineage(dataId, parentIds)
        };

        // Add cryptographic verification
        if (this.config.enableCryptoVerification) {
            provenanceRecord.hash = await this.generateProvenanceHash(provenanceRecord);
        }

        // Store in provenance graph
        this.provenanceGraph.set(dataId, provenanceRecord);

        // Persist to storage
        await this.persistProvenance(provenanceRecord);

        // Log as audit event
        await this.logAuditEvent(EVENT_CATEGORIES.DATA, {
            type: 'data_provenance',
            action: operation,
            resource: dataId,
            userId: metadata.userId,
            sessionId: metadata.sessionId,
            metadata: provenanceRecord
        });

        return provenanceRecord;
    }

    /**
     * Build data lineage chain
     */
    async buildLineage(dataId, parentIds) {
        const lineage = {
            dataId,
            depth: 0,
            ancestors: [],
            creationPath: []
        };

        if (parentIds.length === 0) {
            return lineage;
        }

        // Recursively build lineage
        for (const parentId of parentIds) {
            const parentProvenance = this.provenanceGraph.get(parentId);
            if (parentProvenance) {
                lineage.ancestors.push(parentId);
                lineage.creationPath.push({
                    dataId: parentId,
                    operation: parentProvenance.operation,
                    timestamp: parentProvenance.timestamp
                });

                if (parentProvenance.lineage) {
                    lineage.depth = Math.max(lineage.depth, parentProvenance.lineage.depth + 1);
                }
            }
        }

        return lineage;
    }

    /**
     * Track user activity in session
     */
    trackSessionActivity(sessionId, event) {
        if (!this.sessionActivities.has(sessionId)) {
            this.sessionActivities.set(sessionId, {
                sessionId,
                activities: [],
                startTime: Date.now(),
                lastActivity: Date.now(),
                eventCount: 0
            });
        }

        const session = this.sessionActivities.get(sessionId);
        session.activities.push({
            timestamp: event.timestamp,
            category: event.category,
            type: event.type,
            action: event.action,
            resource: event.resource
        });
        session.lastActivity = Date.now();
        session.eventCount++;
    }

    /**
     * Get session activity summary
     */
    getSessionActivity(sessionId) {
        return this.sessionActivities.get(sessionId) || null;
    }

    /**
     * Get all session activities
     */
    getAllSessionActivities() {
        return Array.from(this.sessionActivities.values());
    }

    /**
     * Query audit log
     */
    queryAuditLog(filters = {}) {
        let results = [...this.auditLog];

        if (filters.category) {
            results = results.filter(e => e.category === filters.category);
        }

        if (filters.userId) {
            results = results.filter(e => e.userId === filters.userId);
        }

        if (filters.sessionId) {
            results = results.filter(e => e.sessionId === filters.sessionId);
        }

        if (filters.startTime) {
            results = results.filter(e => e.timestampMs >= filters.startTime);
        }

        if (filters.endTime) {
            results = results.filter(e => e.timestampMs <= filters.endTime);
        }

        if (filters.severity) {
            results = results.filter(e => e.severity === filters.severity);
        }

        if (filters.type) {
            results = results.filter(e => e.type === filters.type);
        }

        return results;
    }

    /**
     * Query data provenance
     */
    queryProvenance(dataId) {
        const provenance = this.provenanceGraph.get(dataId);
        if (!provenance) {
            return null;
        }

        // Build full lineage tree
        const lineageTree = this.buildProvenanceTree(dataId);

        return {
            ...provenance,
            fullLineage: lineageTree
        };
    }

    /**
     * Build complete provenance tree
     */
    buildProvenanceTree(dataId, visited = new Set()) {
        if (visited.has(dataId)) {
            return null; // Prevent circular references
        }

        visited.add(dataId);

        const provenance = this.provenanceGraph.get(dataId);
        if (!provenance) {
            return null;
        }

        const tree = {
            dataId,
            operation: provenance.operation,
            timestamp: provenance.timestamp,
            userId: provenance.userId,
            metadata: provenance.metadata,
            children: []
        };

        // Recursively build tree for parent data
        for (const parentId of provenance.parentDataIds) {
            const childTree = this.buildProvenanceTree(parentId, visited);
            if (childTree) {
                tree.children.push(childTree);
            }
        }

        return tree;
    }

    /**
     * Verify audit log integrity using cryptographic hashes
     */
    async verifyLogIntegrity() {
        if (!this.config.enableCryptoVerification) {
            return { verified: true, message: 'Crypto verification not enabled' };
        }

        const errors = [];

        for (let i = 0; i < this.auditLog.length; i++) {
            const event = this.auditLog[i];

            // Verify event hash
            const expectedHash = await this.generateEventHash(event);
            if (event.hash !== expectedHash) {
                errors.push({
                    eventId: event.eventId,
                    error: 'Hash mismatch',
                    expected: expectedHash,
                    actual: event.hash
                });
            }

            // Verify chain integrity
            if (i > 0) {
                const previousEvent = this.auditLog[i - 1];
                if (event.previousHash !== previousEvent.hash) {
                    errors.push({
                        eventId: event.eventId,
                        error: 'Chain broken',
                        expected: previousEvent.hash,
                        actual: event.previousHash
                    });
                }
            }
        }

        return {
            verified: errors.length === 0,
            totalEvents: this.auditLog.length,
            errors
        };
    }

    /**
     * Generate cryptographic hash for event
     */
    async generateEventHash(event) {
        const data = {
            eventId: event.eventId,
            category: event.category,
            timestamp: event.timestamp,
            type: event.type,
            userId: event.userId,
            sessionId: event.sessionId,
            action: event.action,
            resource: event.resource
        };

        return await generateHash(JSON.stringify(data));
    }

    /**
     * Generate cryptographic hash for provenance
     */
    async generateProvenanceHash(provenance) {
        const data = {
            provenanceId: provenance.provenanceId,
            dataId: provenance.dataId,
            operation: provenance.operation,
            timestamp: provenance.timestamp,
            parentDataIds: provenance.parentDataIds,
            userId: provenance.userId
        };

        return await generateHash(JSON.stringify(data));
    }

    /**
     * Get hash of last event in chain
     */
    getLastEventHash() {
        if (this.auditLog.length === 0) {
            return null;
        }
        return this.auditLog[this.auditLog.length - 1].hash;
    }

    /**
     * Persist event to storage
     */
    async persistEvent(event) {
        try {
            if (this.config.storageType === 'indexeddb' && this.db) {
                const transaction = this.db.transaction(['auditLog'], 'readwrite');
                const store = transaction.objectStore('auditLog');
                await store.add(event);
            } else if (this.config.storageType === 'firestore' && this.firestore) {
                await this.firestore
                    .collection('auditLog')
                    .doc(event.eventId)
                    .set(event);
            }
        } catch (error) {
            console.error('[AuditLogger] Persist event error:', error);
        }
    }

    /**
     * Persist provenance to storage
     */
    async persistProvenance(provenance) {
        try {
            if (this.config.storageType === 'indexeddb' && this.db) {
                const transaction = this.db.transaction(['provenance'], 'readwrite');
                const store = transaction.objectStore('provenance');
                await store.put(provenance); // Use put to allow updates
            } else if (this.config.storageType === 'firestore' && this.firestore) {
                await this.firestore
                    .collection('provenance')
                    .doc(provenance.dataId)
                    .set(provenance);
            }
        } catch (error) {
            console.error('[AuditLogger] Persist provenance error:', error);
        }
    }

    /**
     * Send audit event to central endpoint
     */
    async sendToCentralEndpoint(event) {
        try {
            await fetch(this.config.centralEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });
        } catch (error) {
            console.error('[AuditLogger] Central endpoint error:', error);
        }
    }

    /**
     * Generate analytics report
     */
    generateAnalyticsReport(filters = {}) {
        const events = this.queryAuditLog(filters);

        const report = {
            totalEvents: events.length,
            timeRange: {
                start: events[0]?.timestamp,
                end: events[events.length - 1]?.timestamp
            },
            byCategory: {},
            bySeverity: {},
            byUser: {},
            bySession: {},
            topActions: {},
            topResources: {}
        };

        events.forEach(event => {
            // By category
            report.byCategory[event.category] = (report.byCategory[event.category] || 0) + 1;

            // By severity
            report.bySeverity[event.severity] = (report.bySeverity[event.severity] || 0) + 1;

            // By user
            if (event.userId) {
                report.byUser[event.userId] = (report.byUser[event.userId] || 0) + 1;
            }

            // By session
            if (event.sessionId) {
                report.bySession[event.sessionId] = (report.bySession[event.sessionId] || 0) + 1;
            }

            // Top actions
            if (event.action) {
                report.topActions[event.action] = (report.topActions[event.action] || 0) + 1;
            }

            // Top resources
            if (event.resource) {
                report.topResources[event.resource] = (report.topResources[event.resource] || 0) + 1;
            }
        });

        return report;
    }

    /**
     * Export audit log for compliance
     */
    async exportAuditLog(format = 'json', filters = {}) {
        const events = this.queryAuditLog(filters);

        if (format === 'json') {
            return JSON.stringify(events, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(events);
        }

        return events;
    }

    /**
     * Convert audit log to CSV
     */
    convertToCSV(events) {
        const headers = ['Event ID', 'Timestamp', 'Category', 'Type', 'User ID', 'Session ID', 'Action', 'Resource', 'Severity'];
        const rows = events.map(e => [
            e.eventId,
            e.timestamp,
            e.category,
            e.type,
            e.userId || '',
            e.sessionId || '',
            e.action || '',
            e.resource || '',
            e.severity
        ]);

        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    /**
     * Get device context for logging
     */
    getDeviceContext() {
        const navigator = window.navigator;
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
        };
    }

    /**
     * Generate unique event ID
     */
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    /**
     * Generate unique provenance ID
     */
    generateProvenanceId() {
        return `prov_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    /**
     * Get recent audit events
     */
    getRecentEvents(limit = 100) {
        return this.auditLog.slice(-limit);
    }

    /**
     * Clear old audit logs based on retention policy
     */
    async enforceRetentionPolicy() {
        const cutoffTime = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);

        // Remove from in-memory log
        this.auditLog = this.auditLog.filter(e => e.timestampMs >= cutoffTime);

        // Remove from storage
        if (this.config.storageType === 'indexeddb' && this.db) {
            const transaction = this.db.transaction(['auditLog'], 'readwrite');
            const store = transaction.objectStore('auditLog');
            const index = store.index('timestamp');
            const range = IDBKeyRange.upperBound(new Date(cutoffTime).toISOString());

            const request = index.openCursor(range);
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };
        }

        console.log('[AuditLogger] Retention policy enforced, cutoff:', new Date(cutoffTime));
    }
}

// Create singleton instance
const auditLogger = new AuditLogger();

/**
 * Export convenience function
 */
async function logAuditEvent(category, data) {
    return await auditLogger.logAuditEvent(category, data);
}

async function trackDataProvenance(dataId, operation, metadata) {
    return await auditLogger.trackDataProvenance(dataId, operation, metadata);
}

// Export the module
export {
    AuditLogger,
    auditLogger,
    logAuditEvent,
    trackDataProvenance,
    EVENT_CATEGORIES,
    SEVERITY_LEVELS,
    DATA_OPERATIONS
};
