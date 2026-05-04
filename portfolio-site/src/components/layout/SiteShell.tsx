import { Header } from "@/components/layout/Header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
