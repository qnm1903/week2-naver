import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  variant?: 'default' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  active = false,
  variant = 'default',
}) => {
  const baseStyles = `
    rounded-xl p-5
    transition-all duration-300 ease-out
  `;

  const variants = {
    default: `
      bg-gradient-to-br from-[#1C2128] to-[#0F1419]
      border border-white/[0.06]
      shadow-[0_4px_16px_rgba(0,0,0,0.2)]
    `,
    elevated: `
      bg-gradient-to-br from-[#1C2128] to-[#0F1419]
      border border-white/[0.06]
      shadow-[0_8px_32px_rgba(0,0,0,0.3)]
    `,
  };

  const activeStyles = active
    ? 'scale-103 shadow-[0_0_32px_rgba(59,130,246,0.4)] border-blue-500/50'
    : '';

  return (
    <div className={`${baseStyles} ${variants[variant]} ${activeStyles} ${className}`}>
      {children}
    </div>
  );
};
