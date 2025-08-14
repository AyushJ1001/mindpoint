import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "react-phone-number-input/style.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/components/CartProvider";
import Navbar from "./navbar";
import Footer from "./footer";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

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

// Structured data for the organization
const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "The Mind Point",
  description:
    "A platform for mental health education and support, offering comprehensive courses in psychology, counseling, and professional development.",
  url: "https://themindpoint.org",
  logo: "https://themindpoint.org/logo.png",
  sameAs: ["https://themindpoint.org"],
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "English",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Mental Health Education Courses",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Certificate Courses",
          description:
            "Professional certification programs in psychology and mental health",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Diploma Programs",
          description:
            "Comprehensive diploma courses for in-depth knowledge and expertise",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Therapy Sessions",
          description:
            "Professional therapy and counseling services for mental wellness",
        },
      },
    ],
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
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        {/* Skip link for keyboard users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ClerkProvider dynamic>
          <ConvexClientProvider>
            <CartProvider>
              <Navbar />
              <main
                id="main-content"
                className="flex-grow"
                role="main"
                tabIndex={-1}
              >
                {children}
              </main>
              <Footer />
              <Toaster />
            </CartProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
