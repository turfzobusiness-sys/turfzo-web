"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
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
  signInWithGoogle: () => Promise<void>;
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

  const signOut = async () => {
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
