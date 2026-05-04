# ExecPlan — MDX Content System

## 목적

프로젝트별 MDX 콘텐츠 구조와 slug 라우팅을 안정화한다.

## In Scope

- `src/content/projects`
- `src/data/projects.ts`
- `/projects/{slug}`
- MDX 컴포넌트 매핑

## Out of Scope

- CMS
- Notion 자동 연동

## 위험 / 전제

- Bootstrap 단계에서는 메타데이터를 `src/data/projects.ts`에 두고 MDX는 본문에 집중한다.
- slug와 파일명이 함께 관리되어야 한다.

## 검증

- 세 샘플 프로젝트 상세 페이지 렌더링
- 없는 slug not-found 확인
- `pnpm build`
