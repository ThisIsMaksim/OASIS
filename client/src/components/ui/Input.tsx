import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'ghost';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', type = 'text', ...props }, ref) => {
    const baseClasses = [
      'flex h-11 w-full rounded-xl px-4 py-2 text-sm transition-all duration-200',
      'border backdrop-blur-sm',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    ];

    const variants = {
      default: [
        'bg-black/30 hover:bg-black/40 focus:bg-black/40',
        'border-white/20 hover:border-white/30 focus:border-white/40',
        'text-white placeholder:text-white/40',
        'shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]',
      ],
      ghost: [
        'bg-white/5 hover:bg-white/10 focus:bg-white/10',
        'border-white/10 hover:border-white/20 focus:border-white/30',
        'text-white placeholder:text-white/30',
      ],
    };

    return (
      <input
        type={type}
        className={cn(
          baseClasses,
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };