import React, { useState, useEffect } from 'react';
import { ContainerScroll } from './ui/container-scroll-animation';

const platforms = [
  { id: 'windows', label: 'Download for Windows', icon: 'M4 3h16v18H4z M8 7h8 M8 11h8 M8 15h4' },
  { id: 'linux', label: 'Download for Linux', icon: 'M12 2L2 7v10l10 5 10-5V7z M2 7l10 5 10-5 M12 22V12' },
  { id: 'mac', label: 'Download for macOS', icon: 'M12 2a7 7 0 0 0-7 7c0 2.5 1.5 6 2.5 8.5.5 1.3 1.5 2.5 2.5 2.5s2-1.2 2.5-2.5C13 15 14.5 11.5 14.5 9a7 7 0 0 0-2.5-7z M9 9h6' },
];

export function ForcaHero() {
  const [platform, setPlatform] = useState('windows');
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('win')) setPlatform('windows');
    else if (ua.includes('mac')) setPlatform('mac');
    else if (ua.includes('linux')) setPlatform('linux');

    fetch('https://api.github.com/repos/3iiik/forca')
      .then(r => r.json())
      .then(d => {
        if (d.stargazers_count) setStars(d.stargazers_count);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden pt-8 md:pt-12 pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16 items-center px-6 md:px-12 max-w-7xl mx-auto">
        <div className="z-10">
          <h1 className="text-[2.25rem] md:text-[3rem] lg:text-[3.25rem] font-extrabold leading-[1.1] tracking-tight text-foreground mb-5 max-w-lg">
            Automatic focus mode for people who actually want to get work done.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-7 max-w-md">
            Block distractions automatically when your focus session starts.
            Forca detects meeting endings and triggers focus zones — no manual
            switching, no excuses, no friction.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {platforms.map(p => (
              <a
                key={p.id}
                href="/Forca/download/"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  p.id === platform
                    ? 'bg-accent text-white shadow-lg shadow-purple-600/20 hover:bg-purple-400 hover:-translate-y-0.5'
                    : 'border border-[#27272a] text-muted-foreground hover:text-foreground hover:bg-[#27272a]'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={p.icon} />
                </svg>
                {p.label}
              </a>
            ))}
            <a
              href="https://addons.mozilla.org/en-US/firefox/addon/forca-focus-mode-blocker/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#27272a] text-muted-foreground hover:text-foreground hover:bg-[#27272a] text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Firefox Extension
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent font-medium">
            <span>Free &amp; Open Source</span>
            <span className="text-accent/40" aria-hidden="true">&#183;</span>
            <span>MIT Licensed</span>
            <span className="text-accent/40" aria-hidden="true">&#183;</span>
            <span>No Account Required</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-5">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
              Privacy First
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
              Works Offline
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
              Windows
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
              macOS
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
              Linux
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
              Firefox
            </span>
            {stars !== null && (
              <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#a78bfa" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                {stars} GitHub stars
              </span>
            )}
          </div>
        </div>

        <div className="hidden lg:block relative">
          <ContainerScroll titleComponent={null}>
            <img
              src="/Forca/screenshots/app-dashboard.png"
              alt="Forca app dashboard showing an active focus zone with timer and blocked sites"
              className="w-full h-full object-cover object-top rounded-lg"
              loading="eager"
              fetchpriority="high"
            />
          </ContainerScroll>
        </div>

        <div className="lg:hidden relative mt-6">
          <div className="border border-[#3b3b3b] bg-[#1c1c1c] rounded-2xl p-1.5 shadow-2xl">
            <img
              src="/Forca/screenshots/app-dashboard.png"
              alt="Forca app dashboard showing an active focus zone with timer and blocked sites"
              className="w-full h-auto rounded-lg"
              loading="eager"
              fetchpriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
