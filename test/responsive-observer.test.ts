import { describe, expect, it } from 'vitest'
import { createResponsive, createResponsiveObserver, type MediaQueryListLike } from '../src'

function createControllableMatchMedia(initialWidth: number) {
  let width = initialWidth
  const lists = new Map<string, {
    query: string
    listeners: Set<(event: { matches: boolean }) => void>
  }>()

  const matchesQuery = (query: string) => {
    const min = /min-width:\s*(-?\d+(?:\.\d+)?)px/.exec(query)?.[1]
    const max = /max-width:\s*(-?\d+(?:\.\d+)?)px/.exec(query)?.[1]
    if (min !== undefined && width < Number(min)) return false
    if (max !== undefined && width > Number(max)) return false
    return true
  }

  const matchMedia = (query: string): MediaQueryListLike => {
    if (!lists.has(query)) {
      lists.set(query, { query, listeners: new Set() })
    }
    const entry = lists.get(query)!
    return {
      get matches() {
        return matchesQuery(query)
      },
      addEventListener(_type, listener) {
        entry.listeners.add(listener)
      },
      removeEventListener(_type, listener) {
        entry.listeners.delete(listener)
      },
    }
  }

  const setWidth = (next: number) => {
    width = next
    for (const entry of lists.values()) {
      const event = { matches: matchesQuery(entry.query) }
      for (const listener of entry.listeners) listener(event)
    }
  }

  const listenerCount = () => Array.from(lists.values()).reduce((total, entry) => total + entry.listeners.size, 0)

  return { matchMedia, setWidth, listenerCount }
}

describe('responsive observer external store', () => {
  it('creates SSR-safe server snapshots without matchMedia', () => {
    const responsive = createResponsive({
      breakpoints: {
        mobile: 0,
        tablet: 768,
        desktop: 1280,
      },
    })
    const observer = createResponsiveObserver(responsive)

    expect(observer.getServerSnapshot()).toEqual({
      matches: { mobile: false, tablet: false, desktop: false },
      only: { mobile: false, tablet: false, desktop: false },
      current: undefined,
      aliases: {},
    })
  })

  it('can derive server snapshots from an explicit SSR width', () => {
    const responsive = createResponsive({
      breakpoints: {
        mobile: 0,
        tablet: 768,
        desktop: 1280,
      },
      aliases: {
        handheld: { below: 'tablet' },
        content: { between: ['tablet', 'desktop'] },
      },
    } as const)
    const observer = createResponsiveObserver(responsive, { ssr: { width: 1024 } })

    expect(observer.getServerSnapshot()).toEqual({
      matches: { mobile: true, tablet: true, desktop: false },
      only: { mobile: false, tablet: true, desktop: false },
      current: 'tablet',
      aliases: { handheld: false, content: true },
    })
  })

  it('subscribes to injected matchMedia and updates snapshots', () => {
    const responsive = createResponsive({
      breakpoints: {
        mobile: 0,
        tablet: 768,
        desktop: 1280,
      },
      aliases: {
        handheld: { below: 'tablet' },
        wide: { up: 'desktop' },
      },
    } as const)
    const media = createControllableMatchMedia(500)
    const observer = createResponsiveObserver(responsive, { matchMedia: media.matchMedia })
    let calls = 0

    const unsubscribe = observer.subscribe(() => {
      calls++
    })

    expect(media.listenerCount()).toBe(4)
    expect(observer.getSnapshot()).toEqual({
      matches: { mobile: true, tablet: false, desktop: false },
      only: { mobile: true, tablet: false, desktop: false },
      current: 'mobile',
      aliases: { handheld: true, wide: false },
    })

    media.setWidth(1400)

    expect(calls).toBeGreaterThan(0)
    expect(observer.getSnapshot()).toEqual({
      matches: { mobile: true, tablet: true, desktop: true },
      only: { mobile: false, tablet: false, desktop: true },
      current: 'desktop',
      aliases: { handheld: false, wide: true },
    })

    unsubscribe()
    expect(media.listenerCount()).toBe(0)
  })

  it('shares listeners across subscribers and cleans up only after the last unsubscribe', () => {
    const responsive = createResponsive({ breakpoints: { mobile: 0, tablet: 768 } })
    const media = createControllableMatchMedia(800)
    const observer = createResponsiveObserver(responsive, { matchMedia: media.matchMedia })

    const first = observer.subscribe(() => {})
    const second = observer.subscribe(() => {})
    expect(media.listenerCount()).toBe(2)

    first()
    expect(media.listenerCount()).toBe(2)

    second()
    expect(media.listenerCount()).toBe(0)
  })
})
