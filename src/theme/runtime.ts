import type { CreateThemeRuntimeOptions, RegisterThemeOptions, ThemeDefinition, ThemeRuntime } from './types'
import type { TokenRecord } from '../tokens/css-vars'
import { createCSSVarMap, createDerivativeToken, resolveTokenAliases } from '../tokens/css-vars'
import { hashString } from '../core/serialize'

function createThemeSelector(name: string): string {
  return `[data-theme="${name.replace(/"/g, '\\"')}"]`
}

export function createThemeRuntime(options: CreateThemeRuntimeOptions): ThemeRuntime {
  const prefix = options.prefix ?? options.engine.key
  const themes = new Map<string, ThemeDefinition>()

  const runtime: ThemeRuntime = {
    engine: options.engine,
    prefix,
    registerTheme<TToken extends TokenRecord>(name: string, token: TToken, registerOptions: RegisterThemeOptions<TToken> = {}) {
      const shouldResolveAliases = registerOptions.resolveAliases ?? options.resolveAliases ?? true
      const scope = registerOptions.scope ?? options.defaultScope ?? createThemeSelector(name)
      const tokenWithDerivatives = createDerivativeToken(token, registerOptions.derivatives)
      const resolved = shouldResolveAliases ? resolveTokenAliases(tokenWithDerivatives) : tokenWithDerivatives
      const cssVarMapOptions: Parameters<typeof createCSSVarMap>[1] = {
        prefix: registerOptions.prefix ?? prefix,
      }
      const fallback = registerOptions.fallback ?? options.fallback
      if (fallback !== undefined && typeof cssVarMapOptions !== 'string') cssVarMapOptions.fallback = fallback
      const vars = createCSSVarMap(resolved, cssVarMapOptions)
      const id = registerOptions.id ?? `theme-${name}-${hashString(`${options.engine.key}|${scope}|${JSON.stringify(resolved)}`)}`

      const varsOptions: Parameters<typeof options.engine.vars>[2] = {
        id,
        prefix: registerOptions.prefix ?? prefix,
        metadata: {
          ...registerOptions.metadata,
          type: 'theme',
          theme: name,
          scope,
        },
      }
      if (registerOptions.layer !== undefined) varsOptions.layer = registerOptions.layer
      if (registerOptions.priority !== undefined) varsOptions.priority = registerOptions.priority
      options.engine.vars(scope, resolved, varsOptions)

      const definition: ThemeDefinition<TToken> = {
        name,
        token: resolved as TToken,
        scope,
        id,
        vars,
      }
      themes.set(name, definition)
      return definition
    },
    getTheme(name) {
      return themes.get(name)
    },
    getThemes() {
      return [...themes.values()]
    },
    createThemeScope(name) {
      return createThemeSelector(name)
    },
  }

  return runtime
}
