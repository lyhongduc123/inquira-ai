import React from "react";
import { ChatInput } from "@/app/_components/_shared/ChatInput";
import { HStack } from "@/components/layout/hstack";
import { TypographyP } from "@/components/global/typography";

interface PaperChatInputProps {
  paperTitle: string;
  onSend: (msg: string) => void;
  isDisabled?: boolean;
}

export function PaperChatInput({
  paperTitle,
  onSend,
  isDisabled,
}: PaperChatInputProps) {
  const scopeIndicator = paperTitle ? (
    <HStack className="relative items-center gap-2 px-1 py-0.5 bg-primary rounded-lg border overflow-hidden">
      <TypographyP size="xs" className="text-primary-foreground font-medium">
        Searching:
      </TypographyP>
      <TypographyP size="xs" className="text-primary-foreground truncate flex-1">
        {paperTitle}
      </TypographyP>
    </HStack>
  ) : null;

  return (
    <ChatInput
      onSend={onSend}
      isDisabled={isDisabled}
      placeholder="Ask about this paper..."
      blockStart={scopeIndicator}
    />
  );
}
