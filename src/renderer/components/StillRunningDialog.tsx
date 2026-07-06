import { useState, useEffect, useRef, useCallback } from 'react';
import { Info, X } from 'lucide-react';

interface StillRunningDialogProps {
  visible: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

export default function StillRunningDialog({ visible, onClose }: StillRunningDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prevVisibleRef = useRef(false);

  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      setMounted(true);
      setAnimatingOut(false);
      setDontShowAgain(false);
      requestAnimationFrame(() => {
        buttonRef.current?.focus();
      });
    }
    prevVisibleRef.current = visible;
  }, [visible]);

  const handleClose = useCallback(() => {
    setAnimatingOut(true);
    setTimeout(() => {
      setMounted(false);
      onClose(dontShowAgain);
    }, 200);
  }, [dontShowAgain, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  }, [handleClose]);

  useEffect(() => {
    if (!mounted) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mounted, handleClose]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ease-in-out ${
        animatingOut ? 'opacity-0' : 'opacity-100'
      }`}
      onKeyDown={handleKeyDown}
    >
      <div className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${animatingOut ? 'opacity-0' : 'opacity-100'}`} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-800/5 rounded-full blur-3xl" />
      </div>

      <div
        className={`relative bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 transition-all duration-200 ease-in-out ${
          animatingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="still-running-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" className="w-8 h-8 shrink-0">
              <circle cx="48" cy="48" r="26" fill="none" stroke="#44403C" strokeWidth="3.5"/>
              <circle cx="48" cy="48" r="26" fill="none" stroke="#1D9E75" strokeWidth="3.5" strokeDasharray="81 163" strokeDashoffset="41" strokeLinecap="round"/>
              <circle cx="48" cy="48" r="7" fill="#1D9E75"/>
              <rect x="46.5" y="18" width="3" height="11" rx="1.5" fill="#78716C"/>
              <rect x="46.5" y="67" width="3" height="11" rx="1.5" fill="#78716C"/>
              <rect x="18" y="46.5" width="11" height="3" rx="1.5" fill="#78716C"/>
              <rect x="67" y="46.5" width="11" height="3" rx="1.5" fill="#78716C"/>
            </svg>
            <span className="font-semibold text-sm text-zinc-100">Forca</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            aria-label="Close"
            tabIndex={0}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-900/30 border border-primary-700/40 flex items-center justify-center shadow-xl shadow-primary-900/20">
              <Info className="w-7 h-7 text-primary-400" />
            </div>
          </div>

          <h2 id="still-running-title" className="text-lg font-bold text-zinc-100 mb-2 leading-snug">
            Forca will continue running in the background
          </h2>
          <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
            Close the window anytime. Forca will stay active in your system tray so your focus sessions, timers, and website blocking continue uninterrupted.
          </p>

          <label className="flex items-center justify-center gap-2.5 mb-6 cursor-pointer group">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-primary-500 focus:ring-primary-500/50 focus:ring-offset-0 cursor-pointer"
              tabIndex={0}
            />
            <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors select-none">
              Don&apos;t show this message again
            </span>
          </label>

          <button
            ref={buttonRef}
            onClick={handleClose}
            className="w-full py-2.5 px-5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-medium rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950 shadow-lg shadow-primary-900/30"
            tabIndex={0}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
