import {
  createDOMRenderer,
  createNoopRenderer,
  createReactStyleSystem,
  createResponsive,
  createStyleEngine,
} from 'web-style-engine'

const responsive = createResponsive({
  breakpoints: {
    compact: 0,
    regular: 720,
    wide: 1080,
  },
})

const engine = createStyleEngine({
  key: 'react-demo',
  renderer: typeof document === 'undefined' ? createNoopRenderer() : createDOMRenderer(),
  dev: true,
})

const system = createReactStyleSystem({
  engine,
  theme: {
    accent: '#7c3aed',
    text: '#2d1b4f',
    surface: '#f5f3ff',
  },
  responsive,
})

const useStyles = system.createStyles(({ theme, responsive }) => ({
  root: {
    border: '1px solid rgba(124, 58, 237, 0.24)',
    borderRadius: 8,
    background: theme.surface,
    color: theme.text,
    padding: 16,
    display: 'grid',
    gap: 12,
    boxShadow: '0 10px 30px rgba(124, 58, 237, 0.08)',
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
}), { label: 'ReactDemo' })

export default function ReactDemo() {
  const { styles } = useStyles({})

  return (
    <section className={styles.root}>
      <div>
        <strong>React adapter</strong>
        <p>Uses the same engine contract through a React-facing facade.</p>
      </div>
      <span className={styles.badge}>responsive.ready</span>
    </section>
  )
}
