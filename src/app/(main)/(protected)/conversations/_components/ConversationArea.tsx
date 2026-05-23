"use client";

import { ConversationDTO } from "@/types/conversation.type";
import { useRouter } from "next/navigation";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  MessageSquareDashedIcon,
  SearchXIcon,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { TypographyP } from "@/components/global/typography";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import pluralize from "pluralize";
import { InfoItem } from "@/app/(main)/_components/_shared/InfoItem";
import { C_BULLET } from "@/core";
import { Card } from "@/components/ui/card";
import { formatCustomDate } from "@/lib/utils/date";
import * as changeCase from "change-case";

interface ConversationAreaProps {
  data?: ConversationDTO[];
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  query?: string;
  refetch?: () => void;
}

function ConversationRow({ conversation }: { conversation: ConversationDTO }) {
  const router = useRouter();

  const userQueryCount =
    conversation.messageCount % 2 === 0
      ? conversation.messageCount / 2
      : Math.ceil(conversation.messageCount / 2);

  const lastUpdated = conversation.lastUpdated
    ? changeCase.sentenceCase(formatCustomDate(conversation.lastUpdated))
    : "Unknown";
  return (
    <Card
      onClick={() => router.push(`/conversation/${conversation.id}`)}
      className="rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/40 hover:border-primary hover:cursor-pointer"
    >
      <HStack className="w-full items-start justify-between gap-3 min-w-0">
        <VStack className="gap-1 min-w-0 overflow-hidden">
          <TypographyP className="w-full text-ellipsis line-clamp-2">
            {conversation.title || "New Conversation"}
          </TypographyP>
          <HStack className="items-center gap-2 text-xs">
            <InfoItem
              number={userQueryCount}
              label={"messages"}
            />
            {C_BULLET}
            <InfoItem number={lastUpdated} />
          </HStack>
        </VStack>
        <Badge variant={conversation.isArchived ? "secondary" : "default"}>
          {conversation.isArchived ? "Archived" : "Active"}
        </Badge>
      </HStack>
    </Card>
  );
}

function ConversationRowSkeleton() {
  return (
    <VStack className="w-full rounded-xl border bg-card p-4">
      <HStack className="justify-between">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-16" />
      </HStack>
      <HStack className="items-center gap-2 pt-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32" />
      </HStack>
    </VStack>
  );
}

export function ConversationArea({
  data,
  isLoading,
  isError,
  isEmpty,
  query,
  refetch,
}: ConversationAreaProps) {
  const router = useRouter();

  if (isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <TriangleAlert className="size-16 text-destructive" />
          </EmptyMedia>
          <EmptyTitle className="text-center">
            Unable to load conversations
          </EmptyTitle>
        </EmptyHeader>
        <EmptyContent className="max-w-lg">
          <EmptyDescription className="text-center">
            Please try again. If the issue persists, return to the chat page.
          </EmptyDescription>
          <EmptyMedia className="gap-2">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="mx-auto mt-4"
            >
              Back to chat
            </Button>
            <Button
              onClick={() => refetch?.()}
              variant="default"
              className="mx-auto mt-4"
            >
              Refresh
            </Button>
          </EmptyMedia>
        </EmptyContent>
      </Empty>
    );
  }

  if (isLoading) {
    return (
      <VStack className="w-full gap-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <ConversationRowSkeleton key={idx} />
        ))}
      </VStack>
    );
  }

  if (isEmpty) {
    const hasQuery = Boolean(query?.trim());

    return (
      <Empty>
        <EmptyContent>
          <EmptyHeader>
            <EmptyMedia>
              {hasQuery ? (
                <SearchXIcon className="size-16 text-muted-foreground" />
              ) : (
                <MessageSquareDashedIcon className="size-16 text-muted-foreground" />
              )}
            </EmptyMedia>
            <EmptyTitle className="text-center">
              {hasQuery ? "No results" : "No conversations yet"}
            </EmptyTitle>
          </EmptyHeader>
          <EmptyDescription className="text-center">
            {hasQuery
              ? "There are nothing matching your search."
              : "Start a new chat and your conversations will appear here."}
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ScrollArea className="flex-1 min-h-0 pr-4">
        <VStack className="gap-3 min-w-0">
          {data?.map((conversation, index) => (
            // <VStack key={index} className="w-full gap-3">
            <ConversationRow key={index} conversation={conversation} />
            // </VStack>
          ))}
        </VStack>
    </ScrollArea>
  );
}
