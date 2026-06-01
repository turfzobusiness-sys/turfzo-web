// Stub types for Convex _generated/dataModel until `npx convex dev` runs.
// This file will be overwritten by Convex codegen with real types.
// We use index signatures to avoid union-type narrowing issues during local typecheck.

export type Id<TableName extends string> = string & { __tableName: TableName };

export interface DataModel {
  users: Record<string, any>;
  turfs: Record<string, any>;
  bookings: Record<string, any>;
  reviews: Record<string, any>;
  favorites: Record<string, any>;
  payment_orders: Record<string, any>;
  tournaments: Record<string, any>;
  tournament_registrations: Record<string, any>;
  contact_messages: Record<string, any>;
  rate_limits: Record<string, any>;
}

export const schema: any = null;
export const tables: any = null;
