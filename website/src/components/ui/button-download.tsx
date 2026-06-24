import React, { useState, useRef, useCallback } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';

type Status = 'idle' | 'downloading' | 'downloaded' | 'complete';

interface DownloadButtonProps {
  href: string;
  label: string;
  className?: string;
}

export function DownloadButton({ href, label, className = '' }: DownloadButtonProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  const triggerDownload = useCallback(() => {
    if (status !== 'idle') return;

    setStatus('downloading');
    setProgress(0);

    const start = performance.now();
    const duration = 2000;

    const animate = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (pct < 100) {
        requestAnimationFrame(animate);
      } else {
        setStatus('downloaded');

        anchorRef.current?.click();

        setTimeout(() => {
          setStatus('complete');
          setTimeout(() => {
            setStatus('idle');
            setProgress(0);
          }, 800);
        }, 1200);
      }
    };

    requestAnimationFrame(animate);
  }, [status]);

  return (
    <div className={`relative w-full ${className}`}>
      <button
        onClick={triggerDownload}
        disabled={status !== 'idle'}
        aria-label={`Download for ${label}`}
        className="relative w-full h-[52px] rounded-xl overflow-hidden select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          className={`absolute inset-0 transition-all duration-500 ${
            status === 'idle'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400'
              : status === 'downloading'
                ? 'bg-emerald-600/50'
                : status === 'downloaded'
                  ? 'bg-green-600'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500'
          }`}
        />

        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {status === 'downloading' && (
          <span
            className="absolute bottom-0 left-0 h-full bg-emerald-500 transition-all duration-200 ease-linear z-[3]"
            style={{ width: `${progress}%` }}
          />
        )}

        <span className="relative z-10 flex items-center justify-center gap-2.5 w-full h-full text-white text-sm font-semibold">
          {status === 'idle' && (
            <>
              <Download className="w-4 h-4" />
              {label}
            </>
          )}
          {status === 'downloading' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {Math.round(progress)}%
            </>
          )}
          {status === 'downloaded' && (
            <>
              <CheckCircle className="w-4 h-4" />
              Downloaded
            </>
          )}
          {status === 'complete' && (
            <>Download</>
          )}
        </span>
      </button>

      <a
        ref={anchorRef}
        href={href}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
