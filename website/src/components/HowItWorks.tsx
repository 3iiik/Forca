import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    num: 1,
    title: 'Connect Calendar',
    description: 'Link Google Calendar or iCal. Forca syncs your schedule automatically.',
    image: '/Forca/screenshots/onboarding-complete.png',
  },
  {
    num: 2,
    title: 'Create a Focus Zone',
    description: 'Set a duration, choose blocked sites, pick triggers. Name it "Deep Work."',
    image: '/Forca/screenshots/zone-creation.png',
  },
  {
    num: 3,
    title: 'Meeting Ends',
    description: 'Forca detects the calendar event ending and prepares your focus session.',
    image: '/Forca/screenshots/dashboard.png',
  },
  {
    num: 4,
    title: 'Forca Activates Automatically',
    description: 'Distractions blocked. Timer counting. You\'re in the zone instantly.',
    image: '/Forca/screenshots/app-dashboard.png',
  },
];

export function HowItWorks() {
  return (
    <section className="py-12 md:py-24" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            How it works
          </h2>
           <p className="text-muted-foreground text-base md:text-lg">
            Connect your calendar, set your rules, and never think about blocking again.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.12, duration: 0.4 }}
              className="relative"
            >
              <div className="rounded-xl border border-[#27272a] bg-[#18181b] overflow-hidden mb-3">
                <img
                  src={step.image}
                  alt={step.title}
                  loading="lazy"
                  className="w-full h-36 md:h-40 object-cover object-top"
                />
              </div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-accent/20 text-accent text-xs font-bold">
                  {step.num}
                </span>
                <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-9">{step.description}</p>
            </motion.div>
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
