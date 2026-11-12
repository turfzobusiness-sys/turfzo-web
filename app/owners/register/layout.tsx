import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Your Turf — Partner Registration",
  description:
    "Create a Turfzo partner account to list your turf, manage slots and receive payouts.",
  alternates: { canonical: "https://turfzo.app/owners/register" },
  robots: { index: false, follow: true },
};

export default function OwnerRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
