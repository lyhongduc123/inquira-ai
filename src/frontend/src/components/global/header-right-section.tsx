"use client";

import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useAuthStore } from "@/store/auth-store";
import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { HStack } from "@/components/layout/hstack";

/**
 * Default header right section with settings and sign in
 * Use this when you need the standard right section content
 */
export function HeaderRightSection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  return (
    <>
      <HStack className="items-center gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings2 className="h-4 w-4" />
        </Button>
        {!isAuthenticated && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsAuthDialogOpen(true)}
            >
              Sign In
            </Button>
          </>
        )}
      </HStack>
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />
    </>
  );
}
