import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";
import "./brand.css";
import "react-phone-number-input/style.css";
import ClientProviders from "@/components/ClientProviders";
import Footer from "./footer";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "The Mind Point",
  description:
    "Learn. Grow. Heal. Belong. Psychology education, practical training and support designed for a kinder, brighter tomorrow.",
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
        className={`${manrope.variable} ${jetbrainsMono.variable} ${cormorant.variable} flex min-h-screen flex-col antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <ClientProviders>{children}</ClientProviders>

        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
