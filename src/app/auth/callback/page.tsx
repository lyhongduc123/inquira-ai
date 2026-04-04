import { Suspense } from "react";
import { AuthCallbackPageClient } from "./_components/AuthCallbackPageClient";

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Completing sign in...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackPageClient />
    </Suspense>
  );
}