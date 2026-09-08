import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
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
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!isOpen || !job) return null;

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    if (
      selectedFile.type !== 'application/pdf' &&
      !selectedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setError('Only PDF resumes are accepted (.pdf format).');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('Resume file size exceeds the 5MB limit.');
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
      setError('Please attach your resume in PDF format.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('jobId', job._id);
      formData.append('coverLetter', coverLetter);
      formData.append('resume', file);

      await applicationApi.applyToJob(formData);
      setAppliedSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to submit application. Please verify your file and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-2xs animate-fade-in text-left">
      <div className="relative w-full max-w-lg bg-white rounded-lg border border-zinc-200 shadow-xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {appliedSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-semibold text-zinc-900">
              Application Submitted
            </h3>
            <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
              Your resume and submission for{' '}
              <span className="font-semibold text-zinc-900">{job.title}</span> at{' '}
              <span className="font-semibold text-zinc-900">{job.company}</span> have been
              securely transmitted to the hiring team.
            </p>
            <div className="pt-3">
              <Button variant="primary" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-2xs font-mono font-semibold uppercase text-zinc-500">
                  {job.company}
                </span>
                <span className="text-zinc-300">•</span>
                <span className="text-2xs font-mono text-zinc-500">{job.location}</span>
              </div>
              <h2 className="text-base font-semibold text-zinc-900">
                Apply for {job.title}
              </h2>
              <div className="text-2xs text-zinc-500 flex items-center gap-1 mt-1">
                <Lock className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                <span>Encrypted transmission to private cloud object storage</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-2.5 rounded bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-xs text-rose-700">
                <AlertCircle
                  className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5"
                  strokeWidth={1.5}
                />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="pt-4 space-y-4 text-xs">
              {/* Resume File Dropzone */}
              <div>
                <label className="block font-medium text-zinc-700 mb-1.5">
                  Resume (PDF format, max 5MB) <span className="text-rose-500">*</span>
                </label>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('resume-file-input').click()}
                  className={`border border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer ${
                    dragActive
                      ? 'border-zinc-900 bg-zinc-100'
                      : file
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/50'
                  }`}
                >
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => validateAndSetFile(e.target.files[0])}
                  />

                  {file ? (
                    <div className="flex items-center justify-between text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                          <FileText className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 truncate max-w-xs">
                            {file.name}
                          </p>
                          <p className="text-2xs text-zinc-500 font-mono">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="p-1 text-zinc-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Remove attached file"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Upload className="w-6 h-6 text-zinc-400 mx-auto" strokeWidth={1.5} />
                      <p className="text-xs text-zinc-700">
                        <span className="font-semibold underline">Click to choose PDF</span> or drag and drop
                      </p>
                      <p className="text-2xs text-zinc-400 font-mono">Standard PDF documents up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Candidate Note / Cover Letter (Optional)
                </label>
                <textarea
                  rows="3"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Summarize relevant experience, availability, or links to portfolio/code..."
                  className="w-full bg-white border border-zinc-200 rounded-md p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none leading-relaxed"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={loading || !file}
                >
                  {loading ? 'Transmitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyModal;
