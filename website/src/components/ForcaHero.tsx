import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './icons';

const steps = [
  { label: 'Meeting Ends', icon: Icons.CalendarClock, desc: 'Your calendar event finishes and Forca detects the change.' },
  { label: 'Forca Detects', icon: Icons.Monitor, desc: 'The app checks your active zone rules and prepares to block.' },
  { label: 'Focus Zone Starts', icon: Icons.Layers, desc: 'Your selected focus profile activates with timer counting.' },
  { label: 'Sites Blocked', icon: Icons.ShieldBan, desc: 'Distracting websites are blocked across all browsers.' },
];

const platforms = [
  { id: 'windows', label: 'Download for Windows', icon: Icons.Windows },
  { id: 'mac', label: 'Download for macOS', icon: Icons.Apple },
  { id: 'linux', label: 'Download for Linux', icon: Icons.Linux },
];

export function ForcaHero() {
  const [platform, setPlatform] = useState('windows');
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('win')) setPlatform('windows');
    else if (ua.includes('mac')) setPlatform('mac');
    else if (ua.includes('linux')) setPlatform('linux');
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveStep(p => (p + 1) % steps.length), 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="z-10">
            <h1 className="text-[2.25rem] md:text-[3rem] lg:text-[3.25rem] font-extrabold leading-[1.1] tracking-tight text-foreground mb-5 max-w-lg">
              Automatic focus mode for people who actually want to get work done.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
              Forca detects when meetings end and automatically starts your focus zone — blocking distractions instantly. No manual switching, no excuses, no friction.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {platforms.map(p => {
                const PlatIcon = p.icon;
                return (
                  <a
                    key={p.id}
                    href="/Forca/download/"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      p.id === platform
                        ? 'bg-accent text-white shadow-lg shadow-purple-600/20 hover:bg-purple-400 hover:-translate-y-0.5'
                        : 'border border-[#27272a] text-muted-foreground hover:text-foreground hover:bg-[#27272a]'
                    }`}
                  >
                    <PlatIcon size={16} />
                    {p.label}
                  </a>
                );
              })}
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
            <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent font-medium w-fit">
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
            <div className="absolute -inset-4 bg-gradient-to-br from-purple-600/20 via-purple-500/5 to-transparent rounded-3xl blur-xl" />
            <div className="relative grid grid-cols-2 gap-3">
              {steps.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i === activeStep;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className={`relative rounded-2xl border p-4 md:p-5 transition-all duration-300 ${
                      isActive
                        ? 'border-purple-500/60 bg-purple-500/10 shadow-lg shadow-purple-600/15'
                        : 'border-[#27272a] bg-[#18181b]'
                    }`}
                  >
                    {i < steps.length - 1 && (
                      <div className="hidden lg:block absolute -right-[13px] top-1/2 -translate-y-1/2 z-10 text-zinc-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </div>
                    )}
                    {i % 2 === 0 && i < steps.length - 2 && (
                      <div className="hidden lg:block absolute -bottom-[13px] left-1/2 -translate-x-1/2 z-10 text-zinc-600 rotate-90">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                        isActive ? 'bg-accent text-white' : 'bg-zinc-800 text-muted-foreground'
                      }`}>
                        {i + 1}
                      </span>
                      <span className={`text-accent transition-all duration-300 ${
                        isActive ? 'opacity-100 scale-110' : 'opacity-60'
                      }`}>
                        <StepIcon size={20} />
                      </span>
                    </div>
                    <h3 className={`text-sm font-semibold mb-1 ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                    <div className={`mt-3 h-0.5 rounded-full transition-all duration-500 ${
                      isActive ? 'bg-accent w-full' : 'bg-zinc-800 w-0'
                    }`} />
                  </motion.div>
                );
              })}
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeStep ? 'bg-accent w-6' : 'bg-zinc-600 w-1.5 hover:bg-zinc-500'
                  }`}
                  aria-label={`Step ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
