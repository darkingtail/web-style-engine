import { describe, expect, it } from 'vitest'
import { createStyleEngine, createMockRenderer, createSSRRenderer, createStylesCore, createVueStyleSystem, createReactStyleSystem, createSolidStyleSystem, px2rem } from '../src'

describe('web-style-engine first slice', () => {
  it('creates stable class names, dedupes rules, and extracts styles', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({ key: 'test', renderer, dev: true })

    const first = engine.css({ color: 'red', padding: 4 }, { label: 'Button-root' })
    const second = engine.css({ color: 'red', padding: 4 }, { label: 'Button-root' })

    expect(first).toBe(second)
    expect(renderer.rules).toHaveLength(1)
    expect(renderer.extract().cssText).toContain(`.${first}`)
  })

  it('supports SSR extraction with style tags', () => {
    const renderer = createSSRRenderer({ key: 'test', nonce: 'abc' })
    const engine = createStyleEngine({ key: 'test', renderer })

    engine.css({ color: 'blue' }, { label: 'Text' })
    const extracted = engine.extract()

    expect(extracted.cssText).toContain('color:blue')
    expect(extracted.styleTags).toContain('nonce="abc"')
  })

  it('runs createStylesCore with theme and props', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({ key: 'test', renderer })
    const useStyles = createStylesCore(engine, ({ theme }, props: { active: boolean }) => ({
      root: {
        color: props.active ? theme.colorPrimary : theme.colorText,
      },
    }), { label: 'Button' })

    const result = useStyles({
      theme: { colorPrimary: '#1677ff', colorText: '#000' },
      props: { active: true },
      cacheKey: 'active',
    })

    expect(result.styles.root).toMatch(/^test-/)
    expect(renderer.extract().cssText).toContain('#1677ff')
  })

  it('supports CSS variables and transformers', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({ key: 'test', renderer, transformers: [px2rem({ rootValue: 16 })] })

    engine.vars('.theme-dark', { color: { primary: '#1677ff' } })
    engine.css({ marginLeft: 16 })

    const cssText = renderer.extract().cssText
    expect(cssText).toContain('--test-color-primary:#1677ff')
    expect(cssText).toContain('margin-left:1rem')
  })

  it('creates minimal Vue, React, and Solid adapters over the same core', () => {
    const engine = createStyleEngine({ key: 'test', renderer: createMockRenderer() })
    const theme = { colorPrimary: '#1677ff' }

    const vue = createVueStyleSystem({ engine, theme })
    const react = createReactStyleSystem({ engine, theme })
    const solid = createSolidStyleSystem({ engine, theme })

    const factory = ({ theme }: { theme: typeof theme }) => ({ root: { color: theme.colorPrimary } })

    expect(vue.createStyles(factory)({}).styles.root).toMatch(/^test-/)
    expect(react.createStyles(factory)({}).styles.root).toMatch(/^test-/)
    expect(solid.createStyles(factory)({}).styles.root).toMatch(/^test-/)
  })
})
