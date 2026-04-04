import { PaperMetadata } from './paper.type'

/**
 * Text matching analysis for frontend diff display
 */
export interface TextMatchAnalysis {
  matchedTerms: string[]
  missingTerms: string[]
  matchPercentage: number
  suspiciousSentences: string[]
}

/**
 * Citation accuracy metrics
 */
export interface CitationAccuracy {
  totalCitations: number
  correctCitations: number
  hallucinatedCitations: number
  missingCitations: number
  accuracy: number
}

export type ValidationCitationIssueType =
  | 'citation_out_of_range'
  | 'citation_not_found'
  | 'fact_not_supported'
  | 'misinterpreted_citation'
  | 'unknown'

export interface ValidationCitationIssue {
  citation: string
  reason: string
  expectedRange?: string
  type?: ValidationCitationIssueType
}

export interface ContextEvidence {
  paperIds: string[]
  chunkIds: string[]
  totalPapers: number
  totalChunks: number
}

export interface ValidationClaim {
  claim: string
  supportScore: number
  supported: boolean
  missingTerms: string[]
}

export interface ValidationComponentScores {
  groundingScore: number
  citationFaithfulnessScore: number
  relevanceScore: number
  perspectiveCoverageScore: number
  overallScore: number
}

/**
 * Detailed validation result
 */
export interface ValidationResult {
  query: string
  generatedAnswer: string
  contextUsed: string
  textMatch: TextMatchAnalysis
  contextEvidence: ContextEvidence
  hasHallucination: boolean
  hallucinationCount: number
  hallucinationDetails?: string[] | null
  nonExistentFacts?: string[] | null
  incorrectCitations?: ValidationCitationIssue[] | null
  citationAccuracy?: CitationAccuracy | null
  relevanceScore: number
  factualAccuracyScore: number
  componentScores: ValidationComponentScores
  claimsChecked: ValidationClaim[]
  executionTimeMs: number
  modelUsed: string
  validationId?: number | null
}

/**
 * Complete validation inspection response
 */
export interface ValidationInspection {
  validationId: number
  timestamp: string
  result: ValidationResult
  summary: {
    hasIssues: boolean
    textMatchPercentage: number
    citationAccuracy: number
    relevance: number
    issuesCount: number
    overallScore?: number
    groundingScore?: number
    perspectiveCoverageScore?: number
  }
}

/**
 * Validation request payload
 */
export interface ValidationRequest {
  query: string
  context: string
  generatedAnswer?: string | null
  modelName?: string
  conversationId?: number | null
  messageId?: number | null
}

/**
 * Validation history item
 */
export interface ValidationHistoryItem {
  id: number
  queryText: string
  assistantAnswerPreview?: string | null
  conversationId?: string | null
  conversationTitle?: string | null
  modelName: string
  messageId?: number | null
  hasHallucination: boolean
  factualAccuracyScore?: number | null
  relevanceScore?: number | null
  citationAccuracy?: number | null
  executionTimeMs?: number | null
  totalCitations: number
  correctCitations: number
  hallucinatedCitations: number
  missingCitations: number
  contextEvidence?: ContextEvidence | null
  createdAt: string
  validatedAt?: string | null
}

export interface ValidationDetail {
  id: number
  messageId?: number | null
  queryText: string
  generatedAnswer?: string | null
  contextUsed?: string | null
  contextEvidence?: ContextEvidence | null
  hasHallucination: boolean
  hallucinationCount: number
  hallucinationDetails?: string[] | null
  nonExistentFacts?: string[] | null
  incorrectCitations?: ValidationCitationIssue[] | null
  relevanceScore?: number | null
  factualAccuracyScore?: number | null
  citationAccuracy?: number | null
  totalCitations: number
  correctCitations: number
  hallucinatedCitations: number
  missingCitations: number
  executionTimeMs?: number | null
  modelName?: string | null
  status: string
  componentScores?: ValidationComponentScores | null
  createdAt: string
  validatedAt?: string | null
}

/**
 * Validation history response
 */
export interface ValidationHistoryResponse {
  total: number
  skip: number
  limit: number
  validations: ValidationHistoryItem[]
}

/**
 * Validation statistics
 */
export interface ValidationStats {
  totalValidations: number
  hallucinationRate: number
  averageRelevanceScore: number
  averageFactualAccuracy: number
  averageCitationAccuracy: number
  totalHallucinations: number
  totalIncorrectCitations: number
  averageGroundingScore?: number
  averagePerspectiveCoverage?: number
  conversationId?: number | null
  modelName?: string | null
}

/**
 * Paper snapshot with context for validation
 */
export interface PaperSnapshot extends PaperMetadata {
  chunks?: string[]
  relevanceScore?: number
}
