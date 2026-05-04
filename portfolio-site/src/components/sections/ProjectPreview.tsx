import { ProjectCard } from "@/components/projects/ProjectCard";
import { AnimatedSection } from "@/components/motion/AnimatedSection";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeaturedProjects } from "@/lib/projects";

export function ProjectPreview() {
  const projects = getFeaturedProjects(3);

  return (
    <section className="border-t border-line py-14">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Featured"
            title="대표 프로젝트"
            description="샘플 콘텐츠를 실제 프로젝트 자료로 교체하면 바로 포트폴리오 링크로 사용할 수 있습니다."
          />
          <ButtonLink href="/projects" variant="secondary">
            전체 보기
          </ButtonLink>
        </div>
        <AnimatedSection className="mt-10 grid gap-5 md:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
