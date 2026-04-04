import { PaperMetadata } from "@/types/paper.type";

export enum StreamEvent {
  Progress = "progress",
  Metadata = "metadata",
  Chunk = "chunk",
  Done = "done",
  Error = "error",
  Heartbeat = "heartbeat",
  Step = "step",
  Reasoning = "reasoning",
  Ping = "ping",
  Conversation = "conversation",
}

export enum EventType {
  PAPER_METADATA = "papers_metadata",

  REASONING = "reasoning",
  SEARCHING = "searching",
  RANKING = "ranking",

  END_EVENT = "end_event",
}

export interface ErrorEvent {
  type: StreamEvent.Error;
  message: string;
  error_type?: string;
}

export interface ProgressEvent {
  type:
    | EventType.RANKING
    | EventType.SEARCHING
    | EventType.REASONING
    | EventType.END_EVENT
    | "reasoning"
    | "searching"
    | "ranking"
    | "step_count";
  content: string;
  metadata?: Record<string, unknown>;
  phase?: string;
  progress_percent?: number;
  current_step?: number;
  total_steps?: number;
}

export interface ReasoningEvent {
  type: EventType.REASONING;
  content: string;
}

export interface MetadataEvent {
  type: EventType.PAPER_METADATA;
  content: PaperMetadata[];
}

export interface ChunkEvent {
  type: StreamEvent.Chunk;
  content: string;
}

export interface ConversationEvent {
  conversation_id: string;
  title?: string;
  conversation_type?: string;
  primary_paper_id?: string;
  metadata?: Record<string, unknown>;
}
