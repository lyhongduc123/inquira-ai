"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TypographyH3, TypographyP } from "@/components/global/typography";
import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import type { PaperMetadata } from "@/types/paper.type";
import { Box } from "@/components/layout/box";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  BookOpenIcon,
  ChevronRight,
  InfoIcon,
  MessageSquarePlusIcon,
} from "lucide-react";
import { InfoItem } from "./_shared/InfoItem";
import { C_BULLET } from "@/core";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { AuthorMetadataDTO, CoAuthorDTO } from "@/types/author.type";
import { ActionButtonGroup } from "./_shared/ActionButtonGroup";
import { Badge } from "@/components/ui/badge";
import QuartileBadge from "./_shared/QuartileBadge";
import { Separator } from "@/components/ui/separator";
import { AuthorItem } from "../(protected)/authors/_components/AuthorItem";

interface PaperDetailContentProps {
  paper: PaperMetadata;
}

export function PaperDetailContent({ paper }: PaperDetailContentProps) {
  const authors = paper.authors ?? [];
  const mainAuthor = authors[0]?.name ?? "Unknown";
  // console.log("PaperDetailContent rendered with paper:", paper);

  return (
    <VStack className="gap-4 min-h-0">
      <VStack className="gap-2 w-full">
        <TypographyH3 className="leading-tight">{paper.title}</TypographyH3>
        <VStack className="gap-2 flex-1 min-w-0">
          <HStack className="gap-2 items-center">
            <TypographyP variant="muted" size="xs">
              <Link
                href={`/authors/${authors[0]?.authorId || "#"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-special hover:underline"
              >
                {mainAuthor}
              </Link>
              {authors.length > 1 && ` et al.`}
            </TypographyP>
            <InfoItem number={paper.year || "n.d."} />
            <TypographyP variant="muted" size="sm">
              {C_BULLET}
            </TypographyP>
            <InfoItem number={paper.citationCount || 0} label="Citations" />
            <TypographyP variant="muted" size="sm">
              {C_BULLET}
            </TypographyP>
            <InfoItem
              number={paper.influentialCitationCount || 0}
              label="Influential"
            />
          </HStack>
          {/* <HStack> */}
          <InfoItem
            label={paper.venue || "Unknown Venue"}
            icon={<BookOpenIcon className="size-4 mt-0.5 mr-0.5" />}
            className="items-start"
            labelClassName="line-clamp-2"
          />
          {/* <QuartileBadge quartile={paper.journal?.sjrBestQuartile} /> */}
          {/* </HStack> */}
          <HStack className="gap-2 items-start">
            <a
              href={"https://www.doi.org/" + paper.externalIds?.doi}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-muted-foreground border-b border-current"
            >
              <ArrowUpRight className="size-4" />
              DOI
            </a>
            <a
              href={paper.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-muted-foreground border-b border-current"
            >
              <ArrowUpRight className="size-4" />
              Semantic Scholar
            </a>
          </HStack>
        </VStack>
      </VStack>
      <Separator />
      <Tabs
        defaultValue="abstract"
        className="w-full flex flex-col flex-1 min-h-0"
      >
        <TabsList variant={"line"} className="justify-start">
          <TabsTrigger value="abstract">Abstract</TabsTrigger>
          <TabsTrigger value="authors">Authors</TabsTrigger>
          <TabsTrigger value="summary">Tags</TabsTrigger>
        </TabsList>

        <TabsContent
          value="abstract"
          className="mt-2 flex-1 overflow-y-auto min-h-0"
        >
          <TypographyP className="text-sm leading-relaxed">
            {linkify(paper.abstract || "No abstract available.")}
          </TypographyP>
        </TabsContent>

        <TabsContent
          value="authors"
          className="mt-2 flex-1 overflow-y-auto min-h-0"
        >
          {AuthorList(authors)}
        </TabsContent>

        <TabsContent value="summary" className="mt-2">
          <TypographyP variant="muted" className="text-sm">
            Coming soon: key topics, methods, and findings extracted from the
            paper to provide a quick overview of its content and contributions.
          </TypographyP>
        </TabsContent>
      </Tabs>
    </VStack>
  );
}

interface PaperDetailFooterProps {
  paperMetadata?: PaperMetadata;
  onAddToChat?: () => void;
}

export function PaperDetailFooter({
  paperMetadata,
  onAddToChat,
}: PaperDetailFooterProps) {
  if (!paperMetadata) return null;
  return (
    <HStack className="w-full gap-2 items-center justify-between">
      <HStack className="gap-2 items-center">
        <Link
          href={`/papers/${paperMetadata?.paperId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="cursor-pointer">
            <InfoIcon className="size-4" />
            View Details
          </Button>
        </Link>
        {onAddToChat && (
          <Button variant="outline" onClick={onAddToChat}>
            <MessageSquarePlusIcon className="size-4" />
            Add to Chat
          </Button>
        )}
      </HStack>
      <ActionButtonGroup paperMetadata={paperMetadata} />
    </HStack>
  );
}

const AuthorList = (authors: AuthorMetadataDTO[]) => {
  if (authors.length === 0) {
    return (
      <TypographyP variant="muted" size="sm">
        No authors available.
      </TypographyP>
    );
  }
  return (
    <VStack className="gap-2">
      {authors.map((author, idx) => (
        <Item key={idx} asChild variant={"outline"} className="items-center">
          <Link href={`/authors/${author.authorId || "#"}`} target="_blank">
            <ItemContent>
              <ItemTitle>{author.name}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <ChevronRight className="size-4" />
            </ItemActions>
          </Link>
        </Item>
        // <AuthorItem key={idx} author={author as CoAuthorDTO} />
      ))}
    </VStack>
  );
};

const linkify = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+[^\s.,!?;:])/g;

  return text.split(urlRegex).map((part, i) =>
    urlRegex.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
};
