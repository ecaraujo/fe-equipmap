import { apiConfig } from "../config/api.config";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestInterceptor = (options: RequestInit) => RequestInit | Promise<RequestInit>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

class HttpClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor() {
    if (!apiConfig.baseUrl) {
      throw new Error("HttpClient requires a base URL. Set VITE_API_BASE_URL in your .env file.");
    }
    this.baseUrl = apiConfig.baseUrl.replace(/\/$/, "");
    this.timeout = apiConfig.timeout;
    this.setupDefaultInterceptors();
  }

  private setupDefaultInterceptors(): void {
    // Inject auth token on every request
    this.addRequestInterceptor((options) => {
      const token = localStorage.getItem(apiConfig.tokenKey);
      if (!token) return options;
      return {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `${apiConfig.tokenType} ${token}`,
        },
      };
    });
  }

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  private async applyRequestInterceptors(options: RequestInit): Promise<RequestInit> {
    let result = options;
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    const defaultOptions: RequestInit = {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      signal: controller.signal,
    };

    const merged: RequestInit = {
      ...defaultOptions,
      ...options,
      headers: { ...defaultOptions.headers as object, ...options.headers as object },
    };

    const finalOptions = await this.applyRequestInterceptors(merged);
    const url = `${this.baseUrl}${endpoint}`;

    try {
      let response = await fetch(url, finalOptions);
      response = await this.applyResponseInterceptors(response);

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new ApiError(
          response.status,
          body?.message ?? `HTTP ${response.status} – ${response.statusText}`,
          body,
        );
      }

      if (response.status === 204) return undefined as T;
      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if ((error as Error).name === "AbortError") {
        throw new ApiError(408, "Request timeout");
      }
      throw new ApiError(0, `Network error: ${(error as Error).message}`);
    } finally {
      clearTimeout(timer);
    }
  }

  get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: "GET" });
  }

  post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body: JSON.stringify(body) });
  }

  put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) });
  }

  patch<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) });
  }

  delete<T = void>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

/** Singleton do cliente HTTP – use somente quando baseUrl estiver configurado */
let _httpClient: HttpClient | null = null;

export function getHttpClient(): HttpClient {
  if (!_httpClient) _httpClient = new HttpClient();
  return _httpClient;
}
