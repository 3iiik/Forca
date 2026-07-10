import React from 'react';

const si = {
  windows: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.801" />
    </svg>
  ),
  apple: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  ),
  linux: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C9.35 1.2 6.9 3.77 5.7 6.57c-.56 1.32-.6 2.4-.3 3.6.43 1.76 1.7 3.08 2.58 3.8.88.73 1.14 1.1 1.02 2-.12.88-.5 1.63-1.02 2.53-.52.9-.68 1.9-.34 3 .52 1.7 2.1 2.5 3.6 2.5h1.5c1.5 0 3.07-.8 3.6-2.5.35-1.1.18-2.1-.34-3-.52-.9-.9-1.65-1.02-2.53-.12-.9.14-1.27 1.02-2 .88-.73 2.15-2.04 2.58-3.8.3-1.2.27-2.28-.3-3.6C17.1 3.77 14.65 1.2 12 0zm.02 2.44c1.06.42 2.18 1.44 2.9 2.72.7 1.3.97 2.63.97 3.6 0 .95-.17 1.73-.6 2.34-.45.64-1.05 1.1-1.58 1.42-.53.32-.87.56-1 .96-.12.38.04.8.3 1.23.26.43.55.86.75 1.38.18.48.24 1.02.16 1.56-.07.5-.26.96-.5 1.36-.24.4-.52.73-.8.97.1.18.22.37.33.57.9 1.58-.1 3.36-1.44 3.36h-.9c-1.36 0-2.37-1.78-1.45-3.36.1-.2.23-.4.33-.57-.28-.24-.56-.56-.8-.97-.24-.4-.43-.87-.5-1.36-.08-.54-.02-1.08.16-1.56.2-.52.5-.95.75-1.38.26-.43.42-.85.3-1.23-.13-.4-.47-.64-1-.96-.53-.32-1.13-.78-1.58-1.42-.43-.61-.6-1.4-.6-2.34 0-.97.27-2.3.97-3.6.72-1.28 1.84-2.3 2.9-2.72z" />
    </svg>
  ),
};

const lu = {
  calendarClock: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
      <path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
      <path d="M18 16a2 2 0 1 1 4 0c0 .8-.5 1.5-1 2l-3 3.5" />
      <path d="M17 21.5h3" />
    </svg>
  ),
  shieldBan: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M4.93 4.93l14.14 14.14" />
    </svg>
  ),
  chartBar: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16v-3" /><path d="M12 16v-7" /><path d="M17 16v-5" />
    </svg>
  ),
  lock: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  layers: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  monitor: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  arrowRight: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  check: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  x: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18" /><path d="M6 6l12 12" />
    </svg>
  ),
  firefox: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.824 7.287c.008 0 .004 0 0 0zm-2.8-1.4c.006 0 .003 0 0 0zm16.754 2.161c-.505-1.215-1.53-2.528-2.333-2.943.654 1.283 1.033 2.57 1.177 3.53l.002.02c-1.314-3.278-3.544-4.6-5.366-7.477-.091-.147-.184-.292-.273-.446a3.545 3.545 0 01-.13-.24 2.118 2.118 0 01-.172-.46.03.03 0 00-.027-.03.038.038 0 00-.021 0l-.006.001a.037.037 0 00-.01.005L15.624 0c-2.585 1.515-3.657 4.168-3.932 5.856a6.197 6.197 0 00-2.305.587.297.297 0 00-.147.37c.057.162.24.24.396.17a5.622 5.622 0 012.008-.523l.067-.005a5.847 5.847 0 011.957.222l.095.03a5.816 5.816 0 01.616.228c.08.036.16.073.238.112l.107.055a5.835 5.835 0 01.368.211 5.953 5.953 0 012.034 2.104c-.62-.437-1.733-.868-2.803-.681 4.183 2.09 3.06 9.292-2.737 9.02a5.164 5.164 0 01-1.513-.292 4.42 4.42 0 01-.538-.232c-1.42-.735-2.593-2.121-2.74-3.806 0 0 .537-2 3.845-2 .357 0 1.38-.998 1.398-1.287-.005-.095-2.029-.9-2.817-1.677-.422-.416-.622-.616-.8-.767a3.47 3.47 0 00-.301-.227 5.388 5.388 0 01-.032-2.842c-1.195.544-2.124 1.403-2.8 2.163h-.006c-.46-.584-.428-2.51-.402-2.913-.006-.025-.343.176-.389.206-.406.29-.787.616-1.136.974-.397.403-.76.839-1.085 1.303a9.816 9.816 0 00-1.562 3.52c-.003.013-.11.487-.19 1.073-.013.09-.026.181-.037.272a7.8 7.8 0 00-.069.667l-.002.034-.023.387-.001.06C.386 18.795 5.593 24 12.016 24c5.752 0 10.527-4.176 11.463-9.661.02-.149.035-.298.052-.448.232-1.994-.025-4.09-.753-5.844z" />
    </svg>
  ),
};

export const Icons = {
  Windows: ({ size = 24 }: { size?: number }) => <>{si.windows(size)}</>,
  Apple: ({ size = 24 }: { size?: number }) => <>{si.apple(size)}</>,
  Linux: ({ size = 24 }: { size?: number }) => <>{si.linux(size)}</>,
  CalendarClock: ({ size = 24 }: { size?: number }) => <>{lu.calendarClock(size)}</>,
  ShieldBan: ({ size = 24 }: { size?: number }) => <>{lu.shieldBan(size)}</>,
  ChartBar: ({ size = 24 }: { size?: number }) => <>{lu.chartBar(size)}</>,
  Lock: ({ size = 24 }: { size?: number }) => <>{lu.lock(size)}</>,
  Layers: ({ size = 24 }: { size?: number }) => <>{lu.layers(size)}</>,
  Monitor: ({ size = 24 }: { size?: number }) => <>{lu.monitor(size)}</>,
  ArrowRight: ({ size = 24 }: { size?: number }) => <>{lu.arrowRight(size)}</>,
  Check: ({ size = 24 }: { size?: number }) => <>{lu.check(size)}</>,
  X: ({ size = 24 }: { size?: number }) => <>{lu.x(size)}</>,
  Firefox: ({ size = 24 }: { size?: number }) => <>{lu.firefox(size)}</>,
};
