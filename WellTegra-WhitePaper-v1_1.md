# Well‑Tegra White Paper v1.1
**An interoperable AI layer for well intervention planning, execution and learning**  
**Tagline:** Your software works. We make it work smarter.

**Contacts:** info@welltegra.network · kenmckenzie@welltegra.network

---

## Executive Summary
Well‑Tegra sits **beside** existing tools (WellView, Petrel, JewelSuite, SAP, WITSML data stores) to transform historical job records and real‑time logs into model‑driven plans, live operational guardrails, and post‑job learning. Using a **sidecar ingestion** approach, we prove value **without** changing your stack: we parse vendor exports, “**mistake‑mine**” recurring failure modes, and deliver **explainable** recommendations across **Planner → Performer → Analyzer**.

A transparent ROI model (client‑adjustable) converts three inputs—**engineer salary**, **NPT/day**, **NPT days/year**—into a savings range. A 6‑week PoC validates reductions in NPT and planning time, and produces reusable playbooks.

---

## The Trillion‑Dollar Problem (Assumptions & Sensitivity)
| Input | Default | Range |
|---|---:|---|
| Avg. engineer fully‑loaded cost | $120k/year | $90k–$180k |
| Cost of NPT per day | $250k | $150k–$500k |
| NPT days per asset/year | 15 | 5–30 |

**Illustrative baseline**: $250k × 15 = **$3.75M**/asset/year in NPT. Even a **10–20%** reduction saves **$375k–$750k** per asset annually. Include soft benefits (faster planning, fewer handovers, fewer re‑runs) to expand the envelope.

> Replace defaults with client values. The model reports best/mid/worst case savings and highlights the primary drivers.

---

## Product Overview
### Planner — Model‑assisted design
- Pulls structured history & context for the target well.  
- Suggests procedures, durations, risks, and spares with **confidence** and **key drivers**.  
- Outputs a **TFA Plan** (Time/Fuel/Assets) and a clear, auditable rationale.

### Performer — Live guardrails
- Watches live logs/feeds (or periodic exports) to detect deviations.  
- Surfaces **context‑aware prompts** (“check seal stack”, “verify nitrogen pressure”) tied to historical failure modes.  
- Captures operator feedback for closed‑loop learning.

### Analyzer — Learning & KPI
- Reconciles plan vs. actual, aggregates **NPT breakdowns**, and captures **Lessons Learned** automatically.  
- Produces playbooks: what to adjust next time, and why.

---

## “Mistake‑Mining” (Method)
1. **Ingest** historical logs, comments, morning reports, and job programs.  
2. **Extract** events and NPT mentions (time, subsystem, symptoms).  
3. **Cluster** into recurring **failure modes** (recurrence × cost).  
4. **Rank** top modes; attach **playbooks** (checks, mitigations, procedure tweaks).  
5. **Explain**: Present confidence + drivers in Planner; verify impact in Analyzer.

_Result:_ A living library of “what usually goes wrong here and what we did that worked.”

---

## Interoperability Without Friction (Sidecar)
**Goal:** Prove value **without** changing operator systems.
- **Inputs:** WellView/WellFile exports (CSV), time‑depth logs (WITSML, CSV), PDFs (OCR), programs, service tickets.
- **Drop‑in channels:** watched S3 folder or secured email inbox → ETL.  
- **Mode:** **Read‑only**; no write‑backs in PoC.  
- **Schema:** a simple PoC dictionary (well, job, step, time, cost, NPT tag, comment).  
- **Outcome:** Clean dataset driving the demo UI with real operator data.

**Phase‑2 (optional):** API connectors for read‑sync; later, limited write‑backs with change control.

---

## Architecture (High‑Level)
See `figures/architecture-mermaid.mmd` for a diagram you can render.

- **Sources:** Vendor exports, WITSML, PDFs, spreadsheets.  
- **Ingestion & QC:** Parsing, schema mapping, quality rules, unit/field normalization.  
- **Feature Store:** Derived timelines, step features, risk features, TFA baselines.  
- **Models:** Recommendations (procedure, risk, spares), anomaly detection, outcome estimators.  
- **UX:** Planner/Performer/Analyzer with **explainability overlays**.  
- **Feedback Loop:** Lessons Learned update features/playbooks.

---

## Privacy & Trust
- **Suppression & Generalization:** IDs removed; location/time granularity reduced when necessary.  
- **Differential Privacy:** Noise on aggregates to protect small cohorts.  
- **Policy as Code:** Data handling rules codified; audit trail for every transformation.  
- **Tenant Isolation:** Separate storage namespaces and encryption at rest/in transit.

---

## 6‑Week Proof of Concept (PoC)
**Scope:** 1 asset; 10–20 historical jobs + 1 upcoming candidate well.

**Week 1 — Data Handshake**: source inventory; PoC schema; sidecar path (S3/email).  
**Week 2 — ETL & QA**: parse, map, quality checks; build timelines & NPT tags.  
**Week 3 — Mistake‑Mining v1**: cluster top 5 failure modes; draft playbooks.  
**Week 4 — Planner Integration**: surface recommendations with confidence + drivers; seed TFA plan baselines.  
**Week 5 — Analyzer & KPIs**: NPT donut; duration/cost deltas; Lessons Learned capture; ROI deltas.  
**Week 6 — Results & Roadmap**: exec readout; integration options (API mode).

**Success Criteria:** ≥15% modeled NPT reduction opportunity; ≥25% planning time reclaimed; ≥3 reusable playbooks.

---

## KPIs & Commercials
- **KPIs:** NPT %, planning hours saved, forecast accuracy vs. baseline, learning reuse rate.  
- **Commercials:** Subscription (per asset or seat) **and/or** Pilot “savings share.”

---

## Roadmap
- **Now:** Sidecar PoC; explainable recommendations in Planner; Analyzer deltas.  
- **Next:** Live logs (WITSML streaming), risk heatmaps, cross‑asset benchmarking.  
- **Later:** Controlled write‑backs and partner marketplace.

---

## Appendix A — PoC Data Dictionary (Minimal)
- **Well:** id, field/asset, type, environment.  
- **Job:** id, date range, service type, contractor(s).  
- **Step:** start/end time, operation code, equipment, parameters.  
- **Outcome:** duration, cost, NPT flag & minutes, cause, free‑text comment.  
- **Derived:** step features, risk features, TFA baseline deltas.

## Appendix B — Example Failure Modes
- Pressure control leak → seal stack verification, torque specs, pressure test checklist.  
- Stuck tools → debris risk modelling, circulation plan, contingency spares.  
- Comms loss → telemetry health checks, redundancy, pre‑job test plan.

---

*© Well‑Tegra. Draft for discussion.*
