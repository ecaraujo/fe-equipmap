import { GraphQLError } from "graphql";
import { config } from "./config.js";
import type { AuthClaims } from "./auth.js";
import type { GraphQLContext } from "./context.js";

export type JsonRecord = Record<string, unknown>;

interface RequestOptions {
  auth?: AuthClaims | null;
  traceId: string;
  query?: JsonRecord;
  body?: unknown;
  cookie?: string;
}

interface RestErrorBody {
  statusCode?: number;
  error?: string;
  message?: string;
  details?: unknown[];
  timestamp?: string;
  traceId?: string;
}

function cleanQuery(query?: JsonRecord): string {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

function normalizePage<T extends JsonRecord>(response: unknown): { data: T[]; pageInfo: JsonRecord } {
  const value = response as JsonRecord;
  if (Array.isArray(value)) {
    return { data: value as T[], pageInfo: { total: value.length, page: 1, pageSize: value.length, totalPages: 1 } };
  }
  const data = (value.data ?? value.content ?? []) as T[];
  const pageInfo = (value.pageInfo ?? {
    total: value.total ?? value.totalElements ?? data.length,
    page: value.page ?? value.number ?? 1,
    pageSize: value.pageSize ?? value.size ?? data.length,
    totalPages: value.totalPages ?? 1,
  }) as JsonRecord;
  return { data, pageInfo };
}

function booleanResult(result: unknown): boolean {
  if (result === undefined || result === null) return true;
  return Boolean(result);
}

export class RestClient {
  constructor(private readonly baseUrl: string) {}

  get<T = unknown>(path: string, options: RequestOptions): Promise<T> {
    return this.request<T>("GET", path, options);
  }

  post<T = unknown>(path: string, options: RequestOptions): Promise<T> {
    return this.request<T>("POST", path, options);
  }

  put<T = unknown>(path: string, options: RequestOptions): Promise<T> {
    return this.request<T>("PUT", path, options);
  }

  patch<T = unknown>(path: string, options: RequestOptions): Promise<T> {
    return this.request<T>("PATCH", path, options);
  }

  async delete(path: string, options: RequestOptions): Promise<boolean> {
    return booleanResult(await this.request("DELETE", path, options));
  }

  private async request<T>(method: string, path: string, options: RequestOptions): Promise<T> {
    const headers: Record<string, string> = {
      accept: "application/json",
      "x-trace-id": options.traceId,
    };

    if (options.body !== undefined) headers["content-type"] = "application/json";
    if (options.cookie) headers.cookie = options.cookie;
    if (options.auth) {
      headers["x-user-id"] = options.auth.userId;
      headers["x-user-role"] = options.auth.role;
      headers["x-condominium-id"] = options.auth.condominiumId;
      headers.authorization = `Bearer ${options.auth.token ?? ""}`;
    }

    const response = await fetch(`${this.baseUrl}${path}${cleanQuery(options.query)}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    const parsed = text ? (JSON.parse(text) as T | RestErrorBody) : undefined;

    if (!response.ok) {
      const body = (parsed ?? {}) as RestErrorBody;
      throw new GraphQLError(body.message ?? response.statusText, {
        extensions: {
          code: body.error ?? response.statusText.toUpperCase().replace(/\s+/g, "_"),
          statusCode: body.statusCode ?? response.status,
          details: body.details ?? [],
          timestamp: body.timestamp ?? new Date().toISOString(),
          traceId: body.traceId ?? options.traceId,
        },
      });
    }

    return parsed as T;
  }
}

export class BffDataSources {
  readonly auth = new RestClient(config.services.auth);
  readonly condominium = new RestClient(config.services.condominium);
  readonly equipment = new RestClient(config.services.equipment);
  readonly maintenance = new RestClient(config.services.maintenance);
  readonly warranty = new RestClient(config.services.warranty);
  readonly parking = new RestClient(config.services.parking);
  readonly brigadier = new RestClient(config.services.brigadier);
  readonly notification = new RestClient(config.services.notification);

  constructor(private readonly ctx: Pick<GraphQLContext, "auth" | "traceId" | "cookie">) {}

  requestOptions(extra: Partial<RequestOptions> = {}): RequestOptions {
    return {
      auth: this.ctx.auth,
      traceId: this.ctx.traceId,
      cookie: this.ctx.cookie,
      ...extra,
    };
  }

  page<T extends JsonRecord>(response: unknown): { data: T[]; pageInfo: JsonRecord } {
    return normalizePage<T>(response);
  }
}

export function createDataSources(ctx: Pick<GraphQLContext, "auth" | "traceId" | "cookie">): BffDataSources {
  return new BffDataSources(ctx);
}
