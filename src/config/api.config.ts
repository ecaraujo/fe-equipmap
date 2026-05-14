/**
 * Configuração central da API.
 * Para conectar ao backend real, defina VITE_API_BASE_URL no arquivo .env.
 * Se não definido, a aplicação usa dados mock automaticamente.
 */
export interface ApiConfig {
  baseUrl: string | null;
  timeout: number;
  tokenType: string;
  tokenKey: string;
  useMock: boolean;
  env: "development" | "staging" | "production";
}

export const apiConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || null,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10_000,
  tokenType: import.meta.env.VITE_AUTH_TOKEN_TYPE || "Bearer",
  tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || "equipmap_auth_token",
  useMock: !import.meta.env.VITE_API_BASE_URL,
  env: (import.meta.env.VITE_APP_ENV as ApiConfig["env"]) || "development",
};

/** Endpoints da API REST – altere aqui se o backend usa rotas diferentes */
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    refresh: "/auth/refresh",
  },
  equipment: {
    base: "/equipment",
    byId: (id: string) => `/equipment/${id}`,
  },
  maintenance: {
    base: "/maintenance",
    byId: (id: string) => `/maintenance/${id}`,
    complete: (id: string) => `/maintenance/${id}/complete`,
  },
  warranty: {
    base: "/warranties",
    byId: (id: string) => `/warranties/${id}`,
  },
  parking: {
    apartments: "/parking/apartments",
    apartmentById: (id: string) => `/parking/apartments/${id}`,
    spots: "/parking/spots",
    spotById: (id: string) => `/parking/spots/${id}`,
    lottery: "/parking/lottery",
    results: "/parking/results",
  },
  brigadiers: {
    base: "/brigadiers",
    byId: (id: string) => `/brigadiers/${id}`,
    notify: "/brigadiers/notify",
    logs: "/brigadiers/notify/logs",
  },
  notifications: {
    base: "/notifications",
  },
} as const;
