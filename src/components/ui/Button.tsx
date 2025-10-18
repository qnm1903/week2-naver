import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'odd' | 'even';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-3
    font-semibold rounded-xl
    transition-all duration-300 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  `;

  const variants = {
    primary: `
      gradient-info text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)]
      hover:shadow-[0_8px_32px_rgba(59,130,246,0.4)] hover:-translate-y-0.5
      active:translate-y-0 active:shadow-[0_2px_12px_rgba(59,130,246,0.3)]
      focus-visible:ring-blue-500
    `,
    secondary: `
      bg-transparent border-2 border-white/20 text-white
      hover:border-blue-500/50 hover:bg-blue-500/10
      focus-visible:ring-blue-500
    `,
    tertiary: `
      bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.3)] text-[#F59E0B]
      hover:bg-[rgba(251,191,36,0.15)]
      focus-visible:ring-yellow-500
    `,
    danger: `
      bg-transparent border border-red-500/30 text-red-500
      hover:bg-red-500/10
      focus-visible:ring-red-500
    `,
    odd: `
      gradient-odd text-white shadow-[0_4px_20px_rgba(255,107,157,0.3)]
      hover:brightness-110 hover:scale-102
      focus-visible:ring-pink-500
    `,
    even: `
      gradient-even text-white shadow-[0_4px_20px_rgba(78,205,196,0.3)]
      hover:brightness-110 hover:scale-102
      focus-visible:ring-cyan-500
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="text-xl">{icon}</span>}
      {children}
    </button>
  );
};