import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { QueryProvider } from "@/lib/query-provider";
import { AntiInspectGuard } from "@/components/security/AntiInspectGuard";
import { RouteProgressBar } from "@/components/ui/route-progress";
import { Suspense } from "react";
import { ResponsiveProvider } from "@/responsive/ResponsiveProvider";
import { ResponsiveDebug } from "@/components/responsive/ResponsiveDebug";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://aimetra.institution.edu"),
  title: {
    default: "AIMETRA — AI & ML Education, Talent, Research & Analytics",
    template: "%s | AIMETRA",
  },
  description:
    "AIMETRA is the intelligence layer for the AI & ML department, connecting students, faculty, research, projects, opportunities, alumni and institutional data into one intelligent academic environment.",
  keywords: [
    "AIMETRA",
    "Artificial Intelligence Department",
    "Machine Learning Department",
    "Academic Intelligence Layer",
    "Student Research Portfolio",
    "Faculty Expertise Directory",
    "Institutional Analytics",
    "AI Education",
  ],
  authors: [{ name: "Department of Artificial Intelligence & Machine Learning" }],
  creator: "AIMETRA Institutional Computing",
  publisher: "Department of Artificial Intelligence & Machine Learning",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aimetra.institution.edu",
    siteName: "AIMETRA",
    title: "AIMETRA — AI & ML Education, Talent, Research & Analytics",
    description:
      "The intelligence layer for the AI & ML department. Connecting students, faculty, research, projects, and institutional data.",
    images: [
      {
        url: "/images/hero-campus.png",
        width: 1200,
        height: 630,
        alt: "AIMETRA — Department of Artificial Intelligence & Machine Learning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIMETRA — AI & ML Education, Talent, Research & Analytics",
    description:
      "The intelligence layer for the AI & ML department. Connecting students, faculty, research, projects, and institutional data.",
    images: ["/images/hero-campus.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": "https://aimetra.institution.edu/#organization",
        name: "AIMETRA — Department of Artificial Intelligence & Machine Learning",
        url: "https://aimetra.institution.edu",
        description:
          "Institutional intelligence layer for the Department of Artificial Intelligence & Machine Learning.",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Academic Block 4, Innovation Campus",
          addressLocality: "Bengaluru",
          addressRegion: "Karnataka",
          postalCode: "560064",
          addressCountry: "IN",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://aimetra.institution.edu/#application",
        name: "AIMETRA",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        description:
          "The intelligence layer connecting students, faculty, research, projects, opportunities, and analytics.",
      },
    ],
  };

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-canvas text-ink">
        {/* Accessible Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#111111] focus:text-white focus:rounded-md focus:text-xs focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>
        <QueryProvider>
          <AuthProvider>
            <ResponsiveProvider>
              <AntiInspectGuard />
              <Suspense fallback={null}>
                <RouteProgressBar />
              </Suspense>
              {children}
              <ResponsiveDebug />
            </ResponsiveProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
