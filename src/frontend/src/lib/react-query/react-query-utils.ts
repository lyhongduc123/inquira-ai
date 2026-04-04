/**
 * React Query error handling utilities
 */

import { toast } from "sonner";
import { HttpStatus } from "@/types/api.type";
import {
  getErrorMessage,
  isApiError,
  isValidationError,
  getValidationErrors,
  shouldRetryError,
  getRetryDelay,
} from "./error-utils";

/**
 * Default React Query retry logic based on error type
 */
export function defaultRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 3) {
    return false;
  }

  return shouldRetryError(error);
}

/**
 * Default React Query retry delay with exponential backoff
 */
export function defaultRetryDelay(
  attemptIndex: number,
  error: unknown
): number {
  return getRetryDelay(attemptIndex, error);
}

/**
 * Handle query error with toast notification
 */
export function handleQueryError(error: unknown, customMessage?: string): void {
  const message = customMessage || getErrorMessage(error);

  if (isApiError(error)) {
    // Handle specific status codes differently
    switch (error.status) {
      case HttpStatus.NOT_FOUND:
        toast.error("Not Found", {
          description: message,
        });
        break;

      case HttpStatus.UNAUTHORIZED:
        toast.error("Authentication Required", {
          description: message,
        });
        break;

      case HttpStatus.FORBIDDEN:
        toast.error("Access Denied", {
          description: message,
        });
        break;

      case HttpStatus.UNPROCESSABLE_ENTITY:
      case HttpStatus.BAD_REQUEST:
        if (isValidationError(error)) {
          const validationErrors = getValidationErrors(error);
          if (validationErrors) {
            const firstError = Object.values(validationErrors)[0];
            toast.error("Validation Error", {
              description: String(firstError) || message,
            });
          } else {
            toast.error("Validation Error", {
              description: message,
            });
          }
        } else {
          toast.error("Invalid Request", {
            description: message,
          });
        }
        break;

      case HttpStatus.CONFLICT:
        toast.error("Conflict", {
          description: message,
        });
        break;

      case HttpStatus.INTERNAL_SERVER_ERROR:
        toast.error("Server Error", {
          description: message,
        });
        break;

      case HttpStatus.SERVICE_UNAVAILABLE:
        toast.error("Service Unavailable", {
          description: message,
        });
        break;

      default:
        if (error.isServerError()) {
          toast.error("Server Error", {
            description: message,
          });
        } else {
          toast.error("Error", {
            description: message,
          });
        }
    }
  } else {
    // Network or unknown error
    toast.error("Error", {
      description: message,
    });
  }
}

/**
 * Handle mutation error with toast notification
 */
export function handleMutationError(
  error: unknown,
  action?: string
): void {
  const actionText = action ? ` ${action}` : "";
  const message = getErrorMessage(error);

  if (isApiError(error)) {
    switch (error.status) {
      case HttpStatus.NOT_FOUND:
        toast.error(`Failed to${actionText}`, {
          description: "Resource not found.",
        });
        break;

      case HttpStatus.UNAUTHORIZED:
        toast.error(`Failed to${actionText}`, {
          description: "You need to be logged in.",
        });
        break;

      case HttpStatus.FORBIDDEN:
        toast.error(`Failed to${actionText}`, {
          description: "You don't have permission.",
        });
        break;

      case HttpStatus.UNPROCESSABLE_ENTITY:
      case HttpStatus.BAD_REQUEST:
        if (isValidationError(error)) {
          const validationErrors = getValidationErrors(error);
          if (validationErrors) {
            toast.error(`Failed to${actionText}`, {
              description: Object.entries(validationErrors)
                .map(([field, err]) => `${field}: ${err}`)
                .join(", "),
            });
          } else {
            toast.error(`Failed to${actionText}`, {
              description: message,
            });
          }
        } else {
          toast.error(`Failed to${actionText}`, {
            description: message,
          });
        }
        break;

      case HttpStatus.CONFLICT:
        toast.error(`Failed to${actionText}`, {
          description: "This operation conflicts with existing data.",
        });
        break;

      default:
        toast.error(`Failed to${actionText}`, {
          description: message,
        });
    }
  } else {
    toast.error(`Failed to${actionText}`, {
      description: message,
    });
  }
}

/**
 * Handle mutation success with toast notification
 */
export function handleMutationSuccess(message: string): void {
  toast.success(message);
}
