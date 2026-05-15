import { cookies } from "next/headers";

import { BeforeAfter } from "@/components/BeforeAfter";
import { Editor } from "@/components/Editor";
import { Faq } from "@/components/Faq";
import { Pricing } from "@/components/Pricing";
import { SiteFooter } from "@/components/SiteFooter";
import { Waitlist } from "@/components/Waitlist";

export default async function Page() {
  // Free tier vs. paid tier is read from a simple "paid" cookie.
  const cookieStore = await cookies();
  const isPaid = cookieStore.get("paid")?.value === "true";

  return (
    <main className="relative w-full">
      {/* The editor — full magazine spread. */}
      <div className="mx-auto w-full max-w-[1520px] px-6 pt-14 sm:px-10 lg:pt-20">
        <header className="mx-auto mb-12 flex max-w-[720px] flex-col items-center text-center lg:mb-16">
          <span className="font-sans text-xs uppercase tracking-[0.32em] text-ink-faint">
            An editorial tool
          </span>
          <h1 className="mt-4 font-serif text-[2.6rem] font-light leading-[1.08] text-ink sm:text-[3.4rem]">
            The AI Cliché Remover
          </h1>
          <p className="mt-4 max-w-[34rem] font-serif text-lg italic leading-relaxed text-ink-soft">
            Paste your draft. Get every cliché, hedge, empty transition, and
            rhythm tell marked up in the margin — then copy back a version that
            still sounds like you wrote it.
          </p>
          <div className="mt-7 h-px w-16 bg-rule-strong" />
        </header>

        <Editor isPaid={isPaid} />
      </div>

      {/* A thin rule, then the rest of the issue — set in a narrower column. */}
      <hr className="mx-auto mt-20 h-px w-full max-w-[920px] border-0 bg-rule" />

      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-24 px-6 py-20 sm:px-10">
        <BeforeAfter />
        <Pricing />
        <Waitlist />
        <Faq />
      </div>

      <SiteFooter />
    </main>
  );
}
