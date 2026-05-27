import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable, from } from "@apollo/client/core";
import { ApolloProvider } from "@apollo/client/react";
import { ErrorLink } from "@apollo/client/link/error";
import { type ReactNode } from "react";
import { apiConfig } from "../config/api.config";

const graphqlUrl = apiConfig.baseUrl;
const publicOperations = new Set(["Login", "SocialLogin", "Refresh"]);

export function getStoredToken(): string | null {
  return localStorage.getItem(apiConfig.tokenKey);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(apiConfig.tokenKey, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(apiConfig.tokenKey);
}

const authLink = new ApolloLink((operation, forward) => {
  const token = getStoredToken();
  const operationName = operation.operationName;

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token && !publicOperations.has(operationName) ? { Authorization: `${apiConfig.tokenType} ${token}` } : {}),
    },
  }));

  return forward(operation);
});

async function refreshAccessToken(): Promise<string | null> {
  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: "mutation Refresh { refresh { token } }",
    }),
  });

  const payload = await response.json();
  const token = payload?.data?.refresh?.token;
  if (typeof token === "string") {
    setStoredToken(token);
    return token;
  }

  return null;
}

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  const message = error?.message ?? "";
  const hasUnauthorized = message.includes("401") || message.toLowerCase().includes("unauthorized");

  if (!hasUnauthorized || !getStoredToken()) {
    return;
  }

  return new Observable((observer) => {
    refreshAccessToken()
      .then((token) => {
        if (!token) {
          clearStoredToken();
          observer.error(error);
          return;
        }

        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            Authorization: `${apiConfig.tokenType} ${token}`,
          },
        }));

        forward(operation).subscribe(observer);
      })
      .catch((refreshError) => {
        clearStoredToken();
        observer.error(refreshError);
      });
  });
});

export const apolloClient = new ApolloClient({
  link: from([
    errorLink,
    authLink,
    new HttpLink({
      uri: graphqlUrl,
      credentials: "include",
    }),
  ]),
  cache: new InMemoryCache(),
  connectToDevTools: apiConfig.env === "development",
});

export function ApolloClientProvider({ children }: { children: ReactNode }) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
