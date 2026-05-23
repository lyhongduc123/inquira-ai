import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface ShareConversationButtonProps {
  url?: string;
}

export function ShareConversationButton({ url }: ShareConversationButtonProps) {
  const handleOnClick = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    toast.info("Copied to clipboard!", {
      position: "top-center",
    });
  };

  return (
    <Button variant={"outline"} size="icon" onClick={handleOnClick}>
      <LinkIcon className="size-4" />
    </Button>
  );
}
