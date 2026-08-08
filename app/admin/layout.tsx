import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminGuard } from "@/components/admin/admin-guard";

export const metadata: Metadata = {
  title: "Admin Dashboard | Turfzo",
  description: "Turfzo administrator dashboard.",
};

// W3: server-side gate. The httpOnly cookie is only minted by
// /api/auth/admin-session after the Firebase ID token resolves to an
// admin role in Convex. Without it, admin HTML is not even rendered.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const verified = cookieStore.get("tz_admin_verified")?.value === "1";

  if (!verified) {
    redirect("/auth/login?redirect=/admin");
  }

  return <AdminGuard>{children}</AdminGuard>;
}
