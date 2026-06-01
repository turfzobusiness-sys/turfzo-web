// Stub types for Convex _generated/server until `npx convex dev` runs.
// This file will be overwritten by Convex codegen with real types.
// Stubs are intentionally permissive so local typecheck passes.

import type { DataModel, Id } from "./dataModel";

export type Doc<TableName extends keyof DataModel> = DataModel[TableName];

type ChainableQuery<TableName extends keyof DataModel> = {
  withIndex: (
    indexName: string,
    indexRange?: (q: any) => any
  ) => ChainableQuery<TableName>;
  filter: (predicate?: (q: any) => any) => ChainableQuery<TableName>;
  order: (direction: "asc" | "desc") => ChainableQuery<TableName>;
  collect: () => Promise<Doc<TableName>[]>;
  first: () => Promise<Doc<TableName> | null>;
  unique: () => Promise<Doc<TableName> | null>;
  take: (n: number) => Promise<Doc<TableName>[]>;
};

export interface QueryCtx {
  db: {
    get: <TableName extends keyof DataModel>(
      id: Id<TableName & string>
    ) => Promise<Doc<TableName> | null>;
    query: <TableName extends keyof DataModel>(
      tableName: TableName
    ) => ChainableQuery<TableName>;
  };
  auth: {
    getUserIdentity: () => Promise<Record<string, any> | null>;
  };
  storage: {
    getUrl: (id: Id<"_storage">) => Promise<string | null>;
  };
  runQuery: (fn: any, args: any) => Promise<any>;
}

export interface MutationCtx extends QueryCtx {
  db: QueryCtx["db"] & {
    insert: <TableName extends keyof DataModel>(
      tableName: TableName,
      value: Record<string, any>
    ) => Promise<Id<TableName & string>>;
    patch: <TableName extends keyof DataModel>(
      id: Id<TableName & string>,
      value: Record<string, any>
    ) => Promise<void>;
    replace: <TableName extends keyof DataModel>(
      id: Id<TableName & string>,
      value: Record<string, any>
    ) => Promise<void>;
    delete: <TableName extends keyof DataModel>(id: Id<TableName & string>) => Promise<void>;
  };
}

export interface ActionCtx {
  auth: QueryCtx["auth"];
  storage: QueryCtx["storage"];
  runQuery: (fn: any, args: any) => Promise<any>;
  runMutation: (fn: any, args: any) => Promise<any>;
  runAction: (fn: any, args: any) => Promise<any>;
  // Actions can also read/write to the DB (in Convex). The `db` proxy here is
  // loosely typed to keep the stub minimal; real codegen produces a proper type.
  db: QueryCtx["db"] & MutationCtx["db"];
}

type ArgsValidator = Record<string, any>;

export function query<Args extends ArgsValidator, Output>(config: {
  args?: Args;
  handler: (ctx: QueryCtx, args: any) => Promise<Output>;
  returns?: any;
}): (ctx: QueryCtx, args: any) => Promise<Output>;

export function mutation<Args extends ArgsValidator, Output>(config: {
  args?: Args;
  handler: (ctx: MutationCtx, args: any) => Promise<Output>;
  returns?: any;
}): (ctx: MutationCtx, args: any) => Promise<Output>;

export function action<Args extends ArgsValidator, Output>(config: {
  args?: Args;
  handler: (ctx: ActionCtx, args: any) => Promise<Output>;
  returns?: any;
}): (ctx: ActionCtx, args: any) => Promise<Output>;

export function internalQuery<Args extends ArgsValidator, Output>(config: {
  args?: Args;
  handler: (ctx: QueryCtx, args: any) => Promise<Output>;
  returns?: any;
}): (ctx: QueryCtx, args: any) => Promise<Output>;

export function internalMutation<Args extends ArgsValidator, Output>(config: {
  args?: Args;
  handler: (ctx: MutationCtx, args: any) => Promise<Output>;
  returns?: any;
}): (ctx: MutationCtx, args: any) => Promise<Output>;

export function internalAction<Args extends ArgsValidator, Output>(config: {
  args?: Args;
  handler: (ctx: ActionCtx, args: any) => Promise<Output>;
  returns?: any;
}): (ctx: ActionCtx, args: any) => Promise<Output>;

export function httpAction(handler: (ctx: any, req: Request) => Promise<Response>): (ctx: any, req: Request) => Promise<Response>;
export const httpRouter: any;
