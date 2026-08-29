import { Link } from 'react-router-dom';
import { History, UploadCloud, Clock, Calendar } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-600 mb-1">
            <History className="w-4 h-4" />
            <span>Analysis Archive</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Analysis History
          </h1>
          <p className="text-sm text-slate-600">
            Review previous resume scores, matched competencies, and progression trends.
          </p>
        </div>

        <Link to="/upload" className="btn-primary">
          <UploadCloud className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Empty State */}
      <div className="card text-center py-16 px-6 space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">No Past Analyses Recorded</h3>
          <p className="text-sm text-slate-500">
            Once you upload and analyze resumes, your historical reports and score breakdowns will appear here.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/upload" className="btn-secondary text-sm">
            <Calendar className="w-4 h-4" />
            <span>Perform Your First Analysis</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
