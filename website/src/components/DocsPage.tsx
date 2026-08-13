import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadCTAButton } from './ui/DownloadCTAButton';
import {
  Download,
  Puzzle,
  Settings,
  Shield,
  MonitorSmartphone,
  Timer,
  Bug,
  HelpCircle,
  ChevronDown,
  Zap,
  Globe,
  Lock,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Accordion helper                                                          */
/* -------------------------------------------------------------------------- */

function AccordionItem({
  title,
  icon,
  children,
  defaultOpen = false,
  id,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div id={id} className="rounded-xl border border-border bg-gradient-to-b from-surface-top to-surface-bottom overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-5 md:p-6 text-left group"
      >
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/10 ring-1 ring-accent/20 text-accent shrink-0 transition-colors group-hover:bg-accent/15 group-hover:ring-accent/40">
          {icon}
        </span>
        <h2 className="text-lg md:text-xl font-bold text-foreground flex-1">{title}</h2>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Inline rendering helpers                                                  */
/* -------------------------------------------------------------------------- */

type DocCode = { type: 'code'; text: string };
type DocBold = { type: 'bold'; text: string };
type DocLink = { type: 'link'; href: string; text: string };
type DocLinkExt = { type: 'link-ext'; href: string; text: string };
type DocNested = { type: 'nested'; items: [string, DocInline[][]] };
type DocInline = string | DocCode | DocBold | DocLink | DocLinkExt | DocNested;

function renderInline(parts: DocInline[], keyPrefix: string) {
  return parts.map((part, j) => {
    if (typeof part === 'string') return <span key={`${keyPrefix}-${j}`}>{part}</span>;
    if (part.type === 'link')
      return (
        <a
          key={`${keyPrefix}-${j}`}
          href={part.href}
          className="text-accent hover:text-accent-hover underline underline-offset-2"
        >
          {part.text}
        </a>
      );
    if (part.type === 'link-ext')
      return (
        <a
          key={`${keyPrefix}-${j}`}
          href={part.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent-hover underline underline-offset-2"
        >
          {part.text}
        </a>
      );
    if (part.type === 'code')
      return (
        <code
          key={`${keyPrefix}-${j}`}
          className="bg-muted px-1.5 py-0.5 rounded text-[13px]"
        >
          {part.text}
        </code>
      );
    if (part.type === 'bold')
      return (
        <strong key={`${keyPrefix}-${j}`} className="text-foreground">
          {part.text}
        </strong>
      );
    if (part.type === 'nested') {
      return (
        <span key={`${keyPrefix}-${j}`} className="block">
          {part.items[0]}
          <span className="block mt-1 space-y-0.5">
            {part.items[1].map((row, ri) => (
              <span key={ri} className="block text-xs">
                {row.map((cell, cj) => {
                  if (typeof cell === 'string') return cell;
                  if (cell.type === 'code')
                    return (
                      <code key={cj} className="bg-muted px-1.5 py-0.5 rounded">
                        {cell.text}
                      </code>
                    );
                  return null;
                })}
              </span>
            ))}
          </span>
        </span>
      );
    }
    return null;
  });
}

function StepList({
  items,
  type = 'ol',
}: {
  items: DocInline[][];
  type?: 'ol' | 'ul';
}) {
  const Tag = type;
  return (
    <Tag className={`${type === 'ol' ? 'list-decimal list-inside space-y-2' : 'space-y-1.5'}`}>
      {items.map((parts, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
          {type === 'ol' && (
            <span className="flex items-center justify-center w-5 h-5 rounded bg-accent/20 text-accent text-[10px] font-bold shrink-0 mt-0.5">
              {i + 1}
            </span>
          )}
          {type === 'ul' && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0 text-success"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
          <span>{renderInline(parts, `${type}-${i}`)}</span>
        </li>
      ))}
    </Tag>
  );
}

function Callout({
  type = 'info',
  children,
}: {
  type?: 'info' | 'warning' | 'tip';
  children: React.ReactNode;
}) {
  const styles = {
    info: 'border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400',
    warning: 'border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400',
    tip: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
  };
  const icons = {
    info: <Info className="w-4 h-4 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />,
    tip: <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />,
  };

  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-lg border text-sm leading-relaxed ${styles[type]}`}
    >
      {icons[type]}
      <div>{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const desktopInstallSteps: DocInline[][] = [
  ['Download the latest installer from the', { type: 'link', href: '/download/', text: 'download page' }, '.'],
  ['Run the installer and follow the setup wizard.'],
  ['Launch Forca. The onboarding wizard will walk you through connecting your browser extension and configuring your first focus zone.'],
];

const firefoxSteps: DocInline[][] = [
  ['Visit the ', { type: 'link-ext', href: 'https://addons.mozilla.org/en-US/firefox/addon/forca-focus-mode-blocker/', text: 'Forca page on Firefox Add-ons' }, '.'],
  ['Click ', { type: 'bold', text: 'Add to Firefox' }, '.'],
  ['Grant the required permissions when prompted.'],
  ['Launch Forca. The app will detect and connect to the extension automatically.'],
];

const chromiumBrowsers = [
  { name: 'Chrome', url: 'chrome://extensions' },
  { name: 'Edge', url: 'edge://extensions' },
  { brand: 'Brave', url: 'brave://extensions' },
  { name: 'Arc', url: 'chrome://extensions' },
  { name: 'Vivaldi', url: 'vivaldi://extensions' },
  { name: 'Opera', url: 'opera://extensions' },
];

const chromiumSteps: DocInline[][] = [
  ['Install the Forca desktop app from the', { type: 'link', href: '/download/', text: 'download page' }, '.'],
  [{ type: 'nested', items: ['Open your browser\'s extensions page:', chromiumBrowsers.map((b) => [
    [b.name + ': ', { type: 'code', text: b.url }],
  ])] }],
  ['Toggle ', { type: 'bold', text: 'Developer mode' }, ' in the top-right corner (if not already on).'],
  ['In Forca, go to ', { type: 'bold', text: 'Settings' }, ' \u2192 ', { type: 'bold', text: 'Extension' }, ' and click ', { type: 'bold', text: 'Open Extension Folder' }, '.'],
  ['On the extensions page, click ', { type: 'bold', text: 'Load unpacked' }, ' and select the folder that opened.'],
  ['The Forca extension icon should appear in your toolbar. It will connect to the desktop app automatically.'],
];

const zoneSteps: DocInline[][] = [
  ['Open Forca and navigate to the ', { type: 'bold', text: 'Zones' }, ' tab.'],
  ['Click ', { type: 'bold', text: 'Create Zone' }, ' to set up a new focus zone.'],
  ['Name your zone and choose which websites to block during focus sessions.'],
  ['Optionally, link a calendar so zones trigger automatically after meetings.'],
  ['Start a zone manually from the home screen, or let it auto-start based on your calendar.'],
];

/* -------------------------------------------------------------------------- */
/*  Page component                                                            */
/* -------------------------------------------------------------------------- */

export function DocsPage() {
  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-glow/15 via-background to-background selectable">
      {/* Header */}
      <section className="pt-16 md:pt-24 pb-12 md:pb-16 text-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-extrabold leading-[1.1] tracking-tight text-foreground mb-3">
              Documentation
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Everything you need to install, configure, and get the most out of Forca.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sections */}
      <section className="-mt-6 relative z-10">
        <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-4">

          {/* ── Getting Started ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
          >
            <AccordionItem
              title="Getting Started"
              icon={<Zap className="w-5 h-5" />}
              defaultOpen
            >
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Forca is an <strong className="text-foreground">automatic focus mode</strong> that blocks distracting websites
                  when you need to concentrate. It works in three parts:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                    <span><strong className="text-foreground">Desktop app</strong> &mdash; runs in the background and manages your focus zones, timers, and calendar integration.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                    <span><strong className="text-foreground">Browser extension</strong> &mdash; installed in Firefox or a Chromium browser, receives zone state from the desktop app and blocks sites using Declarative Net Request (DNR) rules.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                    <span><strong className="text-foreground">WebSocket connection</strong> &mdash; the desktop app and extension communicate over a local WebSocket on port 7432. No data leaves your machine.</span>
                  </li>
                </ul>

                <h3 className="text-sm font-semibold text-foreground pt-2">Quick start</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded bg-accent/20 text-accent text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span>Download and install the desktop app from the <a href="/download/" className="text-accent hover:text-accent-hover underline underline-offset-2">download page</a>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded bg-accent/20 text-accent text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span>Install the browser extension (Firefox or Chromium &mdash; see the <strong className="text-foreground">Browser Extensions</strong> section below).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded bg-accent/20 text-accent text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span>Follow the onboarding wizard to create your first focus zone.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded bg-accent/20 text-accent text-[10px] font-bold shrink-0 mt-0.5">4</span>
                    <span>Start a zone. The extension will automatically block the sites you chose.</span>
                  </li>
                </ol>

                <Callout type="tip">
                  Forca is <strong>local-first and account-free</strong>. Everything runs on your machine. Internet is only needed for optional calendar sync.
                </Callout>
              </div>
            </AccordionItem>
          </motion.div>

          {/* ── Installation ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.05, duration: 0.4 }}
          >
            <AccordionItem
              title="Installation"
              icon={<Download className="w-5 h-5" />}
            >
              <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">System requirements</h3>
                  <ul className="space-y-1.5">
                    {[
                      'Windows 10+ (64-bit), macOS (Apple Silicon & Intel), or Linux (x64)',
                      'Firefox or a Chromium-based browser (Chrome, Edge, Brave, Arc, Vivaldi, Opera)',
                      '~50 MB disk space',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-success"><path d="M20 6L9 17l-5-5" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Desktop app</h3>
                  <StepList items={desktopInstallSteps} />
                </div>

                <Callout type="info">
                  The onboarding wizard will guide you through connecting the browser extension, configuring your first zone, and setting up calendar integration (optional).
                </Callout>
              </div>
            </AccordionItem>
          </motion.div>

          {/* ── Browser Extensions ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <AccordionItem
              title="Browser Extensions"
              icon={<Puzzle className="w-5 h-5" />}
            >
              <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
                <p>
                  The browser extension is how Forca blocks websites. It communicates with the desktop app over a
                  local WebSocket connection (port 7432). The extension is required for blocking to work.
                </p>

                {/* Firefox */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-500"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    Firefox
                  </h3>
                  <p className="mb-3">
                    The Forca extension is available directly on Firefox Add-ons. No Developer Mode required.
                  </p>
                  <StepList items={firefoxSteps} />
                </div>

                {/* Chromium */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></svg>
                    Chromium browsers (Chrome, Edge, Brave, Arc, Vivaldi, Opera)
                  </h3>
                  <p className="mb-3">
                    Forca is not listed on the Chrome Web Store. The extension is installed manually via{' '}
                    <strong className="text-foreground">Developer Mode</strong> using the "Load unpacked" method.
                    This is a standard approach for extensions not published to a store.
                  </p>
                  <StepList items={chromiumSteps} />

                  <div className="mt-4 space-y-3">
                    <Callout type="warning">
                      <strong className="text-foreground">Why Developer Mode?</strong> The Chrome Web Store charges a one-time $5 developer fee and requires a review process. Forca is free and open source, so the extension is distributed directly. Developer Mode loading is safe and widely used.
                    </Callout>

                    <Callout type="info">
                      <strong className="text-foreground">Will this break after a browser restart?</strong> No. Developer Mode extensions persist across browser restarts. You only need to reload manually if the browser flags the extension (unlikely) or if you update the extension files.
                    </Callout>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Supported browsers</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { name: 'Firefox', type: 'Direct install', color: 'text-orange-500' },
                      { name: 'Chrome', type: 'Developer Mode', color: 'text-blue-500' },
                      { name: 'Edge', type: 'Developer Mode', color: 'text-blue-600' },
                      { name: 'Brave', type: 'Developer Mode', color: 'text-orange-600' },
                      { name: 'Arc', type: 'Developer Mode', color: 'text-purple-500' },
                      { name: 'Vivaldi', type: 'Developer Mode', color: 'text-red-500' },
                      { name: 'Opera', type: 'Developer Mode', color: 'text-red-600' },
                    ].map((b, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs">
                        <span className={`w-2 h-2 rounded-full ${b.color}`} />
                        <span className="text-foreground font-medium">{b.name}</span>
                        <span className="text-muted-foreground">({b.type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionItem>
          </motion.div>

          {/* ── How Forca Works ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <AccordionItem
              title="How Forca Works"
              icon={<Settings className="w-5 h-5" />}
            >
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Forca uses a <strong className="text-foreground">desktop app + browser extension</strong> architecture.
                  The desktop app is the brain; the extension is the enforcer.
                </p>

                <h3 className="text-sm font-semibold text-foreground pt-1">Architecture</h3>
                <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs space-y-1">
                  <div className="text-accent">Desktop App (Electron)</div>
                  <div className="pl-4">├─ Zone Engine &mdash; manages focus timers, breaks, pause/resume</div>
                  <div className="pl-4">├─ Calendar Service &mdash; monitors meetings, auto-triggers zones</div>
                  <div className="pl-4">├─ WebSocket Server (port 7432) &mdash; broadcasts zone state</div>
                  <div className="pl-4">├─ Blocker Service &mdash; maintains site lists</div>
                  <div className="pl-4">└─ Tray Service &mdash; system tray UI &amp; controls</div>
                  <div className="text-accent pt-1">Browser Extension (MV3)</div>
                  <div className="pl-4">├─ WebSocket Client &mdash; connects to desktop app</div>
                  <div className="pl-4">├─ DNR Rules &mdash; blocks sites via Declarative Net Request API</div>
                  <div className="pl-4">├─ Popup &mdash; shows zone status, allows pause/end</div>
                  <div className="pl-4">└─ Blocked Page &mdash; shown when navigating to a blocked site</div>
                </div>

                <h3 className="text-sm font-semibold text-foreground pt-1">How blocking works</h3>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>You start a focus zone in the desktop app.</li>
                  <li>The app broadcasts the zone state (active, sites to block) over WebSocket.</li>
                  <li>The extension receives the state and installs DNR blocking rules in the browser.</li>
                  <li>When you try to visit a blocked site, the extension redirects to a local blocked page.</li>
                  <li>When the zone ends (or you take a break), the rules are removed.</li>
                </ol>

                <Callout type="info">
                  DNR (Declarative Net Request) is the modern, performant way to block sites in MV3 extensions. Unlike the deprecated webRequest API, DNR rules are evaluated by the browser engine itself with near-zero overhead.
                </Callout>
              </div>
            </AccordionItem>
          </motion.div>

          {/* ── Focus Sessions ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <AccordionItem
              title="Focus Sessions"
              icon={<Timer className="w-5 h-5" />}
            >
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  A <strong className="text-foreground">focus zone</strong> is a timed session where specific websites are blocked.
                  Zones can be started manually or triggered automatically by your calendar.
                </p>

                <h3 className="text-sm font-semibold text-foreground">Creating a zone</h3>
                <StepList items={zoneSteps} />

                <h3 className="text-sm font-semibold text-foreground pt-1">During a session</h3>
                <ul className="space-y-1.5">
                  {[
                    'The timer counts down in real-time. If your computer sleeps, the timer pauses and resumes when you wake it.',
                    'You can pause a zone at any time (e.g., for an unexpected interruption). Paused time is added back.',
                    'Take breaks between zones. Forca reminds you when a break ends.',
                    'The system tray icon shows your current zone status at a glance.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-sm font-semibold text-foreground pt-1">Calendar integration</h3>
                <p>
                  Forca can monitor your calendar and automatically start zones after meetings end.
                  Configure this in <strong className="text-foreground">Settings &rarr; Calendar</strong>.
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                    <span><strong className="text-foreground">Google Calendar</strong> &mdash; click "Connect Google Calendar" and authorize access.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                    <span><strong className="text-foreground">iCal / Outlook / Apple Calendar</strong> &mdash; paste your calendar URL in the settings.</span>
                  </li>
                </ul>

                <Callout type="tip">
                  Zones are wall-clock based, not tick-based. This means your timer stays accurate even if your computer suspends or the process is throttled by the OS.
                </Callout>
              </div>
            </AccordionItem>
          </motion.div>

          {/* ── System Tray ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <AccordionItem
              title="System Tray"
              icon={<MonitorSmartphone className="w-5 h-5" />}
            >
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Forca runs in the system tray by default. Closing the window does <strong className="text-foreground">not</strong> quit the app &mdash;
                  it hides to the tray and continues running.
                </p>

                <h3 className="text-sm font-semibold text-foreground">Tray menu options</h3>
                <ul className="space-y-1.5">
                  {[
                    { label: 'Show', desc: 'Opens the main window.' },
                    { label: 'Current Zone', desc: 'Shows the active zone name and time remaining.' },
                    { label: 'Pause / Resume', desc: 'Pauses or resumes the active zone.' },
                    { label: 'End Zone', desc: 'Ends the current zone immediately and starts the break timer.' },
                    { label: 'Settings', desc: 'Opens the settings window.' },
                    { label: 'Quit', desc: 'Exits the app completely (stops all zones and disconnects the extension).' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                      <span><strong className="text-foreground">{item.label}</strong> &mdash; {item.desc}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-sm font-semibold text-foreground pt-1">Close behavior</h3>
                <p>
                  You can configure what happens when you close the window in <strong className="text-foreground">Settings &rarr; General</strong>:
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                    <span><strong className="text-foreground">Close to tray</strong> (default) &mdash; window hides, app keeps running.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                    <span><strong className="text-foreground">Minimize to tray</strong> &mdash; clicking minimize hides to tray instead of taskbar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                    <span><strong className="text-foreground">Launch minimized</strong> &mdash; starts hidden in the tray on system boot.</span>
                  </li>
                </ul>

                <Callout type="warning">
                  Always use the tray <strong className="text-foreground">Quit</strong> option to fully exit Forca. Closing the window alone only hides it.
                </Callout>
              </div>
            </AccordionItem>
          </motion.div>

          {/* ── Troubleshooting ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <AccordionItem
              title="Troubleshooting"
              icon={<Bug className="w-5 h-5" />}
              id="troubleshooting"
            >
              <div className="space-y-6">
                {[
                  {
                    title: 'Extension not connecting',
                    items: [
                      'Make sure the Forca desktop app is running.',
                      'Reload the extension on your browser\'s extensions page.',
                      'In Forca, go to Settings \u2192 Extension and click Reconnect.',
                      'Check that the WebSocket port (7432) is not blocked by a firewall.',
                      'Restart both the desktop app and your browser.',
                    ],
                  },
                  {
                    title: 'Websites not being blocked',
                    items: [
                      'Verify the extension is installed and enabled.',
                      'Check that the site is in your zone\'s blocked list.',
                      'Make sure the zone is active (not paused or ended).',
                      'If using Chromium, ensure Developer Mode is toggled on.',
                      'Try reloading the extension after making changes.',
                    ],
                  },
                  {
                    title: 'Extension disconnected after app quit',
                    items: [
                      'This is expected behavior. When the desktop app quits, the WebSocket disconnects.',
                      'The extension automatically cleans up blocking rules on disconnect.',
                      'Start the desktop app again and the extension will reconnect.',
                    ],
                  },
                  {
                    title: 'Calendar not detected',
                    items: [
                      'Go to Settings \u2192 Calendar and configure your provider.',
                      'For Google Calendar, click "Connect Google Calendar" and authorize access.',
                      'For iCal, paste your iCal URL in the settings.',
                      'Ensure your system clock is synchronized correctly.',
                    ],
                  },
                  {
                    title: 'Timer seems inaccurate',
                    items: [
                      'Forca uses wall-clock timing, so the timer should be accurate even after sleep.',
                      'If the timer appears off, end the zone and start a new one.',
                      'Check that your system clock is correct.',
                    ],
                  },
                  {
                    title: 'App won\'t start',
                    items: [
                      'Ensure you\'re on Windows 10+, macOS, or Linux (x64).',
                      'Try reinstalling the latest version from the download page.',
                      'Check the logs at %APPDATA%/forca/logs/ (Windows) or ~/Library/Logs/forca/ (macOS).',
                      'On Linux, ensure the AppImage is executable: chmod +x Forca-*.AppImage',
                    ],
                  },
                  {
                    title: 'Extension blocked sites remain after quitting',
                    items: [
                      'This can happen if the app crashes without a clean shutdown.',
                      'Reload the extension on your browser\'s extensions page to clear stale rules.',
                      'Or disable and re-enable the extension.',
                    ],
                  },
                ].map((group, gi) => (
                  <div key={gi}>
                    <h3 className="text-sm font-semibold text-foreground mb-2">{group.title}</h3>
                    <ul className="space-y-1.5">
                      {group.items.map((item, ii) => (
                        <li key={ii} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-accent-hover"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </AccordionItem>
          </motion.div>

          {/* ── Privacy & Security ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <AccordionItem
              title="Privacy & Security"
              icon={<Shield className="w-5 h-5" />}
            >
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Forca is designed to be <strong className="text-foreground">private by default</strong>. Your data never leaves your machine.
                </p>

                <h3 className="text-sm font-semibold text-foreground">Data storage</h3>
                <ul className="space-y-1.5">
                  {[
                    'All settings, zones, and scores are stored locally using electron-store.',
                    'No analytics, telemetry, or tracking of any kind.',
                    'No data is sent to any server unless you explicitly enable optional sync.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <EyeOff className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-sm font-semibold text-foreground pt-1">Network connections</h3>
                <ul className="space-y-1.5">
                  {[
                    'Local WebSocket on port 7432 (desktop app \u2194 extension).',
                    'Auto-update check on startup (GitHub Releases API).',
                    'Optional calendar API calls (Google Calendar / iCal).',
                    'Optional Firebase sync (if configured in Settings).',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Globe className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-sm font-semibold text-foreground pt-1">Security</h3>
                <ul className="space-y-1.5">
                  {[
                    'Electron\'s context isolation and preload bridge with channel whitelist.',
                    'OAuth tokens are stripped before any cloud sync.',
                    'Open source (MIT License) \u2014 verify the code yourself.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Lock className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Callout type="tip">
                  See the full <a href="/privacy/" className="text-accent hover:text-accent-hover underline underline-offset-2">privacy policy</a> for details.
                </Callout>
              </div>
            </AccordionItem>
          </motion.div>

          {/* ── FAQ ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <AccordionItem
              title="FAQ"
              icon={<HelpCircle className="w-5 h-5" />}
            >
              <div className="divide-y divide-border">
                {[
                  {
                    q: 'Is Forca free?',
                    a: 'Yes. Forca is completely free and open source under the MIT License.',
                  },
                  {
                    q: 'Do I need an account?',
                    a: 'No. Forca is local-first. Everything runs on your machine with no account required.',
                  },
                  {
                    q: 'Does it work on macOS or Linux?',
                    a: (
                      <>
                        Yes. Forca is available on Windows, macOS, and Linux. The browser extension works on all
                        platforms. Download the latest version for your OS from the{' '}
                        <a href={import.meta.env.BASE_URL + 'download/'} className="text-accent hover:text-accent-hover underline underline-offset-2">download page</a>.
                      </>
                    ),
                  },
                  {
                    q: 'Can I use Forca offline?',
                    a: 'Yes. The desktop app and extension work entirely offline. Internet is only needed for calendar integration (optional) and update checks.',
                  },
                  {
                    q: 'How do I update Forca?',
                    a: (
                      <>
                        Forca checks for updates automatically on startup. When an update is available, you&apos;ll be prompted to download and install it. You can also download the latest version from the{' '}
                        <a href={import.meta.env.BASE_URL + 'download/'} className="text-accent hover:text-accent-hover underline underline-offset-2">download page</a>.
                      </>
                    ),
                  },
                  {
                    q: 'Is my data private?',
                    a: (
                      <>
                        Yes. All data is stored locally on your computer. No data is sent to any server. Forca is open source, so you can verify this yourself. See our{' '}
                        <a href={import.meta.env.BASE_URL + 'privacy/'} className="text-accent hover:text-accent-hover underline underline-offset-2">privacy page</a> for details.
                      </>
                    ),
                  },
                  {
                    q: 'Can I use Forca with multiple browsers?',
                    a: 'Yes. You can install the extension in multiple browsers. All connected extensions receive zone state from the desktop app simultaneously.',
                  },
                  {
                    q: 'What happens if I close the desktop app while a zone is active?',
                    a: 'The extension detects the disconnection and automatically removes all blocking rules. Sites become accessible again. Start the app and the extension will reconnect.',
                  },
                  {
                    q: 'Can I contribute?',
                    a: (
                      <>
                        Absolutely! Forca is open source. Visit the{' '}
                        <a href="https://github.com/3iiik/forca" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline underline-offset-2">GitHub repository</a>{' '}
                        to submit issues, feature requests, or pull requests.
                      </>
                    ),
                  },
                ].map((faq, i) => (
                  <div key={i} className="py-3 first:pt-0 last:pb-0">
                    <h3 className="text-sm font-semibold text-foreground mb-1">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </AccordionItem>
          </motion.div>

        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="text-center mt-8"
        >
          <DownloadCTAButton size="lg" />
        </motion.div>
      </section>
    </div>
  );
}
