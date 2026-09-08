import React, { useState } from 'react';
import {
  X,
  Upload,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Building2,
  Lock,
} from 'lucide-react';
import { applicationApi } from '../api/application.api';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ApplyModal = ({ job, isOpen, onClose, onSuccess }) => {
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

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
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
      setError('Please upload your resume in PDF format.');
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
        'Failed to submit application. Please check your file and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {appliedSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold text-white">Application Submitted!</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Your application for <span className="text-blue-400 font-semibold">{job.title}</span> at{' '}
              <span className="text-white font-medium">{job.company}</span> has been securely submitted with your resume.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6">
              <span className="inline-flex items-center text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full mb-2">
                <Building2 className="w-3.5 h-3.5 mr-1" />
                {job.company}
              </span>
              <h2 className="text-2xl font-bold text-white">Apply for {job.title}</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                Your resume will be stored in our private encrypted cloud storage.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Resume File Dropzone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Resume (PDF Only — Max 5MB) <span className="text-red-400">*</span>
                </label>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    dragActive
                      ? 'border-blue-500 bg-blue-500/10'
                      : file
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-slate-700 hover:border-slate-500 bg-slate-900/40'
                  }`}
                  onClick={() => document.getElementById('resume-file-input').click()}
                >
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => validateAndSetFile(e.target.files[0])}
                  />

                  {file ? (
                    <div className="flex items-center justify-center space-x-3 text-emerald-400">
                      <FileCheck className="w-8 h-8 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-slate-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5 text-blue-400" />
                      </div>
                      <p className="text-sm text-slate-200">
                        <span className="text-blue-400 font-semibold underline">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">PDF document format only</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Cover Letter / Note to Hiring Team (Optional)
                </label>
                <textarea
                  rows="4"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself and explain why your experience makes you a stellar fit for this role..."
                  className="w-full glass-input rounded-xl p-3.5 text-sm placeholder-slate-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all ${
                    loading || !file
                      ? 'bg-slate-700 opacity-60 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/20'
                  }`}
                >
                  {loading ? 'Submitting Application...' : 'Send Application'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyModal;
