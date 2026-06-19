import React from 'react';
import { motion } from 'framer-motion';

const comparisons = [
  { blocker: 'Manual session start', forca: 'Automatic activation' },
  { blocker: 'Browser only', forca: 'Desktop + Browser' },
  { blocker: 'No meeting awareness', forca: 'Calendar-aware' },
  { blocker: 'Reactive', forca: 'Proactive' },
  { blocker: 'Requires constant discipline', forca: 'Removes friction' },
];

export function WhyForca() {
  return (
    <section className="py-12 md:py-24 bg-card" id="why-forca">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Why Forca?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Most website blockers require manual effort. Forca automatically turns free time into focused work.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-x-6 md:gap-x-10 gap-y-0">
            <div className="text-left pb-3 mb-1 border-b border-[#27272a]">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Traditional Blockers</span>
            </div>
            <div className="pb-3 mb-1 border-b border-[#27272a]" />
            <div className="text-right pb-3 mb-1 border-b border-[#27272a]">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">Forca</span>
            </div>
            {comparisons.map((c, i) => (
              <React.Fragment key={i}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="text-left py-3 md:py-4 flex items-center"
                >
                  <span className="text-xs sm:text-sm text-muted-foreground">{c.blocker}</span>
                </motion.div>
                <div className="flex items-center justify-center py-3 md:py-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="text-right py-3 md:py-4 flex items-center justify-end"
                >
                  <span className="text-xs sm:text-sm font-medium text-foreground">{c.forca}</span>
                </motion.div>
              </React.Fragment>
            ))}
          </div>
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
