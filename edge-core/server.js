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
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password required',
            });
        }

        // Query user
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }

        const user = result.rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
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

        // Audit log
        await pool.query(
            'INSERT INTO audit_log (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
            [user.id, 'LOGIN', JSON.stringify({ username }), req.ip]
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                fullName: user.full_name,
            },
        });
    } catch (error) {
        console.error('[Edge Core API] Login error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get all toolstring configurations
app.get('/api/v1/toolstrings', authenticateJWT, async (req, res) => {
    try {
        const { wellId } = req.query;

        let query = 'SELECT * FROM toolstring_configs ORDER BY created_at DESC';
        let params = [];

        if (wellId) {
            query = 'SELECT * FROM toolstring_configs WHERE well_id = $1 ORDER BY created_at DESC';
            params = [wellId];
        }

        const result = await pool.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            toolstrings: result.rows,
        });
    } catch (error) {
        console.error('[Edge Core API] Get toolstrings error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get single toolstring configuration
app.get('/api/v1/toolstrings/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM toolstring_configs WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Toolstring configuration not found',
            });
        }

        res.json({
            success: true,
            toolstring: result.rows[0],
        });
    } catch (error) {
        console.error('[Edge Core API] Get toolstring error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Create new toolstring configuration
app.post('/api/v1/toolstrings', authenticateJWT, writeLimiter, async (req, res) => {
    try {
        const { name, wellId, operationType, tools, metadata } = req.body;

        if (!name || !tools || !Array.isArray(tools)) {
            return res.status(400).json({
                success: false,
                error: 'Name and tools array required',
            });
        }

        const id = uuidv4();

        // Insert into database
        const result = await pool.query(
            `INSERT INTO toolstring_configs
            (id, name, well_id, operation_type, tools, created_by, metadata, synced)
            VALUES ($1, $2, $3, $4, $5, $6, $7, false)
            RETURNING *`,
            [id, name, wellId, operationType, JSON.stringify(tools), req.user.username, JSON.stringify(metadata || {})]
        );

        const toolstring = result.rows[0];

        // Add to sync queue
        await pool.query(
            `INSERT INTO sync_queue (entity_type, entity_id, operation, payload)
            VALUES ($1, $2, $3, $4)`,
            ['toolstring', id, 'CREATE', JSON.stringify(toolstring)]
        );

        // Publish to Kafka if connected
        if (kafkaConnected) {
            try {
                await producer.send({
                    topic: 'toolstring-create',
                    messages: [{ key: id, value: JSON.stringify(toolstring) }],
                });
            } catch (kafkaError) {
                console.error('[Edge Core API] Kafka publish error:', kafkaError.message);
            }
        }

        // Audit log
        await pool.query(
            'INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, 'CREATE', 'toolstring', id, JSON.stringify({ name, wellId }), req.ip]
        );

        res.status(201).json({
            success: true,
            message: 'Toolstring configuration created (queued for sync)',
            toolstring,
        });
    } catch (error) {
        console.error('[Edge Core API] Create toolstring error:', error);
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
        const { id } = req.params;
        const { name, wellId, operationType, tools, metadata } = req.body;

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
            [name, wellId, operationType, tools ? JSON.stringify(tools) : null, metadata ? JSON.stringify(metadata) : null, id]
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
            ['toolstring', id, 'UPDATE', JSON.stringify(toolstring)]
        );

        // Publish to Kafka if connected
        if (kafkaConnected) {
            try {
                await producer.send({
                    topic: 'toolstring-update',
                    messages: [{ key: id, value: JSON.stringify(toolstring) }],
                });
            } catch (kafkaError) {
                console.error('[Edge Core API] Kafka publish error:', kafkaError.message);
            }
        }

        // Audit log
        await pool.query(
            'INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, 'UPDATE', 'toolstring', id, JSON.stringify({ name, wellId }), req.ip]
        );

        res.json({
            success: true,
            message: 'Toolstring configuration updated (queued for sync)',
            toolstring,
        });
    } catch (error) {
        console.error('[Edge Core API] Update toolstring error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Delete toolstring configuration
app.delete('/api/v1/toolstrings/:id', authenticateJWT, writeLimiter, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM toolstring_configs WHERE id = $1 RETURNING *',
            [id]
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
            ['toolstring', id, 'DELETE', JSON.stringify({ id })]
        );

        // Publish to Kafka if connected
        if (kafkaConnected) {
            try {
                await producer.send({
                    topic: 'toolstring-delete',
                    messages: [{ key: id, value: JSON.stringify({ id }) }],
                });
            } catch (kafkaError) {
                console.error('[Edge Core API] Kafka publish error:', kafkaError.message);
            }
        }

        // Audit log
        await pool.query(
            'INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, 'DELETE', 'toolstring', id, JSON.stringify({ name: toolstring.name }), req.ip]
        );

        res.json({
            success: true,
            message: 'Toolstring configuration deleted (queued for sync)',
        });
    } catch (error) {
        console.error('[Edge Core API] Delete toolstring error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get sync status
app.get('/api/v1/sync/status', authenticateJWT, async (req, res) => {
    try {
        const statusResult = await pool.query('SELECT * FROM sync_status ORDER BY id DESC LIMIT 1');
        const queueResult = await pool.query('SELECT COUNT(*) FROM sync_queue WHERE synced = false');

        res.json({
            success: true,
            status: statusResult.rows[0],
            pendingCount: parseInt(queueResult.rows[0].count, 10),
        });
    } catch (error) {
        console.error('[Edge Core API] Get sync status error:', error);
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
