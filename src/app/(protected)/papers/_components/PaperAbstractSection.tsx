import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyP } from "@/components/global/typography";
import { VStack } from "@/components/layout/vstack";
import { Skeleton } from "@/components/ui/skeleton";

interface PaperAbstractSectionProps {
  abstract?: string;
}

export function PaperAbstractSection({ abstract }: PaperAbstractSectionProps) {
  if (!abstract) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Abstract</CardTitle>
      </CardHeader>
      <CardContent>
        <TypographyP size="sm" leading="relaxed">
          {abstract}
        </TypographyP>
      </CardContent>
    </Card>
  );
}

export function PaperAbstractSectionSkeleton() {
  return (
    <Card>
      <CardContent>
        <VStack className="w-full gap-2">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </VStack>
      </CardContent>
    </Card>
  );
}
