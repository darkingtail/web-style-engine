import { describe, expect, it } from 'vitest'
import {
  createMockRenderer,
  createStyleEngine,
  prefixer,
  px2rem,
  px2vw,
  rtlTransformer,
  type StylePlugin,
} from '../src'

describe('plugins and compatibility transformers', () => {
  it('runs plugins in deterministic order while preserving declaration order for ties', () => {
    const calls: string[] = []
    const plugin = (name: string, order: number): StylePlugin => ({
      name,
      order,
      transform(cssText) {
        calls.push(name)
        return `${cssText}--${name}:1;`
      },
    })
    const renderer = createMockRenderer()
    const engine = createStyleEngine({
      key: 'plugins',
      renderer,
      dev: false,
      diagnostics: true,
      transformers: [plugin('second', 2), plugin('first-a', 1), plugin('first-b', 1)],
    })

    engine.css({ color: 'red' })

    expect(calls).toEqual(['first-a', 'first-b', 'second'])
    expect(renderer.extract().cssText).toContain('--first-a:1;--first-b:1;--second:1;')
    expect(engine.getDiagnostics().map(item => item.pluginName)).toEqual(['first-a', 'first-b', 'second'])
    expect(engine.getDiagnostics().every(item => item.changed)).toBe(true)
  })

  it('supports plugins passed through the plugins option after function transformers', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({
      key: 'plugins',
      renderer,
      dev: false,
      diagnostics: true,
      transformers: [cssText => `${cssText}--fn:1;`],
      plugins: [{
        name: 'object-plugin',
        order: 1,
        transform: cssText => `${cssText}--object:1;`,
      }],
    })

    engine.css({ color: 'red' })

    expect(renderer.extract().cssText).toContain('--fn:1;--object:1;')
    expect(engine.getDiagnostics().map(item => item.pluginName)).toEqual(['transformer-0', 'object-plugin'])
    engine.clearDiagnostics()
    expect(engine.getDiagnostics()).toEqual([])
  })

  it('adds browser compatibility prefixes', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({
      key: 'prefix',
      renderer,
      dev: false,
      transformers: [prefixer()],
    })

    engine.css({
      display: 'flex',
      userSelect: 'none',
      appearance: 'none',
      backdropFilter: 'blur(4px)',
    })

    const cssText = renderer.extract().cssText
    expect(cssText).toContain('display:-webkit-box;display:-ms-flexbox;display:flex;')
    expect(cssText).toContain('-webkit-user-select:none;user-select:none;')
    expect(cssText).toContain('-webkit-appearance:none;appearance:none;')
    expect(cssText).toContain('-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);')
  })

  it('transforms physical direction properties for RTL', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({
      key: 'rtl',
      renderer,
      dev: false,
      transformers: [rtlTransformer()],
    })

    engine.css({
      marginLeft: 12,
      paddingRight: 8,
      borderLeftColor: 'red',
      left: 4,
      textAlign: 'left',
      borderTopLeftRadius: 6,
      borderBottomRightRadius: 10,
    })

    const cssText = renderer.extract().cssText
    expect(cssText).toContain('margin-right:12px;')
    expect(cssText).toContain('padding-left:8px;')
    expect(cssText).toContain('border-right-color:red;')
    expect(cssText).toContain('right:4px;')
    expect(cssText).toContain('text-align:right;')
    expect(cssText).toContain('border-top-right-radius:6px;')
    expect(cssText).toContain('border-bottom-left-radius:10px;')
  })

  it('supports px transformer thresholds, filters, and option validation', () => {
    const remRenderer = createMockRenderer()
    const remEngine = createStyleEngine({
      key: 'rem',
      renderer: remRenderer,
      dev: false,
      transformers: [px2rem({ rootValue: 16, minPixelValue: 1, exclude: /skip/ })],
    })

    remEngine.css('.keep{width:16px;}.skip{width:16px;}.hairline{border-width:1px;}')

    const remCssText = remRenderer.extract().cssText
    expect(remCssText).toContain('.keep{width:16px;}')
    expect(remCssText).toContain('.skip{width:16px;}')
    expect(remCssText).toContain('.hairline{border-width:1px;}')

    const vwRenderer = createMockRenderer()
    const vwEngine = createStyleEngine({
      key: 'vw',
      renderer: vwRenderer,
      dev: false,
      transformers: [px2vw({ viewportWidth: 375, include: /card/ })],
    })

    vwEngine.css('.card{width:187.5px;}.other{width:100px;}')
    const vwCssText = vwRenderer.extract().cssText
    expect(vwCssText).toContain('.card{width:50vw;}')
    expect(vwCssText).toContain('.other{width:26.66667vw;}')

    expect(() => px2rem({ rootValue: 0 })).toThrow('positive finite number')
    expect(() => px2vw({ viewportWidth: 0 })).toThrow('positive finite number')
  })
})
