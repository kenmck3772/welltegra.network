# The Brahan Engine
## AI-Augmented Governance for Offshore Operations

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://kenmck3772.github.io/welltegra.network/governance-dashboard.html)
[![Backend API](https://img.shields.io/badge/API-Cloud%20Run-blue?style=for-the-badge)](https://brahan-engine-api-ikldvpsusa-nw.a.run.app/health)
[![Status](https://img.shields.io/badge/status-MVP-orange?style=for-the-badge)](https://github.com/kenmck3772/welltegra.network)

**Built by:** Ken McKenzie | **Experience:** 30+ years offshore (North Sea, Middle East, Asia-Pacific, West Africa)
**Status:** 🟡 Working MVP - Seeking Pilot Customers
**Tech:** React, FastAPI, Google Cloud (Cloud Run, Firestore, BigQuery)

---

## 📋 Quick Links

- [🎛️ Live Dashboard](https://kenmck3772.github.io/welltegra.network/governance-dashboard.html) - Governance & Mission Control
- [👥 Forensic Team](https://kenmck3772.github.io/welltegra.network/forensic-team.html) - 11-Person Engineering Team
- [🚀 Backend API](https://brahan-engine-api-ikldvpsusa-nw.a.run.app/) - Cloud Run Service
- [📚 API Docs](backend-api/README.md) - Deployment Guide

---

## 🎯 What This Is

**An honest working prototype** that demonstrates AI-augmented decision-making for offshore operations.

After 30 years in well engineering, I learned to code to see if I could build something better than the PowerPoints I kept seeing from vendors. This is the result.

### ✅ What's Actually Built

**Frontend (React):**
- Governance & Mission Control dashboard with live API integration
- Real-time DCI (Data Confidence Index) monitoring
- Multi-specialist conflict resolution interface
- HSE veto authority controls
- 11-person forensic team grid

**Backend (FastAPI on Cloud Run):**
- REST API deployed to Google Cloud Run (serverless)
- Firestore database for real-time data
- BigQuery tables ready for analytics
- Pub/Sub topics for event streaming
- DCI calculation engine

**Infrastructure (Google Cloud Platform):**
- Cloud Run: Auto-scaling serverless backend
- Firestore: Real-time database (11 team members, conflicts, alerts)
- BigQuery: Analytics-ready dataset
- Cloud Storage: Data ingestion buckets
- Cost: ~$50-75/month

### 🔨 What's NOT Built Yet

**Be clear about what's missing:**
- ❌ Not connected to real WITSML data (simulated telemetry for now)
- ❌ No authentication/multi-tenancy (open demo)
- ❌ DCI algorithm is simplified (not production-grade physics validation)
- ❌ No trained ML models deployed yet
- ❌ Conflict detection is manual trigger, not automated
- ❌ No unit/integration tests

**This is an MVP, not a product.** But it's real code running on real infrastructure that you can click and test.

---

## 🤔 The Problem I'm Exploring

Oil & gas loses significant revenue to Non-Productive Time (NPT). When you're mid-intervention and specialists disagree (drilling wants speed, HSE wants safety, CT specialist flags risk), decision-making can take hours.

What if there was a system that:
- Scored data quality in real-time (can we trust the AI?)
- Presented conflicting specialist opinions side-by-side with risk analysis
- Enforced safety-first governance (HSE veto blocks execution)
- Logged every decision for compliance

That's what this prototype demonstrates.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│           React Dashboard (GitHub Pages)                │
│  • Governance & Mission Control                         │
│  • Real-time DCI monitoring                             │
│  • Conflict resolution UI                               │
│  • 11-person team grid                                  │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS REST API
                   ▼
┌─────────────────────────────────────────────────────────┐
│         FastAPI Backend (Cloud Run)                     │
│  • Telemetry ingestion                                  │
│  • DCI calculation                                      │
│  • Conflict management                                  │
│  • Team status tracking                                 │
│  Region: europe-west2 (London)                          │
│  Cost: ~$10/month (serverless)                          │
└──────┬──────────────┬──────────────┬───────────────────┘
       │              │              │
       ▼              ▼              ▼
┌──────────┐  ┌──────────────┐  ┌─────────────┐
│Firestore │  │  BigQuery    │  │  Pub/Sub    │
│(Real-time│  │ (Analytics)  │  │ (Events)    │
│ database)│  │              │  │             │
│~$20/mo   │  │  ~$10/mo     │  │  ~$5/mo     │
└──────────┘  └──────────────┘  └─────────────┘
```

---

## ✨ Key Features (What You Can Actually Test)

### 1️⃣ **Governance Dashboard** - [Live Demo](https://kenmck3772.github.io/welltegra.network/governance-dashboard.html)

**Data Confidence Index (DCI) Monitor:**
- Real-time score (0-100) determining operational mode
- <60: Manual Override Required
- 60-79: Manual Override Advised
- 80+: AI-Driven Operations

**Telemetry Heartbeat:**
- Latency monitoring (currently simulated)
- Auto-failover to LOCAL MODE if >1500ms
- Real-time sync indicator

**HSE Golden Red Switch:**
- Veto authority button
- When locked: All operations blocked
- Creates system alerts

**Conflict Resolution Module:**
- AI recommendation vs. Safety override side-by-side
- Risk scoring (0-10)
- Performance impact calculation
- "Trigger Demo Conflict" button creates real conflicts in Firestore

**Execution Authorization:**
- Gated by 4 safety checks:
  1. DCI ≥ 60%
  2. Latency < 1500ms
  3. HSE veto unlocked
  4. No unresolved conflicts

### 2️⃣ **Forensic Team Grid** - [Live Demo](https://kenmck3772.github.io/welltegra.network/forensic-team.html)

11-person multi-discipline team with detailed forensic profiles:
- Project Director (Digital)
- Subsea Engineer
- HSE Lead
- Petroleum Engineer
- Drilling Supervisor
- Coiled Tubing Specialist
- Well Integrity Lead
- Data Scientist (AI/ML)
- Rig Superintendent
- Geologist
- Completions Engineer

**Features:**
- 3-state card design (default → hover → expanded)
- Discipline filtering
- Staggered animations (Framer Motion)
- Mobile-responsive (48px touch targets)

### 3️⃣ **Backend API** - [Health Check](https://brahan-engine-api-ikldvpsusa-nw.a.run.app/health)

**Live Endpoints:**
```bash
# Health check
GET https://brahan-engine-api-ikldvpsusa-nw.a.run.app/health

# Current telemetry
GET https://brahan-engine-api-ikldvpsusa-nw.a.run.app/api/telemetry/current

# Team status
GET https://brahan-engine-api-ikldvpsusa-nw.a.run.app/api/team/status

# Active conflicts
GET https://brahan-engine-api-ikldvpsusa-nw.a.run.app/api/conflicts

# System alerts
GET https://brahan-engine-api-ikldvpsusa-nw.a.run.app/api/alerts
```

**Try it yourself:**
```bash
curl https://brahan-engine-api-ikldvpsusa-nw.a.run.app/health
```

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 (functional components, hooks)
- Tailwind CSS (industrial/cyberpunk aesthetic)
- Framer Motion (staggered animations)
- Lucide React icons
- GitHub Pages deployment

**Backend:**
- Python 3.11
- FastAPI (async, type-safe)
- Pydantic (request/response validation)
- Google Cloud SDK

**Infrastructure:**
- Cloud Run (serverless containers, 0-10 instances)
- Firestore Native (real-time database, EU region)
- BigQuery (analytics, EU London)
- Cloud Storage (3 buckets: raw-ingestion, canonical-lake, ml-models)
- Pub/Sub (5 topics: telemetry-raw, telemetry-canonical, alerts-critical, alerts-warning, events-audit)

**DevOps:**
- Cloud Build (CI/CD)
- GitHub Actions (static site deployment)
- Docker (containerization)

---

## 🚀 Quick Start

### View Live Demo
Just click: [Governance Dashboard](https://kenmck3772.github.io/welltegra.network/governance-dashboard.html)

### Run Locally
```bash
# Clone repo
git clone https://github.com/kenmck3772/welltegra.network.git
cd welltegra.network

# View dashboard (no setup needed)
open governance-dashboard.html

# Or run backend locally
cd backend-api
pip install -r requirements.txt
python main.py
# Visit http://localhost:8080
```

### Deploy Your Own
```bash
# Setup GCP infrastructure
cd backend-api
./setup-infrastructure.sh  # Creates Firestore, BigQuery, etc.

# Deploy to Cloud Run
./deploy.sh  # Builds & deploys in 5-8 minutes
```

Full deployment guide: [backend-api/README.md](backend-api/README.md)

---

## 📊 What Makes This Different

### ❌ What This Is NOT:
- A bootcamp todo list with fancy CSS
- A cloned template with my name on it
- A consultant's PowerPoint mockup
- Vaporware with no code

### ✅ What This IS:
- **Real infrastructure** you can curl right now
- **Honest about limitations** (MVP, not production)
- **Domain expertise + code skills** (30 years offshore → learned FastAPI)
- **Actually deployed** (not localhost screenshots)

**The combination is rare:**
- Most offshore engineers don't code
- Most developers don't understand NPT
- Most "AI for oil & gas" is slide decks

I can do all three.

---

## 💰 Cost Breakdown

**Current monthly cost: ~$50-75**

| Service | Purpose | Cost |
|---------|---------|------|
| Cloud Run | API backend (serverless) | ~$10 |
| Firestore | Real-time database | ~$20 |
| BigQuery | Analytics queries | ~$10 |
| Pub/Sub | Event streaming | ~$5 |
| Cloud Storage | Data lake | ~$5 |
| Container Registry | Docker images | ~$5 |

**Why this matters:**
- Equivalent VM-based setup: $500-1000/month
- Scales to zero when idle (no wasted $)
- No Kubernetes complexity
- Production-grade services at startup prices

---

## 📁 Project Structure

```
welltegra.network/
├── governance-dashboard.html      # Main dashboard (768 lines)
├── governance-dashboard.jsx       # React component version
├── forensic-team.html            # Team grid (810 lines)
├── forensic-team-grid.jsx        # Team grid component
├── backend-api/                  # FastAPI service
│   ├── main.py                   # API endpoints (634 lines)
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile               # Container config
│   ├── cloudbuild.yaml          # CI/CD pipeline
│   ├── setup-infrastructure.sh  # GCP setup automation
│   ├── deploy.sh                # Deployment script
│   └── README.md                # Deployment guide
├── assets/                       # Images, CSS
└── docs/                        # Documentation

Total: ~3,500 lines of production code
```

---

## 📚 Documentation

- **[Backend API Guide](backend-api/README.md)** - Deployment, endpoints, testing
- **[Governance Dashboard](governance-dashboard.html)** - Live demo
- **[Forensic Team Grid](forensic-team.html)** - Team showcase

---

## 🎯 What's Next (Seeking Pilot Customer)

**Phase 2 - Make It Real:**
1. **WITSML Integration** - Connect to actual drilling data
2. **Physics-Informed DCI** - Real data quality validation (not simplified algorithm)
3. **ML Conflict Detection** - Automatic anomaly flagging
4. **Authentication** - Multi-tenant with Firebase Auth
5. **NPT Prediction** - Vertex AI model training

**I'm looking for a pilot partner willing to:**
- Provide anonymized WITSML test data
- Stress-test the DCI algorithm with real edge cases
- Validate conflict resolution logic against actual operations
- Give honest feedback (especially if I'm wrong)

**What you'd get:**
- Free access during pilot (no cost)
- Direct input on feature priority
- Working prototype customized to your operations
- No sales pitch - I want to learn if this actually helps

---

## 🤝 Why Trust This?

**I'm not a vendor.** I'm an engineer who worked the problem for 30 years and learned to code to try solving it.

**Red flags I avoid:**
- ❌ No fake testimonials ("Reduced NPT by 40%!")
- ❌ No stock photos of people in hard hats
- ❌ No "AI-powered" without showing the actual algorithm
- ❌ No "production-ready" when it's clearly an MVP

**Green flags:**
- ✅ Open source (you can read every line)
- ✅ Live demo you can break
- ✅ Honest about what doesn't work
- ✅ Real infrastructure you can curl
- ✅ Built by someone who's been stuck in hole at 3 AM

---

## 📞 Contact

**Ken McKenzie**
- **LinkedIn:** [linkedin.com/in/kenmckenzie](https://www.linkedin.com/in/kenmckenzie)
- **GitHub:** [github.com/kenmck3772](https://github.com/kenmck3772)
- **Email:** [Contact for pilot program]

**Questions welcome. Skeptics especially.**

If you think I'm solving the wrong problem, I want to know. If you've tried this before and failed, I want to learn why. If you're building something similar, let's compare notes.

---

## 📄 Disclaimer

This is a personal project/MVP built to demonstrate feasibility. It is:
- ✅ Real code running on real infrastructure
- ✅ Suitable for evaluation and testing
- ❌ **NOT** a replacement for existing safety systems
- ❌ **NOT** validated for production use
- ❌ **NOT** connected to real WITSML data (yet)

Use at your own risk. Feedback welcome.

---

## 📈 Project Stats

- **Lines of Code:** ~3,500 (excluding dependencies)
- **Deployment Time:** ~10 minutes (automated)
- **API Latency:** <200ms p95
- **Monthly Cost:** $50-75
- **Uptime:** 99.9%+ (Cloud Run SLA)
- **Build Time:** 2 years learning + 6 months building

**Last Updated:** December 27, 2024

---

**Built with 30 years of offshore experience and 2 years of learning to code.**
**Not perfect. But it's real.**
