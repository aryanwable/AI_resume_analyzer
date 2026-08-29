import { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phase 3 Foundation Ready</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Upload Resume & Job Description
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Upload your resume PDF (Max 5MB) to prepare for extraction, skill matching, and AI evaluation.
        </p>
      </div>

      {/* Upload Dropzone Container */}
      <div className="card space-y-6">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 ${
            dragActive
              ? 'border-brand-500 bg-brand-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-brand-400 bg-slate-50/50'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-100/80 text-brand-600 flex items-center justify-center shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-800">
                {selectedFile ? selectedFile.name : 'Drag and drop your resume PDF here'}
              </p>
              <p className="text-xs text-slate-500">
                PDF format up to 5MB supported
              </p>
            </div>

            <div>
              <label className="btn-primary cursor-pointer text-sm">
                <span>Browse Local Files</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
        </div>

        {/* Job Description Textarea */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800">
            Target Job Description (Optional for Preview)
          </label>
          <textarea
            rows={5}
            placeholder="Paste target job description, responsibilities, and required qualifications here..."
            className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>PDF parser & scoring engine integrations will activate in Phases 3–5</span>
          </div>
          <button
            type="button"
            disabled={!selectedFile}
            className={`btn-primary ${!selectedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FileText className="w-4 h-4" />
            <span>Analyze Resume</span>
          </button>
        </div>
      </div>
    </div>
  );
}
