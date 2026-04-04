"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useEffect,
  useRef,
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
import { QueryProgress } from "./QueryProgress";
import { Box } from "@/components/layout/box";
import { useProgressStore } from "@/store/progress-store";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface MessageAreaRef {
  scrollToMessage: (index: number) => void;
  scrollToLatestQuery: () => void;
  activeQueryIndex: number | null;
}

interface MessageAreaProps {
  conversationKey?: string;
  messages: Message[];
  isStreaming: boolean;
  isAnalyzing?: boolean;
  onRetry?: () => void;
  selectedPaperIds?: string[];
  onTogglePaperSelection?: (paperId: string) => void;
  onActiveQueryIndexChange?: (index: number | null) => void;
}

export const MessageArea = forwardRef<MessageAreaRef, MessageAreaProps>(
  function MessageArea(
    {
      conversationKey,
      messages,
      isStreaming,
      isAnalyzing,
      onRetry,
      selectedPaperIds = [],
      onTogglePaperSelection,
      onActiveQueryIndexChange,
    },
    ref,
  ) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);
    const messageRefs = useRef<(HTMLElement | null)[]>([]);
    const previousLastUserMessageIndex = useRef<number>(-1);
    const previousMessagesLengthRef = useRef<number>(0);
    const activeQueryIndexRef = useRef<number | null>(null);
    const activeQueryId = useProgressStore((state) => state.activeQueryId);

    // Expose scrollToMessage function and activeQueryIndex to parent
    useImperativeHandle(ref, () => ({
      scrollToMessage: (index: number) => {
        const messageElement = messageRefs.current[index];
        const scrollContainer = scrollAreaRef.current?.querySelector(
          "[data-radix-scroll-area-viewport]",
        ) as HTMLElement;

        if (messageElement && scrollContainer) {
          const offsetTop = messageElement.offsetTop;
          scrollContainer.scrollTo({
            top: offsetTop - 100, // 100px offset from top for better visibility
            behavior: "smooth",
          });
        }
      },
      scrollToLatestQuery: () => {
        // Find the last user message
        const lastUserMessageIndex = messages
          .map((m, i) => (m.role === "user" ? i : -1))
          .filter((i) => i !== -1)
          .pop();

        if (lastUserMessageIndex !== undefined) {
          const messageElement = messageRefs.current[lastUserMessageIndex];
          const scrollContainer = scrollAreaRef.current?.querySelector(
            "[data-radix-scroll-area-viewport]",
          ) as HTMLElement;

          if (messageElement && scrollContainer) {
            const offsetTop = messageElement.offsetTop;
            scrollContainer.scrollTo({
              top: offsetTop - 100, // Position below header
              behavior: "smooth",
            });
          }
        }
      },
      activeQueryIndex: activeQueryIndexRef.current,
    }));

    useEffect(() => {
      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement | null;

      if (!viewport) return;

      const onScroll = () => {
        const distance =
          viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;

        isAtBottomRef.current = distance < 100;

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
    }, [messages, onActiveQueryIndexChange]);

    useEffect(() => {
      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement | null;

      if (!viewport) return;

      if (isStreaming && isAtBottomRef.current) {
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }, [messages, isStreaming]);

    useEffect(() => {
      const prevLength = previousMessagesLengthRef.current;
      const currentLength = messages.length;
      previousMessagesLengthRef.current = currentLength;

      if (currentLength !== prevLength + 1) {
        return;
      }

      const last = messages[currentLength - 1];
      if (!last || last.role !== "user") {
        return;
      }

      const lastUserMessageIndex = currentLength - 1;
      if (lastUserMessageIndex === previousLastUserMessageIndex.current) return;

      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement | null;

      if (!viewport) return;

      const messageElement = messageRefs.current[lastUserMessageIndex];

      if (messageElement) {
        previousLastUserMessageIndex.current = lastUserMessageIndex;
        isAtBottomRef.current = true;
        requestAnimationFrame(() => {
          const offsetTop = messageElement.offsetTop;
          viewport.scrollTo({ 
            top: offsetTop - 100, // Position below header (100px offset)
            behavior: "smooth" 
          });
        });
      }
    }, [messages]);

    useEffect(() => {
      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement | null;

      if (!viewport) return;

      previousLastUserMessageIndex.current = -1;
      activeQueryIndexRef.current = null;
      onActiveQueryIndexChange?.(null);

      requestAnimationFrame(() => {
        viewport.scrollTo({ top: 0, behavior: "auto" });
      });
    }, [conversationKey, onActiveQueryIndexChange]);

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
                    Welcome to Exegent
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
        <Box className="pb-32">
          {messages.map((m, i) => {
            const isUserMessage = m.role === "user";
            const nextMessage = messages[i + 1];
            const shouldShowProgress =
              isUserMessage && nextMessage?.role === "assistant";
            const shouldShowGradient = nextMessage?.role === "user";

            const messageQueryId =
              (m.metadata?.query_id as string | undefined) ||
              (i === messages.length - 2 ? activeQueryId : null);
            
            const hasStoredProgress = nextMessage?.progressEvents && nextMessage.progressEvents.length > 0;
            const progressData = hasStoredProgress ? {
              steps: nextMessage.progressEvents!,
              isComplete: true,
              startedAt:
                nextMessage.progressEvents![0]?.timestamp
                || nextMessage.progressEvents![nextMessage.progressEvents!.length - 1]?.timestamp
                || 0,
              completedAt: nextMessage.progressEvents![nextMessage.progressEvents!.length - 1]?.timestamp,
              currentPhase: null,
            } : undefined;

            return (
              <Box key={i}>
                <Box
                  className={cn(
                    "mx-auto max-w-4xl p-4 pb-6 min-w-0 overflow-hidden",
                    isUserMessage && "pb-0"
                  )}
                  ref={(el) => {
                    messageRefs.current[i] = el;
                  }}
                >
                  <MessageSection 
                    isUserMessage={isUserMessage} 
                    message={m} 
                    onRetry={onRetry}
                    selectedPaperIds={selectedPaperIds}
                    onTogglePaperSelection={onTogglePaperSelection}
                    isAnalyzing={isAnalyzing && i === messages.length - 1}
                  />
                  {shouldShowProgress && (
                    <Box className="mt-2">
                      <QueryProgress 
                        queryId={!hasStoredProgress ? messageQueryId : undefined} 
                        sourceCount={Array.isArray(nextMessage?.paperSnapshots) ? nextMessage.paperSnapshots.length : undefined}
                        progressData={progressData}
                      />
                    </Box>
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
