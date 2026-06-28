import type { ClassValue, CSSObject, StyleInput } from './types'

const unitlessProperties = new Set([
  'animationIterationCount',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridArea',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
])

export function hashString(input: string): string {
  let hash = 5381
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index)
  }
  return (hash >>> 0).toString(36)
}

export function sanitizeLabel(label: string): string {
  return label.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export function hyphenate(property: string): string {
  return property.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}

export function serializeStyleInput(input: StyleInput): string {
  if (typeof input === 'string') return input
  return serializeCSSObject(input)
}

export function serializeCSSObject(input: CSSObject): string {
  let cssText = ''

  for (const [property, value] of Object.entries(input)) {
    if (value === null || value === undefined || value === false) continue

    if (typeof value === 'object') {
      cssText += `${property}{${serializeCSSObject(value)}}`
      continue
    }

    const cssProperty = property.startsWith('--') ? property : hyphenate(property)
    const cssValue = typeof value === 'number' && value !== 0 && !unitlessProperties.has(property) ? `${value}px` : String(value)
    cssText += `${cssProperty}:${cssValue};`
  }

  return cssText
}

export function wrapClassRule(selector: string, cssText: string): string {
  const trimmed = cssText.trim()
  if (!trimmed.includes('@')) return `${selector}{${trimmed}}`

  let declarations = ''
  let atRules = ''
  let index = 0

  while (index < trimmed.length) {
    const atIndex = trimmed.indexOf('@', index)
    if (atIndex === -1) {
      declarations += trimmed.slice(index)
      break
    }

    declarations += trimmed.slice(index, atIndex)
    const openIndex = trimmed.indexOf('{', atIndex)
    if (openIndex === -1) {
      declarations += trimmed.slice(atIndex)
      break
    }

    let depth = 0
    let closeIndex = openIndex
    for (; closeIndex < trimmed.length; closeIndex++) {
      const char = trimmed[closeIndex]
      if (char === '{') depth++
      if (char === '}') depth--
      if (depth === 0) break
    }

    const prelude = trimmed.slice(atIndex, openIndex)
    const body = trimmed.slice(openIndex + 1, closeIndex)
    atRules += `${prelude}{${selector}{${body}}}`
    index = closeIndex + 1
  }

  const baseRule = declarations.trim() ? `${selector}{${declarations.trim()}}` : ''
  return `${baseRule}${atRules}`
}

export function cx(...classNames: ClassValue[]): string {
  const result: string[] = []

  const visit = (value: ClassValue): void => {
    if (!value) return
    if (typeof value === 'string' || typeof value === 'number') {
      result.push(String(value))
      return
    }
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    for (const [className, enabled] of Object.entries(value)) {
      if (enabled) result.push(className)
    }
  }

  classNames.forEach(visit)
  return [...new Set(result)].join(' ')
}
