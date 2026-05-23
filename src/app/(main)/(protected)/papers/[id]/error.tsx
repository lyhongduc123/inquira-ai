"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
export default function PaperError({
  error,
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Error loading paper.</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          {error instanceof Error
            ? error.message
            : "Some error occurred while fetching the paper details."}
        </EmptyDescription>
        <Button
          onClick={() => {
            reset();
          }}
        >
          Retry
        </Button>
      </EmptyContent>
    </Empty>
  );
}
