import { ClockIcon, TrashIcon } from './Icons'
import { getMood } from '../data/accounts'
import { formatRelative, shortUrl } from '../lib/format'

export function HistoryPanel({ history, onClear }) {
  return (
    <section className="panel history-card">
      <div className="panel-head">
        <div>
          <span className="panel-kicker">Log lokal</span>
          <h3>Riwayat pengiriman</h3>
        </div>
        {history.length > 0 && (
          <button type="button" className="ghost-btn" onClick={onClear}>
            <TrashIcon size={14} />
            Hapus
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="history-empty">
          <span className="history-empty-icon">
            <ClockIcon size={18} />
          </span>
          <p>Belum ada riwayat. Pengiriman pertamamu akan tercatat di sini.</p>
        </div>
      ) : (
        <ul className="history-list">
          {history.map((item) => {
            const mood = getMood(item.mood)
            return (
              <li className="history-item" key={item.id}>
                <span className={`history-dot ${item.ok ? 'is-ok' : 'is-fail'}`} aria-hidden="true" />
                <div className="history-main">
                  <div className="history-row">
                    <span className={`mood-tag mood-${item.mood}`}>
                      {mood ? `${mood.emoji} ${mood.label}` : item.mood}
                    </span>
                    <span className="history-time">{formatRelative(item.timestamp)}</span>
                  </div>
                  <p className="history-url" title={item.url}>
                    {shortUrl(item.url)}
                  </p>
                  <p
                    className="history-meta"
                    title={
                      item.customPrompt
                        ? `Prompt: ${item.customPrompt}`
                        : item.context
                          ? `Konteks: ${item.context}`
                          : item.message
                    }
                  >
                    {item.accounts.length} akun ·{' '}
                    {item.perAccountComment === false ? 'komentar sama' : 'komentar unik'}
                    {item.context ? ' · ada konteks' : ''}
                    {item.customPrompt ? ' · ada prompt' : ''}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p className="history-foot">
        Disimpan di browser (localStorage). Backend hanya menyediakan endpoint /comment dan /status.
      </p>
    </section>
  )
}
