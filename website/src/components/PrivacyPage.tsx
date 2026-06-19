import React from 'react';
import { motion } from 'framer-motion';

const highlights = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'No cloud account',
    desc: 'No sign-up, no login, no cloud dependency.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
      </svg>
    ),
    title: 'No data sold',
    desc: 'We don\'t collect, sell, or share your data.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Local-first',
    desc: 'Everything stays on your computer.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
    ),
    title: 'Open source',
    desc: 'Verify privacy in the source code yourself.',
  },
];

const sections = [
  {
    title: 'Data collection',
    content: (
      <div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Forca does <strong className="text-foreground">not</strong> collect any personal data. The application runs entirely on your local machine. No data is transmitted to any server unless you explicitly choose to enable optional features:
        </p>
        <ul className="space-y-2">
          {[
            ['Calendar integration', 'If you connect Google Calendar, Forca reads your calendar events locally. OAuth tokens are stored on your machine.'],
            ['Sync', 'If you enable optional multi-device sync, your settings and session data are stored in your chosen provider (Firebase or Supabase) under your account.'],
            ['Analytics', 'Forca collects anonymous onboarding funnel events stored <em>locally</em> on your machine. This data never leaves your computer and is only used to improve the onboarding experience.'],
          ].map(([label, desc], i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M20 6L9 17l-5-5" /></svg>
              <span><strong className="text-foreground">{label}</strong> — {desc}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: 'What we DON\'T do',
    content: (
      <ul className="space-y-2">
        {['Sell your data', 'Share your data with third parties', 'Require an account', 'Track your browsing history', 'Include analytics scripts or tracking pixels', 'Send telemetry'].map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: 'Local storage',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Forca uses <code className="bg-[#27272a] px-1.5 py-0.5 rounded text-[13px]">electron-store</code> to persist data locally on your machine. All files are stored in your user data directory (<code className="bg-[#27272a] px-1.5 py-0.5 rounded text-[13px]">%APPDATA%/forca/</code> on Windows). You can delete this directory at any time to erase all Forca data.
      </p>
    ),
  },
  {
    title: 'Browser extension',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        The Forca browser extension communicates with the desktop app over a local WebSocket connection (<code className="bg-[#27272a] px-1.5 py-0.5 rounded text-[13px]">127.0.0.1:7432</code>). No external network requests are made by the extension. It only receives block lists and focus state from the local desktop app.
      </p>
    ),
  },
  {
    title: 'Third-party services',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Forca has no embedded third-party services, trackers, or analytics scripts. Optional features that connect to external services (Google Calendar, Firebase sync) only activate with your explicit consent.
      </p>
    ),
  },
  {
    title: 'Open source',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Forca is fully open source under the MIT License. The complete source code is available on{' '}
        <a href="https://github.com/3iiik/forca" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline underline-offset-2">GitHub</a>.
        Anyone can audit, verify, and contribute to the code.
      </p>
    ),
  },
  {
    title: 'Contact',
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        If you have questions about this privacy policy, please open an issue on the{' '}
        <a href="https://github.com/3iiik/forca/issues" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline underline-offset-2">GitHub repository</a>.
      </p>
    ),
  },
];

export function PrivacyPage() {
  return (
    <div className="min-h-screen pb-24">
      <section className="pt-16 md:pt-24 pb-12 md:pb-16 text-center bg-gradient-to-b from-background via-background to-[#0d0d12]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-extrabold leading-[1.1] tracking-tight text-foreground mb-3">
              Privacy
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Your data belongs to you. Always has. Always will.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="-mt-6 relative z-10">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12 md:mb-16">
            {highlights.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-xl border border-[#27272a] bg-gradient-to-b from-[#1c1c1f] to-[#18181b] p-4 md:p-6 text-center"
              >
                <div className="flex justify-center mb-2">{h.icon}</div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{h.title}</h3>
                <p className="text-[11px] md:text-xs text-muted-foreground">{h.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">Privacy Policy</h2>
              <p className="text-xs md:text-sm text-muted-foreground"><em>Last updated: June 2025</em></p>
            </motion.div>

            {sections.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="rounded-xl border border-[#27272a] bg-gradient-to-b from-[#1c1c1f] to-[#18181b] p-5 md:p-6"
              >
                <h3 className="text-base font-semibold text-foreground mb-3">{s.title}</h3>
                {s.content}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
