"use client";

import type { CSSProperties, ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { MarkType } from "@/lib/types";

const TYPE_META: Record<
  MarkType,
  { label: string; instrument: string; markClass: string }
> = {
  cliche: {
    label: "AI cliché",
    instrument: "Red pencil",
    markClass: "mark-cliche",
  },
  hedge: {
    label: "Weak hedge",
    instrument: "Legal-pad highlighter",
    markClass: "mark-hedge",
  },
  transition: {
    label: "Empty transition",
    instrument: "Blue ballpoint",
    markClass: "mark-transition",
  },
  rhythm: {
    label: "Rhythm tell",
    instrument: "Purple felt-tip",
    markClass: "mark-rhythm",
  },
};

interface HighlightProps {
  type: MarkType;
  reason: string;
  suggestion: string;
  /** Position in the flagged list — drives the staggered fade-in. */
  index?: number;
  children: ReactNode;
}

export function Highlight({
  type,
  reason,
  suggestion,
  index = 0,
  children,
}: HighlightProps) {
  const meta = TYPE_META[type] ?? TYPE_META.cliche;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <mark
          tabIndex={0}
          data-mark-type={type}
          className={cn(
            "mark rounded-[1.5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            meta.markClass,
          )}
          style={{ "--mark-i": index } as CSSProperties}
        >
          {children}
        </mark>
      </TooltipTrigger>
      <TooltipContent side="top" align="start">
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-ink-soft">
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ backgroundColor: `var(--mark-${type})` }}
            />
            {meta.label}
            <span className="text-ink-faint">· {meta.instrument}</span>
          </span>
          <p className="font-serif text-[0.86rem] leading-snug text-ink">
            {reason}
          </p>
          <p className="text-[0.78rem] leading-snug">
            <span className="text-ink-faint">Try: </span>
            <span className="text-oxblood">&ldquo;{suggestion}&rdquo;</span>
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
