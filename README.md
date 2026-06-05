# WellTegra Landing Page

A production-ready React 18, TypeScript, and Tailwind CSS landing page for WellTegra's Sovereign Industrial Platform.

## Tech Stack

- **React 18.2** with TypeScript
- **Tailwind CSS 3.4** for styling
- **React Three Fiber 8.15** for 3D visualizations
- **Vite 5.0** for fast development and building
- **Three.js 0.160** for 3D graphics

## Design System

### Color Palette
- **Background**: Dark industrial slate (#0A0E1A to #0F172A)
- **Accents**: Teal (validated safety), Orange (physical limits), Amber (asset risks)
- **Components**: Glassmorphic hierarchy with backdrop-blur-md and bg-slate-900/80

### Typography
- **Headlines**: Space Grotesk (clean, industrial aesthetic)
- **Data/Code**: JetBrains Mono (for technical specifications)

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server

The development server will start at `http://localhost:3000`

### Project Structure

```
welltegra-landing/
├── src/
│   ├── components/
│   │   ├── HeroSection.tsx          # Hero with 3D visualization
│   │   ├── ProblemCards.tsx         # 3 visual stat cards
│   │   ├── SolutionFlow.tsx         # 4-step process pipeline
│   │   ├── PlatformExplorer.tsx    # Platform CTA + Mission Control modal
│   │   ├── PedigreeTimeline.tsx     # Company history timeline
│   │   ├── EngineRoom.tsx           # Technical accordion
│   │   ├── CTASection.tsx          # Multi-channel intake form
│   │   └── Footer.tsx               # Site footer
│   ├── pages/
│   │   └── LandingPage.tsx           # Main page composition
│   ├── main.tsx                      # Application entry point
│   └── index.css                     # Global styles
├── index.html                        # HTML template
├── package.json                      # Dependencies
├── tailwind.config.js                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
└── vite.config.ts                    # Vite configuration
```

## Project Structure

```
welltegra-landing/
├── src/
│   ├── components/
│   │   ├── HeroSection.tsx      # Hero with 3D placeholder
│   │   └── ProblemCards.tsx      # 3 stat cards
│   ├── pages/
│   │   └── LandingPage.tsx       # Main page composition
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styles
├── index.html                    # HTML template
├── package.json                  # Dependencies
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── vite.config.ts                # Vite configuration
```

## Features Implemented

### ✅ Hero Section
- Interactive 3D wellbore simulation placeholder using React Three Fiber
- Live safety overlay with real-time status indicators
- Mission Control visual theme with glassmorphic design
- Responsive design with mobile optimization
- Trust indicators showing key metrics (99.7% verification, 60fps processing, 0 incidents)

### ✅ Problem Cards Section
- Three visual stat cards with exact specifications:
  - **$2.1M** - Median Operational Failure Risk (orange accent)
  - **EU AI Act** - Liability Exposure (amber accent)
  - **153 Wells** - NSTA Consent Backlog (teal accent)
- Glassmorphic card design with hover effects and animations
- Additional context section explaining the verification gap

### ✅ Solution Flow Section
- Animated 4-step verification pipeline:
  1. Data Ingest (WITSML processing)
  2. Physics Constraints (Navier-Stokes + thermodynamics)
  3. mHC Neural Safety (128-layer GNN)
  4. Real-Time Verification (60fps output)
- Auto-rotating active step indicator
- Technical metrics display
- Responsive horizontal/vertical layout

### ✅ Platform Explorer Section
- Unified "Launch Platform Explorer" CTA with glow effects
- Interactive Mission Control modal featuring:
  - Live verification log with system status
  - Brahan Safety Monitor dashboard
  - Real-time platform capabilities display
  - System status indicators (operational, safety score, active wells)
- Feature pills highlighting key capabilities
- Platform preview cards (Dashboard, Configuration, Compliance)

### ✅ Pedigree Timeline Section
- Horizontal scrolling timeline (1995-2026):
  - 1995: BP Thistle Alpha Slickline Operator
  - 2005: Production Optimization Engineer
  - 2015: GCP Machine Learning Specialist
  - 2020: Physics-Driven AI Research
  - 2026: WellTegra Platform Launch
- Auto-scrolling with manual navigation
- Company heritage statistics display
- Trust indicators and operational background

### ✅ Engine Room Section
- Collapsible accordion for technical buyers
- Four detailed technical sections:
  1. Core Technology Stack (Python, FastAPI, GCP, Docker, K8s)
  2. mHC-GNN Neural Architecture (128 layers, Sinkhorn-Knopp)
  3. 11-Agent Consensus Protocol (9/11 consensus, human veto)
  4. Deployment & Scalability (multi-region, edge-ready)
- Code examples with syntax highlighting
- Performance metrics and technical specifications
- Mathematical foundations explanation

### ✅ CTA Section
- Multi-channel intake with persona selection:
  - Drilling Operator / Well Integrity SME (live demo)
  - Technical Buyer / ML Architect (whitepaper)
  - Compliance Officer / Legal Counsel (regulatory brief)
- Email input with form validation
- Submission confirmation state
- Alternative contact options (email, phone, scheduling)
- Trust indicators and security assurances

### ✅ Footer Section
- Company information and platform links
- Resources and documentation links
- Trust badges and system status indicator
- Professional footer layout

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Built with Vite for optimal development experience
- Production builds optimized for fast loading
- 3D rendering using WebGL for smooth 60fps performance
- Responsive images and lazy loading

## License

MIT License - WellTegra © 2026
