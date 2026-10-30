import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "react-phone-number-input/style.css";
import ClientProviders from "@/components/ClientProviders";
import Footer from "./footer";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import ConsentBanner from "@/components/ConsentBanner";
import { DiwaliMarquee } from "@/components/landing/DiwaliMarquee";

// Self-hosted variable fonts. These used to be fetched through
// `next/font/google` at build time, which made every CI and Vercel build depend
// on Google's CSS response; when that response arrived in an unexpected shape
// the build died with "next/font/google queries have exactly one entry". The
// files in ./fonts are the latin subsets, and the families, weights and CSS
// variables are unchanged.
const plusJakarta = localFont({
  src: "./fonts/plus-jakarta-sans-latin.woff2",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  variable: "--font-jetbrains-mono",
  weight: "100 800",
  display: "swap",
});

const fraunces = localFont({
  src: "./fonts/fraunces-latin.woff2",
  variable: "--font-syne",
  weight: "100 900",
  display: "swap",
});

const dmSans = localFont({
  src: "./fonts/dm-sans-latin.woff2",
  variable: "--font-dm-sans",
  weight: "100 1000",
  display: "swap",
});

const caveat = localFont({
  src: "./fonts/caveat-latin.woff2",
  variable: "--font-caveat",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Mind Point",
  description: "A platform for mental health education and support",
  // Icons come from the file conventions in this folder (favicon.ico, icon.png,
  // apple-icon.png), all cut from public/brand/the-mind-point-mark.png.
  metadataBase: new URL("https://www.themindpoint.org"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.themindpoint.org",
    siteName: "The Mind Point",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Mind Point - Mental Health Education Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@themindpoint",
    creator: "@themindpoint",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#173F3A" },
    { media: "(prefers-color-scheme: dark)", color: "#0B2422" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Analytics />
        <AnalyticsScripts />
      </head>
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${dmSans.variable} ${caveat.variable} flex min-h-screen flex-col antialiased`}
      >
        {/* Skip link for keyboard users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <DiwaliMarquee />
        <ClientProviders>{children}</ClientProviders>

        <Footer />
        <Toaster />
        <ConsentBanner />
      </body>
    </html>
  );
}
