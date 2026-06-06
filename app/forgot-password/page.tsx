"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, Check, AlertCircle } from "lucide-react";
import { sendPasswordResetEmail, auth } from "@/lib/firebase";
import { TurnstileWidget } from "@/components/TurnstileWidget";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (!turnstileToken) {
      setError("Please complete the bot check before submitting.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface border border-border-default rounded-md p-8 shadow-card-shadow">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Image src="/turfzo_mascot.svg" alt="Turfzo" width={40} height={40} />
              <span className="font-sans font-bold text-xl text-text-main">
                turf<span className="text-brand-lime">zo</span>
              </span>
            </Link>
            <h1 className="font-sans text-2xl font-extrabold text-text-main">
              Reset Your Password
            </h1>
            <p className="text-text-muted text-sm font-sans mt-1">
              {sent
                ? "Check your inbox for a reset link."
                : "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-md text-error text-sm font-sans flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {!sent ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-sans font-semibold text-text-muted uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-elevated border border-border-subtle rounded-md py-3 pl-10 pr-4 text-sm text-text-main placeholder-text-muted/50 focus:outline-none focus:border-brand-lime/30 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <TurnstileWidget
                  onVerify={setTurnstileToken}
                  onExpire={() => setTurnstileToken(null)}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !turnstileToken}
                className="w-full bg-brand-lime hover:bg-brand-lime-hover disabled:bg-elevated disabled:text-text-muted/40 text-black font-sans font-bold py-3 rounded-md transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-brand-lime/10 rounded-full flex items-center justify-center border-2 border-brand-lime/30">
                <Check className="w-7 h-7 text-brand-lime stroke-[3]" />
              </div>
              <p className="text-sm text-text-muted text-center font-sans leading-relaxed">
                We&apos;ve sent a password reset link to <span className="text-text-main font-semibold">{email}</span>. Click the link in the email to set a new password.
              </p>
            </div>
          )}

          <Link
            href="/auth/login"
            className="mt-6 flex items-center justify-center gap-2 text-sm text-text-muted hover:text-brand-lime transition-colors font-sans"
          >
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
