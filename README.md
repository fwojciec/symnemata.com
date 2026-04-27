# symnemata

A typography-first archive of essays composed between a person and one or more models, with the contributions of each named in plain view.

## Stack

- Astro 6 + MDX + TypeScript
- Vitest for unit tests
- ESLint flat config + Prettier
- Deploys to Netlify

## Development

```sh
npm run dev          # start dev server
npm run build        # production build
npm run preview      # preview the build locally
npm run typecheck    # astro check (type-checks .astro + .ts)
npm run test         # vitest watch mode
npm run test:run     # vitest one-shot
npm run lint         # eslint
npm run format       # prettier write
npm run format:check # prettier verify
```

## Architecture

**Functional core, imperative shell.** Pure transforms live in `src/lib/` and are unit-tested without mocks. The `.astro` pages are thin orchestration: load a content collection, hand it to a layout, render. The two interactive bits (scroll progress bar, focus-mode toggle) are vanilla JS in `src/scripts/`.

```
src/
├── content/          # MDX essays + Zod-validated frontmatter schema
├── lib/              # pure functions — manifest, essays, dates, sidenote rehype plugin
├── components/       # Astro components — Manifest, Pullquote, Greek, Translit, …
├── layouts/          # BaseLayout, EssayLayout
├── pages/            # index, about, [slug]
├── scripts/          # reading-flow.ts (progress + focus mode)
└── styles/           # tokens, base, chrome, essay, index-about
```

## Authoring an essay

Drop a `.mdx` file in `src/content/essays/`. Frontmatter is validated against the Zod schema in `src/content.config.ts`.

**Inline elements:**

- Footnote: `text[^1]` then on its own line `[^1]: note content` (standard markdown — the sidenotes rehype plugin relocates these into Tufte-style margin asides)
- Greek: `<Greek>Ἀπομνημονεύματα</Greek>`
- Transliteration: `<Translit>apomnēmoneumata</Translit>`
- Phrase highlight: `<Highlight>important phrase</Highlight>`

**Block elements:**

- Pullquote: `<Pullquote>Lifted phrase</Pullquote>`
- Section break: `<Break />` (or `<Break marks={1} />` for a single ✦)
- Block quote: `<Passage>…</Passage>`, or `<Passage spanSide>…</Passage>` to extend into the sidenote column

`src/content/**/*.mdx` is excluded from Prettier so prose isn't reflowed.
