import { AuthorMetadata } from './author.type'

export interface JournalData {
  title: string
  issn: string
  sjrScore: number
  sjrBestQuartile: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  hIndex: number
  impactFactor: number
  rank: number
  percentile: number
  isOpenAccess: boolean
  publisher: string
  country: string
  dataYear: number
}

/**
 * PaperMetadata - Lightweight paper metadata for frontend API responses
 * Used for:
 * - Streaming paper citations during RAG (chat responses)
 * - Paper snapshots in conversation messages
 * - Citation/reference lists
 */
export interface PaperMetadata {
  paperId: string
  externalIds?: Record<string, string> | null
  title: string
  abstract?: string | null
  tldr?: string
  authors: AuthorMetadata[]
  year?: number | null
  publicationDate?: string | null
  venue?: string | null
  url?: string | null
  pdfUrl?: string | null
  journal?: JournalData | null
  citationCount: number
  influentialCitationCount?: number
  citationStyles?: Record<string, string> | null
  referenceCount?: number
  relevanceScore?: number | null
  authorTrustScore?: number | null
  institutionalTrustScore?: number | null
  fwci?: number | null
  isOpenAccess: boolean
  isRetracted: boolean
  topics?: Array<Record<string, unknown>> | null
  keywords?: Array<Record<string, unknown>> | null
}

/**
 * PaperDetailResponse - Full paper details for frontend users
 * Includes enriched data (authors, institutions, journal, citations)
 */
export interface PaperDetail {
  id: number
  paperId: string
  title: string
  abstract: string
  authors: AuthorMetadata[]
  journal?: JournalData | null
  publicationDate?: string | null
  venue?: string | null
  issn?: string[] | null
  issnL?: string | null
  url?: string | null
  pdfUrl?: string | null
  isOpenAccess: boolean
  openAccessPdf?: Record<string, unknown> | null
  source: string
  externalIds?: Record<string, unknown> | null
  summary?: string | null
  citationCount: number
  influentialCitationCount: number
  referenceCount: number
  citationStyles?: Record<string, string> | null
  topics?: Array<Record<string, unknown>> | null
  keywords?: Array<Record<string, unknown>> | null
  concepts?: Array<Record<string, unknown>> | null
  meshTerms?: Array<Record<string, unknown>> | null
  citationPercentile?: Record<string, unknown> | null
  fwci?: number | null
  authorTrustScore?: number | null
  institutionalTrustScore?: number | null
  networkDiversityScore?: number | null
  isRetracted: boolean
  language?: string | null
  correspondingAuthorIds?: string[] | null
  institutionsDistinctCount?: number | null
  countriesDistinctCount?: number | null
  isProcessed: boolean
  processingStatus: string
  processingError?: string | null
  createdAt: string
  updatedAt: string
  lastAccessedAt?: string | null
  sjrData?: JournalData | null
}

/**
 * Paper update request
 */
export interface PaperUpdateRequest {
  title?: string | null
  abstract?: string | null
  venue?: string | null
  url?: string | null
  pdfUrl?: string | null
  isOpenAccess?: boolean | null
}

/**
 * A paper that cites the target paper
 */
export interface CitingPaper {
  citingPaper?: PaperMetadata
  isInfluential?: boolean | null
  contexts?: string[] | null
  intents?: string[] | null
}

/**
 * A paper referenced by the target paper
 */
export interface ReferencedPaper {
  citedPaper: PaperMetadata
  isInfluential?: boolean | null
  contexts?: string[] | null
  intents?: string[] | null
}

/**
 * Paginated response for papers citing the target paper
 */
export interface PaginatedCitationsResponse {
  offset: number
  next?: number | null
  total?: number | null
  data: CitingPaper[]
}

/**
 * Paginated response for papers referenced by the target paper
 */
export interface PaginatedReferencesResponse {
  offset: number
  next?: number | null
  total?: number | null
  data: ReferencedPaper[]
}


/**
 * Paper chunk from backend ChunkResponse schema
 */
export interface ChunkResponse {
  chunkId: string
  paperId: string
  text: string
  tokenCount: number
  chunkIndex: number
  sectionTitle?: string | null
  pageNumber?: number | null
  label?: string | null
  level?: number | null
}