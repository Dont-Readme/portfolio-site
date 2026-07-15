"use client";

import {
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  aiCoachFixtureSummaries,
} from "@/features/ai-coach/fixtures";
import type { AiCoachRecommendResponse } from "@/app/api/ai-coach/recommend/route";
import type {
  AiCoachRunResult,
  AttemptExclusionReason,
  CandidateExclusionReason,
  ConfidenceLevel,
  ContentType,
  FitGrade,
  FitScores,
  GoalRelation,
  RankedRecommendation,
  UserId,
  WeaknessDataStage,
} from "@/features/ai-coach/types";

type FixtureSummary = (typeof aiCoachFixtureSummaries)[number];

type LoadState = "idle" | "loading" | "success" | "error";

const contentTypeLabels: Record<ContentType, string> = {
  quiz: "퀴즈",
  video: "영상",
  reading: "읽기",
  practice: "실전 연습",
};

const confidenceLabels: Record<ConfidenceLevel, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
};

const dataStageLabels: Record<WeaknessDataStage, string> = {
  diagnostic: "진단 기반",
  diagnostic_behavior_mix: "진단·행동 혼합",
  behavior: "행동 기반",
  insufficient: "데이터 부족",
};

const candidateExclusionLabels: Record<CandidateExclusionReason, string> = {
  inactive: "비활성",
  difficulty_gap: "난이도 범위 밖",
  recently_completed: "최근 7일 내 완료",
  over_candidate_limit: "AI 전달 한도 초과",
};

const attemptExclusionLabels: Record<AttemptExclusionReason, string> = {
  duplicate: "중복 제출",
  ungraded: "미채점",
  invalid: "무효 이벤트",
  unmapped: "개념 미연결",
  future: "기준 시점 이후",
};

const fitDimensions: Array<{
  key: keyof FitScores;
  shortLabel: string;
  label: string;
  max: number;
}> = [
  { key: "goal_fit", shortLabel: "목표", label: "학습 목표 의미 적합성", max: 35 },
  { key: "format_fit", shortLabel: "유형", label: "콘텐츠 유형 적합성", max: 25 },
  { key: "duration_fit", shortLabel: "시간", label: "학습 시간 적합성", max: 20 },
  { key: "level_fit", shortLabel: "난이도", label: "수준·난이도 적합성", max: 20 },
];

export function AiCoachDemo() {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const users = aiCoachFixtureSummaries;
  const initialFixtureId = users[0]?.id ?? "";
  const [selectedFixtureId, setSelectedFixtureId] =
    useState<UserId>(initialFixtureId);
  const [result, setResult] = useState<AiCoachRecommendResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cachedFixtureIds, setCachedFixtureIds] = useState<UserId[]>([]);
  const responseCache = useRef(
    new Map<UserId, AiCoachRecommendResponse>(),
  );
  const inFlightFixtures = useRef(new Set<UserId>());

  const selectedUser =
    users.find((user) => user.id === selectedFixtureId) ?? users[0];

  function selectFixture(fixtureId: UserId) {
    if (loadState === "loading") {
      return;
    }

    setSelectedFixtureId(fixtureId);
    setErrorMessage(null);
    const cached = responseCache.current.get(fixtureId);
    setResult(cached ?? null);
    setLoadState(cached ? "success" : "idle");
  }

  async function runRecommendation() {
    if (!selectedFixtureId) {
      return;
    }

    const cached = responseCache.current.get(selectedFixtureId);
    if (cached) {
      setResult(cached);
      setLoadState("success");
      return;
    }
    if (inFlightFixtures.current.has(selectedFixtureId)) {
      return;
    }

    inFlightFixtures.current.add(selectedFixtureId);
    setLoadState("loading");
    setResult(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai-coach/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fixtureId: selectedFixtureId }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new Error(readApiError(payload));
      }

      if (!isAiCoachRecommendResponse(payload)) {
        throw new Error("응답 구조를 확인할 수 없습니다. 잠시 후 다시 실행해 주세요.");
      }

      responseCache.current.set(selectedFixtureId, payload);
      setCachedFixtureIds((current) =>
        current.includes(selectedFixtureId)
          ? current
          : [...current, selectedFixtureId],
      );
      setResult(payload);
      setLoadState("success");
    } catch (error) {
      setLoadState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "추천 실행 중 알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      inFlightFixtures.current.delete(selectedFixtureId);
    }
  }

  if (!selectedUser) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f3f5ef] text-[#142019]">
      <DemoHeader />

      <div className="mx-auto w-full max-w-[1540px] px-4 pb-20 pt-8 sm:px-6 lg:px-10 lg:pt-12">
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex justify-end border-b border-[#142019]/12 pb-6"
        >
          <div className="max-w-2xl lg:justify-self-end">
            <div
              role="note"
              className="border-l-2 border-[#c58a27] bg-[#fff8e8] px-4 py-3 text-sm leading-6 text-[#684815]"
            >
              <strong className="font-semibold">합성 데이터 데모</strong>
              <span className="mx-2 text-[#c58a27]" aria-hidden="true">
                /
              </span>
              실제 사용자 데이터나 출시 성과가 아닙니다.
            </div>
          </div>
        </motion.section>

        <section
          aria-labelledby="fixture-heading"
          className="mt-10"
        >
          <SectionHeader id="fixture-heading" title="01. 사용자 선택" />
          <div className="grid overflow-hidden border border-[#142019]/12 bg-white shadow-[0_24px_70px_rgba(31,49,39,0.07)] xl:grid-cols-[minmax(20rem,0.42fr)_minmax(0,0.58fr)]">
            <div className="border-b border-[#142019]/10 p-5 sm:p-7 xl:border-b-0 xl:border-r">
            <label className="grid gap-2" htmlFor="fixture-select">
              <span className="text-xs font-semibold text-[#142019]/52">
                테스트 시나리오
              </span>
              <select
                id="fixture-select"
                value={selectedFixtureId}
                disabled={loadState === "loading"}
                onChange={(event) => selectFixture(event.target.value)}
                className="min-h-12 w-full border border-[#142019]/18 bg-white px-3 text-sm font-semibold outline-none transition focus:border-[#14705a] focus:ring-2 focus:ring-[#14705a]/20 disabled:cursor-wait disabled:opacity-60"
              >
                {users.map((user, index) => (
                  <option key={user.id} value={user.id}>
                    {String(index + 1).padStart(2, "0")} · {user.displayName} ·{" "}
                    {user.scenario}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              {users.map((user, index) => {
                const isSelected = user.id === selectedFixtureId;
                const isCached = cachedFixtureIds.includes(user.id);

                return (
                  <button
                    key={user.id}
                    type="button"
                    disabled={loadState === "loading"}
                    aria-label={
                      user.displayName +
                      (isCached
                        ? " 선택, 실행 결과 캐시됨"
                        : " 선택")
                    }
                    aria-pressed={isSelected}
                    onClick={() => selectFixture(user.id)}
                    className={[
                      "relative grid size-9 place-items-center border text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14705a] focus-visible:ring-offset-2 disabled:cursor-wait",
                      isSelected
                        ? "border-[#142019] bg-[#142019] text-white"
                        : "border-[#142019]/14 bg-white text-[#142019]/52 hover:border-[#14705a] hover:text-[#14705a]",
                    ].join(" ")}
                  >
                    {index + 1}
                    {isCached ? (
                      <span
                        className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-white bg-[#28a37b]"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
            </div>

            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <UserSummary user={selectedUser} result={result} />
              <div className="lg:min-w-52">
              <button
                type="button"
                onClick={runRecommendation}
                disabled={loadState === "loading"}
                className="group flex min-h-13 w-full items-center justify-between gap-6 bg-[#14705a] px-5 text-sm font-semibold text-white transition hover:bg-[#0d5d4a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14705a] focus-visible:ring-offset-2 disabled:cursor-wait disabled:bg-[#14705a]/55"
              >
                <span>
                  {loadState === "loading"
                    ? "계산 중"
                    : cachedFixtureIds.includes(selectedFixtureId)
                      ? "저장된 결과 보기"
                      : "최초 추천 실행"}
                </span>
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                >
                  {loadState === "loading" ? "···" : "→"}
                </span>
              </button>
              <p className="mt-2 text-xs leading-5 text-[#142019]/45">
                사용자별 성공 응답은 이 페이지에서 1회만 생성하고 다시
                선택하면 캐시를 재사용합니다.
              </p>
              </div>
            </div>
          </div>
        </section>

        <p className="sr-only" role="status" aria-live="polite">
          {loadState === "loading"
            ? "추천 알고리즘을 실행하고 있습니다."
            : loadState === "success"
              ? "추천 알고리즘 실행이 완료되었습니다."
              : ""}
        </p>
        <div className="mt-12">
          {loadState === "idle" ? (
            <IdlePanel />
          ) : loadState === "loading" ? (
            <LoadingPanel reduceMotion={shouldReduceMotion} />
          ) : loadState === "error" ? (
            <ErrorPanel
              message={errorMessage ?? "추천 실행에 실패했습니다."}
              onRetry={runRecommendation}
            />
          ) : result ? (
            <ResultDashboard
              result={result}
              reduceMotion={shouldReduceMotion}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}

function DemoHeader() {
  return (
    <header className="border-b border-white/10 bg-[#142019] text-white">
      <div className="mx-auto flex min-h-16 w-full max-w-[1540px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center border border-white/22 text-[0.64rem] font-semibold tracking-[0.12em]">
            AI
          </span>
          <p className="truncate text-sm font-semibold">
            AI 학습 코치 · 알고리즘 데모
          </p>
        </div>
      </div>
    </header>
  );
}

function UserSummary({
  user,
  result,
}: {
  user: FixtureSummary;
  result: AiCoachRecommendResponse | null;
}) {
  const profile = result?.behaviorProfile;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill tone={user.status === "new" ? "amber" : "green"}>
          {user.status === "new" ? "신규 사용자" : "기존 사용자"}
        </StatusPill>
        <StatusPill tone="neutral">수준 {user.level}</StatusPill>
        <StatusPill tone={user.behaviorProfileEnabled ? "dark" : "neutral"}>
          행동 프로필 {user.behaviorProfileEnabled ? "사용" : "미사용"}
        </StatusPill>
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.025em]">
        {user.displayName}
      </h3>
      <p className="mt-1 text-sm font-medium text-[#14705a]">{user.scenario}</p>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-[#142019]/42">학습 목표</dt>
          <dd className="mt-1 leading-6 text-[#142019]/74">
            {user.learningGoal}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#142019]/42">행동 신호</dt>
          <dd className="mt-1 leading-6 text-[#142019]/74">
            {profile
              ? profile.preferredTypes
                  .map((type) => contentTypeLabels[type])
                  .join(" · ") +
                " / 평균 " +
                profile.averageStudyMinutes +
                "분"
              : user.behaviorProfileEnabled
                ? "실행 후 원천 이력에서 계산"
                : "프로필 없음 · 유효 항목만 재환산"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function IdlePanel() {
  return (
    <section className="grid min-h-72 place-items-center border border-dashed border-[#142019]/18 bg-white/45 px-6 py-12 text-center">
      <div className="max-w-lg">
        <div className="mx-auto grid size-12 place-items-center border border-[#14705a]/25 bg-[#e5f3ed] text-lg text-[#14705a]">
          ↳
        </div>
        <h2 className="mt-5 text-xl font-semibold">실행 준비가 끝났습니다.</h2>
        <p className="mt-2 text-sm leading-6 text-[#142019]/55">
          사용자를 고른 뒤 ‘최초 추천 실행’을 누르면 원천 데이터부터
          오프라인 평가까지 한 번에 계산합니다.
        </p>
      </div>
    </section>
  );
}

function LoadingPanel({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <section
      role="status"
      aria-label="추천 알고리즘 실행 중"
      className="overflow-hidden border border-[#142019]/12 bg-[#142019] text-white"
    >
      <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center sm:min-h-72">
        <motion.div
          aria-hidden="true"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{
            duration: 1.4,
            ease: "linear",
            repeat: Number.POSITIVE_INFINITY,
          }}
          className="size-10 rounded-full border-2 border-white/15 border-t-[#71dfb8]"
        />
        <h2 className="mt-6 text-2xl font-semibold">
          AI 추천 후보를 생성 중입니다.
        </h2>
      </div>
    </section>
  );
}

function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section
      role="alert"
      className="grid gap-5 border border-[#b84e3b]/28 bg-[#fff3ef] p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
    >
      <div>
        <h2 className="text-xl font-semibold">실행을 완료하지 못했습니다.</h2>
        <p className="mt-2 text-sm leading-6 text-[#65342b]">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 border border-[#a13d2d] px-5 text-sm font-semibold text-[#a13d2d] transition hover:bg-[#a13d2d] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a13d2d] focus-visible:ring-offset-2"
      >
        다시 실행
      </button>
    </section>
  );
}

function ResultDashboard({
  result,
  reduceMotion,
}: {
  result: AiCoachRecommendResponse;
  reduceMotion: boolean;
}) {
  return (
    <div className="grid gap-12">
      <PipelineSection result={result} reduceMotion={reduceMotion} />
      <SourceAndWeaknessSection result={result} reduceMotion={reduceMotion} />
      <CandidateSection result={result} reduceMotion={reduceMotion} />
      <RankingSection result={result} reduceMotion={reduceMotion} />
      <RecommendationSection result={result} reduceMotion={reduceMotion} />
      <EvaluationSection result={result} reduceMotion={reduceMotion} />
      <ObservabilitySection result={result} reduceMotion={reduceMotion} />
    </div>
  );
}

function PipelineSection({
  result,
  reduceMotion,
}: {
  result: AiCoachRecommendResponse;
  reduceMotion: boolean;
}) {
  return (
    <RevealSection
      id="pipeline"
      title="02. 처리 과정"
      description="각 단계의 데이터 처리 과정 요약"
      reduceMotion={reduceMotion}
    >
      <ol
        aria-label="추천 처리 단계"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-9"
      >
        {result.pipelineSteps.map((step, index) => (
          <motion.li
            key={step.id}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.35, delay: index * 0.035 }}
            className="relative border border-[#142019]/12 bg-white p-4 2xl:min-h-52"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-7 place-items-center bg-[#142019] text-[0.64rem] font-semibold text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              {index < result.pipelineSteps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="hidden text-[#14705a] 2xl:block"
                >
                  →
                </span>
              ) : null}
            </div>
            <h3 className="mt-5 text-sm font-semibold leading-5">{step.label}</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-lg font-semibold tabular-nums">
                {step.inputCount}
              </span>
              <span className="text-[#142019]/30">→</span>
              <span className="text-2xl font-semibold tabular-nums text-[#14705a]">
                {step.outputCount}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#142019]/52">
              {step.detail}
            </p>
          </motion.li>
        ))}

        <motion.li
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{
            duration: 0.35,
            delay: result.pipelineSteps.length * 0.035,
          }}
          className="border border-[#14705a]/30 bg-[#e7f4ee] p-4 2xl:min-h-52"
        >
          <span className="grid size-7 place-items-center bg-[#14705a] text-[0.64rem] font-semibold text-white">
            {String(result.pipelineSteps.length + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-5 text-sm font-semibold">오프라인 평가</h3>
          <p className="mt-4 text-2xl font-semibold tabular-nums text-[#14705a]">
            {formatMetric(result.evaluation.mixedNdcgAt3)}
          </p>
          <p className="mt-3 text-xs leading-5 text-[#142019]/52">
            숨겨 둔 합성 정답 라벨 기준 선택 사용자의 혼합 NDCG@3 계산
          </p>
        </motion.li>
      </ol>
    </RevealSection>
  );
}

function SourceAndWeaknessSection({
  result,
  reduceMotion,
}: {
  result: AiCoachRecommendResponse;
  reduceMotion: boolean;
}) {
  const auditEntries = Object.entries(result.eventAudit.excludedByReason) as Array<
    [AttemptExclusionReason, number]
  >;

  return (
    <RevealSection
      id="weakness"
      title="03. 데이터 및 취약도"
      reduceMotion={reduceMotion}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(20rem,0.34fr)_minmax(0,0.66fr)]">
        <div className="grid gap-4">
          <article className="border border-[#142019]/12 bg-[#142019] p-5 text-white sm:p-6">
            <p className="text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-[#71dfb8]">
              사용자 프로필
            </p>
            <h3 className="mt-3 text-2xl font-semibold">{result.user.displayName}</h3>
            <p className="mt-1 text-sm text-white/50">{result.user.scenario}</p>
            <dl className="mt-6 grid gap-4">
              <DefinitionRow
                label="상태 / 수준"
                value={
                  (result.user.status === "new" ? "신규" : "기존") +
                  " · 수준 " +
                  result.user.level
                }
                invert
              />
              <DefinitionRow
                label="학습 목표"
                value={result.user.learningGoal}
                invert
              />
              <DefinitionRow
                label="목표 태그"
                value={result.user.goalTags.join(" · ")}
                invert
              />
              <DefinitionRow
                label="행동 프로필"
                value={
                  result.behaviorProfile
                    ? result.behaviorProfile.preferredTypes
                        .map((type) => contentTypeLabels[type])
                        .join(" · ") +
                      " / 평균 " +
                      result.behaviorProfile.averageStudyMinutes +
                      "분 / 원천 " +
                      result.behaviorProfile.sourceEventCount +
                      "건"
                    : "없음 · 목표/수준 항목만으로 적합도 재환산"
                }
                invert
              />
            </dl>
          </article>

          <article className="border border-[#142019]/12 bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold">풀이 이벤트 검증</h3>
              <span className="text-3xl font-semibold tabular-nums text-[#14705a]">
                {result.eventAudit.validCount}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-3 border border-[#142019]/10">
              <MiniMetric label="원천" value={result.eventAudit.rawCount} />
              <MiniMetric label="유효" value={result.eventAudit.validCount} />
              <MiniMetric label="제외" value={result.eventAudit.excludedCount} />
            </div>
            <div className="mt-4 grid gap-2">
              {auditEntries.map(([reason, count]) => (
                <div
                  key={reason}
                  className="flex items-center justify-between gap-4 border-b border-[#142019]/8 pb-2 text-xs"
                >
                  <span className="text-[#142019]/52">
                    {attemptExclusionLabels[reason]}
                  </span>
                  <span className="font-semibold tabular-nums">{count}건</span>
                </div>
              ))}
            </div>
            {result.eventAudit.excluded.length > 0 ? (
              <details className="mt-4 border border-[#142019]/10 bg-[#f7f8f4]">
                <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-[#142019]/58 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14705a]">
                  제외 이벤트 ID 확인
                </summary>
                <ul className="max-h-40 overflow-y-auto border-t border-[#142019]/8 p-3 text-xs text-[#142019]/52">
                  {result.eventAudit.excluded.map((item) => (
                    <li
                      key={item.eventId + item.reason}
                      className="flex justify-between gap-3 py-1"
                    >
                      <span>{item.eventId}</span>
                      <span>{attemptExclusionLabels[item.reason]}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </article>
        </div>

        <article className="overflow-hidden border border-[#142019]/12 bg-white">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#142019]/10 px-5 py-4 sm:px-6">
            <h3 className="text-lg font-semibold">개념 취약도 계산 결과</h3>
            <p className="text-xs text-[#142019]/46">
              최근 5회 × 70% + 누적 × 30%
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[940px] w-full border-collapse text-left text-sm">
              <caption className="sr-only">
                개념별 최근 오답률, 누적 오답률, 취약도와 신뢰도
              </caption>
              <thead className="bg-[#f3f5ef] text-[0.67rem] uppercase tracking-[0.08em] text-[#142019]/42">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold sm:px-5">
                    개념
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    데이터 단계
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    최근 오답
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    누적 오답
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    유효 풀이
                  </th>
                  <th scope="col" className="min-w-48 px-4 py-3 font-semibold">
                    최종 취약도
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    신뢰도
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#142019]/8">
                {result.conceptWeaknesses.map((weakness) => (
                  <tr key={weakness.conceptId} className="align-middle">
                    <th
                      scope="row"
                      className="px-4 py-4 font-semibold sm:px-5"
                    >
                      {weakness.conceptName}
                    </th>
                    <td className="px-4 py-4 text-xs text-[#142019]/58">
                      {dataStageLabels[weakness.dataStage]}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums">
                      {formatPercent(weakness.recentIncorrectRate)}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums">
                      {formatPercent(weakness.cumulativeIncorrectRate)}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums">
                      {weakness.validAttemptCount}회
                    </td>
                    <td className="px-4 py-4">
                      <ScoreBar value={weakness.finalScore} />
                    </td>
                    <td className="px-4 py-4">
                      <ConfidencePill confidence={weakness.confidence} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid border-t border-[#142019]/10 bg-[#fafbf8] sm:grid-cols-2 lg:grid-cols-4">
            {result.unitWeaknesses.map((unit) => (
              <div
                key={unit.unitId}
                className="border-b border-[#142019]/8 p-4 last:border-b-0 sm:border-r lg:border-b-0"
              >
                <p className="text-xs text-[#142019]/44">{unit.unitName}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {unit.score === null ? "—" : formatScore(unit.score)}
                </p>
                <p className="mt-1 text-[0.68rem] text-[#142019]/40">
                  신뢰도 보통 이상 {unit.includedConceptCount}개 평균
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>

    </RevealSection>
  );
}

function CandidateSection({
  result,
  reduceMotion,
}: {
  result: AiCoachRecommendResponse;
  reduceMotion: boolean;
}) {
  const selection = result.candidateSelection;
  const exclusionEntries = Object.entries(selection.excludedByReason) as Array<
    [CandidateExclusionReason, number]
  >;
  const scoredCandidates = result.scoredCandidates;

  return (
    <RevealSection
      id="candidates"
      title="04. 후보 선정 및 점수 계산"
      description="시스템이 유형·시간·수준, AI가 목표 의미를 판단하고 개인 적합도를 취약도와 50:50으로 결합"
      reduceMotion={reduceMotion}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.62fr)_minmax(18rem,0.38fr)]">
        <article className="border border-[#142019]/12 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h3 className="text-lg font-semibold">조회·필터 결과</h3>
            {selection.fallbackCandidatesAdded > 0 ? (
              <StatusPill tone="amber">
                대체 후보 +{selection.fallbackCandidatesAdded}
              </StatusPill>
            ) : null}
          </div>
          <div className="mt-5 grid grid-cols-2 border border-[#142019]/10 sm:grid-cols-4">
            <FunnelMetric label="조회" value={selection.queriedCount} />
            <FunnelMetric
              label="정책 제외"
              value={selection.queriedCount - selection.eligibleCount}
            />
            <FunnelMetric label="필터 통과" value={selection.eligibleCount} />
            <FunnelMetric label="AI 전달" value={selection.deliveredCount} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {exclusionEntries.map(([reason, count]) => (
              <span
                key={reason}
                className={[
                  "inline-flex min-h-8 items-center gap-2 border px-3 text-xs",
                  count > 0
                    ? "border-[#c58a27]/25 bg-[#fff8e8] text-[#73521c]"
                    : "border-[#142019]/10 bg-[#f7f8f4] text-[#142019]/42",
                ].join(" ")}
              >
                {candidateExclusionLabels[reason]}
                <strong className="font-semibold tabular-nums">{count}</strong>
              </span>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-[#142019]/48">
            상위 취약 개념:{" "}
            <strong className="font-semibold text-[#142019]/72">
              {selection.topConceptIds
                .map(
                  (conceptId) =>
                    result.conceptWeaknesses.find(
                      (weakness) => weakness.conceptId === conceptId,
                    )?.conceptName ?? conceptId,
                )
                .join(" · ")}
            </strong>
          </p>
        </article>

        <article className="border border-[#14705a]/24 bg-[#e7f4ee] p-5 sm:p-6">
          <p className="text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-[#14705a]">
            점수 계산 방식
          </p>
          <div className="mt-4 grid gap-4">
            <div>
              <p className="text-xs font-semibold text-[#142019]/48">
                개인 적합도
              </p>
              <p className="mt-2 text-base font-semibold leading-6">
                유효 점수 합 ÷ 유효 항목 최대점 합 × 100
              </p>
              <p className="mt-1 text-xs leading-5 text-[#142019]/48">
                프로필 정보가 없으면 유형·시간은 null이며 분모에서도 제외
              </p>
            </div>
            <div className="border-t border-[#14705a]/16 pt-4">
              <p className="text-xs font-semibold text-[#142019]/48">
                최종 추천 점수
              </p>
              <p className="mt-2 text-base font-semibold leading-6">
                개인 적합도 × 0.5 + 대표 개념 취약도 × 0.5
              </p>
            </div>
          </div>
        </article>
      </div>

      <article className="mt-4 overflow-hidden border border-[#142019]/12 bg-white">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#142019]/10 px-5 py-4 sm:px-6">
          <h3 className="text-lg font-semibold">후보별 적합도 계산 결과</h3>
          <p className="text-xs text-[#142019]/44">
            null은 중립값 50이 아니라 계산 제외
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1240px] w-full border-collapse text-left text-xs">
            <caption className="sr-only">
              후보별 AI 목표 적합도와 시스템 유형·시간·수준 적합도, 개인
              적합도, 취약도, 최종 점수
            </caption>
            <thead className="bg-[#f3f5ef] text-[0.65rem] uppercase tracking-[0.07em] text-[#142019]/43">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold sm:px-5">
                  순위 / 후보
                </th>
                {fitDimensions.map((dimension) => (
                  <th
                    key={dimension.key}
                    scope="col"
                    className="px-3 py-3 text-right font-semibold"
                    title={dimension.label}
                  >
                    {dimension.shortLabel} / {dimension.max}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 font-semibold">
                  정규화
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  개인 적합
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  취약도
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  최종
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#142019]/8">
              {scoredCandidates.map((candidate) => {
                const fraction = getFitFraction(candidate.fitScores);

                return (
                  <tr
                    key={candidate.contentId}
                    className="align-middle transition hover:bg-[#f7f9f5]"
                  >
                    <th
                      scope="row"
                      className="max-w-80 px-4 py-4 font-semibold sm:px-5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid size-7 shrink-0 place-items-center bg-[#142019] text-[0.65rem] text-white">
                          {candidate.rank}
                        </span>
                        <span>
                          <span className="block text-sm leading-5">
                            {candidate.title}
                          </span>
                          <span className="mt-1 block font-medium text-[#142019]/38">
                            {candidate.conceptName} ·{" "}
                            {contentTypeLabels[candidate.type]} ·{" "}
                            {candidate.estimatedMinutes}분
                          </span>
                        </span>
                      </div>
                    </th>
                    {fitDimensions.map((dimension) => (
                      <td
                        key={dimension.key}
                        className="px-3 py-4 text-right tabular-nums"
                      >
                        <FitValue
                          value={candidate.fitScores[dimension.key]}
                          max={dimension.max}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-4 text-[#142019]/52">
                      {fraction.numerator}/{fraction.denominator} × 100
                    </td>
                    <td className="px-3 py-4 text-right">
                      <span className="font-semibold tabular-nums">
                        {formatScore(candidate.personalFit)}
                      </span>
                      <span className="ml-1 text-[0.62rem] text-[#142019]/38">
                        {fitGradeLabel(candidate.fitGrade)}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right font-semibold tabular-nums">
                      {formatScore(candidate.weaknessScore)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="inline-flex min-w-14 justify-center bg-[#e7f4ee] px-2 py-1.5 text-sm font-semibold tabular-nums text-[#14705a]">
                        {formatScore(candidate.finalScore)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>
    </RevealSection>
  );
}

function RankingSection({
  result,
  reduceMotion,
}: {
  result: AiCoachRecommendResponse;
  reduceMotion: boolean;
}) {
  return (
    <RevealSection
      id="ranking"
      title="05. 규칙 기반과 AI 추천 비교"
      description="취약도 중심 규칙 기반 추천과 AI를 적용한 추천 비교"
      reduceMotion={reduceMotion}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <RankingPanel
          title="규칙 기반 추천 3개"
          items={result.ruleTop3}
          diversity={result.diversity.rule}
          tone="neutral"
        />
        <RankingPanel
          title="AI 혼합 추천 3개"
          items={result.mixedTop3}
          diversity={result.diversity.mixed}
          tone="green"
          badge={formatEvaluationSource(result.aiEvaluation.source)}
        />
      </div>
    </RevealSection>
  );
}

function RankingPanel({
  title,
  items,
  diversity,
  tone,
  badge,
}: {
  title: string;
  items: RankedRecommendation[];
  diversity: AiCoachRunResult["diversity"]["rule"];
  tone: "neutral" | "green";
  badge?: string;
}) {
  return (
    <article
      className={[
        "overflow-hidden border",
        tone === "green"
          ? "border-[#14705a]/32 bg-white"
          : "border-[#142019]/12 bg-white",
      ].join(" ")}
    >
      <div
        className={[
          "flex flex-wrap items-start justify-between gap-4 border-b px-5 py-5 sm:px-6",
          tone === "green"
            ? "border-[#14705a]/16 bg-[#e7f4ee]"
            : "border-[#142019]/10 bg-[#f3f5ef]",
        ].join(" ")}
      >
        <h3 className="text-xl font-semibold">{title}</h3>
        {badge ? (
          <StatusPill tone="neutral">
            {badge}
          </StatusPill>
        ) : null}
      </div>
      <ol className="divide-y divide-[#142019]/8">
        {items.map((item) => (
            <li
              key={item.contentId}
              className="grid gap-3 px-5 py-5 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-center sm:px-6"
            >
              <span
                className={[
                  "grid size-9 place-items-center text-sm font-semibold",
                  tone === "green"
                    ? "bg-[#14705a] text-white"
                    : "bg-[#142019] text-white",
                ].join(" ")}
              >
                {item.rank}
              </span>
              <div>
                <h4 className="font-semibold leading-5">{item.title}</h4>
                <p className="mt-1 text-xs text-[#142019]/45">
                  {item.conceptName} · {contentTypeLabels[item.type]} ·{" "}
                  {item.estimatedMinutes}분
                </p>
              </div>
              <div className="flex items-center sm:justify-end">
                <div className="text-right">
                  <p className="text-[0.62rem] text-[#142019]/38">
                    {tone === "green" ? "최종 점수" : "취약도"}
                  </p>
                  <p className="mt-1 font-semibold tabular-nums">
                    {formatScore(
                      tone === "green" ? item.finalScore : item.weaknessScore,
                    )}
                  </p>
                </div>
              </div>
            </li>
        ))}
      </ol>
      <div className="border-t border-[#142019]/8 px-5 py-3 text-xs leading-5 text-[#142019]/48 sm:px-6">
        개념 {diversity.selectedConceptIds.length}종 · 유형{" "}
        {diversity.selectedTypes.length}종
        {diversity.reason ? " · " + diversity.reason : ""}
      </div>
    </article>
  );
}

function RecommendationSection({
  result,
  reduceMotion,
}: {
  result: AiCoachRecommendResponse;
  reduceMotion: boolean;
}) {
  const evidenceMap = buildEvidenceMap(result);

  return (
    <RevealSection
      id="recommendations"
      title="06. 최종 AI 추천 후보 생성"
      description="AI 추천안 상세 내용"
      reduceMotion={reduceMotion}
    >
      <div className="mb-4 flex justify-end">
        <StatusPill
          tone={
            result.aiEvaluation.source === "live_ai" ? "green" : "neutral"
          }
        >
          {formatEvaluationSource(result.aiEvaluation.source)}
        </StatusPill>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {result.finalRecommendations.map((recommendation, index) => (
          <motion.article
            key={recommendation.contentId}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={reduceMotion ? undefined : { y: -4 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.38, delay: index * 0.06 }}
            className="group flex min-h-[31rem] flex-col overflow-hidden border border-[#142019]/12 bg-white shadow-[0_16px_45px_rgba(31,49,39,0.05)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#142019]/9 p-5 sm:p-6">
              <span className="grid size-11 place-items-center bg-[#14705a] text-lg font-semibold text-white">
                {recommendation.rank}
              </span>
              <div className="flex flex-wrap justify-end gap-2">
                <StatusPill tone="neutral">
                  {contentTypeLabels[recommendation.type]}
                </StatusPill>
                <StatusPill tone="neutral">
                  {recommendation.estimatedMinutes}분
                </StatusPill>
                <StatusPill tone="neutral">
                  {goalRelationLabel(recommendation.goalRelation)}
                </StatusPill>
              </div>
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="text-[0.67rem] font-semibold uppercase tracking-[0.15em] text-[#14705a]">
                {recommendation.conceptName} · 수준{" "}
                {recommendation.difficulty}
              </p>
              <h3 className="mt-3 text-2xl font-semibold leading-8 tracking-[-0.025em]">
                {recommendation.title}
              </h3>

              <div className="mt-6 grid grid-cols-3 border-y border-[#142019]/9 py-4">
                <CardScore
                  label="개인 적합"
                  value={recommendation.personalFit}
                />
                <CardScore
                  label="취약도"
                  value={recommendation.weaknessScore}
                />
                <CardScore
                  label="최종 점수"
                  value={recommendation.finalScore}
                  accent
                />
              </div>

              <blockquote className="mt-6 border-l-2 border-[#14705a] pl-4 text-[0.96rem] font-medium leading-7 text-[#142019]/78">
                “{recommendation.comment}”
              </blockquote>

              <div className="mt-auto pt-6">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-[#142019]/36">
                  근거
                </p>
                <div className="mt-2 grid gap-2">
                  {recommendation.evidenceIds.length > 0 ? (
                    recommendation.evidenceIds.map((evidenceId) => {
                      const evidence = evidenceMap.get(evidenceId);

                      return (
                        <div
                          key={evidenceId}
                          className="flex items-start justify-between gap-3 bg-[#f3f5ef] px-3 py-2 text-xs"
                        >
                          <span className="min-w-0 text-[#142019]/58">
                            {evidence?.label ?? evidenceId}
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums text-[#142019]/76">
                            {evidence ? String(evidence.value) : "미확인"}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-[#142019]/42">
                      연결된 수치 근거 없음
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </RevealSection>
  );
}

function EvaluationSection({
  result,
  reduceMotion,
}: {
  result: AiCoachRecommendResponse;
  reduceMotion: boolean;
}) {
  const live = result.evaluation;
  const benchmark = result.benchmark;
  const delta = live.delta;
  const overallDelta = benchmark.averageDelta;

  return (
    <RevealSection
      id="evaluation"
      title="07. 품질 평가"
      reduceMotion={reduceMotion}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
        <article className="border border-[#142019]/12 bg-[#142019] p-5 text-white sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h3 className="text-xl font-semibold">선택 사용자 NDCG@3</h3>
            <div className="flex flex-wrap justify-end gap-2">
              <StatusPill tone="dark">
                {formatEvaluationSource(result.aiEvaluation.source)}
              </StatusPill>
              <StatusPill tone="dark">
                라벨 적용 {formatCoverage(live.labelCoverage.mixed)}
              </StatusPill>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 border border-white/12">
            <DarkMetric
              label="규칙 기반"
              value={formatMetric(live.ruleNdcgAt3)}
            />
            <DarkMetric
              label="AI 혼합"
              value={formatMetric(live.mixedNdcgAt3)}
            />
            <DarkMetric
              label="차이"
              value={formatDelta(delta)}
              accent={
                delta === null
                  ? "neutral"
                  : delta >= 0
                    ? "positive"
                    : "negative"
              }
            />
          </div>

          <EvaluationVerdict delta={delta} />
          <p className="mt-5 text-xs leading-5 text-white/38">
            관련도 0~3 합성 정답 라벨 기준 DCG@3 ÷ IDCG@3. 추천 생성
            입력에는 평가 라벨을 포함하지 않습니다.
          </p>
        </article>

        <article className="border border-[#142019]/12 bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h3 className="text-xl font-semibold">전체 평가셋 품질</h3>
            <div className="flex flex-wrap justify-end gap-2">
              <span className="border border-[#142019]/10 bg-[#f3f5ef] px-3 py-2 text-xs font-semibold text-[#142019]/52">
                정상 AI 응답 가정 시나리오 기준
              </span>
              <span className="border border-[#142019]/10 bg-[#f3f5ef] px-3 py-2 text-xs font-semibold text-[#142019]/52">
                라벨 {benchmark.labelCount}개
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 border border-[#142019]/10 sm:grid-cols-4">
            <BenchmarkMetric
              label="Macro F1"
              value={formatMetric(benchmark.macroF1.score)}
              accent
            />
            <BenchmarkMetric
              label="평균 규칙 NDCG"
              value={formatMetric(benchmark.averageRuleNdcgAt3)}
            />
            <BenchmarkMetric
              label="평균 혼합 NDCG"
              value={formatMetric(benchmark.averageMixedNdcgAt3)}
            />
            <BenchmarkMetric
              label="평균 차이"
              value={formatDelta(overallDelta)}
              tone={
                overallDelta > 0
                  ? "positive"
                  : overallDelta < 0
                    ? "negative"
                    : "neutral"
              }
            />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-xs">
              <caption className="mb-3 text-left text-sm font-semibold">
                적합도 등급별 F1
              </caption>
              <thead className="border-y border-[#142019]/9 text-[#142019]/42">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    등급
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                    정밀도
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                    재현율
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                    F1
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                    표본 수
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#142019]/8">
                {(
                  Object.entries(benchmark.macroF1.byGrade) as Array<
                    [
                      FitGrade,
                      {
                        precision: number;
                        recall: number;
                        f1: number;
                        support: number;
                      },
                    ]
                  >
                ).map(([grade, metric]) => (
                  <tr key={grade}>
                    <th scope="row" className="px-3 py-3 font-semibold">
                      {fitGradeLabel(grade)}
                    </th>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatMetric(metric.precision)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatMetric(metric.recall)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums text-[#14705a]">
                      {formatMetric(metric.f1)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {metric.support}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </RevealSection>
  );
}

function ObservabilitySection({
  result,
  reduceMotion,
}: {
  result: AiCoachRecommendResponse;
  reduceMotion: boolean;
}) {
  const evidenceMap = buildEvidenceMap(result);
  const api = result.api;
  const retryUsed = api.attempts > 1;

  return (
    <RevealSection
      id="observability"
      title="08. 근거 검증과 실행 기록"
      description="응답이 어떤 입력 근거와 실제 연결되었는지 설명"
      reduceMotion={reduceMotion}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <article className="overflow-hidden border border-[#142019]/12 bg-white">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#142019]/10 px-5 py-5 sm:px-6">
            <h3 className="text-lg font-semibold">추천 이유 근거 연결</h3>
            <StatusPill
              tone={result.aiEvaluation.evidenceValidation.valid ? "green" : "amber"}
            >
              {result.aiEvaluation.evidenceValidation.valid
                ? "근거 ID 연결 확인"
                : "근거 ID 연결 오류"}
            </StatusPill>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse text-left text-xs">
              <caption className="sr-only">
                최종 추천별 문구 길이와 근거 ID 검증 결과
              </caption>
              <thead className="bg-[#f3f5ef] text-[#142019]/42">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold sm:px-5">
                    추천
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    문구 길이
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    근거 ID
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    입력 일치
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#142019]/8">
                {result.finalRecommendations.map((recommendation) => {
                  const matched = recommendation.evidenceIds.filter((id) =>
                    evidenceMap.has(id),
                  ).length;
                  const allMatched =
                    recommendation.evidenceIds.length > 0 &&
                    matched === recommendation.evidenceIds.length;

                  return (
                    <tr key={recommendation.contentId}>
                      <th
                        scope="row"
                        className="max-w-56 px-4 py-4 font-semibold sm:px-5"
                      >
                        {recommendation.rank}. {recommendation.title}
                      </th>
                      <td className="px-4 py-4 tabular-nums">
                        <span
                          className={
                            [...recommendation.comment].length <= 80
                              ? "text-[#14705a]"
                              : "text-[#a13d2d]"
                          }
                        >
                          {[...recommendation.comment].length}/80자
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[#142019]/52">
                        {recommendation.evidenceIds.length > 0
                          ? recommendation.evidenceIds.join(", ")
                          : "없음"}
                      </td>
                      <td className="px-4 py-4">
                        <StatusPill tone={allMatched ? "green" : "amber"}>
                          {matched}/{recommendation.evidenceIds.length} 일치
                        </StatusPill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="border-t border-[#142019]/8 px-5 py-3 text-xs leading-5 text-[#142019]/45">
            서버가 추천 이유 유형에 맞는 입력 근거 ID를 연결하고, 카탈로그
            존재 여부와 중복을 확인했습니다. 문구의 의미 품질은 07의 별도
            정합률 평가 대상입니다. {result.aiEvaluation.evidenceValidation.checkedItemCount}개
            항목 확인.
          </p>
        </article>

        <article className="border border-[#142019]/12 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h3 className="text-lg font-semibold">서버 실행 기록</h3>
            <StatusPill
              tone={api.status === "fallback" ? "amber" : "green"}
            >
              {formatApiStatus(api.status)}
            </StatusPill>
          </div>

          <dl className="mt-6 grid grid-cols-2 border border-[#142019]/10 sm:grid-cols-3">
            <TelemetryMetric
              label="실제 API 출처"
              value={formatApiSource(api.source)}
            />
            <TelemetryMetric
              label="응답 시간"
              value={api.latencyMs.toLocaleString("ko-KR") + " ms"}
            />
            <TelemetryMetric label="호출 시도" value={api.attempts + "회"} />
            <TelemetryMetric
              label="입력 토큰"
              value={formatTokenCount(api.inputTokens)}
            />
            <TelemetryMetric
              label="출력 토큰"
              value={formatTokenCount(api.outputTokens)}
            />
            <TelemetryMetric
              label="재시도"
              value={retryUsed ? "1회 사용" : "사용 안 함"}
            />
          </dl>

          <div className="mt-5 grid gap-3">
            <DefinitionRow label="모델" value={api.model || "설정 없음"} />
            <DefinitionRow
              label="추천 계산 출처"
              value={formatEvaluationSource(result.aiEvaluation.source)}
            />
            <DefinitionRow
              label="실제 API 상태"
              value={formatApiStatus(api.status)}
            />
            <DefinitionRow
              label="오류 코드"
              value={api.errorCode ?? "없음"}
            />
          </div>

          {result.aiEvaluation.validationErrors.length > 0 ? (
            <div className="mt-5 border border-[#b84e3b]/16 bg-[#fff3ef] p-4 text-xs leading-5 text-[#65342b]">
              <p className="font-semibold">실제 API 응답 검증 기록</p>
              <ul className="mt-2">
                {result.aiEvaluation.validationErrors.map((error, index) => (
                  <li key={error + index}>· {error}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      </div>

    </RevealSection>
  );
}

function RevealSection({
  children,
  description,
  id,
  reduceMotion,
  title,
}: {
  children: ReactNode;
  description?: string;
  id: string;
  reduceMotion: boolean;
  title: string;
}) {
  return (
    <motion.section
      id={id}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="scroll-mt-6"
    >
      <SectionHeader title={title} description={description} />
      {children}
    </motion.section>
  );
}

function SectionHeader({
  description,
  id,
  title,
}: {
  description?: string;
  id?: string;
  title: string;
}) {
  return (
    <div
      className={[
        "mb-5 grid gap-3 border-b border-[#142019]/12 pb-5",
        description
          ? "lg:grid-cols-[minmax(0,0.45fr)_minmax(20rem,0.55fr)] lg:items-end"
          : "",
      ].join(" ")}
    >
      <h2
        id={id}
        className="text-[clamp(1.8rem,4vw,3.3rem)] font-semibold leading-none tracking-[-0.04em]"
      >
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-6 text-[#142019]/56 lg:justify-self-end">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function StatusPill({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "green" | "amber" | "neutral" | "dark";
}) {
  const toneClass =
    tone === "green"
      ? "border-[#14705a]/20 bg-[#e7f4ee] text-[#14705a]"
      : tone === "amber"
        ? "border-[#c58a27]/24 bg-[#fff8e8] text-[#73521c]"
        : tone === "dark"
          ? "border-white/15 bg-white/8 text-white/70"
          : "border-[#142019]/10 bg-[#f3f5ef] text-[#142019]/52";

  return (
    <span
      className={[
        "inline-flex min-h-7 items-center border px-2.5 text-[0.67rem] font-semibold",
        toneClass,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function DefinitionRow({
  invert = false,
  label,
  value,
}: {
  invert?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-1 border-b border-current/10 pb-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4">
      <dt className={invert ? "text-xs text-white/38" : "text-xs text-[#142019]/40"}>
        {label}
      </dt>
      <dd
        className={[
          "text-sm leading-5 sm:text-right",
          invert ? "text-white/72" : "text-[#142019]/72",
        ].join(" ")}
      >
        {value}
      </dd>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r border-[#142019]/8 p-3 text-center last:border-r-0">
      <p className="text-[0.66rem] text-[#142019]/42">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function FunnelMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-b border-r border-[#142019]/8 p-4 last:border-r-0 sm:border-b-0">
      <p className="text-[0.66rem] text-[#142019]/42">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function ScoreBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden bg-[#142019]/8">
        <div
          className="h-full bg-[#14705a]"
          style={{ width: width + "%" }}
        />
      </div>
      <span className="w-10 text-right font-semibold tabular-nums">
        {formatScore(value)}
      </span>
    </div>
  );
}

function ConfidencePill({ confidence }: { confidence: ConfidenceLevel }) {
  return (
    <span
      className={[
        "inline-flex min-h-7 items-center border px-2.5 text-[0.66rem] font-semibold",
        confidence === "high"
          ? "border-[#14705a]/20 bg-[#e7f4ee] text-[#14705a]"
          : confidence === "medium"
            ? "border-[#c58a27]/22 bg-[#fff8e8] text-[#73521c]"
            : "border-[#142019]/10 bg-[#f3f5ef] text-[#142019]/45",
      ].join(" ")}
    >
      {confidenceLabels[confidence]}
    </span>
  );
}

function FitValue({
  max,
  value,
}: {
  max: number;
  value: number | null;
}) {
  if (value === null) {
    return (
      <span
        title="평가 정보 없음 — 개인 적합도 분모에서 제외"
        className="inline-flex min-w-10 justify-center border border-dashed border-[#142019]/16 px-1.5 py-1 text-[#142019]/36"
      >
        null
      </span>
    );
  }

  return (
    <span
      className={[
        "font-semibold",
        value / max >= 0.8
          ? "text-[#14705a]"
          : value / max < 0.5
            ? "text-[#a13d2d]"
            : "text-[#142019]/72",
      ].join(" ")}
    >
      {value}
    </span>
  );
}

function CardScore({
  accent = false,
  label,
  value,
}: {
  accent?: boolean;
  label: string;
  value: number;
}) {
  return (
    <div className="border-r border-[#142019]/8 px-2 text-center last:border-r-0">
      <p className="text-[0.62rem] text-[#142019]/40">{label}</p>
      <p
        className={[
          "mt-1 text-lg font-semibold tabular-nums",
          accent ? "text-[#14705a]" : "",
        ].join(" ")}
      >
        {formatScore(value)}
      </p>
    </div>
  );
}

function DarkMetric({
  accent = "neutral",
  label,
  value,
}: {
  accent?: "neutral" | "positive" | "negative";
  label: string;
  value: string;
}) {
  return (
    <div className="border-r border-white/10 p-4 last:border-r-0">
      <p className="text-[0.64rem] text-white/38">{label}</p>
      <p
        className={[
          "mt-2 text-[clamp(1.3rem,3vw,2rem)] font-semibold tabular-nums",
          accent === "positive"
            ? "text-[#71dfb8]"
            : accent === "negative"
              ? "text-[#ffc177]"
              : "text-white",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function EvaluationVerdict({ delta }: { delta: number | null }) {
  if (delta === null) {
    return (
      <p className="mt-5 border-l-2 border-white/20 pl-3 text-sm leading-6 text-white/52">
        비교에 필요한 정답 라벨 coverage가 부족합니다.
      </p>
    );
  }

  return (
    <p
      className={[
        "mt-5 border-l-2 pl-3 text-sm leading-6",
        delta >= 0
          ? "border-[#71dfb8] text-[#a6efd4]"
          : "border-[#ffc177] text-[#ffd5a4]",
      ].join(" ")}
    >
      {delta > 0
        ? "이 테스트 시나리오에서는 AI 혼합안의 순서 품질이 기준선보다 높습니다."
        : delta < 0
          ? "이 테스트 시나리오에서는 AI 혼합안이 기준선보다 낮습니다. 결과를 조정하지 않고 그대로 표시했습니다."
          : "이 테스트 시나리오에서는 두 방식의 순서 품질이 같습니다."}
    </p>
  );
}

function BenchmarkMetric({
  accent = false,
  label,
  tone = "neutral",
  value,
}: {
  accent?: boolean;
  label: string;
  tone?: "neutral" | "positive" | "negative";
  value: string;
}) {
  return (
    <div className="border-b border-r border-[#142019]/8 p-4 last:border-r-0 sm:border-b-0">
      <p className="text-[0.64rem] leading-4 text-[#142019]/42">{label}</p>
      <p
        className={[
          "mt-2 text-xl font-semibold tabular-nums",
          accent || tone === "positive"
            ? "text-[#14705a]"
            : tone === "negative"
              ? "text-[#a13d2d]"
              : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function TelemetryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-r border-[#142019]/8 p-4">
      <dt className="text-[0.64rem] text-[#142019]/42">{label}</dt>
      <dd className="mt-2 break-words text-sm font-semibold">{value}</dd>
    </div>
  );
}

function getFitFraction(scores: FitScores) {
  return fitDimensions.reduce(
    (total, dimension) => {
      const value = scores[dimension.key];
      if (value === null) {
        return total;
      }

      return {
        numerator: total.numerator + value,
        denominator: total.denominator + dimension.max,
      };
    },
    { numerator: 0, denominator: 0 },
  );
}

function buildEvidenceMap(result: AiCoachRunResult) {
  return new Map(result.evidenceCatalog.map((item) => [item.id, item]));
}

function goalRelationLabel(relation: GoalRelation) {
  if (relation === "direct") {
    return "목표 직접 일치";
  }
  if (relation === "strong") {
    return "목표 강한 연관";
  }
  if (relation === "indirect") {
    return "목표 간접 연관";
  }
  if (relation === "unrelated") {
    return "목표 거의 무관";
  }
  return "목표 정보 없음";
}

function fitGradeLabel(grade: FitGrade) {
  return grade === "high" ? "높음" : grade === "medium" ? "보통" : "낮음";
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "—";
  }

  return value.toFixed(0) + "%";
}

function formatScore(value: number) {
  return value.toFixed(1);
}

function formatMetric(value: number | null) {
  return value === null ? "—" : value.toFixed(3);
}

function formatDelta(value: number | null) {
  if (value === null) {
    return "—";
  }

  return (value > 0 ? "+" : "") + value.toFixed(3);
}

function formatTokenCount(value: number | null) {
  return value === null ? "기록 없음" : value.toLocaleString("ko-KR");
}

function formatCoverage(value: number) {
  return (value * 100).toFixed(0) + "%";
}

function formatApiSource(source: string) {
  if (source === "openai") {
    return "OpenAI";
  }
  if (source === "server_mock") {
    return "서버 모의 평가";
  }
  if (source === "fallback") {
    return "실시간 AI 응답 없음";
  }
  return source;
}

function formatApiStatus(status: string) {
  return status === "success"
    ? "성공"
    : status === "fallback"
      ? "실시간 응답 없음"
      : status;
}

function formatEvaluationSource(source: string) {
  return source === "live_ai"
    ? "실시간 AI 응답"
    : source === "simulated_ai_scenario"
      ? "정상 AI 응답 가정 시나리오"
      : source;
}

function isAiCoachRecommendResponse(
  value: unknown,
): value is AiCoachRecommendResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.fixtureId === "string" &&
    Array.isArray(candidate.finalRecommendations) &&
    Array.isArray(candidate.scoredCandidates) &&
    Array.isArray(candidate.ruleTop3) &&
    Array.isArray(candidate.mixedTop3) &&
    Array.isArray(candidate.pipelineSteps) &&
    typeof candidate.api === "object" &&
    candidate.api !== null &&
    typeof candidate.evaluation === "object" &&
    candidate.evaluation !== null &&
    typeof candidate.benchmark === "object" &&
    candidate.benchmark !== null
  );
}

function readApiError(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return "서버 요청에 실패했습니다.";
  }

  const payload = value as Record<string, unknown>;
  if (typeof payload.error === "string") {
    return payload.error;
  }

  if (typeof payload.error === "object" && payload.error !== null) {
    const error = payload.error as Record<string, unknown>;
    if (typeof error.message === "string") {
      return error.message;
    }
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  return "서버 요청에 실패했습니다.";
}
