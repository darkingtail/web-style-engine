import type { CSSVarsOptions, StyleEngine } from '../core/types'
import type { CSSVarMapOptions, TokenDerivative, TokenRecord } from '../tokens/css-vars'

export interface ThemeDefinition<TToken extends TokenRecord = TokenRecord> {
  name: string
  token: TToken
  scope: string
  id: string
  vars: Record<string, string>
}

export interface RegisterThemeOptions<TToken extends TokenRecord = TokenRecord> extends Omit<CSSVarsOptions, 'prefix' | 'fallback'> {
  scope?: string
  prefix?: string
  derivatives?: Array<TokenDerivative<TToken>>
  resolveAliases?: boolean
  fallback?: CSSVarMapOptions['fallback']
}

export interface CreateThemeRuntimeOptions {
  engine: StyleEngine
  prefix?: string
  defaultScope?: string
  resolveAliases?: boolean
  fallback?: CSSVarMapOptions['fallback']
}

export interface ThemeRuntime {
  readonly engine: StyleEngine
  readonly prefix: string
  registerTheme<TToken extends TokenRecord>(name: string, token: TToken, options?: RegisterThemeOptions<TToken>): ThemeDefinition<TToken>
  getTheme(name: string): ThemeDefinition | undefined
  getThemes(): ThemeDefinition[]
  createThemeScope(name: string): string
}
