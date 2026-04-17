import React, { useState, useRef, useEffect } from 'react';
import { startInterview, submitAnswer, completeInterview, getInterviewReportPDF, interviewTTS } from '../services/api';

const InterviewPrep = () => {
  const [step, setStep] = useState('setup'); // setup, interview, results
  const [domain, setDomain] = useState('Software');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [mode, setMode] = useState('text'); // text or voice
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Interview state
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Results state
  const [report, setReport] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);

  // Error state
  const [error, setError] = useState(null);

  // Refs
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const isHandlingSendRef = useRef(false);

  // Initialize Web Speech API for STT
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        if (isHandlingSendRef.current) return;
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputValue(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsVoiceActive(false);
      };

      recognitionRef.current.onend = () => {
        setIsVoiceActive(false);
      };
    }
  }, []);

  // Play TTS audio for AI questions in voice mode
  const playTTS = async (text) => {
    try {
      console.log('[TTS] Requesting audio for text:', text.substring(0, 80) + '...');
      const audioBlob = await interviewTTS(text);
      console.log('[TTS] Received blob:', audioBlob?.type, audioBlob?.size, 'bytes');

      if (!audioBlob || audioBlob.size === 0) {
        console.error('[TTS] Empty audio blob received');
        return;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        try {
          await audioRef.current.play();
          console.log('[TTS] Audio playback started successfully');
        } catch (playErr) {
          console.error('[TTS] Browser blocked autoplay:', playErr.message);
        }
      }
    } catch (err) {
      console.error('[TTS] API call failed:', err);
    }
  };

  // Toggle voice recording
  const toggleVoice = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    if (isVoiceActive) {
      recognitionRef.current.stop();
      setIsVoiceActive(false);
    } else {
      setInputValue('');
      recognitionRef.current.start();
      setIsVoiceActive(true);
    }
  };

  // Start the interview
  const handleStartInterview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await startInterview(domain, difficulty, mode);
      setSessionId(data.session_id);
      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setStep('interview');

      // Show first question
      const firstQuestion = data.questions[0];

      // Play TTS if voice mode
      if (mode === 'voice') {
        setTimeout(() => playTTS(firstQuestion), 500);
      }
    } catch (err) {
      setError('We had an issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

    // Submit an answer and move to next question
  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    isHandlingSendRef.current = true;
    const answer = inputValue.trim();
    const currentQuestion = questions[currentQuestionIndex];

    // Reset input immediately
    setInputValue('');
    setIsTyping(true);

    // If mic is active, stop it
    if (isVoiceActive && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsVoiceActive(false);
    }

    try {
      // Submit answer to backend
      await submitAnswer(sessionId, currentQuestionIndex, currentQuestion, answer);

      const nextIndex = currentQuestionIndex + 1;

      if (nextIndex >= questions.length) {
        // All questions answered
        setIsTyping(false);
        setInterviewComplete(true);
      } else {
        // Show next question
        setCurrentQuestionIndex(nextIndex);
        const nextQuestion = questions[nextIndex];

        setIsTyping(false);
        if (mode === 'voice') {
          playTTS(nextQuestion);
        }
      }
    } catch (err) {
      setIsTyping(false);
      setError('We had an issue. Please try again.');
    } finally {
      isHandlingSendRef.current = false;
    }
  };

  // Complete interview and get report
  const showFinalResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await completeInterview(sessionId);
      setReport(data.report);
      setStep('results');
    } catch (err) {
      setError('We had an issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Download PDF report
  const downloadPDF = async () => {
    try {
      const blob = await getInterviewReportPDF(sessionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hermes-interview-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('We had an issue. Please try again.');
    }
  };

  // Reset
  const resetInterview = () => {
    setStep('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSessionId(null);
    setReport(null);
    setInterviewComplete(false);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] w-full animate-fade-in pointer-events-auto mt-4 mb-20 pb-10">
      {/* Hidden audio element for TTS */}
      <audio ref={audioRef} className="hidden" />

      {/* Main Card */}
      <div className="w-full sm:w-full md:max-w-2xl lg:max-w-3xl p-6 md:p-8 rounded-2xl shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-500 h-[600px] max-h-[75vh] flex flex-col">
        
        {(step === 'setup' || step === 'results') && (
          <>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-center text-white">
              AI Interview Simulator
            </h2>
            <p className="text-white/60 text-center mb-8 text-sm uppercase tracking-widest">
              Practice interviews with real-time AI feedback
            </p>
          </>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm text-center animate-fade-in">
            {error}
            <button onClick={() => setError(null)} className="ml-3 text-red-300 hover:text-white">&times;</button>
          </div>
        )}

        {/* ===== SETUP STEP ===== */}
        {step === 'setup' && (
          <div className="flex-1 flex flex-col justify-center space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-tighter ml-1">Select Domain</label>
                <select 
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-xl p-4 focus:outline-none focus:border-[#D4AF37]/50 appearance-none cursor-pointer"
                >
                  <option className="bg-black text-white">Software</option>
                  <option className="bg-black text-white">Marketing</option>
                  <option className="bg-black text-white">Finance</option>
                  <option className="bg-black text-white">Design</option>
                  <option className="bg-black text-white">Data Science</option>
                  <option className="bg-black text-white">Product Management</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-tighter ml-1">Difficulty</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-xl p-4 focus:outline-none focus:border-[#D4AF37]/50 appearance-none cursor-pointer"
                >
                  <option className="bg-black text-white">Beginner</option>
                  <option className="bg-black text-white">Intermediate</option>
                  <option className="bg-black text-white">Advanced</option>
                </select>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex justify-center">
              <div className="flex bg-white/5 border border-white/20 rounded-full p-1">
                <button
                  onClick={() => setMode('text')}
                  className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                    mode === 'text'
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50'
                      : 'text-white/50 hover:text-white border border-transparent'
                  }`}
                >
                  💬 Text Mode
                </button>
                <button
                  onClick={() => setMode('voice')}
                  className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                    mode === 'voice'
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50'
                      : 'text-white/50 hover:text-white border border-transparent'
                  }`}
                >
                  🎙️ Voice Mode
                </button>
              </div>
            </div>
            {mode === 'voice' && (
              <p className="text-center text-white/40 text-xs">
                AI questions will be spoken aloud. Click the mic button to record your answers.
              </p>
            )}

            <div className="flex justify-center pt-4">
              <button 
                onClick={handleStartInterview}
                disabled={isLoading}
                className="px-12 py-4 bg-white/5 border border-white/50 text-white font-black uppercase tracking-widest rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:scale-105 active:scale-95 shadow-lg transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Generating Questions...</span>
                  </div>
                ) : (
                  'Start Interview'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ===== INTERVIEW STEP ===== */}
        {step === 'interview' && (
          <div className="flex-1 flex flex-col animate-fade-in relative min-h-0">
            {/* Progress Bar */}
            <div className="mb-8 flex items-center gap-3 shrink-0 mt-4">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D4AF37] rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestionIndex + (interviewComplete ? 1 : 0)) / questions.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-white/50 font-bold whitespace-nowrap">
                {Math.min(currentQuestionIndex + 1, questions.length)} / {questions.length}
              </span>
            </div>

            {/* Display Question */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center mb-6">
              {!interviewComplete ? (
                <div className="w-full text-center animate-fade-in">
                  <h3 className="text-[#D4AF37] uppercase tracking-widest text-sm font-bold mb-4">Question {currentQuestionIndex + 1}</h3>
                  <p className="text-xl md:text-2xl text-white font-medium leading-relaxed max-w-xl mx-auto">
                    {questions[currentQuestionIndex]}
                  </p>
                </div>
              ) : (
                <div className="w-full text-center animate-fade-in">
                  <h3 className="text-[#D4AF37] uppercase tracking-widest text-xl font-bold mb-4">Interview Complete</h3>
                  <p className="text-xl text-white font-medium leading-relaxed max-w-xl mx-auto">
                    Excellent! You've completed all 10 questions. Click 'View Performance Report' to see your personalized results and AI feedback.
                  </p>
                </div>
              )}
            </div>

            {/* Input Area */}
            {!interviewComplete ? (
              <div className="flex flex-col gap-4 mt-auto mb-4">
                <div className="relative w-full">
                  <textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={isVoiceActive ? "Listening (Press Microphone to stop)..." : "Type your answer here..."}
                    className="w-full h-32 bg-white/5 border border-white/20 rounded-2xl py-4 px-6 pr-16 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 transition-all resize-none scrollbar-thin scrollbar-thumb-white/10"
                  />
                  {mode === 'voice' && (
                    <button 
                      onClick={toggleVoice}
                      className={`absolute right-4 bottom-4 p-3 rounded-full transition-colors ${
                        isVoiceActive ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/50' : 'bg-white/5 text-white/30 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/30'
                      }`}
                    >
                      🎤
                    </button>
                  )}
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={handleSend}
                    disabled={isTyping || (!inputValue.trim() && !isVoiceActive)}
                    className="px-8 py-3 bg-white/5 border border-white/50 text-white font-black uppercase tracking-widest rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all disabled:opacity-50 min-w-[150px]"
                  >
                    {isTyping ? "Submitting..." : "Submit Answer"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mt-auto mb-8">
                <button 
                  onClick={showFinalResults}
                  disabled={isLoading}
                  className="px-10 py-4 bg-[#D4AF37] text-black font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                      <span>Analyzing Performance...</span>
                    </div>
                  ) : (
                    'View Performance Report'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== RESULTS STEP ===== */}
        {step === 'results' && report && (
          <div className="flex-1 flex flex-col min-h-0 animate-fade-in gap-5">
            <div className="flex flex-col md:flex-row gap-6 items-center border-b border-white/10 pb-4 shrink-0">
              <div className="relative w-32 h-32 flex items-center justify-center bg-white/5 border border-white/10 rounded-full shadow-lg">
                <div className="text-4xl font-black text-[#D4AF37]">{report.overall_score}</div>
                <div className="absolute -bottom-2 bg-black text-white px-3 py-1 text-[10px] font-bold rounded-full border border-white/20 uppercase tracking-widest">
                  Overall Score
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">
                  Interview Mastery: {report.mastery_level}
                </h3>
                <p className="text-white/70">{report.summary}</p>
              </div>
            </div>

            <div className="flex-1 min-h-0 grid md:grid-cols-2 gap-6 overflow-y-auto pr-2 scrollbar-thin">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-[#D4AF37]/50 transition-colors">
                <h4 className="text-sm font-black text-[#D4AF37] uppercase tracking-widest mb-3">Key Strengths</h4>
                <ul className="text-sm text-white/80 space-y-2">
                  {report.strengths?.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-[#D4AF37]/50 transition-colors">
                <h4 className="text-sm font-black text-[#D4AF37] uppercase tracking-widest mb-3">Improvement Tips</h4>
                <ul className="text-sm text-white/80 space-y-2">
                  {report.improvements?.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Question-by-question breakdown */}
            {report.question_scores && report.question_scores.length > 0 && (
              <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 scrollbar-thin">
                <h4 className="text-sm font-black text-[#D4AF37] uppercase tracking-widest">Question Breakdown</h4>
                {report.question_scores.map((qs, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white/50">Q{qs.question_number}</span>
                      <span className="text-xs font-black text-[#D4AF37]">{qs.score}/10</span>
                    </div>
                    <p className="text-sm text-white/70">{qs.feedback}</p>
                    {qs.suggestion && (
                      <p className="text-xs text-[#D4AF37]/80 mt-1">💡 {qs.suggestion}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-white/10 shrink-0">
              <button 
                onClick={resetInterview}
                className="px-8 py-3 bg-white/5 border border-white/50 text-white font-bold rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300 uppercase tracking-wider flex-1 sm:flex-none"
              >
                New Session
              </button>
              <button 
                onClick={downloadPDF}
                className="px-8 py-3 bg-white/5 border border-white/50 text-white font-bold rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300 uppercase tracking-wider flex-1 sm:flex-none"
              >
                Download PDF Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
