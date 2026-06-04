import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Turfzo",
  description: "Get in touch with the Turfzo team for support, partnerships, or any other inquiries.",
  alternates: { canonical: "https://turfzo.app/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
