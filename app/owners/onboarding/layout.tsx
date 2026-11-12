import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Onboarding",
  alternates: { canonical: "https://turfzo.app/owners/onboarding" },
  robots: { index: false, follow: false },
};

export default function OwnerOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
