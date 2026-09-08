import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const formatSalary = (min, max) => {
  if (!min && !max) return 'Competitive';
  const formatK = (val) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };
  return `${formatK(min)} - ${formatK(max)} / yr`;
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const formatEnum = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('-');
};

const JobCard = ({ job, onApplyClick }) => {
  const { user, isCandidate, isJobSaved, toggleSaveJob } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const saved = isJobSaved(job._id);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isCandidate) return;

    try {
      setSaving(true);
      await toggleSaveJob(job._id);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800/80 hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Header: Company & Bookmark */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700/60 flex items-center justify-center text-lg font-bold text-blue-400 shadow-inner group-hover:scale-105 transition-transform">
              {job.company ? job.company[0].toUpperCase() : 'C'}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-400 group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {job.company}
              </h4>
              <Link to={`/jobs/${job._id}`}>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                  {job.title}
                </h3>
              </Link>
            </div>
          </div>

          {/* Bookmark Button */}
          {(!user || isCandidate) && (
            <button
              onClick={handleBookmark}
              disabled={saving}
              title={saved ? 'Remove from saved' : 'Save job'}
              className={`p-2 rounded-xl border transition-all ${
                saved
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {saved ? (
                <BookmarkCheck className="w-4 h-4 fill-amber-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Location & Salary Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/40">
            <MapPin className="w-3.5 h-3.5 text-rose-400 mr-1" />
            {job.location}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 font-medium">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400 mr-0.5" />
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          {job.employmentType && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-950/40 text-blue-300 border border-blue-500/20">
              <Briefcase className="w-3.5 h-3.5 text-blue-400 mr-1" />
              {formatEnum(job.employmentType)}
            </span>
          )}
          {job.experienceLevel && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-950/40 text-purple-300 border border-purple-500/20">
              {formatEnum(job.experienceLevel)}
            </span>
          )}
        </div>

        {/* Short Description */}
        <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Tech Stack Badges */}
        {job.techStack && job.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {job.techStack.slice(0, 5).map((tech, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-800/90 text-slate-300 border border-slate-700/50"
              >
                {tech}
              </span>
            ))}
            {job.techStack.length > 5 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono text-slate-500 bg-slate-800/40">
                +{job.techStack.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-1.5 text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatTimeAgo(job.createdAt)}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/jobs/${job._id}`}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          {isCandidate && onApplyClick && (
            <button
              onClick={() => onApplyClick(job)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Apply</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
