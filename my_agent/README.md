# Dark Kenneth Triad

A production-ready W666 Structural Sanity Audit System built with the Claude Agent SDK and Google Cloud Vertex AI.

## Overview

The Dark Kenneth Triad is a specialized audit system that deploys three isolated subagents to analyze project documents for structural, narrative, and regulatory risks:

```
┌────────────────────────────────────────────────────────────┐
│  [ALPHA] The Contagion Hunter  - Technical & Structural    │
│  [BETA]  The Narrative Auditor - Timeline & Claim Analysis │
│  [GAMMA] The Regulator's Ghost - DORA/GDPR Compliance      │
└────────────────────────────────────────────────────────────┘
```

### The Triad

| Agent | Specialty | Worldview |
|-------|-----------|-----------|
| **Alpha** | Structural architecture, tight coupling, contagion paths | Brutal Realism |
| **Beta** | Timeline analysis, optimism bias, reality coefficients | Forensic Skepticism |
| **Gamma** | DORA, GDPR, FCA/ESMA compliance, board liability, **live enforcement search** | Severe Compliance |

## Installation

### Prerequisites

```bash
# Google Cloud SDK (for Vertex AI integration)
gcloud auth application-default login

# Enable Anthropic API in your Google Cloud project
gcloud services enable aiplatform.googleapis.com
```

### Install Dependencies

```bash
cd my_agent
pip install -e .

# Or install directly
pip install "anthropic[vertex]" claude-agent-sdk python-dotenv
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your Google Cloud project ID:

```bash
ANTHROPIC_VERTEX_PROJECT_ID=your-google-cloud-project-id
ANTHROPIC_VERTEX_REGION=us-east5
```

## Usage

### Command Line Interface

```bash
# Run the audit system
python -m my_agent.agent

# Or use the installed command
w666-audit
```

Then paste your project document or specify a file path.

### Python API

```python
import asyncio
from my_agent.agent import DarkKennethTriad

async def run_audit():
    triad = DarkKennethTriad(use_vertex=True)

    # Audit a document
    result = await triad.audit("""
    PROJECT PROPOSAL: Well W-666 AI Integration
    Timeline: 16 weeks
    Budget: £500K
    Risks: Low - our team has done this before
    """)

    print(result['response'])

asyncio.run(run_audit())
```

### Synchronous API

```python
from my_agent.agent import DarkKennethTriad

triad = DarkKennethTriad()
result = triad.audit_sync(project_document_text)
```

## Output Format

The Triad produces a structured verdict:

```
╔════════════════════════════════════════════════════════════╗
║           W666 STRUCTURAL SANITY AUDIT REPORT             ║
╚════════════════════════════════════════════════════════════╝

[ALPHA] CONTAGION ANALYSIS
─────────────────────────
PATH: SCADA System → Authentication Layer → System Failure
SEVERITY: Catastrophic
COUPLING_SCORE: 85/100

[BETA] REALITY COEFFICIENT
─────────────────────────
Timeline Plausibility: 5/25
Resource Realism: 10/25
Dependency Acknowledgment: 5/25
Contingency Presence: 0/25
─────────────────────────
TOTAL: 20/100 - FANTASY

[GAMMA] REGULATORY VERDICT
─────────────────────────
DORA STATUS: VETO
GDPR STATUS: VETO
BOARD LIABILITY: SEVERE
Maximum DORA Fine: 2% of global turnover
Maximum GDPR Fine: €20M or 4% of turnover

FINAL STATUS: VETO
```

## Verdict Levels

| Status | Meaning |
|--------|---------|
| **PROCEED** | All agents approve. Project is structurally sound. |
| **CAUTION** | Issues identified. Requires mitigation before proceeding. |
| **VETO** | Critical flaws. Project must not proceed in current form. |

## Development

### Test with Mock Document

```bash
python -m my_agent.agent < tests/mock_w666_document.txt
```

### Enable Web Search for Agent Gamma

When enabled, Agent Gamma will search for the latest FCA, ESMA, and ICO enforcement actions before issuing a verdict:

```bash
export ENABLE_WEB_SEARCH=true
python -m my_agent.agent < tests/mock_w666_document.txt
```

**What Gamma searches for:**
- FCA enforcement actions 2025 (operational resilience)
- ESMA fines 2025 (digital operational resilience)
- ICO GDPR fines 2025 (data breach)
- DORA enforcement 2025 (third-party risk)

**Search output includes:**
- Recent relevant cases with citations
- Current fine trends
- Comparative analysis against similar violations

## Architecture

```
my_agent/
├── src/my_agent/
│   ├── __init__.py      # Package initialization
│   ├── __main__.py      # CLI entry point
│   └── agent.py         # Triad implementation
├── tests/
│   └── mock_w666_document.txt  # Sample document for testing
├── .env.example         # Environment template
├── pyproject.toml       # Project configuration
└── README.md
```

## Google Cloud Integration

This system uses Vertex AI to keep all API calls within your Google Cloud project:

- **Billing**: Charged to your Google Cloud account
- **Security**: Uses Application Default Credentials
- **Compliance**: Data stays within your cloud boundary
- **Region**: us-east5 recommended for Claude availability

## License

Copyright (c) 2025 WellTegra Network. All rights reserved.
