import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { clearStoredToken, getStoredToken, setStoredToken } from "../graphql/client";
import { useLoginMutation, useLogoutMutation, useMeQuery, useSwitchCondominiumMutation } from "../graphql/generated";
import { mapUser } from "../graphql/mappers";
import type { Condominium, LoginCredentials, SocialProvider, User } from "../graphql/models";

interface AuthContextValue {
  user: User | null;
  pendingCondominiums: Condominium[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithSocial: (provider: SocialProvider) => Promise<void>;
  switchCondominium: (condominiumId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingCondominiums, setPendingCondominiums] = useState<Condominium[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [switchCondominiumMutation] = useSwitchCondominiumMutation();

  useMeQuery({
    skip: !!user || !getStoredToken(),
    onCompleted(data) {
      setUser(mapUser(data.me));
    },
    onError() {
      clearStoredToken();
    },
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      clearStoredToken();
      const response = await loginMutation({ variables: { input: credentials } });
      const auth = response.data!.login;
      setStoredToken(auth.token);
      const nextUser = mapUser(auth.user);
      setUser(nextUser);
      setPendingCondominiums(auth.requiresCondominiumSelection ? nextUser.condominiums ?? [] : []);
    } finally {
      setIsLoading(false);
    }
  }, [loginMutation]);

  const loginWithSocial = useCallback(async (provider: SocialProvider) => {
    clearStoredToken();
    throw new Error(
      `Login com ${provider === "google" ? "Google" : "Microsoft"} ainda nao esta configurado. Use e-mail e senha.`,
    );
  }, []);

  const switchCondominium = useCallback(async (condominiumId: string) => {
    setIsLoading(true);
    try {
      const response = await switchCondominiumMutation({ variables: { condominiumId } });
      const auth = response.data!.switchCondominium;
      setStoredToken(auth.token);
      setUser(mapUser(auth.user));
      setPendingCondominiums([]);
    } finally {
      setIsLoading(false);
    }
  }, [switchCondominiumMutation]);

  const logout = useCallback(async () => {
    await logoutMutation().catch(() => undefined);
    clearStoredToken();
    setUser(null);
    setPendingCondominiums([]);
  }, [logoutMutation]);

  return (
    <AuthContext.Provider
      value={{
        user,
        pendingCondominiums,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithSocial,
        switchCondominium,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const defaultAuthValue: AuthContextValue = {
  user: null,
  pendingCondominiums: [],
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  loginWithSocial: async () => {},
  switchCondominium: async () => {},
  logout: async () => {},
};

export function useAuth(): AuthContextValue {
  return useContext(AuthContext) ?? defaultAuthValue;
}
