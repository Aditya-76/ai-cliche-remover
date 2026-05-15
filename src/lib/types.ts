/** The four kinds of AI tell the editor marks up. */
export type MarkType = "cliche" | "hedge" | "transition" | "rhythm";

/** One flagged phrase, as returned by POST /api/clean. */
export interface Flagged {
  phrase: string;
  type: MarkType;
  reason: string;
  suggestion: string;
  startIdx: number;
  endIdx: number;
}

/** The successful shape of POST /api/clean. */
export interface CleanResponse {
  flagged: Flagged[];
  rewritten: string;
}
