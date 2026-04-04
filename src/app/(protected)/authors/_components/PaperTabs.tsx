import { VStack } from "@/components/layout/vstack";
import { PaperMetadata } from "@/types/paper.type";
import { AuthorPaperCard } from "./AuthorPaperCard";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

interface PapersTabsProps {
  papers?: PaperMetadata[];
  currentAuthorName?: string;
  isLoading?: boolean;
  isError?: boolean;
}

export function PapersTabs({ papers, currentAuthorName, isLoading }: PapersTabsProps) {
  if (isLoading) {
    return <PapersTabsLoading />
  }

  if (!papers || papers.length === 0) {
    return <PapersTabsEmpty />
  }
  
  const sortedPapers = [...papers].sort((a, b) => {
    const dateA = a.publicationDate ? new Date(a.publicationDate).getTime() : 0;
    const dateB = b.publicationDate ? new Date(b.publicationDate).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <VStack className="gap-4 min-w-0">
      {sortedPapers.map((paper, idx) => (
        <AuthorPaperCard
          key={paper.paperId || idx}
          idx={idx + 1}
          paperMetadata={paper}
          currentAuthorName={currentAuthorName}
        />
      ))}
    </VStack>
  );
}


const PapersTabsLoading = () => {
  return (
    <VStack className="gap-4 min-w-0">
      {Array.from({ length: 5 }).map((_, idx) => (
        <AuthorPaperCard key={idx} isLoading />
      ))}
    </VStack>
  )
}

const PapersTabsEmpty = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle className="text-center">No publications found</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          This author has not been associated with any publications in our database.
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  )
}
  