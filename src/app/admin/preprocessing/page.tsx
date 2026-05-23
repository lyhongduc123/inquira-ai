'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api/api-client'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Play, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

interface PreprocessingPhaseResponse {
  success: boolean
  phase: string
  message: string
  details?: {
    phase?: string
    mode?: string
    paper_count?: number
    considered?: number
    updated?: number
    remaining_missing?: number
    total?: number
    processed?: number
    failed?: number
  }
}

type PhaseType = 'embed' | 'process_content'

export default function PreprocessingPage() {
  const [selectedPhase, setSelectedPhase] = useState<PhaseType>('embed')
  const [paperIdsText, setPaperIdsText] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<PreprocessingPhaseResponse | null>(null)

  const phases: { value: PhaseType; label: string; description: string }[] = [
    {
      value: 'embed',
      label: 'Run Embed',
      description: 'Generate title and abstract embeddings for papers',
    },
    {
      value: 'process_content',
      label: 'Run Process Content',
      description: 'PDF extraction, chunking, and embedding for open-access papers',
    },
  ]

  const handleRunPreprocessing = async () => {
    setIsRunning(true)
    setResult(null)

    const paperIds = paperIdsText.trim()
      ? paperIdsText.split('\n').map((id) => id.trim()).filter(Boolean)
      : undefined

    try {
      const payload = {
        run_embed: selectedPhase === 'embed',
        run_process_content: selectedPhase === 'process_content',
        paper_ids: paperIds,
        limit: 50,
      }

      const response = await apiClient.post<PreprocessingPhaseResponse>(
        '/api/v1/preprocess/phase/run',
        payload
      )

      setResult(response)
      if (response.success) {
        toast.success(response.message)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Preprocessing failed'
      toast.error(message)
      setResult({
        success: false,
        phase: selectedPhase,
        message,
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-semibold">Preprocessing Management</h1>
        <p className="text-sm text-muted-foreground">
          Run specific preprocessing phases for paper data processing
        </p>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Phase Selection</CardTitle>
          <CardDescription>
            Choose a preprocessing phase to execute
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Phase</Label>
            <div className="grid grid-cols-1 gap-3">
              {phases.map((phase) => (
                <button
                  key={phase.value}
                  type="button"
                  onClick={() => setSelectedPhase(phase.value)}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-lg border-2 text-left transition-all",
                    selectedPhase === phase.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        selectedPhase === phase.value
                          ? "border-primary"
                          : "border-muted-foreground"
                      )}
                    >
                      {selectedPhase === phase.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="font-medium">{phase.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {phase.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paper-ids" className="text-base font-semibold">
              Paper IDs (Optional)
            </Label>
            <Textarea
              id="paper-ids"
              placeholder="Enter paper IDs, one per line (leave empty for all pending papers)"
              value={paperIdsText}
              onChange={(e) => setPaperIdsText(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Provide specific paper IDs to process only those papers. 
              Leave empty to process all eligible papers.
            </p>
          </div>

          <Button
            onClick={handleRunPreprocessing}
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running {selectedPhase === 'embed' ? 'Embed' : 'Process Content'}...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run {selectedPhase === 'embed' ? 'Run Embed' : 'Run Process Content'}
              </>
            )}
          </Button>

          {result && (
            <Card className={cn(
              "border-2",
              result.success ? "border-green-200 bg-green-50/50 dark:bg-green-950/20" : "border-red-200 bg-red-50/50 dark:bg-red-950/20"
            )}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                      <span className="text-sm font-medium">{result.phase}</span>
                    </div>
                    <p className="text-sm">{result.message}</p>
                    {result.details && (
                      <div className="mt-3 p-3 bg-background/50 rounded-md">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}