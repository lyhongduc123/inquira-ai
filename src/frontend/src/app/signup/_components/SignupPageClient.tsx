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
import { ApiError } from "@/types/api.type";

import { EmailStepForm } from "@/app/login/_components/EmailStepForm";
import { OtpStepForm } from "@/app/login/_components/OtpStepForm";
import { SignupNameStepForm } from "@/app/login/_components/SignupNameStepForm";
import { OAuthContinueSection } from "@/app/login/_components/OAuthContinueSection";

type SignupStep = "email" | "otp" | "profile";

const emailFormSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

const signupNameSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;
type OtpFormValues = { otp: string };
type SignupNameFormValues = z.infer<typeof signupNameSchema>;

export function SignupPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState<SignupStep>("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirect") || "/";

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    mode: "onSubmit",
    defaultValues: { email: "" },
  });

  const otpForm = useForm<OtpFormValues>({
    mode: "onSubmit",
    defaultValues: { otp: "" },
  });

  const signupNameForm = useForm<SignupNameFormValues>({
    resolver: zodResolver(signupNameSchema),
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

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
        mode: "signup",
      });

      setStep("otp");
      setInfoMessage(
        response.message || "Verification code sent to your email.",
      );
    } catch (error) {
      if (error instanceof ApiError && /already exists/i.test(error.message)) {
        setErrorMessage(
          "This email is already registered. Please log in instead.",
        );
        return;
      }

      const message =
        error instanceof ApiError
          ? error.message
          : "Could not send verification code. Please try again.";
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
        mode: "signup",
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
    const normalizedOtp = (values.otp || "").trim();
    if (normalizedOtp.length !== 6) {
      return;
    }

    const normalizedEmail = emailForm.getValues("email").trim().toLowerCase();

    setIsSubmitting(true);
    clearMessages();

    try {
      const response = await authApi.preVerifyEmailOtp({
        email: normalizedEmail,
        otp: normalizedOtp,
        mode: "signup",
      });

      setInfoMessage(response.message || "Verification code is valid.");
      setStep("profile");
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

  const handleCompleteSignup = signupNameForm.handleSubmit(async (values) => {
    const normalizedEmail = emailForm.getValues("email").trim().toLowerCase();
    const otp = (otpForm.getValues("otp") || "").trim();
    const fullName = `${values.firstName} ${values.lastName}`.trim();

    if (otp.length !== 6) {
      return;
    }

    setIsSubmitting(true);
    clearMessages();

    try {
      await authApi.verifyEmailOtp({
        email: normalizedEmail,
        otp,
        mode: "signup",
        name: fullName,
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
    if (step === "profile") {
      setStep("otp");
      clearMessages();
      return;
    }

    if (step === "otp") {
      setStep("email");
      clearMessages();
    }
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
                key="signup-email-card"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Card className="w-full">
                  <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold">
                      Sign up
                    </CardTitle>
                    <CardDescription className="text-base">
                      Create an account to continue.
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
                      Already have an account?{" "}
                      <Link href="/login" className="underline">
                        Log in
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
            ) : step === "otp" ? (
              <motion.div
                key="signup-otp-card"
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
                  submitLabel="Continue"
                />
              </motion.div>
            ) : (
              <motion.div
                key="signup-profile-card"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Card className="w-full">
                  <CardContent className="space-y-4 pt-6">
                    <SignupNameStepForm
                      nameForm={signupNameForm}
                      isSubmitting={isSubmitting}
                      onSubmit={handleCompleteSignup}
                      onBack={handleBack}
                      onClearMessages={clearMessages}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </VStack>
    </VStack>
  );
}
