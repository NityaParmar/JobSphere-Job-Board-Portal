import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Bookmark,
  User,
  ExternalLink,
  Clock,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  X,
  MapPin,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { applicationApi } from '../api/application.api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ApplyModal from '../components/ApplyModal';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending Review',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
  INTERVIEW: {
    label: 'Interview Scheduled',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  ACCEPTED: {
    label: 'Offer Accepted',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
  },
  REJECTED: {
    label: 'Application Declined',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
  },
};

const CandidateDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'applications';

  const { user, updateProfile, toggleSaveJob } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [resumeLoadingId, setResumeLoadingId] = useState(null);

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Apply Modal state
  const [applyJobTarget, setApplyJobTarget] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      const res = await applicationApi.getMyApplications();
      if (res.success && res.data) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileBio(user.bio || '');
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleViewResume = async (appId) => {
    try {
      setResumeLoadingId(appId);
      const res = await applicationApi.getResumeUrl(appId);
      if (res.success && res.data && res.data.resumeUrl) {
        window.open(res.data.resumeUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('Could not retrieve pre-signed URL for resume.');
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

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);

    try {
      setProfileSaving(true);
      await updateProfile({
        name: profileName,
        phone: profilePhone,
        bio: profileBio,
        skills,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Candidate Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Candidate Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track submissions, view status decisions, review saved roles, and keep your profile updated.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 p-1 rounded-2xl glass-panel border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setSearchParams({ tab: 'applications' })}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              currentTab === 'applications'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Applications ({applications.length})</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'saved' })}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              currentTab === 'saved'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved ({user?.savedJobs?.length || 0})</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'profile' })}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              currentTab === 'profile'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-8">
        {/* TAB 1: APPLICATIONS */}
        {currentTab === 'applications' && (
          <div>
            {loadingApps ? (
              <LoadingSpinner size="lg" text="Loading application records..." />
            ) : applications.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">No Applications Yet</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  You haven&apos;t submitted applications to any open positions yet. Browse available jobs and apply in one click with your PDF resume.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Explore Open Positions</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const statusInfo = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
                  const job = app.job;

                  return (
                    <div
                      key={app._id}
                      className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.border} ${statusInfo.text}`}
                          >
                            {statusInfo.label}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          {job ? (
                            <Link to={`/jobs/${job._id}`}>
                              <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                                {job.title}
                              </h3>
                            </Link>
                          ) : (
                            <h3 className="text-lg font-bold text-slate-400 italic">
                              Position No Longer Available
                            </h3>
                          )}
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-400" />
                            <span>{job?.company || 'Company'}</span>
                            {job?.location && (
                              <>
                                <span>•</span>
                                <span>{job.location}</span>
                              </>
                            )}
                          </p>
                        </div>

                        {app.coverLetter && (
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 max-w-2xl">
                            <span className="font-semibold text-slate-400 block mb-1">
                              Your Cover Note:
                            </span>
                            <p className="line-clamp-2 italic">{app.coverLetter}</p>
                          </div>
                        )}

                        {app.employerNotes && (
                          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 max-w-2xl">
                            <span className="font-semibold text-blue-400 block mb-1">
                              Employer Feedback:
                            </span>
                            <p>{app.employerNotes}</p>
                          </div>
                        )}
                      </div>

                      {/* Right Action */}
                      <div className="flex items-center space-x-3 self-start md:self-center">
                        <button
                          onClick={() => handleViewResume(app._id)}
                          disabled={resumeLoadingId === app._id}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center space-x-1.5 shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                          <span>
                            {resumeLoadingId === app._id
                              ? 'Fetching URL...'
                              : 'View S3 Resume'}
                          </span>
                        </button>

                        {job && (
                          <Link
                            to={`/jobs/${job._id}`}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                          >
                            Job Details
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED JOBS */}
        {currentTab === 'saved' && (
          <div>
            {!user?.savedJobs || user.savedJobs.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 text-amber-400 flex items-center justify-center mx-auto">
                  <Bookmark className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">No Saved Jobs</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Bookmark roles from the job explorer to save them for later or review them before applying.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Browse Opportunities</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.savedJobs.map((item) => {
                  const job = typeof item === 'object' ? item : null;
                  if (!job) return null;

                  return (
                    <div
                      key={job._id}
                      className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {job.company}
                          </span>
                          <button
                            onClick={() => toggleSaveJob(job._id)}
                            className="text-xs text-rose-400 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                        <Link to={`/jobs/${job._id}`}>
                          <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-2">
                          {job.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-400">
                          ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                        </span>
                        <button
                          onClick={() => setApplyJobTarget(job)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1"
                        >
                          <span>Apply</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE */}
        {currentTab === 'profile' && (
          <div className="max-w-2xl glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-1">Edit Candidate Profile</h2>
            <p className="text-xs text-slate-400 mb-6">
              Employers review your skills and bio during application screening.
            </p>

            {profileSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {profileError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Professional Bio / Summary
                </label>
                <textarea
                  rows="3"
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Passionate engineer specialized in scalable backend architectures..."
                  className="w-full glass-input rounded-xl p-3.5 text-sm resize-none"
                />
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Skills & Technologies
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(e);
                      }
                    }}
                    placeholder="Add skill (e.g. Node.js, GraphQL, Redis)"
                    className="flex-1 glass-input rounded-xl px-3.5 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-900/50 border border-slate-800">
                  {skills.length === 0 ? (
                    <span className="text-xs text-slate-500 italic p-1">No skills added yet.</span>
                  ) : (
                    skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all"
                >
                  {profileSaving ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {applyJobTarget && (
        <ApplyModal
          job={applyJobTarget}
          isOpen={!!applyJobTarget}
          onClose={() => setApplyJobTarget(null)}
          onSuccess={() => {
            fetchApplications();
          }}
        />
      )}
    </div>
  );
};

export default CandidateDashboard;
