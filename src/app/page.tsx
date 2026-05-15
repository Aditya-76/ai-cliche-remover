import { cookies } from "next/headers";

import { Editor } from "@/components/Editor";

export default async function Page() {
  // Free tier vs. paid tier is read from a simple "paid" cookie.
  const cookieStore = await cookies();
  const isPaid = cookieStore.get("paid")?.value === "true";

  return (
    <main className="relative mx-auto w-full max-w-[1520px] px-6 pb-24 pt-14 sm:px-10 lg:pt-20">
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

      <footer className="mx-auto mt-16 max-w-[720px] text-center font-sans text-xs text-ink-faint">
        Marked up by Claude Haiku. Your draft is only sent off when you ask for
        the markup.
      </footer>
    </main>
  );
}
