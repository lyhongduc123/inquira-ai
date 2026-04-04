import { Box } from "@/components/layout/box";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { LoginPageClient } from "./_components/LoginPageClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Box>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}