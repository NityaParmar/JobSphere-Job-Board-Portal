import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  Clock,
  ArrowLeft,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Edit,
  Trash2,
  Users,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { jobApi } from '../api/job.api';
import { useAuth } from '../context/AuthContext';
import ApplyModal from '../components/ApplyModal';
import JobFormModal from '../components/JobFormModal';
import LoadingSpinner from '../components/LoadingSpinner';

const formatEnum = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('-');
};

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCandidate, isEmployer, isJobSaved, toggleSaveJob } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await jobApi.getJobById(id);
      if (res.success && res.data) {
        setJob(res.data.job);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve job details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading role details..." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Job Not Found</h2>
        <p className="text-slate-400 text-sm">{error || 'This job listing may have been removed or expired.'}</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Jobs</span>
        </Link>
      </div>
    );
  }

  const isOwner =
    user &&
    job.postedBy &&
    (typeof job.postedBy === 'object'
      ? job.postedBy._id === user._id || job.postedBy._id === user.id
      : job.postedBy === user._id || job.postedBy === user.id);

  const saved = isJobSaved(job._id);

  const handleDeleteJob = async () => {
    if (!window.confirm('Are you certain you want to delete this job listing? This cannot be undone.')) {
      return;
    }
    try {
      setDeleting(true);
      await jobApi.deleteJob(job._id);
      navigate('/employer/dashboard?tab=posts');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job.');
      setDeleting(false);
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listings</span>
        </button>

        <button
          onClick={handleCopyShare}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Main Role Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start space-x-4 sm:space-x-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 border border-white/10 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-blue-500/20 flex-shrink-0">
              {job.company ? job.company[0].toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-semibold text-blue-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {job.company}
                </span>
                {!job.isActive && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Paused
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {job.title}
              </h1>

              {/* Badges Grid */}
              <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs">
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/50">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 mr-1.5" />
                  {job.location}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 font-semibold">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400 mr-0.5" />
                  ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} / yr
                </span>
                {job.employmentType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-950/40 text-blue-300 border border-blue-500/20 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-blue-400 mr-1.5" />
                    {formatEnum(job.employmentType)}
                  </span>
                )}
                {job.experienceLevel && (
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-purple-950/40 text-purple-300 border border-purple-500/20 font-medium">
                    {formatEnum(job.experienceLevel)} Level
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className="flex flex-wrap md:flex-col items-center gap-3">
            {isOwner ? (
              <div className="flex items-center gap-2 w-full">
                <Link
                  to={`/employer/dashboard?tab=applicants&jobId=${job._id}`}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Users className="w-4 h-4" />
                  <span>Applicants</span>
                </Link>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                  title="Edit Job"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteJob}
                  disabled={deleting}
                  className="p-2.5 rounded-xl text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {(!user || isCandidate) && (
                  <button
                    onClick={() => toggleSaveJob(job._id)}
                    className={`p-3 rounded-xl border transition-all ${
                      saved
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                    title={saved ? 'Saved in bookmarks' : 'Bookmark job'}
                  >
                    {saved ? <BookmarkCheck className="w-5 h-5 fill-amber-400" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                )}

                {isCandidate ? (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="flex-1 sm:flex-initial px-8 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Apply for Role</span>
                  </button>
                ) : !user ? (
                  <Link
                    to="/login"
                    className="flex-1 sm:flex-initial px-8 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Sign in to Apply</span>
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Details & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description & Requirements */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
            <h2 className="text-xl font-bold text-white">About the Position</h2>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {job.description}
            </div>

            {/* Tech Stack section */}
            {job.techStack && job.techStack.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Required Technologies & Tools
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-800 text-blue-300 border border-slate-700/60 shadow-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Summary Card */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Position Overview
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Salary Range
                </span>
                <span className="text-white font-semibold">
                  ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  Location
                </span>
                <span className="text-white font-semibold">{job.location}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  Employment Type
                </span>
                <span className="text-white font-semibold">{job.employmentType || 'Full-time'}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Posted Date
                </span>
                <span className="text-white font-semibold">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>

              {job.applicationDeadline && (
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Deadline
                  </span>
                  <span className="text-amber-300 font-semibold">
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Apply CTA on Side */}
            {isCandidate && (
              <div className="pt-4">
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit Resume Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showApplyModal && (
        <ApplyModal
          job={job}
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            fetchJob();
          }}
        />
      )}

      {showEditModal && (
        <JobFormModal
          isOpen={showEditModal}
          jobToEdit={job}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            fetchJob();
          }}
        />
      )}
    </div>
  );
};

export default JobDetailPage;
