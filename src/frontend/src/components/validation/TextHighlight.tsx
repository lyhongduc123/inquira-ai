/**
 * TextHighlight Component
 * Highlights text with fuzzy matching between response and context
 * Color-codes matched and unmatched terms for easy differentiation
 */

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface TextHighlightProps {
  text: string
  matchedTerms: string[]
  missingTerms: string[]
  className?: string
}

/**
 * Highlight text with matched and missing terms
 */
export function TextHighlight({
  text,
  matchedTerms,
  missingTerms,
  className,
}: TextHighlightProps) {
  const highlightedText = useMemo(() => {
    if (!text) return []

    // Create regex patterns for matched and missing terms
    const matchedPattern = matchedTerms.length
      ? new RegExp(`\\b(${matchedTerms.map(escapeRegex).join('|')})\\b`, 'gi')
      : null
    const missingPattern = missingTerms.length
      ? new RegExp(`\\b(${missingTerms.map(escapeRegex).join('|')})\\b`, 'gi')
      : null

    const parts: Array<{ text: string; type: 'matched' | 'missing' | 'normal' }> = []
    let lastIndex = 0

    // Find all matches
    const matches: Array<{ index: number; length: number; type: 'matched' | 'missing' }> = []

    if (matchedPattern) {
      let match
      while ((match = matchedPattern.exec(text)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          type: 'matched',
        })
      }
    }

    if (missingPattern) {
      let match
      while ((match = missingPattern.exec(text)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          type: 'missing',
        })
      }
    }

    // Sort matches by index
    matches.sort((a, b) => a.index - b.index)

    // Build parts array
    matches.forEach((match) => {
      // Add normal text before match
      if (match.index > lastIndex) {
        parts.push({
          text: text.slice(lastIndex, match.index),
          type: 'normal',
        })
      }

      // Add matched/missing text
      parts.push({
        text: text.slice(match.index, match.index + match.length),
        type: match.type,
      })

      lastIndex = match.index + match.length
    })

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        text: text.slice(lastIndex),
        type: 'normal',
      })
    }

    return parts
  }, [text, matchedTerms, missingTerms])

  return (
    <div className={cn('whitespace-pre-wrap break-words', className)}>
      {highlightedText.map((part, index) => {
        if (part.type === 'matched') {
          return (
            <mark
              key={index}
              className="bg-green-200 dark:bg-green-900/50 text-green-900 dark:text-green-100 rounded px-0.5"
            >
              {part.text}
            </mark>
          )
        }
        if (part.type === 'missing') {
          return (
            <mark
              key={index}
              className="bg-red-200 dark:bg-red-900/50 text-red-900 dark:text-red-100 rounded px-0.5"
            >
              {part.text}
            </mark>
          )
        }
        return <span key={index}>{part.text}</span>
      })}
    </div>
  )
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

interface DiffViewProps {
  response: string
  context: string
  matchedTerms: string[]
  missingTerms: string[]
}

/**
 * Side-by-side diff view with highlighting
 */
export function DiffView({ response, context, matchedTerms, missingTerms }: DiffViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Response with highlighting */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Generated Response</h4>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-green-200 dark:bg-green-900/50 rounded" />
              Matched
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-red-200 dark:bg-red-900/50 rounded" />
              Missing
            </span>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-sm max-h-96 overflow-y-auto">
          <TextHighlight
            text={response}
            matchedTerms={matchedTerms}
            missingTerms={missingTerms}
          />
        </div>
      </div>

      {/* Context (no highlighting) */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Context (Paper Snapshots)</h4>
        <div className="rounded-xl border bg-muted/30 p-4 text-sm max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap break-words text-xs text-muted-foreground font-mono">
            {context}
          </pre>
        </div>
      </div>
    </div>
  )
}
