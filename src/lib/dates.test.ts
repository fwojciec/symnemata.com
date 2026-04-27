import { describe, it, expect } from 'vitest'
import { formatStampDate, formatLongDate, formatISODate } from './dates.ts'

describe('formatStampDate', () => {
  it('formats month + year', () => {
    expect(formatStampDate(new Date('2026-04-15T00:00:00Z'))).toBe('Apr 2026')
    expect(formatStampDate(new Date('2025-12-01T00:00:00Z'))).toBe('Dec 2025')
  })
})

describe('formatLongDate', () => {
  it('formats full month name + year', () => {
    expect(formatLongDate(new Date('2026-04-15T00:00:00Z'))).toBe('April 2026')
  })
})

describe('formatISODate', () => {
  it('formats YYYY-MM-DD', () => {
    expect(formatISODate(new Date('2026-04-26T22:34:56Z'))).toBe('2026-04-26')
  })
})
