// Shared auth + role helpers for Convex functions.
// Use these instead of duplicating getCurrentUserId() in every file.

import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export type Ctx = QueryCtx | MutationCtx | ActionCtx;
export type UserRole = "player" | "owner" | "admin";

export interface CurrentUser {
  _id: Id<"users">;
  firebase_uid: string;
  email: string;
  role: UserRole;
  is_approved: boolean;
}

export async function getCurrentUserId(ctx: Ctx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_firebase_uid", (q) => q.eq("firebase_uid", identity.subject))
    .first();
  return user ? user._id : null;
}

export async function getCurrentUser(ctx: Ctx): Promise<CurrentUser | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_firebase_uid", (q) => q.eq("firebase_uid", identity.subject))
    .first();
  if (!user) return null;
  return {
    _id: user._id,
    firebase_uid: user.firebase_uid,
    email: user.email,
    role: user.role as UserRole,
    is_approved: user.is_approved as boolean,
  };
}

export async function requireUserId(ctx: Ctx): Promise<Id<"users">> {
  const userId = await getCurrentUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function requireUser(ctx: Ctx): Promise<CurrentUser> {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function requireRole(
  ctx: Ctx,
  allowedRoles: UserRole[]
): Promise<CurrentUser> {
  const user = await requireUser(ctx);
  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `Forbidden: required role ${allowedRoles.join(" or ")}, got ${user.role}`
    );
  }
  return user;
}

export function isAdmin(user: CurrentUser): boolean {
  return user.role === "admin";
}

export function isVenueOwner(user: CurrentUser): boolean {
  return user.role === "owner" || user.role === "admin";
}
