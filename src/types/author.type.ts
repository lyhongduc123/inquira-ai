import { PaperMetadata } from "./paper.type";

export interface QuartileBreakdown {
  Q1: number;
  Q2: number;
  Q3: number;
  Q4: number;
  unknown: number;
}

export interface CoAuthor {
  authorId: string;
  name: string;
  hIndex: number | null;
  totalCitations: number;
  collaborationCount: number;
}

export interface AuthorDetail {
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
    status: 'needs_enrichment' | 'enriching' | 'completed' | 'failed' | string;
    taskId?: string;
    message?: string;
  } | null;
}

export interface AuthorDetailWithPapers extends AuthorDetail {
  papers: PaperMetadata[];
  quartileBreakdown: QuartileBreakdown;
  coAuthors: CoAuthor[];
  papersByYear: Record<number, number> | null;
  countsByYear: Array<{
    year: number;
    worksCount: number;
    oaWorksCount: number;
    citedByCount: number;
  }> | null;
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

export interface AuthorMetadata {
  name: string;
  authorId?: string | null;
  citationCount?: number | null;
  hIndex?: number | null;
  paperCount?: number | null;
  orcid?: string | null;
}
