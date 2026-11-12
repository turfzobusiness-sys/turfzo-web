"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";
import { useTheme } from "@/lib/theme-context";

/**
 * Sonner defaults to the light palette; wire it to the app's resolved theme
 * so toasts match `.dark` / `.light` instead of flashing white.
 */
export function Toaster(props: ToasterProps) {
  const { resolved } = useTheme();
  return <SonnerToaster theme={resolved} {...props} />;
}
