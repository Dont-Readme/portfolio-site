# ExecPlan — Motion System

## 목적

Framer Motion 기반 공통 애니메이션 패턴을 정의한다.

## In Scope

- 섹션 reveal
- 카드 hover
- 이미지 fade-in
- reduced motion 대응

## Out of Scope

- 과한 로딩 애니메이션
- 복잡한 페이지 전환

## 위험 / 전제

- 가독성과 성능을 해치지 않아야 한다.
- 채용 담당자의 정보 탐색 흐름을 방해하지 않아야 한다.

## 검증

- 주요 페이지 스크롤 확인
- reduced motion 사용자의 기본 표시 확인
- `pnpm lint`
