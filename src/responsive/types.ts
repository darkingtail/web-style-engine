export type BreakpointMap = Record<string, number>
export type BreakpointKey<TBreakpoints extends BreakpointMap> = Extract<keyof TBreakpoints, string>
export type ResponsiveUnit = 'px' | 'em' | 'rem' | ((value: number) => string)
export type QueryMode = 'up' | 'down' | 'below' | 'only'
export type ColorScheme = 'light' | 'dark'
export type ReducedMotion = 'reduce' | 'no-preference'
export type ContrastPreference = 'more' | 'less' | 'custom' | 'no-preference'
export type ForcedColors = 'active' | 'none'
export type SafeAreaSide = 'top' | 'right' | 'bottom' | 'left'

export interface AliasRange<TBreakpoints extends BreakpointMap> {
  up?: BreakpointKey<TBreakpoints>
  down?: BreakpointKey<TBreakpoints>
  below?: BreakpointKey<TBreakpoints>
  only?: BreakpointKey<TBreakpoints>
  between?: readonly [BreakpointKey<TBreakpoints>, BreakpointKey<TBreakpoints>]
}

export type ResponsiveAliases<TBreakpoints extends BreakpointMap> = Record<string, AliasRange<TBreakpoints>>

export interface ResponsivePreset<TBreakpoints extends BreakpointMap = BreakpointMap> {
  name: string
  breakpoints: TBreakpoints
  aliases?: ResponsiveAliases<TBreakpoints>
  unit?: ResponsiveUnit
  step?: number
}

export interface CreateResponsiveOptions<TBreakpoints extends BreakpointMap = BreakpointMap> {
  preset?: ResponsivePreset<TBreakpoints>
  breakpoints?: TBreakpoints
  aliases?: ResponsiveAliases<TBreakpoints>
  unit?: ResponsiveUnit
  step?: number
  mediaType?: string | false
}

export interface NormalizedBreakpoint<K extends string = string> {
  key: K
  value: number
}

export type QueryRecord<TBreakpoints extends BreakpointMap> = {
  readonly [K in BreakpointKey<TBreakpoints>]: string
}

export interface BetweenInput<TBreakpoints extends BreakpointMap, TStyle> {
  from: BreakpointKey<TBreakpoints>
  to: BreakpointKey<TBreakpoints>
  style: TStyle
}

export interface ResponsiveStyleInput<TBreakpoints extends BreakpointMap, TStyle> {
  base?: TStyle
  up?: Partial<Record<BreakpointKey<TBreakpoints>, TStyle>>
  down?: Partial<Record<BreakpointKey<TBreakpoints>, TStyle>>
  below?: Partial<Record<BreakpointKey<TBreakpoints>, TStyle>>
  only?: Partial<Record<BreakpointKey<TBreakpoints>, TStyle>>
  between?: Array<BetweenInput<TBreakpoints, TStyle>>
}

export type ResponsiveCSSObject = Record<string, unknown>

export type ResponsiveRule<TBreakpoints extends BreakpointMap, TStyle> =
  | {
    type: 'base'
    style: TStyle
  }
  | {
    type: 'media'
    mode: QueryMode | 'between'
    breakpoint?: BreakpointKey<TBreakpoints>
    from?: BreakpointKey<TBreakpoints>
    to?: BreakpointKey<TBreakpoints>
    query: string
    style: TStyle
  }

export interface ResponsiveSnapshot<TBreakpoints extends BreakpointMap, TAliases extends ResponsiveAliases<TBreakpoints> | undefined = ResponsiveAliases<TBreakpoints> | undefined> {
  matches: Record<BreakpointKey<TBreakpoints>, boolean>
  only: Record<BreakpointKey<TBreakpoints>, boolean>
  current: BreakpointKey<TBreakpoints> | undefined
  aliases: TAliases extends ResponsiveAliases<TBreakpoints> ? Record<Extract<keyof TAliases, string>, boolean> : Record<string, boolean>
}

export interface ResponsiveObserver<TBreakpoints extends BreakpointMap, TAliases extends ResponsiveAliases<TBreakpoints> | undefined = ResponsiveAliases<TBreakpoints> | undefined> {
  getSnapshot(): ResponsiveSnapshot<TBreakpoints, TAliases>
  getServerSnapshot(): ResponsiveSnapshot<TBreakpoints, TAliases>
  subscribe(listener: () => void): () => void
}

export interface Responsive<TBreakpoints extends BreakpointMap = BreakpointMap, TAliases extends ResponsiveAliases<TBreakpoints> | undefined = ResponsiveAliases<TBreakpoints> | undefined> {
  readonly breakpoints: TBreakpoints
  readonly sortedBreakpoints: ReadonlyArray<NormalizedBreakpoint<BreakpointKey<TBreakpoints>>>
  readonly aliases: TAliases
  readonly unit: ResponsiveUnit
  readonly step: number
  readonly mediaType: string | false
  readonly media: ResponsiveMediaHelpers
  readonly container: ResponsiveContainerHelpers<TBreakpoints>
  readonly h5: ResponsiveH5Helpers
  up: ((key: BreakpointKey<TBreakpoints>) => string) & QueryRecord<TBreakpoints>
  down: ((key: BreakpointKey<TBreakpoints>) => string) & QueryRecord<TBreakpoints>
  below: ((key: BreakpointKey<TBreakpoints>) => string) & QueryRecord<TBreakpoints>
  only: ((key: BreakpointKey<TBreakpoints>) => string) & QueryRecord<TBreakpoints>
  between(from: BreakpointKey<TBreakpoints>, to: BreakpointKey<TBreakpoints>): string
  alias(name: TAliases extends ResponsiveAliases<TBreakpoints> ? Extract<keyof TAliases, string> : string): string
  query(range: AliasRange<TBreakpoints>): string
  rules<TStyle>(input: ResponsiveStyleInput<TBreakpoints, TStyle>): Array<ResponsiveRule<TBreakpoints, TStyle>>
  object<TStyle extends ResponsiveCSSObject>(input: ResponsiveStyleInput<TBreakpoints, TStyle>): ResponsiveCSSObject
  css(input: ResponsiveStyleInput<TBreakpoints, ResponsiveCSSObject> & { selector: string }): string
}

export type AnyResponsive = Responsive<any, any>

export interface ResponsiveMediaHelpers {
  print(): string
  colorScheme(value: ColorScheme): string
  reducedMotion(value?: ReducedMotion): string
  contrast(value?: ContrastPreference): string
  forcedColors(value?: ForcedColors): string
}

export interface ContainerQueryOptions {
  name?: string
}

export interface ResponsiveContainerHelpers<TBreakpoints extends BreakpointMap> {
  up(key: BreakpointKey<TBreakpoints>, options?: ContainerQueryOptions): string
  down(key: BreakpointKey<TBreakpoints>, options?: ContainerQueryOptions): string
  below(key: BreakpointKey<TBreakpoints>, options?: ContainerQueryOptions): string
  only(key: BreakpointKey<TBreakpoints>, options?: ContainerQueryOptions): string
  between(from: BreakpointKey<TBreakpoints>, to: BreakpointKey<TBreakpoints>, options?: ContainerQueryOptions): string
  query(condition: string, options?: ContainerQueryOptions): string
}

export interface ViewportUnitOptions {
  viewport: number
  precision?: number
}

export interface SafeAreaInsetOptions {
  fallback?: string
}

export interface ResponsiveH5Helpers {
  vw(value: number, options?: ViewportUnitOptions): string
  vh(value: number, options?: ViewportUnitOptions): string
  vmin(value: number, options?: ViewportUnitOptions): string
  vmax(value: number, options?: ViewportUnitOptions): string
  safeAreaInset(side: SafeAreaSide, options?: SafeAreaInsetOptions): string
  safeAreaPadding(options?: Partial<Record<SafeAreaSide, string>> & { fallback?: string }): ResponsiveCSSObject
}

export type MatchMediaLike = (query: string) => MediaQueryListLike

export interface MediaQueryListLike {
  readonly matches: boolean
  addEventListener?: (type: 'change', listener: (event: { matches: boolean }) => void) => void
  removeEventListener?: (type: 'change', listener: (event: { matches: boolean }) => void) => void
  addListener?: (listener: (event: { matches: boolean }) => void) => void
  removeListener?: (listener: (event: { matches: boolean }) => void) => void
}

export interface CreateResponsiveObserverOptions<TBreakpoints extends BreakpointMap> {
  matchMedia?: MatchMediaLike
  ssr?: {
    width?: number
  }
}

export interface StyleAdapter<TInput, TOutput> {
  rule(query: string, style: TInput): TOutput
  merge(parts: TOutput[]): TOutput
}
