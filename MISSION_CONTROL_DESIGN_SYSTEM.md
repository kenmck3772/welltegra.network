# WellTegra Mission Control Design System
## Industrial AI Command Center Architecture

**Version:** 2.0
**Target Aesthetic:** Palantir / Bloomberg Terminal / SpaceX Mission Control
**Status:** Phase 2 Implementation Guide

---

## 1. Component Architecture

### React Component Tree (Landing Page)

```
<MissionControlApp>
├── <ArchitectureOverlay />          // X-Ray mode annotations
├── <CollapsibleSidebar>             // Left vertical dock
│   ├── <SidebarLogo />
│   ├── <SidebarNavItem icon="⚡" />  // Brahan Engine
│   ├── <SidebarNavItem icon="🏗️" /> // Intervention Planner
│   ├── <SidebarNavItem icon="🚨" /> // Crisis Simulator
│   ├── <SidebarNavItem icon="📦" /> // Equipment
│   └── <SidebarNavItem icon="ℹ️" /> // About
├── <SystemHUD>                      // Status overlays
│   ├── <TopRightStatus />           // "Vertex AI: ONLINE"
│   └── <BottomLeftStatus />         // "Active Rig: Thistle Alpha"
├── <ThreeDBackground>               // React Three Fiber wellbore
│   └── <WellboreViewer />
└── <MainContent>
    ├── <HeroOverlay />              // Glassmorphism hero card
    ├── <DataPipelineViz />          // 11 Pillars flow
    ├── <RadioTranscriptChat />      // Brahan Engine
    └── <CrisisSimulator />          // NPT counter
```

### File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── CollapsibleSidebar.jsx
│   │   ├── SystemHUD.jsx
│   │   └── ArchitectureOverlay.jsx
│   ├── hero/
│   │   ├── ThreeDBackground.jsx
│   │   └── HeroOverlay.jsx
│   ├── features/
│   │   ├── RadioTranscriptChat.jsx
│   │   ├── DataPipelineViz.jsx
│   │   └── CrisisSimulator.jsx
│   └── ui/
│       ├── GlassmorphPanel.jsx
│       ├── StatusBadge.jsx
│       └── ArchitectureAnnotation.jsx
├── hooks/
│   ├── useArchitectureMode.js
│   └── useThreeDScene.js
└── styles/
    ├── glassmorphism.css
    └── mission-control.css
```

---

## 2. Glassmorphism Design System

### Tailwind Class Strategy

#### Base Glassmorphism Panel

```jsx
// Primary Panel (High Visibility)
className="
  backdrop-blur-md
  bg-slate-900/80
  border border-white/10
  rounded-lg
  shadow-2xl
  shadow-blue-500/20
"

// Secondary Panel (Subtle Background)
className="
  backdrop-blur-sm
  bg-slate-900/60
  border border-white/5
  rounded-md
"

// Alert Panel (Danger/Physics Constraint)
className="
  backdrop-blur-md
  bg-orange-500/10
  border border-orange-500/30
  rounded-lg
  shadow-lg
  shadow-orange-500/20
"

// Success Panel (AI Status Online)
className="
  backdrop-blur-md
  bg-blue-500/10
  border border-blue-500/30
  rounded-lg
  shadow-lg
  shadow-blue-500/20
"
```

#### HUD Status Badge

```jsx
className="
  backdrop-blur-lg
  bg-slate-950/90
  border border-cyan-400/30
  px-4 py-2
  rounded-full
  font-mono text-xs
  text-cyan-400
  shadow-lg
  shadow-cyan-400/20
  inline-flex items-center gap-2
"

// Example usage:
<div className="backdrop-blur-lg bg-slate-950/90 border border-cyan-400/30...">
  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
  <span>Vertex AI: ONLINE</span>
  <span className="text-slate-400">|</span>
  <span>Latency: 42ms</span>
</div>
```

#### Sidebar Dock (Collapsed State)

```jsx
// Collapsed (icon-only)
className="
  fixed left-0 top-0 h-screen
  w-16
  backdrop-blur-xl
  bg-slate-950/95
  border-r border-white/10
  flex flex-col items-center
  py-4 gap-4
  transition-all duration-300
"

// Expanded (with labels)
className="
  fixed left-0 top-0 h-screen
  w-64
  backdrop-blur-xl
  bg-slate-950/95
  border-r border-white/10
  flex flex-col
  py-4 px-4 gap-2
  transition-all duration-300
"
```

#### Sidebar Nav Item

```jsx
className="
  group
  relative
  w-12 h-12
  rounded-lg
  backdrop-blur-md
  bg-slate-800/50
  hover:bg-blue-500/20
  border border-transparent
  hover:border-blue-500/50
  flex items-center justify-center
  transition-all duration-200
  cursor-pointer
  hover:shadow-lg
  hover:shadow-blue-500/20
"

// Active state
className="... bg-blue-500/30 border-blue-500/70 shadow-lg shadow-blue-500/30"

// Tooltip (on hover when collapsed)
className="
  absolute left-16
  backdrop-blur-lg
  bg-slate-950/95
  border border-white/10
  px-3 py-1
  rounded-md
  text-sm font-mono
  whitespace-nowrap
  opacity-0 group-hover:opacity-100
  pointer-events-none
  transition-opacity
  duration-200
"
```

---

## 3. Color Palette (Industrial Safety)

### CSS Variables (Tailwind Config Extension)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Base Slate (Mission Control Dark)
        'slate': {
          950: '#0a0e1a',  // Deepest background
          900: '#0f172a',  // Primary background
          800: '#1e293b',  // Secondary panels
        },

        // Safety Orange (Physics Constraints / Alerts)
        'safety': {
          500: '#ff6b35',  // Primary orange
          400: '#ff8555',  // Lighter
          600: '#e55a2a',  // Darker
        },

        // Signal Blue (AI Status / Active Elements)
        'signal': {
          500: '#3b82f6',  // Primary blue
          400: '#60a5fa',  // Lighter
          600: '#2563eb',  // Darker
        },

        // Success Green (System Online)
        'success': {
          500: '#14b8a6',  // Teal
          400: '#2dd4bf',
        },

        // Warning Amber (Caution States)
        'warning': {
          500: '#f59e0b',
          400: '#fbbf24',
        },
      },

      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },

      boxShadow: {
        'glow-blue': '0 0 40px rgba(59, 130, 246, 0.3)',
        'glow-orange': '0 0 40px rgba(255, 107, 53, 0.3)',
        'glow-cyan': '0 0 40px rgba(20, 184, 166, 0.3)',
      },
    },
  },
}
```

---

## 4. X-Ray Architecture Mode

### React State Management

```jsx
// hooks/useArchitectureMode.js
import { create } from 'zustand';

export const useArchitectureMode = create((set) => ({
  isXRayEnabled: false,
  toggleXRay: () => set((state) => ({ isXRayEnabled: !state.isXRayEnabled })),

  // Annotation registry
  annotations: [
    {
      id: 'wellbore-3d',
      target: '.wellbore-viewer',
      label: 'Three.js / WebGL Context',
      tech: 'React Three Fiber',
      position: { x: 200, y: 100 }
    },
    {
      id: 'brahan-chat',
      target: '.brahan-engine',
      label: 'GCP Vertex AI / PaLM 2 Endpoint',
      tech: 'Web Speech API',
      position: { x: 400, y: 300 }
    },
    {
      id: 'data-pipeline',
      target: '.forensic-flow',
      label: 'BigQuery → Vertex AI → RLM Chain',
      tech: '11-Agent Multi-Persona System',
      position: { x: 600, y: 200 }
    },
  ],
}));
```

### Toggle Component

```jsx
// components/ui/XRayToggle.jsx
import { useArchitectureMode } from '@/hooks/useArchitectureMode';

export function XRayToggle() {
  const { isXRayEnabled, toggleXRay } = useArchitectureMode();

  return (
    <button
      onClick={toggleXRay}
      className={`
        fixed top-4 right-4 z-50
        backdrop-blur-lg
        ${isXRayEnabled
          ? 'bg-safety-500/20 border-safety-500/50'
          : 'bg-slate-900/80 border-white/10'
        }
        border px-4 py-2 rounded-lg
        font-mono text-sm
        transition-all duration-300
        hover:shadow-glow-blue
        group
      `}
    >
      <span className="inline-flex items-center gap-2">
        <span className={`
          w-2 h-2 rounded-full
          ${isXRayEnabled ? 'bg-safety-500 animate-pulse' : 'bg-slate-500'}
        `} />
        <span className={isXRayEnabled ? 'text-safety-400' : 'text-slate-300'}>
          {isXRayEnabled ? 'X-RAY: ON' : 'View Architecture'}
        </span>
      </span>
    </button>
  );
}
```

### Architecture Overlay Component

```jsx
// components/layout/ArchitectureOverlay.jsx
import { useArchitectureMode } from '@/hooks/useArchitectureMode';
import { motion, AnimatePresence } from 'framer-motion';

export function ArchitectureOverlay() {
  const { isXRayEnabled, annotations } = useArchitectureMode();

  return (
    <AnimatePresence>
      {isXRayEnabled && (
        <>
          {/* Dim overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 pointer-events-none"
          />

          {/* Annotation lines and labels */}
          {annotations.map((annotation) => (
            <ArchitectureAnnotation
              key={annotation.id}
              {...annotation}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  );
}

function ArchitectureAnnotation({ target, label, tech, position }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed z-50 pointer-events-none"
      style={{ left: position.x, top: position.y }}
    >
      {/* Connection line (SVG or CSS) */}
      <div className="
        backdrop-blur-md
        bg-safety-500/20
        border border-safety-500/50
        px-3 py-2
        rounded-md
        font-mono text-xs
        text-safety-400
        shadow-lg shadow-safety-500/20
      ">
        <div className="font-bold">{label}</div>
        <div className="text-safety-300/70">{tech}</div>
      </div>

      {/* Animated pointer line */}
      <svg className="absolute -bottom-8 left-4" width="2" height="32">
        <motion.line
          x1="1" y1="0" x2="1" y2="32"
          stroke="#ff6b35"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );
}
```

---

## 5. HUD System Status Components

### Top Right Status

```jsx
// components/layout/SystemHUD.jsx
export function TopRightStatus() {
  const [latency, setLatency] = useState(42);

  // Simulate latency fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 20) + 35); // 35-55ms
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="
      fixed top-6 right-6 z-30
      backdrop-blur-lg
      bg-slate-950/90
      border border-signal-400/30
      px-4 py-2
      rounded-lg
      font-mono text-xs
      text-signal-400
      shadow-lg
      shadow-signal-400/20
    ">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
          <span className="font-bold">Vertex AI:</span>
          <span className="text-success-400">ONLINE</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Latency:</span>
          <span className="tabular-nums">{latency}ms</span>
        </div>
      </div>
    </div>
  );
}

export function BottomLeftStatus() {
  return (
    <div className="
      fixed bottom-6 left-24 z-30
      backdrop-blur-lg
      bg-slate-950/90
      border border-slate-700/50
      px-4 py-2
      rounded-lg
      font-mono text-xs
      text-slate-300
      shadow-lg
    ">
      <div className="flex items-center gap-2">
        <span className="text-slate-500">Active Rig:</span>
        <span className="font-bold text-white">Thistle Alpha</span>
        <span className="text-slate-600">|</span>
        <span className="text-warning-400">(Simulation)</span>
      </div>
    </div>
  );
}
```

---

## 6. Sidebar Dock Navigation

### Collapsible Sidebar Component

```jsx
// components/layout/CollapsibleSidebar.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

export function CollapsibleSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { icon: '⚡', label: 'Brahan Engine', href: '#brahan' },
    { icon: '🏗️', label: 'Intervention Planner', href: '#planner' },
    { icon: '🚨', label: 'Crisis Simulator', href: '#crisis' },
    { icon: '📦', label: 'Equipment Catalog', href: '#equipment' },
    { icon: 'ℹ️', label: 'About', href: '#about' },
  ];

  return (
    <motion.aside
      animate={{ width: isExpanded ? 256 : 64 }}
      className="
        fixed left-0 top-0 h-screen
        backdrop-blur-xl
        bg-slate-950/95
        border-r border-white/10
        flex flex-col
        py-6
        transition-all duration-300
        z-50
      "
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="px-4 mb-8">
        <div className="
          w-12 h-12
          rounded-lg
          bg-gradient-to-br from-signal-500 to-safety-500
          flex items-center justify-center
          font-bold text-white text-xl
          shadow-lg shadow-signal-500/30
        ">
          W
        </div>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 font-display font-bold text-white"
          >
            WellTegra
          </motion.div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-2 px-2">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            {...item}
            isExpanded={isExpanded}
          />
        ))}
      </nav>

      {/* Collapse indicator */}
      <div className="px-4 text-xs font-mono text-slate-600">
        {isExpanded ? '← Hover to collapse' : '→'}
      </div>
    </motion.aside>
  );
}

function SidebarNavItem({ icon, label, href, isExpanded }) {
  return (
    <a
      href={href}
      className="
        group relative
        h-12
        rounded-lg
        backdrop-blur-md
        bg-slate-800/50
        hover:bg-signal-500/20
        border border-transparent
        hover:border-signal-500/50
        flex items-center
        gap-3
        px-3
        transition-all duration-200
        hover:shadow-lg
        hover:shadow-signal-500/20
      "
    >
      <span className="text-2xl">{icon}</span>

      {isExpanded && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-mono text-sm text-slate-300 group-hover:text-white whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}

      {/* Tooltip when collapsed */}
      {!isExpanded && (
        <div className="
          absolute left-16
          backdrop-blur-lg
          bg-slate-950/95
          border border-white/10
          px-3 py-1
          rounded-md
          text-sm font-mono
          whitespace-nowrap
          opacity-0 group-hover:opacity-100
          pointer-events-none
          transition-opacity
          duration-200
          z-50
        ">
          {label}
        </div>
      )}
    </a>
  );
}
```

---

## 7. Specialized Feature Components

### Radio Transcript Chat (Brahan Engine)

```jsx
// components/features/RadioTranscriptChat.jsx
export function RadioTranscriptChat() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="
      backdrop-blur-md
      bg-slate-900/80
      border border-white/10
      rounded-lg
      p-6
      font-mono
    ">
      {/* Transcript Log */}
      <div className="h-96 overflow-y-auto space-y-2 mb-4 custom-scrollbar">
        <TranscriptEntry
          timestamp="14:32:15"
          speaker="OPERATOR"
          message="Brahan, what's the max flow rate for 3.5" tubing at 5000psi?"
        />
        <TranscriptEntry
          timestamp="14:32:17"
          speaker="BRAHAN_AI"
          message="Calculating within thermodynamic constraints... Flow rate: 42 BPM. Physics check: PASS."
          aiGenerated
        />
      </div>

      {/* Push-to-Talk Button */}
      <button
        onClick={() => setIsRecording(!isRecording)}
        className={`
          w-full h-16
          rounded-lg
          font-bold text-lg
          transition-all duration-200
          ${isRecording
            ? 'bg-safety-500 text-white shadow-glow-orange animate-pulse'
            : 'bg-signal-500/20 text-signal-400 border border-signal-500/50 hover:bg-signal-500/30'
          }
        `}
      >
        {isRecording ? '⏺ RECORDING...' : '🎙️ PUSH TO TALK'}
      </button>
    </div>
  );
}

function TranscriptEntry({ timestamp, speaker, message, aiGenerated }) {
  return (
    <div className={`
      p-3 rounded-md
      ${aiGenerated
        ? 'bg-signal-500/10 border-l-4 border-signal-500'
        : 'bg-slate-800/50'
      }
    `}>
      <div className="text-xs text-slate-500 mb-1">
        [{timestamp}] <span className="text-slate-400">{speaker}</span>
      </div>
      <div className="text-sm text-slate-200">{message}</div>
    </div>
  );
}
```

### Data Pipeline Visualization (11 Pillars)

```jsx
// components/features/DataPipelineViz.jsx
import { motion } from 'framer-motion';

export function DataPipelineViz() {
  const gates = [
    { id: 'raw', label: 'Raw Sensor Data', color: 'slate' },
    { id: 'drilling', label: 'Drilling Expert', color: 'blue' },
    { id: 'hse', label: 'HSE Constraint', color: 'orange' },
    { id: 'integrity', label: 'Integrity Check', color: 'teal' },
    { id: 'approved', label: 'Approved ✓', color: 'green' },
  ];

  return (
    <div className="relative overflow-x-auto py-8">
      <div className="flex items-center gap-4 min-w-max">
        {gates.map((gate, index) => (
          <React.Fragment key={gate.id}>
            <PipelineGate {...gate} />
            {index < gates.length - 1 && <PipelineArrow />}
          </React.Fragment>
        ))}
      </div>

      {/* Animated data packet */}
      <motion.div
        className="absolute top-12 left-0 w-6 h-6 bg-signal-500 rounded-full shadow-glow-blue"
        animate={{ x: [0, 800] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function PipelineGate({ label, color }) {
  return (
    <div className={`
      backdrop-blur-md
      bg-${color}-500/10
      border border-${color}-500/30
      rounded-lg
      px-6 py-4
      min-w-[200px]
      font-mono text-sm
    `}>
      <div className={`text-${color}-400 font-bold mb-1`}>{label}</div>
      <div className="text-xs text-slate-500">Processing...</div>
    </div>
  );
}

function PipelineArrow() {
  return (
    <div className="text-slate-600 text-2xl">→</div>
  );
}
```

### Crisis Simulator with Live NPT Counter

```jsx
// components/features/CrisisSimulator.jsx
export function CrisisSimulator() {
  const [nptCost, setNptCost] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setNptCost(prev => prev + 5787); // ~$500K/day = $5,787/min
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="
      backdrop-blur-md
      bg-slate-900/80
      border border-warning-500/30
      rounded-lg
      p-8
      text-center
    ">
      <h3 className="font-display text-2xl text-white mb-4">
        Non-Productive Time Simulator
      </h3>

      {/* Live counter */}
      <div className="
        bg-slate-950
        border border-warning-500/50
        rounded-lg
        p-6
        mb-6
      ">
        <div className="font-mono text-sm text-warning-400 mb-2">
          Current NPT Cost:
        </div>
        <div className="font-mono text-6xl text-warning-500 tabular-nums">
          ${nptCost.toLocaleString()}
        </div>
      </div>

      <button
        onClick={() => setIsActive(!isActive)}
        className={`
          px-8 py-4
          rounded-lg
          font-bold text-lg
          transition-all
          ${isActive
            ? 'bg-safety-500 text-white shadow-glow-orange'
            : 'bg-signal-500 text-white hover:bg-signal-600'
          }
        `}
      >
        {isActive ? 'STOP SIMULATION' : 'START CRISIS'}
      </button>
    </div>
  );
}
```

---

## 8. Custom Scrollbars (Mission Control Aesthetic)

```css
/* styles/mission-control.css */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}
```

---

## 9. Integration Checklist

### Phase 2 Implementation Steps

1. **✅ Design System Documentation** (This file)
2. **⚠️ Install Dependencies:**
   ```bash
   npm install framer-motion zustand react-three/fiber three
   ```
3. **⚠️ Create Component Files** (as per file structure above)
4. **⚠️ Implement X-Ray Toggle** (useArchitectureMode hook + UI)
5. **⚠️ Build Collapsible Sidebar** (with icon-only collapsed state)
6. **⚠️ Add System HUD** (Top-right + Bottom-left status badges)
7. **⚠️ Integrate 3D Background** (React Three Fiber wellbore viewer)
8. **⚠️ Refactor Brahan Engine** (Radio transcript UI)
9. **⚠️ Build Data Pipeline Viz** (11 Pillars animated flow)
10. **⚠️ Implement Crisis Simulator** (Live NPT counter)

---

## 10. Production Deployment Notes

### Performance Optimizations

- **Lazy load** Three.js components (use React.lazy)
- **Memoize** expensive renders (React.memo on HUD components)
- **Debounce** 3D scene updates (requestAnimationFrame)
- **Code split** features by route

### Accessibility

- Add ARIA labels to all interactive elements
- Ensure keyboard navigation works for sidebar
- Provide text alternatives for visual status indicators
- Test with screen readers

### Browser Support

- Chrome/Edge: Full support (recommended)
- Firefox: Full support
- Safari: Partial (WebGL may require polyfills)

---

**Next Action:** Begin component implementation starting with CollapsibleSidebar and XRayToggle.

**Architect:** Kenneth McKenzie
**Platform:** WellTegra Mission Control
**Design Version:** 2.0 (Phase 2)
