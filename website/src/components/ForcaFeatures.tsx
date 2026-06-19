import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    label: 'Core',
    title: 'Automatic focus activation',
    description: 'Forca integrates with your calendar to detect when meetings end and automatically starts your configured focus zone.',
    items: ['Google Calendar integration', 'iCal URL support', 'Configurable post-meeting delay', 'Manual start always available'],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    label: 'Blocking',
    title: 'Website blocking',
    description: 'Define lists of websites to block during focus sessions. The browser extension enforces these rules in real time.',
    items: ['Per-zone site lists', 'Domain-level blocking', 'Instant unblock on zone end', 'Works across all supported browsers'],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    label: 'Flexibility',
    title: 'Focus zones',
    description: 'Create multiple focus profiles for different types of work. Each zone has its own duration, blocked sites, and trigger rules.',
    items: ['Unlimited zones', 'Custom durations (5-480 min)', 'Per-zone blocked site lists', 'Pause and resume support'],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" /><path d="M12 8v8" />
      </svg>
    ),
    label: 'Cross-browser',
    title: 'Browser support',
    description: 'Works with Firefox (one-click install from AMO) and all major Chromium browsers via Developer Mode.',
    items: ['Firefox: Add-ons Store', 'Chrome, Edge, Brave, Arc', 'Same blocking across all', 'Setup guided by desktop app'],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    label: 'Privacy',
    title: 'Local-first architecture',
    description: 'Your data never leaves your computer. Forca stores everything locally with no cloud dependency.',
    items: ['Zero cloud dependencies', 'No account required', 'Open source (MIT)', 'Optional encrypted sync'],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    ),
    label: 'Platform',
    title: 'Desktop + Browser',
    description: 'Forca runs as a native desktop app with a browser extension. No web app, no Electron bloat.',
    items: ['Windows, macOS, Linux', 'Firefox + Chromium', 'Native performance', 'Works fully offline'],
  },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="rounded-xl border border-[#27272a] bg-gradient-to-b from-[#1c1c1f] to-[#18181b] p-5 md:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-600/5"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 ring-1 ring-accent/20 text-accent">
          {feature.icon}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-md">
          {feature.label}
        </span>
      </div>
      <h2 className="text-base md:text-lg font-bold text-foreground mb-2">{feature.title}</h2>
      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
      <ul className="space-y-1.5">
        {feature.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function ForcaFeatures() {
  return (
    <section className="py-12 md:py-24" id="features">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Everything included, nothing hidden
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Automatic activation, website blocking, focus zones, and full privacy — all in one free app.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {features.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>
        <div className="text-center mt-10">
          <a
            href="/Forca/download/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-purple-400 hover:-translate-y-0.5 transition-all shadow-lg shadow-purple-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Download Forca free &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
