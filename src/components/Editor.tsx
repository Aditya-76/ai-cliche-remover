"use client";

import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { Check, Copy, Pencil } from "lucide-react";

import { Highlight } from "@/components/Highlight";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CleanResponse, Flagged } from "@/lib/types";

const FREE_WORD_LIMIT = 2_000;
const PAID_WORD_LIMIT = 10_000;

function countWords(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

type Segment =
  | { kind: "text"; value: string }
  | { kind: "mark"; value: string; flag: Flagged; order: number };

/**
 * Split the submitted text into plain runs and flagged runs.
 *
 * The model returns startIdx/endIdx, but it's an LLM — so each span is
 * verified against the phrase, falls back to a forward search when the
 * indices have drifted, and is dropped if it overlaps an earlier mark or
 * lands out of bounds. Whatever can't be placed simply isn't highlighted.
 */
function buildSegments(text: string, flagged: Flagged[]): Segment[] {
  const sorted = [...flagged].sort((a, b) => a.startIdx - b.startIdx);
  const resolved: { start: number; end: number; flag: Flagged }[] = [];
  let searchFrom = 0;

  for (const flag of sorted) {
    if (!flag.phrase) continue;
    let start = flag.startIdx;
    let end = flag.endIdx;

    if (text.slice(start, end) !== flag.phrase) {
      const found = text.indexOf(flag.phrase, searchFrom);
      if (found === -1) continue;
      start = found;
      end = found + flag.phrase.length;
    }

    if (start < searchFrom || end <= start || end > text.length) continue;
    resolved.push({ start, end, flag });
    searchFrom = end;
  }

  const segments: Segment[] = [];
  let pos = 0;
  resolved.forEach(({ start, end, flag }, order) => {
    if (start > pos) {
      segments.push({ kind: "text", value: text.slice(pos, start) });
    }
    segments.push({ kind: "mark", value: text.slice(start, end), flag, order });
    pos = end;
  });
  if (pos < text.length) {
    segments.push({ kind: "text", value: text.slice(pos) });
  }
  return segments;
}

function ColumnHeading({
  step,
  title,
  caption,
}: {
  step: string;
  title: string;
  caption: string;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-sans text-xs uppercase tracking-[0.22em] text-ink-faint">
        {step}
      </span>
      <div className="flex flex-col gap-0.5">
        <h2 className="font-serif text-xl leading-none text-ink">{title}</h2>
        <p className="font-sans text-xs text-ink-soft">{caption}</p>
      </div>
    </div>
  );
}

interface EditorProps {
  isPaid: boolean;
}

export function Editor({ isPaid }: EditorProps) {
  const [text, setText] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const [result, setResult] = useState<CleanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const wordLimit = isPaid ? PAID_WORD_LIMIT : FREE_WORD_LIMIT;
  const wordCount = useMemo(() => countWords(text), [text]);
  const atLimit = wordCount >= wordLimit;

  const segments = useMemo(
    () => (result ? buildSegments(submittedText, result.flagged) : []),
    [result, submittedText],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const next = event.target.value;
      // Let edits that shrink the text through; block growth past the limit.
      if (countWords(next) > wordLimit && next.length > text.length) return;
      setText(next);
    },
    [text.length, wordLimit],
  );

  const handleClean = useCallback(async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setCopied(false);
    const sent = text;
    try {
      const res = await fetch("/api/clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sent }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          (data && typeof data.error === "string" && data.error) ||
            `Something went wrong (${res.status}).`,
        );
        return;
      }
      if (!data || !Array.isArray(data.flagged)) {
        setError("The editor sent back something unreadable. Try again.");
        return;
      }
      setSubmittedText(sent);
      setResult(data as CleanResponse);
    } catch {
      setError(
        "Couldn't reach the editor. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [text, loading]);

  const handleCopy = useCallback(async () => {
    if (!result?.rewritten) return;
    try {
      await navigator.clipboard.writeText(result.rewritten);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      setError("Couldn't reach the clipboard — copy it by hand for now.");
    }
  }, [result]);

  return (
    <TooltipProvider>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        {/* LEFT — the draft */}
        <section className="flex min-w-0 flex-col gap-4">
          <ColumnHeading
            step="i"
            title="Your draft"
            caption="Paste what you wrote — or what a robot wrote for you."
          />
          <div className="paper-sheet flex min-h-[460px] flex-col rounded-md">
            <Textarea
              value={text}
              onChange={handleChange}
              placeholder="Paste your text here — an email, an essay, a landing page. Anything that should sound less like a machine made it."
              spellCheck={false}
              aria-label="Your draft"
              className="min-h-[388px] flex-1 px-7 py-6 text-[1.05rem] leading-[1.75]"
            />
            <div className="flex items-center justify-between gap-4 border-t border-rule px-7 py-3.5 font-sans text-xs">
              <span
                className={cn(
                  "tabular-nums",
                  atLimit ? "text-oxblood" : "text-ink-soft",
                )}
              >
                {wordCount.toLocaleString()} / {wordLimit.toLocaleString()}{" "}
                words
              </span>
              <span className="uppercase tracking-[0.16em] text-ink-faint">
                {isPaid ? "Paid" : "Free"} tier
              </span>
            </div>
          </div>
          {atLimit && (
            <p className="font-sans text-xs text-oxblood">
              You&rsquo;ve reached the {wordLimit.toLocaleString()}-word limit
              {isPaid
                ? "."
                : " for the free tier — the paid tier allows 10,000."}
            </p>
          )}
        </section>

        {/* RIGHT — the markup */}
        <section className="flex min-w-0 flex-col gap-4">
          <ColumnHeading
            step="ii"
            title="The markup"
            caption="Every tell, circled in the margin — hover a mark to see why."
          />
          <div className="paper-sheet flex min-h-[460px] flex-col rounded-md">
            <div className="flex-1 px-7 py-6">
              {!result && !loading && (
                <p className="font-serif text-[1.05rem] italic leading-[1.75] text-ink-faint">
                  Your marked-up draft will appear here. Clichés get the red
                  pencil, hedges the yellow highlighter, empty transitions the
                  blue ballpoint, and rhythm tells the purple felt-tip.
                </p>
              )}

              {loading && (
                <p className="font-sans text-sm text-ink-soft">
                  <span className="inline-block animate-pulse">
                    Reading your draft, pencil in hand&hellip;
                  </span>
                </p>
              )}

              {result && !loading && (
                <div className="sheet-rise">
                  <p className="mb-5 font-sans text-xs uppercase tracking-[0.16em] text-ink-soft">
                    {result.flagged.length === 0
                      ? "Nothing flagged — this one reads clean."
                      : `${result.flagged.length} mark${
                          result.flagged.length === 1 ? "" : "s"
                        } in the margin`}
                  </p>
                  <div className="whitespace-pre-wrap text-[1.05rem] leading-[1.85] text-ink">
                    {segments.map((seg, i) =>
                      seg.kind === "text" ? (
                        <span key={i}>{seg.value}</span>
                      ) : (
                        <Highlight
                          key={i}
                          type={seg.flag.type}
                          reason={seg.flag.reason}
                          suggestion={seg.flag.suggestion}
                          index={seg.order}
                        >
                          {seg.value}
                        </Highlight>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* the action bar — below the markup */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="ink"
                size="lg"
                onClick={handleClean}
                disabled={loading || !text.trim()}
                className="tracking-[0.04em]"
              >
                <Pencil className="size-4" />
                {loading ? "Cleaning…" : "Clean it up"}
              </Button>
              <Button
                variant="quiet"
                size="lg"
                onClick={handleCopy}
                disabled={!result?.rewritten}
                className="tracking-[0.04em]"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? "Copied" : "Copy rewritten"}
              </Button>
            </div>
            {error && (
              <p role="alert" className="font-sans text-sm text-oxblood">
                {error}
              </p>
            )}
            {result && !error && (
              <p className="font-sans text-xs text-ink-faint">
                The marks above show what changed. &ldquo;Copy rewritten&rdquo;
                puts the cleaned-up version — voice intact — on your clipboard.
              </p>
            )}
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}
