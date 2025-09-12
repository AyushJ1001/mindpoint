import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "react-phone-number-input/style.css";
import { PostHogProvider } from "@/components/PostHogProvider";
import ClientProviders from "@/components/ClientProviders";
import ClientNavbar from "@/components/ClientNavbar";
import Footer from "./footer";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import StructuredData from "@/components/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Mind Point",
  description: "A platform for mental health education and support",
  icons: {
    icon: "/logo.png",
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
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        {/* Skip link for keyboard users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <PostHogProvider>
          <ClientProviders>
            <StructuredData />
            <ClientNavbar />

            <main
              id="main-content"
              className="flex-grow"
              role="main"
              tabIndex={-1}
            >
              {children}
            </main>
          </ClientProviders>

          <Footer />
          <Toaster />
        </PostHogProvider>
      </body>
    </html>
  );
}
