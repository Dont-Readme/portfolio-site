# PROJECT_CONTEXT — portfolio-site

## 1. 한 줄 요약

이직 지원 시 이력서와 함께 첨부할 프로젝트 참고용 개인 포트폴리오 웹사이트.

## 2. MVP 목표

- 채용 담당자가 지원자의 포지셔닝과 프로젝트 경험을 빠르게 이해할 수 있게 한다.
- Home / About / Projects / Contact 구조를 제공한다.
- 프로젝트 리스트와 `/projects/{slug}` 상세 페이지를 제공한다.
- 프로젝트 상세 콘텐츠는 MDX/Markdown으로 관리하고, 메타데이터는 `src/data/projects.ts`에서 관리한다.
- 프로젝트 상세는 8개 고정 섹션을 따른다.
- 이력서 다운로드나 Resume 페이지는 제공하지 않는다.
- Framer Motion으로 감각적인 애니메이션을 제공하되 가독성을 해치지 않는다.
- Vercel 무료 URL로 배포 가능한 구조를 만든다.

## 3. 현재 결정된 사항(Decision Log)

1. 프로젝트명은 `portfolio-site`로 한다.
2. 대상 사용자는 채용 담당자로 한다.
3. 메뉴는 `Home / About / Projects / Contact`로 한다.
4. 프로젝트 상세는 `/projects/{slug}` 개별 페이지로 만든다.
5. 프로젝트 상세 기본 섹션은 8개만 사용한다.
6. 프로젝트 본문은 MDX/Markdown으로 관리하고 메타데이터는 TypeScript 데이터 파일에서 관리한다.
7. 백엔드 API와 DB는 사용하지 않는다.
8. 이력서 PDF, Resume 메뉴, 이력서 외부 링크는 제공하지 않는다.
9. 기술 스택은 Next.js + TypeScript + Tailwind CSS + MDX + Framer Motion + Vercel로 한다.
10. Figma remote MCP 사용을 우선 고려한다.
11. AGENTS.md를 생성한다.
12. PLANS.md와 plans/ 스텁 파일을 생성한다.
13. `create-next-app --src-dir` 결과에 맞춰 애플리케이션 코드는 `src/` 아래에 둔다.
14. 로컬 개발 서버는 Windows Codex 런타임의 Turbopack worker 권한 이슈를 피하기 위해 `next dev --webpack`을 사용한다.
15. Home은 검은 메인 영역, 확대 진입하는 흰색 My Work 영역, 검은 Contact 영역이 스크롤로 이어지는 단일 페이지로 구성한다.
16. 우측 상단 `Menu`는 Home, About, Projects만 제공하고, Projects는 Home의 `#my-work` 섹션으로 이동한다.
17. About 페이지와 프로젝트 상세 페이지는 디자인 확정 전까지 빈 페이지로 둔다.

## 4. 현재 상태 요약

- Next.js App Router 기반 초기 구조 생성 완료.
- Home / About / Projects / Project Detail / Contact 라우팅 생성 완료.
- 샘플 프로젝트 MDX 3개 생성 완료.
- Framer Motion 공통 애니메이션 래퍼 생성 완료.
- 프로젝트 문서 팩과 ExecPlan 스텁 생성 완료.

## 5. 다음 작업(Next Actions)

1. 실제 이름, 직무명, 이메일, 외부 링크로 placeholder를 교체한다.
2. 실제 프로젝트 제목, slug, 이미지, 본문을 반영한다.
3. Figma 화면 기획을 바탕으로 색상과 레이아웃 디테일을 조정한다.
4. `pnpm lint`와 `pnpm build`로 검증한다.
5. Vercel에 배포한다.

## 6. 중요한 제약/주의사항

- Resume 페이지를 만들지 않는다.
- 이력서 PDF 다운로드를 만들지 않는다.
- 이력서 외부 링크를 만들지 않는다.
- 로그인, DB, 백엔드 API, 문의 폼을 만들지 않는다.
- 프로젝트 상세 섹션은 아래 8개를 기본으로 한다.
  1. 프로젝트 한 줄 요약
  2. 배경 / 문제
  3. 목표
  4. 내 역할
  5. 기획 과정
  6. 주요 화면 또는 이미지
  7. 핵심 기능
  8. 결과 / 성과
- 애니메이션은 정보 탐색과 가독성을 방해하면 안 된다.
- `.env`는 커밋하지 않고 `.env.example`만 커밋한다.
- 외부 링크는 새 탭으로 열고 `rel="noreferrer"`를 포함한다.

## 7. 미결 사항(Open Questions)

1. 실제 이름과 목표 직무 문구는 무엇인가?
2. Home 첫 화면 한 줄 소개 문구는 무엇인가?
3. 실제 프로젝트 3개 이상의 제목, slug, 대표 이미지는 무엇인가?
4. LinkedIn, GitHub, 외부 프로필 URL은 무엇인가?
5. Figma 최종 프레임 링크 또는 MCP 연결 정보는 무엇인가?
