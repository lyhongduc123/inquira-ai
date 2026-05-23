'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { CheckCircle, History, Play, TestTube, Trash2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { ValidationResultCard } from '@/components/validation/ValidationResultCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useConversations } from '@/hooks/use-conversations'
import {
  useDeleteValidation,
  useValidation,
  useValidationDetail,
  useValidationHistory,
  useValidationStats,
} from '@/hooks/use-validation'
import { conversationsApi } from '@/lib/api/conversations-api'
import type { ConversationDTO, MessageDTO } from '@/types/conversation.type'
import type {
  ValidationDetail,
  ValidationHistoryItem,
  ValidationInspection,
  ValidationRequest,
  ValidationResult,
} from '@/types/validation.type'
import { normalizeCitationIssues } from '@/lib/validation-issue-utils'

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

function getPreviousUserQuery(conversation: ConversationDTO | null, message: MessageDTO | null): string {
  if (!conversation || !message) return ''
  const messages = conversation.messages ?? []
  const messageIndex = messages.findIndex((item) => item.id === message.id)
  if (messageIndex <= 0) return ''

  for (let index = messageIndex - 1; index >= 0; index -= 1) {
    if (messages[index].role === 'user') {
      return messages[index].content
    }
  }

  return ''
}

export default function ValidationPage() {
  const [activeTab, setActiveTab] = useState('history')
  const [query, setQuery] = useState('')
  const [context, setContext] = useState('')
  const [generatedAnswer, setGeneratedAnswer] = useState('')
  const [modelName, setModelName] = useState('gpt-4o-mini')
  const [historyQueryFilter, setHistoryQueryFilter] = useState('')
  const [historyConversationFilter, setHistoryConversationFilter] = useState('')
  const [historyModelFilter, setHistoryModelFilter] = useState('all')
  const [historyIssueFilter, setHistoryIssueFilter] = useState<'all' | 'issues' | 'clean'>('all')
  const [historyPage, setHistoryPage] = useState(1)
  const [historyPageSize, setHistoryPageSize] = useState(50)

  const [selectedConversation, setSelectedConversation] = useState<ConversationDTO | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<MessageDTO | null>(null)
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null)
  const [isLoadingConversationDetail, setIsLoadingConversationDetail] = useState(false)
  const selectedValidationRef = useRef<HTMLDivElement | null>(null)

  const validationMutation = useValidation()
  const deleteValidationMutation = useDeleteValidation()
  const { data: stats } = useValidationStats()
  const historyParams = useMemo(
    () => ({
      skip: (historyPage - 1) * historyPageSize,
      limit: historyPageSize,
      conversationId: historyConversationFilter || undefined,
      modelName: historyModelFilter === 'all' ? undefined : historyModelFilter,
      queryText: historyQueryFilter || undefined,
      hasHallucination:
        historyIssueFilter === 'all' ? undefined : historyIssueFilter === 'issues',
    }),
    [
      historyConversationFilter,
      historyIssueFilter,
      historyModelFilter,
      historyPage,
      historyPageSize,
      historyQueryFilter,
    ]
  )
  const { data: historyData, isLoading: loadingHistory } = useValidationHistory(historyParams)
  const { data: detailData, isLoading: loadingDetail } = useValidationDetail(selectedHistoryId)
  const { conversations, isLoading: loadingConversations } = useConversations({
    page: 1,
    pageSize: 100,
  })

  const manualResult = validationMutation.data ?? null
  const selectedHistoryInspection = useMemo(() => {
    if (!detailData) return null
    return toInspectionFromDetail(detailData)
  }, [detailData])

  const assistantMessages = useMemo(() => {
    return (selectedConversation?.messages ?? []).filter((item) => item.role === 'assistant')
  }, [selectedConversation])

  const historyRows = useMemo(() => historyData?.validations ?? [], [historyData?.validations])

  const historyModels = useMemo(() => {
    const uniqueModels = new Set(historyRows.map((item) => item.modelName))
    return Array.from(uniqueModels).sort()
  }, [historyRows])

  const historyTotalRows = historyData?.total ?? 0
  const historyTotalPages = Math.max(1, Math.ceil(historyTotalRows / historyPageSize))

  const historyColumns: ColumnDef<ValidationHistoryItem>[] = [
      {
        accessorKey: 'queryText',
        header: 'Query',
        cell: ({ row }) => <p className="line-clamp-2 max-w-[400px] text-sm">{row.original.queryText}</p>,
      },
      {
        accessorKey: 'assistantAnswerPreview',
        header: 'Assistant answer',
        cell: ({ row }) => (
          <p className="line-clamp-2 max-w-[420px] text-sm text-muted-foreground">
            {row.original.assistantAnswerPreview || '—'}
          </p>
        ),
      },
      {
        accessorKey: 'conversationTitle',
        header: 'Conversation',
        cell: ({ row }) => (
          <div className="max-w-[240px]">
            <p className="line-clamp-1 text-sm">{row.original.conversationTitle || 'Untitled'}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{row.original.conversationId || '—'}</p>
          </div>
        ),
      },
      {
        accessorKey: 'modelName',
        header: 'Model',
      },
      {
        accessorKey: 'hasHallucination',
        header: 'Status',
        cell: ({ row }) =>
          row.original.hasHallucination ? (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              Issues
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 border-green-600 text-green-600">
              <CheckCircle className="h-3 w-3" />
              Clean
            </Badge>
          ),
      },
      {
        id: 'relevance',
        header: 'Relevance',
        cell: ({ row }) => `${((row.original.relevanceScore ?? 0) * 100).toFixed(1)}%`,
      },
      {
        id: 'factual',
        header: 'Factual',
        cell: ({ row }) => `${((row.original.factualAccuracyScore ?? 0) * 100).toFixed(1)}%`,
      },
      {
        id: 'citations',
        header: 'Citations',
        cell: ({ row }) => `${((row.original.citationAccuracy ?? 0) * 100).toFixed(1)}%`,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (row.original.createdAt ? format(new Date(row.original.createdAt), 'yyyy-MM-dd HH:mm') : '—'),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelectedHistoryId(row.original.id)}>
              Open
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeValidation(row.original.id)}
              disabled={deleteValidationMutation.isPending}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ]

  useEffect(() => {
    if (!selectedHistoryInspection || !selectedValidationRef.current) return
    selectedValidationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [selectedHistoryInspection])

  const buildConversationContext = (message: MessageDTO): string => {
    const paperSnapshots = message.paperSnapshots ?? []
    const paperIds = paperSnapshots.map((paper) => paper.paperId)

    const chunkIds = paperSnapshots.flatMap((paper) => {
      const dynamicPaper = paper as unknown as Record<string, unknown>
      const chunks = dynamicPaper.chunks
      if (!Array.isArray(chunks)) return []
      return chunks
        .map((chunk) => {
          if (typeof chunk === 'string') return chunk
          if (chunk && typeof chunk === 'object' && 'chunkId' in chunk) {
            return String((chunk as { chunkId: unknown }).chunkId)
          }
          return null
        })
        .filter((chunkId): chunkId is string => chunkId !== null)
    })

    return JSON.stringify(
      {
        query: getPreviousUserQuery(selectedConversation, message),
        paper_ids: paperIds,
        chunk_ids: chunkIds,
        paper_snapshots: paperSnapshots,
      },
      null,
      2
    )
  }

  const runManualValidation = async (): Promise<void> => {
    const payload: ValidationRequest = {
      query,
      context,
      generatedAnswer: generatedAnswer || undefined,
      modelName,
    }
    await validationMutation.mutateAsync(payload)
  }

  const runMessageValidation = async (): Promise<void> => {
    if (!selectedMessage) return
    const conversationIdNumber = selectedConversation ? Number(selectedConversation.id) : NaN
    const payload: ValidationRequest = {
      query: getPreviousUserQuery(selectedConversation, selectedMessage) || 'Conversation query',
      context: buildConversationContext(selectedMessage),
      generatedAnswer: selectedMessage.content,
      modelName,
      conversationId: Number.isFinite(conversationIdNumber) ? conversationIdNumber : undefined,
      messageId: selectedMessage.id,
    }
    await validationMutation.mutateAsync(payload)
  }

  const removeValidation = useCallback(async (validationId: number): Promise<void> => {
    if (!confirm('Delete this validation record?')) return
    await deleteValidationMutation.mutateAsync(validationId)
    if (selectedHistoryId === validationId) {
      setSelectedHistoryId(null)
    }
  }, [deleteValidationMutation, selectedHistoryId])

  const selectConversation = async (conversation: ConversationDTO): Promise<void> => {
    setSelectedMessage(null)
    setSelectedConversation({
      ...conversation,
      messages: conversation.messages ?? [],
    })

    if ((conversation.messages ?? []).length > 0) return

    setIsLoadingConversationDetail(true)
    try {
      const conversationDetail = await conversationsApi.get(conversation.id)
      setSelectedConversation(conversationDetail)
    } catch (error) {
      console.error('Failed to load conversation detail:', error)
      toast.error('Failed to load conversation details')
    } finally {
      setIsLoadingConversationDetail(false)
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Validation Workbench</h1>
        <p className="text-muted-foreground">
          Per-query verification for relevance, grounding, citations, papers, and chunks
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <StatsCard label="Total" value={stats.totalValidations} icon={<TestTube className="h-4 w-4" />} />
          <StatsCard
            label="Hallucination Rate"
            value={`${(stats.hallucinationRate * 100).toFixed(1)}%`}
            icon={<XCircle className="h-4 w-4" />}
          />
          <StatsCard
            label="Avg Relevance"
            value={`${(stats.averageRelevanceScore * 100).toFixed(1)}%`}
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <StatsCard
            label="Avg Grounding"
            value={`${((stats.averageGroundingScore ?? 0) * 100).toFixed(1)}%`}
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <StatsCard
            label="Avg Perspective"
            value={`${((stats.averagePerspectiveCoverage ?? 0) * 100).toFixed(1)}%`}
            icon={<History className="h-4 w-4" />}
          />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Assistant Validations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversation" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Select conversation</CardTitle>
                <CardDescription>Pick a conversation and then an assistant message</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingConversations ? (
                  <div className="flex justify-center py-10">
                    <Spinner className="h-7 w-7" />
                  </div>
                ) : (
                  <ScrollArea className="h-[420px]">
                    <div className="space-y-2">
                      {conversations.map((item: ConversationDTO) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectConversation(item)}
                          className="w-full rounded-lg border p-3 text-left hover:bg-accent"
                        >
                          <p className="line-clamp-1 font-medium">{item.title || 'Untitled conversation'}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.messageCount} messages
                          </p>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Select assistant answer</CardTitle>
                <CardDescription>Each validation is tracked per query and message</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedConversation ? (
                  isLoadingConversationDetail ? (
                    <div className="flex justify-center py-10">
                      <Spinner className="h-7 w-7" />
                    </div>
                  ) : assistantMessages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No assistant messages found in this conversation
                    </p>
                  ) : (
                    <ScrollArea className="h-[420px]">
                      <div className="space-y-2">
                        {assistantMessages.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedMessage(item)}
                            className="w-full rounded-lg border p-3 text-left hover:bg-accent"
                          >
                            <p className="line-clamp-2 text-sm">{item.content}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')} · papers:{' '}
                              {item.paperSnapshots?.length ?? 0}
                            </p>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">Select a conversation first</p>
                )}
              </CardContent>
            </Card>
          </div>

          {selectedMessage && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Run validation for selected message</CardTitle>
                <CardDescription>
                  Query, paper IDs and chunk IDs are captured for per-query verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Conversation title</Label>
                    <Input value={selectedConversation?.title || 'Untitled conversation'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Validation model</Label>
                    <Select value={modelName} onValueChange={setModelName}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={runMessageValidation} disabled={validationMutation.isPending} className="gap-2">
                  {validationMutation.isPending ? <Spinner className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  Validate selected answer
                </Button>
              </CardContent>
            </Card>
          )}

          {manualResult && <ValidationResultCard result={manualResult} />}
        </TabsContent>

        <TabsContent value="manual" className="mt-6 space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Manual validation</CardTitle>
              <CardDescription>Paste query, context, and answer to test validation v2</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query">Original query</Label>
                <Textarea id="query" value={query} onChange={(event) => setQuery(event.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Context input (papers + chunks)</Label>
                <Textarea
                  id="context"
                  className="font-mono text-xs"
                  value={context}
                  onChange={(event) => setContext(event.target.value)}
                  rows={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Generated answer (optional)</Label>
                <Textarea
                  id="answer"
                  value={generatedAnswer}
                  onChange={(event) => setGeneratedAnswer(event.target.value)}
                  rows={6}
                />
              </div>
              <Button onClick={runManualValidation} disabled={!query || !context || validationMutation.isPending}>
                {validationMutation.isPending ? 'Running…' : 'Run validation'}
              </Button>
            </CardContent>
          </Card>

          {manualResult && <ValidationResultCard result={manualResult} />}
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Per-query validation history</CardTitle>
              <CardDescription>
                Double-click a row to open that validation result
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="history-query-filter">Query contains</Label>
                  <Input
                    id="history-query-filter"
                    value={historyQueryFilter}
                    onChange={(event) => {
                      setHistoryPage(1)
                      setHistoryQueryFilter(event.target.value)
                    }}
                    placeholder="e.g. citations, reranking"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="history-conversation-filter">Conversation ID</Label>
                  <Input
                    id="history-conversation-filter"
                    value={historyConversationFilter}
                    onChange={(event) => {
                      setHistoryPage(1)
                      setHistoryConversationFilter(event.target.value)
                    }}
                    placeholder="optional"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select
                    value={historyModelFilter}
                    onValueChange={(value) => {
                      setHistoryPage(1)
                      setHistoryModelFilter(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key={"0"} value="all">All models</SelectItem>
                      {historyModels.map((model) => (
                        <SelectItem key={model || "0"} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={historyIssueFilter}
                    onValueChange={(value: 'all' | 'issues' | 'clean') => {
                      setHistoryPage(1)
                      setHistoryIssueFilter(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="issues">Issues</SelectItem>
                      <SelectItem value="clean">Clean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loadingHistory ? (
                <div className="flex justify-center py-10">
                  <Spinner className="h-7 w-7" />
                </div>
              ) : (
                <DataTable
                  columns={historyColumns}
                  data={historyRows}
                  searchKey="queryText"
                  searchPlaceholder="Search validation query..."
                  onRowDoubleClick={(row) => {
                    setSelectedHistoryId(row.id)
                    setActiveTab('history')
                  }}
                />
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Label>Rows per page</Label>
                  <Select
                    value={String(historyPageSize)}
                    onValueChange={(value) => {
                      setHistoryPage(1)
                      setHistoryPageSize(Number(value))
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Page {historyPage} / {historyTotalPages} • {historyTotalRows} total
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                    disabled={historyPage <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setHistoryPage((prev) => Math.min(historyTotalPages, prev + 1))}
                    disabled={historyPage >= historyTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {loadingDetail && (
            <div className="flex justify-center py-4">
              <Spinner className="h-6 w-6" />
            </div>
          )}

          {selectedHistoryInspection && (
            <div ref={selectedValidationRef}>
              <ValidationResultCard result={selectedHistoryInspection} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatsCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-5">
        <div className="mb-1 flex items-center justify-between text-muted-foreground">
          <span className="text-xs">{label}</span>
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

