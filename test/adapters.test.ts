import { describe, expect, it } from 'vitest'
import {
  createMockRenderer,
  createReactStyleSystem,
  createResponsive,
  createResponsiveExternalStore,
  createResponsiveObserver,
  createSolidStyleSystem,
  createStyleEngine,
  createVueStyleSystem,
  type MediaQueryListLike,
} from '../src'

function createStaticMatchMedia(width: number) {
  return (query: string): MediaQueryListLike => {
    const min = /min-width:\s*(-?\d+(?:\.\d+)?)px/.exec(query)?.[1]
    const max = /max-width:\s*(-?\d+(?:\.\d+)?)px/.exec(query)?.[1]
    const matches = (min === undefined || width >= Number(min)) && (max === undefined || width <= Number(max))
    return {
      matches,
      addEventListener() {},
      removeEventListener() {},
    }
  }
}

describe('framework adapter protocols', () => {
  it('keeps the minimal adapter API while adding provider-style scoped theme overrides', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({ key: 'adapter', renderer })
    const system = createVueStyleSystem({
      engine,
      theme: { color: 'red' },
    })
    const useStyles = system.createUseStyles(({ theme }) => ({
      root: { color: theme.color },
    }), { label: 'Scoped' })

    expect(system.useTheme()).toEqual({ color: 'red' })
    expect(useStyles({}).styles.root).toMatch(/^adapter-/)
    expect(renderer.extract().cssText).toContain('color:red')

    const dispose = system.ThemeProvider.provide({ theme: { color: 'blue' } })

    expect(system.useTheme()).toEqual({ color: 'blue' })
    useStyles({}, 'blue')
    expect(renderer.extract().cssText).toContain('color:blue')

    dispose()

    expect(system.useTheme()).toEqual({ color: 'red' })
  })

  it('supports function-backed reactive themes and theme subscriptions', () => {
    const engine = createStyleEngine({ key: 'adapter', renderer: createMockRenderer() })
    let currentTheme = { color: 'red' }
    const system = createReactStyleSystem({
      engine,
      theme: () => currentTheme,
    })
    let calls = 0
    const unsubscribe = system.StyleProvider.runtime.subscribeTheme(() => {
      calls++
    })

    expect(system.useTheme()).toEqual({ color: 'red' })

    currentTheme = { color: 'green' }
    system.StyleProvider.runtime.setTheme(() => currentTheme)

    expect(calls).toBe(1)
    expect(system.useTheme()).toEqual({ color: 'green' })

    system.StyleProvider.runtime.updateTheme(theme => ({ color: `${theme.color}-next` }))

    expect(calls).toBe(2)
    expect(system.useTheme()).toEqual({ color: 'green-next' })

    unsubscribe()
    system.StyleProvider.runtime.setTheme({ color: 'black' })
    expect(calls).toBe(2)
  })

  it('passes responsive helpers through hook/composable style APIs', () => {
    const engine = createStyleEngine({ key: 'adapter', renderer: createMockRenderer() })
    const responsive = createResponsive({ breakpoints: { mobile: 0, tablet: 768 } })
    const system = createSolidStyleSystem({
      engine,
      theme: { gap: 8 },
      responsive,
    })
    const useStyles = system.createUseStyles(({ theme, responsive }, props: { dense: boolean }) => ({
      root: responsive!.object({
        base: { gap: props.dense ? theme.gap : theme.gap * 2 },
        up: { tablet: { gap: 24 } },
      }),
    }))

    const result = useStyles({ dense: true })

    expect(system.useResponsive()).toBe(responsive)
    expect(engine.extract().cssText).toContain(`.${result.styles.root}{gap:8px;}`)
    expect(engine.extract().cssText).toContain(`@media (min-width: 768px){.${result.styles.root}{gap:24px;}}`)
  })

  it('creates a React-compatible external store bridge for responsive observers', () => {
    const responsive = createResponsive({ breakpoints: { mobile: 0, tablet: 768 } })
    const observer = createResponsiveObserver(responsive, {
      matchMedia: createStaticMatchMedia(900),
      ssr: { width: 500 },
    })
    const store = createResponsiveExternalStore(observer)

    expect(store.getServerSnapshot().current).toBe('mobile')
    expect(store.getSnapshot().current).toBe('tablet')

    let calls = 0
    const unsubscribe = store.subscribe(() => {
      calls++
    })
    unsubscribe()

    expect(calls).toBe(0)
  })
})
