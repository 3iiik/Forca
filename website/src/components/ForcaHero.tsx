import React from 'react';
import { motion } from 'framer-motion';
import { ContainerScroll, Card } from './ui/container-scroll-animation';

export function ForcaHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh] px-6 md:px-12 max-w-6xl mx-auto">
        <div className="z-10 pt-12 lg:pt-0">
          <h1 className="text-[2.5rem] md:text-[3.25rem] font-extrabold leading-[1.1] tracking-tight text-foreground mb-5">
            Automatic focus mode<br />
            for people who actually<br />
            want to get work done.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md mb-7">
            Block distractions automatically when your focus session starts.
            Forca detects meeting endings and triggers focus zones — no manual
            switching, no excuses, no friction.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/Forca/download/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-blue-500 transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" />
              </svg>
              Download for Windows
            </a>
            <a
              href="https://addons.mozilla.org/en-US/firefox/addon/forca-focus-mode-blocker/"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#27272a] text-foreground font-medium text-sm hover:bg-[#27272a] transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Firefox Extension
            </a>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-900/30 text-emerald-400 text-xs font-semibold border border-emerald-800/40">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              Open Source
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-900/30 text-blue-400 text-xs font-semibold border border-blue-800/40" id="hero-version">
              v1.0.1
            </span>
          </div>
        </div>

        <div className="hidden lg:block relative">
          <ContainerScroll titleComponent={null}>
            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg p-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium mb-4 border border-blue-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Focus Zone Active
                </div>
                <div className="text-5xl mb-4">🎯</div>
                <div className="text-lg font-semibold text-zinc-200 mb-1">Deep Work</div>
                <div className="text-sm text-zinc-500">45:00 remaining</div>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  3 sites blocked
                </div>
              </div>
            </div>
          </ContainerScroll>
        </div>

        <div className="lg:hidden relative mt-8">
          <div className="border-2 border-[#3b3b3b] bg-[#1c1c1c] rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg p-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Focus Zone Active
                </div>
                <div className="text-4xl mb-3">🎯</div>
                <div className="text-base font-semibold text-zinc-200 mb-1">Deep Work</div>
                <div className="text-sm text-zinc-500">45:00 remaining</div>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  3 sites blocked
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
