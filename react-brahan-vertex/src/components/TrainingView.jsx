import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Brain, PlayCircle } from 'lucide-react';

const TrainingView = ({ showBanner = false, assignmentReason = null }) => {
  const [currentModule, setCurrentModule] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [videoCompleted, setVideoCompleted] = useState({});
  const [currentVideoModule, setCurrentVideoModule] = useState(0);

  // YouTube video modules
  const videoModules = [
    {
      id: 1,
      title: 'Micro-Annulus Diagnostics',
      videoId: '7eWPe5Y8ve4',
      description: 'Learn to identify micro-annulus conditions and their impact on well integrity.'
    },
    {
      id: 2,
      title: 'P&A Barrier Verification',
      videoId: 'tbVD-J995yM',
      description: 'Master barrier verification techniques for plug and abandonment operations.'
    }
  ];

  const modules = [
    {
      id: 1,
      title: 'Physics-Informed Safety Constraint',
      question: 'Node-02 shows 12% integrity in ML model but physics constraints flag a critical violation. What is the correct action?',
      options: [
        { id: 'a', text: 'Trust the ML model (12% is acceptable)', correct: false },
        { id: 'b', text: 'Override to physics mode - treat as Critical (0%)', correct: true },
        { id: 'c', text: 'Average the two scores (6%)', correct: false },
        { id: 'd', text: 'Ignore both and proceed', correct: false }
      ],
      explanation: 'Physics constraints catch risks that pure ML might miss. When physics flags a violation, it must override ML predictions.'
    },
    {
      id: 2,
      title: 'Rapid Bleed Down Detection',
      question: 'During execution, annulus pressure drops 200 psi in 3 minutes. What does this indicate?',
      options: [
        { id: 'a', text: 'Normal thermal cooling', correct: false },
        { id: 'b', text: 'Barrier integrity failure - STOP operations', correct: true },
        { id: 'c', text: 'Equipment malfunction - continue monitoring', correct: false },
        { id: 'd', text: 'Expected behavior - no action needed', correct: false }
      ],
      explanation: 'Rapid pressure drops indicate barrier failure. Operations must cease immediately and competency training is triggered.'
    },
    {
      id: 3,
      title: 'Closed-Loop Learning',
      question: 'Why does the system redirect you to training after detecting a safety anomaly?',
      options: [
        { id: 'a', text: 'As punishment for making mistakes', correct: false },
        { id: 'b', text: 'To demonstrate closed-loop competency development', correct: true },
        { id: 'c', text: 'Random training assignment', correct: false },
        { id: 'd', text: 'System error', correct: false }
      ],
      explanation: 'The Brahan Vertex Engine demonstrates closed-loop learning: Detect anomaly → Trigger training → Verify understanding → Resume operations.'
    }
  ];

  const handleAnswer = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const calculateScore = () => {
    let correct = 0;
    modules.forEach(module => {
      const selectedOption = module.options.find(opt => opt.id === answers[module.id]);
      if (selectedOption?.correct) correct++;
    });
    setScore(Math.round((correct / modules.length) * 100));
  };

  const resetTraining = () => {
    setCurrentModule(0);
    setAnswers({});
    setScore(null);
    setVideoCompleted({});
    setCurrentVideoModule(0);
  };

  const handleVideoComplete = (videoId) => {
    setVideoCompleted({
      ...videoCompleted,
      [videoId]: true
    });
  };

  // Simulate video completion after 10 seconds (for dev/demo purposes)
  const simulateVideoWatch = (videoId) => {
    setTimeout(() => {
      handleVideoComplete(videoId);
    }, 10000); // 10 seconds
  };

  const allVideosCompleted = videoModules.every(vid => videoCompleted[vid.id]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Assignment Banner */}
      {showBanner && assignmentReason && (
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-950/30 border-2 border-red-500 rounded-lg animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="text-red-400 font-bold text-lg">System Trigger: Remedial Training Assigned</h3>
              <p className="text-red-300 text-sm mt-1">{assignmentReason}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10" />
            Competency Training Module
          </h1>
          <p className="text-slate-400">
            Interactive learning triggered by safety anomalies - Closed-Loop Competency Development
          </p>
        </div>

        {/* Video Training Modules */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Step 1: Video Training</h2>
          <div className="grid gap-6">
            {videoModules.map((video) => (
              <div key={video.id} className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{video.title}</h3>
                  <p className="text-slate-400 text-sm">{video.description}</p>
                </div>

                {/* YouTube Embed */}
                <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden mb-4">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.videoId}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => simulateVideoWatch(video.id)}
                  ></iframe>
                </div>

                {/* Verify Competency Button */}
                <button
                  onClick={() => handleVideoComplete(video.id)}
                  disabled={!videoCompleted[video.id]}
                  className={`w-full px-6 py-3 rounded-lg font-bold transition-all ${
                    videoCompleted[video.id]
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {videoCompleted[video.id] ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Competency Verified
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <PlayCircle className="w-5 h-5" />
                      Watch video to verify (simulated: 10s timer)
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Proceed to Quiz Gate */}
          {!allVideosCompleted && (
            <div className="mt-6 p-4 bg-yellow-950/30 border border-yellow-500 rounded-lg">
              <p className="text-yellow-400 text-center">
                ⏳ Complete all video modules before proceeding to the quiz
              </p>
            </div>
          )}
        </div>

        {score === null && allVideosCompleted ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">Step 2: Knowledge Assessment</h2>

            {/* Progress Bar */}
            <div className="mb-6 bg-slate-900 rounded-lg p-4">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Progress</span>
                <span>{Object.keys(answers).length} / {modules.length} answered</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${(Object.keys(answers).length / modules.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{module.title}</h3>
                      <p className="text-slate-300">{module.question}</p>
                    </div>
                  </div>

                  <div className="space-y-2 ml-11">
                    {module.options.map(option => (
                      <label
                        key={option.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                          answers[module.id] === option.id
                            ? 'bg-blue-500/20 border-blue-500'
                            : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${module.id}`}
                          value={option.id}
                          checked={answers[module.id] === option.id}
                          onChange={() => handleAnswer(module.id, option.id)}
                          className="w-4 h-4 accent-blue-500"
                        />
                        <span className="text-slate-200">{option.text}</span>
                      </label>
                    ))}
                  </div>

                  {answers[module.id] && (
                    <div className="mt-4 ml-11 p-3 bg-slate-800 border border-slate-700 rounded-lg">
                      <p className="text-sm text-slate-400 italic">
                        💡 <strong>Key Concept:</strong> {module.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={calculateScore}
                disabled={Object.keys(answers).length < modules.length}
                className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
                  Object.keys(answers).length < modules.length
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/50'
                }`}
              >
                Submit Training Assessment
              </button>
            </div>
          </>
        ) : score === null ? (
          /* Waiting for videos to complete */
          null
        ) : (
          /* Results Screen */
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
            {score >= 80 ? (
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
            )}

            <h2 className="text-3xl font-bold text-white mb-2">
              {score >= 80 ? 'Training Complete!' : 'Additional Study Required'}
            </h2>

            <div className="text-6xl font-bold text-blue-400 my-6">
              {score}%
            </div>

            <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
              {score >= 80
                ? 'You have successfully demonstrated understanding of physics-informed safety constraints and closed-loop competency development. You may resume operations.'
                : 'Please review the key concepts and retake the training module.'}
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetTraining}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition"
              >
                Retake Training
              </button>
              {score >= 80 && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
                >
                  Return to Dashboard
                </button>
              )}
            </div>

            {/* Score Breakdown */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">Answer Review</h3>
              <div className="space-y-3 text-left max-w-2xl mx-auto">
                {modules.map((module, index) => {
                  const selectedOption = module.options.find(opt => opt.id === answers[module.id]);
                  const isCorrect = selectedOption?.correct;

                  return (
                    <div key={module.id} className="flex items-start gap-3 p-3 bg-slate-800 rounded">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">Question {index + 1}</p>
                        <p className="text-sm text-slate-400">{selectedOption?.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingView;
