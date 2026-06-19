import React from 'react';
import DisplayCards from './ui/display-cards';

const featureCards = [
  {
    image: '/Forca/screenshots/dashboard.png',
    title: 'Automatic Activation',
    description: 'Focus zones start automatically when your meetings end — no toggling, no reminders, no friction.',
    titleClassName: 'text-purple-300',
    className:
      'hover:-translate-y-4 hover:shadow-2xl hover:shadow-purple-600/10 z-30',
  },
  {
    image: '/Forca/screenshots/zone-creation.png',
    title: 'Create Focus Zones',
    description: 'Name your zone, set a duration, and choose which sites to block. Multiple zones for different work modes.',
    titleClassName: 'text-purple-300',
    className:
      'translate-x-4 md:translate-x-8 translate-y-2 md:translate-y-4 hover:-translate-y-2 hover:shadow-xl z-20',
  },
  {
    image: '/Forca/screenshots/blocked-page.png',
    title: 'Website Blocking',
    description: 'Block distracting sites during focus sessions. YouTube, Reddit, Twitter — gone until time is up.',
    titleClassName: 'text-purple-300',
    className:
      'translate-x-8 md:translate-x-16 translate-y-4 md:translate-y-8 hover:translate-y-2 hover:shadow-lg z-10',
  },
  {
    image: '/Forca/screenshots/onboarding-complete.png',
    title: 'Setup in Minutes',
    description: 'Install the app, add browser extensions, create your first zone. Fast setup, no account required.',
    titleClassName: 'text-purple-300',
    className:
      'translate-x-12 md:translate-x-24 translate-y-6 md:translate-y-12 hover:translate-y-6 hover:shadow-md z-0',
  },
];

export function ForcaFeatures() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Everything you need to stay focused
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto">
            Forca combines automatic triggers, powerful blocking, and insights to help you do your best work.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            <DisplayCards cards={featureCards} />
          </div>
        </div>
      </div>
    </section>
  );
}
