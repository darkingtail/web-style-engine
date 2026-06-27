import type { StyleEngine } from '../core/types'
import { createStylesCore, type CreateStylesCoreOptions, type CreateStylesRuntimeContext, type StyleFactory } from '../create-styles/core'

export interface FrameworkStyleAdapter<Provider, UseValue> {
  StyleProvider: Provider
  ThemeProvider: Provider
  createStyles: <Theme, Props>(factory: StyleFactory<Theme, Props>, options?: CreateStylesCoreOptions) => UseValue
  useTheme: () => unknown
  useStyleEngine: () => StyleEngine
}

export interface AdapterRuntime<Theme = unknown> {
  engine: StyleEngine
  theme: Theme
  responsive?: unknown
}

export function createAdapterRuntime<Theme>(engine: StyleEngine, theme: Theme, responsive?: unknown): AdapterRuntime<Theme> {
  const runtime: AdapterRuntime<Theme> = { engine, theme }
  if (responsive !== undefined) runtime.responsive = responsive
  return runtime
}

export function resolveCreateStyles<Theme, Props>(
  runtime: AdapterRuntime<Theme>,
  factory: StyleFactory<Theme, Props>,
  options?: CreateStylesCoreOptions,
) {
  const run = createStylesCore(runtime.engine, factory, options)
  return (props: Props, cacheKey?: string) => {
    const context: CreateStylesRuntimeContext<Theme, Props> = {
      theme: runtime.theme,
      props,
    }
    if (runtime.responsive !== undefined) context.responsive = runtime.responsive
    if (cacheKey !== undefined) context.cacheKey = cacheKey
    return run(context)
  }
}

export type FrameworkAdapterKind = 'vue' | 'react' | 'solid'

export interface MinimalFrameworkAdapter<Theme> {
  kind: FrameworkAdapterKind
  runtime: AdapterRuntime<Theme>
  createStyles<Props>(factory: StyleFactory<Theme, Props>, options?: CreateStylesCoreOptions): (props: Props, cacheKey?: string) => ReturnType<ReturnType<typeof createStylesCore<Theme, Props>>>
  useTheme(): Theme
  useStyleEngine(): StyleEngine
}

export function createMinimalFrameworkAdapter<Theme>(kind: FrameworkAdapterKind, runtime: AdapterRuntime<Theme>): MinimalFrameworkAdapter<Theme> {
  return {
    kind,
    runtime,
    createStyles<Props>(factory: StyleFactory<Theme, Props>, options?: CreateStylesCoreOptions) {
      return resolveCreateStyles(runtime, factory, options)
    },
    useTheme() {
      return runtime.theme
    },
    useStyleEngine() {
      return runtime.engine
    },
  }
}
