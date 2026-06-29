export type ClassValue = string | number | false | null | undefined | ClassDictionary | ClassArray

export interface ClassDictionary {
  [className: string]: unknown
}

export interface ClassArray extends Array<ClassValue> {}

export type CSSPrimitive = string | number | null | undefined | false

export interface CSSObject {
  [property: string]: CSSPrimitive | CSSObject
}

export type StyleInput = CSSObject | string

export interface StyleOptions {
  label?: string
  layer?: string
  specificity?: 'normal' | 'low' | 'high'
  priority?: number
  metadata?: Record<string, unknown>
}

export interface GlobalStyleOptions extends Omit<StyleOptions, 'specificity'> {
  id?: string
}

export interface StyleRule {
  id: string
  className?: string
  cssText: string
  layer?: string
  priority?: number
  metadata?: Record<string, unknown>
}

export interface ExtractedStyle {
  cssText: string
  rules: StyleRule[]
  styleTags?: string
}

export interface StyleRenderer {
  insert(rule: StyleRule): void
  remove?(id: string): void
  flush?(): void
  hydrate?(source?: unknown): void
  extract?(): ExtractedStyle
}

export interface StyleRegistry {
  has(id: string): boolean
  get(id: string): StyleRule | undefined
  add(rule: StyleRule): void
  remove(id: string): void
  clear(): void
  values(): StyleRule[]
}

export interface StyleTransformerContext {
  engineKey: string
  options?: StyleOptions | GlobalStyleOptions
}

export type StyleTransformer = (cssText: string, context: StyleTransformerContext) => string

export interface StyleEngineOptions {
  key?: string
  renderer?: StyleRenderer
  registry?: StyleRegistry
  transformers?: StyleTransformer[]
  container?: Document | Element | ShadowRoot
  nonce?: string
  insertionPoint?: ChildNode | null
  layer?: string
  specificity?: 'normal' | 'low' | 'high'
  dev?: boolean
}

export interface StyleEngine {
  key: string
  css(input: StyleInput, options?: StyleOptions): string
  cx(...classNames: ClassValue[]): string
  keyframes(input: StyleInput, options?: StyleOptions): string
  fontFace(input: StyleInput, options?: GlobalStyleOptions): string | void
  injectGlobal(input: StyleInput, options?: GlobalStyleOptions): string | void
  vars(tokens: Record<string, unknown>, options?: CSSVarsOptions): string | void
  vars(scope: string, tokens: Record<string, unknown>, options?: CSSVarsOptions): string | void
  flush(): void
  dispose(id: string): void
  hydrate(source?: unknown): void
  extract(): ExtractedStyle
  getRegistry(): StyleRegistry
}

export interface CSSVarsOptions extends GlobalStyleOptions {
  prefix?: string
  fallback?: boolean
}
