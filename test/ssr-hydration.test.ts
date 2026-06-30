import { describe, expect, it } from 'vitest'
import {
  createDOMRenderer,
  createSSRRenderer,
  createStyleEngine,
  extractCriticalCSS,
  type StyleRule,
} from '../src'

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

describe('SSR extraction and hydration', () => {
  it('extracts classes, vars, globals, keyframes, and font faces in stable order', () => {
    const renderer = createSSRRenderer({ key: 'ssr', nonce: 'abc' })
    const engine = createStyleEngine({ key: 'ssr', renderer })

    const root = engine.css({ color: 'red' }, { priority: 2, metadata: { critical: true } })
    engine.vars(':root', { color: { primary: '#1677ff' } }, { priority: 0 })
    engine.injectGlobal({ body: { margin: 0 } }, { priority: 1 })
    const animation = engine.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } }, { priority: 3 })
    engine.fontFace({ fontFamily: 'Demo', src: 'url(/demo.woff2)' }, { priority: 4 })

    const extracted = engine.extract()

    expect(extracted.cssText.indexOf('--ssr-color-primary:#1677ff')).toBeLessThan(extracted.cssText.indexOf('body{margin:0;}'))
    expect(extracted.cssText).toContain(`.${root}{color:red;}`)
    expect(extracted.cssText).toContain(`@keyframes ${animation}`)
    expect(extracted.cssText).toContain('@font-face{font-family:Demo;src:url(/demo.woff2);}')
    expect(extracted.styleTags).toContain('nonce="abc"')
    expect(extracted.styleTags).toContain('data-ssr-ids="')
  })

  it('hydrates existing SSR style tags and avoids duplicate client insertion', () => {
    const ssrRenderer = createSSRRenderer({ key: 'app' })
    const ssrEngine = createStyleEngine({ key: 'app', renderer: ssrRenderer, dev: false })
    const className = ssrEngine.css({ color: 'red' })
    const extracted = ssrEngine.extract()
    const ruleIds = extracted.rules.map(rule => rule.id).join(' ')

    const fakeDocument = createFakeDOM()
    const serverStyle = fakeDocument.createElement('style')
    serverStyle.setAttribute('data-app', 'app')
    serverStyle.setAttribute('data-app-ids', ruleIds)
    serverStyle.textContent = extracted.cssText
    fakeDocument.head.appendChild(serverStyle)

    const renderer = createDOMRenderer({ key: 'app', container: fakeDocument as unknown as Document })
    renderer.hydrate?.(fakeDocument.head.childNodes)
    const clientEngine = createStyleEngine({ key: 'app', renderer, dev: false })
    const clientClassName = clientEngine.css({ color: 'red' })

    expect(clientClassName).toBe(className)
    expect(fakeDocument.head.childNodes).toHaveLength(1)
    expect(serverStyle.textContent.match(/color:red/g)).toHaveLength(1)
  })

  it('keeps SSR instances isolated by key and request-scoped renderer', () => {
    const firstRenderer = createSSRRenderer({ key: 'app-a' })
    const secondRenderer = createSSRRenderer({ key: 'app-b' })
    const first = createStyleEngine({ key: 'app-a', renderer: firstRenderer })
    const second = createStyleEngine({ key: 'app-b', renderer: secondRenderer })

    first.css({ color: 'red' })
    second.css({ color: 'blue' })

    expect(first.extract().styleTags).toContain('data-app-a="app-a"')
    expect(first.extract().cssText).toContain('color:red')
    expect(first.extract().cssText).not.toContain('color:blue')
    expect(second.extract().styleTags).toContain('data-app-b="app-b"')
    expect(second.extract().cssText).toContain('color:blue')
    expect(second.extract().cssText).not.toContain('color:red')
  })

  it('extracts critical CSS by rule metadata', () => {
    const renderer = createSSRRenderer({ key: 'critical' })
    const engine = createStyleEngine({ key: 'critical', renderer })

    engine.css({ color: 'red' }, { metadata: { critical: true } })
    engine.css({ color: 'blue' }, { metadata: { critical: false } })

    const extracted = extractCriticalCSS(engine.extract(), {
      include: rule => rule.metadata?.critical === true,
    })

    expect(extracted.criticalCss).toContain('color:red')
    expect(extracted.criticalCss).not.toContain('color:blue')
  })

  it('reserves streaming SSR chunks without duplicating flushed rules', () => {
    const renderer = createSSRRenderer({ key: 'stream' })
    const engine = createStyleEngine({ key: 'stream', renderer })
    const stream = renderer as ReturnType<typeof createSSRRenderer> & { flushChunk(): { rules: StyleRule[]; cssText: string; styleTags: string } }

    engine.css({ color: 'red' })
    const first = stream.flushChunk()
    engine.css({ color: 'blue' })
    const second = stream.flushChunk()
    const empty = stream.flushChunk()

    expect(first.cssText).toContain('color:red')
    expect(first.cssText).not.toContain('color:blue')
    expect(second.cssText).toContain('color:blue')
    expect(second.cssText).not.toContain('color:red')
    expect(empty.cssText).toBe('')
    expect(empty.rules).toEqual([])
    expect(first.styleTags).toContain('data-stream-ids')
  })
})
