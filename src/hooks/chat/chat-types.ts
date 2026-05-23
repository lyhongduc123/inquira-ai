export interface ChatStreamState {
  isStreaming: boolean;
  isReading: boolean;
  isError: boolean;
  lastFailedQuery: string | null;
  lastClientMessageId: string | null;
}
