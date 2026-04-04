'use client'

import { useState } from 'react'
import { VStack } from '@/components/layout/vstack'
import { HStack } from '@/components/layout/hstack'
import { Box } from '@/components/layout/box'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TypographyH1, TypographyP } from '@/components/global/typography'
import { Loader2, Database } from 'lucide-react'

interface DatabaseStats {
  total_papers: number
  total_authors: number
  total_institutions: number
  total_conversations: number
}

export default function AdminPage() {
  // Database stats state
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchStats = async () => {
    setIsLoadingStats(true)
    setError(null)

    try {
      const [papersRes, conversationsRes] = await Promise.all([
        fetch('/api/papers?page=1&page_size=1'),
        fetch('/api/conversations?page=1&page_size=1'),
      ])

      const [papersData, conversationsData] = await Promise.all([
        papersRes.json(),
        conversationsRes.json(),
      ])

      setDbStats({
        total_papers: papersData.data?.pagination?.total || 0,
        total_conversations: conversationsData.data?.pagination?.total || 0,
        total_authors: 0, // TODO: Add endpoint
        total_institutions: 0, // TODO: Add endpoint
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setIsLoadingStats(false)
    }
  }

  return (
    <Box className="min-h-screen bg-muted/30 p-6">
      <VStack className="mx-auto max-w-7xl gap-6">
        <TypographyH1>Admin Dashboard</TypographyH1>
        
        {/* Deprecation Notice */}
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">⚠️ Preprocessing Has Moved</CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              The preprocessing features have been moved to a dedicated page with enhanced functionality.
              <br />
              <a href="/admin/preprocessing" className="font-medium underline hover:text-yellow-900 dark:hover:text-yellow-100">
                Go to the new Preprocessing page →
              </a>
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="database" className="w-full">
          <TabsList>
            <TabsTrigger value="database">Database Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <HStack className="items-center justify-between">
                  <CardTitle>Database Statistics</CardTitle>
                  <Button onClick={handleFetchStats} disabled={isLoadingStats} size="sm" className="gap-2">
                    {isLoadingStats ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4" />
                    )}
                    Refresh Stats
                  </Button>
                </HStack>
              </CardHeader>
              <CardContent>
                {error && (
                  <Box className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 p-3">
                    <TypographyP variant="destructive">{error}</TypographyP>
                  </Box>
                )}
                
                {!dbStats ? (
                  <TypographyP variant="muted">Click Refresh Stats to load database statistics.</TypographyP>
                ) : (
                  <HStack className="flex-wrap gap-4">
                    <Card className="flex-1 min-w-[200px]">
                      <CardHeader>
                        <CardTitle className="text-sm">Total Papers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TypographyP className="text-3xl font-bold">{dbStats.total_papers.toLocaleString()}</TypographyP>
                      </CardContent>
                    </Card>

                    <Card className="flex-1 min-w-[200px]">
                      <CardHeader>
                        <CardTitle className="text-sm">Total Conversations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TypographyP className="text-3xl font-bold">
                          {dbStats.total_conversations.toLocaleString()}
                        </TypographyP>
                      </CardContent>
                    </Card>

                    <Card className="flex-1 min-w-[200px] opacity-50">
                      <CardHeader>
                        <CardTitle className="text-sm">Total Authors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TypographyP className="text-3xl font-bold">
                          {dbStats.total_authors.toLocaleString()}
                        </TypographyP>
                        <TypographyP size="sm" variant="muted">
                          (Coming soon)
                        </TypographyP>
                      </CardContent>
                    </Card>

                    <Card className="flex-1 min-w-[200px] opacity-50">
                      <CardHeader>
                        <CardTitle className="text-sm">Total Institutions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TypographyP className="text-3xl font-bold">
                          {dbStats.total_institutions.toLocaleString()}
                        </TypographyP>
                        <TypographyP size="sm" variant="muted">
                          (Coming soon)
                        </TypographyP>
                      </CardContent>
                    </Card>
                  </HStack>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </VStack>
    </Box>
  )
}
