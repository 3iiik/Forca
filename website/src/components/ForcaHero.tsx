import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const platforms = [
  { id: 'windows', label: 'Download for Windows', icon: 'M4 3h16v18H4z M8 7h8 M8 11h8 M8 15h4' },
  { id: 'linux', label: 'Download for Linux', icon: 'M12 2L2 7v10l10 5 10-5V7z M2 7l10 5 10-5 M12 22V12' },
  { id: 'mac', label: 'Download for macOS', icon: 'M12 2a7 7 0 0 0-7 7c0 2.5 1.5 6 2.5 8.5.5 1.3 1.5 2.5 2.5 2.5s2-1.2 2.5-2.5C13 15 14.5 11.5 14.5 9a7 7 0 0 0-2.5-7z M9 9h6' },
];

const steps = [
  { label: 'Meeting Ends', icon: 'M19 14c1.5-2.5 2-5 2-7 0-5-4.03-9-9-9S3 2 3 7c0 2 .5 4.5 2 7l2 5c.5 1 1.5 2 3 2h4c1.5 0 2.5-1 3-2l2-5z M12 22v-4 M10 22h4 M10 14l2-2 2 2 M12 12v-4', viewBox: '0 0 24 24' },
  { label: 'Focus Activates', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z M8 12l2 2 4-4', viewBox: '0 0 24 24' },
  { label: 'Sites Blocked', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4', viewBox: '0 0 24 24' },
  { label: 'Focus Time', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z M12 6v6l4 2', viewBox: '0 0 24 24' },
];

export function ForcaHero() {
  const [platform, setPlatform] = useState('windows');
  const [stars, setStars] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('win')) setPlatform('windows');
    else if (ua.includes('mac')) setPlatform('mac');
    else if (ua.includes('linux')) setPlatform('linux');

    fetch('https://api.github.com/repos/3iiik/forca')
      .then(r => r.json())
      .then(d => { if (d.stargazers_count) setStars(d.stargazers_count); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden pt-8 md:pt-16 pb-4">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center px-6 md:px-12 max-w-7xl mx-auto">
        <div className="z-10">
          <h1 className="text-[2.25rem] md:text-[3rem] lg:text-[3.25rem] font-extrabold leading-[1.1] tracking-tight text-foreground mb-5 max-w-lg">
            Automatic focus mode for people who actually want to get work done.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-7 max-w-md">
            Forca detects when meetings end and automatically starts your focus zone — blocking distractions instantly. No manual switching, no excuses, no friction.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {platforms.map(p => (
              <a
                key={p.id}
                href="/Forca/download/"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  p.id === platform
                    ? 'bg-accent text-white shadow-lg shadow-purple-600/20 hover:bg-purple-400 hover:-translate-y-0.5'
                    : 'border border-[#27272a] text-muted-foreground hover:text-foreground hover:bg-[#27272a]'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={p.icon} /></svg>
                {p.label}
              </a>
            ))}
            <a
              href="https://github.com/3iiik/forca"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#27272a] text-muted-foreground hover:text-foreground hover:bg-[#27272a] text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
              GitHub
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent font-medium">
            <span>Free &amp; Open Source</span>
            <span className="text-accent/40" aria-hidden="true">&#183;</span>
            <span>MIT Licensed</span>
            <span className="text-accent/40" aria-hidden="true">&#183;</span>
            <span>Privacy First</span>
            <span className="text-accent/40" aria-hidden="true">&#183;</span>
            <span>Works Offline</span>
          </div>
        </div>

        <div className="relative">
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-purple-500/5 to-transparent rounded-3xl" />

            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 shadow-xl shadow-purple-600/30 mb-5">
                    <svg width="48" height="48" viewBox={steps[activeStep].viewBox} fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      {steps[activeStep].icon.split('M').filter(Boolean).map((d, i) => (
                        <path key={i} d={`M${d}`} />
                      ))}
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-1">{steps[activeStep].label}</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    {activeStep === 0 && 'Forca detects when your calendar event ends.'}
                    {activeStep === 1 && 'Your focus zone starts automatically — no button to press.'}
                    {activeStep === 2 && 'Distracting websites are blocked across your browser.'}
                    {activeStep === 3 && 'Your focus session timer counts up. Work happens.'}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-2 mt-8">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === activeStep ? 'bg-accent w-6' : 'bg-zinc-600 hover:bg-zinc-500'
                    }`}
                    aria-label={`Show step ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
