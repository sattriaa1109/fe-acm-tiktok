// Klien API untuk backend FastAPI (be-acm-tiktok/main.py).
// Endpoint yang tersedia hanya:
//   GET  /status  -> { status: "ok" }
//   POST /comment -> { success: boolean, message: string }

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

function buildError(data, status) {
  if (data && typeof data.detail === 'string') return data.detail

  if (data && Array.isArray(data.detail)) {
    return data.detail
      .map((item) => {
        const field = Array.isArray(item.loc) ? item.loc.filter((part) => part !== 'body').join('.') : ''
        return field ? `${field}: ${item.msg}` : item.msg
      })
      .join(', ')
  }

  if (data && typeof data.message === 'string') return data.message
  return `Permintaan gagal (HTTP ${status}).`
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new Error(
      'Backend tidak dapat dihubungi. Pastikan server FastAPI berjalan di port 8000.',
    )
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(buildError(data, response.status))
  }

  return data
}

export function checkStatus(signal) {
  return request('/status', { method: 'GET', signal })
}

export function submitComment({ url, accounts, mood, context = '', perAccountComment = true }) {
  return request('/comment', {
    method: 'POST',
    body: JSON.stringify({
      url,
      accounts,
      mood,
      context,
      per_account_comment: perAccountComment,
    }),
  })
}

export { API_BASE }
