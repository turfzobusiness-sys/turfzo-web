"use client";

import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { mode, setMode } = useTheme();

  const cycle = () => {
    if (mode === "dark") setMode("light");
    else if (mode === "light") setMode("system");
    else setMode("dark");
  };

  const Icon = mode === "dark" ? Moon : mode === "light" ? Sun : Monitor;
  const label = mode === "dark" ? "Dark mode" : mode === "light" ? "Light mode" : "System";

  return (
    <button
      onClick={cycle}
      className={`relative p-2.5 bg-surface border border-border-default hover:border-border-strong rounded-[12px] text-text-muted hover:text-text-main transition-all duration-300 ${className}`}
      title={label}
      aria-label={`Switch theme: currently ${label}`}
    >
      <motion.div
        key={mode}
        initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="w-4 h-4" />
      </motion.div>
    </button>
  );
}
