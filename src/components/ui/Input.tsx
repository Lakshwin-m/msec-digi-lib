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
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-200 outline-none ${
          error 
            ? 'border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-100' 
            : 'border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600 ml-1">{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-200 outline-none min-h-[120px] ${
          error 
            ? 'border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-100' 
            : 'border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600 ml-1">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  error, 
  options,
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-slate-900 transition-all duration-200 outline-none appearance-none cursor-pointer ${
          error 
            ? 'border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-100' 
            : 'border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50'
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600 ml-1">{error}</p>}
    </div>
  );
};
