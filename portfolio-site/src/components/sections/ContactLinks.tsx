import { profile } from "@/data/profile";

const linkClass =
  "flex min-h-12 items-center justify-between gap-4 rounded-md border border-line bg-background px-4 py-3 text-sm font-semibold transition hover:border-accent hover:text-accent-strong";

export function ContactLinks() {
  const links = [
    profile.linkedinUrl ? { label: "LinkedIn", url: profile.linkedinUrl } : null,
    profile.githubUrl ? { label: "GitHub", url: profile.githubUrl } : null,
    ...(profile.externalProfileUrls ?? []),
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <div>
      <a href={`mailto:${profile.email}`} className={linkClass}>
        <span>Email</span>
        <span className="break-all text-muted">{profile.email}</span>
      </a>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            <span>{link.label}</span>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}
