import { AnimatedSection } from "@/components/motion/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { profile } from "@/data/profile";

export function Strengths() {
  return (
    <section className="py-14">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Strengths"
          title="채용 담당자가 빠르게 확인할 수 있는 강점"
          description="기획 문서, 화면 설계, 구현 이해, 협업 맥락을 하나의 프로젝트 서사로 정리합니다."
        />
        <AnimatedSection className="mt-8 grid gap-4 md:grid-cols-3">
          {profile.strengths.map((strength) => (
            <div
              key={strength}
              className="rounded-md border border-line bg-surface p-5"
            >
              <p className="text-sm leading-7 text-muted">{strength}</p>
            </div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
