export interface User {
  id: number;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  provider: "google" | "github" | "email";
  isActive: boolean;
  createdAt: string;
}

export interface OAuthUrlResponse {
  authorizationUrl: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
