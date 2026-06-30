import type { CSSVarsOptions, GlobalStyleOptions, StyleEngine, StyleEngineOptions, StyleInput, StyleOptions, StyleRule, StyleTransform, StyleTransformDiagnostic } from './types'
import { createStyleRegistry } from './registry'
import { cx, hashString, sanitizeLabel, serializeStyleInput, wrapClassRule } from './serialize'
import { createDOMRenderer } from '../renderers/dom'
import { createNoopRenderer } from '../renderers/noop'
import { flattenToken, tokenPathToVarName } from '../tokens/css-vars'

export function createStyleEngine(options: StyleEngineOptions = {}): StyleEngine {
  const key = options.key ?? 'wse'
  const createDOMRendererOptions = () => {
    const rendererOptions: Parameters<typeof createDOMRenderer>[0] = { key }
    if (options.container !== undefined) rendererOptions.container = options.container
    if (options.nonce !== undefined) rendererOptions.nonce = options.nonce
    if (options.insertionPoint !== undefined) rendererOptions.insertionPoint = options.insertionPoint
    return rendererOptions
  }
  const hasDOMRendererOptions = options.container !== undefined || options.nonce !== undefined || options.insertionPoint !== undefined
  const renderer = options.renderer ?? (hasDOMRendererOptions ? createDOMRenderer(createDOMRendererOptions()) : createNoopRenderer())
  const registry = options.registry ?? createStyleRegistry()
  const transforms = normalizeTransforms(options.transformers, options.plugins)
  const diagnostics: StyleTransformDiagnostic[] = []
  const dev = options.dev ?? process.env.NODE_ENV !== 'production'

  const withStyleDefaults = (styleOptions: StyleOptions = {}): StyleOptions => {
    const next: StyleOptions = { ...styleOptions }
    if (next.layer === undefined && options.layer !== undefined) next.layer = options.layer
    if (next.specificity === undefined && options.specificity !== undefined) next.specificity = options.specificity
    return next
  }

  const withGlobalDefaults = <TOptions extends GlobalStyleOptions>(globalOptions: TOptions = {} as TOptions): TOptions => {
    const next: TOptions = { ...globalOptions }
    if (next.layer === undefined && options.layer !== undefined) next.layer = options.layer
    return next
  }

  const transform = (cssText: string, styleOptions?: StyleOptions | GlobalStyleOptions): string => {
    return transforms.reduce((current, item) => {
      const context = styleOptions ? { engineKey: key, options: styleOptions, pluginName: item.name } : { engineKey: key, pluginName: item.name }
      const next = item.transform(current, context)
      if (options.diagnostics || dev) {
        diagnostics.push({
          pluginName: item.name,
          before: current,
          after: next,
          changed: current !== next,
          ...(styleOptions ? { options: styleOptions } : {}),
        })
      }
      return next
    }, cssText)
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
      styleOptions = withStyleDefaults(styleOptions)
      const body = transform(serializeStyleInput(input), styleOptions)
      const id = hashString(`${key}|css|${styleOptions.layer ?? ''}|${styleOptions.specificity ?? ''}|${body}`)
      const label = styleOptions.label && dev ? `-${sanitizeLabel(styleOptions.label)}` : ''
      const className = `${key}${label}-${id}`
      const selector = styleOptions.specificity === 'low'
        ? `:where(.${className})`
        : styleOptions.specificity === 'high'
          ? `.${className}.${className}`
          : `.${className}`
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
      styleOptions = withStyleDefaults(styleOptions)
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
    fontFace(input: StyleInput, globalOptions: GlobalStyleOptions = {}) {
      globalOptions = withGlobalDefaults(globalOptions)
      const body = transform(serializeStyleInput(input), globalOptions)
      const id = globalOptions.id ?? `font-face-${hashString(`${key}|font-face|${body}`)}`
      const cssText = globalOptions.layer ? `@layer ${globalOptions.layer}{@font-face{${body}}}` : `@font-face{${body}}`
      insertRule(createRule({
        id,
        cssText,
        layer: globalOptions.layer,
        priority: globalOptions.priority,
        metadata: globalOptions.metadata,
      }))
      return id
    },
    injectGlobal(input: StyleInput, globalOptions: GlobalStyleOptions = {}) {
      globalOptions = withGlobalDefaults(globalOptions)
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
      const varsOptions = withGlobalDefaults((typeof scopeOrTokens === 'string' ? maybeOptions : maybeTokens) as CSSVarsOptions | undefined)
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
    getDiagnostics() {
      return [...diagnostics]
    },
    clearDiagnostics() {
      diagnostics.splice(0, diagnostics.length)
    },
  }

  return engine
}

function normalizeTransforms(transformers: StyleTransform[] = [], plugins: NonNullable<StyleEngineOptions['plugins']> = []) {
  return [...transformers, ...plugins]
    .map((item, index) => {
      if (typeof item === 'function') {
        return {
          name: `transformer-${index}`,
          order: 0,
          index,
          transform: item,
        }
      }
      return {
        name: item.name,
        order: item.order ?? 0,
        index,
        transform: item.transform,
      }
    })
    .sort((a, b) => a.order - b.order || a.index - b.index)
}
