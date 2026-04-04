'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle, Eye, RefreshCw, Trash2, XCircle } from 'lucide-react'

import { ValidationResultCard } from '@/components/validation/ValidationResultCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Spinner } from '@/components/ui/spinner'
import { useDeleteValidation, useValidationDetail, useValidationHistory } from '@/hooks/use-validation'
import { normalizeCitationIssues } from '@/lib/validation-issue-utils'
import type { ValidationDetail, ValidationInspection, ValidationResult } from '@/types/validation.type'

interface ValidationTabsProps {
  conversationId: string
  messageId: string
}

function toInspectionFromDetail(detail: ValidationDetail): ValidationInspection {
  const citationIssues = normalizeCitationIssues(detail.incorrectCitations)

  const result: ValidationResult = {
    query: detail.queryText,
    generatedAnswer: detail.generatedAnswer ?? '',
    contextUsed: detail.contextUsed ?? '',
    textMatch: {
      matchedTerms: [],
      missingTerms: [],
      matchPercentage: 0,
      suspiciousSentences: [],
    },
    contextEvidence: detail.contextEvidence ?? {
      paperIds: [],
      chunkIds: [],
      totalPapers: 0,
      totalChunks: 0,
    },
    hasHallucination: detail.hasHallucination,
    hallucinationCount: detail.hallucinationCount,
    hallucinationDetails: detail.hallucinationDetails,
    nonExistentFacts: detail.nonExistentFacts,
    incorrectCitations: citationIssues,
    citationAccuracy: {
      totalCitations: detail.totalCitations,
      correctCitations: detail.correctCitations,
      hallucinatedCitations: detail.hallucinatedCitations,
      missingCitations: detail.missingCitations,
      accuracy: detail.citationAccuracy ?? 0,
    },
    relevanceScore: detail.relevanceScore ?? 0,
    factualAccuracyScore: detail.factualAccuracyScore ?? 0,
    componentScores:
      detail.componentScores ?? {
        groundingScore: detail.factualAccuracyScore ?? 0,
        citationFaithfulnessScore: detail.citationAccuracy ?? 0,
        relevanceScore: detail.relevanceScore ?? 0,
        perspectiveCoverageScore: 0,
        overallScore: detail.factualAccuracyScore ?? 0,
      },
    claimsChecked: [],
    executionTimeMs: detail.executionTimeMs ?? 0,
    modelUsed: detail.modelName ?? 'unknown',
    validationId: detail.id,
  }

  return {
    validationId: detail.id,
    timestamp: detail.createdAt,
    result,
    summary: {
      hasIssues: detail.hasHallucination || detail.hallucinatedCitations > 0,
      textMatchPercentage: 0,
      citationAccuracy: detail.citationAccuracy ?? 0,
      relevance: detail.relevanceScore ?? 0,
      issuesCount: detail.hallucinationCount + detail.hallucinatedCitations,
      overallScore: result.componentScores.overallScore,
      groundingScore: result.componentScores.groundingScore,
      perspectiveCoverageScore: result.componentScores.perspectiveCoverageScore,
    },
  }
}

export default function ValidationTabs({
  conversationId,
  messageId,
}: ValidationTabsProps) {
  const [selectedValidationId, setSelectedValidationId] = useState<number | null>(null)

  const { data: historyData, isLoading, refetch } = useValidationHistory({
    skip: 0,
    limit: 100,
    messageId: Number(messageId),
  })
  const { data: selectedDetail, isLoading: isLoadingDetail } = useValidationDetail(selectedValidationId)

  const deleteValidationMutation = useDeleteValidation()
  const inspectionResult = selectedDetail ? toInspectionFromDetail(selectedDetail) : null

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this validation?')) {
      await deleteValidationMutation.mutateAsync(id)
      refetch()
      if (selectedValidationId === id) {
        setSelectedValidationId(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">
            Validation List ({historyData?.validations.length || 0})
          </TabsTrigger>
          {inspectionResult && (
            <TabsTrigger value="inspection">
              Inspection Details
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Validation History</CardTitle>
                  <CardDescription>
                    Message {messageId} in conversation {conversationId.slice(0, 8)}...
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : historyData && historyData.validations.length > 0 ? (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Relevance</TableHead>
                        <TableHead className="text-right">Accuracy</TableHead>
                        <TableHead className="text-right">Citations</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.validations.map((validation) => (
                        <TableRow
                          key={validation.id}
                          className={`cursor-pointer transition-colors ${
                            selectedValidationId === validation.id
                              ? 'bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedValidationId(validation.id)}
                        >
                          <TableCell className="font-medium">
                            {format(new Date(validation.createdAt), 'MMM d, HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {validation.modelName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {validation.hasHallucination ? (
                              <Badge variant="destructive" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Issues
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="gap-1 text-green-600 border-green-600"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Clean
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {((validation.relevanceScore ?? 0) * 100).toFixed(0)}%
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {((validation.factualAccuracyScore ?? 0) * 100).toFixed(0)}%
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {((validation.citationAccuracy ?? 0) * 100).toFixed(0)}%
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedValidationId(validation.id)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(validation.id)
                                }}
                                disabled={deleteValidationMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold">No Validations Found</p>
                  <p className="text-sm text-muted-foreground">
                    No validation history for this conversation yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isLoadingDetail ? (
          <TabsContent value="inspection" className="mt-6">
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          </TabsContent>
        ) : null}

        {inspectionResult ? (
          <TabsContent value="inspection" className="mt-6">
            <ValidationResultCard result={inspectionResult} />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  )
}
