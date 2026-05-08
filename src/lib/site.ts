import { profile } from "@/data/profile";

const configuredSiteName = process.env.NEXT_PUBLIC_SITE_NAME;
const siteName =
  configuredSiteName && configuredSiteName !== "Your Name Portfolio"
    ? configuredSiteName
    : `${profile.name} Portfolio`;

export const siteConfig = {
  name: siteName,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kdm-portfolio.vercel.app",
  description:
    "이직 지원 시 프로젝트 경험과 기획/PM/프로덕트 역량을 보여주기 위한 개인 포트폴리오입니다.",
};
