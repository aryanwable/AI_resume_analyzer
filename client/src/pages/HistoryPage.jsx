import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalysisHistory, deleteAnalysisById } from '../services/resumeService.js';
import {
  History,
  UploadCloud,
  Clock,
  Calendar,
  Trash2,
  ChevronRight,
  FileText,
  Layers,
  Award,
  AlertCircle
} from 'lucide-react';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAnalysisHistory();
      setAnalyses(res?.data?.analyses || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this report from your history?')) {
      return;
    }
    try {
      setDeletingId(id);
      await deleteAnalysisById(id);
      setAnalyses((prev) => prev.filter((item) => item.id !== id && item._id !== id));
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  const getGradeBadge = (grade) => {
    switch (grade) {
      case 'A': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-600 mb-1">
            <History className="w-4 h-4" />
            <span>Analysis Archive</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Analysis History & Reports
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

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="card p-12 text-center text-slate-500 space-y-3">
          <Clock className="w-8 h-8 animate-spin mx-auto text-brand-600" />
          <p className="text-sm font-medium">Retrieving your analysis history...</p>
        </div>
      ) : analyses.length === 0 ? (
        /* Empty State */
        <div className="card text-center py-16 px-6 space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Past Analyses Recorded</h3>
            <p className="text-sm text-slate-500">
              Once you upload and score resumes, your historical reports and score breakdowns will appear here.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/upload" className="btn-primary text-sm inline-flex">
              <Calendar className="w-4 h-4" />
              <span>Perform Your First Analysis</span>
            </Link>
          </div>
        </div>
      ) : (
        /* History Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            <span>{analyses.length} Saved {analyses.length === 1 ? 'Report' : 'Reports'}</span>
            <span>Sorted by Most Recent</span>
          </div>

          <div className="grid gap-4">
            {analyses.map((item) => {
              const recordId = item.id || item._id;
              const dateFormatted = new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={recordId}
                  className="card p-5 sm:p-6 hover:border-brand-300 transition-all shadow-sm hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <Link
                    to={`/history/${recordId}`}
                    className="space-y-2 flex-1 min-w-0 no-underline text-inherit hover:opacity-90 transition-opacity"
                  >
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getGradeBadge(item.score?.grade)}`}>
                        Grade {item.score?.grade}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base truncate">
                        {item.jobRole || 'Resume Analysis'}
                      </h3>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {item.fileName}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      {item.score?.summary}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>{dateFormatted}</span>
                      <span>•</span>
                      <span>{item.metrics?.wordCount || item.score?.breakdown?.contentDepth?.wordCount || 0} words</span>
                      <span>•</span>
                      <span>{item.fileSizeFormatted}</span>
                    </div>
                  </Link>

                  {/* Right Actions & Score */}
                  <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-black text-brand-700">
                        {item.score?.totalScore}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">
                        / 100 PTS
                      </div>
                    </div>

                    <Link
                      to={`/history/${recordId}`}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="View full report"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(recordId)}
                      disabled={deletingId === recordId}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
