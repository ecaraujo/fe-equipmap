import type { NextFunction, Request, Response } from "express";
import { getBearerToken, verifyAccessToken } from "./auth.js";
import { config } from "./config.js";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function touchBucket(key: string, limit: number, now: number): { allowed: boolean; retryAfter: number } {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + config.rateLimitWindowMs });
    return { allowed: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count <= limit) {
    return { allowed: true, retryAfter: 0 };
  }

  return {
    allowed: false,
    retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

function rateLimitResponse(res: Response, retryAfter: number): void {
  res.setHeader("Retry-After", String(retryAfter));
  res.status(429).json({
    errors: [
      {
        message: "Rate limit exceeded",
        extensions: {
          code: "RATE_LIMITED",
          statusCode: 429,
          details: [],
          timestamp: new Date().toISOString(),
          traceId: res.getHeader("x-trace-id"),
        },
      },
    ],
  });
}

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const now = Date.now();
  const ipKey = `ip:${req.ip ?? req.socket.remoteAddress ?? "unknown"}`;
  const byIp = touchBucket(ipKey, config.rateLimitMaxByIp, now);

  if (!byIp.allowed) {
    rateLimitResponse(res, byIp.retryAfter);
    return;
  }

  const token = getBearerToken(req.headers.authorization);
  if (token) {
    try {
      const claims = verifyAccessToken(token);
      const byUser = touchBucket(`user:${claims.userId}`, config.rateLimitMaxByUser, now);

      if (!byUser.allowed) {
        rateLimitResponse(res, byUser.retryAfter);
        return;
      }
    } catch {
      // Invalid tokens are handled by GraphQL context/resolvers as auth errors.
    }
  }

  next();
}
