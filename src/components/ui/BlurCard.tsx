
import React from 'react';
import { cn } from '@/lib/utils';

interface BlurCardProps {
  children: React.ReactNode;
  className?: string;
}

const BlurCard = ({ children, className }: BlurCardProps) => {
  return (
    <div 
      className={cn(
        "glass-card rounded-2xl p-6 animate-scale-in", 
        className
      )}
    >
      {children}
    </div>
  );
};

export default BlurCard;
