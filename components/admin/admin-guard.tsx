"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { convexUser, status, getIdToken, firebaseUser } = useAuth();
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

    // W3: server-side gate — ask the server to mint the httpOnly
    // admin cookie (it independently verifies the Firebase token
    // against Convex). Fire-and-forget; the layout blocks without it.
    if (status === "authenticated" && convexUser?.role === "admin") {
      void (async () => {
        try {
          if (!firebaseUser) return;
          const token = await getIdToken(firebaseUser);
          await fetch("/api/auth/admin-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: token }),
          });
        } catch {
          // Non-fatal: client-side guard still gates the UI.
        }
      })();
    }
  }, [status, convexUser, router, firebaseUser, getIdToken]);

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
