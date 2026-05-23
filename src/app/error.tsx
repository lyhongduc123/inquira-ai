"use client";

import { AlertTriangle } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default function ErrorPage({ error }: { error: unknown }) {
  const message =
    error instanceof Error ? error.message : "Internal Server Error";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Empty className="text-center">
        <EmptyHeader className="flex flex-col items-center justify-center gap-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />

          <EmptyTitle className="text-5xl font-bold tracking-tight">
            500
          </EmptyTitle>
        </EmptyHeader>

        <EmptyContent className="mt-4 space-y-2">
          <EmptyDescription className="text-base">
            Server is currently unavailable
          </EmptyDescription>

          <EmptyDescription className="text-sm text-muted-foreground">
            {message}
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </div>
  );
}