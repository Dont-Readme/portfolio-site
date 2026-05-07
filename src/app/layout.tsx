import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteShell } from "@/components/layout/SiteShell";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const eliceDXNeolli = localFont({
  variable: "--font-elice-dx-neolli",
  display: "swap",
  src: [
    {
      path: "./fonts/EliceDXNeolli-Medium.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/EliceDXNeolli-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/EliceDXNeolli-Bold.ttf",
      weight: "600 900",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${eliceDXNeolli.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
