import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { authService } from "../services/auth.service";
import type { User, LoginCredentials, SocialProvider } from "../types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithSocial: (provider: SocialProvider) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { user: u } = await authService.login(credentials);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithSocial = useCallback(async (provider: SocialProvider) => {
    setIsLoading(true);
    try {
      const { user: u } = await authService.loginWithSocial(provider);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, loginWithSocial, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const defaultAuthValue: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  loginWithSocial: async () => {},
  logout: async () => {},
};

export function useAuth(): AuthContextValue {
  return useContext(AuthContext) ?? defaultAuthValue;
}
