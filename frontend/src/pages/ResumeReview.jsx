import React, { useState, useRef } from 'react';
import { analyzeResume, getResumeReportPDF } from '../services/api';

const ResumeReview = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reviewId, setReviewId] = useState(null);
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

  const handleAnalyze = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);

    try {
      const data = await analyzeResume(file);
      setReviewId(data.review_id);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!reviewId) {
      // Fallback: download as text if no review ID
      downloadAsText();
      return;
    }

    try {
      const blob = await getResumeReportPDF(reviewId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hermes-resume-report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Failed to download PDF');
    }
  };

  const downloadAsText = () => {
    if (!result) return;
    
    const text = `
HERMES AI — Resume Analysis Report
====================================

ATS Score: ${result.ats_score}/100

${result.summary || ''}

Missing Keywords:
${(result.missing_keywords || []).join("\n")}

Strengths:
${(result.strengths || []).join("\n")}

Weaknesses:
${(result.weaknesses || []).join("\n")}

Suggestions:
${(result.suggestions || []).join("\n")}
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
    setReviewId(null);
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

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm text-center animate-fade-in">
            {error}
            <button onClick={() => setError(null)} className="ml-3 text-red-300 hover:text-white">&times;</button>
          </div>
        )}

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
                    <span>Analyzing with AI...</span>
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
                <p className="text-white/70">{result.summary || 'Here is the detailed feedback for your resume.'}</p>
              </div>
            </div>

            {/* Score Breakdown */}
            {result.score_breakdown && (
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h4 className="text-sm font-black text-[#D4AF37] uppercase tracking-widest mb-4">Score Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(result.score_breakdown).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-black text-white">{val}</div>
                      <div className="text-xs text-white/50 uppercase">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#D4AF37]/50">
              
              {/* Missing Keywords */}
              {result.missing_keywords?.length > 0 && (
                <div className="bg-white/5 rounded-xl p-5 border border-white/10 transition-colors">
                  <h4 className="text-lg font-bold text-white mb-3">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_keywords.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-sm text-red-200">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {result.strengths?.length > 0 && (
                <div className="bg-white/5 rounded-xl p-5 border border-white/10 transition-colors">
                  <h4 className="text-lg font-bold text-white mb-3">Strengths</h4>
                  <ul className="list-disc ml-5 space-y-1 text-white/80 text-sm">
                    {result.strengths.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {result.weaknesses?.length > 0 && (
                <div className="bg-white/5 rounded-xl p-5 border border-white/10 transition-colors">
                  <h4 className="text-lg font-bold text-white mb-3">Weaknesses</h4>
                  <ul className="list-disc ml-5 space-y-1 text-white/80 text-sm">
                    {result.weaknesses.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions?.length > 0 && (
                <div className="bg-white/5 rounded-xl p-5 border border-white/10 transition-colors">
                  <h4 className="text-lg font-bold text-white mb-3">Suggestions</h4>
                  <ul className="list-disc ml-5 space-y-1 text-white/80 text-sm">
                    {result.suggestions.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 pt-4 border-t border-white/10">
              <button 
                onClick={downloadReport}
                className="px-6 py-3 bg-white/5 border border-white/50 text-white font-bold rounded-xl hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-300 uppercase tracking-wider shadow-lg flex-1 sm:flex-none"
              >
                Download PDF Report
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
