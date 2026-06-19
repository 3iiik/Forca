import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from './icons';

const features = [
  {
    icon: Icons.CalendarClock,
    label: 'Core',
    title: 'Automatic focus activation',
    description: 'Forca integrates with your calendar to detect when meetings end. When a meeting finishes, it automatically starts your configured focus zone — no buttons to press, no willpower required.',
    items: ['Google Calendar integration', 'iCal URL support', 'Configurable post-meeting delay', 'Manual start always available'],
  },
  {
    icon: Icons.ShieldBan,
    label: 'Blocking',
    title: 'Website blocking',
    description: 'Define lists of websites to block during focus sessions. The browser extension enforces these rules in real time — no configuration needed per session.',
    items: ['Per-zone site lists', 'Domain-level blocking', 'Instant unblock on zone end', 'Works across all supported browsers'],
  },
  {
    icon: Icons.Layers,
    label: 'Flexibility',
    title: 'Focus zones',
    description: 'Create multiple focus profiles for different types of work. Each zone has its own duration, blocked sites, and trigger rules. Switch between them effortlessly.',
    items: ['Unlimited zones', 'Custom durations (5-480 minutes)', 'Per-zone blocked site lists', 'Pause and resume support'],
  },
  {
    icon: Icons.Firefox,
    label: 'Cross-browser',
    title: 'Browser support',
    description: 'Forca\'s browser extension works with Firefox (one-click install from AMO) and all major Chromium browsers including Chrome, Edge, Brave, Arc, Vivaldi, and Opera.',
    items: [
      'Firefox: Add-ons Store (1-click)',
      'Chrome, Edge, Brave, Arc: Developer Mode',
      'Same blocking features across all browsers',
      'Setup guided by the desktop app',
    ],
  },
  {
    icon: Icons.Lock,
    label: 'Privacy',
    title: 'Local-first architecture',
    description: 'Your data never leaves your computer. Forca stores everything locally with no cloud dependency. No accounts, no tracking, no data collection.',
    items: ['Zero cloud dependencies', 'No account required', 'Open source (MIT)', 'Optional encrypted sync'],
  },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const FeatureIcon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="rounded-2xl border border-[#27272a] bg-gradient-to-b from-[#1c1c1f] to-[#18181b] p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-600/10"
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

export function FeaturesPage() {
  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-purple-900/15 via-background to-background">
      <section className="pt-20 pb-12 text-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-extrabold leading-[1.1] tracking-tight text-foreground mb-3">
              Features
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Automatic focus zones, website blocking, and calendar-aware activation — all local-first and privacy-respecting.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="-mt-4 relative z-10">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 text-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <a
            href="/Forca/download/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-purple-400 hover:-translate-y-0.5 transition-all shadow-lg shadow-purple-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Download Forca free &rarr;
          </a>
        </div>
      </section>
    </div>
  );
}
