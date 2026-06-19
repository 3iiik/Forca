import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" />
        <path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" />
      </svg>
    ),
    title: 'Calendar-aware',
    description: 'Forca integrates with Google Calendar and iCal. When a meeting ends, your focus zone starts automatically.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'Website blocking',
    description: 'Define site lists per zone. The browser extension enforces them instantly during active focus sessions.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M16 13H8M16 17H8M10 9H9" />
      </svg>
    ),
    title: 'Focus zones',
    description: 'Create multiple profiles with custom durations, blocked sites, and triggers. Switch between Deep Work, Reading, or Coding zones.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Focus analytics',
    description: 'Track sessions, streaks, and time saved. See your focus patterns improve over days and weeks.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Privacy first',
    description: 'Everything runs locally. No cloud, no accounts, no data collection. Fully open source under MIT License.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
        <circle cx="17" cy="17" r="3" fill="currentColor" fillOpacity="0.2" />
      </svg>
    ),
    title: 'Cross-platform',
    description: 'Works on Windows, macOS, and Linux. Firefox extension included. Chromium browsers supported via Developer Mode.',
  },
];

export function ProductShowcase() {
  return (
    <section className="py-16 md:py-24" id="showcase">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Everything you need to stay focused
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Calendar-aware focus zones, automatic activation, and distraction blocking — all local-first and privacy-respecting.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="rounded-2xl border border-[#27272a] bg-gradient-to-b from-[#1c1c1f] to-[#18181b] p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-600/10"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 ring-1 ring-accent/20 text-accent mb-4">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
