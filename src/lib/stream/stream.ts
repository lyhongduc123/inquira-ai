import { StreamEvent, ProgressEvent, MetadataEvent, ChunkEvent, ConversationEvent } from "./event.types";

export interface StreamCallbacks {
  onChunk?: (chunk: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
  onMetadata?: (event: MetadataEvent) => void;
  onProgress?: (event: ProgressEvent) => void;
  onHeartbeat?: () => void;
  onConversation?: (event: ConversationEvent) => void;
  onUnknownEvent?: (eventType: string, data: unknown) => void;
}

export interface StreamOptions {
  heartbeatTimeout?: number;
  signal?: AbortSignal;
}

export interface StreamEventPayload {
  query: string;
  conversationId?: string;
  messageId?: string;
  filters?: Record<string, unknown>;
  model?: string;
  isRetry?: boolean;
  clientMessageId?: string;
  pipeline?: "research" | "agent";
  useHybridPipeline?: boolean; // Deprecated: kept for backward compatibility
}

function isAbortError(error: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) {
    return true;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  if (error instanceof Error) {
    return error.name === "AbortError";
  }

  return false;
}

export async function streamTask(
  url: string,
  callbacks: StreamCallbacks,
  options: StreamOptions = {},
) {
  const { heartbeatTimeout = 0, signal } = options;

  // Heartbeat tracking
  let heartbeatTimer: NodeJS.Timeout | null = null;
  let lastActivity = Date.now();

  const resetHeartbeat = () => {
    lastActivity = Date.now();
    if (heartbeatTimer) {
      clearTimeout(heartbeatTimer);
    }

    if (heartbeatTimeout > 0) {
      heartbeatTimer = setTimeout(() => {
        const elapsed = Date.now() - lastActivity;
        if (elapsed >= heartbeatTimeout) {
          const err = new Error(
            `Stream heartbeat timeout: No data received for ${heartbeatTimeout / 1000}s`,
          );
          callbacks.onError?.(err);
          reader?.cancel();
        }
      }, heartbeatTimeout);
    }
  };

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    signal,
  });

  if (!res.ok) {
    const errorText = await res.text();
    const err = new Error(`HTTP ${res.status}: ${errorText}`);
    callbacks.onError?.(err);
    throw err;
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  const dispatch = (eventType: string, rawData: string) => {
    resetHeartbeat();

    let parsedData: any;
    try {
      parsedData = JSON.parse(rawData);
    } catch {
      parsedData = rawData;
    }

    switch (eventType as StreamEvent | "token" | "step" | "reasoning") {
      case StreamEvent.Metadata:
      case "metadata":
        if (typeof parsedData === "object" && parsedData !== null) {
          callbacks.onMetadata?.(parsedData as MetadataEvent);
        }
        break;
      case StreamEvent.Progress:
      case StreamEvent.Step:
      case "step":
      case "progress":
        if (typeof parsedData === "object" && parsedData !== null) {
          callbacks.onProgress?.(parsedData as ProgressEvent);
        }
        break;
      case StreamEvent.Chunk:
      case "chunk":
      case "token":
        let chunk = "";
        if (typeof parsedData === "object" && parsedData !== null && "content" in parsedData) {
          chunk = String(parsedData.content);
        } else if (typeof parsedData === "string") {
          chunk = parsedData;
        }
        callbacks.onChunk?.(chunk);
        break;
      case StreamEvent.Reasoning:
      case "reasoning":
        callbacks.onUnknownEvent?.(eventType, parsedData);
        break;
      case StreamEvent.Heartbeat:
      case "heartbeat":
      case "ping":
        callbacks.onHeartbeat?.();
        break;
      case StreamEvent.Conversation:
      case "conversation":
        if (typeof parsedData === "object" && parsedData !== null) {
          const convData = parsedData.content || parsedData;
          callbacks.onConversation?.(convData as ConversationEvent);
        }
        break;
      case StreamEvent.Done:
      case "done":
        callbacks.onDone?.();
        break;
      case StreamEvent.Error:
      case "error":
        if (typeof parsedData === "object" && parsedData !== null && "message" in parsedData) {
          callbacks.onError?.(new Error(String(parsedData.message)));
        } else {
          callbacks.onError?.(new Error("An unknown error occurred"));
        }
        break;
      default:
        callbacks.onUnknownEvent?.(eventType, parsedData);
        break;
    }
  };

  const processSSEMessage = (msg: string) => {
    const lines = msg.split("\n");
    const dataLines: string[] = [];
    let eventType = "chunk";

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        let content = line.slice(5);
        if (content.startsWith(" ")) {
          content = content.slice(1);
        }
        dataLines.push(content);
      }
    }

    const data = dataLines.join("");

    if (data || (eventType !== "chunk" && eventType !== "token")) {
      dispatch(eventType, data);
    }
  };

  try {
    resetHeartbeat();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      resetHeartbeat();

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const msg = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        processSSEMessage(msg);
      }
    }
    if (buffer.trim()) {
      processSSEMessage(buffer);
    }
  } catch (err) {
    if (isAbortError(err, signal)) return;
    callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
  } finally {
    if (heartbeatTimer) clearTimeout(heartbeatTimer);
    reader.releaseLock();
  }
}

export async function streamEvent(
  url: string,
  payload: StreamEventPayload,
  callbacks: StreamCallbacks,
  options: StreamOptions = {},
) {
  const { heartbeatTimeout = 0, signal } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Heartbeat tracking
  let heartbeatTimer: NodeJS.Timeout | null = null;
  let lastActivity = Date.now();

  const resetHeartbeat = () => {
    lastActivity = Date.now();
    if (heartbeatTimer) {
      clearTimeout(heartbeatTimer);
    }

    if (heartbeatTimeout > 0) {
      heartbeatTimer = setTimeout(() => {
        const elapsed = Date.now() - lastActivity;
        if (elapsed >= heartbeatTimeout) {
          const err = new Error(
            `Stream heartbeat timeout: No data received for ${heartbeatTimeout / 1000}s`,
          );
          callbacks.onError?.(err);
          reader?.cancel();
        }
      }, heartbeatTimeout);
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    credentials: "include",
    signal,
  });

  if (!res.ok) {
    const errorText = await res.text();
    const err = new Error(`HTTP ${res.status}: ${errorText}`);
    callbacks.onError?.(err);
    throw err;
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  const dispatch = (eventType: string, rawData: string) => {
    resetHeartbeat();

    let parsedData: any;
    try {
      parsedData = JSON.parse(rawData);
    } catch {
      parsedData = rawData;
    }

    switch (eventType as StreamEvent | "token" | "step" | "reasoning") {
      case StreamEvent.Metadata:
      case "metadata":
        if (typeof parsedData === "object" && parsedData !== null) {
          callbacks.onMetadata?.(parsedData as MetadataEvent);
        }
        break;
      case StreamEvent.Progress:
      case StreamEvent.Step:
      case "step":
      case "progress":
        if (typeof parsedData === "object" && parsedData !== null) {
          callbacks.onProgress?.(parsedData as ProgressEvent);
        }
        break;
      case StreamEvent.Chunk:
      case "chunk":
      case "token":
        let chunk = "";
        if (typeof parsedData === "object" && parsedData !== null && "content" in parsedData) {
          chunk = String(parsedData.content);
        } else if (typeof parsedData === "string") {
          chunk = parsedData;
        }
        callbacks.onChunk?.(chunk);
        break;
      case StreamEvent.Reasoning:
      case "reasoning":
        callbacks.onUnknownEvent?.(eventType, parsedData);
        break;
      case StreamEvent.Heartbeat:
      case "heartbeat":
      case "ping":
        callbacks.onHeartbeat?.();
        break;
      case StreamEvent.Conversation:
      case "conversation":
        if (typeof parsedData === "object" && parsedData !== null) {
          const convData = parsedData.content || parsedData;
          callbacks.onConversation?.(convData as ConversationEvent);
        }
        break;
      case StreamEvent.Done:
      case "done":
        callbacks.onDone?.();
        break;
      case StreamEvent.Error:
      case "error":
        if (typeof parsedData === "object" && parsedData !== null && "message" in parsedData) {
          callbacks.onError?.(new Error(String(parsedData.message)));
        } else {
          callbacks.onError?.(new Error("An unknown error occurred"));
        }
        break;
      default:
        callbacks.onUnknownEvent?.(eventType, parsedData);
        break;
    }
  };

  const processSSEMessage = (msg: string) => {
    const lines = msg.split("\n");
    const dataLines: string[] = [];
    let eventType = "chunk";

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        let content = line.slice(5);
        if (content.startsWith(" ")) {
          content = content.slice(1);
        }
        dataLines.push(content);
      }
    }

    const data = dataLines.join("");

    if (data || (eventType !== "chunk" && eventType !== "token")) {
      dispatch(eventType, data);
    }
  };

  try {
    resetHeartbeat();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      resetHeartbeat();

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const msg = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        processSSEMessage(msg);
      }
    }
    if (buffer.trim()) {
      processSSEMessage(buffer);
    }
  } catch (err) {
    if (isAbortError(err, signal)) return;
    callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
  } finally {
    if (heartbeatTimer) clearTimeout(heartbeatTimer);
    reader.releaseLock();
  }
}
