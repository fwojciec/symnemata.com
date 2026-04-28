import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'
import sanitizeHtml from 'sanitize-html'
import MarkdownIt from 'markdown-it'
import footnotePlugin from 'markdown-it-footnote'

import { sortByDateDesc, published } from '../lib/essays.ts'
import { stripMdxComponents } from '../lib/rss.ts'

const parser = new MarkdownIt({ html: true, typographer: true }).use(
  footnotePlugin,
)

export async function GET(context: APIContext) {
  const all = await getCollection('essays')
  const entries = sortByDateDesc(
    published(all.map((e) => ({ entry: e, ...e.data }))),
  )

  return rss({
    title: 'symnēmata — co-rememberings',
    description:
      'Long-form essays written between a person and several models. The texts are the authority. The models are named.',
    site: context.site!,
    items: entries.map(({ entry }) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.dek,
      link: `/${entry.id}`,
      content: sanitizeHtml(parser.render(stripMdxComponents(entry.body ?? '')), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      }),
    })),
  })
}
