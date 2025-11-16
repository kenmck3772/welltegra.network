# WellTegra Edge Core - Sprint 12 Documentation

## Edge Core & Sync: Offline-First Architecture

**Sprint Goal:** De-risk the connectivity and offline-first problem by building and validating a "slice" of the architecture that proves it can work disconnected.

### Overview

The Edge Core is a containerized, lightweight version of WellTegra designed for deployment on local rig servers. It provides:

- **Offline-capable operation** - Full functionality without cloud connectivity
- **Local data persistence** - PostgreSQL with FIPS 140-2 encryption
- **Store-and-Forward sync** - Apache Kafka message queue
- **TLS 1.3 encrypted sync** - Secure data transmission to cloud
- **JWT authentication** - Secure local and cloud API access
- **Connection detection** - Automatic sync when connectivity restored

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FIELD TABLET                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         Toolstring Configurator (PWA)                  │  │
│  │  - Service Worker (offline asset caching)             │  │
│  │  - IndexedDB (local data storage)                     │  │
│  │  - Background Sync API                                │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP/WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      EDGE CORE SERVER                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │             Nginx (Static Assets)                      │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │        Node.js API (Data Capture Endpoint)            │  │
│  │  - JWT Authentication                                 │  │
│  │  - Rate Limiting                                      │  │
│  │  - CRUD Operations                                    │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           PostgreSQL (Local Persistence)              │  │
│  │  - FIPS 140-2 encryption at rest                      │  │
│  │  - Sync queue table                                   │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Apache Kafka (Message Queue)             │  │
│  │  - Store-and-Forward queue                            │  │
│  │  - Event streaming                                    │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │             Sync Service (Background)                 │  │
│  │  - Connection detection                               │  │
│  │  - Batch sync to cloud                                │  │
│  │  - Exponential backoff retry                          │  │
│  │  - TLS 1.3 encryption                                 │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS/TLS 1.3
                           │ (when connected)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      CLOUD PLATFORM                          │
│  - Central Database                                          │
│  - Power BI / Analytics                                      │
│  - Edge Core Management                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start - Docker Compose

### Prerequisites

- Docker 24.0+
- Docker Compose 2.0+
- 8GB RAM minimum
- 20GB disk space

### 1. Environment Setup

Create `.env` file in `edge-core/` directory:

```bash
# Database
DB_PASSWORD=secure_password_here

# Authentication
JWT_SECRET=your_jwt_secret_here

# Edge Core Identity
EDGE_CORE_ID=rig-001

# Cloud Sync
CLOUD_SYNC_ENDPOINT=https://cloud.welltegra.com/api/edge-sync
CLOUD_SYNC_ENABLED=false
SYNC_INTERVAL_SECONDS=300

# Security
FIPS_MODE=true

# TLS Certificates (optional)
CERT_DIR=./certs
TLS_CERT_PATH=/certs/edge-core.crt
TLS_KEY_PATH=/certs/edge-core.key
```

### 2. Build and Start

```bash
cd edge-core/

# Build containers
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Access Application

- **Application UI:** http://localhost:8080
- **Toolstring Configurator:** http://localhost:8080/toolstring-configurator.html
- **API Endpoint:** http://localhost:3001/api/v1
- **Health Check:** http://localhost:8080/health

### 4. Default Login

- **Username:** finlay
- **Password:** welltegra123
- **Role:** Field-Engineer

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes 1.24+
- kubectl configured
- 16GB RAM minimum (cluster)
- 100GB disk space
- Local storage class configured

### 1. Create Namespace and Secrets

```bash
# Create namespace
kubectl create namespace welltegra-edge

# Create secrets (CHANGE VALUES IN PRODUCTION)
kubectl create secret generic edge-core-secrets \
  --from-literal=DB_PASSWORD='secure_password' \
  --from-literal=JWT_SECRET='jwt_secret' \
  --from-literal=CLOUD_SYNC_ENDPOINT='https://cloud.welltegra.com/api/edge-sync' \
  --from-literal=EDGE_CORE_ID='rig-001' \
  -n welltegra-edge

# Create PostgreSQL init script ConfigMap
kubectl create configmap postgres-init-script \
  --from-file=init-db.sql=../init-db.sql \
  -n welltegra-edge
```

### 2. Deploy Stack

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/deployment.yaml

# Watch deployment
kubectl get pods -n welltegra-edge -w

# Check services
kubectl get svc -n welltegra-edge
```

### 3. Access Application

```bash
# Get LoadBalancer IP
kubectl get svc edge-core -n welltegra-edge

# Port forward for testing
kubectl port-forward svc/edge-core 8080:80 -n welltegra-edge
```

### 4. Monitoring

```bash
# View Edge Core logs
kubectl logs -f deployment/edge-core -n welltegra-edge

# View Sync Service logs
kubectl logs -f deployment/sync-service -n welltegra-edge

# View PostgreSQL logs
kubectl logs -f statefulset/postgres -n welltegra-edge

# Check sync status
kubectl exec -it deployment/edge-core -n welltegra-edge -- \
  curl http://localhost:3001/api/v1/sync/status
```

---

## Testing - Definition of Done

### Story 6-10: Offline Validation Test

The sprint is "done" when Finlay can:

1. **Load the app instantly** - No network latency
2. **Create 3 toolstring configs** - Save locally
3. **Disconnect the network** - App continues working
4. **Reconnect the network** - Data syncs to cloud within 5 minutes
5. **Verify in cloud** - Data appears in Power BI/Analytics

### Test Script

```bash
# Run automated test
cd edge-core/
./test-offline-workflow.sh
```

---

## API Endpoints

### Authentication

#### POST `/api/auth/login`

Login and receive JWT token.

**Request:**
```json
{
  "username": "finlay",
  "password": "welltegra123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "finlay",
    "role": "Field-Engineer",
    "fullName": "Finlay MacLeod"
  }
}
```

### Toolstring Configurations

All endpoints require `Authorization: Bearer <token>` header.

#### GET `/api/v1/toolstrings`

Get all toolstring configurations.

**Query Parameters:**
- `wellId` (optional) - Filter by well ID

**Response:**
```json
{
  "success": true,
  "count": 3,
  "toolstrings": [...]
}
```

#### GET `/api/v1/toolstrings/:id`

Get single toolstring configuration.

#### POST `/api/v1/toolstrings`

Create new toolstring configuration.

**Request:**
```json
{
  "name": "W666 Fishing Run 1",
  "wellId": "W666",
  "operationType": "Fishing",
  "tools": [
    {
      "id": "fish_001",
      "name": "2 Prong Grab",
      "category": "fishing"
    }
  ],
  "metadata": {
    "createdBy": "Finlay MacLeod"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Toolstring configuration created (queued for sync)",
  "toolstring": {
    "id": "uuid",
    "name": "W666 Fishing Run 1",
    "synced": false,
    ...
  }
}
```

#### PUT `/api/v1/toolstrings/:id`

Update toolstring configuration.

#### DELETE `/api/v1/toolstrings/:id`

Delete toolstring configuration.

#### GET `/api/v1/sync/status`

Get sync status and pending queue count.

**Response:**
```json
{
  "success": true,
  "status": {
    "last_sync_attempt": "2025-11-06T21:00:00Z",
    "last_successful_sync": "2025-11-06T20:55:00Z",
    "cloud_reachable": true,
    "pending_sync_count": 3,
    "failed_sync_count": 0
  },
  "pendingCount": 3
}
```

---

## Security

### FIPS 140-2 Compliance

PostgreSQL data-at-rest encryption using FIPS 140-2 validated cryptographic modules.

**Enable FIPS mode:**
```bash
export FIPS_MODE=true
```

**Verify FIPS mode:**
```bash
openssl version
# Should show FIPS module enabled
```

### TLS 1.3 Configuration

Sync service uses TLS 1.3 for all cloud communication.

**Generate self-signed certificates (testing only):**
```bash
cd edge-core/certs/

openssl req -x509 -newkey rsa:4096 -keyout edge-core.key \
  -out edge-core.crt -days 365 -nodes \
  -subj "/CN=edge-core-rig-001"
```

**Production:** Use certificates signed by trusted CA.

### JWT Authentication

- **Token expiry:** 24 hours
- **Algorithm:** HS256
- **Secret:** Stored in environment variable

**Rotate JWT secret:**
```bash
# Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# Update environment
kubectl set env deployment/edge-core JWT_SECRET=$NEW_SECRET -n welltegra-edge
kubectl set env deployment/sync-service JWT_SECRET=$NEW_SECRET -n welltegra-edge
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs edge_core

# Common issues:
# - PostgreSQL not ready: Wait 30s and retry
# - Kafka not ready: Wait 60s and retry
# - Port conflict: Change port in docker-compose.yml
```

### Sync not working

```bash
# Check sync service logs
docker-compose logs sync_service

# Check cloud endpoint reachability
docker-compose exec edge_core curl -I https://cloud.welltegra.com/api/edge-sync/health

# Check pending queue
docker-compose exec postgres psql -U edge -d welltegra_edge \
  -c "SELECT COUNT(*) FROM sync_queue WHERE synced = false;"
```

### Database connection errors

```bash
# Check PostgreSQL status
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check connection
docker-compose exec postgres pg_isready -U edge
```

---

## Performance Tuning

### PostgreSQL

Edit `docker-compose.yml`:

```yaml
command: postgres -c max_connections=200 -c shared_buffers=256MB
```

### Kafka

Edit `docker-compose.yml`:

```yaml
environment:
  KAFKA_LOG_RETENTION_HOURS: 72  # Reduce retention
  KAFKA_LOG_SEGMENT_BYTES: 536870912  # Reduce segment size
```

### Nginx

Edit `nginx.conf`:

```nginx
worker_processes auto;
worker_connections 2048;
```

---

## Maintenance

### Backup

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U edge welltegra_edge > backup.sql

# Backup volumes
docker-compose stop
tar -czf edge-core-backup.tar.gz \
  $(docker volume inspect edge-core_postgres_data -f '{{.Mountpoint}}') \
  $(docker volume inspect edge-core_kafka_data -f '{{.Mountpoint}}')
```

### Restore

```bash
# Restore PostgreSQL
docker-compose exec -T postgres psql -U edge welltegra_edge < backup.sql
```

### Update

```bash
# Pull latest images
docker-compose pull

# Restart services
docker-compose up -d

# Clean old images
docker image prune -a
```

---

## Support

For issues or questions:
- **Technical:** engineering@welltegra.com
- **Security:** security@welltegra.com
- **Operations:** ops@welltegra.com

**Version:** 1.0.0
**Sprint:** 12
**Date:** November 2025
