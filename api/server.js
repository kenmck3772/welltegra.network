/**
 * WellTegra API Server - Sprint 11
 *
 * REST API for procedure management with JWT authentication
 * Publishes updates to Kafka for real-time WebSocket broadcasting
 *
 * @author Sprint 11 - Procedure API Team
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Kafka } = require('kafkajs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
}));
app.use(express.json());

// JWT Configuration (matches Catriona's security framework)
const JWT_SECRET = process.env.JWT_SECRET || 'welltegra-dev-secret-key';

// Kafka Configuration (Gus's streaming platform)
const kafka = new Kafka({
    clientId: 'welltegra-api',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();
let producerConnected = false;

// Initialize Kafka producer
async function initKafka() {
    try {
        await producer.connect();
        producerConnected = true;
        console.log('[Kafka] Producer connected');
    } catch (error) {
        console.error('[Kafka] Failed to connect producer:', error);
        producerConnected = false;
    }
}

initKafka();

// ==================== SECURITY UTILITIES ====================

/**
 * Validate and sanitize wellId to prevent prototype pollution
 * @param {string} wellId - Well identifier
 * @returns {boolean} - True if valid
 */
function isValidWellId(wellId) {
    if (!wellId || typeof wellId !== 'string') {
        return false;
    }

    // Prevent prototype pollution attacks
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    if (dangerousKeys.includes(wellId.toLowerCase())) {
        return false;
    }

    // Validate format: alphanumeric, hyphens, underscores only
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    return validPattern.test(wellId) && wellId.length <= 50;
}

/**
 * Validate and sanitize stepId to prevent prototype pollution
 * @param {string} stepId - Step identifier
 * @returns {boolean} - True if valid
 */
function isValidStepId(stepId) {
    if (!stepId || typeof stepId !== 'string') {
        return false;
    }

    // Prevent prototype pollution attacks
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    if (dangerousKeys.includes(stepId.toLowerCase())) {
        return false;
    }

    // Validate format: alphanumeric, hyphens, underscores only
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    return validPattern.test(stepId) && stepId.length <= 100;
}

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - User input
 * @returns {string} - Sanitized string
 */
function sanitizeString(input) {
    if (!input || typeof input !== 'string') {
        return '';
    }

    // Remove HTML tags and limit length
    return input
        .replace(/[<>]/g, '')
        .trim()
        .substring(0, 500);
}

/**
 * Validate status value
 * @param {string} status - Status value
 * @returns {boolean} - True if valid
 */
function isValidStatus(status) {
    const validStatuses = ['pending', 'in-progress', 'completed'];
    return validStatuses.includes(status);
}

// ==================== MIDDLEWARE ====================

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header
 */
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    });
}

// ==================== DATA STORE ====================

/**
 * In-memory data store for procedures
 * In production, this would be a database (PostgreSQL, MongoDB, etc.)
 */
const procedures = {
    'W666': [
        {
            id: 'step-1',
            title: 'Pre-Spud Meeting',
            description: 'Complete pre-spud safety meeting with all personnel',
            status: 'completed',
            assignee: 'Finlay MacLeod',
            timestamp: '2024-11-05T08:00:00Z',
            wellId: 'W666'
        },
        {
            id: 'step-2',
            title: 'Rig-up BOP Stack',
            description: 'Install and pressure test 5-ram BOP stack',
            status: 'completed',
            assignee: 'Rowan Ross',
            timestamp: '2024-11-05T10:30:00Z',
            wellId: 'W666'
        },
        {
            id: 'step-3',
            title: 'Run Surface Casing',
            description: 'Run 13-3/8" surface casing to 2,500ft',
            status: 'in-progress',
            assignee: 'Rowan Ross',
            timestamp: '2024-11-05T14:00:00Z',
            wellId: 'W666'
        },
        {
            id: 'step-4',
            title: 'Cement Surface Casing',
            description: 'Cement surface casing with lead/tail slurry',
            status: 'pending',
            assignee: 'Dr. Isla Munro',
            timestamp: null,
            wellId: 'W666'
        }
    ],
    'W001': [
        {
            id: 'step-w001-1',
            title: 'Equipment Mobilization',
            description: 'Mobilize drilling equipment to North Sea Alpha location',
            status: 'completed',
            assignee: 'Logistics Team',
            timestamp: '2024-11-04T09:00:00Z',
            wellId: 'W001'
        }
    ]
};

// ==================== API ENDPOINTS ====================

/**
 * GET /api/v1/procedures/:wellId
 * Get procedure checklist for a specific well
 */
app.get('/api/v1/procedures/:wellId', authenticateJWT, (req, res) => {
    const { wellId } = req.params;

    // Validate wellId to prevent prototype pollution
    if (!isValidWellId(wellId)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid well ID format'
        });
    }

    console.log(`[API] GET /procedures/${wellId} - User: ${req.user.name}`);

    // Safe property access using Object.hasOwn
    const wellProcedures = Object.hasOwn(procedures, wellId) ? procedures[wellId] : [];

    res.json({
        success: true,
        wellId: wellId,
        checklist: wellProcedures,
        count: wellProcedures.length
    });
});

/**
 * POST /api/v1/procedures/:wellId/step
 * Create a new procedure step
 */
app.post('/api/v1/procedures/:wellId/step', authenticateJWT, async (req, res) => {
    const { wellId } = req.params;
    const { title, description, assignee } = req.body;

    // Validate wellId to prevent prototype pollution
    if (!isValidWellId(wellId)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid well ID format'
        });
    }

    console.log(`[API] POST /procedures/${wellId}/step - User: ${req.user.name}`);

    // Validation
    if (!title || !description) {
        return res.status(400).json({
            success: false,
            error: 'Title and description are required'
        });
    }

    // Sanitize user inputs to prevent XSS
    const sanitizedTitle = sanitizeString(title);
    const sanitizedDescription = sanitizeString(description);
    const sanitizedAssignee = sanitizeString(assignee) || req.user.name;

    if (!sanitizedTitle || !sanitizedDescription) {
        return res.status(400).json({
            success: false,
            error: 'Title and description cannot be empty after sanitization'
        });
    }

    // Create new step
    const newStep = {
        id: `step-${Date.now()}`,
        title: sanitizedTitle,
        description: sanitizedDescription,
        status: 'pending',
        assignee: sanitizedAssignee,
        timestamp: new Date().toISOString(),
        wellId
    };

    // Add to data store - safe property creation
    if (!Object.hasOwn(procedures, wellId)) {
        procedures[wellId] = [];
    }
    procedures[wellId].push(newStep);

    // Publish to Kafka
    await publishProcedureUpdate(wellId, procedures[wellId]);

    res.status(201).json({
        success: true,
        step: newStep
    });
});

/**
 * PUT /api/v1/procedures/step/:stepId
 * Update an existing procedure step
 */
app.put('/api/v1/procedures/step/:stepId', authenticateJWT, async (req, res) => {
    const { stepId } = req.params;
    const { status, title, description, assignee } = req.body;

    // Validate stepId to prevent prototype pollution
    if (!isValidStepId(stepId)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid step ID format'
        });
    }

    // Validate status if provided
    if (status && !isValidStatus(status)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid status value. Must be: pending, in-progress, or completed'
        });
    }

    console.log(`[API] PUT /procedures/step/${stepId} - User: ${req.user.name}`);

    // Find step across all wells - safe iteration
    let foundStep = null;
    let foundWellId = null;

    for (const wellId of Object.keys(procedures)) {
        if (Object.hasOwn(procedures, wellId)) {
            const steps = procedures[wellId];
            const step = steps.find(s => s.id === stepId);
            if (step) {
                foundStep = step;
                foundWellId = wellId;
                break;
            }
        }
    }

    if (!foundStep) {
        return res.status(404).json({
            success: false,
            error: 'Step not found'
        });
    }

    // Sanitize and update fields
    if (status) foundStep.status = status;
    if (title) foundStep.title = sanitizeString(title);
    if (description) foundStep.description = sanitizeString(description);
    if (assignee) foundStep.assignee = sanitizeString(assignee);
    foundStep.timestamp = new Date().toISOString();

    // Publish to Kafka
    await publishProcedureUpdate(foundWellId, procedures[foundWellId]);

    res.json({
        success: true,
        step: foundStep
    });
});

/**
 * DELETE /api/v1/procedures/step/:stepId
 * Delete a procedure step
 */
app.delete('/api/v1/procedures/step/:stepId', authenticateJWT, async (req, res) => {
    const { stepId } = req.params;

    // Validate stepId to prevent prototype pollution
    if (!isValidStepId(stepId)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid step ID format'
        });
    }

    console.log(`[API] DELETE /procedures/step/${stepId} - User: ${req.user.name}`);

    // Find and remove step - safe iteration
    let removed = false;
    let affectedWellId = null;

    for (const wellId of Object.keys(procedures)) {
        if (Object.hasOwn(procedures, wellId)) {
            const steps = procedures[wellId];
            const index = steps.findIndex(s => s.id === stepId);
            if (index !== -1) {
                steps.splice(index, 1);
                removed = true;
                affectedWellId = wellId;
                break;
            }
        }
    }

    if (!removed) {
        return res.status(404).json({
            success: false,
            error: 'Step not found'
        });
    }

    // Publish to Kafka
    await publishProcedureUpdate(affectedWellId, procedures[affectedWellId]);

    res.json({
        success: true,
        message: 'Step deleted successfully'
    });
});

// ==================== KAFKA INTEGRATION ====================

/**
 * Publish procedure update to Kafka
 * This will be consumed by WebSocket service and broadcast to all clients
 */
async function publishProcedureUpdate(wellId, checklist) {
    if (!producerConnected) {
        console.warn('[Kafka] Producer not connected, skipping publish');
        return;
    }

    try {
        const message = {
            wellId,
            checklist,
            timestamp: Math.floor(Date.now() / 1000)
        };

        await producer.send({
            topic: 'procedure-update',
            messages: [
                {
                    key: wellId,
                    value: JSON.stringify(message)
                }
            ]
        });

        console.log(`[Kafka] Published procedure-update for ${wellId}`);
    } catch (error) {
        console.error('[Kafka] Failed to publish message:', error);
    }
}

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        kafka: producerConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// ==================== SERVER STARTUP ====================

app.listen(PORT, () => {
    console.log(`[API Server] Running on http://localhost:${PORT}`);
    console.log(`[API Server] Health check: http://localhost:${PORT}/health`);
    console.log(`[API Server] JWT Secret: ${JWT_SECRET === 'welltegra-dev-secret-key' ? 'DEVELOPMENT MODE' : 'Production'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[API Server] SIGTERM received, closing connections...');
    await producer.disconnect();
    process.exit(0);
});
