import { Message } from "@/types/message.type";
import { useConversationStore } from "@/store/conversation-store";

type SetMessages = (messages: Message[]) => void;

export function appendUserMessage(
  query: string,
  queryId: string,
  messageId: string,
  setMessages: SetMessages,
) {
  const currentMessages = useConversationStore.getState().messages;
  setMessages([
    ...currentMessages,
    {
      role: "user",
      text: query,
      metadata: { query_id: queryId, client_message_id: messageId },
    } as Message,
  ]);
}

export function appendAssistantMessage(setMessages: SetMessages) {
  const currentMessages = useConversationStore.getState().messages;
  setMessages([
    ...currentMessages,
    { role: "assistant", text: "" } as Message,
  ]);
}

export function updateActiveAssistantMessage(
  activeConversationId: string | null,
  updates: Partial<Message>,
  setMessages: SetMessages,
) {
  const currentConvId = useConversationStore.getState().currentConversationId;
  if (currentConvId !== activeConversationId) {
    return;
  }

  const currentMessages = useConversationStore.getState().messages;
  const last = currentMessages[currentMessages.length - 1];
  if (!last) {
    return;
  }

  setMessages([...currentMessages.slice(0, -1), { ...last, ...updates }]);
}

export function ensureAssistantPlaceholder(
  messagesWithUser: Message[],
  setMessages: SetMessages,
) {
  const lastMessageWithUser = messagesWithUser[messagesWithUser.length - 1];

  if (!lastMessageWithUser || lastMessageWithUser.role !== "assistant") {
    setMessages([
      ...messagesWithUser,
      { role: "assistant", text: "" } as Message,
    ]);
    return;
  }

  setMessages([
    ...messagesWithUser.slice(0, -1),
    { ...lastMessageWithUser, text: "", done: false, isError: false },
  ]);
}
