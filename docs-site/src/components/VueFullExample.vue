<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  createDOMRenderer,
  createNoopRenderer,
  createResponsive,
  createStyleEngine,
  createVueStyleSystem,
} from 'web-style-engine'

const dense = ref(false)
const highlighted = ref(true)

const responsive = createResponsive({
  breakpoints: {
    compact: 0,
    regular: 760,
    wide: 1120,
  },
})

const engine = createStyleEngine({
  key: 'vue-example',
  renderer: typeof document === 'undefined' ? createNoopRenderer() : createDOMRenderer(),
  dev: true,
})

const system = createVueStyleSystem({
  engine,
  theme: {
    accent: '#0f766e',
    accentStrong: '#115e59',
    border: 'rgba(15, 118, 110, 0.24)',
    muted: '#3f5f58',
    surface: '#ecfdf5',
    panel: '#ffffff',
    text: '#14342e',
  },
  responsive,
})

const useStyles = system.createUseStyles(({ theme, responsive }, props: { dense: boolean; highlighted: boolean }) => ({
  shell: {
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    background: theme.surface,
    color: theme.text,
    padding: props.dense ? 14 : 20,
    display: 'grid',
    gap: props.dense ? 12 : 16,
    boxShadow: props.highlighted ? '0 18px 42px rgba(15, 118, 110, 0.14)' : 'none',
    ...responsive!.object({
      up: {
        regular: {
          gridTemplateColumns: '1.15fr 0.85fr',
          alignItems: 'stretch',
        },
      },
    }),
  },
  panel: {
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    background: theme.panel,
    padding: props.dense ? 12 : 16,
  },
  title: {
    margin: 0,
    fontSize: 20,
    lineHeight: 1.2,
  },
  muted: {
    color: theme.muted,
    margin: '8px 0 0',
    lineHeight: 1.6,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  button: {
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    background: theme.panel,
    color: theme.text,
    cursor: 'pointer',
    font: 'inherit',
    padding: '8px 12px',
  },
  primaryButton: {
    border: `1px solid ${theme.accentStrong}`,
    borderRadius: 8,
    background: theme.accent,
    color: 'white',
    cursor: 'pointer',
    font: 'inherit',
    padding: '8px 12px',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  metric: {
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    background: theme.surface,
    padding: 12,
  },
  value: {
    display: 'block',
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1,
  },
  label: {
    color: theme.muted,
    display: 'block',
    fontSize: 12,
    marginTop: 6,
  },
}), { label: 'VueFullExample' })

const result = computed(() => useStyles({
  dense: dense.value,
  highlighted: highlighted.value,
}))
</script>

<template>
  <section :class="result.styles.shell">
    <div :class="result.styles.panel">
      <h3 :class="result.styles.title">Vue dashboard card</h3>
      <p :class="result.styles.muted">
        A Vue component consuming the shared style engine, typed theme values, props, and responsive helpers.
      </p>
      <div :class="result.styles.actions">
        <button :class="result.styles.primaryButton" type="button" @click="highlighted = !highlighted">
          Toggle highlight
        </button>
        <button :class="result.styles.button" type="button" @click="dense = !dense">
          Toggle density
        </button>
      </div>
    </div>

    <div :class="result.styles.metricGrid">
      <div :class="result.styles.metric">
        <span :class="result.styles.value">3</span>
        <span :class="result.styles.label">breakpoints</span>
      </div>
      <div :class="result.styles.metric">
        <span :class="result.styles.value">2</span>
        <span :class="result.styles.label">state toggles</span>
      </div>
      <div :class="result.styles.metric">
        <span :class="result.styles.value">1</span>
        <span :class="result.styles.label">engine instance</span>
      </div>
      <div :class="result.styles.metric">
        <span :class="result.styles.value">0</span>
        <span :class="result.styles.label">framework code in core</span>
      </div>
    </div>
  </section>
</template>
