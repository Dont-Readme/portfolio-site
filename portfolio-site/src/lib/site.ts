import { profile } from "@/data/profile";

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? `${profile.name} Portfolio`,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "이직 지원 시 프로젝트 경험과 기획/PM/프로덕트 역량을 보여주기 위한 개인 포트폴리오입니다.",
};
