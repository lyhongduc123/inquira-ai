import { SidebarProvider } from "@/components/ui/sidebar";
import { PaperPageClient } from "../_components/PaperPageClient";

export default function PaperPage() {
  return (
    <SidebarProvider>
      <PaperPageClient />
    </SidebarProvider>
  );
}

