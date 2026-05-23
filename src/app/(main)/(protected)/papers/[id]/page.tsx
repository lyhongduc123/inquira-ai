import { SidebarProvider } from "@/components/ui/sidebar";
import { PaperPageClient } from "../_components/PaperPageClient";
import { papersApi } from "@/lib/api/papers-api";
import notFound from "./not-found";
import { isApiError } from "@/lib/react-query/error-utils";

export default function PaperPage() {
  return (
    <SidebarProvider>
      <PaperPageClient />
    </SidebarProvider>
  );
}
