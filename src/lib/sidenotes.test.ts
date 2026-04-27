import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import { toHtml } from 'hast-util-to-html'
import { sidenotes } from './sidenotes.ts'

function parse(html: string) {
  return unified().use(rehypeParse, { fragment: true }).parse(html)
}

function run(html: string): string {
  const tree = parse(html)
  sidenotes()(tree as never)
  return toHtml(tree)
}

describe('sidenotes rehype plugin', () => {
  it('replaces a single footnote ref with .ref sup and inserts an aside after the paragraph', () => {
    const input = `
      <p>Hello world.<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref>1</a></sup></p>
      <section data-footnotes>
        <ol>
          <li id="user-content-fn-1"><p>A note. <a href="#user-content-fnref-1" data-footnote-backref>↩</a></p></li>
        </ol>
      </section>
    `
    const out = run(input)
    expect(out).toContain('<sup class="ref">1</sup>')
    expect(out).toContain('<aside class="sidenote">')
    expect(out).toContain('<span class="num">1.</span>')
    expect(out).toContain('A note.')
    expect(out).not.toContain('data-footnote-backref')
    expect(out).not.toContain('data-footnotes')
    expect(out).not.toContain('<section')
  })

  it('handles multiple refs in one paragraph by emitting multiple asides after it', () => {
    const input = `
      <p>One<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref>1</a></sup> and two<sup><a href="#user-content-fn-2" id="user-content-fnref-2" data-footnote-ref>2</a></sup>.</p>
      <section data-footnotes>
        <ol>
          <li id="user-content-fn-1"><p>First note.</p></li>
          <li id="user-content-fn-2"><p>Second note.</p></li>
        </ol>
      </section>
    `
    const out = run(input)
    expect(out).toContain('<sup class="ref">1</sup>')
    expect(out).toContain('<sup class="ref">2</sup>')
    const firstAside = out.indexOf('First note.')
    const secondAside = out.indexOf('Second note.')
    expect(firstAside).toBeGreaterThan(-1)
    expect(secondAside).toBeGreaterThan(firstAside)
    expect((out.match(/class="sidenote"/g) || []).length).toBe(2)
  })

  it('places sidenote next to enclosing block when ref lives inside a blockquote', () => {
    const input = `
      <blockquote><p>Quoted<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref>1</a></sup>.</p></blockquote>
      <section data-footnotes>
        <ol><li id="user-content-fn-1"><p>Quote note.</p></li></ol>
      </section>
    `
    const out = run(input)
    const quoteEnd = out.indexOf('</blockquote>')
    const aside = out.indexOf('<aside class="sidenote">')
    expect(quoteEnd).toBeGreaterThan(-1)
    expect(aside).toBeGreaterThan(quoteEnd)
  })

  it('is a no-op when there are no footnotes', () => {
    const input = `<p>Plain paragraph.</p><h2>Heading</h2>`
    const out = run(input)
    expect(out).toContain('<p>Plain paragraph.</p>')
    expect(out).toContain('<h2>Heading</h2>')
    expect(out).not.toContain('aside')
  })

  it('removes only the footnotes section and preserves other content', () => {
    const input = `
      <p>Body.<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref>1</a></sup></p>
      <h2>After</h2>
      <p>Trailing.</p>
      <section data-footnotes>
        <ol><li id="user-content-fn-1"><p>Note.</p></li></ol>
      </section>
    `
    const out = run(input)
    expect(out).toContain('<h2>After</h2>')
    expect(out).toContain('<p>Trailing.</p>')
    expect(out).not.toContain('<section')
  })
})
