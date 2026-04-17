import React, { useState, useEffect } from 'react';
import { getCareerQuestions, getCareerRecommendations } from '../services/api';

const CareerGuidance = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [conversation, setConversation] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCareerQuestions();
      setQuestions(data.questions);
    } catch (err) {
      setError('We had an issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!selectedOption) return;

    const currentQuestion = questions[currentIndex].question;
    const answerText = selectedOption.startsWith("Other") && customInput.trim() !== '' 
      ? customInput.trim() 
      : selectedOption;

    const updatedConversation = [
      ...conversation,
      { role: 'ai', content: currentQuestion },
      { role: 'user', content: answerText }
    ];

    setConversation(updatedConversation);
    setSelectedOption('');
    setCustomInput('');

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finished all questions, submit!
      setIsSubmitting(true);
      setError(null);
      try {
        const data = await getCareerRecommendations(null, updatedConversation);
        setRecommendations(data);
        setShowResults(true);
      } catch (err) {
        setError('We had an issue. Please try again.');
        // Revert so they can retry submission if API failed
        setConversation(conversation);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setConversation([]);
    setRecommendations(null);
    setShowResults(false);
    setSelectedOption('');
    setCustomInput('');
    fetchQuestions();
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] w-full animate-fade-in pointer-events-auto mt-4 mb-20 pb-10">
      {/* Main Card */}
      <div className="w-full sm:w-full md:max-w-2xl lg:max-w-4xl p-6 md:p-8 rounded-2xl shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-500 h-auto min-h-[600px] max-h-[90vh] flex flex-col">

        <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 text-center text-white shrink-0">
          Career Guidance
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm text-center animate-fade-in shrink-0">
            {error}
            <button onClick={() => setError(null)} className="ml-3 text-red-300 hover:text-white">&times;</button>
          </div>
        )}

        {isLoading ? (
           <div className="flex-1 flex flex-col items-center justify-center">
             <div className="w-10 h-10 border-4 border-white/20 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
             <p className="text-white/50 uppercase tracking-widest font-bold">Generating Questionnaire...</p>
           </div>
        ) : !showResults && questions.length > 0 ? (
          <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
            {/* Progress Bar */}
            <div className="mb-4 flex items-center gap-3 shrink-0">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D4AF37] rounded-full transition-all duration-500"
                  style={{ width: `${(currentIndex / questions.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-white/50 font-bold whitespace-nowrap">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>

            {/* Question Display */}
            <div className="flex-1 flex flex-col min-h-0 mb-2 w-full max-w-2xl mx-auto">
              <p className="text-xl text-white font-medium leading-relaxed text-center mb-4">
                {questions[currentIndex].question}
              </p>

              <div className="space-y-2">
                {questions[currentIndex].options.map((opt, i) => {
                  const isOther = opt.startsWith('Other');
                  const isSelected = selectedOption === opt;
                  
                  return (
                    <div key={i} className="flex flex-col gap-2">
                       <button
                         onClick={() => setSelectedOption(opt)}
                         className={`w-full p-3 rounded-xl border text-left transition-all duration-300 flex items-center ${
                           isSelected 
                            ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white shadow-md transform scale-[1.02]' 
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/30'
                         }`}
                       >
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${
                           isSelected ? 'border-[#D4AF37]' : 'border-white/30'
                         }`}>
                           {isSelected && <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>}
                         </div>
                         <span className="flex-1 font-medium text-sm md:text-base">{opt}</span>
                       </button>

                       {/* Input field if 'Other' is selected */}
                       {isOther && isSelected && (
                         <div className="ml-7 animate-fade-in mt-1">
                            <input 
                              type="text"
                              value={customInput}
                              onChange={(e) => setCustomInput(e.target.value)}
                              placeholder="Please specify..."
                              className="w-full bg-white/5 border border-[#D4AF37]/50 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                              required
                            />
                         </div>
                       )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center mt-2 shrink-0">
              <button 
                onClick={handleNext}
                disabled={!selectedOption || (selectedOption.toLowerCase().includes('other') && !customInput.trim()) || isSubmitting}
                className="px-8 py-3 bg-white/5 border border-white/50 text-white font-black uppercase tracking-widest rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all disabled:opacity-50 min-w-[200px]"
              >
                {isSubmitting ? "Analyzing..." : currentIndex === questions.length - 1 ? "Get Matches" : "Next"}
              </button>
            </div>
          </div>
        ) : showResults ? (
          /* Results State */
          <div className="flex-1 min-h-0 space-y-8 animate-fade-in overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#D4AF37]/50">
            <div className="flex flex-col border-b border-white/10 pb-6 mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider text-center pt-2">Career Analysis Complete</h3>
                <p className="text-white/60 text-sm text-center mt-2">
                  {recommendations?.summary || 'Based on your shared interests and our Machine Learning analysis.'}
                </p>
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
                onClick={handleReset}
                className="px-8 py-3 bg-white/5 border border-white/50 text-white font-bold rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300 uppercase tracking-wider flex-1 sm:flex-none"
              >
                Retake Assessment
              </button>
            </div>
          </div>
        ) : (
          /* Error or empty state fallback */
          <div className="flex-1 flex flex-col items-center justify-center">
             <button onClick={fetchQuestions} className="text-[#D4AF37] hover:text-white underline">Retry Loading Questions</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerGuidance;
