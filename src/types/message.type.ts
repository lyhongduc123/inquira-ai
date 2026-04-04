import { PaperMetadata } from "./paper.type";
import { ScopedCitationRef } from "@/lib/scoped-citation-utils";

/**
 * Message Types for Chat Interface
 */

export interface ProgressEvent {
  type: string;
  content?: string; // Optional: only for reasoning events
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface Message {
  id?: number;
  role: "user" | "assistant";
  text: string;
  paperSnapshots?: PaperMetadata[];
  scopedQuoteRefs?: ScopedCitationRef[];
  progressEvents?: ProgressEvent[];
  done?: boolean;
  isError?: boolean;
  streamBuffer?: string;
  metadata?: Record<string, unknown>;
}