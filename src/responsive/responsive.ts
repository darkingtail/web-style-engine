import type {
  AliasRange,
  BreakpointKey,
  BreakpointMap,
  CreateResponsiveOptions,
  NormalizedBreakpoint,
  QueryMode,
  QueryRecord,
  Responsive,
  ResponsiveAliases,
  ResponsivePreset,
  ResponsiveRule,
  ResponsiveStyleInput,
  ResponsiveUnit,
  ResponsiveCSSObject,
  StyleAdapter,
} from './types'

export const defaultBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
} as const

const reservedKeys = new Set([
  'up',
  'down',
  'below',
  'only',
  'between',
  'not',
  'query',
  'object',
  'rules',
  'css',
  'style',
  'container',
  'observer',
  'current',
  'matches',
  'aliases',
  'subscribe',
  'getSnapshot',
  'getServerSnapshot',
])

export function defineResponsivePreset<const TBreakpoints extends BreakpointMap>(
  preset: ResponsivePreset<TBreakpoints>,
): ResponsivePreset<TBreakpoints> {
  return preset
}

function formatValue(value: number, unit: ResponsiveUnit): string {
  if (typeof unit === 'function') return unit(value)
  return `${Number.parseFloat(value.toFixed(5))}${unit}`
}

function normalizeBreakpoints<TBreakpoints extends BreakpointMap>(
  breakpoints: TBreakpoints,
): Array<NormalizedBreakpoint<BreakpointKey<TBreakpoints>>> {
  const entries = Object.entries(breakpoints) as Array<[BreakpointKey<TBreakpoints>, number]>
  if (entries.length === 0) {
    throw new Error('createResponsive: breakpoints must not be empty')
  }

  const seenValues = new Map<number, string>()
  for (const [key, value] of entries) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`createResponsive: breakpoint "${key}" must be a non-negative finite number`)
    }
    if (reservedKeys.has(key)) {
      throw new Error(`createResponsive: breakpoint name "${key}" is reserved`)
    }
    const existing = seenValues.get(value)
    if (existing) {
      throw new Error(`createResponsive: breakpoints "${existing}" and "${key}" use the same value ${value}`)
    }
    seenValues.set(value, key)
  }

  return entries
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => a.value - b.value)
}

function createQueryRecord<TBreakpoints extends BreakpointMap>(
  sorted: ReadonlyArray<NormalizedBreakpoint<BreakpointKey<TBreakpoints>>>,
  getQuery: (key: BreakpointKey<TBreakpoints>) => string,
): QueryRecord<TBreakpoints> {
  const record: Record<string, string> = {}
  for (const bp of sorted) record[bp.key] = getQuery(bp.key)
  return record as QueryRecord<TBreakpoints>
}

function attachCallable<TBreakpoints extends BreakpointMap>(
  record: QueryRecord<TBreakpoints>,
  getQuery: (key: BreakpointKey<TBreakpoints>) => string,
): ((key: BreakpointKey<TBreakpoints>) => string) & QueryRecord<TBreakpoints> {
  const fn = ((key: BreakpointKey<TBreakpoints>) => getQuery(key)) as ((key: BreakpointKey<TBreakpoints>) => string) & QueryRecord<TBreakpoints>
  Object.assign(fn, record)
  return fn
}

type MergedResponsiveOptions<TBreakpoints extends BreakpointMap> = {
  breakpoints: TBreakpoints
  aliases: ResponsiveAliases<TBreakpoints> | undefined
  unit: ResponsiveUnit
  step: number
  mediaType: string | false
}

function mergeOptions<TBreakpoints extends BreakpointMap>(
  options?: CreateResponsiveOptions<TBreakpoints>,
): MergedResponsiveOptions<TBreakpoints> {
  const preset = options?.preset
  return {
    breakpoints: options?.breakpoints ?? preset?.breakpoints ?? (defaultBreakpoints as unknown as TBreakpoints),
    aliases: options?.aliases ?? preset?.aliases,
    unit: options?.unit ?? preset?.unit ?? 'px',
    step: options?.step ?? preset?.step ?? 1,
    mediaType: options?.mediaType ?? false,
  }
}

function cssPropertyName(property: string): string {
  return property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function cssValue(value: unknown): string {
  if (typeof value === 'number') return `${value}px`
  return String(value)
}

function styleObjectToCss(style: ResponsiveCSSObject): string {
  return Object.entries(style)
    .map(([property, value]) => `  ${cssPropertyName(property)}: ${cssValue(value)};`)
    .join('\n')
}

function wrapMedia(condition: string, mediaType: string | false): string {
  return mediaType ? `@media ${mediaType} and ${condition}` : `@media ${condition}`
}

export function createResponsive<const TBreakpoints extends BreakpointMap = typeof defaultBreakpoints, const TAliases extends ResponsiveAliases<TBreakpoints> | undefined = undefined>(
  options?: CreateResponsiveOptions<TBreakpoints> & { aliases?: TAliases },
): Responsive<TBreakpoints, TAliases> {
  const merged = mergeOptions(options)
  const sorted = normalizeBreakpoints(merged.breakpoints)
  const valueByKey = new Map(sorted.map((bp) => [bp.key, bp.value]))
  const indexByKey = new Map(sorted.map((bp, index) => [bp.key, index]))

  if (merged.step <= 0 || !Number.isFinite(merged.step)) {
    throw new Error('createResponsive: step must be a positive finite number')
  }

  const assertKey = (key: BreakpointKey<TBreakpoints>) => {
    if (!valueByKey.has(key)) throw new Error(`createResponsive: unknown breakpoint "${key}"`)
  }

  const minCondition = (key: BreakpointKey<TBreakpoints>) => {
    assertKey(key)
    return `(min-width: ${formatValue(valueByKey.get(key)!, merged.unit)})`
  }

  const maxCondition = (max: number) => `(max-width: ${formatValue(max, merged.unit)})`

  const nextOf = (key: BreakpointKey<TBreakpoints>) => {
    assertKey(key)
    const index = indexByKey.get(key)!
    return sorted[index + 1]
  }

  const upQuery = (key: BreakpointKey<TBreakpoints>) => wrapMedia(minCondition(key), merged.mediaType)

  const downQuery = (key: BreakpointKey<TBreakpoints>) => {
    assertKey(key)
    const next = nextOf(key)
    if (!next) return wrapMedia('(min-width: 0px)', merged.mediaType)
    return wrapMedia(maxCondition(next.value - merged.step), merged.mediaType)
  }

  const belowQuery = (key: BreakpointKey<TBreakpoints>) => {
    assertKey(key)
    const value = valueByKey.get(key)!
    if (value === 0) return wrapMedia('(max-width: -1px)', merged.mediaType)
    return wrapMedia(maxCondition(value - merged.step), merged.mediaType)
  }

  const onlyQuery = (key: BreakpointKey<TBreakpoints>) => {
    assertKey(key)
    const current = valueByKey.get(key)!
    const next = nextOf(key)
    if (!next) return upQuery(key)
    const conditions = [`(min-width: ${formatValue(current, merged.unit)})`, maxCondition(next.value - merged.step)]
    return wrapMedia(conditions.join(' and '), merged.mediaType)
  }

  const between = (from: BreakpointKey<TBreakpoints>, to: BreakpointKey<TBreakpoints>) => {
    assertKey(from)
    assertKey(to)
    const fromValue = valueByKey.get(from)!
    const toValue = valueByKey.get(to)!
    if (fromValue >= toValue) {
      throw new Error('createResponsive: between(from, to) requires from to be smaller than to')
    }
    const conditions = [`(min-width: ${formatValue(fromValue, merged.unit)})`, maxCondition(toValue - merged.step)]
    return wrapMedia(conditions.join(' and '), merged.mediaType)
  }

  const query = (range: AliasRange<TBreakpoints>): string => {
    const keys = Object.keys(range).filter((key) => (range as Record<string, unknown>)[key] !== undefined)
    if (keys.length !== 1) throw new Error('createResponsive: range must contain exactly one query mode')
    if (range.up) return upQuery(range.up)
    if (range.down) return downQuery(range.down)
    if (range.below) return belowQuery(range.below)
    if (range.only) return onlyQuery(range.only)
    if (range.between) return between(range.between[0], range.between[1])
    throw new Error('createResponsive: invalid range')
  }

  const alias = (name: string) => {
    const aliases = merged.aliases as ResponsiveAliases<TBreakpoints> | undefined
    const range = aliases?.[name]
    if (!range) throw new Error(`createResponsive: unknown alias "${name}"`)
    return query(range)
  }

  const queryForMode = (mode: QueryMode, key: BreakpointKey<TBreakpoints>) => {
    switch (mode) {
      case 'up': return upQuery(key)
      case 'down': return downQuery(key)
      case 'below': return belowQuery(key)
      case 'only': return onlyQuery(key)
    }
  }

  const rules = <TStyle>(input: ResponsiveStyleInput<TBreakpoints, TStyle>): Array<ResponsiveRule<TBreakpoints, TStyle>> => {
    const result: Array<ResponsiveRule<TBreakpoints, TStyle>> = []
    if (input.base !== undefined) result.push({ type: 'base', style: input.base })

    const addMode = (mode: QueryMode, descending = false) => {
      const values = input[mode]
      if (!values) return
      const ordered = descending ? [...sorted].reverse() : sorted
      for (const bp of ordered) {
        const style = values[bp.key]
        if (style !== undefined) {
          result.push({ type: 'media', mode, breakpoint: bp.key, query: queryForMode(mode, bp.key), style })
        }
      }
    }

    addMode('up')
    addMode('down', true)
    addMode('below', true)
    addMode('only')

    if (input.between) {
      for (const item of input.between) {
        result.push({ type: 'media', mode: 'between', from: item.from, to: item.to, query: between(item.from, item.to), style: item.style })
      }
    }
    return result
  }

  const object = <TStyle extends ResponsiveCSSObject>(input: ResponsiveStyleInput<TBreakpoints, TStyle>): ResponsiveCSSObject => {
    const output: ResponsiveCSSObject = {}
    for (const rule of rules(input)) {
      if (rule.type === 'base') Object.assign(output, rule.style)
      else output[rule.query] = rule.style
    }
    return output
  }

  const css = (input: ResponsiveStyleInput<TBreakpoints, ResponsiveCSSObject> & { selector: string }): string => {
    const chunks: string[] = []
    for (const rule of rules(input)) {
      if (rule.type === 'base') {
        chunks.push(`${input.selector} {\n${styleObjectToCss(rule.style)}\n}`)
      } else {
        chunks.push(`${rule.query} {\n${input.selector} {\n${styleObjectToCss(rule.style)}\n}\n}`)
      }
    }
    return chunks.join('\n\n')
  }

  return {
    breakpoints: merged.breakpoints,
    sortedBreakpoints: sorted,
    aliases: merged.aliases as TAliases,
    unit: merged.unit,
    step: merged.step,
    mediaType: merged.mediaType,
    up: attachCallable(createQueryRecord(sorted, upQuery), upQuery),
    down: attachCallable(createQueryRecord(sorted, downQuery), downQuery),
    below: attachCallable(createQueryRecord(sorted, belowQuery), belowQuery),
    only: attachCallable(createQueryRecord(sorted, onlyQuery), onlyQuery),
    between,
    alias: alias as Responsive<TBreakpoints, TAliases>['alias'],
    query,
    rules,
    object,
    css,
  }
}

export function createResponsiveStyle<TBreakpoints extends BreakpointMap, TInput, TOutput>(
  responsive: Pick<Responsive<TBreakpoints>, 'rules'>,
  adapter: StyleAdapter<TInput, TOutput>,
) {
  return (input: ResponsiveStyleInput<TBreakpoints, TInput>): TOutput => {
    const parts = responsive.rules(input).map((rule) => {
      if (rule.type === 'base') return rule.style as unknown as TOutput
      return adapter.rule(rule.query, rule.style)
    })
    return adapter.merge(parts)
  }
}

export function getCurrentBreakpoint<TBreakpoints extends BreakpointMap>(
  sorted: ReadonlyArray<NormalizedBreakpoint<BreakpointKey<TBreakpoints>>>,
  width: number,
): BreakpointKey<TBreakpoints> | undefined {
  let current: BreakpointKey<TBreakpoints> | undefined
  for (const bp of sorted) {
    if (width >= bp.value) current = bp.key
    else break
  }
  return current
}

export function getPreviousBreakpoint<TBreakpoints extends BreakpointMap>(
  responsive: Pick<Responsive<TBreakpoints>, 'sortedBreakpoints'>,
  key: BreakpointKey<TBreakpoints>,
): NormalizedBreakpoint<BreakpointKey<TBreakpoints>> | undefined {
  const index = responsive.sortedBreakpoints.findIndex((bp) => bp.key === key)
  return index > 0 ? responsive.sortedBreakpoints[index - 1] : undefined
}

export function getNextBreakpoint<TBreakpoints extends BreakpointMap>(
  responsive: Pick<Responsive<TBreakpoints>, 'sortedBreakpoints'>,
  key: BreakpointKey<TBreakpoints>,
): NormalizedBreakpoint<BreakpointKey<TBreakpoints>> | undefined {
  const index = responsive.sortedBreakpoints.findIndex((bp) => bp.key === key)
  return index >= 0 ? responsive.sortedBreakpoints[index + 1] : undefined
}
