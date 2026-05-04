import Image from "next/image";

type ProjectImageProps = {
  src?: string;
  alt: string;
  caption?: string;
};

export function ProjectImage({ src, alt, caption }: ProjectImageProps) {
  return (
    <figure className="mt-6">
      <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-line bg-background">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 760px, 100vw"
            unoptimized={src.endsWith(".svg")}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            이미지 TBD
          </div>
        )}
      </div>
      {caption ? (
        <figcaption className="mt-3 text-sm leading-6 text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
