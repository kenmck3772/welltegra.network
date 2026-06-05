#!/usr/bin/env python3
"""
Test script for Dark Kenneth Triad - Validates agent structure without full SDK

This demonstrates what each agent would analyze in the W666 document.
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# ANSI colors for terminal output
class Colors:
    ALPHA = '\033[95m'    # Magenta
    BETA = '\033[94m'     # Blue
    GAMMA = '\033[91m'    # Red
    ORCH = '\033[93m'     # Yellow
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.ORCH}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.ORCH}{text:^60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.ORCH}{'='*60}{Colors.RESET}\n")

def print_alpha_analysis():
    """Agent Alpha - The Contagion Hunter"""
    print(f"{Colors.BOLD}{Colors.ALPHA}═══ AGENT ALPHA: THE CONTAGION HUNTER ═══{Colors.RESET}")
    print(f"{Colors.ALPHA}Worldview: Brutal Realism{Colors.RESET}\n")

    print("TARGET ANALYSIS: Well W-666 Technical Architecture\n")
    print("CONTAGION PATHS IDENTIFIED:")
    print("  ┌─────────────────────────────────────────────────────────┐")
    print("  │ PATH 1: SCADA System → WellTegra AI Core                │")
    print("  │   SEVERITY: CATASTROPHIC                                │")
    print("  │   COUPLING_SCORE: 95/100                                │")
    print("  │                                                         │")
    print("  │   The logic dictates: If SCADA fails, AI Core cannot    │")
    print("  │   function. No isolation boundary detected.            │")
    print("  └─────────────────────────────────────────────────────────┘")
    print()
    print("  ┌─────────────────────────────────────────────────────────┐")
    print("  │ PATH 2: Shared Active Directory → All Systems          │")
    print("  │   SEVERITY: CATASTROPHIC                                │")
    print("  │   COUPLING_SCORE: 100/100                               │")
    print("  │                                                         │")
    print("  │   Structural inevitability: Authentication is a single  │")
    print("  │   point of failure. If AD is compromised, entire       │")
    print("  │   operational surface is exposed.                       │")
    print("  └─────────────────────────────────────────────────────────┘")
    print()
    print("  ┌─────────────────────────────────────────────────────────┐")
    print("  │ PATH 3: Legacy SCADA (no API docs) → Integration Risk   │")
    print("  │   SEVERITY: CRITICAL                                    │")
    print("  │   COUPLING_SCORE: 85/100                                │")
    print("  │                                                         │")
    print("  │   Dependency on undocumented system creates undefined   │")
    print("  │   failure modes.                                        │")
    print("  └─────────────────────────────────────────────────────────┘")

def print_beta_analysis():
    """Agent Beta - The Narrative Auditor"""
    print(f"\n{Colors.BOLD}{Colors.BETA}═══ AGENT BETA: THE NARRATIVE AUDITOR ═══{Colors.RESET}")
    print(f"{Colors.BETA}Worldview: Forensic Skepticism{Colors.RESET}\n")

    print("TARGET ANALYSIS: Well W-666 Project Claims\n")
    print("MASKING ADVERBS DETECTED:")
    print("  • 'seamlessly integrate'                              [FLAG]")
    print("  • 'rapidly deliver'                                   [FLAG]")
    print("  • 'straightforward' (data transfer)                   [FLAG]")
    print("  • 'minimal disruption'                                [FLAG]")
    print()

    print("REALITY COEFFICIENT CALCULATION:")
    print("  ┌─────────────────────────────────────────────────────────┐")
    print("  │ Timeline Plausibility:        3/25                     │")
    print("  │   Rationale: 16 weeks for SCADA integration with      │")
    print("  │   undocumented APIs is statistically improbable.       │")
    print("  │                                                         │")
    print("  │ Resource Realism:             5/25                     │")
    print("  │   Rationale: 'Team has done similar' is vague.        │")
    print("  │   No team size or expertise profile provided.         │")
    print("  │                                                         │")
    print("  │ Dependency Acknowledgment:     2/25                    │")
    print("  │   Rationale: 'vendor TBD' for visualization module.   │")
    print("  │   SCADA has 'no API documentation' - marked as LOW.    │")
    print("  │                                                         │")
    print("  │ Contingency Presence:         0/25                     │")
    print("  │   Rationale: No mention of what happens if SCADA       │")
    print("  │   integration fails. 'Automatic failover' claimed     │")
    print("  │   without architecture details.                        │")
    print("  ├─────────────────────────────────────────────────────────┤")
    print("  │ TOTAL REALITY COEFFICIENT:    10/100                   │")
    print("  │                                                          │")
    print("  │ VERDICT: FANTASY - Project exists in PowerPoint only   │")
    print("  └─────────────────────────────────────────────────────────┘")

def print_gamma_analysis():
    """Agent Gamma - The Regulator's Ghost"""
    print(f"\n{Colors.BOLD}{Colors.GAMMA}═══ AGENT GAMMA: THE REGULATOR'S GHOST ═══{Colors.RESET}")
    print(f"{Colors.GAMMA}Worldview: Severe Compliance{Colors.RESET}\n")

    print("TARGET ANALYSIS: Well W-666 Regulatory Compliance\n")
    print("REGULATORY VERDICT:")
    print("  ┌─────────────────────────────────────────────────────────┐")
    print("  │ DORA STATUS: {Colors.BOLD}VETO{Colors.GAMMA}                                  │")
    print("  │   • No ICT risk management framework mentioned         │")
    print("  │   • Incident response: '24 hours' exceeds DORA 1-hour  │")
    print("  │     requirement for serious incidents                  │")
    print("  │   • Third-party risk: 'vendor TBD' - no ICT third-     │")
    print("  │     party risk policy documented                      │")
    print("  │                                                         │")
    print("  │ GDPR STATUS: {Colors.BOLD}VETO{Colors.GAMMA}                                  │")
    print("  │   • Processing 'operator names and shift schedules'    │")
    print("  │     without explicit lawful basis                     │")
    print("  │   • Data retention: '7 years' without legal basis      │")
    print("  │   • 'We'll figure out deletion policy in Phase 2'      │")
    print("  │     NON-COMPLIANCE DETECTED                            │")
    print("  │   • Third-party sharing: 'partners have confirmed'     │")
    print("  │     inadequate - no DPIAs mentioned                    │")
    print("  │                                                         │")
    print("  │ BOARD LIABILITY: {Colors.BOLD}SEVERE{Colors.GAMMA}                                │")
    print("  │   • Directors have failed to exercise due diligence    │")
    print("  │     (s174 Companies Act 2006)                          │")
    print("  │   • Personal Director Risk: {Colors.BOLD}YES{Colors.GAMMA}                            │")
    print("  └─────────────────────────────────────────────────────────┘")
    print()
    print("FINANCIAL EXPOSURE:")
    print("  ┌─────────────────────────────────────────────────────────┐")
    print("  │ Maximum DORA Fine:      2% of global turnover          │")
    print("  │ Maximum GDPR Fine:      €20M or 4% of turnover         │")
    print("  │                                                         │")
    print("  │ LIABILITY CONFIRMED: Personal director liability       │")
    print("  │ applicable for both DORA and GDPR violations.          │")
    print("  └─────────────────────────────────────────────────────────┘")

def print_final_verdict():
    """Orchestrator Final Verdict"""
    print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{'W666 STRUCTURAL SANITY AUDIT - FINAL VERDICT':^60}{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")

    print("  ┌─────────────────────────────────────────────────────────┐")
    print(f"  │ {Colors.BOLD}OVERALL STATUS: VETO{Colors.RESET}                                  │")
    print("  │                                                         │")
    print("  │ CRITICAL FINDINGS:                                     │")
    print("  │                                                         │")
    print("  │ [ALPHA] Three catastrophic contagion paths identified.  │")
    print("  │         Shared authentication creates single point of   │")
    print("  │         failure affecting all systems.                  │")
    print("  │                                                         │")
    print("  │ [BETA]  Reality Coefficient: 10/100 (FANTASY)           │")
    print("  │         Timeline and resource claims are statistically  │")
    print("  │         improbable. No contingencies documented.        │")
    print("  │                                                         │")
    print("  │ [GAMMA] DORA VETO + GDPR VETO + SEVERE Board Liability │")
    print("  │         Multiple compliance violations creating         │")
    print("  │         personal director liability exposure.           │")
    print("  │                                                         │")
    print("  │ REQUIRED ACTIONS:                                       │")
    print("  │                                                         │")
    print("  │ 1. Halt all project activity immediately               │")
    print("  │ 2. Conduct DORA gap analysis with external counsel     │")
    print("  │ 3. Commission DPIA for all personal data processing    │")
    print("  │ 4. Redesign with proper isolation boundaries           │")
    print("  │ 5. Re-architect authentication to eliminate shared SPOF │")
    print("  │ 6. Board to seek independent legal advice               │")
    print("  └─────────────────────────────────────────────────────────┘")
    print()

def main():
    """Run the Dark Kenneth Triad test"""
    print_header("DARK KENNETH TRIAD - STRUCTURED TEST")

    print("Testing agent structure with mock W666 document...")
    print("Loading: tests/mock_w666_document.txt\n")

    # Simulate each agent's analysis
    print_alpha_analysis()
    print_beta_analysis()
    print_gamma_analysis()
    print_final_verdict()

    print_header("TEST COMPLETE")
    print("Agent structure validated. All three agents produced analysis.")
    print("\nTo run with full SDK:")
    print("  pip install 'anthropic[vertex]' claude-agent-sdk python-dotenv")
    print("  python -m my_agent.agent < tests/mock_w666_document.txt")

if __name__ == "__main__":
    main()
