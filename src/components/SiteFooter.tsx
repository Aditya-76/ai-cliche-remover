export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto flex w-full max-w-[920px] flex-col items-center gap-4 px-6 py-14 text-center sm:px-10">
        <p className="font-serif text-xl text-ink">The AI Cliché Remover</p>
        <p className="max-w-[26rem] font-sans text-sm leading-relaxed text-ink-soft">
          An editorial tool for writing that doesn&rsquo;t sound like a machine
          made it.
        </p>

        <a
          href="https://x.com/aditya7682"
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans text-sm text-ink-soft underline-offset-4 transition-colors hover:text-oxblood hover:underline"
        >
          @aditya7682
        </a>

        <p className="mt-2 font-sans text-xs tracking-wide text-ink-faint">
          Built with Claude · Marked up by Claude Haiku · &copy; {year}
        </p>
      </div>
    </footer>
  );
}
