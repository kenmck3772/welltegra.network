# WellTegra Sandboxed Tenant Architecture Brief

**Author:** Catriona Cameron - Security & Cloud Architecture
**Version:** 1.0
**Date:** 2025-11-06
**Status:** Design Specification

---

## Executive Summary

This brief defines the architecture for WellTegra's multi-tenant platform, ensuring complete data isolation, security, and operational independence for each operator tenant. The architecture implements defense-in-depth security controls across network, application, data, and encryption layers.

**Key Requirements:**
- **Complete tenant isolation** - Zero data leakage between operators
- **Per-operator encryption domains** - Separate encryption keys per tenant
- **One-way data ingestion** - Sandboxed tenants receive but cannot transmit
- **Audit compliance** - Full traceability for ISO 27001, SOC 2, GDPR
- **Scalability** - Support 100+ concurrent operators with <100ms latency

---

## 1. Architecture Overview

### 1.1 Tenant Isolation Strategy

**Schema-Based Isolation (PostgreSQL)**
```
Database: welltegra_production
├── Tenant: operator_shell_uk
│   ├── Schema: shell_uk_data
│   ├── Schema: shell_uk_embeddings
│   └── Schema: shell_uk_streams
├── Tenant: operator_bp_northsea
│   ├── Schema: bp_ns_data
│   ├── Schema: bp_ns_embeddings
│   └── Schema: bp_ns_streams
└── Shared:
    ├── Schema: public (platform metadata only)
    └── Schema: system_monitoring
```

**Benefits:**
- PostgreSQL Row-Level Security (RLS) enforces access control
- Logical separation without infrastructure overhead
- Simplified backup/restore per tenant
- Query performance isolation via separate schemas

**Alternative Considered:** Database-per-tenant (rejected due to operational complexity at scale)

---

### 1.2 Network Topology

```
┌─────────────────────────────────────────────────────────────┐
│                   Internet / External Users                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │  CDN +  │  (Cloudflare / AWS CloudFront)
                    │   WAF   │
                    └────┬────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Load Balancer (Application Gateway)             │
│                   SSL/TLS Termination                        │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐      ┌────▼────┐     ┌────▼────┐
   │  API    │      │  API    │     │  API    │
   │  Node 1 │      │  Node 2 │     │  Node 3 │
   │ (K8s)   │      │ (K8s)   │     │ (K8s)   │
   └────┬────┘      └────┬────┘     └────┬────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼──────────┐ ┌──▼────────────┐ ┌─▼───────────────┐
   │  PostgreSQL   │ │  Redis Cache  │ │  Object Storage │
   │  Primary +    │ │  (per-tenant  │ │  (S3/Azure)     │
   │  Read Replica │ │   namespaces) │ │  Encrypted      │
   └───────────────┘ └───────────────┘ └─────────────────┘
```

---

## 2. Security Controls

### 2.1 Authentication & Authorization

**JWT Token Structure:**
```json
{
  "sub": "user_id_12345",
  "tenant_id": "operator_shell_uk",
  "email": "engineer@shell.com",
  "roles": ["engineer", "data_viewer"],
  "permissions": [
    "well:read",
    "well:update",
    "ai_advisor:query"
  ],
  "encryption_domain": "shell_uk_v1",
  "iat": 1699200000,
  "exp": 1699203600
}
```

**OAuth 2.0 Scopes:**
- `tenant:read` - View tenant data
- `tenant:write` - Modify tenant data
- `ai:query` - Use AI Co-Pilot
- `admin:manage` - Tenant administration
- `api:ingest` - One-way data ingestion only

**Implementation:**
- Auth0 / AWS Cognito / Azure AD B2C
- Multi-factor authentication (MFA) required for production tenants
- API keys for machine-to-machine (M2M) ingestion connectors

---

### 2.2 Per-Operator Encryption Domains

**Encryption at Rest:**
```typescript
interface EncryptionDomain {
  tenantId: string;              // "operator_shell_uk"
  domainVersion: string;         // "v1" (for key rotation)
  masterKeyId: string;           // AWS KMS / Azure Key Vault key ID
  dataEncryptionKeys: {
    wellData: string;            // DEK for well completion data
    aiEmbeddings: string;        // DEK for AI vector embeddings
    liveStreams: string;         // DEK for real-time operational data
    documents: string;           // DEK for uploaded PDFs/images
  };
  rotationPolicy: {
    frequency: "90_DAYS";
    lastRotated: "2025-11-01T00:00:00Z";
    nextRotation: "2026-01-30T00:00:00Z";
  };
}
```

**Key Management:**
- **Master Keys:** AWS KMS (FIPS 140-2 Level 3) or Azure Key Vault
- **Data Encryption Keys (DEKs):** AES-256-GCM per tenant
- **Key Hierarchy:** Envelope encryption (master key encrypts DEKs)
- **Automatic Rotation:** 90-day cycle with zero-downtime re-encryption

**Encryption in Transit:**
- TLS 1.3 required for all API connections
- Certificate pinning for mobile applications
- VPN/PrivateLink for customer on-premise connectors

---

### 2.3 Row-Level Security (RLS) Policies

**PostgreSQL RLS Implementation:**
```sql
-- Enable RLS on all tenant tables
ALTER TABLE well_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_operations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their tenant's data
CREATE POLICY tenant_isolation ON well_data
  USING (tenant_id = current_setting('app.current_tenant')::text);

-- Policy: API service accounts require explicit tenant scope
CREATE POLICY api_tenant_access ON well_data
  USING (
    tenant_id = current_setting('app.current_tenant')::text
    AND auth.jwt() ->> 'tenant_id' = tenant_id
  );

-- Policy: Ingestion connectors can only write to their tenant
CREATE POLICY ingest_write_only ON well_data
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.jwt() ->> 'tenant_id'
    AND auth.jwt() ->> 'scope' LIKE '%api:ingest%'
  );
```

**Application Layer Enforcement:**
```typescript
// Middleware sets tenant context from JWT
app.use((req, res, next) => {
  const tenantId = req.jwt.tenant_id;

  // Set PostgreSQL session variable
  req.db.query(`SET app.current_tenant = '${tenantId}'`);

  // Validate tenant_id matches requested resource
  if (req.params.tenantId && req.params.tenantId !== tenantId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }

  next();
});
```

---

## 3. Sandboxed Tenant Model

### 3.1 One-Way Data Ingestion Architecture

**Design Principle:** Sandboxed tenants can **receive** data from customer systems but **cannot initiate outbound connections** to prevent data exfiltration.

```
Customer On-Premise System           WellTegra Cloud (Sandboxed Tenant)
┌─────────────────────────┐          ┌──────────────────────────────┐
│  SCADA / Historian      │          │                              │
│  (Wonderware, OSIsoft)  │          │  ┌────────────────────────┐  │
│                         │          │  │  Ingestion Gateway     │  │
│  ┌──────────────────┐   │  HTTPS   │  │  (API Endpoint)        │  │
│  │ WellTegra        │   ├──────────┼─►│  - Authenticates       │  │
│  │ Ingestion Agent  │   │  POST    │  │  - Validates schema    │  │
│  │ (Docker)         │   │  /ingest │  │  - Rate limits         │  │
│  └──────────────────┘   │          │  │  - Encrypts & stores   │  │
│         │               │          │  └────────┬───────────────┘  │
│         │ Reads data    │          │           │                  │
│         ▼               │          │           ▼                  │
│  ┌──────────────────┐   │          │  ┌────────────────────────┐  │
│  │  Local Database  │   │          │  │  Tenant Schema         │  │
│  │  (Read-only)     │   │          │  │  operator_shell_uk_*   │  │
│  └──────────────────┘   │          │  └────────────────────────┘  │
└─────────────────────────┘          └──────────────────────────────┘

                                      NO OUTBOUND CONNECTIONS ALLOWED
                                      ✗ Cannot call customer APIs
                                      ✗ Cannot initiate SSH/RDP
                                      ✗ Cannot send emails directly
```

**Security Controls:**
1. **Network Egress Blocking:**
   - Kubernetes Network Policies: Deny all outbound from tenant pods
   - AWS Security Groups: Only allow inbound HTTPS (443) to ingestion gateway
   - Firewall rules: Block tenant subnets from initiating external connections

2. **API Authentication:**
   - Ingestion API requires OAuth 2.0 client credentials (M2M)
   - Scoped token: `api:ingest` (write-only, no read access)
   - Short-lived tokens (15-minute expiry) with automatic refresh

3. **Data Validation:**
   - JSON schema validation against WellTegra data models
   - Size limits: Max 10 MB per request, 1 GB/day per tenant
   - Rate limiting: 100 requests/minute per tenant

---

### 3.2 Operational Monitoring (Read-Only Outbound Exception)

**Requirement:** Sandboxed tenants need to send **monitoring telemetry and alerts** to WellTegra operations team.

**Permitted Outbound Connections:**
```
Sandboxed Tenant → WellTegra Monitoring (Allowed)
├── Prometheus metrics → monitoring.welltegra.internal:9090
├── Application logs → Loki/CloudWatch (internal VPC only)
├── Alert webhooks → PagerDuty (pre-approved domain whitelist)
└── Health checks → Status page (statuspage.io - whitelisted)
```

**Implementation:**
```yaml
# Kubernetes NetworkPolicy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: tenant-egress-lockdown
  namespace: tenant-shell-uk
spec:
  podSelector:
    matchLabels:
      app: welltegra-api
  policyTypes:
    - Egress
  egress:
    # Allow DNS resolution
    - to:
        - namespaceSelector:
            matchLabels:
              name: kube-system
      ports:
        - protocol: UDP
          port: 53
    # Allow monitoring endpoints only
    - to:
        - podSelector:
            matchLabels:
              app: prometheus
      ports:
        - protocol: TCP
          port: 9090
    # Block all other egress (default deny)
```

---

## 4. Data Architecture

### 4.1 Tenant Data Schemas

**Well Data Schema:**
```sql
CREATE SCHEMA IF NOT EXISTS shell_uk_data;

CREATE TABLE shell_uk_data.wells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(100) NOT NULL DEFAULT 'operator_shell_uk',
  well_name VARCHAR(200) NOT NULL,
  field_name VARCHAR(200),
  well_type VARCHAR(50), -- 'HPHT Gas Condensate', 'Oil Producer', etc.
  status VARCHAR(50), -- 'Active', 'Shut-in', 'Abandoned'
  completion_data JSONB, -- Casing, tubing, equipment
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  encrypted_fields BYTEA, -- Encrypted sensitive data
  CONSTRAINT tenant_check CHECK (tenant_id = 'operator_shell_uk')
);

-- RLS policy
ALTER TABLE shell_uk_data.wells ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON shell_uk_data.wells
  USING (tenant_id = current_setting('app.current_tenant')::text);

-- Indexes
CREATE INDEX idx_wells_tenant ON shell_uk_data.wells(tenant_id);
CREATE INDEX idx_wells_field ON shell_uk_data.wells(field_name);
CREATE INDEX idx_wells_status ON shell_uk_data.wells(status);
```

**AI Embeddings Schema (Vector Search):**
```sql
CREATE SCHEMA IF NOT EXISTS shell_uk_embeddings;

CREATE TABLE shell_uk_embeddings.document_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(100) NOT NULL DEFAULT 'operator_shell_uk',
  document_id UUID NOT NULL,
  document_type VARCHAR(50), -- 'procedure', 'daily_report', 'failure_analysis'
  chunk_index INT,
  content_preview TEXT, -- First 200 chars for debugging
  embedding VECTOR(1536), -- OpenAI ada-002 or equivalent
  metadata JSONB, -- {well_id, date, author, tags}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT tenant_check CHECK (tenant_id = 'operator_shell_uk')
);

-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- RLS policy
ALTER TABLE shell_uk_embeddings.document_vectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON shell_uk_embeddings.document_vectors
  USING (tenant_id = current_setting('app.current_tenant')::text);

-- Vector similarity index (HNSW for fast approximate nearest neighbor)
CREATE INDEX idx_embeddings_vector ON shell_uk_embeddings.document_vectors
  USING hnsw (embedding vector_cosine_ops);
```

**Live Operations Streams:**
```sql
CREATE SCHEMA IF NOT EXISTS shell_uk_streams;

CREATE TABLE shell_uk_streams.real_time_parameters (
  id BIGSERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL DEFAULT 'operator_shell_uk',
  well_id UUID NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  parameter_name VARCHAR(100), -- 'WHP', 'Hookload', 'Flow_Rate'
  value NUMERIC(12,2),
  unit VARCHAR(20), -- 'psi', 'klbs', 'bbl/day'
  quality_code VARCHAR(10), -- 'GOOD', 'BAD', 'UNCERTAIN'
  source VARCHAR(50), -- 'SCADA', 'Manual_Entry', 'Calculated'
  CONSTRAINT tenant_check CHECK (tenant_id = 'operator_shell_uk')
);

-- Partitioning by month for efficient queries
CREATE TABLE shell_uk_streams.real_time_parameters_2025_11
  PARTITION OF shell_uk_streams.real_time_parameters
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

-- RLS policy
ALTER TABLE shell_uk_streams.real_time_parameters ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON shell_uk_streams.real_time_parameters
  USING (tenant_id = current_setting('app.current_tenant')::text);

-- Indexes
CREATE INDEX idx_streams_well_time ON shell_uk_streams.real_time_parameters(well_id, timestamp DESC);
CREATE INDEX idx_streams_param ON shell_uk_streams.real_time_parameters(parameter_name, timestamp DESC);
```

---

### 4.2 Shared Platform Schemas (Non-Tenant Data)

```sql
-- System monitoring (cross-tenant analytics for WellTegra ops team)
CREATE SCHEMA IF NOT EXISTS system_monitoring;

CREATE TABLE system_monitoring.tenant_metrics (
  id BIGSERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  metric_name VARCHAR(100), -- 'api_requests', 'storage_gb', 'ai_queries'
  metric_value NUMERIC(12,2),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- NO RLS on system monitoring (WellTegra admin access only)
GRANT SELECT ON system_monitoring.tenant_metrics TO welltegra_admin;
```

---

## 5. Cloud Infrastructure

### 5.1 Deployment Architecture (Kubernetes)

**Namespace Isolation:**
```yaml
# Separate Kubernetes namespace per tenant
apiVersion: v1
kind: Namespace
metadata:
  name: tenant-shell-uk
  labels:
    tenant: operator_shell_uk
    encryption-domain: shell_uk_v1
---
# Resource quotas
apiVersion: v1
kind: ResourceQuota
metadata:
  name: tenant-quota
  namespace: tenant-shell-uk
spec:
  hard:
    requests.cpu: "8"
    requests.memory: 32Gi
    persistentvolumeclaims: "10"
    services.loadbalancers: "0" # No external load balancers per tenant
---
# Network policy (default deny)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: tenant-shell-uk
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

**Tenant Pod Configuration:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  namespace: tenant-shell-uk
spec:
  replicas: 3
  selector:
    matchLabels:
      app: welltegra-api
      tenant: operator_shell_uk
  template:
    metadata:
      labels:
        app: welltegra-api
        tenant: operator_shell_uk
    spec:
      serviceAccountName: tenant-shell-uk-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
        - name: api
          image: welltegra/api:v1.2.3
          env:
            - name: TENANT_ID
              value: "operator_shell_uk"
            - name: ENCRYPTION_DOMAIN
              value: "shell_uk_v1"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: connection-string
            - name: KMS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: encryption-keys
                  key: master-key-id
          resources:
            requests:
              cpu: 500m
              memory: 1Gi
            limits:
              cpu: 2000m
              memory: 4Gi
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
```

---

### 5.2 Scaling Strategy

**Horizontal Pod Autoscaling:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: tenant-shell-uk
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

**Database Connection Pooling:**
- PgBouncer per tenant namespace
- Max 100 connections per tenant schema
- Connection timeout: 30 seconds
- Idle connection reaping: 5 minutes

---

## 6. Compliance & Audit

### 6.1 Audit Logging

**Audit Log Schema:**
```sql
CREATE TABLE system_monitoring.audit_log (
  id BIGSERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(100),
  action VARCHAR(50), -- 'CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN'
  resource_type VARCHAR(50), -- 'well', 'document', 'ai_query'
  resource_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  request_id UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details JSONB -- Full request/response for compliance
);

-- Retention: 7 years for compliance (SOC 2, ISO 27001)
CREATE INDEX idx_audit_tenant_time ON system_monitoring.audit_log(tenant_id, timestamp DESC);
```

**Application Audit Middleware:**
```typescript
app.use(auditMiddleware);

function auditMiddleware(req, res, next) {
  const auditEntry = {
    tenant_id: req.jwt.tenant_id,
    user_id: req.jwt.sub,
    action: req.method,
    resource_type: req.path.split('/')[2], // e.g., /api/wells/123 → 'wells'
    resource_id: req.params.id,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    request_id: req.id,
    timestamp: new Date(),
    details: {
      path: req.path,
      query: req.query,
      body_hash: hashSensitiveData(req.body)
    }
  };

  // Async write to audit log
  db.query('INSERT INTO system_monitoring.audit_log ...', auditEntry);

  next();
}
```

---

### 6.2 Compliance Requirements

**ISO 27001 (Information Security Management):**
- ✅ Access control (RLS, JWT, MFA)
- ✅ Cryptographic controls (AES-256, TLS 1.3)
- ✅ Audit logging (7-year retention)
- ✅ Incident response (automated alerts)

**SOC 2 Type II (Trust Services Criteria):**
- ✅ Security: Encryption at rest/transit, tenant isolation
- ✅ Availability: 99.9% uptime SLA, auto-scaling
- ✅ Confidentiality: Per-tenant encryption domains
- ✅ Processing Integrity: Schema validation, checksums
- ✅ Privacy: GDPR compliance (data residency, right to erasure)

**GDPR (General Data Protection Regulation):**
- ✅ Data residency: EU tenants on EU-West-1 (Ireland)
- ✅ Right to erasure: Automated tenant data deletion API
- ✅ Data portability: Export API in JSON/CSV formats
- ✅ Consent management: Explicit opt-in for AI processing

---

## 7. Disaster Recovery & Business Continuity

### 7.1 Backup Strategy

**PostgreSQL Backups:**
- **Continuous Archiving:** Write-Ahead Logs (WAL) to S3/Azure Blob (encrypted)
- **Full Backups:** Daily snapshots per tenant schema
- **Point-in-Time Recovery (PITR):** Restore to any second within 30 days
- **Backup Testing:** Monthly restore drills per tenant

**Retention Policy:**
- Daily backups: 30 days
- Weekly backups: 1 year
- Monthly backups: 7 years (compliance)

**Per-Tenant Restore:**
```bash
# Restore single tenant schema from backup
pg_restore --schema=shell_uk_data \
  --dbname=welltegra_production \
  tenant_shell_uk_2025-11-06.dump
```

---

### 7.2 High Availability

**Database HA:**
- PostgreSQL Primary + 2 Read Replicas (Multi-AZ)
- Automatic failover (30-second RTO)
- Synchronous replication for write consistency

**Application HA:**
- Kubernetes multi-zone deployment (3 availability zones)
- Rolling updates (zero-downtime deployments)
- Circuit breakers for external dependencies

**SLA Targets:**
- **Uptime:** 99.9% (43 minutes/month downtime allowance)
- **RTO (Recovery Time Objective):** 1 hour
- **RPO (Recovery Point Objective):** 5 minutes (WAL archiving)

---

## 8. Migration Path (Current MVP → Multi-Tenant)

### Phase 1: Database Migration (Months 1-2)
1. Provision PostgreSQL cluster (RDS/Azure Database)
2. Migrate CSV data → PostgreSQL tenant schemas
3. Implement RLS policies
4. Deploy PgBouncer connection pooling

### Phase 2: API Development (Months 3-4)
1. Build Node.js/Python API with tenant context middleware
2. Implement JWT authentication (Auth0/Cognito)
3. Deploy on Kubernetes with namespace isolation
4. Load testing (1000 concurrent users per tenant)

### Phase 3: Encryption & Security (Months 5-6)
1. Integrate AWS KMS / Azure Key Vault
2. Implement per-tenant encryption domains
3. Enable audit logging
4. SOC 2 Type II readiness audit

### Phase 4: Production Launch (Month 7+)
1. Onboard first 5 pilot customers
2. Deploy one-way ingestion connectors
3. Monitor & optimize performance
4. Scale to 100+ tenants

---

## 9. Cost Estimate (AWS Reference Architecture)

**Monthly Cost per Tenant (Medium-Scale Operator):**

| Component                     | Specification                | Monthly Cost |
|-------------------------------|------------------------------|--------------|
| RDS PostgreSQL                | db.r6g.xlarge (4 vCPU, 32 GB)| $480         |
| EKS Kubernetes Cluster        | 3 nodes (t3.large)           | $220         |
| Application Load Balancer     | 100 GB/month                 | $25          |
| S3 Storage (backups, docs)    | 500 GB                       | $12          |
| KMS Encryption (10k requests) | Per-tenant key               | $1           |
| CloudWatch Logs               | 50 GB/month                  | $25          |
| Data Transfer                 | 200 GB outbound              | $18          |
| **Total per Tenant**          |                              | **$781/mo**  |

**Cost Optimization:**
- Shared PostgreSQL instance (schema isolation) vs. separate RDS per tenant
- Reserved Instances (40% discount on RDS/EKS)
- Spot instances for non-critical workloads

**100 Tenants:** ~$50,000/month infrastructure (economies of scale reduce per-tenant cost to ~$500)

---

## 10. Open Questions & Decisions Required

1. **Cloud Provider Selection:**
   - AWS (mature, costly) vs. Azure (enterprise integrations) vs. GCP (AI/ML tools)
   - **Recommendation:** AWS for initial deployment (broadest operator adoption)

2. **Database Strategy:**
   - Schema-per-tenant (proposed) vs. Database-per-tenant
   - **Recommendation:** Schema-per-tenant (simpler ops, adequate isolation with RLS)

3. **AI Model Hosting:**
   - Shared AI models across tenants vs. per-tenant fine-tuned models
   - **Recommendation:** Shared base models + per-tenant RAG context (cost-effective)

4. **Data Residency:**
   - Single region (US-East) vs. multi-region (EU, Asia)
   - **Recommendation:** US-East primary, EU-West for European customers (GDPR)

5. **Ingestion Frequency:**
   - Real-time streaming (Kafka/Kinesis) vs. batch ingestion (hourly/daily)
   - **Recommendation:** Hybrid (real-time for critical params, batch for historical data)

---

## 11. Next Steps

1. **Review & Approval:** Circulate to engineering, security, and executive teams
2. **Proof of Concept:** Deploy single-tenant sandbox on AWS (2-week sprint)
3. **Security Audit:** Engage third-party penetration testing firm
4. **Customer Validation:** Present architecture to 3 pilot customers (Shell, BP, TotalEnergies)
5. **Build Team:** Hire Cloud Architect, DevOps Engineer, Security Engineer

---

## Appendix A: Reference Architecture Diagrams

*(To be created in collaboration with Engineering)*

- Network topology diagram (VPC, subnets, security groups)
- Data flow diagram (ingestion → storage → AI processing)
- Encryption key hierarchy
- Disaster recovery failover process

---

## Appendix B: Security Checklist

- [x] Tenant data isolation (RLS)
- [x] Encryption at rest (AES-256)
- [x] Encryption in transit (TLS 1.3)
- [x] Per-tenant encryption keys
- [x] JWT authentication
- [x] OAuth 2.0 authorization
- [x] MFA for admin users
- [x] Audit logging (7-year retention)
- [x] Network egress lockdown (sandboxed tenants)
- [x] Kubernetes security policies
- [x] Secrets management (KMS/Key Vault)
- [ ] Penetration testing (Q1 2026)
- [ ] SOC 2 Type II certification (Q2 2026)
- [ ] ISO 27001 certification (Q3 2026)

---

**Document Control:**
- **Version History:** 1.0 (Initial Draft)
- **Next Review Date:** 2025-12-01
- **Distribution:** Engineering, Security, Product, Executive Team
- **Classification:** Internal Use Only

---

**Contact:**
Catriona Cameron - Security & Cloud Architecture
Email: catriona.cameron@welltegra.com
Slack: @catriona
