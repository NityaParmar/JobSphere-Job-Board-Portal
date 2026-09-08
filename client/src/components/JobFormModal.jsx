import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { jobApi } from '../api/job.api';
import { Button } from './ui/Button';

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

export const JobFormModal = ({ isOpen, onClose, jobToEdit, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    description: '',
    applicationDeadline: '',
    isActive: true,
  });

  const [techStackInput, setTechStackInput] = useState('');
  const [techStack, setTechStack] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        title: jobToEdit.title || '',
        company: jobToEdit.company || '',
        location: jobToEdit.location || '',
        salaryMin: jobToEdit.salaryMin ?? '',
        salaryMax: jobToEdit.salaryMax ?? '',
        employmentType: jobToEdit.employmentType || 'FULL_TIME',
        experienceLevel: jobToEdit.experienceLevel || 'MID',
        description: jobToEdit.description || '',
        applicationDeadline: jobToEdit.applicationDeadline
          ? new Date(jobToEdit.applicationDeadline).toISOString().split('T')[0]
          : '',
        isActive: jobToEdit.isActive !== false,
      });
      setTechStack(jobToEdit.techStack || []);
    } else {
      setFormData({
        title: '',
        company: '',
        location: '',
        salaryMin: '',
        salaryMax: '',
        employmentType: 'FULL_TIME',
        experienceLevel: 'MID',
        description: '',
        applicationDeadline: '',
        isActive: true,
      });
      setTechStack([]);
    }
    setError('');
  }, [jobToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddTech = (e) => {
    e.preventDefault();
    const trimmed = techStackInput.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
      setTechStackInput('');
    }
  };

  const handleRemoveTech = (techToRemove) => {
    setTechStack(techStack.filter((t) => t !== techToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const min = Number(formData.salaryMin);
    const max = Number(formData.salaryMax);

    if (min < 0 || max < 0) {
      setError('Salary values cannot be negative');
      return;
    }

    if (max < min) {
      setError('Maximum salary must be greater than or equal to minimum salary');
      return;
    }

    if (techStack.length === 0) {
      setError('Please add at least one technology stack item');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        salaryMin: min,
        salaryMax: max,
        techStack,
      };

      if (!payload.applicationDeadline) {
        delete payload.applicationDeadline;
      }

      if (jobToEdit) {
        await jobApi.updateJob(jobToEdit._id, payload);
      } else {
        await jobApi.createJob(payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to save job position. Please verify inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-2xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-lg border border-zinc-200 shadow-xl p-6 my-8 max-h-[90vh] overflow-y-auto text-left">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {jobToEdit ? 'Edit Job Requisition' : 'Post New Job Requisition'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Specify role details, compensation bounds, and required stack.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-2.5 rounded bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Role Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Acme Tech"
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Remote (US)"
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full bg-white border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer"
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Experience Level
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full bg-white border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer"
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Minimum Salary ($/yr) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                placeholder="120000"
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 font-mono focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Maximum Salary ($/yr) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                placeholder="160000"
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 font-mono focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>

          {/* Tech Stack Input */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Required Tech Stack <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2 mb-1.5">
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTech(e);
                  }
                }}
                placeholder="Type technology (e.g. React) and press Enter"
                className="flex-1 bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
              <Button size="xs" variant="secondary" onClick={handleAddTech} icon={Plus}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-1 p-2 rounded-md bg-zinc-50 border border-zinc-200 min-h-[32px]">
              {techStack.length === 0 ? (
                <span className="text-2xs text-zinc-400 italic">No technologies added yet</span>
              ) : (
                techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-mono bg-white text-zinc-800 border border-zinc-200"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Description & Specifications <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="5"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline responsibilities, technical expectations, and benefits..."
              className="w-full bg-white border border-zinc-200 rounded-md p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none leading-relaxed"
            />
          </div>

          {/* Deadline & Status Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Application Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) =>
                  setFormData({ ...formData, applicationDeadline: e.target.value })
                }
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer"
              />
            </div>

            <div className="pt-4 sm:pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <span className="text-xs text-zinc-700 font-medium">
                  {formData.isActive ? 'Active (Accepting candidates)' : 'Archived / Paused'}
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={loading}>
              {loading ? 'Saving...' : jobToEdit ? 'Save Changes' : 'Publish Requisition'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobFormModal;
