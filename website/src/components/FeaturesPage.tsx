import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from './icons';
import { DownloadCTAButton } from './ui/DownloadCTAButton';
import {
  CalendarClock,
  ShieldBan,
  Layers,
  Puzzle,
  Lock,
  Monitor,
  Timer,
  Zap,
  Globe,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const highlights = [
  {
    icon: <CalendarClock className="w-6 h-6" />,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    ring: 'ring-blue-500/20',
    hoverBorder: 'hover:border-blue-500/50',
    hoverShadow: 'hover:shadow-blue-600/10',
    label: 'Core',
    title: 'Automatic focus activation',
    description:
      'Forca integrates with your calendar to detect when meetings end. When a meeting finishes, it automatically starts your configured focus zone — no buttons to press, no willpower required.',
    items: [
      { text: 'Google Calendar integration', detail: 'OAuth-based, read-only access to your calendar events.' },
      { text: 'iCal URL support', detail: 'Works with Outlook, Apple Calendar, and any iCal-compatible service.' },
      { text: 'Configurable post-meeting delay', detail: 'Set a buffer between meeting end and zone start (0–30 minutes).' },
      { text: 'Manual start always available', detail: 'Start any zone instantly from the home screen or tray.' },
    ],
  },
  {
    icon: <ShieldBan className="w-6 h-6" />,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    ring: 'ring-red-500/20',
    hoverBorder: 'hover:border-red-500/50',
    hoverShadow: 'hover:shadow-red-600/10',
    label: 'Blocking',
    title: 'Website blocking',
    description:
      'Define lists of websites to block during focus sessions. The browser extension enforces these rules in real time using the browser\'s native Declarative Net Request API — no performance overhead.',
    items: [
      { text: 'Per-zone site lists', detail: 'Each zone has its own set of blocked domains.' },
      { text: 'Domain-level blocking', detail: 'Block entire domains (e.g., reddit.com) with a single entry.' },
      { text: 'Instant unblock on zone end', detail: 'DNR rules are removed the moment a zone ends or a break starts.' },
      { text: 'Works across all supported browsers', detail: 'One zone blocks sites in every connected browser simultaneously.' },
    ],
  },
  {
    icon: <Layers className="w-6 h-6" />,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    ring: 'ring-purple-500/20',
    hoverBorder: 'hover:border-purple-500/50',
    hoverShadow: 'hover:shadow-purple-600/10',
    label: 'Flexibility',
    title: 'Focus zones',
    description:
      'Create multiple focus profiles for different types of work. Each zone has its own duration, blocked sites, and trigger rules. Switch between them effortlessly.',
    items: [
      { text: 'Unlimited zones', detail: 'Create as many as you need — deep work, email triage, side projects.' },
      { text: 'Custom durations (5–480 minutes)', detail: 'Short sprints or extended deep work sessions.' },
      { text: 'Per-zone blocked site lists', detail: 'Block social media for deep work but keep Stack Overflow accessible.' },
      { text: 'Pause and resume support', detail: 'Paused time is added back so your session stays accurate.' },
    ],
  },
  {
    icon: <Timer className="w-6 h-6" />,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/20',
    hoverBorder: 'hover:border-amber-500/50',
    hoverShadow: 'hover:shadow-amber-600/10',
    label: 'Timer',
    title: 'Wall-clock accurate timing',
    description:
      'Forca uses wall-clock timing instead of tick-based counters. Your timer stays accurate even if your computer sleeps, suspends, or the process is throttled by the OS.',
    items: [
      { text: 'Sleep-safe timers', detail: 'Close your laptop, come back — the timer picks up exactly where it left off.' },
      { text: 'Pause adds time back', detail: 'Pause for a call? That time is added to the end of your session.' },
      { text: 'Break reminders', detail: 'Forca reminds you when a break ends so you can start your next zone.' },
      { text: 'Tray status at a glance', detail: 'See remaining time and zone status directly in the system tray.' },
    ],
  },
  {
    icon: <Puzzle className="w-6 h-6" />,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    ring: 'ring-orange-500/20',
    hoverBorder: 'hover:border-orange-500/50',
    hoverShadow: 'hover:shadow-orange-600/10',
    label: 'Cross-browser',
    title: 'Browser support',
    description:
      'Forca\'s browser extension works with Firefox (one-click install from Add-ons) and all major Chromium browsers via Developer Mode. The same blocking features work across every supported browser.',
    items: [
      { text: 'Firefox: Add-ons Store (1-click)', detail: 'Install directly from Mozilla — no Developer Mode needed.' },
      { text: 'Chrome, Edge, Brave, Arc, Vivaldi, Opera', detail: 'Load unpacked via Developer Mode — persists across restarts.' },
      { text: 'Same blocking across all browsers', detail: 'One zone blocks sites in every connected browser at once.' },
      { text: 'Setup guided by the desktop app', detail: 'The onboarding wizard walks you through installation step by step.' },
    ],
  },
  {
    icon: <Lock className="w-6 h-6" />,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/50',
    hoverShadow: 'hover:shadow-emerald-600/10',
    label: 'Privacy',
    title: 'Local-first architecture',
    description:
      'Your data never leaves your computer. Forca stores everything locally with no cloud dependency. No accounts, no tracking, no data collection. Open source so you can verify.',
    items: [
      { text: 'Zero cloud dependencies', detail: 'All settings, zones, and scores stored locally with electron-store.' },
      { text: 'No account required', detail: 'Download, install, and start using immediately.' },
      { text: 'Open source (MIT)', detail: 'Full source code on GitHub — audit it yourself.' },
      { text: 'Optional sync', detail: 'Firebase sync available if you want multi-device support (optional).' },
    ],
  },
];

const architectureSteps = [
  {
    step: '1',
    title: 'You start a zone',
    description: 'Click Start in the app, or let it auto-trigger after a meeting ends.',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    step: '2',
    title: 'Desktop app broadcasts state',
    description: 'The Zone Engine sends the active zone, duration, and blocked site list over WebSocket (port 7432).',
    icon: <Monitor className="w-5 h-5" />,
  },
  {
    step: '3',
    title: 'Extension installs blocking rules',
    description: 'The browser extension receives the state and installs DNR rules for each blocked domain.',
    icon: <ShieldBan className="w-5 h-5" />,
  },
  {
    step: '4',
    title: 'Sites are blocked',
    description: 'Navigating to a blocked site shows the Forca blocked page. The timer counts down in the tray.',
    icon: <Globe className="w-5 h-5" />,
  },
  {
    step: '5',
    title: 'Zone ends, rules removed',
    description: 'When the timer completes (or you end the zone), DNR rules are removed and sites become accessible.',
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
];

const comparisons = [
  { feature: 'Automatic activation after meetings', forca: true, manual: false },
  { feature: 'Calendar integration', forca: true, manual: false },
  { feature: 'Per-zone blocked site lists', forca: true, manual: 'varies' },
  { feature: 'Wall-clock accurate timers', forca: true, manual: false },
  { feature: 'Pause and resume with time back', forca: true, manual: false },
  { feature: 'Multiple browser support', forca: true, manual: 'varies' },
  { feature: 'System tray controls', forca: true, manual: false },
  { feature: 'Break reminders', forca: true, manual: false },
  { feature: 'No account required', forca: true, manual: 'some' },
  { feature: 'Open source', forca: true, manual: 'some' },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function FeaturesPage() {
  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-glow/15 via-background to-background selectable">

      {/* ── Hero ── */}
      <section className="pt-20 pb-12 md:pt-28 md:pb-16 text-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-extrabold leading-[1.1] tracking-tight text-foreground mb-3">
              Features
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Automatic focus zones, website blocking, calendar-aware activation, and wall-clock timing — all local-first and privacy-respecting.
            </p>
          </motion.div>

          {/* Stat bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-6 md:gap-10 mt-8"
          >
            {[
              { value: '7+', label: 'Browsers' },
              { value: '3', label: 'Platforms' },
              { value: '0', label: 'Accounts needed' },
              { value: '100%', label: 'Open source' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-accent">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Feature highlights ── */}
      <section className="-mt-4 relative z-10">
        <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-6">
          {highlights.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className={`rounded-2xl border border-border bg-gradient-to-b from-surface-top to-surface-bottom p-6 md:p-8 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 ${f.hoverBorder} ${f.hoverShadow} hover:shadow-xl transform-gpu`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left: icon + label */}
                <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-2 shrink-0">
                  <span className={`flex items-center justify-center w-12 h-12 rounded-xl ${f.bg} ring-1 ${f.ring} ${f.color}`}>
                    {f.icon}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${f.color} ${f.bg} px-2 py-0.5 rounded-md`}>
                    {f.label}
                  </span>
                </div>

                {/* Right: content */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">{f.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {f.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${f.color}`} />
                        <div>
                          <span className="text-sm text-foreground font-medium">{item.text}</span>
                          <span className="text-xs text-muted-foreground block">{item.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works (architecture) ── */}
      <section className="mt-20 md:mt-28">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
              How blocking works
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
              Five steps from starting a zone to sites being blocked — all happening locally on your machine.
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-6">
              {architectureSteps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="relative flex items-start gap-4 pl-0"
                >
                  {/* Step number circle */}
                  <div className="relative z-10 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent/10 ring-1 ring-accent/20 text-accent shrink-0">
                    <span className="text-lg md:text-xl font-bold">{s.step}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1 md:pt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-accent">{s.icon}</span>
                      <h3 className="text-sm md:text-base font-semibold text-foreground">{s.title}</h3>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="mt-20 md:mt-28">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
              Why Forca
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
              How Forca compares to manual site-blocking or basic timer apps.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-gradient-to-b from-surface-top to-surface-bottom overflow-hidden"
          >
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-border bg-muted/30">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feature</span>
              <span className="text-xs font-semibold text-accent uppercase tracking-wider text-center w-20">Forca</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center w-20">Manual</span>
            </div>

            {/* Rows */}
            {comparisons.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 ${i < comparisons.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <span className="text-sm text-muted-foreground">{row.feature}</span>
                <span className="flex items-center justify-center w-20">
                  {row.forca ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-accent" />
                  ) : (
                    <span className="w-4.5 h-4.5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </span>
                <span className="flex items-center justify-center w-20">
                  {row.manual === true ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-muted-foreground/50" />
                  ) : row.manual === 'varies' || row.manual === 'some' ? (
                    <span className="text-xs text-muted-foreground/60">~</span>
                  ) : (
                    <span className="w-4.5 h-4.5 rounded-full border-2 border-muted-foreground/20" />
                  )}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Platform support ── */}
      <section className="mt-20 md:mt-28">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
              Platform support
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
              Desktop app and browser extension work across all major platforms.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="rounded-2xl border border-border bg-gradient-to-b from-surface-top to-surface-bottom p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 ring-1 ring-accent/20 text-accent">
                  <Monitor className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-foreground">Desktop App</h3>
              </div>
              <div className="space-y-3">
                {[
                  { icon: <Icons.Windows size={16} />, name: 'Windows', detail: '10+ (64-bit)', note: 'Recommended' },
                  { icon: <Icons.Apple size={16} />, name: 'macOS', detail: 'Apple Silicon & Intel', note: '' },
                  { icon: <Icons.Linux size={16} />, name: 'Linux', detail: 'x64 (AppImage)', note: '' },
                ].map((os, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground">{os.icon}</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">{os.name}</span>
                      <span className="text-xs text-muted-foreground ml-1.5">{os.detail}</span>
                    </div>
                    {os.note && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                        {os.note}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Browsers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="rounded-2xl border border-border bg-gradient-to-b from-surface-top to-surface-bottom p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 ring-1 ring-accent/20 text-accent">
                  <Puzzle className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-foreground">Browser Extension</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Firefox', method: 'Add-ons Store', color: 'text-orange-500' },
                  { name: 'Chrome', method: 'Developer Mode', color: 'text-blue-500' },
                  { name: 'Edge', method: 'Developer Mode', color: 'text-blue-600' },
                  { name: 'Brave', method: 'Developer Mode', color: 'text-orange-600' },
                  { name: 'Arc', method: 'Developer Mode', color: 'text-purple-500' },
                  { name: 'Vivaldi', method: 'Developer Mode', color: 'text-red-500' },
                  { name: 'Opera', method: 'Developer Mode', color: 'text-red-600' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
                    <span className={`w-2.5 h-2.5 rounded-full ${b.color}`} />
                    <span className="text-sm font-medium text-foreground flex-1">{b.name}</span>
                    <span className="text-xs text-muted-foreground">{b.method}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Privacy deep dive ── */}
      <section className="mt-20 md:mt-28">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-gradient-to-b from-surface-top to-surface-bottom p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-500">
                <EyeOff className="w-5 h-5" />
              </span>
              <h2 className="text-lg md:text-xl font-bold text-foreground">Privacy by design</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'No telemetry', desc: 'Zero analytics, tracking, or data collection of any kind.' },
                { title: 'No cloud dependency', desc: 'All data stored locally with electron-store. Works fully offline.' },
                { title: 'No account required', desc: 'Download, install, and start using immediately.' },
                { title: 'OAuth tokens stripped', desc: 'Calendar tokens are removed before any optional sync.' },
                { title: 'Open source (MIT)', desc: 'Full source code on GitHub — audit it yourself.' },
                { title: 'Local WebSocket only', desc: 'Desktop-to-extension communication stays on port 7432.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                  <div>
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground block">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mt-16 md:mt-20 text-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <DownloadCTAButton size="lg" />
        </div>
      </section>
    </div>
  );
}
