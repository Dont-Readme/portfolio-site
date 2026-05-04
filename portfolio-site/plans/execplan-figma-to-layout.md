# ExecPlan — Figma to Layout

## 목적

Figma 프레임을 Next.js 레이아웃과 컴포넌트 구조로 변환한다.

## In Scope

- Home / About / Projects / Project Detail / Contact 프레임 반영
- 반응형 레이아웃 조정
- 컴포넌트 단위 스타일 정리

## Out of Scope

- 세부 콘텐츠 완성
- 배포 자동화

## 위험 / 전제

- Figma 프레임 네이밍이 명확해야 한다.
- Figma remote MCP가 불안정하면 링크, 캡처, 수동 설명을 사용한다.

## 검증

- 모바일/데스크톱 주요 viewport 확인
- `pnpm lint`
- `pnpm build`
