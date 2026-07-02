import type { createVueStyleSystem } from 'web-style-engine'
import type { responsive, theme } from '../plugins/style-engine'

type StyleSystem = ReturnType<typeof createVueStyleSystem<typeof theme, typeof responsive>>

declare module '#app' {
  interface NuxtApp {
    $styleSystem: StyleSystem
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $styleSystem: StyleSystem
  }
}

export {}
