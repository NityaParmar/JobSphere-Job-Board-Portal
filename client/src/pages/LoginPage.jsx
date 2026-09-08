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

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (from !== '/') {
        navigate(from, { replace: true });
      } else if (user.role === 'EMPLOYER') {
        navigate('/employer/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Invalid email or password.'
      );
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
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 text-left">
      <div className="w-full max-w-sm space-y-5">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-9 h-9 rounded-md bg-zinc-900 text-white flex items-center justify-center mx-auto shadow-2xs">
            <Briefcase className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
            Sign In to JobSphere
          </h1>
          <p className="text-xs text-zinc-500">
            Access your job requisitions, candidate pipeline, or applications.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-2xs p-6">
          {error && (
            <div className="mb-4 p-2.5 rounded bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle
                className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5"
                strokeWidth={1.5}
              />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Email Address
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
                  placeholder="engineer@company.com"
                  className="w-full bg-white border border-zinc-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Password</label>
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
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-zinc-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 font-mono"
                />
              </div>
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
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </div>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-zinc-100 space-y-2">
            <span className="block text-2xs font-mono uppercase text-zinc-500 text-center font-semibold">
              Demo Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoCandidate}
                className="px-2.5 py-1.5 rounded text-2xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors text-center cursor-pointer"
              >
                Candidate Demo
              </button>
              <button
                type="button"
                onClick={handleDemoEmployer}
                className="px-2.5 py-1.5 rounded text-2xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors text-center cursor-pointer"
              >
                Employer Demo
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-500">
          Don&apos;t have an account yet?{' '}
          <Link to="/register" className="text-zinc-900 hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
