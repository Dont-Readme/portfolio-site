export type ExternalProfileLink = {
  label: string;
  url: string;
};

export type Profile = {
  name: string;
  position: string;
  headline: string;
  strengths: string[];
  email: string;
  linkedinUrl?: string;
  githubUrl?: string;
  externalProfileUrls?: ExternalProfileLink[];
};

export type About = {
  intro: string;
  experienceSummary: string;
  skills: string[];
  tools: string[];
  workingStyle: string[];
};

export const profile: Profile = {
  name: "Your Name",
  position: "Product-minded Planner / PM Portfolio",
  headline:
    "문제 정의에서 화면 기획, 구현 협업, 결과 정리까지 프로젝트의 흐름을 설계하는 포트폴리오입니다.",
  strengths: [
    "사용자 문제와 비즈니스 목표를 연결해 프로젝트 범위를 명확히 정리합니다.",
    "Figma 기반 화면 기획과 기능 명세로 디자이너/개발자와 빠르게 합의합니다.",
    "구현 구조와 제약을 이해한 상태에서 우선순위와 전달 방식을 조정합니다.",
  ],
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "kdm9516@gmail.com",
  linkedinUrl: "https://www.linkedin.com/in/your-profile",
  githubUrl: "https://github.com/your-github",
  externalProfileUrls: [
    {
      label: "External Profile",
      url: "https://example.com/profile",
    },
  ],
};

export const about: About = {
  intro:
    "기획/PM/프로덕트 역량을 중심으로 프로젝트의 문제, 역할, 판단 과정, 결과를 정리합니다.",
  experienceSummary:
    "초기 아이디어를 사용자 흐름과 화면 구조로 구체화하고, 구현 가능성과 협업 비용을 함께 고려해 실행 가능한 계획으로 바꾸는 데 강점이 있습니다.",
  skills: [
    "문제 정의와 요구사항 구조화",
    "사용자 흐름, 화면 정책, 기능 우선순위 설계",
    "프로젝트 상세 문서화와 이해관계자 커뮤니케이션",
  ],
  tools: [
    "Figma",
    "Notion",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "GitHub",
    "Vercel",
  ],
  workingStyle: [
    "추상적인 요청을 화면, 정책, 데이터 단위로 나눠 실행 가능한 범위로 만듭니다.",
    "의사결정 이유와 변경 이력을 남겨 다음 작업자가 맥락을 잃지 않게 합니다.",
    "예쁜 결과물보다 채용 담당자가 빠르게 이해할 수 있는 정보 구조를 우선합니다.",
  ],
};
