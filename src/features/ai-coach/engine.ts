import {
  AI_COACH_AS_OF,
  AI_COACH_DATA_SUMMARY,
  AI_COACH_VERSIONS,
  aiCoachFixtures,
  getUserFixture,
} from "./fixtures";
import type {
  AiCoachPromptInput,
  AiCoachRunResult,
  AiEvaluationResponse,
  BehaviorProfile,
  CandidateExclusionReason,
  CandidateSelection,
  CompleteAiCoachRunOptions,
  CommentReason,
  ConceptWeakness,
  ContentHistoryEvent,
  ContentType,
  DiversityResult,
  EventAudit,
  Evidence,
  FitScores,
  GoalRelation,
  LearningContent,
  NormalizedAiEvaluation,
  PipelineStep,
  PreparedAiCoachRun,
  ProblemAttempt,
  RankedRecommendation,
  RecommendationCandidate,
  UnitWeakness,
  UserFixture,
  UserId,
} from "./types";
import {
  combineRecommendationScore,
  getFitGrade,
  normalizePersonalFit,
  scoreGoalRelation,
  validateAiEvaluationResponse,
} from "./validation";

const DAY_MS = 86_400_000;
const CONTENT_TYPES: ContentType[] = ["quiz", "video", "reading", "practice"];

function withObjectParticle(value: string): string {
  const lastCodePoint = value.codePointAt(value.length - 1);
  if (lastCodePoint === undefined || lastCodePoint < 0xac00 || lastCodePoint > 0xd7a3) {
    return `${value}를`;
  }
  return `${value}${(lastCodePoint - 0xac00) % 28 === 0 ? "를" : "을"}`;
}

function withSubjectParticle(value: string): string {
  const lastCodePoint = value.codePointAt(value.length - 1);
  if (lastCodePoint === undefined || lastCodePoint < 0xac00 || lastCodePoint > 0xd7a3) {
    return `${value}가`;
  }
  return `${value}${(lastCodePoint - 0xac00) % 28 === 0 ? "가" : "이"}`;
}

function withInstrumentalParticle(value: string): string {
  const lastCodePoint = value.codePointAt(value.length - 1);
  if (lastCodePoint === undefined || lastCodePoint < 0xac00 || lastCodePoint > 0xd7a3) {
    return `${value}로`;
  }
  const finalConsonant = (lastCodePoint - 0xac00) % 28;
  return `${value}${finalConsonant !== 0 && finalConsonant !== 8 ? "으로" : "로"}`;
}

function round(value: number, digits = 2): number {
  const multiplier = 10 ** digits;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

function compareStableAttempts(a: ProblemAttempt, b: ProblemAttempt): number {
  return Date.parse(a.occurredAt) - Date.parse(b.occurredAt) || a.id.localeCompare(b.id);
}

export function selectValidProblemAttempts(
  attempts: readonly ProblemAttempt[],
  asOf = AI_COACH_AS_OF,
): { valid: ProblemAttempt[]; audit: EventAudit } {
  const excludedByReason: EventAudit["excludedByReason"] = {
    duplicate: 0,
    ungraded: 0,
    invalid: 0,
    unmapped: 0,
    future: 0,
  };
  const excluded: EventAudit["excluded"] = [];
  const valid: ProblemAttempt[] = [];
  const seenKeys = new Set<string>();
  const mappings = new Map(
    aiCoachFixtures.questionMappings
      .filter((mapping) => mapping.isActive)
      .map((mapping) => [mapping.questionId, mapping]),
  );

  for (const attempt of [...attempts].sort(compareStableAttempts)) {
    let reason: keyof EventAudit["excludedByReason"] | null = null;
    if (Date.parse(attempt.occurredAt) > Date.parse(asOf)) reason = "future";
    else if (!attempt.isValid) reason = "invalid";
    else if (!attempt.isGraded || typeof attempt.isCorrect !== "boolean") reason = "ungraded";
    else if (!mappings.has(attempt.questionId)) reason = "unmapped";
    else if (seenKeys.has(attempt.idempotencyKey)) reason = "duplicate";

    if (reason) {
      excludedByReason[reason] += 1;
      excluded.push({ eventId: attempt.id, reason });
      continue;
    }
    seenKeys.add(attempt.idempotencyKey);
    valid.push(attempt);
  }

  return {
    valid,
    audit: {
      rawCount: attempts.length,
      validCount: valid.length,
      excludedCount: excluded.length,
      excludedByReason,
      excluded,
    },
  };
}

export function deriveBehaviorProfile(
  user: UserFixture,
  history: readonly ContentHistoryEvent[] = aiCoachFixtures.contentHistoryEvents,
  asOf = AI_COACH_AS_OF,
): BehaviorProfile | null {
  if (!user.behaviorProfileEnabled) return null;
  const events = history.filter(
    (event) => event.userId === user.id && Date.parse(event.occurredAt) <= Date.parse(asOf),
  );
  if (events.length === 0) return null;
  const contentById = new Map(aiCoachFixtures.contents.map((content) => [content.id, content]));
  const stats = CONTENT_TYPES.map((type) => {
    const typed = events.filter((event) => contentById.get(event.contentId)?.type === type);
    const completed = typed.filter((event) => event.status === "completed");
    return {
      type,
      attempts: typed.length,
      rate: typed.length === 0 ? 0 : completed.length / typed.length,
      completed,
    };
  });
  const preferredTypes = stats
    .filter((stat) => stat.attempts > 0)
    .sort((a, b) => b.attempts - a.attempts || b.rate - a.rate || a.type.localeCompare(b.type))
    .slice(0, 2)
    .map((stat) => stat.type);
  const completed = events.filter((event) => event.status === "completed");
  const averageStudyMinutes = completed.length === 0
    ? events.reduce((sum, event) => sum + event.actualMinutes, 0) / events.length
    : completed.reduce((sum, event) => sum + event.actualMinutes, 0) / completed.length;
  const completionRateByType = Object.fromEntries(
    stats.filter((stat) => stat.attempts > 0).map((stat) => [stat.type, round(stat.rate, 3)]),
  );
  return {
    preferredTypes,
    completionRateByType,
    averageStudyMinutes: round(averageStudyMinutes, 1),
    sourceEventCount: events.length,
    evidence: [
      { id: `behavior:${user.id}:format`, kind: "behavior", label: "선호 콘텐츠 유형", value: preferredTypes.join(", ") },
      { id: `behavior:${user.id}:duration`, kind: "behavior", label: "평균 학습 시간(분)", value: round(averageStudyMinutes, 1) },
    ],
  };
}

export function computeConceptWeaknesses(
  user: UserFixture,
  validAttempts: readonly ProblemAttempt[],
  asOf = AI_COACH_AS_OF,
): ConceptWeakness[] {
  const conceptByQuestion = new Map(
    aiCoachFixtures.questionMappings.map((mapping) => [mapping.questionId, mapping.conceptId]),
  );
  const diagnostics = aiCoachFixtures.diagnosticResults.filter(
    (result) => result.userId === user.id && Date.parse(result.completedAt) <= Date.parse(asOf),
  );

  return aiCoachFixtures.concepts.map((concept) => {
    const attempts = validAttempts
      .filter((attempt) => conceptByQuestion.get(attempt.questionId) === concept.id)
      .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt) || a.id.localeCompare(b.id));
    const recent = attempts.slice(0, 5);
    const recentIncorrectRate = recent.length === 0
      ? null
      : (recent.filter((attempt) => !attempt.isCorrect).length / recent.length) * 100;
    const cumulativeIncorrectRate = attempts.length === 0
      ? null
      : (attempts.filter((attempt) => !attempt.isCorrect).length / attempts.length) * 100;
    const behaviorScore = recentIncorrectRate === null || cumulativeIncorrectRate === null
      ? null
      : recentIncorrectRate * 0.7 + cumulativeIncorrectRate * 0.3;
    const conceptDiagnostics = diagnostics.filter((result) => result.conceptId === concept.id);
    const diagnosticQuestionCount = conceptDiagnostics.reduce((sum, result) => sum + result.questionCount, 0);
    const diagnosticIncorrectCount = conceptDiagnostics.reduce((sum, result) => sum + result.incorrectCount, 0);
    const diagnosticScore = diagnosticQuestionCount >= 3
      ? (diagnosticIncorrectCount / diagnosticQuestionCount) * 100
      : null;
    const confidence = attempts.length >= 10 ? "high" : attempts.length >= 5 ? "medium" : "low";

    let finalScore = 0;
    let dataStage: ConceptWeakness["dataStage"] = "insufficient";
    if (user.status === "new") {
      if (attempts.length < 5) {
        finalScore = diagnosticScore ?? behaviorScore ?? 0;
        dataStage = diagnosticScore === null ? "insufficient" : "diagnostic";
      } else if (attempts.length < 10) {
        finalScore = diagnosticScore !== null && behaviorScore !== null
          ? (diagnosticScore + behaviorScore) / 2
          : behaviorScore ?? diagnosticScore ?? 0;
        dataStage = diagnosticScore !== null && behaviorScore !== null
          ? "diagnostic_behavior_mix"
          : behaviorScore !== null ? "behavior" : "insufficient";
      } else {
        finalScore = behaviorScore ?? diagnosticScore ?? 0;
        dataStage = behaviorScore === null ? "diagnostic" : "behavior";
      }
    } else {
      finalScore = behaviorScore ?? diagnosticScore ?? 0;
      dataStage = behaviorScore !== null ? "behavior" : diagnosticScore !== null ? "diagnostic" : "insufficient";
    }

    const evidence: Evidence[] = [{
      id: `weakness:${user.id}:${concept.id}`,
      kind: "weakness",
      label: `${concept.name} 최종 취약도`,
      value: round(finalScore, 1),
    }];
    if (recentIncorrectRate !== null) {
      evidence.push({
        id: `weakness:${user.id}:${concept.id}:recent`,
        kind: "weakness",
        label: `${concept.name} 최근 ${recent.length}회 오답률`,
        value: round(recentIncorrectRate, 1),
      });
    }

    return {
      conceptId: concept.id,
      conceptName: concept.name,
      unitId: concept.unitId,
      recentIncorrectRate: recentIncorrectRate === null ? null : round(recentIncorrectRate),
      cumulativeIncorrectRate: cumulativeIncorrectRate === null ? null : round(cumulativeIncorrectRate),
      recentWindowCount: recent.length,
      validAttemptCount: attempts.length,
      diagnosticScore: diagnosticScore === null ? null : round(diagnosticScore),
      behaviorScore: behaviorScore === null ? null : round(behaviorScore),
      finalScore: round(finalScore),
      confidence,
      dataStage,
      evidence,
    };
  });
}

export function computeUnitWeaknesses(
  conceptWeaknesses: readonly ConceptWeakness[],
): UnitWeakness[] {
  return aiCoachFixtures.units.map((unit) => {
    const included = conceptWeaknesses.filter(
      (weakness) => weakness.unitId === unit.id && weakness.confidence !== "low",
    );
    const sorted = [...included].sort(
      (a, b) => b.finalScore - a.finalScore || a.conceptId.localeCompare(b.conceptId),
    );
    return {
      unitId: unit.id,
      unitName: unit.name,
      score: included.length === 0
        ? null
        : round(included.reduce((sum, weakness) => sum + weakness.finalScore, 0) / included.length),
      includedConceptCount: included.length,
      topConceptId: sorted[0]?.conceptId ?? null,
    };
  });
}

function candidateEvidence(contentId: string): Evidence[] {
  const content = aiCoachFixtures.contents.find((item) => item.id === contentId)!;
  return [
    { id: `content:${content.id}:goal`, kind: "content", label: "콘텐츠 학습 목표", value: content.learningGoal },
    { id: `content:${content.id}:metadata`, kind: "content", label: "유형·시간·난이도", value: `${content.type}/${content.estimatedMinutes}분/레벨${content.difficulty}` },
    { id: `content:${content.id}:activity`, kind: "content", label: "구체 학습 활동", value: content.activity },
  ];
}

export function selectRecommendationCandidates(
  user: UserFixture,
  weaknesses: readonly ConceptWeakness[],
  asOf = AI_COACH_AS_OF,
): CandidateSelection {
  const topWeaknesses = [...weaknesses]
    .sort((a, b) => b.finalScore - a.finalScore || a.conceptId.localeCompare(b.conceptId))
    .slice(0, 3);
  const weaknessByConcept = new Map(weaknesses.map((weakness) => [weakness.conceptId, weakness]));
  const queried = topWeaknesses.flatMap((weakness) =>
    aiCoachFixtures.contents
      .filter((content) => content.primaryConceptId === weakness.conceptId)
      .sort((a, b) => b.popularity - a.popularity || a.id.localeCompare(b.id))
      .slice(0, 5),
  );
  const recentCutoff = Date.parse(asOf) - 7 * DAY_MS;
  const recentlyCompleted = new Set(
    aiCoachFixtures.contentHistoryEvents
      .filter(
        (event) =>
          event.userId === user.id &&
          event.status === "completed" &&
          Date.parse(event.occurredAt) >= recentCutoff &&
          Date.parse(event.occurredAt) <= Date.parse(asOf),
      )
      .map((event) => event.contentId),
  );
  const excludedByReason: Record<CandidateExclusionReason, number> = {
    inactive: 0,
    difficulty_gap: 0,
    recently_completed: 0,
    over_candidate_limit: 0,
  };
  const excluded: CandidateSelection["excluded"] = [];
  const eligible: RecommendationCandidate[] = [];

  for (const content of queried) {
    let reason: CandidateExclusionReason | null = null;
    if (!content.isActive) reason = "inactive";
    else if (Math.abs(content.difficulty - user.level) > 1) reason = "difficulty_gap";
    else if (recentlyCompleted.has(content.id)) reason = "recently_completed";
    if (reason) {
      excludedByReason[reason] += 1;
      excluded.push({ contentId: content.id, reason });
      continue;
    }
    const weakness = weaknessByConcept.get(content.primaryConceptId)!;
    eligible.push({
      content,
      conceptId: content.primaryConceptId,
      conceptName: weakness.conceptName,
      weaknessScore: weakness.finalScore,
      evidence: candidateEvidence(content.id),
    });
  }

  const candidates = eligible.slice(0, 10);
  for (const candidate of eligible.slice(10)) {
    excludedByReason.over_candidate_limit += 1;
    excluded.push({ contentId: candidate.content.id, reason: "over_candidate_limit" });
  }

  let fallbackCandidatesAdded = 0;
  if (candidates.length < 3) {
    const selectedIds = new Set([...queried.map((content) => content.id), ...candidates.map((candidate) => candidate.content.id)]);
    const fallbackContents = aiCoachFixtures.contents
      .filter(
        (content) =>
          !selectedIds.has(content.id) &&
          content.isActive &&
          Math.abs(content.difficulty - user.level) <= 1 &&
          !recentlyCompleted.has(content.id),
      )
      .sort((a, b) => b.popularity - a.popularity || a.id.localeCompare(b.id));
    while (candidates.length < 3 && fallbackContents.length > 0) {
      const selectedTypes = new Set(candidates.map((candidate) => candidate.content.type));
      const selectedConcepts = new Set(candidates.map((candidate) => candidate.conceptId));
      fallbackContents.sort((a, b) => {
        const aDiversity = Number(!selectedTypes.has(a.type)) * 2 + Number(!selectedConcepts.has(a.primaryConceptId));
        const bDiversity = Number(!selectedTypes.has(b.type)) * 2 + Number(!selectedConcepts.has(b.primaryConceptId));
        return bDiversity - aDiversity || b.popularity - a.popularity || a.id.localeCompare(b.id);
      });
      const content = fallbackContents.shift()!;
      const weakness = weaknessByConcept.get(content.primaryConceptId)!;
      candidates.push({
        content,
        conceptId: content.primaryConceptId,
        conceptName: weakness.conceptName,
        weaknessScore: weakness.finalScore,
        evidence: candidateEvidence(content.id),
      });
      fallbackCandidatesAdded += 1;
    }
  }

  return {
    topConceptIds: topWeaknesses.map((weakness) => weakness.conceptId),
    queriedCount: queried.length,
    eligibleCount: eligible.length,
    deliveredCount: candidates.length,
    excludedByReason,
    excluded,
    candidates,
    fallbackCandidatesAdded,
  };
}

function userEvidence(user: UserFixture, profile: BehaviorProfile | null): Evidence[] {
  return [
    { id: `user:${user.id}:goal`, kind: "user", label: "학습 목표", value: user.learningGoal },
    { id: `user:${user.id}:level`, kind: "user", label: "학습 수준", value: user.level },
    ...(profile?.evidence ?? []),
  ];
}

export function buildEvidenceCatalog(
  user: UserFixture,
  profile: BehaviorProfile | null,
  weaknesses: readonly ConceptWeakness[],
  selection: CandidateSelection,
): Evidence[] {
  const evidence = [
    ...userEvidence(user, profile),
    ...weaknesses.flatMap((weakness) => weakness.evidence),
    ...selection.candidates.flatMap((candidate) => candidate.evidence),
  ];
  const unique = new Map<string, Evidence>();
  for (const item of evidence) {
    if (!unique.has(item.id)) unique.set(item.id, item);
  }
  return [...unique.values()];
}

function formatReasonSummary(
  type: ContentType,
  score: number | null,
): string | null {
  if (score === null) return null;
  const label = STUDENT_TYPE_LABEL[type];
  if (score === 25) return `${label}가 1순위 선호 유형이고 완료 경향이 높음`;
  if (score === 22) return `${label}가 선호 유형에 포함됨`;
  if (score === 20) return `${label}의 완료 경향이 높음`;
  return `${label} 이용 기록이 확인됨`;
}

function durationReasonSummary(
  estimatedMinutes: number,
  score: number | null,
): string | null {
  if (score === null) return null;
  if (score === 20) return `${estimatedMinutes}분 분량이 평균 학습 시간 이내임`;
  if (score === 16) return `${estimatedMinutes}분 분량이 평균 학습 시간의 1.25배 이내임`;
  if (score === 10) return `${estimatedMinutes}분 분량이 평균 학습 시간의 1.5배 이내임`;
  return `${estimatedMinutes}분 분량의 콘텐츠임`;
}

function levelReasonSummary(score: number | null): string | null {
  if (score === null) return null;
  if (score === 20) return "사용자의 현재 학습 단계와 같은 난이도임";
  if (score === 14) return "사용자의 현재 학습 단계와 한 단계 차이임";
  return "사용자의 현재 학습 단계와 두 단계 이상 차이임";
}

function bucketRecentLearningStrength(
  recentIncorrectRate: number | null | undefined,
): number | null {
  if (recentIncorrectRate === null || recentIncorrectRate === undefined || recentIncorrectRate <= 0) {
    return null;
  }
  if (recentIncorrectRate >= 60) return 1;
  if (recentIncorrectRate >= 30) return 0.75;
  return 0.5;
}

export function buildAiCoachPromptInput(
  requestId: string,
  user: UserFixture,
  profile: BehaviorProfile | null,
  weaknesses: readonly ConceptWeakness[],
  selection: CandidateSelection,
  asOf = AI_COACH_AS_OF,
): AiCoachPromptInput {
  const weaknessByConcept = new Map(
    weaknesses.map((weakness) => [weakness.conceptId, weakness]),
  );
  return {
    request_id: requestId,
    as_of: asOf,
    user: {
      learning_goal: user.learningGoal,
      goal_tags: [...user.goalTags],
    },
    candidates: selection.candidates.map((candidate) => {
      const { content } = candidate;
      const weakness = weaknessByConcept.get(candidate.conceptId);
      const serverFitScores = calculateServerFitScores(
        user.level,
        profile,
        content,
      );
      const recentLearningStrength = bucketRecentLearningStrength(
        weakness?.recentIncorrectRate,
      );
      const allowedCommentReasons: CommentReason[] = [];
      if (user.learningGoal.trim() && content.learningGoal.trim()) {
        allowedCommentReasons.push("goal");
      }
      if (recentLearningStrength !== null) {
        allowedCommentReasons.push("recent_learning");
      }
      if (serverFitScores.format_fit !== null) {
        allowedCommentReasons.push("format");
      }
      if (serverFitScores.duration_fit !== null) {
        allowedCommentReasons.push("duration");
      }
      if (serverFitScores.level_fit !== null) {
        allowedCommentReasons.push("level");
      }
      allowedCommentReasons.push("content_activity");

      return {
        content_id: content.id,
        title: content.title,
        type: content.type,
        estimated_minutes: content.estimatedMinutes,
        primary_concept_id: content.primaryConceptId,
        concept_name: candidate.conceptName,
        learning_goal: content.learningGoal,
        goal_tags: [...content.goalTags],
        activity: content.activity,
        server_fit_scores: serverFitScores,
        reason_context: {
          recent_learning_strength: recentLearningStrength,
          recent_learning_summary:
            recentLearningStrength === null
              ? null
              : `최근 ${candidate.conceptName} 학습에서 다시 확인할 내용이 있음`,
          format_summary: formatReasonSummary(
            content.type,
            serverFitScores.format_fit,
          ),
          duration_summary: durationReasonSummary(
            content.estimatedMinutes,
            serverFitScores.duration_fit,
          ),
          level_summary: levelReasonSummary(serverFitScores.level_fit),
          allowed_comment_reasons: allowedCommentReasons,
        },
      };
    }),
  };
}

export function calculateFormatFit(
  profile: BehaviorProfile | null,
  contentType: ContentType,
): number | null {
  if (!profile) return null;

  const observed = Object.hasOwn(profile.completionRateByType, contentType);
  const preferenceIndex = profile.preferredTypes.indexOf(contentType);
  if (!observed && preferenceIndex < 0) return null;

  const completionRate = profile.completionRateByType[contentType] ?? 0;
  if (preferenceIndex === 0 && completionRate >= 0.75) return 25;
  if (preferenceIndex >= 0) return 22;
  if (completionRate >= 0.75) return 20;
  if (completionRate >= 0.5) return 16;
  return 8;
}

export function calculateDurationFit(
  profile: BehaviorProfile | null,
  estimatedMinutes: number | null | undefined,
): number | null {
  if (!profile || estimatedMinutes === null || estimatedMinutes === undefined) {
    return null;
  }

  const ratio = estimatedMinutes / Math.max(profile.averageStudyMinutes, 1);
  if (ratio <= 1) return 20;
  if (ratio <= 1.25) return 16;
  if (ratio <= 1.5) return 10;
  return 4;
}

export function calculateLevelFit(
  userLevel: number | null | undefined,
  difficulty: number | null | undefined,
): number | null {
  if (userLevel === null || userLevel === undefined || difficulty === null || difficulty === undefined) {
    return null;
  }

  const gap = Math.abs(userLevel - difficulty);
  if (gap === 0) return 20;
  if (gap === 1) return 14;
  return 5;
}

export function calculateServerFitScores(
  userLevel: number | null | undefined,
  profile: BehaviorProfile | null,
  content: Pick<
    LearningContent,
    "type" | "estimatedMinutes" | "difficulty"
  >,
): AiCoachPromptInput["candidates"][number]["server_fit_scores"] {
  return {
    format_fit: calculateFormatFit(profile, content.type),
    duration_fit: calculateDurationFit(profile, content.estimatedMinutes),
    level_fit: calculateLevelFit(userLevel, content.difficulty),
  };
}

export function inferDeterministicGoalRelation(
  input: AiCoachPromptInput,
  candidate: AiCoachPromptInput["candidates"][number],
): GoalRelation {
  const userGoal = input.user.learning_goal.trim();
  const candidateGoal = candidate.learning_goal.trim();
  if (!userGoal || !candidateGoal) return "unknown";

  const userTags = new Set(input.user.goal_tags.map((tag) => tag.toLowerCase()));
  const candidateTags = candidate.goal_tags.map((tag) => tag.toLowerCase());
  const sharedTags = candidateTags.filter((tag) => userTags.has(tag));
  const exactConceptMatch = userTags.has(
    candidate.primary_concept_id.toLowerCase(),
  );
  const broadGoalTags = new Set(["grammar", "reading", "tense"]);
  const specificSharedTags = sharedTags.filter(
    (tag) => !broadGoalTags.has(tag),
  );
  const conceptMentioned = userGoal.includes(candidate.concept_name);

  if (
    userGoal === candidateGoal ||
    exactConceptMatch ||
    conceptMentioned ||
    specificSharedTags.length > 0
  ) {
    return "direct";
  }
  if (sharedTags.some((tag) => tag === "tense" || tag === "reading")) {
    return "strong";
  }
  if (sharedTags.includes("grammar")) return "indirect";
  return "unrelated";
}

type RecommendationReasonOption = {
  type: CommentReason;
  strength: number;
  sentences: string[];
};

const STUDENT_TYPE_LABEL: Record<ContentType, string> = {
  quiz: "퀴즈",
  video: "영상",
  reading: "읽기",
  practice: "문제 풀이",
};

const GOAL_TAG_LABEL: Record<string, string> = {
  tense: "시제",
  modals: "조동사",
  passive: "수동태",
  clause: "문장 연결",
  conditionals: "가정법",
  vocabulary: "문맥 어휘",
  inference: "독해 추론",
  grammar: "문법",
  reading: "독해",
};

const REASON_PRIORITY_BY_TYPE: Record<ContentType, CommentReason[]> = {
  quiz: ["duration", "format", "goal", "level", "recent_learning", "content_activity"],
  video: ["goal", "level", "recent_learning", "duration", "format", "content_activity"],
  reading: ["level", "goal", "format", "duration", "recent_learning", "content_activity"],
  practice: ["goal", "recent_learning", "level", "format", "duration", "content_activity"],
};

function uniqueEvidenceIds(
  ids: ReadonlyArray<string | null | undefined>,
): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

function getGoalLabel(
  input: AiCoachPromptInput,
  candidate: AiCoachPromptInput["candidates"][number],
): string | null {
  const sharedTags = candidate.goal_tags.filter((tag) =>
    input.user.goal_tags.includes(tag),
  );
  const specificTag = sharedTags.find(
    (tag) => tag !== "grammar" && tag !== "reading" && GOAL_TAG_LABEL[tag],
  );
  const tag = specificTag ?? sharedTags.find((item) => GOAL_TAG_LABEL[item]);
  return tag ? GOAL_TAG_LABEL[tag] : null;
}

function rotateBySeed<T>(values: readonly T[], seed: number): T[] {
  if (values.length === 0) return [];
  const offset = seed % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}

function getGroundedActivitySentences(
  candidate: AiCoachPromptInput["candidates"][number],
): string[] {
  // 일부 합성 콘텐츠의 활동명에는 진단처럼 들릴 수 있는 표현이 있다.
  // 최근 학습 근거를 선택하지 않은 문구에는 그 표현이 새어 나오지 않게 한다.
  let activity = candidate.activity
    .replace(/헷갈린\s*/gu, "")
    .replace(/오답\s*/gu, "다시 볼 ")
    .replace(/자주\s*틀리는\s*/gu, "여러 ")
    .trim();
  if (candidate.concept_name === "문맥 어휘") {
    activity = activity.replace(
      /^문맥 어휘 문맥 속 쓰임을 찾아 비교하기$/u,
      "문장 속 문맥 어휘를 찾아 비교하기",
    );
  }

  const forms = (
    suffix: string,
    invitation: string,
    connective: string,
    focus: string,
    start: string,
  ): string[] | null => {
    if (!activity.endsWith(suffix)) return null;
    const prefix = activity.slice(0, -suffix.length);
    return [
      `${prefix}${invitation}`,
      `${prefix}${connective} 이어가요.`,
      `${prefix}${focus} 집중해요.`,
      `${prefix}${start} 시작해요.`,
      `${prefix}${connective} 하나씩 짚어봐요!`,
      `${prefix}${connective} 차근차근 따라가요.`,
      `${prefix}${connective} 직접 연습해요.`,
      `${prefix}${connective} 하나씩 정리해요.`,
    ];
  };

  if (activity.endsWith("유형을 구별하며 고르기")) {
    const prefix = activity.slice(0, -"유형을 구별하며 고르기".length);
    return [
      `${prefix}유형을 하나씩 골라 볼까요?`,
      `${prefix}유형을 가려내며 이어가요.`,
      `${prefix}유형을 구별하는 데 집중해요.`,
      `${prefix}유형 고르기부터 시작해요.`,
      `${prefix}유형을 하나씩 짚어봐요!`,
      `${prefix}유형을 차근차근 나눠봐요.`,
      `${prefix}유형을 직접 연습해요.`,
      `${prefix}유형을 하나씩 정리해요.`,
    ];
  }

  return forms("확인하기", "확인해 볼까요?", "확인하며", "확인하는 데", "확인부터")
    ?? forms("살펴보기", "살펴볼까요?", "살펴보며", "살펴보는 데", "살펴보기부터")
    ?? forms("비교하기", "비교해 볼까요?", "비교하며", "비교하는 데", "비교부터")
    ?? forms("풀기", "풀어 볼까요?", "풀며", "푸는 데", "풀기부터")
    ?? forms("고르기", "골라 볼까요?", "고르며", "고르는 데", "고르기부터")
    ?? [
      `${activity}부터 시작해요.`,
      `${activity}에 집중해요.`,
      `${activity}에 가볍게 도전해요!`,
    ];
}

function getStableContentOrdinal(contentId: string): number {
  const numericSuffix = contentId.match(/(\d+)$/u)?.[1];
  if (numericSuffix) return Number(numericSuffix);
  return [...contentId].reduce((sum, character) => sum + character.codePointAt(0)!, 0);
}

function getRecentReasonSentences(
  conceptName: string,
): string[] {
  return [
    `최근 ${conceptName}에서 다시 확인할 부분이 있었어요.`,
    `최근 배운 ${conceptName}, 오늘 한 번 더 만나 볼까요?`,
    `${conceptName}에서 잠시 멈췄던 부분부터 천천히 이어가요.`,
  ];
}

function createDeterministicRecommendationCopy(
  input: AiCoachPromptInput,
  candidate: AiCoachPromptInput["candidates"][number],
  goalRelation: GoalRelation,
  usedReasons: Set<CommentReason>,
  usedCommentStarts: Set<string>,
  usedCommentEndings: Set<string>,
): { comment: string; commentReason: CommentReason } {
  const conceptName = candidate.concept_name;
  const { server_fit_scores: fitScores, reason_context: reasonContext } =
    candidate;
  const allowedReasons = new Set(reasonContext.allowed_comment_reasons);
  const options: RecommendationReasonOption[] = [];

  if (
    allowedReasons.has("recent_learning") &&
    reasonContext.recent_learning_strength !== null &&
    reasonContext.recent_learning_summary !== null
  ) {
    options.push({
      type: "recent_learning",
      strength: reasonContext.recent_learning_strength,
      sentences: getRecentReasonSentences(conceptName),
    });
  }

  const goalFit = scoreGoalRelation(goalRelation);
  if (
    allowedReasons.has("goal") &&
    goalFit !== null &&
    goalRelation !== "unrelated"
  ) {
    const goalLabel = getGoalLabel(input, candidate);
    const goalSentences = goalLabel
      ? [
          `${goalLabel} 목표와 이어지는 오늘 활동이에요.`,
          `${goalLabel} 목표를 생각하며 한 걸음 더 가 볼까요?`,
          `오늘은 ${goalLabel} 목표에 가까워지는 활동을 골랐어요.`,
        ]
      : [
          "세운 목표와 이어지는 오늘 활동이에요.",
          "오늘 목표를 생각하며 한 걸음 더 가 볼까요?",
          "이번에는 목표에 가까워지는 활동을 골랐어요.",
        ];
    options.push({
      type: "goal",
      strength: goalFit / 35,
      sentences: goalSentences,
    });
  }

  if (allowedReasons.has("format") && fitScores.format_fit !== null) {
    const typeLabel = STUDENT_TYPE_LABEL[candidate.type];
    const typeWithParticle = withInstrumentalParticle(typeLabel);
    options.push({
      type: "format",
      strength: fitScores.format_fit / 25,
      sentences: fitScores.format_fit >= 22
        ? [
            `자주 선택한 ${typeWithParticle} 만나 볼까요?`,
            `익숙하게 이어 온 ${typeWithParticle} 시작해요.`,
            `이번에도 자주 고른 ${typeWithParticle} 이어가요.`,
          ]
        : fitScores.format_fit >= 20
          ? [
              `끝까지 이어 간 적이 많은 ${typeWithParticle} 시작해요.`,
              `${typeWithParticle} 마친 경험을 이번에도 이어가요.`,
              `이번에는 끝까지 함께한 적이 많은 ${typeWithParticle} 만나봐요!`,
            ]
          : [
              `전에 이용해 본 ${typeWithParticle} 가볍게 시작해요.`,
              `이번에는 경험해 본 ${typeWithParticle} 이어가요.`,
              `한 번 경험해 본 ${typeLabel}, 다시 만나 볼까요?`,
            ],
    });
  }
  if (allowedReasons.has("duration") && fitScores.duration_fit !== null) {
    const minutes = candidate.estimated_minutes;
    options.push({
      type: "duration",
      strength: fitScores.duration_fit / 20,
      sentences: fitScores.duration_fit === 20
        ? [
            `딱 ${minutes}분, 오늘 공부 흐름에 가볍게 더해 볼까요?`,
            `${minutes}분 동안 한 가지에 차분히 집중해요.`,
            `길지 않은 ${minutes}분으로 오늘 흐름을 이어가요.`,
          ]
        : fitScores.duration_fit === 16
          ? [
              `${minutes}분 동안 호흡을 조금 길게 잡아 볼까요?`,
              `${minutes}분으로 한 가지 개념을 차근차근 이어가요.`,
              `오늘은 ${minutes}분 동안 여유 있게 집중해요.`,
            ]
          : [
              `${minutes}분 동안 천천히 한 가지에 집중해 볼까요?`,
              `오늘은 ${minutes}분을 잡고 차근차근 이어가요.`,
              `${minutes}분 동안 서두르지 않고 시작해요.`,
            ],
    });
  }

  if (allowedReasons.has("level") && fitScores.level_fit !== null) {
    const levelSentences = fitScores.level_fit === 20
      ? [
          "지금 배우는 범위와 이어지는 활동이에요.",
          "배운 범위에서 바로 시작해 볼까요?",
          "현재 단계에서 한 걸음 더 이어가요.",
        ]
      : fitScores.level_fit === 14
        ? [
            "배운 범위보다 한 단계 넓혀 볼까요?",
            "이번에는 범위를 한 칸 더 넓혀가요.",
            "아는 내용에서 한 걸음 더 나아갈 차례예요.",
          ]
        : [
            "새로운 단계를 천천히 만나 볼까요?",
            "이번에는 범위를 조금 더 넓혀가요.",
            "다음 단계의 내용을 서두르지 않고 시작해요.",
          ];
    options.push({
      type: "level",
      strength: fitScores.level_fit / 20,
      sentences: levelSentences,
    });
  }

  if (options.length === 0) {
    options.push({
      type: "content_activity",
      strength: 0,
      sentences: [
        `이번에는 ${withObjectParticle(conceptName)} 구체적인 활동으로 만나 볼까요?`,
        `오늘 ${withSubjectParticle(conceptName)} 어떻게 쓰이는지 직접 확인해요.`,
        `${conceptName}의 여러 쓰임을 하나씩 이어가요.`,
      ],
    });
  }

  const strongestValue = Math.max(...options.map((option) => option.strength));
  const strongestOptions = options.filter(
    (option) => Math.abs(option.strength - strongestValue) < Number.EPSILON,
  );
  const priority = REASON_PRIORITY_BY_TYPE[candidate.type];
  const orderOptions = (candidates: RecommendationReasonOption[]) =>
    priority
      .map((reason) => candidates.find((option) => option.type === reason))
      .filter((option): option is RecommendationReasonOption => Boolean(option));
  const orderedStrongest = orderOptions(strongestOptions);
  let selected = orderedStrongest[
    getStableContentOrdinal(candidate.content_id) % orderedStrongest.length
  ] ?? strongestOptions[0];

  if (usedReasons.has(selected.type)) {
    const unusedAlternatives = options.filter(
      (option) =>
        !usedReasons.has(option.type) &&
        strongestValue - option.strength <= 0.15,
    );
    const bestUnusedStrength = Math.max(
      ...unusedAlternatives.map((option) => option.strength),
    );
    const bestUnused = unusedAlternatives.filter(
      (option) => Math.abs(option.strength - bestUnusedStrength) < Number.EPSILON,
    );
    selected = orderOptions(bestUnused)[0] ?? selected;
  }
  usedReasons.add(selected.type);

  const ordinal = getStableContentOrdinal(candidate.content_id);
  const activitySentences = rotateBySeed(
    getGroundedActivitySentences(candidate),
    ordinal,
  );
  const reasonSentences = rotateBySeed(selected.sentences, ordinal);
  const firstFive = (value: string) => [...value].slice(0, 5).join("");
  const lastFive = (value: string) => [...value].slice(-5).join("");
  const hasRepeatedEnding = (value: string) =>
    ["볼까요?", "이어가요.", "집중해요.", "시작해요."].some(
      (ending) => value.split(ending).length - 1 > 1,
    );
  const hasTooManyQuestions = (value: string) =>
    value.split("?").length - 1 > 1;
  const isNaturalCombination = (value: string) =>
    !hasRepeatedEnding(value) && !hasTooManyQuestions(value);
  const commentCandidates = reasonSentences.flatMap((reasonSentence) =>
    activitySentences.flatMap((activitySentence) => [
      `${reasonSentence} ${activitySentence}`,
      `${activitySentence} ${reasonSentence}`,
    ]),
  );
  let comment = commentCandidates.find(
    (value) =>
      [...value].length <= 80 &&
      isNaturalCombination(value) &&
      !usedCommentStarts.has(firstFive(value)) &&
      !usedCommentEndings.has(lastFive(value)),
  ) ?? commentCandidates.find(
    (value) =>
      [...value].length <= 80 &&
      isNaturalCombination(value) &&
      !usedCommentEndings.has(lastFive(value)),
  ) ?? commentCandidates.find(
    (value) =>
      [...value].length <= 80 &&
      isNaturalCombination(value) &&
      !usedCommentStarts.has(firstFive(value)),
  ) ?? commentCandidates.find(
    (value) => [...value].length <= 80 && isNaturalCombination(value),
  ) ?? commentCandidates.find((value) => [...value].length <= 80)
    ?? `${conceptName} 활동을 차근차근 시작해요.`;

  if (usedCommentStarts.has(firstFive(comment))) {
    const prefixes = [
      "이번에는 ",
      "오늘은 ",
      "이어서 ",
      "먼저 ",
      "새롭게 ",
      "가볍게 ",
      "한 걸음씩 ",
      "천천히 ",
    ];
    comment = prefixes
      .map((prefix) => `${prefix}${comment}`)
      .find(
        (value) =>
          [...value].length <= 80 &&
          !usedCommentStarts.has(firstFive(value)),
      ) ?? comment;
  }
  usedCommentStarts.add(firstFive(comment));
  usedCommentEndings.add(lastFive(comment));

  return {
    comment,
    commentReason: selected.type,
  };
}

export function createDeterministicAiResponse(
  input: AiCoachPromptInput,
): AiEvaluationResponse {
  const seeds = input.candidates.map((candidate) => ({
    candidate,
    goalRelation: inferDeterministicGoalRelation(input, candidate),
  }));
  const usedReasons = new Set<CommentReason>();
  const usedCommentStarts = new Set<string>();
  const usedCommentEndings = new Set<string>();
  const copyByContentId = new Map(
    [...seeds]
      .sort((a, b) => a.candidate.content_id.localeCompare(b.candidate.content_id))
      .map(({ candidate, goalRelation }) => [
        candidate.content_id,
        createDeterministicRecommendationCopy(
          input,
          candidate,
          goalRelation,
          usedReasons,
          usedCommentStarts,
          usedCommentEndings,
        ),
      ]),
  );

  return {
    request_id: input.request_id,
    items: seeds.map(({ candidate, goalRelation }) => {
      const copy = copyByContentId.get(candidate.content_id)!;
      return {
        content_id: candidate.content_id,
        goal_relation: goalRelation,
        comment_reason: copy.commentReason,
        comment: copy.comment,
      };
    }),
  };
}

export const createDeterministicFitResponse = createDeterministicAiResponse;

export function prepareAiCoachRun(fixtureId: UserId): PreparedAiCoachRun {
  const user = getUserFixture(fixtureId);
  const userAttempts = aiCoachFixtures.problemAttempts.filter((attempt) => attempt.userId === fixtureId);
  const { valid, audit } = selectValidProblemAttempts(userAttempts);
  const allValid = selectValidProblemAttempts(aiCoachFixtures.problemAttempts).valid;
  const behaviorProfile = deriveBehaviorProfile(user);
  const conceptWeaknesses = computeConceptWeaknesses(user, valid);
  const unitWeaknesses = computeUnitWeaknesses(conceptWeaknesses);
  const candidateSelection = selectRecommendationCandidates(user, conceptWeaknesses);
  const evidenceCatalog = buildEvidenceCatalog(
    user,
    behaviorProfile,
    conceptWeaknesses,
    candidateSelection,
  );
  const requestId = `ai-coach-${fixtureId}-${AI_COACH_AS_OF.slice(0, 10)}`;
  const promptInput = buildAiCoachPromptInput(
    requestId,
    user,
    behaviorProfile,
    conceptWeaknesses,
    candidateSelection,
  );
  return {
    requestId,
    fixtureId,
    asOf: AI_COACH_AS_OF,
    versions: AI_COACH_VERSIONS,
    user,
    datasetSummary: {
      units: AI_COACH_DATA_SUMMARY.units,
      concepts: AI_COACH_DATA_SUMMARY.concepts,
      questionMappings: AI_COACH_DATA_SUMMARY.questionMappings,
      contents: AI_COACH_DATA_SUMMARY.contents,
      users: AI_COACH_DATA_SUMMARY.users,
      problemAttempts: AI_COACH_DATA_SUMMARY.problemAttempts,
      validProblemAttempts: allValid.length,
      contentHistoryEvents: AI_COACH_DATA_SUMMARY.contentHistoryEvents,
      evaluationLabels: AI_COACH_DATA_SUMMARY.evaluationLabels,
    },
    behaviorProfile,
    eventAudit: audit,
    conceptWeaknesses,
    unitWeaknesses,
    candidateSelection,
    evidenceCatalog,
    promptInput,
  };
}

export function mapSystemEvidenceIds(
  prepared: PreparedAiCoachRun,
  contentId: string,
  reason: CommentReason,
): string[] {
  const candidate = prepared.candidateSelection.candidates.find(
    (item) => item.content.id === contentId,
  );
  if (!candidate) return [];

  const metadataEvidenceId = `content:${candidate.content.id}:metadata`;
  const goalEvidenceId = `content:${candidate.content.id}:goal`;
  const activityEvidenceId = `content:${candidate.content.id}:activity`;
  const reasonEvidenceIds: string[] = [];
  switch (reason) {
    case "goal":
      reasonEvidenceIds.push(
        `user:${prepared.user.id}:goal`,
        goalEvidenceId,
        activityEvidenceId,
      );
      break;
    case "format":
      reasonEvidenceIds.push(
        `behavior:${prepared.user.id}:format`,
        metadataEvidenceId,
        activityEvidenceId,
      );
      break;
    case "duration":
      reasonEvidenceIds.push(
        `behavior:${prepared.user.id}:duration`,
        metadataEvidenceId,
        activityEvidenceId,
      );
      break;
    case "level":
      reasonEvidenceIds.push(
        `user:${prepared.user.id}:level`,
        metadataEvidenceId,
        activityEvidenceId,
      );
      break;
    case "recent_learning":
      reasonEvidenceIds.push(
        `weakness:${prepared.user.id}:${candidate.conceptId}:recent`,
        activityEvidenceId,
      );
      break;
    case "content_activity":
      reasonEvidenceIds.push(activityEvidenceId);
      break;
  }

  const allowedIds = new Set(prepared.evidenceCatalog.map((item) => item.id));
  return uniqueEvidenceIds(reasonEvidenceIds).filter((id) => allowedIds.has(id));
}

function validateSystemEvidenceMapping(
  prepared: PreparedAiCoachRun,
  evaluations: readonly NormalizedAiEvaluation[],
): AiCoachRunResult["aiEvaluation"]["evidenceValidation"] {
  const knownIds = new Set(prepared.evidenceCatalog.map((item) => item.id));
  const valid = evaluations.every((evaluation) => {
    const uniqueIds = new Set(evaluation.evidenceIds);
    return (
      evaluation.evidenceIds.length > 0 &&
      uniqueIds.size === evaluation.evidenceIds.length &&
      evaluation.evidenceIds.every((id) => knownIds.has(id))
    );
  });
  return { valid, checkedItemCount: evaluations.length };
}

export function normalizeAiEvaluation(
  prepared: PreparedAiCoachRun,
  response: AiEvaluationResponse,
): NormalizedAiEvaluation[] {
  const promptCandidateById = new Map(
    prepared.promptInput.candidates.map((candidate) => [
      candidate.content_id,
      candidate,
    ]),
  );
  return response.items.map((item) => {
    const candidate = promptCandidateById.get(item.content_id);
    if (!candidate) {
      throw new Error(`Unknown AI evaluation content: ${item.content_id}`);
    }
    const fitScores: FitScores = {
      goal_fit: scoreGoalRelation(item.goal_relation),
      ...candidate.server_fit_scores,
    };
    const personalFit = normalizePersonalFit(fitScores);
    if (personalFit === null) throw new Error(`No valid fit scores for ${item.content_id}`);
    return {
      contentId: item.content_id,
      goalRelation: item.goal_relation,
      fitScores,
      personalFit: round(personalFit),
      fitGrade: getFitGrade(personalFit),
      commentReason: item.comment_reason,
      evidenceIds: mapSystemEvidenceIds(
        prepared,
        item.content_id,
        item.comment_reason,
      ),
      comment: item.comment,
    };
  });
}

function rankCandidates(
  prepared: PreparedAiCoachRun,
  evaluations: readonly NormalizedAiEvaluation[],
): { rule: RankedRecommendation[]; mixed: RankedRecommendation[] } {
  const evaluationById = new Map(evaluations.map((evaluation) => [evaluation.contentId, evaluation]));
  const popularityById = new Map(
    prepared.candidateSelection.candidates.map((candidate) => [candidate.content.id, candidate.content.popularity]),
  );
  const base = prepared.candidateSelection.candidates.map((candidate) => {
    const evaluation = evaluationById.get(candidate.content.id)!;
    return {
      rank: 0,
      contentId: candidate.content.id,
      title: candidate.content.title,
      type: candidate.content.type,
      difficulty: candidate.content.difficulty,
      estimatedMinutes: candidate.content.estimatedMinutes,
      conceptId: candidate.conceptId,
      conceptName: candidate.conceptName,
      weaknessScore: candidate.weaknessScore,
      personalFit: evaluation.personalFit,
      fitGrade: evaluation.fitGrade,
      finalScore: round(combineRecommendationScore(evaluation.personalFit, candidate.weaknessScore)),
      goalRelation: evaluation.goalRelation,
      fitScores: evaluation.fitScores,
      commentReason: evaluation.commentReason,
      evidenceIds: evaluation.evidenceIds,
      comment: evaluation.comment,
      source: "ai_mixed" as const,
    };
  });
  const mixed = [...base]
    .sort((a, b) => b.finalScore - a.finalScore || b.personalFit - a.personalFit || b.weaknessScore - a.weaknessScore || (popularityById.get(b.contentId) ?? 0) - (popularityById.get(a.contentId) ?? 0) || a.contentId.localeCompare(b.contentId))
    .map((item, index) => ({ ...item, rank: index + 1 }));
  const rule = [...base]
    .sort((a, b) => b.weaknessScore - a.weaknessScore || (popularityById.get(b.contentId) ?? 0) - (popularityById.get(a.contentId) ?? 0) || a.contentId.localeCompare(b.contentId))
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      finalScore: item.weaknessScore,
      source: "rule_baseline" as const,
    }));
  return { rule, mixed };
}

function selectDiverseTop3(
  ranking: readonly RankedRecommendation[],
): { items: RankedRecommendation[]; trace: DiversityResult } {
  const initial = ranking.slice(0, 3);
  let best: RankedRecommendation[] | null = null;
  let bestScore = -Infinity;
  for (let i = 0; i < ranking.length; i += 1) {
    for (let j = i + 1; j < ranking.length; j += 1) {
      for (let k = j + 1; k < ranking.length; k += 1) {
        const combo = [ranking[i], ranking[j], ranking[k]];
        if (new Set(combo.map((item) => item.conceptId)).size < 2) continue;
        if (new Set(combo.map((item) => item.type)).size < 2) continue;
        const score = combo.reduce((sum, item) => sum + item.finalScore, 0);
        if (score > bestScore) {
          best = combo;
          bestScore = score;
        }
      }
    }
  }
  const relaxed = best === null;
  const selected = (best ?? initial)
    .sort((a, b) => a.rank - b.rank)
    .map((item, index) => ({ ...item, rank: index + 1 }));
  const selectedIds = new Set(selected.map((item) => item.contentId));
  const applied = selected.some((item, index) => initial[index]?.contentId !== item.contentId);
  return {
    items: selected,
    trace: {
      applied,
      relaxed,
      reason: relaxed && selected.length >= 3
        ? "후보군에서 2개 개념과 2개 유형을 동시에 만족할 조합이 없습니다."
        : selected.length < 3 ? "유효 후보가 3개 미만입니다." : null,
      selectedConceptIds: [...new Set(selected.map((item) => item.conceptId))],
      selectedTypes: [...new Set(selected.map((item) => item.type))],
      skippedContentIds: initial.filter((item) => !selectedIds.has(item.contentId)).map((item) => item.contentId),
    },
  };
}

function pipelineSteps(prepared: PreparedAiCoachRun): PipelineStep[] {
  const selection = prepared.candidateSelection;
  return [
    { id: "source", label: "원천 풀이 검증", inputCount: prepared.eventAudit.rawCount, outputCount: prepared.eventAudit.validCount, detail: "중복·미채점·무효·미매핑 이벤트 제외" },
    { id: "weakness", label: "취약도 계산", inputCount: prepared.eventAudit.validCount, outputCount: prepared.conceptWeaknesses.length, detail: "최근 5회 70%·누적 30% 가중 및 진단 전환 규칙 적용" },
    { id: "candidate_query", label: "후보 조회", inputCount: selection.topConceptIds.length, outputCount: selection.queriedCount, detail: "상위 취약 개념 3개에서 개념별 최대 5개 조회" },
    { id: "policy_filter", label: "정책 필터", inputCount: selection.queriedCount, outputCount: selection.deliveredCount, detail: "활성 상태·난이도 차이 1 이하·최근 7일 미완료 조건 적용, 최대 10개 선별" },
    { id: "personal_fit", label: "개인 적합도", inputCount: selection.deliveredCount, outputCount: selection.deliveredCount, detail: "null 항목 분모 제외 후 100점 환산" },
    { id: "score_mix", label: "50:50 결합", inputCount: selection.deliveredCount, outputCount: selection.deliveredCount, detail: "개인 적합도 50%·대표 개념 취약도 50% 결합" },
    { id: "diversity", label: "다양성 적용", inputCount: selection.deliveredCount, outputCount: Math.min(3, selection.deliveredCount), detail: "가능한 경우 개념 2개 이상·콘텐츠 유형 2개 이상 보장" },
    { id: "top3", label: "Top 3 확정", inputCount: selection.deliveredCount, outputCount: Math.min(3, selection.deliveredCount), detail: "동점 시 점수·인기도·콘텐츠 ID 기준 재현 가능한 정렬" },
  ];
}

export function completeAiCoachRun(
  prepared: PreparedAiCoachRun,
  options: CompleteAiCoachRunOptions = {},
): AiCoachRunResult {
  const suppliedResponses = [...(options.aiResponses ?? [])].slice(0, 2);
  const validationErrors: string[] = [];
  let validResponse: AiEvaluationResponse | null = null;
  for (let index = 0; index < suppliedResponses.length; index += 1) {
    const validation = validateAiEvaluationResponse(suppliedResponses[index], prepared.promptInput);
    if (validation.success) {
      validResponse = validation.data;
      break;
    }
    validationErrors.push(...validation.errors.map((error) => `attempt ${index + 1}: ${error}`));
  }
  const usedFallback = validResponse === null;
  const response = validResponse ?? createDeterministicAiResponse(prepared.promptInput);
  const normalized = normalizeAiEvaluation(prepared, response);
  const evidenceValidation = validateSystemEvidenceMapping(prepared, normalized);
  const rankings = rankCandidates(prepared, normalized);
  const rule = selectDiverseTop3(rankings.rule);
  const mixed = selectDiverseTop3(rankings.mixed);

  return {
    ...prepared,
    aiEvaluation: {
      source:
        !usedFallback && options.aiSource === "openai"
          ? "live_ai"
          : "simulated_ai_scenario",
      aiSource: options.aiSource ?? (usedFallback ? "fallback" : "server_mock"),
      usedFallback,
      attemptsReceived: suppliedResponses.length,
      validationErrors,
      evidenceValidation,
      items: normalized,
    },
    scoredCandidates: rankings.mixed,
    ruleRanking: rankings.rule,
    mixedRanking: rankings.mixed,
    ruleTop3: rule.items,
    mixedTop3: mixed.items,
    finalRecommendations: mixed.items,
    diversity: { rule: rule.trace, mixed: mixed.trace },
    pipelineSteps: pipelineSteps(prepared),
  };
}

export function runAiCoachDemo(
  fixtureId: UserId,
  options?: CompleteAiCoachRunOptions,
): AiCoachRunResult {
  const prepared = prepareAiCoachRun(fixtureId);
  if (options) return completeAiCoachRun(prepared, options);
  return completeAiCoachRun(prepared);
}
