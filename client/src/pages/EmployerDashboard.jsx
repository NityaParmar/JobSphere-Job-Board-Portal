import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Users,
  Eye,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  ExternalLink,
  MapPin,
  Calendar,
  Layers,
  Archive,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { jobApi } from '../api/job.api';
import { applicationApi } from '../api/application.api';
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
import JobFormModal from '../components/JobFormModal';
import ApplicantDrawer from '../components/ApplicantDrawer';

export const EmployerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterTab = searchParams.get('tab') || 'all'; // 'all' | 'active' | 'archived'
  const actionParam = searchParams.get('action');

  const [jobs, setJobs] = useState([]);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Drawers
  const [showJobModal, setShowJobModal] = useState(actionParam === 'post');
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJobForDrawer, setSelectedJobForDrawer] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await jobApi.getMyPostedJobs();
      if (res.success && res.data) {
        const postedJobs = res.data.jobs || [];
        setJobs(postedJobs);

        // Fetch applicant counts for each job concurrently
        const countMap = {};
        await Promise.all(
          postedJobs.map(async (job) => {
            try {
              const appRes = await applicationApi.getApplicantsForJob(job._id);
              if (appRes.success && appRes.data) {
                countMap[job._id] = (appRes.data.applications || []).length;
              }
            } catch (err) {
              countMap[job._id] = 0;
            }
          })
        );
        setApplicantCounts(countMap);
      }
    } catch (err) {
      console.error('Failed to load employer jobs:', err);
      setError(
        err.response?.data?.message || 'Failed to retrieve employer requisitions.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (actionParam === 'post') {
      setEditingJob(null);
      setShowJobModal(true);
    }
  }, [actionParam]);

  const handleToggleJobActive = async (job) => {
    try {
      setActionLoadingId(job._id);
      await jobApi.updateJob(job._id, { isActive: !job.isActive });
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, isActive: !j.isActive } : j))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update requisition status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete this requisition? All candidate records associated with this job will be affected.'
      )
    ) {
      return;
    }
    try {
      setActionLoadingId(jobId);
      await jobApi.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      if (selectedJobForDrawer?._id === jobId) {
        setSelectedJobForDrawer(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete requisition.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered jobs based on tab
  const filteredJobs = jobs.filter((job) => {
    if (filterTab === 'active') return job.isActive;
    if (filterTab === 'archived') return !job.isActive;
    return true;
  });

  const activeCount = jobs.filter((j) => j.isActive).length;
  const archivedCount = jobs.filter((j) => !j.isActive).length;
  const totalApplicants = Object.values(applicantCounts).reduce(
    (acc, val) => acc + (val || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
              Employer Console
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-2xs text-zinc-500 font-mono">Talent Requisition</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
            Job Requisitions & Pipeline
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage open roles, inspect candidate submissions, and update hiring statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingJob(null);
              setShowJobModal(true);
            }}
          >
            Post New Role
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6">
        <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-2xs">
          <span className="text-2xs font-mono uppercase font-semibold text-zinc-500">
            Total Requisitions
          </span>
          <div className="text-xl font-bold text-zinc-900 font-mono mt-1">
            {jobs.length}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-2xs">
          <span className="text-2xs font-mono uppercase font-semibold text-emerald-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active Postings
          </span>
          <div className="text-xl font-bold text-zinc-900 font-mono mt-1">
            {activeCount}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-2xs">
          <span className="text-2xs font-mono uppercase font-semibold text-zinc-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            Archived / Paused
          </span>
          <div className="text-xl font-bold text-zinc-900 font-mono mt-1">
            {archivedCount}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-zinc-200 shadow-2xs">
          <span className="text-2xs font-mono uppercase font-semibold text-zinc-500">
            Total Candidates
          </span>
          <div className="text-xl font-bold text-zinc-900 font-mono mt-1">
            {totalApplicants}
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md border border-zinc-200">
          <button
            onClick={() => setSearchParams({ tab: 'all' })}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              filterTab === 'all'
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Requisitions ({jobs.length})
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'active' })}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              filterTab === 'active'
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'archived' })}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              filterTab === 'archived'
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Archived ({archivedCount})
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" strokeWidth={1.5} />
          <span>{error}</span>
        </div>
      )}

      {/* Content Table / Empty State */}
      {loading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="md" text="Loading enterprise requisitions..." />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="py-16 px-4 text-center bg-white rounded-lg border border-dashed border-zinc-200">
          <Briefcase className="w-8 h-8 text-zinc-300 mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-zinc-800">
            {filterTab === 'all'
              ? 'No requisitions posted yet'
              : `No ${filterTab} requisitions found`}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
            Create a requisition to start sourcing candidates, reviewing resumes, and tracking applicant progress.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingJob(null);
              setShowJobModal(true);
            }}
          >
            Post Your First Role
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>Role Title</TableHead>
              <TableHead>Location & Type</TableHead>
              <TableHead>Compensation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Candidates</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map((job) => {
              const count = applicantCounts[job._id] ?? 0;

              return (
                <TableRow key={job._id}>
                  {/* Title & Tech Stack */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="font-semibold text-zinc-900 hover:underline inline-flex items-center gap-1"
                        >
                          {job.title}
                          <ExternalLink className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                        </Link>
                      </div>
                      <div className="text-2xs text-zinc-500">{job.company}</div>
                      {job.techStack && job.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {job.techStack.slice(0, 3).map((tech, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 rounded text-2xs font-mono bg-zinc-100 text-zinc-600 border border-zinc-200"
                            >
                              {tech}
                            </span>
                          ))}
                          {job.techStack.length > 3 && (
                            <span className="text-2xs font-mono text-zinc-400">
                              +{job.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Location & Type */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-zinc-700">
                        <MapPin className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                        <span>{job.location}</span>
                      </div>
                      <div className="text-2xs text-zinc-500">
                        {job.employmentType?.replace('_', ' ')} • {job.experienceLevel}
                      </div>
                    </div>
                  </TableCell>

                  {/* Compensation */}
                  <TableCell>
                    <div className="font-mono text-xs text-zinc-900 font-medium">
                      ${Math.round((job.salaryMin || 0) / 1000)}k – $
                      {Math.round((job.salaryMax || 0) / 1000)}k
                      <span className="text-2xs text-zinc-400 font-normal"> / yr</span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={job.isActive ? 'success' : 'neutral'}>
                      {job.isActive ? 'Active' : 'Archived'}
                    </Badge>
                  </TableCell>

                  {/* Candidates */}
                  <TableCell>
                    <button
                      onClick={() => setSelectedJobForDrawer(job)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-semibold text-zinc-800 transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-zinc-600" strokeWidth={1.5} />
                      <span>{count} applicant{count !== 1 ? 's' : ''}</span>
                    </button>
                  </TableCell>

                  {/* Posted Date */}
                  <TableCell>
                    <div className="text-2xs font-mono text-zinc-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Users}
                        onClick={() => setSelectedJobForDrawer(job)}
                        title="Review Applicants"
                      >
                        Review
                      </Button>

                      <button
                        onClick={() => {
                          setEditingJob(job);
                          setShowJobModal(true);
                        }}
                        className="p-1.5 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                        title="Edit Requisition"
                      >
                        <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>

                      <button
                        disabled={actionLoadingId === job._id}
                        onClick={() => handleToggleJobActive(job)}
                        className="p-1.5 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                        title={job.isActive ? 'Pause requisition' : 'Activate requisition'}
                      >
                        {job.isActive ? (
                          <PauseCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                        ) : (
                          <PlayCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                        )}
                      </button>

                      <button
                        disabled={actionLoadingId === job._id}
                        onClick={() => handleDeleteJob(job._id)}
                        className="p-1.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Requisition"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
            fetchDashboardData();
          }}
        />
      )}

      {/* Applicant Drawer */}
      {selectedJobForDrawer && (
        <ApplicantDrawer
          job={selectedJobForDrawer}
          isOpen={!!selectedJobForDrawer}
          onClose={() => {
            setSelectedJobForDrawer(null);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};

export default EmployerDashboard;
