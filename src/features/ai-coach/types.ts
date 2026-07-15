export type UnitId = string;
export type ConceptId = string;
export type QuestionId = string;
export type ContentId = string;
export type UserId = string;
export type EvidenceId = string;

export type UserStatus = "new" | "existing";
export type LearningLevel = 1 | 2 | 3;
export type ContentType = "quiz" | "video" | "reading" | "practice";
export const AI_COACH_COMMENT_REASONS = [
  "recent_learning",
  "goal",
  "format",
  "duration",
  "level",
  "content_activity",
] as const;
export type CommentReason = (typeof AI_COACH_COMMENT_REASONS)[number];
export const AI_COACH_GOAL_RELATIONS = [
  "direct",
  "strong",
  "indirect",
  "unrelated",
  "unknown",
] as const;
export type GoalRelation = (typeof AI_COACH_GOAL_RELATIONS)[number];
export type ConfidenceLevel = "low" | "medium" | "high";
export type FitGrade = "low" | "medium" | "high";
export type WeaknessDataStage =
  | "diagnostic"
  | "diagnostic_behavior_mix"
  | "behavior"
  | "insufficient";

export type AiCoachVersions = {
  dataset: string;
  labels: string;
  logic: string;
  prompt: string;
  model: string;
};

export type Evidence = {
  id: EvidenceId;
  kind: "user" | "behavior" | "weakness" | "content";
  label: string;
  value: string | number;
};

export type Unit = {
  id: UnitId;
  name: string;
};

export type Concept = {
  id: ConceptId;
  unitId: UnitId;
  name: string;
  isActive: boolean;
};

export type QuestionConceptMapping = {
  questionId: QuestionId;
  conceptId: ConceptId;
  isDiagnostic: boolean;
  isActive: boolean;
};

export type LearningContent = {
  id: ContentId;
  title: string;
  type: ContentType;
  difficulty: LearningLevel;
  estimatedMinutes: number;
  primaryConceptId: ConceptId;
  learningGoal: string;
  activity: string;
  goalTags: string[];
  isActive: boolean;
  popularity: number;
};

export type UserFixture = {
  id: UserId;
  displayName: string;
  scenario: string;
  status: UserStatus;
  level: LearningLevel;
  learningGoal: string;
  goalTags: string[];
  behaviorProfileEnabled: boolean;
};

export type ProblemAttempt = {
  id: string;
  idempotencyKey: string;
  userId: UserId;
  questionId: QuestionId;
  isCorrect: boolean | null;
  isGraded: boolean;
  isValid: boolean;
  occurredAt: string;
};

export type DiagnosticResult = {
  id: string;
  userId: UserId;
  conceptId: ConceptId;
  questionCount: number;
  incorrectCount: number;
  completedAt: string;
};

export type ContentHistoryEvent = {
  id: string;
  userId: UserId;
  contentId: ContentId;
  status: "started" | "completed";
  actualMinutes: number;
  occurredAt: string;
};

export type BehaviorProfile = {
  preferredTypes: ContentType[];
  completionRateByType: Partial<Record<ContentType, number>>;
  averageStudyMinutes: number;
  sourceEventCount: number;
  evidence: Evidence[];
};

export type AiCoachFixtures = {
  units: Unit[];
  concepts: Concept[];
  questionMappings: QuestionConceptMapping[];
  contents: LearningContent[];
  users: UserFixture[];
  problemAttempts: ProblemAttempt[];
  diagnosticResults: DiagnosticResult[];
  contentHistoryEvents: ContentHistoryEvent[];
};

export type AttemptExclusionReason =
  | "duplicate"
  | "ungraded"
  | "invalid"
  | "unmapped"
  | "future";

export type EventAudit = {
  rawCount: number;
  validCount: number;
  excludedCount: number;
  excludedByReason: Record<AttemptExclusionReason, number>;
  excluded: Array<{ eventId: string; reason: AttemptExclusionReason }>;
};

export type ConceptWeakness = {
  conceptId: ConceptId;
  conceptName: string;
  unitId: UnitId;
  recentIncorrectRate: number | null;
  cumulativeIncorrectRate: number | null;
  recentWindowCount: number;
  validAttemptCount: number;
  diagnosticScore: number | null;
  behaviorScore: number | null;
  finalScore: number;
  confidence: ConfidenceLevel;
  dataStage: WeaknessDataStage;
  evidence: Evidence[];
};

export type UnitWeakness = {
  unitId: UnitId;
  unitName: string;
  score: number | null;
  includedConceptCount: number;
  topConceptId: ConceptId | null;
};

export type CandidateExclusionReason =
  | "inactive"
  | "difficulty_gap"
  | "recently_completed"
  | "over_candidate_limit";

export type RecommendationCandidate = {
  content: LearningContent;
  conceptId: ConceptId;
  conceptName: string;
  weaknessScore: number;
  evidence: Evidence[];
};

export type CandidateSelection = {
  topConceptIds: ConceptId[];
  queriedCount: number;
  eligibleCount: number;
  deliveredCount: number;
  excludedByReason: Record<CandidateExclusionReason, number>;
  excluded: Array<{ contentId: ContentId; reason: CandidateExclusionReason }>;
  candidates: RecommendationCandidate[];
  fallbackCandidatesAdded: number;
};

export type FitScores = {
  goal_fit: number | null;
  format_fit: number | null;
  duration_fit: number | null;
  level_fit: number | null;
};

export type AiEvaluationItem = {
  content_id: ContentId;
  goal_relation: GoalRelation;
  comment_reason: CommentReason;
  comment: string;
};

export type AiEvaluationResponse = {
  request_id: string;
  items: AiEvaluationItem[];
};

export type AiCoachPromptInput = {
  request_id: string;
  as_of: string;
  user: {
    learning_goal: string;
    goal_tags: string[];
  };
  candidates: Array<{
    content_id: ContentId;
    title: string;
    type: ContentType;
    estimated_minutes: number;
    primary_concept_id: ConceptId;
    concept_name: string;
    learning_goal: string;
    goal_tags: string[];
    activity: string;
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
  }>;
};

export type ValidationResult<T> =
  | { success: true; data: T; errors: [] }
  | { success: false; data: null; errors: string[] };

export type NormalizedAiEvaluation = {
  contentId: ContentId;
  goalRelation: GoalRelation;
  fitScores: FitScores;
  personalFit: number;
  fitGrade: FitGrade;
  commentReason: CommentReason;
  evidenceIds: EvidenceId[];
  comment: string;
};

export type RankedRecommendationSource =
  | "rule_baseline"
  | "ai_mixed";

export type RankedRecommendation = {
  rank: number;
  contentId: ContentId;
  title: string;
  type: ContentType;
  difficulty: LearningLevel;
  estimatedMinutes: number;
  conceptId: ConceptId;
  conceptName: string;
  weaknessScore: number;
  personalFit: number;
  fitGrade: FitGrade;
  finalScore: number;
  goalRelation: GoalRelation;
  fitScores: FitScores;
  commentReason: CommentReason;
  evidenceIds: EvidenceId[];
  comment: string;
  source: RankedRecommendationSource;
};

export type DiversityResult = {
  applied: boolean;
  relaxed: boolean;
  reason: string | null;
  selectedConceptIds: ConceptId[];
  selectedTypes: ContentType[];
  skippedContentIds: ContentId[];
};

export type DatasetSummary = {
  units: number;
  concepts: number;
  questionMappings: number;
  contents: number;
  users: number;
  problemAttempts: number;
  validProblemAttempts: number;
  contentHistoryEvents: number;
  evaluationLabels: number;
};

export type PipelineStep = {
  id:
    | "source"
    | "weakness"
    | "candidate_query"
    | "policy_filter"
    | "personal_fit"
    | "score_mix"
    | "diversity"
    | "top3";
  label: string;
  inputCount: number;
  outputCount: number;
  detail: string;
};

export type PreparedAiCoachRun = {
  requestId: string;
  fixtureId: UserId;
  asOf: string;
  versions: AiCoachVersions;
  user: UserFixture;
  datasetSummary: DatasetSummary;
  behaviorProfile: BehaviorProfile | null;
  eventAudit: EventAudit;
  conceptWeaknesses: ConceptWeakness[];
  unitWeaknesses: UnitWeakness[];
  candidateSelection: CandidateSelection;
  evidenceCatalog: Evidence[];
  promptInput: AiCoachPromptInput;
};

export type CompleteAiCoachRunOptions = {
  aiResponses?: readonly unknown[];
  aiSource?: "openai" | "server_mock" | "fallback" | string;
};

export type AiCoachRunResult = PreparedAiCoachRun & {
  aiEvaluation: {
    source: "live_ai" | "simulated_ai_scenario";
    aiSource: string;
    usedFallback: boolean;
    attemptsReceived: number;
    validationErrors: string[];
    evidenceValidation: {
      valid: boolean;
      checkedItemCount: number;
    };
    items: NormalizedAiEvaluation[];
  };
  scoredCandidates: RankedRecommendation[];
  ruleRanking: RankedRecommendation[];
  mixedRanking: RankedRecommendation[];
  ruleTop3: RankedRecommendation[];
  mixedTop3: RankedRecommendation[];
  finalRecommendations: RankedRecommendation[];
  diversity: {
    rule: DiversityResult;
    mixed: DiversityResult;
  };
  pipelineSteps: PipelineStep[];
};

export type EvaluationLabel = {
  userId: UserId;
  contentId: ContentId;
  personalFitGold: FitGrade;
  ndcgRelevance: 0 | 1 | 2 | 3;
  source: "rubric_judged_synthetic";
};

export type LiveEvaluation = {
  ruleNdcgAt3: number | null;
  mixedNdcgAt3: number | null;
  delta: number | null;
  labelCoverage: {
    rule: number;
    mixed: number;
  };
};

export type MacroF1Result = {
  score: number;
  byGrade: Record<FitGrade, { precision: number; recall: number; f1: number; support: number }>;
};

export type BenchmarkResult = {
  generatedAt: string;
  versions: AiCoachVersions;
  labelCount: number;
  macroF1: MacroF1Result;
  averageRuleNdcgAt3: number;
  averageMixedNdcgAt3: number;
  averageDelta: number;
  users: Array<
    LiveEvaluation & {
      userId: UserId;
    }
  >;
};
