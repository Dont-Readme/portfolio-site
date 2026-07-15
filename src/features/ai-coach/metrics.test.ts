import { describe, expect, it } from "vitest";
import { completeAiCoachRun, prepareAiCoachRun } from "./engine";
import { benchmarkAiCoach, evaluateAiCoachRun, macroF1, ndcgAtK } from "./metrics";
import type { EvaluationLabel } from "./types";

const labels: EvaluationLabel[] = [
  {
    userId: "test-user",
    contentId: "a",
    personalFitGold: "high",
    ndcgRelevance: 3,
    source: "rubric_judged_synthetic",
  },
  {
    userId: "test-user",
    contentId: "b",
    personalFitGold: "medium",
    ndcgRelevance: 2,
    source: "rubric_judged_synthetic",
  },
  {
    userId: "test-user",
    contentId: "c",
    personalFitGold: "low",
    ndcgRelevance: 0,
    source: "rubric_judged_synthetic",
  },
];

describe("AI coach offline metrics", () => {
  it("calculates NDCG@3 with exponential gain and reports missing coverage", () => {
    expect(ndcgAtK(["a", "b", "c"], labels, 3)).toBe(1);
    expect(ndcgAtK(["c", "b", "a"], labels, 3)).toBeLessThan(1);
    expect(ndcgAtK(["a", "unknown", "c"], labels, 3)).toBeNull();
  });

  it("calculates macro F1 across low, medium, and high", () => {
    expect(
      macroF1(
        ["low", "medium", "high"],
        ["low", "medium", "high"],
      ).score,
    ).toBe(1);
  });

  it("benchmarks all fixtures without calling a paid API", () => {
    const result = benchmarkAiCoach();

    expect(result.users).toHaveLength(10);
    expect(result.labelCount).toBeGreaterThanOrEqual(85);
    expect(result.labelCount).toBeLessThanOrEqual(100);
    expect(result.users.every((user) => user.ruleNdcgAt3 !== null)).toBe(true);
    expect(result.users.every((user) => user.mixedNdcgAt3 !== null)).toBe(true);
    expect(result.versions.model).toMatch(/deterministic/i);
  });

  it("keeps evaluating the simulated AI mix after an API fallback", () => {
    const run = completeAiCoachRun(prepareAiCoachRun("user-05"));
    const result = evaluateAiCoachRun(run);

    expect(run.aiEvaluation.usedFallback).toBe(true);
    expect(run.finalRecommendations.map((item) => item.contentId)).toEqual(
      run.mixedTop3.map((item) => item.contentId),
    );
    expect(result.mixedNdcgAt3).not.toBe(result.ruleNdcgAt3);
    expect(result.delta).not.toBe(0);
  });
});
