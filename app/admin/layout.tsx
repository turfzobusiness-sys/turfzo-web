import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Turfzo",
  description: "Turfzo administrator dashboard.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
