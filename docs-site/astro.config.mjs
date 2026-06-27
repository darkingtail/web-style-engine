import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import react from '@astrojs/react'
import solid from '@astrojs/solid-js'
import vue from '@astrojs/vue'

export default defineConfig({
  integrations: [
    starlight({
      title: 'web-style-engine',
      description: 'A framework-agnostic style engine for Web UI.',
      sidebar: [
        {
          label: 'Guide',
          items: [
            { label: 'Overview', slug: 'guide/overview' },
            { label: 'Architecture', slug: 'guide/architecture' },
            { label: 'Multi-framework demos', slug: 'guide/multi-framework' },
          ],
        },
        {
          label: 'API',
          items: [
            { label: 'Core', slug: 'api/core' },
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
