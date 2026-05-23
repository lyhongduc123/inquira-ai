"use client";

import { useState } from "react";
import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { TypographyP } from "@/components/global/typography";
import { Badge } from "@/components/ui/badge";
import { useConversations } from "@/hooks/use-conversations";
import { ConversationSearchBar } from "./ConversationSearchBar";
import { ConversationArea } from "./ConversationArea";
import { Box } from "@/components/layout/box";

export function ConversationsPageClient() {
  const [searchQuery, setSearchQuery] = useState("");

  const { conversations, total, isLoading, isError, refetch } = useConversations({
    page: 1,
    pageSize: 50,
    archived: false,
    query: searchQuery,
    searchMessages: true,
  });

  return (
    <VStack className="w-full max-w-5xl gap-4 p-8 min-h-0">
      <ConversationSearchBar onSearch={setSearchQuery} />

      <HStack className="items-center gap-2 px-1">
        <Badge variant="default">Results: {total}</Badge>
        {searchQuery.trim() && (
          <TypographyP size="xs" variant="muted" className="truncate">
            Finding: {searchQuery.trim()}
          </TypographyP>
        )}
      </HStack>

      <ConversationArea
        data={conversations}
        isLoading={isLoading}
        isError={isError}
        isEmpty={!conversations.length}
        query={searchQuery}
        refetch={refetch}
      />
    </VStack>
  );
}
