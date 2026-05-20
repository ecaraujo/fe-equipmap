export interface AppConfig {
  port: number;
  graphqlPath: string;
  frontendOrigin: string;
  jwtSecret: string;
  mockMode: boolean;
  rateLimitWindowMs: number;
  rateLimitMaxByIp: number;
  rateLimitMaxByUser: number;
}

function numberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export const config: AppConfig = {
  port: numberEnv("PORT", 4000),
  graphqlPath: process.env.GRAPHQL_PATH ?? "/graphql",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  mockMode: process.env.MOCK_MODE !== "false",
  rateLimitWindowMs: numberEnv("RATE_LIMIT_WINDOW_MS", 60_000),
  rateLimitMaxByIp: numberEnv("RATE_LIMIT_MAX_BY_IP", 120),
  rateLimitMaxByUser: numberEnv("RATE_LIMIT_MAX_BY_USER", 240),
};
