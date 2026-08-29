import { Link } from 'react-router-dom';
import { HelpCircle, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
        <HelpCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600">404 Error</span>
        <h1 className="text-3xl font-extrabold text-slate-900">Page Not Found</h1>
        <p className="text-sm text-slate-600">
          The requested page does not exist or has been moved to another route.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link to="/" className="btn-primary text-sm">
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <button
          onClick={() => window.history.back()}
          className="btn-secondary text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
}
