"use client";

import { useEffect, useState, type FormEvent } from "react";

import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "submitting" | "success" | "error";

/** A small illustration: the extension icon parked in a browser toolbar,
 *  with a popover showing the four editor's-mark colours. */
function ToolbarMockup() {
  return (
    <svg
      viewBox="0 0 360 150"
      role="img"
      aria-label="The extension icon sitting in a browser toolbar, showing the four editor's-mark colours"
      className="h-auto w-full max-w-[360px]"
    >
      {/* toolbar shell */}
      <rect
        x="8"
        y="18"
        width="344"
        height="46"
        rx="12"
        fill="var(--sheet)"
        stroke="var(--rule-strong)"
        strokeWidth="1.5"
      />
      {/* window dots */}
      <circle cx="26" cy="41" r="3.5" fill="var(--rule-strong)" />
      <circle cx="38" cy="41" r="3.5" fill="var(--rule-strong)" />
      <circle cx="50" cy="41" r="3.5" fill="var(--rule-strong)" />
      {/* address bar */}
      <rect
        x="66"
        y="30"
        width="168"
        height="22"
        rx="11"
        fill="var(--paper)"
        stroke="var(--rule)"
      />
      <circle
        cx="80"
        cy="41"
        r="3"
        fill="none"
        stroke="var(--ink-faint)"
        strokeWidth="1.5"
      />
      <rect x="90" y="39" width="86" height="4" rx="2" fill="var(--rule-strong)" />
      {/* faint neighbouring toolbar icons */}
      <circle cx="266" cy="41" r="8" fill="var(--rule)" />
      <circle cx="290" cy="41" r="8" fill="var(--rule)" />
      {/* the extension icon, lit up */}
      <rect
        x="307"
        y="26"
        width="30"
        height="30"
        rx="9"
        fill="var(--oxblood)"
        opacity="0.16"
      />
      <rect x="311" y="30" width="22" height="22" rx="6" fill="var(--oxblood)" />
      <text
        x="322"
        y="46"
        textAnchor="middle"
        fill="var(--sheet)"
        fontSize="15"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        ¶
      </text>
      {/* connector + popover with the four marks */}
      <path
        d="M322 55 L315 68 L329 68 Z"
        fill="var(--sheet)"
        stroke="var(--rule-strong)"
        strokeWidth="1.5"
      />
      <rect
        x="288"
        y="67"
        width="68"
        height="34"
        rx="9"
        fill="var(--sheet)"
        stroke="var(--rule-strong)"
        strokeWidth="1.5"
      />
      <circle cx="304" cy="84" r="4.5" fill="var(--mark-cliche)" />
      <circle cx="318" cy="84" r="4.5" fill="var(--mark-hedge)" />
      <circle cx="332" cy="84" r="4.5" fill="var(--mark-transition)" />
      <circle cx="346" cy="84" r="4.5" fill="var(--mark-rhythm)" />
    </svg>
  );
}

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  // Pull the current waitlist size for the social-proof counter.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/waitlist")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && typeof data?.count === "number") setCount(data.count);
      })
      .catch(() => {
        /* leave the counter at 0 — a missing count isn't worth surfacing */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error");
      setMessage("That doesn't look like an email address.");
      return;
    }

    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus("error");
        setMessage(
          (data && typeof data.error === "string" && data.error) ||
            "Something went wrong. Please try again.",
        );
        return;
      }
      if (typeof data?.count === "number") setCount(data.count);
      setStatus("success");
      setMessage(
        data?.alreadyJoined
          ? "You're already on the list — we'll be in touch."
          : "You're on the list. We'll email you the day it launches.",
      );
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Couldn't reach the waitlist. Check your connection.");
    }
  }

  return (
    <section className="flex flex-col gap-10">
      <SectionHeading
        kicker="The browser extension"
        title="Coming soon: edit AI tells anywhere you write."
      >
        The same red pencil, working quietly inside Google Docs, Notion,
        Substack, and Gmail.
      </SectionHeading>

      <div className="paper-sheet flex flex-col items-center gap-7 rounded-md px-7 py-9 sm:px-10">
        <ToolbarMockup />

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-[26rem] flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            autoComplete="email"
            className="flex-1 rounded-md border border-rule-strong bg-paper px-4 py-2.5 font-sans text-sm text-ink outline-none transition-[box-shadow] placeholder:text-ink-faint focus-visible:ring-2 focus-visible:ring-ring/35"
          />
          <Button
            type="submit"
            variant="ink"
            size="lg"
            disabled={status === "submitting"}
            className="tracking-[0.04em]"
          >
            {status === "submitting"
              ? "Adding you…"
              : "Notify me when it launches"}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2 text-center">
          {message && (
            <p
              role={status === "error" ? "alert" : "status"}
              className={
                status === "error"
                  ? "font-sans text-sm text-oxblood"
                  : "font-sans text-sm text-ink-soft"
              }
            >
              {message}
            </p>
          )}
          <p className="font-sans text-xs uppercase tracking-[0.16em] text-ink-faint">
            Join <span className="tabular-nums text-ink">{count}</span>{" "}
            {count === 1 ? "writer" : "writers"} on the waitlist
          </p>
        </div>
      </div>
    </section>
  );
}
