"use client";

import {
  Empty,
  EmptyHeader,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthorError({
  error,
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <AlertTriangle className="size-12 text-destructive" />
        </EmptyMedia>
        <EmptyTitle>Failed to load the author page</EmptyTitle>
        <EmptyDescription>
          Something went wrong when loading the page. Error: {String(error)}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={() => reset()}>
          Retry
        </Button>
      </EmptyContent>
    </Empty>
  );
}
