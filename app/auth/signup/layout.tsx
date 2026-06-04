import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Turfzo",
  description: "Create a Turfzo account to start booking turfs and sports venues instantly.",
  alternates: { canonical: "https://turfzo.app/auth/signup" },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
