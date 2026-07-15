import { describe, expect, it } from "vitest";
import {
  calculateDurationFit,
  calculateFormatFit,
  calculateLevelFit,
  completeAiCoachRun,
  computeConceptWeaknesses,
  createDeterministicAiResponse,
  mapSystemEvidenceIds,
  normalizeAiEvaluation,
  prepareAiCoachRun,
  runAiCoachDemo,
  selectValidProblemAttempts,
} from "./engine";
import { AI_COACH_AS_OF, userFixtures } from "./fixtures";
import type { BehaviorProfile, ProblemAttempt } from "./types";
import { normalizePersonalFit } from "./validation";

function attempt(
  id: string,
  overrides: Partial<ProblemAttempt> = {},
): ProblemAttempt {
  return {
    id,
    idempotencyKey: `key-${id}`,
    userId: "user-04",
    questionId: "question-01",
    isCorrect: true,
    isGraded: true,
    isValid: true,
    occurredAt: "2026-07-01T03:00:00.000Z",
    ...overrides,
  };
}

function behaviorProfile(
  overrides: Partial<BehaviorProfile> = {},
): BehaviorProfile {
  return {
    preferredTypes: ["quiz"],
    completionRateByType: { quiz: 0.75 },
    averageStudyMinutes: 10,
    sourceEventCount: 4,
    evidence: [],
    ...overrides,
  };
}

describe("AI coach deterministic engine", () => {
  it("audits duplicate, ungraded, invalid, unmapped, and future events", () => {
    const valid = attempt("valid", { idempotencyKey: "same-key" });
    const result = selectValidProblemAttempts([
      valid,
      attempt("duplicate", {
        idempotencyKey: "same-key",
        occurredAt: "2026-07-02T03:00:00.000Z",
      }),
      attempt("ungraded", { isGraded: false, isCorrect: null }),
      attempt("invalid", { isValid: false }),
      attempt("unmapped", { questionId: "question-missing" }),
      attempt("future", { occurredAt: "2026-07-15T03:00:00.000Z" }),
    ]);

    expect(result.valid).toHaveLength(1);
    expect(result.audit.excludedByReason).toEqual({
      duplicate: 1,
      ungraded: 1,
      invalid: 1,
      unmapped: 1,
      future: 1,
    });
  });

  it("uses recent five at 70%, cumulative at 30%, and confidence thresholds", () => {
    const outcomes = [false, false, true, true, true, true, false, false, false, false];
    const attempts = outcomes.map((isCorrect, index) =>
      attempt(`formula-${index}`, {
        isCorrect,
        occurredAt: new Date(
          Date.parse("2026-07-01T03:00:00.000Z") + index * 86_400_000,
        ).toISOString(),
      }),
    );
    const existingUser = userFixtures.find((user) => user.id === "user-04")!;
    const currentPerfect = computeConceptWeaknesses(
      existingUser,
      attempts,
      AI_COACH_AS_OF,
    ).find((item) => item.conceptId === "concept-present-perfect")!;

    expect(currentPerfect.recentIncorrectRate).toBe(80);
    expect(currentPerfect.cumulativeIncorrectRate).toBe(60);
    expect(currentPerfect.finalScore).toBe(74);
    expect(currentPerfect.confidence).toBe("high");
  });

  it("calculates format fit from preference rank and observed completion only", () => {
    expect(calculateFormatFit(behaviorProfile(), "quiz")).toBe(25);
    expect(
      calculateFormatFit(
        behaviorProfile({
          preferredTypes: ["video", "quiz"],
          completionRateByType: { video: 0.4 },
        }),
        "quiz",
      ),
    ).toBe(22);
    expect(
      calculateFormatFit(
        behaviorProfile({
          preferredTypes: ["video"],
          completionRateByType: { quiz: 0.8 },
        }),
        "quiz",
      ),
    ).toBe(20);
    expect(
      calculateFormatFit(
        behaviorProfile({
          preferredTypes: ["video"],
          completionRateByType: { quiz: 0.5 },
        }),
        "quiz",
      ),
    ).toBe(16);
    expect(
      calculateFormatFit(
        behaviorProfile({
          preferredTypes: ["video"],
          completionRateByType: { quiz: 0.49 },
        }),
        "quiz",
      ),
    ).toBe(8);
    expect(
      calculateFormatFit(
        behaviorProfile({
          preferredTypes: ["video"],
          completionRateByType: { video: 0.8 },
        }),
        "quiz",
      ),
    ).toBeNull();
    expect(calculateFormatFit(null, "quiz")).toBeNull();
  });

  it("uses deterministic duration and level boundary scores", () => {
    const profile = behaviorProfile({ averageStudyMinutes: 10 });
    expect(calculateDurationFit(profile, 10)).toBe(20);
    expect(calculateDurationFit(profile, 12.5)).toBe(16);
    expect(calculateDurationFit(profile, 15)).toBe(10);
    expect(calculateDurationFit(profile, 15.1)).toBe(4);
    expect(calculateDurationFit(null, 10)).toBeNull();

    expect(calculateLevelFit(2, 2)).toBe(20);
    expect(calculateLevelFit(2, 3)).toBe(14);
    expect(calculateLevelFit(1, 3)).toBe(5);
    expect(calculateLevelFit(null, 2)).toBeNull();
  });

  it("covers new-user mix, candidate fallback, and diversity fixtures", () => {
    const mixed = prepareAiCoachRun("user-02");
    const diagnosticOnly = prepareAiCoachRun("user-01");
    const shortage = prepareAiCoachRun("user-09");
    const diversity = runAiCoachDemo("user-10");

    expect(
      mixed.conceptWeaknesses.some(
        (item) => item.dataStage === "diagnostic_behavior_mix",
      ),
    ).toBe(true);
    expect(mixed.conceptWeaknesses.some((item) => item.confidence === "medium")).toBe(true);
    expect(
      diagnosticOnly.candidateSelection.excludedByReason.difficulty_gap,
    ).toBeGreaterThan(0);
    expect(shortage.candidateSelection.excludedByReason.inactive).toBeGreaterThan(0);
    expect(
      shortage.candidateSelection.excludedByReason.recently_completed,
    ).toBeGreaterThan(0);
    expect(shortage.candidateSelection.fallbackCandidatesAdded).toBeGreaterThan(0);
    expect(diversity.finalRecommendations).toHaveLength(3);
    if (!diversity.diversity.mixed.relaxed) {
      expect(new Set(diversity.mixedTop3.map((item) => item.conceptId)).size).toBeGreaterThanOrEqual(2);
      expect(new Set(diversity.mixedTop3.map((item) => item.type)).size).toBeGreaterThanOrEqual(2);
    }
  });

  it("accepts a valid structured response and falls back after two invalid attempts", () => {
    const prepared = prepareAiCoachRun("user-05");
    const valid = createDeterministicAiResponse(prepared.promptInput);
    const accepted = completeAiCoachRun(prepared, {
      aiResponses: [valid],
      aiSource: "server_mock",
    });
    const liveAccepted = completeAiCoachRun(prepared, {
      aiResponses: [valid],
      aiSource: "openai",
    });
    const fallback = completeAiCoachRun(prepared, {
      aiResponses: [
        { ...valid, request_id: "wrong-1" },
        { ...valid, request_id: "wrong-2" },
      ],
      aiSource: "server_mock",
    });

    expect(accepted.aiEvaluation.usedFallback).toBe(false);
    expect(accepted.aiEvaluation.source).toBe("simulated_ai_scenario");
    expect(liveAccepted.aiEvaluation.source).toBe("live_ai");
    expect(accepted.finalRecommendations.every((item) => item.source === "ai_mixed")).toBe(true);
    expect(accepted.finalRecommendations.map((item) => item.contentId)).toEqual(
      accepted.mixedTop3.map((item) => item.contentId),
    );
    expect(fallback.aiEvaluation.usedFallback).toBe(true);
    expect(fallback.aiEvaluation.source).toBe("simulated_ai_scenario");
    expect(fallback.aiEvaluation.attemptsReceived).toBe(2);
    expect(fallback.finalRecommendations.every((item) => item.source === "ai_mixed")).toBe(true);
    expect(fallback.finalRecommendations.map((item) => item.contentId)).toEqual(
      fallback.mixedTop3.map((item) => item.contentId),
    );
  });

  it("builds personal fit from AI goal relation and server-owned scores", () => {
    const prepared = prepareAiCoachRun("user-05");
    const response = createDeterministicAiResponse(prepared.promptInput);
    const firstCandidate = prepared.promptInput.candidates[0];
    const unknownResponse = {
      ...response,
      items: response.items.map((item, index) =>
        index === 0 ? { ...item, goal_relation: "unknown" as const } : item,
      ),
    };
    const normalized = normalizeAiEvaluation(prepared, unknownResponse)[0];
    const expected = normalizePersonalFit({
      goal_fit: null,
      ...firstCandidate.server_fit_scores,
    });

    expect(normalized.goalRelation).toBe("unknown");
    expect(normalized.fitScores.goal_fit).toBeNull();
    expect(normalized.personalFit).toBeCloseTo(expected!, 1);
  });

  it("keeps evidence server-owned and maps each reason from the evidence catalog", () => {
    const prepared = prepareAiCoachRun("user-05");
    const contentId = prepared.promptInput.candidates[0].content_id;
    const candidateEvidence = [
      `content:${contentId}:goal`,
      `content:${contentId}:metadata`,
      `content:${contentId}:activity`,
    ];

    expect(new Set(prepared.evidenceCatalog.map((item) => item.id)).size).toBe(
      prepared.evidenceCatalog.length,
    );
    expect(candidateEvidence.every((id) =>
      prepared.evidenceCatalog.some((item) => item.id === id),
    )).toBe(true);
    expect(mapSystemEvidenceIds(prepared, contentId, "goal")).toEqual([
      `user:${prepared.user.id}:goal`,
      `content:${contentId}:goal`,
      `content:${contentId}:activity`,
    ]);
    expect(mapSystemEvidenceIds(prepared, contentId, "format")).toEqual([
      `behavior:${prepared.user.id}:format`,
      `content:${contentId}:metadata`,
      `content:${contentId}:activity`,
    ]);
    expect(mapSystemEvidenceIds(prepared, contentId, "level")).toEqual([
      `user:${prepared.user.id}:level`,
      `content:${contentId}:metadata`,
      `content:${contentId}:activity`,
    ]);
    expect(mapSystemEvidenceIds(prepared, contentId, "content_activity")).toEqual([
      `content:${contentId}:activity`,
    ]);
  });

  it("keeps deterministic fallback comments child-friendly and traceable", () => {
    const rawItems = userFixtures.flatMap((user) => {
      const prepared = prepareAiCoachRun(user.id);
      return createDeterministicAiResponse(prepared.promptInput).items;
    });

    expect(rawItems).toHaveLength(93);
    for (const item of rawItems) {
      expect([...item.comment]).toHaveLength(item.comment.length);
      expect([...item.comment].length).toBeLessThanOrEqual(80);
      expect(item.comment).not.toMatch(
        /오답|취약|틀리|틀렸|틀린|자주\s*틀|\d+(?:\.\d+)?\s*(?:%|점)/u,
      );
      expect(item.comment).not.toMatch(
        /평소 잘 맞는|평소 학습 시간 안에|지금 수준과 잘 맞는/u,
      );
      expect(item.comment).not.toMatch(
        /술술|확실히\s*(?:내\s*것|익)|머리에\s*쏙|재미있는/u,
      );
      expect(item.comment).not.toMatch(
        /내용이에요|방식이에요|분량이에요|알맞은 단계/u,
      );
      expect(item.comment.match(/[.!?]/gu)?.length ?? 0).toBeLessThanOrEqual(2);
      if (item.comment_reason !== "recent_learning") {
        expect(item.comment).not.toMatch(
          /헷갈|잠깐\s*멈|다시\s*확인할\s*부분|어려웠/u,
        );
      }
      if (item.comment_reason !== "duration") {
        expect(item.comment).not.toMatch(/\d+분/u);
      }
      expect(item.comment_reason).toMatch(
        /^(recent_learning|goal|format|duration|level|content_activity)$/u,
      );
      expect(item.goal_relation).toMatch(
        /^(direct|strong|indirect|unrelated|unknown)$/u,
      );
      expect(item).not.toHaveProperty("evidence_ids");
      expect(item).not.toHaveProperty("fit_scores");
    }
    expect(new Set(rawItems.map((item) => item.comment.split(" ")[0])).size).toBeGreaterThan(2);
    expect(rawItems.some((item) => item.comment_reason === "recent_learning")).toBe(true);
    expect(rawItems.some((item) => item.comment_reason !== "recent_learning")).toBe(true);

    for (const user of userFixtures) {
      const prepared = prepareAiCoachRun(user.id);
      const batchComments = createDeterministicAiResponse(
        prepared.promptInput,
      ).items.map((item) => item.comment);
      const finalComments = completeAiCoachRun(prepared).finalRecommendations.map(
        (item) => item.comment,
      );
      const batchStarts = batchComments.map((comment) =>
        [...comment].slice(0, 5).join(""),
      );
      const batchEndings = batchComments.map((comment) =>
        [...comment].slice(-5).join(""),
      );
      const starts = finalComments.map((comment) =>
        [...comment].slice(0, 5).join(""),
      );
      const endings = finalComments.map((comment) =>
        [...comment].slice(-5).join(""),
      );

      expect(new Set(batchStarts).size).toBe(batchStarts.length);
      expect(new Set(batchEndings).size).toBeGreaterThanOrEqual(
        Math.min(batchEndings.length, 6),
      );
      expect(new Set(starts).size).toBe(starts.length);
      expect(new Set(endings).size).toBe(endings.length);
      for (const phrase of ["평소", "잘 맞", "해 봐요"]) {
        expect(
          finalComments.filter((comment) => comment.includes(phrase)).length,
        ).toBeLessThanOrEqual(1);
      }
    }
  });

  it("passes only coarse recent-learning strength buckets to the AI prompt", () => {
    const strengths = userFixtures.flatMap((user) =>
      prepareAiCoachRun(user.id).promptInput.candidates.map(
        (candidate) => candidate.reason_context.recent_learning_strength,
      ),
    );

    expect(
      strengths.every(
        (strength) =>
          strength === null ||
          strength === 0.5 ||
          strength === 0.75 ||
          strength === 1,
      ),
    ).toBe(true);
  });

  it("uses the mixed AI top three as the final recommendations for the long-lecture fixture", () => {
    const run = runAiCoachDemo("user-05");

    expect(run.finalRecommendations.map((item) => item.contentId)).toEqual(
      run.mixedTop3.map((item) => item.contentId),
    );
    expect(run.finalRecommendations.map((item) => item.contentId)).not.toEqual(
      run.ruleTop3.map((item) => item.contentId),
    );
  });
});
