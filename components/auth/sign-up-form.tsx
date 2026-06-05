"use client";

import * as React from "react";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { cn } from "@/lib/utils";

export function SignUpForm({ onSuccess }: { onSuccess?: () => void }) {
  const { signUp, signInWithGoogle, error } = useAuth();
  const { closeAuthModal } = useAuthModal();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await signUp({
        email,
        password,
        role: "player",
        displayName: name,
      });
      onSuccess?.();
      closeAuthModal();
    } catch {
      // error set in auth context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
      closeAuthModal();
    } catch {
      // error set in auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {error && (
        <div
          role="alert"
          className="rounded-md border border-error/30 bg-error/10 px-3 py-2 font-sans text-xs text-error-light"
        >
          {error}
        </div>
      )}

      {/* Name */}
      <div className="relative">
        <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted/75 transition-colors" />
        <input
          id="auth-signup-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          required
          autoComplete="name"
          className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-10 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted/50 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/15 transition-all duration-200"
        />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted/75 transition-colors" />
        <input
          id="auth-signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          autoComplete="email"
          className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-10 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted/50 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/15 transition-all duration-200"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted/75 transition-colors" />
        <input
          id="auth-signup-password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 chars)"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-10 pr-10 font-sans text-sm text-text-main placeholder:text-text-muted/50 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/15 transition-all duration-200"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[6px] text-text-muted hover:bg-surface hover:text-text-main transition-colors"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#0f1f0f] border border-brand-lime/25 px-4 py-2.5 font-poppins font-bold text-sm text-white transition-all duration-300",
          "hover:border-brand-lime/40 active:scale-[0.99]",
          "disabled:cursor-not-allowed disabled:bg-elevated disabled:text-text-muted/50"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account…
          </>
        ) : (
          "Create Account"
        )}
      </button>

      {/* Divider */}
      <div className="relative my-1.5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-default" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-bg px-2 font-sans text-[10px] uppercase tracking-wider text-text-muted">
            or
          </span>
        </div>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2 rounded-md border border-border-default bg-elevated px-4 py-2.5 font-sans text-sm font-semibold text-text-main transition-all duration-300",
          "hover:border-border-strong hover:bg-elevated/70",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>
    </form>
  );
}
