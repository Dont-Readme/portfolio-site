import type {
  AiCoachFixtures,
  AiCoachVersions,
  Concept,
  ContentHistoryEvent,
  ContentType,
  DiagnosticResult,
  LearningContent,
  LearningLevel,
  ProblemAttempt,
  QuestionConceptMapping,
  Unit,
  UserFixture,
  UserId,
} from "./types";

export const AI_COACH_AS_OF = "2026-07-14T03:00:00.000Z";

export const AI_COACH_VERSIONS: AiCoachVersions = {
  dataset: "synthetic-2026-07-14.v1",
  labels: "codex-rubric-judged.v2",
  logic: "initial-recommendation.v2",
  prompt: "candidate-fit-ko.v6",
  model: "deterministic-ai-scenario.v3",
};

export const units: Unit[] = [
  { id: "unit-tense", name: "시제" },
  { id: "unit-voice", name: "조동사와 태" },
  { id: "unit-clause", name: "문장 연결" },
  { id: "unit-reading", name: "어휘와 독해" },
];

const conceptSeeds = [
  ["concept-present-perfect", "현재완료", "unit-tense", ["tense", "grammar"]],
  ["concept-past-perfect", "과거완료", "unit-tense", ["tense", "grammar"]],
  ["concept-modals", "조동사", "unit-voice", ["modals", "grammar"]],
  ["concept-passive", "수동태", "unit-voice", ["passive", "grammar"]],
  ["concept-relative", "관계대명사", "unit-clause", ["clause", "grammar"]],
  ["concept-conditionals", "가정법", "unit-clause", ["conditionals", "grammar"]],
  ["concept-vocabulary", "문맥 어휘", "unit-reading", ["vocabulary", "reading"]],
  ["concept-inference", "독해 추론", "unit-reading", ["inference", "reading"]],
] as const;

export const concepts: Concept[] = conceptSeeds.map(([id, name, unitId]) => ({
  id,
  name,
  unitId,
  isActive: true,
}));

export const questionMappings: QuestionConceptMapping[] = concepts.flatMap(
  (concept, conceptIndex) =>
    Array.from({ length: 3 }, (_, localIndex) => ({
      questionId: `question-${String(conceptIndex * 3 + localIndex + 1).padStart(2, "0")}`,
      conceptId: concept.id,
      isDiagnostic: localIndex === 0,
      isActive: true,
    })),
);

const contentVariants: Array<{
  type: ContentType;
  difficulty: LearningLevel;
  minutes: number;
  title: string;
  goal: string;
  activity: string;
}> = [
  { type: "quiz", difficulty: 1, minutes: 6, title: "핵심 퀴즈", goal: "핵심 규칙을 빠르게 확인", activity: "핵심 규칙을 골라 확인하기" },
  { type: "video", difficulty: 2, minutes: 18, title: "개념 강의", goal: "대표 쓰임과 오류를 이해", activity: "대표 쓰임과 예시 흐름 살펴보기" },
  { type: "reading", difficulty: 2, minutes: 12, title: "예문 읽기", goal: "문맥 속 쓰임을 구별", activity: "문맥 속 쓰임을 찾아 비교하기" },
  { type: "practice", difficulty: 3, minutes: 22, title: "심화 문제", goal: "복합 문장에서 정확히 적용", activity: "복합 문장에 규칙을 적용해 문제 풀기" },
  { type: "quiz", difficulty: 2, minutes: 9, title: "오답 교정", goal: "자주 틀리는 유형을 교정", activity: "헷갈린 유형을 구별하며 고르기" },
];

const inactiveContentIds = new Set(["content-08", "content-19", "content-34"]);

export const contents: LearningContent[] = conceptSeeds.flatMap(
  ([conceptId, conceptName, , tags], conceptIndex) =>
    contentVariants.map((variant, variantIndex) => {
      const ordinal = conceptIndex * contentVariants.length + variantIndex + 1;
      const id = `content-${String(ordinal).padStart(2, "0")}`;
      return {
        id,
        title: `${conceptName} ${variant.title}`,
        type: variant.type,
        difficulty: variant.difficulty,
        estimatedMinutes: variant.minutes,
        primaryConceptId: conceptId,
        learningGoal: `${conceptName} ${variant.goal}`,
        activity: `${conceptName} ${variant.activity}`,
        goalTags: [...tags, conceptId],
        isActive: !inactiveContentIds.has(id),
        popularity: 100 - ordinal + (variantIndex === 0 ? 8 : 0),
      };
    }),
);

export const userFixtures: UserFixture[] = [
  { id: "user-01", displayName: "진단 시작형", scenario: "신규 · 진단 데이터만 존재", status: "new", level: 1, learningGoal: "기초 시제와 조동사 정확도 향상", goalTags: ["tense", "modals", "grammar"], behaviorProfileEnabled: false },
  { id: "user-02", displayName: "혼합 전환형", scenario: "신규 · 행동 5~9회 혼합 구간", status: "new", level: 2, learningGoal: "완료 시제와 수동태 오류 줄이기", goalTags: ["tense", "passive", "grammar"], behaviorProfileEnabled: true },
  { id: "user-03", displayName: "행동 중심형", scenario: "신규 · 10회 이상 행동 중심", status: "new", level: 2, learningGoal: "문맥 어휘와 독해 추론 강화", goalTags: ["vocabulary", "inference", "reading"], behaviorProfileEnabled: true },
  { id: "user-04", displayName: "짧은 퀴즈형", scenario: "기존 · 짧은 퀴즈 선호", status: "existing", level: 2, learningGoal: "시험 문법 오답을 짧게 교정", goalTags: ["grammar", "tense", "clause"], behaviorProfileEnabled: true },
  { id: "user-05", displayName: "긴 강의형", scenario: "기존 · 긴 개념 강의 선호", status: "existing", level: 3, learningGoal: "고급 문법 구조를 깊이 이해", goalTags: ["grammar", "passive", "conditionals"], behaviorProfileEnabled: true },
  { id: "user-06", displayName: "프로필 없음형", scenario: "기존 · 행동 프로필 없음", status: "existing", level: 2, learningGoal: "업무 독해의 정확도 향상", goalTags: ["reading", "vocabulary", "inference"], behaviorProfileEnabled: false },
  { id: "user-07", displayName: "최근 하락형", scenario: "기존 · 최근 5회 성적 급락", status: "existing", level: 2, learningGoal: "가정법과 시제 실수 회복", goalTags: ["conditionals", "tense", "grammar"], behaviorProfileEnabled: true },
  { id: "user-08", displayName: "희소 이력형", scenario: "기존 · 낮은 신뢰도의 희소 이력", status: "existing", level: 1, learningGoal: "기초 문법 학습 습관 만들기", goalTags: ["grammar", "tense", "modals"], behaviorProfileEnabled: true },
  { id: "user-09", displayName: "후보 부족형", scenario: "기존 · 최근 완료로 후보 다수 제외", status: "existing", level: 2, learningGoal: "수동태와 관계절 오답 교정", goalTags: ["passive", "clause", "grammar"], behaviorProfileEnabled: true },
  { id: "user-10", displayName: "다양성 검증형", scenario: "기존 · 동점과 동일 유형 집중", status: "existing", level: 2, learningGoal: "문법과 독해를 균형 있게 보완", goalTags: ["grammar", "reading", "clause"], behaviorProfileEnabled: true },
];

export const fixtureIds = userFixtures.map((user) => user.id);

export const aiCoachFixtureSummaries = userFixtures.map(
  ({ id, displayName, scenario, status, level, learningGoal, behaviorProfileEnabled }) => ({
    id,
    displayName,
    scenario,
    status,
    level,
    learningGoal,
    behaviorProfileEnabled,
  }),
);

type ConceptAttemptPlan = {
  conceptIndex: number;
  count: number;
  incorrect: number;
  recentIncorrect: number;
};

const attemptPlans: Record<UserId, ConceptAttemptPlan[]> = {
  "user-01": [],
  "user-02": [
    { conceptIndex: 1, count: 5, incorrect: 4, recentIncorrect: 4 },
    { conceptIndex: 3, count: 3, incorrect: 2, recentIncorrect: 2 },
  ],
  "user-03": [
    { conceptIndex: 6, count: 10, incorrect: 7, recentIncorrect: 4 },
    { conceptIndex: 7, count: 10, incorrect: 5, recentIncorrect: 3 },
  ],
  "user-04": [
    { conceptIndex: 0, count: 8, incorrect: 6, recentIncorrect: 4 },
    { conceptIndex: 4, count: 7, incorrect: 5, recentIncorrect: 4 },
    { conceptIndex: 2, count: 7, incorrect: 4, recentIncorrect: 3 },
  ],
  "user-05": [
    { conceptIndex: 1, count: 8, incorrect: 5, recentIncorrect: 3 },
    { conceptIndex: 3, count: 7, incorrect: 5, recentIncorrect: 4 },
    { conceptIndex: 5, count: 7, incorrect: 4, recentIncorrect: 3 },
  ],
  "user-06": [
    { conceptIndex: 6, count: 7, incorrect: 5, recentIncorrect: 4 },
    { conceptIndex: 7, count: 7, incorrect: 4, recentIncorrect: 3 },
    { conceptIndex: 4, count: 7, incorrect: 3, recentIncorrect: 2 },
  ],
  "user-07": [
    { conceptIndex: 5, count: 8, incorrect: 6, recentIncorrect: 5 },
    { conceptIndex: 0, count: 7, incorrect: 5, recentIncorrect: 5 },
    { conceptIndex: 2, count: 7, incorrect: 4, recentIncorrect: 4 },
  ],
  "user-08": [
    { conceptIndex: 0, count: 2, incorrect: 1, recentIncorrect: 1 },
    { conceptIndex: 2, count: 2, incorrect: 2, recentIncorrect: 2 },
  ],
  "user-09": [
    { conceptIndex: 3, count: 8, incorrect: 6, recentIncorrect: 4 },
    { conceptIndex: 4, count: 7, incorrect: 5, recentIncorrect: 4 },
    { conceptIndex: 6, count: 7, incorrect: 4, recentIncorrect: 3 },
  ],
  "user-10": [
    { conceptIndex: 4, count: 8, incorrect: 5, recentIncorrect: 3 },
    { conceptIndex: 6, count: 7, incorrect: 4, recentIncorrect: 3 },
    { conceptIndex: 2, count: 7, incorrect: 4, recentIncorrect: 3 },
  ],
};

function outcomes(plan: ConceptAttemptPlan): boolean[] {
  const recentCount = Math.min(5, plan.count);
  const earlyCount = plan.count - recentCount;
  const earlyIncorrect = plan.incorrect - plan.recentIncorrect;
  return [
    ...Array.from({ length: earlyCount }, (_, index) => index >= earlyIncorrect),
    ...Array.from(
      { length: recentCount },
      (_, index) => index >= plan.recentIncorrect,
    ),
  ];
}

function isoDaysBefore(days: number, minuteOffset = 0): string {
  return new Date(
    Date.parse(AI_COACH_AS_OF) - days * 86_400_000 - minuteOffset * 60_000,
  ).toISOString();
}

function buildValidAttempts(): ProblemAttempt[] {
  const result: ProblemAttempt[] = [];
  let ordinal = 1;
  for (const user of userFixtures) {
    for (const plan of attemptPlans[user.id]) {
      outcomes(plan).forEach((isCorrect, index, all) => {
        const mapping = questionMappings[plan.conceptIndex * 3 + (index % 3)];
        const id = `attempt-${String(ordinal).padStart(3, "0")}`;
        result.push({
          id,
          idempotencyKey: `submission-${String(ordinal).padStart(3, "0")}`,
          userId: user.id,
          questionId: mapping.questionId,
          isCorrect,
          isGraded: true,
          isValid: true,
          occurredAt: isoDaysBefore(all.length - index + plan.conceptIndex / 100, ordinal),
        });
        ordinal += 1;
      });
    }
  }
  return result;
}

function buildProblemAttempts(): ProblemAttempt[] {
  const valid = buildValidAttempts();
  const duplicateUsers = ["user-02", "user-03", "user-04", "user-05", "user-07", "user-09", "user-10"];
  const duplicates = duplicateUsers.map((userId, index) => {
    const source = valid.find((attempt) => attempt.userId === userId)!;
    return {
      ...source,
      id: `attempt-duplicate-${index + 1}`,
      occurredAt: new Date(Date.parse(source.occurredAt) + 1_000).toISOString(),
    };
  });
  const ungradedUsers = ["user-01", "user-03", "user-06", "user-08", "user-09"];
  const ungraded = ungradedUsers.map((userId, index): ProblemAttempt => ({
    id: `attempt-ungraded-${index + 1}`,
    idempotencyKey: `submission-ungraded-${index + 1}`,
    userId,
    questionId: questionMappings[index].questionId,
    isCorrect: null,
    isGraded: false,
    isValid: true,
    occurredAt: isoDaysBefore(2 + index, index),
  }));
  const invalidUsers = ["user-01", "user-04", "user-05", "user-08", "user-10"];
  const invalid = invalidUsers.map((userId, index): ProblemAttempt => ({
    id: `attempt-invalid-${index + 1}`,
    idempotencyKey: `submission-invalid-${index + 1}`,
    userId,
    questionId: questionMappings[index + 8].questionId,
    isCorrect: index % 2 === 0,
    isGraded: true,
    isValid: false,
    occurredAt: isoDaysBefore(3 + index, index),
  }));
  return [...valid, ...duplicates, ...ungraded, ...invalid];
}

export const problemAttempts = buildProblemAttempts();

const diagnosticSeeds: Array<[UserId, number, number, number]> = [
  ["user-01", 0, 4, 3], ["user-01", 2, 4, 2], ["user-01", 4, 4, 2],
  ["user-02", 1, 5, 4], ["user-02", 3, 5, 3], ["user-02", 5, 5, 2],
  ["user-03", 6, 4, 3], ["user-03", 7, 4, 2], ["user-03", 4, 4, 1],
  ["user-08", 0, 3, 2], ["user-08", 2, 3, 2],
  ["user-09", 3, 4, 3], ["user-09", 4, 4, 2], ["user-10", 6, 4, 2],
];

export const diagnosticResults: DiagnosticResult[] = diagnosticSeeds.map(
  ([userId, conceptIndex, questionCount, incorrectCount], index) => ({
    id: `diagnostic-${String(index + 1).padStart(2, "0")}`,
    userId,
    conceptId: concepts[conceptIndex].id,
    questionCount,
    incorrectCount,
    completedAt: isoDaysBefore(35 + index, index),
  }),
);

const historyCounts = [0, 4, 8, 10, 10, 9, 10, 6, 12, 11];
const preferredTypesByUser: Record<UserId, ContentType[]> = {
  "user-01": ["quiz"], "user-02": ["practice"], "user-03": ["reading"],
  "user-04": ["quiz"], "user-05": ["video"], "user-06": ["reading"],
  "user-07": ["practice", "quiz"], "user-08": ["quiz"], "user-09": ["quiz"],
  "user-10": ["reading", "practice"],
};

function buildContentHistory(): ContentHistoryEvent[] {
  const byType = Object.fromEntries(
    (["quiz", "video", "reading", "practice"] as ContentType[]).map((type) => [
      type,
      contents.filter((content) => content.type === type),
    ]),
  ) as Record<ContentType, LearningContent[]>;
  const result: ContentHistoryEvent[] = [];
  let ordinal = 1;
  const user09RecentOrdinals = [16, 17, 18, 20, 21, 22, 23, 24, 25, 31, 32, 33];
  userFixtures.forEach((user, userIndex) => {
    const count = historyCounts[userIndex];
    const preferences = preferredTypesByUser[user.id];
    for (let index = 0; index < count; index += 1) {
      const type = index % 4 === 3
        ? (["quiz", "video", "reading", "practice"] as ContentType[])[(userIndex + index) % 4]
        : preferences[index % preferences.length];
      let content = byType[type][(userIndex * 2 + index) % byType[type].length];
      if (user.id === "user-09") content = contents[user09RecentOrdinals[index] - 1];
      const status = user.id === "user-09" ? "completed" : index % 5 === 4 ? "started" : "completed";
      const daysBefore = user.id === "user-09" ? (index % 6) + 1 : index === 0 ? 3 : 12 + index;
      result.push({
        id: `history-${String(ordinal).padStart(3, "0")}`,
        userId: user.id,
        contentId: content.id,
        status,
        actualMinutes: Math.max(2, content.estimatedMinutes + (index % 3) - 1),
        occurredAt: isoDaysBefore(daysBefore, ordinal),
      });
      ordinal += 1;
    }
  });
  return result;
}

export const contentHistoryEvents = buildContentHistory();

export const aiCoachFixtures: AiCoachFixtures = {
  units,
  concepts,
  questionMappings,
  contents,
  users: userFixtures,
  problemAttempts,
  diagnosticResults,
  contentHistoryEvents,
};

export const AI_COACH_DATA_SUMMARY = {
  units: units.length,
  concepts: concepts.length,
  questionMappings: questionMappings.length,
  contents: contents.length,
  users: userFixtures.length,
  problemAttempts: problemAttempts.length,
  diagnosticResults: diagnosticResults.length,
  contentHistoryEvents: contentHistoryEvents.length,
  evaluationLabels: 93,
} as const;

export function isUserFixtureId(value: unknown): value is UserId {
  return typeof value === "string" && fixtureIds.includes(value);
}

export function getUserFixture(id: UserId): UserFixture {
  const fixture = userFixtures.find((user) => user.id === id);
  if (!fixture) throw new Error(`Unknown AI coach fixture: ${id}`);
  return fixture;
}

if (
  units.length !== 4 ||
  concepts.length !== 8 ||
  questionMappings.length !== 24 ||
  contents.length !== 40 ||
  userFixtures.length !== 10 ||
  problemAttempts.length < 150 ||
  problemAttempts.length > 200 ||
  contentHistoryEvents.length < 60 ||
  contentHistoryEvents.length > 100
) {
  throw new Error("AI coach synthetic fixture cardinality is invalid.");
}
