import { CoAuthor } from "@/types/author.type";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VStack } from "@/components/layout/vstack";
import { TypographyP } from "@/components/global/typography";
import { AuthorItem, AuthorItemSkeleton } from "./AuthorItem";

interface CoAuthorsListProps {
  coAuthors?: CoAuthor[];
  isLoading?: boolean;
}

export function CoAuthorsTabs({ coAuthors, isLoading }: CoAuthorsListProps) {
  if (isLoading) {
    return <CoAuthorsTabsSkeleton />;
  }

  if (!coAuthors || coAuthors.length === 0) {
    return (
      <Card className="border-0 bg-background">
        <CardHeader>
          <CardTitle>Co-Authors</CardTitle>
        </CardHeader>
        <CardContent>
          <TypographyP className="text-center text-muted-foreground">
            No co-authors found for this author.
          </TypographyP>
        </CardContent>
      </Card>
    )
  }
  return (
    <VStack className="gap-4">
      {coAuthors.map((author) => (
        <AuthorItem key={author.authorId} author={author} />
      ))}
    </VStack>
  );
}

export function CoAuthorsTabsSkeleton() {
  return (
    <VStack className="gap-4">
      {[1, 2, 3].map((idx) => (
        <AuthorItemSkeleton key={idx} />
      ))}
    </VStack>
  )
}