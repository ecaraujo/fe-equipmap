export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
  avatar?: string;
  condominiumId?: string;
  condominiumName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export type SocialProvider = "google" | "microsoft";
