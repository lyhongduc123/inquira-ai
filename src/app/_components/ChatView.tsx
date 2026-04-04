import { Message } from "@/types/message.type";
import { MessageArea, MessageAreaRef } from "./MessageArea";
import { ChatInputMain } from "./ChatInputMain";
import { VStack } from "@/components/layout/vstack";
import { SearchFilters } from "./FilterPanel";
import { PaperMetadata } from "@/types/paper.type";

interface ChatViewProps {
  conversationKey?: string;
  messages: Message[];
  isAuthenticated?: boolean;
  isStreaming: boolean;
  isAnalyzing?: boolean;
  messageAreaRef: React.RefObject<MessageAreaRef | null>;
  activeQueryIndex?: number;

  onSend: (query: string) => void;
  onQueryClick: (index: number) => void;
  onActiveQueryIndexChange?: (index: number | null) => void;
  onRetry?: () => void;
  selectedScopedPapers?: PaperMetadata[];
  onToggleScopedPaper?: (paperId: string) => void;
  onRemoveScopedPaper?: (paperId: string) => void;
  onClearScopedPapers?: () => void;
  // Deprecated - kept for backward compatibility
  useHybridPipeline?: boolean;
  setUseHybridPipeline?: (value: boolean) => void;
}

export function ChatView({
  conversationKey,
  messages,
  onSend,
  isStreaming,
  isAuthenticated,
  onActiveQueryIndexChange,
  messageAreaRef,
  onRetry,
  selectedScopedPapers = [],
  onToggleScopedPaper,
  onRemoveScopedPaper,
  onClearScopedPapers,
  useHybridPipeline,
  setUseHybridPipeline,
  isAnalyzing,
}: ChatViewProps) {
  return (
    <VStack className="flex-1 gap-0 min-w-0 overflow-y-hidden">
      <VStack className="relative overflow-y-hidden gap-0 min-w-0">
        <MessageArea
          ref={messageAreaRef}
          conversationKey={conversationKey}
          messages={messages}
          isStreaming={isStreaming}
          isAnalyzing={isAnalyzing}
          onRetry={onRetry}
          onActiveQueryIndexChange={onActiveQueryIndexChange}
          selectedPaperIds={selectedScopedPapers.map((paper) => paper.paperId)}
          onTogglePaperSelection={onToggleScopedPaper}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-background via-background/80 to-transparent" />
      </VStack>
      {isAuthenticated && (
        <div className="absolute bottom-0 left-0 right-0">
          <ChatInputMain
            onSend={onSend}
            isDisabled={isStreaming}
            isAtBottom={true}
            selectedScopedPapers={selectedScopedPapers}
            onRemoveScopedPaper={onRemoveScopedPaper}
            onClearScopedPapers={onClearScopedPapers}
            useHybridPipeline={useHybridPipeline}
            setUseHybridPipeline={setUseHybridPipeline}
          />
        </div>
      )}
    </VStack>
  );
}
