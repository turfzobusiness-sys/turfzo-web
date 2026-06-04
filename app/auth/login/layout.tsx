import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Turfzo",
  description: "Sign in to your Turfzo account to manage bookings and preferences.",
  alternates: { canonical: "https://turfzo.app/auth/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
