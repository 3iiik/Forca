import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from './icons';
import { DownloadCTAButton } from './ui/DownloadCTAButton';

const steps = [
  {
    num: 1,
    icon: Icons.CalendarClock,
    title: 'Connect Calendar',
    description: 'Link Google Calendar or iCal. Forca syncs your schedule automatically.',
  },
  {
    num: 2,
    icon: Icons.Layers,
    title: 'Create a Focus Zone',
    description: 'Set a duration, choose blocked sites, pick triggers. Name it "Deep Work."',
  },
  {
    num: 3,
    icon: ({ size }: { size?: number }) => (
      <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Meeting Ends',
    description: 'Forca detects the calendar event ending and prepares your focus session.',
  },
  {
    num: 4,
    icon: Icons.ShieldBan,
    title: 'Activates Automatically',
    description: 'Distractions blocked. Timer counting. You\'re in the zone instantly.',
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const StepIcon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.12, duration: 0.45 }}
      className="relative flex flex-col items-center text-center rounded-2xl border border-[#27272a] bg-gradient-to-b from-[#1c1c1f] to-[#18181b] p-6 md:p-7 transition-transform duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-600/10"
      style={{ willChange: 'transform' }}
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold mb-5 shadow-sm">
        {step.num}
      </span>

      <span className="flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 ring-1 ring-accent/20 text-accent mb-4">
        <StepIcon size={24} />
      </span>

      <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">{step.description}</p>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section className="py-20" id="how-it-works">
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
          <div className="hidden lg:block absolute top-[88px] left-[calc(10%+36px)] right-[calc(10%+36px)] h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-5">
            {steps.map((step, i) => (
              <StepCard key={i} step={step} index={i} />
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <DownloadCTAButton size="lg" />
        </div>
      </div>
    </section>
  );
}
