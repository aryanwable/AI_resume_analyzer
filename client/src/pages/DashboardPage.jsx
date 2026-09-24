import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalysisHistory } from '../services/resumeService.js';
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  TrendingUp,
  Target,
  Sparkles,
  ArrowUpRight,
  Award,
  Clock,
  Edit3,
  Compass,
  ChevronRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function DashboardPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getAnalysisHistory();
        setHistory(res?.data?.analyses || []);
      } catch {
        // Graceful fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute live aggregates from history
  const totalAnalyses = history.length;
  const avgScore = totalAnalyses > 0
    ? Math.round(history.reduce((acc, curr) => acc + (curr.score?.totalScore || 0), 0) / totalAnalyses)
    : null;

  const latestKeywordsMatched = totalAnalyses > 0
    ? (history[0]?.score?.breakdown?.keywords?.matched?.length || history[0]?.score?.breakdown?.skills?.matched?.length || 0)
    : null;

  const topGrade = totalAnalyses > 0
    ? history[0]?.score?.grade
    : null;

  // Chart data from chronological history (reversed for trend)
  const chartData = history
    .slice(0, 10)
    .reverse()
    .map((item, idx) => ({
      index: idx + 1,
      name: item.jobRole?.slice(0, 15) || `Report #${idx + 1}`,
      score: item.score?.totalScore || 0,
      grade: item.score?.grade || 'N/A',
      date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-600 mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>Candidate Cockpit</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-600">
            Track resume scores, inspect 6-pillar progression, and access AI career tools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/ai-tools" className="btn-secondary text-sm">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>AI Studio</span>
          </Link>
          <Link to="/upload" className="btn-primary text-sm">
            <UploadCloud className="w-4 h-4" />
            <span>New Analysis</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card space-y-2 p-5 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Average Match Score</span>
            <Target className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {avgScore !== null ? `${avgScore}%` : '-- %'}
          </div>
          <p className="text-xs text-slate-500">
            {totalAnalyses > 0 ? `Across ${totalAnalyses} saved evaluations` : 'Upload a resume to begin'}
          </p>
        </div>

        <div className="card space-y-2 p-5 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Latest Skills Matched</span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {latestKeywordsMatched !== null ? `${latestKeywordsMatched} terms` : '--'}
          </div>
          <p className="text-xs text-slate-500">
            {totalAnalyses > 0 ? 'Extracted from latest report' : 'Awaiting first comparison'}
          </p>
        </div>

        <div className="card space-y-2 p-5 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Recent Rating</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {topGrade !== null ? `Grade ${topGrade}` : '--'}
          </div>
          <p className="text-xs text-slate-500">
            {totalAnalyses > 0 ? 'Latest deterministic grade' : '6-pillar assessment'}
          </p>
        </div>

        <div className="card space-y-2 p-5 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Total Analyses</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {totalAnalyses}
          </div>
          <p className="text-xs text-slate-500">Archived in MongoDB</p>
        </div>
      </div>

      {/* Score Progression Trend Chart */}
      {chartData.length > 1 && (
        <div className="card p-6 space-y-4 shadow-sm border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Match Score Progression</h3>
              <p className="text-xs text-slate-500">Historical performance trends over past evaluations</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-brand-50 text-brand-700 border border-brand-200">
              Latest: {chartData[chartData.length - 1].score}%
            </span>
          </div>

          <div className="w-full h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value) => [`${value}/100 pts`, 'Score']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Studio Feature Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/ai-tools"
          className="card p-5 border-slate-200 hover:border-brand-300 transition-all shadow-sm flex items-start gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
              Bullet Optimizer
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Transform weak resume bullets with executive action verbs.
            </p>
          </div>
        </Link>

        <Link
          to="/ai-tools"
          className="card p-5 border-slate-200 hover:border-brand-300 transition-all shadow-sm flex items-start gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
              Summary Generator
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Craft targeted 3-sentence executive career summaries.
            </p>
          </div>
        </Link>

        <Link
          to="/ai-tools"
          className="card p-5 border-slate-200 hover:border-brand-300 transition-all shadow-sm flex items-start gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
              Career Recommender
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Discover best-fit job tracks based on verified skills.
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Analyses List */}
      {history.length > 0 ? (
        <div className="card p-6 space-y-4 shadow-sm border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Evaluations</h3>
              <p className="text-xs text-slate-500">Your latest scored resumes and match breakdowns</p>
            </div>
            <Link to="/history" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <span>View All History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {history.slice(0, 4).map((item) => {
              const recordId = item.id || item._id;
              return (
                <Link
                  key={recordId}
                  to={`/history/${recordId}`}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors group"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                      {item.jobRole || 'Target Role'}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{item.fileName}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                      Grade {item.score?.grade}
                    </span>
                    <div className="text-right">
                      <span className="text-base font-black text-slate-900">{item.score?.totalScore}</span>
                      <span className="text-[10px] text-slate-400 block -mt-1">/100</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        /* Quick Start Card */
        <div className="card bg-gradient-to-br from-white to-brand-50/50 border-brand-200/80 p-8 space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 mx-auto">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Ready to Analyze Your First Resume?
          </h3>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Upload your resume in PDF format and paste a target job description. The system will extract text, calculate 6-pillar match scores, evaluate semantic overlap, and produce explainable feedback.
          </p>
          <div className="pt-2">
            <Link to="/upload" className="btn-primary inline-flex">
              <span>Start Resume Analysis</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
