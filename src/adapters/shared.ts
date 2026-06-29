import type { StyleEngine } from '../core/types'
import type { AnyResponsive, BreakpointMap, ResponsiveAliases, ResponsiveObserver, ResponsiveSnapshot } from '../responsive/types'
import { createStylesCore, type CreateStylesCoreOptions, type CreateStylesRuntimeContext, type StyleFactory } from '../create-styles/core'

export interface FrameworkStyleAdapter<Provider, UseValue> {
  StyleProvider: Provider
  ThemeProvider: Provider
  createStyles: <Theme, Props, TResponsive extends AnyResponsive = AnyResponsive>(factory: StyleFactory<Theme, Props, TResponsive>, options?: CreateStylesCoreOptions) => UseValue
  useTheme: () => unknown
  useStyleEngine: () => StyleEngine
}

export type ThemeSource<Theme> = Theme | (() => Theme)

export interface AdapterRuntime<Theme = unknown, TResponsive extends AnyResponsive = AnyResponsive> {
  engine: StyleEngine
  theme: ThemeSource<Theme>
  responsive?: TResponsive
  getTheme(): Theme
  setTheme(theme: ThemeSource<Theme>): void
  updateTheme(updater: (theme: Theme) => Theme): void
  subscribeTheme(listener: () => void): () => void
}

export interface AdapterProviderScope<Theme, TResponsive extends AnyResponsive = AnyResponsive> {
  theme?: ThemeSource<Theme>
  responsive?: TResponsive
}

export interface AdapterProvider<Theme, TResponsive extends AnyResponsive = AnyResponsive> {
  kind: FrameworkAdapterKind
  runtime: AdapterRuntime<Theme, TResponsive>
  provide(scope: AdapterProviderScope<Theme, TResponsive>): () => void
  getValue(): AdapterRuntime<Theme, TResponsive>
}

function resolveTheme<Theme>(theme: ThemeSource<Theme>): Theme {
  return typeof theme === 'function' ? (theme as () => Theme)() : theme
}

export function createAdapterRuntime<Theme, TResponsive extends AnyResponsive = AnyResponsive>(engine: StyleEngine, theme: ThemeSource<Theme>, responsive?: TResponsive): AdapterRuntime<Theme, TResponsive> {
  const listeners = new Set<() => void>()
  const runtime: AdapterRuntime<Theme, TResponsive> = {
    engine,
    theme,
    getTheme() {
      return resolveTheme(runtime.theme)
    },
    setTheme(nextTheme) {
      runtime.theme = nextTheme
      for (const listener of listeners) listener()
    },
    updateTheme(updater) {
      runtime.setTheme(updater(runtime.getTheme()))
    },
    subscribeTheme(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
  if (responsive !== undefined) runtime.responsive = responsive
  return runtime
}

export function createAdapterProvider<Theme, TResponsive extends AnyResponsive = AnyResponsive>(
  kind: FrameworkAdapterKind,
  runtime: AdapterRuntime<Theme, TResponsive>,
): AdapterProvider<Theme, TResponsive> {
  return {
    kind,
    runtime,
    provide(scope) {
      const previousTheme = runtime.theme
      const previousResponsive = runtime.responsive
      if (scope.theme !== undefined) runtime.setTheme(scope.theme)
      if (scope.responsive !== undefined) runtime.responsive = scope.responsive
      return () => {
        runtime.setTheme(previousTheme)
        if (previousResponsive === undefined) delete runtime.responsive
        else runtime.responsive = previousResponsive
      }
    },
    getValue() {
      return runtime
    },
  }
}

export function resolveCreateStyles<Theme, Props, TResponsive extends AnyResponsive = AnyResponsive>(
  runtime: AdapterRuntime<Theme, TResponsive>,
  factory: StyleFactory<Theme, Props, TResponsive>,
  options?: CreateStylesCoreOptions,
) {
  const run = createStylesCore(runtime.engine, factory, options)
  return (props: Props, cacheKey?: string) => {
    const context: CreateStylesRuntimeContext<Theme, Props, TResponsive> = {
      theme: runtime.getTheme(),
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
  StyleProvider: AdapterProvider<Theme, TResponsive>
  ThemeProvider: AdapterProvider<Theme, TResponsive>
  createStyles<Props>(factory: StyleFactory<Theme, Props, TResponsive>, options?: CreateStylesCoreOptions): (props: Props, cacheKey?: string) => ReturnType<ReturnType<typeof createStylesCore<Theme, Props, TResponsive>>>
  createUseStyles<Props>(factory: StyleFactory<Theme, Props, TResponsive>, options?: CreateStylesCoreOptions): (props: Props, cacheKey?: string) => ReturnType<ReturnType<typeof createStylesCore<Theme, Props, TResponsive>>>
  useTheme(): Theme
  useStyleEngine(): StyleEngine
  useResponsive(): TResponsive | undefined
}

export function createMinimalFrameworkAdapter<Theme, TResponsive extends AnyResponsive = AnyResponsive>(kind: FrameworkAdapterKind, runtime: AdapterRuntime<Theme, TResponsive>): MinimalFrameworkAdapter<Theme, TResponsive> {
  const provider = createAdapterProvider(kind, runtime)
  return {
    kind,
    runtime,
    StyleProvider: provider,
    ThemeProvider: provider,
    createStyles<Props>(factory: StyleFactory<Theme, Props, TResponsive>, options?: CreateStylesCoreOptions) {
      return resolveCreateStyles<Theme, Props, TResponsive>(runtime, factory, options)
    },
    createUseStyles<Props>(factory: StyleFactory<Theme, Props, TResponsive>, options?: CreateStylesCoreOptions) {
      return resolveCreateStyles<Theme, Props, TResponsive>(runtime, factory, options)
    },
    useTheme() {
      return runtime.getTheme()
    },
    useStyleEngine() {
      return runtime.engine
    },
    useResponsive() {
      return runtime.responsive
    },
  }
}

export interface ExternalStoreBridge<TSnapshot> {
  getSnapshot(): TSnapshot
  getServerSnapshot(): TSnapshot
  subscribe(listener: () => void): () => void
}

export function createResponsiveExternalStore<TBreakpoints extends BreakpointMap, TAliases extends ResponsiveAliases<TBreakpoints> | undefined>(
  observer: ResponsiveObserver<TBreakpoints, TAliases>,
): ExternalStoreBridge<ResponsiveSnapshot<TBreakpoints, TAliases>> {
  return {
    getSnapshot: () => observer.getSnapshot(),
    getServerSnapshot: () => observer.getServerSnapshot(),
    subscribe: listener => observer.subscribe(listener),
  }
}
