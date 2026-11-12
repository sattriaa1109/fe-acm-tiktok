export function formatClock(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

export function formatRelative(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat('id', { numeric: 'auto' })
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]

  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) {
      return formatter.format(Math.round(diffSeconds / seconds), unit)
    }
  }

  return 'baru saja'
}

export function shortUrl(value) {
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '')
    const path = `${url.pathname}${url.search}`
    return `${host}${path.length > 42 ? `${path.slice(0, 42)}…` : path}`
  } catch {
    return value
  }
}
