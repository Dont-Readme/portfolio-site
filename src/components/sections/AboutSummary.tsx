import { AnimatedSection } from "@/components/motion/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { about } from "@/data/profile";

export function AboutSummary({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "border-t border-line py-14" : "mt-10"}>
      {compact ? (
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="About"
            title="기획 언어와 구현 언어 사이를 번역합니다."
            description={about.intro}
          />
        </div>
      ) : (
        <AnimatedSection className="rounded-md border border-line bg-surface p-6 sm:p-8">
          <p className="text-lg leading-8">{about.intro}</p>
          <p className="mt-5 leading-8 text-muted">{about.experienceSummary}</p>
        </AnimatedSection>
      )}
      <AnimatedSection
        className={[
          compact ? "mx-auto mt-8 max-w-6xl px-5 sm:px-8" : "mt-6",
          "grid gap-4 md:grid-cols-3",
        ].join(" ")}
        delay={0.08}
      >
        {about.skills.map((skill) => (
          <div key={skill} className="rounded-md border border-line bg-surface p-5">
            <p className="text-sm leading-7 text-muted">{skill}</p>
          </div>
        ))}
      </AnimatedSection>
    </section>
  );
}
