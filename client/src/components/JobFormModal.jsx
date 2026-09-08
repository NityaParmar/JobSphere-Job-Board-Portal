import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle, Briefcase } from 'lucide-react';
import { jobApi } from '../api/job.api';

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

const JobFormModal = ({ isOpen, onClose, jobToEdit, onSuccess }) => {
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
        employmentType: jobToEdit.employmentType || 'Full-time',
        experienceLevel: jobToEdit.experienceLevel || 'Mid',
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
        employmentType: 'Full-time',
        experienceLevel: 'Mid',
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
      setError('Salary values cannot be negative.');
      return;
    }

    if (max < min) {
      setError('Maximum salary must be greater than or equal to minimum salary.');
      return;
    }

    if (techStack.length === 0) {
      setError('Please provide at least one technology in the tech stack.');
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
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to save job posting. Please verify inputs.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {jobToEdit ? 'Edit Job Posting' : 'Post a New Tech Role'}
            </h2>
            <p className="text-xs text-slate-400">
              {jobToEdit
                ? 'Update role requirements and specifications'
                : 'Publish your role across the candidate network with instant text indexing'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Job Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Stripe, OpenAI, Vercel"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Remote or San Francisco, CA"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2.5 text-sm bg-slate-900 text-white"
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="bg-slate-900 text-white">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Experience Level
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2.5 text-sm bg-slate-900 text-white"
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value} className="bg-slate-900 text-white">
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Salary Min ($ USD) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                placeholder="e.g. 90000"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Salary Max ($ USD) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                placeholder="e.g. 140000"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Tech Stack Chips Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tech Stack / Required Technologies <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2 mb-2">
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
                placeholder="e.g. React, Node.js, AWS, TypeScript"
                className="flex-1 glass-input rounded-xl px-3.5 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl bg-slate-900/50 border border-slate-800">
              {techStack.length === 0 ? (
                <span className="text-xs text-slate-500 italic p-1">
                  Add tags like React, MongoDB, Express, Docker...
                </span>
              ) : (
                techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Job Description & Responsibilities <span className="text-red-400">*</span>
            </label>
            <textarea
              rows="5"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline role expectations, requirements, benefits, and tech environment..."
              className="w-full glass-input rounded-xl p-3.5 text-sm resize-none"
            />
          </div>

          {/* Application Deadline & Active state */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Application Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) =>
                  setFormData({ ...formData, applicationDeadline: e.target.value })
                }
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm bg-slate-900 text-white"
              />
            </div>

            <div className="flex items-center space-x-3 pt-4 sm:pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-xs font-semibold text-slate-300">
                  {formData.isActive ? 'Active (Accepting Applicants)' : 'Paused / Inactive'}
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all"
            >
              {loading ? 'Saving...' : jobToEdit ? 'Save Changes' : 'Publish Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobFormModal;
