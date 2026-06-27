import type { ExtractedStyle, StyleRenderer, StyleRule } from '../core/types'

export interface SSRRendererOptions {
  key?: string
  nonce?: string
}

export function createSSRRenderer(options: SSRRendererOptions = {}): StyleRenderer {
  const key = options.key ?? 'wse'
  const rules: StyleRule[] = []

  const orderedRules = () => [...rules].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))

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
      const nonce = options.nonce ? ` nonce="${escapeHtml(options.nonce)}"` : ''
      return {
        cssText,
        rules: extractedRules,
        styleTags: `<style data-${key}="${key}"${nonce}>${cssText}</style>`,
      }
    },
  }
}

function escapeHtml(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
