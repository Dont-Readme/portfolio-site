import Image from "next/image";
import Link from "next/link";
import type { ProjectMeta } from "@/data/projects";

export function ProjectCard({ project }: { project: ProjectMeta }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block overflow-hidden rounded-md border border-line bg-surface transition hover:-translate-y-1 hover:border-accent hover:shadow-[0_18px_45px_rgba(31,36,38,0.08)]"
    >
      <article>
        <div className="relative aspect-[16/10] overflow-hidden bg-background">
          {project.thumbnailImage ? (
            <Image
              src={project.thumbnailImage}
              alt={`${project.title} thumbnail`}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
              unoptimized={project.thumbnailImage.endsWith(".svg")}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              No image
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.16em] text-muted">
            <span>{project.role}</span>
            {project.period ? <span>{project.period}</span> : null}
          </div>
          <h2 className="mt-4 text-xl font-semibold leading-tight group-hover:text-accent-strong">
            {project.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">{project.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-line bg-background px-2.5 py-1 text-xs text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
