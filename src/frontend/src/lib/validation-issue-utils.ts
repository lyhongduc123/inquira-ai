import type {
  ValidationCitationIssue,
  ValidationCitationIssueType,
} from '@/types/validation.type'

export function classifyCitationIssue(reason: string): ValidationCitationIssueType {
  const normalizedReason = reason.toLowerCase()

  if (normalizedReason.includes('exceeds available papers')) {
    return 'citation_out_of_range'
  }

  if (normalizedReason.includes('not found')) {
    return 'citation_not_found'
  }

  if (normalizedReason.includes('unsupported')) {
    return 'fact_not_supported'
  }

  if (normalizedReason.includes('misunderstood') || normalizedReason.includes('misinterpret')) {
    return 'misinterpreted_citation'
  }

  return 'unknown'
}

export function normalizeCitationIssues(
  issues: Array<Partial<ValidationCitationIssue>> | null | undefined
): ValidationCitationIssue[] {
  if (!issues || issues.length === 0) {
    return []
  }

  return issues
    .filter((issue) => issue && typeof issue.citation === 'string' && typeof issue.reason === 'string')
    .map((issue) => ({
      citation: issue.citation as string,
      reason: issue.reason as string,
      expectedRange:
        typeof issue.expectedRange === 'string' ? issue.expectedRange : undefined,
      type: issue.type ?? classifyCitationIssue(issue.reason as string),
    }))
}
