import type { ExtractedStyle, StyleRenderer, StyleRule } from '../core/types'

export interface MockRenderer extends StyleRenderer {
  rules: StyleRule[]
}

export function createMockRenderer(): MockRenderer {
  const rules: StyleRule[] = []

  return {
    rules,
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
    hydrate(source?: unknown) {
      if (Array.isArray(source)) {
        for (const rule of source as StyleRule[]) this.insert(rule)
      }
    },
    extract(): ExtractedStyle {
      const ordered = [...rules].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
      return {
        cssText: ordered.map(rule => rule.cssText).join(''),
        rules: ordered,
      }
    },
  }
}
