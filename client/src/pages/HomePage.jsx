import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  DollarSign,
  Filter,
  X,
  Sparkles,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { jobApi } from '../api/job.api';
import JobCard from '../components/JobCard';
import ApplyModal from '../components/ApplyModal';
import LoadingSpinner from '../components/LoadingSpinner';

const POPULAR_TAGS = ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'MongoDB', 'Docker'];
const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
];
const EXPERIENCE_LEVELS = [
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MID', label: 'Mid-level' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'PRINCIPAL', label: 'Principal' },
];

const HomePage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [selectedTech, setSelectedTech] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Apply Modal State
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (minSalary) params.min_salary = minSalary;
      if (selectedTech.length > 0) params.tech_stack = selectedTech.join(',');
      if (selectedType) params.employment_type = selectedType;
      if (selectedLevel) params.experience_level = selectedLevel;

      const res = await jobApi.getJobs(params);
      if (res.success && res.data) {
        setJobs(res.data.jobs || []);
        setTotalPages(res.data.pagination?.pages || res.data.pagination?.totalPages || 1);
        setTotalJobs(res.data.pagination?.total ?? res.data.pagination?.totalJobs ?? 0);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, debouncedSearch, minSalary, selectedTech, selectedType, selectedLevel]);

  const toggleTech = (tech) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setMinSalary('');
    setSelectedTech([]);
    setSelectedType('');
    setSelectedLevel('');
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch || minSalary || selectedTech.length > 0 || selectedType || selectedLevel;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Tech Opportunities with Private S3 Verification</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
          Find Your Next High-Impact <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Engineering Role
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          Discover verified roles across top engineering teams. Search by tech stack, salary range,
          and location with indexed MongoDB performance.
        </p>

        {/* Hero Search Bar */}
        <div className="max-w-3xl mx-auto glass-panel p-2 rounded-2xl border border-white/10 shadow-2xl shadow-blue-500/10 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by job title, location, or keyword (e.g. React, Remote, SF)..."
                className="w-full bg-transparent pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileFilterOpen(true)}
              className="sm:hidden w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters {hasActiveFilters && '• Active'}</span>
            </button>
          </div>
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          <span className="text-xs font-medium text-slate-500 mr-1">Popular Stacks:</span>
          {POPULAR_TAGS.map((tech) => (
            <button
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedTech.includes(tech)
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="glass-panel rounded-2xl p-6 border border-white/10 sticky top-24 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center space-x-2 text-white font-semibold">
                  <Filter className="w-4 h-4 text-blue-400" />
                  <span>Filter Roles</span>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Minimum Salary */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Minimum Salary ($/yr)
                </label>
                <div className="space-y-1.5">
                  {['', '50000', '80000', '100000', '140000', '180000'].map((val) => (
                    <button
                      key={val}
                      onClick={() => {
                        setMinSalary(val);
                        setPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        minSalary === val
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {val === '' ? 'Any Compensation' : `$${Number(val).toLocaleString()}+ / yr`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Employment Type
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setSelectedType('');
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedType === ''
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    All Types
                  </button>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setSelectedType(type.value === selectedType ? '' : type.value);
                        setPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedType === type.value
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Experience Level
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setSelectedLevel('');
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedLevel === ''
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    All Levels
                  </button>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => {
                        setSelectedLevel(level.value === selectedLevel ? '' : level.value);
                        setPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedLevel === level.value
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Job Listings Column */}
          <main className="lg:col-span-3">
            {/* Results Count & Active Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="text-sm text-slate-400">
                Found <span className="font-semibold text-white">{totalJobs}</span> available
                positions
                {debouncedSearch && (
                  <span>
                    {' '}
                    matching &ldquo;<span className="text-blue-400">{debouncedSearch}</span>&rdquo;
                  </span>
                )}
              </div>

              {/* Active Filter Badges */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedType && (
                    <span className="inline-flex items-center text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                      {selectedType}
                      <button onClick={() => setSelectedType('')} className="ml-1.5 hover:text-white">
                        ×
                      </button>
                    </span>
                  )}
                  {selectedLevel && (
                    <span className="inline-flex items-center text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                      {selectedLevel}
                      <button onClick={() => setSelectedLevel('')} className="ml-1.5 hover:text-white">
                        ×
                      </button>
                    </span>
                  )}
                  {minSalary && (
                    <span className="inline-flex items-center text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                      ${Number(minSalary).toLocaleString()}+
                      <button onClick={() => setMinSalary('')} className="ml-1.5 hover:text-white">
                        ×
                      </button>
                    </span>
                  )}
                  {selectedTech.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center text-xs bg-blue-950/60 text-blue-300 px-2.5 py-1 rounded-md border border-blue-500/30 font-mono"
                    >
                      {t}
                      <button onClick={() => toggleTech(t)} className="ml-1.5 hover:text-white">
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-blue-400 hover:underline px-1.5"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Content States */}
            {loading ? (
              <LoadingSpinner size="lg" text="Searching indexed tech opportunities..." />
            ) : jobs.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">No Jobs Found</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  We couldn&apos;t find any roles matching your current search criteria. Try removing some filters or searching for broader terms.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onApplyClick={(j) => setSelectedJobToApply(j)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2.5 rounded-xl glass-panel border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-4 py-2 rounded-xl glass-panel border border-white/10 text-xs font-semibold text-slate-300">
                  Page <span className="text-blue-400">{page}</span> of {totalPages}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2.5 rounded-xl glass-panel border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/70 backdrop-blur-sm lg:hidden">
          <div className="w-80 max-w-[85vw] bg-[#0d1424] h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="font-bold text-white">Filter Roles</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Minimum Salary */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                Min Salary
              </label>
              <div className="space-y-1">
                {['', '50000', '80000', '100000', '140000'].map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setMinSalary(val);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
                      minSalary === val
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {val === '' ? 'Any Compensation' : `$${Number(val).toLocaleString()}+`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {selectedJobToApply && (
        <ApplyModal
          job={selectedJobToApply}
          isOpen={!!selectedJobToApply}
          onClose={() => setSelectedJobToApply(null)}
          onSuccess={() => {
            // Can refresh jobs or trigger toast
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
