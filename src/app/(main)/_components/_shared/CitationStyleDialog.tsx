import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { TypographyP } from "@/components/global/typography";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box } from "@/components/layout/box";
import { CheckIcon, CopyIcon } from "lucide-react";
import { cn, copyTextWithEvent } from "@/lib/utils";
import { toast } from "sonner";

export const CitationStyleDialog = ({
  citationStyles,
  open,
  onOpenChange,
}: {
  citationStyles?: Record<string, string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handleCopy = async (format: string, citation: string) => {
    try {
      // Switch to this instead of navigator.clipboard.writeText take 5s for?
      copyTextWithEvent(citation);
      setCopiedFormat(format);
      toast.success("Copied citation");

      setTimeout(() => {
        setCopiedFormat(null);
      }, 1500);
    } catch (fallbackError) {
      try {
        await navigator.clipboard.writeText(citation);
        setCopiedFormat(format);
        toast.success("Copied citation");

        setTimeout(() => {
          setCopiedFormat(null);
        }, 1500);
      } catch (clipboardError) {
        toast.error("Failed to copy citation");
        console.error({ fallbackError, clipboardError });
      }
    }
  };

  if (!citationStyles) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogContent>
            <DialogTitle className="text-md font-semibold">
              Citation formats
            </DialogTitle>
            <TypographyP size="sm" className="whitespace-pre-wrap">
              No citation formats available for this paper.
            </TypographyP>
            <DialogFooter>
              <DialogClose asChild>
                <Button size="sm">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="min-w-lg w-3xl">
          <DialogTitle className="text-md font-semibold">
            Citation formats
          </DialogTitle>
          <Tabs
            defaultValue={Object.keys(citationStyles)[0]}
            className="w-full"
          >
            <TabsList variant={"line"}>
              {Object.keys(citationStyles).map((style) => (
                <TabsTrigger key={style} value={style}>
                  {style.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(citationStyles).map(([style, citation]) => (
              <TabsContent key={style} value={style} className="pt-4">
                <Box className="bg-muted rounded border p-4 min-h-[250px] relative">
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-4 right-4"
                    onClick={(e) => handleCopy(style, citation as string)}
                  >
                    {copiedFormat === style ? (
                      <>
                        <CheckIcon size={14} />
                      </>
                    ) : (
                      <>
                        <CopyIcon size={14} />
                      </>
                    )}
                  </Button>
                  <TypographyP
                    size="sm"
                    className={cn(
                      style === "bibtex" ? "whitespace-pre-wrap" : "",
                      "pr-12",
                    )}
                  >
                    {citation}
                  </TypographyP>
                </Box>
              </TabsContent>
            ))}
          </Tabs>

          <DialogFooter>
            <DialogClose asChild>
              <Button size="sm">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
