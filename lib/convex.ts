import { AppError, classifyError } from "./errors";
import { MockConvexHttpClient } from "./mock-convex";

const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL;

if (!DEPLOYMENT_URL && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL is not set. Refusing to fallback to dev URL in production.");
}

const FINAL_DEPLOYMENT_URL = DEPLOYMENT_URL ?? "";

// Testing-phase toggle: NEXT_PUBLIC_USE_MOCK=true runs the whole site on
// fixture data from lib/mock-convex.ts with zero backend calls.
// Guard: the mock client MUST NEVER be enabled in a production build —
// fixture data with fake auth and hardcoded PII would masquerade as the
// real backend.
const USE_MOCK =
  process.env.NODE_ENV === "production"
    ? false
    : process.env.NEXT_PUBLIC_USE_MOCK === "true";

type ConvexEndpoint = "query" | "mutation" | "action";

interface ConvexClientOptions {
  deploymentUrl?: string;
}

export class ConvexHttpClient {
  private deploymentUrl: string;

  authToken?: string | null;

  constructor(opts?: ConvexClientOptions) {
    this.deploymentUrl = (opts?.deploymentUrl ?? FINAL_DEPLOYMENT_URL).replace(
      /\/+$/,
      ""
    );
  }

  async query<T = unknown>(
    path: string,
    args: Record<string, unknown> = {},
    authToken?: string
  ): Promise<T> {
    return this._invoke<T>("query", path, args, authToken);
  }

  async mutation<T = unknown>(
    path: string,
    args: Record<string, unknown> = {},
    authToken?: string
  ): Promise<T> {
    return this._invoke<T>("mutation", path, args, authToken);
  }

  async action<T = unknown>(
    path: string,
    args: Record<string, unknown> = {},
    authToken?: string
  ): Promise<T> {
    return this._invoke<T>("action", path, args, authToken);
  }

  private async _invoke<T>(
    endpoint: ConvexEndpoint,
    path: string,
    args: Record<string, unknown>,
    authToken?: string
  ): Promise<T> {
    const activeToken = authToken ?? this.authToken;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (activeToken) {
      headers["Authorization"] = `Bearer ${activeToken}`;
    }

    let res: Response;
    try {
      res = await fetch(
        `${this.deploymentUrl}/api/${endpoint}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ path, args }),
        }
      );
    } catch (err) {
      throw classifyError(err);
    }

    let payload: Record<string, unknown>;
    try {
      payload = await res.json();
    } catch {
      throw new AppError("CONVEX_INVALID_RESPONSE", "Something went wrong. Please try again.", {
        severity: "warning",
        reportable: true,
      });
    }

    if (!res.ok) {
      const rawMessage =
        (payload?.errorMessage as string) ??
        (payload?.message as string) ??
        "";
      const code = payload?.code as string | undefined;

      // Log the full error for engineering (Sentry, console, etc.)
      if (process.env.NODE_ENV !== "production") {
        console.error(`[Convex ${endpoint}] ${path}:`, rawMessage, code);
      }

      // Classify based on HTTP status
      if (res.status === 401) {
        throw new AppError("CONVEX_UNAUTHORIZED", "Please sign in to continue.", {
          severity: "warning",
        });
      }
      if (res.status === 403) {
        throw new AppError("CONVEX_FORBIDDEN", "You don't have permission to do this.", {
          severity: "warning",
        });
      }
      if (res.status === 404) {
        throw new AppError("CONVEX_NOT_FOUND", "The requested resource was not found.", {
          severity: "warning",
        });
      }
      if (res.status === 429) {
        throw new AppError("CONVEX_RATE_LIMITED", "Too many requests. Please wait a moment.", {
          severity: "info",
        });
      }
      if (res.status >= 500) {
        throw new AppError("CONVEX_SERVER_ERROR", "Something went wrong. Please try again.", {
          severity: "critical",
          reportable: true,
        });
      }

      // For other errors, classify the message
      throw classifyError(new Error(rawMessage));
    }

    if (payload?.status !== "success") {
      const rawMessage =
        (payload?.errorMessage as string) ??
        "";
      console.error("[Convex Error]", path, rawMessage);
      throw classifyError(new Error(rawMessage));
    }

    return payload.value as T;
  }
}

export const convexClient = USE_MOCK
  ? new MockConvexHttpClient()
  : new ConvexHttpClient();
