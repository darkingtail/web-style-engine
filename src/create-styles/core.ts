import type { StyleEngine, StyleInput } from '../core/types'
import type { AnyResponsive } from '../responsive/types'

export type StyleFactory<Theme, Props, TResponsive extends AnyResponsive = AnyResponsive> = (
  utils: CreateStylesUtils<Theme, TResponsive>,
  props: Props,
) => Record<string, StyleInput | string>

export interface CreateStylesRuntimeContext<Theme, Props, TResponsive extends AnyResponsive = AnyResponsive> {
  theme: Theme
  props: Props
  responsive?: TResponsive
  cacheKey?: string
}

export interface CreateStylesUtils<Theme, TResponsive extends AnyResponsive = AnyResponsive> {
  theme: Theme
  token?: unknown
  css: StyleEngine['css']
  cx: StyleEngine['cx']
  keyframes: StyleEngine['keyframes']
  responsive?: TResponsive
  cssVar?: Record<string, string>
}

export interface CreateStylesCoreOptions {
  label?: string
  cache?: boolean
  token?: unknown
  cssVar?: Record<string, string>
}

export interface CreateStylesResult<Styles extends Record<string, string> = Record<string, string>> {
  styles: Styles
  cx: StyleEngine['cx']
  theme: unknown
}

export function createStylesCore<Theme, Props, TResponsive extends AnyResponsive = AnyResponsive, Styles extends Record<string, string> = Record<string, string>>(
  engine: StyleEngine,
  factory: StyleFactory<Theme, Props, TResponsive>,
  options: CreateStylesCoreOptions = {},
): (context: CreateStylesRuntimeContext<Theme, Props, TResponsive>) => CreateStylesResult<Styles> {
  const cache = new Map<string, CreateStylesResult<Styles>>()
  const shouldCache = options.cache ?? true

  return context => {
    const cacheKey = context.cacheKey ?? undefined
    if (shouldCache && cacheKey && cache.has(cacheKey)) return cache.get(cacheKey)!

    const utils: CreateStylesUtils<Theme, TResponsive> = {
      theme: context.theme,
      css: engine.css,
      cx: engine.cx,
      keyframes: engine.keyframes,
    }
    if (options.token !== undefined) utils.token = options.token
    if (context.responsive !== undefined) utils.responsive = context.responsive
    if (options.cssVar !== undefined) utils.cssVar = options.cssVar

    const definitions = factory(utils, context.props)
    const styles = {} as Styles

    for (const [slot, input] of Object.entries(definitions)) {
      styles[slot as keyof Styles] = engine.css(input, {
        label: options.label ? `${options.label}-${slot}` : slot,
      }) as Styles[keyof Styles]
    }

    const result: CreateStylesResult<Styles> = {
      styles,
      cx: engine.cx,
      theme: context.theme,
    }

    if (shouldCache && cacheKey) cache.set(cacheKey, result)
    return result
  }
}
