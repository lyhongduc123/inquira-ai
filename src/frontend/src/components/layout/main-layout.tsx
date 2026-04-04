"use client";

import { VStack } from "@/components/layout/vstack";
import { LeftSidebar } from "@/app/_components/LeftSidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarManager,
  SidebarManagerProvider,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  useAuth();

  return (
    <SidebarManagerProvider>
      <SidebarProvider defaultOpen={true}>
        <SidebarManager name="left">
          <LeftSidebar />
        </SidebarManager>

        <SidebarInset>
          <VStack className="h-screen overflow-hidden gap-0">{children}</VStack>
        </SidebarInset>
      </SidebarProvider>
    </SidebarManagerProvider>
  );
}
