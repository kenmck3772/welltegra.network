import React, { useState, useEffect } from 'react';

// JSON Data
const data = {
  "series": {
    "id": "w666",
    "title": "The Well From Hell (W666)",
    "subtitle": "How Reasonable Decisions Compounded Into Systemic Failure — and How It Was Finally Solved",
    "heroCta": {
      "label": "Explore the 7 contributing loops",
      "targetCaseStudyId": "w666-slickline"
    },
    "sections": [
      {
        "type": "h2",
        "text": "Executive Summary"
      },
      {
        "type": "p",
        "text": "The Well From Hell (W666) did not fail because of a single technical mistake, operational error, or lack of expertise. It failed because learning did not persist across decisions."
      },
      {
        "type": "p",
        "text": "Across multiple campaigns and intervention domains — slickline, coil tubing, integrity management, subsea operations — decisions were made in isolation, under uncertainty, and without a mechanism to absorb lessons from previous outcomes."
      },
      {
        "type": "p",
        "text": "Each decision, taken alone, was reasonable. Together, they created a reinforcing loop of escalation, rework, and risk accumulation."
      },
      {
        "type": "p",
        "text": "This case study explains how W666 became \"the well from hell\", and how the Brahan Engine broke the cycle by turning fragmented operational experience into a learning decision system."
      },
      {
        "type": "h2",
        "text": "The Context: A Well That Would Not Settle"
      },
      {
        "type": "p",
        "text": "W666 was a producing well with recurring operational challenges. Individually, none were extraordinary: intermittent underperformance, evolving integrity concerns, repeated interventions with mixed outcomes, escalating costs, and growing scrutiny."
      },
      {
        "type": "p",
        "text": "What made W666 different was not severity — it was persistence. Despite repeated activity, the well never returned to a stable, trusted state."
      },
      {
        "type": "h2",
        "text": "The Real Problem: Decisions Without Memory"
      },
      {
        "type": "p",
        "text": "Each intervention campaign approached W666 as a new problem. Slickline focused on immediate constraints, coil tubing addressed symptoms revealed by earlier work, integrity reacted to the latest inspections, and subsea considerations were deferred due to cost and complexity."
      },
      {
        "type": "p",
        "text": "The system had data, but no mechanism to learn across campaigns."
      },
      {
        "type": "callout",
        "tone": "quote",
        "text": "Failures were recorded. Patterns were not."
      },
      {
        "type": "h2",
        "text": "How the Failure Compounded"
      },
      {
        "type": "ul",
        "items": [
          "Urgency bias drove repeated low-cost interventions.",
          "Escalation bias justified more invasive activity after partial failure.",
          "Integrity risk accumulated silently while production was prioritised.",
          "Rare but high-consequence risks were consistently deprioritised.",
          "Decisions were justified retrospectively, not prospectively."
        ]
      },
      {
        "type": "p",
        "text": "Each team acted rationally within its remit. The system failed collectively."
      },
      {
        "type": "h2",
        "text": "The Breaking Point"
      },
      {
        "type": "p",
        "text": "Eventually, W666 reached a state where intervention costs exceeded remaining upside, integrity uncertainty dominated planning, confidence in decision quality eroded, and scrutiny intensified."
      },
      {
        "type": "p",
        "text": "At this point, the technical question became secondary. The primary question was:"
      },
      {
        "type": "callout",
        "tone": "quote",
        "text": "How do we stop repeating the same decision patterns?"
      },
      {
        "type": "h2",
        "text": "The Well-Tegra Intervention"
      },
      {
        "type": "p",
        "text": "Well-Tegra reframed W666 as a failing decision system. Using the Brahan Engine, historical data from all prior campaigns and intervention domains was pooled into a single probabilistic decision framework."
      },
      {
        "type": "ul",
        "items": [
          "Success and failure outcomes",
          "Rework frequency and cost",
          "Time-based degradation effects",
          "Consequence severity",
          "Decision timing and escalation behaviour"
        ]
      },
      {
        "type": "p",
        "text": "Failures were preserved as learning signals, not discarded as exceptions."
      },
      {
        "type": "h2",
        "text": "What Changed"
      },
      {
        "type": "p",
        "text": "Instead of asking \"What should we do next?\", decision-makers could ask which decisions remained robust under uncertainty, where learning materially changed confidence, when escalation destroyed value, and which risks dominated regardless of technical success."
      },
      {
        "type": "p",
        "text": "The answer was no longer opinion-based — it was explicit and defensible."
      },
      {
        "type": "h2",
        "text": "How W666 Was Actually Solved"
      },
      {
        "type": "p",
        "text": "W666 was not fixed by a single operation. It was resolved when low-robustness interventions were deprioritised, integrity thresholds were made explicit, escalation paths were evaluated before commitment, shut-in decisions became defensible, and learning persisted across domains."
      },
      {
        "type": "callout",
        "tone": "quote",
        "text": "The well stabilised when decision-making stabilised."
      },
      {
        "type": "h2",
        "text": "The Seven Contributing Case Studies"
      },
      {
        "type": "ol",
        "items": [
          "Slickline campaign prioritisation",
          "Coil tubing escalation decisions",
          "Wellhead integrity risk sequencing",
          "Subsea inspection and maintenance deferral",
          "Integrity-led production curtailment",
          "Cross-discipline operational misalignment",
          "Regulator-facing decision defence"
        ]
      },
      {
        "type": "h2",
        "text": "The Core Lesson"
      },
      {
        "type": "callout",
        "tone": "quote",
        "text": "W666 was not caused by one bad decision — it was caused by many reasonable decisions made without a learning system."
      },
      {
        "type": "h2",
        "text": "Why This Matters Beyond W666"
      },
      {
        "type": "p",
        "text": "Every complex asset contains multiple W666s in waiting. Wherever uncertainty persists, decisions recur, failures are episodic, and learning resets, the outcome is controlled by how decisions learn over time."
      },
      {
        "type": "callout",
        "tone": "quote",
        "text": "Better wells don't come from better interventions. They come from better decisions — informed by memory."
      }
    ],
    "relatedCaseStudyIds": [
      "w666-slickline",
      "w666-coiltubing",
      "w666-wellhead-integrity",
      "w666-subsea",
      "w666-shutin",
      "w666-alignment",
      "w666-regulator"
    ]
  },
  "caseStudies": [
    {
      "id": "w666-slickline",
      "order": 1,
      "title": "Slickline Campaigns: How \"Low-Risk\" Decisions Quietly Destabilised W666",
      "subtitle": "The first loop where learning failed to persist.",
      "hook": "Slickline became the default response to uncertainty.",
      "linksTo": ["w666-coiltubing"],
      "narrative": [
        {
          "type": "h2",
          "text": "Why This Case Matters"
        },
        {
          "type": "p",
          "text": "Slickline activity was never considered a root cause of the W666 problem. It was viewed as low cost, low complexity, and easily repeatable — and yet it was the first decision loop where learning failed to persist."
        },
        {
          "type": "p",
          "text": "This case study explains how repeated slickline decisions, each reasonable in isolation, created the conditions that allowed W666 to escalate into systemic failure."
        },
        {
          "type": "h2",
          "text": "Operational Context"
        },
        {
          "type": "p",
          "text": "W666 experienced intermittent production underperformance and data uncertainty that triggered multiple slickline interventions over time. These included routine diagnostics, minor remedial actions, and follow-up runs intended to \"tidy up\" unresolved issues."
        },
        {
          "type": "callout",
          "tone": "quote",
          "text": "Slickline became the default response to uncertainty."
        },
        {
          "type": "h2",
          "text": "The Decision Being Made"
        },
        {
          "type": "p",
          "text": "At each campaign, the decision appeared simple: \"Which slickline jobs should we run now?\" The missing question was: \"Which slickline decisions remain robust once failure and rework are considered?\""
        },
        {
          "type": "h2",
          "text": "Why the Decision Was Misleading"
        },
        {
          "type": "p",
          "text": "Slickline decisions were consistently framed as binary outcomes — successful or unsuccessful. Historical outcomes showed partial success, high rework probability, decaying diagnostic confidence, and deferred value."
        },
        {
          "type": "p",
          "text": "Because each campaign was reviewed independently, patterns across campaigns were invisible."
        },
        {
          "type": "h2",
          "text": "How This Contributed to W666"
        },
        {
          "type": "ul",
          "items": [
            "Repeated low-value interventions consumed operational bandwidth.",
            "Partial success delayed recognition of deeper issues.",
            "Confidence in diagnostics exceeded their predictive power.",
            "Escalation thresholds became blurred."
          ]
        },
        {
          "type": "callout",
          "tone": "quote",
          "text": "The well appeared busy, but not better."
        },
        {
          "type": "h2",
          "text": "The Well-Tegra Intervention"
        },
        {
          "type": "p",
          "text": "Using the Brahan Engine, historical slickline campaign data across W666 and comparable wells was pooled into a probabilistic decision framework incorporating success and failure distributions, rework frequency, time-to-value variability, and cost uncertainty."
        },
        {
          "type": "p",
          "text": "Instead of asking \"Will this job work?\", the framework asked: \"How much does this decision actually change what we know?\""
        },
        {
          "type": "h2",
          "text": "What the Learning Revealed"
        },
        {
          "type": "ul",
          "items": [
            "Many slickline jobs delivered confidence without information.",
            "Rework risk dominated expected value more than cost.",
            "Some interventions had negligible impact on downstream decisions.",
            "Learning saturation occurred early — additional runs added activity, not insight."
          ]
        },
        {
          "type": "h2",
          "text": "The Decision Shift"
        },
        {
          "type": "ul",
          "items": [
            "Jobs were ranked by information gain, not urgency.",
            "Low-learning interventions were deprioritised.",
            "Escalation paths were evaluated earlier.",
            "\"Do nothing\" became defensible."
          ]
        },
        {
          "type": "callout",
          "tone": "quote",
          "text": "The most dangerous decisions are the ones that feel safe enough to repeat."
        }
      ],
      "demo": {
        "title": "Brahan Engine Demonstration: Learning From Past Campaigns to Improve Present Decisions",
        "duration": "10 minutes",
        "cta": { "label": "View 10-Minute Decision Walkthrough", "target": "modal" },
        "steps": [
          {
            "title": "The Decision Frame",
            "body": "A set of candidate slickline jobs across multiple wells is presented with estimated uplift, indicative cost, complexity, and a data quality indicator. At first glance, prioritisation looks straightforward — until uncertainty is made explicit."
          },
          {
            "title": "What Past Campaigns Taught Us",
            "body": "Pooled campaign history shows recurring patterns: urgency-based selection underperforms, early diagnostics are often overconfident, and rework probability is a dominant driver of value erosion."
          },
          {
            "title": "What Brahan Sees",
            "body": "Brahan ingests success/failure distributions, rework likelihood, time-to-value ranges, cost uncertainty, and uplift variability. Inputs are treated as uncertain — not fixed."
          },
          {
            "title": "How Learning Occurs",
            "body": "As historical outcomes are incorporated, Brahan updates the probability of success, expected uplift, and sensitivity of value to uncertainty. Learning reveals which decisions are fragile versus robust."
          },
          {
            "title": "Before vs After Ranking",
            "body": "A deterministic or heuristic ranking is compared against an expected-value ranking with confidence shading. Several jobs move materially; a subset drops out entirely once rework risk dominates."
          },
          {
            "title": "What Changed",
            "body": "The outcome is not 'better jobs'. The outcome is better decisions: crew time focuses on robust interventions, low-learning repeats are avoided, and deferral becomes justifiable."
          }
        ]
      }
    },
    {
      "id": "w666-coiltubing",
      "order": 2,
      "title": "Coil Tubing Escalation: When \"Just One More Step\" Became a Commitment Trap",
      "subtitle": "Escalation amplified downside faster than it reduced uncertainty.",
      "hook": "Escalation felt like resolution.",
      "linksTo": ["w666-wellhead-integrity"],
      "narrative": [
        { "type": "h2", "text": "Why This Case Matters" },
        { "type": "p", "text": "By the time coil tubing was considered, slickline activity had created partial confidence without resolution. Coil tubing became the next logical step — and the second reinforcing loop where learning stalled." },
        { "type": "h2", "text": "Operational Context" },
        { "type": "p", "text": "Coil tubing was proposed to address unresolved restrictions and suspected downhole issues. The logic was sound, but readiness uncertainty and variance dominated outcomes." },
        { "type": "h2", "text": "The Decision Being Made" },
        { "type": "p", "text": "The apparent decision was whether to proceed. The real decision was whether the system had learned enough to justify escalation." },
        { "type": "h2", "text": "How This Contributed to W666" },
        { "type": "ul", "items": ["NPT exceeded expectations.", "Mechanical complexity introduced new failure modes.", "Readiness uncertainty dominated outcomes.", "Rework cascaded into further escalation."] },
        { "type": "h2", "text": "What the Learning Revealed" },
        { "type": "callout", "tone": "quote", "text": "Escalation reduced uncertainty slower than it increased consequence." },
        { "type": "h2", "text": "The Decision Shift" },
        { "type": "ul", "items": ["Readiness thresholds became explicit.", "Escalation paths were evaluated before commitment.", "Inaction regained legitimacy when downside dominated."] },
        { "type": "callout", "tone": "quote", "text": "The most dangerous moment in any campaign is when escalation feels inevitable." }
      ],
      "demo": {
        "title": "Brahan Engine Demonstration: Making Escalation a Choice",
        "duration": "10 minutes",
        "cta": { "label": "View 10-Minute Decision Walkthrough", "target": "modal" },
        "steps": [
          { "title": "Escalation Setup", "body": "Brahan presents the 'next step' (CT) alongside remaining uncertainty from earlier campaigns." },
          { "title": "Variance Over Averages", "body": "Historical NPT and recovery distributions are used instead of single-point estimates." },
          { "title": "Readiness Thresholds", "body": "Brahan shows how expected value collapses when readiness uncertainty remains high." },
          { "title": "Escalation Paths", "body": "Downstream commitment paths are surfaced before mobilisation." },
          { "title": "Decision Outcome", "body": "Escalation becomes deliberate: proceed, redesign, defer, or stop — each defensible." }
        ]
      }
    },
    {
      "id": "w666-wellhead-integrity",
      "order": 3,
      "title": "Wellhead Integrity: Risk That Grows While You're Busy",
      "subtitle": "Monitoring is not control when degradation is uncertain and time-dependent.",
      "hook": "Risk was monitored — not modelled.",
      "linksTo": ["w666-subsea"],
      "narrative": [
        { "type": "h2", "text": "Why This Case Matters" },
        { "type": "p", "text": "Wellhead integrity did not fail suddenly on W666. It accumulated quietly while operational activity created the illusion of control." },
        { "type": "h2", "text": "Operational Context" },
        { "type": "p", "text": "Inspections were conducted, anomalies logged, and monitoring plans updated. Integrity was present in the workflow — but not central to the decision system." },
        { "type": "h2", "text": "The Decision Being Made" },
        { "type": "p", "text": "The implicit decision was whether integrity risk was acceptable 'for now'. The missing question was how integrity uncertainty changed as action was deferred." },
        { "type": "h2", "text": "How This Contributed to W666" },
        { "type": "ul", "items": ["Operational activity increased mechanical exposure.", "Deferred integrity actions reduced future optionality.", "Monitoring created confidence without control."] },
        { "type": "h2", "text": "What the Learning Revealed" },
        { "type": "callout", "tone": "quote", "text": "Integrity uncertainty was growing while confidence remained static." },
        { "type": "h2", "text": "The Decision Shift" },
        { "type": "ul", "items": ["Deferral required justification.", "'Monitor' became a decision with quantified downside.", "Escalation paths were constrained by integrity thresholds."] },
        { "type": "callout", "tone": "quote", "text": "The cost of acting too early is visible. The cost of acting too late is systemic." }
      ],
      "demo": {
        "title": "Brahan Engine Demonstration: Turning Integrity Into a Decision Driver",
        "duration": "10 minutes",
        "cta": { "label": "View 10-Minute Decision Walkthrough", "target": "modal" },
        "steps": [
          { "title": "Integrity Inputs", "body": "Brahan ingests inspection uncertainty, coverage gaps, and degradation rate ranges." },
          { "title": "Time-Dependence", "body": "Risk trajectories widen over time; confidence does not remain static." },
          { "title": "Coupling With Ops", "body": "Operational activity is modelled as exposure, not background noise." },
          { "title": "Thresholds", "body": "Decision thresholds are made explicit — not implied." },
          { "title": "Defensible Actions", "body": "Monitor, intervene, constrain operations, or stop — each justified by the decision surface." }
        ]
      }
    },
    {
      "id": "w666-subsea",
      "order": 4,
      "title": "Subsea Intervention: When Rare Risks Are Treated as Optional",
      "subtitle": "Deferral turns rarity into inevitability when consequence dominates.",
      "hook": "Nothing had gone wrong — yet.",
      "linksTo": ["w666-shutin"],
      "narrative": [
        { "type": "h2", "text": "Why This Case Matters" },
        { "type": "p", "text": "Subsea was acknowledged and consistently deferred. Not because it was unimportant — but because cost was visible and failure was statistically unlikely in any given moment." },
        { "type": "h2", "text": "The Decision Being Made" },
        { "type": "p", "text": "The real decision was whether to accept the risk of deferring a low-probability, high-consequence event." },
        { "type": "h2", "text": "What the Learning Revealed" },
        { "type": "callout", "tone": "quote", "text": "Low-probability events were controlling the system's fate." },
        { "type": "h2", "text": "The Decision Shift" },
        { "type": "ul", "items": ["Deferral required quantified justification.", "Inspection timing became strategic.", "Production gains were weighed against systemic exposure."] },
        { "type": "callout", "tone": "quote", "text": "The most expensive failures are the ones we keep postponing." }
      ],
      "demo": {
        "title": "Brahan Engine Demonstration: Coupling Probability With Consequence",
        "duration": "10 minutes",
        "cta": { "label": "View 10-Minute Decision Walkthrough", "target": "modal" },
        "steps": [
          { "title": "Rare-Risk Setup", "body": "Subsea risks are introduced with sparse inspection coverage and consequence severity." },
          { "title": "Consequence Coupling", "body": "Brahan shows expected downside where consequence dominates probability." },
          { "title": "Deferral Cost", "body": "Exposure grows with time; 'waiting' becomes an active choice." },
          { "title": "Inspection As A Decision", "body": "Inspection frequency is evaluated as a decision variable." },
          { "title": "Outcome", "body": "Subsea moves from optional to foundational when systemic survival overtakes short-term optimisation." }
        ]
      }
    },
    {
      "id": "w666-shutin",
      "order": 5,
      "title": "Integrity-Led Shut-In: The Decision No One Wants to Own",
      "subtitle": "Without thresholds, delay becomes the default.",
      "hook": "Not shutting in became a decision — just not an explicit one.",
      "linksTo": ["w666-alignment"],
      "narrative": [
        { "type": "h2", "text": "Why This Case Matters" },
        { "type": "p", "text": "Shut-in decisions are rarely technical. They are emotional, political, and irreversible. W666 reached a point where the key issue was not whether to shut in, but on what basis." },
        { "type": "h2", "text": "What the Learning Revealed" },
        { "type": "callout", "tone": "quote", "text": "The cost of indecision exceeded the cost of action." },
        { "type": "h2", "text": "The Decision Shift" },
        { "type": "ul", "items": ["Shut-in became defensible rather than political.", "Decision timing was justified, not apologised for.", "Responsibility moved from individuals to thresholds."] },
        { "type": "callout", "tone": "quote", "text": "A late decision feels safer than an early one — until it isn't." }
      ],
      "demo": {
        "title": "Brahan Engine Demonstration: Defining the Shut-In Threshold",
        "duration": "10 minutes",
        "cta": { "label": "View 10-Minute Decision Walkthrough", "target": "modal" },
        "steps": [
          { "title": "Threshold Setup", "body": "Brahan couples integrity uncertainty, subsea consequence, and production value at risk." },
          { "title": "Delay vs Downside", "body": "Exposure growth is compared to upside; delay often increases downside faster than value." },
          { "title": "Shared Risk Tolerance", "body": "Risk tolerance is made explicit across teams." },
          { "title": "Defensible Timing", "body": "Brahan identifies when continued production becomes indefensible under uncertainty." },
          { "title": "Outcome", "body": "Shut-in becomes a control action with clear rationale, not an emotional endpoint." }
        ]
      }
    },
    {
      "id": "w666-alignment",
      "order": 6,
      "title": "Cross-Team Misalignment: When Everyone Is Right and the System Is Wrong",
      "subtitle": "Alignment emerges from shared logic, not consensus meetings.",
      "hook": "The organisation had data — but no memory.",
      "linksTo": ["w666-regulator"],
      "narrative": [
        { "type": "h2", "text": "Why This Case Matters" },
        { "type": "p", "text": "Every team acted competently and optimised locally. The system failed collectively because there was no shared decision logic end-to-end." },
        { "type": "h2", "text": "The Well-Tegra Intervention" },
        { "type": "p", "text": "Brahan established a single decision surface where risks were expressed probabilistically, consequences compared consistently, trade-offs made explicit, and thresholds shared." },
        { "type": "h2", "text": "What the Learning Revealed" },
        { "type": "callout", "tone": "quote", "text": "Alignment emerged from shared logic, not consensus meetings." },
        { "type": "callout", "tone": "quote", "text": "You cannot align decisions after the fact. You must align the system that produces them." }
      ],
      "demo": {
        "title": "Brahan Engine Demonstration: A Single Decision Surface",
        "duration": "10 minutes",
        "cta": { "label": "View 10-Minute Decision Walkthrough", "target": "modal" },
        "steps": [
          { "title": "Silo Inputs", "body": "Each function's view is shown: uptime, job success, compliance, downside risk, cost and schedule." },
          { "title": "Translate To One Language", "body": "Brahan expresses risks probabilistically and consequences consistently." },
          { "title": "Expose Trade-offs", "body": "Disagreements become trade-offs rather than arguments." },
          { "title": "Shared Thresholds", "body": "Thresholds replace implicit judgement." },
          { "title": "Outcome", "body": "The system behaves coherently even when teams prioritise different goals." }
        ]
      }
    },
    {
      "id": "w666-regulator",
      "order": 7,
      "title": "Regulator-Facing Decisions: When Explanation Becomes the Asset",
      "subtitle": "Auditability must exist before the decision, not after.",
      "hook": "The organisation remembered outcomes, not reasoning.",
      "linksTo": [],
      "narrative": [
        { "type": "h2", "text": "Why This Case Matters" },
        { "type": "p", "text": "When scrutiny increased, decision history came under review. The challenge was not explaining outcomes, but demonstrating decisions were reasonable at the time." },
        { "type": "h2", "text": "The Well-Tegra Intervention" },
        { "type": "p", "text": "Brahan provided persistent decision memory: what was known at each decision point, what uncertainty existed, which options were considered, why thresholds were crossed, and how learning evolved." },
        { "type": "h2", "text": "What the Learning Revealed" },
        { "type": "callout", "tone": "quote", "text": "The organisation stopped defending outcomes and started demonstrating process." },
        { "type": "callout", "tone": "quote", "text": "If you cannot explain a decision clearly, you do not control it." }
      ],
      "demo": {
        "title": "Brahan Engine Demonstration: Decision Memory and Audit Readiness",
        "duration": "10 minutes",
        "cta": { "label": "View 10-Minute Decision Walkthrough", "target": "modal" },
        "steps": [
          { "title": "Reconstruct vs Record", "body": "Brahan contrasts retrospective reconstruction with recorded decision points." },
          { "title": "What Was Known", "body": "Each decision point stores inputs, uncertainties, and assumptions." },
          { "title": "Options Considered", "body": "Alternatives are captured, not forgotten." },
          { "title": "Threshold Crossings", "body": "Why the system moved from defer to act is explicit." },
          { "title": "Outcome", "body": "Regulatory confidence improves because process is demonstrable and consistent." }
        ]
      }
    }
  ]
};

// Block Renderer Component
const BlockRenderer = ({ block }) => {
  switch (block.type) {
    case 'h2':
      return (
        <h2 className="text-3xl font-bold mt-8 mb-4 text-slate-900">
          {block.text}
        </h2>
      );

    case 'p':
      return (
        <p className="mb-4 text-slate-700 leading-relaxed text-lg">
          {block.text}
        </p>
      );

    case 'ul':
      return (
        <ul className="list-disc list-inside mb-6 space-y-3 text-slate-700 text-lg">
          {block.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );

    case 'ol':
      return (
        <ol className="list-decimal list-inside mb-6 space-y-3 text-slate-700 text-lg">
          {block.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ol>
      );

    case 'callout':
      const toneClasses = {
        quote: 'border-l-4 border-indigo-500 bg-indigo-50 text-indigo-900',
        warning: 'border-l-4 border-orange-500 bg-orange-50 text-orange-900',
        info: 'border-l-4 border-teal-500 bg-teal-50 text-teal-900'
      };
      return (
        <blockquote className={`p-6 my-8 rounded-r-lg ${toneClasses[block.tone] || toneClasses.quote}`}>
          <p className="text-xl font-medium italic">{block.text}</p>
        </blockquote>
      );

    default:
      return null;
  }
};

// Case Study Card Component
const CaseStudyCard = ({ caseStudy, onClick }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-slate-200"
      onClick={() => onClick(caseStudy.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-4 py-2 rounded-full">
          Case {caseStudy.order}
        </span>
        <span className="text-sm text-slate-500 font-medium">{caseStudy.demo.duration}</span>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">{caseStudy.title}</h3>
      <p className="text-slate-600 mb-5 text-base">{caseStudy.subtitle}</p>
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg mb-5">
        <p className="text-lg font-semibold text-indigo-700">{caseStudy.hook}</p>
      </div>
      <button
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          onClick(caseStudy.id);
        }}
      >
        {caseStudy.demo.cta.label}
      </button>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{title}</h2>
              {subtitle && <p className="text-indigo-100">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-indigo-200 text-3xl font-bold leading-none ml-4"
            >
              ×
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

// Demo Steps Component
const DemoSteps = ({ demo }) => {
  return (
    <div className="space-y-8">
      {demo.steps.map((step, idx) => (
        <div key={idx} className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
            {idx + 1}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-xl mb-3 text-slate-900">{step.title}</h4>
            <p className="text-slate-700 text-lg leading-relaxed">{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main App Component
export default function WellTegraW666() {
  const [view, setView] = useState('series');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const { series, caseStudies } = data;

  const handleCaseStudyClick = (caseStudyId) => {
    const caseStudy = caseStudies.find(cs => cs.id === caseStudyId);
    if (caseStudy) {
      setSelectedCaseStudy(caseStudy);
      setView('caseStudy');
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDemoClick = (demo, caseStudy) => {
    setModalContent({
      title: demo.title,
      subtitle: caseStudy.title,
      content: <DemoSteps demo={demo} />
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  // Series View
  if (view === 'series') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <header className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-bold mb-6">
                Case Study Analysis
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {series.title}
              </h1>
              <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto opacity-95 leading-relaxed">
                {series.subtitle}
              </p>
              <button
                onClick={() => handleCaseStudyClick(series.heroCta.targetCaseStudyId)}
                className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all duration-200 shadow-2xl transform hover:scale-105"
              >
                {series.heroCta.label}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="prose prose-lg prose-slate max-w-none">
            {series.sections.map((block, idx) => (
              <BlockRenderer key={idx} block={block} />
            ))}
          </div>

          {/* Case Studies Grid */}
          <section className="mt-20">
            <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">
              The Seven Contributing Case Studies
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {caseStudies.map((caseStudy) => (
                <CaseStudyCard
                  key={caseStudy.id}
                  caseStudy={caseStudy}
                  onClick={handleCaseStudyClick}
                />
              ))}
            </div>
          </section>
        </main>

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          title={modalContent?.title}
          subtitle={modalContent?.subtitle}
        >
          {modalContent?.content}
        </Modal>
      </div>
    );
  }

  // Case Study View
  if (view === 'caseStudy' && selectedCaseStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setView('series')}
                className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Series Overview
              </button>
              <span className="text-slate-300">|</span>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                Case {selectedCaseStudy.order}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {selectedCaseStudy.title}
            </h1>
            <p className="text-xl text-slate-600 mt-3">{selectedCaseStudy.subtitle}</p>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 mb-12 text-white shadow-2xl">
            <p className="text-3xl font-bold leading-relaxed">{selectedCaseStudy.hook}</p>
          </div>

          {/* Narrative Blocks */}
          <div className="prose prose-xl prose-slate max-w-none mb-12">
            {selectedCaseStudy.narrative.map((block, idx) => (
              <BlockRenderer key={idx} block={block} />
            ))}
          </div>

          {/* Demo Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-10 mb-12 border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">{selectedCaseStudy.demo.title}</h3>
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg text-slate-700">Duration: {selectedCaseStudy.demo.duration}</span>
              </div>
            </div>
            <button
              onClick={() => handleDemoClick(selectedCaseStudy.demo, selectedCaseStudy)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg transform hover:scale-105"
            >
              {selectedCaseStudy.demo.cta.label}
            </button>
          </div>

          {/* Related Cases */}
          {selectedCaseStudy.linksTo && selectedCaseStudy.linksTo.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Related Cases</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {selectedCaseStudy.linksTo.map(linkId => {
                  const linkedCase = caseStudies.find(cs => cs.id === linkId);
                  if (!linkedCase) return null;
                  return (
                    <button
                      key={linkId}
                      onClick={() => handleCaseStudyClick(linkId)}
                      className="text-left bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200 hover:border-indigo-300 group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                          Case {linkedCase.order}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {linkedCase.title}
                      </h4>
                      <p className="text-slate-600">{linkedCase.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          title={modalContent?.title}
          subtitle={modalContent?.subtitle}
        >
          {modalContent?.content}
        </Modal>
      </div>
    );
  }

  return null;
}