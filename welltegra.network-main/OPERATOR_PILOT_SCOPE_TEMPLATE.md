# Operator Pilot Scope Document
## First Real-World Integration

**Date**: [To be filled by Finlay]
**Version**: 1.0
**Status**: DRAFT (pending operator sign-off)
**Lead**: Finlay
**API Lead**: Rocky

---

## Executive Summary

This document defines the scope of WellTegra's pilot integration with [OPERATOR NAME] on a production well. The pilot demonstrates that WellTegra can integrate with the operator's existing systems (e.g., WellPlan, Landmark) and deploy real-world physical constraint enforcement in 8 weeks.

### Success Definition
✓ Integration complete and live on a production well
✓ Physical constraints enforced in operator's workflow
✓ Zero safety incidents
✓ Operator can self-serve without WellTegra support
✓ Ready for long-term deployment

---

## 1. Well & Operator Details

### Well Information
- **Well Name**: [To be confirmed by operator]
- **Location**: [Block/Region]
- **Well Type**: [Production / Intervention / Exploration]
- **TVD**: [Depth]
- **Status**: [Active / Planned]
- **Planned Start Date**: [Target for pilot operations]

### Operator Contact & Technical Liaison
- **Primary Contact**: [Name, Title, Email, Phone]
- **Technical Liaison**: [Name, Title, Email, Phone]
- **IT/Systems Contact**: [Name, Title, Email, Phone]

### Systems in Scope
- **Planning System**: [e.g., WellPlan, Landmark, Aspen, Petronas iFlex]
- **System Version**: [Version number]
- **Data Exchange Protocol**: [WITSML 2.0, REST API, OPC UA, Custom]
- **Hosting**: [Cloud / On-Premise / Hybrid]

---

## 2. System Integration Overview

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Operator's System                        │
│              [WellPlan / Landmark / Aspen]                  │
│                      (On-Premise)                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Well plan data, operations log
                 │ (via REST API / WITSML 2.0)
                 ↓
┌────────────────────────────────────────────────────────────┐
│          WellTegra Physical Constraints Engine               │
│                    (Our System)                             │
│                 (Cloud-Hosted or On-Prem)                  │
│                                                            │
│  • Reads: Well plan, real-time operations parameters       │
│  • Evaluates: Physical constraint rules                    │
│  • Acts: Alerts / Throttles operations                     │
└───────────┬──────────────────────────────────────────────────┘
            │
            │ Constraint violations, alerts
            │ (bidirectional)
            ↓
┌────────────────────────────────────────────────────────────┐
│      Operator's Control System / Dashboard                  │
│    (Where operators see alerts and make decisions)         │
└────────────────────────────────────────────────────────────┘
```

### Authentication & Security
- **Authentication Method**: [OAuth 2.0 / API Key / Custom / mTLS]
- **Data Encryption**: [TLS 1.3 in transit, AES-256 at rest]
- **VPN/Network**: [If required for on-premise integration]
- **IP Whitelisting**: [List of WellTegra IPs that will access operator's system]
- **Access Control**: [Which users/roles can trigger constraints]

---

## 3. Data Integration Details

### Data to Ingest (From Operator → WellTegra)

| Data Type | Source System | Frequency | Format | Purpose |
|-----------|---------------|-----------|--------|---------|
| Well Design (trajectory, casing, fluids) | WellPlan / Landmark | Once (static) | JSON / WITSML | Constraint baseline |
| Real-Time Operations (pump rate, pressure, temp, depth) | SCADA / Control System | Real-time (1 Hz) | REST API / OPC UA | Live monitoring |
| Operations Log (events, alarms, manual inputs) | Operations DB | Real-time | REST API | Audit trail |
| Equipment Specifications | [ERP System?] | Once (or quarterly) | JSON / CSV | Constraint limits |

### Data to Export (From WellTegra → Operator)

| Data Type | Target System | Frequency | Format | Purpose |
|-----------|---------------|-----------|--------|---------|
| Constraint Alerts | Dashboard / SCADA | Real-time | JSON push / Webhook | Warn operators |
| Constraint Violations | Audit Log | Real-time | JSON / REST | Compliance record |
| Daily Summary Report | Email / Portal | Daily | PDF | Operator review |

---

## 4. Physical Constraints (First Iteration)

The "Physical Constraints Engine" for this pilot focuses on **one well, one primary constraint, and one set of operational limits**.

### Constraint Set #1: Pump Rate Limits

**Rule**: Do not exceed maximum pump rate for well design

- **Input**: Real-time pump rate (SPM) from operations
- **Limit**: [To be confirmed by operator, e.g., 120 SPM]
- **Action on Breach**:
  - YELLOW ALERT (90-99% of limit): Notify operator via dashboard
  - RED ALERT (100%+ of limit): Throttle pump, log event, escalate

**Why This Constraint**:
- Prevents hydrate formation / wellbore stability issues
- Easy to measure in real-time
- High operator familiarity (they already monitor this)
- Clear safety impact

### Constraint Set #2: Wellhead Pressure Limits (Optional, if time permits)

**Rule**: Wellhead pressure must not exceed design limit

- **Input**: Real-time wellhead pressure (PSI) from sensors
- **Limit**: [To be confirmed by operator, e.g., 5,000 PSI]
- **Action on Breach**:
  - YELLOW ALERT (90-99% of limit): Notify
  - RED ALERT (100%+ of limit): Shut in well, log event

---

## 5. Implementation Timeline

### Week 1: Kickoff & Setup
- [ ] Exchange API credentials and access
- [ ] WellTegra team gains read/write access to operator's system
- [ ] Well plan data imported into WellTegra
- [ ] Historical operations data retrieved (for baseline)

### Week 2: Constraint Configuration
- [ ] Constraint rules defined and coded
- [ ] Dry-run testing on historical data
- [ ] Operator review and sign-off on rules

### Week 3: Integration Testing
- [ ] WellTegra connected to live operations data stream
- [ ] Dashboard alerts displayed to operator
- [ ] Edge case testing (sensor failures, network drops, etc.)

### Week 4: Staging / Shadow Mode
- [ ] System runs "shadow mode" (alerts generated but not enforced)
- [ ] Operator observes alerts for 3-5 days
- [ ] False alarm review and tuning

### Week 5: Go-Live
- [ ] Constraint enforcement enabled (system can now alert/throttle)
- [ ] First 48 hours: Close monitoring by WellTegra team
- [ ] Operator trained on alert workflows

### Weeks 6-8: Production & Optimization
- [ ] Live operations under constraint enforcement
- [ ] Operator feedback collected
- [ ] Performance tuning and refinement
- [ ] Documentation and knowledge transfer

### End of Week 8: Go/No-Go Decision
- [ ] Operator confirms pilot success
- [ ] Integration ready for long-term deployment
- [ ] Transition to support SLA

---

## 6. Success Criteria (Gate Check at Week 8)

### Technical Metrics
- [ ] **Uptime**: System achieves 99.5% availability
- [ ] **Latency**: Alerts delivered within 2 seconds of constraint breach
- [ ] **Accuracy**: 100% of constraint breaches detected (no false negatives)
- [ ] **False Alarms**: <5% false positive rate

### Operational Metrics
- [ ] **Adoption**: Operators actively monitor and respond to alerts
- [ ] **Safety**: Zero incidents attributable to system failure
- [ ] **Efficiency**: No unplanned downtime caused by constraints
- [ ] **Documentation**: Operator team trained and documented

### Business Metrics
- [ ] **Operator Satisfaction**: NPS > 8/10
- [ ] **Support Volume**: <2 support tickets per week
- [ ] **Cost**: Implementation delivered within budget

---

## 7. Risk Assessment & Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| API integration delays | Medium | High | Rocky to test connectivity Week 0; have fallback (manual data import) |
| Real-time data latency | Medium | Medium | Performance SLA defined in Week 1; stress testing in Week 3 |
| System downtime | Low | High | Deploy failover; manual alert backup |
| Sensor data quality issues | Medium | Low | Data validation rules; operator pre-screens data |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Operator pushes back on constraints | Medium | High | Get constraint sign-off in Week 1; explain rationale |
| Operations interrupt deployment | Low | Medium | Schedule go-live during planned downtime |
| Training insufficient | Low | Medium | Two rounds of training; video documentation |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Operator delays operator call / data sharing | High | Critical | Finlay to push for early commitment; set clear deadlines |
| Pilot doesn't prove ROI | Low | Medium | Iterate constraints based on feedback |

---

## 8. Support & Escalation

### Support Model (During Pilot)
- **WellTegra On-Call**: 24/7 during live operations (Weeks 5-8)
- **Response SLA**: Critical issues <1 hour
- **Communication**: Slack channel + weekly sync

### Escalation Path
1. **Issue detected** → Operator contacts WellTegra (Slack or phone)
2. **Initial response** → Rocky or Finlay investigates within 15 minutes
3. **Blocker** → Escalate to you (exec decision)
4. **Resolution** → Fix deployed, root cause documented

---

## 9. Post-Pilot (Long-Term Plan)

### Transition to Operations
- [ ] Handoff to WellTegra support team
- [ ] SLA agreement signed (e.g., 99.5% uptime, <1h response time)
- [ ] Monthly review cadence

### Expansion Opportunities (Post-Pilot)
1. Add more constraints (wellhead pressure, casing strain, etc.)
2. Integrate with additional operator wells
3. Expand to other operators in same region

---

## 10. Sign-Off & Approvals

**Operator Side**:
- [ ] Technical Lead: _________________ Date: _______
- [ ] Operations Manager: _________________ Date: _______
- [ ] IT Manager: _________________ Date: _______
- [ ] Executive Sponsor: _________________ Date: _______

**WellTegra Side**:
- [ ] Finlay (Lead): _________________ Date: _______
- [ ] Rocky (API): _________________ Date: _______
- [ ] You (Executive): _________________ Date: _______

---

## Appendix A: Well Plan Data Sample

[Include sample well plan JSON or CSV here]

## Appendix B: Data Integration Specifications

[Include detailed API specs, field mappings, error codes, etc.]

## Appendix C: Constraint Rule Logic

[Include pseudocode or formal specification of constraint rules]

## Appendix D: Training Materials

[Link to operator training videos, user guides, FAQ]

---

**Document Version**: 1.0
**Next Review Date**: [After operator call - November 14, 2025]
**Last Updated**: [Date of creation]
