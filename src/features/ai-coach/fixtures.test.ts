import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { evaluationLabels } from "./evaluation-labels";
import { prepareAiCoachRun } from "./engine";
import {
  AI_COACH_DATA_SUMMARY,
  aiCoachFixtures,
  fixtureIds,
  userFixtures,
} from "./fixtures";

describe("AI coach synthetic fixture", () => {
  it("matches the documented deterministic dataset size", () => {
    expect(AI_COACH_DATA_SUMMARY).toMatchObject({
      units: 4,
      concepts: 8,
      questionMappings: 24,
      contents: 40,
      users: 10,
      problemAttempts: 180,
      contentHistoryEvents: 80,
      evaluationLabels: 93,
    });
    expect(aiCoachFixtures.diagnosticResults).toHaveLength(14);
    expect(new Set(fixtureIds).size).toBe(10);
  });

  it("keeps rubric-judged gold labels in the evaluation-only module", () => {
    expect(evaluationLabels).toHaveLength(93);
    expect(
      evaluationLabels.every(
        (label) => label.source === "rubric_judged_synthetic",
      ),
    ).toBe(true);

    const fitDistribution = evaluationLabels.reduce<Record<string, number>>(
      (counts, label) => {
        counts[label.personalFitGold] =
          (counts[label.personalFitGold] ?? 0) + 1;
        return counts;
      },
      {},
    );
    const relevanceDistribution = evaluationLabels.reduce<
      Record<string, number>
    >(
      (counts, label) => {
        counts[label.ndcgRelevance] =
          (counts[label.ndcgRelevance] ?? 0) + 1;
        return counts;
      },
      {},
    );

    expect(fitDistribution).toEqual({ high: 57, medium: 32, low: 4 });
    expect(relevanceDistribution).toEqual({ 0: 5, 1: 12, 2: 47, 3: 29 });

    const candidateLabelIds = userFixtures.flatMap((user) =>
      prepareAiCoachRun(user.id).promptInput.candidates.map(
        (candidate) => `${user.id}__${candidate.content_id}`,
      ),
    );
    const evaluationLabelIds = evaluationLabels.map(
      (label) => `${label.userId}__${label.contentId}`,
    );

    expect([...evaluationLabelIds].sort()).toEqual(
      [...candidateLabelIds].sort(),
    );

    const promptModuleSource = readFileSync(
      new URL("./prompt.ts", import.meta.url),
      "utf8",
    );
    expect(promptModuleSource).not.toMatch(
      /from\s+["']\.\/evaluation-labels["']/,
    );
  });
});
