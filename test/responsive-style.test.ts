import { describe, expect, it } from 'vitest'
import { createResponsive, createResponsiveStyle } from '../src'

describe('responsive style outputs', () => {
  const responsive = createResponsive({
    breakpoints: {
      mobile: 0,
      tablet: 768,
      laptop: 1024,
      desktop: 1280,
    },
  })

  it('creates CSS object output with base styles and sorted media blocks', () => {
    const output = responsive.object({
      base: {
        display: 'block',
        padding: 12,
      },
      up: {
        desktop: { padding: 32 },
        tablet: { padding: 24 },
      },
      down: {
        laptop: { color: 'red' },
        tablet: { color: 'blue' },
      },
    })

    expect(output).toEqual({
      display: 'block',
      padding: 12,
      '@media (min-width: 768px)': { padding: 24 },
      '@media (min-width: 1280px)': { padding: 32 },
      '@media (max-width: 1279px)': { color: 'red' },
      '@media (max-width: 1023px)': { color: 'blue' },
    })
    expect(Object.keys(output)).toEqual([
      'display',
      'padding',
      '@media (min-width: 768px)',
      '@media (min-width: 1280px)',
      '@media (max-width: 1279px)',
      '@media (max-width: 1023px)',
    ])
  })

  it('creates structured rules for all supported query modes', () => {
    const rules = responsive.rules({
      base: { color: 'black' },
      up: { tablet: { color: 'green' } },
      below: { tablet: { color: 'gray' } },
      only: { laptop: { color: 'orange' } },
      between: [
        { from: 'tablet', to: 'desktop', style: { color: 'purple' } },
      ],
    })

    expect(rules).toEqual([
      { type: 'base', style: { color: 'black' } },
      { type: 'media', mode: 'up', breakpoint: 'tablet', query: '@media (min-width: 768px)', style: { color: 'green' } },
      { type: 'media', mode: 'below', breakpoint: 'tablet', query: '@media (max-width: 767px)', style: { color: 'gray' } },
      { type: 'media', mode: 'only', breakpoint: 'laptop', query: '@media (min-width: 1024px) and (max-width: 1279px)', style: { color: 'orange' } },
      { type: 'media', mode: 'between', from: 'tablet', to: 'desktop', query: '@media (min-width: 768px) and (max-width: 1279px)', style: { color: 'purple' } },
    ])
  })

  it('creates CSS string output for vanilla style usage', () => {
    const css = responsive.css({
      selector: '.card',
      base: {
        backgroundColor: 'red',
        padding: 12,
      },
      up: {
        tablet: {
          padding: 24,
        },
      },
    })

    expect(css).toBe(`.card {
  background-color: red;
  padding: 12px;
}

@media (min-width: 768px) {
.card {
  padding: 24px;
}
}`)
  })

  it('supports a custom style adapter protocol', () => {
    const style = createResponsiveStyle(responsive, {
      rule(query: string, style: string) {
        return `${query}{${style}}`
      },
      merge(parts: string[]) {
        return parts.join('|')
      },
    })

    expect(style({
      base: 'base',
      up: {
        tablet: 'tablet',
      },
    })).toBe('base|@media (min-width: 768px){tablet}')
  })
})
