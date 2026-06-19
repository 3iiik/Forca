import { app } from 'electron';
import fs from 'fs';
import path from 'path';

const FUNNEL_STEPS: Array<{ label: string; event: string }> = [
  { label: 'Step 1 viewed', event: 'onboarding_step_1_view' },
  { label: 'Step 2 viewed', event: 'onboarding_step_2_view' },
  { label: 'Browser selected', event: 'onboarding_browser_selected' },
  { label: 'Extension connected', event: 'onboarding_extension_connected' },
  { label: 'Completed', event: 'onboarding_completed' },
];

export interface FunnelStepResult {
  label: string;
  count: number;
  conversion: number | null;
  dropOff: number | null;
}

export function trackOnboarding(event: string, properties?: Record<string, unknown>) {
  try {
    const dir = path.join(app.getPath('userData'), 'analytics');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const line = JSON.stringify({
      event,
      properties: properties ?? {},
      ts: new Date().toISOString(),
    });
    fs.appendFileSync(path.join(dir, 'onboarding.jsonl'), line + '\n');
  } catch {
    // analytics must never crash the app
  }
}

export function getOnboardingEvents(): Array<{ event: string; properties: Record<string, unknown>; ts: string }> {
  try {
    const filePath = path.join(app.getPath('userData'), 'analytics', 'onboarding.jsonl');
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf-8');
    return raw.split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

export function getOnboardingFunnel(): FunnelStepResult[] {
  const events = getOnboardingEvents();
  const total = events.length;

  if (total < 10) return [];

  const counts: Record<string, number> = {};
  for (const { event } of events) {
    counts[event] = (counts[event] || 0) + 1;
  }

  const firstCount = counts[FUNNEL_STEPS[0].event] || 0;
  if (firstCount === 0) return [];

  return FUNNEL_STEPS.map((step, i) => {
    const count = counts[step.event] || 0;
    const conversion = i === 0 ? null : Math.round((count / firstCount) * 100);
    const dropOff = i === 0 ? null : Math.round(((firstCount - count) / firstCount) * 100);
    return { label: step.label, count, conversion, dropOff };
  });
}
