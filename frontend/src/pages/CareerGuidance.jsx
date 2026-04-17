import React, { useState, useRef, useEffect } from 'react';
import { careerChat, getCareerRecommendations } from '../services/api';

const CareerGuidance = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your Hermes Career Advisor. Tell me about your interests, skills, or what you enjoy doing, and I can help you find the perfect career path.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      const data = await careerChat(sessionId, userMessage, messages);
      
      if (data.session_id) {
        setSessionId(data.session_id);
      }

      setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch (err) {
      setError(err.message || 'Failed to get response');
      // Add error message to chat
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateRecommendations = async () => {
    if (messages.length < 3) {
      setError('Please share more about your interests first (at least 1-2 messages).');
      return;
    }

    setIsTyping(true);
    setError(null);

    try {
      const data = await getCareerRecommendations(sessionId, messages);
      setRecommendations(data);
      setShowResults(true);
    } catch (err) {
      setError(err.message || 'Failed to generate recommendations');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] w-full animate-fade-in pointer-events-auto mt-4 mb-20 pb-10">
      {/* Main Card (Matching ResumeReview exactly) */}
      <div className="w-full sm:w-full md:max-w-2xl lg:max-w-4xl p-6 md:p-8 rounded-2xl shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-500 h-[600px] max-h-[75vh] flex flex-col">
        
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 text-center text-white shrink-0">
          Career Guidance Advisor
        </h2>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm text-center animate-fade-in">
            {error}
            <button onClick={() => setError(null)} className="ml-3 text-red-300 hover:text-white">&times;</button>
          </div>
        )}

        {!showResults ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Area */}
            <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto mb-6 pr-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
              )}
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
                  disabled={isTyping || !inputValue.trim()}
                  className="flex-1 sm:flex-none h-12 px-6 bg-white/5 border border-white/50 text-white font-bold rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
                <button 
                  onClick={generateRecommendations}
                  disabled={isTyping}
                  className="flex-1 sm:flex-none h-12 px-8 bg-white/5 border border-white/50 text-white font-black uppercase tracking-widest rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:scale-105 active:scale-95 shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  Analyze
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Results State */
          <div className="flex-1 min-h-0 space-y-8 animate-fade-in overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#D4AF37]/50">
            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Analysis Complete</h3>
                <p className="text-white/60 text-sm">
                  {recommendations?.summary || 'Based on your shared interests'}
                </p>
              </div>
              <button 
                onClick={() => setShowResults(false)}
                className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] hover:text-white transition-colors"
              >
                Back to Chat
              </button>
            </div>

            <div className="grid gap-6">
              {recommendations?.recommendations?.map((rec, i) => (
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
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    {rec.description}
                  </p>
                  
                  {/* Skills needed */}
                  {rec.skills_needed && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {rec.skills_needed.map((skill, j) => (
                        <span key={j} className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white/70">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Next steps */}
                  {rec.next_steps && (
                    <div className="mt-2">
                      <p className="text-xs font-bold text-[#D4AF37]/70 uppercase mb-1">Next Steps:</p>
                      {rec.next_steps.map((step, j) => (
                        <p key={j} className="text-xs text-white/50 ml-2">→ {step}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 pt-4 border-t border-white/10">
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
