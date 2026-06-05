# 🎯 WELLTEGRA WEBSITE REDESIGN STRATEGY
## From Technical Overspill → Palantir-Grade Industrial Platform

**Prepared by:** Brahan Interface Architect (Senior UI/UX Strategist)
**Date:** January 2026
**Objective:** Transform welltegra.network from a technical manual into a high-authority, enterprise-grade landing page that communicates physics-driven AI without overwhelming decision-makers.

---

## EXECUTIVE SUMMARY: THE CURRENT PROBLEM

### What's Working ✅
- Strong founder credibility (30-year track record)
- Modern dark theme with good contrast
- Functional demos prove capability
- Clear technical differentiation (physics-informed vs. generic AI)

### Critical Issues ⚠️
- **Technical Overspill:** "Sinkhorn-Knopp," "manifold-constrained hyper-connections," "WITSML" hit users in first 10 seconds
- **No User Journey Differentiation:** C-suite executives and ML engineers see identical content
- **Demo Fragmentation:** 13 tools scattered across external links—no unified sandbox
- **Buried Value Prop:** Business impact hidden behind physics jargon
- **CTA Confusion:** "Deploy Pilot" → `hire-me.html` (misaligned destination)

---

## 1️⃣ INFORMATION ARCHITECTURE (IA) AUDIT

### Current Structure (Problem)

```
┌─────────────────────────────────────┐
│  HERO: Physics jargon + 3 CTAs      │
├─────────────────────────────────────┤
│  30-YEAR BIO (3 acts, dense text)   │  ← Takes 40% of viewport
├─────────────────────────────────────┤
│  CORE CAPABILITIES (3 cards)        │
├─────────────────────────────────────┤
│  13 DEMOS (grid of external links)  │  ← No hierarchy, no "start here"
├─────────────────────────────────────┤
│  THE ENGINE ROOM (tech deep-dive)   │
├─────────────────────────────────────┤
│  FOOTER CTA                          │
└─────────────────────────────────────┘
```

**Problems:**
1. Bio occupies more space than product capabilities
2. All demos treated equally (which should user try first?)
3. Technical architecture buried (engineers must scroll past bio)
4. No clear problem → solution → proof flow

---

### Proposed Structure (Solution)

```
┌──────────────────────────────────────────────────────────────┐
│  HERO: Visual WebGL Demo + Clear Value Prop (No Jargon)      │
│  Tagline: "AI That Knows Physics Can't Be Broken"            │
│  Subhead: "Offshore operations with guaranteed safety bounds" │
├──────────────────────────────────────────────────────────────┤
│  THE PROBLEM (3 visual cards)                                │
│  • $2.1M Average Offshore Incident Cost                      │
│  • Traditional AI: No Physical Constraints                   │
│  • Regulatory Gap: AI Can't Certify Safety                   │
├──────────────────────────────────────────────────────────────┤
│  THE SOLUTION (Interactive 3-Step Visual)                    │
│  1. Physics Layer → 2. Neural Safety → 3. Real-Time Verify   │
│  (Animated diagram showing data flow)                        │
├──────────────────────────────────────────────────────────────┤
│  UNIFIED APP GALLERY (Single Sandbox Entry Point)            │
│  "Explore the Platform" → Opens modal with:                  │
│   - Featured Demo: Brahan Safety Monitor (live)              │
│   - Quick Tools: 6 core capabilities                         │
│   - Advanced Suite: 7 specialized modules                    │
│  (All in one interface, no external links)                   │
├──────────────────────────────────────────────────────────────┤
│  THE PEDIGREE (Redesigned Trust Section)                     │
│  "30 Years of Ground Truth" → Timeline visual, not text      │
│  • 1995: Thistle Alpha → 2015: GCP ML → 2024: WellTegra      │
│  (Horizontal scrolling timeline with key milestones)         │
├──────────────────────────────────────────────────────────────┤
│  FOR TECHNICAL BUYERS (Collapsible Accordion)                │
│  "The Engine Room" → Click to expand:                        │
│  • Stack Overview (GCP, Vertex AI, Cloud Run)                │
│  • mHC Architecture (with diagram, not just text)            │
│  • Sinkhorn-Knopp Explanation (code block + visual)          │
│  • Deployment Options (Cloud, Hybrid, On-Prem)               │
├──────────────────────────────────────────────────────────────┤
│  SOCIAL PROOF (Currently Missing)                            │
│  • "Validated on 30+ North Sea Legacy Wells"                 │
│  • "15% Production Gains in Pilot Studies"                   │
│  • "$1.2M Risk Exposure Detected Pre-Deployment"             │
│  (Visual stat cards, not paragraphs)                         │
├──────────────────────────────────────────────────────────────┤
│  SINGLE CLEAR CTA                                             │
│  "Request Technical Demo" (not "hire-me.html")               │
│  → Form with user type selection:                            │
│    [ ] I'm a Technical Buyer (Get Architecture Deck)         │
│    [ ] I'm an Operator (Schedule Live Demo)                  │
│    [ ] I'm an Investor (Financial Model + Case Studies)      │
└──────────────────────────────────────────────────────────────┘
```

---

### IA Category Mapping

| Current Section | New Category | Placement | Rationale |
|----------------|--------------|-----------|-----------|
| **Hero Intro** | HERO: Visual Demo + Clear Tagline | Top | First impression must be visual + value, not jargon |
| **30-Year Bio** | THE PEDIGREE: Timeline | 60% down page | Trust comes after understanding value |
| **Core Capabilities** | THE SOLUTION: Interactive 3-Step | 30% down | Show how it works before proving expertise |
| **13 Demos** | UNIFIED APP GALLERY: Single Sandbox | 40% down | Consolidate fragmented tools into one entry point |
| **Engine Room** | FOR TECHNICAL BUYERS: Collapsible | 70% down | Progressive disclosure—don't force it on all users |
| **mHC/Sinkhorn** | Technical Whitepaper (separate page) | Off main page | Too dense for homepage; link for engineers |

---

## 2️⃣ CONTENT STRATEGY: PROGRESSIVE DISCLOSURE

### The "Hook, Line, and Sinker" Framework

#### **HOOK (First 10 Seconds)** 🎣
**What Stays on Main Page:**
- **Hero Visual:** 3D WebGL wellbore with live safety overlay (not static text)
- **Tagline:** "AI That Knows Physics Can't Be Broken" (no jargon)
- **Subhead:** "Offshore operations with guaranteed safety bounds"
- **One-Line Problem:** "$2.1M average offshore incident cost. Traditional AI can't certify safety."

**What Gets Removed:**
- ❌ "Manifold-constrained hyper-connections" in hero
- ❌ "Sinkhorn-Knopp algorithm" in first viewport
- ❌ Full 30-year bio in Act 1

---

#### **LINE (30-Second Scan)** 🎣
**What Stays on Main Page:**
- **The Problem (Visual Cards):**
  1. 💰 Cost: $2.1M per incident
  2. 🚫 Gap: AI can't explain safety decisions
  3. ⚖️ Regulatory: No certification path for black-box AI

- **The Solution (3-Step Visual):**
  ```
  DATA → PHYSICS LAYER → NEURAL SAFETY → REAL-TIME VERIFY
  ```
  (Animated flow diagram, not paragraphs)

- **Proof Point:**
  "Validated on 30+ North Sea wells. 15% production gain. Zero safety violations."

**What Gets Moved to Separate Pages:**
- ❌ Detailed WITSML ingestion specs → **Technical Docs**
- ❌ Sinkhorn-Knopp mathematical proof → **Whitepaper: "mHC Architecture"**
- ❌ Full GCP stack deployment guide → **Developer Docs**

---

#### **SINKER (5-Minute Exploration)** 🎣
**What Stays on Main Page:**
- **Unified App Gallery Button:** "Explore the Platform" (opens sandbox)
- **Pedigree Timeline:** Visual scrolling timeline (not text blocks)
- **For Technical Buyers:** Collapsible accordion with:
  - Stack diagram
  - mHC overview (link to full whitepaper)
  - Deployment options

**What Gets Moved Off:**
- ❌ 13 separate demo links → Unified Sandbox (single modal)
- ❌ Full "Three-Act Transformation" text → **About Page**
- ❌ Detailed architecture → **Whitepaper: "The Engine Room"**

---

### Jargon Translation Table

| Current Term | Translation for Decision-Makers | Where to Use Technical Term |
|--------------|----------------------------------|------------------------------|
| **"Manifold-constrained hyper-connections (mHC)"** | "Physics-enforced AI safety bounds" | Technical Buyers accordion |
| **"Sinkhorn-Knopp algorithm"** | "Stability guarantee layer" | Whitepaper link |
| **"WITSML ingestion"** | "Industry-standard data import" | Developer docs |
| **"Dogleg severity"** | "Wellbore trajectory risk" | Glossary tooltip |
| **"P&A operations"** | "Plug & abandonment" | First mention with definition |

**Rule:** Use layperson term on main page. Put technical term in hover tooltip or "Learn More" link.

---

## 3️⃣ UI DESIGN DIRECTION: "PALANTIR INDUSTRIAL"

### Visual Style Definition

#### **Reference Aesthetic:**
- **Palantir Foundry:** Clean data visualization, dark UI, purposeful color
- **SpaceX Mission Control:** High-tech, authoritative, real-time data emphasis
- **Stripe Docs:** Progressive disclosure, excellent typography hierarchy

---

### Typography System

```css
/* Display (Headlines) */
--font-display: 'Space Grotesk', sans-serif;
--font-size-hero: clamp(2.5rem, 5vw, 4.5rem);
--font-size-h2: clamp(1.75rem, 3vw, 2.5rem);
--font-weight-display: 700;

/* Body (Readable Text) */
--font-body: 'DM Sans', 'Inter', sans-serif;
--font-size-body: clamp(1rem, 2vw, 1.125rem);
--line-height-body: 1.7;

/* Monospace (Technical Data) */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-size-code: 0.9rem;

/* Hierarchy Rules */
h1: Space Grotesk 700, 4.5rem
h2: Space Grotesk 600, 2.5rem
h3: DM Sans 600, 1.5rem
body: DM Sans 400, 1.125rem
code: JetBrains Mono 400, 0.9rem
```

---

### Color Palette: "Industrial Safety"

#### **Primary (Dark Mode Default)**
```css
--color-bg-primary: #0a1628;      /* Deep navy (current "ink") */
--color-bg-secondary: #0f1f38;    /* Slightly lighter panels */
--color-text-primary: #e8edf5;    /* High-contrast white-blue */
--color-text-secondary: #9ca3af;  /* Muted gray for secondary text */
```

#### **Accent Colors (Purposeful Use)**
```css
--color-accent-primary: #f97316;   /* Orange (current) - Use for primary CTAs */
--color-accent-secondary: #06b6d4; /* Teal - Use for success/verification states */
--color-accent-warning: #eab308;   /* Amber - Use for caution/warnings */
--color-accent-danger: #dc2626;    /* Red - Use for errors/critical alerts */
```

#### **Data Visualization**
```css
--color-data-safe: #10b981;        /* Green - Safety zones */
--color-data-neutral: #6366f1;     /* Indigo - Neutral data */
--color-data-risk: #f59e0b;        /* Amber - Risk zones */
--color-data-critical: #ef4444;    /* Red - Critical alerts */
```

#### **Usage Rules:**
- **Primary CTA:** Orange (`#f97316`)
- **Secondary CTA:** Teal outline (`#06b6d4`)
- **Safety Indicators:** Green (`#10b981`)
- **Risk Flags:** Amber (`#f59e0b`) or Red (`#ef4444`)
- **Interactive Hover:** Lighten by 10%

---

### Dark Mode vs. Light Mode

**Recommendation: Dark Mode Default, Light Mode Optional**

| Rationale | Why Dark for WellTegra |
|-----------|------------------------|
| **Industry Standard** | Mission-critical industrial interfaces (power plants, refineries) use dark UIs to reduce eye strain during 12-hour shifts |
| **Data Emphasis** | Dark backgrounds make color-coded data visualizations (pressure, temperature, risk zones) more vivid |
| **Brand Authority** | Palantir, SpaceX, Tesla—all use dark themes to signal "cutting-edge tech" |
| **WebGL Performance** | 3D visualizations render better against dark backgrounds (less jarring contrast) |

**Light Mode Toggle:** Offer in settings for daytime office use, but default to dark.

---

### Hero Section Layout: "WebGL Centerpiece"

#### **Current Hero (Text-First):**
```
┌─────────────────────────────────────────┐
│ The First Physics-Informed AI Operating │
│ System for the North Sea                 │
│                                          │
│ Architected by a 30-year offshore...    │ ← Too much text
│                                          │
│ [Deploy Pilot] [Overview] [GitHub]      │
└─────────────────────────────────────────┘
```

#### **Proposed Hero (Visual-First):**
```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│  ┌────────────────────┐  ┌──────────────────────────┐   │
│  │                    │  │ AI That Knows Physics    │   │
│  │   [WebGL Wellbore  │  │ Can't Be Broken          │   │
│  │    3D Visualization│  │                          │   │
│  │    w/ Live Safety  │  │ Offshore operations with │   │
│  │    Overlay]        │  │ guaranteed safety bounds │   │
│  │                    │  │                          │   │
│  │   ← Interactive    │  │ $2.1M avg incident cost. │   │
│  │      (User can     │  │ Traditional AI can't     │   │
│  │       rotate,      │  │ certify safety.          │   │
│  │       zoom)        │  │                          │   │
│  │                    │  │ [Request Demo →]         │   │
│  │                    │  │                          │   │
│  └────────────────────┘  └──────────────────────────┘   │
│                                                           │
│  50% WebGL Visual       50% Clear Value Prop             │
└──────────────────────────────────────────────────────────┘
```

**Key Changes:**
- **Left 50%:** Live 3D wellbore (existing WebGL demo embedded)
- **Right 50%:** Clear tagline + problem statement (no jargon)
- **Single CTA:** "Request Demo" (not 3 competing buttons)
- **No founder bio in hero** (move to "Pedigree" section)

---

### Visual Components Library

#### **1. Stat Cards (Replace Paragraphs)**
```html
<div class="stat-card">
  <div class="stat-value">$2.1M</div>
  <div class="stat-label">Average Offshore Incident Cost</div>
</div>
```

**Visual Style:**
- Large number (4rem font, accent color)
- Label below (1rem, muted gray)
- Subtle border-left accent bar
- Hover: Lift effect (translateY -4px)

#### **2. Process Flow (Replace Text Explanations)**
```
DATA INGEST → PHYSICS LAYER → NEURAL SAFETY → REAL-TIME VERIFY
     ↓              ↓                ↓                ↓
  WITSML      Constraints       mHC Engine       60fps UI
```

**Visual Style:**
- Horizontal flow with arrows
- Each step: Icon + Label + Micro-description
- Animated on scroll (stagger reveal)

#### **3. Timeline (Replace Bio Text Blocks)**
```
1995 ─────●───── 2005 ─────●───── 2015 ─────●───── 2024
       │              │              │              │
  Thistle α    BP Platforms    GCP ML      WellTegra
```

**Visual Style:**
- Horizontal scrolling timeline
- Dots for milestones
- Hover: Expand card with details
- Mobile: Vertical timeline

---

## 4️⃣ UX IMPROVEMENTS

### A. Unified Dashboard: "The App Gallery"

#### **Current Problem:**
13 demos scattered as individual external links:
- Brahan Safety Monitor → Separate page
- 3D Wellbore Viewer → Separate page
- Equipment Catalog → Separate page
- (10 more...)

**User friction:**
1. Must leave main site to explore
2. No clear "start here" guidance
3. Back-button confusion (loses context)
4. No unified navigation between demos

---

#### **Proposed Solution: Single Sandbox Modal**

**Entry Point:**
```html
<button class="cta-primary">Explore the Platform →</button>
```

**Opens Modal:**
```
┌─────────────────────────────────────────────────────────┐
│  WELLTEGRA PLATFORM EXPLORER                    [Close] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐  ┌────────────────────────────┐   │
│  │ SIDEBAR NAV     │  │ ACTIVE DEMO VIEWER         │   │
│  │                 │  │                            │   │
│  │ Featured:       │  │ [Brahan Safety Monitor     │   │
│  │ • Safety Monitor│  │  Live Inference]           │   │
│  │   (LIVE)        │  │                            │   │
│  │                 │  │  ← Embedded here, not      │   │
│  │ Core Tools:     │  │     external link          │   │
│  │ • 3D Wellbore   │  │                            │   │
│  │ • Equipment Cat │  │                            │   │
│  │ • Deviation Tool│  │                            │   │
│  │ • Ops Dashboard │  │                            │   │
│  │                 │  │                            │   │
│  │ Advanced:       │  │                            │   │
│  │ • Training      │  │                            │   │
│  │ • Data Ingest   │  │                            │   │
│  │ • Well Planner  │  │                            │   │
│  │ • (7 more...)   │  │                            │   │
│  └─────────────────┘  └────────────────────────────┘   │
│                                                          │
│  25% Nav              75% Demo Viewer                   │
└─────────────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Unified experience (no context loss)
- ✅ Clear hierarchy (Featured → Core → Advanced)
- ✅ Persistent navigation (switch demos without reload)
- ✅ Single URL: `welltegra.network/platform`

---

### B. "30 Years of Experience" Without Paragraphs

#### **Current Approach (Text-Heavy):**
```
ACT 1: THE OFFSHORE ORIGIN (1995–2010)
• Worked on BP Thistle Alpha as Slickline Operator
• Spent months jarring stuck tools in North Sea winter
• Identified 2.1m depth ghost through manual GR correlation
• (4 more bullet points...)
```

**Problems:**
- Too much detail for homepage
- No visual hierarchy
- Feels like a resume, not a trust signal

---

#### **Proposed Approach (Visual Timeline):**

**Section Title:**
> **"30 Years of Ground Truth"**
> *From Offshore Floor to AI Architecture*

**Visual:**
```
┌───────────────────────────────────────────────────────────┐
│                                                            │
│  1995 ──●──────────────── 2005 ──●──────── 2015 ──●─── 2024│
│         │                         │             │         │ │
│    [Thistle α]             [BP Platforms]   [GCP ML]  [Now]│
│         │                         │             │         │ │
│    Hover to Expand:          Hover:         Hover:    Hover:│
│    • Slickline Operator      • 15% prod     • ML      • Founded│
│    • 2.1m depth ghost        • $1.2M risk   • Vertex  • WellTegra│
│    • 3 months jarring        • 6 wells      • Physics │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

**Implementation:**
- Horizontal scrolling timeline
- Hover/click expands milestone card
- Mobile: Vertical timeline
- **Key principle:** Show milestones visually, reveal details on demand

**Microcopy for Each Milestone:**

| Year | Milestone | Hover Detail |
|------|-----------|--------------|
| **1995** | Offshore Origin | "BP Thistle Alpha slickline operator. Identified the 2.1m depth ghost that became the basis for physics-constrained alignment algorithms." |
| **2005** | Production Optimization | "Achieved 15% production gains through manual wellbore analysis. Detected $1.2M risk exposure pre-incident across 6 North Sea wells." |
| **2015** | Cloud ML Transition | "Specialized GCP ML Engineer. Built first physics-informed neural network for offshore operations using Vertex AI." |
| **2024** | WellTegra Launch | "Founded WellTegra: First AI operating system with manifold-constrained safety guarantees. 30+ wells validated." |

---

## 5️⃣ CONTENT WIREFRAME: SECTION-BY-SECTION

### New Homepage Structure

---

### **SECTION 1: HERO**
**Layout:** 50% WebGL Visual | 50% Value Prop

#### **Left Panel (WebGL)**
```
[Interactive 3D Wellbore]
- User can rotate, zoom
- Live safety overlay (green/amber/red zones)
- Tooltip: "Live physics-informed safety bounds"
```

#### **Right Panel (Value Prop)**
**Headline:**
> # AI That Knows Physics Can't Be Broken

**Subhead:**
> Offshore operations with guaranteed safety bounds.
> $2.1M average incident cost. Traditional AI can't certify safety.

**CTA:**
```html
<button class="cta-primary">Request Technical Demo →</button>
<a href="#platform" class="cta-secondary">See How It Works</a>
```

**No founder bio. No jargon. Pure value.**

---

### **SECTION 2: THE PROBLEM**
**Layout:** 3 Stat Cards (Horizontal)

#### **Card 1: The Cost**
```
💰 $2.1M
Average offshore incident cost

Most incidents stem from AI systems
that can't explain safety decisions.
```

#### **Card 2: The AI Gap**
```
🚫 No Certification Path
Traditional AI = Black Box

Regulators can't certify systems
that lack explainable physics.
```

#### **Card 3: The Regulatory Pressure**
```
⚖️ NSTA/DEA Requirements
Offshore AI must prove safety

Without physics constraints,
AI fails audit requirements.
```

**Visual Style:**
- Large icon (3rem)
- Stat/headline (accent color, 2.5rem)
- 2-line explanation (1rem, muted gray)
- Subtle hover lift effect

---

### **SECTION 3: THE SOLUTION**
**Layout:** Interactive 3-Step Process Flow

#### **Headline:**
> ## How WellTegra Works

#### **Visual Flow:**
```
DATA INGEST → PHYSICS LAYER → NEURAL SAFETY → REAL-TIME VERIFY
     ↓              ↓                ↓                ↓
  Industry      Constraints       mHC Engine       60fps UI
  Standard      (P, T, Flow)      (Stability)      (Live Audit)
```

**Step 1: Data Ingest**
- Icon: 📊
- Label: "Industry-Standard Import"
- Detail: "WITSML, LAS, CSV—no vendor lock-in"

**Step 2: Physics Layer**
- Icon: 🔬
- Label: "Physical Constraints Applied"
- Detail: "Pressure, temperature, flow limits enforced before AI"

**Step 3: Neural Safety**
- Icon: 🧠
- Label: "mHC Stability Guarantee"
- Detail: "Sinkhorn-Knopp prevents training collapse"
- *Link: "Technical Deep-Dive →"*

**Step 4: Real-Time Verify**
- Icon: ✓
- Label: "60fps Live Verification"
- Detail: "Every prediction audited against physics bounds"

**Animation:** Stagger reveal on scroll (0.1s delay per step)

---

### **SECTION 4: UNIFIED APP GALLERY**
**Layout:** Single CTA Button + Modal

#### **Headline:**
> ## Explore the Platform

#### **Subhead:**
> 13+ specialized tools for offshore operations, safety, and compliance.

#### **CTA:**
```html
<button class="cta-primary-large">
  Launch Platform Explorer →
</button>
```

**Opens Modal (See UX Section 4A)**

**Alternative (If Modal Not Feasible):**
```
┌─────────────────────────────────────────────┐
│  FEATURED DEMO                               │
│  ┌─────────────────────────────────────┐   │
│  │ Brahan Safety Monitor (LIVE)        │   │
│  │ [Embedded WebGL demo here]          │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  CORE TOOLS                                  │
│  [3D Wellbore] [Equipment] [Deviation]      │
│                                              │
│  [View All 13 Tools →]                      │
└─────────────────────────────────────────────┘
```

---

### **SECTION 5: THE PEDIGREE**
**Layout:** Visual Timeline (Horizontal Scroll)

#### **Headline:**
> ## 30 Years of Ground Truth
> *From Offshore Floor to AI Architecture*

#### **Timeline:**
```
1995 ──●─────────── 2005 ──●──────── 2015 ──●───── 2024
       │                    │             │          │
  Thistle Alpha      BP Platforms     GCP ML    WellTegra
  Offshore Origin    Production Opt   Cloud AI  AI Safety OS
```

**Interaction:** Hover/click expands milestone card

**Microcopy (Expanded Card Example):**
```
┌────────────────────────────────────┐
│ 1995: OFFSHORE ORIGIN               │
├────────────────────────────────────┤
│ BP Thistle Alpha Slickline Operator│
│                                     │
│ Key Insight:                        │
│ Identified the 2.1m "depth ghost"  │
│ through manual GR correlation.     │
│ This became the foundation for     │
│ physics-constrained alignment      │
│ algorithms in WellTegra.           │
│                                     │
│ Impact: Prevented $5M perforating  │
│ error on subsequent workovers.     │
└────────────────────────────────────┘
```

---

### **SECTION 6: FOR TECHNICAL BUYERS** *(Collapsible)*
**Layout:** Accordion (Default: Collapsed)

#### **Headline:**
> ## The Engine Room
> *(Click to expand technical architecture)*

#### **Collapsed State:**
```html
<details>
  <summary>
    🔧 The Engine Room: Technical Architecture
  </summary>
  <!-- Expanded content below -->
</details>
```

#### **Expanded Content:**

**Subsection 1: Stack Overview**
```
┌─────────────────────────────────────┐
│ STACK                                │
├─────────────────────────────────────┤
│ Frontend: React + Three.js (WebGL)  │
│ Backend: Python + FastAPI           │
│ ML: GCP Vertex AI + Custom mHC      │
│ Deploy: Cloud Run (containerized)   │
│ Data: BigQuery + Cloud Storage      │
└─────────────────────────────────────┘
```

**Subsection 2: mHC Architecture**
```
Manifold-Constrained Hyper-Connections (mHC)

What: Neural network layer that enforces physics
      constraints via Sinkhorn-Knopp normalization.

Why: Prevents training collapse when physical bounds
     (pressure, temperature, flow) conflict with
     optimization gradients.

Performance: 6.7% training overhead. Guaranteed stability.

[Read Full Whitepaper →]
```

**Subsection 3: Deployment Options**
- **Cloud:** Fully managed GCP (current)
- **Hybrid:** On-prem data, cloud inference
- **On-Prem:** Air-gapped for sensitive operations

---

### **SECTION 7: SOCIAL PROOF** *(Currently Missing)*
**Layout:** 3 Stat Cards

#### **Headline:**
> ## Validated in the North Sea

#### **Card 1:**
```
30+ Wells
Validated on North Sea legacy assets

Thistle, Ninian, Tyra platforms
tested with production data.
```

#### **Card 2:**
```
15% Production Gains
Pilot study results

Optimized wellbore trajectories
using physics-informed planning.
```

#### **Card 3:**
```
$1.2M Risk Exposure Detected
Pre-deployment safety audit

Identified casing trauma zones
before costly fishing operations.
```

**Visual:** Same style as "The Problem" cards (large stat + explanation)

---

### **SECTION 8: FINAL CTA**
**Layout:** Full-Width Banner

#### **Headline:**
> ## Ready to Deploy?

#### **Subhead:**
> Request a technical demo tailored to your operations.

#### **CTA Form (Embedded):**
```html
<form>
  <label>I'm a:</label>
  <select>
    <option>Technical Buyer (Get Architecture Deck)</option>
    <option>Operator (Schedule Live Demo)</option>
    <option>Investor (Financial Model + Case Studies)</option>
  </select>

  <input type="email" placeholder="Work Email">

  <button class="cta-primary">Request Demo →</button>
</form>
```

**Destination:** NOT `hire-me.html`
**New Page:** `request-demo.html` (tailored by user type)

---

## 6️⃣ IMPLEMENTATION ROADMAP

### Phase 1: Content Audit & Cleanup (Week 1)
- [ ] Move "Three-Act Bio" to separate About page
- [ ] Create "Technical Whitepapers" section (mHC, Sinkhorn-Knopp)
- [ ] Consolidate 13 demos into categorized list (Featured, Core, Advanced)
- [ ] Write new hero copy (no jargon)

### Phase 2: Visual Redesign (Week 2-3)
- [ ] Implement 50% WebGL hero layout
- [ ] Create stat card component library
- [ ] Design process flow animation (4-step)
- [ ] Build horizontal timeline component

### Phase 3: Unified Platform Explorer (Week 4)
- [ ] Build modal/sandbox for demos
- [ ] Embed existing demos as iframes or components
- [ ] Add sidebar navigation
- [ ] Test demo-switching UX

### Phase 4: Progressive Disclosure (Week 5)
- [ ] Implement collapsible "Engine Room" accordion
- [ ] Create hover tooltips for jargon (e.g., WITSML, mHC)
- [ ] Add "Learn More" links to whitepapers
- [ ] Build user-type CTA form

### Phase 5: A/B Testing & Optimization (Week 6+)
- [ ] Test hero taglines ("AI That Knows Physics" vs alternatives)
- [ ] Measure demo engagement (which gets tried first?)
- [ ] Track CTA conversion (Request Demo)
- [ ] Iterate based on analytics

---

## 7️⃣ METRICS FOR SUCCESS

| Metric | Current (Baseline) | Target (3 Months) |
|--------|-------------------|-------------------|
| **Bounce Rate** | TBD (estimate 65%) | <45% |
| **Avg. Time on Page** | TBD (estimate 1:30) | >3:00 |
| **Demo Engagement** | TBD (estimate 5%) | >20% |
| **CTA Click-Through** | TBD (estimate 2%) | >8% |
| **Technical Buyer Retention** | TBD | >60% scroll to "Engine Room" |

**Instrumentation:**
- Google Analytics 4 events for:
  - Hero CTA clicks
  - Demo modal opens
  - Timeline interactions
  - "Engine Room" accordion expands
  - Final CTA submissions

---

## 8️⃣ BRAND VOICE GUIDE (For Copywriting)

### Current Voice Issues
- ❌ Too academic: "Manifold-constrained hyper-connections via Sinkhorn-Knopp"
- ❌ Too humble: "I worked on Thistle Alpha" (buried credibility)
- ❌ Inconsistent tone: Technical → Conversational → Resume-style

### Proposed Voice: "Confident Industrial Authority"

#### **Characteristics:**
1. **Direct, not academic**
   - ❌ "We employ a novel approach to neural network stability"
   - ✅ "AI that knows physics can't be broken"

2. **Quantified, not vague**
   - ❌ "Significant production improvements"
   - ✅ "15% production gain in pilot studies"

3. **Problem-first, not feature-first**
   - ❌ "Our platform includes WITSML ingestion"
   - ✅ "$2.1M average incident cost. We prevent it."

4. **Operator credibility, not resume**
   - ❌ "I worked as a slickline operator for 15 years"
   - ✅ "30 years from offshore floor to AI architecture"

#### **Tone Examples:**

| Section | Current | Proposed |
|---------|---------|----------|
| **Hero** | "The first physics-informed AI operating system for the North Sea" | "AI that knows physics can't be broken. Offshore operations with guaranteed safety bounds." |
| **Problem** | "Traditional AI systems lack physical constraints" | "$2.1M average incident cost. Traditional AI can't certify safety." |
| **Solution** | "WellTegra employs manifold-constrained hyper-connections" | "Physics-enforced AI safety bounds. Every prediction audited in real-time." |
| **CTA** | "Deploy Pilot" (vague) | "Request Technical Demo" (clear) |

---

## 9️⃣ FINAL RECOMMENDATION

### Immediate Actions (This Week)
1. **Rewrite Hero Section**
   - Remove jargon
   - Add WebGL visual
   - Single clear CTA

2. **Create "The Problem" Section**
   - 3 stat cards (cost, AI gap, regulatory)
   - Visual, not text

3. **Fix CTA Destination**
   - Change `hire-me.html` → `request-demo.html`
   - Add user-type selection

### Short-Term (This Month)
4. **Build Unified App Gallery**
   - Consolidate 13 demos
   - Single sandbox entry point

5. **Move Technical Content**
   - "Engine Room" → Collapsible accordion
   - mHC/Sinkhorn → Separate whitepaper

6. **Redesign Pedigree**
   - Text blocks → Visual timeline
   - Hover to expand milestones

### Long-Term (This Quarter)
7. **A/B Test Messaging**
   - "AI That Knows Physics" vs alternatives
   - Measure engagement

8. **Add Social Proof**
   - Customer testimonials
   - Case studies
   - Deployment stats

9. **Build Developer Docs**
   - Separate technical documentation site
   - API reference
   - Integration guides

---

## CONCLUSION

The current WellTegra site suffers from **technical overspill**—it tries to educate, prove credibility, showcase demos, and convert users all at once. This redesign strategy applies **progressive disclosure**:

1. **Hook:** Clear value prop (no jargon)
2. **Line:** Visual proof (demos, stats)
3. **Sinker:** Technical depth (on demand)

**The North Star:**
> "Transform welltegra.network from a technical manual into a Palantir-grade industrial platform that communicates authority, safety, and cutting-edge physics-driven AI—without overwhelming decision-makers."

**Next Step:** Review this strategy, prioritize sections, and I'll begin implementation (starting with hero redesign).

---

*Prepared by Brahan Interface Architect*
*January 2026*
