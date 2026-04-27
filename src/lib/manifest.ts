import type { ManifestEntry } from '../content.config.ts'

export type RenderableManifestRow = {
  role: string
  contributor: string
  isModel: boolean
  note: string | null
}

/**
 * Format a manifest array into rows ready for rendering. Pure: no I/O.
 * Trims whitespace, normalizes optional `note` to `null`, preserves order.
 */
export function formatManifest(
  entries: ManifestEntry[],
): RenderableManifestRow[] {
  return entries.map((e) => ({
    role: e.role.trim(),
    contributor: e.contributor.trim(),
    isModel: e.isModel,
    note: e.note?.trim() || null,
  }))
}

/**
 * Compact credit pairs for index cards. Drops notes; keeps role + contributor +
 * isModel flag (used to apply the model styling on the index).
 */
export type IndexCredit = {
  role: string
  contributor: string
  isModel: boolean
}

export function manifestToCredits(entries: ManifestEntry[]): IndexCredit[] {
  return entries.map((e) => ({
    role: e.role.trim(),
    contributor: e.contributor.trim(),
    isModel: e.isModel,
  }))
}
