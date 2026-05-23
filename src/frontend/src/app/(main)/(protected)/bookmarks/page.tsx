import { VStack } from "@/components/layout/vstack";
import { BookmarkPageClient } from "./_components/BookmarkPageClient";

export default function BookmarkPage() {
  return (
    <VStack className="h-full w-full items-center">
      <BookmarkPageClient />
    </VStack>
  );
}
