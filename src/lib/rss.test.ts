import { describe, it, expect } from 'vitest'
import { stripMdxComponents } from './rss.ts'

describe('stripMdxComponents', () => {
  it('removes paired capitalized tags but preserves their content', () => {
    expect(stripMdxComponents('<Pullquote>kept</Pullquote>')).toBe('kept')
  })

  it('removes self-closing capitalized tags entirely', () => {
    expect(stripMdxComponents('a<Break />b')).toBe('ab')
  })

  it('removes capitalized tags with attributes', () => {
    expect(stripMdxComponents('<Passage spanSide>x</Passage>')).toBe('x')
    expect(
      stripMdxComponents('<Greek lang="el" data-x={value}>Λόγος</Greek>'),
    ).toBe('Λόγος')
  })

  it('leaves lowercase HTML tags intact', () => {
    const input = '<p>hi <em>there</em> <a href="/x">link</a></p>'
    expect(stripMdxComponents(input)).toBe(input)
  })

  it('does not strip lowercase tags adjacent to capitalized ones', () => {
    expect(
      stripMdxComponents('<Pullquote>see <em>this</em> bit</Pullquote>'),
    ).toBe('see <em>this</em> bit')
  })

  it('handles multiple components in one string', () => {
    expect(
      stripMdxComponents(
        '<Pullquote>a</Pullquote> middle <Break /> <Passage>b</Passage>',
      ),
    ).toBe('a middle  b')
  })

  it('does not match stray less-than signs in prose', () => {
    expect(stripMdxComponents('the value is x < 10 in this case')).toBe(
      'the value is x < 10 in this case',
    )
  })

  it('returns empty string unchanged', () => {
    expect(stripMdxComponents('')).toBe('')
  })
})
