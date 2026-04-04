import { ChatPageClient } from "@/app/_components/ChatPageClient";

interface ChatPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const launch =
    typeof resolvedSearchParams?.launch === "string"
      ? resolvedSearchParams.launch
      : undefined;

  return <ChatPageClient launchKeyFromQuery={launch} />;
}
