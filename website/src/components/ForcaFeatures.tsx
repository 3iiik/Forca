import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from './icons';
import { DownloadCTAButton } from './ui/DownloadCTAButton';

const features = [
  {
    icon: Icons.CalendarClock,
    label: 'Core',
    title: 'Automatic focus activation',
    description: 'Forca integrates with your calendar to detect when meetings end and automatically starts your configured focus zone.',
    items: ['Google Calendar integration', 'iCal URL support', 'Configurable post-meeting delay', 'Manual start always available'],
  },
  {
    icon: Icons.ShieldBan,
    label: 'Blocking',
    title: 'Website blocking',
    description: 'Define lists of websites to block during focus sessions. The browser extension enforces these rules in real time.',
    items: ['Per-zone site lists', 'Domain-level blocking', 'Instant unblock on zone end', 'Works across all supported browsers'],
  },
  {
    icon: Icons.Layers,
    label: 'Flexibility',
    title: 'Focus zones',
    description: 'Create multiple focus profiles for different types of work. Each zone has its own duration, blocked sites, and trigger rules.',
    items: ['Unlimited zones', 'Custom durations (5-480 min)', 'Per-zone blocked site lists', 'Pause and resume support'],
  },
  {
    icon: Icons.Firefox,
    label: 'Cross-browser',
    title: 'Browser support',
    description: 'Works with Firefox (one-click install from AMO) and all major Chromium browsers via Developer Mode.',
    items: ['Firefox: Add-ons Store', 'Chrome, Edge, Brave, Arc', 'Same blocking across all', 'Setup guided by desktop app'],
  },
  {
    icon: Icons.Lock,
    label: 'Privacy',
    title: 'Local-first architecture',
    description: 'Your data never leaves your computer. Forca stores everything locally with no cloud dependency.',
    items: ['Zero cloud dependencies', 'No account required', 'Open source (MIT)', 'Optional encrypted sync'],
  },
  {
    icon: Icons.Monitor,
    label: 'Platform',
    title: 'Desktop + Browser',
    description: 'Forca runs as a native desktop app with a browser extension. No web app, no Electron bloat.',
    items: ['Windows, macOS, Linux', 'Firefox + Chromium', 'Native performance', 'Works fully offline'],
  },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const FeatureIcon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="rounded-2xl border border-[#27272a] bg-gradient-to-b from-[#1c1c1f] to-[#18181b] p-5 md:p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-600/10"
      style={{ willChange: 'transform' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 ring-1 ring-accent/20 text-accent">
          <FeatureIcon size={20} />
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
            <Icons.Check size={14} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function ForcaFeatures() {
  return (
    <section className="py-20" id="features">
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
          <DownloadCTAButton size="lg" />
        </div>
      </div>
    </section>
  );
}
