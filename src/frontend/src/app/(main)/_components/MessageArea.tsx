"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Message } from "@/types/message.type";
import { VStack } from "@/components/layout/vstack";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Brand } from "@/components/global/brand";
import { MessageSection } from "./MessageSection";
import { ProgressEventSheet } from "./ProgressEventSheet";
import { Box } from "@/components/layout/box";
import { ProgressStep, useProgressStore } from "@/store/progress-store";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export interface MessageAreaRef {
  scrollToMessage: (index: number) => void;
  scrollToLatestQuery: () => void;
  activeQueryIndex: number | null;
}

interface MessageAreaProps {
  conversationKey?: string;
  messages: Message[];
  isStreaming: boolean;
  isReading?: boolean;
  onActiveQueryIndexChange?: (index: number | null) => void;
}

export const MessageArea = forwardRef<MessageAreaRef, MessageAreaProps>(
  function MessageArea(
    {
      conversationKey,
      messages,
      isStreaming,
      isReading,
      onActiveQueryIndexChange,
    },
    ref,
  ) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);
    const messageRefs = useRef<(HTMLElement | null)[]>([]);
    const contentRef = useRef<HTMLDivElement>(null);
    const waitingSpacerRef = useRef<HTMLDivElement>(null);
    const activeQueryIndexRef = useRef<number | null>(null);
    const latestUserMessageKeyRef = useRef<string | null>(null);
    const [waitingSpacerHeight, setWaitingSpacerHeight] = useState(0);
    const activeQueryId = useProgressStore((state) => state.activeQueryId);

    const getViewport = useCallback(() => {
      return scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement | null;
    }, []);

    const getMessageKey = useCallback((message: Message, index: number) => {
      const metadataKey =
        typeof message.metadata?.client_message_id === "string"
          ? message.metadata.client_message_id
          : typeof message.metadata?.query_id === "string"
            ? message.metadata.query_id
            : null;

      return `${message.id ?? metadataKey ?? index}-${message.role}`;
    }, []);

    const getLatestUserMessageIndex = useCallback(() => {
      for (let i = messages.length - 1; i >= 0; i -= 1) {
        if (messages[i]?.role === "user") return i;
      }
      return -1;
    }, [messages]);

    const scrollToMessageIndex = useCallback(
      (index: number, behavior: ScrollBehavior = "smooth") => {
        requestAnimationFrame(() => {
          const messageElement = messageRefs.current[index];
          const viewport = getViewport();

          if (!messageElement || !viewport) return;

          viewport.scrollTo({
            top: messageElement.offsetTop,
            behavior,
          });
        });
      },
      [getViewport],
    );

    // Expose scrollToMessage function and activeQueryIndex to parent
    useImperativeHandle(ref, () => ({
      scrollToMessage: (index: number) => {
        scrollToMessageIndex(index);
      },
      scrollToLatestQuery: () => {
        const lastUserMessageIndex = getLatestUserMessageIndex();
        if (lastUserMessageIndex >= 0) scrollToMessageIndex(lastUserMessageIndex);
      },
      activeQueryIndex: activeQueryIndexRef.current,
    }));

    useEffect(() => {
      const viewport = getViewport();

      if (!viewport) return;

      const onScroll = () => {
        const distance =
          viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;

        const nextIsAtBottom = distance < 100;
        isAtBottomRef.current = nextIsAtBottom;

        const currentTop = viewport.scrollTop + 100;
        let currentActiveIndex: number | null = null;

        for (let i = 0; i < messageRefs.current.length; i += 1) {
          if (messages[i]?.role !== "user") continue;
          const messageElement = messageRefs.current[i];
          if (!messageElement) continue;

          if (messageElement.offsetTop <= currentTop) {
            currentActiveIndex = i;
          } else {
            break;
          }
        }

        if (currentActiveIndex === null) {
          currentActiveIndex = messages.findIndex((m) => m.role === "user");
          if (currentActiveIndex === -1) currentActiveIndex = null;
        }

        if (currentActiveIndex !== activeQueryIndexRef.current) {
          activeQueryIndexRef.current = currentActiveIndex;
          onActiveQueryIndexChange?.(currentActiveIndex);
        }
      };

      viewport.addEventListener("scroll", onScroll);
      onScroll();
      return () => viewport.removeEventListener("scroll", onScroll);
    }, [messages, onActiveQueryIndexChange, getViewport]);

    useEffect(() => {
      const viewport = getViewport();

      if (!viewport) return;

      if (isStreaming && isAtBottomRef.current) {
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }, [messages, isStreaming, getViewport]);

    useLayoutEffect(() => {
      latestUserMessageKeyRef.current = null;
      activeQueryIndexRef.current = null;
      onActiveQueryIndexChange?.(null);
    }, [conversationKey, onActiveQueryIndexChange]);

    useLayoutEffect(() => {
      const latestUserIndex = getLatestUserMessageIndex();
      if (latestUserIndex < 0) {
        latestUserMessageKeyRef.current = null;
        return;
      }

      const latestUserMessage = messages[latestUserIndex];
      const latestUserMessageKey = getMessageKey(
        latestUserMessage,
        latestUserIndex,
      );

      if (latestUserMessageKeyRef.current === latestUserMessageKey) {
        return;
      }

      latestUserMessageKeyRef.current = latestUserMessageKey;
      scrollToMessageIndex(latestUserIndex, "auto");
    }, [
      messages,
      getLatestUserMessageIndex,
      getMessageKey,
      scrollToMessageIndex,
    ]);

    const lastMessage = messages[messages.length - 1];
    const waitingForAssistantFirstChunk = Boolean(
      isStreaming &&
      lastMessage?.role === "assistant" &&
      !lastMessage?.done &&
      !lastMessage?.isError &&
      !lastMessage?.text?.trim(),
    );

    useEffect(() => {
      if (!waitingForAssistantFirstChunk) {
        return;
      }

      const viewport = getViewport();
      const content = contentRef.current;
      const latestUserIndex = getLatestUserMessageIndex();
      const latestUserElement =
        latestUserIndex >= 0 ? messageRefs.current[latestUserIndex] : null;

      if (!viewport || !content || !latestUserElement) return;

      const updateSpacer = () => {
        const targetSpace = Math.max(
          180,
          Math.round(viewport.clientHeight * 1),
        );
        const currentSpacer = waitingSpacerRef.current?.offsetHeight ?? 0;
        const nonSpacerBelow = Math.max(
          0,
          content.scrollHeight -
            (latestUserElement.offsetTop + latestUserElement.offsetHeight) -
            currentSpacer,
        );
        const nextSpacer = Math.max(0, targetSpace - nonSpacerBelow);

        setWaitingSpacerHeight((prev) =>
          Math.abs(prev - nextSpacer) > 1 ? nextSpacer : prev,
        );
      };

      updateSpacer();

      const resizeObserver = new ResizeObserver(() => {
        updateSpacer();
      });

      resizeObserver.observe(viewport);
      resizeObserver.observe(content);

      return () => {
        resizeObserver.disconnect();
      };
    }, [
      waitingForAssistantFirstChunk,
      getLatestUserMessageIndex,
      messages,
      getViewport,
    ]);

    if (!messages || messages.length === 0) {
      return (
        <VStack className="flex-1 items-center justify-center p-8">
          <Empty>
            <EmptyHeader>
              <VStack className="items-center gap-4">
                <EmptyMedia>
                  <Brand />
                </EmptyMedia>
                <div className="space-y-2 text-center">
                  <EmptyTitle className="text-2xl font-semibold">
                    Welcome to Inquira
                  </EmptyTitle>
                  <EmptyDescription className="text-base text-muted-foreground max-w-md">
                    Your AI-powered research assistant. Ask questions and get
                    evidence-based answers with citations from academic papers.
                  </EmptyDescription>
                </div>
              </VStack>
            </EmptyHeader>
          </Empty>
        </VStack>
      );
    }

    return (
      <ScrollArea ref={scrollAreaRef} className="h-full flex-1">
        <Box ref={contentRef} className="pb-46">
          {messages.map((m, i) => {
            const isUserMessage = m.role === "user";
            const nextMessage = messages[i + 1];
            const shouldShowProgress =
              isUserMessage && nextMessage?.role === "assistant";
            const shouldShowGradient = nextMessage?.role === "user";
            const shouldShowMissingAssistantError =
              isUserMessage &&
              nextMessage?.role !== "assistant" &&
              !(isStreaming && i === messages.length - 1);

            const messageQueryId =
              (m.metadata?.query_id as string | undefined) ||
              (i === messages.length - 2 ? activeQueryId : null);

            const hasStoredProgress =
              nextMessage?.progressEvents &&
              nextMessage.progressEvents.length > 0;
            const progressData = hasStoredProgress
              ? {
                  steps:
                    nextMessage.progressEvents! as unknown as ProgressStep[],
                  isComplete: true,
                  startedAt:
                    nextMessage.progressEvents![0]?.timestamp ||
                    nextMessage.progressEvents![
                      nextMessage.progressEvents!.length - 1
                    ]?.timestamp ||
                    0,
                  completedAt:
                    nextMessage.progressEvents![
                      nextMessage.progressEvents!.length - 1
                    ]?.timestamp,
                  currentPhase: null,
                }
              : undefined;

            return (
              <Box key={i}>
                <Box
                  className={cn(
                    "mx-auto max-w-4xl p-4 pb-6 min-w-0 overflow-hidden",
                    isUserMessage && "pb-0",
                  )}
                  ref={(el) => {
                    messageRefs.current[i] = el;
                  }}
                >
                  <MessageSection
                    isUserMessage={isUserMessage}
                    message={m}
                    isReading={isReading && i === messages.length - 1}
                  />
                  {shouldShowProgress && (
                    <VStack className="gap-2 mt-2">
                      <Separator />
                      <ProgressEventSheet
                        queryId={
                          !hasStoredProgress ? messageQueryId : undefined
                        }
                        sourceCount={
                          Array.isArray(nextMessage?.paperSnapshots)
                            ? nextMessage.paperSnapshots.length
                            : undefined
                        }
                        progressData={progressData}
                      />
                    </VStack>
                  )}
                  {shouldShowMissingAssistantError && (
                    <MessageSection
                      message={{
                        text: "",
                        role: "assistant",
                        isError: true,
                      }}
                      isUserMessage={false}
                      isReading={false}
                    />
                  )}
                </Box>
                {shouldShowGradient && (
                  <Box className="relative w-full h-full">
                    <Box className="absolute inset-0 h-48 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
                    <Separator className="relative" />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </ScrollArea>
    );
  },
);
