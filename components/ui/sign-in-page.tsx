"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export function SignInPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, error } = useAuth();

  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/");
    } catch {
      // error is set in auth context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/");
    } catch {
      // error is set in auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-bg text-text-main flex overflow-hidden">
      {/* Left Panel — Brand / Mascot */}
      <div className="relative hidden lg:flex flex-1 items-center justify-center overflow-hidden border-r border-border-default">
        {/* Background: layered professional gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-bg to-elevated" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(109,182,49,0.07),transparent_55%)]" />

        {/* Back button */}
        <Link
          href="/"
          aria-label="Back to home"
          className="absolute top-6 left-6 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-text-main hover:bg-black/50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {/* Centered brand block */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center px-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            <Image
              src="/turfzo_mascot.svg"
              alt="Turfzo mascot"
              width={280}
              height={280}
              priority
              className="h-56 w-56 xl:h-64 xl:w-64"
            />
          </motion.div>

          <h1 className="mt-8 font-poppins font-extrabold text-6xl xl:text-7xl tracking-tighter leading-none">
            <span className="text-text-main">turf</span>
            <span className="text-brand-lime">zo</span>
          </h1>
          <p className="mt-4 font-sans text-sm xl:text-base tracking-[0.3em] uppercase text-text-muted font-bold">
            Book <span className="text-brand-lime">•</span> Play{" "}
            <span className="text-brand-lime">•</span> Enjoy
          </p>
          <p className="mt-10 max-w-sm font-sans text-sm xl:text-base text-text-muted leading-relaxed">
            India&apos;s premium turf booking platform. Football, cricket,
            badminton — find, book, and play in minutes.
          </p>
        </motion.div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto px-5 py-10 sm:px-8 bg-bg">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile-only brand row */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/turfzo_mascot.svg"
                alt="Turfzo"
                width={36}
                height={36}
                className="h-9 w-9"
                priority
              />
              <span className="font-poppins font-extrabold text-xl text-text-main">
                turf<span className="text-brand-lime">zo</span>
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-default text-text-muted hover:text-text-main hover:border-border-strong"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="font-poppins text-3xl xl:text-4xl font-extrabold text-text-main tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 font-sans text-sm text-text-muted">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-semibold text-brand-lime hover:text-brand-lime-hover transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-md border border-error/30 bg-error/10 px-4 py-3 font-sans text-sm text-error-light"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-sans text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-md border border-border-default bg-elevated py-3 pl-11 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted/60 focus:border-brand-lime/40 focus:outline-none focus:ring-2 focus:ring-brand-lime/20 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block font-sans text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-md border border-border-default bg-elevated py-3 pl-11 pr-12 font-sans text-sm text-text-main placeholder:text-text-muted/60 focus:border-brand-lime/40 focus:outline-none focus:ring-2 focus:ring-brand-lime/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-text-muted hover:bg-surface hover:text-text-main transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 font-sans text-sm text-text-muted">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border-strong bg-elevated text-brand-lime accent-brand-lime"
                />
                <span>Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="font-sans text-sm font-medium text-brand-lime hover:text-brand-lime-hover transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand-lime px-4 py-3 font-poppins font-bold text-sm text-black transition-all duration-300",
                "hover:bg-brand-lime-hover active:scale-[0.99]",
                "disabled:cursor-not-allowed disabled:bg-elevated disabled:text-text-muted/50"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-default" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-bg px-3 font-sans text-xs uppercase tracking-wider text-text-muted">
                  or
                </span>
              </div>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2.5 rounded-md border border-border-default bg-elevated px-4 py-3 font-sans text-sm font-semibold text-text-main transition-all duration-300",
                "hover:border-border-strong hover:bg-elevated/70",
                "disabled:cursor-not-allowed disabled:opacity-60"
              )}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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

          <p className="mt-8 text-center font-sans text-xs text-text-muted">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="text-text-main underline-offset-4 hover:underline"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-text-main underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default SignInPage;
