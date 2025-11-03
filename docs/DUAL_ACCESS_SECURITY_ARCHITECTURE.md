# Dual-Access Security Architecture for WellTegra

## Overview

This document describes the comprehensive security architecture for WellTegra's dual-access model (Public Demo → Private Playground), implementing enterprise-grade security, individual tracking, and auditable accountability.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Access Control & Security Layer](#access-control--security-layer)
3. [Data & Computation Integrity Layer](#data--computation-integrity-layer)
4. [Accountability & Tracking Layer](#accountability--tracking-layer)
5. [Implementation Components](#implementation-components)
6. [Usage Guide](#usage-guide)
7. [Security Best Practices](#security-best-practices)
8. [Compliance & Audit](#compliance--audit)

---

## Architecture Overview

The WellTegra dual-access architecture consists of three primary layers:

```
┌─────────────────────────────────────────────────────────────┐
│              PUBLIC DEMO (Unauthenticated)                  │
│  - Limited feature access                                   │
│  - Basic visualizations                                     │
│  - Read-only data viewing                                   │
│  - Conversion tracking                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    [Authentication Gate]
                    - SSO/MFA Required
                    - Session Management
                    - Zero-Trust Verification
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          PRIVATE PLAYGROUND (Authenticated)                 │
│  - Full Deep Research models                                │
│  - Advanced analytics                                       │
│  - Custom parameter tuning                                  │
│  - ZKP-verified computations                                │
│  - Complete audit trail                                     │
└─────────────────────────────────────────────────────────────┘
```

### Key Objectives

1. **Secure Access Control**: Implement SSO, MFA, and Zero-Trust principles
2. **Privacy-Preserving Verification**: Use Zero-Knowledge Proofs to verify computations without exposing data
3. **Complete Auditability**: Track every user action with immutable, cryptographically-verified logs
4. **Client Interest Tracking**: Monitor feature usage to understand client needs
5. **Regulatory Compliance**: Centralized oversight of distributed activities

---

## Access Control & Security Layer

### 1. Authentication Components

#### Single Sign-On (SSO)
- **Supported Providers**: Google, Microsoft, Okta, Auth0
- **Implementation**: Firebase Authentication
- **Features**:
  - Seamless third-party authentication
  - Automatic session creation
  - Provider-agnostic user management

#### Multi-Factor Authentication (MFA)
- **Type**: Phone-based SMS verification
- **Enforcement**: Required for Playground access
- **Timeout**: 5 minutes for MFA completion
- **Features**:
  - Enrollment during first login
  - Persistent MFA status
  - Re-verification on context change

### 2. Zero-Trust Security Principles

The system implements continuous verification:

```javascript
// Continuous session validation
- User identity verification (every request)
- Device fingerprint matching
- IP address monitoring
- Session timeout enforcement (1 hour default)
- Context change detection
```

#### Session Management

```javascript
{
  sessionId: "sess_1234567890_abc123",
  userId: "user_xyz",
  accessTier: "private_playground",
  createdAt: "2025-11-01T10:00:00Z",
  expiresAt: "2025-11-01T11:00:00Z",
  deviceInfo: {
    userAgent: "...",
    platform: "...",
    fingerprint: "..." // Unique device identifier
  },
  ipAddress: "192.168.1.1",
  activities: [...] // Tracked activities
}
```

### 3. Access Tiers

| Tier | Authentication | Features | Limitations |
|------|---------------|----------|-------------|
| **Public Demo** | None | Basic viewing, limited charts | 3 features, 100 data points, 30 min session |
| **Private Playground** | SSO + MFA | Full models, custom params, exports | Standard rate limits |
| **Enterprise** | SSO + MFA + License | Collaboration, unlimited access | None |

---

## Data & Computation Integrity Layer

### Zero-Knowledge Proof (ZKP) System

The ZKP system proves computation correctness WITHOUT revealing sensitive input data.

#### How It Works

```
1. Client uploads data → Generate Commitment
   - Hash(data + nonce) = Commitment
   - Commitment stored, data remains private

2. Execute computation → Generate Proof
   - Proof = f(Commitment, Parameters) → Output
   - Merkle tree of computation steps
   - Range proofs for numerical outputs

3. Verifier checks proof → Verification
   - Verify commitment exists
   - Verify computation steps (Merkle proof)
   - Verify output ranges
   - Return verified: true/false
```

#### ZKP Components

##### 1. Commitment Generation
```javascript
const commitment = await zkpVerification.generateCommitment(
  sensitiveData,
  {
    dataType: 'well_analysis',
    operation: 'predictive_model',
    userId: 'user_123',
    sessionId: 'sess_456'
  }
);
// Returns: { commitmentId, commitmentValue, timestamp }
```

##### 2. Proof Generation
```javascript
const proof = await zkpVerification.generateComputationProof({
  inputCommitmentId: commitment.commitmentId,
  outputData: analysisResults,
  computationFunction: 'deep_research_model',
  parameters: { wells: 5, depth: 10000 },
  userId: 'user_123',
  sessionId: 'sess_456'
});
```

##### 3. Verification
```javascript
const verification = await zkpVerification.verifyProof(proof.proofId);
// Returns: { verified: true, checks: {...}, message: '...' }
```

#### Proof Types

- **Computation Integrity**: Proves Output = f(Input) correctly
- **Data Privacy**: Proves properties without revealing data
- **Range Proofs**: Proves values within bounds without exact values
- **Membership Proofs**: Proves element in set without revealing which

### Cryptographic Verification

All audit events and proofs include:
- **SHA-256 hashes** for tamper detection
- **Merkle trees** for computation step verification
- **Chained hashes** for immutable audit trails
- **Timestamps** for temporal ordering

---

## Accountability & Tracking Layer

### Data Provenance System

Tracks data from creation through all transformations:

```javascript
// Track data creation
await trackDataProvenance(dataId, 'create', {
  userId: 'user_123',
  sessionId: 'sess_456',
  fileName: 'well_data.csv',
  fileSize: 1024,
  checksumBefore: 'abc123...'
});

// Track transformation
await trackDataProvenance(newDataId, 'transform', {
  userId: 'user_123',
  parentDataIds: [dataId],
  transformations: ['normalization', 'feature_extraction'],
  checksumAfter: 'def456...'
});
```

#### Provenance Record Structure

```javascript
{
  provenanceId: "prov_1234567890_abc",
  dataId: "data_well_001",
  operation: "transform",
  timestamp: "2025-11-01T10:15:00Z",
  userId: "user_123",
  parentDataIds: ["data_raw_001"],
  transformations: ["normalize", "aggregate"],
  lineage: {
    depth: 2,
    ancestors: ["data_raw_001", "data_import_001"],
    creationPath: [...]
  },
  hash: "..." // Cryptographic verification
}
```

### Audit Logging System

#### Event Categories

1. **Authentication (auth)**: Login, logout, MFA events
2. **Access Control (access)**: Feature access, tier upgrades
3. **Data Operations (data)**: Read, write, transform, export
4. **Computations (computation)**: Model execution, analysis runs
5. **Security (security)**: ZKP verifications, security events
6. **Compliance (compliance)**: Regulatory events
7. **User Activity (user_activity)**: Feature usage, interactions

#### Audit Event Structure

```javascript
{
  eventId: "evt_1234567890_abc",
  category: "access",
  type: "feature_access_request",
  action: "access_granted",
  timestamp: "2025-11-01T10:20:00Z",
  severity: "info",
  userId: "user_123",
  sessionId: "sess_456",
  resource: "deep_research_models",
  metadata: {
    featureId: "deep_research_models",
    accessLevel: "playground",
    parameters: ["wells", "depth"]
  },
  hash: "...", // Event hash
  previousHash: "..." // Chain to previous event
}
```

### Session Activity Tracking

Tracks all user activities within a session:

```javascript
{
  sessionId: "sess_456",
  userId: "user_123",
  activities: [
    {
      timestamp: "2025-11-01T10:20:00Z",
      category: "access",
      type: "feature_access_request",
      action: "access_granted",
      resource: "deep_research_models"
    },
    // ... more activities
  ],
  startTime: 1698825600000,
  lastActivity: 1698829200000,
  eventCount: 25
}
```

### User Interest Analytics

Tracks client interests for sales intelligence:

```javascript
{
  userId: "user_123",
  features: {
    "deep_research_models": {
      accessAttempts: 15,
      accessesGranted: 12,
      accessesDenied: 3,
      firstAttempt: "...",
      lastAttempt: "..."
    }
  },
  categories: {
    "deep_research": 15,
    "predictive_models": 8,
    "data_visualization": 20
  },
  totalInteractions: 43,
  engagementScore: 85
}
```

---

## Implementation Components

### Module Overview

| Module | File | Purpose |
|--------|------|---------|
| **Authentication & Access Control** | `auth-access-control.js` | SSO, MFA, Zero-Trust, Session Management |
| **Audit Logger** | `audit-logger.js` | Immutable logging, Data provenance, Analytics |
| **ZKP Verification** | `zkp-verification.js` | Privacy-preserving computation verification |
| **Playground Gateway** | `playground-gateway.js` | Feature gating, Usage tracking, Interest analytics |
| **Security Dashboard** | `security-dashboard.html` | Monitoring UI, Analytics visualization |

### Dependencies

```javascript
// Core security utilities
import { sanitizeInput, validateEmail } from './security-utils.js';
import { generateHash, verifyHash } from './crypto-utils.js';

// Security modules
import { AuthAccessControl } from './auth-access-control.js';
import { auditLogger, logAuditEvent } from './audit-logger.js';
import { zkpVerification } from './zkp-verification.js';
import { playgroundGateway } from './playground-gateway.js';
```

---

## Usage Guide

### Quick Start

#### 1. Initialize Security System

```javascript
// The playground gateway initializes all components automatically
import { playgroundGateway } from './assets/js/playground-gateway.js';

// Gateway includes:
// - AuthAccessControl
// - AuditLogger
// - ZKPVerification
```

#### 2. Handle User Authentication

```html
<!-- Add sign-in button -->
<button id="signin-google">Sign in with Google</button>

<script type="module">
import { playgroundGateway } from './assets/js/playground-gateway.js';

document.getElementById('signin-google').addEventListener('click', async () => {
  try {
    const authController = playgroundGateway.getAuthController();
    const result = await authController.signInWithSSO('google.com');

    if (result.success) {
      // Grant playground access
      await playgroundGateway.grantPlaygroundAccess();
      console.log('Welcome to the Playground!');
    }
  } catch (error) {
    console.error('Sign-in failed:', error);
  }
});
</script>
```

#### 3. Request Feature Access

```javascript
// Check if user can access a feature
const accessCheck = await playgroundGateway.requestFeatureAccess(
  'deep_research_models',
  { parameters: ['wells', 'depth'] }
);

if (accessCheck.hasAccess) {
  // Execute feature
  const result = await playgroundGateway.executeFeature(
    'deep_research_models',
    { wells: 5, depth: 10000 }
  );
  console.log('Execution ID:', result.executionId);
} else {
  // Show upgrade prompt
  showUpgradePrompt(accessCheck.message);
}
```

#### 4. Generate ZKP Attestation

```javascript
import { zkpVerification } from './assets/js/zkp-verification.js';

// Run analysis with ZKP verification
const attestation = await zkpVerification.generateAttestation({
  name: 'Well Performance Analysis',
  type: 'deep_research',
  operation: 'predictive_model',
  inputData: wellData, // Stays private
  outputData: analysisResults,
  function: 'analyze_well_performance',
  parameters: { wells: 5, depth: 10000 },
  userId: currentUser.uid,
  sessionId: currentSession.sessionId,
  dataType: 'well_engineering'
});

console.log('Verified:', attestation.verified);
// Show client: "Computation verified without exposing your data"
```

#### 5. View Analytics Dashboard

```javascript
// Access the security dashboard
window.location.href = '/security-dashboard.html';

// Or get analytics programmatically
const analytics = playgroundGateway.getAnalyticsDashboard();
console.log('Total users:', analytics.overview.totalUsers);
console.log('Feature usage:', analytics.featureUsage);
console.log('User interests:', analytics.userInterests);
```

---

## Security Best Practices

### 1. Session Security

✅ **Do:**
- Validate sessions on every request
- Enforce session timeouts (1 hour default)
- Re-authenticate on context changes
- Use device fingerprinting
- Monitor for suspicious activity

❌ **Don't:**
- Store sensitive data in sessions
- Allow session sharing
- Skip MFA verification
- Ignore failed verification attempts

### 2. Data Protection

✅ **Do:**
- Use ZKP for sensitive computations
- Track all data transformations
- Generate cryptographic hashes
- Implement data retention policies
- Encrypt data at rest and in transit

❌ **Don't:**
- Log sensitive data in plaintext
- Share data between users without proper authorization
- Skip provenance tracking
- Disable cryptographic verification

### 3. Audit Logging

✅ **Do:**
- Log all security events
- Use immutable, chained hashes
- Store logs in centralized location
- Regular integrity verification
- Export logs for compliance

❌ **Don't:**
- Delete or modify audit logs
- Skip logging for "minor" events
- Store logs only client-side
- Ignore log integrity failures

### 4. Access Control

✅ **Do:**
- Enforce least privilege principle
- Validate access on every request
- Track denied access attempts
- Use role-based access control (RBAC)
- Monitor for access pattern anomalies

❌ **Don't:**
- Grant broad permissions
- Skip access checks
- Allow privilege escalation
- Ignore repeated denial patterns

---

## Compliance & Audit

### Regulatory Requirements

The system supports compliance with:

1. **GDPR** (General Data Protection Regulation)
   - User consent tracking
   - Right to access audit logs
   - Right to deletion
   - Data provenance for accountability

2. **SOC 2** (Service Organization Control 2)
   - Access control logs
   - Security event monitoring
   - Change management tracking
   - Incident response logging

3. **HIPAA** (if handling health data)
   - Audit trail requirements
   - Access control enforcement
   - Encryption requirements
   - Breach notification tracking

### Audit Reports

#### Generate Compliance Reports

```javascript
import { auditLogger } from './assets/js/audit-logger.js';

// Generate analytics report
const report = auditLogger.generateAnalyticsReport({
  startTime: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
  category: 'access'
});

console.log('Access events:', report.totalEvents);
console.log('By severity:', report.bySeverity);
console.log('By user:', report.byUser);
```

#### Export Audit Logs

```javascript
// Export as JSON
const jsonLog = await auditLogger.exportAuditLog('json', {
  startTime: Date.now() - 90 * 24 * 60 * 60 * 1000 // Last 90 days
});

// Export as CSV for compliance
const csvLog = await auditLogger.exportAuditLog('csv', {
  category: 'security'
});

// Download file
const blob = new Blob([csvLog], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'welltegra-audit-log.csv';
a.click();
```

#### Verify Log Integrity

```javascript
// Verify cryptographic chain
const verification = await auditLogger.verifyLogIntegrity();

if (verification.verified) {
  console.log('✓ Audit log integrity verified');
  console.log('Total events:', verification.totalEvents);
} else {
  console.error('✗ Integrity check failed!');
  console.error('Errors:', verification.errors);
  // Alert compliance team
}
```

---

## Performance Considerations

### Optimization Strategies

1. **In-Memory Caching**
   - Feature registry cached on load
   - Recent events kept in memory (last 10,000)
   - Session data cached during active sessions

2. **IndexedDB Storage**
   - Persistent local storage for audit logs
   - Indexed by timestamp, userId, category
   - Automatic cleanup based on retention policy

3. **Background Sync**
   - Async logging to central endpoint
   - Non-blocking audit event recording
   - Batch writes to storage

4. **Lazy Loading**
   - Dashboard loads data on demand
   - Paginated audit log queries
   - Progressive analytics rendering

---

## Troubleshooting

### Common Issues

#### 1. Session Validation Fails

**Symptoms**: "Session invalid: context_changed"

**Causes**:
- Device fingerprint mismatch
- IP address change
- Session expired

**Solutions**:
```javascript
// Re-authenticate user
const authController = playgroundGateway.getAuthController();
await authController.signOut();
// Prompt user to sign in again
```

#### 2. MFA Verification Fails

**Symptoms**: "MFA verification required"

**Causes**:
- MFA not enrolled
- Verification timeout
- Invalid code

**Solutions**:
```javascript
// Enable MFA
const result = await authController.enableMFA(user, phoneNumber);
// Verify code
await authController.verifyMFACode(result.verificationId, code);
```

#### 3. ZKP Verification Fails

**Symptoms**: "Proof verification failed"

**Causes**:
- Invalid computation steps
- Commitment not found
- Signature mismatch

**Solutions**:
```javascript
// Regenerate proof
const newProof = await zkpVerification.generateComputationProof({...});
// Verify again
const verification = await zkpVerification.verifyProof(newProof.proofId);
```

---

## API Reference

See individual module documentation:

- [Authentication & Access Control API](./auth-access-control-api.md)
- [Audit Logger API](./audit-logger-api.md)
- [ZKP Verification API](./zkp-verification-api.md)
- [Playground Gateway API](./playground-gateway-api.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-01 | Initial release with full dual-access architecture |

---

## Support & Contact

For technical support or security concerns:
- **Documentation**: `/docs/`
- **Dashboard**: `/security-dashboard.html`
- **GitHub Issues**: [Report Issues](https://github.com/kenmck3772/welltegra.network/issues)

---

## License

This security architecture is proprietary to WellTegra Network.

**Last Updated**: 2025-11-01
**Version**: 1.0.0
