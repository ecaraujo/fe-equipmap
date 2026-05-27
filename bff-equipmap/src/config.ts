export interface AppConfig {
  port: number;
  graphqlPath: string;
  frontendOrigin: string;
  jwtSecret: string;
  jwtIssuer: string;
  rateLimitWindowMs: number;
  rateLimitMaxByIp: number;
  rateLimitMaxByUser: number;
  services: ServiceUrls;
}

export interface ServiceUrls {
  auth: string;
  condominium: string;
  equipment: string;
  maintenance: string;
  warranty: string;
  parking: string;
  brigadier: string;
  notification: string;
}

function numberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function requiredUrlEnv(name: string): string {
  const raw = process.env[name];
  if (!raw) {
    throw new Error(`${name} is required. Configure the BFF with the real microservice URL.`);
  }
  return raw.replace(/\/+$/, "");
}

export const config: AppConfig = {
  port: numberEnv("PORT", 4000),
  graphqlPath: process.env.GRAPHQL_PATH ?? "/graphql",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET ?? process.env.AUTH_JWT_SECRET ?? "dev-only-change-me-dev-only-change-me-dev-only-change-me",
  jwtIssuer: process.env.JWT_ISSUER ?? process.env.AUTH_JWT_ISSUER ?? "equipmap-auth-service",
  rateLimitWindowMs: numberEnv("RATE_LIMIT_WINDOW_MS", 60_000),
  rateLimitMaxByIp: numberEnv("RATE_LIMIT_MAX_BY_IP", 120),
  rateLimitMaxByUser: numberEnv("RATE_LIMIT_MAX_BY_USER", 240),
  services: {
    auth: requiredUrlEnv("AUTH_SERVICE_URL"),
    condominium: requiredUrlEnv("CONDOMINIUM_SERVICE_URL"),
    equipment: requiredUrlEnv("EQUIPMENT_SERVICE_URL"),
    maintenance: requiredUrlEnv("MAINTENANCE_SERVICE_URL"),
    warranty: requiredUrlEnv("WARRANTY_SERVICE_URL"),
    parking: requiredUrlEnv("PARKING_SERVICE_URL"),
    brigadier: requiredUrlEnv("BRIGADIER_SERVICE_URL"),
    notification: requiredUrlEnv("NOTIFICATION_SERVICE_URL"),
  },
};
