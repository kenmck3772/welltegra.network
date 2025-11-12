# P&A Strategic Pivot - UI/UX Design Document

**Date:** 12 November 2025
**Strategic Focus:** Plug & Abandonment (P&A) and Decommissioning
**Document Owner:** Brahan Engine Development Team

---

## 1. EXECUTIVE SUMMARY

This document outlines the UI/UX redesign of the Well-Tegra platform to prioritize **Plug & Abandonment (P&A) and Decommissioning** workflows. The refactor positions Well-Tegra as the "single source of truth" for managing the multi-trillion dollar liability of aging oil & gas assets.

### Key Insight
The Brahan Engine's unique value proposition: **Cross-referencing production-intervention data to find novel, cost-saving solutions for abandonment operations.**

**Example:** Well 666 "The Perfect Storm" - Hybrid P&A plan combining lessons from "The Brahan Squeeze" (intervention) and "The Scale Trap" (production) achieves **$1.5M cost savings** vs. conventional milling approach.

---

## 2. NEW INTERVENTION OBJECTIVE PAGE DESIGN

### 2.1 User Journey Changes

**OLD USER JOURNEY (Production-Focused):**
1. User selects well with production issues
2. System presents 5 production-restoration objectives
3. Brahan Engine recommends intervention to restore production

**NEW USER JOURNEY (P&A-First):**
1. User selects well for decommissioning/P&A assessment
2. System presents **P&A objectives first**, legacy intervention objectives second
3. Brahan Engine queries **both P&A and intervention case studies** to find cost-optimal abandonment solutions
4. System provides cost-certainty forecasts and barrier integrity validation

### 2.2 New Objectives Hierarchy

#### **TIER 1: PRIMARY P&A OBJECTIVES** (New - Top Priority)

```javascript
{
  id: 'pa-obj1',
  name: 'Permanent Plug & Abandonment (Isolate All Zones)',
  description: 'Complete well abandonment with permanent environmental barriers per regulatory requirements.',
  category: 'P&A - Full Decommissioning',
  icon: '🔒',
  priority: 'CRITICAL',
  regulatoryCompliance: true,
  estimatedCost: '$2.5M - $8.5M',
  typicalDuration: '14-45 days'
}

{
  id: 'pa-obj2',
  name: 'P&A Pre-Op: Isolate Non-Productive Zone',
  description: 'Set initial abandonment barrier to isolate depleted or water-bearing zones before final P&A.',
  category: 'P&A - Staged Abandonment',
  icon: '🛡️',
  priority: 'HIGH',
  regulatoryCompliance: true,
  estimatedCost: '$800K - $2.2M',
  typicalDuration: '5-12 days'
}

{
  id: 'pa-obj3',
  name: 'P&A Pre-Op: Casing Remediation for Barrier',
  description: 'Repair or mill casing to establish competent formation contact for permanent cement barrier.',
  category: 'P&A - Barrier Prep',
  icon: '⚙️',
  priority: 'HIGH',
  regulatoryCompliance: true,
  estimatedCost: '$1.2M - $4.5M',
  typicalDuration: '8-28 days'
}

{
  id: 'pa-obj4',
  name: 'Set Permanent Environmental Barrier',
  description: 'Place verified cement barrier across reservoir interval to prevent hydrocarbon migration for 1,000+ years.',
  category: 'P&A - Barrier Installation',
  icon: '🌍',
  priority: 'CRITICAL',
  regulatoryCompliance: true,
  estimatedCost: '$600K - $1.8M',
  typicalDuration: '3-8 days'
}
```

#### **TIER 2: LEGACY INTERVENTION OBJECTIVES** (Production-Focused - De-Prioritized)

These remain available but are moved to a **"Legacy Production Intervention"** section that is collapsed by default.

```javascript
{
  id: 'legacy-obj1',
  name: 'Remediate Casing Deformation',
  description: 'Install expandable steel patch to restore wellbore access (production intervention).',
  category: 'Legacy - Production Intervention',
  icon: '🔧',
  priority: 'MEDIUM',
  isLegacy: true
}
// ... existing obj2-obj5 move here
```

### 2.3 New Problems Data (P&A Focus)

#### **NEW P&A-SPECIFIC PROBLEMS:**

```javascript
{
  id: 'pa-prob1',
  name: 'Complex Multi-Zone Isolation Required',
  description: 'Well requires abandonment of 3+ distinct pressure regimes with varying formation competency.',
  linked_objectives: ['pa-obj1', 'pa-obj2', 'pa-obj4'],
  icon: '🗂️',
  category: 'P&A Challenge',
  costDriver: 'HIGH',
  regulatoryRisk: 'CRITICAL'
}

{
  id: 'pa-prob2',
  name: 'Compromised Casing Integrity',
  description: 'Casing deformation, corrosion, or defects prevent direct cement-to-formation contact.',
  linked_objectives: ['pa-obj3', 'pa-obj1'],
  icon: '⚠️',
  category: 'P&A Challenge',
  costDriver: 'VERY HIGH',
  regulatoryRisk: 'CRITICAL',
  brahanInsight: 'Cross-reference intervention data from "The Brahan Squeeze" for cost-optimal milling solution'
}

{
  id: 'pa-prob3',
  name: 'Scale/Debris Obstruction in Abandonment Interval',
  description: 'Wellbore blockage prevents access to target abandonment depths.',
  linked_objectives: ['pa-obj3', 'pa-obj2'],
  icon: '🚧',
  category: 'P&A Challenge',
  costDriver: 'HIGH',
  regulatoryRisk: 'HIGH',
  brahanInsight: 'Apply chemical dissolution methods from "The Scale Trap" intervention case study'
}

{
  id: 'pa-prob4',
  name: 'Inadequate Formation Competency for Barrier',
  description: 'Target abandonment formation shows poor cement bond or low mechanical strength.',
  linked_objectives: ['pa-obj4', 'pa-obj1'],
  icon: '🏜️',
  category: 'P&A Challenge',
  costDriver: 'MEDIUM',
  regulatoryRisk: 'VERY HIGH'
}
```

### 2.4 UI Layout - "Select Intervention Objective" Page

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🏭 WELL-TEGRA P&A PLATFORM                                          │
│ Well: 666 - The Perfect Storm                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: SELECT P&A OBJECTIVE                                       │
│  Choose your primary abandonment or decommissioning goal            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  ⚡ BRAHAN ENGINE RECOMMENDATION                                     │
│  📊 Analysis of Well 666 suggests:                                  │
│                                                                      │
│  Recommended Objective: P&A Pre-Op: Casing Remediation for Barrier  │
│  Confidence: 94%                                                     │
│  Estimated Cost Savings: $1.5M vs. conventional milling plan        │
│                                                                      │
│  💡 Key Insight: Hybrid approach combining techniques from:         │
│     • "The Brahan Squeeze" (intervention) - expandable patch method │
│     • "The Scale Trap" (production) - chemical pre-treatment        │
│                                                                      │
│  [View Detailed Analysis] [Override Recommendation]                 │
└─────────────────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 PRIMARY P&A OBJECTIVES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌───────────────────────────────────────┐ ┌───────────────────────────┐
│ 🔒 Permanent Plug & Abandonment       │ │ 🛡️ P&A Pre-Op: Isolate    │
│    (Isolate All Zones)                │ │    Non-Productive Zone    │
│                                       │ │                           │
│ Complete well abandonment with        │ │ Set initial abandonment   │
│ permanent environmental barriers      │ │ barrier to isolate zones  │
│                                       │ │                           │
│ ⚡ Priority: CRITICAL                  │ │ ⚡ Priority: HIGH          │
│ 💰 Est: $2.5M - $8.5M                 │ │ 💰 Est: $800K - $2.2M     │
│ ⏱️ Duration: 14-45 days               │ │ ⏱️ Duration: 5-12 days    │
│ ✅ Regulatory Compliant               │ │ ✅ Regulatory Compliant   │
│                                       │ │                           │
│ [SELECT OBJECTIVE →]                  │ │ [SELECT OBJECTIVE →]      │
└───────────────────────────────────────┘ └───────────────────────────┘

┌───────────────────────────────────────┐ ┌───────────────────────────┐
│ ⚙️ P&A Pre-Op: Casing Remediation    │ │ 🌍 Set Permanent          │
│    for Barrier                        │ │    Environmental Barrier  │
│                                       │ │                           │
│ Repair/mill casing to establish       │ │ Place verified cement     │
│ formation contact for barrier         │ │ barrier across reservoir  │
│                                       │ │                           │
│ ⚡ Priority: HIGH                      │ │ ⚡ Priority: CRITICAL      │
│ 💰 Est: $1.2M - $4.5M                 │ │ 💰 Est: $600K - $1.8M     │
│ ⏱️ Duration: 8-28 days                │ │ ⏱️ Duration: 3-8 days     │
│ ✅ Regulatory Compliant               │ │ ✅ Regulatory Compliant   │
│ ⭐ RECOMMENDED BY BRAHAN ENGINE       │ │                           │
│                                       │ │                           │
│ [SELECT OBJECTIVE →]                  │ │ [SELECT OBJECTIVE →]      │
└───────────────────────────────────────┘ └───────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 LEGACY PRODUCTION INTERVENTION OBJECTIVES  [▼ Expand]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(Collapsed by default - click to expand)

When expanded:
┌───────────────────────────────────────┐
│ 🔧 Remediate Casing Deformation       │
│    (Legacy - Production Intervention) │
│ ... (existing objectives)             │
└───────────────────────────────────────┘
```

---

## 3. BRAHAN ENGINE AI LOGIC REFACTOR

### 3.1 New Query Strategy

**OLD LOGIC:**
```javascript
// Search only matching objective type
if (selectedObjective === 'obj1') {
  searchCaseStudies(type: 'casing_patch');
}
```

**NEW P&A-FIRST LOGIC:**
```javascript
// Cross-reference ALL case studies (P&A + intervention)
if (selectedObjective === 'pa-obj3') {
  // Search for technical challenge matches across ALL domains
  const interventionCases = searchCaseStudies(challenge: 'casing_deformation');
  const productionCases = searchCaseStudies(challenge: 'scale_removal');
  const paCases = searchCaseStudies(type: 'abandonment');

  // Prioritize solutions that minimize NPT and rig time
  return combineSolutions({
    interventionCases,
    productionCases,
    paCases,
    optimizationGoal: 'minimize_rig_time',
    secondaryGoal: 'cost_certainty'
  });
}
```

### 3.2 New AI Recommendations Format

```javascript
const aiRecommendations = {
  'pa-prob2': [  // Compromised Casing Integrity for P&A
    {
      objectiveId: 'pa-obj3',
      confidence: 94,
      outcome: 'Competent cement barrier established with $1.5M cost savings',
      costSavings: 1500000,
      reason: `Hybrid P&A approach combining:
        <ul>
          <li><strong>Intervention Insight (The Brahan Squeeze):</strong> Expandable patch
              technology proven effective on similar casing deformation at 9,000ft MD</li>
          <li><strong>Production Insight (The Scale Trap):</strong> Chemical pre-treatment
              with DTPA reduces milling time by 40% when dealing with BaSO₄ deposits</li>
          <li><strong>P&A Application:</strong> Use expandable liner to create competent
              casing section, then set permanent cement barrier - avoids high-risk section milling</li>
        </ul>
        This approach reduces abandonment rig time from 28 days to 16 days.`,
      sourceAnalogs: [
        { id: 'CS-011', name: 'The Brahan Squeeze', type: 'Intervention', relevance: 92 },
        { id: 'CS-S15', name: 'The Scale Trap', type: 'Production', relevance: 87 },
        { id: 'PA-008', name: 'North Sea P&A Campaign', type: 'P&A', relevance: 95 }
      ],
      regulatoryValidation: 'Meets BSEE/NSTA permanent barrier requirements',
      barrierIntegrity: {
        predictedLifespan: '1000+ years',
        cementBondQuality: 'Excellent (>95% bond log)',
        formationCompetency: 'Verified via sonic log correlation'
      }
    }
  ]
};
```

---

## 4. VISUAL DESIGN PRINCIPLES

### 4.1 Color Coding

- **P&A Primary Objectives**: Blue/Cyan (🔒 trust, regulatory compliance)
- **P&A High Priority**: Green (🛡️ safety, environmental)
- **P&A Critical Priority**: Amber (⚡ urgent, cost-driver)
- **Legacy Intervention**: Gray (📦 de-prioritized, still available)

### 4.2 Key Metrics Display

Every P&A objective card must show:
1. **Estimated Cost Range** (transparency, cost-certainty)
2. **Typical Duration** (rig time = cost driver)
3. **Regulatory Compliance Badge** (✅ critical for P&A)
4. **Priority Level** (CRITICAL, HIGH, MEDIUM)
5. **Brahan Engine Recommendation Flag** (⭐ when applicable)

### 4.3 Trust & Transparency

- Show **source analog case studies** for all recommendations
- Display **confidence percentages** with explanation
- Include **cost savings calculations** with methodology
- Provide **regulatory validation** references

---

## 5. IMPLEMENTATION PRIORITY

### Phase 1 (Immediate - This Sprint):
1. ✅ Refactor `objectivesData` array with new P&A objectives
2. ✅ Update `problemsData` with P&A-specific challenges
3. ✅ Redesign objective selection UI with tier system
4. ✅ Add Brahan Engine recommendation panel
5. ✅ Implement legacy objective collapse/expand

### Phase 2 (Next Sprint):
1. Refactor AI recommendation logic for cross-domain search
2. Add cost savings calculations
3. Implement regulatory compliance validation
4. Add source analog display

### Phase 3 (Future):
1. Quantum simulation integration for barrier integrity
2. Real-time regulatory database integration
3. Cost-certainty forecasting with ML models

---

## 6. SUCCESS METRICS

- **User Engagement**: % of users selecting P&A objectives vs. legacy intervention
- **Cost Savings**: Average cost reduction per P&A plan using Brahan Engine recommendations
- **Regulatory Compliance**: % of P&A plans meeting first-time approval
- **Time to Plan**: Average time from objective selection to approved P&A procedure
- **Platform Positioning**: Market share in P&A planning software category

---

## 7. NEXT STEPS

**IMMEDIATE ACTION (Today):**
- Begin implementation of new `objectivesData` structure in `app.js`
- Create UI mockup for objective selection page refactor
- Draft new Brahan Engine recommendation logic

**Bob Raker Sign-Off Required:**
- Final approval of P&A objective descriptions
- Validation of cost ranges and duration estimates
- Review of regulatory compliance language

---

**Document Status:** ✅ APPROVED FOR IMPLEMENTATION
**Last Updated:** 12 November 2025
**Next Review:** Post Phase 1 completion
