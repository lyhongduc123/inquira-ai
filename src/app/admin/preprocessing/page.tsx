'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, Search, FileText, Database, Play, Pause, RefreshCw, X } from 'lucide-react'

const FIELD_OPTIONS = [
  "Computer Science",
  "Medicine",
  "Chemistry",
  "Biology",
  "Materials Science",
  "Physics",
  "Geology",
  "Psychology",
  "Art",
  "History",
  "Geography",
  "Sociology",
  "Business",
  "Political Science",
  "Economics",
  "Philosophy",
  "Mathematics",
  "Engineering",
  "Environmental Science",
  "Agricultural and Food Sciences",
  "Education",
  "Law",
  "Linguistics",
] as const

const currentYear = new Date().getFullYear()
const MIN_YEAR = 1990
const MAX_YEAR = currentYear

const YEAR_OPTIONS = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, i) => MAX_YEAR - i
)

interface JobStatus {
  job_id: string
  processed_count: number
  skipped_count: number
  error_count: number
  target_count: number
  is_completed: boolean
  is_running: boolean
  is_paused: boolean
  status_message: string | null
  papers_per_second: number
  eta_seconds: number | null
  progress_percent: number
  created_at: string | null
  updated_at: string | null
  completed_at: string | null
}

export default function PreprocessingPage() {
  const [jobs, setJobs] = useState<JobStatus[]>([])
  const [loading, setLoading] = useState(false)

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/preprocessing/preprocess/jobs`)
      const data = await res.json()
      if (data.success) {
        setJobs(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    }
  }

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-semibold">Preprocessing Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage paper preprocessing and data enrichment
        </p>
      </div>

      <Tabs defaultValue="bulk-search" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="bulk-search">
            <Search className="h-4 w-4 mr-2" />
            Bulk Search
          </TabsTrigger>
          <TabsTrigger value="repository">
            <Database className="h-4 w-4 mr-2" />
            Repository
          </TabsTrigger>
          <TabsTrigger value="jobs">
            <FileText className="h-4 w-4 mr-2" />
            Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bulk-search" className="mt-6">
          <BulkSearchPreprocessing />
        </TabsContent>

        <TabsContent value="repository" className="mt-6">
          <RepositoryPreprocessing />
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          <JobsList jobs={jobs} onRefresh={fetchJobs} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BulkSearchPreprocessing() {
  const [formData, setFormData] = useState({
    job_id: '',
    search_query: '',
    target_count: 100,
    year_min: undefined as number | undefined,
    year_max: undefined as number | undefined,
    fields_of_study: [] as string[],
  })
  const [submitting, setSubmitting] = useState(false)

  const handleFieldToggle = (field: string) => {
    const current = formData.fields_of_study
    const updated = current.includes(field)
      ? current.filter((f) => f !== field)
      : [...current, field]
    setFormData({ ...formData, fields_of_study: updated })
  }

  const handleClearFields = () => {
    setFormData({ ...formData, fields_of_study: [] })
  }

  const handleSubmit = async () => {
    if (!formData.job_id || !formData.search_query) {
      alert('Please fill in required fields')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        job_id: formData.job_id,
        search_query: formData.search_query,
        target_count: formData.target_count,
        year_min: formData.year_min || null,
        year_max: formData.year_max || null,
        fields_of_study: formData.fields_of_study.length > 0 ? formData.fields_of_study : null,
        resume: true,
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/preprocessing/preprocess/bulk-search/start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()
      if (data.success) {
        alert(`Bulk search job started! Job ID: ${formData.job_id}`)
        setFormData({
          job_id: '',
          search_query: '',
          target_count: 100,
          year_min: undefined,
          year_max: undefined,
          fields_of_study: [],
        })
      } else {
        alert(`Failed to start job: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to start bulk search:', error)
      alert('Failed to start preprocessing')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl p-6">
        <h3 className="mb-4 font-semibold flex items-center gap-2">
          <Search className="h-5 w-5" />
          Semantic Scholar Bulk Search
        </h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Search and process papers from Semantic Scholar using bulk search API. 
          Papers are automatically enriched with OpenAlex data, linked to journals/conferences, 
          and processed through the RAG pipeline.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="job-id">Job ID *</Label>
            <Input
              id="job-id"
              placeholder="e.g., ml-papers-2026"
              value={formData.job_id}
              onChange={(e) => setFormData({ ...formData, job_id: e.target.value })}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Unique identifier for this preprocessing job
            </p>
          </div>

          <div>
            <Label htmlFor="search-query">Search Query *</Label>
            <Input
              id="search-query"
              placeholder="e.g., machine learning"
              value={formData.search_query}
              onChange={(e) => setFormData({ ...formData, search_query: e.target.value })}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Search query for Semantic Scholar bulk search
            </p>
          </div>

          <div>
            <Label htmlFor="target-count">Target Count *</Label>
            <Input
              id="target-count"
              type="number"
              min="1"
              value={formData.target_count}
              onChange={(e) => setFormData({ ...formData, target_count: parseInt(e.target.value) || 100 })}
            />
          </div>

          {/* Year Range Selection */}
          <div className="space-y-2">
            <Label>Publication Year Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="year-min" className="text-xs text-muted-foreground">
                  From
                </Label>
                <Select
                  value={formData.year_min?.toString() || ''}
                  onValueChange={(value) => {
                    const year = value ? parseInt(value) : undefined
                    setFormData({ ...formData, year_min: year })
                  }}
                >
                  <SelectTrigger id="year-min" className="h-9">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year-max" className="text-xs text-muted-foreground">
                  To
                </Label>
                <Select
                  value={formData.year_max?.toString() || ''}
                  onValueChange={(value) => {
                    const year = value ? parseInt(value) : undefined
                    setFormData({ ...formData, year_max: year })
                  }}
                >
                  <SelectTrigger id="year-max" className="h-9">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Fields of Study Multi-Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Fields of Study</Label>
              {formData.fields_of_study.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs"
                  onClick={handleClearFields}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            {formData.fields_of_study.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.fields_of_study.map((field) => (
                  <Badge key={field} variant="secondary" className="text-xs">
                    {field}
                    <button
                      onClick={() => handleFieldToggle(field)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <ScrollArea className="h-48 w-full rounded-md border p-4">
              <div className="space-y-2">
                {FIELD_OPTIONS.map((field) => (
                  <div key={field} className="flex items-start gap-2">
                    <Checkbox
                      id={`field-${field}`}
                      checked={formData.fields_of_study.includes(field)}
                      onCheckedChange={() => handleFieldToggle(field)}
                    />
                    <label
                      htmlFor={`field-${field}`}
                      className="text-sm leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {field}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground">
              Select one or more fields to filter papers
            </p>
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            {submitting ? 'Starting...' : 'Start Bulk Search Job'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

function RepositoryPreprocessing() {
  const [jobId, setJobId] = useState('')
  const [paperIds, setPaperIds] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!jobId || !paperIds.trim()) {
      alert('Please fill in required fields')
      return
    }

    const ids = paperIds
      .split('\n')
      .map(id => id.trim())
      .filter(Boolean)

    if (ids.length === 0) {
      alert('Please provide at least one paper ID')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/preprocessing/preprocess/repository/start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job_id: jobId,
            paper_ids: ids,
            resume: true,
          }),
        }
      )

      const data = await res.json()
      if (data.success) {
        alert(`Repository job started! Job ID: ${jobId}, Papers: ${ids.length}`)
        setJobId('')
        setPaperIds('')
      } else {
        alert(`Failed to start job: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to start repository preprocessing:', error)
      alert('Failed to start preprocessing')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="rounded-2xl p-6">
      <h3 className="mb-4 font-semibold flex items-center gap-2">
        <Database className="h-5 w-5" />
        Repository Preprocessing
      </h3>
      <p className="mb-6 text-sm text-muted-foreground">
        Process specific papers by their IDs. Papers are fetched from Semantic Scholar,
        enriched with OpenAlex data, and processed through the RAG pipeline.
      </p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="repo-job-id">Job ID *</Label>
          <Input
            id="repo-job-id"
            placeholder="e.g., repository-batch-1"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Unique identifier for this preprocessing job
          </p>
        </div>

        <div>
          <Label htmlFor="paper-ids">Paper IDs * (one per line)</Label>
          <Textarea
            id="paper-ids"
            placeholder="e.g.,&#10;204e3073870fae3d05bcbc2f6a8e263d9b72e776&#10;649def34f8be52c8b66281af98ae884c09aef38b"
            rows={10}
            value={paperIds}
            onChange={(e) => setPaperIds(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Semantic Scholar paper IDs, one per line
          </p>
        </div>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          <Play className="h-4 w-4 mr-2" />
          {submitting ? 'Starting...' : 'Start Repository Job'}
        </Button>
      </div>
    </Card>
  )
}

function JobsList({ jobs, onRefresh }: { jobs: JobStatus[], onRefresh: () => void }) {
  const [pausing, setPausing] = useState<string | null>(null)

  const handlePause = async (jobId: string) => {
    setPausing(jobId)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/preprocessing/preprocess/pause/${jobId}`,
        { method: 'POST' }
      )
      if (res.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error('Failed to pause job:', error)
    } finally {
      setPausing(null)
    }
  }

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Preprocessing Jobs</h3>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="rounded-2xl p-8 text-center text-muted-foreground">
          No preprocessing jobs found
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.job_id} className="rounded-2xl p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{job.job_id}</h4>
                      {job.is_completed && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Completed
                        </Badge>
                      )}
                      {job.is_running && !job.is_paused && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          Running
                        </Badge>
                      )}
                      {job.is_paused && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Paused
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {job.status_message || 'Processing...'}
                    </p>
                  </div>
                  {job.is_running && !job.is_paused && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePause(job.job_id)}
                      disabled={pausing === job.job_id}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {job.processed_count} / {job.target_count} ({job.progress_percent}%)
                    </span>
                  </div>
                  <Progress value={job.progress_percent} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Processed</div>
                    <div className="font-medium">{job.processed_count}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Skipped</div>
                    <div className="font-medium">{job.skipped_count}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Errors</div>
                    <div className="font-medium text-red-500">{job.error_count}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Speed</div>
                    <div className="font-medium">{job.papers_per_second.toFixed(2)} p/s</div>
                  </div>
                </div>

                {job.eta_seconds && (
                  <div className="text-sm text-muted-foreground">
                    Estimated time remaining: {formatTime(job.eta_seconds)}
                  </div>
                )}

                <div className="text-xs text-muted-foreground border-t pt-3">
                  {job.created_at && `Started: ${new Date(job.created_at).toLocaleString()}`}
                  {job.completed_at && ` • Completed: ${new Date(job.completed_at).toLocaleString()}`}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
