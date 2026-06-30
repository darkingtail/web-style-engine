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

function AntdBusinessDashboard() {
  const { token: antdToken } = antdTheme.useToken()
  const [density, setDensity] = useState<'default' | 'compact'>('default')
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
          <h3 className={styles.title}>antd-style facade over Ant Design</h3>
          <p className={styles.desc}>
            A business component uses real Ant Design components while style state and custom slots come from a friendly createStyles facade.
          </p>
          <div className={styles.actions}>
            <Segmented
              options={['default', 'compact']}
              value={density}
              onChange={value => setDensity(value as 'default' | 'compact')}
            />
            <Button type="primary">Ant Design Button</Button>
          </div>
        </div>
      </Card>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <Statistic title="Primary token" value={token.colorPrimary} />
        </div>
        <div className={styles.stat}>
          <Statistic title="Radius" suffix="px" value={token.borderRadius} />
        </div>
        <div className={styles.stat}>
          <Statistic title="Control height" suffix="px" value={token.controlHeight} />
        </div>
      </div>
    </section>
  )
}

export default function MiniAntdStyleReactExample() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <AntdBusinessDashboard />
    </ConfigProvider>
  )
}
