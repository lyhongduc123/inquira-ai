export interface ChatSubmitFilters {
  authorName?: string;
  yearMin?: number;
  yearMax?: number;
  venue?: string;
  minCitationCount?: number;
  maxCitationCount?: number;
  journalQuartile?: string;
  fieldOfStudy?: string[];
  paperIds?: string[];
}

export interface ChatSubmitRequest {
  query: string;
  conversationId?: string;
  filters?: ChatSubmitFilters;
  model?: string;
  clientMessageId?: string;
  pipeline: "database" | "hybrid" | "research" | "agent";
}

export interface ChatSubmitResponse {
  taskId: string;
  conversationId: string;
  status: string;
  message: string;
}

export interface PipelineTaskResponse {
  taskId: string;
  userId: number;
  conversationId: string;
  messageId?: number;
  query: string;
  pipelineType: string;
  status: string;
  currentPhase?: string;
  progressPercent: number;
  errorMessage?: string;
  retryCount: number;
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
}
