import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Layers,
  Users,
  PlusCircle,
  Briefcase,
  ExternalLink,
  MapPin,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import { jobApi } from '../api/job.api';
import { applicationApi } from '../api/application.api';
import LoadingSpinner from '../components/LoadingSpinner';
import JobFormModal from '../components/JobFormModal';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
  INTERVIEW: {
    label: 'Interview',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  ACCEPTED: {
    label: 'Accepted',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
  },
};

const EmployerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'posts';
  const selectedJobIdParam = searchParams.get('jobId') || '';
  const actionParam = searchParams.get('action');

  const [postedJobs, setPostedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Applicants State
  const [selectedJobId, setSelectedJobId] = useState(selectedJobIdParam);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [resumeLoadingId, setResumeLoadingId] = useState(null);

  // Status Modal/Inline State
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [employerNotes, setEmployerNotes] = useState({});

  // Job Form Modal
  const [showJobModal, setShowJobModal] = useState(actionParam === 'post');
  const [editingJob, setEditingJob] = useState(null);

  const fetchPostedJobs = async () => {
    try {
      setLoadingJobs(true);
      const res = await jobApi.getMyPostedJobs();
      if (res.success && res.data) {
        const jobs = res.data.jobs || [];
        setPostedJobs(jobs);
        if (!selectedJobId && jobs.length > 0) {
          setSelectedJobId(jobs[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load employer jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchPostedJobs();
  }, []);

  useEffect(() => {
    if (selectedJobIdParam) {
      setSelectedJobId(selectedJobIdParam);
    }
  }, [selectedJobIdParam]);

  useEffect(() => {
    if (actionParam === 'post') {
      setShowJobModal(true);
    }
  }, [actionParam]);

  // Fetch applicants when selectedJobId changes or tab is applicants
  const fetchApplicants = async (jobId) => {
    if (!jobId) return;
    try {
      setLoadingApplicants(true);
      const res = await applicationApi.getApplicantsForJob(jobId);
      if (res.success && res.data) {
        setApplicants(res.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
      setApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'applicants' && selectedJobId) {
      fetchApplicants(selectedJobId);
    }
  }, [currentTab, selectedJobId]);

  const handleToggleJobActive = async (job) => {
    try {
      await jobApi.updateJob(job._id, { isActive: !job.isActive });
      setPostedJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, isActive: !j.isActive } : j))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be reversed.')) {
      return;
    }
    try {
      await jobApi.deleteJob(jobId);
      setPostedJobs((prev) => prev.filter((j) => j._id !== jobId));
      if (selectedJobId === jobId) {
        setSelectedJobId('');
        setApplicants([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job.');
    }
  };

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
      alert(
        err.response?.data?.message ||
          'Failed to load resume. In development, valid AWS S3 credentials are required to generate presigned URLs.'
      );
    } finally {
      setResumeLoadingId(null);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      setStatusUpdatingId(appId);
      const notes = employerNotes[appId] || '';
      const res = await applicationApi.updateStatus(appId, newStatus, notes);
      if (res.success && res.data) {
        setApplicants((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus, employerNotes: notes } : a))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const selectedJob = postedJobs.find((j) => j._id === selectedJobId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Employer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Employer Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your company job posts, review candidate resumes securely, and update hiring pipeline status.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            onClick={() => {
              setEditingJob(null);
              setShowJobModal(true);
            }}
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Role</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="pt-6 pb-4">
        <div className="flex items-center space-x-2 p-1 rounded-2xl glass-panel border border-white/10 w-fit">
          <button
            onClick={() => setSearchParams({ tab: 'posts' })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              currentTab === 'posts'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Posted Jobs ({postedJobs.length})</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'applicants', ...(selectedJobId ? { jobId: selectedJobId } : {}) })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              currentTab === 'applicants'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Applicant Pipeline</span>
          </button>
        </div>
      </div>

      {/* TAB 1: POSTED JOBS */}
      {currentTab === 'posts' && (
        <div className="pt-4">
          {loadingJobs ? (
            <LoadingSpinner size="lg" text="Retrieving posted opportunities..." />
          ) : postedJobs.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 text-cyan-400 flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">No Jobs Posted Yet</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Start attracting elite engineers and talent by posting your first role with salary details and tech stack tags.
              </p>
              <button
                onClick={() => {
                  setEditingJob(null);
                  setShowJobModal(true);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all"
              >
                + Post Your First Job
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {postedJobs.map((job) => (
                <div
                  key={job._id}
                  className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                          job.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {job.isActive ? 'Active' : 'Paused'}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Link to={`/jobs/${job._id}`}>
                      <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                        {job.title}
                      </h3>
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {job.location}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">
                        ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} / yr
                      </span>
                      <span>•</span>
                      <span>{job.employmentType}</span>
                    </div>

                    {/* Tech stack */}
                    {job.techStack && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => {
                        setSelectedJobId(job._id);
                        setSearchParams({ tab: 'applicants', jobId: job._id });
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Review Applicants</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingJob(job);
                        setShowJobModal(true);
                      }}
                      className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                      title="Edit Job"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleJobActive(job)}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                      title="Toggle active/paused"
                    >
                      {job.isActive ? 'Pause' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="p-2 rounded-xl text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APPLICANTS PIPELINE */}
      {currentTab === 'applicants' && (
        <div className="pt-4 space-y-6">
          {/* Job Selector Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10">
            <div className="flex items-center space-x-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Filter by Job:
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => {
                  setSelectedJobId(e.target.value);
                  setSearchParams({ tab: 'applicants', jobId: e.target.value });
                }}
                className="glass-input rounded-xl px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white min-w-[220px]"
              >
                {postedJobs.map((j) => (
                  <option key={j._id} value={j._id} className="bg-slate-900 text-white">
                    {j.title} ({j.company})
                  </option>
                ))}
              </select>
            </div>

            {selectedJob && (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Total Candidates:</span>
                <span className="font-bold text-white bg-blue-600/20 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  {applicants.length}
                </span>
              </div>
            )}
          </div>

          {/* Applicants List */}
          {loadingApplicants ? (
            <LoadingSpinner size="lg" text="Loading applicants for selected role..." />
          ) : !selectedJobId ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Please select a job above to view applicants.
            </div>
          ) : applicants.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Applicants Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No candidates have applied to this role yet. Once submitted, their profile and encrypted S3 resume link will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((app) => {
                const candidate = app.candidate || {};
                const statusInfo = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;

                return (
                  <div
                    key={app._id}
                    className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col lg:flex-row lg:items-start justify-between gap-6"
                  >
                    {/* Candidate Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                          {candidate.name ? candidate.name[0] : 'C'}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">{candidate.name || 'Anonymous Candidate'}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-blue-400" />
                              {candidate.email}
                            </span>
                            {candidate.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                {candidate.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {candidate.bio && (
                        <p className="text-xs text-slate-300 italic max-w-2xl bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                          &ldquo;{candidate.bio}&rdquo;
                        </p>
                      )}

                      {/* Candidate Skills */}
                      {candidate.skills && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Cover Letter */}
                      {app.coverLetter && (
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 max-w-2xl">
                          <span className="font-semibold text-slate-400 block mb-1">
                            Cover Letter:
                          </span>
                          <p className="whitespace-pre-line leading-relaxed">{app.coverLetter}</p>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Submitted on {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Status & Resume Controls */}
                    <div className="lg:w-72 space-y-4 pt-4 lg:pt-0 lg:border-l lg:border-white/10 lg:pl-6">
                      {/* View Resume Button */}
                      <div>
                        <button
                          onClick={() => handleViewResume(app._id)}
                          disabled={resumeLoadingId === app._id}
                          className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                          <span>
                            {resumeLoadingId === app._id
                              ? 'Signing S3 URL...'
                              : 'Open S3 Resume (PDF)'}
                          </span>
                        </button>
                        <p className="text-[10px] text-slate-500 text-center mt-1">
                          Private bucket • 15m pre-signed token
                        </p>
                      </div>

                      {/* Status Toggle Buttons */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Applicant Status
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {['PENDING', 'INTERVIEW', 'ACCEPTED', 'REJECTED'].map((st) => (
                            <button
                              key={st}
                              disabled={statusUpdatingId === app._id}
                              onClick={() => handleUpdateStatus(app._id, st)}
                              className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                                app.status === st
                                  ? `${STATUS_CONFIG[st].bg} ${STATUS_CONFIG[st].border} ${STATUS_CONFIG[st].text}`
                                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                              }`}
                            >
                              {STATUS_CONFIG[st].label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Employer Notes */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Notes / Interview Feedback
                        </label>
                        <textarea
                          rows="2"
                          defaultValue={app.employerNotes || ''}
                          onChange={(e) =>
                            setEmployerNotes({ ...employerNotes, [app._id]: e.target.value })
                          }
                          onBlur={(e) => {
                            if (e.target.value !== app.employerNotes) {
                              handleUpdateStatus(app._id, app.status);
                            }
                          }}
                          placeholder="Add candidate notes or feedback..."
                          className="w-full glass-input rounded-xl p-2 text-xs resize-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Post / Edit Job Modal */}
      {showJobModal && (
        <JobFormModal
          isOpen={showJobModal}
          jobToEdit={editingJob}
          onClose={() => {
            setShowJobModal(false);
            setEditingJob(null);
          }}
          onSuccess={() => {
            fetchPostedJobs();
          }}
        />
      )}
    </div>
  );
};

export default EmployerDashboard;
