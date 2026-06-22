export type DemoStepId =
  | "rfp"
  | "requirements"
  | "outline"
  | "draft"
  | "edit"
  | "result";

export type DemoStep = {
  id: DemoStepId;
  label: string;
  action: string;
  runningLabel: string;
};

export type DemoRequirement = {
  id: string;
  title: string;
  priority: "상" | "중";
  source: string;
  summary: string;
};

export type DemoOutlineSection = {
  id: string;
  title: string;
  mappedRequirements: string[];
  note: string;
};

export type DemoDraftSection = {
  title: string;
  body: string;
};

export type DemoProject = {
  id: number;
  name: string;
  status: string;
  updatedAt: string;
  owner: string;
  stage: string;
};

export type DemoFile = {
  id: string;
  name: string;
  role: string;
  pages: string;
  size: string;
  status: string;
  sourceRange?: string;
};

export type DemoAsset = {
  id: string;
  name: string;
  category: string;
  summary: string;
  chunks: number;
  connected: boolean;
};

export type DemoReadiness = {
  label: string;
  status: "ready" | "review" | "sample";
  value: string;
  detail: string;
};

export type DemoProjectCase = {
  projectId: number;
  title: string;
  scenario: string;
  sourceDocument: {
    name: string;
    organization: string;
    pages: string;
    receivedAt: string;
    excerpt: string;
  };
  files: DemoFile[];
  assets: DemoAsset[];
  requirements: DemoRequirement[];
  outline: DemoOutlineSection[];
  draft: DemoDraftSection[];
  readiness: DemoReadiness[];
  edit: {
    before: string;
    after: string;
  };
};

export const proposalDemo = {
  title: "RFP Copilot 실행 결과 기반 데모",
  subtitle: "GitHub에 남아 있던 export, planner cache, upload artifact를 화면용 데이터로 재구성",
  scenario:
    "실제 RFP Copilot 프로젝트에서 생성된 RFP 요약, 초안, 목차 설계, 요구사항 매핑 결과를 백엔드 없이 포트폴리오 화면에서 탐색할 수 있도록 옮긴 데모입니다.",
  app: {
    name: "RFP Copilot",
    mode: "실행 결과",
    projectId: 101,
    projectName: "김제 혁신밸리 스마트팜 데이터 수집·분석 및 플랫폼 유지보수",
    updatedAt: "2026.03.12 15:27",
  },
  projects: [
    {
      id: 101,
      name: "김제 혁신밸리 스마트팜 데이터 수집·분석 및 플랫폼 유지보수",
      status: "Export preview 생성 완료",
      updatedAt: "2026.03.12",
      owner: "RFP_Copilot",
      stage: "Draft",
    },
    {
      id: 102,
      name: "2026 스마트시티 제안 대응",
      status: "짧은 export preview 생성 완료",
      updatedAt: "2026.03.12",
      owner: "RFP_Copilot",
      stage: "Review",
    },
    {
      id: 103,
      name: "스마트농업 데이터 수집 및 AI 기반 분석 플랫폼 구축",
      status: "Planner cache 생성 완료",
      updatedAt: "2026.03.12",
      owner: "RFP_Copilot",
      stage: "Planning",
    },
  ] satisfies DemoProject[],
  chat: [
    {
      role: "user",
      message: "시장 조사와 사업화 전략에 확인 필요가 뜬 이유를 설명해줘.",
    },
    {
      role: "assistant",
      message:
        "실행 결과 기준으로 RFP 요약에는 과업 범위와 사업비는 충분하지만 시장 규모, 경쟁사 현황, 수요 근거, 확산 계획은 명시되어 있지 않아 확인 필요 항목으로 남았습니다.",
    },
  ],
  cases: [
    {
      projectId: 101,
      title: "김제 혁신밸리 스마트팜 데이터 수집·분석 및 플랫폼 유지보수",
      scenario:
        "김제 혁신밸리 스마트팜의 농업 데이터를 수집·분석하고, AI 학습데이터 구축과 플랫폼 유지보수를 수행하는 RFP를 바탕으로 제안서 초안을 생성한 실행 결과입니다.",
      sourceDocument: {
        name: "project_3/3f8ca4d82d97/preview.md",
        organization: "전북특별자치도농업기술원",
        pages: "요구사항 15개",
        receivedAt: "2026.03.12",
        excerpt:
          "본 사업은 김제 혁신밸리 스마트팜 데이터 수집·분석 및 플랫폼 유지보수를 목적으로 하며, ICT 기반 디지털 농업을 통해 기후변화에 대응하고 전북 농업 현안 해결을 지원한다. 농업 빅데이터를 수집·분석하여 의사결정 지원 및 새로운 가치 창출을 목표로 한다. 주요 내용은 스마트팜 데이터 수집, 분석, 학습데이터 구축 및 플랫폼 유지보수로 구성된다. 사업비는 금394,100천원(부가세 포함)으로 기록되어 있다.",
      },
      files: [
        {
          id: "F-01",
          name: "김제 혁신밸리 스마트팜 데이터 수집·분석 및 플랫폼 유지보수 제안요청서.pdf",
          role: "제안요청서",
          pages: "공고/RFP 본문",
          size: "309.5 KB",
          status: "추출 포함",
          sourceRange: "data/uploads / 사업 개요·과업 범위",
        },
        {
          id: "F-02",
          name: "붙임2_스마트팜 데이터 수집·분석 과업 세부내역.pdf",
          role: "과업지시서",
          pages: "붙임 2",
          size: "466.3 KB",
          status: "요구사항 소스",
          sourceRange: "data/uploads / 데이터 수집·분석 세부 과업",
        },
        {
          id: "F-03",
          name: "붙임3_제안서 작성 및 제출·평가 유의사항.pdf",
          role: "제출/평가 안내",
          pages: "붙임 3",
          size: "388.2 KB",
          status: "참고 문서",
          sourceRange: "data/uploads / 제출 조건·성과품 기준",
        },
        {
          id: "F-04",
          name: "RFP_Copilot_스마트팜_초안_Export_Preview.md",
          role: "생성 결과 미리보기",
          pages: "Markdown export",
          size: "13.6 KB",
          status: "생성 결과",
          sourceRange: "data/exports/project_3/3f8ca4d82d97",
        },
      ],
      assets: [
        {
          id: "A-01",
          name: "스마트팜 데이터·AI 플랫폼 회사소개서_2025.pdf",
          category: "회사소개",
          summary: "스마트팜 관련 회사 소개 자료로 planner cache의 회사 역량·기술력 근거에 연결된 문서입니다.",
          chunks: 28,
          connected: true,
        },
        {
          id: "A-02",
          name: "스마트팜 요구사항·실적 정리표.xlsx",
          category: "정량 자료",
          summary: "요구사항, 산출물, 실적 또는 표 형태 근거로 활용 가능한 XLSX 업로드 artifact입니다.",
          chunks: 12,
          connected: true,
        },
        {
          id: "A-03",
          name: "project_4/prompt_traces/*.json",
          category: "Prompt trace",
          summary: "RFP Copilot이 목차와 작성 단위를 생성할 때 남긴 prompt trace 묶음입니다.",
          chunks: 20,
          connected: true,
        },
        {
          id: "A-04",
          name: "planner_cache/project_4.json",
          category: "Planner cache",
          summary: "요구사항 커버리지, section goal, generation unit이 저장된 실제 planner 결과입니다.",
          chunks: 22,
          connected: false,
        },
      ],
      requirements: [
        {
          id: "REQ-01",
          title: "과제진행 및 데이터 수급 체계 구축",
          priority: "상",
          source: "preview.md / 과업 범위",
          summary:
            "사업 목표와 과업 범위를 기준으로 농가, 온실, 작목별 데이터 수급 체계를 정의하고 정기 수집·검수·보고 흐름을 운영해야 한다.",
        },
        {
          id: "REQ-02",
          title: "작물 생육 및 농가 경영 데이터 수집",
          priority: "상",
          source: "preview.md / 과업 범위",
          summary:
            "20개 온실을 대상으로 작물 생육 데이터와 농가 경영 데이터를 수집하고 표준 항목 기준으로 DB화해야 한다.",
        },
        {
          id: "REQ-03",
          title: "미기후 및 근권 데이터 수집",
          priority: "상",
          source: "preview.md / 과업 범위",
          summary:
            "온실 환경, 미기후, 근권 센서 데이터를 수집하고 누락·이상 데이터에 대한 보완 체계를 운영해야 한다.",
        },
        {
          id: "REQ-04",
          title: "AI 학습용 이미지 데이터 구축",
          priority: "상",
          source: "preview.md / 과업 범위",
          summary:
            "작물 생육 시기별 이미지 데이터를 수집·검수·라벨링하고 AI 학습용 고품질 데이터베이스로 구축해야 한다.",
        },
        {
          id: "REQ-05",
          title: "데이터 전처리 및 상관·회귀 분석",
          priority: "중",
          source: "preview.md / 과업 범위",
          summary:
            "수집 데이터의 전처리, 변수 간 상관·회귀 분석, 기간별 요약 통계와 변화 추이 분석을 수행해야 한다.",
        },
        {
          id: "REQ-06",
          title: "IoT 데이터 품질관리 및 정규화",
          priority: "중",
          source: "preview.md / 과업 범위",
          summary:
            "IoT 센서 데이터의 품질관리, 정규화, 결측·이상 데이터 검정, 오류 제거 및 DB 반영 절차가 요구된다.",
        },
        {
          id: "REQ-07",
          title: "데이터 수집 정확도 향상",
          priority: "중",
          source: "preview.md / 과업 범위",
          summary:
            "조사원 교육, 농가 참여 독려, 데이터 입력 기준 정비를 통해 생육·환경·경영 데이터의 정확도와 지속성을 높여야 한다.",
        },
        {
          id: "REQ-08",
          title: "대시보드 분석용 데이터 정제 자동화",
          priority: "중",
          source: "planner cache / generation unit",
          summary:
            "수집 데이터가 대시보드 분석에 활용될 수 있도록 오류 제거, 보정, 정제 자동화 모듈 운영 방안을 제시해야 한다.",
        },
        {
          id: "REQ-09",
          title: "혁신밸리 운영시스템 유지보수",
          priority: "상",
          source: "preview.md / 수행 내용",
          summary:
            "혁신밸리 운영시스템과 데이터 통합관리시스템의 안정적 운영, 장애 대응, 기능 개선, 유지보수 체계를 제시해야 한다.",
        },
        {
          id: "REQ-10",
          title: "AI 전주기 자동화 통합 관리 시스템 운영",
          priority: "중",
          source: "planner cache / generation unit",
          summary:
            "AI 모델 학습, 평가, 배포, 운영 현황 관리를 하나의 흐름으로 관리할 수 있는 AI 전주기 운영 방안을 제안해야 한다.",
        },
        {
          id: "REQ-11",
          title: "Agriculture AI pool 고도화",
          priority: "중",
          source: "planner cache / generation unit",
          summary:
            "농업용 AI 모델과 분석 자산을 축적·관리하고 향후 작목과 서비스 확장에 대응할 수 있는 AI pool 운영 전략이 필요하다.",
        },
        {
          id: "REQ-12",
          title: "농가 대상 분석 결과 제공",
          priority: "중",
          source: "planner cache / generation unit",
          summary:
            "수집·분석 결과를 농가가 이해할 수 있는 대시보드, 보고서, 알림 형태로 제공하고 현장 의사결정에 활용되도록 해야 한다.",
        },
        {
          id: "REQ-13",
          title: "품질관리 및 보고 체계",
          priority: "중",
          source: "preview.md / 수행 내용",
          summary:
            "착수, 중간, 최종 보고와 정기 품질 점검을 통해 데이터와 시스템 산출물의 품질 보증 활동을 수행해야 한다.",
        },
        {
          id: "REQ-14",
          title: "성과품 작성 및 제출",
          priority: "중",
          source: "preview.md / 수행 내용",
          summary:
            "최종보고서, 데이터 산출물, 분석 결과, 시스템 유지보수 내역 등 계약상 성과품을 정해진 형식으로 작성·제출해야 한다.",
        },
        {
          id: "REQ-15",
          title: "보안 및 작업장소 관리",
          priority: "중",
          source: "planner cache / 보안 요구사항",
          summary:
            "작업장소, 접근 권한, 데이터 반출입, 로그 관리, 개인정보 보호 등 공공 데이터 처리에 필요한 보안 관리 방안을 제시해야 한다.",
        },
      ] satisfies DemoRequirement[],
      outline: [
        {
          id: "1",
          title: "배경 및 필요성",
          mappedRequirements: ["REQ-01", "REQ-02", "REQ-03"],
          note: "기후변화 대응, 전북 농업 현안 해결, ICT 기반 디지털 농업 도입 필요성을 제안서 도입부로 구성합니다.",
        },
        {
          id: "2",
          title: "시장 조사",
          mappedRequirements: ["REQ-02", "REQ-04", "REQ-07", "REQ-12"],
          note: "스마트팜 데이터 수집·분석 수요와 관련 기술 발전 흐름을 정리하되, export 결과에서는 추가 시장 근거가 확인 필요로 남았습니다.",
        },
        {
          id: "3",
          title: "수행 내용",
          mappedRequirements: [
            "REQ-01",
            "REQ-02",
            "REQ-03",
            "REQ-04",
            "REQ-05",
            "REQ-06",
            "REQ-07",
            "REQ-08",
            "REQ-09",
            "REQ-10",
            "REQ-11",
            "REQ-12",
          ],
          note: "데이터 수집, 품질관리, AI 학습데이터 구축, 플랫폼 유지보수, 보고 체계를 하나의 실행 흐름으로 묶습니다.",
        },
        {
          id: "4",
          title: "사업화 전략",
          mappedRequirements: ["REQ-04", "REQ-08", "REQ-10", "REQ-11", "REQ-12"],
          note: "농업 빅데이터 분석, AI 학습데이터 활용, 플랫폼 서비스 확산 전략을 작성하되 확산·수익화 근거는 보강 필요로 표시되었습니다.",
        },
        {
          id: "5",
          title: "기대 효과",
          mappedRequirements: ["REQ-09", "REQ-13", "REQ-14", "REQ-15"],
          note: "데이터 수집·분석 역량 강화, 디지털 농업 활성화, 농가 생산성 향상, 안정적 플랫폼 운영 효과를 제시합니다.",
        },
      ] satisfies DemoOutlineSection[],
      draft: [
        {
          title: "배경 및 필요성",
          body:
            "김제 혁신밸리 스마트팜은 청년농, 실증 온실, 데이터 통합관리 환경이 함께 운영되는 지역 농업 디지털 전환의 핵심 거점입니다. 그러나 농가별 생육·환경·경영 데이터가 수집 주기와 관리 기준에 따라 분산되어 있어, 현장 의사결정에 바로 활용 가능한 분석 데이터로 전환하기 위해서는 수집 체계, 품질관리, 분석 모델, 플랫폼 운영을 하나의 사업 흐름으로 정비할 필요가 있습니다.\n\n본 제안은 스마트팜 현장에서 발생하는 미기후, 근권, 작물 생육, 농가 경영 데이터를 표준화된 기준으로 수집하고, 데이터 전처리와 상관·회귀 분석을 통해 농업 현안 해결에 필요한 근거를 확보하는 것을 목표로 합니다. 특히 기후변화로 인한 작물 생육 변동성과 농가 경영 리스크에 대응하기 위해, 데이터 기반 예측과 의사결정 지원 체계를 구축하는 방향으로 사업 필요성을 제시합니다.",
        },
        {
          title: "사업 배경",
          body:
            "전북특별자치도농업기술원은 스마트팜 혁신밸리를 기반으로 농업 빅데이터를 축적하고 있으나, 데이터가 실제 농가 지원 서비스와 AI 학습데이터로 이어지기 위해서는 수집 정확도, 정제 자동화, 품질 검증, 분석 결과 제공 체계가 함께 확보되어야 합니다. 본 사업은 20개 온실을 대상으로 생육·환경·근권·경영 데이터를 수집하고, 농가 등록 및 회원 정보 관리, 데이터 수급 체계 구축, 조사원 관리, 데이터 보완 절차를 포함한 운영 기반을 마련합니다.\n\n또한 데이터 통합관리시스템과 대시보드 분석용 정제 모듈을 안정적으로 유지보수하여, 단순한 데이터 축적을 넘어 농가가 이해할 수 있는 분석 결과와 예측 모델을 제공하는 방향으로 플랫폼 활용도를 높입니다. 이 과정에서 AI 학습용 이미지 데이터 라벨링과 Agriculture AI pool 고도화를 병행해 향후 작목 확대와 서비스 확장에 대응할 수 있는 기반을 구축합니다.",
        },
        {
          title: "수행 내용",
          body:
            "수행 내용은 데이터 수집, 데이터 품질관리, AI 학습데이터 구축, 분석 모델 운영, 플랫폼 유지보수의 다섯 축으로 구성합니다. 먼저 조사 대상 농가와 작목을 선정하고, 생육조사 항목과 경영 데이터 항목을 표준화하여 정기 수집 체계를 운영합니다. 온실 내 미기후·근권 센서 데이터는 수집 주기, 결측 기준, 이상치 판정 규칙을 정의해 DB에 적재하며, 비정상 데이터 발생 시 원인 확인과 보완 조치를 수행합니다.\n\n수집된 데이터는 전처리, 정규화, 변수 간 상관분석, 회귀 분석을 거쳐 농가별·작목별 의사결정에 활용 가능한 지표로 전환합니다. 작물 생육 이미지 데이터는 수집, 검수, 라벨링, 품질 확인, DB 반영의 절차로 관리하고, AI 예측 모델과 Agriculture AI pool 운영에 활용합니다. 플랫폼 유지보수 영역에서는 혁신밸리 운영시스템, 데이터 통합관리시스템, 대시보드 정제 모듈의 장애 대응, 기능 개선, 로그 관리, 사용자 권한 관리를 수행합니다.",
        },
        {
          title: "운영 및 품질관리 방안",
          body:
            "사업 수행 기간 동안 데이터 품질과 시스템 안정성을 동시에 관리하기 위해 월간 데이터 품질 점검, 센서 이상 데이터 검정, 정제 모듈 반영 내역 점검, 분석 결과 검수 절차를 운영합니다. 데이터 수집 정확도 향상을 위해 조사원 교육과 농가 참여 안내를 정례화하고, 생육조사 작물보상 및 참여 유도 이벤트를 통해 현장 데이터 수급의 지속성을 확보합니다.\n\n보안 측면에서는 작업장소, 계정 권한, 데이터 반출입, 로그 보관, 개인정보 처리 기준을 분리해 관리합니다. 공공기관 데이터 처리 특성을 고려하여 원본 데이터 접근 권한을 최소화하고, 분석·보고 산출물은 검토 이력을 남겨 추후 감사와 검수에 대응할 수 있도록 합니다.",
        },
        {
          title: "사업화 전략",
          body:
            "본 사업의 사업화 전략은 김제 혁신밸리에서 축적되는 농업 데이터를 단기 유지보수 대상으로만 보지 않고, 향후 농가 지원 서비스와 농업 AI 모델 개발을 위한 데이터 자산으로 전환하는 데 초점을 둡니다. 수집·정제·분석·제공의 흐름을 표준화하면 작목별 생육 예측, 이상 환경 탐지, 농가 경영 개선, 데이터 기반 컨설팅으로 확장할 수 있습니다.\n\n또한 AI 학습용 이미지 데이터와 환경·생육 데이터를 연계해 Agriculture AI pool을 고도화하면, 향후 작목 확대와 서비스 고도화 시 추가 개발 비용을 줄이고 기존 데이터 자산의 재사용성을 높일 수 있습니다. 제안사는 플랫폼 운영 안정성, 데이터 품질관리 경험, AI 학습데이터 구축 역량을 근거로 사업 수행의 신뢰성을 확보합니다.",
        },
        {
          title: "기대 효과",
          body:
            "본 사업을 통해 김제 혁신밸리 스마트팜의 데이터 수집·분석 역량이 강화되고, 농가가 체감할 수 있는 데이터 기반 의사결정 지원 체계가 마련됩니다. 정제된 생육·환경·경영 데이터는 예측 모델 개발과 농가 맞춤형 분석 서비스의 기반이 되며, 데이터 품질관리 체계는 장기적으로 플랫폼 운영 안정성과 분석 신뢰도를 높입니다.\n\n최종적으로 본 사업은 전북 농업의 디지털 전환 기반을 공고히 하고, 기후변화 대응, 농업 생산성 향상, 스마트팜 기술 확산에 기여할 것입니다. 성과품은 데이터 산출물, 분석 결과, 유지보수 이력, 보고서 형태로 체계화하여 발주기관의 검수와 후속 사업 확장에 활용할 수 있도록 제출합니다.",
        },
      ] satisfies DemoDraftSection[],
      readiness: [
        {
          label: "RFP 추출",
          status: "ready",
          value: "완료",
          detail: "Export preview에 사업 개요, 과업 범위, 사업비, 제출 기간이 생성되어 있습니다.",
        },
        {
          label: "요구사항",
          status: "ready",
          value: "15개",
          detail: "원본 결과의 요구사항 수와 맞춰 화면에도 15개 요구사항을 표시했습니다.",
        },
        {
          label: "작성 확인",
          status: "review",
          value: "16개",
          detail: "시장 규모, 경쟁사 현황, 농가 수요, 추진 일정 등 추가 확인 질문이 남아 있습니다.",
        },
        {
          label: "생성 모드",
          status: "sample",
          value: "실행 결과",
          detail: "GitHub export preview에 남아 있던 실제 생성 결과를 화면용으로 옮겼습니다.",
        },
      ] satisfies DemoReadiness[],
      edit: {
        before:
          "본 사업은 김제 혁신밸리 내 스마트팜의 데이터 수집 및 분석, 그리고 플랫폼 유지보수를 통해 ICT 기반의 디지털 농업을 구현하는 것을 목적으로 한다. 기후변화에 따른 농업 환경 변화에 대응하고, 전북 지역 농업 현안 해결을 지원하기 위해 농업 빅데이터를 체계적으로 수집·분석하여 의사결정 지원과 새로운 가치 창출을 도모한다.",
        after:
          "본 사업은 김제 혁신밸리 내 스마트팜 데이터를 체계적으로 수집·분석하고 플랫폼을 안정적으로 유지보수하여 ICT 기반 디지털 농업 운영 체계를 고도화하는 것을 목적으로 합니다. 특히 기후변화 대응과 전북 농업 현안 해결이라는 정책 목표에 맞춰 농업 빅데이터 기반 의사결정 지원, AI 학습데이터 구축, 예측 모델 활용 기반을 함께 제시합니다.",
      },
    },
    {
      projectId: 102,
      title: "2026 스마트시티 제안 대응",
      scenario:
        "공공 정보화 사업 수행 경험을 요구하는 스마트시티 제안 대응 실행 결과입니다. 실제 export preview에는 지원자격, 제출서류, 평가개요, 짧은 초안과 확인 질문이 남아 있습니다.",
      sourceDocument: {
        name: "project_1/bd7cb337204f/preview.md",
        organization: "스마트시티 제안 대응",
        pages: "제안서 30페이지 이내",
        receivedAt: "2026.03.12",
        excerpt:
          "지원자격은 공공 정보화 사업 수행 경험이 있는 사업자이며, 제출서류는 제안서, 수행실적증명서, 재무제표로 기록되어 있다. 제안서는 30페이지 이내 PDF 제출 형식이며, 평가항목은 제안 개요 적합성, 수행 전략 구체성, 근거 자료 충실성으로 구성되어 있다.",
      },
      files: [
        {
          id: "F-11",
          name: "스마트시티 제안요청 공고문.txt",
          role: "공고문",
          pages: "텍스트 공고",
          size: "0.2 KB",
          status: "추출 포함",
          sourceRange: "data/uploads / 지원자격·제출서류",
        },
        {
          id: "F-12",
          name: "스마트시티 평가항목 요약.txt",
          role: "평가요약",
          pages: "텍스트 요약",
          size: "0.4 KB",
          status: "참고 문서",
          sourceRange: "data/uploads / 평가개요",
        },
        {
          id: "F-13",
          name: "스마트시티 RFP 요구사항 요약.txt",
          role: "요구사항 요약",
          pages: "텍스트 요약",
          size: "0.7 KB",
          status: "요구사항 소스",
          sourceRange: "data/uploads / 요약 요구사항",
        },
      ],
      assets: [
        {
          id: "B-01",
          name: "공공 정보화 수행 역량 회사소개서_2025.pdf",
          category: "회사소개",
          summary: "수행실적과 회사 역량 근거를 연결하기 위해 업로드된 회사소개서 artifact입니다.",
          chunks: 18,
          connected: true,
        },
        {
          id: "B-02",
          name: "test_asset.csv",
          category: "CSV",
          summary: "데모 실행 중 자료 라이브러리 연결 상태를 확인하기 위해 포함된 CSV artifact입니다.",
          chunks: 3,
          connected: true,
        },
        {
          id: "B-03",
          name: "project_1/bd7cb337204f/preview.md",
          category: "Export preview",
          summary: "스마트시티 제안 대응의 짧은 초안과 open question이 저장된 결과 파일입니다.",
          chunks: 5,
          connected: false,
        },
      ],
      requirements: [
        {
          id: "REQ-01",
          title: "공공 정보화 사업 수행 경험",
          priority: "상",
          source: "preview.md / 지원자격",
          summary:
            "지원자격은 공공 정보화 사업 수행 경험이 있는 사업자로 기록되어 있어 수행실적과 유사 레퍼런스 연결이 필요하다.",
        },
        {
          id: "REQ-02",
          title: "제안서 및 증빙 서류 제출",
          priority: "상",
          source: "preview.md / 제출서류",
          summary:
            "제안서, 수행실적증명서, 재무제표를 제출해야 하며 제안서는 30페이지 이내 PDF 형식으로 제출해야 한다.",
        },
        {
          id: "REQ-03",
          title: "평가항목 직접 대응",
          priority: "중",
          source: "preview.md / 평가개요",
          summary:
            "제안 개요 적합성, 수행 전략 구체성, 근거 자료 충실성에 맞춰 제안 개요와 수행 전략 문장을 보강해야 한다.",
        },
      ] satisfies DemoRequirement[],
      outline: [
        {
          id: "1",
          title: "제안 개요",
          mappedRequirements: ["REQ-01", "REQ-03"],
          note: "프로젝트의 제안 방향과 목표를 정리하고, 공공 정보화 수행 경험과 제안 적합성을 연결합니다.",
        },
        {
          id: "2",
          title: "수행 전략",
          mappedRequirements: ["REQ-01", "REQ-02", "REQ-03"],
          note: "평가항목과 직접 대응하는 수행 방안, 보유 인력, 일정 계획, 근거 자료를 연결합니다.",
        },
      ] satisfies DemoOutlineSection[],
      draft: [
        {
          title: "제안 개요",
          body:
            "본 제안은 공공 정보화 사업 수행 경험을 기반으로 스마트시티 운영 환경의 데이터 연계, 관제 화면 개선, 운영 안정성 강화를 목표로 합니다. 발주기관의 평가항목 중 제안 개요 적합성에 대응하기 위해, 기존 도시 운영 데이터의 분산 관리 문제를 통합 관제와 실행 가능한 업무 흐름으로 전환하는 방향을 제시합니다.\n\n제안 범위는 현황 진단, 요구사항 정리, 데이터 연계 구조 설계, 화면 구성 개선, 운영·유지관리 체계 수립으로 구성합니다. 특히 제안서는 30페이지 이내 PDF 제출 조건을 고려하여 핵심 메시지를 사업 이해, 수행 전략, 근거 자료 중심으로 압축하고, 수행실적증명서와 재무제표 등 제출서류와 본문 근거가 서로 연결되도록 구성합니다.",
        },
        {
          title: "수행 전략",
          body:
            "수행 전략은 평가항목과 직접 대응하는 구조로 작성합니다. 제안 개요 적합성에는 사업 목적과 현장 문제 정의를 배치하고, 수행 전략 구체성에는 단계별 추진 일정, 역할 분담, 산출물 기준, 위험 대응 방안을 배치합니다. 근거 자료 충실성에는 공공 정보화 수행 경험, 유사 사업 실적, 투입 인력의 전문성, 품질관리 체계를 연결합니다.\n\n실행 단계에서는 착수 후 요구사항 검토와 현황 분석을 먼저 수행하고, 이후 화면·데이터 연계 설계, 구현 및 검증, 운영자 교육, 안정화 지원 순서로 진행합니다. export preview에는 실적 수치와 최신 레퍼런스 확인, 평가항목 2에 대응하는 KPI 문장 보강이 open question으로 남아 있어, 공개 데모에서는 해당 항목을 검토 필요 상태로 보여줍니다.",
        },
        {
          title: "평가 대응 포인트",
          body:
            "평가 대응은 문장 단위로 근거를 연결하는 방식이 적합합니다. 예를 들어 수행 전략 구체성 항목에는 '착수 2주 이내 현황 진단 완료', '요구사항별 산출물 매핑표 작성', '운영자 검수 전 시나리오 기반 테스트 수행'과 같은 실행 문장을 배치하고, 근거 자료 충실성 항목에는 수행실적증명서, 유사 프로젝트 산출물, 보유 인력 프로필을 연결합니다.\n\n이 방식은 제안서가 단순 소개 문서로 보이지 않게 하고, 채용 담당자가 데모를 볼 때 RFP Copilot이 평가항목과 제안서 문장을 연결해주는 도구였다는 점을 더 명확히 보여줍니다.",
        },
      ] satisfies DemoDraftSection[],
      readiness: [
        {
          label: "RFP 추출",
          status: "ready",
          value: "완료",
          detail: "지원자격, 제출서류, 분량 및 서식, 평가개요가 추출되어 있습니다.",
        },
        {
          label: "요구사항",
          status: "ready",
          value: "3개",
          detail: "공공 정보화 실적, 제출서류, 평가항목 대응 중심으로 정리했습니다.",
        },
        {
          label: "작성 확인",
          status: "review",
          value: "2개",
          detail: "실적 수치와 평가항목 2 KPI 문장 보강 질문이 남아 있습니다.",
        },
        {
          label: "생성 모드",
          status: "sample",
          value: "실행 결과",
          detail: "project_1 export preview의 짧은 생성물을 화면용 데이터로 옮겼습니다.",
        },
      ] satisfies DemoReadiness[],
      edit: {
        before:
          "평가항목과 직접 대응하는 수행 방안을 정리합니다. 보유 인력과 일정 계획의 근거를 연결합니다.",
        after:
          "평가항목별로 제안 개요 적합성, 수행 전략 구체성, 근거 자료 충실성을 분리해 대응하고, 각 항목마다 보유 인력·일정 계획·수행실적증명서의 근거를 연결합니다. 평가항목 2에 대해서는 정량 KPI 문장을 추가해 검토자가 수행 전략의 실행 가능성을 바로 확인할 수 있도록 보강합니다.",
      },
    },
    {
      projectId: 103,
      title: "스마트농업 데이터 수집 및 AI 기반 분석 플랫폼 구축",
      scenario:
        "RFP Copilot의 planner cache에 저장된 실제 목차 설계와 요구사항 커버리지 결과입니다. 생성 초안 이전 단계에서 어떤 section과 generation unit으로 나누어 작성할지 설계한 흔적을 보여줍니다.",
      sourceDocument: {
        name: "planner_cache/project_4.json",
        organization: "자사 스마트농업 제안 대응",
        pages: "요구사항 22개",
        receivedAt: "2026.03.12",
        excerpt:
          "본 제안서는 스마트농업 데이터 수집 및 AI 기반 분석 플랫폼 구축 사업으로, 정책 배경과 사업 필요성을 명확히 제시하고, 회사 역량과 특허 기술력을 근거로 신뢰성을 확보해야 합니다. 특히 데이터 수집부터 AI 분석, 시스템 운영 및 유지보수에 이르는 구체적 실행 계획과 추진 전략을 상세히 기술하여 요구사항을 충실히 반영하는 것이 중요합니다.",
      },
      files: [
        {
          id: "F-21",
          name: "planner_cache/project_4.json",
          role: "Planner cache",
          pages: "JSON",
          size: "실행 캐시",
          status: "생성 결과",
          sourceRange: "sections / requirement_coverage / generation_units",
        },
        {
          id: "F-22",
          name: "스마트팜 데이터·AI 플랫폼 소개서_2025.pdf",
          role: "스마트팜 역량 자료",
          pages: "회사소개 PDF",
          size: "40.9 MB",
          status: "참고 문서",
          sourceRange: "data/uploads / 스마트팜 수행 역량",
        },
        {
          id: "F-23",
          name: "AI·빅데이터 사업 수행 회사소개서_2025.pdf",
          role: "회사소개서",
          pages: "회사소개 PDF",
          size: "41.1 MB",
          status: "참고 문서",
          sourceRange: "data/uploads / 회사 소개·기술력",
        },
        {
          id: "F-24",
          name: "AI·빅데이터 지식재산권 및 저작권 현황.xlsx",
          role: "지식재산권 현황",
          pages: "XLSX 표",
          size: "9.2 KB",
          status: "요구사항 소스",
          sourceRange: "data/uploads / 지식재산권 보호",
        },
      ],
      assets: [
        {
          id: "C-01",
          name: "2026 회사소개서_최종본",
          category: "회사소개",
          summary: "planner cache의 회사 소개, 사업 수행 내용, 추진 전략 generation unit에 연결된 회사소개 자료입니다.",
          chunks: 24,
          connected: true,
        },
        {
          id: "C-02",
          name: "저작권",
          category: "지식재산권",
          summary:
            "패션 트랜드 분석, 빅데이터 위험도 판정, 핵심어사전 구축, 학교안전도 측정 등 프로그램 저작권 정보가 planner cache에 연결되어 있습니다.",
          chunks: 18,
          connected: true,
        },
        {
          id: "C-03",
          name: "스마트팜 데이터·AI 플랫폼 소개서_2025.pdf",
          category: "스마트팜",
          summary: "스마트팜 데이터 수집·분석 및 AI 기반 플랫폼 역량을 설명하는 근거 자료입니다.",
          chunks: 26,
          connected: true,
        },
        {
          id: "C-04",
          name: "prompt_traces/20260312T0614~0620*.json",
          category: "Debug trace",
          summary: "planner가 section goal, coverage, generation unit을 생성한 실행 trace 묶음입니다.",
          chunks: 20,
          connected: false,
        },
      ],
      requirements: [
        {
          id: "REQ-01",
          title: "과제진행 및 데이터 수급 체계 구축",
          priority: "상",
          source: "requirement_coverage[1]",
          summary:
            "과제진행 체계와 데이터 수급 체계 구축에 관한 구체적 실행 계획을 단일 작성 단위에서 상세히 다루는 것이 적합하다고 판단되었습니다.",
        },
        {
          id: "REQ-02",
          title: "작물 생육 및 농가 경영 데이터 수집",
          priority: "상",
          source: "generation_units / unit_2",
          summary:
            "조사 농가 및 작목 선정, 생육·경영 데이터 수집 항목, 조사 계획, 조사요원 관리, 데이터 저장 및 관리 방안을 상세히 설명하도록 설계되었습니다.",
        },
        {
          id: "REQ-03",
          title: "미기후 및 근권 데이터 수집",
          priority: "상",
          source: "generation_units / unit_3",
          summary:
            "온실 내 센서 데이터 수집 항목, 추가 정보 산출 방법, 데이터 점검 및 보완 체계, 보완 시스템 운영 결과를 작성하도록 분리되었습니다.",
        },
        {
          id: "REQ-04",
          title: "AI 학습용 이미지 데이터 구축",
          priority: "상",
          source: "generation_units / unit_4",
          summary:
            "작물별 생장 이미지 데이터 수집·검수, 라벨링 방법론, 품질 관리, 라벨링 결과 활용 및 모델 검증 방안을 포함합니다.",
        },
        {
          id: "REQ-05",
          title: "데이터 분석 실행 계획",
          priority: "중",
          source: "generation_units / execution_data_analysis_5",
          summary:
            "비정상 데이터 판정 및 보정, 데이터 간 상관관계 분석, 작물 생장 변수 도출 및 활용 방안을 작성하도록 계획되었습니다.",
        },
        {
          id: "REQ-06",
          title: "데이터 품질관리 체계",
          priority: "중",
          source: "generation_units / execution_data_quality_management_6",
          summary:
            "주기적 센서 점검, 이상 및 결측 데이터 검정, 이상 발생 시 보고 및 조치 방안을 상세히 기술하도록 설계되었습니다.",
        },
        {
          id: "REQ-07",
          title: "생육조사 작물보상 및 농가 참여 이벤트",
          priority: "중",
          source: "generation_units / execution_farm_participation_incentive_7",
          summary:
            "작물보상 기준 및 지급 방식, 농가 참여 유도 이벤트 종류와 운영 방법, 산출물 작성 계획을 설명하도록 분리되었습니다.",
        },
        {
          id: "REQ-08",
          title: "대시보드 데이터 정제 자동화",
          priority: "중",
          source: "generation_units / execution_dashboard_data_cleaning_8",
          summary:
            "결측·이상 데이터 검정, 데이터 품질 관리 및 DB 반영, 실시간 품질 모니터링 체계를 중심으로 작성하도록 계획되었습니다.",
        },
        {
          id: "REQ-09",
          title: "혁신밸리 운영시스템 유지보수",
          priority: "상",
          source: "requirement_coverage[9]",
          summary:
            "혁신밸리 운영시스템 유지보수와 데이터 관리 시스템 운영에 관한 실행 내용을 기능 및 업무 흐름 중심으로 작성하도록 배치되었습니다.",
        },
        {
          id: "REQ-10",
          title: "AI 전주기 자동화 통합 관리 시스템 운영",
          priority: "상",
          source: "generation_units / execution_10_ai_automation_system_operation",
          summary:
            "웹 기반 노코드 AI 모델 관리, 학습·평가·배포 통합 운영, 계정별 기능 차등 제공, 인프라 자동 구성 방안을 포함합니다.",
        },
        {
          id: "REQ-11",
          title: "Agriculture AI pool 확대 및 운영",
          priority: "중",
          source: "generation_units / execution_11_agriculture_ai_pool_expansion",
          summary:
            "농업 AI 모델 풀의 확장, 모델 관리, 재사용 체계, 작목별 분석 서비스 확장 전략을 작성 단위로 분리했습니다.",
        },
        {
          id: "REQ-12",
          title: "농가 대상 데이터 분석 서비스",
          priority: "중",
          source: "generation_units / execution_data_analysis_farm_service",
          summary:
            "데이터 분석 결과를 농가에 제공하는 구체적 실행 내용으로 대시보드 구성, 분석 주기, 작목별 항목 개발을 다룹니다.",
        },
        {
          id: "REQ-13",
          title: "품질관리 및 보증활동",
          priority: "중",
          source: "generation_units / quality_management_1",
          summary:
            "품질관리 일반사항 요구사항에 따라 품질 보증활동 수행 계획과 산출물 품질 유지 방안을 구체적으로 기술합니다.",
        },
        {
          id: "REQ-14",
          title: "계약 변경 및 제약사항 관리",
          priority: "중",
          source: "generation_units / contract_management_1",
          summary:
            "계약 변경, 해지, 제약사항 관련 요구사항을 계약 관리 및 리스크 대응 관점에서 정리하도록 계획되었습니다.",
        },
        {
          id: "REQ-15",
          title: "작업장소 및 보안 관리",
          priority: "중",
          source: "generation_units / workplace_management_1",
          summary:
            "작업장소 협의, 보안 요구사항, 데이터 접근 통제, 현장 작업 기준을 구체적으로 설명하도록 작성 단위가 생성되었습니다.",
        },
        {
          id: "REQ-16",
          title: "보안·개인정보 보호 운영",
          priority: "상",
          source: "generation_units / security_privacy_001",
          summary:
            "사업 수행 시 준수해야 하는 법적·관리적 보안 의무를 보안 및 개인정보 보호 운영 관점의 단일 생성 단위로 작성하도록 설계되었습니다.",
        },
        {
          id: "REQ-17",
          title: "지식재산권 보호",
          priority: "중",
          source: "generation_units / unit_17_ip_protection",
          summary:
            "보유 특허와 저작권을 제안서의 기술력 근거로 연결하되, 계약상 지식재산권 보호와 책임 범위를 별도 운영 항목으로 다룹니다.",
        },
        {
          id: "REQ-18",
          title: "사업 일정 관리",
          priority: "중",
          source: "generation_units / project_management_schedule",
          summary:
            "착수부터 중간보고, 최종보고, 검수까지 사업 일정과 인력 투입 계획을 구체적으로 작성하는 단위로 배치되었습니다.",
        },
        {
          id: "REQ-19",
          title: "수행 보고서 및 보고회",
          priority: "중",
          source: "generation_units / project_management_reporting",
          summary:
            "사업 수행 보고서 제출과 보고회 개최 요구사항을 보고 일정, 제출 절차, 산출물 검토 흐름 중심으로 다룹니다.",
        },
        {
          id: "REQ-20",
          title: "산출물 작성 및 제출 관리",
          priority: "중",
          source: "generation_units / project_management_deliverables",
          summary:
            "최종보고서와 관련 산출물 작성, 검토, 제출 관리 절차를 구체적으로 기술하도록 계획되었습니다.",
        },
        {
          id: "REQ-21",
          title: "인력 투입 및 관리",
          priority: "중",
          source: "generation_units / project_management_personnel",
          summary:
            "인력 구성, 투입 계획, 교체 절차, 대리인 지정 등 사업 수행 인력 관리에 관한 요구사항을 다룹니다.",
        },
        {
          id: "REQ-22",
          title: "검수 및 인수 관리",
          priority: "중",
          source: "generation_units / unit_22_1",
          summary:
            "검수 및 검사 요구사항을 추진 전략 내 프로젝트 관리 실행과 이행·검수·인수 관리 측면에서 작성하도록 배치했습니다.",
        },
      ] satisfies DemoRequirement[],
      outline: [
        {
          id: "1",
          title: "사업 배경",
          mappedRequirements: ["REQ-01", "REQ-02", "REQ-03"],
          note: "정책 및 시장 동향을 중심으로 스마트농업과 ICT 융합의 필요성을 강조하고, 기후변화 대응과 데이터 기반 농업 혁신을 부각합니다.",
        },
        {
          id: "2",
          title: "사업 필요성",
          mappedRequirements: ["REQ-04", "REQ-05", "REQ-06", "REQ-12"],
          note: "현행 농업 데이터 관리 문제점과 개선 필요성을 통계 및 사례 중심으로 설명하고 생산성 향상 효과를 강조합니다.",
        },
        {
          id: "3",
          title: "회사 소개",
          mappedRequirements: ["REQ-09", "REQ-10", "REQ-11"],
          note: "회사 소개와 관련 수행 경험, 전담 조직 및 인력 구성, 유사 사업 실적을 표와 근거 문단으로 제시합니다.",
        },
        {
          id: "4",
          title: "특허 및 기술력",
          mappedRequirements: ["REQ-10", "REQ-11", "REQ-17"],
          note: "저작권과 특허 자료를 연결해 기술적 강점과 사업 적용 기대 효과를 작성하도록 설계되었습니다.",
        },
        {
          id: "5",
          title: "사업 수행 내용",
          mappedRequirements: [
            "REQ-01",
            "REQ-02",
            "REQ-03",
            "REQ-04",
            "REQ-05",
            "REQ-06",
            "REQ-07",
            "REQ-08",
            "REQ-09",
            "REQ-10",
            "REQ-11",
            "REQ-12",
            "REQ-13",
            "REQ-14",
            "REQ-15",
          ],
          note: "데이터 수집, AI 학습 데이터 구축, 데이터 분석, 시스템 유지보수 등 실행 중심 요구사항을 모두 이 섹션에 배치했습니다.",
        },
        {
          id: "6",
          title: "추진 전략",
          mappedRequirements: ["REQ-16", "REQ-17", "REQ-18", "REQ-19", "REQ-20", "REQ-21", "REQ-22"],
          note: "수행 방법론, 조직 및 협업 체계, 일정 관리, 위험 대응 방안, 보안·개인정보 보호 운영 관점을 다룹니다.",
        },
      ] satisfies DemoOutlineSection[],
      draft: [
        {
          title: "사업 이해 및 추진 방향",
          body:
            "본 사업은 스마트농업 데이터 수집 및 AI 기반 분석 플랫폼 구축을 통해 현장 데이터의 수집·정제·분석·활용 전 과정을 고도화하는 것을 목표로 합니다. 제안사는 정책 배경과 사업 필요성을 명확히 제시하고, 데이터 수집부터 AI 분석, 시스템 운영 및 유지보수에 이르는 실행 계획을 요구사항 단위로 분리하여 작성합니다.\n\n특히 생육·경영 데이터, 미기후·근권 데이터, AI 학습용 이미지 데이터가 서로 다른 형식과 주기로 발생한다는 점을 고려하여, 데이터 수급 체계와 품질관리 체계를 먼저 수립하고 이후 분석·서비스·AI pool 운영으로 확장하는 단계적 추진 방향을 제안합니다.",
        },
        {
          title: "데이터 수집 및 품질관리 실행 계획",
          body:
            "데이터 수집 영역은 조사 농가와 작목 선정, 생육 및 경영 데이터 수집 항목 정의, 조사 계획 수립, 조사요원 관리, 데이터 저장·관리 절차로 구성합니다. 미기후 및 근권 데이터는 센서별 수집 항목, 수집 주기, 보완 데이터 산출 방식, 비정상 데이터 검출 기준을 명확히 하여 운영 중 데이터 신뢰도를 확보합니다.\n\n품질관리 영역에서는 결측·이상 데이터 검정, 센서 점검, 데이터 정규화, 대시보드 반영 전 검수 절차를 운영합니다. 품질 이슈가 발생하면 원인 확인, 조치 결과 기록, DB 반영 여부 확인까지 하나의 이력으로 관리하여 발주기관이 데이터 품질 상태를 추적할 수 있도록 합니다.",
        },
        {
          title: "AI 분석 플랫폼 및 운영 방안",
          body:
            "AI 학습용 이미지 데이터는 작물별 생장 이미지 수집, 검수, 라벨링, 품질 확인, DB 구축의 절차로 관리합니다. 구축된 데이터는 예측 모델 개발과 Agriculture AI pool 운영에 활용하며, 모델 학습·평가·배포 과정을 통합 관리할 수 있는 웹 기반 AI 전주기 관리 체계를 제안합니다.\n\n플랫폼 운영은 혁신밸리 운영시스템 유지보수, 데이터 통합관리시스템 기능 개선, 사용자 권한 관리, 로그 및 모니터링, 장애 대응으로 구분합니다. 농가 대상 서비스는 데이터 분석 결과를 대시보드와 보고서 형태로 제공하고, 작목별 분석 항목을 지속적으로 보완하여 현장 활용성을 높입니다.",
        },
        {
          title: "추진 전략 및 검수 대응",
          body:
            "사업 추진 전략은 일정 관리, 보고 체계, 산출물 관리, 인력 투입 관리, 검수 및 인수 관리로 구성합니다. 착수 단계에서는 요구사항별 세부 실행 계획과 데이터 수급 계획을 확정하고, 수행 단계에서는 월간 보고와 중간 점검을 통해 일정 지연, 데이터 품질 이슈, 시스템 장애 리스크를 관리합니다.\n\n보안 및 개인정보 보호는 작업장소 관리, 접근 권한, 데이터 반출입, 로그 보관, 지식재산권 보호 기준을 별도 관리 항목으로 분리합니다. 최종 단계에서는 요구사항 커버리지, 산출물 목록, 테스트 및 검수 결과, 운영 이관 자료를 정리하여 발주기관의 검수와 후속 운영에 바로 활용될 수 있도록 제출합니다.",
        },
      ] satisfies DemoDraftSection[],
      readiness: [
        {
          label: "Planner",
          status: "ready",
          value: "ready",
          detail: "planner_cache/project_4.json의 plan_result.ready 값이 true로 저장되어 있습니다.",
        },
        {
          label: "요구사항",
          status: "ready",
          value: "22개",
          detail: "requirement_coverage에는 1번부터 22번까지의 요구사항 매핑 근거가 남아 있습니다.",
        },
        {
          label: "경고",
          status: "review",
          value: "2개",
          detail: "목차가 거시적이어서 실행·운영 세부 항목을 더 분절해야 한다는 coverage warning이 남아 있습니다.",
        },
        {
          label: "생성 모드",
          status: "sample",
          value: "실행 결과",
          detail: "초안이 아니라 planner 단계의 실제 캐시 결과를 데모 화면에 옮겼습니다.",
        },
      ] satisfies DemoReadiness[],
      edit: {
        before:
          "현재 목차에 실행 및 운영 관련 세부 계획, 예를 들어 데이터 수집 및 분석 구체적 방법, AI 학습 데이터 구축, 시스템 유지보수 및 보안 관리 등에 대한 분절된 항목이 부족하여 요구사항 반영 시 구체성 부족 우려가 있습니다.",
        after:
          "목차의 5장 사업 수행 내용을 하위 실행 단위로 세분화하여 데이터 수급 체계, 작물 생육·경영 데이터 수집, 미기후·근권 데이터 수집, AI 학습 이미지 데이터 구축, 데이터 분석, 품질관리, 농가 참여 이벤트, 대시보드 정제 자동화, 시스템 유지보수를 각각 별도 문단으로 작성하는 방식이 적합합니다.",
      },
    },
  ] satisfies DemoProjectCase[],
};
