"use client";

import { memo, useMemo, useState } from "react";
import { Message } from "@/types/message.type";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, CircleDot, CircleXIcon, TargetIcon } from "lucide-react";
import { VStack } from "@/components/layout/vstack";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useConversationStore } from "@/store/conversation-store";
import { messagesApi } from "@/lib/api/messages-api";
import { toast } from "sonner";

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
  const setMessages = useConversationStore((state) => state.setMessages);
  const activeQueryIndexFromStore = useQueryNavigatorStore(
    (state) => state.activeQueryIndex,
  );

  const [deletingQueryIndex, setDeletingQueryIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

  const getDeletionIndexes = (
    allMessages: Message[],
    userMessageIndex: number,
  ): Set<number> => {
    const indexesToDelete = new Set<number>([userMessageIndex]);

    for (let i = userMessageIndex + 1; i < allMessages.length; i += 1) {
      const currentMessage = allMessages[i];

      if (currentMessage.role === "user") {
        break;
      }

      if (currentMessage.role === "assistant") {
        indexesToDelete.add(i);
        break;
      }
    }

    return indexesToDelete;
  };

  const requestDeleteQuery = (queryOriginalIndex: number) => {
    if (deletingQueryIndex !== null) {
      return;
    }

    const targetMessage = messages[queryOriginalIndex];

    if (!targetMessage || targetMessage.role !== "user") {
      return;
    }

    setPendingDeleteIndex(queryOriginalIndex);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteQuery = async () => {
    if (pendingDeleteIndex === null || deletingQueryIndex !== null) {
      return;
    }

    const queryOriginalIndex = pendingDeleteIndex;
    const targetMessage = messages[queryOriginalIndex];

    if (!targetMessage || targetMessage.role !== "user") {
      setDeleteDialogOpen(false);
      setPendingDeleteIndex(null);
      return;
    }
    const previousMessages = messages;
    const indexesToDelete = getDeletionIndexes(
      previousMessages,
      queryOriginalIndex,
    );
    const nextMessages = previousMessages.filter(
      (_message, index) => !indexesToDelete.has(index),
    );

    setDeletingQueryIndex(queryOriginalIndex);
    setMessages(nextMessages);

    try {
      if (typeof targetMessage.id === "number") {
        await messagesApi.delete(targetMessage.id, {
          softDelete: true,
          deleteAssistantReplyForUser: true,
        });
      }
      toast.success("Query deleted successfully");
      const nextUserQueryIndex = nextMessages.findIndex(
        (message, index) =>
          index >= queryOriginalIndex && message.role === "user",
      );

      if (nextUserQueryIndex >= 0) {
        onQueryClick(nextUserQueryIndex);
      } else {
        const remainingUserIndexes = nextMessages
          .map((message, index) => (message.role === "user" ? index : -1))
          .filter((index) => index >= 0);
        const previousUserIndex =
          remainingUserIndexes[remainingUserIndexes.length - 1];
        if (typeof previousUserIndex === "number") {
          onQueryClick(previousUserIndex);
        }
      }

      setDeleteDialogOpen(false);
      setPendingDeleteIndex(null);
    } catch (error) {
      setMessages(previousMessages);
      toast.error("Failed to delete query", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setDeletingQueryIndex(null);
    }
  };

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
    (q) => q.originalIndex === currentActiveQueryIndex,
  );

  const displayQuery = activeQuery || userQueries[0];

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8">
            {displayQuery?.text}
            <ChevronDownIcon className="size-4" />
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
                        disabled={deletingQueryIndex !== null}
                        onClick={() => requestDeleteQuery(query.originalIndex)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this query?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the selected query and its assistant reply from
              the conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingQueryIndex !== null}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={deletingQueryIndex !== null}
              variant={"destructive"}
              onClick={(event) => {
                event.preventDefault();
                void confirmDeleteQuery();
              }}
            >
              {deletingQueryIndex !== null ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const QueryNavigator = memo(QueryNavigatorComponent);
QueryNavigator.displayName = "QueryNavigator";