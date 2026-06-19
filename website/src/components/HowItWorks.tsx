import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    num: 1,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" />
      </svg>
    ),
    title: 'Connect Calendar',
    description: 'Link Google Calendar or iCal. Forca syncs your schedule automatically.',
  },
  {
    num: 2,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: 'Create a Focus Zone',
    description: 'Set a duration, choose blocked sites, pick triggers. Name it "Deep Work."',
  },
  {
    num: 3,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <path d="M4 14h16" />
        <circle cx="12" cy="17" r="3" />
      </svg>
    ),
    title: 'Meeting Ends',
    description: 'Forca detects the calendar event ending and prepares your focus session.',
  },
  {
    num: 4,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'Forca Activates Automatically',
    description: 'Distractions blocked. Timer counting. You\'re in the zone instantly.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            How it works
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Connect your calendar, set your rules, and never think about blocking again.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-24 left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-0.5 bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative mb-5">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-600/20 text-white relative z-10">
                    {step.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent text-white text-[11px] font-bold flex items-center justify-center shadow-lg shadow-purple-600/30 z-20">
                    {step.num}
                  </div>
                </div>

                <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
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
