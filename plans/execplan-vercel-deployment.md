# ExecPlan — Vercel Deployment

## 목적

Vercel 무료 URL 배포와 기본 메타데이터 설정을 완료한다.

## In Scope

- build 검증
- 환경 변수 확인
- Vercel 무료 URL 배포
- 배포 후 링크 확인

## Out of Scope

- 커스텀 도메인
- 고급 분석 도구

## 위험 / 전제

- 배포 후 `NEXT_PUBLIC_SITE_URL` 값을 실제 Vercel URL로 갱신해야 한다.
- 공개 가능한 이메일만 사용해야 한다.

## 검증

- `pnpm lint`
- `pnpm build`
- Vercel 배포 URL 접속 확인
