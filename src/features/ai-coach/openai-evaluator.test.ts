import { describe, expect, it, vi } from "vitest";

import {
  aiCoachEvaluationSchema,
  createAiCoachOpenAiEvaluator,
  type AiCoachOpenAiParse,
} from "./openai-evaluator";
import type { AiCoachPromptInput } from "./types";

const promptFixture: AiCoachPromptInput = {
  request_id: "request-test-1",
  as_of: "2026-03-31T15:00:00.000Z",
  user: {
    learning_goal: "영문법의 시제 개념을 탄탄히 익히기",
    goal_tags: ["grammar", "tense"],
  },
  candidates: [
    {
      content_id: "content-1",
      title: "현재완료 핵심 퀴즈",
      type: "quiz",
      estimated_minutes: 7,
      primary_concept_id: "concept-1",
      concept_name: "현재완료",
      learning_goal: "현재완료 용법 구분",
      goal_tags: ["grammar", "tense"],
      activity: "예문에서 현재완료 쓰임 고르기",
      server_fit_scores: {
        format_fit: 22,
        duration_fit: 20,
        level_fit: 20,
      },
      reason_context: {
        recent_learning_strength: 0.8,
        recent_learning_summary: "최근 현재완료 쓰임을 구별할 때 잠시 어려워함",
        format_summary: "완료 경향이 높은 퀴즈 유형",
        duration_summary: "평균 학습 시간 안에 완료 가능한 7분 분량",
        level_summary: "현재 학습 수준과 같은 난이도",
        allowed_comment_reasons: [
          "recent_learning",
          "goal",
          "format",
          "duration",
          "level",
        ],
      },
    },
  ],
};

const validEvaluation = {
  request_id: "request-test-1",
  items: [
    {
      content_id: "content-1",
      goal_relation: "direct",
      comment_reason: "goal",
      comment:
        "시제를 탄탄히 익히는 목표와 이어져요. 현재완료 쓰임을 퀴즈로 골라요!",
    },
  ],
} as const;

const configured = () => ({ apiKey: "test-key", model: "test-model" });

describe("AI coach OpenAI evaluator", () => {
  it("accepts only the goal relation and recommendation-copy output contract", () => {
    expect(aiCoachEvaluationSchema.safeParse(validEvaluation).success).toBe(
      true,
    );
    expect(
      aiCoachEvaluationSchema.safeParse({
        ...validEvaluation,
        items: [
          {
            ...validEvaluation.items[0],
            fit_scores: {
              goal_fit: 35,
              format_fit: 22,
              duration_fit: 20,
              level_fit: 20,
            },
            evidence_ids: ["invented-evidence"],
            rank: 1,
          },
        ],
      }).success,
    ).toBe(false);
  });

  it("does not call the provider when server config is missing", async () => {
    const parse = vi.fn<AiCoachOpenAiParse>();
    const evaluate = createAiCoachOpenAiEvaluator({
      parse,
      getConfig: () => ({ apiKey: null, model: null }),
    });

    const result = await evaluate(promptFixture);

    expect(parse).not.toHaveBeenCalled();
    expect(result.evaluation).toBeNull();
    expect(result.api).toMatchObject({
      source: "fallback",
      status: "fallback",
      attempts: 0,
      errorCode: "MISSING_CONFIG",
    });
  });

  it("retries once and returns a validated second response", async () => {
    const parse = vi
      .fn<AiCoachOpenAiParse>()
      .mockRejectedValueOnce(new Error("timed out"))
      .mockResolvedValueOnce({
        parsed: validEvaluation,
        inputTokens: 120,
        outputTokens: 80,
      });
    const evaluate = createAiCoachOpenAiEvaluator({
      parse,
      getConfig: configured,
    });

    const result = await evaluate(promptFixture);

    expect(parse).toHaveBeenCalledTimes(2);
    expect(result.evaluation).toEqual(validEvaluation);
    expect(result.api).toMatchObject({
      source: "openai",
      status: "success",
      attempts: 2,
      inputTokens: 120,
      outputTokens: 80,
    });
  });

  it("falls back after two responses with changed candidate identity", async () => {
    const parse = vi.fn<AiCoachOpenAiParse>().mockResolvedValue({
      parsed: {
        ...validEvaluation,
        items: [
          { ...validEvaluation.items[0], content_id: "invented-content" },
        ],
      },
    });
    const evaluate = createAiCoachOpenAiEvaluator({
      parse,
      getConfig: configured,
    });

    const result = await evaluate(promptFixture);

    expect(parse).toHaveBeenCalledTimes(2);
    expect(result.evaluation).toBeNull();
    expect(result.aiResponses).toHaveLength(2);
    expect(result.api).toMatchObject({
      source: "fallback",
      status: "fallback",
      attempts: 2,
      errorCode: "INVALID_RESPONSE",
    });
  });

  it("rejects a comment reason outside the server-provided allowed set", async () => {
    const parse = vi.fn<AiCoachOpenAiParse>().mockResolvedValue({
      parsed: {
        ...validEvaluation,
        items: [
          {
            ...validEvaluation.items[0],
            comment_reason: "content_activity",
          },
        ],
      },
    });
    const evaluate = createAiCoachOpenAiEvaluator({
      parse,
      getConfig: configured,
    });

    const result = await evaluate(promptFixture);

    expect(parse).toHaveBeenCalledTimes(2);
    expect(result.evaluation).toBeNull();
    expect(result.api).toMatchObject({
      attempts: 2,
      errorCode: "INVALID_RESPONSE",
    });
  });
});
