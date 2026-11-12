import { ServerIcon } from './Icons'

const STEPS = [
  {
    title: 'Generate komentar',
    text: 'AI membuat komentar dari konteks video, mood, dan mode — unik per akun atau sama untuk semua.',
  },
  {
    title: 'Kirim via Chrome CDP',
    text: 'Backend membuka video lewat port akun, membuka panel komentar, lalu mengirim.',
  },
  {
    title: 'Jeda anti-detect',
    text: 'Ada jeda acak 5–12 detik antar akun agar aktivitas terlihat natural.',
  },
]

export function InfoCard({ health }) {
  return (
    <section className="panel info-card">
      <div className="panel-kicker">Cara kerja</div>
      <h3>Alur di backend</h3>

      <ol className="steps">
        {STEPS.map((step, index) => (
          <li key={step.title}>
            <span className="step-index">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="endpoint-box">
        <span className="endpoint-title">
          <ServerIcon size={14} />
          Endpoint aktif
        </span>
        <code>
          <b>POST</b> /comment
        </code>
        <code>
          <b>GET</b> /status
        </code>
      </div>

      <p className="info-foot">
        Status backend: <strong>{health.state === 'online' ? 'terhubung' : health.state === 'checking' ? 'memeriksa…' : 'tidak terhubung'}</strong>
        {health.checkedAt ? ` · dicek ${new Date(health.checkedAt).toLocaleTimeString('id-ID')}` : ''}
      </p>
    </section>
  )
}
