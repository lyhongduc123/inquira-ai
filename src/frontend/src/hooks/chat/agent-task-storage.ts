export const ACTIVE_AGENT_TASK_KEY = "exegent_active_agent_task";

export interface StoredAgentTask {
  taskId: string;
  conversationId: string;
  query: string;
  clientMessageId: string;
  createdAt: number;
}

export function readStoredAgentTask(): StoredAgentTask | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_AGENT_TASK_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredAgentTask>;
    if (
      typeof parsed.taskId !== "string" ||
      typeof parsed.conversationId !== "string" ||
      typeof parsed.query !== "string" ||
      typeof parsed.clientMessageId !== "string"
    ) {
      return null;
    }

    return {
      taskId: parsed.taskId,
      conversationId: parsed.conversationId,
      query: parsed.query,
      clientMessageId: parsed.clientMessageId,
      createdAt:
        typeof parsed.createdAt === "number" ? parsed.createdAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function storeAgentTask(task: StoredAgentTask) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACTIVE_AGENT_TASK_KEY, JSON.stringify(task));
}

export function clearStoredAgentTask(taskId?: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (taskId) {
    const current = readStoredAgentTask();
    if (current?.taskId && current.taskId !== taskId) {
      return;
    }
  }

  window.localStorage.removeItem(ACTIVE_AGENT_TASK_KEY);
}
