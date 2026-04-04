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
import { cn } from "@/lib/utils";

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

  const handleCopy = (format: string, citation: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedFormat(format);
  };

  if (!citationStyles) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogContent>
            <DialogTitle className="text-lg font-semibold">
              Citation Formats
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
        <DialogContent className="min-w-lg">
          <DialogTitle className="text-lg font-semibold">
            Citation Formats
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
                    onClick={() => handleCopy(style, citation as string)}
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
                    className={cn(style === "bibtex" ? "whitespace-pre-wrap" : "", "pr-12")}
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
