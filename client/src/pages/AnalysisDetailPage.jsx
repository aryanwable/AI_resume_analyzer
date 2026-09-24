import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAnalysisById, deleteAnalysisById } from '../services/resumeService.js';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Trash2,
  Award,
  BarChart3,
  Layers,
  BookOpen,
  CheckCircle2,
  Check,
  X,
  Sparkles,
  ThumbsUp,
  Lightbulb,
  MessageSquare,
  AlertCircle,
  Copy,
  Printer
} from 'lucide-react';

export default function AnalysisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);
        const res = await getAnalysisById(id);
        setAnalysis(res?.data?.analysis);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load report.');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this analysis report?')) return;
    try {
      await deleteAnalysisById(id);
      navigate('/history');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Delete failed');
    }
  };

  const handleCopySummary = () => {
    if (!analysis) return;
    const textToCopy = `Resume Analysis (${analysis.jobRole || 'Target Role'}): ${analysis.score?.summary}\nTotal Score: ${analysis.score?.totalScore}/100 (Grade ${analysis.score?.grade})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-emerald-700 bg-emerald-100 border-emerald-300';
      case 'B': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'C': return 'text-amber-700 bg-amber-100 border-amber-300';
      default: return 'text-rose-700 bg-rose-100 border-rose-300';
    }
  };

  if (loading) {
    return (
      <div className="card p-16 text-center text-slate-500 space-y-3 max-w-2xl mx-auto">
        <Clock className="w-8 h-8 animate-spin mx-auto text-brand-600" />
        <p className="text-sm font-medium">Loading comprehensive evaluation...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="card p-12 text-center space-y-4 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Analysis Not Available</h2>
        <p className="text-sm text-slate-500">{error || 'Record was not found.'}</p>
        <Link to="/history" className="btn-secondary text-xs inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Archive</span>
        </Link>
      </div>
    );
  }

  const scoreResult = analysis.score;
  const aiAdvice = analysis.aiAdvice;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Return to History"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getGradeColor(scoreResult?.grade)}`}>
                Grade {scoreResult?.grade}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {analysis.jobRole || 'Resume Analysis'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              <span>{analysis.fileName}</span>
              <span>•</span>
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="btn-secondary text-xs py-2 px-3"
            title="Copy analysis summary"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn-secondary text-xs py-2 px-3"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs"
            title="Delete this analysis"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Score Breakdown Card */}
      <div className="card space-y-6 shadow-xl border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-brand-600" />
              <h2 className="text-xl font-bold text-slate-900">Score & Evaluation Breakdown</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">{scoreResult?.summary}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-lg text-lg font-extrabold border ${getGradeColor(scoreResult?.grade)}`}>
              Grade {scoreResult?.grade}
            </span>
            <div className="text-right">
              <div className="text-3xl font-black text-brand-700">{scoreResult?.totalScore}</div>
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
                {scoreResult?.breakdown?.keywords?.score} / {scoreResult?.breakdown?.keywords?.maxScore}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full"
                style={{ width: `${(scoreResult?.breakdown?.keywords?.score / scoreResult?.breakdown?.keywords?.maxScore) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Matched {scoreResult?.breakdown?.keywords?.matched?.length} of {scoreResult?.breakdown?.keywords?.total} key terms
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
                {scoreResult?.breakdown?.sections?.score} / {scoreResult?.breakdown?.sections?.maxScore}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${(scoreResult?.breakdown?.sections?.score / scoreResult?.breakdown?.sections?.maxScore) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {scoreResult?.breakdown?.sections?.found?.length} standard sections detected
            </p>
          </div>

          {/* Depth */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Depth</span>
              </div>
              <span className="text-xs font-bold text-slate-900">
                {scoreResult?.breakdown?.contentDepth?.score} / {scoreResult?.breakdown?.contentDepth?.maxScore}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${(scoreResult?.breakdown?.contentDepth?.score / scoreResult?.breakdown?.contentDepth?.maxScore) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {analysis.metrics?.wordCount || scoreResult?.breakdown?.contentDepth?.wordCount} words
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
                {scoreResult?.breakdown?.readability?.score} / {scoreResult?.breakdown?.readability?.maxScore}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-600 h-full rounded-full"
                style={{ width: `${(scoreResult?.breakdown?.readability?.score / scoreResult?.breakdown?.readability?.maxScore) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Avg sentence {scoreResult?.breakdown?.readability?.avgSentenceLength} words
            </p>
          </div>
        </div>

        {/* Keywords Breakdown Pills */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Matched & Missing Keywords</h4>
          <div className="flex flex-wrap gap-1.5">
            {scoreResult?.breakdown?.keywords?.matched?.map((kw) => (
              <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                {kw}
              </span>
            ))}
            {scoreResult?.breakdown?.keywords?.missing?.map((kw) => (
              <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                <X className="w-3 h-3 text-rose-500" />
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Coach Feedback Card (if recorded) */}
      {aiAdvice && (
        <div className="card space-y-6 shadow-xl border-brand-200/80 p-6 sm:p-8 bg-gradient-to-br from-white via-white to-brand-50/20">
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
              Preserved in History
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">Executive Assessment</span>
            {aiAdvice.summary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

            <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Targeted Improvements</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {aiAdvice.improvements?.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ArrowLeft className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5 rotate-180" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {aiAdvice.bulletSuggestions?.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-brand-600" />
                <span>Recommended Resume Bullet Points</span>
              </div>
              <div className="space-y-2">
                {aiAdvice.bulletSuggestions.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 flex items-start gap-3 shadow-xs"
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

      {/* Target Job Description Section */}
      <div className="card p-6 space-y-3 border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Target Job Description Provided
        </h3>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-60 overflow-y-auto">
          {analysis.jobDescription}
        </div>
      </div>
    </div>
  );
}
