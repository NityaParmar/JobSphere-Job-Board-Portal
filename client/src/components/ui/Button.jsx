import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800 border border-transparent shadow-xs',
    secondary: 'bg-white text-zinc-900 hover:bg-zinc-50 border border-zinc-200 shadow-2xs',
    outline: 'bg-transparent text-zinc-700 hover:bg-zinc-100 border border-zinc-300',
    ghost: 'bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 shadow-xs',
    subtle: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
  };

  const sizes = {
    xs: 'px-2 py-1 text-2xs gap-1',
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-sm gap-2',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />}
      {children}
    </button>
  );
};
