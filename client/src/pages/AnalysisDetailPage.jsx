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
  CheckCircle2,
  Check,
  X,
  Sparkles,
  ThumbsUp,
  Lightbulb,
  MessageSquare,
  AlertCircle,
  Copy,
  Printer,
  Cpu,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  FolderGit2,
  Compass,
  ArrowRight
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

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
    const textToCopy = `Resume Analysis (${analysis.jobRole || 'Target Role'}): ${analysis.score?.summary}\nTotal Score: ${analysis.score?.totalScore}/100 (Grade ${analysis.score?.grade})\nSemantic Match: ${analysis.semanticMatch?.similarityScore || 0}%`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
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
  const semanticMatch = analysis.semanticMatch;
  const aiAdvice = analysis.aiAdvice;

  // 6-Pillar Radar Chart Data
  const radarData = [
    { pillar: 'Skills', score: Math.round(((scoreResult?.breakdown?.skills?.score || 0) / 25) * 100), fullMark: 100 },
    { pillar: 'Keywords', score: Math.round(((scoreResult?.breakdown?.keywords?.score || 0) / 20) * 100), fullMark: 100 },
    { pillar: 'Experience', score: Math.round(((scoreResult?.breakdown?.experience?.score || 0) / 20) * 100), fullMark: 100 },
    { pillar: 'Projects', score: Math.round(((scoreResult?.breakdown?.projects?.score || 0) / 15) * 100), fullMark: 100 },
    { pillar: 'ATS Format', score: Math.round(((scoreResult?.breakdown?.ats?.score || 0) / 10) * 100), fullMark: 100 },
    { pillar: 'Education', score: Math.round(((scoreResult?.breakdown?.education?.score || 0) / 10) * 100), fullMark: 100 },
  ];

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
              <span>•</span>
              <span>{analysis.metrics?.wordCount || 0} words</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/ai-tools"
            className="btn-secondary text-xs py-2 px-3"
            title="Open AI Studio"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>AI Studio</span>
          </Link>
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

      {/* Hero Overview: Score + Radar Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Score Card */}
        <div className="card p-6 lg:col-span-2 space-y-6 shadow-md border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900">Overall Match Evaluation</h2>
              </div>
              <span className={`px-3 py-1 rounded-lg text-lg font-extrabold border ${getGradeColor(scoreResult?.grade)}`}>
                Grade {scoreResult?.grade}
              </span>
            </div>

            <div className="py-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-brand-700 tracking-tight">
                  {scoreResult?.totalScore}
                </span>
                <span className="text-sm font-semibold text-slate-400 uppercase">
                  / 100 Points
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                {scoreResult?.summary}
              </p>
            </div>
          </div>

          {/* Semantic Similarity Gauge */}
          {semanticMatch && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Semantic Conceptual Synergy
                </span>
                <span className="text-xs font-black text-indigo-700">
                  {semanticMatch.similarityScore}% Match
                </span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                {semanticMatch.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Right: Radar Chart Visualization */}
        <div className="card p-4 shadow-md border-slate-200 flex flex-col items-center justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            6-Pillar Competency Radar
          </span>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="pillar" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Candidate" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6-Pillar Detailed Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
          Transparent 6-Pillar Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Skills */}
          <div className="card p-5 space-y-3 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Cpu className="w-4 h-4 text-brand-600" />
                <span>Skills Match (25%)</span>
              </div>
              <span className="text-xs font-black text-slate-900">
                {scoreResult?.breakdown?.skills?.score} / 25
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full"
                style={{ width: `${((scoreResult?.breakdown?.skills?.score || 0) / 25) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {scoreResult?.breakdown?.skills?.feedback}
            </p>
          </div>

          {/* 2. Keywords */}
          <div className="card p-5 space-y-3 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Keywords (20%)</span>
              </div>
              <span className="text-xs font-black text-slate-900">
                {scoreResult?.breakdown?.keywords?.score} / 20
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${((scoreResult?.breakdown?.keywords?.score || 0) / 20) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {scoreResult?.breakdown?.keywords?.feedback}
            </p>
          </div>

          {/* 3. Experience */}
          <div className="card p-5 space-y-3 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Experience & Impact (20%)</span>
              </div>
              <span className="text-xs font-black text-slate-900">
                {scoreResult?.breakdown?.experience?.score} / 20
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${((scoreResult?.breakdown?.experience?.score || 0) / 20) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {scoreResult?.breakdown?.experience?.feedback}
            </p>
          </div>

          {/* 4. Projects */}
          <div className="card p-5 space-y-3 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <FolderGit2 className="w-4 h-4 text-cyan-600" />
                <span>Projects (15%)</span>
              </div>
              <span className="text-xs font-black text-slate-900">
                {scoreResult?.breakdown?.projects?.score} / 15
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-600 h-full rounded-full"
                style={{ width: `${((scoreResult?.breakdown?.projects?.score || 0) / 15) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {scoreResult?.breakdown?.projects?.feedback}
            </p>
          </div>

          {/* 5. ATS Layout */}
          <div className="card p-5 space-y-3 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>ATS Parseability (10%)</span>
              </div>
              <span className="text-xs font-black text-slate-900">
                {scoreResult?.breakdown?.ats?.score} / 10
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full"
                style={{ width: `${((scoreResult?.breakdown?.ats?.score || 0) / 10) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {scoreResult?.breakdown?.ats?.feedback}
            </p>
          </div>

          {/* 6. Education */}
          <div className="card p-5 space-y-3 border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span>Education & Certs (10%)</span>
              </div>
              <span className="text-xs font-black text-slate-900">
                {scoreResult?.breakdown?.education?.score} / 10
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full"
                style={{ width: `${((scoreResult?.breakdown?.education?.score || 0) / 10) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {scoreResult?.breakdown?.education?.feedback}
            </p>
          </div>
        </div>
      </div>

      {/* Matched & Missing Skills Pills */}
      <div className="card p-6 space-y-4 border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Taxonomy Skills & Keyword Signals
        </h3>
        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold text-emerald-800 block mb-1.5">
              Matched Competencies:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(scoreResult?.breakdown?.skills?.matched || scoreResult?.breakdown?.keywords?.matched || []).map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-rose-800 block mb-1.5">
              Missing Target Competencies:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(scoreResult?.breakdown?.skills?.missing || scoreResult?.breakdown?.keywords?.missing || []).map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                  <X className="w-3 h-3 text-rose-500" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Coach Feedback & Recommendations */}
      {aiAdvice && (
        <div className="card space-y-6 shadow-xl border-brand-200/80 p-6 sm:p-8 bg-gradient-to-br from-white via-white to-brand-50/20">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">AI Career Coach Synthesis</h3>
                <p className="text-xs text-slate-500">
                  Powered by {aiAdvice.provider}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Preserved Evaluation
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">Executive Summary</span>
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
                <span>Actionable Improvements</span>
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

          {/* Bullet Suggestions */}
          {aiAdvice.bulletSuggestions?.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-brand-600" />
                  <span>Recommended Resume Bullet Points</span>
                </div>
                <Link to="/ai-tools" className="text-xs text-brand-600 hover:underline font-semibold">
                  Open in AI Studio →
                </Link>
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

          {/* Career Path Role Recommendations */}
          {aiAdvice.suggestedRoles?.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>Suggested Alternate Career Tracks</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {aiAdvice.suggestedRoles.map((roleItem, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{roleItem.role}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {roleItem.matchPercentage}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {roleItem.reason}
                    </p>
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
          Target Job Description Reference
        </h3>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-60 overflow-y-auto">
          {analysis.jobDescription}
        </div>
      </div>
    </div>
  );
}
