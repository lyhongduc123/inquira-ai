import { InfoItem } from "@/app/_components/_shared/InfoItem";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { C_BULLET } from "@/core";
import { CoAuthor } from "@/types/author.type";
import Link from "next/link";
import pluralize from "pluralize";

interface AuthorCardProps {
  author: CoAuthor;
}

export function AuthorItem({ author }: AuthorCardProps) {
  console.log("Rendering AuthorItem for:", author);
  return (
    <Item
      asChild
      variant={"outline"}
      className="border-2 hover:border-primary/40 hover:shadow-md transition-all group w-full"
    >
      <Link href={`/authors/${author.authorId}`} className="block">
        <ItemMedia>
          <Avatar className="ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
            <AvatarFallback className="text-base font-semibold bg-linear-to-br from-blue-500 to-yellow-600 text-white">
              {author.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="group-hover:text-secondary transition-colors">
            {author.name}
          </ItemTitle>
          <ItemDescription className="flex gap-1 text-card-foreground">
              <InfoItem
                number={author.totalCitations}
                label={pluralize("citation", author.totalCitations || 0)}
              />
              {C_BULLET}
              <InfoItem
                number={author.hIndex || 0}
                label="h-index"
              />
          </ItemDescription>
        </ItemContent>
      </Link>
    </Item>
  );
}

export function AuthorItemSkeleton() {
  return (
    <Item variant={"outline"} className="border-2 animate-pulse group w-full">
      <ItemMedia>
        <Skeleton className="size-10 shrink-0 rounded-full" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          <Skeleton className="h-4 w-1/2 rounded-md" />
        </ItemTitle>
        <ItemDescription className="flex gap-3">
          <Skeleton className="h-3 w-3/4 rounded-md" />
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}