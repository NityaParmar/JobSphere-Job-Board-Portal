import React from 'react';

export const Input = ({
  icon: Icon,
  className = '',
  error = false,
  ...props
}) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-400">
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
      )}
      <input
        className={`w-full bg-white border ${
          error ? 'border-rose-400 focus:ring-rose-500' : 'border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900'
        } rounded-md text-zinc-900 placeholder:text-zinc-400 text-sm transition-colors py-1.5 ${
          Icon ? 'pl-8' : 'pl-3'
        } pr-3 focus:outline-none focus:ring-1 ${className}`}
        {...props}
      />
    </div>
  );
};

export const Select = ({ className = '', children, ...props }) => {
  return (
    <select
      className={`bg-white border border-zinc-200 rounded-md text-zinc-900 text-sm py-1.5 px-2.5 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};
