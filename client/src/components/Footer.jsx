import React from 'react';
import { Briefcase, Heart, Shield, Code, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#080c16] text-slate-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">JobSphere</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering engineers and tech innovators to connect with top tier employers worldwide.
            </p>
            <div className="flex items-center space-x-2 text-xs text-blue-400 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack MERN + S3 Portal</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">For Candidates</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-blue-400 transition-colors">Explore Engineering Roles</a></li>
              <li><a href="/candidate/dashboard?tab=applications" className="hover:text-blue-400 transition-colors">Application Tracker</a></li>
              <li><a href="/candidate/dashboard?tab=saved" className="hover:text-blue-400 transition-colors">Saved Job Opportunities</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">For Employers</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/employer/dashboard?action=post" className="hover:text-blue-400 transition-colors">Post Open Positions</a></li>
              <li><a href="/employer/dashboard?tab=posts" className="hover:text-blue-400 transition-colors">Manage Job Listings</a></li>
              <li><a href="/employer/dashboard?tab=applicants" className="hover:text-blue-400 transition-colors">Review Resumes & Status</a></li>
            </ul>
          </div>

          {/* Architecture badges */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">Security & Architecture</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Strict RBAC (Candidate vs Employer)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>MongoDB Weighted Text Indexes</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Private S3 + Pre-Signed Expirations</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JobSphere Inc. All rights reserved.</p>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Built with precision & high reliability</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
