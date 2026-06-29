import { describe, expect, it } from 'vitest'
import { createResponsive, defineResponsivePreset, defaultBreakpoints } from '../src'

describe('responsive core query system', () => {
  it('uses library defaults when no options are provided', () => {
    const responsive = createResponsive()

    expect(responsive.breakpoints).toEqual(defaultBreakpoints)
    expect(responsive.sortedBreakpoints.map((item) => item.key)).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'])
    expect(responsive.up('md')).toBe('@media (min-width: 768px)')
    expect(responsive.up.md).toBe('@media (min-width: 768px)')
  })

  it('sorts custom breakpoints by value instead of object declaration order', () => {
    const responsive = createResponsive({
      breakpoints: {
        desktop: 1280,
        mobile: 0,
        tablet: 768,
      },
    })

    expect(responsive.sortedBreakpoints).toEqual([
      { key: 'mobile', value: 0 },
      { key: 'tablet', value: 768 },
      { key: 'desktop', value: 1280 },
    ])
  })

  it('generates up, down, below, only, and between queries with stable boundary semantics', () => {
    const responsive = createResponsive({
      breakpoints: {
        mobile: 0,
        tablet: 768,
        desktop: 1280,
      },
    })

    expect(responsive.up('tablet')).toBe('@media (min-width: 768px)')
    expect(responsive.up.tablet).toBe('@media (min-width: 768px)')
    expect(responsive.down('tablet')).toBe('@media (max-width: 1279px)')
    expect(responsive.down.tablet).toBe('@media (max-width: 1279px)')
    expect(responsive.below('tablet')).toBe('@media (max-width: 767px)')
    expect(responsive.only('tablet')).toBe('@media (min-width: 768px) and (max-width: 1279px)')
    expect(responsive.between('tablet', 'desktop')).toBe('@media (min-width: 768px) and (max-width: 1279px)')
  })

  it('treats down on the largest breakpoint as a query that matches all normal widths', () => {
    const responsive = createResponsive({
      breakpoints: {
        mobile: 0,
        tablet: 768,
        desktop: 1280,
      },
    })

    expect(responsive.down('desktop')).toBe('@media (min-width: 0px)')
  })

  it('supports decimal step and non-default media type', () => {
    const responsive = createResponsive({
      breakpoints: {
        sm: 576,
        md: 768,
      },
      step: 0.02,
      mediaType: 'screen',
    })

    expect(responsive.down('sm')).toBe('@media screen and (max-width: 767.98px)')
    expect(responsive.only('sm')).toBe('@media screen and (min-width: 576px) and (max-width: 767.98px)')
  })

  it('supports custom units as strings and formatter functions', () => {
    const rem = createResponsive({
      breakpoints: {
        sm: 36,
        md: 48,
      },
      unit: 'rem',
    })
    expect(rem.up('md')).toBe('@media (min-width: 48rem)')

    const em = createResponsive({
      breakpoints: {
        sm: 576,
        md: 768,
      },
      unit: (value) => `${value / 16}em`,
    })
    expect(em.up('md')).toBe('@media (min-width: 48em)')
    expect(em.down('sm')).toBe('@media (max-width: 47.9375em)')
  })

  it('rejects invalid breakpoint definitions and invalid options', () => {
    expect(() => createResponsive({ breakpoints: {} })).toThrow('must not be empty')
    expect(() => createResponsive({ breakpoints: { up: 0 } })).toThrow('reserved')
    expect(() => createResponsive({ breakpoints: { a: 1, b: 1 } })).toThrow('same value')
    expect(() => createResponsive({ breakpoints: { a: -1 } })).toThrow('non-negative finite number')
    expect(() => createResponsive({ breakpoints: { a: 0 }, step: 0 })).toThrow('positive finite number')
  })

  it('rejects invalid breakpoint usage at runtime', () => {
    const responsive = createResponsive({ breakpoints: { sm: 576, md: 768 } })

    expect(() => responsive.up('missing' as 'sm')).toThrow('unknown breakpoint')
    expect(() => responsive.between('md', 'sm')).toThrow('requires from to be smaller than to')
    expect(() => responsive.query({ up: 'sm', down: 'md' })).toThrow('exactly one query mode')
  })

  it('supports aliases through range queries', () => {
    const responsive = createResponsive({
      breakpoints: {
        mobile: 0,
        tablet: 768,
        desktop: 1280,
      },
      aliases: {
        handheld: { below: 'tablet' },
        content: { between: ['tablet', 'desktop'] },
        wide: { up: 'desktop' },
      },
    } as const)

    expect(responsive.alias('handheld')).toBe('@media (max-width: 767px)')
    expect(responsive.alias('content')).toBe('@media (min-width: 768px) and (max-width: 1279px)')
    expect(responsive.alias('wide')).toBe('@media (min-width: 1280px)')
    expect(() => responsive.alias('unknown' as 'handheld')).toThrow('unknown alias')
  })

  it('provides media feature helpers for device and accessibility preferences', () => {
    const responsive = createResponsive()

    expect(responsive.media.print()).toBe('@media print')
    expect(responsive.media.colorScheme('dark')).toBe('@media (prefers-color-scheme: dark)')
    expect(responsive.media.reducedMotion()).toBe('@media (prefers-reduced-motion: reduce)')
    expect(responsive.media.reducedMotion('no-preference')).toBe('@media (prefers-reduced-motion: no-preference)')
    expect(responsive.media.contrast()).toBe('@media (prefers-contrast: more)')
    expect(responsive.media.contrast('less')).toBe('@media (prefers-contrast: less)')
    expect(responsive.media.forcedColors()).toBe('@media (forced-colors: active)')
    expect(responsive.media.forcedColors('none')).toBe('@media (forced-colors: none)')
  })

  it('provides container query helpers using breakpoint semantics', () => {
    const responsive = createResponsive({
      breakpoints: {
        card: 0,
        panel: 480,
        shell: 960,
      },
      mediaType: 'screen',
    })

    expect(responsive.container.up('panel')).toBe('@container (min-width: 480px)')
    expect(responsive.container.down('panel')).toBe('@container (max-width: 959px)')
    expect(responsive.container.below('panel', { name: 'sidebar' })).toBe('@container sidebar (max-width: 479px)')
    expect(responsive.container.only('panel')).toBe('@container (min-width: 480px) and (max-width: 959px)')
    expect(responsive.container.between('panel', 'shell')).toBe('@container (min-width: 480px) and (max-width: 959px)')
    expect(responsive.container.query('(inline-size > 40rem)', { name: 'content' })).toBe('@container content (inline-size > 40rem)')
  })

  it('provides H5 viewport and safe-area helpers', () => {
    const responsive = createResponsive()

    expect(responsive.h5.vw(37.5)).toBe('10vw')
    expect(responsive.h5.vh(66.7, { viewport: 667, precision: 2 })).toBe('10vh')
    expect(responsive.h5.vmin(18.75)).toBe('5vmin')
    expect(responsive.h5.vmax(33.35, { viewport: 667, precision: 2 })).toBe('5vmax')
    expect(responsive.h5.safeAreaInset('bottom')).toBe('env(safe-area-inset-bottom, 0px)')
    expect(responsive.h5.safeAreaInset('top', { fallback: '12px' })).toBe('env(safe-area-inset-top, 12px)')
    expect(responsive.h5.safeAreaPadding({ bottom: '16px', fallback: '4px' })).toEqual({
      paddingTop: 'env(safe-area-inset-top, 4px)',
      paddingRight: 'env(safe-area-inset-right, 4px)',
      paddingBottom: '16px',
      paddingLeft: 'env(safe-area-inset-left, 4px)',
    })
    expect(() => responsive.h5.vw(1, { viewport: 0 })).toThrow('positive finite number')
  })

  it('merges preset options and lets user options override preset fields', () => {
    const preset = defineResponsivePreset({
      name: 'app',
      breakpoints: {
        compact: 0,
        regular: 768,
        wide: 1200,
      },
      aliases: {
        content: { only: 'regular' },
      },
      unit: 'px',
      step: 1,
    } as const)

    const fromPreset = createResponsive({ preset })
    expect(fromPreset.only('regular')).toBe('@media (min-width: 768px) and (max-width: 1199px)')
    expect(fromPreset.alias('content')).toBe('@media (min-width: 768px) and (max-width: 1199px)')

    const overridden = createResponsive({
      preset: preset as any,
      breakpoints: {
        compact: 0,
        regular: 800,
        wide: 1280,
      },
      step: 0.02,
    })

    expect(overridden.only('regular')).toBe('@media (min-width: 800px) and (max-width: 1279.98px)')
  })
})
