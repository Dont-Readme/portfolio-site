"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { projects } from "@/data/projects";

const profileImagePath = "/images/profile/profile2.png";

const experienceItems = [
  {
    company: "더아이엠씨",
    role: "AI 전략팀 · 선임연구원",
    period: "2019.07 - 2026.04",
  },
  {
    company: "한국지능정보사회진흥원",
    role: "정책기획팀 · 인턴",
    period: "2018.11 - 2018.12",
  },
];

const certificationItems = [
  {
    title: "빅데이터 분석 기사",
    year: "2021",
  },
  {
    title: "사회조사분석사 2급",
    year: "2018",
  },
  {
    title: "ADsP",
    year: "2017",
  },
];

const workRoleBars = [
  {
    label: "프로젝트 관리",
    count: 10,
    gradient: "linear-gradient(90deg, #7c5cff 0%, #6f47ee 100%)",
  },
  {
    label: "사업 제안",
    count: 8,
    note: "리드 및 수주 건 수 기준",
    gradient: "linear-gradient(90deg, #7cb7ff 0%, #4f97ff 100%)",
  },
  {
    label: "서비스 기획",
    count: 10,
    gradient: "linear-gradient(90deg, #f08cff 0%, #d96cf0 100%)",
  },
  {
    label: "데이터 / AI 실무",
    count: 18,
    gradient: "linear-gradient(90deg, #e7d7ff 0%, #b995ff 100%)",
  },
];

const maxRoleBarCount = Math.max(...workRoleBars.map((item) => item.count));

export function HomeLanding() {
  const workRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [initialWorkScale, setInitialWorkScale] = useState(0.3);

  const sortedProjects = [...projects].sort((a, b) => a.order - b.order).slice(0, 4);

  const { scrollYProgress } = useScroll({
    target: workRef,
    offset: ["start 46%", "start 8%"],
  });
  const workScale = useTransform(
    scrollYProgress,
    [0, 0.82, 1],
    [initialWorkScale, 1, 1],
  );
  const workOpacity = useTransform(scrollYProgress, [0, 0.46, 0.82], [0.58, 0.88, 1]);

  useEffect(() => {
    const updateInitialScale = () => {
      const viewportWidth = window.innerWidth;
      const horizontalPadding =
        Math.min(Math.max(viewportWidth * 0.0345, 30), 78) * 2;
      const introWidth = 560;
      const workWidth = Math.max(viewportWidth - horizontalPadding, 1);

      setInitialWorkScale(Math.min(1, Math.max(0.12, introWidth / workWidth)));
    };

    updateInitialScale();
    window.addEventListener("resize", updateInitialScale);

    return () => window.removeEventListener("resize", updateInitialScale);
  }, []);

  return (
    <main id="top" className="bg-[#1b1b1b] text-white">
      <section
        id="home"
        className="flex min-h-[76svh] items-start px-6 pb-16 pt-[clamp(9.6rem,19.2vh,25.6rem)] sm:px-10"
      >
        <div className="mx-auto w-full max-w-[560px]">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="relative mb-10 size-32 overflow-hidden rounded-full border border-white/[0.1] bg-white/[0.06] shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
              <Image
                src={profileImagePath}
                alt="프로필 사진"
                fill
                priority
                quality={100}
                sizes="128px"
                className="object-cover"
              />
            </div>

            <h1 className="text-[clamp(1.35rem,3vw,1.75rem)] font-semibold leading-tight">
              AI를 활용한 서비스 기획과 업무 효율화에 관심이 있습니다.
            </h1>
            <p className="mt-6 text-[clamp(0.95rem,1.6vw,1.08rem)] leading-7 text-white/[0.88]">
              서비스 기획과 사업 관리를 수행하며 사용자 요구를 정리하고, 이를 실제 서비스 구조로 구체화해 왔습니다. 최근에는 AI를 활용해 반복적인 기획 업무와 서비스 운영 과정을 더 효율적으로 만드는 방법을 공부하고 있습니다.
            </p>

            <div className="mt-12">
              <SectionLabel>Experience</SectionLabel>
              <div className="mt-6 space-y-4">
                {experienceItems.map((item) => (
                  <div
                    key={item.company}
                    className="grid gap-2 border-b border-white/[0.12] pb-4 text-sm sm:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="text-[1.03rem] font-medium leading-5 text-white">
                        {item.company}
                      </p>
                      <p className="mt-1 text-sm font-medium leading-5 text-white/[0.5]">
                        {item.role}
                      </p>
                    </div>
                    <p className="text-xs font-medium leading-5 text-white/46 sm:text-right sm:text-[0.8rem]">
                      {item.period}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-11">
              <SectionLabel>Certifications</SectionLabel>
              <div className="mt-6 space-y-4">
                {certificationItems.map((item) => (
                  <div
                    key={item.title}
                    className="grid gap-2 border-b border-white/[0.12] pb-4 text-sm sm:grid-cols-[1fr_auto]"
                  >
                    <p className="text-[1.03rem] font-medium leading-5 text-white">
                      {item.title}
                    </p>
                    <p className="text-xs font-medium leading-5 text-white/46 sm:text-right sm:text-[0.8rem]">
                      {item.year}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-11">
              <SectionLabel>Work Scope</SectionLabel>
              <div className="mt-6 space-y-5">
                {workRoleBars.map((item) => (
                  <div
                    key={item.label}
                    className="group grid grid-cols-[6.25rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm sm:grid-cols-[7.5rem_minmax(0,1fr)_3rem]"
                  >
                    <div>
                      <p className="font-medium leading-5 text-white">
                        {item.label}
                      </p>
                      {item.note ? (
                        <p className="mt-1 text-[0.68rem] font-medium leading-4 text-white/[0.38]">
                          {item.note}
                        </p>
                      ) : null}
                    </div>
                    <div className="relative h-3 rounded-full bg-white/[0.07]">
                      <div className="pointer-events-none absolute inset-y-[-0.55rem] left-0 right-0 grid grid-cols-4">
                        <span className="border-l border-white/[0.035]" />
                        <span className="border-l border-white/[0.035]" />
                        <span className="border-l border-white/[0.035]" />
                        <span className="border-l border-r border-white/[0.035]" />
                      </div>
                      <div
                        className="relative h-full rounded-full transition duration-200 group-hover:brightness-110"
                        style={{
                          width: `${(item.count / maxRoleBarCount) * 100}%`,
                          background: item.gradient,
                        }}
                      />
                    </div>
                    <p className="text-right text-sm font-medium leading-5 text-white/[0.72]">
                      {item.count}건
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-right text-[0.68rem] font-medium leading-4 text-white/[0.38]">
                * 프로젝트별 수행 역할 기준, 중복 포함
              </p>
            </div>

            <div className="mt-11">
              <SectionLabel>Contact</SectionLabel>
              <a
                href="mailto:kdm9516@gmail.com"
                className="mt-3 inline-block text-sm font-medium text-white hover:text-white/[0.65]"
              >
                kdm9516@gmail.com
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="my-work"
        className="relative overflow-hidden border-t border-white/[0.055] bg-[#141414]"
      >
        <motion.div
          ref={workRef}
          style={{
            scale: shouldReduceMotion ? 1 : workScale,
            opacity: shouldReduceMotion ? 1 : workOpacity,
          }}
          className="min-h-[100svh] w-full origin-top bg-[#141414] px-[clamp(1.875rem,3.45vw,4.875rem)] pb-[clamp(1.5rem,3.2vw,3rem)] pt-[clamp(1rem,2vw,2rem)] text-white"
        >
          <div className="flex min-h-[105svh] w-full flex-col justify-center min-[2200px]:min-h-[95svh]">
            <h2 className="text-[clamp(3.4rem,7.2vw,8.2rem)] font-medium leading-[0.86] tracking-normal min-[2200px]:text-[clamp(4.6rem,10.6vw,10.25rem)]">
              대표 프로젝트
            </h2>
            <div className="mt-[clamp(1.8rem,3.1vw,3.6rem)]">
              {sortedProjects.map((project) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="group grid min-h-[clamp(6.25rem,13vh,9.9rem)] grid-cols-[1fr_auto] items-center border-b border-white/[0.28] text-white transition hover:border-white min-[2200px]:min-h-[clamp(7rem,10.2vh,11rem)]"
                >
                  <span className="text-[clamp(1.65rem,3vw,3.8rem)] font-medium leading-none min-[2200px]:text-[clamp(2.15rem,4.25vw,4.85rem)]">
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

    </main>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/[0.34]">
      {children}
    </p>
  );
}
