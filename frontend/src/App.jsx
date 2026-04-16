import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { StarsBackground } from './components/ui/stars';
import { CoreSpinLoader } from './components/ui/core-spin-loader';
import Home from './pages/Home';
import ResumeReview from './pages/ResumeReview';
import CareerGuidance from './pages/CareerGuidance';
import InterviewPrep from './pages/InterviewPrep';

// Full-screen splash that shows CoreSpinLoader then fades away
function SplashScreen({ onDone }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Fade out splash after taglines finish
    const t1 = setTimeout(() => setFading(true), 3700);
    const t2 = setTimeout(() => onDone(), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.8s ease-in-out',
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      {/* Brand */}
      <p
        style={{
          fontFamily: '"Monument Extended", sans-serif',
          letterSpacing: '0.4em',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}
      >
        Hermes AI
      </p>

      <CoreSpinLoader />
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      {/* Splash loader — only shown on initial load */}
      {loading && <SplashScreen onDone={() => setLoading(false)} />}

      <StarsBackground className="w-full h-[100dvh] font-sans text-white">
        {/* UI Layer */}
        <div className="absolute inset-0 z-[50] pointer-events-none flex flex-col items-center p-6 sm:p-12 pb-0 sm:pb-0 overflow-hidden w-full h-full">
          <nav className="w-full max-w-7xl flex flex-col md:flex-row gap-6 justify-between items-center opacity-0 animate-fade-in pointer-events-auto mb-6 shrink-0">
            <Link to="/" className="text-xl md:text-2xl font-black tracking-widest uppercase hover:text-[#D4AF37] transition-colors duration-300 text-center md:text-left">
              Hermes AI
            </Link>
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-xs sm:text-sm font-semibold tracking-wider">
              <button
                onClick={() => navigate('/interview-prep')}
                className="text-white transition-colors duration-300 uppercase px-4 py-2 hover:text-[#D4AF37] border-none outline-none focus:outline-none"
              >
                Interview Preparation
              </button>
              <button
                onClick={() => navigate('/career-guidance')}
                className="text-white transition-colors duration-300 uppercase px-4 py-2 hover:text-[#D4AF37] border-none outline-none focus:outline-none"
              >
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

          <div className={`flex-1 w-full flex flex-col items-center overflow-x-hidden ${isHome ? 'overflow-hidden' : 'overflow-y-auto'} pointer-events-auto`}>
            <div className="w-full flex justify-center pb-24">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/resume-review" element={<ResumeReview />} />
                <Route path="/interview-prep" element={<InterviewPrep />} />
                <Route path="/career-guidance" element={<CareerGuidance />} />
              </Routes>
            </div>
          </div>
        </div>
      </StarsBackground>
    </>
  );
}

export default App;