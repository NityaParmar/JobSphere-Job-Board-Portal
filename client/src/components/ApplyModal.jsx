import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { applicationApi } from '../api/application.api';
import { Button } from './ui/Button';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ApplyModal = ({ job, isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !job) return null;

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    const isPdf =
      selectedFile.type === 'application/pdf' ||
      selectedFile.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setError('Only PDF documents are supported (.pdf format)');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds the 5MB maximum limit');
      return;
    }

    setFile(selectedFile);
  };

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
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please attach your resume in PDF format before submitting');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('jobId', job._id);
      formData.append('coverLetter', coverLetter);
      formData.append('resume', file);

      await applicationApi.applyToJob(formData);
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-2xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-lg border border-zinc-200 shadow-xl p-6 text-left">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Apply for {job.title}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {job.company} • {job.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Application Transmitted
            </h3>
            <p className="text-xs text-zinc-600 max-w-sm mx-auto">
              Your resume and notes have been securely delivered to the hiring team at{' '}
              <span className="font-medium text-zinc-900">{job.company}</span>.
            </p>
            <div className="pt-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-4 space-y-4">
            {error && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{error}</span>
              </div>
            )}

            {/* Purpose-built drag-and-drop file target */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Resume / CV (PDF only, max 5MB) <span className="text-rose-500">*</span>
              </label>

              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('apply-resume-input').click()}
                  className={`border-2 border-dashed rounded-md p-6 text-center transition-colors cursor-pointer ${
                    dragActive
                      ? 'border-zinc-900 bg-zinc-100/50'
                      : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/50'
                  }`}
                >
                  <input
                    id="apply-resume-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => validateAndSetFile(e.target.files[0])}
                  />
                  <Upload className="w-5 h-5 text-zinc-400 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-xs font-medium text-zinc-800">
                    Click to select file or drag & drop PDF
                  </p>
                  <p className="text-2xs text-zinc-400 mt-1">Strictly .pdf format up to 5MB</p>
                </div>
              ) : (
                /* Validated File State Card */
                <div className="p-3 rounded-md border border-zinc-200 bg-zinc-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded bg-zinc-200/70 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-zinc-700" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-900 truncate max-w-[280px]">
                        {file.name}
                      </p>
                      <p className="text-2xs text-zinc-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    title="Remove file"
                    className="p-1 rounded text-zinc-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>

            {/* Note to Hiring Team */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Note / Cover Letter (Optional)
              </label>
              <textarea
                rows="3"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Highlight relevant experience, availability, or portfolio links..."
                className="w-full bg-white border border-zinc-200 rounded-md p-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none"
              />
            </div>

            {/* Footer buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={loading || !file}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplyModal;
