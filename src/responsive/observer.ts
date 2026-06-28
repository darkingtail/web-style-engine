import type {
  AliasRange,
  BreakpointKey,
  BreakpointMap,
  CreateResponsiveObserverOptions,
  MatchMediaLike,
  MediaQueryListLike,
  Responsive,
  ResponsiveAliases,
  ResponsiveObserver,
  ResponsiveSnapshot,
} from './types'
import { getCurrentBreakpoint } from './responsive'

function emptyRecord<TBreakpoints extends BreakpointMap>(responsive: Pick<Responsive<TBreakpoints>, 'sortedBreakpoints'>, value: boolean): Record<BreakpointKey<TBreakpoints>, boolean> {
  const record = {} as Record<BreakpointKey<TBreakpoints>, boolean>
  for (const bp of responsive.sortedBreakpoints) record[bp.key] = value
  return record
}

function evaluateAlias<TBreakpoints extends BreakpointMap>(
  responsive: Pick<Responsive<TBreakpoints>, 'query'>,
  range: AliasRange<TBreakpoints>,
  matchQuery: (query: string) => boolean,
): boolean {
  return matchQuery(responsive.query(range))
}

function snapshotFromWidth<TBreakpoints extends BreakpointMap, TAliases extends ResponsiveAliases<TBreakpoints> | undefined>(
  responsive: Responsive<TBreakpoints, TAliases>,
  width: number | undefined,
): ResponsiveSnapshot<TBreakpoints, TAliases> {
  const matches = emptyRecord(responsive, false)
  const only = emptyRecord(responsive, false)
  const current = width === undefined ? undefined : getCurrentBreakpoint(responsive.sortedBreakpoints, width)

  if (width !== undefined) {
    for (const bp of responsive.sortedBreakpoints) {
      matches[bp.key] = width >= bp.value
      only[bp.key] = bp.key === current
    }
  }

  const aliases: Record<string, boolean> = {}
  const aliasMap = responsive.aliases as ResponsiveAliases<TBreakpoints> | undefined
  if (aliasMap) {
    const matchQuery = (query: string) => matchWidthQuery(query, width)
    for (const [name, range] of Object.entries(aliasMap)) {
      aliases[name] = evaluateAlias(responsive, range, matchQuery)
    }
  }

  return { matches, only, current, aliases } as ResponsiveSnapshot<TBreakpoints, TAliases>
}

function matchWidthQuery(query: string, width: number | undefined): boolean {
  if (width === undefined) return false
  const min = /min-width:\s*(-?\d+(?:\.\d+)?)px/.exec(query)?.[1]
  const max = /max-width:\s*(-?\d+(?:\.\d+)?)px/.exec(query)?.[1]
  if (min !== undefined && width < Number(min)) return false
  if (max !== undefined && width > Number(max)) return false
  return true
}

function getDefaultMatchMedia(): MatchMediaLike | undefined {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia.bind(window)
  }
  return undefined
}

function addMqlListener(mql: MediaQueryListLike, listener: (event: { matches: boolean }) => void): () => void {
  if (mql.addEventListener && mql.removeEventListener) {
    mql.addEventListener('change', listener)
    return () => mql.removeEventListener?.('change', listener)
  }
  if (mql.addListener && mql.removeListener) {
    mql.addListener(listener)
    return () => mql.removeListener?.(listener)
  }
  return () => {}
}

function toMatchMediaQuery(query: string): string {
  return query.replace(/^@media\s+/, '')
}

export function createResponsiveObserver<const TBreakpoints extends BreakpointMap, const TAliases extends ResponsiveAliases<TBreakpoints> | undefined = undefined>(
  responsive: Responsive<TBreakpoints, TAliases>,
  options?: CreateResponsiveObserverOptions<TBreakpoints>,
): ResponsiveObserver<TBreakpoints, TAliases> {
  const listeners = new Set<() => void>()
  const removers: Array<() => void> = []
  const getMatchMedia = () => options?.matchMedia ?? getDefaultMatchMedia()
  let snapshot = snapshotFromWidth(responsive, options?.ssr?.width)
  const serverSnapshot = snapshotFromWidth(responsive, options?.ssr?.width)
  let listening = false

  const recomputeFromQueries = () => {
    const matchMedia = getMatchMedia()
    if (!matchMedia) {
      snapshot = snapshotFromWidth(responsive, options?.ssr?.width)
      return
    }

    const matches = emptyRecord(responsive, false)
    const only = emptyRecord(responsive, false)
    let current: BreakpointKey<TBreakpoints> | undefined

    for (const bp of responsive.sortedBreakpoints) {
      const isMatch = matchMedia(toMatchMediaQuery(responsive.up(bp.key))).matches
      matches[bp.key] = isMatch
      if (isMatch) current = bp.key
    }

    if (current !== undefined) only[current] = true

    const aliases: Record<string, boolean> = {}
    const aliasMap = responsive.aliases as ResponsiveAliases<TBreakpoints> | undefined
    if (aliasMap) {
      for (const [name, range] of Object.entries(aliasMap)) {
        aliases[name] = matchMedia(toMatchMediaQuery(responsive.query(range))).matches
      }
    }

    snapshot = { matches, only, current, aliases } as ResponsiveSnapshot<TBreakpoints, TAliases>
  }

  const notify = () => {
    recomputeFromQueries()
    for (const listener of listeners) listener()
  }

  const start = () => {
    const matchMedia = getMatchMedia()
    if (listening || !matchMedia) return
    listening = true
    const queries = new Set<string>()
    for (const bp of responsive.sortedBreakpoints) queries.add(toMatchMediaQuery(responsive.up(bp.key)))
    const aliasMap = responsive.aliases as ResponsiveAliases<TBreakpoints> | undefined
    if (aliasMap) {
      for (const range of Object.values(aliasMap)) queries.add(toMatchMediaQuery(responsive.query(range)))
    }
    for (const query of queries) {
      const mql = matchMedia(query)
      removers.push(addMqlListener(mql, notify))
    }
    recomputeFromQueries()
  }

  const stop = () => {
    while (removers.length) removers.pop()?.()
    listening = false
  }

  return {
    getSnapshot() {
      if (!listening) recomputeFromQueries()
      return snapshot
    },
    getServerSnapshot() {
      return serverSnapshot
    },
    subscribe(listener) {
      listeners.add(listener)
      if (listeners.size === 1) start()
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) stop()
      }
    },
  }
}
