"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  User as UserIcon,
  Settings,
  Bookmark,
  ChevronsUpDown,
  Moon,
  Sun,
  Monitor,
  CheckIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { TypographyP } from "@/components/global/typography";
import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { UserSettingsDialog } from "./user-settings-dialog";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function SidebarUserMenu() {
  const { user, logout } = useAuthStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton size="lg" className="transition-colors">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={user.avatarUrl || undefined}
                alt={user.name || user.email || "User"}
              />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <VStack className="gap-0 leading-none flex-1 text-left">
              <TypographyP size="sm" weight="medium" leading="none">
                {user.name}
              </TypographyP>
              <TypographyP variant="muted" size="xs" leading="none">
                {user.email}
              </TypographyP>
            </VStack>
            <ChevronsUpDown className="ml-auto h-4 w-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56"
          align="end"
          side="top"
          sideOffset={4}
        >
          <DropdownMenuLabel className="font-normal">
            <VStack className="space-y-1 gap-1">
              <TypographyP size="sm" weight="medium" leading="none">
                {user.name}
              </TypographyP>
              <TypographyP variant="muted" size="xs" leading="none">
                {user.email}
              </TypographyP>
            </VStack>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem disabled>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem> */}
          {/* <DropdownMenuItem onClick={handleBookmarks}>
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Bookmarks</span>
          </DropdownMenuItem> */}
          <DropdownMenuItem
            className="focus:bg-accent/10 focus:text-primary dark:focus:text-accent-foreground"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="focus:bg-accent/10 data-[state=open]:bg-accent/10 data-[state=open]:text-primary focus:text-primary dark:focus:text-accent-foreground">
              <Monitor className="mr-2 h-4 w-4" />
              Mode
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem className="focus:bg-accent/10 focus:text-primary dark:focus:text-accent-foreground" onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
                {theme === "light" && <span className="ml-auto">
                  <CheckIcon className="h-4 w-4" />
                </span>}
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-accent/10 focus:text-primary dark:focus:text-accent-foreground" onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
                {theme === "dark" && <span className="ml-auto">
                  <CheckIcon className="h-4 w-4" />
                </span>}
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-accent/10 focus:text-primary dark:focus:text-accent-foreground" onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                <span>System</span>
                {theme === "system" && <span className="ml-auto">
                  <CheckIcon className="h-4 w-4" />
                </span>}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} variant="destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UserSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
