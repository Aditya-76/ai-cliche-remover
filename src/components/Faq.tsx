import { ChevronDown } from "lucide-react";

import { SectionHeading } from "@/components/SectionHeading";

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Does this bypass AI detectors?",
    answer:
      "No, and that's not what it's for. This makes your writing not sound like AI to human readers.",
  },
  {
    question: "Will there be a Chrome extension?",
    answer:
      "Yes — it's the next thing being built. Join the waitlist above to get notified.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. The free tier works without signup. The paid tier uses your Stripe email.",
  },
  {
    question: "What language does it support?",
    answer: "English only, for now.",
  },
  {
    question: "Is my text stored?",
    answer:
      "No. Your text is sent to Claude for processing and is not saved anywhere.",
  },
];

export function Faq() {
  return (
    <section className="flex flex-col gap-10">
      <SectionHeading kicker="Questions" title="The fine print, in plain words." />

      <div className="mx-auto w-full max-w-[44rem]">
        {FAQS.map((faq) => (
          <details
            key={faq.question}
            className="group border-b border-rule first:border-t"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
              <span className="font-serif text-lg leading-snug text-ink">
                {faq.question}
              </span>
              <ChevronDown
                aria-hidden
                className="size-4 shrink-0 text-ink-faint transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <p className="pb-5 pr-10 font-sans text-sm leading-relaxed text-ink-soft">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
