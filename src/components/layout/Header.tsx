"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/#top", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/#my-work", label: "Projects" },
];

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isHomePage = pathname === "/";
  const isProjectDetailPage = pathname.startsWith("/projects/");

  if (isHomePage) {
    return null;
  }

  if (isProjectDetailPage) {
    return (
      <header className="absolute right-6 top-5 z-50 sm:right-10 sm:top-8">
        <Link
          href="/#top"
          className="text-xs font-medium text-black/55 transition hover:text-black"
        >
          Home
        </Link>
      </header>
    );
  }

  return (
    <header className="fixed right-6 top-5 z-50 sm:right-10 sm:top-8">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="site-menu"
        onClick={() => setIsOpen((current) => !current)}
        className="text-xs font-medium text-white/[0.62] mix-blend-difference transition hover:text-white"
      >
        Menu
      </button>

      {isOpen ? (
        <nav
          id="site-menu"
          aria-label="Main navigation"
          className="mt-3 min-w-36 rounded-sm border border-white/[0.12] bg-[#1b1b1b]/96 p-2 text-left shadow-2xl backdrop-blur"
        >
          {navItems.map((item) => {
            const isActive = item.href === "/about" && pathname === "/about";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={[
                  "block rounded-sm px-3 py-2.5 text-[0.95rem] transition",
                  isActive
                    ? "text-white"
                    : "text-white/[0.58] hover:bg-white/[0.07] hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
