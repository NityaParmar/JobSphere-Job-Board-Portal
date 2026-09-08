import React from 'react';
import { Briefcase, Shield, Code } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-zinc-200 bg-white text-zinc-500 text-xs py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-zinc-900 flex items-center justify-center text-white">
            <Briefcase className="w-3 h-3 text-zinc-100" strokeWidth={1.5} />
          </div>
          <span className="font-semibold text-zinc-900">JobSphere</span>
          <span className="text-zinc-300">•</span>
          <span>Enterprise Career Portal & ATS</span>
        </div>

        <div className="flex items-center gap-6 text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
            <span>Role-Based Access Control</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
            <span>Indexed MongoDB Search</span>
          </span>
          <span>© {new Date().getFullYear()} JobSphere Inc.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
