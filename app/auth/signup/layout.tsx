import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a Turfzo account to start booking turfs and sports venues instantly.",
  alternates: { canonical: "https://turfzo.app/auth/signup" },
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
