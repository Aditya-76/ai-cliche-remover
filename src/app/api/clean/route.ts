import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CLEANUP_PROMPT } from "@/lib/prompts";

// AI calls can run long; give the handler headroom on platforms that honor this.
export const maxDuration = 60;
export const runtime = "nodejs";

const MAX_CHARS = 10_000;
// 8192 is the safe output ceiling across Claude models. Raise it if large,
// heavily-flagged inputs start coming back truncated (which surfaces as a 502
// "malformed JSON" below).
const MAX_TOKENS = 8192;
const MODEL = "claude-haiku-4-5-20251001";

type FlaggedType = "cliche" | "hedge" | "transition" | "rhythm";

interface FlaggedItem {
  phrase: string;
  type: FlaggedType;
  reason: string;
  suggestion: string;
  startIdx: number;
  endIdx: number;
}

interface CleanResult {
  flagged: FlaggedItem[];
  rewritten: string;
}

/**
 * Pull a JSON object out of the model output. The prompt asks for raw JSON,
 * but this tolerates the occasional stray markdown fence or surrounding prose.
 */
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = (fenced ? fenced[1] : raw).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return candidate.slice(start, end + 1);
  }
  return candidate;
}

/** Narrow unknown parsed JSON to the shape we promise callers. */
function isCleanResult(value: unknown): value is CleanResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.flagged) && typeof v.rewritten === "string";
}

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

  // 3. Make sure the server is configured.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is not configured: ANTHROPIC_API_KEY is missing." },
      { status: 500 },
    );
  }

  // 4. Call Claude Haiku 4.5.
  const anthropic = new Anthropic({ apiKey });
  let rawText: string;
  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Use a function replacer so any `$` sequences in the user's text are
      // treated literally rather than as replacement patterns.
      system: CLEANUP_PROMPT.replace("{TEXT}", () => text),
      messages: [
        {
          role: "user",
          content:
            "Analyze the input text in the system prompt and return only the JSON described.",
        },
      ],
    });

    rawText = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      const status = err.status;
      if (status === 429) {
        return NextResponse.json(
          { error: "The AI service is rate limited. Try again shortly." },
          { status: 429 },
        );
      }
      // 401/403 mean our key is bad — that's a server-side misconfiguration.
      if (status === 401 || status === 403) {
        return NextResponse.json(
          { error: "Server AI credentials are invalid." },
          { status: 500 },
        );
      }
      return NextResponse.json(
        { error: "The AI service failed to process the request." },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "Could not reach the AI service." },
      { status: 502 },
    );
  }

  if (!rawText) {
    return NextResponse.json(
      { error: "The AI service returned an empty response." },
      { status: 502 },
    );
  }

  // 5. Parse the JSON the model returned.
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(rawText));
  } catch {
    return NextResponse.json(
      { error: "The AI service returned malformed JSON." },
      { status: 502 },
    );
  }

  if (!isCleanResult(parsed)) {
    return NextResponse.json(
      { error: "The AI response did not match the expected shape." },
      { status: 502 },
    );
  }

  // 6. Return the result.
  return NextResponse.json(
    { flagged: parsed.flagged, rewritten: parsed.rewritten },
    { status: 200 },
  );
}
