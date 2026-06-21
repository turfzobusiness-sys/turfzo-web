"use client";

import * as React from "react";
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { cn } from "@/lib/utils";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { toast } from "sonner";

export function SignUpForm({ onSuccess, role }: { onSuccess?: () => void; role?: string }) {
  const { signUp, signInWithGoogle, error } = useAuth();
  const { closeAuthModal, returnTo } = useAuthModal();
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const [turnstileError, setTurnstileError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!turnstileToken) {
      setTurnstileError("Please complete the bot verification.");
      return;
    }
    setLoading(true);
    setTurnstileError(null);
    try {
      await signUp({
        email,
        password,
        role: role ?? "player",
        displayName: name,
      });
      onSuccess?.();
      toast.success("Account created successfully!");
      setTimeout(() => {
        closeAuthModal();
        if (returnTo) {
          router.push(returnTo);
        }
      }, 2000);
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
      toast.success("Account created successfully!");
      setTimeout(() => {
        closeAuthModal();
        if (returnTo) {
          router.push(returnTo);
        }
      }, 2000);
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

      {false && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 font-sans text-xs text-green-400">
          Account created successfully!
        </div>
      )}

      {turnstileError && (
        <div
          role="alert"
          className="rounded-md border border-error/30 bg-error/10 px-3 py-2 font-sans text-xs text-error-light flex items-center gap-2"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {turnstileError}
        </div>
      )}

      {/* Name */}
      <div className="relative">
        <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-colors" />
        <input
          id="auth-signup-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          required
          autoComplete="name"
          className="w-full rounded-md border border-border-default bg-bg py-2.5 pl-10 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-border-strong transition-all duration-200"
        />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-colors" />
        <input
          id="auth-signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          autoComplete="email"
          className="w-full rounded-md border border-border-default bg-bg py-2.5 pl-10 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-border-strong transition-all duration-200"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-colors" />
        <input
          id="auth-signup-password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 chars)"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-md border border-border-default bg-bg py-2.5 pl-10 pr-10 font-sans text-sm text-text-main placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-border-strong transition-all duration-200"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-text-muted hover:bg-elevated hover:text-text-main transition-colors"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* Turnstile */}
      <div className="flex justify-center pt-1">
        <TurnstileWidget
          onVerify={(token) => {
            setTurnstileToken(token);
            setTurnstileError(null);
          }}
          onExpire={() => setTurnstileToken(null)}
          onError={() => {
            setTurnstileToken(null);
            setTurnstileError("Verification failed. Please try again.");
          }}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-bg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong focus-visible:border-border-strong disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-text-main text-bg hover:bg-text-main/90 mt-2"
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
      <div className="relative my-1.5 pt-1">
        <div className="absolute inset-0 flex items-center pt-1">
          <div className="w-full border-t border-border-default" />
        </div>
        <div className="relative flex justify-center pt-1">
          <span className="bg-bg px-2 font-sans text-[10px] text-text-muted">
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
