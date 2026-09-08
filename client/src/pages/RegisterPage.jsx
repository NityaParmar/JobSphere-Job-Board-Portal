import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, Building, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const RegisterPage = () => {
  const [role, setRole] = useState('CANDIDATE');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name,
        email,
        password,
        role,
        phone,
        bio,
      };

      if (role === 'CANDIDATE' && skillsInput.trim()) {
        payload.skills = skillsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const user = await register(payload);
      if (user.role === 'EMPLOYER') {
        navigate('/employer/dashboard');
      } else {
        navigate('/jobs');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center mx-auto text-white">
            <Briefcase className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
            Create a JobSphere Account
          </h1>
          <p className="text-xs text-zinc-500">
            Join to discover engineering positions or manage your hiring pipeline.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-2xs text-left space-y-4">
          {/* Role selector pill toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-zinc-100 border border-zinc-200 text-xs">
            <button
              type="button"
              onClick={() => setRole('CANDIDATE')}
              className={`py-1.5 rounded font-medium transition-colors flex items-center justify-center gap-1.5 ${
                role === 'CANDIDATE'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <User className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Job Seeker</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('EMPLOYER')}
              className={`py-1.5 rounded font-medium transition-colors flex items-center justify-center gap-1.5 ${
                role === 'EMPLOYER'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Employer</span>
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                {role === 'EMPLOYER' ? 'Company / Recruiter Name' : 'Full Name'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'EMPLOYER' ? 'Stripe Talent' : 'Alex Mercer'}
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {role === 'CANDIDATE' && (
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="React, Node.js, Go"
                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                {role === 'EMPLOYER' ? 'Company Bio' : 'Professional Headline / Bio'}
              </label>
              <textarea
                rows="2"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={
                  role === 'EMPLOYER'
                    ? 'Brief description of company culture and product...'
                    : 'Specialist in backend services and cloud infrastructure...'
                }
                className="w-full bg-white border border-zinc-200 rounded-md p-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Creating...' : `Register as ${role === 'EMPLOYER' ? 'Employer' : 'Candidate'}`}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-zinc-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
