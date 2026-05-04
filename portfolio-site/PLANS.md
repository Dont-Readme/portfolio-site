# PLANS — ExecPlan Guide

이 폴더는 여러 세션에 걸쳐 이어질 수 있는 작업을 ExecPlan 형태로 관리하기 위한 공간이다.

## 사용 원칙

- 큰 변경은 `plans/execplan-*.md`에 목적, 범위, 검증 방법을 남긴다.
- Figma, 콘텐츠, 애니메이션, 배포처럼 독립적인 작업 단위별로 파일을 나눈다.
- 실제 결정이 바뀌면 `PROJECT_CONTEXT.md`의 Decision Log도 함께 갱신한다.
- 구현 후에는 `pnpm lint`와 `pnpm build`로 최소 검증한다.

## 현재 ExecPlan 스텁

- `plans/execplan-figma-to-layout.md`
- `plans/execplan-mdx-content-system.md`
- `plans/execplan-motion-system.md`
- `plans/execplan-project-detail-template.md`
- `plans/execplan-vercel-deployment.md`
