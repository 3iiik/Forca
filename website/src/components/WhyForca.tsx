import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from './icons';
import { DownloadCTAButton } from './ui/DownloadCTAButton';

const comparisons = [
  { blocker: 'Manually start sessions', forca: 'Starts automatically' },
  { blocker: 'Easy to bypass', forca: 'Triggered by meetings' },
  { blocker: 'Interrupt workflow', forca: 'Removes decision fatigue' },
  { blocker: 'Require constant discipline', forca: 'Works in the background' },
];

export function WhyForca() {
  return (
    <section className="py-20 bg-card" id="why-forca">
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
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Traditional Blockers</span>
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
                  className="text-left py-3 md:py-4 flex items-center gap-2"
                >
                  <span className="text-red-400 shrink-0"><Icons.X size={14} /></span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{c.blocker}</span>
                </motion.div>

                <div className="flex items-center justify-center py-3 md:py-4 text-accent">
                  <Icons.ArrowRight size={20} />
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="text-right py-3 md:py-4 flex items-center justify-end gap-2"
                >
                  <span className="text-xs sm:text-sm font-medium text-foreground">{c.forca}</span>
                  <span className="text-green-500 shrink-0"><Icons.Check size={14} /></span>
                </motion.div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <DownloadCTAButton size="lg" />
        </div>
      </div>
    </section>
  );
}
