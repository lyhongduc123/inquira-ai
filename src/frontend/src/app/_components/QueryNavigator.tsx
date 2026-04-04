"use client";

import { memo, useMemo } from "react";
import { Message } from "@/types/message.type";
import { Button } from "@/components/ui/button";
import {
  CircleDot,
  CircleXIcon,
  TargetIcon,
} from "lucide-react";
import { VStack } from "@/components/layout/vstack";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQueryNavigatorStore } from "@/store/query-navigator-store";
import { useConversation } from "@/hooks/use-conversation";
import { useConversationStore } from "@/store/conversation-store";

interface QueryNavigatorProps {
  messages: Message[];
  onQueryClick: (index: number) => void;
  activeQueryIndex?: number;
}

function QueryNavigatorComponent({
  messages,
  onQueryClick,
  activeQueryIndex,
}: QueryNavigatorProps) {
  const { currentConversationTitle } = useConversationStore();
  const activeQueryIndexFromStore = useQueryNavigatorStore(
    (state) => state.activeQueryIndex,
  );
  const currentActiveQueryIndex =
    activeQueryIndex ?? activeQueryIndexFromStore ?? undefined;

  const userQueries = useMemo(
    () =>
      messages
        .map((msg, idx) => ({ ...msg, originalIndex: idx }))
        .filter((msg) => msg.role === "user"),
    [messages],
  );

  if (userQueries.length === 0) {
    return null;
  }

  const activeQuery = userQueries.find(
    (q) => q.originalIndex === currentActiveQueryIndex
  );

  const displayQuery = activeQuery || userQueries[0];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8">
          <CircleDot className="h-2 w-2" />
          {displayQuery?.text}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] h-[70vh] flex flex-col">
        <DialogTitle></DialogTitle>
        <VStack className="flex-1 min-h-0 w-full gap-1 overflow-auto pr-2">
          {userQueries.map((query) => (
            <Item
              key={query.originalIndex}
              variant={
                currentActiveQueryIndex === query.originalIndex
                  ? "primary"
                  : "outline"
              }
              className=""
            >
              <ItemMedia>
                <CircleDot className="h-4 w-4 shrink-0" />
              </ItemMedia>
              <ItemContent className="min-w-0">
                <ItemTitle className="block w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  {query.text}
                </ItemTitle>
                <ItemDescription>
                  Sources: {query.paperSnapshots?.length || 0}
                </ItemDescription>
              </ItemContent>
              <ItemActions className="gap-1">
                <Tooltip delayDuration={500}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="icon"
                      size="icon"
                      onClick={() => onQueryClick(query.originalIndex)}
                    >
                      <TargetIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Go to this query</TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={500}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="icon"
                      size="icon"
                      onClick={() => onQueryClick(query.originalIndex)}
                      className="text-destructive"
                    >
                      <CircleXIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete this query</TooltipContent>
                </Tooltip>
              </ItemActions>
            </Item>
          ))}
        </VStack>
      </DialogContent>
    </Dialog>
  );
}

export const QueryNavigator = memo(QueryNavigatorComponent);
QueryNavigator.displayName = "QueryNavigator";
