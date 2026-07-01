import { useMemo, useState } from 'react'
import {
  createDOMRenderer,
  createNoopRenderer,
  createReactStyleSystem,
  createResponsive,
  createStyleEngine,
} from 'web-style-engine'
import { type DocsLocale, isZh } from './i18n'

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

const useStyles = system.createUseStyles(({ theme, responsive }, props: { compact: boolean; selected: 'ops' | 'design' }) => ({
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

export default function ReactFullExample(props: { locale?: DocsLocale }) {
  const [compact, setCompact] = useState(false)
  const [selected, setSelected] = useState<'ops' | 'design'>('ops')
  const { styles } = useMemo(() => useStyles({ compact, selected }), [compact, selected])
  const zh = isZh(props.locale)
  const items = selected === 'ops'
    ? zh
      ? [
        ['SSR 提取', 'Renderer 输出可以收集到服务端 HTML。'],
        ['响应式观察器', 'matchMedia 可以注入，也可以在 SSR 中避开。'],
        ['包边界', 'React 保持在样式引擎核心之外。'],
      ]
      : [
        ['SSR extraction', 'Renderer output can be collected for server HTML.'],
        ['Responsive observer', 'matchMedia can be injected or avoided for SSR.'],
        ['Package boundary', 'React stays outside the style engine core.'],
      ]
    : zh
      ? [
        ['主题 token', '适配器将类型化主题值传入样式工厂。'],
        ['Slot 样式', '每个样式 slot 都获得稳定类名。'],
        ['响应式对象', '媒体块来自同一个共享 helper。'],
      ]
      : [
        ['Theme token', 'The adapter passes typed theme values into factories.'],
        ['Slot styles', 'Each style slot gets a stable class name.'],
        ['Responsive object', 'Media blocks come from one shared helper.'],
      ]

  return (
    <section className={styles.shell}>
      <div className={styles.panel}>
        <h3 className={styles.title}>{zh ? 'React 工作流卡片' : 'React workflow card'}</h3>
        <p className={styles.muted}>
          {zh
            ? 'React 组件使用同一套样式引擎基础能力，并通过本地状态影响生成类名。'
            : 'A React component using the same style engine primitives, with local state shaping generated classes.'}
        </p>
        <div className={styles.actions}>
          <button
            className={selected === 'ops' ? styles.selectedButton : styles.button}
            type="button"
            onClick={() => setSelected('ops')}
          >
            {zh ? '运维视图' : 'Ops view'}
          </button>
          <button
            className={selected === 'design' ? styles.selectedButton : styles.button}
            type="button"
            onClick={() => setSelected('design')}
          >
            {zh ? '设计视图' : 'Design view'}
          </button>
          <button className={styles.button} type="button" onClick={() => setCompact(value => !value)}>
            {zh ? '切换密度' : 'Toggle density'}
          </button>
        </div>
      </div>

      <ul className={styles.list}>
        {items.map(([title, meta]) => (
          <li className={styles.item} key={title}>
            <span className={styles.itemTitle}>{title}</span>
            <span className={styles.itemMeta}>{meta}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
