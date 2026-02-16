# CLAUDE.md - AI Assistant Guide for WellTegra Network

## Project Overview

WellTegra Network ("The Brahan Engine") is a sovereign industrial AI platform for North Sea wellbore integrity analysis and forensic engineering. It is a monorepo containing multiple frontend applications, Python backend services, E2E tests, and static HTML dashboards, deployed to GitHub Pages with a Cloud Run backend.

**Live site:** https://kenmck3772.github.io/welltegra.network/
**GCP region:** europe-west2 (London)

## Repository Structure

```
welltegra.network/
├── BPT-PWA/                    # Brahan Personal Terminal (Vite + React 19 + TypeScript PWA)
├── react-brahan-vertex/        # Brahan Vertex Engine (CRA + React 18 + Three.js)
├── backend-api/                # FastAPI backend (Cloud Run deployment)
├── backend/                    # Python verification portal
├── my_agent/                   # Anthropic Claude agent service
├── tests/                      # Playwright E2E test suite
├── data/                       # Equipment catalogs, SOPs, well data (JSON/CSV)
├── docs/                       # Project documentation
├── scripts/                    # BigQuery, Vertex AI, data generation helpers
├── assets/                     # Images, CSS, JS, video
├── brahan-engine/              # Core engine documentation
├── ml-api-setup/               # ML API deployment configs
├── gcp-free-tier-api/          # GCP free-tier API setup
├── rl-training/                # Reinforcement learning training
├── src/components/             # Shared React components
├── app/                        # Built React app output
├── index.html                  # Main landing page (static HTML)
├── styles.css                  # Global stylesheet (dark-mode, CSS custom properties)
├── *.html                      # ~60 static HTML dashboard pages
├── playwright.config.js        # Playwright E2E config
├── package.json                # Root package (Playwright test runner)
├── docker-compose.yml          # Multi-service Docker setup
├── Dockerfile                  # Root container (Python services)
└── .github/workflows/static.yml # CI/CD pipeline
```

## Tech Stack

### Frontend
| Project | Framework | Build Tool | Language | Port |
|---|---|---|---|---|
| BPT-PWA | React 19, Vite PWA | Vite 6 | TypeScript | 3000 |
| react-brahan-vertex | React 18, CRA | react-scripts 5 | JS/TSX mix | 3000 |
| Static dashboards | Vanilla HTML/CSS/JS | None | HTML/JS | 8080 |

### Backend
| Service | Framework | Language | Port |
|---|---|---|---|
| backend-api | FastAPI | Python 3.11 | 8080 |
| backend | Flask/pytest | Python 3.11 | - |
| bridge | FastAPI | Python | 8000 |
| forensic-engine | Streamlit | Python | 8501 |

### Key Libraries
- **3D/Viz:** Three.js, @react-three/fiber, @react-three/drei, D3, Recharts, Plotly.js
- **AI:** @google/genai (Gemini), @google/generative-ai, Anthropic Claude
- **PDF:** jsPDF
- **Icons:** lucide-react
- **Styling:** Tailwind CSS (CDN in BPT-PWA, PostCSS in react-brahan-vertex), vanilla CSS custom properties
- **Testing:** Playwright (E2E), Vitest (unit), pytest (backend)
- **Cloud:** Google Firestore, Pub/Sub, BigQuery, Cloud Run, Cloud Storage

## Build & Development Commands

### Root (Playwright E2E tests)
```bash
npm ci                          # Install dependencies
npm test                        # Run all Playwright E2E tests
npm run test:headed             # Run with visible browser
npm run test:site-wide          # Run site-wide tests only
npm run test:accessibility      # Accessibility tests
npm run test:performance        # Performance tests
npm run test:mobile             # Mobile-only tests
npm run test:prod               # Against production URL
```

### BPT-PWA
```bash
cd BPT-PWA
npm install --legacy-peer-deps  # Install (legacy-peer-deps required)
npm run dev                     # Dev server on port 3000
npm run build                   # Production build (vite build)
npm run test                    # Unit tests (vitest)
npm run test:coverage           # Coverage report (50% threshold)
```

### react-brahan-vertex
```bash
cd react-brahan-vertex
npm install --legacy-peer-deps  # Install (legacy-peer-deps required)
npm start                       # Dev server (react-scripts start)
npm run build                   # Production build (react-scripts build)
npm run test                    # Unit tests (vitest)
npm run test:coverage           # Coverage report (50% threshold)
```

### Backend API (Python)
```bash
cd backend-api
pip install -r requirements.txt   # Or: pip install pytest pytest-cov pydantic fastapi httpx python-multipart
python -m pytest -v --cov=. --cov-report=term-missing  # Run tests with coverage
uvicorn main:app --host 0.0.0.0 --port 8080            # Run server
```

### Docker
```bash
docker-compose up               # Starts bridge (8000), forensic-engine (8501), frontend (3000)
```

### Static Site (local)
```bash
python3 -m http.server 8080     # Serve static HTML files locally
```

## CI/CD Pipeline

Defined in `.github/workflows/static.yml`. Triggered on push to `main` or manual dispatch.

**Pipeline steps:**
1. Install Node.js 18, setup GitHub Pages
2. `npm ci` (root) + install Playwright browsers
3. Run Playwright E2E tests (`npm test`)
4. Install & test react-brahan-vertex (`npm run test:coverage -- --run`)
5. Install & test BPT-PWA (`npm run test:coverage -- --run`)
6. Setup Python 3.11, install pytest deps
7. Run backend-api pytest with coverage
8. Run backend pytest with coverage
9. Build react-brahan-vertex (`npm run build`)
10. Prepare deployment artifact (copies static files + React build to `_deploy/`)
11. Deploy to GitHub Pages

**Note:** Test steps use `continue-on-error: true` - tests are informational, not blocking deployment.

## Testing

### E2E Tests (Playwright)
- **Config:** `playwright.config.js`
- **Tests:** `tests/` directory
- **Browsers:** Chromium, Firefox, WebKit, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
- **Local server:** Python HTTP server on port 8080 (auto-started by Playwright)
- **Production override:** `PLAYWRIGHT_BASE_URL=https://welltegra.network`

### Unit Tests (Vitest)
- **BPT-PWA:** `forensic_logic/math.test.ts`, `utils/forensicMath.test.ts` (jsdom env)
- **react-brahan-vertex:** `src/App.test.jsx` (jsdom env)
- **Coverage thresholds:** 50% statements, branches, functions, lines

### Backend Tests (pytest)
- **backend-api:** `test_barrier_agent.py`, `test_barrier_scenarios.py`, `test_wi_api.py`
- **backend:** `test_verify_portal.py`

## TypeScript Configuration

### BPT-PWA (`BPT-PWA/tsconfig.json`)
- Target: ES2022, Module: ESNext, JSX: react-jsx
- `moduleResolution: "bundler"`
- Path alias: `@/*` maps to project root
- `strict` is NOT enabled (no strict field)
- `allowJs: true`, `noEmit: true`

### react-brahan-vertex (`react-brahan-vertex/tsconfig.json`)
- Target: es5, Module: esnext, JSX: react-jsx
- `moduleResolution: "node"`
- `strict: true`
- `noEmit: true`

## Code Conventions

### General
- Functional React components with hooks (no class components)
- TypeScript preferred for new code in BPT-PWA; JS/TSX mix acceptable in react-brahan-vertex
- ESLint extends `react-app` (configured in package.json, no standalone eslint config)
- No Prettier config present - follow existing formatting in each file

### Styling
- **Static pages:** Vanilla CSS with custom properties in `styles.css` (dark ocean theme)
  - Primary background: `#051122` (deep ocean blue)
  - Accent colors: `#22d3ee` (terminal cyan), `#10b981` (success green), `#f59e0b` (warning amber)
  - Fonts: Space Grotesk (display), Inter (body)
- **BPT-PWA:** Tailwind CSS via CDN + inline styles
- **react-brahan-vertex:** Tailwind CSS via PostCSS + custom fonts (Inter, JetBrains Mono, Cinzel)

### Backend (Python)
- FastAPI with Pydantic models for request/response validation
- Google Cloud client libraries for Firestore, Pub/Sub
- CORS configured for localhost:3000, localhost:5173, and kenmck3772.github.io

### File Naming
- React components: PascalCase (e.g., `GhostSync.tsx`, `TraumaNode.tsx`)
- Utilities/services: camelCase (e.g., `geminiService.ts`, `ndrService.ts`)
- Test files: `*.test.ts`, `*.test.tsx`, `*.test.jsx`, or `*.spec.js` (Playwright)
- Python: snake_case (e.g., `barrier_agent.py`, `wi_planner.py`)

## Environment Variables

### BPT-PWA
- `GEMINI_API_KEY` - Google Gemini API key (loaded via Vite's `loadEnv`)

### Backend API (see `backend-api/.env.example`)
- `GCP_PROJECT_ID` - Google Cloud project (default: portfolio-project-481815)
- `GCP_REGION` - Deployment region (default: europe-west2)
- `FIRESTORE_DATABASE` - Firestore database name
- `PUBSUB_TELEMETRY_TOPIC` - Pub/Sub telemetry topic
- `PUBSUB_ALERTS_TOPIC` - Pub/Sub alerts topic
- `CORS_ORIGINS` - Comma-separated allowed origins
- `PORT` - Server port (default: 8080)
- `LOG_LEVEL` - Logging level (default: INFO)

### Agent (`my_agent/.env.example`)
- `ANTHROPIC_API_KEY` or Vertex AI credentials

### E2E Tests
- `PLAYWRIGHT_BASE_URL` - Override base URL for production testing

## Important Notes for AI Assistants

1. **`--legacy-peer-deps` is required** when running `npm install` in BPT-PWA and react-brahan-vertex due to React version mismatches between dependencies.

2. **Static HTML pages are the main site.** The root `index.html` and companion HTML files serve the primary GitHub Pages site. The React apps are sub-applications (BPT-PWA is standalone, react-brahan-vertex builds to `/app/`).

3. **No SPA router.** The static site uses traditional multi-page HTML navigation. Each dashboard is its own HTML file.

4. **Test failures don't block deployment.** The CI pipeline uses `continue-on-error: true` on test steps.

5. **Data files are checked into git.** Equipment catalogs, SOPs, and well data live in `data/` as JSON/CSV and are served as static assets.

6. **Deployment artifact excludes:** node_modules, .git, .github, tests, scripts, ml-api-setup, google-cloud-sdk, backend-api, my_agent, backend, BPT-PWA, react-brahan-vertex (only `react-brahan-vertex/build/` output is copied to `_deploy/app/`).

7. **Docker Compose** is for local development of the Python services (bridge, forensic-engine) alongside a frontend. It is separate from the GitHub Pages deployment.

8. **The Playwright dev server** uses `python3 -m http.server 8080` to serve the static site locally during testing.
