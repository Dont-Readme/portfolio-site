"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { getProjects } from "@/lib/projects";

const experience = [
  {
    company: "더아이엠씨",
    description: "AI 전략팀 · 선임연구원",
    period: "2019.07 - 2026.04",
  },
  {
    company: "한국지능정보사회진흥원",
    description: "정책기획팀 · 인턴",
    period: "2018.11 - 2018.12",
  },
];

const certifications = [
  {
    name: "빅데이터 분석 기사",
    period: "2021",
  },
  {
    name: "사회조사분석사 2급",
    period: "2018",
  },
  {
    name: "ADsP",
    period: "2017",
  },
];

const profileImagePath = "/images/profile/profile.jpg";

export function HomeLanding() {
  const workRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [initialWorkScale, setInitialWorkScale] = useState(0.3);
  const projects = getProjects().slice(0, 5);
  const { scrollYProgress } = useScroll({
    target: workRef,
    offset: ["start 46%", "start 8%"],
  });
  const workScale = useTransform(scrollYProgress, [0, 1], [initialWorkScale, 1]);
  const workOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.58, 0.88, 1]);

  useEffect(() => {
    const updateInitialScale = () => {
      const viewportWidth = window.innerWidth;
      const horizontalPadding = Math.min(
        Math.max(viewportWidth * 0.023, 20),
        52,
      ) * 2;
      const workWidth = Math.max(viewportWidth - horizontalPadding, 1);
      const introWidth = 560;

      setInitialWorkScale(Math.min(0.3, Math.max(0.12, introWidth / workWidth)));
    };

    updateInitialScale();
    window.addEventListener("resize", updateInitialScale);

    return () => window.removeEventListener("resize", updateInitialScale);
  }, []);

  return (
    <main id="top" className="bg-[#1b1b1b] text-white">
      <section className="flex min-h-[76svh] items-start px-6 pb-16 pt-[clamp(9.6rem,19.2vh,25.6rem)] sm:px-10">
        <div className="mx-auto w-full max-w-[560px]">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="relative mb-10 size-32 overflow-hidden rounded-full border border-white/[0.1] bg-white/[0.06] shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
              <Image
                src={profileImagePath}
                alt="Profile portrait"
                fill
                priority
                quality={100}
                sizes="128px"
                className="object-cover"
              />
            </div>
            <h1 className="text-[clamp(1.35rem,3vw,1.75rem)] font-semibold leading-tight">
              가나다라마바사 가나다라마바사 
            </h1>
            <p className="mt-6 text-[clamp(0.95rem,1.6vw,1.08rem)] leading-7 text-white/[0.88]">
              가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 가나다라마바사 
            </p>

            <div className="mt-12">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/[0.34]">
                Experience
              </p>
              <div className="mt-6 space-y-4">
                {experience.map((item) => (
                  <div
                    key={item.company}
                    className="grid gap-2 border-b border-white/[0.12] pb-4 text-sm sm:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.company}</p>
                      <p className="mt-1 text-white/[0.5]">{item.description}</p>
                    </div>
                    <p className="text-white/[0.45]">{item.period}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-11">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/[0.34]">
                Certifications
              </p>
              <div className="mt-6 space-y-4">
                {certifications.map((item) => (
                  <div
                    key={item.name}
                    className="grid gap-2 border-b border-white/[0.12] pb-4 text-sm sm:grid-cols-[1fr_auto]"
                  >
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-white/[0.45]">{item.period}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-11">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/[0.34]">
                Contact
              </p>
              <a
                href={`mailto:${profile.email}`}
                className="mt-3 inline-block text-sm font-medium text-white hover:text-white/[0.65]"
              >
                {profile.email}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        ref={workRef}
        id="my-work"
        className="min-h-[100svh] border-t border-white/[0.055] bg-[#141414]"
      >
        <motion.div
          style={{
            scale: shouldReduceMotion ? 1 : workScale,
            opacity: shouldReduceMotion ? 1 : workOpacity,
          }}
          className="mx-auto min-h-[100svh] origin-top bg-[#141414] px-[clamp(1.25rem,2.3vw,3.25rem)] pb-[clamp(1.5rem,3.2vw,3rem)] pt-[clamp(1rem,2vw,2rem)] text-white"
        >
          <div className="flex min-h-[105svh] w-full flex-col justify-center min-[2200px]:min-h-[95svh]">
            <h2 className="text-[clamp(5rem,11.5vw,11rem)] font-medium leading-[0.86] tracking-normal">
              My Work
            </h2>
            <div className="mt-[clamp(1.8rem,3.1vw,3.6rem)]">
              {projects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="group grid min-h-[clamp(6.3rem,12.8vh,9.6rem)] grid-cols-[1fr_auto] items-center border-b border-white/[0.28] text-white transition hover:border-white"
                >
                  <span className="text-[clamp(2.35rem,4.7vw,5.25rem)] font-normal leading-none">
                    {project.title}
                  </span>
                  <span className="ml-8 text-[clamp(0.68rem,0.78vw,0.9rem)] text-white/[0.54] transition group-hover:text-white">
                    {project.category}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section
        id="contact"
        className="flex min-h-[32svh] items-center bg-[#1b1b1b] px-6 py-16 sm:px-10"
      >
        <div className="mx-auto w-full max-w-[980px]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/[0.34]">
            Contact
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="mt-4 inline-block text-sm font-medium text-white hover:text-white/[0.65]"
          >
            {profile.email}
          </a>
        </div>
      </section>
    </main>
  );
}
