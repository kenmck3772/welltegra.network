import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Activity } from 'lucide-react';

const VoiceCommandInterface = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('SYSTEM_READY // PRESS PTT');

  // Browser Compatibility Check
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (!recognition) {
      setFeedback('ERR: BROWSER_INCOMPATIBLE');
      return;
    }

    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setFeedback('LISTENING... [SPEAK NOW]');
    };

    recognition.onend = () => {
      setIsListening(false);
      // Reset text after delay
      setTimeout(() => setFeedback('SYSTEM_READY // PRESS PTT'), 3000);
    };

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript.toLowerCase();
      setTranscript(`"${text}"`);
      processCommand(text);
    };

    recognition.onerror = (event) => {
      setFeedback(`ERR: ${event.error.toUpperCase()}`);
      setIsListening(false);
    };

    // Cleanup
    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - recognition setup happens once

  const toggleListen = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      if (recognition) {
        recognition.start();
        setIsListening(true);
      }
    }
  };

  // The "Brain" of the voice interface
  const processCommand = (text) => {
    // Map spoken phrases to App actions
    if (text.includes('open planner') || text.includes('plan') || text.includes('planner')) {
      onCommand('NAVIGATE_PLANNER');
      setFeedback('CMD: NAVIGATING_TO_PLANNER');
    }
    else if (text.includes('show dashboard') || text.includes('executive') || text.includes('dashboard')) {
      onCommand('NAVIGATE_EXECUTIVE');
      setFeedback('CMD: NAVIGATING_TO_DASHBOARD');
    }
    else if (text.includes('scheduler') || text.includes('schedule')) {
      onCommand('NAVIGATE_SCHEDULER');
      setFeedback('CMD: NAVIGATING_TO_SCHEDULER');
    }
    else if (text.includes('execution') || text.includes('execute')) {
      onCommand('NAVIGATE_EXECUTION');
      setFeedback('CMD: NAVIGATING_TO_EXECUTION');
    }
    else if (text.includes('training') || text.includes('competency')) {
      onCommand('NAVIGATE_COMPETENCY');
      setFeedback('CMD: NAVIGATING_TO_TRAINING');
    }
    else if (text.includes('physics mode on') || text.includes('enable physics')) {
      onCommand('PHYSICS_MODE_ON');
      setFeedback('CMD: PHYSICS_MODE_ENABLED');
    }
    else if (text.includes('physics mode off') || text.includes('disable physics')) {
      onCommand('PHYSICS_MODE_OFF');
      setFeedback('CMD: PHYSICS_MODE_DISABLED');
    }
    else if (text.includes('status') || text.includes('report')) {
      onCommand('SHOW_STATUS');
      setFeedback('CMD: GENERATING_STATUS_REPORT');
    }
    else if (text.includes('emergency') || text.includes('stop') || text.includes('abort')) {
      onCommand('EMERGENCY_STOP');
      setFeedback('⚠ ALARM: EMERGENCY_STOP_TRIGGERED');
    }
    else {
      setFeedback('ERR: UNKNOWN_COMMAND');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-mono">

      {/* Transcript Log (Only shows when active) */}
      {(isListening || transcript) && (
        <div className="bg-slate-900/90 border-l-4 border-cyan-500 p-3 rounded-l-lg backdrop-blur-md shadow-2xl mb-2 min-w-[200px] animate-in slide-in-from-right">
          <div className="flex items-center justify-between text-[9px] text-cyan-400 mb-1 tracking-widest uppercase">
            <span>Voice Log</span>
            <Activity size={10} className={isListening ? "animate-pulse" : ""} />
          </div>
          <div className="text-white text-xs font-bold uppercase">{transcript || "..."}</div>
          <div className={`text-[9px] mt-1 font-bold ${feedback.includes('ERR') ? 'text-red-400' : feedback.includes('CMD') ? 'text-green-400' : 'text-slate-500'}`}>
            {feedback}
          </div>
        </div>
      )}

      {/* Push-to-Talk Button */}
      <button
        onClick={toggleListen}
        className={`relative group flex items-center gap-3 px-5 py-4 rounded-full border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300
          ${isListening
            ? 'bg-red-600 border-red-500 text-white animate-pulse'
            : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-cyan-400 hover:text-cyan-400'
          }`
        }
      >
        {isListening ? <Mic size={24} /> : <MicOff size={24} />}

        {/* Tooltip */}
        <span className="absolute right-full mr-4 bg-slate-800 text-xs px-2 py-1 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {isListening ? 'Stop Listening' : 'Push to Talk (PTT)'}
        </span>
      </button>

      {/* Valid Commands Hint */}
      <div className="text-[9px] text-slate-600 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
        Try: "Open Planner", "Show Dashboard", "Physics Mode On", "Emergency Stop"
      </div>
    </div>
  );
};

export default VoiceCommandInterface;
