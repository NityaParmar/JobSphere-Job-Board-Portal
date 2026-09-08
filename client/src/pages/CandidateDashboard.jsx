import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Bookmark,
  User,
  ExternalLink,
  Building2,
  Calendar,
  AlertCircle,
  Plus,
  X,
  MapPin,
  CheckCircle2,
  Briefcase,
  ArrowUpRight,
} from 'lucide-react';
import { applicationApi } from '../api/application.api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/Table';
import LoadingSpinner from '../components/LoadingSpinner';
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
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
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
      setProfileError(
        err.response?.data?.message || err.message || 'Failed to update profile.'
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // Metric counts
  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;
  const interviewCount = applications.filter((a) => a.status === 'INTERVIEW').length;
  const acceptedCount = applications.filter((a) => a.status === 'ACCEPTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
              Candidate Portal
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-2xs text-zinc-500 font-mono">
              {user?.email || 'Authenticated'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
            Application Tracker & Profile
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monitor requisition progression, review recruiter feedback, and maintain your professional qualifications.
          </p>
        </div>

        <Link to="/jobs">
          <Button variant="outline" size="sm" icon={Briefcase}>
            Browse Jobs
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6">
        <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-2xs">
          <span className="text-2xs font-mono uppercase font-semibold text-zinc-500">
            Total Applications
          </span>
          <div className="text-xl font-bold text-zinc-900 font-mono mt-1">
            {applications.length}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-2xs">
          <span className="text-2xs font-mono uppercase font-semibold text-amber-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Under Review
          </span>
          <div className="text-xl font-bold text-zinc-900 font-mono mt-1">
            {pendingCount}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-2xs">
          <span className="text-2xs font-mono uppercase font-semibold text-sky-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Interviews
          </span>
          <div className="text-xl font-bold text-zinc-900 font-mono mt-1">
            {interviewCount}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-2xs">
          <span className="text-2xs font-mono uppercase font-semibold text-emerald-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Offers / Accepted
          </span>
          <div className="text-xl font-bold text-zinc-900 font-mono mt-1">
            {acceptedCount}
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md border border-zinc-200 w-fit mb-6">
        <button
          onClick={() => setSearchParams({ tab: 'applications' })}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            currentTab === 'applications'
              ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Applications ({applications.length})</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'saved' })}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            currentTab === 'saved'
              ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Saved Jobs ({user?.savedJobs?.length || 0})</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'profile' })}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            currentTab === 'profile'
              ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <User className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Candidate Profile</span>
        </button>
      </div>

      {/* TAB 1: APPLICATIONS */}
      {currentTab === 'applications' && (
        <div>
          {loadingApps ? (
            <div className="py-24 text-center">
              <LoadingSpinner size="md" text="Loading application records..." />
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white rounded-lg border border-dashed border-zinc-200">
              <FileText className="w-8 h-8 text-zinc-300 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-zinc-800">No applications submitted yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                Explore engineering opportunities on the job feed and apply directly with your PDF resume.
              </p>
              <Link to="/jobs">
                <Button variant="primary" size="sm">
                  Explore Open Requisitions
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Role & Company</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Resume / Cover</TableHead>
                  <TableHead>Hiring Feedback</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => {
                  const job = app.job;

                  return (
                    <TableRow key={app._id}>
                      {/* Job Title & Company */}
                      <TableCell>
                        <div className="space-y-0.5">
                          {job ? (
                            <Link
                              to={`/jobs/${job._id}`}
                              className="font-semibold text-zinc-900 hover:underline inline-flex items-center gap-1"
                            >
                              <span>{job.title}</span>
                              <ArrowUpRight className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                            </Link>
                          ) : (
                            <span className="text-zinc-500 italic">Requisition Archived</span>
                          )}
                          <div className="text-2xs text-zinc-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                            <span>{job?.company || 'Company'}</span>
                            {job?.location && (
                              <>
                                <span>•</span>
                                <span>{job.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge status={app.status} />
                      </TableCell>

                      {/* Resume link */}
                      <TableCell>
                        <button
                          onClick={() => handleViewResume(app._id)}
                          disabled={resumeLoadingId === app._id}
                          className="inline-flex items-center gap-1 text-2xs font-mono text-zinc-700 hover:text-zinc-900 underline cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                          <span>
                            {resumeLoadingId === app._id ? 'Generating link...' : 'S3 Resume (PDF)'}
                          </span>
                        </button>
                      </TableCell>

                      {/* Notes / Feedback */}
                      <TableCell>
                        {app.employerNotes ? (
                          <div className="text-2xs text-zinc-700 bg-zinc-50 p-1.5 rounded border border-zinc-200 max-w-xs">
                            {app.employerNotes}
                          </div>
                        ) : (
                          <span className="text-2xs text-zinc-400 font-mono italic">
                            No notes yet
                          </span>
                        )}
                      </TableCell>

                      {/* Submitted Date */}
                      <TableCell>
                        <span className="text-2xs font-mono text-zinc-500">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        {job && (
                          <Link to={`/jobs/${job._id}`}>
                            <Button variant="ghost" size="xs">
                              View Post
                            </Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* TAB 2: SAVED JOBS */}
      {currentTab === 'saved' && (
        <div>
          {!user?.savedJobs || user.savedJobs.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white rounded-lg border border-dashed border-zinc-200">
              <Bookmark className="w-8 h-8 text-zinc-300 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-zinc-800">No saved requisitions</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                Bookmark interesting roles from the job explorer to track compensation and submit applications later.
              </p>
              <Link to="/jobs">
                <Button variant="primary" size="sm">
                  Browse Opportunities
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.savedJobs.map((item) => {
                const job = typeof item === 'object' ? item : null;
                if (!job) return null;

                return (
                  <div
                    key={job._id}
                    className="p-5 rounded-lg border border-zinc-200 bg-white shadow-2xs flex flex-col justify-between space-y-4 hover:border-zinc-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-2xs font-mono uppercase font-semibold text-zinc-500">
                          {job.company}
                        </span>
                        <button
                          onClick={() => toggleSaveJob(job._id)}
                          className="text-2xs text-rose-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <Link to={`/jobs/${job._id}`}>
                        <h3 className="text-sm font-semibold text-zinc-900 hover:underline">
                          {job.title}
                        </h3>
                      </Link>

                      <div className="text-2xs text-zinc-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.employmentType?.replace('_', ' ')}</span>
                      </div>

                      <p className="text-xs text-zinc-600 line-clamp-2 mt-2 leading-relaxed">
                        {job.description}
                      </p>

                      {job.techStack && job.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {job.techStack.slice(0, 3).map((tech, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 rounded text-2xs font-mono bg-zinc-100 text-zinc-600 border border-zinc-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-zinc-900">
                        ${Math.round((job.salaryMin || 0) / 1000)}k – $
                        {Math.round((job.salaryMax || 0) / 1000)}k
                      </span>

                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => setApplyJobTarget(job)}
                      >
                        Apply
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
        <div className="max-w-2xl bg-white rounded-lg border border-zinc-200 shadow-2xs p-6">
          <div className="pb-4 border-b border-zinc-100 mb-4">
            <h2 className="text-sm font-semibold text-zinc-900">Candidate Profile</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Screening teams use your profile information and verified skills to evaluate requisitions.
            </p>
          </div>

          {profileSuccess && (
            <div className="mb-4 p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={1.5} />
              <span>Profile updated successfully</span>
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-2.5 rounded bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" strokeWidth={1.5} />
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
              <label className="block font-medium text-zinc-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+1 (555) 012-3456"
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Professional Bio / Summary
              </label>
              <textarea
                rows="3"
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Staff software engineer specialized in distributed systems and cloud infrastructure..."
                className="w-full bg-white border border-zinc-200 rounded-md p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none leading-relaxed"
              />
            </div>

            {/* Skills Tags */}
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
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
                  placeholder="e.g. React, Node.js, Go, Kubernetes"
                  className="flex-1 bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={handleAddSkill}
                  icon={Plus}
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1 p-2 rounded-md bg-zinc-50 border border-zinc-200 min-h-[34px]">
                {skills.length === 0 ? (
                  <span className="text-2xs text-zinc-400 italic">No skills added yet</span>
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
                        className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex justify-end">
              <Button variant="primary" size="sm" type="submit" disabled={profileSaving}>
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
          onSuccess={() => {
            fetchApplications();
          }}
        />
      )}
    </div>
  );
};

export default CandidateDashboard;
