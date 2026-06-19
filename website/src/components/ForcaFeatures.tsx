import React from 'react';

const features = [
  {
    image: '/Forca/screenshots/dashboard.png',
    title: 'Automatic Activation',
    description: 'Forca detects when meetings end and automatically starts your focus zone.',
  },
  {
    image: '/Forca/screenshots/zone-creation.png',
    title: 'Create Focus Zones',
    description: 'Build custom focus sessions with durations, triggers, and website rules.',
  },
  {
    image: '/Forca/screenshots/blocked-page.png',
    title: 'Website Blocking',
    description: 'Block distractions instantly across your browser during deep work.',
  },
  {
    image: '/Forca/screenshots/onboarding-complete.png',
    title: 'Guided Setup',
    description: 'Get productive in minutes with a simple onboarding flow.',
  },
  {
    image: '/Forca/screenshots/app-dashboard.png',
    title: 'Productivity Analytics',
    description: 'Track sessions, streaks, focus score, and time saved.',
  },
  {
    image: '/Forca/screenshots/dashboard.png',
    title: 'Calendar Integration',
    description: 'Start focus sessions automatically after meetings end.',
  },
];

export function ForcaFeatures() {
  return (
    <section className="py-16 md:py-24" id="features">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Automatic focus zones that block distractions after every meeting
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Create custom focus sessions, block websites across your browser, and sync with your calendar for automatic activation when meetings end.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((f, i) => (
            <article
              key={i}
              className="group relative rounded-xl border border-[#27272a] bg-[#18181b] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-600/5"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#131315]">
                <img
                  src={f.image}
                  alt={`${f.title} screenshot showing Forca desktop app`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            </article>
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
