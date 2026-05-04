export type ProjectMeta = {
  title: string;
  slug: string;
  summary: string;
  period?: string;
  role: string;
  category?: string;
  tags: string[];
  thumbnailImage?: string;
  order: number;
};

export type ProjectImage = {
  src: string;
  alt: string;
  caption?: string;
};

export const projects: ProjectMeta[] = [
  {
    title: "현대자동차 IDS 프로젝트",
    slug: "Hyundai-IDS",
    summary: "대표 프로젝트 소개를 준비 중입니다.",
    period: "2026",
    role: "Planning",
    category: "Prototyping",
    tags: ["Planning"],
    thumbnailImage: "/images/projects/project-1/thumbnail.svg",
    order: 1,
  },
  {
    title: "AXO",
    slug: "axo",
    summary: "대표 프로젝트 소개를 준비 중입니다.",
    period: "2026",
    role: "Product",
    category: "Bio Materials",
    tags: ["Product"],
    thumbnailImage: "/images/projects/project-2/thumbnail.svg",
    order: 2,
  },
  {
    title: "StyleSync",
    slug: "stylesync",
    summary: "대표 프로젝트 소개를 준비 중입니다.",
    period: "2026",
    role: "UX",
    category: "ML / AI",
    tags: ["UX"],
    thumbnailImage: "/images/projects/project-3/thumbnail.svg",
    order: 3,
  },
  {
    title: "StackeRs",
    slug: "stackers",
    summary: "대표 프로젝트 소개를 준비 중입니다.",
    period: "2026",
    role: "Service",
    category: "Packaging",
    tags: ["Service"],
    order: 4,
  },
  {
    title: "ASTRA",
    slug: "astra",
    summary: "대표 프로젝트 소개를 준비 중입니다.",
    period: "2026",
    role: "Strategy",
    category: "GIZMO",
    tags: ["Strategy"],
    order: 5,
  },
];
