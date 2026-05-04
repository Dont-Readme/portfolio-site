import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  redirect("/#my-work");
}
