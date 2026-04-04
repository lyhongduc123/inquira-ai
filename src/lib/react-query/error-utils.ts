/**
 * Error handling utilities for API errors
 */

import { ApiError, ErrorCode, HttpStatus } from "@/types/api.type";

/**
 * Check if error is an ApiError instance
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Extract error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.getUserMessage();
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}

/**
 * Get error code from any error type
 */
export function getErrorCode(error: unknown): ErrorCode | null {
  if (isApiError(error)) {
    return error.code;
  }
  return null;
}

/**
 * Get HTTP status from any error type
 */
export function getErrorStatus(error: unknown): number | null {
  if (isApiError(error)) {
    return error.status;
  }
  return null;
}

/**
 * Check if error is a specific status code
 */
export function isErrorStatus(error: unknown, status: HttpStatus): boolean {
  if (isApiError(error)) {
    return error.isStatus(status);
  }
  return false;
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.isClientError();
  }
  return false;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.isServerError();
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  return (
    isApiError(error) &&
    (error.code === ErrorCode.VALIDATION_ERROR ||
      error.status === HttpStatus.UNPROCESSABLE_ENTITY ||
      error.status === HttpStatus.BAD_REQUEST)
  );
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: unknown): boolean {
  return isErrorStatus(error, HttpStatus.NOT_FOUND);
}

/**
 * Check if error is an unauthorized error
 */
export function isUnauthorizedError(error: unknown): boolean {
  return isErrorStatus(error, HttpStatus.UNAUTHORIZED);
}

/**
 * Check if error is a forbidden error
 */
export function isForbiddenError(error: unknown): boolean {
  return isErrorStatus(error, HttpStatus.FORBIDDEN);
}

/**
 * Check if error is a conflict error
 */
export function isConflictError(error: unknown): boolean {
  return isErrorStatus(error, HttpStatus.CONFLICT);
}

/**
 * Get validation error details if available
 */
export function getValidationErrors(
  error: unknown
): Record<string, unknown> | null {
  if (isApiError(error) && isValidationError(error) && error.details) {
    return error.details;
  }
  return null;
}

/**
 * Determine if error should be retried
 */
export function shouldRetryError(error: unknown): boolean {
  if (!isApiError(error)) {
    return true;
  }

  if (error.isServerError()) {
    return true;
  }

  if (
    error.status === HttpStatus.SERVICE_UNAVAILABLE ||
    error.status === HttpStatus.GATEWAY_TIMEOUT
  ) {
    return true;
  }

  return false;
}

/**
 * Get retry delay based on error type (exponential backoff)
 */
export function getRetryDelay(attemptIndex: number, error: unknown): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds

  // Exponential backoff for server errors, fixed delay for client errors
  const delay = Math.min(baseDelay * Math.pow(2, attemptIndex), maxDelay);
  const jitter = Math.random() * 1000;

  return delay + jitter;
}
