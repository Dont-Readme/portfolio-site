import { projects, type ProjectMeta } from "@/data/projects";

export function getProjects(): ProjectMeta[] {
  return [...projects].sort((a, b) => a.order - b.order);
}

export function getProjectBySlug(slug: string): ProjectMeta | undefined {
  return projects.find((project) => project.slug === slug);
}
