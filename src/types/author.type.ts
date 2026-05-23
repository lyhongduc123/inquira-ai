import { PaperMetadata } from "./paper.type";

export interface QuartileBreakdownDTO {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  unknown: number;
}

export interface CoAuthorDTO {
  authorId: string;
  name: string;
  hIndex: number | null;
  totalCitations: number;
  collaborationCount: number;
}

export interface AuthorDetailDTO {
  id: number;
  authorId: string;
  openalexId: string | null;
  name: string;
  displayName: string | null;
  orcid: string | null;
  url: string | null;
  externalIds: Record<string, unknown> | null;
  hIndex: number | null;
  i10Index: number | null; // Not computing this anymore
  totalCitations: number | null;
  totalPapers: number | null;
  verified: boolean;
  firstPublicationYear: number | null;
  lastKnownInstitutionId: number | null;
  retractionRate: number | null;
  authorInstitutions: Array<{
    id: string;
    name: string;
    institution: Record<string, string> | null;
    country: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }> | null;
  fieldWeightedCitationImpact: number | null;
  collaborationDiversityScore: number | null;
  isCorrespondingAuthorFrequently: boolean | null;
  averageAuthorPosition: number | null;
  retractedPapersCount: number | null;
  hasRetractedPapers: boolean;
  selfCitationRate: number | null; // Hard to compute
  isProcessed: boolean;
  isConflict: boolean;
  homepageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lastPaperIndexedAt: string | null;
  isEnriched: boolean;
  enrichmentStatus: {
    status: "needs_enrichment" | "enriching" | "completed" | "failed" | string;
    taskId?: string;
    message?: string;
  } | null;
}

export interface AuthorDetailWithPapersDTO extends AuthorDetailDTO {
  papers: PaperMetadata[];
  quartileBreakdown: QuartileBreakdownDTO;
  coAuthors: CoAuthorDTO[];
  countsByYear: Record<string, { papers: number; citations: number }> | null;
  openalexCountsByYear?: Record<
    string,
    { papers: number; citations: number }
  > | null;
  topics: Array<{
    displayName: string;
    count: number;
    domain: {
      id: string;
      displayName: string;
    };
    field: {
      id: string;
      displayName: string;
    };
  }> | null;
}

export interface AuthorMetadataDTO {
  name: string;
  authorId?: string | null;
  citationCount?: number | null;
  hIndex?: number | null;
  paperCount?: number | null;
  orcid?: string | null;
}
