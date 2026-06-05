
import React from 'react';

const Spinner = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <svg
          className="animate-spin h-14 w-14 text-amber-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-10"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          ></circle>
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-amber-500 font-bold tracking-widest uppercase text-xs animate-pulse">Consulting The Hub</p>
        <p className="text-slate-500 text-[10px] mt-1 italic">Synthesizing predictive integrity data...</p>
      </div>
    </div>
  );
};

export default Spinner;
