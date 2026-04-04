"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Box } from "@/components/layout/box";
import { Header } from "@/components/global/header";
import { TypographyP } from "@/components/global/typography";
import { VStack } from "@/components/layout/vstack";
import { authApi } from "@/lib/api/auth-api";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { ApiError, ErrorCode } from "@/types/api.type";

import { EmailStepForm } from "./EmailStepForm";
import { OtpStepForm } from "./OtpStepForm";
import { OAuthContinueSection } from "./OAuthContinueSection";

type LoginStep = "email" | "otp";

const emailFormSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;
type OtpFormValues = { otp: string };

export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState<LoginStep>("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirect") || "/";

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
    },
  });

  const otpForm = useForm<OtpFormValues>({
    mode: "onSubmit",
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  const clearMessages = () => {
    setErrorMessage(null);
    setInfoMessage(null);
  };

  const handleRequestOtp = emailForm.handleSubmit(async (values) => {
    const normalizedEmail = values.email.trim().toLowerCase();
    setIsSubmitting(true);
    clearMessages();

    try {
      const response = await authApi.requestEmailOtp({
        email: normalizedEmail,
        mode: "login",
      });

      setStep("otp");
      setInfoMessage(values.email || response.message);
    } catch (error) {
      const message = (error instanceof ApiError && error.code === ErrorCode.BAD_REQUEST) ?
        "Invalid email, please try again." :
        "Could not send verification code. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleResendOtp = async () => {
    const normalizedEmail = emailForm.getValues("email").trim().toLowerCase();

    if (!normalizedEmail) {
      return;
    }

    setIsSubmitting(true);
    clearMessages();

    try {
      const response = await authApi.requestEmailOtp({
        email: normalizedEmail,
        mode: "login",
      });
      setInfoMessage(
        response.message || "Verification code sent to your email.",
      );
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Could not resend verification code. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = otpForm.handleSubmit(async (values) => {
    const normalizedEmail = emailForm.getValues("email").trim().toLowerCase();
    const normalizedOtp = (values.otp || "").trim();

    if (normalizedOtp.length !== 6) {
      return;
    }

    setIsSubmitting(true);
    clearMessages();

    try {
      await authApi.verifyEmailOtp({
        email: normalizedEmail,
        otp: normalizedOtp,
        mode: "login",
      });

      sessionStorage.setItem("auth_redirect", redirectTo);
      await useAuthStore.getState().login();
      router.push(redirectTo);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Verification failed. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleBack = () => {
    setStep("email");
    clearMessages();
  };

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Box>
    );
  }

  return (
    <VStack className="h-screen overflow-hidden gap-0">
      <Header />

      <VStack className="flex-1 items-center justify-center p-8">
        <div className="relative w-full max-w-md overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {step === "email" ? (
              <motion.div
                key="login-email-card"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Card className="w-full">
                  <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold">
                      Sign in
                    </CardTitle>
                    <CardDescription className="text-base">
                      Sign in your existing account to continue your researches.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <EmailStepForm
                      emailForm={emailForm}
                      isSubmitting={isSubmitting}
                      errorMessage={errorMessage}
                      onSubmit={handleRequestOtp}
                      onClearMessages={clearMessages}
                    />

                    {infoMessage && (
                      <TypographyP
                        size="sm"
                        align="center"
                        className="text-primary"
                      >
                        {infoMessage}
                      </TypographyP>
                    )}

                    <OAuthContinueSection
                      redirectTo={redirectTo}
                      isSubmitting={isSubmitting}
                    />

                    <TypographyP variant="muted" size="sm" align="center">
                      Don&apos;t have an account?{" "}
                      <Link href="/signup" className="underline">
                        Sign up
                      </Link>
                    </TypographyP>

                    <TypographyP
                      variant="muted"
                      size="xs"
                      align="center"
                      className="pt-2"
                    >
                      By continuing, you agree to our{" "}
                      <span className="underline cursor-pointer">
                        Terms of Service
                      </span>{" "}
                      and{" "}
                      <span className="underline cursor-pointer">
                        Privacy Policy
                      </span>
                    </TypographyP>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="login-otp-card"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <OtpStepForm
                  otpForm={otpForm}
                  isSubmitting={isSubmitting}
                  errorMessage={errorMessage}
                  onSubmit={handleVerifyOtp}
                  onBack={handleBack}
                  onResend={handleResendOtp}
                  onClearMessages={clearMessages}
                  infoMessage={infoMessage}
                  submitLabel="Verify and Continue"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </VStack>
    </VStack>
  );
}
