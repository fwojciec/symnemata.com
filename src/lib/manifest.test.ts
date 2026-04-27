import { describe, it, expect } from 'vitest'
import { formatManifest, manifestToCredits } from './manifest.ts'

describe('formatManifest', () => {
  it('passes through a single human entry', () => {
    expect(
      formatManifest([
        { role: 'Words', contributor: 'Filip Wojciechowski', isModel: false },
      ]),
    ).toEqual([
      {
        role: 'Words',
        contributor: 'Filip Wojciechowski',
        isModel: false,
        note: null,
      },
    ])
  })

  it('preserves order and normalizes optional notes to null', () => {
    const out = formatManifest([
      {
        role: 'Words',
        contributor: 'Filip',
        isModel: false,
        note: 'draft + final',
      },
      { role: 'Editing', contributor: 'GPT-5.5', isModel: true },
    ])
    expect(out).toHaveLength(2)
    expect(out[0]).toEqual({
      role: 'Words',
      contributor: 'Filip',
      isModel: false,
      note: 'draft + final',
    })
    expect(out[1].note).toBeNull()
  })

  it('trims whitespace from role / contributor / note', () => {
    const [row] = formatManifest([
      {
        role: '  Words  ',
        contributor: '  Filip  ',
        isModel: false,
        note: '  ok  ',
      },
    ])
    expect(row).toEqual({
      role: 'Words',
      contributor: 'Filip',
      isModel: false,
      note: 'ok',
    })
  })

  it('treats whitespace-only notes as null', () => {
    const [row] = formatManifest([
      { role: 'Words', contributor: 'Filip', isModel: false, note: '   ' },
    ])
    expect(row.note).toBeNull()
  })
})

describe('manifestToCredits', () => {
  it('drops notes and keeps role/contributor/isModel', () => {
    expect(
      manifestToCredits([
        {
          role: 'Words',
          contributor: 'Filip',
          isModel: false,
          note: 'irrelevant',
        },
        { role: 'Editing', contributor: 'GPT-5.5', isModel: true },
      ]),
    ).toEqual([
      { role: 'Words', contributor: 'Filip', isModel: false },
      { role: 'Editing', contributor: 'GPT-5.5', isModel: true },
    ])
  })
})
