# Brahan Vertex Engine

**Physics-Informed ML Portfolio Demo for Well Engineering**

A comprehensive React application demonstrating the integration of:
- Industrial Sci-Fi splash screen with animated AI core
- Physics-informed machine learning constraints
- Closed-loop competency training system
- 3D wellbore visualization with React Three Fiber
- Real-time safety gatekeeper logic

---

## 🎯 Portfolio Purpose

This application showcases:

1. **Physics-Informed ML:** Demonstrates how physics constraints can override pure ML predictions to catch risks that data-driven models might miss.

2. **Closed-Loop Learning:** When the system detects a safety violation (e.g., attempting execution on a locked well), it automatically redirects users to competency training.

3. **3D Visualization:** React Three Fiber integration showing wellbore integrity with color-coded visual feedback.

4. **Safety Gatekeeper:** Multi-layered safety logic preventing execution when barriers are unverified.

---

## 🔬 The "Closed-Loop" Logic

### How It Works:

**1. Physics Mode Toggle:**
- When `physicsMode = OFF`: Node-02 shows 12% integrity (ML baseline)
- When `physicsMode = ON`: Node-02 drops to 0% integrity (physics override)

**2. Execution Trigger:**
- User attempts execution in "Execution" tab
- If `physicsMode = ON` and Node-02 is safety-locked → **REDIRECT TO TRAINING**
- Training module explains why physics constraints override ML

**3. Training Completion:**
- Users must score ≥80% to return to operations
- Demonstrates understanding of physics-informed safety

---

## 🏗️ Application Structure

```
src/
├── App.js                  # Master integration file with closed-loop logic
├── components/
│   ├── SplashScreen.jsx    # Industrial sci-fi entry animation
│   ├── TrainingView.jsx    # Interactive competency module
│   └── Wellbore3D.jsx      # React Three Fiber 3D visualization
├── index.js                # React entry point
└── index.css               # Tailwind CSS styles
```

---

## 📦 Installation

```bash
cd react-brahan-vertex
npm install
npm start
```

The app will open at `http://localhost:3000`

---

## 🎮 Usage Flow

### 1. **Splash Screen**
Click "Initiate Sequence" to enter the application

### 2. **Executive View**
- View 3 wells: Node-01 (85%), Node-02 (12%), Node-03 (45%)
- Toggle **Physics Mode** in the sidebar
- Watch Node-02 drop from 12% → 0% (CRITICAL)

### 3. **Planner View**
- Select a well from Executive View
- See 3D visualization (color changes based on integrity)
- Rotate/zoom the 3D wellbore

### 4. **Execution Tab**
- With Physics Mode ON, attempt execution
- System blocks execution and redirects to **Competency Training**

### 5. **Competency Training**
- Answer 3 questions about physics-informed safety
- Must score ≥80% to return to operations
- Demonstrates closed-loop learning

---

## 🔑 Key Features

### Physics Mode Toggle
```javascript
const [physicsMode, setPhysicsMode] = useState(false);

useEffect(() => {
  if (physicsMode && well.id === 'well-bravo') {
    // Override ML prediction
    well.integrityScore = 0; // Critical
    well.safetyLocked = true;
  }
}, [physicsMode]);
```

### Execution Gatekeeper
```javascript
const handleExecutionAttempt = () => {
  if (physicsMode && well.safetyLocked) {
    setShowTraining(true);
    setTrainingReason('Procedural Violation: Attempted execution on safety-locked well');
    return false; // Block execution
  }
  return true; // Allow execution
};
```

### 3D Visualization
```javascript
<Wellbore3D
  integrityScore={well.integrityScore}
  wellName={well.name}
/>
```
- Green: ≥80%
- Amber: 50-79%
- Red: 20-49%
- Dark Red: <20%

---

## 🧩 Component Details

### `SplashScreen.jsx`
- Industrial sci-fi entry animation
- Animated AI core sphere with rotating rings
- Fade-out transition (1000ms)

### `TrainingView.jsx`
- 3 interactive quiz questions
- Progress tracking
- Score calculation (pass ≥80%)
- Assignment reason banner (when triggered by safety violation)

### `Wellbore3D.jsx`
- React Three Fiber canvas
- Rotating cylinder mesh
- Color changes based on integrity score
- Orbit controls (drag to rotate, scroll to zoom)

### `App.js`
**Master integration file containing:**
- SplashScreen → Dashboard flow
- 5 tabs: Executive, Scheduler, Planner, Execution, Competency
- Physics mode state management
- MASTER_WELLS data with 3 wells
- Closed-loop logic connecting Execution → Training
- System alerts

---

## 📊 MASTER_WELLS Data

```javascript
const MASTER_WELLS = [
  {
    id: 'well-alpha',
    name: 'Node-01',
    integrityScore: 85, // Always 85%
    safetyLocked: false
  },
  {
    id: 'well-bravo',
    name: 'Node-02',
    integrityScore: 12, // → 0% when physicsMode ON
    safetyLocked: false // → true when physicsMode ON
  },
  {
    id: 'well-charlie',
    name: 'Node-03',
    integrityScore: 45,
    safetyLocked: true // Always locked
  }
];
```

---

## 🎨 Tech Stack

- **React 18.2:** Component framework
- **React Three Fiber:** 3D graphics (Three.js wrapper)
- **@react-three/drei:** Three.js helpers (OrbitControls, etc.)
- **Tailwind CSS:** Utility-first styling
- **Lucide React:** Icon library
- **Three.js:** 3D rendering engine

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Creates optimized production build in `build/` folder.

### Deploy to Cloud Run (Example)
```bash
# Build Docker image
docker build -t gcr.io/welltegra/brahan-vertex:latest .

# Push to Google Container Registry
docker push gcr.io/welltegra/brahan-vertex:latest

# Deploy to Cloud Run
gcloud run deploy brahan-vertex \
  --image gcr.io/welltegra/brahan-vertex:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🎓 Portfolio Context

### Why This Matters for Cloud ML Engineer Role:

**1. Physics-Informed ML:**
- Shows understanding that ML models need domain constraints
- Demonstrates how physics can catch risks that pure ML misses
- Real-world application: "pressure drop violates thermodynamic laws even if ML says safe"

**2. Closed-Loop System:**
- User action → System detection → Training intervention → Verification
- Demonstrates understanding of continuous learning systems
- Shows ability to design safety-critical ML systems

**3. 3D Visualization:**
- React Three Fiber integration
- Real-time state-driven rendering
- Shows full-stack capability (backend ML logic + frontend 3D viz)

**4. Production-Ready Code:**
- Proper component structure
- State management
- Error handling
- Responsive design

---

## 🐛 Known Limitations

- No backend API (demo uses static data)
- Training module has only 3 questions (expandable)
- 3D visualization is simplified (can add complex geometries)
- No authentication system

---

## 📝 Next Steps for Enhancement

1. **Add Real Backend:**
   - FastAPI for ML inference
   - Vertex AI integration
   - Firestore for state persistence

2. **Expand Training:**
   - More question modules
   - Video tutorials
   - Interactive simulations

3. **Advanced 3D:**
   - Detailed wellbore geometry
   - Toolstring assembly visualization
   - Animated intervention sequences

4. **Analytics:**
   - Track user decisions
   - Log training completions
   - Generate competency reports

---

## 👤 Author

**Ken McKenzie**
Well Engineer → Cloud ML Engineer
30+ Years Offshore Experience | Google Developer Premium Tier

Portfolio: [welltegra.network](https://welltegra.network)
GitHub: [@kenmck3772](https://github.com/kenmck3772)

---

## 📄 License

Educational demonstration - Not for commercial use.

---

## 🙏 Acknowledgments

- Inspired by real North Sea P&A challenges
- Built with React, Three.js, and Tailwind CSS
- Uses Google Fonts (Inter, JetBrains Mono, Cinzel)
