"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { authApi } from "@/lib/api/auth-api";
import { TypographyP } from "@/components/global/typography";
import { HStack } from "@/components/layout/hstack";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOAuthLogin = (provider: "google" | "github") => {
    const url = authApi.getOAuthUrl(provider);

    window.location.href = url;
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Redirect to Google with email hint
    const googleUrl = authApi.getOAuthUrl("google");
    const urlWithEmail = `${googleUrl}?login_hint=${encodeURIComponent(email)}`;
    window.location.href = urlWithEmail;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to Exegent
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in to save your conversations and access them anywhere
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Input */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full cursor-pointer hover:border-current hover:bg-transparent hover:text-current"
              disabled={!email || isSubmitting}
            >
              <Icon
                icon="mdi:email-outline"
                className="h-6 w-6 -translate-y-px scale-125"
              />
              Continue with Email
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <HStack className="absolute inset-0 items-center">
              <span className="w-full border-t" />
            </HStack>
            <HStack className="relative justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </HStack>
          </div>

          {/* OAuth Providers */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="flex w-full cursor-pointer items-center justify-center gap-2 hover:border-current hover:bg-transparent hover:text-current"
              onClick={() => handleOAuthLogin("google")}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <Icon
                  icon="logos:google-icon"
                  className="h-5 w-5 -translate-y-px scale-110"
                />
              </span>
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="flex w-full cursor-pointer items-center justify-center gap-2 hover:border-current hover:bg-transparent hover:text-current"
              onClick={() => handleOAuthLogin("github")}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <Icon
                  icon="octicon:mark-github-16"
                  className="h-5 w-5 -translate-y-px scale-110"
                />
              </span>
              Continue with GitHub
            </Button>
          </div>

          <TypographyP variant="muted" size="xs" align="center" className="px-8">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </TypographyP>
        </div>
      </DialogContent>
    </Dialog>
  );
}
