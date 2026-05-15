import { NextRequest, NextResponse } from "next/server";

import { CleanupError, cleanupText } from "@/lib/ai";

// AI calls can run long; give the handler headroom on platforms that honor this.
export const maxDuration = 60;
export const runtime = "nodejs";

const MAX_CHARS = 10_000;

export async function POST(req: NextRequest) {
  // 1. Parse the request body.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const text = (body as { text?: unknown } | null)?.text;
  if (typeof text !== "string") {
    return NextResponse.json(
      { error: 'Request body must include a "text" string.' },
      { status: 400 },
    );
  }
  if (text.trim().length === 0) {
    return NextResponse.json(
      { error: '"text" must not be empty.' },
      { status: 400 },
    );
  }

  // 2. Enforce the size limit.
  if (text.length > MAX_CHARS) {
    return NextResponse.json(
      {
        error: `Text exceeds the ${MAX_CHARS.toLocaleString()}-character limit.`,
        limit: MAX_CHARS,
        length: text.length,
      },
      { status: 413 },
    );
  }

  // 3. Hand off to whichever AI provider is configured.
  try {
    const result = await cleanupText(text);
    return NextResponse.json(
      { flagged: result.flagged, rewritten: result.rewritten },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof CleanupError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { error: "Could not reach the AI service." },
      { status: 502 },
    );
  }
}
