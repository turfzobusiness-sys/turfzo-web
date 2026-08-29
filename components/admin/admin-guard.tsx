"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

// Client-side UX gate only — it hides the admin panel from non-admins.
// The security boundary is server-side: every admin Convex function
// re-checks assertRole(user, "admin"). (A previous version also minted a
// tz_admin_verified cookie that nothing consumed; that machinery was
// removed so nobody mistakes it for enforcement.)
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { convexUser, status } = useAuth();
  const router = useRouter();

  // Authorization is derived from auth state during render (not stored in
  // state), so there is no setState-in-effect. Side effects (redirects)
  // remain in the effect.
  const isAuthorized =
    status === "authenticated" &&
    !!convexUser &&
    convexUser.role === "admin";

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/login?redirect=/admin");
      return;
    }

    if (status === "authenticated" && (!convexUser || convexUser.role !== "admin")) {
      router.push("/");
      return;
    }
  }, [status, convexUser, router]);

  if (status === "loading" || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
