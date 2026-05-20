import { GraphQLError } from "graphql";

export interface ErrorDetails {
  field?: string;
  message: string;
}

export interface StandardErrorOptions {
  code: string;
  statusCode: number;
  details?: ErrorDetails[];
  traceId?: string;
}

export class AppGraphQLError extends GraphQLError {
  constructor(message: string, options: StandardErrorOptions) {
    super(message, {
      extensions: {
        code: options.code,
        statusCode: options.statusCode,
        details: options.details ?? [],
        timestamp: new Date().toISOString(),
        traceId: options.traceId,
      },
    });
  }
}

export function unauthorized(message = "Unauthorized", traceId?: string): AppGraphQLError {
  return new AppGraphQLError(message, {
    code: "UNAUTHORIZED",
    statusCode: 401,
    traceId,
  });
}

export function forbidden(message = "Forbidden", traceId?: string): AppGraphQLError {
  return new AppGraphQLError(message, {
    code: "FORBIDDEN",
    statusCode: 403,
    traceId,
  });
}

export function notFound(resource: string, traceId?: string): AppGraphQLError {
  return new AppGraphQLError(`${resource} not found`, {
    code: "NOT_FOUND",
    statusCode: 404,
    traceId,
  });
}

export function badRequest(message: string, details: ErrorDetails[] = [], traceId?: string): AppGraphQLError {
  return new AppGraphQLError(message, {
    code: "BAD_REQUEST",
    statusCode: 400,
    details,
    traceId,
  });
}

export function conflict(message: string, traceId?: string): AppGraphQLError {
  return new AppGraphQLError(message, {
    code: "CONFLICT",
    statusCode: 409,
    traceId,
  });
}
