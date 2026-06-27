import type { CSSVarsOptions, GlobalStyleOptions, StyleEngine, StyleEngineOptions, StyleInput, StyleOptions, StyleRule } from './types'
import { createStyleRegistry } from './registry'
import { cx, hashString, sanitizeLabel, serializeStyleInput, wrapClassRule } from './serialize'
import { createNoopRenderer } from '../renderers/noop'
import { flattenToken, tokenPathToVarName } from '../tokens/css-vars'

export function createStyleEngine(options: StyleEngineOptions = {}): StyleEngine {
  const key = options.key ?? 'wse'
  const renderer = options.renderer ?? createNoopRenderer()
  const registry = options.registry ?? createStyleRegistry()
  const transformers = options.transformers ?? []
  const dev = options.dev ?? process.env.NODE_ENV !== 'production'

  const transform = (cssText: string, styleOptions?: StyleOptions | GlobalStyleOptions): string => {
    const context = styleOptions ? { engineKey: key, options: styleOptions } : { engineKey: key }
    return transformers.reduce((current, transformer) => transformer(current, context), cssText)
  }

  const insertRule = (rule: StyleRule): void => {
    if (registry.has(rule.id)) return
    registry.add(rule)
    renderer.insert(rule)
  }

  const createRule = (rule: {
    id: string
    className?: string | undefined
    cssText: string
    layer?: string | undefined
    priority?: number | undefined
    metadata?: Record<string, unknown> | undefined
  }): StyleRule => {
    const next: StyleRule = {
      id: rule.id,
      cssText: rule.cssText,
    }
    if (rule.className !== undefined) next.className = rule.className
    if (rule.layer !== undefined) next.layer = rule.layer
    if (rule.priority !== undefined) next.priority = rule.priority
    if (rule.metadata !== undefined) next.metadata = rule.metadata
    return next
  }

  const engine: StyleEngine = {
    key,
    css(input: StyleInput, styleOptions: StyleOptions = {}) {
      const body = transform(serializeStyleInput(input), styleOptions)
      const id = hashString(`${key}|css|${styleOptions.layer ?? ''}|${styleOptions.specificity ?? ''}|${body}`)
      const label = styleOptions.label && dev ? `-${sanitizeLabel(styleOptions.label)}` : ''
      const className = `${key}${label}-${id}`
      const selector = styleOptions.specificity === 'low' ? `:where(.${className})` : `.${className}`
      const cssText = styleOptions.layer ? `@layer ${styleOptions.layer}{${wrapClassRule(selector, body)}}` : wrapClassRule(selector, body)

      insertRule(createRule({
        id,
        className,
        cssText,
        layer: styleOptions.layer,
        priority: styleOptions.priority,
        metadata: styleOptions.metadata,
      }))

      return className
    },
    cx,
    keyframes(input: StyleInput, styleOptions: StyleOptions = {}) {
      const body = transform(serializeStyleInput(input), styleOptions)
      const id = hashString(`${key}|keyframes|${body}`)
      const label = styleOptions.label && dev ? `-${sanitizeLabel(styleOptions.label)}` : ''
      const name = `${key}${label}-${id}`
      insertRule(createRule({
        id: `kf-${id}`,
        cssText: `@keyframes ${name}{${body}}`,
        priority: styleOptions.priority,
        metadata: styleOptions.metadata,
      }))
      return name
    },
    injectGlobal(input: StyleInput, globalOptions: GlobalStyleOptions = {}) {
      const body = transform(serializeStyleInput(input), globalOptions)
      const id = globalOptions.id ?? `global-${hashString(`${key}|global|${body}`)}`
      const cssText = globalOptions.layer ? `@layer ${globalOptions.layer}{${body}}` : body
      insertRule(createRule({
        id,
        cssText,
        layer: globalOptions.layer,
        priority: globalOptions.priority,
        metadata: globalOptions.metadata,
      }))
      return id
    },
    vars(scopeOrTokens: string | Record<string, unknown>, maybeTokens?: Record<string, unknown> | CSSVarsOptions, maybeOptions?: CSSVarsOptions) {
      const scope = typeof scopeOrTokens === 'string' ? scopeOrTokens : ':root'
      const tokens = typeof scopeOrTokens === 'string' ? (maybeTokens as Record<string, unknown>) : scopeOrTokens
      const varsOptions = (typeof scopeOrTokens === 'string' ? maybeOptions : maybeTokens) as CSSVarsOptions | undefined
      const prefix = varsOptions?.prefix ?? key
      const flat = flattenToken(tokens)
      const body = Object.entries(flat)
        .map(([path, value]) => `${tokenPathToVarName(path, prefix)}:${String(value)};`)
        .join('')
      const id = varsOptions?.id ?? `vars-${hashString(`${key}|${scope}|${body}`)}`
      insertRule(createRule({
        id,
        cssText: `${scope}{${body}}`,
        layer: varsOptions?.layer,
        priority: varsOptions?.priority,
        metadata: varsOptions?.metadata,
      }))
      return id
    },
    flush() {
      registry.clear()
      renderer.flush?.()
    },
    dispose(id: string) {
      registry.remove(id)
      renderer.remove?.(id)
    },
    hydrate(source?: unknown) {
      renderer.hydrate?.(source)
    },
    extract() {
      return renderer.extract?.() ?? {
        cssText: registry.values().map(rule => rule.cssText).join(''),
        rules: registry.values(),
      }
    },
    getRegistry() {
      return registry
    },
  }

  return engine
}
