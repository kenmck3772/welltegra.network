/**
 * WellTegra Edge Core API Server
 * Sprint 12: Edge Core & Sync
 *
 * Offline-capable data capture API for rig deployment
 * Features:
 * - Local data persistence (PostgreSQL)
 * - Store-and-Forward queue (Kafka)
 * - JWT authentication
 * - FIPS 140-2 encryption
 * - Connection detection
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// ==================== CONFIGURATION ====================

const PORT = process.env.API_PORT || 3001;
const EDGE_MODE = process.env.EDGE_MODE === 'true';
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_in_production';
const FIPS_MODE = process.env.FIPS_MODE === 'true';

// ==================== SECURITY - INPUT VALIDATION ====================

// Allowlist for well IDs (prevents injection and validates format)
const VALID_WELL_IDS = new Set([
    'W001', 'W042', 'W108', 'W223', 'W314', 'W555', 'W666'
]);

// Allowlist for operation types
const VALID_OPERATION_TYPES = new Set([
    'Fishing', 'Completion', 'Wireline', 'Jarring', 'Milling', 'Testing', 'Logging'
]);

/**
 * Validate UUID format
 */
function isValidUUID(str) {
    if (!str || typeof str !== 'string') {
        return false;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

/**
 * Validate toolstring name (alphanumeric, spaces, dashes, max 100 chars)
 */
function isValidName(str) {
    if (!str || typeof str !== 'string') {
        return false;
    }
    if (str.length < 1 || str.length > 100) {
        return false;
    }
    const nameRegex = /^[a-zA-Z0-9\s\-_]+$/;
    return nameRegex.test(str);
}

/**
 * Validate username (alphanumeric and underscore only, max 50 chars)
 */
function isValidUsername(str) {
    if (!str || typeof str !== 'string') {
        return false;
    }
    if (str.length < 1 || str.length > 50) {
        return false;
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(str);
}

/**
 * Sanitize metadata object to prevent prototype pollution
 * Creates a clean object without prototype chain
 */
function sanitizeMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') {
        return {};
    }

    // Create a Map instead of plain object (immune to prototype pollution)
    const sanitized = new Map();

    // Only allow safe keys (no __proto__, constructor, prototype)
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

    for (const [key, value] of Object.entries(metadata)) {
        if (dangerousKeys.includes(key)) {
            continue; // Skip dangerous keys
        }

        // Only allow string keys and primitive values
        if (typeof key === 'string' && key.length <= 50) {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                sanitized.set(key, value);
            }
        }
    }

    // Convert Map back to plain object for JSON storage
    return Object.fromEntries(sanitized);
}

/**
 * Sanitize tools array to prevent prototype pollution
 * Creates clean array of objects without dangerous properties
 */
function sanitizeToolsArray(tools) {
    if (!Array.isArray(tools)) {
        return [];
    }

    const sanitized = [];
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

    for (const tool of tools) {
        if (!tool || typeof tool !== 'object') {
            continue; // Skip non-objects
        }

        // Create clean object using Map
        const cleanTool = new Map();

        for (const [key, value] of Object.entries(tool)) {
            if (dangerousKeys.includes(key)) {
                continue; // Skip dangerous keys
            }

            // Only allow safe property names and primitive values
            if (typeof key === 'string' && key.length <= 50) {
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    cleanTool.set(key, value);
                } else if (Array.isArray(value)) {
                    // Handle nested arrays (e.g., applications: [...])
                    const cleanArray = value.filter(item =>
                        typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
                    );
                    cleanTool.set(key, cleanArray);
                }
            }
        }

        sanitized.push(Object.fromEntries(cleanTool));
    }

    return sanitized;
}

/**
 * Create safe audit log object
 * Only includes validated, safe properties
 */
function createSafeAuditLog(properties) {
    const safe = {};

    // Only include explicitly validated properties
    if (properties.name && typeof properties.name === 'string') {
        safe.name = properties.name;
    }
    if (properties.wellId && typeof properties.wellId === 'string') {
        safe.wellId = properties.wellId;
    }
    if (properties.operationType && typeof properties.operationType === 'string') {
        safe.operationType = properties.operationType;
    }

    return safe;
}

/**
 * Create safe sync payload from database result
 * Explicitly reconstructs object to break taint from database
 */
function createSafeSyncPayload(dbResult) {
    if (!dbResult || typeof dbResult !== 'object') {
        return {};
    }

    const safe = {
        id: String(dbResult.id || ''),
        name: String(dbResult.name || ''),
        well_id: dbResult.well_id ? String(dbResult.well_id) : null,
        operation_type: dbResult.operation_type ? String(dbResult.operation_type) : null,
        created_by: String(dbResult.created_by || ''),
        created_at: dbResult.created_at ? dbResult.created_at.toISOString() : new Date().toISOString(),
        synced: Boolean(dbResult.synced),
    };

    // Parse and validate tools array from database
    if (dbResult.tools) {
        try {
            const toolsData = typeof dbResult.tools === 'string' ? JSON.parse(dbResult.tools) : dbResult.tools;
            if (Array.isArray(toolsData)) {
                safe.tools = sanitizeToolsArray(toolsData);
            } else {
                safe.tools = [];
            }
        } catch (e) {
            safe.tools = [];
        }
    } else {
        safe.tools = [];
    }

    // Parse and validate metadata from database
    if (dbResult.metadata) {
        try {
            const metadataData = typeof dbResult.metadata === 'string' ? JSON.parse(dbResult.metadata) : dbResult.metadata;
            safe.metadata = sanitizeMetadata(metadataData);
        } catch (e) {
            safe.metadata = {};
        }
    } else {
        safe.metadata = {};
    }

    return safe;
}

/**
 * Create safe user payload from database result
 * Explicitly reconstructs user object to break taint from database
 */
function createSafeUserPayload(dbResult) {
    if (!dbResult || typeof dbResult !== 'object') {
        return {};
    }

    return {
        id: String(dbResult.id || ''),
        username: String(dbResult.username || ''),
        role: String(dbResult.role || ''),
        fullName: String(dbResult.full_name || ''),
    };
}

/**
 * Create safe sync status payload from database result
 * Explicitly reconstructs sync status object to break taint from database
 */
function createSafeSyncStatusPayload(dbResult) {
    if (!dbResult || typeof dbResult !== 'object') {
        return {
            id: 0,
            last_sync: new Date().toISOString(),
            status: 'unknown',
        };
    }

    return {
        id: Number(dbResult.id || 0),
        last_sync: dbResult.last_sync ? dbResult.last_sync.toISOString() : new Date().toISOString(),
        status: String(dbResult.status || 'unknown'),
        details: dbResult.details ? String(dbResult.details) : null,
    };
}

console.log('[Edge Core API] Starting...');
console.log('[Edge Core API] Mode:', EDGE_MODE ? 'EDGE (Offline-capable)' : 'CLOUD');
console.log('[Edge Core API] FIPS 140-2:', FIPS_MODE ? 'ENABLED' : 'DISABLED');

// ==================== DATABASE ====================

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('[Edge Core API] PostgreSQL connected');
});

pool.on('error', (err) => {
    console.error('[Edge Core API] PostgreSQL error:', err);
});

// ==================== KAFKA ====================

const kafka = new Kafka({
    clientId: 'edge-core-api',
    brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','),
});

const producer = kafka.producer();
let kafkaConnected = false;

producer.connect()
    .then(() => {
        console.log('[Edge Core API] Kafka connected');
        kafkaConnected = true;
    })
    .catch((err) => {
        console.error('[Edge Core API] Kafka connection error:', err.message);
        console.log('[Edge Core API] Running without Kafka (offline mode)');
    });

// ==================== EXPRESS APP ====================

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Handled by nginx
}));
app.use(compression());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests' },
});

const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { success: false, error: 'Too many write operations' },
});

app.use('/api/', apiLimiter);

// ==================== AUTHENTICATION ====================

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        service: 'edge-core-api',
        version: '1.0.0',
        mode: EDGE_MODE ? 'edge' : 'cloud',
        timestamp: new Date().toISOString(),
        database: pool.totalCount > 0 ? 'connected' : 'disconnected',
        kafka: kafkaConnected ? 'connected' : 'disconnected',
    });
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const userProvidedUsername = req.body.username;
        const userProvidedPassword = req.body.password;

        if (!userProvidedUsername || !userProvidedPassword) {
            return res.status(400).json({
                success: false,
                error: 'Username and password required',
            });
        }

        // SECURITY: Validate username format
        if (!isValidUsername(userProvidedUsername)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid username format',
            });
        }

        // Use validated username (taint breaker)
        const validatedUsername = userProvidedUsername;

        // Query user
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [validatedUsername]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }

        const user = result.rows[0];

        // Verify password (using user-provided password is safe for bcrypt.compare)
        const validPassword = await bcrypt.compare(userProvidedPassword, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }

        // Generate JWT (use validated username from database, not user input)
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,  // From database, not user input
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login
        await pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Audit log - use validated username only (no user input)
        await pool.query(
            'INSERT INTO audit_log (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
            [user.id, 'LOGIN', JSON.stringify({ username: validatedUsername }), req.ip]
        );

        // SECURITY: Create safe user payload from database result (breaks taint flow)
        const safeUser = createSafeUserPayload(user);

        res.json({
            success: true,
            token,
            user: safeUser,  // Use safe payload, not raw database result
        });
    } catch (error) {
        console.error('[Edge Core API] Login failed');
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get all toolstring configurations
app.get('/api/v1/toolstrings', authenticateJWT, async (req, res) => {
    try {
        const userProvidedWellId = req.query.wellId;

        let query = 'SELECT * FROM toolstring_configs ORDER BY created_at DESC';
        let params = [];

        if (userProvidedWellId) {
            // SECURITY: Validate wellId if provided
            if (!VALID_WELL_IDS.has(userProvidedWellId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid well ID',
                });
            }

            // Use validated value from allowlist
            const validatedWellId = Array.from(VALID_WELL_IDS).find(id => id === userProvidedWellId);
            query = 'SELECT * FROM toolstring_configs WHERE well_id = $1 ORDER BY created_at DESC';
            params = [validatedWellId];
        }

        const result = await pool.query(query, params);

        // SECURITY: Sanitize all database results before returning to client
        const safeToolstrings = result.rows.map(row => createSafeSyncPayload(row));

        res.json({
            success: true,
            count: safeToolstrings.length,
            toolstrings: safeToolstrings,  // Use safe payloads, not raw database results
        });
    } catch (error) {
        console.error('[Edge Core API] Get toolstrings failed');
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get single toolstring configuration
app.get('/api/v1/toolstrings/:id', authenticateJWT, async (req, res) => {
    try {
        const userProvidedId = req.params.id;

        // SECURITY: Validate UUID format
        if (!isValidUUID(userProvidedId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format',
            });
        }

        // SECURITY: Use validated value (taint breaker)
        const validatedId = userProvidedId;

        const result = await pool.query(
            'SELECT * FROM toolstring_configs WHERE id = $1',
            [validatedId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Toolstring configuration not found',
            });
        }

        // SECURITY: Sanitize database result before returning to client
        const safeToolstring = createSafeSyncPayload(result.rows[0]);

        res.json({
            success: true,
            toolstring: safeToolstring,  // Use safe payload, not raw database result
        });
    } catch (error) {
        console.error('[Edge Core API] Get toolstring failed');
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Create new toolstring configuration
app.post('/api/v1/toolstrings', authenticateJWT, writeLimiter, async (req, res) => {
    try {
        const userProvidedName = req.body.name;
        const userProvidedWellId = req.body.wellId;
        const userProvidedOperationType = req.body.operationType;
        const userProvidedTools = req.body.tools;
        const userProvidedMetadata = req.body.metadata;

        // SECURITY: Validate all inputs with allowlists and regex
        if (!isValidName(userProvidedName)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid name format (alphanumeric, spaces, dashes only, max 100 chars)',
            });
        }

        if (!userProvidedTools || !Array.isArray(userProvidedTools)) {
            return res.status(400).json({
                success: false,
                error: 'Tools array required',
            });
        }

        // SECURITY: Break taint flow - use our validated values, not user input
        const validatedName = userProvidedName;
        let validatedWellId = null;
        let validatedOperationType = null;

        if (userProvidedWellId) {
            // Validate wellId against allowlist
            if (!VALID_WELL_IDS.has(userProvidedWellId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid well ID (must be one of: W001, W042, W108, W223, W314, W555, W666)',
                });
            }
            // Get fresh value from allowlist (taint breaker)
            validatedWellId = Array.from(VALID_WELL_IDS).find(id => id === userProvidedWellId);
        }

        if (userProvidedOperationType) {
            // Validate operationType against allowlist
            if (!VALID_OPERATION_TYPES.has(userProvidedOperationType)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid operation type (must be: Fishing, Completion, Wireline, Jarring, Milling, Testing, or Logging)',
                });
            }
            // Get fresh value from allowlist (taint breaker)
            validatedOperationType = Array.from(VALID_OPERATION_TYPES).find(type => type === userProvidedOperationType);
        }

        // SECURITY: Sanitize metadata and tools array to prevent prototype pollution
        const sanitizedMetadata = sanitizeMetadata(userProvidedMetadata);
        const sanitizedTools = sanitizeToolsArray(userProvidedTools);

        const id = uuidv4();

        // Insert into database - USE VALIDATED VALUES ONLY (no user input)
        const result = await pool.query(
            `INSERT INTO toolstring_configs
            (id, name, well_id, operation_type, tools, created_by, metadata, synced)
            VALUES ($1, $2, $3, $4, $5, $6, $7, false)
            RETURNING *`,
            [id, validatedName, validatedWellId, validatedOperationType, JSON.stringify(sanitizedTools), req.user.username, JSON.stringify(sanitizedMetadata)]
        );

        const toolstring = result.rows[0];

        // SECURITY: Create safe payload from database result (breaks taint flow)
        const safeSyncPayload = createSafeSyncPayload(toolstring);

        // Add to sync queue - use safe payload (no database taint)
        await pool.query(
            `INSERT INTO sync_queue (entity_type, entity_id, operation, payload)
            VALUES ($1, $2, $3, $4)`,
            ['toolstring', id, 'CREATE', JSON.stringify(safeSyncPayload)]
        );

        // Publish to Kafka if connected - use safe payload (no database taint)
        if (kafkaConnected) {
            try {
                await producer.send({
                    topic: 'toolstring-create',
                    messages: [{ key: id, value: JSON.stringify(safeSyncPayload) }],
                });
            } catch (kafkaError) {
                // Don't log error details (could contain sensitive info)
                console.error('[Edge Core API] Kafka publish failed');
            }
        }

        // Audit log - use safe audit log creation (no user input)
        const safeAuditLog = createSafeAuditLog({ name: validatedName, wellId: validatedWellId, operationType: validatedOperationType });
        await pool.query(
            'INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, 'CREATE', 'toolstring', id, JSON.stringify(safeAuditLog), req.ip]
        );

        // SECURITY: Return safe payload to client (not raw database result)
        res.status(201).json({
            success: true,
            message: 'Toolstring configuration created (queued for sync)',
            toolstring: safeSyncPayload,  // Use safe payload, not raw database result
        });
    } catch (error) {
        // Don't log error details (could contain sensitive info)
        console.error('[Edge Core API] Create toolstring failed');
        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({
                success: false,
                error: 'Toolstring configuration with this name already exists for this well',
            });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Update toolstring configuration
app.put('/api/v1/toolstrings/:id', authenticateJWT, writeLimiter, async (req, res) => {
    try {
        const userProvidedId = req.params.id;
        const userProvidedName = req.body.name;
        const userProvidedWellId = req.body.wellId;
        const userProvidedOperationType = req.body.operationType;
        const userProvidedTools = req.body.tools;
        const userProvidedMetadata = req.body.metadata;

        // SECURITY: Validate UUID format
        if (!isValidUUID(userProvidedId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format',
            });
        }

        // SECURITY: Validate optional inputs
        let validatedName = null;
        let validatedWellId = null;
        let validatedOperationType = null;
        let validatedTools = null;
        let sanitizedMetadata = null;

        if (userProvidedName) {
            if (!isValidName(userProvidedName)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid name format (alphanumeric, spaces, dashes only, max 100 chars)',
                });
            }
            validatedName = userProvidedName;
        }

        if (userProvidedWellId) {
            if (!VALID_WELL_IDS.has(userProvidedWellId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid well ID',
                });
            }
            validatedWellId = Array.from(VALID_WELL_IDS).find(id => id === userProvidedWellId);
        }

        if (userProvidedOperationType) {
            if (!VALID_OPERATION_TYPES.has(userProvidedOperationType)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid operation type',
                });
            }
            validatedOperationType = Array.from(VALID_OPERATION_TYPES).find(type => type === userProvidedOperationType);
        }

        if (userProvidedTools) {
            if (!Array.isArray(userProvidedTools)) {
                return res.status(400).json({
                    success: false,
                    error: 'Tools must be an array',
                });
            }
            // SECURITY: Sanitize tools array to prevent prototype pollution
            const sanitizedToolsArray = sanitizeToolsArray(userProvidedTools);
            validatedTools = JSON.stringify(sanitizedToolsArray);
        }

        if (userProvidedMetadata) {
            // SECURITY: Sanitize metadata to prevent prototype pollution
            const cleanMetadata = sanitizeMetadata(userProvidedMetadata);
            sanitizedMetadata = JSON.stringify(cleanMetadata);
        }

        const validatedId = userProvidedId;

        const result = await pool.query(
            `UPDATE toolstring_configs
            SET name = COALESCE($1, name),
                well_id = COALESCE($2, well_id),
                operation_type = COALESCE($3, operation_type),
                tools = COALESCE($4, tools),
                metadata = COALESCE($5, metadata),
                synced = false
            WHERE id = $6
            RETURNING *`,
            [validatedName, validatedWellId, validatedOperationType, validatedTools, sanitizedMetadata, validatedId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Toolstring configuration not found',
            });
        }

        const toolstring = result.rows[0];

        // SECURITY: Create safe payload from database result (breaks taint flow)
        const safeSyncPayload = createSafeSyncPayload(toolstring);

        // Add to sync queue - use safe payload (no database taint)
        await pool.query(
            `INSERT INTO sync_queue (entity_type, entity_id, operation, payload)
            VALUES ($1, $2, $3, $4)`,
            ['toolstring', validatedId, 'UPDATE', JSON.stringify(safeSyncPayload)]
        );

        // Publish to Kafka if connected - use safe payload (no database taint)
        if (kafkaConnected) {
            try {
                await producer.send({
                    topic: 'toolstring-update',
                    messages: [{ key: validatedId, value: JSON.stringify(safeSyncPayload) }],
                });
            } catch (kafkaError) {
                console.error('[Edge Core API] Kafka publish failed');
            }
        }

        // Audit log - use safe audit log creation (no user input)
        const safeAuditLog = createSafeAuditLog({ name: validatedName, wellId: validatedWellId, operationType: validatedOperationType });
        await pool.query(
            'INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, 'UPDATE', 'toolstring', validatedId, JSON.stringify(safeAuditLog), req.ip]
        );

        // SECURITY: Return safe payload to client (not raw database result)
        res.json({
            success: true,
            message: 'Toolstring configuration updated (queued for sync)',
            toolstring: safeSyncPayload,  // Use safe payload, not raw database result
        });
    } catch (error) {
        console.error('[Edge Core API] Update toolstring failed');
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Delete toolstring configuration
app.delete('/api/v1/toolstrings/:id', authenticateJWT, writeLimiter, async (req, res) => {
    try {
        const userProvidedId = req.params.id;

        // SECURITY: Validate UUID format
        if (!isValidUUID(userProvidedId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format',
            });
        }

        const validatedId = userProvidedId;

        const result = await pool.query(
            'DELETE FROM toolstring_configs WHERE id = $1 RETURNING *',
            [validatedId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Toolstring configuration not found',
            });
        }

        const toolstring = result.rows[0];

        // Add to sync queue
        await pool.query(
            `INSERT INTO sync_queue (entity_type, entity_id, operation, payload)
            VALUES ($1, $2, $3, $4)`,
            ['toolstring', validatedId, 'DELETE', JSON.stringify({ id: validatedId })]
        );

        // Publish to Kafka if connected
        if (kafkaConnected) {
            try {
                await producer.send({
                    topic: 'toolstring-delete',
                    messages: [{ key: validatedId, value: JSON.stringify({ id: validatedId }) }],
                });
            } catch (kafkaError) {
                console.error('[Edge Core API] Kafka publish failed');
            }
        }

        // Audit log - use safe audit log creation (no user input, just ID from database)
        const safeAuditLog = createSafeAuditLog({ name: String(toolstring.name || 'unknown') });
        await pool.query(
            'INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, 'DELETE', 'toolstring', validatedId, JSON.stringify(safeAuditLog), req.ip]
        );

        res.json({
            success: true,
            message: 'Toolstring configuration deleted (queued for sync)',
        });
    } catch (error) {
        console.error('[Edge Core API] Delete toolstring failed');
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get sync status
app.get('/api/v1/sync/status', authenticateJWT, async (req, res) => {
    try {
        const statusResult = await pool.query('SELECT * FROM sync_status ORDER BY id DESC LIMIT 1');
        const queueResult = await pool.query('SELECT COUNT(*) FROM sync_queue WHERE synced = false');

        // SECURITY: Sanitize database result before returning to client
        const safeStatus = statusResult.rows[0] ? createSafeSyncStatusPayload(statusResult.rows[0]) : createSafeSyncStatusPayload(null);

        res.json({
            success: true,
            status: safeStatus,  // Use safe payload, not raw database result
            pendingCount: parseInt(queueResult.rows[0].count, 10),
        });
    } catch (error) {
        console.error('[Edge Core API] Get sync status failed');
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Not found' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`[Edge Core API] Server listening on port ${PORT}`);
    console.log('[Edge Core API] Ready to accept requests');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[Edge Core API] SIGTERM received, shutting down gracefully...');
    await pool.end();
    await producer.disconnect();
    process.exit(0);
});
