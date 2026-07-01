<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import {
  createDOMRenderer,
  createNoopRenderer,
  createResponsive,
  createResponsiveObserver,
  createStyleEngine,
  createVueStyleSystem,
} from 'web-style-engine'
import { isZh, type DocsLocale } from './i18n'

const props = defineProps<{
  locale?: DocsLocale
}>()

const zh = isZh(props.locale)

const responsive = createResponsive({
  breakpoints: {
    compact: 0,
    regular: 720,
    wide: 1080,
  },
})

const observer = createResponsiveObserver(responsive, {
  ssr: { width: 1024 },
})
const snapshot = ref(observer.getSnapshot())
let unsubscribe: (() => void) | undefined

onMounted(() => {
  snapshot.value = observer.getSnapshot()
  unsubscribe = observer.subscribe(() => {
    snapshot.value = observer.getSnapshot()
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

const engine = createStyleEngine({
  key: 'vue-demo',
  renderer: typeof document === 'undefined' ? createNoopRenderer() : createDOMRenderer(),
  dev: true,
})

const system = createVueStyleSystem({
  engine,
  theme: {
    accent: '#0f766e',
    text: '#17342f',
    surface: '#ecfdf5',
  },
  responsive,
})

const useStyles = system.createUseStyles(({ theme, responsive }) => ({
  root: {
    border: '1px solid rgba(15, 118, 110, 0.24)',
    borderRadius: 8,
    background: theme.surface,
    color: theme.text,
    padding: 16,
    display: 'grid',
    gap: 12,
    boxShadow: '0 10px 30px rgba(15, 118, 110, 0.08)',
    ...responsive!.object({
      up: {
        regular: {
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          padding: 20,
        },
      },
    }),
  },
  badge: {
    borderRadius: 999,
    background: theme.accent,
    color: 'white',
    padding: '6px 10px',
    fontSize: 12,
    fontWeight: 700,
    width: 'max-content',
  },
  note: {
    color: '#3f5f58',
    fontSize: 13,
    margin: '6px 0 0',
  },
}), { label: 'VueDemo' })

const { styles } = useStyles({})
</script>

<template>
  <section :class="[styles.root, 'not-content']">
    <div>
      <strong>{{ zh ? 'Vue 适配器' : 'Vue adapter' }}</strong>
      <p>{{ zh ? '通过面向 Vue 的 composable 样式使用共享样式引擎。' : 'Uses the shared style engine with Vue-facing composable styles.' }}</p>
      <p :class="styles.note">
        {{ zh ? '缩放窗口时，右侧断点会随 matchMedia 变化。' : 'Resize the viewport; the breakpoint badge follows matchMedia.' }}
      </p>
    </div>
    <span :class="styles.badge">
      {{ zh ? `当前断点: ${snapshot.current ?? 'unknown'}` : `breakpoint: ${snapshot.current ?? 'unknown'}` }}
    </span>
  </section>
</template>
