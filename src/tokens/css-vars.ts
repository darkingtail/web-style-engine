export interface FlattenTokenOptions {
  separator?: string
}

export type TokenPrimitive = string | number
export type TokenRecord = Record<string, unknown>

export interface CSSVarMapOptions {
  prefix?: string
  fallback?: boolean | Record<string, TokenPrimitive>
}

export interface TokenAliasOptions {
  separator?: string
  maxDepth?: number
}

export interface DerivativeContext<TToken extends TokenRecord = TokenRecord> {
  seed: TToken
  current: TokenRecord
}

export type TokenDerivative<TToken extends TokenRecord = TokenRecord> = (token: TokenRecord, context: DerivativeContext<TToken>) => TokenRecord

export interface TokenDiff {
  added: Record<string, TokenPrimitive>
  removed: Record<string, TokenPrimitive>
  changed: Record<string, { before: TokenPrimitive; after: TokenPrimitive }>
}

export function flattenToken(token: TokenRecord, options: FlattenTokenOptions = {}): Record<string, TokenPrimitive> {
  const separator = options.separator ?? '-'
  const result: Record<string, TokenPrimitive> = {}

  const visit = (value: unknown, path: string[]): void => {
    if (value === null || value === undefined) return
    if (typeof value === 'string' || typeof value === 'number') {
      result[path.join(separator)] = value
      return
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        visit(child, [...path, key])
      }
    }
  }

  for (const [key, value] of Object.entries(token)) {
    visit(value, [key])
  }

  return result
}

export function tokenPathToVarName(path: string, prefix = 'wse'): string {
  return `--${prefix}-${path.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[._\s]+/g, '-').toLowerCase()}`
}

function normalizeCSSVarMapOptions(prefixOrOptions?: string | CSSVarMapOptions): { prefix: string; fallback?: CSSVarMapOptions['fallback'] } {
  if (typeof prefixOrOptions === 'string') return { prefix: prefixOrOptions }
  const options: { prefix: string; fallback?: CSSVarMapOptions['fallback'] } = { prefix: prefixOrOptions?.prefix ?? 'wse' }
  if (prefixOrOptions?.fallback !== undefined) options.fallback = prefixOrOptions.fallback
  return options
}

export function createCSSVarReference(path: string, options: CSSVarMapOptions = {}, fallbackValue?: TokenPrimitive): string {
  const name = tokenPathToVarName(path, options.prefix ?? 'wse')
  const fallback = fallbackValue ?? (typeof options.fallback === 'object' ? options.fallback[path] : undefined)
  if (fallback !== undefined) return `var(${name}, ${String(fallback)})`
  return `var(${name})`
}

export function createCSSVarMap(token: TokenRecord, prefixOrOptions: string | CSSVarMapOptions = 'wse'): Record<string, string> {
  const options = normalizeCSSVarMapOptions(prefixOrOptions)
  const flat = flattenToken(token)
  return Object.fromEntries(Object.entries(flat).map(([path, value]) => {
    const referenceOptions: CSSVarMapOptions = { prefix: options.prefix }
    if (options.fallback !== undefined) referenceOptions.fallback = options.fallback
    return [
      path,
      createCSSVarReference(path, referenceOptions, options.fallback === true ? value : undefined),
    ]
  }))
}

function pathToSegments(path: string, separator: string): string[] {
  return path.includes(separator) ? path.split(separator) : path.split('.')
}

function getTokenPath(token: TokenRecord, path: string, separator: string): unknown {
  let current: unknown = token
  for (const segment of pathToSegments(path, separator)) {
    if (!segment) return undefined
    if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined
    current = (current as TokenRecord)[segment]
  }
  return current
}

function resolveValue(value: unknown, root: TokenRecord, options: Required<TokenAliasOptions>, stack: string[]): unknown {
  if (typeof value !== 'string') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value
    return Object.fromEntries(Object.entries(value as TokenRecord).map(([key, child]) => [
      key,
      resolveValue(child, root, options, [...stack, key]),
    ]))
  }

  const match = /^\{(.+)\}$/.exec(value.trim())
  if (!match) return value
  const path = match[1]
  if (!path) return value
  if (stack.includes(path)) {
    throw new Error(`resolveTokenAliases: circular token alias "${path}"`)
  }
  if (stack.length >= options.maxDepth) {
    throw new Error(`resolveTokenAliases: token alias depth exceeded ${options.maxDepth}`)
  }
  const next = getTokenPath(root, path, options.separator)
  if (next === undefined) {
    throw new Error(`resolveTokenAliases: unknown token alias "${path}"`)
  }
  return resolveValue(next, root, options, [...stack, path])
}

export function resolveTokenAliases<TToken extends TokenRecord>(token: TToken, options: TokenAliasOptions = {}): TToken {
  const normalized = {
    separator: options.separator ?? '.',
    maxDepth: options.maxDepth ?? 16,
  }
  return resolveValue(token, token, normalized, []) as TToken
}

function mergeToken(base: TokenRecord, patch: TokenRecord): TokenRecord {
  const result: TokenRecord = { ...base }
  for (const [key, value] of Object.entries(patch)) {
    const previous = result[key]
    if (
      previous &&
      value &&
      typeof previous === 'object' &&
      typeof value === 'object' &&
      !Array.isArray(previous) &&
      !Array.isArray(value)
    ) {
      result[key] = mergeToken(previous as TokenRecord, value as TokenRecord)
    } else {
      result[key] = value
    }
  }
  return result
}

export function createDerivativeToken<TToken extends TokenRecord>(seed: TToken, derivatives: Array<TokenDerivative<TToken>> = []): TokenRecord {
  return derivatives.reduce<TokenRecord>((current, derivative) => {
    const patch = derivative(current, { seed, current })
    return mergeToken(current, patch)
  }, seed)
}

export function diffToken(previous: TokenRecord, next: TokenRecord): TokenDiff {
  const before = flattenToken(previous)
  const after = flattenToken(next)
  const added: Record<string, TokenPrimitive> = {}
  const removed: Record<string, TokenPrimitive> = {}
  const changed: Record<string, { before: TokenPrimitive; after: TokenPrimitive }> = {}

  for (const [path, value] of Object.entries(after)) {
    if (!(path in before)) added[path] = value
    else if (before[path] !== value) changed[path] = { before: before[path]!, after: value }
  }

  for (const [path, value] of Object.entries(before)) {
    if (!(path in after)) removed[path] = value
  }

  return { added, removed, changed }
}
