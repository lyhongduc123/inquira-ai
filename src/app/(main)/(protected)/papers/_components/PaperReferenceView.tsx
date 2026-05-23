"use client";

import { VStack } from "@/components/layout/vstack";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyP } from "@/components/global/typography";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReferencedPaper } from "@/types/paper.type";
import { PaperCard } from "./PaperCard";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { OpacityShimmer } from "@/components/ui/opacity-shimmer";

interface PaperReferenceViewProps {
  references: ReferencedPaper[];
  isLoading?: boolean;
  canLoadMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function PaperReferenceView({
  references,
  isLoading = false,
  canLoadMore = false,
  onLoadMore,
  isLoadingMore = false,
}: PaperReferenceViewProps) {
  return (
    <VStack className="gap-6">
      {/* Papers that cite this paper */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Referenced papers ({references.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <VStack className="gap-4">
              {/* {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))} */}
              <Spinner />
              <OpacityShimmer>
                Loading references...
              </OpacityShimmer>
            </VStack>
          ) : references.length === 0 ? (
            <TypographyP className="text-muted-foreground">
              No references found indexed for this paper.
            </TypographyP>
          ) : (
            <VStack className="gap-4">
              {references.map((reference, idx) => (
                <PaperCard key={idx} paper={reference.citedPaper!} idx={idx} />
              ))}
              {canLoadMore && (
                <Button
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="w-full"
                >
                  {isLoadingMore ? "Loading..." : "Load more"}
                </Button>
              )}
            </VStack>
          )}
        </CardContent>
      </Card>
    </VStack>
  );
}
