/**
 * Reading flow — scroll progress bar + focus-mode toggle. Vanilla DOM I/O,
 * deliberately small. Loads in essay pages only.
 */

function initProgressBar(): void {
  const bar = document.querySelector<HTMLElement>('.progress .bar')
  const article = document.querySelector<HTMLElement>('.post-article')
  if (!bar || !article) return

  const update = (): void => {
    const r = article.getBoundingClientRect()
    const total = r.height - window.innerHeight
    const passed = Math.min(Math.max(-r.top, 0), total)
    const pct = total > 0 ? (passed / total) * 100 : 0
    bar.style.width = `${pct}%`
  }

  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()
}

function initFocusToggle(): void {
  const btn = document.getElementById('focus-toggle')
  if (!btn) return
  const label = btn.querySelector<HTMLElement>('span')
  if (!label) return

  let on = false
  const set = (next: boolean): void => {
    on = next
    document.documentElement.dataset['focus'] = on ? 'true' : 'false'
    btn.setAttribute('aria-pressed', String(on))
    label.textContent = on
      ? (label.dataset['on'] ?? 'Exit focus')
      : (label.dataset['off'] ?? 'Focus mode')
  }

  btn.addEventListener('click', () => set(!on))
  window.addEventListener('keydown', (e) => {
    if (
      e.key === 'f' &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      document.activeElement === document.body
    ) {
      set(!on)
    }
  })
}

function initFooterAwareToggle(): void {
  const btn = document.getElementById('focus-toggle')
  const foot = document.querySelector<HTMLElement>('.foot')
  if (!btn || !foot) return

  const update = (): void => {
    const r = foot.getBoundingClientRect()
    const overlap = Math.max(0, window.innerHeight - r.top)
    btn.style.setProperty('--foot-overlap', `${overlap}px`)
  }

  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()
}

initProgressBar()
initFocusToggle()
initFooterAwareToggle()
