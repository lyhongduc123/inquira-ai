"use client";

import { VStack } from "@/components/layout/vstack";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyP } from "@/components/global/typography";
import type { PaperDetail, CitingPaper } from "@/types/paper.type";
import { Skeleton } from "@/components/ui/skeleton";
import { PaperCard } from "./PaperCard";

interface PaperCitationsViewProps {
  paper: PaperDetail;
  citations: CitingPaper[];
  isLoading?: boolean;
}

export function PaperCitationsView({
  paper,
  citations,
  isLoading = false,
}: PaperCitationsViewProps) {
  return (
    <VStack className="gap-6">
      {/* Papers that cite this paper */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>PAPER CITING THIS WORK</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <VStack className="gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </VStack>
          ) : citations.length === 0 ? (
            <TypographyP className="text-muted-foreground">
              No citations found for this paper.
            </TypographyP>
          ) : (
            <VStack className="gap-4">
              {citations.map((citation, idx) => (
                <PaperCard key={idx} paper={citation.citingPaper!} idx={idx} />
              ))}
            </VStack>
          )}
        </CardContent>
      </Card>
    </VStack>
  );
}
