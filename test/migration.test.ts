import { describe, expect, it } from 'vitest'
import {
  applyAntdvThemeToEngine,
  createAPIStabilityPolicy,
  createAntdvStyleMigrationPlan,
  createAntdvTokenAdapter,
  createMockRenderer,
  createReleaseStrategy,
  createStyleEngine,
  createStyleEngineFromEmotion,
  validateAntdvStyleCompatibility,
} from '../src'

describe('ecosystem migration helpers', () => {
  it('wraps an Emotion-like instance without moving Emotion into core', () => {
    const calls: string[] = []
    const engine = createStyleEngineFromEmotion({
      css(input) {
        calls.push(`css:${String(input)}`)
        return 'emotion-class'
      },
      cx(...classNames) {
        return classNames.filter(Boolean).join(' ')
      },
      keyframes(input) {
        calls.push(`keyframes:${String(input)}`)
        return 'emotion-kf'
      },
      injectGlobal(input) {
        calls.push(`global:${String(input)}`)
        return 'global-id'
      },
    }, 'emotion')

    expect(engine.key).toBe('emotion')
    expect(engine.css('color:red')).toBe('emotion-class')
    expect(engine.cx('a', false, 'b')).toBe('a b')
    expect(engine.keyframes('from{}to{}')).toBe('emotion-kf')
    expect(engine.injectGlobal('body{}')).toBe('global-id')
    expect(calls).toEqual(['css:color:red', 'keyframes:from{}to{}', 'global:body{}'])
  })

  it('keeps antdv-specific token mapping inside migration helpers', () => {
    const adapter = createAntdvTokenAdapter({
      color: {
        primary: '#1677ff',
        link: '{color.primary}',
      },
      component: {
        radius: 8,
      },
    }, {
      prefixCls: 'antdv',
      iconPrefixCls: 'antdv-icon',
      cssVarPrefix: 'antdv',
    })

    expect(adapter).toMatchObject({
      cssVarPrefix: 'antdv',
      prefixCls: 'antdv',
      iconPrefixCls: 'antdv-icon',
      metadata: {
        adapter: 'antdv-style',
        boundary: 'web-style-engine/migration',
      },
    })
    expect(adapter.token).toMatchObject({
      color: {
        primary: '#1677ff',
        link: '#1677ff',
      },
      component: {
        radius: 8,
        prefixCls: 'antdv',
      },
      antdv: {
        prefixCls: 'antdv',
        iconPrefixCls: 'antdv-icon',
        cssVarPrefix: 'antdv',
      },
    })
  })

  it('applies mapped antdv tokens to a style engine through CSS variables', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({ key: 'app', renderer })

    const adapter = applyAntdvThemeToEngine(engine, {
      color: {
        primary: '#1677ff',
      },
    }, {
      scope: '.ant-app',
      prefixCls: 'ant',
    })

    expect(adapter.cssVarPrefix).toBe('ant')
    expect(renderer.extract().cssText).toContain('.ant-app{--ant-color-primary:#1677ff;')
    expect(renderer.extract().cssText).toContain('--ant-antdv-prefix-cls:ant;')
    expect(renderer.rules[0]!.metadata).toMatchObject({
      adapter: 'antdv-style',
      boundary: 'web-style-engine/migration',
    })
  })

  it('returns migration plan, compatibility result, release strategy, and API policy', () => {
    const plan = createAntdvStyleMigrationPlan()
    expect(plan.validationTargets).toEqual(['vue', 'react', 'solid', 'antdv-style'])
    expect(plan.compatibilityChecks).toContain('SSR safety and hydration behavior do not regress.')

    const failed = validateAntdvStyleCompatibility({
      publicApiStable: true,
      ssrSafe: true,
      hydrationSafe: true,
      multiInstanceSafe: false,
      nestedThemeSafe: true,
      responsivePathDocumented: true,
    })
    expect(failed.passed).toBe(false)
    expect(failed.checks.find(check => check.name === 'multiInstanceSafe')).toEqual({
      name: 'multiInstanceSafe',
      passed: false,
    })

    const passed = validateAntdvStyleCompatibility({
      publicApiStable: true,
      ssrSafe: true,
      hydrationSafe: true,
      multiInstanceSafe: true,
      nestedThemeSafe: true,
      responsivePathDocumented: true,
    })
    expect(passed.passed).toBe(true)

    expect(createReleaseStrategy()).toMatchObject({
      packageName: 'web-style-engine',
      versioning: 'semver',
      channels: ['canary', 'latest'],
    })
    expect(createAPIStabilityPolicy().breakingChangeRules).toContain('Design-system-specific logic must stay outside core.')
  })
})
