const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL;

if (!DEPLOYMENT_URL && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL is not set. Refusing to fallback to dev URL in production.");
}

const FINAL_DEPLOYMENT_URL = DEPLOYMENT_URL ?? "https://woozy-husky-516.eu-west-1.convex.cloud";

export class ConvexApiException extends Error {
  code?: string;
  statusCode?: number;
  cause?: unknown;

  constructor(opts: {
    message: string;
    code?: string;
    statusCode?: number;
    cause?: unknown;
  }) {
    super(opts.message);
    this.name = "ConvexApiException";
    this.code = opts.code;
    this.statusCode = opts.statusCode;
    this.cause = opts.cause;
  }
}

type ConvexEndpoint = "query" | "mutation" | "action";

interface ConvexClientOptions {
  deploymentUrl?: string;
  adminKey?: string;
}

export class ConvexHttpClient {
  private deploymentUrl: string;
  private adminKey?: string;

  authToken?: string | null;

  constructor(opts?: ConvexClientOptions) {
    this.deploymentUrl = (opts?.deploymentUrl ?? FINAL_DEPLOYMENT_URL).replace(
      /\/+$/,
      ""
    );
    this.adminKey = opts?.adminKey;
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
    if (this.adminKey) {
      headers["Convex-Admin-Auth"] = this.adminKey;
    }

    const res = await fetch(
      `${this.deploymentUrl}/api/${endpoint}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ path, args }),
      }
    );

    const payload = await res.json();

    if (!res.ok) {
      throw new ConvexApiException({
        message:
          (payload?.errorMessage as string) ??
          (payload?.message as string) ??
          `Convex ${endpoint} "${path}" failed`,
        code: payload?.code as string | undefined,
        statusCode: res.status,
      });
    }

    if (payload?.status !== "success") {
      throw new ConvexApiException({
        message:
          (payload?.errorMessage as string) ??
          `Convex ${endpoint} "${path}" failed`,
        code: payload?.code as string | undefined,
        statusCode: res.status,
      });
    }

    return payload.value as T;
  }
}

export const convexClient = new ConvexHttpClient();
