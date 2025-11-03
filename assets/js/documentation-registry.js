(function registerWelltegraDocumentation() {
    const catalog = [
        {
            id: 'core-manuals',
            icon: '📘',
            title: 'Core Manuals & Quick Starts',
            description: 'Day-one guides that explain the platform story, personas, and how to get a local walkthrough running in minutes.',
            quickLink: {
                href: 'START_HERE.md',
                label: 'Open the Start Here guide'
            },
            items: [
                {
                    title: 'Start Here Guide',
                    path: 'START_HERE.md',
                    summary: 'Project orientation covering the repository layout, helper scripts for Git setup, and what artefacts ship with the demo bundle.',
                    tags: ['Orientation', 'Repository'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Instruction Manual',
                    path: 'INSTRUCTION_MANUAL.md',
                    summary: 'Versioned build notes with personas, architecture decisions, deployment tips, and the end-to-end platform narrative.',
                    tags: ['Personas', 'Architecture'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'User Manual & FAQ',
                    path: 'USER_MANUAL.md',
                    summary: 'Step-by-step walkthroughs for the planner, live operations cockpit, analytics, and persona dashboards—plus an extensive FAQ.',
                    tags: ['How-To', 'Personas'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'AI Assistant Quick Start',
                    path: 'AI-ASSISTANT-README.md',
                    summary: 'Three-step onboarding for the Gemini-backed AI assistant with API key setup and environment guidance.',
                    tags: ['AI', 'Setup'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Testing Guide',
                    path: 'TESTING_GUIDE.md',
                    summary: 'Playwright-focused testing strategy, folder structure, and verification commands for regression coverage.',
                    tags: ['Quality', 'Playwright'],
                    updated: 'Nov 2025'
                }
            ]
        },
        {
            id: 'implementation-delivery',
            icon: '🚀',
            title: 'Implementation & Delivery',
            description: 'Code-complete implementation packs and deployment playbooks for taking Well-Tegra live quickly.',
            quickLink: {
                href: 'https://github.com/WellTegra/welltegra.network/tree/main',
                label: 'Browse repository on GitHub'
            },
            items: [
                {
                    title: 'Deployment Guide',
                    path: 'DEPLOYMENT_GUIDE.md',
                    summary: 'Command-line walkthrough for pushing the site to GitHub with initial repo setup and update workflows.',
                    tags: ['Deployment', 'GitHub'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Quick Deploy v22',
                    path: 'QUICK_DEPLOY_V22.md',
                    summary: 'Ten-minute launch checklist tailored to the v22 visual refresh with prerequisites and timed steps.',
                    tags: ['Fast Start', 'Launch'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'v23 Complete Implementation',
                    path: 'V23_COMPLETE_IMPLEMENTATION.md',
                    summary: 'Copy-paste ready HTML, CSS, and JavaScript blocks for anomaly detection, PDF exports, and vendor scorecards.',
                    tags: ['Code', 'v23'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'v23 Enhanced Features',
                    path: 'V23_ENHANCED_FEATURES.md',
                    summary: 'Deep-dive documentation on the v23 flagship features with demo scripts and business value framing.',
                    tags: ['Features', 'Demo'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Performance Optimization Guide',
                    path: 'PERFORMANCE_OPTIMIZATION.md',
                    summary: 'Detailed plan to reach 90+ Lighthouse scores with bundle slimming, lazy loading, and caching improvements.',
                    tags: ['Performance', 'Optimization'],
                    updated: 'Nov 2025'
                }
            ]
        },
        {
            id: 'security-governance',
            icon: '🛡️',
            title: 'Security & Governance',
            description: 'Operational hardening resources that cover secrets management, audit discipline, and footprint control.',
            items: [
                {
                    title: 'Security Setup Guide',
                    path: 'SECURITY-SETUP.md',
                    summary: 'Firebase and Gemini API hardening steps with rule configuration, credential storage, and monitoring practices.',
                    tags: ['Security', 'Configuration'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Security Policy',
                    path: 'SECURITY.md',
                    summary: 'Maintainer policy outlining supported versions and how to report vulnerabilities responsibly.',
                    tags: ['Policy', 'Support'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Audit Checklist',
                    path: 'CHECKLIST.md',
                    summary: 'Runtime smoke checks, JSON integrity commands, and gating logic notes for pre-release verification.',
                    tags: ['Audit', 'Quality'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Lean Inventory Initiative',
                    path: 'LEAN_INVENTORY.md',
                    summary: 'Change log documenting the removal of redundant demos and assets to shrink deployment footprint.',
                    tags: ['Governance', 'Cleanup'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Release Notes',
                    path: 'RELEASE_NOTES.md',
                    summary: 'Running log of UX and workflow refinements including navigation gating and communicator onboarding.',
                    tags: ['Changelog', 'Product'],
                    updated: 'Nov 2025'
                }
            ]
        },
        {
            id: 'data-integration',
            icon: '🧩',
            title: 'Data & Integration Standards',
            description: 'Specifications for telemetry ingestion, catalog curation, and synthetic simulation that underpin the demo data fidelity.',
            quickLink: {
                href: 'https://github.com/WellTegra/welltegra.network/tree/main/docs',
                label: 'Open /docs directory'
            },
            items: [
                {
                    title: 'WITSML/ETP Integration Guide',
                    path: 'WITSML_ETP_INTEGRATION.md',
                    summary: 'Standards coverage, authentication patterns, and payload formats for real-time telemetry pipelines.',
                    tags: ['WITSML', 'ETP'],
                    updated: 'Oct 2025'
                },
                {
                    title: 'Equipment Catalog Integration',
                    path: 'EQUIPMENT_CATALOG_INTEGRATION_GUIDE.md',
                    summary: 'Data model and workflow for the 70-item equipment catalog powering the toolstring builder.',
                    tags: ['Catalog', 'Toolstring'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Enhanced Simulation Guide',
                    path: 'ENHANCED_SIMULATION_GUIDE.md',
                    summary: 'Perlin-inspired telemetry generator architecture with UI hooks and integration steps.',
                    tags: ['Simulation', 'Telemetry'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Well Data Requirements',
                    path: 'docs/WELL_DATA_REQUIREMENTS.md',
                    summary: 'Comprehensive data schema detailing the attributes required for AI-assisted planning and benchmarking.',
                    tags: ['Data Model', 'Requirements'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Portfolio Completeness Analysis',
                    path: 'docs/PORTFOLIO_COMPLETENESS_ANALYSIS.md',
                    summary: 'Benchmark report showing the portfolio’s 92% data completeness with KPI tables and readiness verdict.',
                    tags: ['Analytics', 'Benchmark'],
                    updated: 'Nov 2025'
                }
            ]
        },
        {
            id: 'operations-history',
            icon: '📊',
            title: 'Operations History & Reports',
            description: 'Curated well histories and daily report extracts that power the readiness demo narrative.',
            quickLink: {
                href: 'docs/PAST_REPORTS_ARCHIVE.md',
                label: 'Open past reports archive'
            },
            items: [
                {
                    title: 'Past Intervention Reports Archive',
                    path: 'docs/PAST_REPORTS_ARCHIVE.md',
                    summary: 'Normalized daily report snapshots for every flagship well, including NPT and toolstring details.',
                    tags: ['Operations', 'Reporting'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Well History Ledger',
                    path: 'docs/WELL_HISTORY_LEDGER.md',
                    summary: 'Chronological event log linking surveillance findings, remediation steps, and supporting artefacts.',
                    tags: ['History', 'Traceability'],
                    updated: 'Nov 2025'
                }
            ]
        },
        {
            id: 'strategy-roadmap',
            icon: '🧭',
            title: 'Strategy & Roadmap',
            description: 'Vision documents that connect the demo experience to long-term delivery plans and competitive positioning.',
            items: [
                {
                    title: 'Strategic Roadmap 2025-2027',
                    path: 'STRATEGIC_ROADMAP_2025-2027.md',
                    summary: 'Phased 36-month delivery plan with investment, team composition, and ROI projections.',
                    tags: ['Roadmap', 'Planning'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'v23 Executive Summary',
                    path: 'V23_EXECUTIVE_SUMMARY.md',
                    summary: 'Business justification for the v23 feature trio with pain points, ROI, and differentiation notes.',
                    tags: ['Executive', 'v23'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Quick Wins Implementation',
                    path: 'QUICK_WINS_IMPLEMENTATION.md',
                    summary: 'Prioritized backlog of low-effort, high-impact features mapped to timelines and owners.',
                    tags: ['Priorities', 'Delivery'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Gemini v18 vs v23 Analysis',
                    path: 'GEMINI_V18_VS_V23_ANALYSIS.md',
                    summary: 'Comparative study highlighting how to merge Gemini’s costing focus with the v23 platform narrative.',
                    tags: ['Comparison', 'Integration'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Old Pie Embassy White Paper Notes',
                    path: 'WHITE_PAPER_INSIGHTS.md',
                    summary: 'Architecture blueprint excerpt detailing master records, history ledgers, and schematic objects.',
                    tags: ['Vision', 'Architecture'],
                    updated: 'Nov 2025'
                },
                {
                    title: 'Homepage Redesign Spec',
                    path: 'HOMEPAGE_REDESIGN_SPEC.md',
                    summary: 'Navigation simplification brief with the three hero action cards and intention-driven layout.',
                    tags: ['UX', 'Navigation'],
                    updated: 'Nov 2025'
                }
            ]
        }
    ];

    window.welltegraDocuments = catalog;
})();
