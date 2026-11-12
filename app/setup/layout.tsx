import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Initial Admin Setup",
  description: "One-time Turfzo administrator setup.",
  alternates: { canonical: "https://turfzo.app/setup" },
  robots: { index: false, follow: false },
};

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
