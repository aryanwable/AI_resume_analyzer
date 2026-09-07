import { useState } from 'react';
import ResumeDropzone from '../components/ResumeDropzone.jsx';
import {
  Sparkles,
  FileText,
  Briefcase,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Wand2
} from 'lucide-react';

const JD_PRESETS = [
  {
    role: 'Full Stack Engineer',
    description: `We are seeking a Full Stack Software Engineer proficient in React, Node.js, Express, and MongoDB. 
Key Responsibilities:
- Build responsive web applications using React and Tailwind CSS
- Design scalable RESTful APIs with Node.js and Express
- Implement JWT authentication and role-based access control
- Optimize MongoDB database queries and schemas
- Write unit and integration tests for frontend and backend modules
Requirements:
- 2+ years of experience with JavaScript/TypeScript, React, Node.js
- Proficiency with Git, REST APIs, and modern CI/CD practices
- Experience with AI APIs and vector embeddings is a strong plus.`,
  },
  {
    role: 'Backend Node.js Developer',
    description: `Looking for a Backend Developer specializing in scalable microservices, Node.js, Express, and database architecture.
Responsibilities:
- Architect high-performance REST APIs in Express.js
- Manage MongoDB data modeling, indexes, and aggregation pipelines
- Integrate asynchronous message queues and caching layers
- Enforce robust API security, rate limiting, and CORS headers
Requirements:
- Strong core JavaScript and asynchronous Node.js runtime fundamentals
- Hands-on experience with MongoDB/Mongoose and Docker.`,
  },
  {
    role: 'AI / Full Stack Specialist',
    description: `Join our team to build next-generation AI-powered SaaS platforms.
Requirements:
- Proven experience integrating Large Language Model APIs (LLMs) and Prompt Engineering
- Working knowledge of Vector Embeddings, Cosine Similarity, and Semantic Search
- Modern React, Tailwind CSS, Node.js backend integration
- Strong commitment to preventing AI hallucinations through strict JSON schema validation.`,
  },
];

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const wordCount = jobDescription.trim()
    ? jobDescription.trim().split(/\s+/).length
    : 0;

  const handleApplyPreset = (presetText) => {
    setJobDescription(presetText);
  };

  const handleClearAll = () => {
    setSelectedFile(null);
    setJobDescription('');
    setSuccessNotice(false);
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    // Simulate preparation for Day 12 backend upload API
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessNotice(true);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200/80">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Phase 3 • Resume Management & Processing</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Upload Resume & Job Description
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Upload your resume in PDF format and provide a target job description to prepare for extraction, deterministic scoring, and AI analysis.
        </p>
      </div>

      {/* Success Notice */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Resume & Job Description Ready for Backend Ingestion</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Client-side validation passed. Day 12 will activate the backend upload API endpoint (Multer & PDF processing).
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccessNotice(false)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Upload Card */}
      <div className="card space-y-8 shadow-xl border-slate-200 p-6 sm:p-8">
        {/* Step 1: Resume Dropzone */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Upload Candidate Resume (PDF)
              </h3>
            </div>
            {selectedFile && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> File Selected
              </span>
            )}
          </div>

          <ResumeDropzone
            selectedFile={selectedFile}
            onFileSelect={(file) => {
              setSelectedFile(file);
              setSuccessNotice(false);
            }}
            onFileRemove={() => {
              setSelectedFile(null);
              setSuccessNotice(false);
            }}
          />
        </div>

        {/* Step 2: Target Job Description */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Target Job Description (JD)
              </h3>
            </div>

            {/* Presets Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
                Sample Roles:
              </span>
              {JD_PRESETS.map((preset) => (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleApplyPreset(preset.description)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-slate-200 transition-colors"
                >
                  {preset.role}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste target job responsibilities, qualifications, and required skills here..."
              className="w-full rounded-xl border border-slate-300 p-4 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400 font-sans leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>{jobDescription.length} characters</span>
              <span>•</span>
              <span>{wordCount} words</span>
            </div>
            {jobDescription && (
              <button
                type="button"
                onClick={() => setJobDescription('')}
                className="text-slate-400 hover:text-slate-600 underline"
              >
                Clear JD
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Files are encrypted and processed in memory for text parsing</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {(selectedFile || jobDescription) && (
              <button
                type="button"
                onClick={handleClearAll}
                className="btn-secondary text-xs py-2.5 px-3"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              disabled={!selectedFile || isProcessing}
              onClick={handleAnalyze}
              className={`btn-primary py-2.5 px-5 font-semibold text-sm w-full sm:w-auto justify-center shadow-md shadow-brand-600/20 ${
                !selectedFile || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <Wand2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Analysis...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Proceed to Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
