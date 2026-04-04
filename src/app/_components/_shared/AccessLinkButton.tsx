import { HStack } from "@/components/layout/hstack";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink, LockKeyhole, LockKeyholeOpen } from "lucide-react";

interface AccessLinkButtonProps {
  pdfUrl?: string;
  url?: string;
  doi?: string;
  isOpenAccess?: boolean;
  isIcon?: boolean;
}

export const AccessLinkButton = ({
  pdfUrl,
  url,
  doi,
  isOpenAccess,
  isIcon,
}: AccessLinkButtonProps) => {
  let link: string | undefined;
  let label = "";
  let icon: React.ReactNode = <ExternalLink size={16} />;
  let className = "";

  if (pdfUrl) {
    link = pdfUrl;
    label = "PDF";
    icon = <LockKeyholeOpen className="size-4" />;
    className =
      "rounded-full px-2 py-1 bg-primary text-primary-foreground border border-primary/50";
  } else if (isOpenAccess && (doi || url)) {
    link = doi ? `https://doi.org/${doi}` : url;
    label = "Open Access";
    icon = <LockKeyholeOpen className="size-4" />;
    className =
      "rounded-full px-2 py-1 bg-primary text-primary-foreground border border-primary/50";
  } else if (doi || url) {
    link = doi ? `https://doi.org/${doi}` : url;
    label = "PDF";
    icon = <LockKeyhole className="size-4" />;
    className =
      "rounded-full px-2 py-1 bg-destructive text-destructive-foreground border border-destructive/50";
  }

  if (!link) return null;

  if (isIcon) {
    return (
      <HStack
        className={cn(
          "items-center gap-1 text-xs",
          className,
        )}
      >
        {icon}
        {label}
      </HStack>
    );
  }

  return (
    <Button asChild size="sm">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="items-center"
      >
        {icon}
        {label}
      </a>
    </Button>
  );
};
