import type { StyleEngine } from '../core/types'
import type { TokenRecord } from '../tokens/css-vars'
import { createDerivativeToken, resolveTokenAliases } from '../tokens/css-vars'

export interface EmotionLikeInstance {
  css(input: unknown): string
  cx(...classNames: unknown[]): string
  keyframes?(input: unknown): string
  injectGlobal?(input: unknown): string | void
}

export interface AntdvStyleMigrationPlan {
  phases: string[]
  compatibilityChecks: string[]
  validationTargets: Array<'vue' | 'react' | 'solid' | 'antdv-style'>
}

export interface AntdvTokenMappingOptions {
  prefixCls?: string
  iconPrefixCls?: string
  cssVarPrefix?: string
  resolveAliases?: boolean
}

export interface AntdvStyleTokenAdapterResult {
  token: TokenRecord
  cssVarPrefix: string
  prefixCls: string
  iconPrefixCls: string
  metadata: {
    adapter: 'antdv-style'
    boundary: string
  }
}

export interface AntdvStyleCompatibilityInput {
  publicApiStable: boolean
  ssrSafe: boolean
  hydrationSafe: boolean
  multiInstanceSafe: boolean
  nestedThemeSafe: boolean
  responsivePathDocumented: boolean
}

export interface AntdvStyleCompatibilityResult {
  passed: boolean
  checks: Array<{
    name: keyof AntdvStyleCompatibilityInput
    passed: boolean
  }>
}

export interface ReleaseStrategy {
  packageName: string
  versioning: 'semver'
  channels: string[]
  requiredChecks: string[]
}

export interface APIStabilityPolicy {
  stable: string[]
  experimental: string[]
  breakingChangeRules: string[]
}

export function createStyleEngineFromEmotion(emotion: EmotionLikeInstance, key = 'wse'): Pick<StyleEngine, 'key' | 'css' | 'cx' | 'keyframes' | 'injectGlobal'> {
  return {
    key,
    css(input) {
      return emotion.css(input)
    },
    cx(...classNames) {
      return emotion.cx(...classNames)
    },
    keyframes(input) {
      if (!emotion.keyframes) throw new Error('Emotion instance does not provide keyframes')
      return emotion.keyframes(input)
    },
    injectGlobal(input) {
      if (!emotion.injectGlobal) return undefined
      return emotion.injectGlobal(input)
    },
  }
}

export function createAntdvStyleMigrationPlan(): AntdvStyleMigrationPlan {
  return {
    phases: [
      'Wrap the current Emotion implementation with the StyleEngine protocol.',
      'Extract createStylesCore from Vue-specific createStyles code.',
      'Split ThemeProvider into resolver core, Vue wrapper, and antdv token adapter.',
      'Replace local responsive logic with web-style-engine/responsive integration.',
      'Validate Vue, React, and Solid adapters against the same core.',
      'Run antdv-style compatibility and SSR regression checks.',
    ],
    compatibilityChecks: [
      'Existing antdv-style public APIs remain stable.',
      'SSR safety and hydration behavior do not regress.',
      'createInstance multi-instance isolation remains available.',
      'Nested ThemeProvider behavior remains available.',
      'useAntdToken and useAntdTheme remain available in antdv-style.',
      'Responsive behavior is either compatible or documented with a migration path.',
    ],
    validationTargets: ['vue', 'react', 'solid', 'antdv-style'],
  }
}

export function createAntdvTokenAdapter(
  seedToken: TokenRecord,
  options: AntdvTokenMappingOptions = {},
): AntdvStyleTokenAdapterResult {
  const prefixCls = options.prefixCls ?? 'ant'
  const iconPrefixCls = options.iconPrefixCls ?? `${prefixCls}-icon`
  const cssVarPrefix = options.cssVarPrefix ?? prefixCls
  const token = createDerivativeToken(seedToken, [
    current => ({
      antdv: {
        prefixCls,
        iconPrefixCls,
        cssVarPrefix,
      },
      component: {
        ...(typeof current.component === 'object' && current.component ? current.component as TokenRecord : {}),
        prefixCls,
      },
    }),
  ])
  const resolved = options.resolveAliases === false ? token : resolveTokenAliases(token)

  return {
    token: resolved,
    cssVarPrefix,
    prefixCls,
    iconPrefixCls,
    metadata: {
      adapter: 'antdv-style',
      boundary: 'web-style-engine/migration',
    },
  }
}

export function applyAntdvThemeToEngine(
  engine: Pick<StyleEngine, 'vars'>,
  seedToken: TokenRecord,
  options: AntdvTokenMappingOptions & { scope?: string } = {},
): AntdvStyleTokenAdapterResult {
  const adapter = createAntdvTokenAdapter(seedToken, options)
  engine.vars(options.scope ?? ':root', adapter.token, {
    prefix: adapter.cssVarPrefix,
    metadata: adapter.metadata,
  })
  return adapter
}

export function validateAntdvStyleCompatibility(input: AntdvStyleCompatibilityInput): AntdvStyleCompatibilityResult {
  const checks = (Object.entries(input) as Array<[keyof AntdvStyleCompatibilityInput, boolean]>)
    .map(([name, passed]) => ({ name, passed }))
  return {
    passed: checks.every(check => check.passed),
    checks,
  }
}

export function createReleaseStrategy(): ReleaseStrategy {
  return {
    packageName: 'web-style-engine',
    versioning: 'semver',
    channels: ['canary', 'latest'],
    requiredChecks: [
      'pnpm run typecheck',
      'pnpm run build',
      'pnpm test',
      'pnpm docs:build',
    ],
  }
}

export function createAPIStabilityPolicy(): APIStabilityPolicy {
  return {
    stable: [
      'core StyleEngine protocol',
      'renderers',
      'responsive helpers',
      'theme runtime',
      'framework adapter protocol',
      'plugin protocol',
      'migration boundary helpers',
    ],
    experimental: [
      'atomic mode',
      'static extraction metadata',
      'streaming SSR chunks',
    ],
    breakingChangeRules: [
      'Breaking changes require a major version.',
      'Experimental APIs may change in minor versions until promoted.',
      'Design-system-specific logic must stay outside core.',
    ],
  }
}
