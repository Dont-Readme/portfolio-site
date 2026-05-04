import type { MDXComponents } from "mdx/types";
import { ProjectImage } from "@/components/projects/ProjectImage";

const components: MDXComponents = {
  ProjectImage,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
