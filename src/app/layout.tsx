import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteShell } from "@/components/layout/SiteShell";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const defaultOgImage = {
  url: "/images/social/portfolio-og.png",
  width: 1200,
  height: 630,
  alt: "Portfolio project preview",
};

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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    locale: "ko_KR",
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [defaultOgImage.url],
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
