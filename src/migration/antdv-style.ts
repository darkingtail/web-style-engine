import type { StyleEngine } from '../core/types'

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
      'Replace local responsive logic with optional web-responsive integration.',
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
