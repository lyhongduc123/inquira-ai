import { create } from "zustand";
import { ProgressEvent } from "@/lib/stream/event.types";
import { EventType } from "@/lib/stream/event.types";

export interface ProgressStep {
  type: string;
  content?: string; // Optional: only for reasoning
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface QueryProgress {
  queryId: string;
  query: string;
  conversationId?: string | null;
  currentPhase: string | null;
  phaseMessage: string | null;
  progress: number;
  isComplete: boolean;
  currentStep: number;
  totalSteps: number;
  steps: ProgressStep[];
  startedAt: number;
  completedAt?: number;
}

interface ProgressState {
  queries: Map<string, QueryProgress>;
  activeQueryId: string | null;
  startQuery: (queryId: string, query: string, conversationId?: string | null) => void;
  setStepCount: (queryId: string, totalSteps: number) => void;
  addProgress: (queryId: string, event: ProgressEvent) => void;
  completeQuery: (queryId: string) => void;
  clearQuery: (queryId: string) => void;
  clearAllQueries: () => void;
  setActiveQueryId: (queryId: string | null) => void;
  getQueryProgress: (queryId: string) => QueryProgress | undefined;
  getActiveProgress: () => QueryProgress | undefined;
  getAllQueries: () => QueryProgress[];
}

const phaseMap: Record<string, { phase: string; progress: number }> = {
  [EventType.SEARCHING]: { phase: "search", progress: 25 },
  [EventType.RANKING]: { phase: "analysis", progress: 50 },
  [EventType.REASONING]: { phase: "generation", progress: 75 },
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  queries: new Map(),
  activeQueryId: null,
  
  startQuery: (queryId, query, conversationId) => {
    const newProgress: QueryProgress = {
      queryId,
      query,
      conversationId,
      currentPhase: null,
      phaseMessage: null,
      progress: 0,
      isComplete: false,
      currentStep: 0,
      totalSteps: 0,
      steps: [],
      startedAt: Date.now(),
    };
    
    set((state) => {
      const newQueries = new Map(state.queries);
      newQueries.set(queryId, newProgress);
      return {
        queries: newQueries,
        activeQueryId: queryId,
      };
    });
  },

  setStepCount: (queryId, totalSteps) => {
    set((state) => {
      const queryProgress = state.queries.get(queryId);
      if (!queryProgress) return state;

      const normalizedTotalSteps = Math.max(0, Number(totalSteps) || 0);

      const updatedProgress: QueryProgress = {
        ...queryProgress,
        totalSteps: normalizedTotalSteps,
      };

      const newQueries = new Map(state.queries);
      newQueries.set(queryId, updatedProgress);

      return { queries: newQueries };
    });
  },
  
  addProgress: (queryId, event) => {
    set((state) => {
      const queryProgress = state.queries.get(queryId);
      if (!queryProgress) return state;
      
      const phaseInfo = phaseMap[event.type] || { phase: "processing", progress: 0 };
      
      const updatedSteps = [...queryProgress.steps];
      const lastStep = updatedSteps[updatedSteps.length - 1];
      
      if (event.type === EventType.REASONING && lastStep?.type === EventType.REASONING) {
        updatedSteps[updatedSteps.length - 1] = {
          ...lastStep,
          content: (lastStep.content || "") + (event.content || ""),
          timestamp: Date.now(),
        };
      } else {
        updatedSteps.push({
          type: event.type,
          content: event.content, // May be undefined for searching/ranking
          metadata: event.metadata,
          timestamp: Date.now(),
        });
      }
      
      const updatedProgress: QueryProgress = {
        ...queryProgress,
        currentPhase: phaseInfo.phase,
        phaseMessage: phaseInfo.phase,
        progress: phaseInfo.progress,
        currentStep:
          typeof event.metadata?.current_step === "number"
            ? event.metadata.current_step
            : queryProgress.currentStep,
        totalSteps:
          typeof event.metadata?.total_steps === "number"
            ? event.metadata.total_steps
            : queryProgress.totalSteps,
        steps: updatedSteps,
      };
      
      const newQueries = new Map(state.queries);
      newQueries.set(queryId, updatedProgress);
      
      return { queries: newQueries };
    });
  },
  
  completeQuery: (queryId) => {
    set((state) => {
      const queryProgress = state.queries.get(queryId);
      if (!queryProgress) return state;
      
      const updatedProgress: QueryProgress = {
        ...queryProgress,
        isComplete: true,
        progress: 100,
        completedAt: Date.now(),
      };
      
      const newQueries = new Map(state.queries);
      newQueries.set(queryId, updatedProgress);
      
      return { queries: newQueries };
    });
  },
  
  clearQuery: (queryId) => {
    set((state) => {
      const newQueries = new Map(state.queries);
      newQueries.delete(queryId);
      return {
        queries: newQueries,
        activeQueryId: state.activeQueryId === queryId ? null : state.activeQueryId,
      };
    });
  },
  
  clearAllQueries: () => {
    set({ queries: new Map(), activeQueryId: null });
  },
  
  setActiveQueryId: (queryId) => {
    set({ activeQueryId: queryId });
  },
  
  getQueryProgress: (queryId) => {
    return get().queries.get(queryId);
  },
  
  getActiveProgress: () => {
    const { activeQueryId, queries } = get();
    if (!activeQueryId) return undefined;
    return queries.get(activeQueryId);
  },
  
  getAllQueries: () => {
    return Array.from(get().queries.values()).sort((a, b) => b.startedAt - a.startedAt);
  },
}));
