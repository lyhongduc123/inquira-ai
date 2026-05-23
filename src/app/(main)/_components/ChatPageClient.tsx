"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { LoadingState } from "@/app/(main)/_components/LoadingState";
import { EmptyState } from "@/app/(main)/_components/EmptyState";
import { ChatView } from "@/app/(main)/_components/ChatView";
import { Header } from "@/components/global/header";
import { useChat } from "@/hooks/use-chat";
import { useConversation } from "@/hooks/use-conversation";
import { useAuthStore } from "@/store/auth-store";
import { useViewMode } from "@/hooks/use-view-mode";
import { useChatHandlers } from "@/hooks/use-chat-handlers";
import { useConversationStore } from "@/store/conversation-store";
import { VStack } from "@/components/layout/vstack";
import {
  SidebarProvider,
  SidebarInset,
  SidebarManager,
} from "@/components/ui/sidebar";
import { PaperDetailSidebar } from "@/app/(main)/_components/PaperDetailSidebar";
import { QueryNavigator } from "@/app/(main)/_components/QueryNavigator";
import { useDetailSidebarStore } from "@/store/paper-detail-sidebar-store";
import { PaperMetadata } from "@/types/paper.type";
import {
  consumeChatLaunchPayload,
  consumeScopedChatSelection,
} from "@/lib/scoped-chat-selection";
import { useSearchFilters } from "@/hooks/use-search-filters";
import { ShareConversationButton } from "./ShareConversationButton";
import { useScopedPaperSelection } from "@/hooks/use-scoped-paper-selection";

interface ChatPageClientProps {
  routeConversationId?: string;
  launchKeyFromQuery?: string;
}

type ChatMode = "empty" | "loading" | "active";

export function ChatPageClient({
  routeConversationId,
  launchKeyFromQuery,
}: ChatPageClientProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const canRenderConversationRoute = Boolean(routeConversationId);
  const showContent =
    canRenderConversationRoute || (!isAuthLoading && isAuthenticated);

  const { filters: searchFilters, pipeline, setParams } = useSearchFilters();

  const handlePipelineChange = useCallback(
    (newPipeline: "research" | "agent") => {
      setParams(searchFilters, newPipeline);
    },
    [searchFilters, setParams],
  );

  const { isOpen: isDetailSidebarOpen, close: closeDetailSidebar } =
    useDetailSidebarStore();

  const { messageAreaRef, handleQueryClick, handleActiveQueryIndexChange } =
    useViewMode();

  const {
    currentConversationId,
    isLoadingMessages,
    resetConversation,
    loadConversation,
  } = useConversation();

  const latestAppliedRouteConversationIdRef = useRef<string | undefined>(
    undefined,
  );
  const processedLaunchKeyRef = useRef<string | null>(null);
  const hasInitializedRootStateRef = useRef(false);

  useEffect(() => {
    if (!showContent) return;

    // Route effect triggered

    if (routeConversationId) {
      const recentlyDeletedConversationId = useConversationStore
        .getState()
        .recentlyDeletedConversationId;
      if (recentlyDeletedConversationId === routeConversationId) {
        useConversationStore.getState().setRecentlyDeletedConversationId(null);
        latestAppliedRouteConversationIdRef.current = routeConversationId;
        return;
      }

      if (
        latestAppliedRouteConversationIdRef.current !== routeConversationId ||
        currentConversationId !== routeConversationId
      ) {
        // Route mismatch detected - checking if load needed
        const isCurrentlyStreaming = useConversationStore
          .getState()
          .messages.some((m) => !m.done);
        if (isCurrentlyStreaming && currentConversationId === routeConversationId) {
          latestAppliedRouteConversationIdRef.current = routeConversationId;
          return;
        }

        const isNewConversation =
          useConversationStore.getState().newConversationId ===
          routeConversationId;
        if (isNewConversation) {
          latestAppliedRouteConversationIdRef.current = routeConversationId;
          return;
        }

        // calling loadConversation
        latestAppliedRouteConversationIdRef.current = routeConversationId;
        void loadConversation(routeConversationId).catch((error) => {
          console.error("Route conversation load failed:", error);
        });
      }
      // route effect complete
      return;
    }

    // No routeConversationId - clearing refs
    latestAppliedRouteConversationIdRef.current = undefined;
    if (useConversationStore.getState().recentlyDeletedConversationId) {
      useConversationStore.getState().setRecentlyDeletedConversationId(null);
    }
  }, [
    currentConversationId,
    loadConversation,
    routeConversationId,
    showContent,
  ]);

  const onConversationCreated = useCallback((conversationId: string) => {
    const store = useConversationStore.getState();
    store.setCurrentConversationId(conversationId);
    store.setNewConversationId(conversationId);

    // Update URL without triggering a full page re-mount (Gemini-like)
    // This keeps the useChat hook alive and streaming correctly
    // Push make the URL reflect the new conversation ID without reloading the page
    window.history.replaceState(null, "", `/conversation/${conversationId}`);
  }, []);

  const {
    messages,
    isStreaming,
    isReading,
    sendMessage,
    clearMessages,
    pendingInputMessage,
    clearPendingInputMessage,
  } = useChat({
    onConversationCreated,
  });

  const chatMode: ChatMode = useMemo(() => {
    if (isLoadingMessages) return "loading";
    if (!showContent && messages.length === 0) return "empty";
    if (!canRenderConversationRoute && messages.length === 0) return "empty";
    if (!isLoadingMessages && messages.length === 0) return "loading";
    return "active";
  }, [canRenderConversationRoute, isLoadingMessages, messages.length, showContent]);

  useEffect(() => {
    if (!showContent) return;
    if (routeConversationId) {
      hasInitializedRootStateRef.current = false;
      return;
    }
    if (launchKeyFromQuery) return;
    if (hasInitializedRootStateRef.current) return;

    if (currentConversationId !== null || messages.length > 0) {
      resetConversation();
      clearMessages();
    }

    hasInitializedRootStateRef.current = true;
  }, [
    currentConversationId,
    launchKeyFromQuery,
    resetConversation,
    clearMessages,
    messages.length,
    routeConversationId,
    showContent,
  ]);

  const availablePapersMap = useMemo(() => {
    const map = new Map<string, PaperMetadata>();

    for (const message of messages) {
      const snapshots = Array.isArray(message.paperSnapshots)
        ? message.paperSnapshots
        : [];

      for (const paper of snapshots) {
        if (paper?.paperId) {
          map.set(paper.paperId, paper);
        }
      }
    }

    return map;
  }, [messages]);

  const {
    selectedScopedPapers,
    selectedScopedPaperIds,
    mergeScopedPapers,
    toggleScopedPaper,
    removeScopedPaper,
    clearScopedPapers,
  } = useScopedPaperSelection(availablePapersMap);

  useEffect(() => {
    const pendingScopedSelection = consumeScopedChatSelection();
    if (pendingScopedSelection.length === 0) return;

    queueMicrotask(() => {
      mergeScopedPapers(pendingScopedSelection);
    });
  }, [mergeScopedPapers]);

  const { handleSend } = useChatHandlers({
    currentConversationId,
    sendMessage,
    resetConversation,
    clearMessages,
    searchFilters,
    selectedScopedPaperIds,
  });

  useEffect(() => {
    if (selectedScopedPaperIds.length > 0 && pipeline === "agent") {
      handlePipelineChange("research");
    }
  }, [selectedScopedPaperIds.length, pipeline, handlePipelineChange]);

  useEffect(() => {
    if (!showContent || routeConversationId) return;
    if (!launchKeyFromQuery) return;

    const consumedMarkerKey = `exegent_launch_consumed_${launchKeyFromQuery}`;
    if (sessionStorage.getItem(consumedMarkerKey) === "1") return;

    if (processedLaunchKeyRef.current === launchKeyFromQuery) return;

    processedLaunchKeyRef.current = launchKeyFromQuery;
    sessionStorage.setItem(consumedMarkerKey, "1");

    const launchPayload = consumeChatLaunchPayload(launchKeyFromQuery);
    if (!launchPayload) return;

    const scopedPapers = (launchPayload.scopedPapers || []).filter((paper) =>
      Boolean(paper?.paperId),
    );

    if (scopedPapers.length > 0) {
      queueMicrotask(() => {
        mergeScopedPapers(scopedPapers);
      });
    }

    const pipelineFromLaunch = launchPayload.pipeline;
    if (pipelineFromLaunch) {
      queueMicrotask(() => {
        handlePipelineChange(pipelineFromLaunch as "research" | "agent");
      });
    }

    const cleanedUrl = window.location.pathname;
    window.history.replaceState({}, "", cleanedUrl);

    const initialQuery = launchPayload.query.trim();
    if (!initialQuery) return;

    const requestFilters: Record<string, unknown> = {
      ...(launchPayload.filters || {}),
    };

    if (scopedPapers.length > 0) {
      requestFilters.paperIds = scopedPapers.map((paper) => paper.paperId);
    }

    void sendMessage({
      query: initialQuery,
      conversationId: launchPayload.conversationId || undefined,
      filters:
        Object.keys(requestFilters).length > 0 ? requestFilters : undefined,
      pipeline: launchPayload.pipeline || pipeline,
    });
  }, [
    launchKeyFromQuery,
    pipeline,
    routeConversationId,
    sendMessage,
    showContent,
    handlePipelineChange,
    mergeScopedPapers,
  ]);

  return (
    <SidebarProvider
      open={isDetailSidebarOpen}
      onOpenChange={(open) => {
        if (!open) closeDetailSidebar();
      }}
      style={
        {
          "--sidebar-width": "clamp(20rem, 40vw, 36rem)",
        } as React.CSSProperties
      }
    >
      <SidebarInset>
        {showContent && messages.length > 0 && (
          <Header
            middleContent={
              <QueryNavigator
                messages={messages}
                onQueryClick={handleQueryClick}
              />
            }
            rightContent={
              <ShareConversationButton url={window.location.href} />
            }
          ></Header>
        )}
        <VStack className="relative flex-1 overflow-hidden gap-0 min-w-0">
          {chatMode === "loading" && <LoadingState />}
          {chatMode === "empty" && (
            <EmptyState
              key={`empty-${currentConversationId ?? "new"}`}
              onSend={handleSend}
              isDisabled={isStreaming}
              prefillMessage={pendingInputMessage}
              onPrefillConsumed={clearPendingInputMessage}
              selectedScopedPapers={selectedScopedPapers}
              onRemoveScopedPaper={removeScopedPaper}
              onClearScopedPapers={clearScopedPapers}
            />
          )}
          {chatMode === "active" && (
            <ChatView
              key={`chat-${routeConversationId ?? currentConversationId ?? "new"}`}
              conversationKey={
                routeConversationId ?? currentConversationId ?? "new"
              }
              messages={messages}
              onSend={handleSend}
              isStreaming={isStreaming}
              isReading={isReading}
              onQueryClick={handleQueryClick}
              onActiveQueryIndexChange={handleActiveQueryIndexChange}
              messageAreaRef={messageAreaRef}
              prefillMessage={pendingInputMessage}
              onPrefillConsumed={clearPendingInputMessage}
              selectedScopedPapers={selectedScopedPapers}
              onToggleScopedPaper={toggleScopedPaper}
              onRemoveScopedPaper={removeScopedPaper}
              onClearScopedPapers={clearScopedPapers}
              isAuthenticated={isAuthenticated}
            />
          )}
        </VStack>
      </SidebarInset>
      <SidebarManager name="right">
        <PaperDetailSidebar />
      </SidebarManager>
    </SidebarProvider>
  );
}
