import React, { useState, useRef } from 'react';

const ResumeReview = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Only PDF files allowed');
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);

    // Simulate analysis delay
    setTimeout(() => {
      setResult({
        ats_score: 78,
        missing_keywords: ["React", "Node.js", "SQL"],
        strengths: ["Good project structure", "Clear education section"],
        weaknesses: ["Lack of quantified achievements"],
        suggestions: [
          "Add metrics (e.g., improved performance by 30%)",
          "Include more technical keywords"
        ]
      });

      setLoading(false);
    }, 2000);
  };

  const downloadReport = () => {
    if (!result) return;
    
    const text = `
ATS Score: ${result.ats_score}

Missing Keywords:
${result.missing_keywords.join("\n")}

Strengths:
${result.strengths.join("\n")}

Weaknesses:
${result.weaknesses.join("\n")}

Suggestions:
${result.suggestions.join("\n")}
`;

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resume-report.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] w-full animate-fade-in pointer-events-auto mt-4 mb-20 pb-10">
      {/* Main Card (Glassmorphism) */}
      <div className="w-full sm:w-full md:max-w-2xl lg:max-w-3xl p-6 md:p-8 rounded-2xl shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-500">
        
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 text-center text-white">
          Resume Reviewer
        </h2>

        {!result ? (
          <div className="space-y-6">
            {/* Upload Component */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !loading && fileInputRef.current.click()}
              className={`py-8 text-center cursor-pointer transition ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              
              <p className="text-xl font-medium text-white/90">Drag & Drop your Resume here</p>
              <p className="text-sm text-white/60 mt-2 mb-4">or</p>
              
              <button 
                type="button"
                className="px-8 py-3 bg-white/5 border border-white/50 text-white font-bold rounded-full hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300"
                disabled={loading}
              >
                Upload Resume
              </button>

              {file && (
                <div className="mt-6 p-3 bg-[#D4AF37]/20 rounded-lg border border-[#D4AF37]/30 text-white">
                  <span className="font-semibold text-[#D4AF37]">Selected File: </span>
                  {file.name}
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-center">
                {error}
              </div>
            )}

            {/* Analyze Button / Loading State */}
            <div className="flex justify-center mt-6">
              <button 
                onClick={handleAnalyze}
                disabled={!file || loading}
                className={`px-10 py-4 rounded-full font-black uppercase tracking-widest transition-all duration-300 border ${
                  !file || loading 
                    ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed' 
                    : 'bg-white/5 border-white/50 text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:scale-105 active:scale-95 shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Analyzing your resume...</span>
                  </div>
                ) : (
                  "Review Resume"
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Result Display */
          <div className="space-y-8 animate-fade-in transition-opacity duration-500 opacity-100">
            
            <div className="flex flex-col md:flex-row gap-6 items-center border-b border-white/10 pb-6">
              <div className="relative w-32 h-32 flex items-center justify-center bg-white/5 border border-white/10 rounded-full shadow-lg">
                <div className="text-4xl font-black text-[#D4AF37]">{result.ats_score}</div>
                <div className="absolute -bottom-2 bg-black text-white px-3 py-1 text-xs font-bold rounded-full border border-white/20 uppercase tracking-widest">
                  ATS Score
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Analysis Complete</h3>
                <p className="text-white/70">Here is the detailed feedback for your resume.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#D4AF37]/50">
              
              {/* Missing Keywords */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 transition-colors">
                <h4 className="text-lg font-bold text-white mb-3">Missing Keywords</h4>
                <ul className="list-disc ml-5 space-y-1 text-white/80 text-sm">
                  {result.missing_keywords.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Strengths */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 transition-colors">
                <h4 className="text-lg font-bold text-white mb-3">Strengths</h4>
                <ul className="list-disc ml-5 space-y-1 text-white/80 text-sm">
                  {result.strengths.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 transition-colors">
                <h4 className="text-lg font-bold text-white mb-3">Weaknesses</h4>
                <ul className="list-disc ml-5 space-y-1 text-white/80 text-sm">
                  {result.weaknesses.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 transition-colors">
                <h4 className="text-lg font-bold text-white mb-3">Suggestions</h4>
                <ul className="list-disc ml-5 space-y-1 text-white/80 text-sm">
                  {result.suggestions.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 pt-4 border-t border-white/10">
              <button 
                onClick={downloadReport}
                className="px-6 py-3 bg-white/5 border border-white/50 text-white font-bold rounded-xl hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300 uppercase tracking-wider shadow-lg flex-1 sm:flex-none"
              >
                Download Report
              </button>
              <button 
                onClick={handleReset}
                className="px-6 py-3 bg-white/5 border border-white/50 text-white font-bold rounded-xl hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300 uppercase tracking-wider flex-1 sm:flex-none"
              >
                Upload Again
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeReview;
