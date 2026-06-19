import React from 'react';
import { Zap, Shield, BarChart3 } from 'lucide-react';
import DisplayCards from './ui/display-cards';

const featureCards = [
  {
    icon: <Zap className="size-5 text-blue-300" />,
    title: 'Automatic Activation',
    description: 'Focus zones auto-start when your meetings end. No toggling, no reminders, no friction.',
    date: 'Calendar-aware · Google · iCal',
    iconClassName: 'text-blue-400',
    titleClassName: 'text-blue-400',
    className:
      '[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[""] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0',
  },
  {
    icon: <Shield className="size-5 text-emerald-300" />,
    title: 'Website Blocking',
    description: 'Block distracting sites during focus sessions. YouTube, Reddit, Twitter — gone.',
    date: 'Firefox · Chrome · Edge · Brave',
    iconClassName: 'text-emerald-400',
    titleClassName: 'text-emerald-400',
    className:
      '[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[""] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0',
  },
  {
    icon: <BarChart3 className="size-5 text-amber-300" />,
    title: 'Focus Analytics',
    description: 'Track your deep work hours, streaks, and patterns over time. See your progress.',
    date: 'Daily · Weekly · Monthly reports',
    iconClassName: 'text-amber-400',
    titleClassName: 'text-amber-400',
    className:
      '[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10',
  },
];

export function ForcaFeatures() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Everything you need to stay focused
          </h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Forca combines automatic triggers, powerful blocking, and insights to help you do your best work.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <DisplayCards cards={featureCards} />
          </div>
        </div>
      </div>
    </section>
  );
}
