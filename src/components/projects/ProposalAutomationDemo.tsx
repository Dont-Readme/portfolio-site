"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { proposalDemo, type DemoProjectCase } from "@/data/proposalDemo";

type DemoViewId = "projects" | "workspace" | "rfp" | "library" | "outline" | "draft";

const demoViews: Array<{
  id: DemoViewId;
  label: string;
  eyebrow: string;
}> = [
  { id: "projects", label: "프로젝트", eyebrow: "Dashboard" },
  { id: "workspace", label: "워크스페이스", eyebrow: "Project" },
  { id: "rfp", label: "RFP 추출", eyebrow: "Extraction" },
  { id: "library", label: "자료 라이브러리", eyebrow: "Assets" },
  { id: "outline", label: "목차 작성", eyebrow: "Outline" },
  { id: "draft", label: "초안 작성", eyebrow: "Draft" },
];

const defaultProjectId = proposalDemo.app.projectId;
const defaultCase =
  proposalDemo.cases.find((projectCase) => projectCase.projectId === defaultProjectId) ??
  proposalDemo.cases[0];
const initialConnectedAssetIdsByProject = Object.fromEntries(
  proposalDemo.cases.map((projectCase) => [
    projectCase.projectId,
    projectCase.assets.filter((asset) => asset.connected).map((asset) => asset.id),
  ]),
) as Record<number, string[]>;

export function ProposalAutomationDemo() {
  const [activeView, setActiveView] = useState<DemoViewId>("projects");
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId);
  const [connectedAssetIdsByProject, setConnectedAssetIdsByProject] = useState(
    initialConnectedAssetIdsByProject,
  );
  const [authorIntent, setAuthorIntent] = useState(
    "기관 담당자가 바로 검토할 수 있도록 구축 범위, 운영 안정성, 개인정보 보호 대책을 구체적으로 작성",
  );
  const [isGenerated, setIsGenerated] = useState(true);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  const activeViewMeta = demoViews.find((view) => view.id === activeView) ?? demoViews[0];
  const selectedProject =
    proposalDemo.projects.find((project) => project.id === selectedProjectId) ??
    proposalDemo.projects[0];
  const selectedCase =
    proposalDemo.cases.find((projectCase) => projectCase.projectId === selectedProjectId) ??
    defaultCase;
  const connectedAssetIds =
    connectedAssetIdsByProject[selectedProjectId] ??
    selectedCase.assets.filter((asset) => asset.connected).map((asset) => asset.id);
  const connectedAssets = useMemo(
    () => selectedCase.assets.filter((asset) => connectedAssetIds.includes(asset.id)),
    [connectedAssetIds, selectedCase.assets],
  );
  const coverageCount = useMemo(() => {
    const covered = new Set(
      selectedCase.outline.flatMap((section) => section.mappedRequirements),
    );
    return covered.size;
  }, [selectedCase.outline]);

  function openProject(projectId: number) {
    setSelectedProjectId(projectId);
    setActiveView("workspace");
    setIsGenerated(true);
  }

  function toggleAsset(assetId: string) {
    setConnectedAssetIdsByProject((current) => {
      const currentProjectAssetIds = current[selectedProjectId] ?? [];
      return {
        ...current,
        [selectedProjectId]: currentProjectAssetIds.includes(assetId)
          ? currentProjectAssetIds.filter((candidate) => candidate !== assetId)
          : [...currentProjectAssetIds, assetId],
      };
    });
  }

  return (
    <section className="min-h-screen bg-[#e9ece8] text-[#151713]">
      {showIntroModal ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/42 px-4 backdrop-blur-sm">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-[520px] border border-black/10 bg-white p-6 shadow-[0_30px_100px_rgba(0,0,0,0.24)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/38">
              Demo Notice
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight">
              실제 실행 결과 기반 데모 페이지입니다
            </h2>
            <p className="mt-4 text-sm leading-7 text-black/66">
              파일 업로드, AI 생성, AI Edit 등 기능은 동작하지 않는 실제 실행 결과를
              정리한 화면만 표시됩니다.
            </p>
            <button
              type="button"
              onClick={() => setShowIntroModal(false)}
              className="mt-6 min-h-11 w-full border border-black bg-black px-4 text-sm font-semibold text-white transition hover:bg-black/78"
            >
              확인
            </button>
          </motion.div>
        </div>
      ) : null}
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-14 pt-16 sm:px-6 lg:px-8">
        <div className="grid min-h-[calc(100vh-7.5rem)] border border-black/10 bg-[#f8f8f4] shadow-[0_30px_100px_rgba(15,20,15,0.12)] lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="border-b border-black/10 bg-[#10140f] text-white lg:border-b-0 lg:border-r">
            <div className="border-b border-white/10 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">
                {proposalDemo.app.mode}
              </p>
              <h1 className="mt-2 text-2xl font-semibold leading-none">
                {proposalDemo.app.name}
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/58">
                백엔드 없이 실제 실행 결과를 정리해 보여주는 포트폴리오 데모입니다.
              </p>
            </div>

            <nav className="grid gap-1 p-3" aria-label="RFP Copilot demo navigation">
              {demoViews.map((view) => {
                const isActive = view.id === activeView;
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setActiveView(view.id)}
                    className={[
                      "grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center border px-3 text-left transition",
                      isActive
                        ? "border-white/20 bg-white text-black"
                        : "border-transparent text-white/68 hover:border-white/10 hover:bg-white/[0.06] hover:text-white",
                    ].join(" ")}
                  >
                    <span>
                      <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] opacity-55">
                        {view.eyebrow}
                      </span>
                      <span className="mt-1 block text-sm font-semibold">{view.label}</span>
                    </span>
                    <span className="text-sm">{isActive ? "●" : "○"}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/36">
                Current project
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/82">
                {selectedProject.name}
              </p>
            </div>
          </aside>

          <div className="min-w-0">
            <header className="grid gap-5 border-b border-black/10 bg-white px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/38">
                  {activeViewMeta.eyebrow}
                </p>
                <h2 className="mt-1 text-[clamp(1.7rem,3vw,3rem)] font-semibold leading-[0.95]">
                  {activeViewMeta.label}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 text-sm font-semibold">
                <StatusBadge tone="dark">데모 버전</StatusBadge>
              </div>
            </header>

            <main className="p-4 sm:p-5 lg:p-7">
              <motion.div
                key={activeView}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                {activeView === "projects" ? (
                  <ProjectsView
                    onOpenWorkspace={openProject}
                    selectedProjectId={selectedProjectId}
                  />
                ) : null}
                {activeView === "workspace" ? (
                  <WorkspaceView
                    selectedCase={selectedCase}
                    selectedProject={selectedProject}
                    connectedAssets={connectedAssets.length}
                    coverageCount={coverageCount}
                    onOpenView={setActiveView}
                  />
                ) : null}
                {activeView === "rfp" ? <RfpView selectedCase={selectedCase} /> : null}
                {activeView === "library" ? (
                  <LibraryView
                    selectedCase={selectedCase}
                    connectedAssetIds={connectedAssetIds}
                    onToggleAsset={toggleAsset}
                  />
                ) : null}
                {activeView === "outline" ? <OutlineView selectedCase={selectedCase} /> : null}
                {activeView === "draft" ? (
                  <DraftView
                    selectedCase={selectedCase}
                    authorIntent={authorIntent}
                    isGenerated={isGenerated}
                    onGenerate={() => setIsGenerated(true)}
                    onIntentChange={setAuthorIntent}
                  />
                ) : null}
              </motion.div>
            </main>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectsView({
  onOpenWorkspace,
  selectedProjectId,
}: {
  onOpenWorkspace: (projectId: number) => void;
  selectedProjectId: number;
}) {
  return (
    <div className="grid gap-5">
      <section className="grid gap-5 border border-black/10 bg-white p-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/38">
            서비스 대시보드
          </p>
          <h3 className="mt-2 text-2xl font-semibold">프로젝트 목록</h3>
        </div>
        <div className="grid content-start gap-2">
          <MetricLine label="전체 프로젝트" value={`${proposalDemo.projects.length}개`} />
          <MetricLine label="기본 프로젝트" value={`#${proposalDemo.app.projectId}`} />
        </div>
      </section>

      <section className="overflow-hidden border border-black/10 bg-white">
        <TableHeader
          title="최근 프로젝트"
          action={<span className="text-sm font-semibold text-black/42">실행 결과</span>}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-[#f1f2ee] text-xs uppercase tracking-[0.12em] text-black/42">
              <tr>
                <th className="border-b border-black/10 px-4 py-3">ID</th>
                <th className="border-b border-black/10 px-4 py-3">프로젝트명</th>
                <th className="border-b border-black/10 px-4 py-3">상태</th>
                <th className="border-b border-black/10 px-4 py-3">단계</th>
                <th className="border-b border-black/10 px-4 py-3">수정일</th>
                <th className="border-b border-black/10 px-4 py-3">작업</th>
              </tr>
            </thead>
            <tbody>
              {proposalDemo.projects.map((project) => (
                <tr key={project.id} className="transition hover:bg-[#f8f8f4]">
                  <td className="border-b border-black/10 px-4 py-4 font-semibold text-black/54">
                    #{project.id}
                  </td>
                  <td className="border-b border-black/10 px-4 py-4 font-semibold">
                    {project.name}
                  </td>
                  <td className="border-b border-black/10 px-4 py-4 text-black/62">
                    {project.status}
                  </td>
                  <td className="border-b border-black/10 px-4 py-4">
                    <StatusBadge tone={project.id === selectedProjectId ? "green" : "gray"}>
                      {project.stage}
                    </StatusBadge>
                  </td>
                  <td className="border-b border-black/10 px-4 py-4 text-black/54">
                    {project.updatedAt}
                  </td>
                  <td className="border-b border-black/10 px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onOpenWorkspace(project.id)}
                      className="border border-black bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-black/78"
                    >
                      열기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function WorkspaceView({
  connectedAssets,
  coverageCount,
  onOpenView,
  selectedCase,
  selectedProject,
}: {
  connectedAssets: number;
  coverageCount: number;
  onOpenView: (view: DemoViewId) => void;
  selectedCase: DemoProjectCase;
  selectedProject: {
    id: number;
    name: string;
    status: string;
    updatedAt: string;
    owner: string;
    stage: string;
  };
}) {
  const stageCards: Array<{
    id: DemoViewId;
    title: string;
    description: string;
    metric: string;
  }> = [
    {
      id: "rfp",
      title: "RFP 추출",
      description: "공고 파일과 요구사항 정의서를 구조화하고 검토합니다.",
      metric: `요구사항 ${selectedCase.requirements.length}개`,
    },
    {
      id: "library",
      title: "자료 연결",
      description: "회사 소개, 수행 실적, 보안 자료를 프로젝트에 연결합니다.",
      metric: `연결 자료 ${connectedAssets}개`,
    },
    {
      id: "outline",
      title: "목차 작성",
      description: "제안서 목차와 요구사항 커버리지를 맞춥니다.",
      metric: `목차 ${selectedCase.outline.length}개`,
    },
    {
      id: "draft",
      title: "초안 작성",
      description: "준비 상태를 확인하고 실행 결과 초안을 검토합니다.",
      metric: `초안 ${selectedCase.draft.length}문단`,
    },
  ];

  return (
    <div className="grid gap-5">
      <section className="border border-black/10 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/38">
          프로젝트 워크스페이스
        </p>
        <h3 className="mt-2 text-2xl font-semibold">{selectedProject.name}</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="RFP 파일" value={`${selectedCase.files.length}개`} detail="분석 대상" />
          <MetricCard label="요구사항" value={`${selectedCase.requirements.length}개`} detail="확정" />
          <MetricCard label="연결 자료" value={`${connectedAssets}개`} detail="RAG 문맥" />
          <MetricCard
            label="커버리지"
            value={`${coverageCount}/${selectedCase.requirements.length}`}
            detail="목차 매핑"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {stageCards.map((stage) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => onOpenView(stage.id)}
            className="group min-h-40 border border-black/10 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-black hover:shadow-[0_22px_60px_rgba(15,20,15,0.08)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/38">
                  Workspace
                </p>
                <h4 className="mt-2 text-xl font-semibold">{stage.title}</h4>
              </div>
              <span className="text-lg transition group-hover:translate-x-1">→</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-black/62">{stage.description}</p>
            <p className="mt-4 text-sm font-semibold text-[#1f7a68]">{stage.metric}</p>
          </button>
        ))}
      </section>
    </div>
  );
}

function RfpView({ selectedCase }: { selectedCase: DemoProjectCase }) {
  return (
    <div className="grid gap-5">
      <section className="border border-black/10 bg-white">
        <TableHeader title="업로드 완료 파일" action={<StatusBadge tone="dark">업로드 비활성</StatusBadge>} />
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-[#f1f2ee] text-xs uppercase tracking-[0.12em] text-black/42">
              <tr>
                <th className="border-b border-black/10 px-4 py-3">파일</th>
                <th className="border-b border-black/10 px-4 py-3">유형</th>
                <th className="border-b border-black/10 px-4 py-3">범위</th>
                <th className="border-b border-black/10 px-4 py-3">크기</th>
                <th className="border-b border-black/10 px-4 py-3">상태</th>
              </tr>
            </thead>
            <tbody>
              {selectedCase.files.map((file) => (
                <tr key={file.id}>
                  <td className="border-b border-black/10 px-4 py-4">
                    <p className="font-semibold">{file.name}</p>
                    <p className="mt-1 text-xs text-black/42">{file.id}</p>
                  </td>
                  <td className="border-b border-black/10 px-4 py-4 text-black/62">{file.role}</td>
                  <td className="border-b border-black/10 px-4 py-4 text-black/62">
                    {file.sourceRange ?? file.pages}
                  </td>
                  <td className="border-b border-black/10 px-4 py-4 text-black/62">{file.size}</td>
                  <td className="border-b border-black/10 px-4 py-4">
                    <StatusBadge tone={file.status === "요구사항 소스" ? "green" : "gray"}>
                      {file.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.78fr)_minmax(20rem,0.22fr)]">
        <div className="border border-black/10 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/38">
            사업 개요
          </p>
          <h3 className="mt-2 text-xl font-semibold">{selectedCase.title}</h3>
          <p className="mt-4 text-sm leading-7 text-black/68">
            {selectedCase.sourceDocument.excerpt}
          </p>
        </div>
        <div className="border border-black/10 bg-[#10140f] p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/36">
            Extraction
          </p>
          <div className="mt-5 grid gap-4">
            <MetricLine label="기관" value={selectedCase.sourceDocument.organization} invert />
            <MetricLine label="분석 범위" value={selectedCase.sourceDocument.pages} invert />
            <MetricLine label="요구사항" value={`${selectedCase.requirements.length}개`} invert />
          </div>
        </div>
      </section>

      <section className="border border-black/10 bg-white">
        <TableHeader title="요구사항 검토" action={<StatusBadge tone="green">확정됨</StatusBadge>} />
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-[#f1f2ee] text-xs uppercase tracking-[0.12em] text-black/42">
              <tr>
                <th className="border-b border-black/10 px-4 py-3">번호</th>
                <th className="border-b border-black/10 px-4 py-3">명칭</th>
                <th className="border-b border-black/10 px-4 py-3">정의</th>
                <th className="border-b border-black/10 px-4 py-3">출처</th>
              </tr>
            </thead>
            <tbody>
              {selectedCase.requirements.map((requirement) => (
                <tr key={requirement.id}>
                  <td className="border-b border-black/10 px-4 py-4 font-semibold text-[#1f7a68]">
                    {requirement.id}
                  </td>
                  <td className="border-b border-black/10 px-4 py-4 font-semibold">
                    {requirement.title}
                  </td>
                  <td className="max-w-[34rem] border-b border-black/10 px-4 py-4 leading-6 text-black/62">
                    {requirement.summary}
                  </td>
                  <td className="border-b border-black/10 px-4 py-4 text-black/54">
                    {requirement.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function LibraryView({
  connectedAssetIds,
  onToggleAsset,
  selectedCase,
}: {
  connectedAssetIds: string[];
  onToggleAsset: (assetId: string) => void;
  selectedCase: DemoProjectCase;
}) {
  return (
    <div className="grid gap-5">
      <section className="border border-black/10 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/38">
          자료 라이브러리
        </p>
        <h3 className="mt-2 text-2xl font-semibold">프로젝트 연결 자료</h3>
      </section>

      <section className="grid gap-3">
        {selectedCase.assets.map((asset) => {
          const isConnected = connectedAssetIds.includes(asset.id);
          return (
            <article
              key={asset.id}
              className={[
                "grid gap-4 border bg-white p-5 md:grid-cols-[minmax(0,1fr)_10rem]",
                isConnected ? "border-[#1f7a68]/35" : "border-black/10",
              ].join(" ")}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={isConnected ? "green" : "gray"}>
                    {isConnected ? "연결됨" : "미연결"}
                  </StatusBadge>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-black/38">
                    {asset.category}
                  </span>
                </div>
                <h4 className="mt-3 text-lg font-semibold">{asset.name}</h4>
                <p className="mt-2 text-sm leading-6 text-black/62">{asset.summary}</p>
                <p className="mt-3 text-sm font-semibold text-black/45">chunk {asset.chunks}개</p>
              </div>
              <button
                type="button"
                onClick={() => onToggleAsset(asset.id)}
                className={[
                  "min-h-11 self-center border px-4 text-sm font-semibold transition",
                  isConnected
                    ? "border-black/14 text-black hover:border-black"
                    : "border-black bg-black text-white hover:bg-black/78",
                ].join(" ")}
              >
                {isConnected ? "연결 해제" : "연결"}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function OutlineView({ selectedCase }: { selectedCase: DemoProjectCase }) {
  return (
    <div className="grid gap-5">
      <section className="border border-black/10 bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/38">
              목차 작성
            </p>
            <h3 className="mt-2 text-2xl font-semibold">제안서 목차와 요구사항 커버리지</h3>
          </div>
          <StatusBadge tone="green">전체 요구사항 매핑</StatusBadge>
        </div>
      </section>

      <section className="border border-black/10 bg-white">
        <TableHeader title="목차 구조" action={<span className="text-sm font-semibold text-black/42">자동 번호</span>} />
        <div className="grid divide-y divide-black/10">
          {selectedCase.outline.map((section) => (
            <article key={section.id} className="grid gap-4 p-5 lg:grid-cols-[8rem_minmax(0,1fr)_minmax(16rem,0.38fr)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/38">
                  Section
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#1f7a68]">{section.id}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold">{section.title}</h4>
                <p className="mt-2 text-sm leading-6 text-black/62">{section.note}</p>
              </div>
              <div className="flex flex-wrap content-start gap-2">
                {section.mappedRequirements.map((requirementId) => (
                  <span
                    key={requirementId}
                    className="border border-[#1f7a68]/25 bg-[#e6f2ed] px-2.5 py-1 text-xs font-semibold text-[#1f7a68]"
                  >
                    {requirementId}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function DraftView({
  authorIntent,
  isGenerated,
  onGenerate,
  onIntentChange,
  selectedCase,
}: {
  authorIntent: string;
  isGenerated: boolean;
  onGenerate: () => void;
  onIntentChange: (value: string) => void;
  selectedCase: DemoProjectCase;
}) {
  const selectedText = selectedCase.edit.before;

  return (
    <div className="grid gap-5">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {selectedCase.readiness.map((item) => (
          <article key={item.label} className="border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-black/48">{item.label}</p>
              <StatusBadge tone={item.status === "ready" ? "green" : item.status === "sample" ? "dark" : "gray"}>
                {item.value}
              </StatusBadge>
            </div>
            <p className="mt-3 text-sm leading-6 text-black/62">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.64fr)_minmax(22rem,0.36fr)]">
        <div className="relative overflow-hidden border border-black/10 bg-white">
          <TableHeader
            title="초안 편집기"
            action={
              <button
                type="button"
                onClick={onGenerate}
                className="border border-black bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-black/78"
              >
                실행 결과 보기
              </button>
            }
          />
          <div className="grid gap-4 p-5">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-black/48">작성 의도</span>
              <textarea
                value={authorIntent}
                onChange={(event) => onIntentChange(event.target.value)}
                className="min-h-24 resize-y border border-black/14 bg-[#f8f8f4] p-3 text-sm leading-6 outline-none transition focus:border-black"
              />
            </label>

            {isGenerated ? (
              <div className="grid max-h-[50rem] gap-4 overflow-y-auto pr-1">
                {selectedCase.draft.map((section, index) => (
                  <article key={section.title} className="border border-black/10 bg-[#fbfbf7] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/38">
                      Draft {index + 1}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold">{section.title}</h4>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-black/68">
                      {section.body}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid min-h-64 place-items-center border border-dashed border-black/16 bg-[#fbfbf7] p-6 text-center text-sm font-semibold text-black/38">
                초안 생성 전입니다.
              </div>
            )}
          </div>
          <UnavailableOverlay title="데모 버전 샘플" />
        </div>

        <aside className="grid gap-5">
          <section className="relative overflow-hidden border border-black/10 bg-white p-5">
            <div className="opacity-35">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/38">
                AI Edit
              </p>
              <h3 className="mt-2 text-xl font-semibold">선택 문단 수정</h3>
              <p className="mt-3 max-h-56 overflow-y-auto border border-black/10 bg-[#f8f8f4] p-4 text-sm leading-7 text-black/68">
                {selectedText}
              </p>
              <button
                type="button"
                disabled
                className="mt-4 min-h-11 w-full cursor-not-allowed border border-black/20 bg-black/10 px-4 text-sm font-semibold text-black/36"
              >
                수정 제안 적용
              </button>
            </div>
            <UnavailableOverlay title="데모 버전 미제공" />
          </section>

          <section className="relative overflow-hidden border border-black/10 bg-white p-5">
            <div className="opacity-35">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/38">
                Chat
              </p>
              <div className="mt-4 grid gap-3">
                {proposalDemo.chat.map((turn, index) => (
                  <div
                    key={`${turn.role}-${index}`}
                    className={[
                      "border p-3 text-sm leading-6",
                      turn.role === "assistant"
                        ? "border-[#1f7a68]/25 bg-[#e6f2ed] text-black/72"
                        : "border-black/10 bg-[#f8f8f4] text-black/66",
                    ].join(" ")}
                  >
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/38">
                      {turn.role}
                    </p>
                    {turn.message}
                  </div>
                ))}
              </div>
            </div>
            <UnavailableOverlay title="데모 버전 미제공" />
          </section>
        </aside>
      </section>
    </div>
  );
}

function UnavailableOverlay({ title }: { title: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center bg-white/38 px-4 text-center backdrop-blur-[0.5px]">
      <div className="border border-black/10 bg-white/86 px-4 py-3 shadow-[0_18px_42px_rgba(15,20,15,0.08)]">
        <p className="text-sm font-semibold text-black">{title}</p>
        <p className="mt-1 text-xs leading-5 text-black/54">
          공개 데모에서는 실제 AI 호출 기능을 제한했습니다.
        </p>
      </div>
    </div>
  );
}

function TableHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {action}
    </div>
  );
}

function MetricCard({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) {
  return (
    <article className="border border-black/10 bg-[#f8f8f4] p-4">
      <p className="text-sm font-semibold text-black/48">{label}</p>
      <p className="mt-2 text-3xl font-semibold leading-none">{value}</p>
      <p className="mt-2 text-sm leading-5 text-black/54">{detail}</p>
    </article>
  );
}

function MetricLine({
  invert = false,
  label,
  value,
}: {
  invert?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-current/10 pb-2">
      <span className={invert ? "text-white/46" : "text-black/46"}>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function StatusBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "green" | "gray" | "dark";
}) {
  const className =
    tone === "green"
      ? "border-[#1f7a68]/25 bg-[#e6f2ed] text-[#1f7a68]"
      : tone === "dark"
        ? "border-black bg-black text-white"
        : "border-black/12 bg-[#f3f3ef] text-black/52";

  return (
    <span
      className={[
        "inline-flex min-h-7 items-center justify-center border px-2.5 text-xs font-semibold",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
