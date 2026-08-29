import type { Metadata } from "next";
import { Nunito, Anton } from "next/font/google";
import "./globals.css";
import "@/lib/env-init";
import { AuthProvider } from "@/lib/auth-context";
import { AuthModalProvider } from "@/lib/auth-modal-context";
import { ThemeProvider } from "@/lib/theme-context";
import { OrganizationSchema, WebSiteSchema, SiteNavigationSchema } from "@/lib/schema";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { AuthModal } from "@/components/ui/auth-modal";
import { Toaster } from "sonner";
import { DatadogAppRouter } from "@datadog/browser-rum-nextjs";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const SITE_URL = "https://turfzo.app";

export const metadata: Metadata = {
  title: {
    default: "Turfzo | Book Premium Turfs & Sports Venues Instantly",
    template: "%s | Turfzo",
  },
  description:
    "Turfzo is India's premium turf booking platform. Book football turfs, cricket grounds, badminton courts, and sports venues instantly across 9 cities. Real-time availability, secure payments, and instant confirmation.",
  keywords: [
    "turf booking",
    "football turf near me",
    "cricket ground booking",
    "sports venue booking",
    "turf booking app",
    "book turf online",
    "football ground near me",
    "badminton court booking",
    "turf rental",
    "sports ground booking India",
  ],
  authors: [{ name: "Turfzo" }],
  creator: "Turfzo",
  publisher: "Turfzo",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Turfzo",
    title: "Turfzo | Book Premium Turfs & Sports Venues Instantly",
    description:
      "India's premium turf booking platform. Book football turfs, cricket grounds, and sports venues instantly across 9 cities.",
    images: [
      {
        url: "/turfzo_mascot.svg",
        width: 1200,
        height: 630,
        alt: "Turfzo - Premium Turf Booking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Turfzo | Book Premium Turfs & Sports Venues Instantly",
    description:
      "India's premium turf booking platform. Book football turfs, cricket grounds, and sports venues instantly.",
    images: ["/turfzo_mascot.svg"],
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
  verification: {
    // Add when available: google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${anton.variable} h-full antialiased scroll-smooth dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <OrganizationSchema
          name="Turfzo"
          url={SITE_URL}
          logo={`${SITE_URL}/turfzo_mascot.svg`}
          description="India's premium turf booking platform. Book football turfs, cricket grounds, and sports venues instantly across 9 cities."
          sameAs={[
            "https://instagram.com/turfzo",
            "https://twitter.com/turfzo",
            "https://youtube.com/@turfzo",
            "https://linkedin.com/company/turfzo",
          ]}
          contactPoint={{
            telephone: "+91-78452-41686",
            contactType: "customer service",
            areaServed: "IN",
            availableLanguage: ["en", "hi"],
          }}
        />
        <WebSiteSchema
          name="Turfzo"
          url={SITE_URL}
          potentialAction={{
            target: `${SITE_URL}/explore?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          }}
          description="Book sports venues instantly across India"
        />
        <SiteNavigationSchema
          items={[
            { name: "Book Turfs", url: `${SITE_URL}/explore` },
            { name: "How It Works", url: `${SITE_URL}/how-it-works` },
            { name: "Tournaments", url: `${SITE_URL}/tournaments` },
            { name: "List Your Turf", url: `${SITE_URL}/owners` },
            { name: "Contact Support", url: `${SITE_URL}/contact` },
            { name: "Terms of Service", url: `${SITE_URL}/terms` },
            { name: "Privacy Policy", url: `${SITE_URL}/privacy` },
            { name: "Refund Policy", url: `${SITE_URL}/refund-policy` },
          ]}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-bg text-text-main selection:bg-brand-lime/30 selection:text-text-main">
        <DatadogAppRouter />
        <ThemeProvider>
          <AuthProvider>
            <AuthModalProvider>
              <AnalyticsProvider>{children}</AnalyticsProvider>
              <Toaster position="top-right" richColors />
              <AuthModal />
            </AuthModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
