<script setup lang="ts">
import {
  createDOMRenderer,
  createNoopRenderer,
  createResponsive,
  createStyleEngine,
  createVueStyleSystem,
} from 'web-style-engine'

const responsive = createResponsive({
  breakpoints: {
    compact: 0,
    regular: 720,
    wide: 1080,
  },
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

const useStyles = system.createStyles(({ theme, responsive }) => ({
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
}), { label: 'VueDemo' })

const { styles } = useStyles({})
</script>

<template>
  <section :class="styles.root">
    <div>
      <strong>Vue adapter</strong>
      <p>Uses the shared style engine with Vue-facing createStyles.</p>
    </div>
    <span :class="styles.badge">responsive.ready</span>
  </section>
</template>
