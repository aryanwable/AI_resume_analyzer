import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  TrendingUp,
  Target,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function DashboardPage() {
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
            Monitor ATS scores, analyze skill matches, and inspect AI recommendations.
          </p>
        </div>

        <Link to="/upload" className="btn-primary">
          <UploadCloud className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Metrics Placeholder Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Overall Match Score</span>
            <Target className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">-- %</div>
          <p className="text-xs text-slate-500">Ready for resume upload</p>
        </div>

        <div className="card space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Skills Matched</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">-- / --</div>
          <p className="text-xs text-slate-500">Awaiting JD comparison</p>
        </div>

        <div className="card space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>ATS Compatibility</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">-- %</div>
          <p className="text-xs text-slate-500">Formatting & section check</p>
        </div>

        <div className="card space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>AI Bullet Suggestions</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">0</div>
          <p className="text-xs text-slate-500">Suggestions generated</p>
        </div>
      </div>

      {/* Quick Start Card */}
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
    </div>
  );
}
