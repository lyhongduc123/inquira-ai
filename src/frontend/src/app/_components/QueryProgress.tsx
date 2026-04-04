"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useProgressStore } from "@/store/progress-store";
import {
  Loader2,
  Sparkles,
  Search,
  ListOrdered,
  ListTodo,
  ChevronRightIcon,
} from "lucide-react";
import { TypographyP } from "@/components/global/typography";
import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EventType } from "@/lib/stream/event.types";
import { Streamdown } from "streamdown";
import { Box } from "@/components/layout/box";
import { cn } from "@/lib/utils";
import pluralize from "pluralize";
import * as changeCase from "change-case";
import { C_BULLET } from "@/core";
import { OpacityShimmer } from "@/components/ui/opacity-shimmer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProgressStep {
  type: string;
  content?: string; // Optional: only for reasoning
  metadata?: Record<string, unknown>;
  timestamp: number;
}

interface QueryProgressProps {
  queryId?: string | null;
  sourceCount?: number;
  progressData?: {
    steps: ProgressStep[];
    isComplete: boolean;
    startedAt: number;
    completedAt?: number;
    currentPhase?: string | null;
    currentStep?: number;
    totalSteps?: number;
  };
}

export function QueryProgress({
  queryId,
  sourceCount,
  progressData,
}: QueryProgressProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);
  const queryProgressFromStore = useProgressStore((state) =>
    queryId ? state.getQueryProgress(queryId) : undefined,
  );
  const queryProgress = progressData || queryProgressFromStore;

  if (!queryProgress) {
    return null;
  }

  const displayThoughts = queryProgress.steps || [];
  const receivedStepsCount = displayThoughts.length;
  const hasNoEventsYet = !queryProgress.isComplete && receivedStepsCount === 0;
  const stepsCount = queryProgress.totalSteps || receivedStepsCount;
  const hasSteps = stepsCount > 0;
  const latestStep =
    receivedStepsCount > 0 ? displayThoughts[receivedStepsCount - 1] : null;

  const rankingStep = [...displayThoughts]
    .reverse()
    .find((step) => step.type === EventType.RANKING);

  const rankingSourceCount =
    typeof rankingStep?.metadata?.total_papers === "number"
      ? rankingStep.metadata.total_papers
      : null;

  const completedSourceCount =
    typeof sourceCount === "number" ? sourceCount : rankingSourceCount;

  const currentLabel =
    queryProgress.currentPhase || latestStep?.type || "processing";
  const currentStepNumber = queryProgress.currentStep || receivedStepsCount;

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <Button
        onClick={() => hasSteps && setIsSheetOpen(true)}
        variant="ghost"
        className="max-w-[50%] w-fit justify-between rounded-lg px-2 py-1"
      >
        <>
          <HStack className="items-center gap-2 min-w-0">
            <ListTodo size={14} className="text-secondary shrink-0" />
            <TypographyP size="xs" weight="medium" className="truncate">
              {pluralize("step", stepsCount, true)}
            </TypographyP>
          </HStack>
          {C_BULLET}
          <HStack className="items-center gap-1 min-w-0">
            <TypographyP size="xs" className="truncate">
              {hasNoEventsYet
                ? "Processing..."
                : queryProgress.isComplete
                  ? `${pluralize("source", queryProgress.totalSteps ?? 0, true)}`
                  : `${changeCase.capitalCase(currentLabel)}...`}
            </TypographyP>
          </HStack>
        </>
      </Button>
      {!queryProgress.isComplete && (
        <VStack className="gap-2 min-w-0 px-4 py-2 border rounded-xl bg-muted/10">
          {!hasNoEventsYet && latestStep?.type !== EventType.REASONING && (
            <HStack className="items-center gap-2 min-w-0">
              <Loader2
                size={14}
                className="animate-spin text-secondary shrink-0"
              />
              <TypographyP size="sm" weight="medium" className="truncate">
                {changeCase.capitalCase(currentLabel)}
              </TypographyP>
            </HStack>
          )}

          {!hasNoEventsYet && latestStep?.type !== EventType.REASONING && (
            <TypographyP size="sm" variant="muted" className="leading-relaxed">
              <OpacityShimmer>
                {latestStep ? parseContent(latestStep) : null}
              </OpacityShimmer>
            </TypographyP>
          )}
        </VStack>
      )}

      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex h-full flex-col"
      >
        <SheetHeader className="shrink-0">
          <SheetTitle>Query Steps</SheetTitle>
          <SheetDescription>
            {queryProgress.totalSteps
              ? `${currentStepNumber}/${queryProgress.totalSteps} ${pluralize("step", queryProgress.totalSteps)}`
              : pluralize("step", stepsCount, true)}
            {queryProgress.isComplete && queryProgress.completedAt
              ? ` in ${formatDuration(queryProgress.startedAt, queryProgress.completedAt)}`
              : ""}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0 pt-2 px-2">
          <StepAccordion
            value={
              latestStep
                ? `${latestStep.type}-${receivedStepsCount - 1}`
                : undefined
            }
            displayThoughts={displayThoughts}
            queryProgress={queryProgress}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

const StepAccordion = ({
  value,
  displayThoughts,
  queryProgress,
}: {
  value?: string;
  displayThoughts: ProgressStep[];
  queryProgress: NonNullable<QueryProgressProps["progressData"]>;
}) => {
  const [openItem, setOpenItem] = useState<string | undefined>(value);

  function onValueChange(newValue: string | undefined) {
    setOpenItem(newValue);
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={openItem}
      onValueChange={onValueChange}
      className="relative w-full"
    >
      {displayThoughts.map((thought, idx) => {
        const stepKey = `${thought.type}-${idx}`;
        const isLastStep = idx === displayThoughts.length - 1;
        const isActive = isLastStep && !queryProgress.isComplete;

        return (
          <div key={stepKey} className="relative flex gap-3 pb-4">
            {/* Connector Line (2px thick, perfectly centered) */}
            {!isLastStep && (
              <div className="absolute left-[15px] top-[32px] bottom-0 w-0.5 bg-border/70" />
            )}

            {/* Timeline Icon Node */}
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors mt-0.5",
                isActive
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "bg-background border-border text-muted-foreground",
              )}
            >
              {isActive ? (
                <Loader2 size={14} className="animate-spin text-primary" />
              ) : (
                <TypeIcon type={thought.type} />
              )}
            </div>

            <AccordionItem
              value={stepKey}
              className="flex-1 min-w-0 border-none"
            >
              <AccordionTrigger
                className={cn(
                  "group w-full justify-between rounded-xl px-4 py-3 transition-colors ",
                  isActive && "bg-muted/30",
                )}
              >
                <HStack className="gap-3 items-center min-w-0">
                  <TypographyP
                    size="sm"
                    weight="medium"
                    className={cn(
                      "capitalize truncate",
                      isActive ? "text-foreground" : "text-foreground/80",
                    )}
                  >
                    Step {idx + 1}: {thought.type}
                  </TypographyP>
                </HStack>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-2 pt-1">
                {thought.type === EventType.REASONING ? (
                  <ReasoningRenderer>
                    {parseContent(thought) as string}
                  </ReasoningRenderer>
                ) : (
                  <TypographyP
                    size="sm"
                    variant="muted"
                    className="leading-relaxed"
                  >
                    {parseContent(thought)}
                  </TypographyP>
                )}
              </AccordionContent>
            </AccordionItem>
          </div>
        );
      })}
    </Accordion>
  );
};

const TypeIcon = ({ type }: { type: string }) => {
  switch (type as EventType) {
    case EventType.SEARCHING:
      return <Search size={14} className="text-inherit shrink-0" />;
    case EventType.RANKING:
      return <ListOrdered size={14} className="text-inherit shrink-0" />;
    case EventType.REASONING:
      return <Sparkles size={14} className="text-inherit shrink-0" />;
    default:
      return <Sparkles size={14} className="text-inherit shrink-0" />;
  }
};

const ReasoningRenderer = ({ children }: { children?: string }) => {
  return (
    <Streamdown
      className="text-sm text-muted-foreground leading-relaxed"
      components={{
        h1: ({ children }) => <p className="font-medium m-0">{children}</p>,
        h2: ({ children }) => <p className="font-medium m-0">{children}</p>,
        h3: ({ children }) => <p className="font-medium m-0">{children}</p>,
        p: ({ children }) => <p className="m-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="list-disc pl-3 my-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-3 my-1">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        code: ({ children }) => (
          <code className="bg-muted px-1 py-0.5 rounded text-[11px]">
            {children}
          </code>
        ),
      }}
    >
      {children || ""}
    </Streamdown>
  );
};

function parseContent(step: ProgressStep): ReactNode | string {
  switch (step.type) {
    case EventType.SEARCHING:
      if (!step.metadata?.queries) {
        console.warn("Searching step is missing metadata.queries", step);
        return "Searching academic databases...";
      }
      const queries = Array.isArray(step.metadata.queries)
        ? (step.metadata.queries as string[]).filter(Boolean)
        : [];
      return queries.map((q, idx) => (
        <span key={idx}>
          {q}
          {idx < queries.length - 1 && <br />}
        </span>
      ));

    case EventType.RANKING:
      if (!step.metadata?.total_papers) {
        console.warn("Ranking step is missing metadata", step);
      }
      return (
        step.content ||
        `Ranking ${step.metadata?.total_papers ?? "papers"} by  relevance, filters, and quality...`
      );
    case EventType.REASONING:
      if (!step.content) {
        console.warn("Reasoning step is missing content", step);
      }
      return step.content || "Generating response...";
    default:
      return step.content || "";
  }
}

function formatDuration(start: number, end: number) {
  const duration = end - start;
  const seconds = Math.floor(duration / 1000);
  return seconds < 60
    ? `${seconds}s`
    : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
