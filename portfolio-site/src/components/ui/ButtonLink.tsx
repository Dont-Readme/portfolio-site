import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: ButtonLinkProps) {
  const className =
    variant === "primary"
      ? "bg-foreground text-background hover:bg-accent-strong"
      : "border border-line bg-surface text-foreground hover:border-accent hover:text-accent-strong";

  return (
    <Link
      href={href}
      className={[
        "inline-flex min-h-11 items-center justify-center rounded-md px-5 text-sm font-semibold transition",
        className,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
