'use client'

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import {
  createDOMRenderer,
  createReactStyleSystem,
  createResponsive,
  createSSRRenderer,
  createStyleEngine,
} from 'web-style-engine'
import type { StyleEngine, StyleRenderer } from 'web-style-engine'

const STYLE_KEY = 'next-ssr'

const theme = {
  colorBg: '#f4f7f6',
  colorPanel: '#ffffff',
  colorPanelSoft: '#edf7f4',
  colorText: '#172033',
  colorMuted: '#5a6b78',
  colorPrimary: '#0f766e',
  colorPrimaryText: '#ffffff',
  colorBorder: '#cddbd7',
  shadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
  radius: 8,
}

const responsive = createResponsive({
  breakpoints: {
    compact: 0,
    tablet: 720,
    desktop: 1080,
  },
})

type Theme = typeof theme
type Runtime = {
  engine: StyleEngine
  renderer: StyleRenderer
  system: ReturnType<typeof createReactStyleSystem<Theme, typeof responsive>>
}

const StyleRuntimeContext = createContext<Runtime | null>(null)

function createRuntime(): Runtime {
  const renderer = typeof document === 'undefined'
    ? createSSRRenderer({ key: STYLE_KEY })
    : createDOMRenderer({ key: STYLE_KEY })

  if (typeof document !== 'undefined') {
    renderer.hydrate?.(document.querySelectorAll(`style[data-${STYLE_KEY}="${STYLE_KEY}"]`))
  }

  const engine = createStyleEngine({
    key: STYLE_KEY,
    renderer,
    dev: process.env.NODE_ENV !== 'production',
  })

  engine.vars(':root', theme, {
    prefix: STYLE_KEY,
    metadata: { example: 'next-ssr', critical: true },
  })

  const system = createReactStyleSystem({
    engine,
    theme,
    responsive,
  })

  return { engine, renderer, system }
}

export function StyleRegistry(props: { children: ReactNode }) {
  const [runtime] = useState(createRuntime)

  useServerInsertedHTML(() => {
    const extracted = runtime.engine.extract()
    const ids = extracted.rules.map(rule => rule.id).join(' ')

    if (!extracted.cssText) return null

    return (
      <style
        data-next-ssr={STYLE_KEY}
        data-next-ssr-ids={ids}
        dangerouslySetInnerHTML={{ __html: extracted.cssText }}
      />
    )
  })

  return (
    <StyleRuntimeContext.Provider value={runtime}>
      {props.children}
    </StyleRuntimeContext.Provider>
  )
}

export function useNextStyleSystem() {
  const runtime = useContext(StyleRuntimeContext)
  if (!runtime) throw new Error('useNextStyleSystem must be used inside StyleRegistry')
  return runtime.system
}
