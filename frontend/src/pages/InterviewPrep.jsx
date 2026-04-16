import React, { useState, useRef, useEffect } from 'react';

const InterviewPrep = () => {
  const [step, setStep] = useState('setup'); // setup, interview, results
  const [domain, setDomain] = useState('Software');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (step === 'interview') scrollToBottom();
  }, [messages, isTyping]);

  const startInterview = () => {
    setStep('interview');
    setIsTyping(true);
    setTimeout(() => {
      setMessages([
        { role: 'ai', content: `Welcome to your ${domain} interview session (${difficulty} level). I'm your AI interviewer. Let's start with a technical question: Can you explain the core concepts of your chosen field and how you've applied them in a recent project?` }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI analysis and feedback
    setTimeout(() => {
      const score = Math.floor(Math.random() * 4) + 6; // Score 6-9
      setCurrentFeedback({
        score,
        text: score > 7 ? "Excellent explanation of technical concepts." : "Good effort, but could be more specific.",
        suggestion: "Try to quantify your results (e.g., 'improved performance by 20%')."
      });

      setTimeout(() => {
        setIsTyping(false);
        const nextQuestions = [
          "Great points. How do you handle conflict within a technical team?",
          "Can you describe a situation where you had to solve a complex problem under a tight deadline?",
          "Where do you see yourself professionally in the next 5 years?"
        ];
        
        if (messages.length > 6) {
          setInterviewComplete(true);
          setMessages(prev => [...prev, { role: 'ai', content: "Thank you. That concludes our interview session. I've prepared a comprehensive analysis of your performance. Click below to see your results." }]);
        } else {
          setMessages(prev => [...prev, { role: 'ai', content: nextQuestions[Math.floor(Math.random() * nextQuestions.length)] }]);
        }
      }, 1000);
    }, 1500);
  };

  const showFinalResults = () => {
    setStep('results');
  };

  const resetInterview = () => {
    setStep('setup');
    setMessages([]);
    setInterviewComplete(false);
    setCurrentFeedback(null);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] w-full animate-fade-in pointer-events-auto mt-4 mb-20 pb-10">
      {/* Main Card */}
      <div className="w-full sm:w-full md:max-w-2xl lg:max-w-3xl p-6 md:p-8 rounded-2xl shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-500 min-h-[500px] flex flex-col">
        
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-center text-white">
          AI Interview Simulator
        </h2>
        <p className="text-white/60 text-center mb-8 text-sm uppercase tracking-widest">
          Practice interviews with real-time AI feedback
        </p>

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

            <div className="flex justify-center pt-4">
              <button 
                onClick={startInterview}
                className="px-12 py-4 bg-white/5 border border-white/50 text-white font-black uppercase tracking-widest rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:scale-105 active:scale-95 shadow-lg transition-all duration-300"
              >
                Start Interview
              </button>
            </div>
          </div>
        )}

        {step === 'interview' && (
          <div className="flex-1 flex flex-col animate-fade-in relative">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6 max-h-[400px] scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[85%] px-5 py-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-white/10 border border-white/20 text-white shadow-md' 
                      : 'bg-white/5 border border-white/10 text-xl font-medium text-white/90'
                  }`}>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl flex gap-2 items-center">
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Feedback Alert Overlay */}
            {currentFeedback && (
              <div 
                className="absolute top-0 inset-x-0 bg-[#D4AF37]/10 border border-[#D4AF37]/30 backdrop-blur-md rounded-xl p-4 mb-4 animate-fade-in flex items-center gap-4 z-10"
                onClick={() => setCurrentFeedback(null)}
              >
                <div className="bg-black/50 border border-[#D4AF37]/50 w-12 h-12 rounded-full flex items-center justify-center font-black text-[#D4AF37]">
                  {currentFeedback.score}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase text-[#D4AF37] mb-1">Live AI Feedback</p>
                  <p className="text-sm text-white/90 line-clamp-1">{currentFeedback.text}</p>
                </div>
                <button className="text-white/30 hover:text-white">&times;</button>
              </div>
            )}

            {/* Input Area */}
            {!interviewComplete ? (
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Provide your answer..."
                    className="w-full bg-white/5 border border-white/20 rounded-full py-3 px-6 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 transition-all"
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#D4AF37]">
                    🎤
                  </button>
                </div>
                <button 
                  onClick={handleSend}
                  disabled={isTyping}
                  className="px-8 py-3 bg-white/5 border border-white/50 text-white font-black uppercase tracking-widest rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            ) : (
              <div className="flex justify-center mt-auto animate-bounce">
                <button 
                  onClick={showFinalResults}
                  className="px-10 py-4 bg-[#D4AF37] text-black font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  View Performance Report
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'results' && (
          <div className="flex-1 animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-center border-b border-white/10 pb-6">
              <div className="relative w-32 h-32 flex items-center justify-center bg-white/5 border border-white/10 rounded-full shadow-lg">
                <div className="text-4xl font-black text-[#D4AF37]">82</div>
                <div className="absolute -bottom-2 bg-black text-white px-3 py-1 text-[10px] font-bold rounded-full border border-white/20 uppercase tracking-widest">
                  Overall Score
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Interview Mastery: High</h3>
                <p className="text-white/70">You demonstrated strong technical knowledge and communication skills.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-h-[30vh] overflow-y-auto pr-2 scrollbar-thin">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-[#D4AF37]/50 transition-colors">
                <h4 className="text-sm font-black text-[#D4AF37] uppercase tracking-widest mb-3">Key Strengths</h4>
                <ul className="text-sm text-white/80 space-y-2">
                  <li>• Excellent technical range</li>
                  <li>• Structured problem solving</li>
                  <li>• Professional delivery</li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-[#D4AF37]/50 transition-colors">
                <h4 className="text-sm font-black text-[#D4AF37] uppercase tracking-widest mb-3">Improvement Tips</h4>
                <ul className="text-sm text-white/80 space-y-2">
                  <li>• Elaborate on specific metrics</li>
                  <li>• Use the STAR method more</li>
                  <li>• Confidence in niche topics</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-white/10">
              <button 
                onClick={resetInterview}
                className="px-8 py-3 bg-white/5 border border-white/50 text-white font-bold rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300 uppercase tracking-wider flex-1 sm:flex-none"
              >
                New Session
              </button>
              <button 
                className="px-8 py-3 bg-white/5 border border-white/50 text-white font-bold rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300 uppercase tracking-wider flex-1 sm:flex-none"
              >
                Download Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
