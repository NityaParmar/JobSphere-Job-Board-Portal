import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Bookmark,
  User,
  ExternalLink,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { applicationApi } from '../api/application.api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import ApplyModal from '../components/ApplyModal';

export const CandidateDashboard = () => {
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
        alert('Could not generate pre-signed URL for resume.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to retrieve resume.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Candidate Hub
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage your submitted applications, review saved positions, and keep your profile qualifications current.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => (window.location.href = '/jobs')}
        >
          Explore More Roles
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-0.5">
        <button
          onClick={() => setSearchParams({ tab: 'applications' })}
          className={`pb-2 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            currentTab === 'applications'
              ? 'border-zinc-900 text-zinc-900 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
          <span>My Applications</span>
          <span className="px-1.5 py-0.2 rounded-full text-2xs bg-zinc-100 text-zinc-600 font-mono">
            {applications.length}
          </span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'saved' })}
          className={`pb-2 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            currentTab === 'saved'
              ? 'border-zinc-900 text-zinc-900 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
          <span>Saved Jobs</span>
          <span className="px-1.5 py-0.2 rounded-full text-2xs bg-zinc-100 text-zinc-600 font-mono">
            {user?.savedJobs?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'profile' })}
          className={`pb-2 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            currentTab === 'profile'
              ? 'border-zinc-900 text-zinc-900 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <User className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
          <span>Profile & Skills</span>
        </button>
      </div>

      {/* TAB 1: APPLICATIONS */}
      {currentTab === 'applications' && (
        <div className="space-y-3">
          {loadingApps ? (
            <div className="py-20 text-center text-xs text-zinc-400 space-y-2">
              <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin mx-auto" />
              <p>Loading application history...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-zinc-200 bg-white rounded-lg p-8 space-y-2">
              <FileText className="w-8 h-8 text-zinc-300 mx-auto" strokeWidth={1.5} />
              <h3 className="text-xs font-semibold text-zinc-800">No applications submitted yet</h3>
              <p className="text-2xs text-zinc-500 max-w-xs mx-auto">
                Explore open positions and submit your resume in one click.
              </p>
              <div className="pt-2">
                <Button size="xs" variant="primary" onClick={() => (window.location.href = '/jobs')}>
                  Find Jobs
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const job = app.job;
                return (
                  <div
                    key={app._id}
                    className="p-4 rounded-lg border border-zinc-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs hover:border-zinc-300 transition-colors"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={app.status} />
                        <span className="text-2xs text-zinc-400 font-mono">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        {job ? (
                          <Link
                            to={`/jobs?jobId=${job._id}`}
                            className="text-sm font-semibold text-zinc-900 hover:underline block truncate"
                          >
                            {job.title}
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-zinc-500 italic">
                            Position No Longer Listed
                          </span>
                        )}
                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                          <span>{job?.company}</span>
                          {job?.location && (
                            <>
                              <span>•</span>
                              <span>{job.location}</span>
                            </>
                          )}
                        </p>
                      </div>

                      {app.employerNotes && (
                        <div className="p-2 rounded bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 max-w-xl">
                          <span className="font-semibold text-zinc-500 block text-2xs uppercase tracking-wider mb-0.5">
                            Employer Feedback:
                          </span>
                          <p>{app.employerNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                      <Button
                        size="xs"
                        variant="secondary"
                        icon={ExternalLink}
                        disabled={resumeLoadingId === app._id}
                        onClick={() => handleViewResume(app._id)}
                      >
                        {resumeLoadingId === app._id ? 'Opening...' : 'View Resume'}
                      </Button>

                      {job && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => (window.location.href = `/jobs?jobId=${job._id}`)}
                        >
                          View Job
                        </Button>
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
            <div className="py-16 text-center border border-dashed border-zinc-200 bg-white rounded-lg p-8 space-y-2">
              <Bookmark className="w-8 h-8 text-zinc-300 mx-auto" strokeWidth={1.5} />
              <h3 className="text-xs font-semibold text-zinc-800">No saved jobs</h3>
              <p className="text-2xs text-zinc-500 max-w-xs mx-auto">
                Bookmark roles from the job feed to review or apply to later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {user.savedJobs.map((item) => {
                const job = typeof item === 'object' ? item : null;
                if (!job) return null;

                return (
                  <div
                    key={job._id}
                    className="p-4 rounded-lg border border-zinc-200 bg-white flex flex-col justify-between shadow-2xs hover:border-zinc-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs text-zinc-500 font-medium truncate">
                          {job.company}
                        </span>
                        <button
                          onClick={() => toggleSaveJob(job._id)}
                          className="text-2xs text-zinc-400 hover:text-rose-600 transition-colors"
                        >
                          Remove
                        </button>
                      </div>

                      <h4 className="text-sm font-semibold text-zinc-900 line-clamp-1">
                        {job.title}
                      </h4>
                      <p className="text-2xs text-zinc-500 mt-1 line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 mt-3 flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-zinc-800">
                        ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                      </span>
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => setApplyJobTarget(job)}
                      >
                        Apply Now
                      </Button>
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
        <div className="max-w-xl bg-white border border-zinc-200 rounded-lg p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Candidate Profile & Qualifications
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Hiring managers view your headline and skills alongside your uploaded PDF resume.
            </p>
          </div>

          {profileSuccess && (
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
              <span>Profile updated successfully</span>
            </div>
          )}

          {profileError && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600" strokeWidth={1.5} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Headline / Professional Bio
              </label>
              <textarea
                rows="3"
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Brief summary of your specialization and years of experience..."
                className="w-full bg-white border border-zinc-200 rounded-md p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none leading-relaxed"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Technical Skills & Tools
              </label>
              <div className="flex gap-2 mb-1.5">
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
                  placeholder="Type skill (e.g. Node.js) and press Enter"
                  className="flex-1 bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
                <Button size="xs" variant="secondary" onClick={handleAddSkill} icon={Plus}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1 p-2 rounded-md bg-zinc-50 border border-zinc-200 min-h-[32px]">
                {skills.length === 0 ? (
                  <span className="text-2xs text-zinc-400 italic">No skills listed yet</span>
                ) : (
                  skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-mono bg-white text-zinc-800 border border-zinc-200"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-zinc-400 hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm" disabled={profileSaving}>
                {profileSaving ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Apply Modal */}
      {applyJobTarget && (
        <ApplyModal
          job={applyJobTarget}
          isOpen={!!applyJobTarget}
          onClose={() => setApplyJobTarget(null)}
          onSuccess={() => fetchApplications()}
        />
      )}
    </div>
  );
};

export default CandidateDashboard;
