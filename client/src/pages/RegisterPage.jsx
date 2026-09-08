import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
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
      setError('Password must be at least 6 characters.');
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
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Registration failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 text-left">
      <div className="w-full max-w-md space-y-5">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-9 h-9 rounded-md bg-zinc-900 text-white flex items-center justify-center mx-auto shadow-2xs">
            <Briefcase className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-zinc-500">
            Join JobSphere to discover roles or recruit top engineering candidates.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-2xs p-6">
          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-zinc-100 border border-zinc-200 mb-5">
            <button
              type="button"
              onClick={() => setRole('CANDIDATE')}
              className={`py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                role === 'CANDIDATE'
                  ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <User className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Job Seeker</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('EMPLOYER')}
              className={`py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                role === 'EMPLOYER'
                  ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Hiring Employer</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2.5 rounded bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle
                className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5"
                strokeWidth={1.5}
              />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                {role === 'EMPLOYER' ? 'Company / Recruiter Name' : 'Full Name'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User
                  className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'EMPLOYER' ? 'Acme Engineering' : 'Alex Mercer'}
                  className="w-full bg-white border border-zinc-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail
                  className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.5}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-white border border-zinc-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.5}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-white border border-zinc-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Phone (Optional)</label>
                <div className="relative">
                  <Phone
                    className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.5}
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full bg-white border border-zinc-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {role === 'CANDIDATE' && (
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">
                    Skills (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="React, Node.js, Go"
                    className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 font-mono"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                {role === 'EMPLOYER' ? 'Company Bio / Overview' : 'Professional Headline'}
              </label>
              <textarea
                rows="2"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={
                  role === 'EMPLOYER'
                    ? 'Brief summary of your company culture and mission...'
                    : 'Full stack developer passionate about distributed systems...'
                }
                className="w-full bg-white border border-zinc-200 rounded-md p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="w-full justify-center"
                disabled={loading}
                icon={ArrowRight}
              >
                {loading
                  ? 'Creating Account...'
                  : `Register as ${role === 'EMPLOYER' ? 'Employer' : 'Candidate'}`}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="text-zinc-900 hover:underline font-semibold">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
