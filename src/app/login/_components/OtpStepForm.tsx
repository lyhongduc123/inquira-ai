import { ArrowLeftIcon, Loader2, RefreshCwIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OtpStepFormProps {
  otpForm: UseFormReturn<{ otp: string }>;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onBack: () => void;
  onResend: () => void;
  onClearMessages: () => void;
  submitLabel?: string;
  infoMessage?: string | null;
}

export function OtpStepForm({
  otpForm,
  isSubmitting,
  errorMessage,
  onSubmit,
  onBack,
  onResend,
  onClearMessages,
  submitLabel = "Verify and Continue",
  infoMessage,
}: OtpStepFormProps) {
  const otpValue = otpForm.watch("otp");
  const isOtpComplete = (otpValue || "").length === 6;

  return (
    <Card>
      <CardHeader>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isSubmitting}
          className="has-[>svg]:px-0 p-0 w-fit"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Button>
        <CardTitle>Verify your login</CardTitle>
        <CardDescription>
          Enter the verification code we sent to your email address:{" "}
          <span className="font-medium">{infoMessage}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="otp-step-form" onSubmit={onSubmit}>
          <VStack className="gap-2">
            <Field data-invalid={errorMessage ? "true" : "false"}>
              <HStack className="justify-between">
                <FieldLabel htmlFor="otp" className="text-sm font-medium">
                  Verification code
                </FieldLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={onResend}
                  disabled={isSubmitting}
                >
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Resend code
                </Button>
              </HStack>
              <InputOTP
                id="otp"
                maxLength={6}
                pattern="[0-9]*"
                value={otpValue || ""}
                onChange={(value) => {
                  onClearMessages();
                  otpForm.setValue(
                    "otp",
                    value.replace(/\D/g, "").slice(0, 6),
                    {
                      shouldDirty: true,
                    },
                  );
                }}
                disabled={isSubmitting}
                containerClassName="justify-center"
              >
                <InputOTPGroup className="w-full">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <FieldError className="text-destructive">
                {errorMessage}
              </FieldError>
            </Field>
          </VStack>
        </form>
      </CardContent>
      <CardFooter className="w-full justify-center">
        <Button
          type="submit"
          form="otp-step-form"
          variant="outline"
          className="w-full"
          disabled={!isOtpComplete || isSubmitting}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {submitLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
