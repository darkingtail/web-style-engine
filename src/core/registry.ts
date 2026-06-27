import type { StyleRegistry, StyleRule } from './types'

export function createStyleRegistry(initialRules: StyleRule[] = []): StyleRegistry {
  const rules = new Map<string, StyleRule>()

  for (const rule of initialRules) {
    rules.set(rule.id, rule)
  }

  return {
    has(id) {
      return rules.has(id)
    },
    get(id) {
      return rules.get(id)
    },
    add(rule) {
      rules.set(rule.id, rule)
    },
    remove(id) {
      rules.delete(id)
    },
    clear() {
      rules.clear()
    },
    values() {
      return [...rules.values()].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
    },
  }
}
