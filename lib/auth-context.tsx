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
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  getIdToken,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
  User as FirebaseUser,
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
  signInWithGoogle: (role?: string) => Promise<void>;
  /**
   * Sends an SMS OTP to LINK a phone number to the CURRENTLY signed-in
   * account (email/Google users). Does not change auth state.
   */
  linkPhone: (phone: string) => Promise<void>;
  /**
   * Verifies the OTP for a pending phone LINK and attaches the phone
   * number to the current Convex user, setting `is_phone_verified`
   * server-side after the OTP check.
   */
  verifyLinkedPhone: (code: string) => Promise<void>;
  /**
   * Sends an SMS OTP to sign up with a phone number (Firebase phone auth).
   * After the user enters the code, call [verifyPhoneSignUp].
   */
  phoneSignUp: (opts: {
    phone: string;
    role?: string;
    displayName?: string;
  }) => Promise<void>;
  /**
   * Confirms the phone sign-up OTP. Creates the Firebase identity (with
   * the verified phone number) and syncs the Convex profile.
   */
  verifyPhoneSignUp: (code: string) => Promise<void>;
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

export type OtpErrorCode =
  | "INVALID_PHONE"
  | "RATE_LIMITED"
  | "OTP_COOLDOWN"
  | "OTP_EXPIRED"
  | "SMS_SEND_FAILED"
  | "INVALID_OTP"
  | "NOT_AUTHENTICATED"
  | "USER_NOT_FOUND";

const OTP_ERROR_MESSAGES: Record<OtpErrorCode, string> = {
  INVALID_PHONE: "Please enter a valid Indian mobile number.",
  RATE_LIMITED: "Too many attempts. Please try again later.",
  OTP_COOLDOWN: "Please wait a moment before requesting another code.",
  OTP_EXPIRED: "This OTP has expired. Please request a new code.",
  SMS_SEND_FAILED: "Couldn't send the OTP. Please try again.",
  INVALID_OTP: "Incorrect OTP. Please check the code and try again.",
  NOT_AUTHENTICATED: "Please sign in to continue.",
  USER_NOT_FOUND: "Your account could not be found. Please sign in again.",
};

function otpErrorMessage(
  code: OtpErrorCode | undefined,
): string {
  return OTP_ERROR_MESSAGES[code ?? "SMS_SEND_FAILED"];
}

function mapOtpErrorCode(code: string | undefined): string {
  switch (code) {
    case "INVALID_PHONE":
    case "RATE_LIMITED":
    case "OTP_COOLDOWN":
    case "OTP_EXPIRED":
    case "SMS_SEND_FAILED":
    case "INVALID_OTP":
    case "NOT_AUTHENTICATED":
    case "USER_NOT_FOUND":
      return `OTP_${code}`;
    default:
      return "OTP_SMS_SEND_FAILED";
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: "initial",
    firebaseUser: null,
    convexUser: null,
    error: null,
  });

  const syncConvexUser = useCallback(async (firebaseUser: FirebaseUser, role?: string) => {
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
          role: role || undefined,
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

  // MSG91 phone OTP is used ONLY for linking/verifying a phone on an
  // existing Firebase account (phone is not a login method on the web —
  // the backend has no Firebase identity for phone-created users). We
  // remember the number the user asked to link so verification targets
  // the right OTP row.
  const pendingLinkedPhoneRef = useRef<string | null>(null);

  // Firebase phone auth for SIGN UP (new accounts). We hold the pending
  // ConfirmationResult plus the signup metadata (role/display name) so the
  // OTP step can complete the account creation with the right profile.
  const pendingPhoneSignupRef = useRef<ConfirmationResult | null>(null);
  const pendingPhoneSignupMetaRef = useRef<{
    role: string;
    displayName?: string;
  }>({ role: "player" });

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

  // Firebase ID tokens expire after ~1 hour and are refreshed automatically
  // by the SDK in the background — but onAuthStateChanged does NOT re-fire on
  // that rotation. Without this listener, convexClient.authToken goes stale
  // after an hour and every token-less call (bookings, profile, owner
  // dashboard, header badge...) sends an expired Bearer token until reload.
  // onIdTokenChanged fires whenever the SDK mints a fresh token, keeping the
  // client's snapshot current for all call sites.
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (firebaseUser) => {
      if (!firebaseUser) return; // sign-out handled by onAuthStateChanged
      getIdToken(firebaseUser)
        .then((token) => {
          convexClient.authToken = token;
        })
        .catch(() => {
          // Keep the previous token; getFreshToken() callers still work.
        });
    });
    return unsubscribe;
  }, []);

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

  const signInWithGoogle = async (role?: string) => {
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const convexUser = await syncConvexUser(cred.user, role);
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

  const linkPhone = async (phone: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new AppError(
        "AUTH_REQUIRED",
        "You must be signed in to verify a mobile number.",
        { severity: "warning" },
      );
    }
    const normalized = normalizePhoneNumber(phone);
    if (!normalized.startsWith("+")) {
      throw new AppError(
        "INVALID_PHONE",
        "Please enter a valid 10-digit mobile number.",
        { severity: "warning" },
      );
    }
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const result = await convexClient.action<{
        success: boolean;
        error?: string;
        expiresAt?: string;
      }>("otp:sendOtp", { phoneNumber: normalized });
      if (!result.success) {
        throw new AppError(
          mapOtpErrorCode(result.error),
          otpErrorMessage(result.error as OtpErrorCode),
          { severity: "warning" },
        );
      }
      pendingLinkedPhoneRef.current = normalized;
      // Still the same authenticated session — verification is in progress.
      setState((prev) => ({ ...prev, status: "authenticated", error: null }));
    } catch (err: unknown) {
      const appError = classifyError(err);
      setState((prev) => ({ ...prev, status: "authenticated", error: appError.message }));
      throw appError;
    }
  };

  const verifyLinkedPhone = async (code: string) => {
    const pendingPhone = pendingLinkedPhoneRef.current;
    if (!pendingPhone) {
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
      // The OTP is proven server-side against the logged-in Firebase
      // identity — no Firebase phone credential involved.
      const token = await getIdToken(currentUser);
      const result = await convexClient.action<{
        success: boolean;
        user?: AppUser;
        error?: string;
      }>("otp:verifyAndLink", { phoneNumber: pendingPhone, otp: code }, token);
      pendingLinkedPhoneRef.current = null;
      if (!result.success) {
        throw new AppError(
          mapOtpErrorCode(result.error),
          otpErrorMessage(result.error as OtpErrorCode),
          { severity: "warning" },
        );
      }
      // Reflect the server-set is_phone_verified flag immediately.
      setState((prev) => ({ ...prev, status: "authenticated", error: null }));
      await refreshUser();
    } catch (err: unknown) {
      pendingLinkedPhoneRef.current = null;
      const appError = classifyError(err);
      setState((prev) => ({ ...prev, status: "authenticated", error: appError.message }));
      throw appError;
    }
  };

  const phoneSignUp = async (opts: {
    phone: string;
    role?: string;
    displayName?: string;
  }) => {
    const normalized = normalizePhoneNumber(opts.phone);
    if (!normalized.startsWith("+")) {
      throw new AppError(
        "INVALID_PHONE",
        "Please enter a valid 10-digit mobile number.",
        { severity: "warning" },
      );
    }
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      // reCAPTCHA is required by Firebase phone auth on the web. The
      // container is appended lazily so it works inside the auth modal.
      const recaptchaId = "recaptcha-container";
      let container = document.getElementById(recaptchaId);
      if (!container) {
        container = document.createElement("div");
        container.id = recaptchaId;
        document.body.appendChild(container);
      }
      const appVerifier = new RecaptchaVerifier(auth, container, {
        size: "invisible",
      });
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        normalized,
        appVerifier,
      );
      pendingPhoneSignupRef.current = confirmationResult;
      pendingPhoneSignupMetaRef.current = {
        role: opts.role ?? "player",
        displayName: opts.displayName,
      };
      // Still loading — the OTP step will finish the sign-up.
      setState((prev) => ({ ...prev, status: "unauthenticated", error: null }));
    } catch (err: unknown) {
      const appError = classifyError(err);
      setState((prev) => ({ ...prev, status: "unauthenticated", error: appError.message }));
      throw appError;
    }
  };

  const verifyPhoneSignUp = async (code: string) => {
    const confirmationResult = pendingPhoneSignupRef.current;
    if (!confirmationResult) {
      const err = new AppError(
        "PHONE_OTP_EXPIRED",
        "Your OTP session has expired. Please request a new code.",
        { severity: "warning" },
      );
      setState((prev) => ({ ...prev, status: "unauthenticated", error: err.message }));
      throw err;
    }
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const userCredential = await confirmationResult.confirm(code);
      const firebaseUser = userCredential.user;
      pendingPhoneSignupRef.current = null;

      // Create the Convex profile bound to this Firebase identity. The
      // phone number is verified server-side from the Firebase ID token's
      // `phone_number` claim (auth.ts sets is_phone_verified from it).
      const token = await getIdToken(firebaseUser);
      const meta = pendingPhoneSignupMetaRef.current;
      const result = await convexClient.action<{
        success: boolean;
        user?: AppUser;
        error?: string;
      }>(
        "auth:syncFirebaseUser",
        {
          role: meta.role,
          displayName: meta.displayName,
          phoneNumber: firebaseUser.phoneNumber ?? undefined,
        },
        token,
      );
      if (!result.success) {
        throw new AppError(
          "ACCOUNT_SETUP_FAILED",
          result.error ?? "Account setup failed. Please try again.",
          { severity: "warning" },
        );
      }
      convexClient.authToken = token;
      setState({
        status: "authenticated",
        firebaseUser,
        convexUser: result.user ?? null,
        error: null,
      });
    } catch (err: unknown) {
      const appError = classifyError(err);
      setState((prev) => ({ ...prev, status: "unauthenticated", error: appError.message }));
      throw appError;
    }
  };

  const signOut = async () => {
    pendingLinkedPhoneRef.current = null;
    pendingPhoneSignupRef.current = null;
    await firebaseSignOut(auth);
    convexClient.authToken = null;
    setState({
      status: "unauthenticated",
      firebaseUser: null,
      convexUser: null,
      error: null,
    });
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
    const uidAtStart = currentUser.uid;
    const token = await getIdToken(currentUser, /* forceRefresh */ true);
    // The refresh round-trip is async: the user may have signed out or
    // switched accounts while it was in flight. Installing this token would
    // silently run every subsequent token-less call (e.g. bookings:createPending)
    // as the previous account. Only apply it if the session still matches
    // the one we fetched it for.
    if (auth.currentUser?.uid !== uidAtStart) {
      return undefined;
    }
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
        linkPhone,
        verifyLinkedPhone,
        phoneSignUp,
        verifyPhoneSignUp,
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
