type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-base leading-7 text-muted">{description}</p>
      ) : null}
    </div>
  );
}
