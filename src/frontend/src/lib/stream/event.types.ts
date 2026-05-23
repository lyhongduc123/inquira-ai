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

  THINKING = "thinking",
  REASONING = "reasoning",
  SEARCHING = "searching",
  RANKING = "ranking",
  SEARCHING_EXTERNAL = "searching_external",
  INGESTING_PAPER = "ingesting_paper",

  END_EVENT = "end_event",
}

export interface ErrorEvent {
  type: StreamEvent.Error;
  message: string;
  error_type?: string;
}

export interface ThinkingProgressMetadata {
  intent?: string;
}

export interface SearchingProgressMetadata {
  queries?: string[];
}

export interface RankingProgressMetadata {
  total_papers?: number;
}

export interface SearchingExternalProgressMetadata {
  query?: string;
  provider?: string;
  cycle?: number;
  max_cycles?: number;
  queries?: string[];
}

export interface IngestingPaperProgressMetadata {
  paperId?: string;
  title?: string;
  ingested_count?: number;
  processed_with_pymupdf?: number;
}

export type ReasoningProgressMetadata = Record<string, unknown>;

export type EndProgressMetadata = Record<string, unknown>;

// Typed progress event variants with pipeline_type support.
interface ProgressEventBase<TType extends string, TMetadata = unknown> {
  type: TType;
  content?: string;
  metadata?: TMetadata;
  pipeline_type?: string | null;
  pipelineType?: string | null;
  progress_percent?: number;
  progressPercent?: number;
  timestamp?: number;
}

export type ThinkingProgressEvent = ProgressEventBase<
  EventType.THINKING,
  ThinkingProgressMetadata
>;

export type SearchingProgressEvent = ProgressEventBase<
  EventType.SEARCHING,
  SearchingProgressMetadata
>;

export type RankingProgressEvent = ProgressEventBase<
  EventType.RANKING,
  RankingProgressMetadata
>;

export type SearchingExternalProgressEvent = ProgressEventBase<
  EventType.SEARCHING_EXTERNAL,
  SearchingExternalProgressMetadata
>;

export type IngestingPaperProgressEvent = ProgressEventBase<
  EventType.INGESTING_PAPER,
  IngestingPaperProgressMetadata
>;

export type ReasoningProgressEvent = ProgressEventBase<
  EventType.REASONING,
  ReasoningProgressMetadata
>;

export type EndProgressEvent = ProgressEventBase<EventType.END_EVENT, EndProgressMetadata>;

// Union of all typed progress events.
export type ProgressEvent =
  | ThinkingProgressEvent
  | SearchingProgressEvent
  | RankingProgressEvent
  | SearchingExternalProgressEvent
  | IngestingPaperProgressEvent
  | ReasoningProgressEvent
  | EndProgressEvent;

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

export interface DoneEvent {
  type: StreamEvent.Done;
}

export interface IngestingEvent {
  type: EventType.INGESTING_PAPER;
  content: string;
  metadata: {
    paperId: string;
    title?: string;
  };
}

export interface ConversationEvent {
  conversation_id: string;
  title?: string;
  conversation_type?: string;
  primaryPaperId?: string;
  metadata?: Record<string, unknown>;
}
