import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Users,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  Clock,
  Briefcase,
  Layers,
  MapPin,
} from 'lucide-react';
import { jobApi } from '../api/job.api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import ApplicantDrawer from '../components/ApplicantDrawer';
import JobFormModal from '../components/JobFormModal';

export const EmployerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId');
  const actionParam = searchParams.get('action');

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('active'); // 'active' | 'archived'

  // Applicant slide-over drawer state
  const [drawerJob, setDrawerJob] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Job creation/edit modal state
  const [jobModalOpen, setJobModalOpen] = useState(actionParam === 'post');
  const [editingJob, setEditingJob] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobApi.getMyPostedJobs();
      if (res.success && res.data) {
        const fetched = res.data.jobs || [];
        setJobs(fetched);

        if (initialJobId) {
          const target = fetched.find((j) => j._id === initialJobId);
          if (target) {
            setDrawerJob(target);
            setDrawerOpen(true);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load employer jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (actionParam === 'post') {
      setEditingJob(null);
      setJobModalOpen(true);
    }
  }, [actionParam]);

  const handleToggleActive = async (job) => {
    try {
      await jobApi.updateJob(job._id, { isActive: !job.isActive });
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, isActive: !j.isActive } : j))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to permanently delete this job listing?')) {
      return;
    }
    try {
      await jobApi.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      if (drawerJob?._id === jobId) {
        setDrawerOpen(false);
        setDrawerJob(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job.');
    }
  };

  const activeJobs = jobs.filter((j) => j.isActive !== false);
  const archivedJobs = jobs.filter((j) => j.isActive === false);
  const displayedJobs = currentTab === 'active' ? activeJobs : archivedJobs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Employer Management Dashboard
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monitor active requisitions, review incoming applicants, and transition candidate statuses.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditingJob(null);
            setJobModalOpen(true);
          }}
        >
          Post New Role
        </Button>
      </div>

      {/* Tabs: Active Listings vs Archived */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-0.5">
        <button
          onClick={() => setCurrentTab('active')}
          className={`pb-2 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            currentTab === 'active'
              ? 'border-zinc-900 text-zinc-900 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <span>Active Listings</span>
          <span className="px-1.5 py-0.2 rounded-full text-2xs bg-zinc-100 text-zinc-600 font-mono">
            {activeJobs.length}
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('archived')}
          className={`pb-2 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            currentTab === 'archived'
              ? 'border-zinc-900 text-zinc-900 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <span>Archived / Paused</span>
          <span className="px-1.5 py-0.2 rounded-full text-2xs bg-zinc-100 text-zinc-600 font-mono">
            {archivedJobs.length}
          </span>
        </button>
      </div>

      {/* Data Table Layout */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 text-center text-xs text-zinc-400 space-y-2">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin mx-auto" />
            <p>Loading requisitions...</p>
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Briefcase className="w-8 h-8 text-zinc-300 mx-auto" strokeWidth={1.5} />
            <h3 className="text-xs font-semibold text-zinc-800">
              No {currentTab} job listings found
            </h3>
            <p className="text-2xs text-zinc-400 max-w-xs mx-auto">
              {currentTab === 'active'
                ? 'Create a new open role to begin sourcing engineering candidates.'
                : 'Jobs you pause or archive will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/75 text-zinc-500 uppercase text-2xs font-semibold tracking-wider">
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Applicants</th>
                  <th className="py-3 px-4">Date Posted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {displayedJobs.map((job) => (
                  <tr
                    key={job._id}
                    className="hover:bg-zinc-50/75 transition-colors group"
                  >
                    {/* Job Title */}
                    <td className="py-3.5 px-4">
                      <div>
                        <button
                          onClick={() => {
                            setDrawerJob(job);
                            setDrawerOpen(true);
                          }}
                          className="font-semibold text-zinc-900 hover:underline text-left block truncate max-w-md"
                        >
                          {job.title}
                        </button>
                        <div className="flex items-center gap-1.5 text-2xs text-zinc-500 mt-0.5">
                          <span>{job.company}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span className="font-mono">
                            ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {job.isActive !== false ? (
                        <Badge variant="success" size="xs">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="xs">
                          Paused
                        </Badge>
                      )}
                    </td>

                    {/* Applicants Count */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setDrawerJob(job);
                          setDrawerOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-mono text-2xs transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
                        <span>View Candidates</span>
                      </button>
                    </td>

                    {/* Date Posted */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-zinc-500 text-2xs font-mono">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setDrawerJob(job);
                            setDrawerOpen(true);
                          }}
                          icon={Users}
                          title="Open Applicant Drawer"
                        >
                          Applicants
                        </Button>

                        <button
                          onClick={() => {
                            setEditingJob(job);
                            setJobModalOpen(true);
                          }}
                          title="Edit Job"
                          className="p-1.5 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>

                        <button
                          onClick={() => handleToggleActive(job)}
                          title={job.isActive !== false ? 'Pause Job' : 'Reactivate Job'}
                          className="p-1.5 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        >
                          {job.isActive !== false ? (
                            <PauseCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                          ) : (
                            <PlayCircle className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          title="Delete Job"
                          className="p-1.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Applicant Drawer */}
      <ApplicantDrawer
        job={drawerJob}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerJob(null);
        }}
      />

      {/* Post / Edit Job Modal */}
      {jobModalOpen && (
        <JobFormModal
          isOpen={jobModalOpen}
          jobToEdit={editingJob}
          onClose={() => {
            setJobModalOpen(false);
            setEditingJob(null);
          }}
          onSuccess={() => {
            fetchJobs();
          }}
        />
      )}
    </div>
  );
};

export default EmployerDashboard;
