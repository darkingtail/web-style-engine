import { describe, expect, it } from 'vitest'
import {
  createCSSVarMap,
  createDerivativeToken,
  createMockRenderer,
  createStyleEngine,
  createThemeRuntime,
  diffToken,
  resolveTokenAliases,
} from '../src'

describe('theme and token system', () => {
  it('creates CSS var references with fallback values', () => {
    const vars = createCSSVarMap({
      color: {
        primary: '#1677ff',
      },
      radius: 8,
    }, { prefix: 'app', fallback: true })

    expect(vars).toEqual({
      'color-primary': 'var(--app-color-primary, #1677ff)',
      radius: 'var(--app-radius, 8)',
    })
  })

  it('resolves token aliases recursively', () => {
    const token = resolveTokenAliases({
      color: {
        primary: '#1677ff',
        link: '{color.primary}',
      },
      component: {
        buttonText: '{color.link}',
      },
    })

    expect(token).toEqual({
      color: {
        primary: '#1677ff',
        link: '#1677ff',
      },
      component: {
        buttonText: '#1677ff',
      },
    })
  })

  it('rejects unknown and circular token aliases', () => {
    expect(() => resolveTokenAliases({ color: { link: '{color.missing}' } })).toThrow('unknown token alias')
    expect(() => resolveTokenAliases({
      color: {
        a: '{color.b}',
        b: '{color.a}',
      },
    })).toThrow('circular token alias')
  })

  it('applies derivative token functions in order', () => {
    const token = createDerivativeToken({
      color: {
        primary: '#1677ff',
      },
      size: 8,
    }, [
      current => ({
        color: {
          primaryHover: `${(current.color as { primary: string }).primary}cc`,
        },
      }),
      current => ({
        control: {
          height: (current.size as number) * 4,
        },
      }),
    ])

    expect(token).toEqual({
      color: {
        primary: '#1677ff',
        primaryHover: '#1677ffcc',
      },
      size: 8,
      control: {
        height: 32,
      },
    })
  })

  it('diffs flattened tokens', () => {
    expect(diffToken(
      { color: { primary: 'red', text: 'black' }, radius: 4 },
      { color: { primary: 'blue' }, motion: 'fast' },
    )).toEqual({
      added: { motion: 'fast' },
      removed: { 'color-text': 'black', radius: 4 },
      changed: { 'color-primary': { before: 'red', after: 'blue' } },
    })
  })

  it('registers scoped themes and keeps them SSR-extractable', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({ key: 'app', renderer })
    const themes = createThemeRuntime({ engine, prefix: 'app', fallback: true })

    const light = themes.registerTheme('light', {
      color: {
        primary: '#1677ff',
        text: '#111',
        link: '{color.primary}',
      },
    }, {
      scope: ':root',
      derivatives: [
        current => ({
          color: {
            primaryHover: `${(current.color as { primary: string }).primary}dd`,
          },
        }),
      ],
    })
    const dark = themes.registerTheme('dark', {
      color: {
        primary: '#69b1ff',
        text: '#fff',
      },
    })

    expect(light.scope).toBe(':root')
    expect(light.vars['color-link']).toBe('var(--app-color-link, #1677ff)')
    expect(dark.scope).toBe('[data-theme="dark"]')
    expect(themes.getThemes().map(theme => theme.name)).toEqual(['light', 'dark'])

    const extracted = engine.extract().cssText
    expect(extracted).toContain(':root{--app-color-primary:#1677ff;')
    expect(extracted).toContain('--app-color-primary-hover:#1677ffdd;')
    expect(extracted).toContain('[data-theme="dark"]{--app-color-primary:#69b1ff;')
  })
})
