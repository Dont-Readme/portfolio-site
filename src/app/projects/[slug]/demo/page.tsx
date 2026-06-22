import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProposalAutomationDemo } from "@/components/projects/ProposalAutomationDemo";

type ProjectDemoPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const metadata: Metadata = {
  title: "제안서 자동화 데모",
  description: "샘플 RFP 기반 제안서 자동화 인터랙티브 데모",
};

export function generateStaticParams() {
  return [{ slug: "proposal-auto" }];
}

export default async function ProjectDemoPage({ params }: ProjectDemoPageProps) {
  const { slug } = await params;

  if (slug !== "proposal-auto") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-black">
      <Link
        href="/projects/proposal-auto"
        className="absolute left-6 top-5 z-40 text-xs font-medium text-black/48 transition duration-200 hover:-translate-x-1 hover:text-black sm:left-10 sm:top-8"
      >
        &lt; 제안서 자동화 프로젝트
      </Link>
      <ProposalAutomationDemo />
    </main>
  );
}
