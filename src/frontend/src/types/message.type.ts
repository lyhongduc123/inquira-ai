import { PaperMetadata } from "./paper.type";
import { ScopedCitationRef } from "@/lib/scoped-citation-utils";
import { ProgressEvent } from "@/lib/stream/event.types";

/**
 * Message Types for Chat Interface
 */

export interface Message {
  id?: number;
  role: "user" | "assistant";
  text: string;
  paperSnapshots?: PaperMetadata[];
  scopedQuoteRefs?: ScopedCitationRef[];
  progressEvents?: MessageProgressEventDTO[];
  done?: boolean;
  isError?: boolean;
  streamBuffer?: string;
  metadata?: Record<string, unknown>;
}

export interface MessageProgressEventDTO {
  type: string;
  content?: string;
  metadata?: Record<string, any> | null;
  pipeline_type?: string | null;
  timestamp: number;
}