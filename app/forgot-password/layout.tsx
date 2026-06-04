import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Turfzo",
  description: "Reset your Turfzo account password.",
  alternates: { canonical: "https://turfzo.app/forgot-password" },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
