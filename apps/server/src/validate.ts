import {
  CATEGORIES,
  type Category,
  type Exchange,
  type FlagReason,
} from "@understoria/shared/types";

/**
 * Shape-level validation for an incoming POST /exchanges body. The
 * cryptographic check happens separately via `verifyExchange()` from
 * @understoria/shared/crypto — this guard only ensures we have an object
 * with the right shape before we hand it to the verifier.
 *
 * Returning a typed error rather than throwing keeps the route handler
 * pure and lets the response shape stay structured.
 */
export type ParseResult =
  | { ok: true; value: Exchange }
  | { ok: false; error: string };

const FLAG_REASONS: ReadonlySet<FlagReason> = new Set([
  "short_duration",
  "reciprocal_pattern",
  "daily_limit_warning",
]);
const CATEGORY_SET: ReadonlySet<Category> = new Set(CATEGORIES);

const STRING_FIELDS = [
  "id",
  "postId",
  "helperKey",
  "helpedKey",
  "helperSignature",
  "helpedSignature",
  "nodeId",
] as const;

export function parseExchange(input: unknown): ParseResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const r = input as Record<string, unknown>;

  for (const f of STRING_FIELDS) {
    if (typeof r[f] !== "string" || (r[f] as string).length === 0) {
      return { ok: false, error: `${f} must be a non-empty string` };
    }
  }

  if (typeof r.hoursExchanged !== "number" || !Number.isFinite(r.hoursExchanged) || r.hoursExchanged <= 0) {
    return { ok: false, error: "hoursExchanged must be a positive finite number" };
  }
  if (typeof r.completedAt !== "number" || !Number.isInteger(r.completedAt) || r.completedAt <= 0) {
    return { ok: false, error: "completedAt must be a positive integer (ms epoch)" };
  }
  if (typeof r.category !== "string" || !CATEGORY_SET.has(r.category as Category)) {
    return { ok: false, error: "category is not a recognized category" };
  }

  // Optional flag fields.
  let flaggedForReview: boolean | undefined;
  if (r.flaggedForReview !== undefined) {
    if (typeof r.flaggedForReview !== "boolean") {
      return { ok: false, error: "flaggedForReview must be a boolean if present" };
    }
    flaggedForReview = r.flaggedForReview;
  }
  let flagReason: FlagReason | undefined;
  if (r.flagReason !== undefined) {
    if (typeof r.flagReason !== "string" || !FLAG_REASONS.has(r.flagReason as FlagReason)) {
      return { ok: false, error: "flagReason is not a recognized reason" };
    }
    flagReason = r.flagReason as FlagReason;
  }

  // Bound on completedAt: not absurdly far in the future. Keeps the
  // signature canonical-form predictable.
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000;
  if (r.completedAt > oneDayFromNow) {
    return { ok: false, error: "completedAt is too far in the future" };
  }

  const value: Exchange = {
    id: r.id as string,
    postId: r.postId as string,
    helperKey: r.helperKey as string,
    helpedKey: r.helpedKey as string,
    hoursExchanged: r.hoursExchanged as number,
    helperSignature: r.helperSignature as string,
    helpedSignature: r.helpedSignature as string,
    completedAt: r.completedAt as number,
    category: r.category as Category,
    nodeId: r.nodeId as string,
  };
  if (flaggedForReview) {
    value.flaggedForReview = true;
    if (flagReason) value.flagReason = flagReason;
  }
  return { ok: true, value };
}
