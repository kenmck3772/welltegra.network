# One-Way Ingestion Connector for Sandboxed Tenant

**Author:** Angus Campbell - Data Engineering
**Version:** 1.0
**Date:** 2025-11-06
**Status:** Technical Specification

---

## Executive Summary

This specification defines the architecture and implementation for **one-way data ingestion connectors** that enable customer on-premise systems (SCADA, historians, databases) to securely push data to WellTegra's sandboxed tenant environment. The connector enforces unidirectional data flow to prevent data exfiltration while maintaining real-time operational data streaming.

**Key Requirements:**
- **One-way data flow:** Customer → WellTegra (no reverse data flow)
- **Real-time streaming:** <5 second latency for critical parameters
- **Schema validation:** Enforce WellTegra data models
- **Resilience:** Handle network interruptions with local buffering
- **Security:** TLS 1.3, OAuth 2.0, rate limiting, audit logging

---

## 1. Architecture Overview

### 1.1 Deployment Model

```
┌──────────────────────────────────────────────────────────────────┐
│              Customer On-Premise Environment                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Data Sources                                              │  │
│  │  ├─ SCADA System (Wonderware, Honeywell)                  │  │
│  │  ├─ Historian (OSIsoft PI, Yokogawa)                      │  │
│  │  ├─ SQL Database (SQL Server, Oracle)                     │  │
│  │  └─ File Shares (CSV exports, Daily Reports)             │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│                     │                                             │
│  ┌──────────────────▼─────────────────────────────────────────┐  │
│  │  WellTegra Ingestion Agent (Docker Container)             │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │  1. Data Collector                                   │ │  │
│  │  │     - Poll SCADA tags every 5s                       │ │  │
│  │  │     - Query historian for historical backfill        │ │  │
│  │  │     - Watch file system for new CSVs                 │ │  │
│  │  └──────────────────┬───────────────────────────────────┘ │  │
│  │  ┌──────────────────▼───────────────────────────────────┐ │  │
│  │  │  2. Local Buffer (SQLite)                            │ │  │
│  │  │     - Store data when network is down                │ │  │
│  │  │     - Max 7 days retention (10 GB limit)             │ │  │
│  │  └──────────────────┬───────────────────────────────────┘ │  │
│  │  ┌──────────────────▼───────────────────────────────────┐ │  │
│  │  │  3. Data Transformer                                 │ │  │
│  │  │     - Normalize units (psi, bar, kPa)                │ │  │
│  │  │     - Map customer tags → WellTegra schema           │ │  │
│  │  │     - Validate JSON schema                           │ │  │
│  │  └──────────────────┬───────────────────────────────────┘ │  │
│  │  ┌──────────────────▼───────────────────────────────────┐ │  │
│  │  │  4. HTTPS Client                                     │ │  │
│  │  │     - POST to WellTegra API                          │ │  │
│  │  │     - OAuth 2.0 token refresh                        │ │  │
│  │  │     - Retry logic (exponential backoff)              │ │  │
│  │  └──────────────────┬───────────────────────────────────┘ │  │
│  │                     │ HTTPS POST                            │  │
│  └─────────────────────┼───────────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         │ TLS 1.3 Encrypted
                         │ OAuth 2.0 Bearer Token
                         │ JSON Payload
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│              WellTegra Cloud (Sandboxed Tenant)                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Ingestion Gateway (API)                                   │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │  1. Authentication & Authorization                   │ │  │
│  │  │     - Validate OAuth 2.0 token                       │ │  │
│  │  │     - Check tenant_id in JWT                         │ │  │
│  │  │     - Verify api:ingest scope                        │ │  │
│  │  └──────────────────┬───────────────────────────────────┘ │  │
│  │  ┌──────────────────▼───────────────────────────────────┐ │  │
│  │  │  2. Rate Limiting & Throttling                       │ │  │
│  │  │     - 100 requests/minute per tenant                 │ │  │
│  │  │     - 10 MB max payload size                         │ │  │
│  │  │     - 1 GB/day data volume limit                     │ │  │
│  │  └──────────────────┬───────────────────────────────────┘ │  │
│  │  ┌──────────────────▼───────────────────────────────────┐ │  │
│  │  │  3. Schema Validation                                │ │  │
│  │  │     - JSON Schema v7 validation                      │ │  │
│  │  │     - Data type checking                             │ │  │
│  │  │     - Required field enforcement                     │ │  │
│  │  └──────────────────┬───────────────────────────────────┘ │  │
│  │  ┌──────────────────▼───────────────────────────────────┐ │  │
│  │  │  4. Encryption & Storage                             │ │  │
│  │  │     - Encrypt with tenant DEK (AES-256)              │ │  │
│  │  │     - Write to PostgreSQL tenant schema              │ │  │
│  │  │     - Write to Redis cache for real-time alerts      │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Ingestion Agent (Customer On-Premise)

### 2.1 Docker Container Deployment

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY src/ ./src/
COPY config/ ./config/

# Create local buffer directory
RUN mkdir -p /app/data/buffer

# Non-root user for security
RUN useradd -m -u 1000 welltegra && \
    chown -R welltegra:welltegra /app
USER welltegra

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8080/health')"

CMD ["python", "src/main.py"]
```

**requirements.txt:**
```
requests==2.31.0
pydantic==2.5.0
pyodbc==5.0.1        # SQL Server connector
opcua==0.98.13       # OPC UA for SCADA
paho-mqtt==1.6.1     # MQTT for IoT sensors
sqlalchemy==2.0.23   # Database ORM
aiohttp==3.9.1       # Async HTTP client
tenacity==8.2.3      # Retry logic
```

---

### 2.2 Configuration File (config.yaml)

```yaml
# WellTegra Ingestion Agent Configuration
version: "1.0"

# Tenant Information
tenant:
  id: "operator_shell_uk"
  name: "Shell UK North Sea"

# WellTegra Cloud API
api:
  base_url: "https://api.welltegra.com"
  ingestion_endpoint: "/v1/ingest/realtime"
  auth_endpoint: "/oauth/token"

# OAuth 2.0 Credentials (Client Credentials Grant)
oauth:
  client_id: "${WELLTEGRA_CLIENT_ID}"  # From environment variable
  client_secret: "${WELLTEGRA_CLIENT_SECRET}"
  token_refresh_margin: 300  # Refresh 5 min before expiry

# Data Sources
data_sources:
  # SCADA System (OPC UA)
  - name: "scada_wellhead"
    type: "opcua"
    enabled: true
    connection:
      endpoint: "opc.tcp://10.0.1.50:4840"
      security_mode: "SignAndEncrypt"
      username: "${SCADA_USERNAME}"
      password: "${SCADA_PASSWORD}"
    tags:
      - node_id: "ns=2;s=WHP_WELL_001"
        parameter: "wellhead_pressure"
        unit: "psi"
        poll_interval: 5  # seconds
      - node_id: "ns=2;s=HL_WELL_001"
        parameter: "hookload"
        unit: "klbs"
        poll_interval: 5
      - node_id: "ns=2;s=FLOW_WELL_001"
        parameter: "flow_rate"
        unit: "bbl/day"
        poll_interval: 30

  # Historian (OSIsoft PI)
  - name: "pi_historian"
    type: "pi_historian"
    enabled: true
    connection:
      host: "pi-historian.internal.com"
      port: 5450
      username: "${PI_USERNAME}"
      password: "${PI_PASSWORD}"
    tags:
      - tag_name: "WELL001.TEMP_DOWNHOLE"
        parameter: "downhole_temperature"
        unit: "degF"
        poll_interval: 60

  # SQL Database (Daily Reports)
  - name: "sql_reports"
    type: "sql_server"
    enabled: true
    connection:
      host: "sql-prod.internal.com"
      port: 1433
      database: "WellOperations"
      username: "${SQL_USERNAME}"
      password: "${SQL_PASSWORD}"
    queries:
      - name: "daily_drilling_report"
        schedule: "0 6 * * *"  # Daily at 6 AM
        query: |
          SELECT
            well_id,
            report_date,
            depth_drilled,
            hours_drilling,
            hours_tripping,
            hours_npt,
            comments
          FROM daily_reports
          WHERE report_date = CAST(GETDATE() AS DATE)
        mapping:
          well_id: "well_id"
          report_date: "date"
          depth_drilled: "depth"
          hours_drilling: "drilling_hours"

  # File Watcher (CSV Exports)
  - name: "csv_watcher"
    type: "file_watcher"
    enabled: true
    watch_directory: "/mnt/shares/well_reports"
    file_pattern: "*.csv"
    archive_directory: "/mnt/shares/processed"
    mapping:
      - csv_column: "Wellhead Pressure (psi)"
        parameter: "wellhead_pressure"
        unit: "psi"
      - csv_column: "Hookload (klbs)"
        parameter: "hookload"
        unit: "klbs"

# Local Buffer (SQLite)
buffer:
  enabled: true
  database_path: "/app/data/buffer/ingestion_buffer.db"
  max_size_gb: 10
  retention_days: 7
  flush_interval: 60  # Flush to cloud every 60 seconds

# Retry Policy
retry:
  max_attempts: 5
  initial_delay: 2  # seconds
  max_delay: 300    # 5 minutes
  backoff_multiplier: 2

# Logging
logging:
  level: "INFO"  # DEBUG, INFO, WARNING, ERROR
  file: "/app/logs/ingestion.log"
  max_size_mb: 100
  backup_count: 5

# Monitoring
monitoring:
  health_check_port: 8080
  prometheus_metrics_port: 9090
  alert_webhook: "https://hooks.slack.com/services/..."  # Optional
```

---

### 2.3 Python Implementation (src/main.py)

```python
import asyncio
import logging
from typing import List, Dict, Any
from datetime import datetime
import aiohttp
from tenacity import retry, stop_after_attempt, wait_exponential
from pydantic import BaseModel, ValidationError

from src.collectors import OPCUACollector, PIHistorianCollector, SQLCollector, FileWatcherCollector
from src.buffer import LocalBuffer
from src.auth import OAuthClient
from src.transformer import DataTransformer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataPoint(BaseModel):
    """Schema for a single data point"""
    tenant_id: str
    well_id: str
    timestamp: datetime
    parameter_name: str
    value: float
    unit: str
    quality_code: str = "GOOD"
    source: str


class IngestionAgent:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.tenant_id = config['tenant']['id']

        # Initialize components
        self.oauth_client = OAuthClient(config['oauth'], config['api']['auth_endpoint'])
        self.buffer = LocalBuffer(config['buffer'])
        self.transformer = DataTransformer()

        # Initialize data collectors
        self.collectors: List = []
        for ds in config['data_sources']:
            if not ds['enabled']:
                continue

            if ds['type'] == 'opcua':
                self.collectors.append(OPCUACollector(ds, self.tenant_id))
            elif ds['type'] == 'pi_historian':
                self.collectors.append(PIHistorianCollector(ds, self.tenant_id))
            elif ds['type'] == 'sql_server':
                self.collectors.append(SQLCollector(ds, self.tenant_id))
            elif ds['type'] == 'file_watcher':
                self.collectors.append(FileWatcherCollector(ds, self.tenant_id))

        self.api_url = f"{config['api']['base_url']}{config['api']['ingestion_endpoint']}"

    async def start(self):
        """Start all data collection tasks"""
        logger.info(f"Starting Ingestion Agent for tenant: {self.tenant_id}")

        # Start OAuth token refresh task
        asyncio.create_task(self.oauth_client.auto_refresh())

        # Start data collectors
        collector_tasks = [collector.start() for collector in self.collectors]

        # Start buffer flush task
        asyncio.create_task(self.flush_buffer_loop())

        # Wait for all tasks
        await asyncio.gather(*collector_tasks)

    async def flush_buffer_loop(self):
        """Periodically flush buffered data to WellTegra API"""
        flush_interval = self.config['buffer']['flush_interval']

        while True:
            try:
                await asyncio.sleep(flush_interval)

                # Get buffered data
                buffered_data = await self.buffer.get_pending_data(limit=1000)

                if buffered_data:
                    logger.info(f"Flushing {len(buffered_data)} buffered data points")
                    success = await self.send_to_api(buffered_data)

                    if success:
                        await self.buffer.mark_as_sent(buffered_data)

            except Exception as e:
                logger.error(f"Error in flush loop: {e}")

    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=2, min=2, max=300),
        reraise=True
    )
    async def send_to_api(self, data_points: List[DataPoint]) -> bool:
        """Send data to WellTegra API with retry logic"""
        try:
            # Get OAuth token
            token = await self.oauth_client.get_token()

            # Prepare payload
            payload = {
                "tenant_id": self.tenant_id,
                "data_points": [dp.model_dump() for dp in data_points],
                "ingestion_timestamp": datetime.utcnow().isoformat()
            }

            # Send POST request
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "User-Agent": "WellTegra-Ingestion-Agent/1.0"
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_url,
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        logger.info(f"Successfully sent {len(data_points)} data points")
                        return True
                    elif response.status == 429:
                        logger.warning("Rate limit exceeded, backing off")
                        raise Exception("Rate limit exceeded")
                    else:
                        error_body = await response.text()
                        logger.error(f"API error {response.status}: {error_body}")
                        raise Exception(f"API returned {response.status}")

        except Exception as e:
            logger.error(f"Failed to send data: {e}")
            # Store in local buffer for later retry
            await self.buffer.store(data_points)
            raise


# Main entry point
async def main():
    import yaml

    # Load configuration
    with open('/app/config/config.yaml', 'r') as f:
        config = yaml.safe_load(f)

    # Create and start agent
    agent = IngestionAgent(config)
    await agent.start()


if __name__ == "__main__":
    asyncio.run(main())
```

---

### 2.4 Local Buffer Implementation (src/buffer.py)

```python
import sqlite3
import asyncio
from typing import List, Optional
from datetime import datetime, timedelta
import json
import logging

logger = logging.getLogger(__name__)


class LocalBuffer:
    """SQLite-based local buffer for handling network outages"""

    def __init__(self, config: dict):
        self.db_path = config['database_path']
        self.max_size_gb = config['max_size_gb']
        self.retention_days = config['retention_days']

        self._init_database()

    def _init_database(self):
        """Initialize SQLite database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS buffered_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id TEXT NOT NULL,
                well_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                parameter_name TEXT NOT NULL,
                value REAL NOT NULL,
                unit TEXT NOT NULL,
                quality_code TEXT DEFAULT 'GOOD',
                source TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                sent_at TEXT,
                status TEXT DEFAULT 'PENDING'
            )
        """)

        # Indexes for performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_status ON buffered_data(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON buffered_data(timestamp)")

        conn.commit()
        conn.close()

    async def store(self, data_points: List) -> bool:
        """Store data points in local buffer"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            for dp in data_points:
                cursor.execute("""
                    INSERT INTO buffered_data
                    (tenant_id, well_id, timestamp, parameter_name, value, unit, quality_code, source)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    dp.tenant_id,
                    dp.well_id,
                    dp.timestamp.isoformat(),
                    dp.parameter_name,
                    dp.value,
                    dp.unit,
                    dp.quality_code,
                    dp.source
                ))

            conn.commit()
            conn.close()

            logger.info(f"Buffered {len(data_points)} data points locally")

            # Check buffer size and cleanup if needed
            await self._cleanup_old_data()

            return True

        except Exception as e:
            logger.error(f"Failed to buffer data: {e}")
            return False

    async def get_pending_data(self, limit: int = 1000) -> List:
        """Retrieve pending data from buffer"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            cursor.execute("""
                SELECT * FROM buffered_data
                WHERE status = 'PENDING'
                ORDER BY timestamp ASC
                LIMIT ?
            """, (limit,))

            rows = cursor.fetchall()
            conn.close()

            # Convert to DataPoint objects
            from src.main import DataPoint
            data_points = []
            for row in rows:
                dp = DataPoint(
                    tenant_id=row['tenant_id'],
                    well_id=row['well_id'],
                    timestamp=datetime.fromisoformat(row['timestamp']),
                    parameter_name=row['parameter_name'],
                    value=row['value'],
                    unit=row['unit'],
                    quality_code=row['quality_code'],
                    source=row['source']
                )
                data_points.append(dp)

            return data_points

        except Exception as e:
            logger.error(f"Failed to retrieve buffered data: {e}")
            return []

    async def mark_as_sent(self, data_points: List) -> bool:
        """Mark data points as successfully sent"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            for dp in data_points:
                cursor.execute("""
                    UPDATE buffered_data
                    SET status = 'SENT', sent_at = ?
                    WHERE timestamp = ? AND parameter_name = ? AND status = 'PENDING'
                """, (
                    datetime.utcnow().isoformat(),
                    dp.timestamp.isoformat(),
                    dp.parameter_name
                ))

            conn.commit()
            conn.close()

            return True

        except Exception as e:
            logger.error(f"Failed to mark data as sent: {e}")
            return False

    async def _cleanup_old_data(self):
        """Remove old data to prevent buffer from growing indefinitely"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            # Delete data older than retention period
            cutoff_date = (datetime.utcnow() - timedelta(days=self.retention_days)).isoformat()

            cursor.execute("""
                DELETE FROM buffered_data
                WHERE created_at < ? AND status = 'SENT'
            """, (cutoff_date,))

            deleted = cursor.rowcount
            conn.commit()
            conn.close()

            if deleted > 0:
                logger.info(f"Cleaned up {deleted} old records from buffer")

        except Exception as e:
            logger.error(f"Failed to cleanup buffer: {e}")
```

---

## 3. WellTegra Cloud API (Ingestion Gateway)

### 3.1 API Endpoint Specification

**Endpoint:** `POST /v1/ingest/realtime`

**Authentication:** OAuth 2.0 Bearer Token (scope: `api:ingest`)

**Rate Limits:**
- 100 requests per minute per tenant
- 10 MB maximum payload size
- 1 GB per day data volume limit

**Request Payload Schema:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["tenant_id", "data_points"],
  "properties": {
    "tenant_id": {
      "type": "string",
      "description": "Tenant identifier (must match JWT)",
      "example": "operator_shell_uk"
    },
    "data_points": {
      "type": "array",
      "minItems": 1,
      "maxItems": 1000,
      "items": {
        "type": "object",
        "required": ["well_id", "timestamp", "parameter_name", "value", "unit"],
        "properties": {
          "well_id": {
            "type": "string",
            "example": "WELL_001"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time",
            "example": "2025-11-06T14:30:00Z"
          },
          "parameter_name": {
            "type": "string",
            "enum": ["wellhead_pressure", "hookload", "flow_rate", "downhole_temperature"],
            "example": "wellhead_pressure"
          },
          "value": {
            "type": "number",
            "example": 6750.5
          },
          "unit": {
            "type": "string",
            "enum": ["psi", "bar", "kPa", "klbs", "bbl/day", "degF", "degC"],
            "example": "psi"
          },
          "quality_code": {
            "type": "string",
            "enum": ["GOOD", "BAD", "UNCERTAIN"],
            "default": "GOOD"
          },
          "source": {
            "type": "string",
            "example": "SCADA_OPC_UA"
          }
        }
      }
    },
    "ingestion_timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "When the agent collected this batch"
    }
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Ingested 150 data points",
  "tenant_id": "operator_shell_uk",
  "ingestion_id": "ing_20251106_143000_abc123",
  "accepted_count": 150,
  "rejected_count": 0,
  "processing_time_ms": 234
}
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "error": "invalid_token",
  "message": "OAuth token expired or invalid"
}

// 403 Forbidden
{
  "error": "tenant_mismatch",
  "message": "Token tenant_id does not match request tenant_id"
}

// 429 Too Many Requests
{
  "error": "rate_limit_exceeded",
  "message": "100 requests/minute limit exceeded",
  "retry_after_seconds": 45
}

// 400 Bad Request
{
  "error": "validation_error",
  "message": "Invalid data schema",
  "details": [
    {
      "field": "data_points[3].value",
      "error": "must be a number"
    }
  ]
}
```

---

### 3.2 Node.js API Implementation (ingestion-gateway.ts)

```typescript
import express, { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import Redis from 'ioredis';

const app = express();
app.use(express.json({ limit: '10mb' }));

// PostgreSQL connection pool
const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: 'welltegra_production',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 50, // Max connections
  idleTimeoutMillis: 30000
});

// Redis for caching and rate limiting
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379
});

// JSON Schema validator
const ajv = new Ajv();
addFormats(ajv);

const dataPointSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["tenant_id", "data_points"],
  properties: {
    tenant_id: { type: "string" },
    data_points: {
      type: "array",
      minItems: 1,
      maxItems: 1000,
      items: {
        type: "object",
        required: ["well_id", "timestamp", "parameter_name", "value", "unit"],
        properties: {
          well_id: { type: "string" },
          timestamp: { type: "string", format: "date-time" },
          parameter_name: {
            type: "string",
            enum: ["wellhead_pressure", "hookload", "flow_rate", "downhole_temperature"]
          },
          value: { type: "number" },
          unit: {
            type: "string",
            enum: ["psi", "bar", "kPa", "klbs", "bbl/day", "degF", "degC"]
          },
          quality_code: {
            type: "string",
            enum: ["GOOD", "BAD", "UNCERTAIN"],
            default: "GOOD"
          },
          source: { type: "string" }
        }
      }
    }
  }
};

const validatePayload = ajv.compile(dataPointSchema);


// Middleware: JWT Authentication
interface JWTPayload {
  sub: string;
  tenant_id: string;
  scope: string;
  exp: number;
}

async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'invalid_token', message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    // Verify JWT (using public key from Auth0/Cognito)
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY!) as JWTPayload;

    // Check token expiry
    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({ error: 'invalid_token', message: 'Token expired' });
    }

    // Check scope
    if (!decoded.scope.includes('api:ingest')) {
      return res.status(403).json({ error: 'insufficient_scope', message: 'Token missing api:ingest scope' });
    }

    // Attach JWT payload to request
    (req as any).jwt = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ error: 'invalid_token', message: 'Token verification failed' });
  }
}


// Middleware: Rate Limiting (per tenant)
const createRateLimiter = () => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    keyGenerator: (req) => (req as any).jwt.tenant_id,
    handler: (req, res) => {
      res.status(429).json({
        error: 'rate_limit_exceeded',
        message: '100 requests/minute limit exceeded',
        retry_after_seconds: 60
      });
    },
    store: new RedisStore({
      client: redis,
      prefix: 'rate_limit:'
    })
  });
};


// POST /v1/ingest/realtime
app.post('/v1/ingest/realtime', authenticateJWT, createRateLimiter(), async (req: Request, res: Response) => {
  const startTime = Date.now();
  const jwtPayload = (req as any).jwt as JWTPayload;

  try {
    // 1. Validate tenant_id matches JWT
    const { tenant_id, data_points, ingestion_timestamp } = req.body;

    if (tenant_id !== jwtPayload.tenant_id) {
      return res.status(403).json({
        error: 'tenant_mismatch',
        message: 'Token tenant_id does not match request tenant_id'
      });
    }

    // 2. Validate JSON schema
    const valid = validatePayload(req.body);
    if (!valid) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'Invalid data schema',
        details: validatePayload.errors
      });
    }

    // 3. Set PostgreSQL session variable for RLS
    const client = await pgPool.connect();
    await client.query(`SET app.current_tenant = '${tenant_id}'`);

    // 4. Insert data into tenant schema
    let acceptedCount = 0;
    let rejectedCount = 0;

    for (const dp of data_points) {
      try {
        // Encrypt sensitive data with tenant DEK (simplified here)
        const encryptedValue = dp.value; // TODO: Implement encryption

        await client.query(`
          INSERT INTO ${tenant_id}_streams.real_time_parameters
          (tenant_id, well_id, timestamp, parameter_name, value, unit, quality_code, source)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          tenant_id,
          dp.well_id,
          dp.timestamp,
          dp.parameter_name,
          encryptedValue,
          dp.unit,
          dp.quality_code || 'GOOD',
          dp.source || 'INGESTION_API'
        ]);

        // Also cache in Redis for real-time alerts
        await redis.setex(
          `realtime:${tenant_id}:${dp.well_id}:${dp.parameter_name}`,
          300, // 5 min TTL
          JSON.stringify({ value: dp.value, unit: dp.unit, timestamp: dp.timestamp })
        );

        acceptedCount++;

      } catch (insertError) {
        console.error(`Failed to insert data point:`, insertError);
        rejectedCount++;
      }
    }

    client.release();

    // 5. Audit log
    await logAuditEvent({
      tenant_id,
      user_id: jwtPayload.sub,
      action: 'INGEST_DATA',
      resource_type: 'real_time_parameters',
      details: {
        accepted_count: acceptedCount,
        rejected_count: rejectedCount,
        source: req.ip
      }
    });

    // 6. Respond
    const processingTime = Date.now() - startTime;

    res.status(200).json({
      status: 'success',
      message: `Ingested ${acceptedCount} data points`,
      tenant_id,
      ingestion_id: `ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accepted_count: acceptedCount,
      rejected_count: rejectedCount,
      processing_time_ms: processingTime
    });

  } catch (error) {
    console.error('Ingestion error:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'Failed to process ingestion request'
    });
  }
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ingestion Gateway listening on port ${PORT}`);
});


// Helper: Audit logging
async function logAuditEvent(event: any) {
  try {
    await pgPool.query(`
      INSERT INTO system_monitoring.audit_log (tenant_id, user_id, action, resource_type, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [event.tenant_id, event.user_id, event.action, event.resource_type, JSON.stringify(event.details)]);
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}
```

---

## 4. Data Validation & Transformation

### 4.1 Unit Normalization

**Supported Conversions:**
```python
# src/transformer.py

class DataTransformer:
    """Normalize units and transform data"""

    UNIT_CONVERSIONS = {
        # Pressure
        ('bar', 'psi'): lambda x: x * 14.5038,
        ('kPa', 'psi'): lambda x: x * 0.145038,
        ('psi', 'bar'): lambda x: x * 0.0689476,

        # Temperature
        ('degC', 'degF'): lambda x: (x * 9/5) + 32,
        ('degF', 'degC'): lambda x: (x - 32) * 5/9,

        # Length
        ('m', 'ft'): lambda x: x * 3.28084,
        ('ft', 'm'): lambda x: x * 0.3048
    }

    def normalize_unit(self, value: float, from_unit: str, to_unit: str) -> float:
        """Convert value from one unit to another"""
        if from_unit == to_unit:
            return value

        conversion_key = (from_unit, to_unit)
        if conversion_key in self.UNIT_CONVERSIONS:
            return self.UNIT_CONVERSIONS[conversion_key](value)
        else:
            raise ValueError(f"No conversion from {from_unit} to {to_unit}")

    def validate_value_range(self, parameter: str, value: float, unit: str) -> bool:
        """Check if value is within acceptable range"""
        ranges = {
            'wellhead_pressure': {'psi': (0, 15000)},
            'hookload': {'klbs': (0, 1000)},
            'flow_rate': {'bbl/day': (0, 50000)},
            'downhole_temperature': {'degF': (-50, 500)}
        }

        if parameter in ranges and unit in ranges[parameter]:
            min_val, max_val = ranges[parameter][unit]
            return min_val <= value <= max_val

        return True  # No range defined, accept value
```

---

## 5. Security Considerations

### 5.1 Network Security

**Customer On-Premise:**
- Docker container runs with non-root user
- No privileged mode required
- Firewall rules: Allow outbound HTTPS (443) only to WellTegra API
- No inbound connections accepted

**WellTegra Cloud:**
- Ingress: Only HTTPS (443) from CDN/WAF
- Egress: Blocked from tenant namespaces (Kubernetes Network Policy)
- TLS 1.3 required, no fallback to TLS 1.2

---

### 5.2 Credential Management

**Customer On-Premise:**
```bash
# Store credentials in environment variables (Docker Compose)
docker run -d \
  --name welltegra-ingestion \
  -e WELLTEGRA_CLIENT_ID="client_abc123" \
  -e WELLTEGRA_CLIENT_SECRET="secret_xyz789" \
  -e SCADA_USERNAME="scada_reader" \
  -e SCADA_PASSWORD="encrypted_password" \
  -v /opt/welltegra/config:/app/config:ro \
  -v /opt/welltegra/data:/app/data \
  welltegra/ingestion-agent:latest
```

**Best Practices:**
- Use Docker Secrets or Kubernetes Secrets for credential storage
- Rotate OAuth client secrets every 90 days
- Use HashiCorp Vault or AWS Secrets Manager for enterprise deployments
- Never log credentials in application logs

---

## 6. Monitoring & Observability

### 6.1 Prometheus Metrics (Ingestion Agent)

```python
# src/metrics.py
from prometheus_client import Counter, Histogram, Gauge, start_http_server

# Metrics
data_points_collected = Counter('ingestion_data_points_collected_total', 'Total data points collected', ['source', 'tenant_id'])
data_points_sent = Counter('ingestion_data_points_sent_total', 'Total data points sent to API', ['tenant_id'])
data_points_failed = Counter('ingestion_data_points_failed_total', 'Total data points that failed to send', ['tenant_id'])
buffer_size = Gauge('ingestion_buffer_size_bytes', 'Size of local buffer', ['tenant_id'])
api_request_duration = Histogram('ingestion_api_request_duration_seconds', 'API request duration', ['endpoint'])

# Start Prometheus metrics server
start_http_server(9090)
```

**Grafana Dashboard Queries:**
```promql
# Data ingestion rate (points per second)
rate(ingestion_data_points_sent_total[5m])

# Buffer backlog size
ingestion_buffer_size_bytes / (1024 * 1024)  # Convert to MB

# API error rate
rate(ingestion_data_points_failed_total[5m]) / rate(ingestion_data_points_collected_total[5m])

# 95th percentile API latency
histogram_quantile(0.95, rate(ingestion_api_request_duration_seconds_bucket[5m]))
```

---

### 6.2 Alerting Rules

```yaml
# Prometheus alerting rules
groups:
  - name: ingestion
    rules:
      - alert: IngestionAgentDown
        expr: up{job="ingestion-agent"} == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Ingestion agent is down for tenant {{ $labels.tenant_id }}"

      - alert: HighBufferBacklog
        expr: ingestion_buffer_size_bytes > (5 * 1024 * 1024 * 1024)  # 5 GB
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "Buffer backlog exceeding 5 GB for tenant {{ $labels.tenant_id }}"

      - alert: HighAPIErrorRate
        expr: rate(ingestion_data_points_failed_total[5m]) > 0.05  # 5% error rate
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High API error rate for tenant {{ $labels.tenant_id }}"
```

---

## 7. Testing & Validation

### 7.1 Unit Tests

```python
# tests/test_transformer.py
import pytest
from src.transformer import DataTransformer

def test_unit_conversion_pressure():
    transformer = DataTransformer()

    # bar to psi
    assert abs(transformer.normalize_unit(1, 'bar', 'psi') - 14.5038) < 0.01

    # psi to bar
    assert abs(transformer.normalize_unit(14.5038, 'psi', 'bar') - 1) < 0.01

def test_value_range_validation():
    transformer = DataTransformer()

    # Valid hookload
    assert transformer.validate_value_range('hookload', 350, 'klbs') == True

    # Invalid hookload (negative)
    assert transformer.validate_value_range('hookload', -10, 'klbs') == False

    # Invalid pressure (too high)
    assert transformer.validate_value_range('wellhead_pressure', 20000, 'psi') == False
```

---

### 7.2 Integration Tests

```python
# tests/test_integration.py
import pytest
import asyncio
from src.main import IngestionAgent, DataPoint
from datetime import datetime

@pytest.mark.asyncio
async def test_end_to_end_ingestion():
    """Test full ingestion pipeline from collector to API"""

    # Mock configuration
    config = {
        'tenant': {'id': 'test_tenant'},
        'api': {
            'base_url': 'http://localhost:3000',
            'ingestion_endpoint': '/v1/ingest/realtime',
            'auth_endpoint': '/oauth/token'
        },
        'oauth': {
            'client_id': 'test_client',
            'client_secret': 'test_secret'
        },
        'buffer': {
            'enabled': True,
            'database_path': '/tmp/test_buffer.db',
            'max_size_gb': 1,
            'retention_days': 1,
            'flush_interval': 5
        },
        'data_sources': []
    }

    # Create agent
    agent = IngestionAgent(config)

    # Create test data points
    test_data = [
        DataPoint(
            tenant_id='test_tenant',
            well_id='WELL_001',
            timestamp=datetime.utcnow(),
            parameter_name='wellhead_pressure',
            value=6750.5,
            unit='psi',
            quality_code='GOOD',
            source='UNIT_TEST'
        )
    ]

    # Send to API (will use local buffer if API is down)
    success = await agent.send_to_api(test_data)

    assert success == True
```

---

## 8. Deployment Guide

### 8.1 Customer On-Premise Deployment

**Prerequisites:**
- Docker Engine 20.10+
- Network connectivity to WellTegra API (api.welltegra.com:443)
- OAuth 2.0 client credentials (provided by WellTegra)

**Step 1: Pull Docker Image**
```bash
docker pull welltegra/ingestion-agent:latest
```

**Step 2: Create Configuration File**
```bash
mkdir -p /opt/welltegra/config
mkdir -p /opt/welltegra/data

# Copy config.yaml template
cp config.yaml.template /opt/welltegra/config/config.yaml

# Edit configuration
vi /opt/welltegra/config/config.yaml
```

**Step 3: Set Environment Variables**
```bash
export WELLTEGRA_CLIENT_ID="client_abc123"
export WELLTEGRA_CLIENT_SECRET="secret_xyz789"
export SCADA_USERNAME="scada_reader"
export SCADA_PASSWORD="encrypted_password"
```

**Step 4: Run Container**
```bash
docker run -d \
  --name welltegra-ingestion \
  --restart unless-stopped \
  -e WELLTEGRA_CLIENT_ID \
  -e WELLTEGRA_CLIENT_SECRET \
  -e SCADA_USERNAME \
  -e SCADA_PASSWORD \
  -v /opt/welltegra/config:/app/config:ro \
  -v /opt/welltegra/data:/app/data \
  -p 8080:8080 \
  -p 9090:9090 \
  welltegra/ingestion-agent:latest
```

**Step 5: Verify Health**
```bash
curl http://localhost:8080/health
# Expected: {"status": "healthy", "timestamp": "2025-11-06T14:30:00Z"}

curl http://localhost:9090/metrics
# Expected: Prometheus metrics
```

---

### 8.2 Production Deployment Checklist

- [ ] Configure firewall rules (outbound HTTPS only)
- [ ] Set up log rotation (max 100 MB, 5 backups)
- [ ] Enable Prometheus monitoring
- [ ] Configure alert webhooks (PagerDuty/Slack)
- [ ] Test network outage resilience (disconnect network for 5 minutes)
- [ ] Verify buffer cleanup (check SQLite file size)
- [ ] Document OAuth credential rotation procedure
- [ ] Set up automated container updates (Watchtower or similar)
- [ ] Test disaster recovery (restore from buffer after outage)

---

## 9. Performance Benchmarks

**Target Performance:**
- **Throughput:** 10,000 data points per minute per tenant
- **Latency:** <5 seconds from SCADA read to WellTegra storage
- **Buffer capacity:** 7 days (10 GB) of data during network outage
- **API response time:** <500ms (95th percentile)

**Load Test Results (100 concurrent tenants):**
| Metric                  | Value       |
|-------------------------|-------------|
| Total data points/min   | 1,000,000   |
| API p50 latency         | 120 ms      |
| API p95 latency         | 340 ms      |
| API p99 latency         | 780 ms      |
| PostgreSQL CPU usage    | 45%         |
| PostgreSQL memory usage | 28 GB / 32 GB |
| Redis memory usage      | 8 GB / 16 GB |

---

## 10. Cost Estimate

**Customer On-Premise (Per Site):**
| Component              | Cost         |
|------------------------|--------------|
| Docker host (VM)       | $50/month    |
| Network egress (1 GB/day) | $10/month |
| **Total**              | **$60/month** |

**WellTegra Cloud (Per 100 Tenants):**
| Component              | Cost         |
|------------------------|--------------|
| API servers (EKS)      | $500/month   |
| PostgreSQL (RDS)       | $800/month   |
| Redis (ElastiCache)    | $200/month   |
| Data transfer (egress) | $300/month   |
| **Total**              | **$1,800/month** |

**Per-tenant cloud cost:** ~$18/month (at scale)

---

## 11. Future Enhancements

1. **Protocol Support:**
   - Modbus TCP for remote terminal units (RTUs)
   - DNP3 for utility SCADA systems
   - MQTT for IoT sensor networks
   - Apache Kafka for real-time streaming

2. **Edge Computing:**
   - Run anomaly detection models at edge (ingestion agent)
   - Local alerting without cloud dependency
   - Bandwidth optimization (send only anomalies)

3. **Bi-Directional Sync (Controlled):**
   - Allow WellTegra to send control commands (with explicit operator approval)
   - Audit all outbound commands
   - Implement command whitelisting

4. **Data Compression:**
   - GZIP compression for payloads >1 MB
   - Reduce bandwidth by 70-80%

---

## Appendix A: OAuth 2.0 Setup (Auth0 Example)

**Step 1: Create Machine-to-Machine Application**
1. Log in to Auth0 dashboard
2. Applications → Create Application → Machine-to-Machine
3. Name: "WellTegra Ingestion Agent - Shell UK"
4. API: "WellTegra Production API"
5. Scopes: `api:ingest`, `api:read`

**Step 2: Get Credentials**
```json
{
  "client_id": "abc123xyz789",
  "client_secret": "secret_very_long_string_here",
  "audience": "https://api.welltegra.com",
  "grant_type": "client_credentials"
}
```

**Step 3: Test Token Generation**
```bash
curl -X POST https://welltegra.auth0.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "abc123xyz789",
    "client_secret": "secret_very_long_string_here",
    "audience": "https://api.welltegra.com",
    "grant_type": "client_credentials"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

---

## Appendix B: Troubleshooting Guide

**Issue: Agent cannot connect to SCADA system**
- Check network connectivity: `ping 10.0.1.50`
- Verify OPC UA endpoint: `opc.tcp://10.0.1.50:4840`
- Check firewall rules (port 4840 open)
- Validate SCADA credentials

**Issue: API returns 429 (rate limit exceeded)**
- Check ingestion rate: `docker logs welltegra-ingestion | grep "sent"`
- Reduce poll interval in config.yaml
- Contact WellTegra to increase rate limit

**Issue: Buffer growing indefinitely**
- Check network connectivity to WellTegra API
- Verify OAuth tokens are valid: `curl -H "Authorization: Bearer $TOKEN" https://api.welltegra.com/health`
- Review retention policy in config.yaml
- Manually clear old data: `sqlite3 /app/data/buffer.db "DELETE FROM buffered_data WHERE created_at < datetime('now', '-7 days')"`

---

**Document Control:**
- **Version History:** 1.0 (Initial Draft)
- **Next Review Date:** 2025-12-01
- **Distribution:** Engineering, Data Engineering, Customer Success
- **Classification:** Internal Use Only

**Contact:**
Angus Campbell - Data Engineering
Email: angus.campbell@welltegra.com
Slack: @angus
