"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"

import { HStack } from "@/components/layout/hstack"
import { VStack } from "@/components/layout/vstack"
import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/api/auth-api"
import { useAuthStore } from "@/store/auth-store"

interface OAuthContinueSectionProps {
  redirectTo: string
  isSubmitting?: boolean
}

export function OAuthContinueSection({
  redirectTo,
  isSubmitting,
}: OAuthContinueSectionProps) {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const handleOAuthLogin = (provider: "google" | "github") => {
    sessionStorage.setItem("auth_redirect", redirectTo)

    const url = authApi.getOAuthUrl(provider)
    const width = 520
    const height = 700
    const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2)
    const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2)
    const features = `width=${width},height=${height},left=${left},top=${top},popup=yes`

    const popup = window.open(url, "oauth-signin", features)
    if (!popup) {
      window.location.href = url
    }
  }

  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      const data = event.data as { type?: string; error?: string } | null
      if (!data?.type) return

      if (data.type === "oauth:success") {
        try {
          await login()
          const next = sessionStorage.getItem("auth_redirect") || redirectTo || "/"
          sessionStorage.removeItem("auth_redirect")
          router.push(next)
        } catch (error) {
          console.error("Popup OAuth login sync failed:", error)
          router.push("/login?error=login_failed")
        }
      }

      if (data.type === "oauth:error") {
        router.push(`/login?error=${encodeURIComponent(data.error || "oauth_failed")}`)
      }
    }

    window.addEventListener("message", handleOAuthMessage)
    return () => {
      window.removeEventListener("message", handleOAuthMessage)
    }
  }, [login, redirectTo, router])

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
          type="button"
          variant="outline"
          className="w-full h-11"
          onClick={() => handleOAuthLogin("google")}
          disabled={isSubmitting}
        >
          <Icon icon="logos:google-icon" className="h-5 w-5 mr-2" />
          Continue with Google
        </Button>

        <Button
          type="button"
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
