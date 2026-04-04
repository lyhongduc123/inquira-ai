/**
 * HTTP-native API types (no wrapper)
 * Backend returns raw data with metadata in HTTP headers
 */

export enum ErrorCode {
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  CONFLICT = "CONFLICT",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
}

/**
 * HTTP Status Code enum for better error handling
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * Error response structure from backend
 * Returned in response body when status >= 400
 */
export interface ErrorResponse {
  detail: string;
  code: ErrorCode;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Custom API error class with HTTP status
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if error is specific status
   */
  isStatus(status: HttpStatus): boolean {
    return this.status === status;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.status) {
      case HttpStatus.BAD_REQUEST:
        return this.details ? this.message : "Invalid request. Please check your input.";
      case HttpStatus.UNAUTHORIZED:
        return "You need to be logged in to perform this action.";
      case HttpStatus.FORBIDDEN:
        return "You don't have permission to perform this action.";
      case HttpStatus.NOT_FOUND:
        return "The requested resource was not found.";
      case HttpStatus.CONFLICT:
        return "This operation conflicts with existing data.";
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return this.message || "Unable to process the request.";
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return "An internal server error occurred. Please try again later.";
      case HttpStatus.SERVICE_UNAVAILABLE:
        return "Service is temporarily unavailable. Please try again later.";
      case HttpStatus.GATEWAY_TIMEOUT:
        return "Request timeout. Please try again.";
      default:
        return this.message || "An unexpected error occurred.";
    }
  }
}

/**
 * Paginated data structure from backend
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface DeleteResponse {
  message: string;
}