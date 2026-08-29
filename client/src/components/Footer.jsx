import { Link } from 'react-router-dom';
import { FileText, Github, Heart, Shield, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900">
                AI Resume Analyzer
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-sm">
              Portfolio-grade AI Career Assistant built with React, Vite, Node.js, Express, MongoDB, and LLM APIs.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://github.com/aryanwable/AI_resume_analyzer"
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-slate-900 transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="w-5 h-5" />
              </a>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <Terminal className="w-3.5 h-3.5" />
                45-Day Autonomous Build
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/" className="hover:text-brand-600 transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-brand-600 transition-colors">
                  Upload Resume
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-brand-600 transition-colors">
                  Analysis History
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture / Stack */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Foundation
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                Deterministic Scoring
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-brand-500" />
                Semantic Embeddings
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                Zero-Hallucination AI
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 AI Resume Analyzer • Built by Aryan Wable</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Computer Engineering Capstone
          </p>
        </div>
      </div>
    </footer>
  );
}
