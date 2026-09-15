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
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getAnalysisHistory();
        setHistory(res?.data?.analyses || []);
      } catch {
        // Fallback silently if offline
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

  const topSkillsMatched = totalAnalyses > 0
    ? history[0]?.score?.breakdown?.keywords?.matched?.length || 0
    : null;

  const topGrade = totalAnalyses > 0
    ? history[0]?.score?.grade
    : null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-600 mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>Candidate Analytics</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-600">
            Monitor match scores, analyze keyword alignments, and inspect your resume progression.
          </p>
        </div>

        <Link to="/upload" className="btn-primary">
          <UploadCloud className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Average Match Score</span>
            <Target className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {avgScore !== null ? `${avgScore}%` : '-- %'}
          </div>
          <p className="text-xs text-slate-500">
            {totalAnalyses > 0 ? `Across ${totalAnalyses} evaluations` : 'Ready for first analysis'}
          </p>
        </div>

        <div className="card space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Latest Keywords Matched</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {topSkillsMatched !== null ? `${topSkillsMatched} terms` : '--'}
          </div>
          <p className="text-xs text-slate-500">
            {totalAnalyses > 0 ? 'Extracted from latest JD' : 'Awaiting JD comparison'}
          </p>
        </div>

        <div className="card space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Recent Grade</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {topGrade !== null ? `Grade ${topGrade}` : '--'}
          </div>
          <p className="text-xs text-slate-500">
            {totalAnalyses > 0 ? 'Latest resume rating' : 'Deterministic assessment'}
          </p>
        </div>

        <div className="card space-y-2">
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

      {/* Recent Analyses List */}
      {history.length > 0 ? (
        <div className="card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Evaluations</h3>
            <Link to="/history" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View Full History →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {history.slice(0, 3).map((item) => (
              <div key={item.id || item._id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-900">{item.jobRole || 'Target Role'}</p>
                  <p className="text-xs text-slate-500">{item.fileName} • {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                    Grade {item.score?.grade}
                  </span>
                  <span className="text-sm font-black text-slate-900">{item.score?.totalScore} / 100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Quick Start Card */
        <div className="card bg-gradient-to-br from-white to-brand-50/50 border-brand-200/80 p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Ready to Analyze Your First Resume?
          </h3>
          <p className="text-sm text-slate-600 max-w-xl">
            Upload your resume in PDF format and paste a target job description. The system will extract text, calculate weighted match scores, and produce explainable feedback.
          </p>
          <div className="pt-2">
            <Link to="/upload" className="btn-primary">
              <span>Start Resume Analysis</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
