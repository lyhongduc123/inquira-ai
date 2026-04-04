"use client";

import { useState } from "react";
import type { PaperMetadata } from "@/types/paper.type";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowDownNarrowWide } from "lucide-react";
import { PaperCard } from "./PaperCard";
import { Box } from "@/components/layout/box";
import { useDetailSidebar } from "@/hooks/use-detail-sidebar";

interface ResultCollapsibleProps {
  sources: PaperMetadata[];
}

export function ResultCollapsible({ sources }: ResultCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Array<string>>([]);
  const { openPaper } = useDetailSidebar();

  const toggleSelect = (paperId: string) => {
    setSelected((prevSelected) => {
      if (prevSelected.includes(paperId)) {
        return prevSelected.filter((id) => id !== paperId);
      }
      return [...prevSelected, paperId];
    });
  };

  const onView = (paper: PaperMetadata) => {
    openPaper(paper);
  };

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible w-full min-w-0 mt-4"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="default"
          className="group h-auto w-fit cursor-pointer justify-between"
        >
          Results ({sources.length})
          <ArrowDown
            size={14}
            className="ml-2 transition-transform group-data-[state=open]:rotate-180"
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down duration-300">
        <Box className="mt-2 space-y-2 min-w-0">
          {sources.map((source, j) => (
            <PaperCard
              key={source.paperId || j}
              idx={j}
              paperMetadata={source}
              isSelected={selected.includes(source.paperId)}
              onSelect={toggleSelect}
              onView={onView}
            />
          ))}
        </Box>
      </CollapsibleContent>
    </Collapsible>
  );
}
