import React from 'react';

export const Badge = ({ children, variant = 'default', className = '', size = 'sm' }) => {
  const variants = {
    default: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
    secondary: 'bg-zinc-200/70 text-zinc-800',
    success: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-700 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-700 border border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-700 border border-sky-500/20',
    outline: 'border border-zinc-200 text-zinc-600 bg-white',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-2xs rounded',
    sm: 'px-2 py-0.5 text-xs rounded',
    md: 'px-2.5 py-1 text-xs rounded-md',
  };

  return (
    <span
      className={`inline-flex items-center font-medium ${sizes[size]} ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge = ({ status, className = '' }) => {
  const configs = {
    PENDING: {
      label: 'Pending Review',
      dot: 'bg-amber-500',
      pill: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    },
    INTERVIEW: {
      label: 'Interview',
      dot: 'bg-sky-500',
      pill: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
    },
    ACCEPTED: {
      label: 'Accepted',
      dot: 'bg-emerald-500',
      pill: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    },
    REJECTED: {
      label: 'Rejected',
      dot: 'bg-rose-500',
      pill: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
    },
  };

  const config = configs[status] || configs.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${config.pill} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

export default Badge;
