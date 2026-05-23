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
>(function CitationTrigger({ number, onClick, isSelected, paperDetail }, ref) {
  const handleOnClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  };
  const authorName =
    paperDetail?.authors && paperDetail.authors.length > 0
      ? paperDetail.authors[0].name
      : "";
  const triggerLabel = formatLabel({
    author: authorName,
    title: paperDetail?.title,
    year: paperDetail?.year || "",
  });

  return (
    <Button
      asChild
      ref={ref}
      variant={number ? "secondary" : "destructive"}
      className={cn(
        "px-1 py-0 mx-0.5 align-baseline text-sm w-fit min-w-5 h-6 transition-all duration-200",
        isSelected &&
          "shadow-md ring-2 ring-primary ring-offset-1 scale-95 bg-primary text-primary-foreground hover:bg-primary/90",
      )}
    >
      <span className="select-none" onClick={handleOnClick}>{number ? `${number}` : triggerLabel}</span>
    </Button>
  );
});

function formatLabel(data: {
  author?: string;
  title?: string;
  year?: number | string;
}): string {
  const year = data.year ?? "";

  if (data.author) {
    return `${getLastNameSafe(data.author)} ${year}`.trim();
  }

  if (data.title) {
    const shortTitle = data.title.split(":")[0].slice(0, 30);
    return `${shortTitle} ${year}`.trim();
  }

  return `Unknown ${year}`.trim();
}

export function getLastNameSafe(author: string): string {
  if (!author) return "";

  const cleaned = author.trim();
  if (cleaned.includes(",")) {
    return cleaned.split(",")[0].trim();
  }
  return cleaned.split(/\s+/).pop() || "";
}
