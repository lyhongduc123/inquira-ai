"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VStack } from "@/components/layout/vstack";
import { Lock, Loader2 } from "lucide-react";

interface RequireAuthProps {
  children: ReactNode;
  message?: string;
  description?: string;
}

/**
 * Inline auth requirement component that shows login prompt without redirecting
 * Use this for components within a page that need auth
 */
export function RequireAuth({
  children,
  message = "Sign in required",
  description = "You need to be signed in to access this content",
}: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleSignIn = () => {
    const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
    router.push(redirectUrl);
  };

  // Show loading spinner during auth check
  if (isLoading) {
    return (
      <VStack className="py-12 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </VStack>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <VStack className="py-8 items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <VStack className="items-center gap-4 mb-2">
              <div className="p-3 rounded-full bg-muted">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>{message}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </VStack>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              size="lg"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </VStack>
    );
  }

  // Render protected content when authenticated
  return <>{children}</>;
}
