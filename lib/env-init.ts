// Run env validation once at module load (both server + client entry).
// In production this throws fast on misconfiguration. In dev it warns.

import { validateEnv } from "./env";

validateEnv();
