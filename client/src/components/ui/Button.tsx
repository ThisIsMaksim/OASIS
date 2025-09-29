import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
      'disabled:pointer-events-none disabled:opacity-50',
      'backdrop-blur-sm border',
    ];

    const variants = {
      default: [
        'bg-white/15 hover:bg-white/25 active:bg-white/30',
        'border-white/20 hover:border-white/30',
        'text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]',
        'hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)]',
      ],
      secondary: [
        'bg-white/10 hover:bg-white/20 active:bg-white/25',
        'border-white/15 hover:border-white/25',
        'text-white/90 hover:text-white',
        'shadow-[0_2px_8px_rgba(0,0,0,0.15)]',
      ],
      outline: [
        'bg-transparent hover:bg-white/10 active:bg-white/15',
        'border-white/30 hover:border-white/40',
        'text-white/80 hover:text-white',
      ],
      ghost: [
        'bg-transparent hover:bg-white/10 active:bg-white/15',
        'border-transparent',
        'text-white/70 hover:text-white',
      ],
      accent: [
        'bg-indigo-500/15 hover:bg-indigo-500/25 active:bg-indigo-500/30',
        'border-indigo-400/30 hover:border-indigo-300/40',
        'text-white',
        'shadow-[0_4px_16px_rgba(79,70,229,0.35)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.45)]',
      ],
    };

    const sizes = {
      default: 'h-11 px-6 py-2 text-sm',
      sm: 'h-9 px-4 py-1.5 text-xs',
      lg: 'h-12 px-8 py-3 text-base',
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };