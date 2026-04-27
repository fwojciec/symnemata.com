const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** "Apr 2026" — used in the index entry stamp. */
export function formatStampDate(d: Date): string {
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** "April 2026" — used in the masthead on essay pages. */
export function formatLongDate(d: Date): string {
  return `${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** "2026-04-26" — for <time datetime>. */
export function formatISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}
