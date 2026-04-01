import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Fraunces,
} from "next/font/google";
import "./globals.css";
import "react-phone-number-input/style.css";
import { PostHogProvider } from "@/components/PostHogProvider";
import ClientProviders from "@/components/ClientProviders";
import Footer from "./footer";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "The Mind Point",
  description: "A platform for mental health education and support",
  icons: {
    icon: "/logo.ico",
  },
  metadataBase: new URL("https://themindpoint.org"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://themindpoint.org",
    siteName: "The Mind Point",
    images: [
      {
        url: "/logo.png",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Analytics />
      </head>
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${fraunces.variable} flex min-h-screen flex-col antialiased`}
      >
        {/* Skip link for keyboard users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <PostHogProvider>
          <ClientProviders>
            {children}
          </ClientProviders>

          <Footer />
          <Toaster />
        </PostHogProvider>
      </body>
    </html>
  );
}
