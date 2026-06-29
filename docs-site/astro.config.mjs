import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import react from '@astrojs/react'
import solid from '@astrojs/solid-js'
import vue from '@astrojs/vue'

export default defineConfig({
  integrations: [
    starlight({
      title: 'web-style-engine',
      description: 'A framework-agnostic enterprise-grade Web style engine.',
      sidebar: [
        {
          label: 'Guide',
          items: [
            { label: 'Home', slug: '' },
            { label: 'Overview', slug: 'guide/overview' },
            { label: 'Architecture', slug: 'guide/architecture' },
            { label: 'Multi-framework demos', slug: 'guide/multi-framework' },
          ],
        },
        {
          label: 'Examples',
          items: [
            { label: 'Vue example', slug: 'examples/vue' },
            { label: 'React example', slug: 'examples/react' },
            { label: 'Responsive landing', slug: 'examples/responsive-landing' },
            { label: 'Theme runtime', slug: 'examples/theme-runtime' },
          ],
        },
        {
          label: 'API',
          items: [
            { label: 'Core', slug: 'api/core' },
            { label: 'Responsive', slug: 'api/responsive' },
            { label: 'Theme and Tokens', slug: 'api/theme' },
            { label: 'Framework Adapters', slug: 'api/adapters' },
            { label: 'Renderers', slug: 'api/renderers' },
            { label: 'createStylesCore', slug: 'api/create-styles-core' },
          ],
        },
        {
          label: 'Migration',
          items: [{ label: 'antdv-style', slug: 'migration/antdv-style' }],
        },
      ],
    }),
    vue(),
    react(),
    solid(),
  ],
})
