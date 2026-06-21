/**
 * Centralized error handling for Turfzo website.
 *
 * Three-layer architecture:
 *   1. AppError — classified error with user-safe message
 *   2. classifyError() — maps raw errors to AppError
 *   3. getErrorMessage() — extracts safe user-facing string from any error
 *
 * RULE: Users see outcomes. Engineers see details.
 */

// =============================================================================
// AppError — the only error type that should reach UI
// =============================================================================

export type ErrorSeverity = "info" | "warning" | "critical";

export class AppError extends Error {
  code: string;
  severity: ErrorSeverity;
  reportable: boolean;

  constructor(
    code: string,
    userMessage: string,
    opts?: { severity?: ErrorSeverity; reportable?: boolean; cause?: unknown },
  ) {
    super(userMessage);
    this.name = "AppError";
    this.code = code;
    this.severity = opts?.severity ?? "warning";
    this.reportable = opts?.reportable ?? false;
    if (opts?.cause !== undefined) {
      this.cause = opts.cause;
    }
  }
}

// =============================================================================
// Firebase Auth error code → user-safe message
// =============================================================================

const FIREBASE_AUTH_MESSAGES: Record<string, string> = {
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/email-already-in-use": "An account already exists with this email.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests":
    "Too many attempts. Please try again later.",
  "auth/network-request-failed":
    "Network error. Please check your connection.",
  "auth/popup-closed-by-user": "Sign-in popup was closed. Try again.",
  "auth/popup-blocked":
    "Pop-up was blocked by your browser. Allow pop-ups for this site.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/operation-not-allowed":
    "This sign-in method is not enabled. Contact support.",
  "auth/expired-action-code": "This link has expired. Request a new one.",
  "auth/invalid-action-code": "This link is invalid. Request a new one.",
  "auth/missing-android-pkg-name":
    "An Android package name is required.",
  "auth/missing-ios-bundle-id": "An iOS bundle ID is required.",
  "auth/unauthorized-continue-uri":
    "This domain is not authorized. Contact support.",
  "auth/invalid-continue-uri": "The continue URL is invalid.",
};

// =============================================================================
// Convex error code → user-safe message
// =============================================================================

const CONVEX_ERROR_MESSAGES: Record<string, string> = {
  CONFLICT: "This slot was just booked. Please pick another time.",
  UNAUTHORIZED: "Please sign in to continue.",
  FORBIDDEN: "You don't have permission to do this.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
  RATE_LIMITED: "Too many requests. Please wait a moment.",
};

// =============================================================================
// classifyError — the core function
// =============================================================================

export function classifyError(err: unknown): AppError {
  // Already classified
  if (err instanceof AppError) return err;

  const raw = err instanceof Error ? err : new Error(String(err));
  const msg = raw.message ?? "";

  // --- Firebase Auth errors ---
  // Firebase wraps its errors as: "Firebase: Error (auth/code)." or "Firebase: some message (auth/code)."
  const firebaseMatch = msg.match(/\(auth\/([\w-]+)\)/);
  if (firebaseMatch) {
    const code = firebaseMatch[1];
    const userMessage =
      FIREBASE_AUTH_MESSAGES[`auth/${code}`] ??
      "Something went wrong. Please try again.";
    return new AppError(`AUTH_${code.toUpperCase().replace(/-/g, "_")}`, userMessage, {
      severity: "warning",
      reportable: true,
      cause: raw,
    });
  }

  // --- Convex API misuse errors ---
  // "Trying to execute X as Mutation, but it is defined as Action" (or vice versa)
  if (msg.includes("Trying to execute") && msg.includes("defined as")) {
    return new AppError("CONVEX_API_MISUSE", "Something went wrong. Please try again.", {
      severity: "critical",
      reportable: true,
      cause: raw,
    });
  }

  // --- Convex API errors ---
  // Convex throws: 'Convex mutation "module:function" failed' or contains errorMessage
  if (msg.includes("Convex ") && msg.includes("failed")) {
    // Extract the Convex error code if present
    const convexCodeMatch = msg.match(/code["\s:]+(\w+)/i);
    const code = convexCodeMatch?.[1];

    if (code && CONVEX_ERROR_MESSAGES[code]) {
      return new AppError(`CONVEX_${code}`, CONVEX_ERROR_MESSAGES[code], {
        severity: "warning",
        reportable: false,
        cause: raw,
      });
    }

    // Check for common Convex error patterns in the message
    if (msg.includes("not authenticated") || msg.includes("Not authenticated")) {
      return new AppError("CONVEX_UNAUTHORIZED", "Please sign in to continue.", {
        severity: "warning",
        cause: raw,
      });
    }
    if (msg.includes("not found") || msg.includes("Not found")) {
      return new AppError("CONVEX_NOT_FOUND", "The requested resource was not found.", {
        severity: "warning",
        cause: raw,
      });
    }
    if (msg.includes("already") || msg.includes("conflict") || msg.includes("overlap")) {
      return new AppError("CONVEX_CONFLICT", "This slot was just booked. Please pick another time.", {
        severity: "warning",
        cause: raw,
      });
    }
    if (msg.includes("blocked")) {
      return new AppError("CONVEX_BLOCKED", "This time slot is blocked by the turf owner.", {
        severity: "warning",
        cause: raw,
      });
    }
    if (msg.includes("permission") || msg.includes("unauthorized") || msg.includes("forbidden")) {
      return new AppError("CONVEX_FORBIDDEN", "You don't have permission to do this.", {
        severity: "warning",
        cause: raw,
      });
    }

    // Generic Convex error — don't expose internals
    return new AppError("CONVEX_ERROR", "Something went wrong. Please try again.", {
      severity: "warning",
      reportable: true,
      cause: raw,
    });
  }

  // --- Network errors ---
  if (
    msg.includes("Failed to fetch") ||
    msg.includes("NetworkError") ||
    msg.includes("network") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ETIMEDOUT")
  ) {
    return new AppError("NETWORK_ERROR", "Network error. Please check your connection.", {
      severity: "warning",
      cause: raw,
    });
  }

  // --- Cashfree payment errors ---
  if (msg.includes("cashfree") || msg.includes("Cashfree") || msg.includes("payment")) {
    return new AppError("PAYMENT_ERROR", "Payment failed. Please try again.", {
      severity: "warning",
      reportable: true,
      cause: raw,
    });
  }

  // --- Turnstile errors ---
  if (msg.includes("turnstile") || msg.includes("Turnstile") || msg.includes("verification")) {
    return new AppError("TURNSTILE_ERROR", "Verification failed. Please try again.", {
      severity: "info",
      cause: raw,
    });
  }

  // --- Fallback — never expose raw error ---
  return new AppError("UNKNOWN", "Something went wrong. Please try again.", {
    severity: "warning",
    reportable: true,
    cause: raw,
  });
}

// =============================================================================
// getErrorMessage — quick helper to extract safe message from any error
// =============================================================================

export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof AppError) return err.message;
  if (err instanceof Error) {
    const classified = classifyError(err);
    return classified.message;
  }
  return fallback;
}
