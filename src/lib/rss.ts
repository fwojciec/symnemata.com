/**
 * RSS-feed helpers. Pure string transforms; no Astro globals.
 */

/**
 * Strip MDX custom-component tags (capitalized JSX elements) so a markdown
 * parser doesn't treat them as opaque HTML blocks. Self-closing forms are
 * removed entirely; paired forms have their opening and closing tags removed
 * but their inner content preserved. Lowercase HTML tags (em, sup, a, …) are
 * left intact.
 */
export function stripMdxComponents(body: string): string {
  return body
    .replace(/<[A-Z][A-Za-z0-9]*\b[^>]*\/>/g, '')
    .replace(/<\/?[A-Z][A-Za-z0-9]*\b[^>]*>/g, '')
}
