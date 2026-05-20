import type { Request } from "express";
import { v4 as uuid } from "uuid";
import { getBearerToken, type AuthClaims, verifyAccessToken } from "./auth.js";

export interface GraphQLContext {
  auth: AuthClaims | null;
  traceId: string;
  operationName?: string;
}

const PUBLIC_OPERATIONS = new Set(["login", "socialLogin", "refresh", "IntrospectionQuery"]);

export function createContext(req: Request): GraphQLContext {
  const traceId = String(req.headers["x-trace-id"] ?? uuid());
  const operationName = typeof req.body?.operationName === "string" ? req.body.operationName : undefined;
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    return { auth: null, traceId, operationName };
  }

  return {
    auth: verifyAccessToken(token),
    traceId,
    operationName,
  };
}

export function isPublicOperation(operationName?: string): boolean {
  return Boolean(operationName && PUBLIC_OPERATIONS.has(operationName));
}
