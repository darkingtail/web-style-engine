import type { StylePlugin, StyleTransformer } from '../core/types'

export interface Px2RemOptions {
  rootValue: number
  precision?: number
  minPixelValue?: number
  include?: RegExp
  exclude?: RegExp
}

export interface Px2VwOptions {
  viewportWidth: number
  precision?: number
  minPixelValue?: number
  include?: RegExp
  exclude?: RegExp
}

function shouldTransformPx(cssText: string, options: Pick<Px2RemOptions, 'include' | 'exclude'>): boolean {
  if (options.include && !options.include.test(cssText)) return false
  if (options.exclude && options.exclude.test(cssText)) return false
  return true
}

function validatePositiveFinite(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive finite number`)
  }
}

function replacePx(cssText: string, convert: (value: number) => string, minPixelValue: number): string {
  return cssText.replace(/(-?\d*\.?\d+)px/g, (_, value: string) => {
    const numberValue = Number(value)
    if (Number.isNaN(numberValue) || numberValue === 0 || Math.abs(numberValue) <= minPixelValue) return `${value}px`
    return convert(numberValue)
  })
}

export function px2rem(options: Px2RemOptions): StyleTransformer {
  validatePositiveFinite('px2rem: rootValue', options.rootValue)
  const precision = options.precision ?? 5
  const minPixelValue = options.minPixelValue ?? 0
  return cssText => {
    if (!shouldTransformPx(cssText, options)) return cssText
    return replacePx(cssText, value => `${Number((value / options.rootValue).toFixed(precision))}rem`, minPixelValue)
  }
}

export function px2vw(options: Px2VwOptions): StyleTransformer {
  validatePositiveFinite('px2vw: viewportWidth', options.viewportWidth)
  const precision = options.precision ?? 5
  const minPixelValue = options.minPixelValue ?? 0
  return cssText => {
    if (!shouldTransformPx(cssText, options)) return cssText
    return replacePx(cssText, value => `${Number(((value / options.viewportWidth) * 100).toFixed(precision))}vw`, minPixelValue)
  }
}

export function rtlTransformer(): StyleTransformer {
  return cssText => cssText
    .replace(/\bleft\b/g, '__wse_tmp_left__')
    .replace(/\bright\b/g, 'left')
    .replace(/__wse_tmp_left__/g, 'right')
}

export interface PrefixerOptions {
  order?: number
}

export function prefixer(options: PrefixerOptions = {}): StylePlugin {
  return {
    name: 'prefixer',
    order: options.order ?? 0,
    transform(cssText) {
      let next = cssText
      next = next.replace(/display:flex;/g, 'display:-webkit-box;display:-ms-flexbox;display:flex;')
      next = next.replace(/user-select:([^;]+);/g, (_, value: string) => `-webkit-user-select:${value};user-select:${value};`)
      next = next.replace(/appearance:([^;]+);/g, (_, value: string) => `-webkit-appearance:${value};appearance:${value};`)
      next = next.replace(/backdrop-filter:([^;]+);/g, (_, value: string) => `-webkit-backdrop-filter:${value};backdrop-filter:${value};`)
      return next
    },
  }
}
