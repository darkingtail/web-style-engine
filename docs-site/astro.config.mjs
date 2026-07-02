import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import react from '@astrojs/react'
import vue from '@astrojs/vue'

export default defineConfig({
  vite: {
    optimizeDeps: {
      include: [
        'antdv-next/dist/button/index',
        'antdv-next/dist/card/index',
        'antdv-next/dist/config-provider/index',
        'antdv-next/dist/statistic/index',
        'antdv-next/dist/theme/index',
      ],
    },
    resolve: {
      alias: {
        'dayjs/plugin/advancedFormat': 'dayjs/plugin/advancedFormat.js',
        'dayjs/plugin/customParseFormat': 'dayjs/plugin/customParseFormat.js',
        'dayjs/plugin/localeData': 'dayjs/plugin/localeData.js',
        'dayjs/plugin/weekday': 'dayjs/plugin/weekday.js',
        'dayjs/plugin/weekOfYear': 'dayjs/plugin/weekOfYear.js',
        'dayjs/plugin/weekYear': 'dayjs/plugin/weekYear.js',
      },
    },
    ssr: {
      noExternal: ['antdv-next', '@v-c/picker'],
    },
  },
  integrations: [
    starlight({
      title: 'web-style-engine',
      description: 'A framework-agnostic enterprise-grade Web style engine.',
      defaultLocale: 'en',
      locales: {
        en: {
          label: 'English',
          lang: 'en',
        },
        'zh-cn': {
          label: '简体中文',
          lang: 'zh-CN',
        },
      },
      sidebar: [
        {
          label: 'Guide',
          translations: { 'zh-CN': '指南' },
          items: [
            { label: 'Home', translations: { 'zh-CN': '首页' }, slug: '' },
            { label: 'Overview', translations: { 'zh-CN': '概览' }, slug: 'guide/overview' },
            { label: 'Architecture', translations: { 'zh-CN': '架构' }, slug: 'guide/architecture' },
            { label: 'Multi-framework demos', translations: { 'zh-CN': '多框架示例' }, slug: 'guide/multi-framework' },
            { label: 'Release and API policy', translations: { 'zh-CN': '发布与 API 策略' }, slug: 'guide/release-policy' },
          ],
        },
        {
          label: 'Examples',
          translations: { 'zh-CN': '示例' },
          items: [
            { label: 'Vue example', translations: { 'zh-CN': 'Vue 示例' }, slug: 'examples/vue' },
            { label: 'React example', translations: { 'zh-CN': 'React 示例' }, slug: 'examples/react' },
            { label: 'antdv-next style', translations: { 'zh-CN': 'antdv-next style 示例' }, slug: 'examples/antdv-style-vue' },
            { label: 'Ant Design style', translations: { 'zh-CN': 'Ant Design style 示例' }, slug: 'examples/antd-style-react' },
            { label: 'SSR framework examples', translations: { 'zh-CN': 'SSR 框架级示例' }, slug: 'examples/ssr' },
            { label: 'Responsive landing', translations: { 'zh-CN': '响应式官网示例' }, slug: 'examples/responsive-landing' },
            { label: 'Theme runtime', translations: { 'zh-CN': '主题运行时' }, slug: 'examples/theme-runtime' },
          ],
        },
        {
          label: 'API',
          translations: { 'zh-CN': 'API' },
          items: [
            { label: 'Core', translations: { 'zh-CN': '核心' }, slug: 'api/core' },
            { label: 'Responsive', translations: { 'zh-CN': '响应式' }, slug: 'api/responsive' },
            { label: 'Theme and Tokens', translations: { 'zh-CN': '主题与 Tokens' }, slug: 'api/theme' },
            { label: 'Framework Adapters', translations: { 'zh-CN': '框架适配器' }, slug: 'api/adapters' },
            { label: 'SSR and Hydration', translations: { 'zh-CN': 'SSR 与 Hydration' }, slug: 'api/ssr-hydration' },
            { label: 'Plugins and Compatibility', translations: { 'zh-CN': '插件与兼容能力' }, slug: 'api/plugins' },
            { label: 'Advanced Modes', translations: { 'zh-CN': '高级模式' }, slug: 'api/advanced-modes' },
            { label: 'Renderers', translations: { 'zh-CN': '渲染器' }, slug: 'api/renderers' },
            { label: 'createStylesCore', translations: { 'zh-CN': 'createStylesCore' }, slug: 'api/create-styles-core' },
          ],
        },
      ],
    }),
    vue(),
    react(),
  ],
})
