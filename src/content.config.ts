import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'zod'

const manifestEntry = z.object({
  role: z.string().min(1),
  contributor: z.string().min(1),
  isModel: z.boolean(),
  note: z.string().optional(),
})

const essays = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/essays' }),
  schema: z.object({
    title: z.string().min(1),
    greekTitle: z.string().optional(),
    dek: z.string().min(1),
    date: z.coerce.date(),
    number: z.number().int().nonnegative(),
    kicker: z.string().default('Essay'),
    manifest: z.array(manifestEntry).min(1),
    dropcap: z.boolean().default(true),
    draft: z.boolean().default(false),
  }),
})

export const collections = { essays }

export type ManifestEntry = z.infer<typeof manifestEntry>
