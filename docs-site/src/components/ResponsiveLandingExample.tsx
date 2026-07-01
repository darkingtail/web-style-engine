import {
  createDOMRenderer,
  createNoopRenderer,
  createResponsive,
  createStyleEngine,
} from 'web-style-engine'
import { type DocsLocale, isZh } from './i18n'

const responsive = createResponsive({
  breakpoints: {
    mobile: 0,
    tablet: 720,
    desktop: 1080,
    wide: 1440,
  },
})

const engine = createStyleEngine({
  key: 'landing-example',
  renderer: typeof document === 'undefined' ? createNoopRenderer() : createDOMRenderer(),
  dev: true,
})

const heroImage = 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80'

const styles = {
  shell: engine.css({
    border: '1px solid #d8e1df',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#f7faf9',
    color: '#1e2b29',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    ...responsive.object({
      up: {
        tablet: {
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)',
          minHeight: 480,
        },
        desktop: {
          gridTemplateColumns: 'minmax(0, 1fr) minmax(420px, 0.85fr)',
        },
      },
    }),
  }, { label: 'Landing-shell' }),
  content: engine.css({
    padding: `${responsive.h5.safeAreaInset('top')} 18px ${responsive.h5.safeAreaInset('bottom')}`,
    minHeight: 420,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 18,
    ...responsive.object({
      up: {
        tablet: {
          padding: '48px 42px',
        },
        desktop: {
          padding: '64px 60px',
        },
        wide: {
          padding: '80px 76px',
        },
      },
    }),
  }, { label: 'Landing-content' }),
  eyebrow: engine.css({
    color: '#047857',
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 0,
    margin: 0,
    textTransform: 'uppercase',
  }, { label: 'Landing-eyebrow' }),
  title: engine.css({
    fontSize: 34,
    lineHeight: 1.05,
    margin: 0,
    maxWidth: 680,
    ...responsive.object({
      up: {
        tablet: {
          fontSize: 44,
        },
        desktop: {
          fontSize: 56,
        },
        wide: {
          fontSize: 64,
        },
      },
    }),
  }, { label: 'Landing-title' }),
  copy: engine.css({
    color: '#4b625e',
    fontSize: 16,
    lineHeight: 1.65,
    margin: 0,
    maxWidth: 620,
    ...responsive.object({
      up: {
        desktop: {
          fontSize: 18,
        },
      },
    }),
  }, { label: 'Landing-copy' }),
  actions: engine.css({
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  }, { label: 'Landing-actions' }),
  primary: engine.css({
    border: '1px solid #065f46',
    borderRadius: 8,
    background: '#047857',
    color: '#ffffff',
    cursor: 'pointer',
    font: 'inherit',
    fontWeight: 800,
    padding: '10px 14px',
  }, { label: 'Landing-primary' }),
  secondary: engine.css({
    border: '1px solid #b7c7c3',
    borderRadius: 8,
    background: '#ffffff',
    color: '#1e2b29',
    cursor: 'pointer',
    font: 'inherit',
    fontWeight: 700,
    padding: '10px 14px',
  }, { label: 'Landing-secondary' }),
  imageWrap: engine.css({
    minHeight: 260,
    position: 'relative',
    background: '#dce7e4',
    ...responsive.object({
      below: {
        tablet: {
          minHeight: 220,
        },
      },
    }),
  }, { label: 'Landing-imageWrap' }),
  image: engine.css({
    width: '100%',
    height: '100%',
    minHeight: 260,
    objectFit: 'cover',
    display: 'block',
  }, { label: 'Landing-image' }),
  stats: engine.css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    marginTop: 6,
    ...responsive.object({
      up: {
        desktop: {
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        },
      },
    }),
  }, { label: 'Landing-stats' }),
  stat: engine.css({
    borderTop: '1px solid #d8e1df',
    paddingTop: 10,
  }, { label: 'Landing-stat' }),
  value: engine.css({
    display: 'block',
    fontSize: 22,
    fontWeight: 900,
  }, { label: 'Landing-value' }),
  label: engine.css({
    color: '#5d716d',
    display: 'block',
    fontSize: 13,
    marginTop: 2,
  }, { label: 'Landing-label' }),
}

export default function ResponsiveLandingExample(props: { locale?: DocsLocale }) {
  const zh = isZh(props.locale)
  const stats = [
    ['0', 'mobile'],
    ['720', 'tablet'],
    ['1080', 'desktop'],
    ['1440', 'wide'],
  ]

  return (
    <section className={`${styles.shell} not-content`}>
      <div className={styles.content}>
        <p className={styles.eyebrow}>{zh ? '响应式官网' : 'Responsive official site'}</p>
        <h3 className={styles.title}>{zh ? '一套样式引擎覆盖所有 Web 终端。' : 'One style engine for every Web surface.'}</h3>
        <p className={styles.copy}>
          {zh
            ? '同一套响应式基础能力可以支撑紧凑移动页、平板分栏布局、桌面 hero 区和宽屏产品叙事。'
            : 'The same responsive primitives can shape compact mobile pages, tablet split layouts, desktop hero sections, and wide-screen product storytelling.'}
        </p>
        <div className={styles.actions}>
          <button className={styles.primary} type="button">{zh ? '开始设计' : 'Start design'}</button>
          <button className={styles.secondary} type="button">{zh ? '查看布局' : 'View layout'}</button>
        </div>
        <div className={styles.stats}>
          {stats.map(([value, label]) => (
            <span className={styles.stat} key={label}>
              <strong className={styles.value}>{value}</strong>
              <span className={styles.label}>{label}</span>
            </span>
          ))}
        </div>
      </div>
      <div className={styles.imageWrap}>
        <img className={styles.image} src={heroImage} alt={zh ? '响应式工作区预览' : 'Responsive workspace preview'} />
      </div>
    </section>
  )
}
