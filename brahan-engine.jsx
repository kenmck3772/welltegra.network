import React, { useState, useEffect } from 'react';

const BrahanEngine = () => {
  const [view, setView] = useState('w666');
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [showHelper, setShowHelper] = useState(true);
  const [caseStudies, setCaseStudies] = useState(null);

  // Placeholder JSON structure - replace with actual JSON content
  const content = {
    w666: {
      title: "W-666: A Case Study in Sequential Failure",
      blocks: [
        {
          type: "h2",
          content: "The Anatomy of a Cascading Intervention"
        },
        {
          type: "p",
          content: "This analysis attempts to reconstruct, from memory and incomplete records, the sequence of decisions and events that led to the progressive loss of an intervention string. It is not an accusation or a post-mortem seeking blame. Rather, it is an attempt to understand how individual decisions—each reasonable in isolation—combined to create an outcome that was, in retrospect, both predictable and preventable."
        },
        {
          type: "p",
          content: "The well in question, W-666, was a North Sea platform well undergoing a complex plug and abandonment campaign. The intervention string consisted of multiple run-in-hole tools, each with specific functions and interdependencies. The failure occurred not because of a single catastrophic event, but through a series of small, incremental compromises to the decision framework."
        }
      ],
      demo: {
        title: "Decision Path Reconstruction",
        steps: [
          "Initial condition: Well integrity questionable but stable",
          "Decision 1: Proceed with standard mill-run sequence despite early indicators",
          "Decision 2: Modify milling parameters based on surface torque readings",
          "Decision 3: Continue run despite unexpected debris volumes",
          "Decision 4: Attempt recovery without proper analysis of root cause",
          "Outcome: Complete loss of string, well control event, significant cost escalation"
        ]
      },
      linkedCases: ["case-001", "case-002", "case-003", "case-004", "case-005", "case-006", "case-007"]
    },
    cases: {
      "case-001": {
        title: "Case 001: The Hidden Constraint",
        blocks: [
          { type: "p", content: "Case content placeholder..." }
        ],
        demo: { title: "Demo Title", steps: ["Step 1", "Step 2"] },
        next: "case-002"
      },
      // ... other cases would be defined here
    }
  };

  const currentContent = view === 'w666' ? content.w666 : content.cases[view];

  const renderBlock = (block, index) => {
    switch (block.type) {
      case 'h2':
        return (
          <h2 key={index} className="text-3xl font-serif text-emerald-800 mb-6">
            {block.content}
          </h2>
        );
      case 'p':
        return (
          <p key={index} className="text-stone-200 leading-relaxed mb-4">
            {block.content}
          </p>
        );
      case 'ul':
        return (
          <ul key={index} className="list-disc list-inside text-stone-200 mb-4 space-y-2">
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      case 'ol':
        return (
          <ol key={index} className="list-decimal list-inside text-stone-200 mb-4 space-y-2">
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
      case 'callout':
        return (
          <div key={index} className="border-l-4 border-yellow-600/30 bg-orange-500/5 p-6 my-6 rounded-r">
            <p className="text-orange-500/70 italic">{block.content}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const DemoModal = ({ demo, onClose }) => (
    <div className="fixed inset-0 bg-stone-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-stone-950 border border-yellow-600/30 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-serif text-emerald-800">{demo.title}</h3>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-200 transition-colors"
            >
              ×
            </button>
          </div>
          <div className="space-y-4">
            {demo.steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-3 rounded hover:bg-stone-900/50 transition-colors cursor-pointer"
                onClick={() => setDemoStep(index)}
              >
                <span className="flex-shrink-0 w-8 h-8 bg-orange-500/10 text-orange-500/70 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <p className="text-stone-200 flex-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNavigation = () => {
    if (view === 'w666') {
      return (
        <nav className="flex flex-wrap gap-2 mb-8">
          {content.w666.linkedCases.map((caseId) => (
            <button
              key={caseId}
              onClick={() => setView(caseId)}
              className="px-4 py-2 bg-stone-900 border border-yellow-600/30 rounded text-stone-200 hover:bg-orange-500/10 hover:text-orange-500/70 transition-all"
            >
              {content.cases[caseId]?.title || caseId}
            </button>
          ))}
        </nav>
      );
    }

    const currentCase = content.cases[view];
    return (
      <nav className="flex justify-between items-center mb-8">
        <button
          onClick={() => setView('w666')}
          className="px-4 py-2 bg-stone-900 border border-yellow-600/30 rounded text-stone-200 hover:bg-orange-500/10 hover:text-orange-500/70 transition-all"
        >
          ← Back to Series
        </button>
        {currentCase?.next && (
          <button
            onClick={() => setView(currentCase.next)}
            className="px-4 py-2 bg-stone-900 border border-yellow-600/30 rounded text-stone-200 hover:bg-orange-500/10 hover:text-orange-500/70 transition-all"
          >
            Next →
          </button>
        )}
      </nav>
    );
  };

  const WhyBrahanSection = () => (
    <div className="mt-12 pt-8 border-t border-yellow-600/30">
      <h4 className="text-lg font-serif text-emerald-800 mb-3">Why Brahan?</h4>
      <p className="text-stone-300 text-sm leading-relaxed max-w-3xl">
        The name draws from the Highland folklore that "a black rain will bring riches to Aberdeen"
        – a meteorological prediction about oil discoveries. Here it serves as metaphor: uncertainty
        contains opportunity. This framework is an attempt to make that relationship explicit,
        acknowledging that our richest insights often emerge from the moments when we most
        clearly perceive what we do not know.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-emerald-800 mb-4">
            The Brahan Engine
          </h1>
          <p className="text-xl text-stone-400">
            A decision-learning framework for well intervention under uncertainty
          </p>
          <p className="text-sm text-stone-500 mt-2">
            Built by a practicing engineer from first principles
          </p>
        </header>

        {/* Helper Panel */}
        {showHelper && (
          <div className="mb-8 p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-orange-500/70 text-sm">• Follow the decision, not the activity</p>
                <p className="text-orange-500/70 text-sm">• Notice where uncertainty dominates</p>
              </div>
              <button
                onClick={() => setShowHelper(false)}
                className="text-stone-500 hover:text-stone-300 text-sm"
              >
                dismiss
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {renderNavigation()}

        {/* Current View Content */}
        <div className="space-y-8">
          <h2 className="text-3xl font-serif text-emerald-800">
            {currentContent?.title}
          </h2>

          {currentContent?.blocks?.map((block, index) => renderBlock(block, index))}

          {/* Demo Button */}
          {currentContent?.demo && (
            <div className="mt-8">
              <button
                onClick={() => setShowDemo(true)}
                className="px-6 py-3 bg-orange-500/10 border border-orange-500/30 rounded text-orange-500/70 hover:bg-orange-500/20 transition-all"
              >
                View Decision Analysis Demo
              </button>
            </div>
          )}

          {/* Why Brahan Section on W666 */}
          {view === 'w666' && <WhyBrahanSection />}
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-stone-800 text-center text-stone-500 text-sm">
          <p>
            This is a framework, not a finished product. An attempt to make decision-making explicit.
          </p>
        </footer>
      </main>

      {/* Demo Modal */}
      {showDemo && currentContent?.demo && (
        <DemoModal
          demo={currentContent.demo}
          onClose={() => {
            setShowDemo(false);
            setDemoStep(0);
          }}
        />
      )}
    </div>
  );
};

export default BrahanEngine;