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
const REQUEST_TIMEOUT_MS = 20_000;
// Safe reads only: a query is idempotent, so retrying a dropped connection
// or a 5xx is safe. Mutations are never retried here — a retried payment or
// booking could double-charge or double-book.
const QUERY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 150;

/** Per-call transport options. */
export interface InvokeOptions {
  /**
   * Abort the request when the caller unmounts or navigates away.
   * A component that set this on unmount stops the response from resolving
   * after its state is gone.
   */
  signal?: AbortSignal;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Correlates the retries and log lines of one client call.
 *
 * It is deliberately NOT sent as a header: the website calls the Convex HTTP
 * API cross-origin from the browser, and a custom header would force a CORS
 * preflight that the API does not allow. The id stays on the client and is
 * printed with the failure, so a reported error can be matched to the exact
 * console line and attempt sequence.
 */
function makeRequestId(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    try {
      return cryptoObj.randomUUID();
    } catch {
      // fall through to the non-crypto id
    }
  }
  return `req_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function isRetryableRead(error: AppError): boolean {
  return (
    error.code === "NETWORK_ERROR" ||
    error.code === "CONVEX_TIMEOUT" ||
    error.code === "CONVEX_SERVER_ERROR"
  );
}

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
    authToken?: string,
    options?: InvokeOptions
  ): Promise<T> {
    return this._invoke<T>("query", path, args, authToken, options);
  }

  async mutation<T = unknown>(
    path: string,
    args: Record<string, unknown> = {},
    authToken?: string,
    options?: InvokeOptions
  ): Promise<T> {
    return this._invoke<T>("mutation", path, args, authToken, options);
  }

  async action<T = unknown>(
    path: string,
    args: Record<string, unknown> = {},
    authToken?: string,
    options?: InvokeOptions
  ): Promise<T> {
    return this._invoke<T>("action", path, args, authToken, options);
  }

  private async _invoke<T>(
    endpoint: ConvexEndpoint,
    path: string,
    args: Record<string, unknown>,
    authToken?: string,
    options?: InvokeOptions
  ): Promise<T> {
    // Only reads retry. A mutation that timed out may have committed.
    const attempts = endpoint === "query" ? QUERY_ATTEMPTS : 1;
    const requestId = makeRequestId();
    let lastError: AppError | undefined;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        return await this._request<T>(
          endpoint,
          path,
          args,
          authToken,
          requestId,
          options
        );
      } catch (err) {
        const error = err instanceof AppError ? err : classifyError(err);
        lastError = error;
        const canRetry =
          attempt < attempts - 1 &&
          isRetryableRead(error) &&
          options?.signal?.aborted !== true;
        if (!canRetry) throw error;
        await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
      }
    }

    throw (
      lastError ??
      new AppError("UNKNOWN", "Something went wrong. Please try again.", {
        severity: "warning",
        reportable: true,
      })
    );
  }

  private async _request<T>(
    endpoint: ConvexEndpoint,
    path: string,
    args: Record<string, unknown>,
    authToken: string | undefined,
    requestId: string,
    options?: InvokeOptions
  ): Promise<T> {
    const activeToken = authToken ?? this.authToken;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (activeToken) {
      headers["Authorization"] = `Bearer ${activeToken}`;
    }

    let res: Response;
    const controller = new AbortController();
    const abortFromCaller = () => controller.abort();
    if (options?.signal?.aborted) {
      controller.abort();
    } else {
      options?.signal?.addEventListener("abort", abortFromCaller, {
        once: true,
      });
    }
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      res = await fetch(
        `${this.deploymentUrl}/api/${endpoint}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ path, args }),
          signal: controller.signal,
        }
      );
    } catch (err) {
      throw classifyError(err);
    } finally {
      clearTimeout(timeout);
      options?.signal?.removeEventListener("abort", abortFromCaller);
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
        console.error(
          `[Convex ${endpoint}] ${path} (request ${requestId}):`,
          rawMessage,
          code
        );
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
      console.error("[Convex Error]", path, `request ${requestId}`, rawMessage);
      throw classifyError(new Error(rawMessage));
    }

    return payload.value as T;
  }
}

export const convexClient = USE_MOCK
  ? new MockConvexHttpClient()
  : new ConvexHttpClient();
