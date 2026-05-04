import Link from "next/link";
import { AnimatedSection } from "@/components/motion/AnimatedSection";
import type { ProjectMeta } from "@/data/projects";
import { projectSectionLabels } from "@/lib/projects";

type ProjectDetailLayoutProps = {
  project: ProjectMeta;
  children: React.ReactNode;
};

export function ProjectDetailLayout({
  project,
  children,
}: ProjectDetailLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:py-18">
      <Link
        href="/projects"
        className="text-sm font-semibold text-accent hover:text-accent-strong"
      >
        ← Projects
      </Link>
      <AnimatedSection className="mt-8 border-b border-line pb-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              {project.role}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              {project.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted">{project.summary}</p>
          </div>
          <div className="min-w-56 rounded-md border border-line bg-surface p-4 text-sm text-muted">
            {project.period ? <p>기간: {project.period}</p> : null}
            <p className="mt-2">Slug: {project.slug}</p>
          </div>
        </div>
      </AnimatedSection>

      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-md border border-line bg-surface p-5 lg:sticky lg:top-28">
          <p className="text-sm font-semibold">상세 섹션</p>
          <ol className="mt-4 space-y-3 text-sm text-muted">
            {projectSectionLabels.map((label, index) => (
              <li key={label} className="flex gap-3">
                <span className="font-mono text-xs text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ol>
        </aside>
        <AnimatedSection
          className={[
            "rounded-md border border-line bg-surface p-6 sm:p-8",
            "[&_h2]:mt-12 [&_h2:first-child]:mt-0 [&_h2]:border-t [&_h2]:border-line [&_h2]:pt-8",
            "[&_h2]:text-2xl [&_h2]:font-semibold [&_p]:mt-4 [&_p]:leading-8 [&_p]:text-muted",
            "[&_ul]:mt-4 [&_ul]:space-y-2 [&_li]:leading-7 [&_li]:text-muted",
            "[&_strong]:text-foreground",
          ].join(" ")}
          delay={0.08}
        >
          {children}
        </AnimatedSection>
      </div>
    </div>
  );
}
