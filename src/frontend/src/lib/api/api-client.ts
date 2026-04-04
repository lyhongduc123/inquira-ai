/**
 * API Client with automatic token refresh using HTTP-only cookies
 * 
 * This client automatically:
 * - Includes credentials (cookies) in all requests
 * - Detects 401 errors (expired tokens)
 * - Refreshes the access token (via cookie)
 * - Retries the original request
 * - Extracts metadata from HTTP headers (X-Request-ID, X-Timestamp)
 * 
 * Security: All tokens are stored in HTTP-only cookies, not accessible to JavaScript
 */

import { useAuthStore } from "@/store/auth-store";
import { ApiError, ErrorCode } from "@/types/api.type";

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipRetry?: boolean;
}

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: ((error?: Error) => void)[] = [];

  private normalizeErrorCode(rawCode?: string): ErrorCode {
    if (!rawCode) {
      return ErrorCode.INTERNAL_ERROR;
    }

    const normalized = rawCode.replace(/\s+/g, "_").toUpperCase();

    const knownCodes = new Set<string>(Object.values(ErrorCode));
    if (knownCodes.has(normalized)) {
      return normalized as ErrorCode;
    }

    return ErrorCode.INTERNAL_ERROR;
  }

  private getDefaultMessageForCode(code: ErrorCode, status: number): string {
    if (status === 401 || code === ErrorCode.UNAUTHORIZED) {
      return "Invalid or expired verification code. Please try again.";
    }

    if (status === 400 || code === ErrorCode.BAD_REQUEST) {
      return "Invalid request. Please check your input and try again.";
    }

    if (status >= 500) {
      return "Server error. Please try again in a moment.";
    }

    return "Request failed. Please try again.";
  }

  /**
   * Subscribe to token refresh completion
   */
  private subscribeTokenRefresh(callback: (error?: Error) => void) {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Notify all subscribers when token is refreshed
   */
  private onRefreshed(error?: Error) {
    this.refreshSubscribers.forEach((callback) => callback(error));
    this.refreshSubscribers = [];
  }

  /**
   * Refresh the access token using httpOnly cookie
   */
  private async refreshAccessToken(): Promise<void> {
    const { logout, isAuthenticated } = useAuthStore.getState();

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

    } catch (error) {
      if (isAuthenticated) {
        await logout();
      }
      throw error;
    }
  }

  /**
   * Make an authenticated request with automatic token refresh
   */
  async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { skipAuth = false, skipRetry = false, ...fetchConfig } = config;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(fetchConfig.headers as Record<string, string>),
    };

    let response = await fetch(endpoint, {
      ...fetchConfig,
      headers,
      credentials: "include",
    });

    // Handle 401 errors (expired token)
    if (response.status === 401 && !skipRetry && !skipAuth) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;

        try {
          await this.refreshAccessToken();
          this.isRefreshing = false;
          this.onRefreshed();

          // Retry the original request with new token (now in cookie)
          response = await fetch(endpoint, {
            ...fetchConfig,
            headers,
            credentials: "include", // Include httpOnly cookies
          });
        } catch (error) {
          this.isRefreshing = false;
          this.onRefreshed(error instanceof Error ? error : new Error("Refresh failed"));
          throw error;
        }
      } else {
        await new Promise<void>((resolve, reject) => {
          this.subscribeTokenRefresh((error) => {
            if (error) {
              reject(error); 
            } else {
              resolve();
            }
          });
        });

        // Retry the original request with new token (now in cookie)
        response = await fetch(endpoint, {
          ...fetchConfig,
          headers,
          credentials: "include", 
        });
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorBody: Record<string, unknown> | null = null;

      try {
        errorBody = JSON.parse(errorText);
      } catch {

      }

      let errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR;

      if (typeof errorBody?.code === "string") {
        errorCode = this.normalizeErrorCode(errorBody.code);
      } else {
        switch (response.status) {
          case 400:
            errorCode = ErrorCode.BAD_REQUEST;
            break;
          case 401:
            errorCode = ErrorCode.UNAUTHORIZED;
            break;
          case 403:
            errorCode = ErrorCode.FORBIDDEN;
            break;
          case 404:
            errorCode = ErrorCode.NOT_FOUND;
            break;
          case 409:
            errorCode = ErrorCode.CONFLICT;
            break;
          case 422:
            errorCode = ErrorCode.VALIDATION_ERROR;
            break;
          case 503:
            errorCode = ErrorCode.SERVICE_UNAVAILABLE;
            break;
          case 504:
            errorCode = ErrorCode.TIMEOUT_ERROR;
            break;
          default:
            errorCode = response.status >= 500 
              ? ErrorCode.INTERNAL_ERROR 
              : ErrorCode.BAD_REQUEST;
        }
      }

      const detailMessage = typeof errorBody?.detail === "string" ? errorBody.detail : null;
      const errorMessageField = typeof errorBody?.error === "string" ? errorBody.error : null;
      const errorMessage =
        detailMessage ||
        errorMessageField ||
        this.getDefaultMessageForCode(errorCode, response.status) ||
        errorText ||
        `Request failed with status ${response.status}`;

      const errorDetails =
        errorBody && typeof errorBody.details === "object" && errorBody.details !== null
          ? (errorBody.details as Record<string, unknown>)
          : undefined;
      
      throw new ApiError(
        errorMessage,
        errorCode,
        response.status,
        errorDetails
      );
    }

    const requestId = response.headers.get("X-Request-ID");
    const timestamp = response.headers.get("X-Timestamp");
    
    if (requestId) {
      console.debug(`Request ID: ${requestId}, Timestamp: ${timestamp}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  }

  /**
   * Convenience methods
   */
  async get<T = unknown>(endpoint: string, config?: RequestConfig): Promise<T> {
    return await this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return await this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return await this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return await this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = unknown>(endpoint: string, config?: RequestConfig): Promise<T> {
    return await this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
