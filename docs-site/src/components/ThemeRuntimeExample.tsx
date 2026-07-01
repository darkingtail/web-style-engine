import {
  createDOMRenderer,
  createNoopRenderer,
  createStyleEngine,
  createThemeRuntime,
} from 'web-style-engine'
import { type DocsLocale, isZh } from './i18n'

const engine = createStyleEngine({
  key: 'theme-example',
  renderer: typeof document === 'undefined' ? createNoopRenderer() : createDOMRenderer(),
  dev: true,
})

const themeRuntime = createThemeRuntime({
  engine,
  prefix: 'theme-example',
  fallback: true,
})

const light = themeRuntime.registerTheme('light', {
  color: {
    background: '#f8fafc',
    panel: '#ffffff',
    text: '#10201c',
    muted: '#587169',
    primary: '#0f766e',
    primaryText: '#ffffff',
    border: '#c8d8d4',
    link: '{color.primary}',
  },
  radius: 8,
}, {
  scope: ':root',
  derivatives: [
    current => ({
      color: {
        primarySoft: `${(current.color as { primary: string }).primary}1a`,
      },
    }),
  ],
})

themeRuntime.registerTheme('dark', {
  color: {
    background: '#111827',
    panel: '#1f2937',
    text: '#f8fafc',
    muted: '#cbd5e1',
    primary: '#38bdf8',
    primaryText: '#082f49',
    border: '#334155',
    link: '{color.primary}',
  },
  radius: 8,
}, {
  derivatives: [
    current => ({
      color: {
        primarySoft: `${(current.color as { primary: string }).primary}24`,
      },
    }),
  ],
})

const styles = {
  grid: engine.css({
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  }, { label: 'ThemeExample-grid' }),
  card: engine.css({
    border: `1px solid ${light.vars['color-border']}`,
    borderRadius: light.vars.radius,
    background: light.vars['color-panel'],
    color: light.vars['color-text'],
    padding: 18,
    display: 'grid',
    gap: 12,
    boxShadow: `0 18px 40px ${light.vars['color-primary-soft']}`,
  }, { label: 'ThemeExample-card' }),
  title: engine.css({
    margin: 0,
    fontSize: 20,
    lineHeight: 1.2,
  }, { label: 'ThemeExample-title' }),
  copy: engine.css({
    color: light.vars['color-muted'],
    lineHeight: 1.6,
    margin: 0,
  }, { label: 'ThemeExample-copy' }),
  button: engine.css({
    border: 0,
    borderRadius: light.vars.radius,
    background: light.vars['color-primary'],
    color: light.vars['color-primary-text'],
    cursor: 'pointer',
    font: 'inherit',
    fontWeight: 800,
    padding: '10px 12px',
    width: 'fit-content',
  }, { label: 'ThemeExample-button' }),
}

export default function ThemeRuntimeExample(props: { locale?: DocsLocale }) {
  const zh = isZh(props.locale)

  return (
    <div className={styles.grid}>
      <section className={styles.card}>
        <h3 className={styles.title}>{zh ? '亮色主题' : 'Light theme'}</h3>
        <p className={styles.copy}>
          {zh ? '默认作用域将变量写入 :root，并暴露带 fallback 的 var 引用。' : 'The default scope writes variables to :root and exposes fallback var references.'}
        </p>
        <button className={styles.button} type="button">{zh ? '主要操作' : 'Primary action'}</button>
      </section>
      <section className={styles.card} data-theme="dark">
        <h3 className={styles.title}>{zh ? '暗色主题' : 'Dark theme'}</h3>
        <p className={styles.copy}>
          {zh ? '暗色作用域在页面局部区域覆盖同一组变量。' : 'The dark scope overrides the same variables inside one page region.'}
        </p>
        <button className={styles.button} type="button">{zh ? '主要操作' : 'Primary action'}</button>
      </section>
    </div>
  )
}
