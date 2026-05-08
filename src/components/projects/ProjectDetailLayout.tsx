import { Fragment } from "react";
import type { ProjectImage as ProjectImageData, ProjectMeta } from "@/data/projects";
import { ProjectImage } from "@/components/projects/ProjectImage";

type InlineProjectImage = ProjectImageData & {
  variant?:
    | "default"
    | "immersive"
    | "screen"
    | "screenBalanced"
    | "screenCompact"
    | "screenLandscape"
    | "wide";
};

type ProjectDetailLayoutProps = {
  project: ProjectMeta;
};

export function ProjectDetailLayout({ project }: ProjectDetailLayoutProps) {
  const { detail } = project;
  const projectScreenImages: Record<string, InlineProjectImage> = {
    IDS: {
      alt: "IDS customer complaint analysis screen",
      src: "/images/projects/Hyundai-IDS/ids-image.png",
      caption: "고객 불만 기획 화면",
      variant: "screen",
    },
    ABB: {
      alt: "ABB health report example screen",
      caption: "건강 리포트 기획 화면",
      src: "/images/projects/ABB/health-report-screen.png",
      variant: "screenCompact",
    },
    complaint: {
      alt: "Complaint disaster safety monitoring screen",
      src: "/images/projects/complaint/monitoring-screen.png",
      caption: "위험 민원 모니터링 화면",
      variant: "screenBalanced",
    },
    "proposal-auto": {
      alt: "Proposal automation prototype screen",
      src: "/images/projects/proposal-auto/prototype-screen.png",
      caption: "제안서 자동화 프로토타입 화면",
      variant: "screenBalanced",
    },
  };
  const projectEvidenceImages: Record<string, InlineProjectImage> = {
    ABB: {
      alt: "ABB field validation activity image",
      src: "/images/projects/ABB/field-validation.png",
      caption: "실증 운영 수행 이미지",
      variant: "wide",
    },
    complaint: {
      alt: "Complaint monitoring process image",
      src: "/images/projects/complaint/monitoring-screen2.png",
      caption: "위험 민원 모니터링 화면",
      variant: "wide",
    },
  };
  const projectScreenImage = projectScreenImages[project.slug];
  const projectEvidenceImage = projectEvidenceImages[project.slug];
  const shouldMergeOverviewSections =
    project.slug === "IDS" ||
    project.slug === "ABB" ||
    project.slug === "complaint" ||
    project.slug === "proposal-auto";

  return (
    <main className="min-h-screen bg-white text-black">
      <article className="w-full px-[clamp(4.25rem,5.4vw,7rem)] pb-28 pt-[clamp(3.5rem,5vw,5.5rem)]">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">
            {project.period}
          </p>
          <h1 className="mt-3 max-w-[1100px] text-[clamp(2.75rem,4.05vw,3.75rem)] font-semibold leading-[0.95] tracking-normal">
            {project.title}
          </h1>
          <div className="mt-6 max-w-[780px] space-y-2 text-[clamp(0.95rem,1vw,1.08rem)] font-normal leading-7 text-black/78">
            {detail.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </header>

        <ProjectImage
          src={detail.diagram.src}
          alt={detail.diagram.alt}
          caption={detail.diagram.caption}
          className="mx-auto mt-[clamp(4rem,7vw,7rem)] w-full max-w-[900px]"
        />

        <div className="mt-[clamp(4rem,7vw,7rem)] space-y-[clamp(4rem,6vw,6rem)]">
          {detail.sections.map((section, sectionIndex) => {
            const isMergedIntroBlock = shouldMergeOverviewSections && sectionIndex === 0;
            const isMergedSection = shouldMergeOverviewSections && sectionIndex === 1;
            const displayedSections = isMergedIntroBlock
              ? detail.sections.slice(0, 2)
              : [section];
            const sectionMedia: InlineProjectImage[] = [
              ...(projectScreenImage && sectionIndex === 0 ? [projectScreenImage] : []),
              ...displayedSections.flatMap((displayedSection) => displayedSection.media ?? []),
            ];

            if (isMergedSection) {
              return null;
            }

            return (
            <Fragment key={section.title}>
            <section
              className={
                sectionMedia.length
                  ? "grid gap-[clamp(3rem,5vw,6rem)] lg:grid-cols-[minmax(0,58vw)_minmax(18rem,34vw)] lg:items-start xl:grid-cols-[minmax(0,56vw)_minmax(24rem,38vw)]"
                  : "max-w-[920px]"
              }
            >
              <div className="space-y-[clamp(2.75rem,3.5vw,4rem)]">
                {displayedSections.map((displayedSection) => (
                  <div key={displayedSection.title}>
                    <h2 className="text-[clamp(1.45rem,1.75vw,2rem)] font-semibold leading-tight">
                      {displayedSection.title}
                    </h2>
                    <div className="mt-5 space-y-3 text-[clamp(0.95rem,0.98vw,1.05rem)] leading-7 text-black/82">
                      {displayedSection.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {displayedSection.items?.length ? (
                      <ul className="mt-5 list-disc space-y-2 pl-5 text-[clamp(0.95rem,0.98vw,1.05rem)] leading-7 text-black/82">
                        {displayedSection.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>

              {sectionMedia.length ? (
                <div>
                  {sectionMedia.map((image) => (
                    <ProjectImage
                      key={`${image.alt}-${image.caption ?? ""}`}
                      src={image.src}
                      alt={image.alt}
                      caption={image.caption}
                      className={
                        image.variant === "screenCompact"
                          ? "ml-0 mt-0 w-full max-w-[clamp(18rem,28vw,30rem)]"
                          : "mt-0"
                      }
                      variant={image.variant}
                    />
                  ))}
                </div>
              ) : null}
            </section>
            {projectEvidenceImage && sectionIndex === 0 ? (
              <ProjectImage
                src={projectEvidenceImage.src}
                alt={projectEvidenceImage.alt}
                caption={projectEvidenceImage.caption}
                className="mt-[clamp(2rem,3.2vw,3.5rem)] w-full max-w-[1100px]"
                variant={projectEvidenceImage.variant}
              />
            ) : null}
            {displayedSections.map((displayedSection) =>
              displayedSection.featureMedia ? (
              <ProjectImage
                key={`${displayedSection.featureMedia.alt}-${displayedSection.featureMedia.caption ?? ""}`}
                src={displayedSection.featureMedia.src}
                alt={displayedSection.featureMedia.alt}
                caption={displayedSection.featureMedia.caption}
                className="mx-[calc(50%-50vw)] mt-[clamp(4rem,7vw,7rem)] w-screen max-w-none"
                variant="immersive"
              />
              ) : null,
            )}
            </Fragment>
          );
          })}
        </div>

        {detail.additionalMedia?.length ? (
          <section className="mt-[clamp(5rem,9vw,9rem)]">
            <div className="grid gap-10 md:grid-cols-2">
              {detail.additionalMedia.map((image) => (
                <ProjectImage
                  key={`${image.alt}-${image.caption ?? ""}`}
                  src={image.src}
                  alt={image.alt}
                  caption={image.caption}
                  className="mt-0"
                />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
