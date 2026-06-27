export interface FlattenTokenOptions {
  separator?: string
}

export function flattenToken(token: Record<string, unknown>, options: FlattenTokenOptions = {}): Record<string, string | number> {
  const separator = options.separator ?? '-'
  const result: Record<string, string | number> = {}

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

export function createCSSVarMap(token: Record<string, unknown>, prefix = 'wse'): Record<string, string> {
  const flat = flattenToken(token)
  return Object.fromEntries(Object.keys(flat).map(path => [path, `var(${tokenPathToVarName(path, prefix)})`]))
}
