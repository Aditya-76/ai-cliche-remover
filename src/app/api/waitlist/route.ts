import { NextRequest, NextResponse } from "next/server";
import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

/**
 * v1 storage: a JSONL file in the OS temp dir, one { email, ts } per line.
 *
 * IMPORTANT: on serverless (Vercel) /tmp is per-instance and ephemeral — fine
 * as a stopgap to start capturing emails, but swap in Vercel KV, Supabase, or
 * a Sheets webhook before the list matters. Point WAITLIST_FILE at a durable
 * path to override.
 */
const WAITLIST_FILE =
  process.env.WAITLIST_FILE ||
  path.join("/tmp", "cliche-remover-waitlist.jsonl");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Entry {
  email: string;
  ts: string;
}

async function readEntries(): Promise<Entry[]> {
  try {
    const raw = await readFile(WAITLIST_FILE, "utf8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as Entry;
        } catch {
          return null;
        }
      })
      .filter(
        (entry): entry is Entry =>
          entry !== null && typeof entry.email === "string",
      );
  } catch (err) {
    // No file yet just means nobody has joined.
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return [];
    throw err;
  }
}

/** GET /api/waitlist → { count } for the social-proof counter. */
export async function GET() {
  try {
    const entries = await readEntries();
    return NextResponse.json({ count: entries.length });
  } catch {
    // Never fail the counter — a missing count just shows zero.
    return NextResponse.json({ count: 0 });
  }
}

/** POST /api/waitlist { email } → appends the email, returns the new count. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const rawEmail = (body as { email?: unknown } | null)?.email;
  const email =
    typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const entries = await readEntries();
    const alreadyJoined = entries.some(
      (entry) => entry.email.toLowerCase() === email,
    );

    if (!alreadyJoined) {
      const entry: Entry = { email, ts: new Date().toISOString() };
      await appendFile(WAITLIST_FILE, `${JSON.stringify(entry)}\n`, "utf8");
    }

    const count = alreadyJoined ? entries.length : entries.length + 1;
    return NextResponse.json({ ok: true, alreadyJoined, count });
  } catch {
    return NextResponse.json(
      { error: "Couldn't save your email. Please try again." },
      { status: 500 },
    );
  }
}
