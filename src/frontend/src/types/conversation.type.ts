import { PaperMetadata } from "./paper.type";
import { ScopedCitationRef } from "@/lib/scoped-citation-utils";
import { ProgressEvent } from "@/lib/stream/event.types";

/**
 * Conversation Types - Aligned with Backend Schemas
 * Backend: app/conversations/schemas.py
 */

export interface ConversationCreateDTO {
  title?: string | null;
  conversationType?: string;
  primaryPaperId?: string | null;
}

export interface ConversationUpdateDTO {
  title?: string | null;
  isArchived?: boolean | null;
}

export interface MessageDTO {
  id: number;
  role: string;
  content: string;
  sources?: PaperMetadata[] | null;
  paperSnapshots?: PaperMetadata[] | null;
  progressEvents?: Array<{
    type: string;
    content?: string;
    metadata?: Record<string, any> | null;
    pipeline_type?: string | null;
    timestamp: number;
  }> | null;
  scopedQuoteRefs?: ScopedCitationRef[] | null;
  createdAt: string;
}

export interface ConversationDTO {
  id: string;
  title?: string | null;
  lastUpdated?: string;
  messageCount: number;
  isArchived: boolean;
  conversationType: string;
  primaryPaperId?: string | null;
  messages: MessageDTO[];
}

export interface ConversationListResponseDTO {
  items: ConversationDTO[];
  total: number;
  page: number;
  page_size: number;
}

export interface ConversationDeleteDTO {
  message: string;
}
