// Run env validation once at module load (both server + client entry).
// In production this throws fast on misconfiguration. In dev it warns
// and logs a non-sensitive summary of which services are configured.

import { logEnvironmentInfo, validateEnv } from "./env";

if (process.env.NODE_ENV !== "production") {
  logEnvironmentInfo();
}

validateEnv();
