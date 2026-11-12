import { RefreshIcon } from './Icons'

const LABELS = {
  checking: 'Menghubungkan…',
  online: 'Backend online',
  offline: 'Backend offline',
}

export function StatusPill({ health, onRetry }) {
  return (
    <button
      type="button"
      className={`status-pill status-${health.state}`}
      onClick={onRetry}
      title="Klik untuk memeriksa ulang koneksi ke backend"
    >
      <span className="status-dot" aria-hidden="true" />
      <span className="status-label">{LABELS[health.state]}</span>
      <span className={`status-refresh ${health.state === 'checking' ? 'is-spinning' : ''}`}>
        <RefreshIcon size={14} />
      </span>
    </button>
  )
}
