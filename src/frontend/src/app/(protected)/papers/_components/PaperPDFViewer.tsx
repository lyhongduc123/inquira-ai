"use client";

import { FileTextIcon } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import 'react-pdf/dist/Page/TextLayer.css';

import { VStack } from "@/components/layout/vstack";
import { Box } from "@/components/layout/box";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TypographyP } from "@/components/global/typography";
import { useCallback, useEffect, useRef, useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
  wasmUrl: '/wasm/',
};

interface PaperPDFViewerProps {
  pdfUrl?: string;
}

export function PaperPDFViewer({ pdfUrl }: PaperPDFViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>();
  
  useEffect(() => {
  if (!containerRef.current) return
  setContainerWidth(containerRef.current.clientWidth)
}, [])

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;
    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  function onLoadSuccess({ numPages }: PDFDocumentProxy) {
    setNumPages(numPages);
  }

  if (!pdfUrl) {
    return (
      <VStack className="h-full items-center justify-center p-6 text-center gap-4">
        <FileTextIcon className="size-12 text-muted-foreground" />
        <TypographyP size="sm" variant="muted">
          PDF preview not available for this paper
        </TypographyP>
      </VStack>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4 pr-6" ref={containerRef}>
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          className="border-0"
          title="PDF Viewer"
        />
      </div>
    </ScrollArea>
  );
}
