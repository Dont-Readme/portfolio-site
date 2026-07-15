import {
  buildAiCoachPromptInput,
  createDeterministicAiResponse,
  prepareAiCoachRun,
  runAiCoachDemo,
} from "./engine";
import { evaluationLabels, getEvaluationLabelsForUser } from "./evaluation-labels";
import { AI_COACH_AS_OF, AI_COACH_VERSIONS, aiCoachFixtures, userFixtures } from "./fixtures";
import type {
  AiCoachPromptInput,
  AiCoachRunResult,
  BenchmarkResult,
  EvaluationLabel,
  FitGrade,
  LiveEvaluation,
  MacroF1Result,
  RecommendationCandidate,
} from "./types";
import {
  getFitGrade,
  normalizePersonalFit,
  scoreGoalRelation,
} from "./validation";

function round(value: number, digits = 4): number {
  const multiplier = 10 ** digits;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

export function ndcgAtK(
  rankedContentIds: readonly string[],
  labels: readonly EvaluationLabel[],
  k = 3,
): number | null {
  const relevanceById = new Map(labels.map((label) => [label.contentId, label.ndcgRelevance]));
  const ranked = rankedContentIds.slice(0, k);
  if (ranked.length === 0 || ranked.some((contentId) => !relevanceById.has(contentId))) return null;
  const dcg = ranked.reduce((sum, contentId, index) => {
    const relevance = relevanceById.get(contentId)!;
    return sum + (2 ** relevance - 1) / Math.log2(index + 2);
  }, 0);
  const ideal = [...labels]
    .sort((a, b) => b.ndcgRelevance - a.ndcgRelevance || a.contentId.localeCompare(b.contentId))
    .slice(0, Math.min(k, ranked.length));
  const idcg = ideal.reduce(
    (sum, label, index) => sum + (2 ** label.ndcgRelevance - 1) / Math.log2(index + 2),
    0,
  );
  return idcg === 0 ? 0 : round(dcg / idcg);
}

function coverage(
  contentIds: readonly string[],
  labels: readonly EvaluationLabel[],
): number {
  if (contentIds.length === 0) return 0;
  const labeled = new Set(labels.map((label) => label.contentId));
  return round(contentIds.filter((contentId) => labeled.has(contentId)).length / contentIds.length);
}

export function evaluateAiCoachRun(run: AiCoachRunResult): LiveEvaluation {
  const labels = getEvaluationLabelsForUser(run.fixtureId);
  const ruleIds = run.ruleTop3.map((item) => item.contentId);
  const mixedIds = run.mixedTop3.map((item) => item.contentId);
  const ruleNdcgAt3 = ndcgAtK(ruleIds, labels, 3);
  const mixedNdcgAt3 = ndcgAtK(mixedIds, labels, 3);
  return {
    ruleNdcgAt3,
    mixedNdcgAt3,
    delta: ruleNdcgAt3 === null || mixedNdcgAt3 === null
      ? null
      : round(mixedNdcgAt3 - ruleNdcgAt3),
    labelCoverage: {
      rule: coverage(ruleIds, labels),
      mixed: coverage(mixedIds, labels),
    },
  };
}

export function macroF1(
  actual: readonly FitGrade[],
  predicted: readonly FitGrade[],
): MacroF1Result {
  if (actual.length !== predicted.length) throw new Error("Macro F1 inputs must have equal lengths.");
  const grades: FitGrade[] = ["low", "medium", "high"];
  const byGrade = Object.fromEntries(
    grades.map((grade) => {
      let truePositive = 0;
      let falsePositive = 0;
      let falseNegative = 0;
      let support = 0;
      actual.forEach((gold, index) => {
        const guess = predicted[index];
        if (gold === grade) support += 1;
        if (gold === grade && guess === grade) truePositive += 1;
        else if (gold !== grade && guess === grade) falsePositive += 1;
        else if (gold === grade && guess !== grade) falseNegative += 1;
      });
      const precision = truePositive + falsePositive === 0
        ? 0
        : truePositive / (truePositive + falsePositive);
      const recall = truePositive + falseNegative === 0
        ? 0
        : truePositive / (truePositive + falseNegative);
      const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
      return [grade, { precision: round(precision), recall: round(recall), f1: round(f1), support }];
    }),
  ) as MacroF1Result["byGrade"];
  return {
    score: round(grades.reduce((sum, grade) => sum + byGrade[grade].f1, 0) / grades.length),
    byGrade,
  };
}

function predictionPromptForLabels(
  userId: string,
  labels: readonly EvaluationLabel[],
): AiCoachPromptInput {
  const prepared = prepareAiCoachRun(userId);
  const contentsById = new Map(aiCoachFixtures.contents.map((content) => [content.id, content]));
  const weaknessByConcept = new Map(
    prepared.conceptWeaknesses.map((weakness) => [
      weakness.conceptId,
      weakness,
    ]),
  );
  const candidates: RecommendationCandidate[] = labels.map((label) => {
    const content = contentsById.get(label.contentId);
    if (!content) {
      throw new Error(
        `Benchmark label references unknown content: ${label.contentId}`,
      );
    }
    const weakness = weaknessByConcept.get(content.primaryConceptId);
    const concept = aiCoachFixtures.concepts.find(
      (item) => item.id === content.primaryConceptId,
    );
    if (!concept) {
      throw new Error(
        `Benchmark content references unknown concept: ${content.primaryConceptId}`,
      );
    }
    return {
      content,
      conceptId: content.primaryConceptId,
      conceptName: concept.name,
      weaknessScore: weakness?.finalScore ?? 0,
      evidence: [],
    };
  });

  return buildAiCoachPromptInput(
    `${prepared.requestId}-benchmark`,
    prepared.user,
    prepared.behaviorProfile,
    prepared.conceptWeaknesses,
    {
      ...prepared.candidateSelection,
      candidates,
      deliveredCount: candidates.length,
    },
  );
}

export function benchmarkAiCoach(): BenchmarkResult {
  const userResults = userFixtures.map((user) => ({
    userId: user.id,
    ...evaluateAiCoachRun(runAiCoachDemo(user.id)),
  }));
  const actual: FitGrade[] = [];
  const predicted: FitGrade[] = [];
  for (const user of userFixtures) {
    const labels = getEvaluationLabelsForUser(user.id);
    const prompt = predictionPromptForLabels(user.id, labels);
    const response = createDeterministicAiResponse(prompt);
    response.items.forEach((item, index) => {
      const candidate = prompt.candidates[index];
      const score = normalizePersonalFit({
        goal_fit: scoreGoalRelation(item.goal_relation),
        ...candidate.server_fit_scores,
      });
      if (score === null) throw new Error(`Benchmark score is empty for ${item.content_id}`);
      actual.push(labels[index].personalFitGold);
      predicted.push(getFitGrade(score));
    });
  }
  const ruleValues = userResults.flatMap((result) => result.ruleNdcgAt3 === null ? [] : [result.ruleNdcgAt3]);
  const mixedValues = userResults.flatMap((result) => result.mixedNdcgAt3 === null ? [] : [result.mixedNdcgAt3]);
  const average = (values: number[]) => values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
  const averageRuleNdcgAt3 = round(average(ruleValues));
  const averageMixedNdcgAt3 = round(average(mixedValues));
  return {
    generatedAt: AI_COACH_AS_OF,
    versions: { ...AI_COACH_VERSIONS, model: "deterministic-ai-scenario.v3" },
    labelCount: evaluationLabels.length,
    macroF1: macroF1(actual, predicted),
    averageRuleNdcgAt3,
    averageMixedNdcgAt3,
    averageDelta: round(averageMixedNdcgAt3 - averageRuleNdcgAt3),
    users: userResults,
  };
}

export const AI_COACH_BENCHMARK_RESULT = benchmarkAiCoach();
