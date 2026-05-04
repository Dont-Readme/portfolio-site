import Link from "next/link";
import { profile } from "@/data/profile";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted sm:px-8 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name}. Project reference
          portfolio.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/projects" className="hover:text-foreground">
            Projects
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
