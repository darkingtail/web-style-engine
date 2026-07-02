import { computed, ref } from 'vue'
import {
  createDOMRenderer,
  createResponsive,
  createSSRRenderer,
  createStyleEngine,
  createVueStyleSystem,
} from 'web-style-engine'
import type { StyleEngine, StyleRenderer } from 'web-style-engine'

const STYLE_KEY = 'nuxt-ssr'

export const theme = {
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

export const responsive = createResponsive({
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
  system: ReturnType<typeof createVueStyleSystem<Theme, typeof responsive>>
}

function createRuntime(): Runtime {
  const renderer = import.meta.server
    ? createSSRRenderer({ key: STYLE_KEY })
    : createDOMRenderer({ key: STYLE_KEY })

  if (import.meta.client) {
    renderer.hydrate?.(document.querySelectorAll(`style[data-${STYLE_KEY}="${STYLE_KEY}"]`))
  }

  const engine = createStyleEngine({
    key: STYLE_KEY,
    renderer,
    dev: import.meta.dev,
  })

  engine.vars(':root', theme, {
    prefix: STYLE_KEY,
    metadata: { example: 'nuxt-ssr', critical: true },
  })

  const system = createVueStyleSystem({
    engine,
    theme,
    responsive,
  })

  return { engine, renderer, system }
}

export default defineNuxtPlugin((nuxtApp) => {
  const runtime = createRuntime()

  if (import.meta.server) {
    const cssText = ref('')
    const ruleIds = ref('')

    useHead({
      style: [
        {
          key: STYLE_KEY,
          [`data-${STYLE_KEY}`]: STYLE_KEY,
          [`data-${STYLE_KEY}-ids`]: computed(() => ruleIds.value),
          children: computed(() => cssText.value),
        },
      ],
    })

    nuxtApp.hook('app:rendered', () => {
      const extracted = runtime.engine.extract()
      cssText.value = extracted.cssText
      ruleIds.value = extracted.rules.map(rule => rule.id).join(' ')
    })
  }

  return {
    provide: {
      styleSystem: runtime.system,
    },
  }
})
