"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  getIdToken,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  linkWithCredential,
  User as FirebaseUser,
  ConfirmationResult,
} from "./firebase";
import { convexClient } from "./convex";
import { AppError, classifyError } from "./errors";
import type { AppUser } from "./types";

export type AuthStatus =
  | "initial"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

interface AuthState {
  status: AuthStatus;
  firebaseUser: FirebaseUser | null;
  convexUser: AppUser | null;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signUp: (opts: {
    email: string;
    password: string;
    role?: string;
    displayName?: string;
    phoneNumber?: string;
    city?: string;
  }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  /** Sends an SMS OTP to the given phone number and stores the pending confirmation. */
  signInWithPhone: (phone: string) => Promise<void>;
  /** Verifies the SMS OTP for a pending phone sign-in and completes login/signup. */
  verifyPhoneOtp: (code: string) => Promise<void>;
  /**
   * Sends an SMS OTP to LINK a phone number to the CURRENTLY signed-in
   * account (email/Google users). Does not change auth state.
   */
  linkPhone: (phone: string) => Promise<void>;
  /**
   * Verifies the OTP for a pending phone LINK and attaches the phone
   * credential to the current Firebase user, then re-syncs to Convex so
   * `is_phone_verified` is set from the server-side identity claim.
   */
  verifyLinkedPhone: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /** Current Firebase ID token for the signed-in user, if any. */
  getIdToken: (user: FirebaseUser) => Promise<string>;
  /**
   * Force-refreshes the Firebase ID token and updates convexClient.authToken.
   * Call this before any authenticated Convex action/mutation to guarantee
   * the token hasn't expired (Firebase tokens expire after 1 hour).
   * Returns the fresh token string, or undefined if no user is signed in.
   */
  getFreshToken: () => Promise<string | undefined>;
}

/**
 * Normalizes an Indian mobile number to E.164 (+91...).
 * Accepts "9876543210", "919876543210", "09876543210", "+919876543210".
 * Returns the trimmed input unchanged if it can't be normalized.
 */
function normalizePhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  return input.trim();
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: "initial",
    firebaseUser: null,
    convexUser: null,
    error: null,
  });

  const syncConvexUser = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const token = await getIdToken(firebaseUser);
      const response = await convexClient.action<{
        success: boolean;
        user: AppUser;
        session_token: string;
      }>(
        "auth:syncFirebaseUser",
        {
          displayName: firebaseUser.displayName || undefined,
          avatarUrl: firebaseUser.photoURL || undefined,
          phoneNumber: firebaseUser.phoneNumber || undefined,
        },
        token,
      );
      convexClient.authToken = token;
      if (response.success && response.user) {
        return response.user;
      }
      return null;
    } catch {
      convexClient.authToken = null;
      return null;
    }
  }, []);

  const phoneConfirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setState((prev) => ({ ...prev, status: "loading" }));
        const convexUser = await syncConvexUser(firebaseUser);
        setState({
          status: "authenticated",
          firebaseUser,
          convexUser,
          error: null,
        });
      } else {
        convexClient.authToken = null;
        setState({
          status: "unauthenticated",
          firebaseUser: null,
          convexUser: null,
          error: null,
        });
      }
    });
    return unsubscribe;
  }, [syncConvexUser]);

  const signUp = async (opts: {
    email: string;
    password: string;
    role?: string;
    displayName?: string;
    phoneNumber?: string;
    city?: string;
  }) => {
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        opts.email,
        opts.password,
      );
      const token = await getIdToken(cred.user);
      const syncResult = await convexClient.action<{
        success: boolean;
        user: AppUser;
        error?: string;
      }>(
        "auth:syncFirebaseUser",
        {
          role: opts.role,
          displayName: opts.displayName,
          phoneNumber: opts.phoneNumber,
          city: opts.city,
        },
        token,
      );
      if (!syncResult?.success) {
        const message =
          syncResult?.error ?? "Account setup failed. Please try again.";
        throw new AppError("ACCOUNT_SETUP_FAILED", message, {
          severity: "warning",
        });
      }
      const convexUser = await syncConvexUser(cred.user);
      setState({
        status: "authenticated",
        firebaseUser: cred.user,
        convexUser,
        error: null,
      });
    } catch (err: unknown) {
      const appError = classifyError(err);
      setState((prev) => ({
        ...prev,
        status: "error",
        error: appError.message,
      }));
      throw appError;
    }
  };

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const convexUser = await syncConvexUser(cred.user);
      setState({
        status: "authenticated",
        firebaseUser: cred.user,
        convexUser,
        error: null,
      });
    } catch (err: unknown) {
      const appError = classifyError(err);
      setState((prev) => ({
        ...prev,
        status: "error",
        error: appError.message,
      }));
      throw appError;
    }
  };

  const signInWithGoogle = async () => {
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const convexUser = await syncConvexUser(cred.user);
      setState({
        status: "authenticated",
        firebaseUser: cred.user,
        convexUser,
        error: null,
      });
    } catch (err: unknown) {
      const appError = classifyError(err);
      setState((prev) => ({
        ...prev,
        status: "error",
        error: appError.message,
      }));
      throw appError;
    }
  };

  const signInWithPhone = async (phone: string) => {
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    let verifier: RecaptchaVerifier | null = null;
    try {
      // The invisible reCAPTCHA verifier must be fresh per send, and any
      // previous widget must be cleared first (a verifier cannot be reused).
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // widget may already be gone (e.g. modal closed) — ignore
        }
        recaptchaVerifierRef.current = null;
      }
      verifier = new RecaptchaVerifier(auth, "phone-recaptcha-container", {
        size: "invisible",
        callback: () => {},
      });
      recaptchaVerifierRef.current = verifier;
      const confirmation = await signInWithPhoneNumber(
        auth,
        normalizePhoneNumber(phone),
        verifier,
      );
      phoneConfirmationRef.current = confirmation;
      // Stay in the modal on the OTP step — not fully authenticated yet.
      setState((prev) => ({ ...prev, status: "initial", error: null }));
    } catch (err: unknown) {
      try {
        verifier?.clear();
      } catch {
        // ignore
      }
      recaptchaVerifierRef.current = null;
      const appError = classifyError(err);
      setState((prev) => ({
        ...prev,
        status: "error",
        error: appError.message,
      }));
      throw appError;
    }
  };

  const verifyPhoneOtp = async (code: string) => {
    const confirmation = phoneConfirmationRef.current;
    if (!confirmation) {
      const err = new AppError(
        "PHONE_OTP_EXPIRED",
        "Your OTP session has expired. Please request a new code.",
        { severity: "warning" },
      );
      setState((prev) => ({ ...prev, status: "error", error: err.message }));
      throw err;
    }
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const result = await confirmation.confirm(code);
      const convexUser = await syncConvexUser(result.user);
      phoneConfirmationRef.current = null;
      setState({
        status: "authenticated",
        firebaseUser: result.user,
        convexUser,
        error: null,
      });
    } catch (err: unknown) {
      const appError = classifyError(err);
      setState((prev) => ({
        ...prev,
        status: "error",
        error: appError.message,
      }));
      throw appError;
    }
  };

  const signOut = async () => {
    phoneConfirmationRef.current = null;
    await firebaseSignOut(auth);
    convexClient.authToken = null;
    setState({
      status: "unauthenticated",
      firebaseUser: null,
      convexUser: null,
      error: null,
    });
  };

  const linkPhone = async (phone: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new AppError(
        "AUTH_REQUIRED",
        "You must be signed in to verify a mobile number.",
        { severity: "warning" },
      );
    }
    // Same fresh-verifier pattern as signInWithPhone — never reused.
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {
        // widget may already be gone — ignore
      }
      recaptchaVerifierRef.current = null;
    }
    const verifier = new RecaptchaVerifier(auth, "phone-recaptcha-container", {
      size: "invisible",
      callback: () => {},
    });
    recaptchaVerifierRef.current = verifier;
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        normalizePhoneNumber(phone),
        verifier,
      );
      phoneConfirmationRef.current = confirmation;
      // Still the same authenticated session — verification is in progress.
      setState((prev) => ({ ...prev, status: "authenticated", error: null }));
    } catch (err: unknown) {
      try {
        verifier?.clear();
      } catch {
        // ignore
      }
      recaptchaVerifierRef.current = null;
      const appError = classifyError(err);
      setState((prev) => ({ ...prev, status: "authenticated", error: appError.message }));
      throw appError;
    }
  };

  const verifyLinkedPhone = async (code: string) => {
    const confirmation = phoneConfirmationRef.current;
    if (!confirmation) {
      const err = new AppError(
        "PHONE_OTP_EXPIRED",
        "Your OTP session has expired. Please request a new code.",
        { severity: "warning" },
      );
      setState((prev) => ({ ...prev, status: "authenticated", error: err.message }));
      throw err;
    }
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new AppError(
        "AUTH_REQUIRED",
        "You must be signed in to verify a mobile number.",
        { severity: "warning" },
      );
    }
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const credential = PhoneAuthProvider.credential(
        confirmation.verificationId,
        code,
      );
      await linkWithCredential(currentUser, credential);
      phoneConfirmationRef.current = null;
      // Backend syncFirebaseUser reads the phone_number claim from this
      // linked identity and sets is_phone_verified=true server-side.
      await refreshUser();
    } catch (err: unknown) {
      phoneConfirmationRef.current = null;
      const appError = classifyError(err);
      setState((prev) => ({ ...prev, status: "authenticated", error: appError.message }));
      throw appError;
    }
  };

  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      convexClient.authToken = null;
      setState({
        status: "unauthenticated",
        firebaseUser: null,
        convexUser: null,
        error: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const convexUser = await syncConvexUser(firebaseUser);
      setState({
        status: "authenticated",
        firebaseUser,
        convexUser,
        error: null,
      });
    } catch (err: unknown) {
      const appError = classifyError(err);
      setState((prev) => ({
        ...prev,
        status: "error",
        error: appError.message,
      }));
      throw appError;
    }
  };

  /**
   * Force-refreshes the Firebase ID token and updates convexClient.authToken.
   * This prevents stale-token "Authentication required" errors that happen
   * when the user has been on the page for over 1 hour.
   */
  const getFreshToken = useCallback(async (): Promise<string | undefined> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return undefined;
    const token = await getIdToken(currentUser, /* forceRefresh */ true);
    convexClient.authToken = token;
    return token;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithPhone,
        verifyPhoneOtp,
        linkPhone,
        verifyLinkedPhone,
        signOut,
        refreshUser,
        getIdToken,
        getFreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
