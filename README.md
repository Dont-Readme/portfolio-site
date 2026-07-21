# portfolio-site

## 1. 한 줄 요약

이직 지원 시 프로젝트 경험을 보여주기 위한 개인 포트폴리오 웹사이트.

## 2. 프로젝트 목적

이 사이트는 이력서를 대체하지 않는다. 이력서나 채용 플랫폼에 첨부할 프로젝트 참고용 링크로 사용한다.

채용 담당자가 지원자의 강점, 프로젝트 경험, 문제 해결 방식, 기획/PM/프로덕트 역량을 빠르게 이해할 수 있도록 구성한다.

## 3. 핵심 기능

- 검은 메인 영역에서 My Work, Contact로 이어지는 Home 페이지
- 우측 상단 Menu: Home / About / Projects
- About 빈 페이지
- `/projects/{slug}` 프로젝트 상세 빈 페이지
- MDX 기반 프로젝트 콘텐츠 관리
- Framer Motion 기반 애니메이션
- 반응형 레이아웃
- 이메일 및 외부 프로필 링크 제공

## 4. 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- MDX
- Framer Motion
- pnpm
- Vercel

## 5. 설치 및 실행 방법

```bash
pnpm install
pnpm dev
```

`.env.example`을 복사해 `.env`를 만든 뒤 실제 값을 넣는다.

```env
NEXT_PUBLIC_SITE_URL="https://your-vercel-url.vercel.app"
NEXT_PUBLIC_SITE_NAME="Your Name Portfolio"
NEXT_PUBLIC_CONTACT_EMAIL="your-email@example.com"
```

## 6. 검증

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## AI 학습 코치 데모

과제 면접용 알고리즘 데모는 `/ai-coach-demo2`로 직접 접속한다. 실행 방식, 합성 데이터, OpenAI 서버 환경변수와 검증 명령은 [`docs/AI_COACH_DEMO.md`](docs/AI_COACH_DEMO.md)에 정리되어 있다.

## 7. 폴더 구조 요약

```text
src/app/          Next.js App Router 페이지
src/components/   공통 UI, 레이아웃, 프로젝트 컴포넌트
src/content/      프로젝트별 MDX 콘텐츠
src/data/         프로필 및 프로젝트 메타데이터
src/lib/          콘텐츠 로딩 및 유틸 함수
public/           이미지와 정적 파일
plans/            ExecPlan 주제 스텁
```

## 8. 사용 방법

1. `src/data/profile.ts`에서 이름, 소개, 연락처, 외부 링크를 수정한다.
2. `src/data/projects.ts`에서 프로젝트 메타데이터를 수정한다.
3. `src/content/projects/*.mdx`에서 프로젝트 상세 내용을 작성한다.
4. `public/images/projects/`에 프로젝트 이미지를 추가한다.
5. Figma 화면 기획을 바탕으로 컴포넌트 스타일을 조정한다.
6. `pnpm lint`와 `pnpm build`로 검증한다.
7. Vercel에 배포한다.

## 9. 참고/링크

- Figma 화면 기획: TBD
- Vercel 배포 URL: TBD
- GitHub 저장소: TBD
