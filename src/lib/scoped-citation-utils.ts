export interface ScopedCitationRef {
  paperId: string
  chunkId: string
  marker: string
  quote?: string | null
  section?: string | null
  charStart?: number | null
  charEnd?: number | null
}

const SCOPED_CITATION_PATTERN =
  /\(cite:(?<paperId>[^|)]+)\|(?<chunkId>[^|)]+)(?:\|(?<charStart>\d+)\|(?<charEnd>\d+))?\)/g

export function extractScopedCitationRefs(text: string): ScopedCitationRef[] {
  const refs: ScopedCitationRef[] = []

  for (const match of text.matchAll(SCOPED_CITATION_PATTERN)) {
    const groups = match.groups
    if (!groups) {
      continue
    }

    refs.push({
      paperId: groups.paperId,
      chunkId: groups.chunkId,
      marker: match[0],
      charStart: groups.charStart ? Number(groups.charStart) : null,
      charEnd: groups.charEnd ? Number(groups.charEnd) : null,
    })
  }

  return refs
}

export function getScopedCitationKey(ref: Pick<ScopedCitationRef, "paperId" | "chunkId" | "charStart" | "charEnd">): string {
  const charStart = ref.charStart ?? ""
  const charEnd = ref.charEnd ?? ""
  return `${ref.paperId}|${ref.chunkId}|${charStart}|${charEnd}`
}

export function createScopedCitationRefMap(refs?: ScopedCitationRef[]): Map<string, ScopedCitationRef> {
  const map = new Map<string, ScopedCitationRef>()

  for (const ref of refs ?? []) {
    if (!ref.paperId || !ref.chunkId) {
      continue
    }

    const scopedKey = getScopedCitationKey(ref)

    // Keep both plain and prefixed keys for backward-safe lookups.
    map.set(scopedKey, ref)
    map.set(`key:${scopedKey}`, ref)

    if (ref.marker) {
      map.set(ref.marker, ref)
      map.set(`marker:${ref.marker}`, ref)
    }
  }

  return map
}

export function getScopedCitationRef(
  map: Map<string, ScopedCitationRef>,
  scopedKey: string,
  marker: string,
): ScopedCitationRef | undefined {
  return (
    map.get(scopedKey)
    || map.get(`key:${scopedKey}`)
    || map.get(marker)
    || map.get(`marker:${marker}`)
  )
}

export function mergeScopedCitationRefs(
  existing: ScopedCitationRef[] | undefined,
  incoming: ScopedCitationRef,
): ScopedCitationRef[] {
  const current = existing ?? []
  const incomingKey = getScopedCitationKey(incoming)

  const alreadyExists = current.some((ref) => {
    if (incoming.marker && ref.marker === incoming.marker) {
      return true
    }

    return getScopedCitationKey(ref) === incomingKey
  })

  if (alreadyExists) {
    return current
  }

  return [...current, incoming]
}