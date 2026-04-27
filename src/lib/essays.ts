/**
 * Essay-level pure helpers. All take plain data and return plain data.
 * No file I/O; no Astro globals.
 */

/** Format an essay number as the design's "№ 003" stamp. Pads to 3 digits. */
export function formatNumber(n: number): string {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`formatNumber expects a non-negative integer, got ${n}`)
  }
  return `№ ${n.toString().padStart(3, '0')}`
}

/** Sort essays newest-first. Stable for equal dates by descending number. */
export function sortByDateDesc<T extends { date: Date; number: number }>(
  essays: T[],
): T[] {
  return [...essays].sort((a, b) => {
    const d = b.date.getTime() - a.date.getTime()
    if (d !== 0) return d
    return b.number - a.number
  })
}

/** Filter out drafts. */
export function published<T extends { draft?: boolean }>(essays: T[]): T[] {
  return essays.filter((e) => !e.draft)
}

/**
 * Estimate word count from raw MDX/markdown body. Strips fenced code, HTML/JSX
 * tags, frontmatter delimiters, and footnote definitions, then counts whitespace-
 * separated tokens. Approximation, not authoritative.
 */
export function estimateWordCount(body: string): number {
  const stripped = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[\^[^\]]+\]:[\s\S]*?(?:\n\n|$)/g, ' ')
    .replace(/[#>*_\-`~[\](){}|=]/g, ' ')
  const tokens = stripped.trim().split(/\s+/).filter(Boolean)
  return tokens.length
}
