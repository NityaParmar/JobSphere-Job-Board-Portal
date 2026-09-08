import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Mail,
  Phone,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { applicationApi } from '../api/application.api';
import { StatusBadge } from './ui/Badge';
import { Button } from './ui/Button';

export const ApplicantDrawer = ({ job, isOpen, onClose }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resumeLoadingId, setResumeLoadingId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [notes, setNotes] = useState({});

  const fetchApplicants = async () => {
    if (!job) return;
    try {
      setLoading(true);
      const res = await applicationApi.getApplicantsForJob(job._id);
      if (res.success && res.data) {
        setApplicants(res.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && job) {
      fetchApplicants();
    }
  }, [isOpen, job]);

  if (!isOpen || !job) return null;

  const handleViewResume = async (appId) => {
    try {
      setResumeLoadingId(appId);
      const res = await applicationApi.getResumeUrl(appId);
      if (res.success && res.data && res.data.resumeUrl) {
        window.open(res.data.resumeUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('Could not generate pre-signed URL for resume.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to retrieve resume.');
    } finally {
      setResumeLoadingId(null);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      setStatusUpdatingId(appId);
      const employerNotes = notes[appId] ?? '';
      const res = await applicationApi.updateStatus(appId, newStatus, employerNotes);
      if (res.success && res.data) {
        setApplicants((prev) =>
          prev.map((a) =>
            a._id === appId ? { ...a, status: newStatus, employerNotes } : a
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/40 backdrop-blur-2xs animate-fade-in">
      {/* Slide-over panel */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl border-l border-zinc-200 flex flex-col overflow-hidden text-left">
        {/* Drawer Header */}
        <div className="p-5 border-b border-zinc-200 flex items-start justify-between bg-zinc-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xs font-mono uppercase font-semibold text-zinc-500">
                Applicant Pipeline
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-2xs font-mono text-zinc-500">
                {applicants.length} candidate{applicants.length !== 1 ? 's' : ''}
              </span>
            </div>
            <h2 className="text-base font-semibold text-zinc-900 leading-tight">
              {job.title}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {job.company} • {job.location}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Drawer Body: Candidate List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="py-20 text-center text-xs text-zinc-400 space-y-2">
              <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin mx-auto" />
              <p>Loading candidate pipeline...</p>
            </div>
          ) : applicants.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-zinc-200 rounded-lg p-8">
              <User className="w-8 h-8 text-zinc-300 mx-auto mb-2" strokeWidth={1.5} />
              <h3 className="text-xs font-semibold text-zinc-800">No applicants yet</h3>
              <p className="text-2xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Candidates applying for this role will appear here with their resumes and qualifications.
              </p>
            </div>
          ) : (
            applicants.map((app) => {
              const candidate = app.candidate || {};
              const matchingSkills = (candidate.skills || []).filter((s) =>
                (job.techStack || []).some(
                  (req) => req.toLowerCase() === s.toLowerCase()
                )
              );

              return (
                <div
                  key={app._id}
                  className="p-4 rounded-lg border border-zinc-200 bg-white space-y-3 shadow-2xs hover:border-zinc-300 transition-colors"
                >
                  {/* Candidate Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">
                        {candidate.name || 'Anonymous Candidate'}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-0.5">
                        {candidate.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                            {candidate.email}
                          </span>
                        )}
                        {candidate.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                            {candidate.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-2xs text-zinc-400 font-mono">
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Prominent View Resume Button */}
                    <Button
                      variant="primary"
                      size="xs"
                      icon={ExternalLink}
                      disabled={resumeLoadingId === app._id}
                      onClick={() => handleViewResume(app._id)}
                    >
                      {resumeLoadingId === app._id ? 'Opening...' : 'View Resume'}
                    </Button>
                  </div>

                  {/* Matching Tech Skills */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400">
                        Candidate Skills:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.map((skill, i) => {
                          const isMatch = matchingSkills.includes(skill);
                          return (
                            <span
                              key={i}
                              className={`px-1.5 py-0.2 rounded text-2xs font-mono border ${
                                isMatch
                                  ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20 font-semibold'
                                  : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                              }`}
                            >
                              {skill} {isMatch && '✓'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Candidate Bio / Headline */}
                  {candidate.bio && (
                    <p className="text-xs text-zinc-600 bg-zinc-50 p-2 rounded border border-zinc-100 italic">
                      &ldquo;{candidate.bio}&rdquo;
                    </p>
                  )}

                  {/* Cover Letter Note */}
                  {app.coverLetter && (
                    <div className="text-xs text-zinc-700 bg-zinc-50/70 p-2.5 rounded border border-zinc-200/80">
                      <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 block mb-0.5">
                        Candidate Note:
                      </span>
                      <p className="whitespace-pre-line leading-relaxed">{app.coverLetter}</p>
                    </div>
                  )}

                  {/* Status Toggle & Feedback Row */}
                  <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-700">Status:</span>
                      <select
                        value={app.status}
                        disabled={statusUpdatingId === app._id}
                        onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                        className="bg-white border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer"
                      >
                        <option value="PENDING">Pending Review</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                      </select>

                      <StatusBadge status={app.status} />
                    </div>

                    <input
                      type="text"
                      placeholder="Add hiring note..."
                      defaultValue={app.employerNotes || ''}
                      onChange={(e) =>
                        setNotes({ ...notes, [app._id]: e.target.value })
                      }
                      onBlur={(e) => {
                        if (e.target.value !== (app.employerNotes || '')) {
                          handleUpdateStatus(app._id, app.status);
                        }
                      }}
                      className="text-xs bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-zinc-800 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-900 flex-1 max-w-xs"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantDrawer;
