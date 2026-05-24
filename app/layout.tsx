import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Turfzo | Premium Turf Booking Experience",
  description: "Book premium turfs near you instantly. Turfzo makes it simple to discover, compare, and book the finest sports turfs, pitches, and courts. Play. Enjoy. Repeat.",
  keywords: ["turf booking", "premium turfs", "football turf", "cricket ground", "book sports venue", "turfzo"],
  openGraph: {
    title: "Turfzo | Premium Turf Booking Experience",
    description: "Book premium turfs near you instantly. Discover and secure top-tier venues for your next game.",
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
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-bg-dark text-text-main selection:bg-brand-lime selection:text-black">
        {children}
      </body>
    </html>
  );
}

