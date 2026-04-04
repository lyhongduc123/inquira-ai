import { Icon } from "@iconify/react"

import { HStack } from "@/components/layout/hstack"
import { VStack } from "@/components/layout/vstack"
import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/api/auth-api"

interface OAuthContinueSectionProps {
  redirectTo: string
  isSubmitting?: boolean
}

export function OAuthContinueSection({
  redirectTo,
  isSubmitting,
}: OAuthContinueSectionProps) {
  const handleOAuthLogin = (provider: "google" | "github") => {
    sessionStorage.setItem("auth_redirect", redirectTo)
    window.location.href = authApi.getOAuthUrl(provider)
  }

  return (
    <>
      <div className="relative">
        <HStack className="absolute inset-0 items-center">
          <span className="w-full border-t" />
        </HStack>
        <HStack className="relative justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </HStack>
      </div>

      <VStack className="gap-2">
        <Button
          variant="outline"
          className="w-full h-11"
          onClick={() => handleOAuthLogin("google")}
          disabled={isSubmitting}
        >
          <Icon icon="logos:google-icon" className="h-5 w-5 mr-2" />
          Continue with Google
        </Button>

        <Button
          variant="outline"
          className="w-full h-11"
          onClick={() => handleOAuthLogin("github")}
          disabled={isSubmitting}
        >
          <Icon icon="octicon:mark-github-16" className="h-5 w-5 mr-2" />
          Continue with GitHub
        </Button>
      </VStack>
    </>
  )
}
