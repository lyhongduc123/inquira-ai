import { User } from "@/types/auth.type";
import { apiClient } from "./api-client";

export interface RequestEmailOtpPayload {
  email: string;
  mode: "login" | "signup";
  name?: string;
}

export interface RequestEmailOtpResponse {
  message: string;
  expiresIn: number;
  resendAfter: number;
}

export interface VerifyEmailOtpPayload {
  email: string;
  otp: string;
  mode: "login" | "signup";
  name?: string;
}

export interface VerifyEmailOtpResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface PreVerifyEmailOtpResponse {
  message: string;
}

export const authApi = {
  /**
   * Get OAuth URL for provider
   * Route through frontend API so callback can forward auth cookies to this domain
   */
  getOAuthUrl(provider: "google" | "github"): string {
    return `/api/auth/${provider}`;
  },

  /**
   * Get current user info
   * @param skipRetry - If true, skip automatic token refresh on 401 (useful for initial auth checks)
   */
  async getMe(skipRetry = false): Promise<User> {
    const response = await apiClient.get<User>("/api/auth/me", { skipRetry });
    return response;
  },

  /**
   * Refresh access token using httpOnly cookie (no body needed)
   */
  async refreshToken(): Promise<void> {
    return apiClient.post<void>(
      "/api/auth/refresh",
      {}, 
      { skipAuth: true, skipRetry: true }
    );
  },

  /**
   * Logout and revoke refresh token (from httpOnly cookie)
   */
  async logout(): Promise<void> {
    return await apiClient.post<void>(
      "/api/auth/logout",
      {} // Empty body, refresh token comes from httpOnly cookie
    );
  },

  /**
   * Request email OTP for login/signup.
   */
  async requestEmailOtp(
    payload: RequestEmailOtpPayload
  ): Promise<RequestEmailOtpResponse> {
    return await apiClient.post<RequestEmailOtpResponse>(
      "/api/auth/email/request-otp",
      payload,
      { skipAuth: true, skipRetry: true }
    );
  },

  /**
   * Verify email OTP and establish auth session (cookies).
   */
  async verifyEmailOtp(
    payload: VerifyEmailOtpPayload
  ): Promise<VerifyEmailOtpResponse> {
    return await apiClient.post<VerifyEmailOtpResponse>(
      "/api/auth/email/verify-otp",
      payload,
      { skipAuth: true, skipRetry: true }
    );
  },

  /**
   * Pre-verify signup OTP without consuming it.
   */
  async preVerifyEmailOtp(
    payload: VerifyEmailOtpPayload
  ): Promise<PreVerifyEmailOtpResponse> {
    return await apiClient.post<PreVerifyEmailOtpResponse>(
      "/api/auth/email/pre-verify-otp",
      payload,
      { skipAuth: true, skipRetry: true }
    );
  },
};
