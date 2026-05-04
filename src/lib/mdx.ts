import type { ComponentType } from "react";

type ProjectMdxModule = {
  default: ComponentType;
};

const projectMdxLoaders = {
  "m31-controller": () =>
    import("@/content/projects/project-1.mdx") as Promise<ProjectMdxModule>,
  axo: () =>
    import("@/content/projects/project-2.mdx") as Promise<ProjectMdxModule>,
  stylesync: () =>
    import("@/content/projects/project-3.mdx") as Promise<ProjectMdxModule>,
};

export async function getProjectMdx(slug: string) {
  const loader = projectMdxLoaders[slug as keyof typeof projectMdxLoaders];

  if (!loader) {
    return null;
  }

  const mdxModule = await loader();
  return mdxModule.default;
}
