import { apiConfig, API_ENDPOINTS } from "../config/api.config";
import { getHttpClient } from "./http.client";
import type { User, LoginCredentials, AuthResponse, SocialProvider } from "../types";

const MOCK_USER: User = {
  id: "user-1",
  name: "João Alves",
  email: "joao.alves@residencialpark.com.br",
  role: "admin",
  condominiumId: "cond-1",
  condominiumName: "Residencial Park",
};

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  loginWithSocial(provider: SocialProvider): Promise<AuthResponse>;
  logout(): Promise<void>;
  me(): Promise<User>;
  getStoredToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
}

class MockAuthService implements IAuthService {
  private delay = () => new Promise((r) => setTimeout(r, 600));

  async login(_credentials: LoginCredentials): Promise<AuthResponse> {
    await this.delay();
    const token = "mock-jwt-token-" + Date.now();
    this.setToken(token);
    return { user: MOCK_USER, token };
  }

  async loginWithSocial(_provider: SocialProvider): Promise<AuthResponse> {
    await this.delay();
    const token = "mock-social-token-" + Date.now();
    this.setToken(token);
    return { user: MOCK_USER, token };
  }

  async logout(): Promise<void> {
    await this.delay();
    this.clearToken();
  }

  async me(): Promise<User> {
    await this.delay();
    return MOCK_USER;
  }

  getStoredToken(): string | null {
    return localStorage.getItem(apiConfig.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(apiConfig.tokenKey, token);
  }

  clearToken(): void {
    localStorage.removeItem(apiConfig.tokenKey);
  }
}

class ApiAuthService implements IAuthService {
  private http = getHttpClient();

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await this.http.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials);
    this.setToken(res.token);
    return res;
  }

  async loginWithSocial(provider: SocialProvider): Promise<AuthResponse> {
    const res = await this.http.post<AuthResponse>(`${API_ENDPOINTS.auth.login}/${provider}`, {});
    this.setToken(res.token);
    return res;
  }

  async logout(): Promise<void> {
    await this.http.post(API_ENDPOINTS.auth.logout, {});
    this.clearToken();
  }

  me(): Promise<User> {
    return this.http.get<User>(API_ENDPOINTS.auth.me);
  }

  getStoredToken(): string | null {
    return localStorage.getItem(apiConfig.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(apiConfig.tokenKey, token);
  }

  clearToken(): void {
    localStorage.removeItem(apiConfig.tokenKey);
  }
}

export const authService: IAuthService = apiConfig.useMock
  ? new MockAuthService()
  : new ApiAuthService();
