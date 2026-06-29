import type { StyleEngine } from '../core/types'
import type { AnyResponsive } from '../responsive/types'
import type { CreateStylesCoreOptions, StyleFactory } from '../create-styles/core'
import { createAdapterRuntime, createMinimalFrameworkAdapter } from './shared'

export interface SolidStyleSystemOptions<Theme, TResponsive extends AnyResponsive = AnyResponsive> {
  engine: StyleEngine
  theme: Theme
  responsive?: TResponsive
}

export function createSolidStyleSystem<Theme, TResponsive extends AnyResponsive = AnyResponsive>(options: SolidStyleSystemOptions<Theme, TResponsive>) {
  const runtime = createAdapterRuntime(options.engine, options.theme, options.responsive)
  const adapter = createMinimalFrameworkAdapter('solid', runtime)

  return {
    StyleProvider: adapter.StyleProvider,
    ThemeProvider: adapter.ThemeProvider,
    createStyles<Props>(factory: StyleFactory<Theme, Props, TResponsive>, styleOptions?: CreateStylesCoreOptions) {
      return adapter.createStyles(factory, styleOptions)
    },
    createUseStyles<Props>(factory: StyleFactory<Theme, Props, TResponsive>, styleOptions?: CreateStylesCoreOptions) {
      return adapter.createUseStyles(factory, styleOptions)
    },
    useTheme: adapter.useTheme,
    useStyleEngine: adapter.useStyleEngine,
    useResponsive: adapter.useResponsive,
  }
}
