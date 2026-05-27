/**
 * Configuracao central da API.
 * VITE_API_BASE_URL e obrigatorio para execucao integrada com o BFF GraphQL.
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  tokenType: string;
  tokenKey: string;
  env: "development" | "staging" | "production";
}

const baseUrl = import.meta.env.VITE_API_BASE_URL;

if (!baseUrl) {
  throw new Error("VITE_API_BASE_URL is required. Configure it with the BFF GraphQL endpoint, for example http://localhost:4000/graphql.");
}

export const apiConfig: ApiConfig = {
  baseUrl,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10_000,
  tokenType: import.meta.env.VITE_AUTH_TOKEN_TYPE || "Bearer",
  tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || "equipmap_auth_token",
  env: (import.meta.env.VITE_APP_ENV as ApiConfig["env"]) || "development",
};
