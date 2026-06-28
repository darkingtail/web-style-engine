import type { StyleEngine } from '../core/types'
import type { AnyResponsive } from '../responsive/types'
import { createStylesCore, type CreateStylesCoreOptions, type CreateStylesRuntimeContext, type StyleFactory } from '../create-styles/core'

export interface FrameworkStyleAdapter<Provider, UseValue> {
  StyleProvider: Provider
  ThemeProvider: Provider
  createStyles: <Theme, Props, TResponsive extends AnyResponsive = AnyResponsive>(factory: StyleFactory<Theme, Props, TResponsive>, options?: CreateStylesCoreOptions) => UseValue
  useTheme: () => unknown
  useStyleEngine: () => StyleEngine
}

export interface AdapterRuntime<Theme = unknown, TResponsive extends AnyResponsive = AnyResponsive> {
  engine: StyleEngine
  theme: Theme
  responsive?: TResponsive
}

export function createAdapterRuntime<Theme, TResponsive extends AnyResponsive = AnyResponsive>(engine: StyleEngine, theme: Theme, responsive?: TResponsive): AdapterRuntime<Theme, TResponsive> {
  const runtime: AdapterRuntime<Theme, TResponsive> = { engine, theme }
  if (responsive !== undefined) runtime.responsive = responsive
  return runtime
}

export function resolveCreateStyles<Theme, Props, TResponsive extends AnyResponsive = AnyResponsive>(
  runtime: AdapterRuntime<Theme, TResponsive>,
  factory: StyleFactory<Theme, Props, TResponsive>,
  options?: CreateStylesCoreOptions,
) {
  const run = createStylesCore(runtime.engine, factory, options)
  return (props: Props, cacheKey?: string) => {
    const context: CreateStylesRuntimeContext<Theme, Props, TResponsive> = {
      theme: runtime.theme,
      props,
    }
    if (runtime.responsive !== undefined) context.responsive = runtime.responsive
    if (cacheKey !== undefined) context.cacheKey = cacheKey
    return run(context)
  }
}

export type FrameworkAdapterKind = 'vue' | 'react' | 'solid'

export interface MinimalFrameworkAdapter<Theme, TResponsive extends AnyResponsive = AnyResponsive> {
  kind: FrameworkAdapterKind
  runtime: AdapterRuntime<Theme, TResponsive>
  createStyles<Props>(factory: StyleFactory<Theme, Props, TResponsive>, options?: CreateStylesCoreOptions): (props: Props, cacheKey?: string) => ReturnType<ReturnType<typeof createStylesCore<Theme, Props, TResponsive>>>
  useTheme(): Theme
  useStyleEngine(): StyleEngine
}

export function createMinimalFrameworkAdapter<Theme, TResponsive extends AnyResponsive = AnyResponsive>(kind: FrameworkAdapterKind, runtime: AdapterRuntime<Theme, TResponsive>): MinimalFrameworkAdapter<Theme, TResponsive> {
  return {
    kind,
    runtime,
    createStyles<Props>(factory: StyleFactory<Theme, Props, TResponsive>, options?: CreateStylesCoreOptions) {
      return resolveCreateStyles<Theme, Props, TResponsive>(runtime, factory, options)
    },
    useTheme() {
      return runtime.theme
    },
    useStyleEngine() {
      return runtime.engine
    },
  }
}
