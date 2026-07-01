import { useEffect, useState } from 'react'
import {
  createDOMRenderer,
  createNoopRenderer,
  createReactStyleSystem,
  createResponsive,
  createResponsiveObserver,
  createStyleEngine,
} from 'web-style-engine'
import { type DocsLocale, isZh } from './i18n'

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

const useStyles = system.createUseStyles(({ theme, responsive }) => ({
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
  note: {
    color: '#5b4b76',
    fontSize: 13,
    margin: '6px 0 0',
  },
}), { label: 'ReactDemo' })

export default function ReactDemo(props: { locale?: DocsLocale }) {
  const { styles } = useStyles({})
  const zh = isZh(props.locale)
  const [snapshot, setSnapshot] = useState(() => observer.getSnapshot())

  useEffect(() => observer.subscribe(() => {
    setSnapshot(observer.getSnapshot())
  }), [])

  return (
    <section className={styles.root}>
      <div>
        <strong>{zh ? 'React 适配器' : 'React adapter'}</strong>
        <p>{zh ? '通过面向 React 的 facade 使用同一套 engine 协议。' : 'Uses the same engine contract through a React-facing facade.'}</p>
        <p className={styles.note}>
          {zh ? '缩放窗口时，右侧断点会随 matchMedia 变化。' : 'Resize the viewport; the breakpoint badge follows matchMedia.'}
        </p>
      </div>
      <span className={styles.badge}>
        {zh ? `当前断点: ${snapshot.current ?? 'unknown'}` : `breakpoint: ${snapshot.current ?? 'unknown'}`}
      </span>
    </section>
  )
}
