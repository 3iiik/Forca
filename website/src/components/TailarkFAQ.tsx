import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const faqItems = [
  {
    id: 'item-1',
    question: 'Is Forca free?',
    answer: 'Yes. Forca is completely free and open source under the MIT License. There are no paid plans, subscriptions, hidden costs, or premium features. The app, browser extensions, and all future updates are free forever.',
  },
  {
    id: 'item-2',
    question: 'Which browsers are supported?',
    answer: 'Forca provides a Firefox extension available on AMO. Chromium-based browsers (Chrome, Edge, Brave, Arc, Vivaldi, Opera) are supported via Developer Mode installation. The extension blocks websites during active focus sessions across all supported browsers.',
  },
  {
    id: 'item-3',
    question: 'Does Forca require an account?',
    answer: 'No. Forca is local-first. Everything runs on your machine with no cloud dependency. No account creation, no sign-up, no personal data sent to servers. Your focus data stays on your device.',
  },
  {
    id: 'item-4',
    question: 'Does my data leave my device?',
    answer: 'No. Forca is designed to be privacy-first. All focus session data, zone configurations, and usage statistics are stored locally on your machine. The only network requests are for checking the latest version and syncing calendar events (if you enable calendar integration).',
  },
  {
    id: 'item-5',
    question: 'Does automatic activation require Google Calendar?',
    answer: 'Automatic activation works with both Google Calendar and iCal. You can choose which calendar to integrate. If you prefer, you can also start focus zones manually at any time — calendar integration is completely optional.',
  },
  {
    id: 'item-6',
    question: 'Does Forca support Linux?',
    answer: 'Yes! Forca fully supports Linux alongside Windows and macOS. The desktop app and all browser extensions work on Linux. Linux is a first-class platform — not an afterthought.',
  },
  {
    id: 'item-7',
    question: 'How does Forca protect my privacy?',
    answer: 'Forca is designed privacy-first. All data — focus sessions, zone configurations, usage stats — is stored locally on your device. No cloud sync, no accounts, no tracking. The only network requests are for checking version updates and optional calendar sync.',
  },
  {
    id: 'item-8',
    question: 'What platforms does Forca support?',
    answer: 'Forca runs on Windows, macOS, and Linux. The desktop app is available on all three platforms, and browser extensions work across Firefox and Chromium-based browsers (Chrome, Edge, Brave, Arc, Vivaldi, Opera).',
  },
];

export default function TailarkFAQ() {
  return (
    <section className="py-16 md:py-24" id="faq">
      <div className="mx-auto max-w-5xl px-6 md:px-12">
        <div>
          <h2 className="text-foreground text-4xl font-semibold tracking-tight">Frequently asked questions</h2>
          <p className="text-muted-foreground mt-4 text-balance text-lg max-w-xl">
            Quick answers to common questions about Forca, its features, and how it works.
          </p>
        </div>

        <div className="mt-12">
          <Accordion
            type="single"
            collapsible
            className="bg-card w-full rounded-[var(--radius)] border border-border px-8 py-3 shadow-sm"
          >
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-dotted border-white/10"
              >
                <AccordionTrigger className="cursor-pointer text-base hover:no-underline data-[state=open]:text-accent">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="text-muted-foreground mt-6 text-center">
            Can't find what you're looking for?{' '}
            <a
              href="https://github.com/3iiik/forca/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-medium hover:underline"
            >
              Open a discussion on GitHub
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
