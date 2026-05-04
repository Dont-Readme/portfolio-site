# ARCHITECTURE — portfolio-site

## 1. 설계 목표 / 비목표

Goals:

- 채용 담당자가 빠르게 이해할 수 있는 개인 포트폴리오를 만든다.
- Home / About / Projects / Contact 구조를 유지한다.
- 프로젝트 상세는 `/projects/{slug}` 개별 페이지로 제공한다.
- 프로젝트 본문은 MDX/Markdown으로 관리한다.
- Figma 화면 기획 결과를 컴포넌트 구조로 옮기기 쉽게 만든다.
- Framer Motion을 활용해 감각적인 애니메이션을 제공한다.
- Vercel 무료 배포에 적합한 구조로 만든다.

Non-goals:

- 이력서 다운로드 기능
- Resume 페이지
- 로그인
- 관리자 페이지
- CMS
- DB
- 백엔드 API
- 문의 폼
- 블로그
- 다국어 지원
- 커스텀 도메인 설정

## 2. 전체 구조 개요

```text
[채용 담당자]
    ↓
[Home / About / Projects / Contact]
    ↓
[Next.js App Router]
    ↓
[Page Components]
    ↓
[Shared UI Components]
    ↓
[MDX Project Content + Static Assets]
    ↓
[Vercel]
```

프로젝트 상세 렌더링 흐름:

```text
/projects/{slug}
    ↓
src/lib/projects.ts
    ↓
src/content/projects/{slug}.mdx
    ↓
ProjectDetailLayout
    ↓
AnimatedSection
```

## 3. 컴포넌트 책임 분리

- `src/app/`: 라우팅과 페이지 엔트리
- `src/components/layout/`: Header, Footer, SiteShell
- `src/components/sections/`: Home/About/Contact 섹션 UI
- `src/components/projects/`: 프로젝트 카드, 상세 레이아웃, 이미지 컴포넌트
- `src/components/motion/`: Framer Motion 기반 공통 애니메이션
- `src/components/ui/`: 버튼, 섹션 제목 등 작은 재사용 UI
- `src/content/projects/`: 프로젝트별 MDX 콘텐츠
- `src/data/`: 프로필과 프로젝트 메타데이터
- `src/lib/`: MDX 로딩, 프로젝트 조회, 사이트 유틸
- `public/images/`: 프로젝트 이미지, 프로필 이미지, OG 이미지

## 4. 데이터 흐름

Home:

```text
src/data/profile.ts + src/data/projects.ts
→ src/app/page.tsx
→ Hero / Strengths / ProjectPreview
```

Projects:

```text
src/data/projects.ts
→ src/app/projects/page.tsx
→ ProjectCard 목록
→ /projects/{slug}
```

Project Detail:

```text
URL slug
→ src/lib/projects.ts
→ src/lib/mdx.ts
→ src/content/projects/*.mdx
→ ProjectDetailLayout
→ 8개 고정 섹션 렌더링
```

Contact:

```text
src/data/profile.ts
→ src/app/contact/page.tsx
→ ContactLinks
```

## 5. API 설계

MVP에서는 API를 만들지 않는다. 콘텐츠는 로컬 MDX/TypeScript 파일에서 읽는다.

## 6. 데이터 모델

```ts
export type Profile = {
  name: string;
  position: string;
  headline: string;
  strengths: string[];
  email: string;
  linkedinUrl?: string;
  githubUrl?: string;
  externalProfileUrls?: { label: string; url: string }[];
};

export type ProjectMeta = {
  title: string;
  slug: string;
  summary: string;
  period?: string;
  role: string;
  tags: string[];
  thumbnailImage?: string;
  order: number;
};
```

Project Detail 고정 섹션:

```text
1. 프로젝트 한 줄 요약
2. 배경 / 문제
3. 목표
4. 내 역할
5. 기획 과정
6. 주요 화면 또는 이미지
7. 핵심 기능
8. 결과 / 성과
```

## 7. 핵심 설계 결정

1. Next.js App Router를 사용한다.
2. `create-next-app --src-dir` 결과에 맞춰 실제 앱 코드는 `src/` 아래에 둔다.
3. MDX/Markdown으로 프로젝트 상세를 관리한다.
4. DB와 API를 만들지 않는다.
5. Framer Motion을 사용한다.
6. 이력서 관련 기능을 제외한다.
7. AGENTS.md를 둔다.

## 8. 에러 처리 & 로깅 규칙

- 존재하지 않는 프로젝트 slug는 `not-found` 처리한다.
- 프로젝트 데이터가 비어 있으면 빈 상태 메시지를 표시한다.
- 이미지는 항상 `alt`를 제공한다.
- 외부 링크가 비어 있으면 렌더링하지 않는다.
- MVP에서는 별도 서버 로깅을 만들지 않는다.

## 9. 테스트 전략

초기 검증:

```bash
pnpm lint
pnpm build
```

주요 확인:

- `/`, `/about`, `/projects`, `/contact` 페이지가 로드된다.
- `/projects/{slug}` 상세 페이지가 로드된다.
- 존재하지 않는 slug는 not-found 처리된다.
- 프로젝트 상세에 8개 고정 섹션이 순서대로 표시된다.
- Contact 이메일 링크가 `mailto:`로 동작한다.
- 외부 링크에 `rel="noreferrer"`가 적용된다.
