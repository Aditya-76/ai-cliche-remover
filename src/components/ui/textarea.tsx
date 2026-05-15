import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui textarea, stripped back for the editorial theme: no chrome of its
 * own — the "sheet of paper" styling is applied where it's used so the
 * textarea reads as the page itself, not a widget sitting on the page.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full resize-none bg-transparent text-foreground outline-none",
        "placeholder:text-ink-faint placeholder:italic",
        "disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
