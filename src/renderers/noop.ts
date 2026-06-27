import type { ExtractedStyle, StyleRenderer, StyleRule } from '../core/types'

export function createNoopRenderer(): StyleRenderer {
  return {
    insert() {},
    remove() {},
    flush() {},
    hydrate() {},
    extract(): ExtractedStyle {
      return {
        cssText: '',
        rules: [],
      }
    },
  }
}
