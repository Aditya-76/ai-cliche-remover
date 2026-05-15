"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

// One year, in seconds.
const ONE_YEAR = 60 * 60 * 24 * 365;

export default function SuccessPage() {
  useEffect(() => {
    // Mark this browser as paid. Simple v1 approach — a plain client-set
    // cookie, no httpOnly. The home page reads it server-side to lift limits.
    document.cookie = `paid=true; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
  }, []);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[720px] flex-col items-center justify-center px-6 py-20 text-center">
      <span className="font-sans text-xs uppercase tracking-[0.32em] text-ink-faint">
        Payment received
      </span>
      <h1 className="mt-4 font-serif text-[2.6rem] font-light leading-[1.08] text-ink sm:text-[3.2rem]">
        Thank you — you&rsquo;re on the paid tier.
      </h1>
      <p className="mt-4 max-w-[34rem] font-serif text-lg italic leading-relaxed text-ink-soft">
        The daily limit is lifted and your per-draft cap is now 10,000 words.
        Go put the red pencil to work.
      </p>

      <div className="mt-7 h-px w-16 bg-rule-strong" />

      <Button
        asChild
        variant="ink"
        size="lg"
        className="mt-9 tracking-[0.04em]"
      >
        <Link href="/">
          <ArrowLeft className="size-4" />
          Back to the editor
        </Link>
      </Button>
    </main>
  );
}
