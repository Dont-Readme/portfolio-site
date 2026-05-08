import Image from "next/image";

type ProjectImageProps = {
  src?: string;
  alt: string;
  caption?: string;
  className?: string;
  variant?:
    | "default"
    | "immersive"
    | "screen"
    | "screenBalanced"
    | "screenCompact"
    | "screenLandscape"
    | "wide";
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
  const isScreenBalanced = variant === "screenBalanced";
  const isScreenCompact = variant === "screenCompact";
  const isScreenLandscape = variant === "screenLandscape";
  const isWide = variant === "wide";

  return (
    <figure className={["mt-8", className].filter(Boolean).join(" ")}>
      <div
        className={
          isImmersive
            ? "relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden bg-transparent"
            : isScreen
              ? "relative min-h-[clamp(34rem,72svh,52rem)] overflow-hidden bg-transparent"
              : isScreenBalanced
                ? "relative min-h-[clamp(29rem,58svh,42rem)] overflow-hidden bg-transparent"
              : isScreenCompact
                ? "relative min-h-[clamp(24rem,52svh,38rem)] overflow-hidden bg-transparent"
              : isScreenLandscape
                ? "relative aspect-[1807/1163] overflow-hidden bg-transparent"
              : isWide
                ? "relative aspect-[1432/366] overflow-hidden bg-transparent"
            : "relative aspect-[16/9] overflow-hidden bg-transparent"
        }
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={
              isImmersive
                ? "100vw"
                : isScreen
                  ? "(min-width: 1024px) 38vw, 100vw"
                  : isScreenBalanced
                    ? "(min-width: 1024px) 38vw, 100vw"
                  : isScreenCompact
                    ? "(min-width: 1024px) 28vw, 100vw"
                  : isScreenLandscape
                    ? "(min-width: 1024px) 38vw, 100vw"
                  : "(min-width: 1024px) 900px, 100vw"
            }
            className="object-contain"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center border border-dashed border-black/15 px-6 text-center text-sm font-medium text-black/35">
            이미지 추가 예정
          </div>
        )}
      </div>
      {caption ? (
        <figcaption
          className={[
            isWide || isScreenLandscape || isScreenBalanced ? "mt-2" : "mt-4",
            "text-center text-base font-semibold leading-6 text-black",
          ].join(" ")}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
