import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Mobile Number",
  description: "Verify your mobile number to create and manage tournaments on Turfzo.",
  alternates: { canonical: "https://turfzo.app/auth/verify-phone" },
  robots: { index: false, follow: false },
};

export default function VerifyPhoneLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
