"use client";

import { BookmarkIcon, MessageSquarePlus, SearchIcon } from "lucide-react";
import { useEffect, useEffectEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { conversationsApi } from "@/lib/api/conversations-api";
import { ConversationCard, ConversationCardSkeleton } from "./ConversationCard";
import { useConversationStore } from "@/store/conversation-store";
import { useAuthStore } from "@/store/auth-store";
import { Brand } from "@/components/global/brand";
import { SidebarUserMenu } from "@/components/auth/sidebar-user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarManagerTrigger,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Box } from "@/components/layout/box";
import { useConversations } from "@/hooks/use-conversations";
import { VStack } from "@/components/layout/vstack";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useConversation } from "@/hooks/use-conversation";
import { TypographyP } from "@/components/global/typography";
import { Kbd } from "@/components/ui/kbd";
import { HStack } from "@/components/layout/hstack";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OpacityShimmer } from "@/components/ui/opacity-shimmer";

export function LeftSidebar() {
  const router = useRouter();
  const { open: isOpen } = useSidebar();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);

  const {
    currentConversationId,
    deleteConversation: deleteConversationAction,
  } = useConversation();

  const newConversationId = useConversationStore(
    (state) => state.newConversationId,
  );
  const setNewConversationId = useConversationStore(
    (state) => state.setNewConversationId,
  );
  const pendingConversationDraft = useConversationStore(
    (state) => state.pendingConversationDraft,
  );

  const {
    conversations,
    isLoading,
    addConversationOptimistically,
    deleteConversation,
    refetch,
  } = useConversations({
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (newConversationId) {
      const fetchNewConversation = async () => {
        try {
          const conversationDetail =
            await conversationsApi.get(newConversationId);

          addConversationOptimistically(conversationDetail);
        } catch (error) {
          console.error("Failed to fetch new conversation:", error);
          await refetch();
        } finally {
          setTimeout(() => setNewConversationId(null), 500);
        }
      };
      fetchNewConversation();
    }
  }, [
    newConversationId,
    setNewConversationId,
    addConversationOptimistically,
    refetch,
  ]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onShortcut(e);

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const onShortcut = useEffectEvent((e: KeyboardEvent) => {
    if (e.altKey && e.key.toLowerCase() === "n") {
      // console.log("New conversation shortcut triggered");
      e.preventDefault();
      handleNewConversation();
    }
    if (e.altKey && e.key.toLowerCase() === "b") {
      // console.log("Bookmarks shortcut triggered");
      e.preventDefault();
      router.push("/bookmarks");
    }
  });

  const handleNewConversation = () => {
    router.push("/");
  };

  const handleSelectConversation = async (conversationId: string) => {
    router.push(`/conversation/${conversationId}`);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await new Promise<void>((resolve, reject) => {
        deleteConversation(conversationId, {
          onSuccess: async () => {
            toast.success("Conversation deleted successfully");

            if (conversationId === currentConversationId) {
              await deleteConversationAction(conversationId);
            }

            handleNewConversation();
            resolve();
          },
          onError: (error) => {
            console.error("Delete conversation error:", error);
            toast.error("Failed to delete conversation. Please try again.");
            reject(error);
          },
        });
      });
    } catch (error) {
      throw error;
    }
  };

  return (
    <Sidebar collapsible="icon" side="left">
      {(isAuthenticated || isAuthLoading) && (
        <SidebarManagerTrigger
          name="left"
          variant={"default"}
          className={cn(
            "absolute top-3 -right-4 z-10 rounded-full p-1 ",
            !isOpen ? "-right-10" : "-right-4",
          )}
        ></SidebarManagerTrigger>
      )}
      <SidebarHeader className="py-4">
        <Brand showText={isOpen} />
        <SidebarMenu>
          <NewChatButton isOpen={isOpen} onClick={handleNewConversation} />
          <BookmarkButton
            isOpen={isOpen}
            onClick={() => {
              router.push("/bookmarks");
            }}
          />
        </SidebarMenu>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        {isOpen && (
          <SidebarGroup className="w-full min-w-0 gap-1">
            <HStack>
              <SidebarGroupLabel className="select-none">
                Your conversations
              </SidebarGroupLabel>
              <Button
                asChild
                variant="icon"
                size="icon"
                className="has-[>svg]:p-0 p-0"
              >
                <Link href="/conversations" className="ml-auto">
                  <SearchIcon className="size-4" />
                </Link>
              </Button>
            </HStack>
            {isAuthLoading || isLoading ? (
              <OpacityShimmer className="py-4 text-center text-sm">
                Loading conversations...
              </OpacityShimmer>
            ) : !isAuthenticated ? (
              <Box className="py-4 px-2">
                <VStack className="w-full gap-2">
                  <TypographyP>
                    You are currently in read-only mode.
                  </TypographyP>
                  <TypographyP className="text-sm text-muted-foreground">
                    Sign in to start your own session for researching papers,
                    asking questions, and more.
                  </TypographyP>
                </VStack>
              </Box>
            ) : conversations.length === 0 && !pendingConversationDraft ? (
              <Box className="py-4 text-center text-sm text-muted-foreground">
                No conversations yet
              </Box>
            ) : (
              <AnimatePresence mode="popLayout">
                {pendingConversationDraft && (
                  <motion.div
                    key={pendingConversationDraft.id}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <ConversationCardSkeleton />
                  </motion.div>
                )}
                {conversations.map((conversation) => {
                  const isNew = conversation.id === newConversationId;
                  return (
                    <motion.div
                      key={conversation.id}
                      layout
                      initial={
                        isNew ? { opacity: 0, y: -20, scale: 0.95 } : false
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -20, scale: 0.95 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      <ConversationCard
                        key={conversation.id}
                        currentConversationId={currentConversationId || ""}
                        conversation={conversation}
                        onClick={() =>
                          handleSelectConversation(conversation.id)
                        }
                        onDelete={handleDeleteConversation}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        {isAuthLoading ? (
          <SidebarUserMenuSkeleton />
        ) : isAuthenticated ? (
          <SidebarUserMenu />
        ) : (
          <VStack className="w-full gap-2">
            <Link href="/signup" className="w-full">
              <SidebarMenuButton className="bg-primary text-primary-foreground items-center justify-center cursor-pointer">
                Sign Up
              </SidebarMenuButton>
            </Link>
            <Link href="/login">
              <SidebarMenuButton
                variant={"outline"}
                className="bg-inherit items-center justify-center cursor-pointer border border-primary"
              >
                Sign In
              </SidebarMenuButton>
            </Link>
          </VStack>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

const NewChatButton = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <SidebarMenuButton
      onClick={onClick}
      tooltip={!isOpen ? "New Chat" : undefined}
      className={cn("w-full truncate")}
    >
      <MessageSquarePlus />
      {isOpen && <span>New Chat</span>}
      {isOpen && <Kbd className="ml-auto">Alt + N</Kbd>}
    </SidebarMenuButton>
  );
};

const BookmarkButton = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <SidebarMenuButton
      onClick={onClick}
      tooltip={!isOpen ? "Bookmarks" : undefined}
      className={cn("w-full truncate")}
    >
      <BookmarkIcon />
      {isOpen && <span>Bookmarks</span>}
      {isOpen && <Kbd className="ml-auto">Alt + B</Kbd>}
    </SidebarMenuButton>
  );
};

const SidebarUserMenuSkeleton = () => (
  <div className="flex items-center gap-2 px-2 py-1">
    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      <Skeleton className="h-3.5 w-24 rounded" />
      <Skeleton className="h-3 w-32 rounded" />
    </div>
  </div>
);
