import { useState } from 'react';
import ResumeDropzone from '../components/ResumeDropzone.jsx';
import { uploadResumeFile, scoreResumeText } from '../services/resumeService.js';
import {
  Sparkles,
  FileText,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Wand2,
  Award,
  BarChart3,
  Check,
  X,
  Layers,
  BookOpen
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
  const [errorNotice, setErrorNotice] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);

  const wordCount = jobDescription.trim()
    ? jobDescription.trim().split(/\s+/).length
    : 0;

  const handleApplyPreset = (presetText) => {
    setJobDescription(presetText);
    setErrorNotice(null);
  };

  const handleClearAll = () => {
    setSelectedFile(null);
    setJobDescription('');
    setErrorNotice(null);
    setScoreResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorNotice('Please select a resume PDF file to upload.');
      return;
    }
    if (!jobDescription.trim()) {
      setErrorNotice('Please provide a target job description to score against.');
      return;
    }

    setIsProcessing(true);
    setErrorNotice(null);
    setScoreResult(null);

    try {
      // 1. Upload & Extract text via Day 14 backend pipeline
      const uploadRes = await uploadResumeFile(selectedFile);
      const extractedText = uploadRes?.data?.resume?.extraction?.text || '';

      if (!extractedText) {
        throw new Error('No readable text could be extracted from this PDF.');
      }

      // 2. Score extracted resume against JD via Day 15 scoring engine
      const scoreRes = await scoreResumeText(extractedText, jobDescription.trim());
      setScoreResult(scoreRes?.data?.score);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to process and score resume.';
      setErrorNotice(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-emerald-700 bg-emerald-100 border-emerald-300';
      case 'B': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'C': return 'text-amber-700 bg-amber-100 border-amber-300';
      default: return 'text-rose-700 bg-rose-100 border-rose-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200/80">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Phase 3 • Day 15 Deterministic Scoring Engine</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Resume Match & Deterministic Scoring
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Upload candidate resume and compare against job specifications to generate a comprehensive 100-point compatibility score.
        </p>
      </div>

      {/* Error Notice */}
      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Scoring Failed</p>
              <p className="text-xs text-rose-700 mt-0.5">{errorNotice}</p>
            </div>
          </div>
          <button
            onClick={() => setErrorNotice(null)}
            className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
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
              setErrorNotice(null);
            }}
            onFileRemove={() => {
              setSelectedFile(null);
              setErrorNotice(null);
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
              onChange={(e) => {
                setJobDescription(e.target.value);
                setErrorNotice(null);
              }}
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
                  <span>Scoring Resume...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Analyze & Score</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Score Results Card */}
      {scoreResult && (
        <div className="card space-y-6 shadow-xl border-slate-200 p-6 sm:p-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900">Score & Match Report</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">{scoreResult.summary}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-lg font-extrabold border ${getGradeColor(scoreResult.grade)}`}>
                Grade {scoreResult.grade}
              </span>
              <div className="text-right">
                <div className="text-3xl font-black text-brand-700">{scoreResult.totalScore}</div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Out of 100</div>
              </div>
            </div>
          </div>

          {/* Subcategory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Keywords */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <BarChart3 className="w-4 h-4 text-brand-600" />
                  <span>Keywords</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {scoreResult.breakdown.keywords.score} / {scoreResult.breakdown.keywords.maxScore}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-full rounded-full"
                  style={{ width: `${(scoreResult.breakdown.keywords.score / scoreResult.breakdown.keywords.maxScore) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Matched {scoreResult.breakdown.keywords.matched?.length} of {scoreResult.breakdown.keywords.total} key terms
              </p>
            </div>

            {/* Sections */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Sections</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {scoreResult.breakdown.sections.score} / {scoreResult.breakdown.sections.maxScore}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${(scoreResult.breakdown.sections.score / scoreResult.breakdown.sections.maxScore) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {scoreResult.breakdown.sections.found?.length} standard sections detected
              </p>
            </div>

            {/* Content Depth */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Depth</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {scoreResult.breakdown.contentDepth.score} / {scoreResult.breakdown.contentDepth.maxScore}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${(scoreResult.breakdown.contentDepth.score / scoreResult.breakdown.contentDepth.maxScore) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {scoreResult.breakdown.contentDepth.wordCount} words • {scoreResult.breakdown.contentDepth.uniqueWords} unique
              </p>
            </div>

            {/* Readability */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  <span>Readability</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {scoreResult.breakdown.readability.score} / {scoreResult.breakdown.readability.maxScore}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-600 h-full rounded-full"
                  style={{ width: `${(scoreResult.breakdown.readability.score / scoreResult.breakdown.readability.maxScore) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Avg sentence {scoreResult.breakdown.readability.avgSentenceLength} words
              </p>
            </div>
          </div>

          {/* Keywords Breakdown Pills */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Top Matched Skills & Keywords</h4>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {scoreResult.breakdown.keywords.matched?.slice(0, 20).map((kw) => (
                <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  {kw}
                </span>
              ))}
              {scoreResult.breakdown.keywords.missing?.slice(0, 10).map((kw) => (
                <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                  <X className="w-3 h-3 text-rose-500" />
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

