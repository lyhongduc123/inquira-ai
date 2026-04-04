import { ChatPageClient } from "@/app/_components/ChatPageClient";

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;

  return <ChatPageClient routeConversationId={conversationId} />;
}
