# Crisis Command Center API Documentation

**Version:** 1.0.0
**File:** `crisis-command.html`
**Purpose:** Interactive crisis management training simulator with multi-lens cognitive filtering, real-time physics simulation, and decision tree scenarios

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Data Structures](#data-structures)
4. [Navigation & UI Functions](#navigation--ui-functions)
5. [Chart Visualization Functions](#chart-visualization-functions)
6. [Simulation Logic Functions](#simulation-logic-functions)
7. [Interaction Functions](#interaction-functions)
8. [Scenario Outcome Functions](#scenario-outcome-functions)
9. [Integration Examples](#integration-examples)
10. [Educational Design Patterns](#educational-design-patterns)
11. [Technical Architecture](#technical-architecture)

---

## Overview

The Crisis Command Center is a **cognitive training simulator** designed to teach well control decision-making under pressure. It uses multiple metaphorical "lenses" to help learners from different backgrounds understand drilling crisis scenarios.

### Key Features

| Feature | Technology | Purpose |
|---------|-----------|---------|
| **Multi-Lens Cognitive Filtering** | JavaScript state management | Translate technical concepts to familiar domains |
| **Real-Time Physics Simulation** | setInterval loop (500ms ticks) | Model kick detection dynamics |
| **CCTV-Style Interface** | CSS animations + overlays | Industrial monitoring aesthetic |
| **Interactive Decision Tree** | Branching scenario logic | Test critical thinking under pressure |
| **Dynamic Theme Switching** | CSS class toggling | Visual crisis escalation feedback |
| **Chart.js Visualization** | Real-time line chart | Pit volume trend monitoring |
| **Stress Meter** | Gradient progress bar | Visual pressure indicator |

### Educational Objectives

1. **Recognition:** Identify early kick indicators (pit gain, flow imbalance)
2. **Decision-Making:** Choose data over schedule pressure
3. **Action:** Execute BOP shut-in procedure under stress
4. **Reflection:** Understand consequences of poor decisions

---

## Core Concepts

### Cognitive Lens System

The simulator presents the same technical scenario through three metaphorical "lenses":

| Lens | Metaphor | Target Audience | Design Pattern |
|------|----------|----------------|----------------|
| **Mechanic** | Toolpusher (Boss) vs Logger (Data) | Drilling engineers | Direct industry analogy |
| **Gamer** | Raid Leader vs Healer | Gaming community | MMO raid mechanics |
| **Athlete** | Coach vs Spotter | Sports background | Football play calling |

**Educational Theory:** Cognitive scaffolding through domain transfer - learners map familiar concepts to unfamiliar technical scenarios.

### Crisis Scenario Flow

```
NORMAL OPERATIONS
    ↓
DRILLING BREAK DETECTED (Early Indicator)
    ↓
CONFLICT: Boss pressures to continue drilling
    ↓
DECISION POINT: Trust schedule OR trust data?
    ↓
    ├─ Continue Drilling → BLOWOUT (FAIL)
    │
    └─ Flow Check → Kick Confirmed
         ↓
         Activate BOP → Well Secured (SUCCESS)
```

---

## Data Structures

### Global State Variables

```javascript
let currentLens = 'mechanic';    // Active cognitive lens
let chart;                        // Chart.js instance
let timeStep = 0;                 // Simulation tick counter
let pitVolume = 100;              // Pit volume in barrels (baseline: 100 bbl)
let flowOut = 50;                 // Flow out percentage
let simInterval;                  // setInterval reference
let isKicking = false;            // Kick state flag
let stressLevel = 10;             // Stress meter value (0-100)
```

### Lenses Data Model

```javascript
const Lenses = {
    mechanic: {
        id: 'mechanic',
        icon: 'wrench',
        hint: "MECHANIC LENS: The Toolpusher (Boss) is focused on schedule. The Logger (Data) is focused on anomalies. You are the filter.",
        msgPush: "PUSHER: We are behind schedule. I want 200ft before lunch. Keep that bit turning!",
        msgMud: "LOGGER: Getting weird torque readings. Possible bearing failure? Maybe formation change?",
        color: "text-slate-400"
    },
    gamer: {
        id: 'gamer',
        icon: 'game-controller',
        hint: "GAMER LENS: Raid Leader (Pusher) calls for DPS burn. Healer (Logger) is calling OOM. You are the Tank.",
        msgPush: "PUSHER: DPS is low! Burn phase now! Don't stop casting!",
        msgMud: "LOGGER: Adds spawned! I think we pulled aggro (Influx). Check connection!",
        color: "text-purple-400"
    },
    athlete: {
        id: 'athlete',
        icon: 'whistle',
        hint: "ATHLETE LENS: Coach (Pusher) calls the play. Spotter (Logger) sees the defense shift. You are QB.",
        msgPush: "PUSHER: Run the play! No audibles! We need this touchdown now.",
        msgMud: "LOGGER: They are blitzing! The line is breaking! Watch the blind side!",
        color: "text-emerald-400"
    }
};
```

**Design Rationale:**
- **Mechanic:** Direct drilling terminology (industry standard)
- **Gamer:** MMORPG raid mechanics (DPS/Healer roles map to Drilling/Monitoring)
- **Athlete:** Football play-calling (QB decision-making under pressure)

### Decision Choice Schema

```javascript
{
    txt: "DISAGREE: Flow Check",           // Button label
    sub: "Trust the data",                 // Subtitle hint
    act: "flowcheck",                      // Action identifier
    icon: "eye",                           // Phosphor icon name
    danger: false                          // Visual styling flag
}
```

---

## Navigation & UI Functions

### `navigate(viewId)`

**Purpose:** Handle view switching in single-page application

**Location:** `crisis-command.html:383-394`

**Implementation:**
```javascript
function navigate(viewId) {
    const target = document.getElementById(`view-${viewId}`);
    if(target) {
        target.classList.add('view-active');
        target.classList.add('animate-fade-in');
    }

    if(viewId === 'mod_crm') {
        initChart();
    }
}
```

**Parameters:**
- `viewId` (string): View section ID (e.g., "mod_crm")

**Side Effects:**
- Adds `.view-active` class to show view
- Adds `.animate-fade-in` animation class
- Triggers `initChart()` for CRM module

**Current Usage:** Designed for multi-module expansion (currently single-module)

---

### `setLens(lens)`

**Purpose:** Switch cognitive filtering lens

**Location:** `crisis-command.html:396-416`

**Implementation:**
```javascript
function setLens(lens) {
    currentLens = lens;
    const data = Lenses[lens];

    // Update Hint with fade transition
    const hintEl = document.getElementById('crm-hint');
    hintEl.style.opacity = 0;
    setTimeout(() => {
        hintEl.innerText = data.hint;
        hintEl.style.opacity = 1;
    }, 200);

    // Update Button States
    document.querySelectorAll('.lens-btn').forEach(b => {
        b.classList.remove('bg-brand', 'text-black', 'shadow-lg', 'scale-110');
        b.classList.add('text-slate-500');
    });
    const btn = document.getElementById(`btn-${lens}`);
    btn.classList.remove('text-slate-500');
    btn.classList.add('bg-brand', 'text-black', 'shadow-lg', 'scale-110');
}
```

**Parameters:**
- `lens` (string): Lens identifier ("mechanic" | "gamer" | "athlete")

**Visual Updates:**
1. **Hint Box:** Fades out, updates text, fades in (200ms transition)
2. **Button States:** Highlights active lens, dims others
3. **Global State:** Updates `currentLens` for message templates

**Educational Impact:** Allows learners to compare different mental models for same scenario

---

## Chart Visualization Functions

### `initChart()`

**Purpose:** Initialize Chart.js pit volume visualization

**Location:** `crisis-command.html:419-459`

**Implementation:**
```javascript
function initChart() {
    if(chart) return;  // Prevent duplicate initialization
    const ctx = document.getElementById('pitChart').getContext('2d');

    // Create vertical gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.2)');  // Brand cyan
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Vol',
                data: [],
                borderColor: '#06b6d4',       // Cyan line
                borderWidth: 2,
                pointRadius: 0,               // No point markers
                fill: true,
                backgroundColor: gradient,
                tension: 0.4                  // Smooth curves
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,                 // Disable for real-time performance
            scales: {
                x: { display: false },        // Hide time axis
                y: {
                    min: 98,                  // Focus on critical range
                    max: 110,
                    grid: { color: '#1e293b' },
                    ticks: {
                        color: '#64748b',
                        font: { family: 'JetBrains Mono', size: 10 }
                    }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}
```

**Chart Configuration:**

| Setting | Value | Rationale |
|---------|-------|-----------|
| **Y-axis range** | 98-110 bbl | Focuses on kick detection window |
| **Animation** | Disabled | Real-time updates require performance |
| **Point radius** | 0 | Clean line without markers |
| **Tension** | 0.4 | Smooth curves for readability |
| **Font** | JetBrains Mono | Monospace for technical aesthetic |

**Color Coding During Simulation:**
- **Normal:** `#06b6d4` (Cyan) - Baseline drilling
- **Warning:** `#F59E0B` (Amber) - Drilling break detected
- **Crisis:** `#DC2626` (Red) - Kick confirmed

---

## Simulation Logic Functions

### `startGame()`

**Purpose:** Initialize/restart simulation scenario

**Location:** `crisis-command.html:462-488`

**Implementation:**
```javascript
function startGame() {
    // Reset UI Elements
    document.getElementById('chat-feed').innerHTML = "";
    document.getElementById('response-area').innerHTML = "";
    document.body.classList.remove('theme-crisis');

    // Reset Branding to Default
    const brandLogo = document.getElementById('brand-logo');
    brandLogo.className = 'w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-900 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-500';
    document.getElementById('brand-title').classList.remove('text-red-500');
    document.getElementById('brand-subtitle').innerText = "Training";
    document.getElementById('brand-subtitle').classList.remove('text-red-500');

    // Reset Simulation Variables
    pitVolume = 100;
    flowOut = 50;
    timeStep = 0;
    isKicking = false;
    stressLevel = 10;
    updateStress();

    // Initial System Message
    addMsg("SYSTEM", "Shift Handover Complete. Drilling ahead at 150 fph. Formation: Sandstone.", "msg-mud");

    // Start Simulation Loop
    if(simInterval) clearInterval(simInterval);
    simInterval = setInterval(tick, 500);  // 500ms tick rate
}
```

**Reset Sequence:**
1. Clear chat log and response buttons
2. Remove crisis theme CSS
3. Reset brand logo/subtitle to normal state
4. Initialize simulation variables to baseline
5. Display handover message
6. Start 500ms tick interval

**Tick Rate:** 500ms chosen to balance real-time feel with readability

---

### `stopSim()`

**Purpose:** Halt simulation loop

**Location:** `crisis-command.html:490-492`

**Implementation:**
```javascript
function stopSim() {
    if(simInterval) clearInterval(simInterval);
}
```

**Called By:**
- `makeDecision('shutin')` - After successful BOP activation
- `failScenario()` - After failure condition

---

### `tick()`

**Purpose:** Main simulation loop - executes every 500ms

**Location:** `crisis-command.html:494-568`

**Flow:**
```javascript
function tick() {
    timeStep++;

    // === SCENARIO SCRIPT ===

    // Step 1: Normal Operations (timeStep === 4)
    if(timeStep === 4) {
        addMsg("PUSHER", Lenses[currentLens].msgPush, "msg-pusher");
    }

    // Step 2: Kick Starts (timeStep === 12)
    if(timeStep === 12) {
        isKicking = true;
        chart.data.datasets[0].borderColor = "#F59E0B";  // Change to amber
        chart.data.datasets[0].backgroundColor = "rgba(245, 158, 11, 0.1)";
        addMsg("LOGGER", "Driller, drilling break detected. ROP just doubled to 300. Connection gas is rising.", "msg-mud");
        stressLevel = 30;
        updateStress();
    }

    // Step 3: Conflict (timeStep === 18)
    if(timeStep === 18) {
        addMsg("PUSHER", "Ignore him. It's just background gas from the sand. Don't stop drilling, we are behind schedule!", "msg-pusher");
        stressLevel = 50;
        updateStress();

        setChoices([
            { txt: "AGREE: Continue Drilling", sub: "Trust the schedule", act: "drill", icon: "arrow-circle-down", danger: false },
            { txt: "DISAGREE: Flow Check", sub: "Trust the data", act: "flowcheck", icon: "eye", danger: false }
        ]);
    }

    // === PHYSICS ENGINE ===
    if(isKicking) {
        pitVolume += 0.15;   // Influx rate: +0.15 bbl per tick
        flowOut += 0.8;      // Flow imbalance

        // Trigger Crisis Mode at 103 bbl
        if(pitVolume > 103 && !document.body.classList.contains('theme-crisis')) {
            activateCrisisMode();
        }
    } else {
        // Add noise to baseline
        pitVolume = 100 + (Math.random() * 0.2);
        flowOut = 50 + (Math.random() * 2);
    }

    // === UPDATE DOM ===
    document.getElementById('val-flow').innerText = Math.round(flowOut);
    document.getElementById('chart-val').innerText = pitVolume.toFixed(1) + " bbl";

    // Update Chart (rolling window of 30 points)
    if(chart.data.labels.length > 30) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.data.labels.push(timeStep);
    chart.data.datasets[0].data.push(pitVolume);
    chart.update();
}
```

**Timing Breakdown:**

| TimeStep | Elapsed Time | Event |
|----------|-------------|-------|
| 4 | 2 seconds | Pusher pressures for drilling |
| 12 | 6 seconds | Kick starts (drilling break) |
| 18 | 9 seconds | Conflict + Decision point |

**Physics Parameters:**

| Variable | Rate | Unit | Notes |
|----------|------|------|-------|
| **Pit Gain** | +0.15 | bbl/tick | Represents influx from formation |
| **Flow Imbalance** | +0.8 | %/tick | Flow out exceeds flow in |
| **Crisis Threshold** | 103 | bbl | +3 bbl from baseline triggers alert |
| **Baseline Noise** | ±0.2 | bbl | Simulates normal fluctuations |

**Chart Rolling Window:** Maintains last 30 data points for readability

---

### `activateCrisisMode()`

**Purpose:** Trigger visual crisis escalation when pit volume exceeds threshold

**Location:** `crisis-command.html:570-591`

**Implementation:**
```javascript
function activateCrisisMode() {
    document.body.classList.add('theme-crisis');

    // Change Branding to Red
    const brandLogo = document.getElementById('brand-logo');
    brandLogo.className = 'w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all duration-500 animate-pulse';
    document.getElementById('brand-title').classList.add('text-red-500');
    document.getElementById('brand-subtitle').innerText = "CRISIS EVENT";
    document.getElementById('brand-subtitle').classList.add('text-red-500');

    // Update Status Indicator
    document.getElementById('sim-status-dot').classList.remove('bg-success');
    document.getElementById('sim-status-dot').classList.add('bg-danger', 'animate-ping');
    document.getElementById('sim-status-text').innerText = "WELL CONTROL EVENT";
    document.getElementById('sim-status-text').classList.add('text-danger');

    // Change Chart to Red
    chart.data.datasets[0].borderColor = "#DC2626";
    chart.data.datasets[0].backgroundColor = "rgba(220, 38, 38, 0.2)";

    // Enable BOP Glow Effect
    document.getElementById('bop-glow').classList.remove('opacity-0');
}
```

**Visual Changes:**

| Element | Normal | Crisis |
|---------|--------|--------|
| **Brand Logo** | Cyan gradient | Red, pulsing |
| **Brand Subtitle** | "Training" | "CRISIS EVENT" |
| **Status Dot** | Green, static | Red, pinging |
| **Status Text** | "NORMAL OPERATIONS" | "WELL CONTROL EVENT" |
| **Chart Line** | Cyan (#06b6d4) | Red (#DC2626) |
| **BOP Glow** | Hidden | Visible (red blur) |

**CSS Theme Class:** `.theme-crisis` enables crisis-specific styling across UI

---

## Interaction Functions

### `addMsg(role, text, cssClass="msg-user")`

**Purpose:** Add message to chat feed

**Location:** `crisis-command.html:594-601`

**Implementation:**
```javascript
function addMsg(role, text, cssClass="msg-user") {
    const feed = document.getElementById('chat-feed');
    const div = document.createElement('div');
    div.className = `msg-bubble ${cssClass} animate-fade-in`;
    div.innerHTML = `<strong class="block text-[10px] opacity-70 mb-1">${role}</strong>${text}`;
    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;  // Auto-scroll to bottom
}
```

**Parameters:**
- `role` (string): Sender identifier (PUSHER | LOGGER | YOU | SYSTEM | ALARM)
- `text` (string): Message content
- `cssClass` (string): CSS class for styling

**Message Types:**

| Class | Color | Use Case |
|-------|-------|----------|
| `msg-pusher` | Amber | Toolpusher (schedule pressure) |
| `msg-mud` | Cyan | Logger/Mud Engineer (data) |
| `msg-user` | White | Player actions |
| `msg-alarm` | Red | Critical alerts |

**Auto-Scroll:** Always scrolls to latest message for visibility

---

### `setChoices(opts)`

**Purpose:** Display decision buttons in response area

**Location:** `crisis-command.html:603-621`

**Implementation:**
```javascript
function setChoices(opts) {
    const area = document.getElementById('response-area');
    area.innerHTML = "";
    opts.forEach(o => {
        const btn = document.createElement('button');
        btn.className = `group w-full p-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-all text-left flex items-center gap-3 mb-2 shadow-sm hover:shadow-md hover:border-brand`;
        btn.onclick = () => makeDecision(o.act);
        btn.innerHTML = `
            <div class="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                <i class="ph ph-${o.icon}"></i>
            </div>
            <div>
                <div class="text-xs font-bold text-white">${o.txt}</div>
                <div class="text-[10px] text-slate-500 group-hover:text-brand transition-colors">${o.sub}</div>
            </div>
        `;
        area.appendChild(btn);
    });
}
```

**Example Usage:**
```javascript
setChoices([
    {
        txt: "AGREE: Continue Drilling",
        sub: "Trust the schedule",
        act: "drill",
        icon: "arrow-circle-down",
        danger: false
    },
    {
        txt: "DISAGREE: Flow Check",
        sub: "Trust the data",
        act: "flowcheck",
        icon: "eye",
        danger: false
    }
]);
```

**Button Structure:**
```
┌─────────────────────────────────┐
│ [Icon] DECISION TEXT            │
│        Hint subtitle            │
└─────────────────────────────────┘
```

**Hover Effects:**
- Border color changes to cyan
- Icon color changes to white
- Subtitle color changes to cyan

---

### `makeDecision(act)`

**Purpose:** Handle player decision and branch scenario

**Location:** `crisis-command.html:623-667`

**Implementation:**
```javascript
function makeDecision(act) {
    document.getElementById('response-area').innerHTML = "<span class='text-xs text-slate-500 animate-pulse'>Transmitting Command...</span>";

    if(act === 'drill') {
        // FAILURE PATH
        addMsg("YOU", "Copy Pusher. Drilling ahead.");
        setTimeout(() => {
            addMsg("ALARM", "🚨 CRITICAL ALARM: RAPID PIT GAIN (+15 BBLS)", "msg-alarm");
            activateCrisisMode();
            failScenario("BLOWOUT IMMINENT. You prioritized the schedule over critical indicators.");
        }, 2000);
    }
    else if(act === 'flowcheck') {
        // SUCCESS PATH STEP 1
        addMsg("YOU", "Negative. I see positive indicators. Picking up to Flow Check.", "msg-user border-l-2 border-brand");
        addMsg("PUSHER", "Don't waste my time...", "msg-pusher");

        setTimeout(() => {
            addMsg("DRILL FLOOR", "Pumps off. Well is flowing! It's a Kick!", "msg-mud font-bold");
            activateCrisisMode();
            setChoices([
                {
                    txt: "ACTIVATE BOP (SHUT IN)",
                    sub: "Secure the well immediately",
                    act: "shutin",
                    icon: "siren",
                    danger: true
                }
            ]);
        }, 2000);
    }
    else if(act === 'shutin') {
        // SUCCESS PATH STEP 2
        addMsg("YOU", "Space out! Shutting in!", "msg-alarm");
        isKicking = false;  // Stop physics simulation
        stopSim();

        // Visual Success Feedback
        document.getElementById('btn-shutin').classList.add('bg-green-600', 'border-green-800');
        document.getElementById('bop-glow').classList.remove('bg-red-500/20');
        document.getElementById('bop-glow').classList.add('bg-green-500/20');

        setTimeout(() => {
            addMsg("SYSTEM", "BOP CLOSED. PRESSURE STABILIZED.", "msg-mud text-green-400 font-bold");
            winScenario();
        }, 2000);
    }
}
```

**Decision Tree:**

```
makeDecision()
    ├─ "drill"
    │   ├─ 2s delay
    │   ├─ ALARM message
    │   └─ failScenario() → GAME OVER
    │
    ├─ "flowcheck"
    │   ├─ 2s delay
    │   ├─ Kick confirmed message
    │   └─ setChoices([shutin]) → Next decision
    │
    └─ "shutin"
        ├─ Stop physics
        ├─ Visual success feedback
        ├─ 2s delay
        └─ winScenario() → SUCCESS
```

**2-Second Delays:** Create tension and simulate action execution time

---

## Scenario Outcome Functions

### `failScenario(reason)`

**Purpose:** Handle failure state

**Location:** `crisis-command.html:669-676`

**Implementation:**
```javascript
function failScenario(reason) {
    stopSim();
    document.getElementById('stress-bar').style.width = "100%";
    document.getElementById('stress-bar').classList.add('bg-red-600');
    setTimeout(() => {
        alert("SCENARIO FAILED: " + reason);
    }, 500);
}
```

**Visual Feedback:**
1. Stop simulation loop
2. Set stress bar to 100% (full panic)
3. Change stress bar to red
4. Display failure alert with reason

**Educational Value:** Explicit consequence messaging reinforces learning

---

### `winScenario()`

**Purpose:** Handle success state

**Location:** `crisis-command.html:678-690`

**Implementation:**
```javascript
function winScenario() {
    document.getElementById('stress-bar').style.width = "0%";
    document.getElementById('response-area').innerHTML = `
        <div class="text-center p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black mx-auto mb-2 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <i class="ph ph-check font-bold text-xl"></i>
            </div>
            <h3 class="text-white font-bold text-sm mb-1">GOOD DECISION</h3>
            <p class="text-[10px] text-slate-300 mb-3">You successfully identified the kick and shut in the well despite social pressure.</p>
            <a href="courses.html" class="inline-block px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-xs font-bold transition-colors">Return to Courses</a>
        </div>
    `;
}
```

**Success Message Components:**
- **Checkmark Icon:** Visual confirmation
- **Title:** "GOOD DECISION"
- **Explanation:** Reinforces learning objective
- **Return Link:** Navigation back to course menu

**Stress Bar Reset:** Returns to 0% (calm state)

---

### `updateStress()`

**Purpose:** Update stress meter visual

**Location:** `crisis-command.html:692-695`

**Implementation:**
```javascript
function updateStress() {
    const bar = document.getElementById('stress-bar');
    bar.style.width = stressLevel + "%";
}
```

**Stress Levels:**

| Event | Stress Level | Color (Gradient) |
|-------|--------------|------------------|
| Normal ops | 10% | Green |
| Drilling break | 30% | Green → Amber transition |
| Conflict | 50% | Amber |
| Crisis mode | 70%+ | Amber → Red transition |
| Failure | 100% | Full Red |

**Gradient Bar:** `from-success via-accent to-danger` creates smooth color transition

---

## Integration Examples

### Example 1: Adding a New Lens

```javascript
// Add to Lenses object
const Lenses = {
    // ... existing lenses
    military: {
        id: 'military',
        icon: 'shield-star',
        hint: "MILITARY LENS: Commander (Pusher) orders the mission. Intel Officer (Logger) reports enemy movement. You are Field Leader.",
        msgPush: "COMMANDER: Mission timeline is critical. Proceed with assault. No delays!",
        msgMud: "INTEL: Sir, detecting unexpected enemy positions. Recommend reconnaissance.",
        color: "text-amber-400"
    }
};

// Add button to lens selector HTML
<button onclick="setLens('military')" id="btn-military" class="lens-btn ...">
    <i class="ph ph-shield-star"></i>
</button>
```

---

### Example 2: Custom Scenario Script

```javascript
// In tick() function, add new scenario branch
if(timeStep === 25) {
    addMsg("ALARM", "Secondary indicator: Chloride spike detected in returns!", "msg-alarm");
    stressLevel = 60;
    updateStress();
}

if(timeStep === 30) {
    setChoices([
        {
            txt: "CIRCULATE BOTTOMS UP",
            sub: "Investigate chlorides",
            act: "circulate",
            icon: "arrows-clockwise",
            danger: false
        }
    ]);
}
```

---

### Example 3: Adjusting Physics Parameters

```javascript
// Make kick more aggressive
if(isKicking) {
    pitVolume += 0.30;  // Doubled influx rate
    flowOut += 1.5;     // Faster flow imbalance
}

// Lower crisis threshold
if(pitVolume > 102 && !document.body.classList.contains('theme-crisis')) {
    activateCrisisMode();  // Trigger at +2 bbl instead of +3
}
```

---

### Example 4: Export Scenario Data

```javascript
function exportScenarioLog() {
    const log = {
        lens: currentLens,
        finalPitVolume: pitVolume,
        finalStress: stressLevel,
        timeElapsed: timeStep * 0.5,  // Convert to seconds
        decisions: [],  // Would need to track in makeDecision()
        outcome: 'success'  // or 'failure'
    };

    const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crisis_log_${Date.now()}.json`;
    a.click();
}
```

---

## Educational Design Patterns

### 1. Cognitive Scaffolding Through Metaphor

**Pattern:** Map unfamiliar technical concepts to familiar domains

**Implementation:**
```javascript
// Technical scenario
"LOGGER: Getting weird torque readings. Possible bearing failure?"

// Gamer translation
"LOGGER: Adds spawned! I think we pulled aggro (Influx). Check connection!"

// Athlete translation
"LOGGER: They are blitzing! The line is breaking! Watch the blind side!"
```

**Educational Theory:** Schema activation - learners use existing mental models to understand new information

---

### 2. Time Pressure Simulation

**Pattern:** 500ms tick rate creates urgency without overwhelming

**Design Rationale:**
- Too fast (< 300ms): Learners can't read messages
- Too slow (> 1000ms): No sense of urgency
- 500ms: Sweet spot for reading + decision-making

**Stress Escalation:**
```
TimeStep 0-10:  Low stress, normal ops
TimeStep 12-18: Medium stress, conflicting info
TimeStep 18+:   High stress, critical decision
```

---

### 3. Branching Consequence Feedback

**Pattern:** Immediate, explicit consequences for decisions

**Good Decision Path:**
```
Flow Check → Kick Confirmed → BOP Activation → Success Message
```

**Bad Decision Path:**
```
Continue Drilling → Rapid Pit Gain → Blowout Alert → Failure Message
```

**Learning Reinforcement:** Clear cause-effect relationship strengthens retention

---

### 4. Visual Crisis Escalation

**Pattern:** Multi-sensory feedback for state changes

**Escalation Hierarchy:**
1. **Chart Color:** Cyan → Amber → Red
2. **Brand Logo:** Cyan gradient → Red pulsing
3. **Status Text:** "NORMAL" → "WELL CONTROL EVENT"
4. **Stress Meter:** 10% → 50% → 100%
5. **BOP Glow:** Hidden → Visible red blur

**Cognitive Load:** Multiple channels prevent tunnel vision on single indicator

---

## Technical Architecture

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **UI Framework** | Tailwind CSS | 3.x | Utility-first styling |
| **Icons** | Phosphor Icons | Web | Consistent iconography |
| **Charting** | Chart.js | 4.x | Real-time line chart |
| **Fonts** | Google Fonts | - | Inter (UI), JetBrains Mono (data) |
| **JavaScript** | Vanilla ES6+ | - | No framework dependencies |

---

### Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| **Tick Rate** | 500ms | 2 ticks per second |
| **Chart Updates** | Every tick | 120 updates/minute |
| **Chart Points** | 30 max | Rolling window for performance |
| **Message Animation** | 300ms fade-in | CSS transition |
| **Decision Delay** | 2000ms | Simulates action execution |

---

### CSS Architecture

#### CCTV Effect

```css
.cctv-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
        linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),  /* Scanlines */
        linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));  /* RGB shift */
    background-size: 100% 2px, 3px 100%;
    z-index: 5;
}

.cctv-scanline {
    width: 100%;
    height: 2px;
    background: rgba(6, 182, 212, 0.3);
    position: absolute;
    animation: scan 4s linear infinite;
    box-shadow: 0 0 4px rgba(6, 182, 212, 0.5);
}

@keyframes scan {
    0% { top: 0%; }
    100% { top: 100%; }
}
```

**Effect Components:**
1. **Horizontal scanlines:** 2px spacing creates CRT monitor effect
2. **RGB shift:** Subtle chromatic aberration
3. **Animated scanline:** Moving highlight bar (4s cycle)

---

#### Tech Background Grid

```css
.tech-bg {
    background-image: radial-gradient(#1e293b 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.3;
}
```

**Purpose:** Subtle industrial/technical aesthetic without distraction

---

#### Dynamic Theme Classes

```css
/* Normal State */
.nav-item.active {
    border-left: 3px solid #06b6d4;  /* Cyan */
    background: rgba(6, 182, 212, 0.1);
}

/* Crisis State */
.theme-crisis .nav-item.active {
    border-left: 3px solid #DC2626;  /* Red */
    background: rgba(220, 38, 38, 0.1);
}

.theme-crisis .brand-text {
    color: #DC2626;
    text-shadow: 0 0 10px rgba(220,38,38,0.5); /* Red glow */
}
```

**State Management:** Single body class controls theme across entire UI

---

### Browser Compatibility

| Feature | Requirement | Fallback |
|---------|-------------|----------|
| **ES6 Template Literals** | Chrome 41+ | None (required) |
| **Arrow Functions** | Chrome 45+ | None (required) |
| **Canvas 2D** | All modern browsers | Chart won't render |
| **CSS Grid** | Chrome 57+ | Flexbox alternative |
| **CSS Animations** | All modern browsers | Static UI |

**Minimum Browser Versions:**
- Chrome 57+
- Firefox 52+
- Safari 10.1+
- Edge 16+

---

## Data Flow Diagram

```
User Clicks "START"
    ↓
startGame()
    ↓
setInterval(tick, 500ms)
    ↓
tick() → timeStep++
    ↓
    ├─ Scenario Script (if statements)
    │   ├─ addMsg() → Update chat
    │   ├─ setChoices() → Display buttons
    │   └─ updateStress() → Update meter
    │
    ├─ Physics Engine
    │   ├─ pitVolume += 0.15 (if kicking)
    │   ├─ flowOut += 0.8
    │   └─ activateCrisisMode() (if threshold)
    │
    └─ DOM Updates
        ├─ Update flow display
        ├─ Update pit volume text
        └─ chart.update()

User Clicks Decision
    ↓
makeDecision(action)
    ↓
    ├─ "drill" → failScenario()
    │
    ├─ "flowcheck" → setChoices([shutin])
    │
    └─ "shutin" → winScenario()
```

---

## Security Considerations

### XSS Prevention

**Risk:** User input (if added) could inject scripts

**Current Status:** No user input accepted - all messages are template literals

**If Adding User Input:**
```javascript
// BAD
addMsg("USER", userInput);  // XSS vulnerable

// GOOD
addMsg("USER", userInput.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
```

---

### Timing Attack Mitigation

**Risk:** Predictable scenario timing could be gamed

**Solution:** Add random variance
```javascript
// Instead of fixed timeStep checks
if(timeStep === 18) { ... }

// Use random range
const conflictTime = 16 + Math.floor(Math.random() * 5);  // 16-20
if(timeStep === conflictTime) { ... }
```

---

## Future Enhancements

### Planned Features

1. **Multi-Scenario Support**
   - Lost circulation scenario
   - Stuck pipe scenario
   - H2S detection scenario

2. **Performance Tracking**
   - Response time metrics
   - Decision accuracy scoring
   - Leaderboard integration

3. **Replay System**
   - Record all decisions
   - Replay scenario with annotations
   - Export for review

4. **Advanced Physics**
   - Realistic kick model with gas migration
   - Bottomhole pressure calculations
   - Temperature effects on gas expansion

5. **Multiplayer Mode**
   - Multiple students take different roles
   - Real-time collaboration
   - Instructor observation mode

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Three cognitive lenses (Mechanic, Gamer, Athlete)
- ✅ Real-time Chart.js visualization
- ✅ CCTV-style interface aesthetic
- ✅ Branching decision tree
- ✅ Crisis mode dynamic theming
- ✅ Stress meter visualization
- ✅ Success/failure feedback

### Version 0.9.0 (Beta)
- Initial scenario implementation
- Basic chat log
- Simplified physics

### Version 0.5.0 (Alpha)
- Static UI mockup
- No simulation logic

---

## Related Documentation

- **[Well Operations Planner API](./WELL_OPERATIONS_PLANNER_API.md)** - Production planning with clash detection
- **[Operations Dashboard API](./OPERATIONS_DASHBOARD_API.md)** - Risk analysis algorithms
- **[Equipment Catalog API](./EQUIPMENT_CATALOG_API.md)** - Equipment database schema
- **[Documentation Hub](./README.md)** - Central index for all WellTegra documentation

---

## Support

For questions or issues with the Crisis Command Center:

1. Review [Educational Design Patterns](#educational-design-patterns)
2. Check [Integration Examples](#integration-examples)
3. See the main [README.md](../README.md) for contact information

**Last Updated:** 2025-12-25
**Maintained by:** Ken McKenzie
**Educational Framework:** Cognitive scaffolding through domain transfer
