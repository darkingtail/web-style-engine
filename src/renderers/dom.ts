import type { ExtractedStyle, StyleRenderer, StyleRule } from '../core/types'

export interface DOMRendererOptions {
  key?: string
  container?: Document | Element | ShadowRoot
  nonce?: string
  insertionPoint?: ChildNode | null
}

function isStyleElement(node: unknown): node is HTMLStyleElement {
  return !!node && typeof node === 'object' && 'textContent' in node && 'getAttribute' in node
}

export function createDOMRenderer(options: DOMRendererOptions = {}): StyleRenderer {
  const key = options.key ?? 'wse'
  const rules = new Map<string, StyleRule>()
  let styleElement: HTMLStyleElement | undefined

  const getContainer = (): Element | ShadowRoot => {
    if (options.container) {
      if ('head' in options.container && options.container.head) return options.container.head
      return options.container as Element | ShadowRoot
    }
    if (typeof document === 'undefined') {
      throw new Error('createDOMRenderer requires a container when document is unavailable')
    }
    return document.head
  }

  const getHydratableNodes = (source?: unknown): HTMLStyleElement[] => {
    if (source && typeof source !== 'string') return Array.from(source as Iterable<unknown>).filter(isStyleElement)
    const container = getContainer()
    const childNodes = 'childNodes' in container ? Array.from(container.childNodes as ArrayLike<unknown>) : []
    return childNodes.filter(isStyleElement).filter(node => node.getAttribute(`data-${key}`) === key)
  }

  const ensureStyleElement = (): HTMLStyleElement => {
    if (styleElement) return styleElement
    const container = getContainer()
    const ownerDocument = 'ownerDocument' in container && container.ownerDocument ? container.ownerDocument : document
    styleElement = ownerDocument.createElement('style')
    styleElement.setAttribute(`data-${key}`, key)
    if (options.nonce) styleElement.setAttribute('nonce', options.nonce)

    if (options.insertionPoint?.parentNode) {
      options.insertionPoint.parentNode.insertBefore(styleElement, options.insertionPoint.nextSibling)
    } else {
      container.appendChild(styleElement)
    }

    return styleElement
  }

  const sync = (): void => {
    if (!styleElement && rules.size === 0) return
    const ordered = [...rules.values()].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
    ensureStyleElement().textContent = ordered.map(rule => rule.cssText).join('')
  }

  return {
    insert(rule) {
      if (rules.has(rule.id)) return
      rules.set(rule.id, rule)
      sync()
    },
    remove(id) {
      rules.delete(id)
      sync()
    },
    flush() {
      rules.clear()
      if (styleElement) styleElement.textContent = ''
    },
    hydrate(source?: unknown) {
      const nodes = getHydratableNodes(source)
      for (const node of nodes) {
        if (styleElement === undefined) styleElement = node
        const ids = node.getAttribute(`data-${key}-ids`)?.split(/\s+/).filter(Boolean) ?? []
        if (ids.length > 0) {
          ids.forEach((id, index) => {
            rules.set(id, {
              id,
              cssText: index === 0 ? (node.textContent ?? '') : '',
              metadata: { hydrated: true },
            })
          })
        } else if (node.textContent) {
          const id = `hydrated-${rules.size}`
          rules.set(id, {
            id,
            cssText: node.textContent,
            metadata: { hydrated: true },
          })
        }
      }
      sync()
    },
    extract(): ExtractedStyle {
      const extractedRules = [...rules.values()].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
      return {
        cssText: extractedRules.map(rule => rule.cssText).join(''),
        rules: extractedRules,
      }
    },
  }
}
