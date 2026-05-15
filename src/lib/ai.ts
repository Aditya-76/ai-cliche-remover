import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { CLEANUP_PROMPT } from "@/lib/prompts";
import type { CleanResponse } from "@/lib/types";

/**
 * AI provider dispatcher for the cleanup endpoint.
 *
 * Picks Gemini by default — that's the free option on Google AI Studio.
 * Set AI_PROVIDER=anthropic to use Claude Haiku instead, but you'll also
 * need ANTHROPIC_API_KEY for that path to work.
 */

export type AiProvider = "gemini" | "anthropic";

const MAX_TOKENS = 8192;
const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/** Read AI_PROVIDER from env. Defaults to Gemini. */
export function getProvider(): AiProvider {
  const raw = (process.env.AI_PROVIDER || "gemini").trim().toLowerCase();
  return raw === "anthropic" ? "anthropic" : "gemini";
}

/** Errors from the cleanup pipeline that carry an HTTP status for the route. */
export class CleanupError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "CleanupError";
    this.status = status;
  }
}

/** Pull a JSON object out of model output (tolerant of stray fences/prose). */
export function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = (fenced ? fenced[1] : raw).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start !== -1 && end > start) return candidate.slice(start, end + 1);
  return candidate;
}

/** Narrow unknown parsed JSON to the shape we promise callers. */
export function isCleanResponse(value: unknown): value is CleanResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.flagged) && typeof v.rewritten === "string";
}

/** Build the final system prompt — same wording for both providers. */
function buildSystem(text: string): string {
  // Function replacer so any `$` sequences in the user's text stay literal.
  return CLEANUP_PROMPT.replace("{TEXT}", () => text);
}

function finalize(raw: string): CleanResponse {
  if (!raw) {
    throw new CleanupError(
      "The AI service returned an empty response.",
      502,
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    throw new CleanupError("The AI service returned malformed JSON.", 502);
  }
  if (!isCleanResponse(parsed)) {
    throw new CleanupError(
      "The AI response did not match the expected shape.",
      502,
    );
  }
  return parsed;
}

/* ------------------------------------------------------------------ */
/* Anthropic — Claude Haiku 4.5                                       */
/* ------------------------------------------------------------------ */

async function cleanupWithAnthropic(text: string): Promise<CleanResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new CleanupError(
      "Anthropic is selected but ANTHROPIC_API_KEY isn't set. Add the key, or switch AI_PROVIDER to 'gemini'.",
      500,
    );
  }
  const client = new Anthropic({ apiKey });

  let raw: string;
  try {
    const message = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: MAX_TOKENS,
      system: buildSystem(text),
      messages: [
        {
          role: "user",
          content:
            "Analyze the input text in the system prompt and return only the JSON described.",
        },
      ],
    });
    raw = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
  } catch (err) {
    throw mapAnthropicError(err);
  }
  return finalize(raw);
}

function mapAnthropicError(err: unknown): CleanupError {
  if (err instanceof Anthropic.APIError) {
    if (err.status === 429) {
      return new CleanupError(
        "The AI service is rate limited. Try again shortly.",
        429,
      );
    }
    if (err.status === 401 || err.status === 403) {
      return new CleanupError("Server AI credentials are invalid.", 500);
    }
    return new CleanupError(
      "The AI service failed to process the request.",
      502,
    );
  }
  return new CleanupError("Could not reach the AI service.", 502);
}

/* ------------------------------------------------------------------ */
/* Gemini — Google AI Studio (free tier)                              */
/* ------------------------------------------------------------------ */

async function cleanupWithGemini(text: string): Promise<CleanResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new CleanupError(
      "Gemini is selected but GEMINI_API_KEY isn't set. Grab a free key at https://aistudio.google.com/apikey.",
      500,
    );
  }
  const modelId = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: buildSystem(text),
    generationConfig: {
      // Force JSON output — Gemini honours this when supported.
      responseMimeType: "application/json",
      maxOutputTokens: MAX_TOKENS,
      // Low temperature keeps the marks deterministic.
      temperature: 0.2,
    },
  });

  let raw: string;
  try {
    const result = await model.generateContent(
      "Analyze the input text in the system prompt and return only the JSON described.",
    );
    raw = result.response.text().trim();
  } catch (err) {
    throw mapGeminiError(err);
  }
  return finalize(raw);
}

function mapGeminiError(err: unknown): CleanupError {
  // The SDK throws plain Errors with text-shaped messages; pattern-match
  // for the common cases rather than depending on internal classes.
  const message =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";
  if (/quota|rate|429|RESOURCE_EXHAUSTED/i.test(message)) {
    return new CleanupError(
      "The AI service is rate limited. Try again shortly.",
      429,
    );
  }
  if (/api[_ -]?key|unauthor|permission|401|403/i.test(message)) {
    return new CleanupError("Server AI credentials are invalid.", 500);
  }
  return new CleanupError(
    "The AI service failed to process the request.",
    502,
  );
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                 */
/* ------------------------------------------------------------------ */

/** Run the cleanup pipeline against whichever provider is configured. */
export async function cleanupText(text: string): Promise<CleanResponse> {
  return getProvider() === "anthropic"
    ? cleanupWithAnthropic(text)
    : cleanupWithGemini(text);
}
