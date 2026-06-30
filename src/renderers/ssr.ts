import type { ExtractedStyle, StyleRenderer, StyleRule } from '../core/types'

export interface SSRRendererOptions {
  key?: string
  nonce?: string
}

export interface CriticalCSSOptions {
  include?: (rule: StyleRule) => boolean
}

export interface StreamingStyleChunk {
  cssText: string
  rules: StyleRule[]
  styleTags: string
}

export interface StreamingSSRStyleController {
  flushChunk(): StreamingStyleChunk
}

export interface SSRStyleRenderer extends StyleRenderer, StreamingSSRStyleController {}

export function createSSRRenderer(options: SSRRendererOptions = {}): SSRStyleRenderer {
  const key = options.key ?? 'wse'
  const rules: StyleRule[] = []
  let flushedCount = 0

  const orderedRules = () => [...rules].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
  const styleTag = (targetRules: StyleRule[]): string => {
    const cssText = targetRules.map(rule => rule.cssText).join('')
    const nonce = options.nonce ? ` nonce="${escapeHtml(options.nonce)}"` : ''
    const ids = targetRules.map(rule => rule.id).join(' ')
    const idsAttr = ids ? ` data-${key}-ids="${escapeHtml(ids)}"` : ''
    return `<style data-${key}="${key}"${idsAttr}${nonce}>${cssText}</style>`
  }

  return {
    insert(rule) {
      if (!rules.some(item => item.id === rule.id)) rules.push(rule)
    },
    remove(id) {
      const index = rules.findIndex(rule => rule.id === id)
      if (index >= 0) rules.splice(index, 1)
    },
    flush() {
      rules.splice(0, rules.length)
    },
    extract(): ExtractedStyle {
      const extractedRules = orderedRules()
      const cssText = extractedRules.map(rule => rule.cssText).join('')
      return {
        cssText,
        rules: extractedRules,
        styleTags: styleTag(extractedRules),
      }
    },
    flushChunk(): StreamingStyleChunk {
      const extractedRules = orderedRules()
      const chunkRules = extractedRules.slice(flushedCount)
      flushedCount = extractedRules.length
      const cssText = chunkRules.map(rule => rule.cssText).join('')
      return {
        cssText,
        rules: chunkRules,
        styleTags: styleTag(chunkRules),
      }
    },
  }
}

export function extractCriticalCSS(extracted: ExtractedStyle, options: CriticalCSSOptions = {}): ExtractedStyle {
  const criticalRules = options.include ? extracted.rules.filter(options.include) : extracted.rules
  const criticalCss = criticalRules.map(rule => rule.cssText).join('')
  return {
    ...extracted,
    criticalCss,
  }
}

function escapeHtml(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
