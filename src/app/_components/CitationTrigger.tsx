import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaperMetadata } from "@/types/paper.type";
import { forwardRef } from "react";

interface CitationTriggerProps {
  isSelected?: boolean;
  paperDetail?: PaperMetadata;
  number?: number;
  onClick?: () => void;
}

export const CitationTrigger = forwardRef<
  HTMLButtonElement,
  CitationTriggerProps
>(function CitationTrigger(
  { number, onClick, isSelected},
  ref,
) {
  const handleOnClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  };

  return (
    <Button
      ref={ref}
      variant={number ? "secondary" : "destructive"}
      className={cn(
        "px-1 py-0 mx-0.5 align-baseline text-sm w-fit min-w-5 h-6 transition-all duration-200",
        isSelected &&
          "shadow-md ring-2 ring-primary ring-offset-1 scale-95 bg-primary text-primary-foreground hover:bg-primary/90",
      )}
      onClick={handleOnClick}
    >
      {number || "!"}
    </Button>
  );
});
