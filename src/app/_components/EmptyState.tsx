import { ChatInputMain } from "./ChatInputMain";
import { TypographyP } from "@/components/global/typography";
import { VStack } from "@/components/layout/vstack";
import { SearchFilters } from "./FilterPanel";
import { PaperMetadata } from "@/types/paper.type";

interface EmptyStateProps {
  onSend: (query: string) => void;
  isDisabled: boolean;
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
  selectedScopedPapers,
  onRemoveScopedPaper,
  onClearScopedPapers,
  useHybridPipeline,
  setUseHybridPipeline,
}: EmptyStateProps) {
  return (
    <VStack className="flex-1 items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-3 text-center">
          <h1 className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold text-transparent">
            Welcome to Exegent
          </h1>
          <TypographyP variant="muted" size="lg">
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
          useHybridPipeline={useHybridPipeline}
          setUseHybridPipeline={setUseHybridPipeline}
        />
      </div>
    </VStack>
  );
}
