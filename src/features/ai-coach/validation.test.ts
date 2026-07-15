import { describe, expect, it } from "vitest";
import type { AiCoachPromptInput } from "./types";
import {
  combineRecommendationScore,
  getFitGrade,
  normalizePersonalFit,
  scoreGoalRelation,
  validateAiEvaluationResponse,
} from "./validation";

const promptFixture: AiCoachPromptInput = {
  request_id: "request-test-1",
  as_of: "2026-07-14T15:00:00.000Z",
  user: {
    learning_goal: "기초 시제 정확도 향상",
    goal_tags: ["tense", "grammar"],
  },
  candidates: [
    {
      content_id: "content-1",
      title: "현재완료 핵심 퀴즈",
      type: "quiz",
      estimated_minutes: 7,
      primary_concept_id: "concept-present-perfect",
      concept_name: "현재완료",
      learning_goal: "현재완료 용법 구분",
      goal_tags: ["tense", "grammar", "concept-present-perfect"],
      activity: "현재완료 쓰임을 골라 확인하기",
      server_fit_scores: {
        format_fit: null,
        duration_fit: null,
        level_fit: 20,
      },
      reason_context: {
        recent_learning_strength: 0.8,
        recent_learning_summary: "최근 현재완료 학습에서 다시 확인할 내용이 있음",
        format_summary: null,
        duration_summary: null,
        level_summary: "현재 학습 단계와 같은 난이도임",
        allowed_comment_reasons: [
          "recent_learning",
          "goal",
          "level",
          "content_activity",
        ],
      },
    },
  ],
};

describe("AI coach scoring validation", () => {
  it("rescales only non-null score dimensions", () => {
    expect(
      normalizePersonalFit({
        goal_fit: 30,
        format_fit: null,
        duration_fit: null,
        level_fit: 15,
      }),
    ).toBeCloseTo((45 / 55) * 100, 6);
    expect(
      normalizePersonalFit({
        goal_fit: null,
        format_fit: null,
        duration_fit: null,
        level_fit: null,
      }),
    ).toBeNull();
  });

  it("maps every goal relation to the documented server score", () => {
    expect(scoreGoalRelation("direct")).toBe(35);
    expect(scoreGoalRelation("strong")).toBe(28);
    expect(scoreGoalRelation("indirect")).toBe(18);
    expect(scoreGoalRelation("unrelated")).toBe(5);
    expect(scoreGoalRelation("unknown")).toBeNull();
  });

  it("uses the documented grade boundaries", () => {
    expect(getFitGrade(49)).toBe("low");
    expect(getFitGrade(50)).toBe("medium");
    expect(getFitGrade(79)).toBe("medium");
    expect(getFitGrade(80)).toBe("high");
  });

  it("combines personal fit and weakness at 50:50", () => {
    expect(combineRecommendationScore(84, 66)).toBe(75);
  });

  it("rejects changed candidate identity, an invalid relation, and extra fields", () => {
    const result = validateAiEvaluationResponse(
      {
        request_id: promptFixture.request_id,
        items: [
          {
            content_id: "invented-content",
            goal_relation: "closest",
            comment_reason: "goal",
            comment: "입력 근거가 없는 추천입니다.",
            fit_scores: {},
          },
        ],
      },
      promptFixture,
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.join(" ")).toMatch(/identity|goal_relation|unexpected/i);
    }
  });

  it("allows two sentences but rejects diagnostic labels and a third sentence", () => {
    const response = (comment: string) => ({
      request_id: promptFixture.request_id,
      items: [
        {
          content_id: "content-1",
          goal_relation: "direct",
          comment_reason: "recent_learning",
          comment,
        },
      ],
    });
    const diagnosticCopy = validateAiEvaluationResponse(
      response("현재완료 오답률이 80%라 취약합니다."),
      promptFixture,
    );
    const twoSentences = validateAiEvaluationResponse(
      response("현재완료를 가볍게 만나 봐요! 7분 퀴즈로 시작해 봐요!"),
      promptFixture,
    );
    const threeSentences = validateAiEvaluationResponse(
      response("현재완료를 만나 봐요! 핵심 쓰임을 골라요! 예문으로 확인해요!"),
      promptFixture,
    );

    expect(diagnosticCopy.success).toBe(false);
    expect(twoSentences.success).toBe(true);
    expect(threeSentences.success).toBe(false);
    if (!diagnosticCopy.success) {
      expect(diagnosticCopy.errors.join(" ")).toMatch(/child-friendly/i);
    }
    if (!threeSentences.success) {
      expect(threeSentences.errors.join(" ")).toMatch(/two sentences/i);
    }
  });

  it("rejects a recommendation reason unavailable in the server context", () => {
    const result = validateAiEvaluationResponse(
      {
        request_id: promptFixture.request_id,
        items: [
          {
            content_id: "content-1",
            goal_relation: "direct",
            comment_reason: "format",
            comment: "현재완료 쓰임을 퀴즈로 하나씩 골라요!",
          },
        ],
      },
      promptFixture,
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.join(" ")).toMatch(/comment_reason format.*not available/i);
    }
  });
});
