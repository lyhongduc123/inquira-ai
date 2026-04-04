/**
 * ValidationResultCard Component
 * Displays comprehensive validation results with metrics and detailed analysis
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  FileText,
  BarChart3,
  Sparkles,
} from 'lucide-react'
import { DiffView } from './TextHighlight'
import type { ValidationInspection } from '@/types/validation.type'
import { cn } from '@/lib/utils'
import { normalizeCitationIssues } from '@/lib/validation-issue-utils'

interface ValidationResultCardProps {
  result: ValidationInspection
  className?: string
}

export function ValidationResultCard({ result, className }: ValidationResultCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(true)

  const { result: validationResult, summary } = result
  const textMatch = validationResult.textMatch ?? {
    matchedTerms: [],
    missingTerms: [],
    matchPercentage: 0,
    suspiciousSentences: [],
  }
  const componentScores = validationResult.componentScores ?? {
    groundingScore: 0,
    citationFaithfulnessScore: 0,
    relevanceScore: 0,
    perspectiveCoverageScore: 0,
    overallScore: 0,
  }
  const contextEvidence = validationResult.contextEvidence ?? {
    paperIds: [],
    chunkIds: [],
    totalPapers: 0,
    totalChunks: 0,
  }
  const claimsChecked = validationResult.claimsChecked ?? []
  const citationIssues = normalizeCitationIssues(validationResult.incorrectCitations)
  const unsupportedFacts = validationResult.nonExistentFacts ?? []
  const potentiallyMisunderstoodClaims = claimsChecked.filter(
    (claim) => claim.supportScore >= 0.5 && claim.supportScore < 0.75
  )

  return (
    <Card className={cn('rounded-2xl', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Validation Result</CardTitle>
            <CardDescription>
              Validated with {validationResult.modelUsed} in {validationResult.executionTimeMs}ms
            </CardDescription>
          </div>
          {summary.hasIssues ? (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              Issues Detected
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
              <CheckCircle className="h-3 w-3" />
              All Clear
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Relevance"
            value={validationResult.relevanceScore}
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <MetricCard
            label="Factual Accuracy"
            value={validationResult.factualAccuracyScore}
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <MetricCard
            label="Text Match"
            value={textMatch.matchPercentage / 100}
            icon={<Sparkles className="h-4 w-4" />}
          />
          {validationResult.citationAccuracy && (
            <MetricCard
              label="Citation Accuracy"
              value={validationResult.citationAccuracy.accuracy}
              icon={<FileText className="h-4 w-4" />}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <MetricCard
            label="Grounding"
            value={componentScores.groundingScore}
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <MetricCard
            label="Citation Faithfulness"
            value={componentScores.citationFaithfulnessScore}
            icon={<FileText className="h-4 w-4" />}
          />
          <MetricCard
            label="Perspective Coverage"
            value={componentScores.perspectiveCoverageScore}
            icon={<Sparkles className="h-4 w-4" />}
          />
          <MetricCard
            label="Overall Score"
            value={componentScores.overallScore}
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <StatCard
            label="Claims Checked"
            value={claimsChecked.length}
          />
        </div>

        {/* Detailed Analysis Tabs */}
        <Tabs defaultValue="diff" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="diff">Text Matching</TabsTrigger>
            <TabsTrigger value="issues">
              Issues
              {summary.issuesCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                  {summary.issuesCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="citations">Citations</TabsTrigger>
            <TabsTrigger value="context">Full Context</TabsTrigger>
          </TabsList>

          {/* Diff View Tab */}
          <TabsContent value="diff" className="space-y-4 mt-4">
            <DiffView
              response={validationResult.generatedAnswer}
              context={validationResult.contextUsed}
              matchedTerms={textMatch.matchedTerms}
              missingTerms={textMatch.missingTerms}
            />

            {/* Match Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <StatCard
                label="Matched Terms"
                  value={textMatch.matchedTerms.length}
                color="green"
              />
              <StatCard
                label="Missing Terms"
                  value={textMatch.missingTerms.length}
                color="red"
              />
              <StatCard
                label="Match Rate"
                  value={`${textMatch.matchPercentage.toFixed(1)}%`}
                  color={textMatch.matchPercentage > 70 ? 'green' : 'red'}
              />
            </div>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard
                label="Citation problems"
                value={citationIssues.length}
                color={citationIssues.length > 0 ? 'red' : 'green'}
              />
              <StatCard
                label="Unsupported facts"
                value={unsupportedFacts.length}
                color={unsupportedFacts.length > 0 ? 'red' : 'green'}
              />
              <StatCard
                label="Potential misunderstanding"
                value={potentiallyMisunderstoodClaims.length}
                color={potentiallyMisunderstoodClaims.length > 0 ? 'yellow' : 'green'}
              />
            </div>

            {validationResult.hasHallucination && unsupportedFacts.length > 0 ? (
              <IssueSection
                title="Potential Hallucinations"
                icon={<AlertTriangle className="h-4 w-4 text-yellow-600" />}
                items={unsupportedFacts}
                details={validationResult.hallucinationDetails}
              />
            ) : null}

            {textMatch.suspiciousSentences.length > 0 ? (
              <IssueSection
                title="Suspicious Sentences"
                icon={<XCircle className="h-4 w-4 text-red-600" />}
                items={textMatch.suspiciousSentences}
              />
            ) : null}

            {citationIssues.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Incorrect Citations
                </h4>
                <div className="space-y-2">
                  {citationIssues.map((citation, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <code className="text-xs font-mono">{citation.citation}</code>
                        <Badge variant="destructive" className="text-xs">
                          {formatCitationIssueType(citation.type)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{citation.reason}</p>
                      {citation.expectedRange && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Expected: {citation.expectedRange}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {potentiallyMisunderstoodClaims.length > 0 ? (
              <IssueSection
                title="Cited but potentially misunderstood"
                icon={<AlertTriangle className="h-4 w-4 text-yellow-600" />}
                items={potentiallyMisunderstoodClaims.map((claim) => claim.claim)}
                details={potentiallyMisunderstoodClaims.map(
                  (claim) => `Support score: ${(claim.supportScore * 100).toFixed(1)}%`
                )}
              />
            ) : null}

            {!validationResult.hasHallucination &&
              textMatch.suspiciousSentences.length === 0 &&
              citationIssues.length === 0 &&
              potentiallyMisunderstoodClaims.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                  <p className="text-lg font-semibold">No Issues Detected</p>
                  <p className="text-sm text-muted-foreground">
                    The generated answer appears to be factually accurate.
                  </p>
                </div>
              )}
          </TabsContent>

          {/* Citations Tab */}
          <TabsContent value="citations" className="space-y-4 mt-4">
            {validationResult.citationAccuracy ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Total Citations"
                    value={validationResult.citationAccuracy.totalCitations}
                  />
                  <StatCard
                    label="Correct"
                    value={validationResult.citationAccuracy.correctCitations}
                    color="green"
                  />
                  <StatCard
                    label="Hallucinated"
                    value={validationResult.citationAccuracy.hallucinatedCitations}
                    color="red"
                  />
                  <StatCard
                    label="Missing"
                    value={validationResult.citationAccuracy.missingCitations}
                    color="yellow"
                  />
                </div>

                <div className="rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Citation Accuracy</span>
                    <span className="text-sm font-semibold">
                      {(validationResult.citationAccuracy.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={validationResult.citationAccuracy.accuracy * 100} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No citations found in the response.</p>
              </div>
            )}
          </TabsContent>

          {/* Full Context Tab */}
          <TabsContent value="context" className="space-y-4 mt-4">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h4 className="text-sm font-semibold">Query</h4>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isExpanded && 'transform rotate-180'
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 rounded-xl border bg-card p-4">
                  <p className="text-sm">{validationResult.query}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Generated Answer</h4>
              <ScrollArea className="h-64 rounded-xl border bg-card p-4">
                <p className="text-sm whitespace-pre-wrap">{validationResult.generatedAnswer}</p>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Context</h4>
              <ScrollArea className="h-96 rounded-xl border bg-muted/30 p-4">
                <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                  {validationResult.contextUsed}
                </pre>
              </ScrollArea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Paper IDs ({contextEvidence.totalPapers})</h4>
                <ScrollArea className="h-40 rounded-xl border bg-card p-4">
                  <div className="space-y-1">
                    {contextEvidence.paperIds.length > 0 ? (
                      contextEvidence.paperIds.map((paperId) => (
                        <code key={paperId} className="block text-xs">{paperId}</code>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No paper IDs detected in context.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Chunk IDs ({contextEvidence.totalChunks})</h4>
                <ScrollArea className="h-40 rounded-xl border bg-card p-4">
                  <div className="space-y-1">
                    {contextEvidence.chunkIds.length > 0 ? (
                      contextEvidence.chunkIds.map((chunkId) => (
                        <code key={chunkId} className="block text-xs">{chunkId}</code>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No chunk IDs detected in context.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function formatCitationIssueType(type?: string): string {
  if (!type || type === 'unknown') return 'Unknown citation issue'
  if (type === 'citation_out_of_range') return 'Citation out of range'
  if (type === 'citation_not_found') return 'Citation not found'
  if (type === 'fact_not_supported') return 'Fact not supported'
  if (type === 'misinterpreted_citation') return 'Misinterpreted citation'
  return 'Citation issue'
}

// Helper Components

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  const percentage = value * 100
  const isGood = value >= 0.7

  return (
    <div className="rounded-xl border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{percentage.toFixed(0)}%</span>
          {isGood ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>
        <Progress value={percentage} />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number | string
  color?: 'green' | 'red' | 'yellow'
}) {
  const colorClasses = {
    green: 'border-green-200 bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-100',
    red: 'border-red-200 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-100',
    yellow:
      'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-900 dark:text-yellow-100',
  }

  return (
    <div className={cn('rounded-lg border p-3', color && colorClasses[color])}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

function IssueSection({
  title,
  icon,
  items,
  details,
}: {
  title: string
  icon: React.ReactNode
  items: string[]
  details?: string[] | null
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 p-3"
          >
            <p className="text-sm">{item}</p>
            {details && details[idx] && (
              <p className="mt-1 text-xs text-muted-foreground">{details[idx]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
