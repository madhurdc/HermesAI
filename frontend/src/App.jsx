import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Galaxy from './components/Galaxy';
import Home from './pages/Home';
import ResumeReview from './pages/ResumeReview';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black font-sans text-white">
      {/* Shared Galaxy Background Layer (Bottom) */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Galaxy
          mouseRepulsion
          mouseInteraction
          density={1.3}
          glowIntensity={0.2}
          saturation={0}
          hueShift={140}
          twinkleIntensity={0.1}
          rotationSpeed={0.1}
          repulsionStrength={0.5}
          autoCenterRepulsion={0}
          starSpeed={0.5}
          speed={0.5}
        />
      </div>

      {/* Shared Tailwind UI Layer (Top) */}
      <div className={`absolute inset-0 z-[50] pointer-events-none flex flex-col items-center p-6 sm:p-12 overflow-x-hidden w-full h-full ${isHome ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <nav className="w-full max-w-7xl flex flex-col md:flex-row gap-6 justify-between items-center opacity-0 animate-fade-in pointer-events-auto mb-8 md:mb-12">
          <Link to="/" className="text-xl md:text-2xl font-black tracking-widest uppercase hover:text-[#D4AF37] transition-colors duration-300 text-center md:text-left">
            Hermes AI
          </Link>
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-xs sm:text-sm font-semibold tracking-wider">
            <button className="text-white transition-colors duration-300 uppercase px-4 py-2 hover:text-[#D4AF37] border-none outline-none focus:outline-none">
              Interview Preparation
            </button>
            <button className="text-white transition-colors duration-300 uppercase px-4 py-2 hover:text-[#D4AF37] border-none outline-none focus:outline-none">
              Career Guidance
            </button>
            <button 
              onClick={() => navigate('/resume-review')}
              className="text-white transition-colors duration-300 uppercase px-4 py-2 hover:text-[#D4AF37] border-none outline-none focus:outline-none"
            >
              Resume Review
            </button>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resume-review" element={<ResumeReview />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;