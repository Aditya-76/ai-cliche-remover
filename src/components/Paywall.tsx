"use client";

import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FREE_DAILY_LIMIT } from "@/lib/usage";

/**
 * Shown in place of the "Clean it up" button once a free user has spent their
 * daily edits. One call to action only: the Stripe payment link.
 */
export function Paywall() {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <div className="paper-sheet flex flex-col gap-4 rounded-md border-oxblood/35 px-7 py-6">
      <div className="flex flex-col gap-2">
        <span className="font-sans text-xs uppercase tracking-[0.18em] text-oxblood">
          Daily limit reached
        </span>
        <h3 className="font-serif text-xl leading-snug text-ink">
          That&rsquo;s all {FREE_DAILY_LIMIT} free edits for today.
        </h3>
        <p className="font-sans text-sm leading-relaxed text-ink-soft">
          The paid tier removes the daily cap and raises the per-draft limit to
          10,000 words. Your free count resets at midnight if you&rsquo;d
          rather wait it out.
        </p>
      </div>

      {paymentLink ? (
        <Button
          asChild
          variant="ink"
          size="lg"
          className="self-start tracking-[0.04em]"
        >
          <a href={paymentLink} target="_blank" rel="noopener noreferrer">
            Upgrade to keep editing
            <ArrowUpRight className="size-4" />
          </a>
        </Button>
      ) : (
        <p className="font-sans text-xs text-oxblood">
          The payment link isn&rsquo;t configured yet — set{" "}
          <code className="font-mono">NEXT_PUBLIC_STRIPE_PAYMENT_LINK</code>.
        </p>
      )}
    </div>
  );
}
