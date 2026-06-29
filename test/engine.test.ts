import { describe, expect, it } from 'vitest'
import { createStyleEngine, createMockRenderer, createSSRRenderer, createStylesCore, createVueStyleSystem, createReactStyleSystem, createSolidStyleSystem, createResponsive, px2rem } from '../src'

function createFakeDOM() {
  const createElement = (tagName: string) => ({
    tagName,
    attributes: new Map<string, string>(),
    childNodes: [] as any[],
    parentNode: undefined as any,
    textContent: '',
    ownerDocument: undefined as any,
    setAttribute(name: string, value: string) {
      this.attributes.set(name, value)
    },
    getAttribute(name: string) {
      return this.attributes.get(name)
    },
    appendChild(child: any) {
      child.parentNode = this
      this.childNodes.push(child)
      return child
    },
    insertBefore(child: any, reference: any) {
      child.parentNode = this
      const index = this.childNodes.indexOf(reference)
      if (index >= 0) this.childNodes.splice(index, 0, child)
      else this.childNodes.push(child)
      return child
    },
  })
  const document = {
    createElement(tagName: string) {
      const element = createElement(tagName)
      element.ownerDocument = document
      return element
    },
    head: undefined as any,
  }
  document.head = document.createElement('head')
  return document
}

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

  it('passes responsive helpers through createStylesCore', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({ key: 'test', renderer })
    const responsive = createResponsive({
      breakpoints: {
        mobile: 0,
        tablet: 768,
      },
    })
    const useStyles = createStylesCore(engine, ({ responsive }, props: { dense: boolean }) => ({
      root: responsive!.object({
        base: { padding: props.dense ? 8 : 12 },
        up: {
          tablet: { padding: 24 },
        },
      }),
    }), { label: 'Panel' })

    const result = useStyles({
      theme: {},
      props: { dense: true },
      responsive,
    })

    const cssText = renderer.extract().cssText
    expect(cssText).toContain(`.${result.styles.root}{padding:8px;}`)
    expect(cssText).toContain(`@media (min-width: 768px){.${result.styles.root}{padding:24px;}}`)
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

  it('supports default layer, specificity, fontFace, and nested at-rules', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({
      key: 'test',
      renderer,
      layer: 'components',
      specificity: 'low',
    })

    const className = engine.css({
      color: 'red',
      '&:hover': {
        color: 'blue',
      },
      '.icon': {
        color: 'green',
      },
      '@supports (display: grid)': {
        display: 'grid',
      },
    })
    engine.fontFace({
      fontFamily: 'Demo',
      src: 'url(/demo.woff2)',
    })

    const cssText = renderer.extract().cssText
    expect(cssText).toContain(`@layer components{:where(.${className}){color:red;}`)
    expect(cssText).toContain(`:where(.${className}):hover{color:blue;}`)
    expect(cssText).toContain(`:where(.${className}) .icon{color:green;}`)
    expect(cssText).toContain(`@supports (display: grid){:where(.${className}){display:grid;}}`)
    expect(cssText).toContain('@font-face{font-family:Demo;src:url(/demo.woff2);}')
  })

  it('creates a DOM renderer from top-level engine options', () => {
    const fakeDocument = createFakeDOM()
    const insertionPoint = fakeDocument.createElement('meta')
    fakeDocument.head.appendChild(insertionPoint)

    const engine = createStyleEngine({
      key: 'domtest',
      container: fakeDocument,
      nonce: 'abc',
      insertionPoint,
    })

    engine.css({ color: 'red' })

    expect(fakeDocument.head.childNodes).toHaveLength(2)
    const styleElement = fakeDocument.head.childNodes[1]
    expect(styleElement.getAttribute('nonce')).toBe('abc')
    expect(styleElement.getAttribute('data-domtest')).toBe('domtest')
    expect(styleElement.textContent).toContain('color:red')
  })

  it('disposes and flushes inserted rules', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({ key: 'test', renderer })
    const className = engine.css({ color: 'red' })
    const rule = renderer.rules.find(item => item.className === className)!

    engine.dispose(rule.id)
    expect(renderer.extract().cssText).not.toContain('color:red')

    engine.css({ color: 'blue' })
    engine.flush()
    expect(renderer.extract().cssText).toBe('')
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
