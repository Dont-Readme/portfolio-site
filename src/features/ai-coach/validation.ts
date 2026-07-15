import {
  AI_COACH_COMMENT_REASONS,
  AI_COACH_GOAL_RELATIONS,
  type AiCoachPromptInput,
  type AiEvaluationResponse,
  type CommentReason,
  type FitGrade,
  type FitScores,
  type GoalRelation,
  type ValidationResult,
} from "./types";

export const FIT_SCORE_LIMITS = {
  goal_fit: 35,
  format_fit: 25,
  duration_fit: 20,
  level_fit: 20,
} as const;

export const GOAL_RELATION_SCORES: Readonly<
  Record<GoalRelation, number | null>
> = {
  direct: 35,
  strong: 28,
  indirect: 18,
  unrelated: 5,
  unknown: null,
};

export function scoreGoalRelation(relation: GoalRelation): number | null {
  return GOAL_RELATION_SCORES[relation];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const expected = [...expectedKeys].sort();
  const keys = Object.keys(value).sort();
  return (
    keys.length === expected.length &&
    keys.every((key, index) => key === expected[index])
  );
}

export function normalizePersonalFit(scores: FitScores): number | null {
  let earned = 0;
  let maximum = 0;
  for (const key of Object.keys(FIT_SCORE_LIMITS) as Array<keyof FitScores>) {
    const score = scores[key];
    if (score === null) continue;
    earned += score;
    maximum += FIT_SCORE_LIMITS[key];
  }
  return maximum === 0 ? null : (earned / maximum) * 100;
}

export function getFitGrade(score: number): FitGrade {
  if (score < 50) return "low";
  if (score < 80) return "medium";
  return "high";
}

export function combineRecommendationScore(
  personalFit: number,
  weaknessScore: number,
): number {
  return personalFit * 0.5 + weaknessScore * 0.5;
}

function sentenceCount(comment: string): number {
  return comment
    .split(/[.!?。！？]+/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;
}

const CHILD_UNFRIENDLY_COMMENT_PATTERN =
  /오답|취약|틀리|틀렸|틀린|자주\s*틀|\d+(?:\.\d+)?\s*(?:%|점)|\d+\s*(?:회|번|문제)\s*중\s*\d+\s*(?:회|번|문제)/u;

function isCommentReason(value: unknown): value is CommentReason {
  return (
    typeof value === "string" &&
    AI_COACH_COMMENT_REASONS.some((reason) => reason === value)
  );
}

function isGoalRelation(value: unknown): value is GoalRelation {
  return (
    typeof value === "string" &&
    AI_COACH_GOAL_RELATIONS.some((relation) => relation === value)
  );
}

export function validateAiEvaluationResponse(
  raw: unknown,
  input: AiCoachPromptInput,
): ValidationResult<AiEvaluationResponse> {
  const errors: string[] = [];
  if (!isRecord(raw)) {
    return { success: false, data: null, errors: ["response must be an object"] };
  }
  if (!hasOnlyKeys(raw, ["request_id", "items"])) {
    errors.push("response must contain only request_id and items");
  }
  if (raw.request_id !== input.request_id) {
    errors.push("request_id does not match the input");
  }
  if (!Array.isArray(raw.items)) {
    return {
      success: false,
      data: null,
      errors: [...errors, "items must be an array"],
    };
  }
  if (raw.items.length !== input.candidates.length) {
    errors.push("items must contain exactly one item per input candidate");
  }

  const seenContentIds = new Set<string>();
  const validatedItems: AiEvaluationResponse["items"] = [];

  raw.items.forEach((item, index) => {
    const path = `items[${index}]`;
    const expectedCandidate = input.candidates[index];
    if (!isRecord(item)) {
      errors.push(`${path} must be an object`);
      return;
    }
    if (
      !hasOnlyKeys(item, [
        "content_id",
        "goal_relation",
        "comment_reason",
        "comment",
      ])
    ) {
      errors.push(`${path} contains missing or unexpected fields`);
    }
    if (item.content_id !== expectedCandidate?.content_id) {
      errors.push(`${path}.content_id must preserve candidate order and identity`);
    }
    if (typeof item.content_id !== "string") {
      errors.push(`${path}.content_id must be a string`);
      return;
    }
    if (seenContentIds.has(item.content_id)) {
      errors.push(`${path}.content_id is duplicated`);
    }
    seenContentIds.add(item.content_id);

    if (!isGoalRelation(item.goal_relation)) {
      errors.push(`${path}.goal_relation is invalid`);
      return;
    }
    const goalRelation = item.goal_relation;

    if (!isCommentReason(item.comment_reason)) {
      errors.push(`${path}.comment_reason is invalid`);
      return;
    }
    const commentReason = item.comment_reason;
    if (
      expectedCandidate &&
      !expectedCandidate.reason_context.allowed_comment_reasons.includes(
        commentReason,
      )
    ) {
      errors.push(
        `${path}.comment_reason ${commentReason} is not available for this candidate`,
      );
    }
    if (
      commentReason === "goal" &&
      (goalRelation === "unrelated" || goalRelation === "unknown")
    ) {
      errors.push(
        `${path}.comment_reason goal requires a related goal_relation`,
      );
    }

    if (typeof item.comment !== "string" || item.comment.trim().length === 0) {
      errors.push(`${path}.comment must be a non-empty string`);
      return;
    }
    if ([...item.comment].length > 80) {
      errors.push(`${path}.comment must be 80 characters or fewer`);
    }
    if (sentenceCount(item.comment) > 2) {
      errors.push(`${path}.comment must contain no more than two sentences`);
    }
    if (!/[가-힣]/u.test(item.comment)) {
      errors.push(`${path}.comment must contain Korean text`);
    }
    if (CHILD_UNFRIENDLY_COMMENT_PATTERN.test(item.comment)) {
      errors.push(
        `${path}.comment must use child-friendly language without diagnostic scores or deficit labels`,
      );
    }

    validatedItems.push({
      content_id: item.content_id,
      goal_relation: goalRelation,
      comment_reason: commentReason,
      comment: item.comment,
    });
  });

  if (errors.length > 0 || validatedItems.length !== input.candidates.length) {
    return { success: false, data: null, errors };
  }
  return {
    success: true,
    data: { request_id: input.request_id, items: validatedItems },
    errors: [],
  };
}
