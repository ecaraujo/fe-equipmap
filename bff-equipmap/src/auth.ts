import jwt from "jsonwebtoken";
import { config } from "./config.js";

export type Role = "ADMIN" | "MANAGER" | "VIEWER";

export interface AuthClaims {
  userId: string;
  role: Role;
  condominiumId: string;
  token?: string;
}

interface JwtPayload extends jwt.JwtPayload {
  userId: string;
  role: Role;
  condominiumId: string;
}

export function signAccessToken(claims: AuthClaims): string {
  return jwt.sign(claims, config.jwtSecret, {
    expiresIn: "15m",
    issuer: config.jwtIssuer,
  });
}

export function verifyAccessToken(token: string): AuthClaims {
  const payload = jwt.verify(token, config.jwtSecret, {
    issuer: config.jwtIssuer,
  }) as JwtPayload;

  if (!payload.userId || !payload.role || !payload.condominiumId) {
    throw new Error("JWT missing required claims");
  }

  return {
    userId: payload.userId,
    role: payload.role,
    condominiumId: payload.condominiumId,
    token,
  };
}

export function getBearerToken(header?: string): string | null {
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}
