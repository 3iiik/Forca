import React from 'react';
import { Download, ArrowRight } from 'lucide-react';

interface DownloadCTAButtonProps {
  href?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showArrow?: boolean;
}

export function DownloadCTAButton({
  href = '/download/',
  label = 'Download Forca free',
  size = 'md',
  className = '',
  showArrow = true,
}: DownloadCTAButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  };

  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center ${sizeClasses[size]} rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-600/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background select-none ${className}`}
    >
      <Download className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      {label}
      {showArrow && (
        <ArrowRight className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4.5 h-4.5' : 'w-4 h-4'} />
      )}
    </a>
  );
}
