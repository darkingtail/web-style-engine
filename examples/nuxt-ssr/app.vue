<script setup lang="ts">
const { $styleSystem } = useNuxtApp()

const density = ref<'default' | 'compact'>('default')
const mode = ref<'growth' | 'ops'>('growth')

const useStyles = $styleSystem.createUseStyles(({ theme, responsive }, props: { density: 'default' | 'compact'; mode: 'growth' | 'ops' }) => ({
  shell: {
    minHeight: '100vh',
    padding: props.density === 'compact' ? 20 : 32,
    background: theme.colorBg,
    color: theme.colorText,
    display: 'grid',
    alignItems: 'center',
  },
  frame: {
    width: 'min(1120px, 100%)',
    margin: '0 auto',
    display: 'grid',
    gap: props.density === 'compact' ? 14 : 20,
  },
  hero: {
    border: `1px solid ${theme.colorBorder}`,
    borderRadius: theme.radius,
    background: theme.colorPanel,
    boxShadow: theme.shadow,
    padding: props.density === 'compact' ? 18 : 26,
    display: 'grid',
    gap: 18,
    ...responsive!.object({
      up: {
        desktop: {
          gridTemplateColumns: '1.05fr 0.95fr',
          alignItems: 'center',
        },
      },
    }),
  },
  copy: {
    display: 'grid',
    gap: 14,
  },
  eyebrow: {
    borderRadius: 999,
    background: theme.colorPanelSoft,
    color: theme.colorPrimary,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0,
    padding: '6px 10px',
    width: 'max-content',
  },
  title: {
    fontSize: props.density === 'compact' ? 34 : 46,
    lineHeight: 1.08,
    margin: 0,
  },
  text: {
    color: theme.colorMuted,
    fontSize: 16,
    lineHeight: 1.7,
    margin: 0,
    maxWidth: 620,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    border: `1px solid ${theme.colorBorder}`,
    borderRadius: theme.radius,
    background: theme.colorPanel,
    color: theme.colorText,
    cursor: 'pointer',
    fontWeight: 800,
    padding: '10px 14px',
  },
  selectedButton: {
    border: `1px solid ${theme.colorPrimary}`,
    borderRadius: theme.radius,
    background: theme.colorPrimary,
    color: theme.colorPrimaryText,
    cursor: 'pointer',
    fontWeight: 800,
    padding: '10px 14px',
  },
  panel: {
    border: `1px solid ${theme.colorBorder}`,
    borderRadius: theme.radius,
    background: theme.colorPanelSoft,
    display: 'grid',
    gap: 12,
    padding: props.density === 'compact' ? 14 : 18,
  },
  statGrid: {
    display: 'grid',
    gap: 10,
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  stat: {
    border: `1px solid ${theme.colorBorder}`,
    borderRadius: theme.radius,
    background: theme.colorPanel,
    padding: 12,
  },
  value: {
    display: 'block',
    fontSize: 24,
    fontWeight: 900,
    color: props.mode === 'growth' ? theme.colorPrimary : '#7c2d12',
  },
  label: {
    display: 'block',
    color: theme.colorMuted,
    fontSize: 13,
    marginTop: 4,
  },
}), { label: 'NuxtSSRDashboard' })

const styles = computed(() => useStyles({ density: density.value, mode: mode.value }).styles)
</script>

<template>
  <main :class="styles.shell">
    <section :class="styles.frame">
      <div :class="styles.hero">
        <div :class="styles.copy">
          <span :class="styles.eyebrow">Nuxt SSR</span>
          <h1 :class="styles.title">Request-scoped Vue styles without framework code in core.</h1>
          <p :class="styles.text">
            The Nuxt plugin creates a style engine for the current render, exposes a Vue-facing style system,
            injects collected CSS into the document head, and hydrates the existing style tag in the browser.
          </p>
          <div :class="styles.actions">
            <button
              :class="mode === 'growth' ? styles.selectedButton : styles.button"
              type="button"
              @click="mode = 'growth'"
            >
              Growth view
            </button>
            <button
              :class="mode === 'ops' ? styles.selectedButton : styles.button"
              type="button"
              @click="mode = 'ops'"
            >
              Ops view
            </button>
            <button
              :class="styles.button"
              type="button"
              @click="density = density === 'default' ? 'compact' : 'default'"
            >
              Toggle density
            </button>
          </div>
        </div>

        <div :class="styles.panel">
          <strong>SSR pipeline</strong>
          <div :class="styles.statGrid">
            <span :class="styles.stat">
              <span :class="styles.value">1</span>
              <span :class="styles.label">engine per render</span>
            </span>
            <span :class="styles.stat">
              <span :class="styles.value">0</span>
              <span :class="styles.label">Vue in core</span>
            </span>
            <span :class="styles.stat">
              <span :class="styles.value">SSR</span>
              <span :class="styles.label">head injected styles</span>
            </span>
            <span :class="styles.stat">
              <span :class="styles.value">HYD</span>
              <span :class="styles.label">client style hydration</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
