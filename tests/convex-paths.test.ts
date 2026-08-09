// Compile-time verification that every string-based Convex function path
// used by this website exists in the backend.
//
// The website calls Convex via `convexClient.query("module:function", ...)`
// string paths, which are NOT type-checked. If the backend renames a
// function, this test fails with the exact missing path instead of a
// runtime 500.
//
// The backend repo is the source of truth; its convex/*.ts files are
// scanned for exported query/mutation/action definitions.

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync, statSync } from "fs";
import path from "path";

const WEBSITE_ROOT = path.resolve(__dirname, "..");
const BACKEND_ROOT =
  process.env.TURFZO_BACKEND_DIR ??
  path.resolve(__dirname, "../../../turfzo-backend");
const BACKEND_CONVEX = path.join(BACKEND_ROOT, "convex");

const WEBSITE_SCAN_DIRS = ["app", "components", "lib"];

// Matches convexClient.query("module:function", ...) string paths,
// including calls with a TS generic like convexClient.mutation<{...}>(...).
const CALL_PATH_RE =
  /convexClient\.(?:query|mutation|action)(?:\s*<[^>]*>)?\(\s*["'`]([a-z_][a-z0-9_]*:[a-zA-Z0-9_]+)["'`]/g;

// Matches exported Convex function definitions in backend files.
const EXPORT_RE =
  /export\s+const\s+([A-Za-z0-9_]+)\s*=\s*(query|mutation|action|internalQuery|internalMutation|internalAction|httpAction)/g;

function walkFiles(dir: string, ext: RegExp, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "turfzo_backup") continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkFiles(full, ext, out);
    } else if (ext.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function collectWebsiteCallPaths(): string[] {
  const paths = new Set<string>();
  for (const dir of WEBSITE_SCAN_DIRS) {
    const root = path.join(WEBSITE_ROOT, dir);
    if (!existsSync(root)) continue;
    for (const file of walkFiles(root, /\.(ts|tsx)$/)) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(CALL_PATH_RE)) {
        paths.add(match[1]);
      }
    }
  }
  return [...paths].sort();
}

function collectBackendFunctionPaths(): Set<string> {
  const paths = new Set<string>();
  for (const file of walkFiles(BACKEND_CONVEX, /\.ts$/)) {
    if (file.includes("_generated") || file.endsWith("validators.ts")) continue;
    const moduleName = path.basename(file, ".ts");
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(EXPORT_RE)) {
      paths.add(`${moduleName}:${match[1]}`);
    }
  }
  return paths;
}

describe("Convex function path wiring", () => {
  const backendExists = existsSync(BACKEND_CONVEX);

  if (!backendExists) {
    if (process.env.CI) {
      it.skip("backend directory exists for path verification (skipped in CI due to missing access)", () => {});
      return;
    }
    it("backend directory exists for path verification", () => {
      expect(
        existsSync(BACKEND_CONVEX),
        `Backend convex directory not found at ${BACKEND_CONVEX}. ` +
          "Set TURFZO_BACKEND_DIR to the turfzo-backend repo root.",
      ).toBe(true);
    });
    return;
  }

  const websitePaths = collectWebsiteCallPaths();
  const backendPaths = collectBackendFunctionPaths();

  it("finds at least one website Convex call path", () => {
    expect(websitePaths.length).toBeGreaterThan(0);
  });

  it("finds backend function exports", () => {
    expect(backendPaths.size).toBeGreaterThan(0);
  });

  it("every website call path exists in the backend", () => {
    const missing = websitePaths.filter((p) => !backendPaths.has(p));
    expect(missing, "Website calls backend functions that do not exist:\n" +
      missing.map((p) => `  - ${p}`).join("\n")).toEqual([]);
    console.log(
      `Verified ${websitePaths.length} website Convex paths against ` +
        `${backendPaths.size} backend function exports.`,
    );
  });
});
