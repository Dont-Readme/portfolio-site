import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import {
  AI_COACH_PROMPT_SCHEMA_NAME,
  buildAiCoachPrompt,
  type AiCoachPrompt,
} from "./prompt";
import {
  AI_COACH_COMMENT_REASONS,
  AI_COACH_GOAL_RELATIONS,
  type AiCoachPromptInput,
  type AiEvaluationResponse,
  type CommentReason,
  type GoalRelation,
} from "./types";

export const AI_COACH_OPENAI_TIMEOUT_MS = 20_000;
export const AI_COACH_OPENAI_MAX_ATTEMPTS = 2;

export const aiCoachEvaluationSchema = z
  .object({
    request_id: z.string().min(1),
    items: z.array(
      z
        .object({
          content_id: z.string().min(1),
          goal_relation: z.enum(AI_COACH_GOAL_RELATIONS),
          comment_reason: z.enum(AI_COACH_COMMENT_REASONS),
          comment: z.string().min(1).max(80),
        })
        .strict(),
    ),
  })
  .strict();

export type AiCoachStructuredEvaluation = z.infer<
  typeof aiCoachEvaluationSchema
>;

export class AiCoachResponseValidationError extends Error {
  readonly validationErrors: string[];

  constructor(errors: readonly string[]) {
    super("OpenAI returned an invalid AI coach evaluation.");
    this.name = "AiCoachResponseValidationError";
    this.validationErrors = [...errors];
  }
}

type PromptCandidateContract = {
  content_id: string;
  activity: string;
  learning_goal: string;
  server_fit_scores: {
    format_fit: number | null;
    duration_fit: number | null;
    level_fit: number | null;
  };
  reason_context: {
    recent_learning_strength: number | null;
    recent_learning_summary: string | null;
    format_summary: string | null;
    duration_summary: string | null;
    level_summary: string | null;
    allowed_comment_reasons: CommentReason[];
  };
};

type PromptInputContract = {
  request_id: string;
  user: {
    learning_goal: string;
    goal_tags: string[];
  };
  candidates: PromptCandidateContract[];
};

const GOAL_RELATION_SCORE: Record<Exclude<GoalRelation, "unknown">, number> = {
  direct: 35,
  strong: 28,
  indirect: 18,
  unrelated: 5,
};

const CHILD_UNFRIENDLY_COMMENT_PATTERN =
  /오답|취약|틀리|틀렸|틀린|자주\s*틀|\d+(?:\.\d+)?\s*(?:%|점)|\d+\s*(?:회|번|문제)\s*중\s*\d+\s*(?:회|번|문제)/u;

function sentenceCount(comment: string): number {
  return comment
    .split(/[.!?。！？]+/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function recommendationStrengths(
  candidate: PromptCandidateContract,
  goalRelation: GoalRelation,
): Map<CommentReason, number> {
  const allowed = new Set(candidate.reason_context.allowed_comment_reasons);
  const strengths = new Map<CommentReason, number>();

  if (
    allowed.has("goal") &&
    goalRelation !== "unknown" &&
    goalRelation !== "unrelated"
  ) {
    strengths.set("goal", GOAL_RELATION_SCORE[goalRelation] / 35);
  }

  const { server_fit_scores: scores, reason_context: context } = candidate;
  if (
    allowed.has("format") &&
    scores.format_fit !== null &&
    hasText(context.format_summary)
  ) {
    strengths.set("format", scores.format_fit / 25);
  }
  if (
    allowed.has("duration") &&
    scores.duration_fit !== null &&
    hasText(context.duration_summary)
  ) {
    strengths.set("duration", scores.duration_fit / 20);
  }
  if (
    allowed.has("level") &&
    scores.level_fit !== null &&
    hasText(context.level_summary)
  ) {
    strengths.set("level", scores.level_fit / 20);
  }
  if (
    allowed.has("recent_learning") &&
    context.recent_learning_strength !== null &&
    context.recent_learning_strength >= 0 &&
    context.recent_learning_strength <= 1 &&
    hasText(context.recent_learning_summary)
  ) {
    strengths.set("recent_learning", context.recent_learning_strength);
  }

  if (
    strengths.size === 0 &&
    allowed.has("content_activity") &&
    hasText(candidate.activity)
  ) {
    strengths.set("content_activity", 0);
  }

  return strengths;
}

function validateRecommendationReasons(
  items: AiCoachStructuredEvaluation["items"],
  input: PromptInputContract,
  errors: string[],
): void {
  const itemByContentId = new Map(items.map((item) => [item.content_id, item]));
  const usedReasons = new Set<CommentReason>();

  [...input.candidates]
    .sort((a, b) => a.content_id.localeCompare(b.content_id))
    .forEach((candidate) => {
      const item = itemByContentId.get(candidate.content_id);
      if (!item) return;

      const path = `items[${items.indexOf(item)}]`;
      const allowed = candidate.reason_context.allowed_comment_reasons;
      if (!allowed.includes(item.comment_reason)) {
        errors.push(
          `${path}.comment_reason must be included in allowed_comment_reasons`,
        );
        return;
      }

      const strengths = recommendationStrengths(
        candidate,
        item.goal_relation,
      );
      const selectedStrength = strengths.get(item.comment_reason);
      if (selectedStrength === undefined) {
        errors.push(
          `${path}.comment_reason is not supported by the available reason context`,
        );
        return;
      }

      const strongest = Math.max(...strengths.values());
      const strongestReasons = [...strengths.entries()]
        .filter(([, strength]) => Math.abs(strength - strongest) < Number.EPSILON)
        .map(([reason]) => reason);
      const repeatedStrongest = strongestReasons.every((reason) =>
        usedReasons.has(reason),
      );
      const isStrongest = Math.abs(selectedStrength - strongest) < Number.EPSILON;
      const isAllowedDiversityAlternative =
        repeatedStrongest &&
        !usedReasons.has(item.comment_reason) &&
        strongest - selectedStrength <= 0.15;

      if (!isStrongest && !isAllowedDiversityAlternative) {
        errors.push(
          `${path}.comment_reason must use the strongest reason or an unused reason within 0.15`,
        );
        return;
      }

      usedReasons.add(item.comment_reason);
    });
}

export function validateAiCoachStructuredEvaluation(
  raw: unknown,
  promptInput: AiCoachPromptInput,
): AiEvaluationResponse {
  const shape = aiCoachEvaluationSchema.safeParse(raw);
  if (!shape.success) {
    throw new AiCoachResponseValidationError(
      shape.error.issues.map(
        (issue) => `${issue.path.join(".") || "response"}: ${issue.message}`,
      ),
    );
  }

  const input = promptInput as unknown as PromptInputContract;
  const errors: string[] = [];
  if (shape.data.request_id !== input.request_id) {
    errors.push("request_id does not match the input");
  }
  if (!Array.isArray(input.candidates)) {
    errors.push("prompt input candidates must be an array");
  } else if (shape.data.items.length !== input.candidates.length) {
    errors.push("items must contain exactly one item per input candidate");
  }

  shape.data.items.forEach((item, index) => {
    const expectedCandidate = input.candidates?.[index];
    const path = `items[${index}]`;
    if (item.content_id !== expectedCandidate?.content_id) {
      errors.push(`${path}.content_id must preserve candidate order and identity`);
    }
    if (!/[가-힣]/u.test(item.comment)) {
      errors.push(`${path}.comment must contain Korean text`);
    }
    if (sentenceCount(item.comment) > 2) {
      errors.push(`${path}.comment must contain no more than two sentences`);
    }
    if (CHILD_UNFRIENDLY_COMMENT_PATTERN.test(item.comment)) {
      errors.push(
        `${path}.comment must not expose diagnostic scores or deficit labels`,
      );
    }
  });

  if (Array.isArray(input.candidates)) {
    validateRecommendationReasons(shape.data.items, input, errors);
  }

  if (errors.length > 0) {
    throw new AiCoachResponseValidationError(errors);
  }

  return shape.data;
}

export type AiCoachOpenAiParseRequest = {
  apiKey: string;
  model: string;
  prompt: AiCoachPrompt;
  timeoutMs: number;
};

export type AiCoachOpenAiParseResult = {
  parsed: unknown;
  inputTokens?: number;
  outputTokens?: number;
};

export type AiCoachOpenAiParse = (
  request: AiCoachOpenAiParseRequest,
) => Promise<AiCoachOpenAiParseResult>;

export async function parseAiCoachWithOpenAi({
  apiKey,
  model,
  prompt,
  timeoutMs,
}: AiCoachOpenAiParseRequest): Promise<AiCoachOpenAiParseResult> {
  const client = new OpenAI({
    apiKey,
    maxRetries: 0,
    timeout: timeoutMs,
  });

  const response = await client.responses.parse(
    {
      model,
      input: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
      max_output_tokens: 2_400,
      store: false,
      text: {
        format: zodTextFormat(
          aiCoachEvaluationSchema,
          AI_COACH_PROMPT_SCHEMA_NAME,
        ),
      },
    },
    {
      maxRetries: 0,
      timeout: timeoutMs,
    },
  );

  return {
    parsed: response.output_parsed,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  };
}

export type AiCoachOpenAiConfig = {
  apiKey: string | null;
  model: string | null;
};

export function readAiCoachOpenAiConfig(): AiCoachOpenAiConfig {
  return {
    apiKey: process.env.OPENAI_API_KEY?.trim() || null,
    model: process.env.OPENAI_MODEL?.trim() || null,
  };
}

export type AiCoachApiErrorCode =
  | "MISSING_CONFIG"
  | "PROMPT_INPUT_REJECTED"
  | "TIMEOUT"
  | "INVALID_RESPONSE"
  | "OPENAI_AUTH_ERROR"
  | "OPENAI_RATE_LIMIT"
  | "OPENAI_SERVER_ERROR"
  | "OPENAI_API_ERROR"
  | "UNKNOWN_ERROR";

export type AiCoachApiTelemetry = {
  source: "openai" | "fallback";
  status: "success" | "fallback";
  latencyMs: number;
  attempts: number;
  model: string | null;
  inputTokens: number;
  outputTokens: number;
  errorCode?: AiCoachApiErrorCode;
};

export type AiCoachEvaluatorResult = {
  evaluation: AiEvaluationResponse | null;
  aiResponses: unknown[];
  api: AiCoachApiTelemetry;
};

export type AiCoachOpenAiEvaluator = (
  promptInput: AiCoachPromptInput,
) => Promise<AiCoachEvaluatorResult>;

export type AiCoachOpenAiEvaluatorDependencies = {
  parse?: AiCoachOpenAiParse;
  getConfig?: () => AiCoachOpenAiConfig;
  now?: () => number;
};

function elapsedMilliseconds(now: () => number, startedAt: number): number {
  return Math.max(0, Math.round(now() - startedAt));
}

function classifyOpenAiError(error: unknown): AiCoachApiErrorCode {
  if (
    error instanceof AiCoachResponseValidationError ||
    error instanceof z.ZodError
  ) {
    return "INVALID_RESPONSE";
  }

  if (error instanceof OpenAI.APIConnectionTimeoutError) return "TIMEOUT";

  if (error instanceof OpenAI.APIError) {
    if (error.status === 401 || error.status === 403) {
      return "OPENAI_AUTH_ERROR";
    }
    if (error.status === 429) return "OPENAI_RATE_LIMIT";
    if (typeof error.status === "number" && error.status >= 500) {
      return "OPENAI_SERVER_ERROR";
    }
    return "OPENAI_API_ERROR";
  }

  if (error instanceof Error && /time(?:d)?\s*out/i.test(error.message)) {
    return "TIMEOUT";
  }

  return "UNKNOWN_ERROR";
}

export function createAiCoachOpenAiEvaluator(
  dependencies: AiCoachOpenAiEvaluatorDependencies = {},
): AiCoachOpenAiEvaluator {
  const parse = dependencies.parse ?? parseAiCoachWithOpenAi;
  const getConfig = dependencies.getConfig ?? readAiCoachOpenAiConfig;
  const now = dependencies.now ?? Date.now;

  return async (promptInput) => {
    const startedAt = now();
    const config = getConfig();

    if (!config.apiKey || !config.model) {
      return {
        evaluation: null,
        aiResponses: [],
        api: {
          source: "fallback",
          status: "fallback",
          latencyMs: elapsedMilliseconds(now, startedAt),
          attempts: 0,
          model: config.model,
          inputTokens: 0,
          outputTokens: 0,
          errorCode: "MISSING_CONFIG",
        },
      };
    }

    let prompt: AiCoachPrompt;
    try {
      prompt = buildAiCoachPrompt(promptInput);
    } catch {
      return {
        evaluation: null,
        aiResponses: [],
        api: {
          source: "fallback",
          status: "fallback",
          latencyMs: elapsedMilliseconds(now, startedAt),
          attempts: 0,
          model: config.model,
          inputTokens: 0,
          outputTokens: 0,
          errorCode: "PROMPT_INPUT_REJECTED",
        },
      };
    }

    const aiResponses: unknown[] = [];
    let attempts = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    let errorCode: AiCoachApiErrorCode = "UNKNOWN_ERROR";

    while (attempts < AI_COACH_OPENAI_MAX_ATTEMPTS) {
      attempts += 1;

      try {
        const result = await parse({
          apiKey: config.apiKey,
          model: config.model,
          prompt,
          timeoutMs: AI_COACH_OPENAI_TIMEOUT_MS,
        });

        inputTokens += result.inputTokens ?? 0;
        outputTokens += result.outputTokens ?? 0;
        aiResponses.push(result.parsed);

        const evaluation = validateAiCoachStructuredEvaluation(
          result.parsed,
          promptInput,
        );

        return {
          evaluation,
          aiResponses,
          api: {
            source: "openai",
            status: "success",
            latencyMs: elapsedMilliseconds(now, startedAt),
            attempts,
            model: config.model,
            inputTokens,
            outputTokens,
          },
        };
      } catch (error) {
        errorCode = classifyOpenAiError(error);
      }
    }

    return {
      evaluation: null,
      aiResponses,
      api: {
        source: "fallback",
        status: "fallback",
        latencyMs: elapsedMilliseconds(now, startedAt),
        attempts,
        model: config.model,
        inputTokens,
        outputTokens,
        errorCode,
      },
    };
  };
}

export const evaluateAiCoachWithOpenAi = createAiCoachOpenAiEvaluator();
