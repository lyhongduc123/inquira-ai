import { memo } from "react";
import { Message } from "@/types/message.type";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import { Box } from "@/components/layout/box";

interface MessageSectionProps {
  isUserMessage: boolean;
  showDivider?: boolean;
  message: Message;
  onRetry?: () => void;
  selectedPaperIds?: string[];
  onTogglePaperSelection?: (paperId: string) => void;
  isAnalyzing?: boolean;
}

function MessageSectionComponent({
  isUserMessage,
  showDivider,
  message: m,
  onRetry,
  selectedPaperIds = [],
  onTogglePaperSelection,
  isAnalyzing,
}: MessageSectionProps) {
  const renderUserMessage = () => {
    return <UserMessage text={m.text} />;
  };

  const renderAssistantMessage = () => {
    return (
      <Box>
        <AssistantMessage
          isVisible={false}
          text={m.text}
          sources={Array.isArray(m.paperSnapshots) ? m.paperSnapshots : []}
          scopedQuoteRefs={m.scopedQuoteRefs}
          isDone={m.done}
          isError={m.isError}
          onRetry={onRetry}
          isAnalyzing={isAnalyzing}
          selectedPaperIds={selectedPaperIds}
          onTogglePaperSelection={(paper) => {
            if (paper.paperId) {
              onTogglePaperSelection?.(paper.paperId)
            }
          }}
        />
      </Box>
    );
  };

  return (
    <Box className="w-full space-y-4 z-30">
      {isUserMessage ? renderUserMessage() : renderAssistantMessage()}
    </Box>
  );
}

export const MessageSection = memo(MessageSectionComponent);
MessageSection.displayName = "MessageSection";
