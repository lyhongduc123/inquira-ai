import { SparklesIcon } from "lucide-react";

import { VStack } from "@/components/layout/vstack";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/global/markdown-renderer";

interface PaperAISummarySectionProps {
  summary: string;
  isLoading?: boolean;
}

export function PaperAISummarySection({ summary, isLoading }: PaperAISummarySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="size-5 text-primary" />
          AI Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <VStack className="gap-2">
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
            <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
          </VStack>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <MarkdownRenderer content={summary} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
