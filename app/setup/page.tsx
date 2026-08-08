"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Lock,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { convexClient } from "@/lib/convex";

export default function SetupPage() {
  const { status, convexUser, firebaseUser } = useAuth();
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [bootstrapKey, setBootstrapKey] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Derived (no effect): if the signed-in user is already an admin, setup is
  // complete. Otherwise wait for the explicit check in handleSetup.
  const isAdminUser = status === "authenticated" && convexUser?.role === "admin";
  const effectiveAdminExists = adminExists !== null ? adminExists : isAdminUser;

  const handleSetup = async () => {
    if (!firebaseUser) return;
    if (!bootstrapKey.trim()) {
      setError("Enter the admin bootstrap key to continue.");
      return;
    }
    setSetupLoading(true);
    setError(null);

    try {
      const token = await firebaseUser.getIdToken();
      const result = await convexClient.query<{
        adminExists: boolean;
        adminCount: number;
      }>("admin:checkAdminExists", { bootstrapKey: bootstrapKey.trim() }, token);

      if (result.adminExists) {
        setAdminExists(true);
        return;
      }

      await convexClient.mutation(
        "admin:setupFirstAdmin",
        { bootstrapKey: bootstrapKey.trim() },
        token,
      );
      setSuccess(true);
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      setError(getErrorMessage(err, "Setup failed. Please try again."));
    } finally {
      setSetupLoading(false);
    }
  };

  if (status === "initial" || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-8 h-8 text-brand-lime animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col bg-bg text-text-main">
        <Header />
        <main className="flex-grow flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <Lock className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h1 className="font-sans text-2xl font-extrabold mb-2">
              Authentication Required
            </h1>
            <p className="text-text-muted text-sm mb-6">
              Please sign in to access the setup page.
            </p>
            <Link
              href="/auth/login?redirect=/setup"
              className="bg-brand-lime hover:bg-brand-lime-hover text-black font-semibold text-sm px-6 py-2.5 rounded-md inline-block"
            >
              Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-main">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-lg mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-text-muted hover:text-brand-lime text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>

          <div className="bg-surface border border-border-subtle rounded-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-brand-lime/10 flex items-center justify-center border-2 border-brand-lime/30 mx-auto mb-4">
                <Shield className="w-8 h-8 text-brand-lime" />
              </div>
              <h1 className="font-sans text-2xl font-extrabold mb-2">
                Initial Admin Setup
              </h1>
              <p className="text-text-muted text-sm">
                This page is only available once. After the first admin is created,
                this page will permanently disable itself.
              </p>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-brand-lime/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-brand-lime" />
                </div>
                <h2 className="font-sans text-xl font-bold mb-2">
                  Admin Created!
                </h2>
                <p className="text-text-muted text-sm mb-6">
                  You are now the admin of Turfzo. You can access the admin
                  dashboard at{" "}
                  <Link href="/admin" className="text-brand-lime hover:underline">
                    /admin
                  </Link>
                </p>
                <Link
                  href="/admin"
                  className="bg-brand-lime hover:bg-brand-lime-hover text-black font-semibold text-sm px-6 py-2.5 rounded-md inline-block"
                >
                  Go to Admin Dashboard
                </Link>
              </div>
            ) : effectiveAdminExists ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-error" />
                </div>
                <h2 className="font-sans text-xl font-bold mb-2">
                  Setup Already Complete
                </h2>
                <p className="text-text-muted text-sm mb-4">
                  An admin account already exists. This setup page is no longer
                  available.
                </p>
                <p className="text-text-muted text-xs">
                  Signed in as: {convexUser?.email}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-elevated rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-2">
                    Account to be promoted:
                  </h3>
                  <p className="text-text-muted text-sm">
                    Email: {convexUser?.email}
                  </p>
                  <p className="text-text-muted text-sm">
                    Name: {convexUser?.full_name || convexUser?.display_name || "—"}
                  </p>
                  <p className="text-text-muted text-sm">
                    Current Role: {convexUser?.role}
                  </p>
                </div>

                {error && (
                  <div className="bg-error/10 border border-error/30 rounded-md p-4 text-sm text-error">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="bootstrap-key"
                    className="block text-sm font-medium text-text-main mb-1.5"
                  >
                    Admin Bootstrap Key
                  </label>
                  <input
                    id="bootstrap-key"
                    type="password"
                    autoComplete="off"
                    value={bootstrapKey}
                    onChange={(e) => setBootstrapKey(e.target.value)}
                    placeholder="Set via `npx convex env set ADMIN_BOOTSTRAP_KEY`"
                    className="w-full bg-elevated border border-border-subtle rounded-md px-3 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-brand-lime"
                  />
                  <p className="text-text-muted text-xs mt-1.5">
                    Required to create the first admin and to check whether
                    setup has already been completed.
                  </p>
                </div>

                <button
                  onClick={handleSetup}
                  disabled={setupLoading}
                  className="w-full bg-brand-lime hover:bg-brand-lime-hover text-black font-semibold text-sm px-6 py-3 rounded-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {setupLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {setupLoading
                    ? "Creating Admin Account..."
                    : "Make Me Admin"}
                </button>

                <p className="text-text-muted text-xs text-center">
                  This action is irreversible. The setup page will be permanently
                  disabled after this.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
