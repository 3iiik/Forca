import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const gallery = [
  { src: '/Forca/screenshots/onboarding-complete.png', alt: 'Forca onboarding complete' },
  { src: '/Forca/screenshots/zone-creation.png', alt: 'Creating a focus zone in Forca' },
  { src: '/Forca/screenshots/dashboard.png', alt: 'Forca dashboard overview' },
  { src: '/Forca/screenshots/blocked-page.png', alt: 'Website blocked by Forca' },
];

export function ProductShowcase() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            See Forca in action
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            From meeting to deep work in seconds.
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
              onClick={() => setSelected(i)}
              className="relative group rounded-xl overflow-hidden border border-[#27272a] bg-[#1c1c1c] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent text-left"
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="w-full h-40 md:h-52 object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
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
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-pointer"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
