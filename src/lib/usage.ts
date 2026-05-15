"use client";

import { useCallback, useEffect, useState } from "react";

/** Free users get this many cleanups per calendar day. */
export const FREE_DAILY_LIMIT = 3;

const STORAGE_KEY = "cliche-remover-usage";

interface UsageRecord {
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  count: number;
}

/** Today's local date as YYYY-MM-DD. */
function today(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/**
 * Read the usage record from localStorage. If it's missing, malformed, or
 * left over from a previous day, a fresh { date: today, count: 0 } record is
 * returned instead — which is how the daily reset happens.
 */
function readUsage(): UsageRecord {
  const fresh: UsageRecord = { date: today(), count: 0 };
  if (typeof window === "undefined") return fresh;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw) as Partial<UsageRecord>;
    if (
      typeof parsed?.date === "string" &&
      typeof parsed?.count === "number" &&
      parsed.date === fresh.date
    ) {
      return {
        date: parsed.date,
        count: Math.max(0, Math.floor(parsed.count)),
      };
    }
    return fresh;
  } catch {
    return fresh;
  }
}

function writeUsage(record: UsageRecord): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // localStorage may be unavailable (private mode, quota) — degrade quietly.
  }
}

export interface UsageCount {
  count: number;
  increment: () => void;
  isOverLimit: boolean;
}

/**
 * Tracks how many cleanups a free user has run today, persisted in
 * localStorage and reset automatically when the calendar date rolls over.
 */
export function useUsageCount(): UsageCount {
  // Start at 0 so SSR and the first client render agree; the real value is
  // loaded from localStorage in the effect below, after hydration.
  const [count, setCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const record = readUsage();
    writeUsage(record); // persist the reset if the day rolled over
    setCount(record.count);
    setHydrated(true);
  }, []);

  const increment = useCallback(() => {
    // Re-read rather than trust state: handles a day rollover since mount
    // and keeps multiple tabs roughly in sync.
    const current = readUsage();
    const next: UsageRecord = { date: today(), count: current.count + 1 };
    writeUsage(next);
    setCount(next.count);
  }, []);

  // Until hydration completes we can't know the real count, so report
  // not-over-limit — this keeps the paywall from flashing on first paint.
  const isOverLimit = hydrated && count >= FREE_DAILY_LIMIT;

  return { count, increment, isOverLimit };
}
