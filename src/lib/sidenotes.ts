/**
 * sidenotes — rehype plugin that relocates GFM footnotes into Tufte-style margin
 * sidenotes adjacent to the paragraph (or block) that referenced them.
 *
 * Pure tree-in / tree-out. Operates on hast. No I/O, no DOM, no Astro coupling.
 *
 * Input shape (what remark-gfm + remark-rehype produce):
 *
 *   <p>…text<sup><a href="#user-content-fn-1" id="user-content-fnref-1"
 *      data-footnote-ref>1</a></sup>.</p>
 *   …
 *   <section data-footnotes>
 *     <ol>
 *       <li id="user-content-fn-1"><p>Note text. <a data-footnote-backref>↩</a></p></li>
 *     </ol>
 *   </section>
 *
 * Output:
 *
 *   <p>…text<sup class="ref">1</sup>.</p>
 *   <aside class="sidenote"><span class="num">1.</span> Note text.</aside>
 */

import type { Root, Element, ElementContent, RootContent } from 'hast'

type HastNode = Root | Element | RootContent | ElementContent
type HastElement = Element

type Ref = { id: string; num: string }

export function sidenotes() {
  return (tree: Root): void => {
    if (!tree.children) return

    const defs = extractDefinitions(tree)
    if (defs.size === 0) return

    relocate(tree, defs)
  }
}

/**
 * Find the GFM footnotes section, build id → cleaned children map, and remove
 * the section from the tree. Mutates `tree.children`.
 */
function extractDefinitions(tree: Root): Map<string, ElementContent[]> {
  const defs = new Map<string, ElementContent[]>()
  tree.children = tree.children.filter((node) => {
    if (!isFootnoteSection(node)) return true
    for (const ol of node.children) {
      if (!isElement(ol) || ol.tagName !== 'ol') continue
      for (const li of ol.children) {
        if (!isElement(li) || li.tagName !== 'li') continue
        const id = stringProp(li, 'id')
        if (!id) continue
        defs.set(id, stripBackrefs(li.children))
      }
    }
    return false
  }) as RootContent[]
  return defs
}

function isFootnoteSection(node: HastNode): node is Element {
  return (
    isElement(node) &&
    node.tagName === 'section' &&
    node.properties?.['dataFootnotes'] !== undefined
  )
}

/** Drop the `<a data-footnote-backref>` element from the end of footnote bodies. */
function stripBackrefs(children: ElementContent[]): ElementContent[] {
  return children.map((child) => {
    if (!isElement(child)) return child
    if (child.tagName !== 'p') {
      return { ...child, children: stripBackrefs(child.children) }
    }
    return {
      ...child,
      children: child.children.filter(
        (c) =>
          !(
            isElement(c) &&
            c.tagName === 'a' &&
            c.properties?.['dataFootnoteBackref'] !== undefined
          ),
      ),
    }
  })
}

/**
 * For each top-level block child, replace any nested footnote-ref `<sup>`s with
 * `<sup class="ref">N</sup>` and emit a `<aside class="sidenote">` immediately
 * after the block per ref.
 */
function relocate(tree: Root, defs: Map<string, ElementContent[]>): void {
  const out: RootContent[] = []
  for (const child of tree.children) {
    const refs: Ref[] = []
    if (isElement(child)) collectAndReplaceRefs(child, refs)
    out.push(child)
    for (const ref of refs) {
      const def = defs.get(ref.id)
      if (def) out.push(makeSidenote(ref.num, def))
    }
  }
  tree.children = out
}

/** Walk a subtree, replace each footnote-ref `<sup>` with `<sup class="ref">N</sup>`. */
function collectAndReplaceRefs(node: Element, refs: Ref[]): void {
  if (!node.children) return
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    if (!isElement(child)) continue
    if (child.tagName === 'sup' && containsFootnoteRefLink(child)) {
      const ref = extractRef(child)
      if (ref) {
        refs.push(ref)
        node.children[i] = {
          type: 'element',
          tagName: 'sup',
          properties: { className: ['ref'] },
          children: [{ type: 'text', value: ref.num }],
        }
      }
    } else {
      collectAndReplaceRefs(child, refs)
    }
  }
}

function containsFootnoteRefLink(sup: Element): boolean {
  return sup.children.some(
    (c) =>
      isElement(c) &&
      c.tagName === 'a' &&
      c.properties?.['dataFootnoteRef'] !== undefined,
  )
}

function extractRef(sup: Element): Ref | null {
  const link = sup.children.find(
    (c) =>
      isElement(c) &&
      c.tagName === 'a' &&
      c.properties?.['dataFootnoteRef'] !== undefined,
  )
  if (!link || !isElement(link)) return null
  const href = stringProp(link, 'href')
  if (!href) return null
  return {
    id: href.replace(/^#/, ''),
    num: textContent(link).trim(),
  }
}

function makeSidenote(num: string, defChildren: ElementContent[]): Element {
  return {
    type: 'element',
    tagName: 'aside',
    properties: { className: ['sidenote'] },
    children: [
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['num'] },
        children: [{ type: 'text', value: `${num}.` }],
      },
      { type: 'text', value: ' ' },
      ...defChildren,
    ],
  }
}

/* ─── small hast helpers ─────────────────────────────────────────────── */

function isElement(node: HastNode): node is HastElement {
  return node.type === 'element'
}

function stringProp(el: HastElement, key: string): string | null {
  const v = el.properties?.[key]
  return typeof v === 'string' ? v : null
}

function textContent(node: HastNode): string {
  if (node.type === 'text') return node.value
  if (isElement(node)) return node.children.map(textContent).join('')
  return ''
}
