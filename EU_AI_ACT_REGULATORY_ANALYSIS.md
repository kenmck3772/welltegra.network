# EU AI ACT & NSTA REGULATORY ANALYSIS
**WellTegra Sovereign Auditor - Forensic Data Governance for North Sea Operations**

---

## EXECUTIVE SUMMARY

This document provides a factual analysis of the intersection between the **EU Artificial Intelligence Act** (EU AI Act) and **UK North Sea Transition Authority (NSTA)** regulatory requirements for well integrity data governance in the North Sea energy sector (2026-2030).

**Analysis Date:** January 27, 2026
**Regulatory Framework:** EU AI Act (in force August 1, 2024; full compliance required August 2, 2026)
**Enforcement Context:** NSTA January 2026 enforcement actions (£350,000 in fines)
**Scope:** Data governance requirements for high-risk AI systems in critical infrastructure

---

## 1. EU AI ACT: CRITICAL INFRASTRUCTURE CLASSIFICATION

### 1.1 Legal Framework

The EU AI Act entered into force on **August 1, 2024**, with full compliance required by **August 2, 2026** for high-risk AI systems.

**Annex III, Point 2** explicitly classifies as high-risk:

> "AI systems intended to be used as **safety components** in the management and operation of critical digital infrastructure, road traffic, or in the supply of **water, gas, heating or electricity**."

### 1.2 Applicability to North Sea Operations

**Gas Supply Operations:** The EU AI Act explicitly mentions gas supply infrastructure. North Sea gas operations fall within this critical infrastructure classification when AI systems are deployed as safety components.

**Well Integrity as Safety Component:** Well integrity management systems that prevent blowouts, uncontrolled releases, or environmental contamination constitute safety components under this definition.

**Important Qualification:** Not all AI systems in the energy sector are automatically high-risk. The classification applies specifically to AI systems that:
- Function as safety components
- Whose failure could materially influence health, safety, or fundamental rights outcomes
- Operate within critical infrastructure management

### 1.3 Penalties for Non-Compliance

**Article 99 - Penalties:**
- Violations of data governance requirements (Article 10): **Up to €20 million or 4% of worldwide turnover**, whichever is higher
- Violations of human oversight requirements (Article 14): **Up to €20 million or 4% of worldwide turnover**, whichever is higher

---

## 2. ARTICLE 10: DATA GOVERNANCE REQUIREMENTS

### 2.1 Legal Text (Official Requirements)

**Article 10(3) - Training, Validation and Testing Data Sets:**

> "Training, validation and testing data sets shall be **relevant**, **sufficiently representative**, and **to the best extent possible, free of errors** and complete in view of the intended purpose..."

> "Data sets shall take into account **the characteristics or elements that are particular to the specific geographical, contextual, behavioural or functional setting** within which the high-risk AI system is intended to be used."

### 2.2 Operational Translation for Well Data

For AI systems analyzing North Sea well integrity data, Article 10 mandates:

1. **Relevance:** Data must pertain to the specific wellbore physics, geological formations, and operational history relevant to the intended analysis

2. **Representative:** Datasets must reflect:
   - Geographical variations (Central North Sea vs. West of Shetland)
   - Temporal evolution (1970s drilling practices vs. modern standards)
   - Multi-operator provenance (ownership changes, varying data quality standards)

3. **Free of Errors:** Data must undergo quality assurance to detect and correct:
   - Datum conversion errors (Kelly Bushing → Ground Level)
   - Unit conversion errors (feet → meters, imperial → metric)
   - Transcription errors from paper → digital migration
   - Database corruption during system migrations

4. **Complete:** Datasets must include all relevant parameters for wellbore integrity assessment (depths, pressures, temperatures, cement volumes, casing specifications)

### 2.3 The "Migration Decay" Challenge

**Definition:** Migration Decay refers to cumulative data corruption that occurs during multi-generational database migrations:
- Paper drilling logs (1970s-1980s)
- Microfiche archives (1980s-1990s)
- Early SQL databases (1990s-2000s)
- PDF digitization (2000s-2010s)
- National Data Repository (NDR) consolidation (2010s-present)

**Technical Impact:** Each migration introduces potential for:
- Loss of metadata (datum reference, coordinate systems, measurement units)
- Transcription errors (manual data entry, OCR misreads)
- Schema mapping errors (misaligned column definitions between database versions)
- Orphaned records (broken foreign key relationships during migration)

**Regulatory Significance:** Article 10 compliance requires operators to demonstrate that their AI training datasets have been validated against original source documents to eliminate Migration Decay artifacts.

---

## 3. ARTICLE 14: HUMAN OVERSIGHT REQUIREMENTS

### 3.1 Legal Text (Official Requirements)

**Article 14(1) - Design for Oversight:**

> "High-risk AI systems shall be designed and developed in such a way, including with appropriate human-machine interface tools, that they can be **effectively overseen by natural persons** during the period in which the AI system is in use."

**Article 14(4) - Oversight Capabilities:**

Natural persons assigned to human oversight must be enabled to:

1. **"Properly understand the relevant capacities and limitations of the high-risk AI system** and monitor its operation, including in detecting and addressing anomalies, dysfunctions and unexpected performance"

2. **"Remain aware of the possible tendency of automatically relying or over-relying** on the output produced by a high-risk AI system (automation bias)"

3. **"Correctly interpret the high-risk AI system's output**, taking into account the interpretation tools and methods available"

4. **"Decide not to use the system or disregard its output** when appropriate"

### 3.2 Complementary Requirements

**Article 26(2) - Deployer Obligations:**

> Deployers must assign "**qualified personnel** with appropriate authority, competence, and support."

### 3.3 The "Suitably Qualified" Standard

**Key Question:** What constitutes "appropriate competence" for overseeing AI systems analyzing 50+ years of North Sea wellbore data?

**Technical Complexity Factors:**
- Understanding of subsurface thermodynamics
- Familiarity with evolving drilling practices (1970s-present)
- Knowledge of multi-operator asset transfer histories
- Ability to detect physically impossible AI predictions (e.g., negative pressures, thermodynamic violations)
- Recognition of datum reference frame differences across decades

**Industry Context:** For forensic well data validation, the human oversight role requires:
- **Domain Knowledge:** Deep understanding of North Sea geology, drilling engineering, and well completion practices
- **Historical Memory:** Awareness of how data quality standards have evolved across multiple operator transitions
- **Physical Validation:** Ability to apply thermodynamic consistency checks to AI-generated predictions
- **Regulatory Fluency:** Knowledge of NSTA consent requirements and WIOS data governance standards

**The Seniority Argument:** Article 14 does not specify minimum years of experience, but the requirement to "properly understand capacities and limitations" and "detect anomalies" strongly implies that human overseers must possess sufficient domain expertise to challenge AI outputs when they conflict with physical reality or historical operational knowledge.

---

## 4. NSTA ENFORCEMENT LANDSCAPE (2025-2026)

### 4.1 January 2026 Enforcement Actions

**Source:** NSTA public enforcement announcements, January 2026

**Total Fines Issued:** £350,000 across two operators

**Case 1: CNR International (£250,000)**
- **Violation:** Exceeded venting emissions limits twice on Ninian assets
- **Timeline:** Initial breach March 2023 (discovered November 2023 via NSTA notification), second breach within 3 weeks of receiving corrective consent
- **Regulatory Finding:** "Lack of familiarity with obligations contributed to shortcomings"

**Case 2: NEO (£100,000)**
- **Violation:** Attempted to fully abandon Leverett well without required decommissioning consent
- **Timeline:** March 2024 unauthorized abandonment attempt
- **Outcome:** Abandonment work failed and required repetition
- **Regulatory Finding:** "Lack of familiarity with obligations contributed to shortcomings"

### 4.2 Regulatory Implications

**Enforcement Posture:** The NSTA is taking an increasingly firm stance on compliance breaches, as evidenced by:
- Willingness to issue six-figure fines
- Public naming of non-compliant operators
- Emphasis on "familiarity with obligations" as a core compliance requirement

**Relevance to Data Governance:** Both enforcement cases cited "lack of familiarity with obligations." For AI-driven well data systems, this precedent suggests that operators must demonstrate:
- Understanding of their WIOS data governance obligations
- Processes to ensure data quality meets regulatory consent requirements
- Human oversight by personnel with sufficient competence to prevent compliance failures

---

## 5. NSTA DECOMMISSIONING DEFICIT TABLE

### 5.1 December 2025 Publication

**Source:** NSTA "New decom table highlights named operators' performance" (December 2025)

**Key Statistics:**
- **13 operators** publicly named for falling behind decommissioning obligations
- **153 inactive wells** currently out of regulatory consent
- **Geographic distribution:** West of Shetland to Southern North Sea and East Irish Sea (greatest concentration in Central North Sea)

**Definition - Wells Out of Consent:**
An inactive well is classified as out of consent if:
1. The operator has not applied for decommissioning consent, OR
2. Consent was granted but the operator failed to complete decommissioning within the consented timeframe

### 5.2 Identified Operators

**Worst-Performing Operators (Wells Out of Consent):**
- **CNOOC:** 17 of 19 wells out of consent (89% non-compliance rate)
- **Serica Energy:** 2 of 2 wells out of consent (100% non-compliance rate)
- **Ithaca Energy:** 13 of 20 wells out of consent (65% non-compliance rate)
- **EnQuest:** 36 of 124 wells out of consent (29% non-compliance rate)

### 5.3 Future Decommissioning Pressure

**Projected Well Backlog:**
- Current backlog: 500+ wells past decommissioning deadline
- Additional wells due 2026-2030: 1,000+ wells expected
- Total 2026-2030 decommissioning demand: 1,500+ wells requiring consent applications

**Data Governance Challenge:** Each decommissioning consent application requires submission of well data demonstrating safe abandonment design. For operators with wells out of consent, a critical question arises: **Is their non-compliance due to operational delays or due to data quality deficiencies preventing consent application?**

---

## 6. WIOS 2026: "SUITABLY QUALIFIED" MANDATE

### 6.1 Well and Installation Operator Service (WIOS)

**Status:** Fully operational on NSTA Energy Portal (Phase 2 implemented October-November 2024)

**Purpose:** WIOS serves as the mandatory digital system of record for all well and installation operator appointments on the UK Continental Shelf.

### 6.2 Qualification Requirements

**NSTA Guidance Extract:**

> "WIOS will reduce the administrative burden on both licensees and regulatory bodies, while significantly improving confidence that **well and installation operators are suitably qualified and properly appointed**."

> "The potential operator must convince the NSTA that it has a **suitably qualified management team** and an appropriate organisation in terms of structure and skills to plan and conduct exploration activities."

**Regulatory Authority:**

> "The NSTA has the power to **revoke operator approval** where the entity no longer has the competence or capacity to meet the requirements for the operations in respect of which it was appointed."

### 6.3 Implications for AI-Driven Data Systems

**Open Question:** If WIOS mandates "suitably qualified" personnel for well operations, does this requirement extend to personnel responsible for validating AI-generated well data used in regulatory consent applications?

**Parallel to EU AI Act Article 14:** Both WIOS and the EU AI Act emphasize competence and qualification of human decision-makers. For AI systems generating well integrity assessments submitted to the NSTA, the logical interpretation is that human oversight must be performed by individuals with demonstrable North Sea operational expertise.

---

## 7. FORENSIC DATA INTEGRITY: THE "GHOST WELL" PROBLEM

### 7.1 Definition

**"Ghost Wells"** are wells that exist in physical reality (drilled, completed, and potentially still pressured) but have fallen out of accurate digital representation due to:
- Incomplete migration from paper archives to digital databases
- Orphaned records during operator asset transfers
- Status misclassification (e.g., "Shut-In" vs. "Suspended" vs. "Abandoned")
- Missing or corrupted location coordinates

### 7.2 Regulatory Status Classifications

**NSTA Well Status Categories:**
1. **Active (Producing):** Currently producing hydrocarbons
2. **Shut-In:** Temporarily closed but retaining production equipment, capable of restart
3. **Suspended:** Long-term closure with wellhead intact, requires periodic integrity monitoring
4. **Plugged & Abandoned (P&A):** Permanently sealed with cement plugs, no further production possible

**Critical Distinction:** Shut-In and Suspended wells are legally **"alive"** - they remain subject to integrity monitoring requirements and environmental regulations. A well incorrectly classified as "Abandoned" in digital records but physically Suspended represents a compliance liability.

### 7.3 The "Unseen Data" Challenge

**Legacy Data Sources Often Missing from Modern Digital Systems:**
- Hand-signed drilling daily reports (paper archives, not digitized)
- Original completion diagrams (engineering drawings on microfiche)
- OSPAR (Oslo-Paris Convention) environmental filings (separate regulatory submission system)
- Historical operator correspondence with NSTA (PDF archives, not searchable)
- Asset transfer documentation (operator change-of-ownership records)

**Forensic Discovery Requirement:** To achieve EU AI Act Article 10 compliance ("relevant, representative, free of errors"), operators must demonstrate that AI training datasets incorporate these legacy sources, not just current digital databases.

---

## 8. DATA GOVERNANCE FRAMEWORK FOR EU AI ACT COMPLIANCE

### 8.1 Minimum Requirements for High-Risk AI in Well Integrity

Based on Articles 10 and 14, operators deploying AI systems for well integrity assessment must demonstrate:

**1. Data Provenance Traceability (Article 10 - Relevance)**
- Documented lineage from original drilling logs to current digital records
- Identification of all database migration events with validation checkpoints
- Source document hash verification (cryptographic integrity)

**2. Geographical & Temporal Representativeness (Article 10 - Representative)**
- Dataset coverage across all fields under operator control
- Inclusion of multi-decade operational history (not just recent data)
- Representation of multiple drilling contractors and completion practices

**3. Error Detection & Correction (Article 10 - Free of Errors)**
- Systematic datum reference validation (KB vs. GL vs. MSL)
- Unit consistency checks (imperial vs. metric)
- Thermodynamic consistency validation (pressure-temperature profiles must obey physical laws)
- Cross-field correlation (shared geological markers must align across wells)

**4. Completeness Assurance (Article 10 - Complete)**
- Mandatory parameters checklist for each well (depths, pressures, temperatures, casing, cement)
- Gap analysis for missing records with justification
- Integration of legacy paper/PDF sources not present in digital databases

**5. Human Oversight Competence (Article 14 - Qualified Personnel)**
- Documented qualifications of AI system overseers (engineering credentials, years of experience, field-specific knowledge)
- Decision protocols for when to override AI outputs
- Automation bias mitigation training

**6. Audit Trail (Cross-Cutting Requirement)**
- Timestamped record of all AI-generated predictions
- Human oversight approval/rejection decisions
- Justification for modifications to AI outputs before regulatory submission

### 8.2 Validation Against Physical Reality

**Physics-Based Constraints:** To satisfy Article 10's requirement for data "free of errors," AI systems must enforce:
- **Thermodynamic Consistency:** Pressure-temperature relationships must follow regional gradient curves
- **Stratigraphic Coherence:** Geological formation tops must correlate across adjacent wells
- **Mechanical Feasibility:** Casing collapse/burst ratings must align with reported pressures
- **Conservation Laws:** Mass balance for cement volumes, fluid displacement during completion

**SME Validation Role:** These physical constraints require domain expertise to validate. A person without North Sea engineering experience cannot determine whether an AI-predicted depth of 8,247 ft KB is thermodynamically consistent with regional pressure gradients.

---

## 9. THE SENIORITY ARGUMENT: WHY 30-YEAR SME OVERSIGHT MATTERS

### 9.1 Article 14 Competence Requirements (Restated)

Human overseers must be able to:
- **"Properly understand relevant capacities and limitations"** of the AI system
- **"Detect and address anomalies, dysfunctions and unexpected performance"**
- **"Correctly interpret the AI system's output"**

### 9.2 Why Seniority Correlates with Competence (In This Domain)

**1. Historical Context Awareness**
- Understanding how data quality standards evolved from 1970s paper logs to modern WITSML formats
- Knowledge of which operators had rigorous QA/QC processes vs. minimal documentation
- Recognition of common systematic errors introduced during specific database migration events

**2. Physical Validation Capability**
- Ability to detect thermodynamically impossible predictions (negative downhole pressures, temperature inversions without geological justification)
- Recognition of physically implausible completion designs (cement volumes inconsistent with annular geometry)
- Cross-field correlation expertise (knowing which wells share reservoirs and must have consistent pressure regimes)

**3. Regulatory Institutional Knowledge**
- Understanding how NSTA consent requirements have changed over decades
- Awareness of which legacy data elements are mandatory vs. optional for modern compliance
- Recognition of documentation gaps that prevent consent approval

**4. Automation Bias Resistance**
- Seniority correlates with confidence to override AI predictions when they conflict with lived operational experience
- Junior personnel may defer to AI outputs even when physically questionable (Article 14's "automation bias" concern)

**5. Multi-Operator Asset Transfer Memory**
- Knowledge of when specific fields changed ownership and which data elements were/were not transferred
- Recognition of naming convention changes (well identifier schemes differ between operators)

### 9.3 The Irreplaceability of "Witnessed Memory"

**Definition:** Witnessed Memory = firsthand operational experience across the specific assets being analyzed

**Relevance to Article 14:** An AI system analyzing 442 wells across 11 North Sea fields spanning 1972-2026 requires human oversight by someone with:
- Direct experience working on those specific fields (or comparable North Sea assets)
- Understanding of the geological, engineering, and regulatory context particular to that region
- Ability to recognize field-specific anomalies that would be invisible to someone trained on generic oil & gas data

**This is not credentialism.** Article 14's requirement to "properly understand capacities and limitations" and "detect anomalies" is a functional competence requirement. For subsurface forensic data validation, that functional competence strongly correlates with years of field-specific operational experience.

---

## 10. REGULATORY CONVERGENCE: EU AI ACT + NSTA WIOS

### 10.1 Alignment of Standards

**EU AI Act Article 10 (Data Governance):**
- Relevant, representative, free of errors

**NSTA WIOS (Well Operator Qualification):**
- Suitably qualified personnel
- Appropriate organizational structure and skills

**Convergent Requirement:** Both frameworks mandate that data and decisions be overseen by qualified, competent personnel with domain expertise.

### 10.2 The Compliance Imperative

**For operators deploying AI systems for well integrity assessment and decommissioning consent applications:**

1. **EU AI Act Compliance (by August 2, 2026):**
   - Demonstrate that AI training datasets meet Article 10 quality standards
   - Assign Article 14-compliant human oversight personnel
   - Document data governance processes
   - Prepare for conformity assessment procedures

2. **NSTA WIOS Compliance (ongoing):**
   - Maintain WIOS operator appointments
   - Demonstrate "suitably qualified" management and technical teams
   - Submit consent applications with defensible well data

3. **NSTA Enforcement Risk Mitigation:**
   - Avoid the "lack of familiarity with obligations" finding that led to £350,000 in fines (CNR/NEO)
   - Address wells currently out of consent (153 wells across 13 operators)
   - Prepare for 1,000+ additional wells due for decommissioning 2026-2030

### 10.3 The Data Defensibility Standard

**Emerging Regulatory Threshold:** For AI-generated well data submitted to the NSTA in support of decommissioning consents:
- **Legally defensible** = Can withstand NSTA technical review + potential HMRC EPL tax relief audit
- **Technically defensible** = Validated against original source documents, thermodynamically consistent, overseen by qualified SME
- **Cryptographically defensible** = Tamper-evident audit trail (e.g., GPG signatures, blockchain provenance - optional but emerging best practice)

---

## 11. INDUSTRY IMPLICATIONS & OPEN QUESTIONS

### 11.1 Does the EU AI Act Apply to UK North Sea Operations Post-Brexit?

**Territorial Scope:** The EU AI Act applies to:
- AI systems placed on the EU market
- AI systems whose output is used within the EU

**UK Regulatory Independence:** The UK is not bound by the EU AI Act post-Brexit. However:
- UK operators with EU assets must comply
- UK operators exporting AI-generated data to EU entities may trigger compliance
- UK regulatory convergence is possible (UK government has indicated interest in AI safety standards aligned with EU)

**Precautionary Principle:** Even for purely UK North Sea operations, adopting EU AI Act standards represents emerging best practice for high-risk AI in critical infrastructure.

### 11.2 What Happens to Operators with Deficient Data?

**Scenario:** An operator with wells in the NSTA 153-wells deficit table attempts to submit decommissioning consents using AI-generated well data, but cannot demonstrate Article 10 compliance (data provenance unknown, migration decay uncorrected, no SME validation).

**Potential Outcomes:**
1. **NSTA Consent Rejection:** Application denied due to insufficient data quality
2. **Enforcement Action:** Fines for continued non-compliance (precedent: CNR £250K, NEO £100K)
3. **HMRC EPL Tax Relief Denial:** Energy Profits Levy tax relief for decommissioning costs requires defensible data (£1.58B at stake across Perfect 11 assets - see NSTA_Brief.md)
4. **Operator Approval Revocation:** NSTA has authority to revoke WIOS operator status if competence/capacity is questioned

### 11.3 Can Automated Regulator Tools Substitute for SME Oversight?

**Hypothesis:** Could the NSTA develop its own AI system to validate operator-submitted well data, eliminating the need for SME-level human oversight?

**Article 14 Analysis:** Even if the NSTA deployed AI validation tools, the EU AI Act would classify such a system as high-risk (critical infrastructure safety component), thus requiring:
- Article 10-compliant training data (same challenges as operator-side AI)
- Article 14-compliant human oversight (NSTA technical reviewers must have competence to override AI)

**Conclusion:** AI can augment but cannot replace SME oversight. Both operator-side and regulator-side AI systems require human validation by domain experts.

---

## 12. CONCLUSION: THE FACTUAL REGULATORY LANDSCAPE

### 12.1 Verified Facts (As of January 27, 2026)

1. **EU AI Act is in force** (August 1, 2024) with full compliance required by August 2, 2026
2. **Gas supply infrastructure AI systems** are explicitly classified as high-risk (Annex III, Point 2)
3. **Article 10 mandates** data that is relevant, representative, and free of errors
4. **Article 14 mandates** human oversight by qualified personnel with domain competence
5. **Penalties for non-compliance:** Up to €20M or 4% of worldwide turnover
6. **NSTA enforcement is intensifying:** £350,000 in fines issued January 2026
7. **153 wells are currently out of consent** across 13 named operators
8. **1,000+ additional wells** will require decommissioning consents 2026-2030
9. **WIOS mandates "suitably qualified" personnel** for well operations
10. **"Lack of familiarity with obligations"** has been cited as a cause for enforcement actions

### 12.2 Logical Inferences (Not Legal Conclusions)

- Operators with AI-driven well data systems face convergent compliance requirements from EU AI Act and NSTA WIOS
- Data quality deficiencies (Migration Decay, missing provenance) pose regulatory risk
- Human oversight personnel for high-risk AI must possess domain expertise sufficient to detect anomalies
- Senior Subject Matter Experts (30+ years North Sea experience) likely represent the most defensible approach to satisfying Article 14's "suitably qualified" standard
- Operators in the NSTA deficit table face time pressure to submit consents, potentially creating incentive to use AI for acceleration - but must ensure compliance with data governance standards

### 12.3 What This Analysis Does NOT Claim

- **NOT Legal Advice:** This document does not constitute legal counsel. Operators should consult qualified solicitors specializing in EU AI Act and UK energy regulation.
- **NOT Endorsement of Specific Solutions:** This analysis describes regulatory requirements without prescribing specific vendor products or services.
- **NOT Definitive Interpretation:** The EU AI Act is subject to ongoing guidance from the European Commission and national competent authorities. Interpretations may evolve.

---

## 13. REFERENCES

### EU AI Act Sources
- **EU Artificial Intelligence Act:** Regulation (EU) 2024/1689, Official Journal of the European Union
- **Article 10:** Data and data governance
- **Article 14:** Human oversight
- **Annex III:** High-Risk AI Systems (Critical Infrastructure)

### NSTA Sources
- **NSTA Enforcement Announcement (January 2026):** "NSTA issues fines to two companies totalling £350,000"
- **NSTA Deficit Table (December 2025):** "New decom table highlights named operators' performance"
- **WIOS External User Guidance:** Well and Installation Operator Service documentation
- **Well Consents Guidance:** Section 7 - Decommissioning & Abandonment Consents

### Industry Sources
- **Energy Voice:** "Neo Next and CNR hit with NSTA fines worth £350,000" (January 15, 2026)
- **Offshore Energy:** "13 UK operators fall behind on their decom duty with 153 wells in arrears"
- **OE Digital:** "NSTA Fines Two North Sea Operators for Emissions, Decom Breaches"

### WellTegra Internal Documentation
- **NSTA_Brief.md:** WIOS 2026 Compliance Brief
- **SOVEREIGN_CONTEXT.md:** Sovereign Industrial AI Workstation Context

---

## DOCUMENT VERSION CONTROL

**Version:** 1.0
**Date:** January 27, 2026
**Author:** WellTegra Sovereign Auditor Analysis
**Review Status:** Factual regulatory research - NOT legal advice
**Next Review:** Post EU AI Act full compliance deadline (August 3, 2026)

---

**The North Sea has a Truth Problem. This analysis describes the regulatory framework for solving it.**
