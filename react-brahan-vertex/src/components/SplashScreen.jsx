import React, { useState } from 'react';
import { Zap } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);

  const handleStart = () => {
    setIsFading(true);
    setTimeout(onComplete, 1000);
  };

  return (
    <div
      onClick={handleStart}
      className={`fixed inset-0 z-[999] bg-[#000000] flex flex-col items-center justify-center cursor-pointer transition-opacity duration-1000 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center group">
        <div className="w-64 h-64 border border-blue-900/40 rounded-full flex items-center justify-center relative mb-10 overflow-hidden bg-black shadow-[0_0_50px_rgba(0,100,255,0.1)]">
          <div
            className="absolute inset-0 opacity-20 animate-[spin_20s_linear_infinite]"
            style={{
              backgroundImage: 'radial-gradient(circle, #1e3a8a 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-cyan-900 to-blue-900 opacity-50 blur-xl animate-pulse absolute" />
          <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-4 border-b-2 border-yellow-500/80 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
          <div className="relative z-10 flex flex-col items-center">
            <Zap className="text-cyan-400 fill-cyan-400/20" size={48} />
          </div>
        </div>

        <h1 className="text-5xl text-white tracking-[0.15em] font-bold mb-3 font-display">
          WELL-TEGRA
        </h1>
        <h2 className="text-2xl text-yellow-500 tracking-[0.3em] font-bold mb-8 uppercase font-mono">
          The Brahan Vertex Engine
        </h2>

        <div className="px-12 py-4 bg-blue-900/20 border border-cyan-500/40 text-cyan-400 font-bold uppercase text-[10px] tracking-[0.2em]">
          Initiate Sequence
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
