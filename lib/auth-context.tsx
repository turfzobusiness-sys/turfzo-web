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
import { classifyError } from "./errors";
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
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: "initial",
    firebaseUser: null,
    convexUser: null,
    error: null,
  });

  const syncConvexUser = useCallback(
    async (firebaseUser: FirebaseUser) => {
      try {
        const token = await getIdToken(firebaseUser);
        const response = await convexClient.mutation<{
          success: boolean;
          user: AppUser;
          session_token: string;
        }>("auth:syncFirebaseUser", {
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          phoneNumber: firebaseUser.phoneNumber || undefined,
        }, token);
        convexClient.authToken = token;
        if (response.success && response.user) {
          return response.user;
        }
        return null;
      } catch {
        convexClient.authToken = null;
        return null;
      }
    },
    []
  );

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
    displayName?: string;
    phoneNumber?: string;
    city?: string;
  }) => {
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        opts.email,
        opts.password
      );
      const token = await getIdToken(cred.user);
      await convexClient.mutation<{
        success: boolean;
        user: AppUser;
      }>(
        "auth:syncFirebaseUser",
        {
          displayName: opts.displayName,
          phoneNumber: opts.phoneNumber,
          city: opts.city,
        },
        token
      );
      const convexUser = await syncConvexUser(cred.user);
      setState({
        status: "authenticated",
        firebaseUser: cred.user,
        convexUser,
        error: null,
      });
    } catch (err: unknown) {
      const appError = classifyError(err);
      setState((prev) => ({ ...prev, status: "error", error: appError.message }));
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
      setState((prev) => ({ ...prev, status: "error", error: appError.message }));
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
      setState((prev) => ({ ...prev, status: "error", error: appError.message }));
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

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
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
