import { VStack } from "@/components/layout/vstack";
import { ConversationsPageClient } from "./_components/ConversationsPageClient";

export default function ConversationsPage() {
  return (
    <VStack className="h-full w-full items-center">
      <ConversationsPageClient />
    </VStack>
  );
}
