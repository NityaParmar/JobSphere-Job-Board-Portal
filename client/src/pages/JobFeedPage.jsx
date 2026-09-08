import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  Clock,
  Filter,
  X,
  Sparkles,
  Share2,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Building2,
  Check,
  Users,
} from 'lucide-react';
import { jobApi } from '../api/job.api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import ApplyModal from '../components/ApplyModal';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

const POPULAR_TECH = ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'Go', 'MongoDB'];

const formatSalary = (min, max) => {
  if (!min && !max) return 'Competitive';
  const formatK = (val) => (val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`);
  return `${formatK(min)} - ${formatK(max)} / yr`;
};

const formatEnum = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('-');
};

export const JobFeedPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isCandidate, isEmployer, isJobSaved, toggleSaveJob } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Discrete filter inputs
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [minSalary, setMinSalary] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTech, setSelectedTech] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
      };

      if (debouncedQuery.trim()) params.search = debouncedQuery.trim();
      if (minSalary) params.min_salary = minSalary;
      if (selectedType) params.employment_type = selectedType;
      if (selectedTech.length > 0) params.tech_stack = selectedTech.join(',');

      const res = await jobApi.getJobs(params);
      if (res.success && res.data) {
        const fetchedJobs = res.data.jobs || [];
        setJobs(fetchedJobs);
        setTotalPages(res.data.pagination?.pages || res.data.pagination?.totalPages || 1);
        setTotalJobs(res.data.pagination?.total ?? res.data.pagination?.totalJobs ?? 0);

        // Auto-select first job if none selected or selected not in list
        if (fetchedJobs.length > 0) {
          const currentId = searchParams.get('jobId');
          const matched = fetchedJobs.find((j) => j._id === currentId);
          setSelectedJob(matched || fetchedJobs[0]);
        } else {
          setSelectedJob(null);
        }
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, debouncedQuery, minSalary, selectedType, selectedTech]);

  const toggleTech = (tech) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setMinSalary('');
    setSelectedType('');
    setSelectedTech([]);
    setPage(1);
  };

  const hasActiveFilters =
    debouncedQuery || minSalary || selectedType || selectedTech.length > 0;

  const isSaved = selectedJob ? isJobSaved(selectedJob._id) : false;

  const isOwner =
    user &&
    selectedJob?.postedBy &&
    (typeof selectedJob.postedBy === 'object'
      ? selectedJob.postedBy._id === user._id || selectedJob.postedBy._id === user.id
      : selectedJob.postedBy === user._id || selectedJob.postedBy === user.id);

  const handleShare = () => {
    if (!selectedJob) return;
    navigator.clipboard.writeText(`${window.location.origin}/jobs/${selectedJob._id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col bg-zinc-50">
      {/* 1. Inline Compact Filter Row */}
      <section className="bg-white border-b border-zinc-200 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="flex-1 min-w-[220px]">
              <Input
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job title, skills, or company..."
              />
            </div>

            {/* Min Salary Dropdown */}
            <Select
              value={minSalary}
              onChange={(e) => {
                setMinSalary(e.target.value);
                setPage(1);
              }}
              className="text-xs"
            >
              <option value="">Any Salary</option>
              <option value="50000">$50,000+ / yr</option>
              <option value="80000">$80,000+ / yr</option>
              <option value="100000">$100,000+ / yr</option>
              <option value="140000">$140,000+ / yr</option>
              <option value="180000">$180,000+ / yr</option>
            </Select>

            {/* Employment Type */}
            <Select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="text-xs"
            >
              <option value="">All Employment Types</option>
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="FREELANCE">Freelance</option>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-zinc-500 hover:text-zinc-900 text-xs px-2"
              >
                Reset
              </Button>
            )}
          </div>

          {/* Tech Stack Multi-Select Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 pb-1">
            <span className="text-2xs font-medium text-zinc-400 uppercase tracking-wider mr-1">
              Tech Stack:
            </span>
            {POPULAR_TECH.map((tech) => {
              const active = selectedTech.includes(tech);
              return (
                <button
                  key={tech}
                  onClick={() => toggleTech(tech)}
                  className={`px-2 py-0.5 rounded text-2xs font-mono transition-colors border ${
                    active
                      ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {tech}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Two-Pane Split Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row items-start gap-4">
          {/* LEFT PANE: Scrollable List of Job Cards */}
          <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col space-y-2.5">
            {/* Header / Count */}
            <div className="flex items-center justify-between px-1 text-xs text-zinc-500 font-medium">
              <span>{totalJobs} roles found</span>
              <span>Page {page} of {totalPages}</span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-zinc-400 space-y-2">
                <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin mx-auto" />
                <p>Loading positions...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center bg-white border border-zinc-200 rounded-lg space-y-2">
                <p className="text-xs font-semibold text-zinc-800">No positions match your filter</p>
                <p className="text-2xs text-zinc-500">
                  Try broadening your keyword or resetting the minimum salary.
                </p>
                <Button variant="secondary" size="xs" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    isSelected={selectedJob?._id === job._id}
                    onSelect={(j) => setSelectedJob(j)}
                  />
                ))}
              </div>
            )}

            {/* Compact Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-2 flex items-center justify-between border-t border-zinc-200 px-1">
                <Button
                  size="xs"
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  icon={ChevronLeft}
                >
                  Previous
                </Button>

                <span className="text-2xs text-zinc-500 font-mono">
                  {page} / {totalPages}
                </span>

                <Button
                  size="xs"
                  variant="secondary"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRight className="w-3 h-3 ml-1" strokeWidth={1.5} />
                </Button>
              </div>
            )}
          </div>

          {/* RIGHT PANE: Sticky Detail View */}
          <div className="hidden lg:block lg:w-7/12 xl:w-8/12 sticky top-[72px] h-[calc(100vh-90px)] overflow-y-auto bg-white border border-zinc-200 rounded-lg p-6 shadow-2xs">
            {selectedJob ? (
              <div className="space-y-6 text-left">
                {/* Header: Title, Company, Badges, CTAs */}
                <div className="pb-5 border-b border-zinc-100">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                        <span className="font-medium text-zinc-700">{selectedJob.company}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                          {selectedJob.location}
                        </span>
                      </div>
                      <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
                        {selectedJob.title}
                      </h1>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Bookmark button */}
                      {(!user || isCandidate) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={isSaved ? BookmarkCheck : Bookmark}
                          onClick={() => toggleSaveJob(selectedJob._id)}
                        >
                          {isSaved ? 'Saved' : 'Save'}
                        </Button>
                      )}

                      {/* Share button */}
                      <button
                        onClick={handleShare}
                        title="Copy link"
                        className="p-1.5 rounded-md border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                      >
                        <Share2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  {/* Metadata tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-3.5">
                    <span className="text-xs font-mono font-medium text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                      {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}
                    </span>
                    {selectedJob.employmentType && (
                      <span className="text-xs text-zinc-700 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200">
                        {formatEnum(selectedJob.employmentType)}
                      </span>
                    )}
                    {selectedJob.experienceLevel && (
                      <span className="text-xs text-zinc-700 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200">
                        {formatEnum(selectedJob.experienceLevel)} Level
                      </span>
                    )}
                  </div>

                  {/* Primary Apply CTA Bar */}
                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-2xs text-zinc-400">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Posted {new Date(selectedJob.createdAt).toLocaleDateString()}</span>
                      {selectedJob.applicationDeadline && (
                        <span>• Deadline: {new Date(selectedJob.applicationDeadline).toLocaleDateString()}</span>
                      )}
                    </div>

                    {isOwner ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Users}
                          onClick={() => navigate(`/employer/dashboard?jobId=${selectedJob._id}`)}
                        >
                          View Applicants
                        </Button>
                      </div>
                    ) : isCandidate ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setShowApplyModal(true)}
                      >
                        Apply for this Role
                      </Button>
                    ) : !user ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate('/login')}
                      >
                        Sign in to Apply
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Role Overview & Specifications
                  </h3>
                  <div className="text-xs text-zinc-700 leading-relaxed whitespace-pre-line">
                    {selectedJob.description}
                  </div>
                </div>

                {/* Tech Stack Required */}
                {selectedJob.techStack && selectedJob.techStack.length > 0 && (
                  <div className="pt-4 border-t border-zinc-100 space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Required Technologies
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.techStack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-2xs font-mono bg-zinc-50 text-zinc-800 border border-zinc-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                Select a position from the list to view specifications
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {selectedJob && (
        <ApplyModal
          job={selectedJob}
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default JobFeedPage;
