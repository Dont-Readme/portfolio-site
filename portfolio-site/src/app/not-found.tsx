import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col justify-center px-5 py-20 text-center sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
        Not found
      </p>
      <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">
        요청한 페이지를 찾을 수 없습니다.
      </h1>
      <p className="mt-5 text-base leading-7 text-muted">
        프로젝트 slug가 바뀌었거나 아직 등록되지 않은 페이지일 수 있습니다.
      </p>
      <Link
        href="/projects"
        className="mx-auto mt-8 inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-semibold text-background transition hover:bg-accent-strong"
      >
        Projects로 돌아가기
      </Link>
    </div>
  );
}
