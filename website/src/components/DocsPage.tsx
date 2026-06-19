import React from 'react';
import { motion } from 'framer-motion';
import { DownloadCTAButton } from './ui/DownloadCTAButton';

const sections = [
  {
    title: 'Installation',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    content: (
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">System requirements</h3>
        <ul className="space-y-1.5 mb-5">
          {[
            'Windows 10 or later (64-bit)',
            'Firefox or a Chromium-based browser (Chrome, Edge, Brave, Arc, Vivaldi, Opera)',
            '~50 MB disk space',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M20 6L9 17l-5-5" /></svg>
              {item}
            </li>
          ))}
        </ul>

        <h3 className="text-sm font-semibold text-foreground mb-2">Desktop app</h3>
        <ol className="space-y-2">
          {[
            ['Download the latest installer from the', { type: 'link', href: '/Forca/download/', text: 'download page' }, '.'],
            ['Run ', { type: 'code', text: 'Forca-Setup-x64.exe' }, ' and follow the setup wizard.'],
            ['Launch Forca. The onboarding wizard will guide you through the rest.'],
          ].map((parts, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="flex items-center justify-center w-5 h-5 rounded bg-accent/20 text-accent text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
              <span>{parts.map((part, j) => {
                if (typeof part === 'string') return part;
                if (part.type === 'link') return <a key={j} href={part.href} className="text-accent hover:text-accent-hover underline underline-offset-2">{part.text}</a>;
                if (part.type === 'code') return <code key={j} className="bg-[#27272a] px-1.5 py-0.5 rounded text-[13px]">{part.text}</code>;
                return null;
              })}</span>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    title: 'Browser extensions',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
      </svg>
    ),
    content: (
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Firefox</h3>
        <ol className="space-y-2 mb-6">
          {[
            ['Visit the ', { type: 'link-ext', href: 'https://addons.mozilla.org/en-US/firefox/addon/forca-focus-mode-blocker/', text: 'Forca page on Firefox Add-ons' }, '.'],
            ['Click ', { type: 'bold', text: 'Add to Firefox' }, '.'],
            ['Grant the required permissions when prompted.'],
            ['Launch Forca. The app will detect and connect to the extension automatically.'],
          ].map((parts, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="flex items-center justify-center w-5 h-5 rounded bg-accent/20 text-accent text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
              <span>{parts.map((part, j) => {
                if (typeof part === 'string') return part;
                if (part.type === 'link-ext') return <a key={j} href={part.href} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline underline-offset-2">{part.text}</a>;
                if (part.type === 'bold') return <strong key={j} className="text-foreground">{part.text}</strong>;
                return null;
              })}</span>
            </li>
          ))}
        </ol>

        <h3 className="text-sm font-semibold text-foreground mb-2">Chromium browsers</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">Forca supports Chrome, Edge, Brave, Arc, Vivaldi, and Opera via Developer Mode loading.</p>
        <ol className="space-y-2">
          {[
            ['Install the Forca desktop app.'],
            [{ type: 'nested', items: ['Open your browser\'s extensions page:', [
              ['Chrome: ', { type: 'code', text: 'chrome://extensions' }],
              ['Edge: ', { type: 'code', text: 'edge://extensions' }],
              ['Brave: ', { type: 'code', text: 'brave://extensions' }],
              ['Arc: ', { type: 'code', text: 'chrome://extensions' }],
              ['Vivaldi: ', { type: 'code', text: 'vivaldi://extensions' }],
              ['Opera: ', { type: 'code', text: 'opera://extensions' }],
            ]] }],
            ['Toggle ', { type: 'bold', text: 'Developer mode' }, ' in the top-right corner.'],
            ['In Forca (Settings \u2192 Extension), click ', { type: 'bold', text: 'Open Extension Folder' }, '.'],
            ['On the extensions page, click ', { type: 'bold', text: 'Load unpacked' }, ' and select the opened folder.'],
          ].map((parts, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="flex items-center justify-center w-5 h-5 rounded bg-accent/20 text-accent text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
              <span>{parts.map((part, j) => {
                if (typeof part === 'string') return part;
                if (part.type === 'bold') return <strong key={j} className="text-foreground">{part.text}</strong>;
                if (part.type === 'code') return <code key={j} className="bg-[#27272a] px-1.5 py-0.5 rounded text-[13px]">{part.text}</code>;
                if (part.type === 'nested') {
                  return <span key={j} className="block">{part.items[0]}
                    <span className="block mt-1 space-y-0.5">
                      {part.items[1].map((row: (string | { type: string; text: string })[], ri: number) => (
                        <span key={ri} className="block text-xs">
                          {row.map((cell: string | { type: string; text: string }, cj: number) => {
                            if (typeof cell === 'string') return cell;
                            if (cell.type === 'code') return <code key={cj} className="bg-[#27272a] px-1.5 py-0.5 rounded">{cell.text}</code>;
                            return null;
                          })}
                        </span>
                      ))}
                    </span>
                  </span>;
                }
                return null;
              })}</span>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    title: 'Troubleshooting',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
      </svg>
    ),
    content: (
      <div className="space-y-5">
        {[
          {
            title: 'Extension not connecting',
            items: ['Make sure the Forca desktop app is running.', 'Reload the extension on your browser\'s extensions page.', 'In Forca, go to Settings \u2192 Extension and click Reconnect.', 'Restart both the desktop app and your browser.'],
          },
          {
            title: 'Websites not being blocked',
            items: ['Verify the extension is installed and enabled.', 'Check that the site is in your zone\'s blocked list.', 'Make sure the zone is active (not paused or ended).'],
          },
          {
            title: 'Calendar not detected',
            items: ['Go to Settings \u2192 Calendar and configure your provider.', 'For Google Calendar, click "Connect Google Calendar" and authorize access.', 'For iCal, paste your iCal URL in the settings.'],
          },
          {
            title: 'App won\'t start',
            items: ['Ensure you\'re on Windows 10 or later.', { text: 'Try reinstalling the latest version from the ', link: { href: '/Forca/download/', text: 'download page' }, suffix: '.' }, { text: 'Check the logs at ', code: '%APPDATA%/forca/logs/', suffix: '.' }],
          },
        ].map((group, gi) => (
          <div key={gi}>
            <h3 className="text-sm font-semibold text-foreground mb-2">{group.title}</h3>
            <ul className="space-y-1.5">
              {group.items.map((item: any, ii: number) => (
                <li key={ii} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                  {typeof item === 'string' ? item : (
                    <span>
                      {item.text}
                      {item.link && <a href={item.link.href} className="text-accent hover:text-accent-hover underline underline-offset-2">{item.link.text}</a>}
                      {item.code && <code className="bg-[#27272a] px-1.5 py-0.5 rounded text-[13px]">{item.code}</code>}
                      {item.suffix}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'FAQ',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
      </svg>
    ),
    content: (
      <div className="divide-y divide-[#27272a]">
        {[
          { q: 'Is Forca free?', a: 'Yes. Forca is completely free and open source under the MIT License.' },
          { q: 'Do I need an account?', a: 'No. Forca is local-first. Everything runs on your machine with no account required.' },
          { q: 'Does it work on macOS or Linux?', a: <>Forca is now available on Windows, macOS, <em className="text-foreground">and</em> Linux. The browser extension works on all platforms. Download the latest version for your OS from the <a href="/Forca/download/" className="text-accent hover:text-accent-hover underline underline-offset-2">download page</a>.</> },
          { q: 'Can I use Forca offline?', a: 'Yes. The desktop app and extension work entirely offline. Internet is only needed for calendar integration (optional).' },
          { q: 'How do I update Forca?', a: <>Forca checks for updates automatically on startup. When an update is available, you&apos;ll be prompted to download and install it. You can also download the latest version from the <a href="/Forca/download/" className="text-accent hover:text-accent-hover underline underline-offset-2">download page</a>.</> },
          { q: 'Is my data private?', a: <>Yes. All data is stored locally on your computer. No data is sent to any server. Forca is open source, so you can verify this yourself. See our <a href="/Forca/privacy/" className="text-accent hover:text-accent-hover underline underline-offset-2">privacy page</a> for details.</> },
          { q: 'Can I contribute?', a: <>Absolutely! Forca is open source. Visit the <a href="https://github.com/3iiik/forca" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline underline-offset-2">GitHub repository</a> to submit issues, feature requests, or pull requests.</> },
        ].map((faq, i) => (
          <div key={i} className="py-3 first:pt-0 last:pb-0">
            <h3 className="text-sm font-semibold text-foreground mb-1">{faq.q}</h3>
            <p className="text-sm text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>
    ),
  },
];

export function DocsPage() {
  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-purple-900/15 via-background to-background">
      <section className="pt-16 md:pt-24 pb-12 md:pb-16 text-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-extrabold leading-[1.1] tracking-tight text-foreground mb-3">
              Documentation
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Everything you need to set up and use Forca.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="-mt-6 relative z-10">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="space-y-5">
            {sections.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-xl border border-[#27272a] bg-gradient-to-b from-[#1c1c1f] to-[#18181b] p-5 md:p-6"
                style={{ willChange: 'transform' }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 ring-1 ring-accent/20 text-accent">
                    {s.icon}
                  </span>
                  <h2 className="text-lg md:text-xl font-bold text-foreground">{s.title}</h2>
                </div>
                {s.content}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="text-center mt-8"
          >
            <DownloadCTAButton size="lg" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
