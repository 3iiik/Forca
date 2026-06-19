import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const gallery = [
  { src: '/Forca/screenshots/onboarding-complete.png', alt: 'Forca onboarding complete after setup' },
  { src: '/Forca/screenshots/zone-creation.png', alt: 'Creating a new focus zone with duration and block list' },
  { src: '/Forca/screenshots/dashboard.png', alt: 'Forca dashboard showing focus history and statistics' },
  { src: '/Forca/screenshots/blocked-page.png', alt: 'Website blocked by Forca during a focus session' },
];

export function ProductShowcase() {
  const [selected, setSelected] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const open = useCallback((i: number) => setSelected(i), []);
  const close = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (selected === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') setSelected(s => s !== null ? Math.min(s + 1, gallery.length - 1) : null);
      if (e.key === 'ArrowLeft') setSelected(s => s !== null ? Math.max(s - 1, 0) : null);
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [selected, close]);

  return (
    <section className="py-12 md:py-24" id="showcase">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            See Forca in action
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Onboarding, zone creation, dashboard, and blocked page — see how Forca works.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {gallery.map((item, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              onClick={() => open(i)}
              className="relative group rounded-xl overflow-hidden border border-[#27272a] bg-[#1c1c1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background text-left cursor-pointer"
              aria-label={`View ${item.alt}`}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                className="w-full h-40 md:h-52 object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" aria-hidden="true" />
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            onKeyDown={e => e.key === 'Escape' && close()}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Screenshot preview"
          >
            <button
              ref={closeRef}
              onClick={close}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
              aria-label="Close preview"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
            <motion.img
              key={selected}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={gallery[selected].src}
              alt={gallery[selected].alt}
              className="max-w-[90vw] max-h-[85vh] rounded-2xl border border-[#27272a] shadow-2xl cursor-default"
              onClick={e => e.stopPropagation()}
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2" aria-hidden="true">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setSelected(i); }}
                  className={`w-2 h-2 rounded-full transition-colors ${i === selected ? 'bg-accent' : 'bg-zinc-600'}`}
                  aria-label={`Go to screenshot ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
