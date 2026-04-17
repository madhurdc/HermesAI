import React, { useState, useEffect } from 'react';

export function CoreSpinLoader() {
  const [loadingText, setLoadingText] = useState('Know your path.');

  useEffect(() => {
    const states = ['Know your path.', 'Know your purpose.'];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % states.length;
      setLoadingText(states[i]);
    }, 1250);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-8">
      <div className="relative w-20 h-20 flex items-center justify-center">

        {/* Base Glow */}
        <div className="absolute inset-0 rounded-full blur-xl animate-pulse bg-white/10" />

        {/* Outer Dashed Ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-white/20"
          style={{ animation: 'spin 10s linear infinite' }} />

        {/* Main Arc */}
        <div
          className="absolute inset-1 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: 'rgba(255,255,255,0.8)',
            boxShadow: '0 0 8px rgba(255,255,255,0.4)',
            animation: 'spin 2s linear infinite',
          }}
        />

        {/* Reverse Arc */}
        <div
          className="absolute inset-3 rounded-full border-2 border-transparent"
          style={{
            borderBottomColor: 'rgba(200,190,170,0.7)',
            boxShadow: '0 0 6px rgba(200,190,170,0.3)',
            animation: 'spin 3s linear infinite reverse',
          }}
        />

        {/* Inner Fast Ring */}
        <div
          className="absolute inset-5 rounded-full border border-transparent"
          style={{
            borderLeftColor: 'rgba(255,255,255,0.5)',
            animation: 'spin 1s ease-in-out infinite',
          }}
        />

        {/* Orbital Dot */}
        <div className="absolute inset-0" style={{ animation: 'spin 4s linear infinite' }}>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"
            style={{ boxShadow: '0 0 6px rgba(255,255,255,0.9)' }}
          />
        </div>

        {/* Center Core */}
        <div
          className="absolute w-2 h-2 rounded-full animate-pulse bg-white"
          style={{ boxShadow: '0 0 10px rgba(255,255,255,0.8)' }}
        />
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-1 h-8 justify-center overflow-hidden">
        <span
          key={loadingText}
          className="text-sm md:text-base font-semibold tracking-[0.2em] uppercase text-white/80"
          style={{
            animation: 'fadeSlideIn 0.5s ease forwards',
          }}
        >
          {loadingText}
        </span>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
