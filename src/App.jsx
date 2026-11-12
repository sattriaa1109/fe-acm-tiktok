import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ACCOUNT_IDS, ACCOUNTS, COMMENT_MODES, MOODS, getMood } from './data/accounts'
import { API_BASE, checkStatus, submitComment } from './lib/api'
import { HistoryPanel } from './components/HistoryPanel'
import { InfoCard } from './components/InfoCard'
import { ResultCard } from './components/ResultCard'
import { StatusPill } from './components/StatusPill'
import {
  AlertIcon,
  CheckIcon,
  ClipboardIcon,
  LinkIcon,
  RefreshIcon,
  SendIcon,
  SparklesIcon,
  TikTokLogo,
  UsersIcon,
} from './components/Icons'

const HISTORY_KEY = 'acm-tiktok:history:v1'

function makeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function App() {
  const [health, setHealth] = useState({ state: 'checking', checkedAt: null, error: null })
  const [url, setUrl] = useState('')
  const [mood, setMood] = useState('positive')
  const [commentMode, setCommentMode] = useState('unique')
  const [context, setContext] = useState('')
  const [selected, setSelected] = useState(['akun1'])
  const [errors, setErrors] = useState({})
  const [pasteHint, setPasteHint] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState(loadHistory)

  const urlRef = useRef(null)

  const moodMeta = useMemo(() => getMood(mood), [mood])
  const allSelected = selected.length === ACCOUNTS.length

  const checkHealth = useCallback(async (silent = false) => {
    if (!silent) {
      setHealth((prev) => ({ ...prev, state: 'checking' }))
    }

    try {
      const data = await checkStatus()
      if (data?.status !== 'ok') {
        throw new Error('Respon status dari backend tidak dikenali.')
      }
      setHealth({ state: 'online', checkedAt: Date.now(), error: null })
    } catch (error) {
      setHealth({
        state: 'offline',
        checkedAt: Date.now(),
        error: error instanceof Error ? error.message : 'Backend tidak dapat dihubungi.',
      })
    }
  }, [])

  useEffect(() => {
    checkHealth()
    const interval = window.setInterval(() => checkHealth(true), 30000)
    return () => window.clearInterval(interval)
  }, [checkHealth])

  const pushHistory = useCallback((entry) => {
    setHistory((prev) => {
      const next = [
        { ...entry, id: makeId(), timestamp: new Date().toISOString() },
        ...prev,
      ].slice(0, 20)

      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
      } catch {
        // localStorage bisa penuh/diblokir — riwayat tetap tampil di memori.
      }

      return next
    })
  }, [])

  function clearHistory() {
    setHistory([])
    try {
      localStorage.removeItem(HISTORY_KEY)
    } catch {
      // abaikan
    }
  }

  function toggleAccount(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
    setErrors((prev) => ({ ...prev, accounts: undefined }))
  }

  function toggleAll() {
    setSelected(allSelected ? [] : ACCOUNT_IDS)
    setErrors((prev) => ({ ...prev, accounts: undefined }))
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) {
        setPasteHint('Clipboard kosong. Tempel manual dengan Ctrl+V.')
        return
      }
      setUrl(text.trim())
      setPasteHint(null)
      setErrors((prev) => ({ ...prev, url: undefined }))
    } catch {
      setPasteHint('Browser menolak akses clipboard. Klik kolom lalu tempel dengan Ctrl+V.')
      urlRef.current?.focus()
    }
  }

  function validateForm() {
    const next = {}
    const value = url.trim()

    if (!value) {
      next.url = 'URL video wajib diisi.'
    } else if (!/^https?:\/\//i.test(value)) {
      next.url = 'URL harus diawali http:// atau https://.'
    } else if (!/tiktok\.com/i.test(value)) {
      next.url = 'Gunakan link video TikTok (tiktok.com).'
    }

    if (selected.length === 0) {
      next.accounts = 'Pilih minimal satu akun pengirim.'
    }

    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateForm()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.url) urlRef.current?.focus()
      return
    }

    setSubmitting(true)
    setResult(null)

    const payload = {
      url: url.trim(),
      accounts: selected,
      mood,
      context: context.trim(),
      perAccountComment: commentMode === 'unique',
    }

    try {
      const data = await submitComment(payload)
      const ok = data?.success !== false
      const message =
        data?.message ||
        (ok ? 'Perintah diterima backend.' : 'Backend menolak perintah tanpa pesan.')

      setResult({
        kind: ok ? 'success' : 'error',
        title: ok ? 'Komentar masuk antrean' : 'Perintah ditolak',
        message,
        at: Date.now(),
      })

      pushHistory({
        url: payload.url,
        mood,
        accounts: selected,
        context: payload.context,
        perAccountComment: payload.perAccountComment,
        message,
        ok,
      })

      if (health.state !== 'online') checkHealth(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      setResult({
        kind: 'error',
        title: 'Gagal mengirim perintah',
        message,
        at: Date.now(),
      })

      pushHistory({
        url: payload.url,
        mood,
        accounts: selected,
        context: payload.context,
        perAccountComment: payload.perAccountComment,
        message,
        ok: false,
      })

      if (message.toLowerCase().includes('tidak dapat dihubungi')) {
        setHealth({ state: 'offline', checkedAt: Date.now(), error: message })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app">
      <div className="bg-orbs" aria-hidden="true">
        <span className="orb orb-pink" />
        <span className="orb orb-cyan" />
        <span className="orb orb-violet" />
        <span className="grid-overlay" />
      </div>

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <TikTokLogo size={22} />
          </span>
          <span className="brand-text">
            <span className="brand-name">
              ACM <em>TikTok</em>
            </span>
            <span className="brand-sub">Auto Comment Manager</span>
          </span>
        </div>

        <StatusPill health={health} onRetry={() => checkHealth()} />
      </header>

      <main className="shell">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <SparklesIcon size={14} />
              Powered by AI + Chrome CDP
            </span>
            <h1>
              Komentar otomatis,
              <br />
              <span className="gradient-text">dari banyak akun.</span>
            </h1>
            <p>
              Tempel link video TikTok, atur konteks, mood, dan akun. Backend akan membuat
              komentar dengan AI lalu mengirimnya lewat akun yang sudah login di Chrome.
            </p>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <strong>5</strong>
              <span>akun CDP</span>
              <small>port 9222–9226</small>
            </div>
            <div className="stat-card">
              <strong>2</strong>
              <span>mood AI</span>
              <small>positif &amp; negatif</small>
            </div>
            <div className="stat-card">
              <strong>1</strong>
              <span>klik kirim</span>
              <small>proses background</small>
            </div>
          </div>
        </section>

        {health.state === 'offline' && (
          <div className="alert-banner" role="status">
            <span className="alert-icon">
              <AlertIcon size={18} />
            </span>
            <div>
              <strong>Backend belum terhubung.</strong>{' '}
              <span>
                {health.error ||
                  'Jalankan uvicorn main:app --port 8000, lalu periksa koneksi kembali.'}
              </span>
            </div>
            <button type="button" className="ghost-btn" onClick={() => checkHealth()}>
              <RefreshIcon size={14} />
              Coba lagi
            </button>
          </div>
        )}

        <div className="layout">
          <section className="panel form-panel">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-intro">
                <span className="panel-kicker">Form pengiriman</span>
                <h2>Atur komentar</h2>
                <p>
                  Field di bawah dikirim ke <code>POST /comment</code> sesuai kontrak backend.
                </p>
              </div>

              <div className="section-block">
                <div className="section-head">
                  <span className="section-step">01</span>
                  <div>
                    <h3>Link video</h3>
                    <p>URL video TikTok yang akan dikomentari.</p>
                  </div>
                </div>

                <div className={`url-field ${errors.url ? 'has-error' : ''}`}>
                  <span className="url-icon">
                    <LinkIcon size={17} />
                  </span>
                  <input
                    ref={urlRef}
                    id="video-url"
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    spellCheck="false"
                    placeholder="https://www.tiktok.com/@username/video/..."
                    value={url}
                    onChange={(event) => {
                      setUrl(event.target.value)
                      setPasteHint(null)
                      if (errors.url) setErrors((prev) => ({ ...prev, url: undefined }))
                    }}
                    aria-invalid={Boolean(errors.url)}
                    aria-describedby={errors.url ? 'url-error' : undefined}
                  />
                  <button type="button" className="paste-btn" onClick={handlePaste}>
                    <ClipboardIcon size={14} />
                    Tempel
                  </button>
                </div>

                {pasteHint && <p className="field-hint">{pasteHint}</p>}
                {errors.url && (
                  <p className="field-error" id="url-error">
                    {errors.url}
                  </p>
                )}
              </div>

              <fieldset className="section-block">
                <legend className="sr-only">Pengaturan AI</legend>
                <div className="section-head">
                  <span className="section-step">02</span>
                  <div>
                    <h3>Pengaturan AI</h3>
                    <p>Atur gaya, mode, dan konteks yang dipakai AI untuk membuat komentar.</p>
                  </div>
                </div>

                <div className="subfield">
                  <span className="subfield-label">Mood komentar</span>
                  <div className="mood-grid">
                    {MOODS.map((item) => {
                      const active = mood === item.id
                      return (
                        <label
                          key={item.id}
                          className={`mood-card ${active ? 'is-active' : ''} mood-${item.id}`}
                        >
                          <input
                            type="radio"
                            name="mood"
                            value={item.id}
                            checked={active}
                            onChange={() => setMood(item.id)}
                          />
                          <span className="mood-emoji" aria-hidden="true">
                            {item.emoji}
                          </span>
                          <span className="mood-text">
                            <strong>{item.label}</strong>
                            <span>{item.description}</span>
                            <em>“{item.example}”</em>
                          </span>
                          <span className="radio-dot" aria-hidden="true" />
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="subfield">
                  <span className="subfield-label">Mode komentar</span>
                  <div className="mode-grid">
                    {COMMENT_MODES.map((item) => {
                      const active = commentMode === item.id
                      return (
                        <label
                          key={item.id}
                          className={`mode-card ${active ? 'is-active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="comment-mode"
                            value={item.id}
                            checked={active}
                            onChange={() => setCommentMode(item.id)}
                          />
                          <span className="mode-icon" aria-hidden="true">
                            {item.id === 'unique' ? (
                              <SparklesIcon size={17} />
                            ) : (
                              <UsersIcon size={17} />
                            )}
                          </span>
                          <span className="mode-text">
                            <strong>{item.label}</strong>
                            <span>{item.description}</span>
                          </span>
                          <span className="radio-dot" aria-hidden="true" />
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="subfield">
                  <label className="subfield-label" htmlFor="video-context">
                    Konteks video
                    <span className="optional-tag">opsional</span>
                  </label>
                  <div className="context-field">
                    <textarea
                      id="video-context"
                      rows={3}
                      maxLength={500}
                      placeholder="Contoh: Video dance viral dengan lagu pop, fokus ke koreografi dan outfit."
                      value={context}
                      onChange={(event) => setContext(event.target.value)}
                    />
                    <span className="char-count">{context.length}/500</span>
                  </div>
                  <p className="field-hint subtle">
                    Semakin jelas konteksnya, semakin relevan komentar dari AI. Kosongkan untuk
                    memakai URL video sebagai konteks.
                  </p>
                </div>
              </fieldset>

              <fieldset className="section-block">
                <legend className="sr-only">Akun pengirim</legend>
                <div className="section-head">
                  <span className="section-step">03</span>
                  <div>
                    <h3>Akun pengirim</h3>
                    <p>Pilih akun yang sudah login di masing-masing Chrome.</p>
                  </div>
                  <button type="button" className="select-all" onClick={toggleAll}>
                    {allSelected ? 'Kosongkan' : 'Pilih semua'}
                  </button>
                </div>

                <div className="account-grid">
                  {ACCOUNTS.map((account) => {
                    const active = selected.includes(account.id)
                    return (
                      <button
                        key={account.id}
                        type="button"
                        className={`account-card ${active ? 'is-active' : ''}`}
                        aria-pressed={active}
                        onClick={() => toggleAccount(account.id)}
                      >
                        <span className={`avatar tone-${account.tone}`}>{account.initials}</span>
                        <span className="account-info">
                          <span className="account-name">{account.name}</span>
                          <span className="account-meta">
                            {account.id} · port {account.port}
                          </span>
                        </span>
                        <span className="account-check" aria-hidden="true">
                          {active && <CheckIcon size={13} />}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="account-foot">
                  <span>
                    {selected.length} dari {ACCOUNTS.length} akun dipilih
                  </span>
                  {selected.length > 0 && (
                    <span className="account-selected">{selected.join(' · ')}</span>
                  )}
                </div>

                {errors.accounts && <p className="field-error">{errors.accounts}</p>}
              </fieldset>

              <div className="submit-bar">
                <div className="submit-summary">
                  <span className="summary-label">Siap dikirim</span>
                  <div className="summary-chips">
                    <span className={`mini-chip mood-${mood}`}>
                      {moodMeta.emoji} {moodMeta.label}
                    </span>
                    <span className="mini-chip">
                      <UsersIcon size={13} />
                      {selected.length} akun
                    </span>
                    <span className="mini-chip">
                      {commentMode === 'unique' ? (
                        <SparklesIcon size={13} />
                      ) : (
                        <UsersIcon size={13} />
                      )}
                      {commentMode === 'unique' ? 'Unik' : 'Sama'}
                    </span>
                    {context.trim() && (
                      <span className="mini-chip">
                        <CheckIcon size={12} />
                        Konteks
                      </span>
                    )}
                  </div>
                </div>

                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? (
                    <span className="spinner" aria-hidden="true" />
                  ) : (
                    <SendIcon size={17} />
                  )}
                  {submitting ? 'Mengirim…' : 'Kirim komentar'}
                </button>
              </div>
            </form>
          </section>

          <aside className="sidebar">
            <ResultCard result={result} />
            <HistoryPanel history={history} onClear={clearHistory} />
            <InfoCard health={health} />
          </aside>
        </div>

        <footer className="footer">
          <span>ACM TikTok · Frontend React + Vite</span>
          <span>
            Terhubung ke <code>{API_BASE}</code> · data akun &amp; mood mengikuti backend
          </span>
        </footer>
      </main>
    </div>
  )
}
