'use client'

import { useMemo, useState } from 'react'
import { useNextStyleSystem } from './style-registry'

export function BusinessDashboard() {
  const system = useNextStyleSystem()
  const [density, setDensity] = useState<'default' | 'compact'>('default')
  const [mode, setMode] = useState<'growth' | 'ops'>('growth')

  const useStyles = useMemo(() => system.createUseStyles(({ theme, responsive }, props: { density: 'default' | 'compact'; mode: 'growth' | 'ops' }) => ({
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
  }), { label: 'NextSSRDashboard' }), [system])

  const { styles } = useStyles({ density, mode })

  return (
    <main className={styles.shell}>
      <section className={styles.frame}>
        <div className={styles.hero}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}>Next.js App Router SSR</span>
            <h1 className={styles.title}>Request-scoped styles without framework code in core.</h1>
            <p className={styles.text}>
              The Next.js registry creates a style engine per request, inserts collected CSS with useServerInsertedHTML,
              and hydrates the existing style tag before client-side updates.
            </p>
            <div className={styles.actions}>
              <button
                className={mode === 'growth' ? styles.selectedButton : styles.button}
                type="button"
                onClick={() => setMode('growth')}
              >
                Growth view
              </button>
              <button
                className={mode === 'ops' ? styles.selectedButton : styles.button}
                type="button"
                onClick={() => setMode('ops')}
              >
                Ops view
              </button>
              <button className={styles.button} type="button" onClick={() => setDensity(value => value === 'default' ? 'compact' : 'default')}>
                Toggle density
              </button>
            </div>
          </div>

          <div className={styles.panel}>
            <strong>SSR pipeline</strong>
            <div className={styles.statGrid}>
              <span className={styles.stat}>
                <span className={styles.value}>1</span>
                <span className={styles.label}>engine per request</span>
              </span>
              <span className={styles.stat}>
                <span className={styles.value}>0</span>
                <span className={styles.label}>React in core</span>
              </span>
              <span className={styles.stat}>
                <span className={styles.value}>SSR</span>
                <span className={styles.label}>server inserted styles</span>
              </span>
              <span className={styles.stat}>
                <span className={styles.value}>HYD</span>
                <span className={styles.label}>client style hydration</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
