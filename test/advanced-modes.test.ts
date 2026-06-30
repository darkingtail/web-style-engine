import { describe, expect, it } from 'vitest'
import { createMockRenderer, createStyleEngine } from '../src'

describe('advanced modes and tooling APIs', () => {
  it('keeps block mode as the default runtime behavior', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({ key: 'adv', renderer, dev: false })

    const className = engine.css({ color: 'red', padding: 8 })

    expect(className.split(/\s+/)).toHaveLength(1)
    expect(renderer.rules).toHaveLength(1)
    expect(renderer.extract().cssText).toContain(`.${className}{color:red;padding:8px;}`)
  })

  it('generates atomic classes only behind explicit mode option', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({
      key: 'adv',
      renderer,
      mode: 'atomic',
      extractionMode: 'hybrid',
      dev: false,
    })

    const className = engine.css({ color: 'red', padding: 8 }, { label: 'Button-root' })
    const classes = className.split(/\s+/)

    expect(classes).toHaveLength(2)
    expect(renderer.rules).toHaveLength(2)
    expect(renderer.extract().cssText).toContain(`.${classes[0]}{color:red;}`)
    expect(renderer.extract().cssText).toContain(`.${classes[1]}{padding:8px;}`)
    expect(renderer.rules.every(rule => rule.metadata?.atomic === true)).toBe(true)
    expect(renderer.rules.every(rule => rule.metadata?.extractionMode === 'hybrid')).toBe(true)
  })

  it('falls back to block output for nested styles in atomic mode', () => {
    const renderer = createMockRenderer()
    const engine = createStyleEngine({
      key: 'adv',
      renderer,
      mode: 'atomic',
      dev: false,
    })

    const className = engine.css({
      color: 'red',
      '&:hover': {
        color: 'blue',
      },
    })

    expect(className.split(/\s+/)).toHaveLength(1)
    expect(renderer.rules).toHaveLength(1)
    expect(renderer.rules[0]!.metadata?.mode).toBe('atomic')
    expect(renderer.rules[0]!.metadata?.atomic).toBeUndefined()
  })

  it('inspects className sources and creates serializable rule snapshots', () => {
    const engine = createStyleEngine({
      key: 'adv',
      renderer: createMockRenderer(),
      mode: 'atomic',
      extractionMode: 'static',
      dev: true,
    })

    const className = engine.css({ color: 'red', marginLeft: 12 }, {
      label: 'Card-root',
      metadata: {
        component: 'Card',
        slot: 'root',
      },
    })
    const inspection = engine.inspectClassName(className)
    const snapshots = engine.snapshotRules()

    expect(inspection.className).toBe(className)
    expect(inspection.rules).toHaveLength(2)
    expect(inspection.rules[0]!.metadata).toMatchObject({
      component: 'Card',
      slot: 'root',
      mode: 'atomic',
      extractionMode: 'static',
      atomic: true,
      label: 'Card-root',
    })
    expect(JSON.parse(JSON.stringify(snapshots))).toEqual(snapshots)
    expect(engine.getRule(snapshots[0]!.id)?.id).toBe(snapshots[0]!.id)
  })

  it('returns empty inspection results for unknown class names', () => {
    const engine = createStyleEngine({ key: 'adv', renderer: createMockRenderer() })

    expect(engine.inspectClassName('missing')).toEqual({
      className: 'missing',
      rules: [],
    })
  })

  it('can create an engine when process is unavailable in Edge-like runtimes', () => {
    const globalWithProcess = globalThis as typeof globalThis & { process?: NodeJS.Process }
    const originalProcess = globalWithProcess.process

    try {
      delete globalWithProcess.process
      const renderer = createMockRenderer()
      const engine = createStyleEngine({ key: 'edge', renderer })

      const className = engine.css({ color: 'red' }, { label: 'Edge' })

      expect(className).toContain('edge-Edge-')
      expect(renderer.extract().cssText).toContain('color:red')
    } finally {
      globalWithProcess.process = originalProcess
    }
  })
})
