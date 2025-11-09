# WellTegra New Prioritized Development Roadmap
## Aberdeen Oil Show Analysis & Execution Plan

**Date**: November 2025
**Status**: ACTIVE - Team Execution Plan
**Scope**: Post-Aberdeen pivot to client-validated demand

---

## Executive Summary

Our previous 4-phase, 24-month roadmap was built on **internal assumptions**. After the Aberdeen oil show, we have replaced it with a **client-validated, 3-phase plan** focused on converting three high-stakes strategic opportunities:

1. **A supermajor** (Workstream B & C)
2. **A primary operator** (Workstream D)
3. **Strategic investment group** (Workstream A)

**Our single focus for the next 2 weeks**: P0 (Priority Zero) "Deep Dive" Sprints to prepare our technical and commercial assets for imminent high-value meetings and due diligence.

---

## Part 1: Key Strategic Shifts

### What Changed?

| Dimension | **Old Plan (4-Phase, Internal)** | **New Plan (3-Phase, Client-Validated)** |
|-----------|----------------------------------|------------------------------------------|
| **Timeline** | 24-36 months | 12 months (Phase 1-3) |
| **Prioritization Basis** | Internal product roadmap | Direct client feedback from Aberdeen |
| **Target Customers** | Generic well intervention market | 3 specific high-value accounts |
| **P0 Focus** | Foundation (API, dashboards, real-time) | Due diligence & deal closing |
| **Success Definition** | Feature completion + ARR growth | **Signed contracts** with 3 clients |
| **Team Allocation** | Distributed across 10 modules | **All hands** on P0 for 2 weeks |

### Why This Matters

The Aberdeen show validated that our **core ideas** resonate with buyers. However, they don't care about a generic roadmap—they care about:

- **Trust**: Can your data really be clean and secure? (Supermajor concern)
- **Balance-Sheet De-Risking**: Can you prove P&A failures happen less often? (Supermajor CFO concern)
- **First Integration**: Can you actually plug into our real systems? (Operator concern)
- **Investment Thesis**: Do you have real customer demand? (Investor concern)

Our job now is to **prove** these three things in the next 2 weeks.

---

## Part 2: P0 (Priority Zero) Workstreams – Next 2 Weeks

All four workstreams are **"all hands" efforts**. This is our existential priority.

---

### Workstream A: Due Diligence Data Room
**Lead**: Midas (Al-CTO support as needed)
**Objective**: Prepare the initial data room for the investment group's technical and commercial due diligence

#### Goal
Create a "clean room" (secure, organized data package) that proves we are:
1. A legitimate, professionally-run company
2. Building something investors can understand and value
3. Staffed with credible technical talent

#### Core Responsibilities (Midas)
- **Financial Models**: Collate our DCF (Discounted Cash Flow) and Real Options models for valuation
- **Team Roster**: Compile the full team list with roles, experience, and credentials
- **Cost Structure**: Detail our burn rate, headcount plan, and go-to-market spend
- **Product Architecture**: Document the current system architecture (high-level diagrams, tech stack)
- **Intellectual Property**: List patents, trade secrets, and proprietary algorithms
- **Legal & Compliance**: Gather articles of incorporation, cap table, any material litigation

#### Immediate Next Steps (Days 1-3)
1. **Create a shared folder structure** for the data room:
   - `/financials` – DCF, Real Options, unit economics
   - `/team` – Bios, org chart, credentials
   - `/product` – Architecture diagrams, API specs, feature list
   - `/ip` – Patent filings, algorithms, datasets
   - `/legal` – Cap table, agreements, insurance

2. **Schedule a 30-min data room kickoff** with the investment lead (likely the investor contact from Aberdeen).
   - Confirm what docs they need
   - Identify any gaps
   - Set deadline for completion (likely before their first technical deep dive)

3. **Begin drafting the "company deck"**:
   - 1-slide team overview
   - 1-slide tech overview
   - 1-slide go-to-market plan
   - Use this as the "cover letter" for the data room

#### Success Criteria
- [ ] All requested documents organized and accessible (password-protected link)
- [ ] No typos, formatting errors, or outdated information
- [ ] Clear readme file explaining the structure
- [ ] Investment team can find what they need within 5 minutes

---

### Workstream B: The "Digital Fortress" Deck (Supermajor Technical Deep Dive)
**Lead**: Gus (Catriona as co-lead for security/operations)
**Objective**: Prepare a comprehensive deck for the Supermajor's technical due diligence on data security, ingestion, and validation

#### Goal
Answer the supermajor's core concern: **"Can we trust you with our operational data?"**

The deck must prove:
1. Data is validated and clean before entry
2. OT (Operational Technology) security is enterprise-grade
3. Data residency/compliance matches their requirements
4. Zero Trust architecture is properly implemented

#### Core Responsibilities (Gus + Catriona)

**Gus (Technical Lead)**:
- Lead the design of the **"Data Ingestion & Validation" Dashboard** (mock-up/prototype)
  - Visual: WITSML/EDM messy data entering on left → validation rules applied → clean data exiting on right
  - Show: Real-time quality metrics, error logs, data lineage
- Document the **Data Integrity Score (DIS)** from our old roadmap
  - Reframe it not as a "feature," but as **proof of trust**
  - Define scoring criteria: completeness, accuracy, timeliness, consistency
  - Show how it prevents bad data from entering the supermajor's workflows

**Catriona (Operations & Security Lead)**:
- Document the **Hybrid-Cloud & OT Security Model**:
  - Zero Trust architecture (not everyone can access everything)
  - Network segmentation (DMZ, app tier, data tier)
  - Data residency guarantees (data stays in their region, never leaves without explicit request)
  - Encryption in transit and at rest
- Create a **"Security Architecture Diagram"** (can be a PDF slide):
  - Show the data flow: Well site → Gateway → Validation → Secure storage
  - Label security controls at each stage

#### Immediate Next Steps (Days 1-5)

**Gus**:
1. **Build or wireframe the "Data Ingestion Dashboard"** (interactive HTML or Figma prototype):
   - Left side: Sample WITSML data (show messy JSON with gaps, duplicates, outliers)
   - Middle: Validation rules applied in real-time (show checkmarks, errors, warnings)
   - Right side: Clean data ready for analytics
   - Include: A "Data Integrity Score" meter (0-100) that increases as data is cleaned

2. **Write a 2-page "Data Integrity Score Framework" doc**:
   - Definition: What makes data "trusted"?
   - Scoring algorithm: How do we weight completeness vs. accuracy?
   - Examples: A well with 95% of surveys validated = score 95
   - How it's displayed in the dashboard

**Catriona**:
1. **Create a "Hybrid-Cloud & OT Security" 1-pager**:
   - Diagram showing: Well site hardware → Our gateway (on-prem option) → Cloud storage (supermajor's region)
   - List of controls: TLS 1.3, AES-256, IP whitelisting, VPN, role-based access
   - Compliance certs (SOC 2, ISO 27001) – if we have them; if not, note that we'll pursue

2. **Compile a "Vendor Security Questionnaire" response doc**:
   - Many supermajors ask for penetration testing, business continuity plans, etc.
   - Even if we don't have all answers yet, show we're taking it seriously

#### Success Criteria
- [ ] Dashboard prototype/mock-up is intuitive and visually convincing
- [ ] DIS scoring algorithm is documented and defensible
- [ ] Security architecture diagram is clear and shows defense-in-depth
- [ ] All docs ready to present to supermajor (high production quality)
- [ ] Gus & Catriona have rehearsed their pitch (30 min)

---

### Workstream C: The "P&A Predictive Model" Deck (Supermajor P&A Briefing)
**Lead**: Izzy (Al-DS as co-lead for modeling)
**Objective**: Prepare a compelling deck on our predictive Pipes & Asperities (P&A) failure model—the "balance-sheet de-risking" tool the supermajor execs loved

#### Goal
Answer the supermajor CFO's question: **"Can you really reduce our P&A failures by 30%? How much is that worth?"**

The deck must show:
1. We can predict when casing/tubing will fail
2. The prediction is based on real cement/corrosion science + Bayesian methods
3. The business impact is quantifiable (reduced NPT, extended asset life)
4. The Digital Twin Asset Library is not generic—it's predictive and P&A-focused

#### Core Responsibilities (Izzy + Al-DS)

**Izzy (Lead)**:
- Create **visualizations of the FEA (Finite Element Analysis) and corrosion models**:
  - Example: A casing string showing thickness profile, corrosion zones, and predicted failure timeline
  - Show a "30-year forecast" for a well (normal wear → accelerated corrosion → predicted failure date)
  - Include real examples from published case studies (anonymized)
- Lead the writing of the **P&A Model Overview deck** (8-10 slides):
  1. The Business Problem (P&A failures cost $XXM/year for majors)
  2. Our Approach (cement science + corrosion modeling + Bayesian learning)
  3. Key Inputs (casing specs, wellhead geometry, fluids, temperature profiles)
  4. Key Outputs (failure probability timeline, intervention recommendations)
  5. Customer Impact (NPT avoided, asset life extended)
  6. Proof Points (case studies, backtesting accuracy)

**Al-DS (Modeling Lead)**:
- Document the **fusion of cement/corrosion science with Bayesian methods**:
  - What cement science tells us: Degradation rates, bond failure modes
  - What Bayesian methods add: Learning from historical failures, updating probabilities with new data
  - How they combine: Cement science sets the prior distribution; historical data tunes the likelihood; output is a posterior probability of failure
- Prepare a **"Technical Deep Dive" document** (for supermajor's engineers):
  - Math/algorithms (enough to show credibility, not so much it overwhelms)
  - Validation methodology: How did we test the model? Cross-validation, backtesting, comparison to legacy systems?
  - Data requirements: What well logs, casing records, failure history do we need?

#### Immediate Next Steps (Days 1-5)

**Izzy**:
1. **Build a visual "30-year P&A forecast" example**:
   - Use a real well trajectory (from literature, with permission, or anonymized from a published case)
   - Show casing specs, design life, predicted corrosion progression
   - Mark the "intervention window" (when a remedial action is recommended)
   - Example output: "This well will have a 15% risk of casing failure in year 12 unless cementing is refreshed."

2. **Draft the 8-10 slide P&A deck** (outline):
   - Title slide: "Predictive Pipes & Asperities: Balance-Sheet De-Risking Tool"
   - Business value: "Avoid $X of unexpected NPT / interventions per well"
   - Our model overview (1 slide)
   - Example forecast (3 slides with visualizations)
   - Validation & accuracy (1 slide)
   - Implementation (how a supermajor would use it)
   - Pricing/commercial (if asked)

**Al-DS**:
1. **Write the "Technical Deep Dive" document** (2-3 pages):
   - Cement science primer (what degrades, when, how fast)
   - Bayesian framework explanation (how we learn from data)
   - Algorithm pseudocode (show the logic flow, even if not full code)
   - Validation results: "Model achieved 92% accuracy on historical well data"

#### Success Criteria
- [ ] Forecast visualizations are compelling and easy to understand
- [ ] P&A deck tells a clear business story (problem → solution → impact)
- [ ] Technical deep dive is rigorous enough to satisfy supermajor's engineers
- [ ] Izzy has rehearsed her pitch (and can answer technical questions from Al-DS)
- [ ] All materials ready for presentation

---

### Workstream D: The "Operator Pilot" Scope (First Real Integration)
**Lead**: Finlay (Rocky as co-lead for API/integration)
**Objective**: Define the exact scope and readiness for a pilot integration with the operator's real systems

#### Goal
Answer the operator's question: **"Can you really integrate with our systems in 8 weeks?"**

This is the proof point. We must identify:
1. **One specific system** (e.g., WellPlan, Landmark, Aspen, Petronas iFlex)
2. **One well** (first subject for the pilot)
3. **One piece of functionality** (the "physical constraints" we can enforce)

The goal is to move from slides to **working software**.

#### Core Responsibilities (Finlay + Rocky)

**Finlay (Lead)**:
- Meet with the operator (likely during next meeting) to confirm:
  - Which system(s) they use (drilling planning, well design, operations)?
  - Which well would be a good pilot candidate?
  - What's the #1 pain point we should solve (schedule delays? cost overruns? safety violations)?
- Define the **Operator Pilot Scope Document**:
  - Well name, location, planned operations
  - System to integrate with (e.g., WellPlan APIs)
  - Data to be exchanged (well trajectory, casing design, drilling plan, real-time operations)
  - Constraints to be enforced (e.g., "Do not exceed 15 SPM pump rate", "Do not exceed wellhead pressure of 5,000 psi")
  - Success metrics (pilot integration complete in 8 weeks, zero safety incidents, schedule on track)

**Rocky (API Lead)**:
- **Audit the target system's APIs**:
  - If it's WellPlan, Landmark, etc., get access to their developer documentation
  - Identify endpoints for reading well plan, operations log, real-time parameters
  - Determine authentication method (OAuth, API key, custom)
  - Estimate integration effort (days, not months)
- **Design the "Physical Constraints Engine" interface**:
  - Input: Real-time operations data (pump rate, wellhead pressure, temperature)
  - Constraint rules: User-defined limits (e.g., "alert if SPM > 15", "prevent operation if pressure > 5,000 psi")
  - Output: Alert to operator's control system, or auto-throttle
  - This is the first piece of the API Layer; we're proving it works with one real client

#### Immediate Next Steps (Days 1-4)

**Finlay**:
1. **Schedule a call with the operator contact** (ASAP, within 24 hours):
   - Confirm which well they want to pilot
   - Confirm which system to integrate (get a demo account if possible)
   - Understand their timeline (when do they want the pilot live?)
   - Identify a technical liaison on their side

2. **Draft the "Operator Pilot Scope Document"** (5 pages):
   - Executive summary (what, who, why, when)
   - Well details (name, location, planned ops)
   - System to integrate (system name, version, API availability)
   - Data flow diagram (our system ↔ operator's system)
   - Constraints to enforce (list of 3-5 key physical limits)
   - Implementation timeline (8-week plan)
   - Success metrics and risks

**Rocky**:
1. **Get API access to the target system** (WellPlan, Landmark, etc.):
   - If it's a commercial system, request developer account / documentation
   - Create a simple test: Can we read a well plan from their API?
   - Document authentication requirements

2. **Sketch the "Physical Constraints Engine" architecture**:
   - Diagram: Operator's system → Our API → Constraint rules → Alert/throttle action
   - List the technical requirements (what do we need to build in 8 weeks?)
   - Identify dependencies (do they provide certain data? Do we need to build connectors?)

#### Success Criteria
- [ ] Operator has confirmed pilot well and system to integrate
- [ ] Pilot Scope Document is clear and signed off by operator
- [ ] Rocky has API access and has tested basic connectivity
- [ ] Physical Constraints Engine design is documented and feasible
- [ ] Implementation timeline is realistic (no surprises in week 1 of build)

---

## Part 3: Phase 1 Roadmap (Months 1-3)

Once we win the deals (end of P0), Phase 1 is the build-to-production sprint. These three deliverables directly correspond to the three client concerns.

---

### 1. Predictive P&A / Integrity Module
**Lead**: Izzy
**Duration**: Months 1-3 (after client signature)
**Team**: Izzy (product lead), Al-DS (data science), 1-2 backend developers

#### What It Is
The "balance-sheet de-risking tool" that executives loved at Aberdeen. A production-ready module that:
- Predicts casing/tubing failure risk over a 30-year well life
- Recommends optimal intervention timing
- Quantifies NPT/cost avoidance
- Integrates real well data (logs, casing records, operations)

#### Replaces/Combines (Feature Merging)
- ✅ **Digital Twin Asset Library** → Now reframed as a *predictive* library, not generic
- ✅ **Physical Constraints Engine** → Core algorithm (physics-based constraints on casing design, operations)
- ✅ **Izzy's new predictive models** → Bayesian P&A failure models

#### Business Goal
Close the supermajor by delivering production-ready software in Q1.

#### Definition of Done
- [ ] Model trained and validated on supermajor's well data
- [ ] Web UI for viewing forecasts (30-year timeline, intervention recommendations)
- [ ] API endpoints for integrating with supermajor's systems
- [ ] Documentation (user guide, API reference)
- [ ] Deployed to production (on supermajor's infrastructure or our cloud)

---

### 2. Trust & Ingestion Layer
**Lead**: Gus
**Duration**: Months 1-3 (parallel with P&A module)
**Team**: Gus (lead), Catriona (security/ops), 2 backend developers, 1 frontend developer

#### What It Is
The production-ready "Data Ingestion & Validation" dashboard and backend. A system that:
- Ingests real-time well data (WITSML, OPC UA, custom APIs)
- Validates data quality in real-time
- Stores clean, trusted data in a secure vault
- Displays data integrity metrics (the "DIS" score)
- Enforces Zero Trust security model

#### Replaces/Combines (Feature Merging)
- ✅ **Data Integrity Score (DIS)** → Core feature; no longer just a scoring metric, but the *system's heartbeat*
- ✅ **One-Way Data Ingestion Connector** → Now multi-directional, real-time
- ✅ **Real-Time Data Streaming Dashboard** → UI for monitoring data quality
- ✅ **Hybrid-Cloud & OT Security Model** → Deployed in production

#### Business Goal
Pass the supermajor's technical diligence and prove data security at scale.

#### Definition of Done
- [ ] Data connectors working (WITSML 2.0, OPC UA, REST APIs)
- [ ] Real-time validation engine (rules-based, ML-based anomaly detection)
- [ ] Dashboard UI (data quality metrics, alert log, data lineage)
- [ ] Security architecture deployed (Zero Trust, encryption, audit logging)
- [ ] SOC 2 Type II audit passed
- [ ] Integrated with P&A module (clean data feeds the predictions)

---

### 3. Pilot API Connector
**Lead**: Rocky
**Duration**: Months 1-3 (parallel with other two)
**Team**: Rocky (lead), 1 backend developer, 1 QA engineer

#### What It Is
The first *real, working* API integration to a client's production system (e.g., WellPlan, Landmark). A proof point that:
- We can read/write data to their systems
- We can enforce constraints in their workflows
- Integration happens in 8 weeks
- Quality is production-grade (no integration nightmares)

#### Replaces/Combines (Feature Merging)
- ✅ **API Documentation & Developer Portal** → We're building *one good integration first*, not a whole portal yet
- ✅ **Physical Constraints Engine** → Deployed in production as the first "rule" in their WellPlan workflow
- ✅ **First real API Layer** → Not generic; built for the operator's specific system

#### Business Goal
Close the operator by delivering a working, integrated pilot.

#### Definition of Done
- [ ] WellPlan integration (read well plans, write operations logs, enforce constraints)
- [ ] Physical Constraints Engine live (alerts operator if pump rate exceeds limit)
- [ ] Integration tested on real well data
- [ ] Operator can self-serve (no handholding needed)
- [ ] Support playbook written (escalation procedures, troubleshooting)
- [ ] Ready for long-term production deployment

---

## Part 4: Feature Merging - How Old Features Become New Deliverables

This is the critical mapping. We're not discarding the old roadmap; we're **recontextualizing** it for client needs.

### Old Feature → New Deliverable Mapping

| **Old Feature** (4-Phase Roadmap) | **Category** | **New Context** | **Integration** |
|---|---|---|---|
| Data Integrity Score (DIS) | Foundation | "Proof of trust" for supermajor | → Trust & Ingestion Layer |
| Digital Twin Asset Library | Intelligence | Predictive, not generic | → Predictive P&A Module |
| Physical Constraints Engine | Expansion | First operational constraint system | → Pilot API Connector |
| One-Way Data Ingestion | Foundation | Real-time, bidirectional | → Trust & Ingestion Layer |
| Real-Time Data Streaming Dashboard | Real-Time Ops | Data quality dashboard | → Trust & Ingestion Layer |
| Hybrid-Cloud & OT Security | Foundation | Zero Trust architecture | → Trust & Ingestion Layer |
| API Documentation & Developer Portal | Foundation | One good connector first | → Pilot API Connector |
| AI Co-Pilot | Intelligence | **DEPRIORITIZED** → Phase 3 |  |
| Predictive Maintenance (PdM) | Expansion | **DEPRIORITIZED** → Phase 2 |  |
| AI Vendor Recommender | Expansion | **DEPRIORITIZED** → Phase 3 (lowest priority) |  |

### Why We Merged Them

**Old Plan Mentality**: "Let's build 10 features for a generic market."

**New Plan Mentality**: "Let's build 3 killer features for 3 specific clients."

By merging the old features into the new deliverables, we:
1. **Avoid bloat**: Instead of 10 half-baked features, we have 3 fully-baked ones
2. **Align with clients**: Each module directly answers a client concern
3. **Increase velocity**: We're not context-switching between 10 projects
4. **Improve quality**: The supermajor will get a product designed for them, not a generic one

---

## Part 5: Team Structure & Responsibilities

### P0 Workstream Leads (Next 2 Weeks)

| **Workstream** | **Lead** | **Co-Lead** | **Support** | **Goal** |
|---|---|---|---|---|
| A: Data Room | Midas | — | Finance, Legal | Investment readiness |
| B: Digital Fortress | Gus | Catriona | Al-CTO (tech advice) | Supermajor technical proof |
| C: P&A Model | Izzy | Al-DS | — | Supermajor CFO proof |
| D: Operator Pilot | Finlay | Rocky | — | Operator integration proof |

### Phase 1 Deliverable Leads (Months 1-3)

| **Deliverable** | **Lead** | **Team Size** | **Key Collaborators** |
|---|---|---|---|
| Predictive P&A Module | Izzy | 4 (Izzy, Al-DS, 2 backend devs) | Supermajor's engineers (feedback) |
| Trust & Ingestion Layer | Gus | 5 (Gus, Catriona, 2 backend, 1 frontend) | Supermajor's IT/security team |
| Pilot API Connector | Rocky | 3 (Rocky, 1 backend, 1 QA) | Operator's IT team |

### Parallel Business Workstream

**Lead**: Midas
**Task**: Develop "AI-Ready Commercial Frameworks"
**Urgency**: ASAP (before investor/supermajor asks)

**Key Questions to Answer**:
1. **SLA for Recommendations**: "We predict a 15% failure risk—what's our SLA if we're wrong?"
2. **Liability Model**: Who bears the risk if our model misses a failure?
3. **Pricing Model**: Is this a per-well fee? Per-risk-mitigated? Value-based?
4. **Insurance**: Do we need error & omissions insurance? Have we budgeted for it?

These are not technical questions—they're commercial and legal. Midas needs to answer them *before* the investors or supermajor ask.

---

## Part 6: Immediate Next Steps (Action Checklist)

### By End of Day 1 (Midas, Gus, Izzy, Finlay)

- [ ] **Midas**: Send calendar invite for data room kickoff (with investment contact)
- [ ] **Gus**: Schedule 1-on-1 with Catriona to kick off Digital Fortress deck
- [ ] **Izzy**: Schedule 1-on-1 with Al-DS to kick off P&A deep dive
- [ ] **Finlay**: Send calendar invite for operator call (confirm pilot well / system)

### By End of Day 2 (All Leads)

- [ ] **Midas**: Create shared folder structure for data room; draft folder `README`
- [ ] **Gus**: Draft outline for "Data Ingestion & Validation" dashboard mock-up
- [ ] **Izzy**: Identify 1-2 published case studies on P&A/casing failures (for examples)
- [ ] **Finlay**: Confirm which system the operator uses; request API documentation

### By End of Day 3 (Gus, Izzy, Rocky)

- [ ] **Gus**: Confirm supermajor's security requirements (data residency, compliance)
- [ ] **Izzy**: Sketch the "30-year forecast" visualization (even as a rough drawing)
- [ ] **Rocky**: Get access to the target system (WellPlan, Landmark, etc.); test API connectivity

### By End of Week 1

- [ ] **Midas**: Data room structure complete; begin filling in financial models
- [ ] **Gus**: Digital Fortress deck outline complete; start building dashboard mock-up
- [ ] **Izzy**: P&A deck outline complete; draft technical deep dive document
- [ ] **Finlay**: Operator pilot scope document drafted; Rocky has tested API integration

### By End of Week 2 (Ready for Client Meetings)

- [ ] **Midas**: Data room ready for investor review
- [ ] **Gus & Catriona**: Digital Fortress deck complete; ready to present to supermajor
- [ ] **Izzy & Al-DS**: P&A deck complete; ready to present to supermajor CFO
- [ ] **Finlay & Rocky**: Operator Pilot Scope signed by operator; integration roadmap clear

---

## Part 7: Success Metrics (Next 30 Days)

### Deal Closure
- [ ] **Investment**: Term sheet signed with strategic investor
- [ ] **Supermajor**: Statement of Work signed for Phase 1 implementation
- [ ] **Operator**: Pilot agreement signed; integration starts Week 1 of Phase 1

### Product Readiness
- [ ] All P0 deliverables are professional, polished, and ready for board-level presentations
- [ ] No surprises in Week 1 of Phase 1 (we've done our homework)

### Team Alignment
- [ ] All 4 workstream leads are clear on their objectives
- [ ] Cross-team dependencies are mapped (e.g., P&A module needs clean data from Gus's team)
- [ ] Weekly sync meetings scheduled for Phase 1 kickoff

---

## Part 8: FAQ & Clarifications

### Q: Why did we abandon the 4-phase roadmap?
**A**: The 4-phase roadmap was built on **internal assumptions** about what the market wanted. Aberdeen showed us what three high-value buyers *actually* need. We pivoted to focus on them.

### Q: What happens to the features in the old roadmap (AI Co-Pilot, PdM, etc.)?
**A**: They're not abandoned—they're **deprioritized**. If we land all three clients by end of Q1, we can revisit them in Phase 2-3. But right now, Phases 1-3 focus on the three core deliverables that close deals.

### Q: Is this "all hands on deck" for the full 2 weeks?
**A**: Yes. Every engineering, product, and business resource is allocated to P0. If you have other projects, pause them. This is existential.

### Q: What if we don't close all three deals?
**A**: Even closing **one** supermajor is a massive win. The roadmap assumes we close all three; if not, we adjust post-mortems and Phase 1 timelines.

### Q: Who is the backup if a workstream lead gets sick?
**A**:
- **Midas** (Data Room) → Al-CTO can step in
- **Gus** (Digital Fortress) → Catriona can take over; Gus does modeling
- **Izzy** (P&A Model) → Al-DS can lead; Izzy supports
- **Finlay** (Operator Pilot) → Rocky can take over; Finlay does UX/demo

### Q: What's the budget for P0?
**A**: Minimal new spending. We're using internal resources, not hiring or buying tools. Only spend money if it's critical to winning a deal (e.g., professional video for a demo).

---

## Part 9: Communication & Escalation

### Daily Standups
- **When**: 9 AM UK time (or agreed time with all 4 leads)
- **Duration**: 15 minutes (max)
- **Agenda**: Blockers, asks, progress update
- **Attendees**: Midas, Gus, Izzy, Finlay, + any required support

### Weekly Sync with Executive Team
- **When**: Friday 5 PM UK time
- **Duration**: 30 minutes
- **Agenda**: Wins, risks, investor/client communication
- **Attendees**: All leads + CEO/CTO

### Escalation Path
- **Blocker**: Immediate Slack message to relevant lead + CEO
- **Decision needed**: Friday sync or ad-hoc call
- **Client issue**: Direct call with workstream lead + client contact within 2 hours

---

## Part 10: Risk Mitigation

| **Risk** | **Likelihood** | **Impact** | **Mitigation** |
|---|---|---|---|
| Operator delays API access | Medium | High | Finlay reaches out Day 1; have backup plan to use test data |
| Supermajor changes security requirements | Medium | Medium | Gus includes "Security Requirements Checklist" in scope doc; get sign-off early |
| P&A model validation takes longer than expected | Low | High | Al-DS starts validation immediately; identify edge cases early |
| Team burnout from 2-week sprint | Medium | Medium | Clear scope boundaries; no scope creep; celebrate wins daily |
| Investor loses interest | Low | Critical | Midas maintains weekly comms; be responsive to requests |

---

## Conclusion

The Aberdeen oil show validated our core technology and business model. Now we must **prove it** to three specific, high-value clients.

**P0 (Next 2 Weeks)**: Prepare the assets (data room, decks, pilot scope)
**Phase 1 (Months 1-3)**: Build production-ready software and close deals
**Phase 2-3 (Months 4-12)**: Scale the platform and expand features

**This plan is our single source of truth. Align all work to these priorities immediately.**

---

**Document Version**: 1.0
**Last Updated**: November 9, 2025
**Owner**: Midas (with support from Gus, Izzy, Finlay)
**Status**: ACTIVE - Team Execution Plan
**Next Review**: End of Week 1 (November 14, 2025)
