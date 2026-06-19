import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DownloadCTAButton } from './ui/DownloadCTAButton';
import { Icons } from './icons';

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface Release {
  tag_name: string;
  assets: ReleaseAsset[];
}

interface Platform {
  id: string;
  title: string;
  subtitle: string;
  arch: string;
  icon: React.ComponentType<{ size?: number }>;
  recommended: boolean;
  features: string[];
  matchAsset: (name: string) => boolean;
  downloadUrl: string;
}

const platformTemplates: Omit<Platform, 'downloadUrl'>[] = [
  {
    id: 'windows',
    title: 'Windows',
    subtitle: 'Native Desktop App',
    arch: 'x64 & ARM64',
    icon: Icons.Windows,
    recommended: true,
    features: ['Windows 10 & 11 support', 'Auto calendar detection', 'Browser extension included', 'Full focus automation'],
    matchAsset: (name: string) => name.includes('.exe') && !name.includes('blockmap'),
  },
  {
    id: 'mac',
    title: 'macOS',
    subtitle: 'Native Desktop App',
    arch: 'ARM64 & x64',
    icon: Icons.Apple,
    recommended: false,
    features: ['Apple Silicon & Intel', 'Calendar integration', 'Browser extension included', 'Full focus automation'],
    matchAsset: (name: string) => name.includes('.dmg'),
  },
  {
    id: 'linux',
    title: 'Linux',
    subtitle: 'Native Desktop App',
    arch: 'x64',
    icon: Icons.Linux,
    recommended: false,
    features: ['AppImage format', 'Browser extension support', 'Full focus automation', 'Open source friendly'],
    matchAsset: (name: string) => name.includes('.AppImage'),
  },
];

function PlatformCard({ platform, index, version }: { platform: Platform; index: number; version: string }) {
  const PlatformIcon = platform.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="group relative flex flex-col rounded-2xl border border-border/50 bg-gradient-to-b from-[#1c1c1f] to-[#18181b] p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-600/15"
    >
      {platform.recommended && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-purple-600/30">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            Recommended
          </span>
        </div>
      )}

      <div className="flex flex-col items-center text-center mb-6 md:mb-8 pt-2">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/10 ring-1 ring-accent/20 mb-4 text-accent transition-all duration-300 group-hover:ring-accent/40 group-hover:bg-accent/15 group-hover:shadow-lg group-hover:shadow-purple-600/20">
          <PlatformIcon size={40} />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-foreground mb-0.5">{platform.title}</h3>
        <p className="text-xs md:text-sm text-muted-foreground mb-3">{platform.subtitle}</p>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/10 text-[10px] font-medium text-accent">
            v{version}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/80 text-[10px] font-medium text-muted-foreground">
            {platform.arch}
          </span>
        </div>
      </div>

      <ul className="space-y-2.5 mb-6 md:mb-8 flex-1">
        {platform.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-muted-foreground">
            <Icons.Check size={14} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <DownloadCTAButton
        href={platform.downloadUrl}
        label={`Download for ${platform.title}`}
        showArrow={false}
        className="w-full"
      />
    </motion.div>
  );
}

export function DownloadPage() {
  const [release, setRelease] = useState<Release | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>(() =>
    platformTemplates.map(p => ({ ...p, downloadUrl: '' }))
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('https://api.github.com/repos/3iiik/forca/releases/latest')
      .then(r => r.json())
      .then((data: Release) => {
        if (data?.assets) {
          setRelease(data);
          setPlatforms(prev =>
            prev.map(p => ({
              ...p,
              downloadUrl: data.assets.find(a => p.matchAsset(a.name))?.browser_download_url || '',
            }))
          );
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const version = release?.tag_name?.replace(/^v/, '') || '2.0.0';

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-purple-900/15 via-background to-background">
      <section className="pt-20 pb-12 text-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-extrabold leading-[1.1] tracking-tight text-foreground mb-3">
              Download Forca
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-4">
              Automatic focus mode for people who actually want to get work done.
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent font-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" /></svg>
              v{version}
            </span>
          </motion.div>
        </div>
      </section>

      <section className="-mt-4 relative z-10">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {platforms.map((p, i) => (
              <PlatformCard key={p.id} platform={p} index={i} version={version} />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 md:mt-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-[#27272a] bg-gradient-to-b from-[#1c1c1f] to-[#18181b] p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-left"
          >
            <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl bg-orange-500/10 ring-1 ring-orange-500/20">
              <Icons.Firefox size={36} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">Need the browser extension?</h3>
              <p className="text-xs md:text-sm text-muted-foreground max-w-md">
                Forca's Firefox extension blocks distractions during focus sessions. Install directly from Mozilla Add-ons.
              </p>
            </div>
            <a
              href="https://addons.mozilla.org/en-US/firefox/addon/forca-focus-mode-blocker/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 text-white text-sm font-semibold transition-all duration-300 hover:from-orange-500 hover:to-orange-400 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Install Firefox Extension
            </a>
          </motion.div>
        </div>
      </section>

      <section className="mt-12 text-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-xs text-muted-foreground">
            All releases and source code available on{' '}
            <a
              href="https://github.com/3iiik/forca/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover underline underline-offset-2"
            >
              GitHub
            </a>
            . Forca is free and open source under the MIT License.
          </p>
        </div>
      </section>
    </div>
  );
}
