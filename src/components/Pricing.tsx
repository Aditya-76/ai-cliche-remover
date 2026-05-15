import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";

const FEATURES = [
  "10,000 words per check",
  "Unlimited checks",
  "No signup needed",
  "Cancel anytime",
];

export function Pricing() {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <section className="flex flex-col gap-10">
      <SectionHeading kicker="The subscription" title="One tier. No tiers, really.">
        Priced like a magazine you actually read — not a SaaS pricing table with
        five columns and an asterisk.
      </SectionHeading>

      <article className="paper-sheet mx-auto flex w-full max-w-[28rem] flex-col items-center gap-6 rounded-md px-9 py-10 text-center">
        <span className="font-sans text-xs uppercase tracking-[0.2em] text-oxblood">
          Unlimited
        </span>

        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-6xl font-light leading-none text-ink">
            $7
          </span>
          <span className="font-sans text-sm text-ink-soft">/ month</span>
        </div>

        <div className="h-px w-12 bg-rule-strong" />

        <ul className="flex flex-col gap-2.5 text-left">
          {FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex items-baseline gap-3 font-serif text-[1.05rem] text-ink"
            >
              <span aria-hidden className="text-oxblood">
                &mdash;
              </span>
              {feature}
            </li>
          ))}
        </ul>

        {paymentLink ? (
          <Button
            asChild
            variant="ink"
            size="lg"
            className="mt-1 w-full tracking-[0.04em]"
          >
            <a href={paymentLink} target="_blank" rel="noopener noreferrer">
              Start the subscription
            </a>
          </Button>
        ) : (
          <p className="font-sans text-xs text-oxblood">
            Set NEXT_PUBLIC_STRIPE_PAYMENT_LINK to enable checkout.
          </p>
        )}

        <p className="font-sans text-xs text-ink-faint">
          No account · billed securely through Stripe
        </p>
      </article>
    </section>
  );
}
