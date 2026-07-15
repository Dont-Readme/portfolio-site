import { describe, expect, it } from "vitest";

import { AI_COACH_SYSTEM_PROMPT, buildAiCoachPrompt } from "./prompt";
import type { AiCoachPromptInput } from "./types";

export const promptFixture: AiCoachPromptInput = {
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

describe("AI coach prompt boundary", () => {
  it("limits AI work to goal relation and grounded recommendation copy", () => {
    expect(AI_COACH_SYSTEM_PROMPT).toContain(
      "입력의 request_id를 그대로 반환",
    );
    expect(AI_COACH_SYSTEM_PROMPT).toContain(
      "content_id, goal_relation, comment_reason, comment만 포함",
    );
    expect(AI_COACH_SYSTEM_PROMPT).toContain(
      "format_fit, duration_fit, level_fit은 서버가 이미 계산한 확정값",
    );
    expect(AI_COACH_SYSTEM_PROMPT).toContain(
      "evidence_ids를 선택·생성·출력하지 않는다",
    );
    expect(AI_COACH_SYSTEM_PROMPT).toContain(
      "direct=35, strong=28, indirect=18, unrelated=5",
    );
    expect(AI_COACH_SYSTEM_PROMPT).toContain("0.15 이내");
    expect(AI_COACH_SYSTEM_PROMPT).not.toContain("[항목별 절대 평가]");
    expect(AI_COACH_SYSTEM_PROMPT).not.toContain("format_fit (0~25)");
    expect(AI_COACH_SYSTEM_PROMPT).not.toContain("추천 순위를 출력");
  });

  it("keeps the child-friendly and cross-candidate copy rules", () => {
    expect(AI_COACH_SYSTEM_PROMPT).toContain("대상은 초등학생이다");
    expect(AI_COACH_SYSTEM_PROMPT).toContain("친근하고 든든한 멘토");
    expect(AI_COACH_SYSTEM_PROMPT).toContain("80자 이하");
    expect(AI_COACH_SYSTEM_PROMPT).toContain("allowed_comment_reasons");
    expect(AI_COACH_SYSTEM_PROMPT).toContain(
      "'평소', '잘 맞'",
    );
    expect(AI_COACH_SYSTEM_PROMPT).toContain("1~10개의 후보");
    expect(AI_COACH_SYSTEM_PROMPT).toContain("고정된 문장 템플릿을 사용하지 않는다");
    expect(AI_COACH_SYSTEM_PROMPT).not.toContain("세 개의 추천 문구는 각각");
    expect(AI_COACH_SYSTEM_PROMPT).not.toContain("[말투 참고 예시]");
    expect(AI_COACH_SYSTEM_PROMPT).not.toContain(
      "평소 잘 맞는 퀴즈 형식이에요",
    );
  });

  it("serializes server scores and summaries without raw evidence or labels", () => {
    const prompt = buildAiCoachPrompt(promptFixture);

    expect(prompt.user).toContain("content-1");
    expect(prompt.user).toContain('"format_fit":22');
    expect(prompt.user).toContain('"recent_learning_strength":0.8');
    expect(prompt.user).toContain("완료 경향이 높은 퀴즈 유형");
    expect(prompt.user).not.toContain("behavior_profile");
    expect(prompt.user).not.toContain("weakness_score");
    expect(prompt.user).not.toContain("evidence_ids");
    expect(prompt.user).not.toContain("personalFitGold");
    expect(prompt.user).not.toContain("ndcgRelevance");
  });

  it("rejects raw weakness, evidence, or evaluation-label leakage", () => {
    const leaked = {
      ...promptFixture,
      candidates: [
        {
          ...promptFixture.candidates[0],
          weakness_score: 72,
          evidence_ids: ["weakness-concept-1:recent"],
        },
      ],
    } as unknown as AiCoachPromptInput;

    expect(() => buildAiCoachPrompt(leaked)).toThrow(/forbidden field/i);
  });
});
