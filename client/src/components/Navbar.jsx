import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Bookmark,
  FileText,
  Plus,
  LogOut,
  Menu,
  X,
  Building,
  User,
} from 'lucide-react';
import { Button } from './ui/Button';

export const Navbar = () => {
  const { user, isAuthenticated, isEmployer, isCandidate, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/jobs') {
      return location.pathname === '/' || location.pathname === '/jobs';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand and primary links */}
          <div className="flex items-center gap-8">
            <Link to="/jobs" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center text-white">
                <Briefcase className="w-4 h-4 text-zinc-100" strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold tracking-tight text-zinc-900 text-sm">
                  JobSphere
                </span>
                <span className="text-2xs font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  v1.0
                </span>
              </div>
            </Link>

            {/* Role-specific Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/jobs"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive('/jobs') &&
                  !location.pathname.startsWith('/candidate') &&
                  !location.pathname.startsWith('/employer')
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                Find Jobs
              </Link>

              {/* Candidate Specific Links */}
              {isAuthenticated && isCandidate && (
                <>
                  <Link
                    to="/candidate/dashboard?tab=applications"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      location.pathname.startsWith('/candidate') &&
                      (location.search.includes('tab=applications') || !location.search)
                        ? 'bg-zinc-100 text-zinc-900'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
                    <span>My Applications</span>
                  </Link>

                  <Link
                    to="/candidate/dashboard?tab=saved"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      location.pathname.startsWith('/candidate') &&
                      location.search.includes('tab=saved')
                        ? 'bg-zinc-100 text-zinc-900'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
                    <span>Saved Jobs</span>
                  </Link>
                </>
              )}

              {/* Employer Specific Links */}
              {isAuthenticated && isEmployer && (
                <>
                  <Link
                    to="/employer/dashboard"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      location.pathname.startsWith('/employer') &&
                      !location.search.includes('tab=profile') &&
                      !location.search.includes('action=post')
                        ? 'bg-zinc-100 text-zinc-900'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/employer/dashboard?action=post"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      location.pathname.startsWith('/employer') &&
                      location.search.includes('action=post')
                        ? 'bg-zinc-100 text-zinc-900'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
                    <span>Post a Job</span>
                  </Link>

                  <Link
                    to="/employer/dashboard?tab=profile"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      location.pathname.startsWith('/employer') &&
                      location.search.includes('tab=profile')
                        ? 'bg-zinc-100 text-zinc-900'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
                    <span>Company Profile</span>
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Action / Role Session Badge */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isEmployer && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Plus}
                    onClick={() => navigate('/employer/dashboard?action=post')}
                  >
                    Post a Job
                  </Button>
                )}

                {/* Session Role Indicator Badge */}
                <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
                  <span
                    className={`px-2 py-0.5 rounded text-2xs font-mono uppercase font-semibold tracking-wider ${
                      isEmployer
                        ? 'bg-purple-500/10 text-purple-700 border border-purple-200'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    {user.role}
                  </span>

                  <span className="text-xs font-medium text-zinc-700 max-w-[120px] truncate">
                    {user.name}
                  </span>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/register')}
                >
                  Create Account
                </Button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-3 space-y-2">
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-2.5 py-1.5 rounded text-xs font-medium text-zinc-800 hover:bg-zinc-100"
          >
            Find Jobs
          </Link>

          {isAuthenticated ? (
            <>
              {isCandidate && (
                <>
                  <Link
                    to="/candidate/dashboard?tab=applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-2.5 py-1.5 rounded text-xs font-medium text-zinc-800 hover:bg-zinc-100"
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/candidate/dashboard?tab=saved"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-2.5 py-1.5 rounded text-xs font-medium text-zinc-800 hover:bg-zinc-100"
                  >
                    Saved Jobs
                  </Link>
                </>
              )}

              {isEmployer && (
                <>
                  <Link
                    to="/employer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-2.5 py-1.5 rounded text-xs font-medium text-zinc-800 hover:bg-zinc-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/employer/dashboard?action=post"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-2.5 py-1.5 rounded text-xs font-medium text-zinc-900 font-semibold"
                  >
                    + Post a Job
                  </Link>
                  <Link
                    to="/employer/dashboard?tab=profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-2.5 py-1.5 rounded text-xs font-medium text-zinc-800 hover:bg-zinc-100"
                  >
                    Company Profile
                  </Link>
                </>
              )}

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-rose-600"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-zinc-100 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="w-full"
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
