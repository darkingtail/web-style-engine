import type { StyleTransformer } from '../core/types'

export interface Px2RemOptions {
  rootValue: number
  precision?: number
  minPixelValue?: number
}

export interface Px2VwOptions {
  viewportWidth: number
  precision?: number
  minPixelValue?: number
}

export function px2rem(options: Px2RemOptions): StyleTransformer {
  const precision = options.precision ?? 5
  const minPixelValue = options.minPixelValue ?? 0
  return cssText => cssText.replace(/(-?\d*\.?\d+)px/g, (_, value: string) => {
    const numberValue = Number(value)
    if (Number.isNaN(numberValue) || numberValue === 0 || Math.abs(numberValue) <= minPixelValue) return `${value}px`
    return `${Number((numberValue / options.rootValue).toFixed(precision))}rem`
  })
}

export function px2vw(options: Px2VwOptions): StyleTransformer {
  const precision = options.precision ?? 5
  const minPixelValue = options.minPixelValue ?? 0
  if (!Number.isFinite(options.viewportWidth) || options.viewportWidth <= 0) {
    throw new Error('px2vw: viewportWidth must be a positive finite number')
  }
  return cssText => cssText.replace(/(-?\d*\.?\d+)px/g, (_, value: string) => {
    const numberValue = Number(value)
    if (Number.isNaN(numberValue) || numberValue === 0 || Math.abs(numberValue) <= minPixelValue) return `${value}px`
    return `${Number(((numberValue / options.viewportWidth) * 100).toFixed(precision))}vw`
  })
}

export function rtlTransformer(): StyleTransformer {
  return cssText => cssText
    .replace(/margin-left/g, 'margin-__tmp_right')
    .replace(/margin-right/g, 'margin-left')
    .replace(/margin-__tmp_right/g, 'margin-right')
    .replace(/padding-left/g, 'padding-__tmp_right')
    .replace(/padding-right/g, 'padding-left')
    .replace(/padding-__tmp_right/g, 'padding-right')
    .replace(/border-left/g, 'border-__tmp_right')
    .replace(/border-right/g, 'border-left')
    .replace(/border-__tmp_right/g, 'border-right')
}
