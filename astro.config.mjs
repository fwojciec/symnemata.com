// @ts-check
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import netlify from '@astrojs/netlify'

import { sidenotes } from './src/lib/sidenotes.ts'

// https://astro.build/config
export default defineConfig({
  site: 'https://symnemata.com',
  output: 'static',
  adapter: netlify({
    edgeMiddleware: false,
  }),
  integrations: [
    mdx({
      remarkPlugins: [],
      rehypePlugins: [sidenotes],
      gfm: true,
    }),
    sitemap({
      filter: (page) => !page.includes('/rss.xml'),
    }),
  ],
  markdown: {
    gfm: true,
    rehypePlugins: [sidenotes],
  },
})
