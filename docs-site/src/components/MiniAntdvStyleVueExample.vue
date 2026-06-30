<script setup lang="ts">
import 'antdv-next/dist/reset.css'

import { computed, ref } from 'vue'
import Button from 'antdv-next/dist/button/index'
import Card from 'antdv-next/dist/card/index'
import ConfigProvider from 'antdv-next/dist/config-provider/index'
import Statistic from 'antdv-next/dist/statistic/index'
import antdvTheme from 'antdv-next/dist/theme/index'
import type { GlobalToken } from 'antdv-next/dist/theme/index'
import {
  createDOMRenderer,
  createNoopRenderer,
  createResponsive,
  createStyleEngine,
  createVueStyleSystem,
} from 'web-style-engine'

type AntdvBusinessTheme = GlobalToken & {
  prefixCls: string
  cssVarPrefix: string
  brandSurface: string
  shadow: string
}

const dense = ref(false)
const active = ref<'orders' | 'members'>('orders')
const seedToken = {
  colorPrimary: '#089784',
  borderRadius: 8,
}

const responsive = createResponsive({
  breakpoints: {
    compact: 0,
    tablet: 720,
    desktop: 1080,
  },
})

function createMiniAntdvStyle(options: { token: GlobalToken; prefixCls?: string }) {
  const engine = createStyleEngine({
    key: 'mini-antdv-style',
    renderer: typeof document === 'undefined' ? createNoopRenderer() : createDOMRenderer(),
    dev: true,
  })
  const prefixCls = options.prefixCls ?? 'ant'
  const theme: AntdvBusinessTheme = {
    ...options.token,
    prefixCls,
    cssVarPrefix: prefixCls,
    brandSurface: '#eefcf9',
    shadow: '0 18px 44px rgba(8, 151, 132, 0.14)',
  }

  engine.vars('.mini-antdv-style', theme, {
    prefix: prefixCls,
    metadata: { example: 'mini-antdv-style', library: 'antdv-next' },
  })

  const system = createVueStyleSystem({
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

const miniAntdvStyle = createMiniAntdvStyle({
  prefixCls: 'ant',
  token: antdvTheme.getDesignToken({ token: seedToken }),
})

const useBusinessStyles = miniAntdvStyle.createStyles(({ theme, responsive }, props: { dense: boolean }) => ({
  shell: {
    display: 'grid',
    gap: props.dense ? 12 : 16,
    border: `1px solid ${theme.colorBorder}`,
    borderRadius: theme.borderRadius + 2,
    background: theme.colorBgLayout,
    color: theme.colorText,
    padding: props.dense ? 14 : 20,
    ...responsive!.object({
      up: {
        tablet: {
          gridTemplateColumns: '0.95fr 1.05fr',
        },
      },
    }),
  },
  panel: {
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
  list: {
    display: 'grid',
    gap: 10,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  item: {
    border: `1px solid ${theme.colorBorder}`,
    borderRadius: theme.borderRadius,
    background: theme.brandSurface,
    padding: 12,
  },
  itemTitle: {
    display: 'block',
    fontWeight: 800,
  },
  itemMeta: {
    color: theme.colorTextSecondary,
    display: 'block',
    fontSize: 13,
    marginTop: 4,
  },
}), { label: 'AntdvBusinessConsole' })

const result = computed(() => useBusinessStyles({ dense: dense.value }))
const token = miniAntdvStyle.useToken()

const records = computed(() => active.value === 'orders'
  ? [
    ['Order approval', `prefixCls: ${token.prefixCls}`],
    ['Payment reminder', `CSS var prefix: ${token.cssVarPrefix}`],
    ['Delivery exception', `controlHeight: ${token.controlHeight}px`],
  ]
  : [
    ['Member profile', `primary: ${token.colorPrimary}`],
    ['Growth segment', `radius: ${token.borderRadius}px`],
    ['Custom component', 'business component styles stay local'],
  ])
</script>

<template>
  <ConfigProvider :theme="{ token: seedToken }">
    <section :class="[result.styles.shell, 'mini-antdv-style']">
      <Card>
        <div :class="result.styles.panel">
          <h3 :class="result.styles.title">antdv-style facade over antdv-next</h3>
          <p :class="result.styles.desc">
            A Vue3 business component uses real antdv-next components while custom slots come from a friendly createStyles facade.
          </p>
          <div :class="result.styles.actions">
            <Button :type="active === 'orders' ? 'primary' : 'default'" @click="active = 'orders'">
              Orders
            </Button>
            <Button :type="active === 'members' ? 'primary' : 'default'" @click="active = 'members'">
              Members
            </Button>
            <Button @click="dense = !dense">
              Toggle density
            </Button>
          </div>
        </div>
      </Card>

      <ul :class="result.styles.list">
        <li v-for="[title, meta] in records" :key="title" :class="result.styles.item">
          <span :class="result.styles.itemTitle">{{ title }}</span>
          <span :class="result.styles.itemMeta">{{ meta }}</span>
        </li>
        <li :class="result.styles.item">
          <Statistic title="Primary token" :value="token.colorPrimary" />
        </li>
      </ul>
    </section>
  </ConfigProvider>
</template>
