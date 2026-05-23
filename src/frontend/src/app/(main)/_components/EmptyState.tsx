import { ChatInputMain } from "./ChatInputMain";
import { TypographyH1, TypographyP } from "@/components/global/typography";
import { VStack } from "@/components/layout/vstack";
import { PaperMetadata } from "@/types/paper.type";

interface EmptyStateProps {
  onSend: (query: string) => void;
  isDisabled: boolean;
  prefillMessage?: string | null;
  onPrefillConsumed?: () => void;
  selectedScopedPapers?: PaperMetadata[];
  onRemoveScopedPaper?: (paperId: string) => void;
  onClearScopedPapers?: () => void;
  // Deprecated - kept for backward compatibility
  useHybridPipeline?: boolean;
  setUseHybridPipeline?: (value: boolean) => void;
}

export function EmptyState({
  onSend,
  isDisabled,
  prefillMessage,
  onPrefillConsumed,
  selectedScopedPapers,
  onRemoveScopedPaper,
  onClearScopedPapers,
  useHybridPipeline,
  setUseHybridPipeline,
}: EmptyStateProps) {
  return (
    <VStack className="flex-1 items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="space-y-3 text-center">
          <TypographyH1 className="text-4xl font-bold text-primary">
            Welcome to Inquira
          </TypographyH1>
          <TypographyP variant="accent" size="lg">
            Your AI-powered research assistant. Ask questions and get
            evidence-based answers with citations.
          </TypographyP>
        </div>

        <ChatInputMain
          onSend={onSend}
          isDisabled={isDisabled}
          isAtBottom={false}
          selectedScopedPapers={selectedScopedPapers}
          onRemoveScopedPaper={onRemoveScopedPaper}
          onClearScopedPapers={onClearScopedPapers}
          prefillMessage={prefillMessage}
          onPrefillConsumed={onPrefillConsumed}
          useHybridPipeline={useHybridPipeline}
          setUseHybridPipeline={setUseHybridPipeline}
        />
      </div>
    </VStack>
  );
}
