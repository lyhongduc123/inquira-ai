import type { PaperMetadata } from '@/types/paper.type'

const SCOPED_CHAT_SELECTION_KEY = 'exegent_scoped_chat_selection'
const CHAT_LAUNCH_KEY_PREFIX = 'exegent_chat_launch_'

export interface ChatLaunchPayload {
  query: string
  scopedPapers?: PaperMetadata[]
  conversationId?: string
  filters?: Record<string, unknown>
  pipeline?: 'research' | 'agent'
  source?: 'bookmarks' | 'paper-detail' | 'unknown'
  createdAt: number
}

export function saveScopedChatSelection(papers: PaperMetadata[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(SCOPED_CHAT_SELECTION_KEY, JSON.stringify(papers))
  } catch (error) {
    console.error('Failed to save scoped chat selection:', error)
  }
}

export function consumeScopedChatSelection(): PaperMetadata[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(SCOPED_CHAT_SELECTION_KEY)
    if (!raw) return []

    localStorage.removeItem(SCOPED_CHAT_SELECTION_KEY)

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as PaperMetadata[]) : []
  } catch (error) {
    console.error('Failed to consume scoped chat selection:', error)
    return []
  }
}

export function saveChatLaunchPayload(
  payload: Omit<ChatLaunchPayload, 'createdAt'>,
): string {
  if (typeof window === 'undefined') return ''

  try {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2)}`

    const storageKey = `${CHAT_LAUNCH_KEY_PREFIX}${id}`
    localStorage.setItem(
      storageKey,
      JSON.stringify({ ...payload, createdAt: Date.now() } satisfies ChatLaunchPayload),
    )

    return id
  } catch (error) {
    console.error('Failed to save chat launch payload:', error)
    return ''
  }
}

export function consumeChatLaunchPayload(id: string): ChatLaunchPayload | null {
  if (typeof window === 'undefined' || !id) return null

  try {
    const storageKey = `${CHAT_LAUNCH_KEY_PREFIX}${id}`
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null

    localStorage.removeItem(storageKey)

    const parsed = JSON.parse(raw) as Partial<ChatLaunchPayload>
    if (!parsed || typeof parsed.query !== 'string') return null

    return {
      query: parsed.query,
      scopedPapers: Array.isArray(parsed.scopedPapers)
        ? (parsed.scopedPapers as PaperMetadata[])
        : [],
      conversationId:
        typeof parsed.conversationId === 'string' ? parsed.conversationId : undefined,
      filters:
        parsed.filters && typeof parsed.filters === 'object'
          ? (parsed.filters as Record<string, unknown>)
          : undefined,
      pipeline:
        parsed.pipeline === 'research' || parsed.pipeline === 'agent'
          ? parsed.pipeline
          : undefined,
      source:
        parsed.source === 'bookmarks' ||
        parsed.source === 'paper-detail' ||
        parsed.source === 'unknown'
          ? parsed.source
          : 'unknown',
      createdAt:
        typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now(),
    }
  } catch (error) {
    console.error('Failed to consume chat launch payload:', error)
    return null
  }
}
