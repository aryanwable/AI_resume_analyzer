import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  BookOpen,
  Lightbulb,
  ThumbsUp,
  MessageSquare,
  Cpu,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  FolderGit2,
  ExternalLink,
  Zap
} from 'lucide-react';

const JD_PRESETS = [
  {
    role: 'Full Stack Engineer',
    description: `We are seeking a Full Stack Software Engineer proficient in React, Node.js, Express, and MongoDB. 
Key Responsibilities:
- Build responsive web applications using React, TypeScript, and Tailwind CSS
- Design scalable RESTful APIs with Node.js and Express
- Implement JWT authentication and role-based access control
- Optimize MongoDB database queries, indexes, and aggregation schemas
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
- Manage MongoDB and PostgreSQL data modeling, indexes, and aggregation pipelines
- Integrate asynchronous message queues (RabbitMQ/Kafka) and Redis caching
- Enforce robust API security, rate limiting, and CORS headers
Requirements:
- Strong core JavaScript/TypeScript and asynchronous Node.js runtime fundamentals
- Hands-on experience with MongoDB, PostgreSQL, and Docker containerization.`,
  },
  {
    role: 'Senior React / Frontend Developer',
    description: `Seeking an experienced Frontend Developer to build fluid, high-performance web applications.
Responsibilities:
- Create modern React and Next.js applications using TypeScript and Tailwind CSS
- Implement accessible UI/UX components and interactive data visualizations
- Manage state with Redux Toolkit and optimize client rendering performance
Requirements:
- Strong proficiency in React, TypeScript, modern CSS, and Vite/Webpack
- Familiarity with Jest/Cypress component testing.`,
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
  const [processingStep, setProcessingStep] = useState('');
  const [errorNotice, setErrorNotice] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  const [semanticMatch, setSemanticMatch] = useState(null);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);

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
    setSemanticMatch(null);
    setAiAdvice(null);
    setAnalysisId(null);
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
    setProcessingStep('Extracting text and structure from PDF...');
    setErrorNotice(null);
    setScoreResult(null);
    setSemanticMatch(null);
    setAiAdvice(null);
    setAnalysisId(null);

    try {
      // 1. Upload & Extract text via backend pipeline
      const uploadRes = await uploadResumeFile(selectedFile);
      const extractedText = uploadRes?.data?.resume?.extraction?.text || '';

      if (!extractedText) {
        throw new Error('No readable text could be extracted from this PDF.');
      }

      setProcessingStep('Evaluating 6-pillar score, vector semantics & AI career insights...');

      // 2. Score extracted resume against JD & generate AI advisor feedback
      const scoreRes = await scoreResumeText({
        resumeText: extractedText,
        jobDescription: jobDescription.trim(),
        fileName: selectedFile.name,
        fileSizeBytes: selectedFile.size,
        fileSizeFormatted: uploadRes?.data?.resume?.fileSizeFormatted,
        jobRole: JD_PRESETS.find((p) => p.description === jobDescription.trim())?.role || 'Target Position Analysis',
        metrics: uploadRes?.data?.resume?.extraction,
        saveToHistory: true,
      });

      setScoreResult(scoreRes?.data?.score);
      setSemanticMatch(scoreRes?.data?.semanticMatch);
      setAiAdvice(scoreRes?.data?.aiAdvice);
      setAnalysisId(scoreRes?.data?.analysisId);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to process and score resume.';
      setErrorNotice(msg);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
      case 'A+':
      case 'A-':
        return 'text-emerald-700 bg-emerald-100 border-emerald-300';
      case 'B':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'C':
        return 'text-amber-700 bg-amber-100 border-amber-300';
      default:
        return 'text-rose-700 bg-rose-100 border-rose-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200/80">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Explainable Scoring & Semantic Matching</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          AI Resume Match & Career Assistant
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Upload your resume PDF and compare against any job description to evaluate 6 weighted pillars, conceptual semantic alignment, and actionable AI optimizations.
        </p>
      </div>

      {/* Error Notice */}
      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start justify-between gap-3">
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
                <CheckCircle2 className="w-3.5 h-3.5" /> File Ready
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
                Presets:
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
              placeholder="Paste target job responsibilities, required qualifications, and technologies here..."
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
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero-hallucination evaluation grounded strictly in actual document evidence</span>
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
              className={`btn-primary py-2.5 px-6 font-semibold text-sm w-full sm:w-auto justify-center shadow-md shadow-brand-600/20 ${
                !selectedFile || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <Wand2 className="w-4 h-4 animate-spin" />
                  <span>{processingStep || 'Processing Resume...'}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
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
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900">Explainable Match Report</h2>
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

          {/* 6-Pillar Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Skills (25%) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Cpu className="w-4 h-4 text-brand-600" />
                  <span>Skills Match (25%)</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {scoreResult.breakdown?.skills?.score} / 25
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-full rounded-full"
                  style={{ width: `${(scoreResult.breakdown?.skills?.score / 25) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {scoreResult.breakdown?.skills?.feedback}
              </p>
            </div>

            {/* 2. Keywords (20%) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Keywords (20%)</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {scoreResult.breakdown?.keywords?.score} / 20
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${(scoreResult.breakdown?.keywords?.score / 20) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {scoreResult.breakdown?.keywords?.feedback}
              </p>
            </div>

            {/* 3. Experience & Impact (20%) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Experience (20%)</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {scoreResult.breakdown?.experience?.score} / 20
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${(scoreResult.breakdown?.experience?.score / 20) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {scoreResult.breakdown?.experience?.feedback}
              </p>
            </div>

            {/* 4. Projects (15%) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <FolderGit2 className="w-4 h-4 text-cyan-600" />
                  <span>Projects (15%)</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {scoreResult.breakdown?.projects?.score} / 15
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-600 h-full rounded-full"
                  style={{ width: `${(scoreResult.breakdown?.projects?.score / 15) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {scoreResult.breakdown?.projects?.feedback}
              </p>
            </div>

            {/* 5. ATS Formatting (10%) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>ATS Layout (10%)</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {scoreResult.breakdown?.ats?.score} / 10
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{ width: `${(scoreResult.breakdown?.ats?.score / 10) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {scoreResult.breakdown?.ats?.feedback}
              </p>
            </div>

            {/* 6. Education (10%) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span>Education (10%)</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {scoreResult.breakdown?.education?.score} / 10
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{ width: `${(scoreResult.breakdown?.education?.score / 10) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {scoreResult.breakdown?.education?.feedback}
              </p>
            </div>
          </div>

          {/* Semantic Similarity Callout */}
          {semanticMatch && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Semantic Conceptual Alignment
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900 font-bold">
                    {semanticMatch.semanticConfidence} Confidence
                  </span>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  {semanticMatch.explanation}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-indigo-700">
                  {semanticMatch.similarityScore}%
                </div>
                <span className="text-[10px] font-semibold text-indigo-500 uppercase">
                  Vector Match
                </span>
              </div>
            </div>
          )}

          {/* Skills Breakdown Pills */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Taxonomy Skills & Domain Terms
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {(scoreResult.breakdown?.skills?.matched || scoreResult.breakdown?.keywords?.matched || []).map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  {s}
                </span>
              ))}
              {(scoreResult.breakdown?.skills?.missing || scoreResult.breakdown?.keywords?.missing || []).map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                  <X className="w-3 h-3 text-rose-500" />
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          {analysisId && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                to={`/history/${analysisId}`}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800 inline-flex items-center gap-1"
              >
                <span>Open Full Analysis & Print Report</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/ai-tools"
                className="text-xs font-semibold text-slate-600 hover:text-brand-600 inline-flex items-center gap-1"
              >
                <span>Optimize Bullets in AI Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* AI Advisor Feedback Card */}
      {aiAdvice && (
        <div className="card space-y-6 shadow-xl border-brand-200/80 p-6 sm:p-8 bg-gradient-to-br from-white via-white to-brand-50/20 animate-fadeIn">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">AI Career Coach Feedback</h3>
                <p className="text-xs text-slate-500">
                  Powered by {aiAdvice.provider}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Zero-Hallucination
            </span>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">Executive Assessment</span>
            {aiAdvice.summary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Strengths */}
            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                <span>Identified Strengths</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {aiAdvice.strengths?.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Targeted Improvements */}
            <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Targeted Improvements</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {(aiAdvice.weaknesses || aiAdvice.improvements || []).map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Bullet Suggestions */}
          {aiAdvice.bulletSuggestions?.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-brand-600" />
                  <span>Action-Driven Bullet Point Suggestions</span>
                </div>
                <Link to="/ai-tools" className="text-xs text-brand-600 hover:underline font-semibold">
                  Open Bullet Rewriter Studio →
                </Link>
              </div>
              <div className="space-y-2">
                {aiAdvice.bulletSuggestions.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 flex items-start gap-3 shadow-xs hover:border-brand-300 transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{bullet}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
