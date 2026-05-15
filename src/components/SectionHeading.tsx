import type { ReactNode } from "react";

/**
 * The shared section masthead — keeps every block below the editor reading
 * like a page from the same magazine: grotesque kicker, light serif title,
 * an optional italic standfirst.
 */
export function SectionHeading({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="font-sans text-xs uppercase tracking-[0.28em] text-ink-faint">
        {kicker}
      </span>
      <h2 className="font-serif text-3xl font-light leading-[1.12] text-ink sm:text-[2.5rem]">
        {title}
      </h2>
      {children && (
        <p className="max-w-[34rem] font-serif text-base italic leading-relaxed text-ink-soft">
          {children}
        </p>
      )}
    </div>
  );
}
