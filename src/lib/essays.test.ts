import { describe, it, expect } from 'vitest'
import {
  formatNumber,
  sortByDateDesc,
  published,
  estimateWordCount,
} from './essays.ts'

describe('formatNumber', () => {
  it('pads with leading zeros to width 3', () => {
    expect(formatNumber(0)).toBe('№ 000')
    expect(formatNumber(3)).toBe('№ 003')
    expect(formatNumber(42)).toBe('№ 042')
  })

  it('does not truncate 4+ digit numbers', () => {
    expect(formatNumber(1024)).toBe('№ 1024')
  })

  it('throws on non-integer or negative input', () => {
    expect(() => formatNumber(-1)).toThrow()
    expect(() => formatNumber(1.5)).toThrow()
  })
})

describe('sortByDateDesc', () => {
  it('sorts newest-first by date', () => {
    const out = sortByDateDesc([
      { date: new Date('2024-01-01'), number: 1 },
      { date: new Date('2026-04-01'), number: 3 },
      { date: new Date('2025-06-01'), number: 2 },
    ])
    expect(out.map((e) => e.number)).toEqual([3, 2, 1])
  })

  it('breaks ties by descending number', () => {
    const out = sortByDateDesc([
      { date: new Date('2026-04-01'), number: 4 },
      { date: new Date('2026-04-01'), number: 7 },
    ])
    expect(out.map((e) => e.number)).toEqual([7, 4])
  })

  it('does not mutate the input', () => {
    const input = [
      { date: new Date('2024-01-01'), number: 1 },
      { date: new Date('2026-04-01'), number: 3 },
    ]
    const snapshot = [...input]
    sortByDateDesc(input)
    expect(input).toEqual(snapshot)
  })
})

describe('published', () => {
  it('filters out drafts', () => {
    expect(
      published([
        { number: 1, draft: true },
        { number: 2, draft: false },
        { number: 3 },
      ]).map((e) => e.number),
    ).toEqual([2, 3])
  })
})

describe('estimateWordCount', () => {
  it('counts plain prose tokens', () => {
    expect(estimateWordCount('Hello world, this is a test.')).toBe(6)
  })

  it('strips fenced code blocks', () => {
    expect(
      estimateWordCount('hello\n```js\nlots of code here ignored\n```\nworld'),
    ).toBe(2)
  })

  it('strips HTML / JSX tags', () => {
    expect(estimateWordCount('hello <Greek>Λόγος</Greek> world')).toBe(3)
  })

  it('strips footnote definitions', () => {
    expect(
      estimateWordCount(
        'Body text here.\n\n[^1]: This footnote is hidden.\n\n',
      ),
    ).toBe(3)
  })

  it('returns zero for empty body', () => {
    expect(estimateWordCount('')).toBe(0)
  })
})
