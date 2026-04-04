import { Suspense } from "react"
import { Loader2 } from "lucide-react"

import { Box } from "@/components/layout/box"
import { SignupPageClient } from "./_components/SignupPageClient"

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <Box className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Box>
      }
    >
      <SignupPageClient />
    </Suspense>
  )
}
