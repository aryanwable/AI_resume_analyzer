import { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  HardDrive
} from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function ResumeDropzone({ selectedFile, onFileSelect, onFileRemove }) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const validateAndProcessFile = (file) => {
    setValidationError('');

    if (!file) return;

    // 1. Validate MIME type / extension
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setValidationError('Invalid file type. Please upload a PDF document (.pdf).');
      return;
    }

    // 2. Validate maximum file size (5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(
        `File is too large (${formatFileSize(file.size)}). Maximum supported file size is 5MB.`
      );
      return;
    }

    onFileSelect(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Validation Error Alert */}
      {validationError && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button
            onClick={() => setValidationError('')}
            className="text-rose-500 hover:text-rose-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!selectedFile ? (
        /* Drag and Drop Zone */
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-brand-500 bg-brand-50/60 scale-[1.01] shadow-lg shadow-brand-500/10'
              : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50/70 bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-transform duration-200 ${
                isDragging
                  ? 'bg-brand-600 text-white scale-110'
                  : 'bg-brand-50 border border-brand-200 text-brand-600'
              }`}
            >
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-bold text-slate-800">
                {isDragging ? 'Drop your resume PDF here' : 'Click to browse or drag & drop your resume'}
              </p>
              <p className="text-xs text-slate-500">
                Supported format: PDF only • Maximum file size: 5MB
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="btn-primary text-xs py-2 px-4 pointer-events-none"
              >
                <FileText className="w-4 h-4" />
                <span>Select PDF Resume</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Selected File Preview Card */
        <div className="card border-brand-200 bg-gradient-to-br from-white to-brand-50/30 p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {selectedFile.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                    {formatFileSize(selectedFile.size)}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    PDF Verified
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onFileRemove}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
              title="Remove selected resume"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-brand-100/60">
            <span>Ready for text extraction and scoring engine</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-brand-600 font-semibold hover:underline"
            >
              Replace File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}
