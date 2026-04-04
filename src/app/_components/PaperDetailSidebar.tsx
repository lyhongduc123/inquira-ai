"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarManager,
  SidebarRail,
} from "@/components/ui/sidebar";
import { PaperDetailContent, PaperDetailFooter } from "./PaperDetailContent";
import type { PaperMetadata } from "@/types/paper.type";
import { HStack } from "@/components/layout/hstack";
import { useDetailSidebar } from "@/hooks/use-detail-sidebar";
import { Box } from "@/components/layout/box";
import { TypographyH3 } from "@/components/global/typography";

export function PaperDetailSidebar() {
  const { contentType, content, closeSidebar } = useDetailSidebar();

  const paper = (
    contentType === "paper" ? content : null
  ) as PaperMetadata | null;

  return (
    <Sidebar
      side="right"
      collapsible="offcanvas"
      style={{ "--sidebar-width": "36rem" } as React.CSSProperties}
    >
      <SidebarHeader className="border-b px-4 py-2.5 bg-background">
        <HStack className="justify-between items-center">
          <TypographyH3 className="capitalize">{contentType}</TypographyH3>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </HStack>
      </SidebarHeader>
      <SidebarContent className="p-4 bg-background overflow-hidden!">
        {paper ? <PaperDetailContent paper={paper} /> : null}
      </SidebarContent>
      <SidebarFooter className="border-t p-4 bg-background">
        <PaperDetailFooter paperMetadata={paper as PaperMetadata} />
      </SidebarFooter>
    </Sidebar>
  );
}
