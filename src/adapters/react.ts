import type { StyleEngine } from '../core/types'
import type { CreateStylesCoreOptions, StyleFactory } from '../create-styles/core'
import { createAdapterRuntime, createMinimalFrameworkAdapter } from './shared'

export interface ReactStyleSystemOptions<Theme> {
  engine: StyleEngine
  theme: Theme
  responsive?: unknown
}

export function createReactStyleSystem<Theme>(options: ReactStyleSystemOptions<Theme>) {
  const runtime = createAdapterRuntime(options.engine, options.theme, options.responsive)
  const adapter = createMinimalFrameworkAdapter('react', runtime)

  return {
    StyleProvider: runtime,
    ThemeProvider: runtime,
    createStyles<Props>(factory: StyleFactory<Theme, Props>, styleOptions?: CreateStylesCoreOptions) {
      return adapter.createStyles(factory, styleOptions)
    },
    useTheme: adapter.useTheme,
    useStyleEngine: adapter.useStyleEngine,
  }
}
