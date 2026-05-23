import { memo } from "react";
import { Message } from "@/types/message.type";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import { Box } from "@/components/layout/box";

interface MessageSectionProps {
  isUserMessage: boolean;
  showDivider?: boolean;
  message: Message;
  isReading?: boolean;
}

function MessageSectionComponent({
  isUserMessage,
  message: m,
  isReading,
}: MessageSectionProps) {
  const renderUserMessage = () => {
    return <UserMessage text={m.text} />;
  };

  const renderAssistantMessage = () => {
    return (
      <Box className="min-h-120">
        <AssistantMessage
          isVisible={false}
          text={m.text}
          sources={Array.isArray(m.paperSnapshots) ? m.paperSnapshots : []}
          scopedQuoteRefs={m.scopedQuoteRefs}
          isDone={m.done}
          isError={m.isError}
          isReading={isReading}
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

export const MessageSection = memo(MessageSectionComponent,
  (prevProps, nextProps) => {
    if (prevProps.message.text !== nextProps.message.text) return false;
    if (prevProps.message.done !== nextProps.message.done) return false;
    if (prevProps.isReading !== nextProps.isReading) return false;

    return prevProps.message.id === nextProps.message.id;
  }
);
MessageSection.displayName = "MessageSection";
