import React from 'react';
import HermesModel from './components/HermesModel';
import Galaxy from './components/Galaxy';

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans">
      {/* Galaxy Background Layer (Bottom) */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Galaxy
          mouseRepulsion
          mouseInteraction
          density={1.3}
          glowIntensity={0.2}
          saturation={0}
          hueShift={140}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          repulsionStrength={0.5}
          autoCenterRepulsion={0}
          starSpeed={0.5}
          speed={1}
        />
      </div>

      {/* 3D Model Layer (Middle) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <HermesModel />
      </div>

      {/* Tailwind UI Layer (Top) */}
      <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-between text-white p-12">
        <nav className="w-full max-w-7xl flex justify-between items-center opacity-0 animate-fade-in pointer-events-auto">
          <div className="text-2xl font-black tracking-widest uppercase">Hermes AI</div>
          <div className="flex gap-6 text-sm font-semibold tracking-wider">
            <button className="hover:text-amber-300 transition-colors uppercase">Features</button>
            <button className="hover:text-amber-300 transition-colors uppercase">About</button>
            <button className="hover:text-amber-300 transition-colors uppercase">Contact</button>
          </div>
        </nav>

        <main className="text-center mt-[-10vh]">

        </main>
      </div>
    </div>
  );
}

export default App;
