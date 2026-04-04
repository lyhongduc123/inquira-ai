import { Loader2 } from "lucide-react"
import { UseFormReturn } from "react-hook-form"

import { VStack } from "@/components/layout/vstack"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"

interface EmailStepFormProps {
  emailForm: UseFormReturn<{ email: string }>
  isSubmitting: boolean
  errorMessage: string | null
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  onClearMessages: () => void
}

export function EmailStepForm({
  emailForm,
  isSubmitting,
  errorMessage,
  onSubmit,
  onClearMessages,
}: EmailStepFormProps) {
  const emailValue = emailForm.watch("email")

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <VStack className="gap-2">
        <Field
          data-invalid={
            emailForm.formState.errors.email || errorMessage ? "true" : "false"
          }
        >
          <FieldLabel htmlFor="email" className="text-sm font-medium">
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={isSubmitting}
            className="w-full"
            {...emailForm.register("email", {
              onChange: () => {
                onClearMessages()
              },
            })}
          />
          <FieldError className="text-destructive">
            {emailForm.formState.errors.email?.message || errorMessage}
          </FieldError>
        </Field>
      </VStack>

      <Button
        type="submit"
        variant="outline"
        className="w-full h-11"
        disabled={!emailValue || !emailForm.formState.isValid || isSubmitting}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Continue
      </Button>
    </form>
  )
}
