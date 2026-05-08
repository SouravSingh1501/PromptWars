'use client';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export default function Input({ label, icon, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-obsidian-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-500">{icon}</span>
        )}
        <input
          id={inputId}
          className={`
            w-full bg-white/[0.03] border border-white/[0.08] rounded-xl
            px-4 py-2.5 text-sm text-white placeholder:text-obsidian-500
            focus:outline-none focus:border-neon-cyan/40 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)]
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-neon-red/50' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-neon-red">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-obsidian-300">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          w-full bg-white/[0.03] border border-white/[0.08] rounded-xl
          px-4 py-3 text-sm text-white placeholder:text-obsidian-500 resize-none
          focus:outline-none focus:border-neon-cyan/40 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)]
          transition-all duration-200 min-h-[100px]
          ${error ? 'border-neon-red/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-neon-red">{error}</p>}
    </div>
  );
}
