import { Link } from 'react-router-dom';
import {
  Sparkles,
  UploadCloud,
  FileCheck2,
  Cpu,
  BarChart3,
  Search,
  PenTool,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: FileCheck2,
      title: 'PDF Text Extraction',
      description: 'Upload PDF resumes with layout-aware parsing that extracts raw text, structure, sections, and candidate metadata.',
      color: 'text-brand-600 bg-brand-50 border-brand-200',
    },
    {
      icon: Cpu,
      title: 'Deterministic Scoring Engine',
      description: 'Explainable, rule-based scoring (Skills, Keywords, Experience, ATS formatting) rather than arbitrary LLM guesses.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      icon: Search,
      title: 'Semantic JD Matching',
      description: 'High-dimensional vector embeddings and cosine similarity to match candidate achievements with job requirements.',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      icon: PenTool,
      title: 'AI Bullet Rewriter',
      description: 'Transform weak action verbs into high-impact, quantifiable bullet points based strictly on verified candidate data.',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Interactive radar charts, keyword gap analyzers, matched skills breakdowns, and historical score progression.',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      icon: ShieldCheck,
      title: 'Zero-Hallucination AI',
      description: 'Strict JSON response validation ensures AI never fabricates non-existent candidate skills, numbers, or awards.',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold shadow-sm">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Day 4 • Complete Application Shell Operational</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          AI Resume Analyzer & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Career Assistant</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
          Bridge the gap between your resume and target job descriptions. Get explainable ATS compatibility scores, semantic matching insights, and AI-powered bullet point refinement.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link to="/upload" className="btn-primary text-base py-3 px-6 w-full sm:w-auto shadow-md shadow-brand-600/20">
            <UploadCloud className="w-5 h-5" />
            <span>Upload Resume</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link to="/dashboard" className="btn-secondary text-base py-3 px-6 w-full sm:w-auto">
            <BarChart3 className="w-5 h-5 text-slate-500" />
            <span>Explore Dashboard</span>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Engineered for Precision & Explainability
          </h2>
          <p className="text-slate-600 text-sm">
            Full-stack architecture combining deterministic rule engines with modern LLMs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${feature.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
                <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-brand-600">
                  <span>Architecture Component</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Development Status Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white rounded-2xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="badge-primary bg-brand-500/20 text-brand-300 border-brand-500/30">
              Phase 1: Foundation (Day 4 of 45)
            </span>
            <h3 className="text-2xl font-bold">Frontend Shell & Design Tokens Active</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Tailwind CSS, PostCSS, Lucide icons, responsive navigation layout, and React Router multi-page routing are fully configured.
            </p>
          </div>
          <Link
            to="/upload"
            className="btn-primary bg-white hover:bg-slate-100 text-slate-900 font-semibold shadow-lg shadow-black/20"
          >
            <span>Proceed to Upload</span>
            <ArrowRight className="w-4 h-4 text-brand-600" />
          </Link>
        </div>
      </section>
    </div>
  );
}
