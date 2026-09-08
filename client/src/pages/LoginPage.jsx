import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/jobs';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (from !== '/jobs') {
        navigate(from, { replace: true });
      } else if (user.role === 'EMPLOYER') {
        navigate('/employer/dashboard', { replace: true });
      } else {
        navigate('/jobs', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCandidate = () => {
    setEmail('candidate.demo@jobsphere.dev');
    setPassword('DemoPass123!');
  };

  const handleDemoEmployer = () => {
    setEmail('employer.demo@jobsphere.dev');
    setPassword('DemoPass123!');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center mx-auto text-white">
            <Briefcase className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
            Sign in to JobSphere
          </h1>
          <p className="text-xs text-zinc-500">
            Access your applications or employer hiring pipeline.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-2xs text-left">
          {error && (
            <div className="mb-4 p-2.5 rounded bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-zinc-700">Password</label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </div>
          </form>

          {/* Quick Demo Shortcuts */}
          <div className="mt-5 pt-4 border-t border-zinc-100 space-y-2">
            <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 block text-center">
              Quick Demo Fill
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoCandidate}
                className="px-2.5 py-1.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-2xs font-medium text-zinc-700 transition-colors"
              >
                Candidate Demo
              </button>
              <button
                type="button"
                onClick={handleDemoEmployer}
                className="px-2.5 py-1.5 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-2xs font-medium text-zinc-700 transition-colors"
              >
                Employer Demo
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-zinc-900 hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
