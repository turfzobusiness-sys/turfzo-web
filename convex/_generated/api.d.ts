/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as contact from "../contact.js";
import type * as files from "../files.js";
import type * as payments from "../payments.js";
import type * as payments_internal from "../payments_internal.js";
import type * as seed from "../seed.js";
import type * as tournaments from "../tournaments.js";
import type * as turfs from "../turfs.js";
import type * as venues from "../venues.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  bookings: typeof bookings;
  contact: typeof contact;
  files: typeof files;
  payments: typeof payments;
  payments_internal: typeof payments_internal;
  seed: typeof seed;
  tournaments: typeof tournaments;
  turfs: typeof turfs;
  venues: typeof venues;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
