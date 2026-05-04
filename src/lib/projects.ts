import { projects, type ProjectMeta } from "@/data/projects";

export const projectSectionLabels = [
  "프로젝트 한 줄 요약",
  "배경 / 문제",
  "목표",
  "내 역할",
  "기획 과정",
  "주요 화면 또는 이미지",
  "핵심 기능",
  "결과 / 성과",
] as const;

export function getProjects(): ProjectMeta[] {
  return [...projects].sort((a, b) => a.order - b.order);
}

export function getFeaturedProjects(limit = 3): ProjectMeta[] {
  return getProjects().slice(0, limit);
}

export function getProjectBySlug(slug: string): ProjectMeta | undefined {
  return projects.find((project) => project.slug === slug);
}
