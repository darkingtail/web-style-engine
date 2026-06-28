import { useMemo, useState } from 'react'
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
    regular: 760,
    wide: 1120,
  },
})

const engine = createStyleEngine({
  key: 'react-example',
  renderer: typeof document === 'undefined' ? createNoopRenderer() : createDOMRenderer(),
  dev: true,
})

const system = createReactStyleSystem({
  engine,
  theme: {
    accent: '#7c3aed',
    accentStrong: '#5b21b6',
    border: 'rgba(124, 58, 237, 0.24)',
    muted: '#5b4b76',
    surface: '#f5f3ff',
    panel: '#ffffff',
    text: '#2d1b4f',
  },
  responsive,
})

const useStyles = system.createStyles(({ theme, responsive }, props: { compact: boolean; selected: 'ops' | 'design' }) => ({
  shell: {
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    background: theme.surface,
    color: theme.text,
    padding: props.compact ? 14 : 20,
    display: 'grid',
    gap: props.compact ? 12 : 16,
    boxShadow: '0 18px 42px rgba(124, 58, 237, 0.14)',
    ...responsive!.object({
      up: {
        regular: {
          gridTemplateColumns: '0.9fr 1.1fr',
          alignItems: 'stretch',
        },
      },
    }),
  },
  panel: {
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    background: theme.panel,
    padding: props.compact ? 12 : 16,
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
  selectedButton: {
    border: `1px solid ${theme.accentStrong}`,
    borderRadius: 8,
    background: theme.accent,
    color: 'white',
    cursor: 'pointer',
    font: 'inherit',
    padding: '8px 12px',
  },
  list: {
    display: 'grid',
    gap: 10,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  item: {
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    background: theme.panel,
    padding: 12,
  },
  itemTitle: {
    display: 'block',
    fontWeight: 800,
  },
  itemMeta: {
    color: theme.muted,
    display: 'block',
    fontSize: 13,
    marginTop: 4,
  },
}), { label: 'ReactFullExample' })

export default function ReactFullExample() {
  const [compact, setCompact] = useState(false)
  const [selected, setSelected] = useState<'ops' | 'design'>('ops')
  const { styles } = useMemo(() => useStyles({ compact, selected }), [compact, selected])

  return (
    <section className={styles.shell}>
      <div className={styles.panel}>
        <h3 className={styles.title}>React workflow card</h3>
        <p className={styles.muted}>
          A React component using the same style engine primitives, with local state shaping generated classes.
        </p>
        <div className={styles.actions}>
          <button
            className={selected === 'ops' ? styles.selectedButton : styles.button}
            type="button"
            onClick={() => setSelected('ops')}
          >
            Ops view
          </button>
          <button
            className={selected === 'design' ? styles.selectedButton : styles.button}
            type="button"
            onClick={() => setSelected('design')}
          >
            Design view
          </button>
          <button className={styles.button} type="button" onClick={() => setCompact(value => !value)}>
            Toggle density
          </button>
        </div>
      </div>

      <ul className={styles.list}>
        {(selected === 'ops'
          ? [
            ['SSR extraction', 'Renderer output can be collected for server HTML.'],
            ['Responsive observer', 'matchMedia can be injected or avoided for SSR.'],
            ['Package boundary', 'React stays outside the style engine core.'],
          ]
          : [
            ['Theme token', 'The adapter passes typed theme values into factories.'],
            ['Slot styles', 'Each style slot gets a stable class name.'],
            ['Responsive object', 'Media blocks come from one shared helper.'],
          ]).map(([title, meta]) => (
            <li className={styles.item} key={title}>
              <span className={styles.itemTitle}>{title}</span>
              <span className={styles.itemMeta}>{meta}</span>
            </li>
        ))}
      </ul>
    </section>
  )
}
