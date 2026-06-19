import React, { useState, useEffect } from 'react';
import { ContainerScroll } from './ui/container-scroll-animation';

const platforms = [
  { id: 'windows', label: 'Download for Windows', icon: 'M4 3h16v18H4z M8 7h8 M8 11h8 M8 15h4' },
  { id: 'linux', label: 'Download for Linux', icon: 'M12 2L2 7v10l10 5 10-5V7z M2 7l10 5 10-5 M12 22V12' },
  { id: 'mac', label: 'Download for macOS', icon: 'M12 2a7 7 0 0 0-7 7c0 2.5 1.5 6 2.5 8.5.5 1.3 1.5 2.5 2.5 2.5s2-1.2 2.5-2.5C13 15 14.5 11.5 14.5 9a7 7 0 0 0-2.5-7z M9 9h6' },
];

const trustItems = [
  'Open Source', 'MIT Licensed', 'Privacy First', 'Works Offline', 'Firefox Extension'
];

export function ForcaHero() {
  const [platform, setPlatform] = useState('windows');

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('win')) setPlatform('windows');
    else if (ua.includes('mac')) setPlatform('mac');
    else if (ua.includes('linux')) setPlatform('linux');
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
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-3">
              {platforms.map(p => (
                <a
                  key={p.id}
                  href={`/Forca/download/`}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    p.id === platform
                      ? 'bg-accent text-white shadow-lg shadow-purple-600/20 hover:bg-purple-400 hover:-translate-y-0.5'
                      : 'border border-[#27272a] text-muted-foreground hover:text-foreground hover:bg-[#27272a]'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={p.icon} />
                  </svg>
                  {p.label}
                </a>
              ))}
            </div>
            <a
              href="https://addons.mozilla.org/en-US/firefox/addon/forca-focus-mode-blocker/"
              target="_blank"
              className="inline-flex items-center gap-2 text-muted-foreground text-xs hover:text-foreground transition-colors w-fit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Firefox Extension also available
            </a>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6">
            {trustItems.map(item => (
              <span key={item} className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden lg:block relative">
          <ContainerScroll titleComponent={null}>
            <img
              src="/Forca/screenshots/app-dashboard.png"
              alt="Forca app dashboard showing active focus zone"
              className="w-full h-full object-cover object-top rounded-lg"
              loading="eager"
            />
          </ContainerScroll>
        </div>

        <div className="lg:hidden relative mt-6">
          <div className="border border-[#3b3b3b] bg-[#1c1c1c] rounded-2xl p-1.5 shadow-2xl">
            <img
              src="/Forca/screenshots/app-dashboard.png"
              alt="Forca app dashboard showing active focus zone"
              className="w-full h-auto rounded-lg"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
