"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthModal, type AuthMode } from "@/lib/auth-modal-context";
import { safeRedirectTarget } from "@/lib/redirect";

function AuthModalRedirectInner({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuthModal();

  React.useEffect(() => {
    const redirect = safeRedirectTarget(searchParams.get("redirect"));
    openAuthModal(mode, redirect);
    router.replace("/");
  }, [mode, openAuthModal, router, searchParams]);

  return null;
}

export function AuthModalRedirect({ mode }: { mode: AuthMode }) {
  return (
    <React.Suspense fallback={null}>
      <AuthModalRedirectInner mode={mode} />
    </React.Suspense>
  );
}
