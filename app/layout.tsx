import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import "@/lib/env-init";
import { AuthProvider } from "@/lib/auth-context";
import { OrganizationSchema, WebSiteSchema } from "@/lib/schema";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const SITE_URL = "https://turfzo.com";

export const metadata: Metadata = {
  title: {
    default: "Turfzo | Book Premium Turfs & Sports Venues Instantly",
    template: "%s | Turfzo",
  },
  description:
    "Turfzo is India's premium turf booking platform. Book football turfs, cricket grounds, badminton courts, and sports venues instantly across 8+ cities. Real-time availability, secure payments, and instant confirmation.",
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
      "India's premium turf booking platform. Book football turfs, cricket grounds, and sports venues instantly across 8+ cities.",
    images: [
      {
        url: "/og-image.png",
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
    images: ["/og-image.png"],
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
      className={`${poppins.variable} ${inter.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <OrganizationSchema
          name="Turfzo"
          url={SITE_URL}
          logo={`${SITE_URL}/turfzo_mascot.svg`}
          description="India's premium turf booking platform. Book football turfs, cricket grounds, and sports venues instantly across 8+ cities."
          sameAs={[
            "https://instagram.com/turfzo",
            "https://twitter.com/turfzo",
            "https://youtube.com/@turfzo",
            "https://linkedin.com/company/turfzo",
          ]}
        />
        <WebSiteSchema
          name="Turfzo"
          url={SITE_URL}
          potentialAction={{
            target: `${SITE_URL}/explore?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg-dark text-text-main selection:bg-brand-lime selection:text-black">
        <AuthProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
