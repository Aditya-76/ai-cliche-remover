import type { ReactNode } from "react";

import { SectionHeading } from "@/components/SectionHeading";

/**
 * Three printed "editor's columns": a marked-up manuscript on the left, the
 * clean published version on the right. The marks reuse the same editor's-mark
 * classes from globals.css, applied to plain spans (no tooltip, no animation).
 */

interface Example {
  genre: string;
  before: ReactNode;
  after: string;
}

const EXAMPLES: Example[] = [
  {
    genre: "A landing page",
    before: (
      <>
        <span className="mark-cliche">In today&rsquo;s fast-paced world</span>
        , our <span className="mark-cliche">cutting-edge</span> platform
        empowers teams to <span className="mark-cliche">delve into</span> a{" "}
        <span className="mark-cliche">rich tapestry of</span> data.{" "}
        <span className="mark-cliche">It&rsquo;s important to note</span> that
        we <span className="mark-cliche">leverage</span>{" "}
        <span className="mark-cliche">synergy</span> to{" "}
        <span className="mark-cliche">unlock the power of</span> your workflow.
      </>
    ),
    after:
      "Our platform helps teams make sense of their data. Less busywork, clearer decisions — that's the whole pitch.",
  },
  {
    genre: "An opinion column",
    before: (
      <>
        <span className="mark-hedge">Arguably</span>, remote work is{" "}
        <span className="mark-hedge">perhaps</span> the most significant shift
        of our era. <span className="mark-transition">Furthermore</span>,{" "}
        <span className="mark-hedge">it could be argued that</span>{" "}
        productivity has quietly improved.{" "}
        <span className="mark-transition">Moreover</span>,{" "}
        <span className="mark-hedge">many would say</span> the office is
        already dead.
      </>
    ),
    after:
      "Remote work is the biggest shift of our working era. Productivity has quietly improved, and plenty of people think the office is already finished.",
  },
  {
    genre: "A product update",
    before: (
      <>
        The release is{" "}
        <span className="mark-rhythm">fast, stable, and thoughtful</span>. Our
        team <span className="mark-rhythm">— focused, tireless, and bold —</span>{" "}
        shipped it ahead of schedule.{" "}
        <span className="mark-rhythm">
          We tested every flow, we fixed every bug, we sweated every detail.
        </span>
      </>
    ),
    after:
      "The release is fast and stable. Our team shipped it ahead of schedule — they sweated the details, especially the bug fixes.",
  },
];

export function BeforeAfter() {
  return (
    <section className="flex flex-col gap-10">
      <SectionHeading kicker="Before &amp; after" title="See it on real prose.">
        Three drafts that reek of the machine, and the same three after the red
        pencil. Hover the marks in the editor above to see why each one got
        flagged.
      </SectionHeading>

      <div className="flex flex-col gap-6">
        {EXAMPLES.map((example) => (
          <article
            key={example.genre}
            className="paper-sheet overflow-hidden rounded-md"
          >
            <div className="border-b border-rule px-7 py-3">
              <span className="font-sans text-xs uppercase tracking-[0.16em] text-ink-faint">
                {example.genre}
              </span>
            </div>
            <div className="grid md:grid-cols-2">
              <div className="border-b border-rule bg-paper px-7 py-6 md:border-b-0 md:border-r">
                <span className="mb-3 block font-sans text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint">
                  Before — marked up
                </span>
                <p className="font-serif text-[0.98rem] leading-[1.9] text-ink">
                  {example.before}
                </p>
              </div>
              <div className="px-7 py-6">
                <span className="mb-3 block font-sans text-[0.65rem] uppercase tracking-[0.18em] text-oxblood">
                  After — clean
                </span>
                <p className="font-serif text-[0.98rem] leading-[1.9] text-ink">
                  {example.after}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
