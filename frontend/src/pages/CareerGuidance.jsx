import React, { useState, useRef, useEffect } from 'react';

const CareerGuidance = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your Hermes Career Advisor. Tell me about your interests, skills, or what you enjoy doing, and I can help you find the perfect career path.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = { 
        role: 'ai', 
        content: `That's fascinating! Based on your interest in "${userMessage.content}", I'm analyzing potential career trajectories for you. Would you like to see some initial recommendations or tell me more about your technical background?` 
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const generateRecommendations = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setRecommendations([
        { name: 'AI Solutions Architect', match: 95, description: 'Designing complex AI systems and integrating them into enterprise workflows.' },
        { name: 'Full Stack Space Engineer', match: 88, description: 'Developing software for orbital mechanics and satellite communication interfaces.' },
        { name: 'Cybersecurity Analyst', match: 82, description: 'Protecting digital assets using advanced AI-driven threat detection systems.' }
      ]);
      setShowResults(true);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] w-full animate-fade-in pointer-events-auto mt-4 mb-20 pb-10">
      {/* Main Card (Matching ResumeReview exactly) */}
      <div className="w-full sm:w-full md:max-w-2xl lg:max-w-4xl p-6 md:p-8 rounded-2xl shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-500">
        
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 text-center text-white">
          Career Guidance Advisor
        </h2>

        {!showResults ? (
          <div className="flex flex-col h-[500px]">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto mb-6 pr-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div 
                    className={`max-w-[80%] px-5 py-3 rounded-2xl transition-all duration-300 ${
                      msg.role === 'user' 
                        ? 'bg-white/10 border border-white/20 text-white shadow-lg' 
                        : 'bg-white/5 border border-white/10 text-xl font-medium text-white/90'
                    }`}
                  >
                    {msg.content}
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

            {/* Input Area */}
            <div className="flex flex-col sm:flex-row gap-3 items-center group">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyUp={handleKeyPress}
                placeholder="Type your interests or background..."
                className="w-full bg-white/5 border border-white/20 rounded-full py-3 px-6 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 transition-all duration-300 backdrop-blur-md"
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleSend}
                  className="flex-1 sm:flex-none h-12 px-6 bg-white/5 border border-white/50 text-white font-bold rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
                <button 
                  onClick={generateRecommendations}
                  className="flex-1 sm:flex-none h-12 px-8 bg-white/5 border border-white/50 text-white font-black uppercase tracking-widest rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:scale-105 active:scale-95 shadow-lg transition-all duration-300"
                >
                  Analyze
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Results State */
          <div className="space-y-8 animate-fade-in max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#D4AF37]/50">
            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Analysis Complete</h3>
                <p className="text-white/60 text-sm">Based on your shared interests</p>
              </div>
              <button 
                onClick={() => setShowResults(false)}
                className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] hover:text-white transition-colors"
              >
                Back to Chat
              </button>
            </div>

            <div className="grid gap-6">
              {recommendations.map((rec, i) => (
                <div 
                  key={i} 
                  className="group relative p-6 bg-white/5 border border-white/10 rounded-xl hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xl font-bold text-white uppercase tracking-tight">
                      {rec.name}
                    </h4>
                    <span className="text-lg font-black text-[#D4AF37]">{rec.match}%</span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 pt-4 border-t border-white/10">
              <button 
                className="px-8 py-3 bg-white/5 border border-white/50 text-white font-black uppercase tracking-widest rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300 shadow-lg flex-1 sm:flex-none"
              >
                Download Roadmap
              </button>
              <button 
                onClick={() => setShowResults(false)}
                className="px-8 py-3 bg-white/5 border border-white/50 text-white font-bold rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300 uppercase tracking-wider flex-1 sm:flex-none"
              >
                Chat Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerGuidance;
