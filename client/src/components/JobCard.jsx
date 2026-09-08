import React from 'react';
import {
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const formatSalary = (min, max) => {
  if (!min && !max) return 'Competitive';
  const formatK = (val) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };
  return `${formatK(min)} - ${formatK(max)}`;
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1d ago';
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

export const JobCard = ({ job, isSelected = false, onSelect }) => {
  const { user, isCandidate, isJobSaved, toggleSaveJob } = useAuth();
  const saved = isJobSaved(job._id);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!user || !isCandidate) return;
    try {
      await toggleSaveJob(job._id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(job)}
      className={`relative p-4 rounded-lg border transition-colors cursor-pointer select-none text-left ${
        isSelected
          ? 'bg-zinc-100/80 border-zinc-900 shadow-2xs'
          : 'bg-white border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Company & Location Badge */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
            <span className="font-medium text-zinc-700 truncate">{job.company}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-0.5 truncate text-zinc-500">
              <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
              {job.location}
            </span>
          </div>

          {/* Role Title */}
          <h3 className="text-sm font-semibold text-zinc-900 truncate leading-snug">
            {job.title}
          </h3>

          {/* Salary Tag & Employment Info */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-xs font-mono font-medium text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>

            {job.employmentType && (
              <span className="text-2xs text-zinc-600 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200">
                {formatEnum(job.employmentType)}
              </span>
            )}

            {job.experienceLevel && (
              <span className="text-2xs text-zinc-600 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200">
                {formatEnum(job.experienceLevel)}
              </span>
            )}
          </div>

          {/* Tech Stack Chips */}
          {job.techStack && job.techStack.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2.5">
              {job.techStack.slice(0, 4).map((tech, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.2 rounded text-2xs font-mono bg-zinc-50 text-zinc-600 border border-zinc-200"
                >
                  {tech}
                </span>
              ))}
              {job.techStack.length > 4 && (
                <span className="text-2xs text-zinc-400 font-mono">
                  +{job.techStack.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right column: Bookmark & Posted Time */}
        <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
          {(!user || isCandidate) && (
            <button
              onClick={handleBookmark}
              title={saved ? 'Saved' : 'Save job'}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            >
              {saved ? (
                <BookmarkCheck className="w-4 h-4 text-zinc-900 fill-zinc-900" strokeWidth={1.5} />
              ) : (
                <Bookmark className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>
          )}

          <div className="flex items-center gap-1 text-2xs text-zinc-400 mt-auto font-mono">
            <Clock className="w-3 h-3" strokeWidth={1.5} />
            <span>{formatTimeAgo(job.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
