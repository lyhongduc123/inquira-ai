import { Loader2 } from "lucide-react"
import { UseFormReturn } from "react-hook-form"

import { HStack } from "@/components/layout/hstack"
import { VStack } from "@/components/layout/vstack"
import { TypographyP } from "@/components/global/typography"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"

interface SignupNameStepFormProps {
  nameForm: UseFormReturn<{ firstName: string; lastName: string }>
  isSubmitting: boolean
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  onBack: () => void
  onClearMessages: () => void
}

export function SignupNameStepForm({
  nameForm,
  isSubmitting,
  onSubmit,
  onBack,
  onClearMessages,
}: SignupNameStepFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <VStack className="gap-3">
        <TypographyP size="sm" className="font-medium text-foreground">
          What should we call you?
        </TypographyP>

        <HStack className="gap-2">
          <Field data-invalid={nameForm.formState.errors.firstName ? "true" : "false"} className="flex-1">
            <FieldLabel htmlFor="firstName" className="text-sm font-medium">
              First name
            </FieldLabel>
            <Input
              id="firstName"
              type="text"
              placeholder="Jane"
              disabled={isSubmitting}
              className="w-full"
              {...nameForm.register("firstName", {
                onChange: () => {
                  onClearMessages()
                },
              })}
            />
            <FieldError className="text-destructive">
              {nameForm.formState.errors.firstName?.message}
            </FieldError>
          </Field>

          <Field data-invalid={nameForm.formState.errors.lastName ? "true" : "false"} className="flex-1">
            <FieldLabel htmlFor="lastName" className="text-sm font-medium">
              Last name
            </FieldLabel>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              disabled={isSubmitting}
              className="w-full"
              {...nameForm.register("lastName", {
                onChange: () => {
                  onClearMessages()
                },
              })}
            />
            <FieldError className="text-destructive">
              {nameForm.formState.errors.lastName?.message}
            </FieldError>
          </Field>
        </HStack>
      </VStack>

      <Button
        type="submit"
        variant="outline"
        className="w-full h-11"
        disabled={!nameForm.formState.isValid || isSubmitting}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Complete Sign Up
      </Button>

      <HStack className="justify-start">
        <Button type="button" variant="ghost" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
      </HStack>
    </form>
  )
}
