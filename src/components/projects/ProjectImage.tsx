import Image from "next/image";

type ProjectImageProps = {
  src?: string;
  alt: string;
  caption?: string;
  className?: string;
  variant?: "default" | "immersive" | "screen";
};

export function ProjectImage({
  src,
  alt,
  caption,
  className,
  variant = "default",
}: ProjectImageProps) {
  const isImmersive = variant === "immersive";
  const isScreen = variant === "screen";

  return (
    <figure className={["mt-8", className].filter(Boolean).join(" ")}>
      <div
        className={
          isImmersive
            ? "relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden bg-transparent"
            : isScreen
              ? "relative min-h-[clamp(34rem,72svh,52rem)] overflow-hidden bg-transparent"
            : "relative aspect-[16/9] overflow-hidden bg-transparent"
        }
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            sizes={
              isImmersive
                ? "100vw"
                : isScreen
                  ? "(min-width: 1024px) 38vw, 100vw"
                  : "(min-width: 1024px) 900px, 100vw"
            }
            unoptimized
          />
        ) : (
          <div className="flex min-h-[inherit] w-full items-center justify-center border border-dashed border-black/15 px-6 text-center text-sm font-medium text-black/35">
            이미지 추가 예정
          </div>
        )}
      </div>
      {caption ? (
        <figcaption className="mt-4 text-center text-base font-semibold leading-6 text-black">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
