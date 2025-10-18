import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-400">
          {label}
        </label>
      )}
      <input
        className={`
          bg-[#1C2128] border border-white/10
          px-5 py-4 rounded-lg
          font-mono text-base font-medium text-white
          placeholder:text-gray-500
          transition-all duration-200
          focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
};
