"""
Dark Kenneth Triad - Production-Ready Agent System

A Google Cloud Portfolio Project using Claude Agent SDK with Vertex AI.
Defines Alpha, Beta, and Gamma as Programmatic Subagents for W666 Structural Audits.

Prerequisites:
    pip install "anthropic[vertex]" claude-agent-sdk python-dotenv
"""

import asyncio
import os
import sys
from typing import Optional

try:
    from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition
except ImportError:
    # Fallback for development - provide mock structure
    print("WARNING: claude-agent-sdk not installed. Install with:")
    print("  pip install claude-agent-sdk")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


# ============================================================================
# THE TRIAD - Specialized Subagents with Isolated Contexts
# ============================================================================

def create_agent_alpha() -> AgentDefinition:
    """
    AGENT ALPHA - The Contagion Hunter

    Specializes in:
        - Structural architecture audits
        - Tight coupling identification
        - Terminal contagion path mapping
        - Failure cascade analysis

    Worldview: Brutal Realism
    Tone: Clinical, detached
    """
    return AgentDefinition(
        name="agent-alpha",
        description="Technical failure and contagion specialist. Use for structural architecture audits, identifying tight coupling, and mapping terminal contagion paths.",
        system_prompt="""You are 'The Contagion Hunter.' Your worldview is Brutal Realism.

CORE DIRECTIVE:
Identify 'Tight Coupling' and map terminal contagion paths. When Part X fails, systematically determine what breaks next.

METHODOLOGY:
1. Map all dependency chains in the architecture
2. Identify single points of failure
3. Calculate failure propagation speed
4. Flag any system where failure of Component A forces shutdown of Component B

OUTPUT FORMAT:
For each contagion path found:
- PATH: [Component A] → [Component B] → [System Failure]
- SEVERITY: Catastrophic / Critical / Degraded
- COUPLING_SCORE: 0-100 (100 = inextricably linked)

TONE: Clinical, detached. Use phrases like "The logic dictates..." and "Structural inevitability..."

RED FLAGS TO HUNT:
- Synchronous dependencies between unrelated services
- Shared state without isolation boundaries
- Cascade-prone authentication systems
- Database locks that propagate failures""",
        model="claude-3-5-sonnet@20240620"
    )


def create_agent_beta() -> AgentDefinition:
    """
    AGENT BETA - The Narrative Auditor

    Specializes in:
        - Timeline analysis
        - Project claim verification
        - Executive optimism bias detection
        - Reality coefficient calculation

    Worldview: Forensic Skepticism
    Tone: Skeptical, forensic
    """
    return AgentDefinition(
        name="agent-beta",
        description="Narrative auditor. Use for analyzing timelines, project claims, executive optimism bias, and calculating reality coefficients.",
        system_prompt="""You are 'The Narrative Auditor.' Specialty: Optimism Bias Detection.

CORE DIRECTIVE:
Flag masking adverbs, miracle-dependent timelines, and calculate a 'Reality Coefficient' (0-100%).

METHODOLOGY:
1. Scan for masking adverbs: seamlessly, rapidly, easily, simply, just, merely
2. Identify timeline compression: "6 months" for 2-year projects
3. Count undefined dependencies: "API integration will be straightforward"
4. Detect confidence inflation: absolute statements without contingency plans

OUTPUT FORMAT:
REALITY COEFFICIENT CALCULATION:
- Timeline Plausibility: __ / 25
- Resource Realism: __ / 25
- Dependency Acknowledgment: __ / 25
- Contingency Presence: __ / 25
-
TOTAL REALITY COEFFICIENT: __ / 100

< 40%: FANTASY - Project exists in PowerPoint only
40-69%: OPTIMISTIC - Significant risks being masked
70-89%: GROUNDED - Credible with monitoring required
> 90%: REALISTIC - Rare; verified by external audit

TONE: Skeptical, forensic. Use "Claim identified:" and "Evidence suggests..."

RED FLAGS TO HUNT:
- "We'll figure it out later" statements
- Unproven technology assumptions
- Missing failure mode discussions
- Revenue projections without customer validation""",
        model="claude-3-5-sonnet@20240620"
    )


def create_agent_gamma(enable_web_search: bool = True) -> AgentDefinition:
    """
    AGENT GAMMA - The Regulator's Ghost

    Specializes in:
        - DORA (Digital Operational Resilience Act) compliance
        - GDPR data protection audits
        - Board liability exposure
        - FCA/ESMA regulatory enforcement with live web search

    Worldview: Severe Compliance
    Tone: Severe, threateningly precise

    Args:
        enable_web_search: Enable live FCA/ESMA enforcement lookups via WebSearch tool
    """
    # Build system prompt with optional web search instructions
    web_search_instructions = """

WEB SEARCH CAPABILITIES:
You have access to WebSearch. USE IT to look up:
- Latest FCA (Financial Conduct Authority) enforcement actions from 2025
- ESMA (European Securities and Markets Authority) recent decisions
- Current ICO (Information Commissioner's Office) fines and penalties
- Recent DORA implementation guidance and enforcement patterns
- Latest GDPR court rulings and fine precedents

SEARCH STRATEGY:
Before issuing a verdict, search for:
1. "FCA enforcement actions 2025 operational resilience"
2. "ESMA fines 2025 digital operational resilience"
3. "ICO GDPR fines 2025 data breach"
4. "DORA enforcement 2025 third-party risk"

Include relevant findings in your verdict with citations like:
[Source: FCA Enforcement Notice 2025/Q4]""" if enable_web_search else ""

    return AgentDefinition(
        name="agent-gamma",
        description="Regulatory auditor. Use for DORA, GDPR, FCA, ESMA compliance checks and Board liability exposure assessment. Has web search capability for latest enforcement actions.",
        system_prompt="""You are 'The Regulator's Ghost.' Expert in DORA, UK Operational Resilience, GDPR, and Financial Regulation.

CORE DIRECTIVE:
Identify points of negligence. State maximum fines. Issue VETO status when compliance is impossible.
""" + web_search_instructions + """

METHODOLOGY:
1. DORA COMPLIANCE (EU 2022/2554)
   - ICT risk management framework
   - Incident reporting timelines (1 hour for serious, 72 hours full report)
   - Digital operational resilience testing
   - Third-party risk management (ICT third-party risk policy)

2. GDPR VIOLATIONS
   - Lawful basis for processing
   - Data minimization compliance
   - Right to erasure implementation
   - Breach notification (72 hours)

3. BOARD LIABILITY (UK Companies Act 2006, s174)
   - Duty to exercise reasonable care, skill, and diligence
   - Failure to monitor = personal liability
   - Insurance requirements for operational resilience

4. FCA/ESMA ENFORCEMENT INTELLIGENCE
   - Reference recent enforcement actions for similar violations
   - Compare against current regulatory climate
   - Note increasing fine trends for operational resilience failures

OUTPUT FORMAT:
REGULATORY VERDICT:
- DORA STATUS: [COMPLIANT / PARTIAL / VETO]
- GDPR STATUS: [COMPLIANT / PARTIAL / VETO]
- BOARD LIABILITY: [ACCEPTABLE / ELEVATED / SEVERE]

FINANCIAL EXPOSURE:
- Maximum DORA Fine: __% of global turnover
- Maximum GDPR Fine: __% of global turnover (€20M or 4%, whichever is higher)
- Personal Director Risk: YES/NO

ENFORCEMENT INTELLIGENCE:
[If web search enabled, include recent relevant cases and fines]

VETO CONDITIONS (project must not proceed):
- Missing ICT risk management: VETO
- No incident response playbook: VETO
- Undefined data retention policy: VETO
- No third-party risk assessment: VETO

TONE: Severe, threateningly precise. Use "NON-COMPLIANCE DETECTED" and "LIABILITY CONFIRMED."

RED FLAGS TO HUNT:
- "We'll handle security later"
- Undefined data ownership
- Missing breach detection systems
- No resilience testing documentation""",
        model="claude-3-5-sonnet@20240620"
    )


# ============================================================================
# THE ORCHESTRATOR - Lead Coordinator
# ============================================================================

async def run_w666_audit(
    target: str,
    enable_web_search: bool = False,
    verbose: bool = True
) -> dict:
    """
    Execute a full W666 Structural Sanity Audit using the Triad.

    Args:
        target: Path to PDF/file or text content to audit
        enable_web_search: Enable Agent Gamma to search latest FCA/ESMA enforcement
        verbose: Print streaming output

    Returns:
        Dictionary containing the combined verdict from all agents
    """
    # Define the Triad (Gamma gets web search capability if enabled)
    alpha = create_agent_alpha()
    beta = create_agent_beta()
    gamma = create_agent_gamma(enable_web_search=enable_web_search)

    # Configure available tools
    allowed_tools = ["Read", "Bash"]
    if enable_web_search:
        allowed_tools.append("WebSearch")

    # Configure the Orchestrator
    options = ClaudeAgentOptions(
        system_prompt="""You are the Welltegra Lead Orchestrator.

Your role is to coordinate the Dark Kenneth Triad for W666 Structural Sanity Audits.

DELEGATION PROTOCOL:
1. Send technical architecture sections to Agent Alpha (Contagion Hunter)
2. Send timelines, claims, and projections to Agent Beta (Narrative Auditor)
3. Send compliance statements, data handling, and governance to Agent Gamma (Regulator's Ghost)

SYNTHESIS REQUIREMENTS:
After receiving analysis from all three agents, provide a combined verdict with:
- OVERALL STATUS: [PROCEED / CAUTION / VETO]
- CRITICAL FINDINGS: Summary from each agent
- REQUIRED ACTIONS: What must be addressed before proceeding

If ANY agent issues a VETO, the overall status must be VETO.""",
        agents=[alpha, beta, gamma],
        allowed_tools=allowed_tools,
        permission_mode="acceptEdits"  # Ask before high-impact actions
    )

    # Ensure we use Vertex AI (Google Cloud)
    os.environ["CLAUDE_CODE_USE_VERTEX"] = "1"

    if verbose:
        print("╔════════════════════════════════════════════════════════════╗")
        print("║        DARK KENNETH TRIAD - W666 AUDIT INITIALIZED          ║")
        print("╚════════════════════════════════════════════════════════════╝")
        print()
        print("┌────────────────────────────────────────────────────────────┐")
        print("│  [ALPHA] Contagion Hunter  - Technical & Structural        │")
        print("│  [BETA]  Narrative Auditor - Timeline & Claim Analysis     │")
        print("│  [GAMMA] Regulator's Ghost - DORA/GDPR Compliance          │")
        print("└────────────────────────────────────────────────────────────┘")
        print()
        print(f"TARGET: {target[:100]}...")
        print()

    # Execute the audit
    full_response = []
    async for message in query(
        prompt=f"""Run a full W666 Structural Sanity Audit on this target:

{target}

Provide a structured verdict with:
1. CONTAGION ANALYSIS (Alpha)
2. REALITY COEFFICIENT (Beta)
3. REGULATORY VERDICT (Gamma)
4. FINAL STATUS: PROCEED / CAUTION / VETO""",
        options=options
    ):
        if hasattr(message, "text"):
            full_response.append(message.text)
            if verbose:
                print(message.text, end="", flush=True)
        elif hasattr(message, "content"):
            full_response.append(str(message.content))
            if verbose:
                print(message.content)

    return {
        "target": target,
        "response": "".join(full_response),
        "agents_used": ["alpha", "beta", "gamma"]
    }


# ============================================================================
# COMMAND LINE INTERFACE
# ============================================================================

async def main():
    """Main entry point for the CLI interface."""
    print("╔════════════════════════════════════════════════════════════╗")
    print("║        DARK KENNETH TRIAD - AUDIT SYSTEM                   ║")
    print("║        Google Cloud Vertex AI Integration                   ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print()

    # Check for Vertex configuration
    vertex_project = os.environ.get("ANTHROPIC_VERTEX_PROJECT_ID")
    vertex_region = os.environ.get("ANTHROPIC_VERTEX_REGION", "us-east5")

    if not vertex_project:
        print("WARNING: ANTHROPIC_VERTEX_PROJECT_ID not set in environment")
        print("Set it in .env or export before running:")
        print("  export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id")
        print()

    # Check for web search enablement
    enable_web_search = os.environ.get("ENABLE_WEB_SEARCH", "false").lower() in ("true", "1", "yes", "on")
    if enable_web_search:
        print("⚠️  WEB SEARCH ENABLED: Agent Gamma will query FCA/ESMA/ICO for latest enforcement")
        print()

    # Get input from user
    print("Enter the path to the PDF/file to audit, or paste text directly.")
    print("Press Ctrl+D (Linux/Mac) or Ctrl+Z (Windows) when done.")
    print("-" * 60)
    user_input = sys.stdin.read()

    if not user_input.strip():
        print("ERROR: No input provided.")
        return

    print()
    print("Running audit...")
    if enable_web_search:
        print("Agent Gamma is searching latest enforcement actions...")
    print("-" * 60)
    print()

    try:
        result = await run_w666_audit(
            target=user_input,
            enable_web_search=enable_web_search,
            verbose=True
        )

        print()
        print("-" * 60)
        print("AUDIT COMPLETE")
        print("-" * 60)

    except Exception as e:
        print(f"\nERROR: {e}")
        print("\nTroubleshooting:")
        print("1. Ensure claude-agent-sdk is installed")
        print("2. Verify Vertex AI credentials are configured")
        print("3. Check that Anthropic API is enabled in your Google Cloud project")


if __name__ == "__main__":
    asyncio.run(main())


# ============================================================================
# PYTHON API INTERFACE
# ============================================================================

class DarkKennethTriad:
    """
    Python API interface for the Dark Kenneth Triad audit system.

    Example:
        triad = DarkKennethTriad()
        result = await triad.audit(project_document_text)
        print(result['verdict'])
    """

    def __init__(self, use_vertex: bool = True):
        """
        Initialize the Triad.

        Args:
            use_vertex: Use Google Cloud Vertex AI (recommended for billing/security)
        """
        self.use_vertex = use_vertex
        if use_vertex:
            os.environ["CLAUDE_CODE_USE_VERTEX"] = "1"

    async def audit(self, target: str, enable_web_search: bool = False) -> dict:
        """
        Run a W666 audit on the target text/document.

        Args:
            target: The text or file path to audit
            enable_web_search: Enable web search for regulatory updates

        Returns:
            Dictionary with audit results
        """
        return await run_w666_audit(
            target=target,
            enable_web_search=enable_web_search,
            verbose=False
        )

    def audit_sync(self, target: str, enable_web_search: bool = False) -> dict:
        """
        Synchronous wrapper for audit.

        Args:
            target: The text or file path to audit
            enable_web_search: Enable web search for regulatory updates

        Returns:
            Dictionary with audit results
        """
        return asyncio.run(self.audit(target, enable_web_search))
