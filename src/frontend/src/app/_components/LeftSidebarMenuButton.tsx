import { SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function LeftSidebarMenuButton({
  isOpen,
  onClick,
  text,
  children,
  variant,
  className,
  ...props
}: {
  isOpen: boolean;
  onClick: () => void;
  text?: string;
  variant?: "outline" | "default";
  className?: string;
  children?: React.ReactNode;
} & React.ComponentProps<typeof SidebarMenuButton>) {
  return (
    <SidebarMenuButton
      onClick={onClick}
      tooltip={!isOpen ? text : undefined}
      variant={variant}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
      {isOpen && <span>{text}</span>}
    </SidebarMenuButton>
  );
}
