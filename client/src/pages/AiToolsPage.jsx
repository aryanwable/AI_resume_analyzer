import { useState } from 'react';
import {
  Sparkles,
  Edit3,
  FileText,
  Compass,
  ArrowRight,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  Briefcase
} from 'lucide-react';
import { rewriteBulletPoint, generateSummary, recommendRoles } from '../services/aiService.js';

export default function AiToolsPage() {
  const [activeTab, setActiveTab] = useState('bullet'); // 'bullet' | 'summary' | 'roles'

  // Bullet Rewriter State
  const [bulletInput, setBulletInput] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [bulletResult, setBulletResult] = useState(null);
  const [loadingBullet, setLoadingBullet] = useState(false);
  const [bulletError, setBulletError] = useState(null);
  const [copiedBullet, setCopiedBullet] = useState(false);

  // Summary Generator State
  const [resumeTextInput, setResumeTextInput] = useState('');
  const [summaryTargetRole, setSummaryTargetRole] = useState('Senior Full Stack Engineer');
  const [summaryResult, setSummaryResult] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Role Recommender State
  const [roleResumeInput, setRoleResumeInput] = useState('');
  const [rolesResult, setRolesResult] = useState(null);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [rolesError, setRolesError] = useState(null);

  // Sample bullet presets for quick experimentation
  const sampleBullets = [
    'worked on the backend database and wrote queries for the team',
    'created the user login page in react and connected it to api',
    'fixed bugs in our microservice and made the latency faster',
    'responsible for managing docker containers and kubernetes clusters',
  ];

  // Sample resume preset
  const sampleResumeSnippet = `Alex Morgan — Software Engineer
alex.morgan@example.com | github.com/alexmorgan

SKILLS: JavaScript, TypeScript, React, Next.js, Node.js, Express, PostgreSQL, MongoDB, Redis, Docker, AWS, Git, CI/CD.

EXPERIENCE:
Full Stack Developer at Horizon Tech (2022 - Present)
- Developed modern web applications in React and TypeScript with Tailwind CSS.
- Engineered RESTful APIs and backend services with Node.js and PostgreSQL.
- Implemented Docker containerization and automated deployments via GitHub Actions.

EDUCATION: B.S. in Computer Science, State University (2022)`;

  // Handlers
  const handleRewriteBullet = async () => {
    if (!bulletInput.trim()) return;
    setLoadingBullet(true);
    setBulletError(null);
    try {
      const res = await rewriteBulletPoint(bulletInput.trim(), targetRole);
      setBulletResult(res.data);
    } catch (err) {
      setBulletError(err.response?.data?.error?.message || 'Failed to rewrite bullet.');
    } finally {
      setLoadingBullet(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!resumeTextInput.trim()) return;
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const res = await generateSummary(resumeTextInput.trim(), summaryTargetRole);
      setSummaryResult(res.data);
    } catch (err) {
      setSummaryError(err.response?.data?.error?.message || 'Failed to generate summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleRecommendRoles = async () => {
    if (!roleResumeInput.trim()) return;
    setLoadingRoles(true);
    setRolesError(null);
    try {
      const res = await recommendRoles(roleResumeInput.trim());
      setRolesResult(res.data);
    } catch (err) {
      setRolesError(err.response?.data?.error?.message || 'Failed to recommend roles.');
    } finally {
      setLoadingRoles(false);
    }
  };

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-brand-600 mb-1">
          <Sparkles className="w-4 h-4" />
          <span>AI Career Studio</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          AI Resume Optimization Tools
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Enhance individual resume bullets, generate targeted career summaries, and discover high-match job roles with zero-hallucination AI.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('bullet')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 -mb-px ${
            activeTab === 'bullet'
              ? 'border-brand-600 text-brand-600 bg-brand-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Bullet Optimizer</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 -mb-px ${
            activeTab === 'summary'
              ? 'border-brand-600 text-brand-600 bg-brand-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Summary Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 -mb-px ${
            activeTab === 'roles'
              ? 'border-brand-600 text-brand-600 bg-brand-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Role Recommender</span>
        </button>
      </div>

      {/* TAB 1: BULLET OPTIMIZER */}
      {activeTab === 'bullet' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4 shadow-sm border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-600" />
                <span>Optimize Resume Bullet</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Applies Google X-Y-Z formula: [Action Verb] + [Task/Scope] + [Outcome/Tech].
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Target Role Context</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Original Bullet Point</label>
              <textarea
                value={bulletInput}
                onChange={(e) => setBulletInput(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
                placeholder="Paste an existing resume bullet point here..."
              />
            </div>

            {/* Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Try a Sample:</span>
              <div className="flex flex-wrap gap-1.5">
                {sampleBullets.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBulletInput(sample)}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-left truncate max-w-full"
                  >
                    "{sample.slice(0, 35)}..."
                  </button>
                ))}
              </div>
            </div>

            {bulletError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bulletError}</span>
              </div>
            )}

            <button
              onClick={handleRewriteBullet}
              disabled={loadingBullet || !bulletInput.trim()}
              className="btn-primary w-full py-2.5 text-sm justify-center"
            >
              {loadingBullet ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Optimizing with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enhance Bullet Point</span>
                </>
              )}
            </button>
          </div>

          {/* Results Side */}
          <div className="card p-6 space-y-4 shadow-sm border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm">AI Enhanced Output</h3>
                {bulletResult && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    Action-Driven
                  </span>
                )}
              </div>

              {bulletResult ? (
                <div className="space-y-4 pt-4">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Original</span>
                    <p className="text-xs text-slate-600 line-through italic leading-relaxed">
                      "{bulletResult.original}"
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border-2 border-brand-500 space-y-2 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Improved Bullet
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-brand-50 text-brand-700 rounded border border-brand-200">
                        Verb: {bulletResult.actionVerbUsed}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                      {bulletResult.improved}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                      Rationale
                    </span>
                    <p className="text-[11px] leading-relaxed text-emerald-800">
                      {bulletResult.changesMade}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Edit3 className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-xs font-medium">Input a bullet point and click Enhance to preview high-impact revisions.</p>
                </div>
              )}
            </div>

            {bulletResult && (
              <button
                onClick={() => copyToClipboard(bulletResult.improved, setCopiedBullet)}
                className="btn-secondary w-full justify-center text-xs py-2 mt-4"
              >
                {copiedBullet ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBullet ? 'Copied to Clipboard!' : 'Copy Enhanced Bullet'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUMMARY GENERATOR */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4 shadow-sm border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <span>Executive Summary Generator</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Synthesizes verified skills and career highlights into a tailored 3-4 sentence professional summary.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Target Job Title</label>
              <input
                type="text"
                value={summaryTargetRole}
                onChange={(e) => setSummaryTargetRole(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Resume Content / Skills</label>
                <button
                  type="button"
                  onClick={() => setResumeTextInput(sampleResumeSnippet)}
                  className="text-[11px] text-brand-600 hover:underline font-semibold"
                >
                  Load Sample Profile
                </button>
              </div>
              <textarea
                value={resumeTextInput}
                onChange={(e) => setResumeTextInput(e.target.value)}
                rows={6}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none leading-relaxed"
                placeholder="Paste key sections or full text from your resume..."
              />
            </div>

            {summaryError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{summaryError}</span>
              </div>
            )}

            <button
              onClick={handleGenerateSummary}
              disabled={loadingSummary || !resumeTextInput.trim()}
              className="btn-primary w-full py-2.5 text-sm justify-center"
            >
              {loadingSummary ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Summary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Career Summary</span>
                </>
              )}
            </button>
          </div>

          {/* Results Side */}
          <div className="card p-6 space-y-4 shadow-sm border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm">Generated Executive Summary</h3>
                {summaryResult && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 font-semibold border border-brand-200">
                    ATS-Ready
                  </span>
                )}
              </div>

              {summaryResult ? (
                <div className="space-y-4 pt-4">
                  <div className="p-5 rounded-xl bg-white border border-brand-200 shadow-sm space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 block">
                      Profile Statement
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {summaryResult.summary}
                    </p>
                  </div>

                  {summaryResult.keyHighlights?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Key Competency Pillars
                      </span>
                      <div className="space-y-1.5">
                        {summaryResult.keyHighlights.map((highlight, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-xs font-medium">Provide your skills or resume extract to build a tailored summary.</p>
                </div>
              )}
            </div>

            {summaryResult && (
              <button
                onClick={() => copyToClipboard(summaryResult.summary, setCopiedSummary)}
                className="btn-secondary w-full justify-center text-xs py-2 mt-4"
              >
                {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSummary ? 'Summary Copied!' : 'Copy Summary to Clipboard'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ROLE RECOMMENDER */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="card p-6 space-y-4 shadow-sm border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-brand-600" />
                <span>Job Role & Career Path Recommender</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates demonstrated skills, libraries, and frameworks to surface suitable target roles with percentage match scores.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Candidate Resume Text</label>
                <button
                  type="button"
                  onClick={() => setRoleResumeInput(sampleResumeSnippet)}
                  className="text-[11px] text-brand-600 hover:underline font-semibold"
                >
                  Load Sample Profile
                </button>
              </div>
              <textarea
                value={roleResumeInput}
                onChange={(e) => setRoleResumeInput(e.target.value)}
                rows={5}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none leading-relaxed"
                placeholder="Paste candidate resume skills and experience..."
              />
            </div>

            {rolesError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{rolesError}</span>
              </div>
            )}

            <button
              onClick={handleRecommendRoles}
              disabled={loadingRoles || !roleResumeInput.trim()}
              className="btn-primary py-2.5 px-6 text-sm"
            >
              {loadingRoles ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Matching Career Tracks...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Discover Matching Roles</span>
                </>
              )}
            </button>
          </div>

          {/* Results Grid */}
          {rolesResult?.recommendations && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                Recommended Career Roles ({rolesResult.recommendations.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rolesResult.recommendations.map((item, idx) => (
                  <div
                    key={idx}
                    className="card p-5 space-y-3 border-slate-200 hover:border-brand-300 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-brand-600 shrink-0" />
                          <span>{item.role}</span>
                        </h4>
                        <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          {item.matchPercentage}% Fit
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.justification || item.reason}
                      </p>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${item.matchPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
