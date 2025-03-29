
import React from 'react';
import { cn } from '@/lib/utils';

interface CircularButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const CircularButton = ({ 
  children, 
  onClick, 
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button'
}: CircularButtonProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10',
    lg: 'h-12 w-12 text-lg',
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'bg-transparent hover:bg-secondary text-foreground',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(
        'rounded-full flex items-center justify-center transition-all',
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

export default CircularButton;
