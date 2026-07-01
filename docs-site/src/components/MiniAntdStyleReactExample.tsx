import 'antd/dist/reset.css'

import { useMemo, useState } from 'react'
import { Button, Card, ConfigProvider, Segmented, Statistic, theme as antdTheme } from 'antd'
import type { GlobalToken } from 'antd/es/theme'
import {
  createDOMRenderer,
  createNoopRenderer,
  createReactStyleSystem,
  createResponsive,
  createStyleEngine,
} from 'web-style-engine'
import { type DocsLocale, isZh } from './i18n'

type AntdBusinessTheme = GlobalToken & {
  appRadius: number
  brandSurface: string
}

const responsive = createResponsive({
  breakpoints: {
    compact: 0,
    tablet: 720,
    desktop: 1080,
  },
})

function createMiniAntdStyle(options: { token: GlobalToken }) {
  const engine = createStyleEngine({
    key: 'mini-antd-style',
    renderer: typeof document === 'undefined' ? createNoopRenderer() : createDOMRenderer(),
    dev: true,
  })
  const theme: AntdBusinessTheme = {
    ...options.token,
    appRadius: options.token.borderRadius + 2,
    brandSurface: '#eef5ff',
  }

  engine.vars('.mini-antd-style', theme as unknown as Record<string, unknown>, {
    prefix: 'ant',
    metadata: { example: 'mini-antd-style', library: 'antd' },
  })

  const system = createReactStyleSystem({
    engine,
    theme,
    responsive,
  })

  return {
    createStyles: system.createUseStyles,
    useToken: system.useTheme,
    css: engine.css,
    cx: engine.cx,
  }
}

function AntdBusinessDashboard(props: { locale?: DocsLocale }) {
  const { token: antdToken } = antdTheme.useToken()
  const [density, setDensity] = useState<'default' | 'compact'>('default')
  const zh = isZh(props.locale)
  const miniAntdStyle = useMemo(() => createMiniAntdStyle({ token: antdToken }), [antdToken])
  const useBusinessStyles = useMemo(() => miniAntdStyle.createStyles(({ theme, responsive }, props: { density: 'default' | 'compact' }) => ({
    shell: {
      display: 'grid',
      gap: props.density === 'compact' ? 12 : 16,
      border: `1px solid ${theme.colorBorder}`,
      borderRadius: theme.appRadius,
      background: theme.colorBgLayout,
      color: theme.colorText,
      padding: props.density === 'compact' ? 14 : 20,
      ...responsive!.object({
        up: {
          tablet: {
            gridTemplateColumns: '1fr 1fr',
          },
        },
      }),
    },
    header: {
      display: 'grid',
      gap: 12,
    },
    title: {
      margin: 0,
      fontSize: 20,
      lineHeight: 1.2,
    },
    desc: {
      color: theme.colorTextSecondary,
      lineHeight: 1.6,
      margin: 0,
    },
    actions: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
    },
    stats: {
      display: 'grid',
      gap: 10,
    },
    stat: {
      border: `1px solid ${theme.colorBorder}`,
      borderRadius: theme.borderRadius,
      background: theme.brandSurface,
      padding: 12,
    },
  }), { label: 'AntdBusinessDashboard' }), [miniAntdStyle])
  const { styles } = useBusinessStyles({ density })
  const token = miniAntdStyle.useToken()

  return (
    <section className={`${styles.shell} mini-antd-style`}>
      <Card>
        <div className={styles.header}>
          <h3 className={styles.title}>{zh ? '基于 Ant Design 的 antd-style facade' : 'antd-style facade over Ant Design'}</h3>
          <p className={styles.desc}>
            {zh
              ? '业务组件使用真实 Ant Design 组件，同时通过友好的 createStyles facade 管理样式状态和自定义区域。'
              : 'A business component uses real Ant Design components while style state and custom slots come from a friendly createStyles facade.'}
          </p>
          <div className={styles.actions}>
            <Segmented
              options={[
                { label: zh ? '默认' : 'default', value: 'default' },
                { label: zh ? '紧凑' : 'compact', value: 'compact' },
              ]}
              value={density}
              onChange={value => setDensity(value as 'default' | 'compact')}
            />
            <Button type="primary">{zh ? 'Ant Design 按钮' : 'Ant Design Button'}</Button>
          </div>
        </div>
      </Card>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <Statistic title={zh ? '主色 token' : 'Primary token'} value={token.colorPrimary} />
        </div>
        <div className={styles.stat}>
          <Statistic title={zh ? '圆角' : 'Radius'} suffix="px" value={token.borderRadius} />
        </div>
        <div className={styles.stat}>
          <Statistic title={zh ? '控件高度' : 'Control height'} suffix="px" value={token.controlHeight} />
        </div>
      </div>
    </section>
  )
}

export default function MiniAntdStyleReactExample(props: { locale?: DocsLocale }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <AntdBusinessDashboard locale={props.locale} />
    </ConfigProvider>
  )
}
