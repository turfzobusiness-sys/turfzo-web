"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthModal, type AuthMode } from "@/lib/auth-modal-context";

export function AuthModalRedirect({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { openAuthModal } = useAuthModal();

  React.useEffect(() => {
    openAuthModal(mode);
    router.replace("/");
  }, [mode, openAuthModal, router]);

  return null;
}
