"use client";

import { VStack } from "@/components/layout/vstack";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyP } from "@/components/global/typography";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReferencedPaper } from "@/types/paper.type";
import { PaperCard } from "./PaperCard";

interface PaperReferenceViewProps {
  references: ReferencedPaper[];
  isLoading?: boolean;
}

export function PaperReferenceView({
  references,
  isLoading = false,
}: PaperReferenceViewProps) {
  return (
    <VStack className="gap-6">
      {/* Papers that cite this paper */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Papers Referenced ({references.length})</CardTitle>
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
          ) : references.length === 0 ? (
            <TypographyP className="text-muted-foreground">
              No references found for this paper.
            </TypographyP>
          ) : (
            <VStack className="gap-4">
              {references.map((reference, idx) => (
                <PaperCard key={idx} paper={reference.citedPaper!} idx={idx} />
              ))}
            </VStack>
          )}
        </CardContent>
      </Card>
    </VStack>
  );
}
