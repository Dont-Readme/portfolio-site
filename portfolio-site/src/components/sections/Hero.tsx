import { AnimatedSection } from "@/components/motion/AnimatedSection";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { profile } from "@/data/profile";

export function Hero() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
        <AnimatedSection>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            {profile.position}
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-6xl">
            {profile.name}
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-muted">
            {profile.headline}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/projects">Projects 보기</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Contact
            </ButtonLink>
          </div>
        </AnimatedSection>

        <AnimatedSection
          delay={0.12}
          className="rounded-md border border-line bg-surface p-5"
        >
          <div className="grid gap-3">
            {["문제 정의", "화면/기능 기획", "구현 또는 협업", "결과/성과"].map(
              (label, index) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-md border border-line bg-background p-4"
                >
                  <span className="font-mono text-sm text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-semibold">{label}</span>
                </div>
              ),
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
