import { AlertIcon, CheckIcon, InfoIcon, SparklesIcon } from './Icons'
import { formatClock } from '../lib/format'

export function ResultCard({ result }) {
  if (!result) {
    return (
      <section className="panel result-card result-idle">
        <div className="result-head">
          <div className="result-icon">
            <SparklesIcon size={18} />
          </div>
          <div className="result-copy">
            <span className="result-eyebrow">Status pengiriman</span>
            <h3>Belum ada perintah</h3>
          </div>
        </div>
        <p className="result-message">
          Isi link video, pilih mood dan akun. Hasil pemrosesan akan muncul di sini.
        </p>
      </section>
    )
  }

  const success = result.kind === 'success'

  return (
    <section
      className={`panel result-card ${success ? 'result-success' : 'result-error'}`}
      aria-live="polite"
    >
      <div className="result-head">
        <div className="result-icon">
          {success ? <CheckIcon size={18} /> : <AlertIcon size={18} />}
        </div>
        <div className="result-copy">
          <span className="result-eyebrow">
            {success ? 'Permintaan diterima' : 'Terjadi kesalahan'}
          </span>
          <h3>{result.title}</h3>
        </div>
        <time className="result-time" dateTime={new Date(result.at).toISOString()}>
          {formatClock(result.at)}
        </time>
      </div>

      <p className="result-message">{result.message}</p>

      {success && (
        <div className="result-note">
          <InfoIcon size={15} />
          <span>
            Backend memproses komentar di background. Pantau log Docker/terminal untuk melihat
            hasil tiap akun.
          </span>
        </div>
      )}
    </section>
  )
}
