import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from './icons';

const features = [
  {
    icon: Icons.CalendarClock,
    title: 'Calendar-aware',
    description: 'Forca integrates with Google Calendar and iCal. When a meeting ends, your focus zone starts automatically.',
  },
  {
    icon: Icons.ShieldBan,
    title: 'Website blocking',
    description: 'Define site lists per zone. The browser extension enforces them instantly during active focus sessions.',
  },
  {
    icon: Icons.Layers,
    title: 'Focus zones',
    description: 'Create multiple profiles with custom durations, blocked sites, and triggers. Switch between Deep Work, Reading, or Coding zones.',
  },
  {
    icon: Icons.ChartBar,
    title: 'Focus analytics',
    description: 'Track sessions, streaks, and time saved. See your focus patterns improve over days and weeks.',
  },
  {
    icon: Icons.Lock,
    title: 'Privacy first',
    description: 'Everything runs locally. No cloud, no accounts, no data collection. Fully open source under MIT License.',
  },
  {
    icon: Icons.Monitor,
    title: 'Cross-platform',
    description: 'Works on Windows, macOS, and Linux. Firefox extension included. Chromium browsers supported via Developer Mode.',
  },
];

export function ProductShowcase() {
  return (
    <section className="py-20" id="showcase">
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
          {features.map((f, i) => {
            const FeatureIcon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-2xl border border-[#27272a] bg-gradient-to-b from-[#1c1c1f] to-[#18181b] p-5 md:p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-600/10"
                style={{ willChange: 'transform' }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 ring-1 ring-accent/20 text-accent mb-4">
                  <FeatureIcon size={22} />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
